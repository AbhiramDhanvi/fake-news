/**
 * runAgentWorkflow — Multi-Agent Orchestration (Fixed)
 * FIX: Proper prompt formatting + robust JSON extraction + error logging
 */
import { createClient } from 'npm:@insforge/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface Claim {
  id: string;
  claim_text: string;
  claim_index: number;
}

interface ClaimResult {
  claim_id: string;
  verdict: string;
  confidence_score: number;
  reasoning: string;
  sources: EvidenceSource[];
}

interface EvidenceSource {
  source_url: string;
  source_title: string;
  summary: string;
  stance: 'supporting' | 'contradicting' | 'neutral';
  credibility_score: number;
}

interface BiasSignals {
  emotional_tone: string;
  clickbait_score: number;
  urgency_level: string;
  fear_signals: string[];
  manipulation_tactics: string[];
  suspicious_phrases: string[];
}

/**
 * Robust JSON extractor — handles markdown fences, mixed text, and edge cases
 */
function extractJson<T>(text: string): T | null {
  if (!text || text.trim().length === 0) return null;

  const attempts: string[] = [];

  // Attempt 1: Clean markdown code fences
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    attempts.push(fenceMatch[1].trim());
  }

  // Attempt 2: Raw text after basic cleanup
  cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  attempts.push(cleaned.trim());

  // Attempt 3: Find first JSON structure in text
  const arrayStart = text.indexOf('[');
  const objectStart = text.indexOf('{');
  const firstStart = Math.min(
    arrayStart === -1 ? Infinity : arrayStart,
    objectStart === -1 ? Infinity : objectStart
  );
  if (firstStart !== Infinity) {
    const isArray = firstStart === arrayStart;
    const closer = isArray ? ']' : '}';
    const lastClose = text.lastIndexOf(closer);
    if (lastClose > firstStart) {
      attempts.push(text.substring(firstStart, lastClose + 1));
    }
  }

  // Try each attempt
  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt);
      return parsed as T;
    } catch {
      // try next
    }
  }

  console.error('extractJson FAILED for input:', text.substring(0, 200));
  return null;
}

// ─── Prompt templates (plain strings, no escaping issues) ───

const CLAIM_SYSTEM_PROMPT = [
  'You are a factual claim extractor. Identify distinct, verifiable factual claims from news content.',
  '',
  'Rules:',
  '- Extract ONLY verifiable factual statements (not opinions or predictions)',
  '- Each claim should be atomic (one fact per claim)',
  '- Extract between 2 and 5 claims',
  '- You MUST return valid JSON and nothing else',
  '',
  'Return ONLY a JSON array in this exact format:',
  '[{"claim_text": "The specific factual claim", "claim_index": 0}, {"claim_text": "Another claim", "claim_index": 1}]',
].join('\n');

const BIAS_SYSTEM_PROMPT = [
  'You are a bias and manipulation detection expert for news analysis.',
  '',
  'Analyze the text for:',
  '- Emotional tone (fear, anger, neutral, positive)',
  '- Clickbait indicators (0-100 score)',
  '- Urgency signals (low, medium, high)',
  '- Fear-inducing phrases',
  '- Manipulation tactics',
  '- Suspicious or loaded phrases for heatmap highlighting',
  '',
  'Return ONLY valid JSON in this exact format:',
  '{"emotional_tone": "string", "clickbait_score": 50, "urgency_level": "low", "fear_signals": ["phrase1"], "manipulation_tactics": ["tactic1"], "suspicious_phrases": ["phrase1"]}',
].join('\n');

function buildEvidencePrompt(): string {
  return [
    'You are a fact-checking evidence researcher. For a given claim, find evidence sources that support or contradict it.',
    '',
    'Return ONLY valid JSON in this exact format:',
    '{"verdict": "true", "confidence_score": 75, "reasoning": "detailed explanation here", "sources": [{"source_url": "https://example.com", "source_title": "Article Title", "summary": "What this source says", "stance": "supporting", "credibility_score": 80}]}',
    '',
    'verdict must be one of: true, false, misleading, unverified',
    'stance must be one of: supporting, contradicting, neutral',
  ].join('\n');
}

