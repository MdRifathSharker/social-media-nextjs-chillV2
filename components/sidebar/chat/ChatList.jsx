// components/sidebar/chat/ChatList.jsx (Updated for compact mode)
"use client";

import { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";

export default function ChatList({ 
  conversations, 
  activeChat, 
  setActiveChat,
  currentUser,
  compactMode = true
}) {
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate unread messages
  useEffect(() => {
    const counts = {};
    conversations.forEach(chat => {
      const unread = chat.messages.filter(
        msg => !msg.read && msg.senderId !== currentUser.user_id
      ).length;
      counts[chat.id] = unread;
    });
    setUnreadCounts(counts);
  }, [conversations, currentUser]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const getLastMessagePreview = (conversation) => {
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    if (!lastMsg) return "Start a conversation";
    
    const prefix = lastMsg.senderId === currentUser.user_id ? "You: " : "";
    const text = lastMsg.text.length > 20 
      ? lastMsg.text.substring(0, 20) + "..." 
      : lastMsg.text;
    
    return prefix + text;
  };

  const filteredConversations = conversations.filter(conv => 
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? "No conversations found" : "No messages yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveChat(conversation.id)}
                className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                  activeChat === conversation.id ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={conversation.user.avatar}
                      alt={conversation.user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    {conversation.user.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-800 dark:text-white truncate">
                        {conversation.user.name}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatTime(conversation.lastActivity)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {getLastMessagePreview(conversation)}
                      </p>
                      {unreadCounts[conversation.id] > 0 && (
                        <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {unreadCounts[conversation.id]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Start Chat Button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors">
          + New Conversation
        </button>
      </div>
    </div>
  );
}