// components/sidebar/chat/ChatSection.jsx
"use client";

import { useState, useEffect } from "react";
import ChatContainer from "./ChatContainer";

export default function ChatSection({ currentUser, setSelectedProfile }) {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // ✅ Add refresh key


  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 100);
  }, []);

   // ✅ Function to force reload
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Optional: Add refresh button */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-end">
        <button 
          onClick={handleRefresh}
          className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Refresh conversations"
        >
          ↻ Refresh
        </button>
      </div>
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
          // ✅ Add key to force remount when needed
          <ChatContainer 
            key={refreshKey}
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