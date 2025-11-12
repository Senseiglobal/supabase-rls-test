import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Plus, Clock, Music, Loader2, Paperclip, X, Link as LinkIcon } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { PageContainer } from "@/components/PageContainer";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [personality, setPersonality] = useState("friendly");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [attachedUrl, setAttachedUrl] = useState("");
  const {
    conversations,
    currentConversation,
    isLoading,
    sendMessage,
    loadConversation,
    deleteConversation,
    startNewConversation,
  } = useChat();

  const quickActions = [
    "Analyze my latest release",
    "Review my strategy",
    "Set a new goal",
    "Social media content ideas",
  ];

  const handleSendMessage = async () => {
    if (!message.trim() && !attachedUrl) return;
    
    const messageToSend = attachedUrl 
      ? `${message}\n\nAttached URL: ${attachedUrl}`
      : message;
    
    setMessage("");
    setAttachedUrl("");
    setShowUrlInput(false);
    
    try {
      await sendMessage(messageToSend);
    } catch (_error) {
      toast.error("Failed to send message. Please try again.");
      setMessage(message);
    }
  };

  return (
    <PageContainer className="h-screen" noPadding>
      <div className="h-full flex bg-background">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:flex w-80 border-r flex-col">
          <div className="p-4 border-b space-y-4">
            <Button className="w-full bg-gradient-to-r from-primary to-success hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
            <Select value={personality} onValueChange={setPersonality}>
              <SelectTrigger>
                <SelectValue placeholder="AI Personality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">🎩 Professional</SelectItem>
                <SelectItem value="friendly">😊 Friendly</SelectItem>
                <SelectItem value="direct">🎯 Direct</SelectItem>
                <SelectItem value="motivational">💪 Motivational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Recent Conversations</h3>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors group"
                  onClick={() => loadConversation(conv.id)}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:dark:text-black flex-shrink-0 mt-0.5 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-foreground group-hover:dark:text-black transition-colors">{conv.title}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground/70 group-hover:dark:text-black/70 mt-1 transition-colors">
                        <Clock className="h-3 w-3" />
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="p-4 border-t">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.slice(0, 2).map((action, idx) => (
                <Button key={idx} variant="outline" size="sm" className="w-full justify-start text-xs">
                  {action}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                <img 
                  src="/icons/dark_icon_32x32.png" 
                  alt="AuraManager" 
                  className="w-8 h-8 dark:hidden" 
                />
                <img 
                  src="/icons/light_icon_32x32.png" 
                  alt="AuraManager" 
                  className="w-8 h-8 hidden dark:block" 
                />
              </div>
              <div>
                <h2 className="font-semibold">AuraManager</h2>
                <p className="text-xs text-muted-foreground">Powered by Google Gemini • {personality} mode</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="lg:hidden">
              History
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentConversation ? currentConversation.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 animate-fade-in ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-success flex items-center justify-center flex-shrink-0">
                    <Music className="h-4 w-4 text-white" />
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
            )) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg mb-2">Welcome to AuraManager!</h3>
                  <p className="text-muted-foreground mb-4">Chat with your AI manager</p>
                  <Button onClick={startNewConversation} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>
                </div>
              </div>
            )}
            
            {/* Thinking indicator */}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-success flex items-center justify-center flex-shrink-0">
                  <Music className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 max-w-3xl">
                  <div className="p-4 rounded-2xl bg-card border shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
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
                <Button key={idx} variant="outline" size="sm" className="whitespace-nowrap">
                  {action}
                </Button>
              ))}
            </div>
          </div>

          {/* Attached URL Display */}
          {attachedUrl && (
            <div className="px-4 py-2 border-t">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{attachedUrl}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => {
                      setAttachedUrl("");
                      setShowUrlInput(false);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* URL Input */}
          {showUrlInput && !attachedUrl && (
            <div className="px-4 py-2 border-t">
              <div className="max-w-4xl mx-auto flex gap-2">
                <Input
                  placeholder="Enter URL to analyze (e.g., Spotify link, YouTube video)..."
                  value={attachedUrl}
                  onChange={(e) => setAttachedUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && attachedUrl.trim()) {
                      setShowUrlInput(false);
                    }
                  }}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => setShowUrlInput(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4">
            <div className="max-w-4xl mx-auto flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="flex-shrink-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Message your AI manager..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoading && (message.trim() || attachedUrl)) {
                    handleSendMessage();
                  }
                }}
              />
              <Button
                size="icon"
                className="bg-gradient-to-r from-primary to-success hover:opacity-90 flex-shrink-0"
                disabled={(!message.trim() && !attachedUrl) || isLoading}
                onClick={handleSendMessage}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Chat;
