// Vercel Serverless Function: /api/ai/reply
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Configuration, OpenAIApi } from 'openai';

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

const TONE_MAP = {
  professional: 'Respond in a professional tone.',
  friendly: 'Respond in a friendly tone.',
  casual: 'Respond in a casual tone.',
  negotiator: 'Respond as a skilled negotiator.',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, tone = 'professional', autoSend = false } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const prompt = `${TONE_MAP[tone] || TONE_MAP.professional}\n${message}`;
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: TONE_MAP[tone] || TONE_MAP.professional },
        { role: 'user', content: message },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });
    const reply = completion.data.choices[0]?.message?.content || '';
    res.status(200).json({ reply, autoSend });
  } catch (error) {
    res.status(500).json({ error: error.message || 'AI reply failed' });
  }
}
