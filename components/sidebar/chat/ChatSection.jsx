// components/sidebar/chat/ChatSection.jsx
"use client";

import { useState, useEffect } from "react";
import ChatContainer from "./ChatContainer";

export default function ChatSection({ currentUser, setSelectedProfile }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Chat Container - Directly show chat without extra header */}
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
      
      {/* Status Info - Removed */}
    </div>
  );
}