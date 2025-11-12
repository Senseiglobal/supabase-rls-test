import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, userId } = await req.json();

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check permissions
    const { data: permission } = await supabase
      .from('permissions')
      .select('granted')
      .eq('user_id', userId)
      .eq('permission_type', 'ai_summarization')
      .single();

    if (!permission?.granted) {
      return new Response(
        JSON.stringify({ error: 'AI Summarization not enabled' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze these ${messages.length} booking-related messages and provide a concise summary highlighting:
1. Key booking inquiries or opportunities
2. Urgent items requiring immediate attention
3. Follow-up actions needed

Messages:
${messages.map((m: any, i: number) => `${i + 1}. From: ${m.from} - Subject: ${m.subject} - Snippet: ${m.snippet}`).join('\n')}

Provide a brief, actionable summary for an artist manager.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return new Response(
      JSON.stringify({ summary, messageCount: messages.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
