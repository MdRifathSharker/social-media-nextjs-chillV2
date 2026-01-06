// components/sidebar/Sidebar.jsx
"use client";

import { useState } from "react";
import SidebarBottomNav from "./SidebarBottomNav";
import FollowingSection from "./FollowingSection";
import NotificationSection from "./NotificationSection";
import ProfileSection from "./ProfileSection";
import ChatSection from "./chat/ChatSection";

export default function Sidebar({ currentUser, setSelectedProfile }) {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "following":
        return <FollowingSection currentUser={currentUser} setSelectedProfile={setSelectedProfile} />;

      case "message":
        return <ChatSection currentUser={currentUser} setSelectedProfile={setSelectedProfile} />;

      case "notification":
        return <NotificationSection currentUser={currentUser} />;

      case "profile":
        return <ProfileSection currentUser={currentUser} />;

      default:
        return <ProfileSection currentUser={currentUser} />;
    }
  };

  return (
    <div className="w-1/4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg h-full flex flex-col">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Fixed bottom navigation */}
      <SidebarBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}