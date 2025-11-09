import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, Send, Plus, Clock, Trash2, Loader2, MoreVertical, Paperclip, Wifi, WifiOff, HelpCircle, X } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ArtistContext } from "@/lib/google-ai";
import { toast } from "sonner";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [showSpotifyInput, setShowSpotifyInput] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [showTour, setShowTour] = useState(false);
  
  // Google AI Chat Integration
  const {
    conversations,
    currentConversation,
    isLoading,
    personality,
    createConversation,
    sendMessage,
    loadConversation,
    sendQuickAction,
    setPersonality,
    personalityOptions,
    deleteConversation,
    clearAllConversations
  } = useChat();

  // Artist context (could be fetched from user profile)
  const artistContext: ArtistContext = {
    name: "Artist", // Could be fetched from user profile
    genre: "Pop", // Could be from user preferences
    platforms: ["Spotify", "Instagram"] // Based on connected accounts
  };

  const quickActions = [
    "Analyze my latest release performance",
    "Help me plan my next release strategy", 
    "Generate social media content ideas",
    "Set goals for this month"
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const messageToSend = message;
    setMessage(""); // Clear input immediately for better UX
    
    try {
      await sendMessage(messageToSend, artistContext);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error is already handled in useChat hook with toast
    }
  };

  const handleQuickAction = async (action: string) => {
    try {
      await sendQuickAction(action, artistContext);
    } catch (error) {
      console.error('Failed to send quick action:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachSpotifyUrl = () => {
    if (!isSpotifyConnected) {
      toast.error("Please connect your Spotify account first in the sidebar to attach music.");
      return;
    }
    setShowSpotifyInput(!showSpotifyInput);
  };

  const handleSpotifyUrlSubmit = async () => {
    if (!spotifyUrl.trim()) return;
    
    const spotifyMessage = `Please analyze this Spotify link: ${spotifyUrl}`;
    setSpotifyUrl("");
    setShowSpotifyInput(false);
    
    try {
      await sendMessage(spotifyMessage, artistContext);
    } catch (error) {
      console.error('Failed to send Spotify URL:', error);
    }
  };

  const handleSpotifyConnect = () => {
    if (isSpotifyConnected) {
      // Disconnect Spotify
      localStorage.removeItem('spotify-token');
      setIsSpotifyConnected(false);
      // In a real app, you'd revoke the OAuth token
    } else {
      // Connect to Spotify
      // In a real app, this would redirect to Spotify OAuth
      // For demo purposes, we'll simulate a successful connection
      const mockToken = 'mock-spotify-token-' + Date.now();
      localStorage.setItem('spotify-token', mockToken);
      setIsSpotifyConnected(true);
      // In reality: window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`;
    }
  };



  // Check if first-time user
  useEffect(() => {
    const hasVisited = localStorage.getItem('aura-chat-visited');
    if (!hasVisited) {
      setShowTour(true);
      localStorage.setItem('aura-chat-visited', 'true');
    }
  }, []);

  // Simulate Spotify connection check (in real app, check OAuth status)
  useEffect(() => {
    const checkSpotifyConnection = () => {
      // In a real app, check if user has authorized Spotify
      const spotifyToken = localStorage.getItem('spotify-token');
      setIsSpotifyConnected(!!spotifyToken);
    };
    checkSpotifyConnection();
  }, []);

  // Get current messages to display
  const messages = currentConversation?.messages || [];

  return (
    <div className="h-screen flex bg-gradient-to-br from-purple-50/30 via-orange-50/20 to-purple-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex w-80 border-r flex-col bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="p-4 border-b space-y-4">
          <Button 
            onClick={() => createConversation()}
            className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
          <Select 
            value={personality} 
            onValueChange={(value) => setPersonality(value as keyof typeof import("@/lib/google-ai").AI_PERSONALITIES)}
          >
            <SelectTrigger>
              <SelectValue placeholder="AI Personality" />
            </SelectTrigger>
            <SelectContent>
              {personalityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Spotify Connection */}
          <div className={`p-3 rounded-lg border transition-colors ${
            isSpotifyConnected 
              ? 'bg-green-700/10 border-green-700 dark:bg-green-800/20 dark:border-green-600' 
              : 'bg-orange-100/50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-600'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span className={`text-sm font-medium ${
                  isSpotifyConnected 
                    ? 'text-green-800 dark:text-green-300' 
                    : 'text-orange-800 dark:text-orange-300'
                }`}>
                  Spotify
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                isSpotifyConnected ? 'bg-green-600' : 'bg-orange-500'
              }`}></div>
            </div>
            <p className={`text-xs mb-3 ${
              isSpotifyConnected 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-orange-700 dark:text-orange-400'
            }`}>
              {isSpotifyConnected 
                ? 'Connected - Enhanced music analysis available' 
                : 'Connect for detailed track analysis and insights'
              }
            </p>
            <Button 
              size="sm" 
              onClick={handleSpotifyConnect}
              className={`w-full text-white font-medium ${
                isSpotifyConnected
                  ? 'bg-green-700 hover:bg-green-800 dark:bg-green-800 dark:hover:bg-green-900'
                  : 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800'
              }`}
            >
              {isSpotifyConnected ? 'Disconnect' : 'Connect Spotify'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Recent Conversations</h3>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setShowTour(true)}
              >
                <HelpCircle className="h-3 w-3" />
              </Button>
              {conversations.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={clearAllConversations}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Card
                key={conv.id}
                className={`p-3 cursor-pointer transition-colors group backdrop-blur-sm ${
                  currentConversation?.id === conv.id 
                    ? "bg-gradient-to-r from-purple-100/80 to-orange-100/80 dark:from-gray-800/80 dark:to-gray-700/80 border-purple-300 dark:border-orange-500 shadow-md" 
                    : "bg-white/40 dark:bg-gray-800/40 hover:bg-gradient-to-r hover:from-purple-50/60 hover:to-orange-50/60 dark:hover:from-gray-800/60 dark:hover:to-gray-700/60 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3" onClick={() => loadConversation(conv.id)}>
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-orange-400 flex-shrink-0 mt-0.5 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-black dark:text-orange-400 transition-colors">{conv.title}</p>
                    <div className="flex items-center gap-1 text-xs text-black/70 dark:text-orange-400/70 mt-1 transition-colors">
                      <Clock className="h-3 w-3" />
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
            {conversations.length === 0 && (
              <div className="text-center text-muted-foreground py-8 bg-white/30 dark:bg-gray-800/30 rounded-lg backdrop-blur-sm">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs">Start a chat with your AI manager!</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t">
          <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.slice(0, 2).map((action, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs border-purple-200 dark:border-orange-400 text-purple-700 dark:text-orange-300 hover:bg-purple-50 dark:hover:bg-orange-900/20 hover:border-purple-300 dark:hover:border-orange-300"
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/40 dark:bg-gray-900/60 backdrop-blur-sm">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between bg-white/80 dark:bg-gray-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/icons/light_icon_32x32.png" 
                alt="AURA AI" 
                className="w-10 h-10" 
              />
            </div>
            <div>
              <h2 className="font-semibold">AURA - AI Artist Manager</h2>
              <p className="text-xs text-muted-foreground">Powered by Gemini 2.0 • {personality} mode</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTour(true)}
              className="lg:hidden"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="lg:hidden">
              History
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent via-white/10 to-transparent dark:via-gray-900/20">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <img 
                    src="/icons/light_icon_32x32.png" 
                    alt="AURA AI" 
                    className="w-12 h-12 opacity-50" 
                  />
                </div>
                <p className="text-lg">No messages yet</p>
                <p className="text-sm">Start a conversation with your AURA AI assistant</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 animate-fade-in ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/icons/light_icon_32x32.png" 
                      alt="AURA AI" 
                      className="w-8 h-8" 
                    />
                  </div>
                )}
                <div
                  className={`flex-1 max-w-3xl ${
                    msg.role === "user" ? "flex justify-end" : ""
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-card border"
                    } shadow-sm`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-2 block">{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <img 
                  src="/icons/light_icon_32x32.png" 
                  alt="AURA AI" 
                  className="w-8 h-8 animate-pulse" 
                />
              </div>
              <div className="flex-1 max-w-3xl">
                <div className="p-4 rounded-2xl bg-card border shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">Thinking...</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions (Mobile) */}
        <div className="border-t p-4 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                size="sm" 
                className="whitespace-nowrap border-purple-200 dark:border-orange-400 text-purple-700 dark:text-orange-300 hover:bg-purple-50 dark:hover:bg-orange-900/20"
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t p-4 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md">
          {/* Spotify URL Input */}
          {showSpotifyInput && (
            <div className="max-w-4xl mx-auto mb-3 p-4 bg-green-50/80 dark:bg-green-950/40 rounded-lg border border-green-200 dark:border-green-800 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span className="text-sm font-semibold text-green-800 dark:text-green-200">Attach Spotify Link</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste Spotify song/album URL here..."
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className="flex-1 bg-white dark:bg-green-900/20 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 text-green-900 dark:text-green-100 placeholder:text-green-600 dark:placeholder:text-green-400"
                />
                <Button 
                  size="sm" 
                  onClick={handleSpotifyUrlSubmit}
                  disabled={!spotifyUrl.trim()}
                  className="bg-green-600 hover:bg-green-500 active:bg-green-700 text-black font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-600 border-0 focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
                >
                  Analyze
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowSpotifyInput(false)}
                  className="text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={handleAttachSpotifyUrl}
              className={`flex-shrink-0 relative ${isSpotifyConnected ? 'border-green-600 hover:border-green-700 text-green-700' : 'border-orange-400 hover:border-orange-500 text-orange-600'}`}
              disabled={isLoading}
              title={isSpotifyConnected ? "Spotify Connected - Attach music" : "Connect Spotify first in sidebar"}
            >
              <Paperclip className="h-4 w-4" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isSpotifyConnected ? 'bg-green-600' : 'bg-orange-500'}`}>
                {isSpotifyConnected ? (
                  <Wifi className="h-2 w-2 text-white m-0.5" />
                ) : (
                  <WifiOff className="h-2 w-2 text-white m-0.5" />
                )}
              </div>
            </Button>
            <Input
              placeholder="Ask your AI manager anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white flex-shrink-0"
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>


      </div>

      {/* Modern Tour Guide */}
      {showTour && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-white" />
                  <h3 className="text-white font-semibold">Welcome to AURA!</h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTour(false)}
                  className="text-white hover:bg-white/20 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Chat with AI Manager</p>
                    <p className="text-xs text-muted-foreground">Ask questions about your music career and get strategic advice</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Attach Spotify Links</p>
                    <p className="text-xs text-muted-foreground">Use the 📎 button to analyze songs, albums, or playlists</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Connection Status</p>
                    <p className="text-xs text-muted-foreground">Green dot = connected, Red dot = disconnected from Spotify</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm">Quick Actions</p>
                    <p className="text-xs text-muted-foreground">Try the suggested prompts for instant insights</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setShowTour(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-medium"
              >
                Got it, let's start!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
