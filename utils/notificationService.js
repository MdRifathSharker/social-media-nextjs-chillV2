import { supabase } from '@/utils/supabaseClient';

export const notificationService = {
  // Get notifications for current user with proper error handling
  async getNotifications(userId) {
    try {
      console.log('Fetching notifications for user:', userId);
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:users!notifications_actor_id_fkey(
            user_id,
            name,
            username,
            profile_image
          ),
          post:posts!notifications_post_id_fkey(
            id,
            content
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Supabase error fetching notifications:', error);
        throw error;
      }
      
      console.log('Fetched notifications:', data?.length || 0);
      return { success: true, notifications: data || [] };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error: error.message, notifications: [] };
    }
  },

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { success: false, error: error.message, count: 0 };
    }
  },

  // Mark notifications as read
  async markAsRead(userId, notificationIds = null) {
    try {
      let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      if (notificationIds && notificationIds.length > 0) {
        query = query.in('id', notificationIds);
      } else {
        query = query.eq('is_read', false);
      }

      const { error } = await query;
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Clear all notifications
  async clearAll(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return { success: false, error: error.message };
    }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId, callback) {
    try {
      const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('New notification received:', payload.new);
            callback(payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Notification updated:', payload.new);
            // You can handle updates if needed
          }
        )
        .subscribe((status) => {
          console.log('Notification subscription status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up notification subscription:', error);
      return () => {}; // Return empty cleanup function
    }
  },

  // Debug: Check if notifications table has data
  async debugNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      console.log('Debug - Total notifications:', data?.length);
      console.log('Debug - Sample notifications:', data?.slice(0, 3));
      
      return { success: true, data };
    } catch (error) {
      console.error('Debug error:', error);
      return { success: false, error: error.message };
    }
  }
};