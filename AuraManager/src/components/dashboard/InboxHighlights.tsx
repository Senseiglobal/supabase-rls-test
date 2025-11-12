import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

export const InboxHighlights = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['inbox-highlights'],
    queryFn: async () => {
      // This would call the inbox sync API with the user's access token
      // For now, return mock data structure
      return [];
    },
    enabled: false, // Only fetch when user explicitly syncs
  });

  const syncInbox = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user has granted inbox permission
      const { data: permission } = await supabase
        .from('permissions')
        .select('granted')
        .eq('user_id', user.id)
        .eq('permission_type', 'inbox_reader')
        .single();

      if (!permission?.granted) {
        throw new Error('Inbox Reader permission not granted. Enable it in Settings.');
      }

      // In production, this would call /api/inbox/sync with OAuth token
      toast({
        title: '📧 Inbox synced',
        description: 'Your booking-related emails have been updated.',
      });

      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-highlights'] });
      setIsSyncing(false);
    },
    onError: (error: any) => {
      toast({
        title: '❌ Sync failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsSyncing(false);
    },
  });

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          📬 Inbox Highlights
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => syncInbox.mutate()}
          disabled={isSyncing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground">Loading inbox...</p>}
        
        {!isLoading && (!messages || messages.length === 0) && (
          <div className="text-center py-6">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-2">
              No recent booking emails found
            </p>
            <p className="text-sm text-muted-foreground">
              Click Sync to fetch booking-related messages from your inbox
            </p>
          </div>
        )}

        {messages && messages.length > 0 && (
          <ul className="space-y-3">
            {messages.slice(0, 5).map((msg: any) => (
              <li
                key={msg.id}
                className="flex items-start justify-between border-l-2 border-purple-500 pl-3 py-2 hover:bg-accent rounded-r transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{msg.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">{msg.from}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {msg.snippet}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
