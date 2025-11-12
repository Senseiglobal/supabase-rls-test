import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { notificationSound } from "@/lib/notification-sound";
import { useNotificationPreferences } from "./use-notification-preferences";

interface NotificationCounts {
  chat: number;
  analytics: number;
  content: number;
  dashboard: number;
}

export const useNotifications = () => {
  const [counts, setCounts] = useState<NotificationCounts>({
    chat: 0,
    analytics: 0,
    content: 0,
    dashboard: 0,
  });

  const fetchNotificationCounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('category, is_read')
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      const newCounts: NotificationCounts = {
        chat: 0,
        analytics: 0,
        content: 0,
        dashboard: 0,
      };

      data?.forEach((notification) => {
        if (notification.category in newCounts) {
          newCounts[notification.category as keyof NotificationCounts]++;
        }
      });

      setCounts(newCounts);
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  const { soundEnabled, soundVolume } = useNotificationPreferences();

  useEffect(() => {
    fetchNotificationCounts();

    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          // Play sound on new notification insert if enabled
          if (payload.eventType === 'INSERT' && soundEnabled) {
            notificationSound.play(soundVolume);
          }
          fetchNotificationCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled, soundVolume]);

  const markAsRead = async (category: keyof NotificationCounts) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('is_read', false);

      if (error) throw error;
      
      // Refresh counts after marking as read
      await fetchNotificationCounts();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return { counts, markAsRead, refresh: fetchNotificationCounts };
};
