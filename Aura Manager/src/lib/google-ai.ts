import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI with API key from environment variables
const getGoogleAI = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Google AI API key not found. Please set VITE_GOOGLE_AI_API_KEY in your environment variables.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Model configuration - matching your AURA AI setup
const MODEL_CONFIG = {
  // Using your specified model
  modelName: import.meta.env.VITE_GOOGLE_AI_MODEL || 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 2048, // Increased for detailed strategic advice
  }
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ArtistContext {
  name?: string;
  genre?: string;
  recentReleases?: string[];
  goals?: string[];
  platforms?: string[];
}

// AI Personality configurations - AURA AI Artist Manager
export const AI_PERSONALITIES = {
  aura: {
    name: "AURA - AI Artist Manager",
    systemPrompt: `You are AURA, an AI Artist Manager for musicians and music creators. Your role is to analyze artist streaming stats, fan demographics, social media post engagement rates, release history, and career goals, then generate personalized, actionable strategies for career growth and competitive market analysis.

Your guidance should be:
- Data-driven, referencing the input (streams, social stats, top cities, release dates, genre, audience trends).
- Specific and tailored to each artist's market, strengths, challenges, and current opportunities.
- Concise, motivational, and professional—never generic or vague.
- Focused on useful next steps such as: campaign ideas, content strategy, fanbase growth, release timing, collaboration, or distribution moves.
- Ready to ask clarifying questions if key data is missing or ambiguous.
- Capable of suggesting digital marketing, live event initiatives, and social campaign opportunities.

When responding, always provide:
1. 2-3 strategic actions the artist should take next.
2. Reasoning for each suggestion based on their unique data.
3. A brief, encouraging closing statement for the artist.

Your target users are independent musicians and managers aiming for measurable career progression.`,
    tone: "data-driven and strategic"
  },
  professional: {
    name: "Professional Manager",
    systemPrompt: `You are a professional music industry manager AI assistant. You provide strategic, data-driven advice with industry expertise. Keep responses focused on business growth, market analysis, and professional development. Use industry terminology and provide actionable insights.`,
    tone: "professional and strategic"
  },
  friendly: {
    name: "Supportive Mentor", 
    systemPrompt: `You are a friendly, supportive AI music manager who believes in the artist's potential. Provide encouraging advice while being realistic about the music industry. Use a warm, approachable tone and celebrate wins while helping navigate challenges.`,
    tone: "encouraging and supportive"
  },
  motivational: {
    name: "Motivational Coach",
    systemPrompt: `You are an energetic, motivational AI music manager. Inspire artists to push their creative boundaries and chase ambitious goals. Use motivational language and help them visualize success while providing practical steps to achieve it.`,
    tone: "inspiring and energetic"
  }
};

export class GoogleAIService {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor() {
    this.genAI = getGoogleAI();
    this.model = this.genAI.getGenerativeModel({ 
      model: MODEL_CONFIG.modelName,
      generationConfig: MODEL_CONFIG.generationConfig
    });
  }

  private buildSystemPrompt(personality: keyof typeof AI_PERSONALITIES, artistContext?: ArtistContext): string {
    const personalityConfig = AI_PERSONALITIES[personality];
    
    let systemPrompt = `${personalityConfig.systemPrompt}

CONTEXT: You are managing an artist through the Aura Manager platform - an AI-powered artist management tool.

ARTIST CONTEXT:`;

    if (artistContext?.name) {
      systemPrompt += `\n- Artist Name: ${artistContext.name}`;
    }
    if (artistContext?.genre) {
      systemPrompt += `\n- Genre: ${artistContext.genre}`;
    }
    if (artistContext?.recentReleases?.length) {
      systemPrompt += `\n- Recent Releases: ${artistContext.recentReleases.join(', ')}`;
    }
    if (artistContext?.goals?.length) {
      systemPrompt += `\n- Current Goals: ${artistContext.goals.join(', ')}`;
    }
    if (artistContext?.platforms?.length) {
      systemPrompt += `\n- Connected Platforms: ${artistContext.platforms.join(', ')}`;
    }

    systemPrompt += `

GUIDELINES:
- Keep responses conversational and specific to music industry management
- Provide actionable advice with clear next steps
- Reference specific platforms, strategies, and industry best practices
- Ask follow-up questions to better understand their needs
- Be encouraging but realistic about timelines and expectations
- Format longer responses with clear bullet points or numbered lists
- Keep responses under 300 words unless detailed analysis is requested

TONE: ${personalityConfig.tone}`;

    return systemPrompt;
  }

  async sendMessage(
    message: string, 
    conversationHistory: ChatMessage[], 
    personality: keyof typeof AI_PERSONALITIES = 'friendly',
    artistContext?: ArtistContext
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(personality, artistContext);
      
      // Build conversation context
      let conversationContext = systemPrompt + "\n\nCONVERSATION HISTORY:\n";
      
      // Add recent conversation history (last 10 messages to stay within context limits)
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'Artist' : 'Manager';
        conversationContext += `${role}: ${msg.content}\n`;
      });
      
      conversationContext += `\nArtist: ${message}\nManager:`;

      const result = await this.model.generateContent(conversationContext);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error('Google AI API Error:', error);
      
      // Provide helpful error messages
      if (error.message?.includes('API_KEY')) {
        throw new Error('Google AI API key is invalid. Please check your VITE_GOOGLE_AI_API_KEY environment variable.');
      } else if (error.message?.includes('quota')) {
        throw new Error('Google AI API quota exceeded. Please try again later or upgrade your plan.');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error connecting to Google AI. Please check your connection.');
      } else {
        throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`);
      }
    }
  }

  async generateChatTitle(firstMessage: string): Promise<string> {
    try {
      const prompt = `Generate a short, descriptive title (4-6 words max) for a music management chat that starts with: "${firstMessage}". 

Examples:
- "Release strategy for new single"
- "Instagram content planning"  
- "Goal setting session"
- "Analytics review discussion"

Return only the title, no quotes or extra text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const title = response.text().trim().replace(/['"]/g, '');
      
      // Fallback if title is too long or empty
      if (title.length > 40 || title.length === 0) {
        return "New Conversation";
      }
      
      return title;
    } catch (error) {
      console.error('Error generating chat title:', error);
      return "New Conversation";
    }
  }

  // Quick action generators - AURA specific actions
  generateQuickActions(_artistContext?: ArtistContext): string[] {
    const auraActions = [
      "Analyze my streaming performance and demographics",
      "Create a release strategy for my next single",
      "Review my social media engagement rates",
      "Suggest collaboration opportunities in my genre",
      "Plan a fan growth campaign for my top cities",
      "Optimize my content strategy for better reach"
    ];

    // Return 4 random actions for variety
    return auraActions.sort(() => 0.5 - Math.random()).slice(0, 4);
  }
}

export const googleAIService = new GoogleAIService();