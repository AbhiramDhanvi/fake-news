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

  const authHeader = req.headers.get('Authorization');
  const userToken = authHeader ? authHeader.replace('Bearer ', '') : null;

  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL')!,
    anonKey: Deno.env.get('ANON_KEY')!,
    ...(userToken ? { edgeFunctionToken: userToken } : {}),
  });

  try {
    const body = await req.json();
    const { content, input_type = 'text' } = body;

    if (!content) {
      return new Response(JSON.stringify({ error: 'content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user id if authenticated
    let userId: string | null = null;
    if (userToken) {
      const { data: userData } = await client.auth.getCurrentUser();
      userId = userData?.user?.id ?? null;
    }

    let extracted_text = input_type === 'text' ? content : null;

    // If URL, extract text using AI
    if (input_type === 'url') {
      const aiClient = createClient({
        baseUrl: Deno.env.get('INSFORGE_BASE_URL')!,
        anonKey: Deno.env.get('ANON_KEY')!,
      });
      const { data: aiData } = await aiClient.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a web content extractor. Given a URL, describe the likely content of the article at that URL as thoroughly as possible. Focus on the main claims, facts, and narrative. Return only the extracted/inferred text content.',
          },
          {
            role: 'user',
            content: `Extract and summarize the news content from this URL: ${content}`,
          },
        ],
      });
      extracted_text = aiData?.choices?.[0]?.message?.content ?? content;
    }

    // Insert into news_inputs
    const { data: newsData, error: newsError } = await client.database
      .from('news_inputs')
      .insert([
        {
          user_id: userId,
          content,
          input_type,
          extracted_text,
          status: 'processing',
        },
      ])
      .select();

    if (newsError) throw newsError;
    const news = newsData[0];

    // Return successfully WITH the text so frontend can trigger the pipeline
    return new Response(
      JSON.stringify({ success: true, news_id: news.id, status: 'processing', text: extracted_text }),
      { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