function buildConsensusPrompt(): string {
  return [
    'You are a news verdict consensus engine. Given claim-level results, bias signals, and evidence, produce a final verdict.',
    '',
    'Verdict categories:',
    '- "likely_true": Most claims verified, high confidence sources, low bias',
    '- "likely_false": Most claims contradicted or false, strong counter-evidence', 
    '- "misleading": Contains some truth but framed deceptively, high bias signals',
    '- "unverified": Insufficient evidence to determine truth',
    '',
    'Return ONLY valid JSON in this exact format:',
    '{"final_verdict": "likely_false", "confidence_score": 82, "explanation": "Multi-sentence explanation of findings and verdict", "heatmap_data": [{"phrase": "suspicious phrase from text", "risk_score": 85, "reason": "why this is flagged"}]}',
  ].join('\n');
}

/**
 * Safely extract AI response content from the SDK result.
 * The InsForge SDK may return:
 *   - Direct completion: result.choices[0].message.content
 *   - Wrapped: result.data.choices[0].message.content  (or result.data?.choices)
 *   - Or {data, error} where data is the completion object
 */
function getAiContent(result: unknown): string {
  if (!result) return '';
  const r = result as Record<string, unknown>;

  // Direct access: result.choices[0].message.content
  if (r.choices && Array.isArray(r.choices)) {
    const choice = (r.choices as Record<string, unknown>[])[0];
    if (choice?.message && typeof (choice.message as Record<string, unknown>).content === 'string') {
      return (choice.message as Record<string, unknown>).content as string;
    }
  }

  // Wrapped: result.data.choices[0].message.content
  if (r.data && typeof r.data === 'object') {
    const d = r.data as Record<string, unknown>;
    if (d.choices && Array.isArray(d.choices)) {
      const choice = (d.choices as Record<string, unknown>[])[0];
      if (choice?.message && typeof (choice.message as Record<string, unknown>).content === 'string') {
        return (choice.message as Record<string, unknown>).content as string;
      }
    }
  }

  console.error('getAiContent: Could not extract content. Keys:', Object.keys(r));
  console.error('getAiContent: JSON preview:', JSON.stringify(r).substring(0, 500));
  return '';
}

