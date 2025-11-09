import { useState, useCallback } from 'react';
import { googleAIService, ChatMessage, ArtistContext, AI_PERSONALITIES } from '@/lib/google-ai';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState<keyof typeof AI_PERSONALITIES>('aura');

  // Create a new conversation
  const createConversation = useCallback((title = "New Conversation"): Conversation => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    return newConversation;
  }, []);

  // Send a message in the current conversation
  const sendMessage = useCallback(async (
    content: string, 
    artistContext?: ArtistContext
  ): Promise<void> => {
    if (!content.trim()) return;

    setIsLoading(true);

    try {
      // If no current conversation, create one
      let conversation = currentConversation;
      if (!conversation) {
        conversation = createConversation();
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      };

      const updatedMessages = [...conversation.messages, userMessage];

      // Update conversation with user message
      const updatedConversation = {
        ...conversation,
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      };

      setCurrentConversation(updatedConversation);
      setConversations(prev => 
        prev.map(conv => conv.id === conversation!.id ? updatedConversation : conv)
      );

      // Generate AI response
      const aiResponse = await googleAIService.sendMessage(
        content,
        conversation.messages, // Pass conversation history for context
        personality,
        artistContext
      );

      // Add AI message
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      };

      const finalMessages = [...updatedMessages, aiMessage];

      // Generate title for new conversations
      let conversationTitle = conversation.title;
      if (conversation.messages.length === 0 && conversationTitle === "New Conversation") {
        try {
          conversationTitle = await googleAIService.generateChatTitle(content);
        } catch (error) {
          console.warn('Failed to generate title:', error);
          conversationTitle = content.slice(0, 40) + (content.length > 40 ? '...' : '');
        }
      }

      // Update conversation with AI response and title
      const finalConversation = {
        ...updatedConversation,
        title: conversationTitle,
        messages: finalMessages,
        updatedAt: new Date().toISOString()
      };

      setCurrentConversation(finalConversation);
      setConversations(prev => 
        prev.map(conv => conv.id === conversation!.id ? finalConversation : conv)
      );

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error('Chat Error', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, personality, createConversation]);

  // Load a conversation
  const loadConversation = useCallback((conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  }, [conversations]);

  // Delete a conversation
  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
    toast.success('Conversation deleted');
  }, [currentConversation]);

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setCurrentConversation(null);
    toast.success('All conversations cleared');
  }, []);

  // Quick action handler
  const sendQuickAction = useCallback((action: string, artistContext?: ArtistContext) => {
    return sendMessage(action, artistContext);
  }, [sendMessage]);

  return {
    // State
    conversations,
    currentConversation,
    isLoading,
    personality,
    
    // Actions
    createConversation,
    sendMessage,
    loadConversation,
    deleteConversation,
    clearAllConversations,
    sendQuickAction,
    setPersonality,
    
    // Utilities
    personalityOptions: Object.entries(AI_PERSONALITIES).map(([key, config]) => ({
      value: key as keyof typeof AI_PERSONALITIES,
      label: config.name
    }))
  };
};