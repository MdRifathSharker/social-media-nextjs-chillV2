"use client";

import { useState } from "react";
import SidebarBottomNav from "./SidebarBottomNav";
import FollowingSection from "./FollowingSection";
import MessageSection from "./MessageSection";
import NotificationSection from "./NotificationSection";
import ProfileSection from "./ProfileSection";

export default function Sidebar({ currentUser }) {
  const [activeTab, setActiveTab] = useState("following");

  const renderContent = () => {
    switch (activeTab) {
      case "following":
        return <FollowingSection currentUser={currentUser} />;

      case "message":
        return <MessageSection />;

      case "notification":
        return <NotificationSection />;

      case "profile":
        return <ProfileSection currentUser={currentUser} />;

      default:
        return null;
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
