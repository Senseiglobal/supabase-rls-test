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
    const { message, tone = 'professional', userId } = await req.json();

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check permissions
    const { data: permission } = await supabase
      .from('permissions')
      .select('granted')
      .eq('user_id', userId)
      .eq('permission_type', 'ai_reply_composer')
      .single();

    if (!permission?.granted) {
      return new Response(
        JSON.stringify({ error: 'AI Reply Composer not enabled' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const toneMap: Record<string, string> = {
      professional: 'formal and business-appropriate',
      friendly: 'warm and approachable',
      casual: 'relaxed and informal',
      negotiator: 'diplomatic and persuasive',
    };

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = `As an AI assistant for an artist manager, draft a ${toneMap[tone]} reply to this message:\n\n"${message}"\n\nKeep it concise, professional, and aligned with artist management best practices.`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return new Response(
      JSON.stringify({ reply, tone }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}