export default async function (req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL')!,
    anonKey: Deno.env.get('ANON_KEY')!,
  });

  try {
    const { news_id, text } = await req.json();
    if (!news_id || !text) {
      return new Response(JSON.stringify({ error: 'news_id and text required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting workflow for news_id:', news_id, 'text length:', text.length);

    // ───────────────────────────────────────────────
    // AGENT 1 & 2: CLAIM AGENT & BIAS AGENT (Parallel)
    // ───────────────────────────────────────────────
    const [claimAgentResult, biasAgentResult] = await Promise.all([
      client.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: CLAIM_SYSTEM_PROMPT },
          { role: 'user', content: 'Extract factual claims from the following text:\n\n' + text },
        ],
      }),
      client.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: BIAS_SYSTEM_PROMPT },
          { role: 'user', content: 'Analyze bias and manipulation in the following text:\n\n' + text },
        ],
      }),
    ]);

    const claimContent = getAiContent(claimAgentResult);
    const biasContent = getAiContent(biasAgentResult);

    console.log('Claim agent raw response:', claimContent.substring(0, 300));
    console.log('Bias agent raw response:', biasContent.substring(0, 300));

    const claimsRaw = extractJson<{ claim_text: string; claim_index: number }[]>(claimContent) ?? [];

    const biasSignals: BiasSignals = extractJson<BiasSignals>(biasContent) ?? {
      emotional_tone: 'neutral',
      clickbait_score: 0,
      urgency_level: 'low',
      fear_signals: [],
      manipulation_tactics: [],
      suspicious_phrases: [],
    };

    console.log('Parsed claims count:', claimsRaw.length);
    console.log('Parsed bias signals:', JSON.stringify(biasSignals).substring(0, 200));

    // Store claims
    const claimInserts = claimsRaw.map((c) => ({
      news_id,
      claim_text: c.claim_text,
      claim_index: c.claim_index,
    }));

    // If no claims found, still run a basic analysis instead of returning empty
    if (claimInserts.length === 0) {
      console.warn('No claims extracted — running fallback single-pass analysis');

      // Run a single-pass verdict directly on the text
      const fallbackResult = await client.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: [
              'You are a news verification AI. Analyze the following text and determine if it is likely true, likely false, misleading, or unverifiable.',
              'Consider factual accuracy, source reliability indicators, emotional manipulation, and logical consistency.',
              '',
              'Return ONLY valid JSON:',
              '{"final_verdict": "likely_true|likely_false|misleading|unverified", "confidence_score": 75, "explanation": "Multi-sentence explanation", "heatmap_data": [{"phrase": "flagged phrase from the text", "risk_score": 80, "reason": "why flagged"}]}',
            ].join('\n'),
          },
          { role: 'user', content: 'Analyze this news text:\n\n' + text },
        ],
      });

      const fallbackContent = getAiContent(fallbackResult);
      console.log('Fallback analysis response:', fallbackContent.substring(0, 300));

      const fallbackData = extractJson<{
        final_verdict: string;
        confidence_score: number;
        explanation: string;
        heatmap_data: { phrase: string; risk_score: number; reason: string }[];
      }>(fallbackContent) ?? {
        final_verdict: 'unverified',
        confidence_score: 30,
        explanation: 'The AI could not extract specific factual claims from this text, but performed a general analysis. The content lacks verifiable factual statements that can be independently checked.',
        heatmap_data: [],
      };

      await client.database.from('analysis_results').insert([
        {
          news_id,
          final_verdict: fallbackData.final_verdict,
          confidence_score: fallbackData.confidence_score,
          explanation: fallbackData.explanation,
          bias_signals: biasSignals,
          heatmap_data: fallbackData.heatmap_data,
          graph_data: { nodes: [{ id: news_id, type: 'news', label: 'News Article' }], edges: [] },
        },
      ]);
      await client.database.from('news_inputs').update({ status: 'completed' }).eq('id', news_id);
      return new Response(JSON.stringify({ success: true, news_id, final_verdict: fallbackData.final_verdict }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: insertedClaims, error: claimError } = await client.database
      .from('claims')
      .insert(claimInserts)
      .select();

    if (claimError) {
      console.error('Claim insert error:', JSON.stringify(claimError));
      throw claimError;
    }
    const claims: Claim[] = insertedClaims ?? [];
    console.log('Inserted claims:', claims.length);

    // ───────────────────────────────────────────────
    // AGENT 3: EVIDENCE + CREDIBILITY AGENT (Parallel per claim)
    // ───────────────────────────────────────────────
    const claimResults: ClaimResult[] = await Promise.all(
      claims.map(async (claim) => {
        const evidenceResult = await client.ai.chat.completions.create({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: buildEvidencePrompt() },
            { role: 'user', content: 'Fact-check this claim and provide evidence:\n\n"' + claim.claim_text + '"' },
          ],
        });

        const evidenceContent = getAiContent(evidenceResult);
        console.log('Evidence for claim', claim.claim_index, ':', evidenceContent.substring(0, 200));

        const evidenceData = extractJson<{
          verdict: string;
          confidence_score: number;
          reasoning: string;
          sources: EvidenceSource[];
        }>(evidenceContent) ?? {
          verdict: 'unverified',
          confidence_score: 0,
          reasoning: 'Could not analyze claim',
          sources: [],
        };

        // Store claim analysis
        await client.database.from('claim_analysis').insert([
          {
            claim_id: claim.id,
            verdict: evidenceData.verdict,
            confidence_score: evidenceData.confidence_score,
            reasoning: evidenceData.reasoning,
          },
        ]);

        // Store evidence sources
        if (evidenceData.sources?.length > 0) {
          await client.database.from('evidence_sources').insert(
            evidenceData.sources.map((s) => ({
              claim_id: claim.id,
              source_url: s.source_url || 'https://unknown.source',
              source_title: s.source_title || 'Unknown Source',
              summary: s.summary || '',
              stance: s.stance || 'neutral',
              credibility_score: s.credibility_score || 50,
            }))
          );
        }

        return {
          claim_id: claim.id,
          ...evidenceData,
        };
      })
    );

    // ───────────────────────────────────────────────
    // AGENT 4: CONSENSUS AGENT — Final verdict
    // ───────────────────────────────────────────────
    const summaryForConsensus = claimResults.map((cr) => ({
      claim_id: cr.claim_id,
      verdict: cr.verdict,
      confidence: cr.confidence_score,
      sources_count: cr.sources?.length ?? 0,
      supporting: cr.sources?.filter((s) => s.stance === 'supporting').length ?? 0,
      contradicting: cr.sources?.filter((s) => s.stance === 'contradicting').length ?? 0,
    }));

    const consensusResult = await client.ai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: buildConsensusPrompt() },
        {
          role: 'user',
          content: [
            'Produce final verdict from the following data:',
            '',
            'Claim Results: ' + JSON.stringify(summaryForConsensus),
            '',
            'Bias Signals: ' + JSON.stringify(biasSignals),
            '',
            'Original Text (first 1500 chars): ' + text.substring(0, 1500),
          ].join('\n'),
        },
      ],
    });

    const consensusContent = getAiContent(consensusResult);
    console.log('Consensus response:', consensusContent.substring(0, 300));

    const consensusData = extractJson<{
      final_verdict: string;
      confidence_score: number;
      explanation: string;
      heatmap_data: { phrase: string; risk_score: number; reason: string }[];
    }>(consensusContent) ?? {
      final_verdict: 'unverified',
      confidence_score: 0,
      explanation: 'Analysis could not be completed.',
      heatmap_data: [],
    };

    // Build graph data structure
    const graphData = {
      nodes: [
        { id: news_id, type: 'news', label: 'News Article' },
        ...claims.map((c) => ({ id: c.id, type: 'claim', label: c.claim_text.substring(0, 50) })),
        ...claimResults.flatMap((cr) =>
          (cr.sources ?? []).map((s, i) => ({
            id: cr.claim_id + '_src_' + i,
            type: 'source',
            label: s.source_title ?? s.source_url,
            stance: s.stance,
          }))
        ),
      ],
      edges: [
        ...claims.map((c) => ({ from: news_id, to: c.id, type: 'has_claim' })),
        ...claimResults.flatMap((cr) =>
          (cr.sources ?? []).map((s, i) => ({
            from: cr.claim_id,
            to: cr.claim_id + '_src_' + i,
            type: s.stance,
          }))
        ),
      ],
    };

    // Store final analysis result
    const { error: resultError } = await client.database
      .from('analysis_results')
      .insert([
        {
          news_id,
          final_verdict: consensusData.final_verdict,
          confidence_score: consensusData.confidence_score,
          explanation: consensusData.explanation,
          bias_signals: biasSignals,
          heatmap_data: consensusData.heatmap_data,
          graph_data: graphData,
        },
      ]);

    if (resultError) {
      console.error('Result insert error:', JSON.stringify(resultError));
      throw resultError;
    }

    // Update news status to completed
    await client.database
      .from('news_inputs')
      .update({ status: 'completed' })
      .eq('id', news_id);

    console.log('Workflow completed for news_id:', news_id, 'verdict:', consensusData.final_verdict);

    return new Response(
      JSON.stringify({
        success: true,
        news_id,
        final_verdict: consensusData.final_verdict,
        confidence_score: consensusData.confidence_score,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    const stack = err instanceof Error ? err.stack : '';
    console.error('runAgentWorkflow error:', message);
    console.error('Stack:', stack);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
