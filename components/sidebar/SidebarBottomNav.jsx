// components/sidebar/SidebarBottomNav.jsx
"use client";

import { Users, MessageCircle, Bell, User } from "lucide-react";
import { useState, useEffect } from "react";
import { chatService } from "@/utils/chatService";

export default function SidebarBottomNav({ activeTab, setActiveTab }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const base = "flex flex-col items-center justify-center py-3 transition relative";
  const active = "bg-primary text-white";
  const inactive = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

  // Load unread message count with error handling
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const { success, count, error } = await chatService.getUnreadCount(userId);
        
        if (success) {
          setUnreadCount(count);
        } else {
          console.warn("⚠️ Could not load unread count:", error);
          // Set default if error
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("Error loading unread count:", error);
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

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
            // Reset unread count when opening messages
            setUnreadCount(0);
          }}
          className={`${base} ${activeTab === "message" ? active : inactive}`}
        >
          <div className="relative">
            <MessageCircle size={22} />
            {/* Red Dot for Unread Messages */}
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </>
            )}
          </div>
          <span className="text-xs mt-1">Message</span>
          {/* Badge with Count */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-4 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("notification")}
          className={`${base} ${activeTab === "notification" ? active : inactive}`}
        >
          <Bell size={22} />
          <span className="text-xs mt-1">Notification</span>
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