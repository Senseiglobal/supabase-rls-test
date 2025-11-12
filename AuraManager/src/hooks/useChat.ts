import { useState, useCallback } from 'react';
import { googleAI, ChatMessage } from '@/lib/google-ai';

interface Conversation {
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

  const createConversation = useCallback(async (firstMessage: string) => {
    const conversationId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: firstMessage,
      timestamp,
    };

    const newConversation: Conversation = {
      id: conversationId,
      title: 'New Conversation',
      messages: [userMessage],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentConversation(newConversation);
    setConversations(prev => [newConversation, ...prev]);

    return newConversation;
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      let conversation = currentConversation;
      
      if (!conversation) {
        conversation = await createConversation(message);
      } else {
        const userMessage: ChatMessage = {
          role: 'user',
          content: message,
          timestamp,
        };

        const updatedConversation = {
          ...conversation,
          messages: [...conversation.messages, userMessage],
          updatedAt: new Date().toISOString(),
        };

        setCurrentConversation(updatedConversation);
        setConversations(prev => 
          prev.map(conv => conv.id === conversation!.id ? updatedConversation : conv)
        );
        conversation = updatedConversation;
      }

      // Generate AI response
      const aiResponse = await googleAI.generateResponse(message);
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalConversation = {
        ...conversation,
        messages: [...conversation.messages, aiMessage],
        updatedAt: new Date().toISOString(),
      };

      setCurrentConversation(finalConversation);
      setConversations(prev => 
        prev.map(conv => conv.id === conversation!.id ? finalConversation : conv)
      );

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, createConversation]);

  const loadConversation = useCallback((conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  }, [conversations]);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  }, [currentConversation]);

  const startNewConversation = useCallback(() => {
    setCurrentConversation(null);
  }, []);

  return {
    conversations,
    currentConversation,
    isLoading,
    sendMessage,
    loadConversation,
    deleteConversation,
    startNewConversation,
  };
};
