"use client";

import { Users, MessageCircle, Bell, User } from "lucide-react";
import { useState, useEffect } from "react";
import { chatService } from "@/utils/chatService";
import { notificationService } from "@/utils/notificationService";

export default function SidebarBottomNav({ activeTab, setActiveTab }) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [userId, setUserId] = useState(null);

  const base = "flex flex-col items-center justify-center py-3 transition relative";
  const active = "bg-primary text-white";
  const inactive = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

  // Get userId from localStorage
  useEffect(() => {
    const getUserId = () => {
      try {
        const userId = 
          localStorage.getItem("userId") ||
          localStorage.getItem("user_id") ||
          localStorage.getItem("supabase_user_id") ||
          localStorage.getItem("currentUserId");
        
        if (userId) {
          setUserId(userId);
          return userId;
        }
        
        // Also check for user object
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.id || user?.user_id) {
            const id = user.id || user.user_id;
            setUserId(id);
            return id;
          }
        }
        
        return null;
      } catch (error) {
        console.error("Error getting userId:", error);
        return null;
      }
    };

    getUserId();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      getUserId();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load unread counts
  useEffect(() => {
    const loadCounts = async () => {
      if (!userId) return;

      try {
        // Load message count
        const { success: msgSuccess, count: msgCount } = await chatService.getUnreadCount(userId);
        if (msgSuccess) {
          setUnreadMessages(msgCount);
        }

        // Load notification count
        const { success: notifSuccess, count: notifCount } = await notificationService.getUnreadCount(userId);
        if (notifSuccess) {
          setUnreadNotifications(notifCount);
        }
      } catch (error) {
        console.error("Error loading counts:", error);
      }
    };

    loadCounts();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadCounts, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Real-time subscription for notifications
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = notificationService.subscribeToNotifications(
      userId,
      (newNotification) => {
        if (!newNotification.is_read) {
          setUnreadNotifications(prev => prev + 1);
        }
      }
    );

    return unsubscribe;
  }, [userId]);

  return (
    <div className="border-t border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
      <div className="grid grid-cols-4">
        <button
          onClick={() => setActiveTab("following")}
          className={`${base} ${activeTab === "following" ? active : inactive}`}
        >
          <Users size={22} />
          <span className="text-xs mt-1">Following</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("message");
            setUnreadMessages(0);
          }}
          className={`${base} ${activeTab === "message" ? active : inactive}`}
        >
          <div className="relative">
            <MessageCircle size={22} />
            {/* Red Dot for Unread Messages */}
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <span className="text-xs mt-1">Message</span>
          {/* Badge with Count */}
          {unreadMessages > 0 && (
            <span className="absolute top-1 right-4 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("notification");
            setUnreadNotifications(0);
          }}
          className={`${base} ${activeTab === "notification" ? active : inactive}`}
        >
          <div className="relative">
            <Bell size={22} />
            {/* Red Dot for Unread Notifications */}
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <span className="text-xs mt-1">Notification</span>
          {/* Badge with Count */}
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-4 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`${base} ${activeTab === "profile" ? active : inactive}`}
        >
          <User size={22} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
}