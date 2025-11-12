import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ReplyComposer = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState('professional');
  const [reply, setReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReply = async () => {
    if (!message.trim()) {
      toast({
        title: '⚠️ No message',
        description: 'Please enter a message to reply to',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch('/api/ai/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, tone, userId: user.id }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setReply(data.reply);
        toast({
          title: '✨ Reply generated',
          description: 'Your AI-powered reply is ready!',
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: '❌ Generation failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reply);
    toast({
      title: '📋 Copied',
      description: 'Reply copied to clipboard',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Reply Composer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Message to reply to</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste the message you want to reply to..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tone</label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="negotiator">Negotiator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generateReply} disabled={isGenerating} className="w-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate Reply'}
        </Button>

        {reply && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Generated Reply</label>
              <Button size="sm" variant="outline" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};