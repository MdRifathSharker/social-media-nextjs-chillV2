"use client";

import { Users, MessageCircle, Bell, User } from "lucide-react";

export default function SidebarBottomNav({ activeTab, setActiveTab }) {
  const base =
    "flex flex-col items-center justify-center py-3 transition";
  const active =
    "bg-primary text-white";
  const inactive =
    "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

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
          onClick={() => setActiveTab("message")}
          className={`${base} ${activeTab === "message" ? active : inactive}`}
        >
          <MessageCircle size={22} />
          <span className="text-xs mt-1">Message</span>
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
