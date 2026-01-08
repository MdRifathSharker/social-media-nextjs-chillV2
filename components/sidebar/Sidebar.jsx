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
    <div className="w-1/4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg h-full flex flex-col">      {/* Main Content Area */}
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderActiveSection()}
      </div>
      
      {/* Bottom Navigation */}
      <SidebarBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}