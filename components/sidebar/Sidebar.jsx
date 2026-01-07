// components/sidebar/Sidebar.jsx
"use client";

import { useState, useEffect } from "react";
import SidebarBottomNav from "./SidebarBottomNav";
import FollowingSection from "./FollowingSection";
import NotificationSection from "./NotificationSection";
import ProfileSection from "./ProfileSection";
import ChatSection from "./chat/ChatSection";

export default function Sidebar({ currentUser, setSelectedProfile }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [showChatList, setShowChatList] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  const handleBackToChatList = () => {
    setShowChatList(false);
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case "following":
        return <FollowingSection userId={userId} />;
      case "message":
        return (
          <ChatSection 
            currentUser={currentUser} 
            setSelectedProfile={setSelectedProfile}
            onBack={handleBackToChatList}
          />
        );
      case "notification":
        return <NotificationSection userId={userId} />;
      case "profile":
        return <ProfileSection currentUser={currentUser} />;
      default:
        return <FollowingSection userId={userId} />;
    }
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderActiveSection()}
      </div>
      
      {/* Bottom Navigation */}
      <SidebarBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}