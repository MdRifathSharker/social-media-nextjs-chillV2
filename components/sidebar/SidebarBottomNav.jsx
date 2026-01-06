// components/sidebar/SidebarBottomNav.jsx - UPDATED VERSION
"use client";

import { Users, MessageCircle, Bell, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function SidebarBottomNav({ activeTab, setActiveTab }) {
  const [unreadMessages, setUnreadMessages] = useState(3); // Example: 3 unread messages
  const [showChat, setShowChat] = useState(false);

  const base = "flex flex-col items-center justify-center py-3 transition relative";
  const active = "bg-primary text-white";
  const inactive = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

  // Simulate receiving new messages
  useEffect(() => {
    const interval = setInterval(() => {
      // In real app, you'd fetch from API/WebSocket
      setUnreadMessages(prev => Math.min(prev + Math.floor(Math.random()), 99));
    }, 30000);
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
            // Mark messages as read when opening chat
            if (unreadMessages > 0) {
              setUnreadMessages(0);
            }
          }}
          className={`${base} ${activeTab === "message" ? active : inactive}`}
        >
          <div className="relative">
            <MessageCircle size={22} />
            {/* Red Dot for Unread Messages */}
            {unreadMessages > 0 && (
              <>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500/20 rounded-full animate-ping"></span>
              </>
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
          onClick={() => setActiveTab("notification")}
          className={`${base} ${activeTab === "notification" ? active : inactive}`}
        >
          <div className="relative">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </div>
          <span className="text-xs mt-1">Notification</span>
          <span className="absolute top-1 right-4 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            5
          </span>
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