"use client";

import { useState, useEffect } from "react";
import { notificationService } from "@/utils/notificationService";
import NotificationItem from "./lists/NotificationItem";
import { Bug } from "lucide-react";

export default function NotificationSection() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  // Get userId from localStorage - Improved version
  useEffect(() => {
    const getUserId = () => {
      try {
        // Check localStorage for userId
        const storedUserId = localStorage.getItem("userId");
        
        if (storedUserId) {
          console.log("Found userId in localStorage:", storedUserId);
          setUserId(storedUserId);
          return storedUserId;
        }

        // Check for user object
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const userIdFromObj = user?.id || user?.user_id || user?.uid;
          
          if (userIdFromObj) {
            console.log("Found userId from user object:", userIdFromObj);
            localStorage.setItem("userId", userIdFromObj); // Store for future
            setUserId(userIdFromObj);
            return userIdFromObj;
          }
        }

        console.warn("No userId found in localStorage");
        setError("User not found. Please login again.");
        return null;
      } catch (error) {
        console.error("Error getting userId:", error);
        setError("Error loading user data");
        return null;
      }
    };

    const id = getUserId();
    if (!id) {
      const timer = setTimeout(() => {
        const retryId = getUserId();
        if (!retryId) {
          setLoading(false);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    return () => {};
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) {
      console.log("No userId, skipping fetch");
      return;
    }
    
    try {
      console.log("Fetching notifications for userId:", userId);
      setLoading(true);
      
      const [notifResult, countResult] = await Promise.all([
        notificationService.getNotifications(userId),
        notificationService.getUnreadCount(userId)
      ]);

      console.log("Notification fetch result:", notifResult);
      console.log("Count fetch result:", countResult);

      if (notifResult.success) {
        setNotifications(notifResult.notifications || []);
        setError(null);
      } else {
        setError(notifResult.error || "Failed to load notifications");
        setNotifications([]);
      }

      if (countResult.success) {
        setUnreadCount(countResult.count || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Debug function
  const debugNotifications = async () => {
    if (!userId) return;
    const result = await notificationService.debugNotifications(userId);
    console.log("Debug result:", result);
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!userId) return;
    
    const { success } = await notificationService.markAsRead(userId, [notificationId]);
    if (success) {
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;
    
    const { success } = await notificationService.markAsRead(userId);
    if (success) {
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    }
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    const deletedNotif = notifications.find(n => n.id === notificationId);
    if (deletedNotif && !deletedNotif.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!userId) return;
    
    const { success } = await notificationService.clearAll(userId);
    if (success) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);

      // if (diffMins < 1) return "Just now";
      // if (diffMins < 60) return `${diffMins}m`;
      // if (diffHours < 24) return `${diffHours}h`;
      // if (diffDays < 7) return `${diffDays}d`;
      // if (diffWeeks < 4) return `${diffWeeks}w`;
      // if (diffMonths < 12) return `${diffMonths}mo`;
  
      // return date.toLocaleDateString('en-US', { 
      // month: 'short', 
      // day: 'numeric',
      // year: diffMonths >= 12 ? 'numeric' : undefined
      //});

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
      if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
      if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;

       return date.toLocaleDateString();
    } catch (error) {
      return "Some time ago";
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    // Subscribe to new notifications
    const unsubscribe = notificationService.subscribeToNotifications(
      userId,
      (newNotification) => {
        console.log("Real-time notification received:", newNotification);
        setNotifications(prev => [newNotification, ...prev]);
        if (!newNotification.is_read) {
          setUnreadCount(prev => prev + 1);
        }
      }
    );

    // Refresh every 30 seconds for updates
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [userId]);

  // If error
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchNotifications();
          }}
          className="text-sm text-blue-500 hover:underline"
        >
          Retry
        </button>
        <button 
          onClick={debugNotifications}
          className="ml-4 text-sm text-gray-500 hover:underline"
        >
          Debug
        </button>
      </div>
    );
  }

  // If no userId found
  if (!userId && !loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Please log in to see notifications</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-500 hover:underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-3 rounded-lg border-l-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No notifications yet</p>
        
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={debugNotifications}
            className="text-xs text-gray-500 hover:underline"
            title="Debug"
          >
            <Bug className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={clearAllNotifications}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Notifications list */}
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          text={notification.text}
          time={formatTime(notification.created_at)}
          type={notification.type}
          isRead={notification.is_read}
          notificationId={notification.id}
          actor={notification.actor}
          post={notification.post}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      ))}
    </div>
  );
}