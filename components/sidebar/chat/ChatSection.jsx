// components/sidebar/chat/ChatSection.jsx
"use client";

import { useState, useEffect } from "react";
import ChatContainer from "./ChatContainer";
import { MessageCircle } from "lucide-react";

export default function ChatSection({ currentUser, setSelectedProfile }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  // Regular Sidebar View Only
  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 mb-4 p-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Messages</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Chat with your connections</p>
        </div>
      </div>
      
      {/* Chat Container */}
      <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : (
          <ChatContainer 
            currentUser={currentUser} 
            setSelectedProfile={setSelectedProfile}
            compactMode={true}
          />
        )}
      </div>
      
      {/* Status Info */}
      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Active conversations: 3</span>
          <span className="text-primary font-medium">3 online</span>
        </div>
      </div>
    </div>
  );
}