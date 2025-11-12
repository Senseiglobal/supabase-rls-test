import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBSm0m1-8m_zTinusb5L4NNZ1AL8dcPM_c');

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

class GoogleAIService {
  private model: any;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 8192,
      },
      systemInstruction: 'You are AURA, an AI Artist Manager for musicians and music creators. Your role is to analyze artist streaming stats, fan demographics, social media post engagement rates, release history, and career goals, then generate personalized, actionable strategies for career growth. Your guidance should be data-driven, specific and tailored to each artists market, strengths, challenges, and current opportunities. Be concise, motivational, and professional. When responding, always provide 2-3 strategic actions the artist should take next, reasoning for each suggestion based on their unique data, and a brief, encouraging closing statement.'
    });
  }

  async generateResponse(message: string): Promise<string> {
    try {
      const result = await this.model.generateContent(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }
}

export const googleAI = new GoogleAIService();
