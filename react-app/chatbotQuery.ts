/**
 * chatbotQuery — Context-aware AI assistant for fake news Q&A (Fixed)
 * FIX: Proper prompt formatting + works for both article-specific and general queries
 */
import { createClient } from 'npm:@insforge/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function (req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL')!,
    anonKey: Deno.env.get('ANON_KEY')!,
  });

  try {
    const { news_id, question, conversation_history = [] } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ error: 'question is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemContext: string;

    // If news_id is provided and not 'general', load article context
    if (news_id && news_id !== 'general') {
      const [newsResult, analysisResult, claimsResult] = await Promise.all([
        client.database
          .from('news_inputs')
          .select('content, extracted_text')
          .eq('id', news_id)
          .limit(1),
        client.database
          .from('analysis_results')
          .select('final_verdict, confidence_score, explanation, bias_signals, heatmap_data')
          .eq('news_id', news_id)
          .limit(1),
        client.database
          .from('claims')
          .select('id, claim_text, claim_index')
          .eq('news_id', news_id)
          .order('claim_index', { ascending: true }),
      ]);

      const news = newsResult.data?.[0] as { content?: string; extracted_text?: string } | undefined;
      const analysis = analysisResult.data?.[0] as {
        final_verdict?: string;
        confidence_score?: number;
        explanation?: string;
        bias_signals?: Record<string, unknown>;
        heatmap_data?: unknown[];
      } | undefined;
      const claims = (claimsResult.data ?? []) as { id: string; claim_text: string; claim_index: number }[];

      const articleText = (news?.extracted_text ?? news?.content ?? '').substring(0, 1000);
      const claimsList = claims.map((c) => '[' + (c.claim_index + 1) + '] ' + c.claim_text).join('\n');

      systemContext = [
        'You are TruthLens AI Assistant, an expert fact-checker helping users understand a news analysis.',
        '',
        'ANALYSIS CONTEXT:',
        '- Article content: ' + articleText,
        '- Final Verdict: ' + (analysis?.final_verdict ?? 'pending'),
        '- Confidence Score: ' + (analysis?.confidence_score ?? 0) + '/100',
        '- Explanation: ' + (analysis?.explanation ?? 'Analysis pending'),
        '- Bias Signals: ' + JSON.stringify(analysis?.bias_signals ?? {}),
        '- Heatmap Flags: ' + JSON.stringify(analysis?.heatmap_data ?? []),
        '- Claims Identified:',
        claimsList || '(No specific claims extracted)',
        '',
        'INSTRUCTIONS:',
        '- Answer questions about why content is fake, misleading, or true',
        '- Reference specific claims by number when relevant',
        '- Explain evidence clearly and concisely',
        '- Be factual, balanced, and educational',
        '- If asked to compare claims, do so systematically',
        '- Never make up facts not in the context',
        '- If the analysis shows specific bias signals or heatmap flags, mention them when relevant',
      ].join('\n');
    } else {
      // General mode — no specific article
      systemContext = [
        'You are TruthLens AI Assistant, an expert fact-checker and media literacy educator.',
        '',
        'You help users:',
        '- Understand how to identify fake news and misinformation',
        '- Learn about common manipulation tactics in media',
        '- Get general fact-checking guidance',
        '- Understand bias, clickbait, and propaganda techniques',
        '',
        'INSTRUCTIONS:',
        '- Be educational, balanced, and factual',
        '- Provide practical tips for verifying news',
        '- Reference well-known fact-checking methods',
        '- Suggest users use the TruthLens scanner to analyze specific articles',
        '- Keep answers concise but informative',
      ].join('\n');
    }

    const messages = [
      { role: 'system', content: systemContext },
      ...conversation_history.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: question },
    ];

    const aiResult = await client.ai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages,
    });

    // The SDK may return the completion directly (result.choices) or wrapped (result.data.choices)
    const r = aiResult as Record<string, unknown>;
    let answer = '';

    // Try direct access first
    if (r.choices && Array.isArray(r.choices)) {
      const choice = (r.choices as Record<string, unknown>[])[0];
      if (choice?.message) {
        answer = (choice.message as Record<string, unknown>).content as string || '';
      }
    }
    // Try wrapped access
    if (!answer && r.data && typeof r.data === 'object') {
      const d = r.data as Record<string, unknown>;
      if (d.choices && Array.isArray(d.choices)) {
        const choice = (d.choices as Record<string, unknown>[])[0];
        if (choice?.message) {
          answer = (choice.message as Record<string, unknown>).content as string || '';
        }
      }
    }

    if (!answer) {
      console.error('chatbot: Could not extract AI content. Keys:', Object.keys(r));
      console.error('chatbot: Response preview:', JSON.stringify(r).substring(0, 500));
      answer = 'I could not generate a response. Please try again.';
    }

    return new Response(
      JSON.stringify({ answer, role: 'assistant' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('chatbotQuery error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
