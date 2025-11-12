import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, X, Sparkles, ChevronDown, MessageSquare, LineChart, Music, Home } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/use-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  category: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingTest, setCreatingTest] = useState(false);
  const { counts, refresh } = useNotifications();
  const { toast } = useToast();

  const totalUnread = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      refresh();

      hapticFeedback.success();
      toast({
        title: "Marked as read",
        description: "Notification has been marked as read",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      hapticFeedback.error();
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      refresh();

      hapticFeedback.success();
      toast({
        title: "All marked as read",
        description: "All notifications have been marked as read",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      hapticFeedback.error();
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      refresh();

      hapticFeedback.warning();
      toast({
        title: "Deleted",
        description: "Notification has been deleted",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      hapticFeedback.error();
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const clearAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
      refresh();

      hapticFeedback.important();
      toast({
        title: "All cleared",
        description: "All notifications have been deleted",
      });
    } catch (error) {
      console.error('Error clearing all:', error);
      hapticFeedback.error();
      toast({
        title: "Error",
        description: "Failed to clear all notifications",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      chat: MessageSquare,
      analytics: LineChart,
      content: Music,
      dashboard: Home,
    };
    return icons[category as keyof typeof icons] || Bell;
  };

  const groupedNotifications = notifications.reduce((acc, notification) => {
    if (!acc[notification.category]) {
      acc[notification.category] = [];
    }
    acc[notification.category].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  const categories = [
    { key: 'chat', label: 'Chat' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'content', label: 'Content' },
    { key: 'dashboard', label: 'Dashboard' },
  ];

  const getUnreadCount = (category: string) => {
    return groupedNotifications[category]?.filter(n => !n.is_read).length || 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = (notification: Notification) => (
    <div
      key={notification.id}
      className={cn(
        "p-3 rounded-lg border transition-all hover:shadow-sm",
        notification.is_read
          ? "bg-background border-border"
          : "bg-accent/5 border-accent/20"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">
              {formatDate(notification.created_at)}
            </span>
            {!notification.is_read && (
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            )}
          </div>
          <h4 className="font-semibold text-sm mb-1">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {notification.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => markAsRead(notification.id)}
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => deleteNotification(notification.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  const createTestNotifications = async () => {
    try {
      setCreatingTest(true);
      
      const { error } = await supabase.functions.invoke('create-test-notifications', {
        body: { count: 5 },
      });

      if (error) throw error;

      hapticFeedback.success();
      toast({
        title: "Test notifications created",
        description: "5 sample notifications have been added",
      });

      // Refresh the notifications list
      await fetchNotifications();
      refresh();

    } catch (error) {
      console.error('Error creating test notifications:', error);
      hapticFeedback.error();
      toast({
        title: "Error",
        description: "Failed to create test notifications",
        variant: "destructive",
      });
    } finally {
      setCreatingTest(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold animate-pulse">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {totalUnread > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalUnread} unread
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Stay updated with your latest activities and updates
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2 mt-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={createTestNotifications}
            disabled={creatingTest}
            className="flex-1"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {creatingTest ? 'Creating...' : 'Add Test Notifications'}
          </Button>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2 mb-4">
            {notifications.some(n => !n.is_read) && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex-1"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          </div>
        )}

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-220px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={categories.map(c => c.key)} className="space-y-2">
              {categories.map((category) => {
                const categoryNotifications = groupedNotifications[category.key] || [];
                const unreadCount = getUnreadCount(category.key);
                const CategoryIcon = getCategoryIcon(category.key);

                if (categoryNotifications.length === 0) return null;

                return (
                  <AccordionItem 
                    key={category.key} 
                    value={category.key}
                    className="border rounded-lg bg-card backdrop-blur-none"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/5">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={cn(
                          "p-2 rounded-lg",
                          category.key === 'chat' && "bg-accent/10",
                          category.key === 'analytics' && "bg-success/10",
                          category.key === 'content' && "bg-primary/10",
                          category.key === 'dashboard' && "bg-secondary/10"
                        )}>
                          <CategoryIcon className={cn(
                            "h-4 w-4",
                            category.key === 'chat' && "text-accent",
                            category.key === 'analytics' && "text-success",
                            category.key === 'content' && "text-primary",
                            category.key === 'dashboard' && "text-secondary"
                          )} />
                        </div>
                        <span className="font-semibold">{category.label}</span>
                        <Badge variant="secondary" className="ml-auto mr-2">
                          {categoryNotifications.length}
                        </Badge>
                        {unreadCount > 0 && (
                          <Badge variant="default" className="bg-accent">
                            {unreadCount} new
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <div className="space-y-2">
                        {categoryNotifications.map(renderNotification)}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
