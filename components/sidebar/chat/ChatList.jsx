// components/sidebar/chat/ChatList.jsx
"use client";

import { useState, useEffect } from "react";
import { Search, Users, MessageCircle, UserPlus, X } from "lucide-react";
import { chatService } from "@/utils/chatService";

export default function ChatList({ 
  conversations, 
  activeChat, 
  setActiveChat,
  currentUser,
  compactMode = true,
  onStartNewChat
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedTab, setSelectedTab] = useState("conversations"); // "conversations" or "search"

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || !currentUser?.user_id) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const { success, users } = await chatService.getAllUsers(
          currentUser.user_id, 
          searchQuery,
          10
        );
        
        if (success) {
          setSearchResults(users);
          setShowSearchResults(true);
          setSelectedTab("search");
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, currentUser]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    } catch {
      return "";
    }
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation?.lastMessage?.text) {
      return "Start a conversation";
    }
    
    const prefix = conversation.lastMessage.senderId === currentUser?.user_id ? "You: " : "";
    const text = conversation.lastMessage.text.length > 25 
      ? conversation.lastMessage.text.substring(0, 25) + "..." 
      : conversation.lastMessage.text;
    
    return prefix + text;
  };

  // components/sidebar/chat/ChatList.jsx - handleStartChat function

  // const handleStartChat = async (user) => {
  //   if (!currentUser?.user_id || !user.user_id) return;
    
  //   try {
  //     // Call the parent's function
  //     if (onStartNewChat) {
  //       await onStartNewChat(user);
  //     }
  //   } catch (error) {
  //     console.error("Error starting chat:", error);
  //   }
  // };

  const handleStartChat = async (user) => {
    if (!currentUser?.user_id || !user.user_id) return;
    
    try {
      console.log("Starting chat with user:", user.user_id);
      
    // Call the parent's function (which will handle reloading conversations)
    if (onStartNewChat) {
      await onStartNewChat(user);
    } else {
      // Fallback: start conversation directly
      // Start new conversation
      const { success, conversation, error } = await chatService.startNewConversation(
        currentUser.user_id,
        user.user_id
      );
      
      if (success && conversation) {
        // Switch to conversation
        setActiveChat(conversation.id);
        setSearchQuery("");
        setShowSearchResults(false);
        setSelectedTab("conversations");
      } else {
        console.error("Failed to start conversation:", error);
      }
    } 
  } catch (error) {
    console.error("Error starting chat:", error);
  }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedTab("conversations");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Messages</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Chat with people
            </p>
          </div>
          <button 
            onClick={() => setSelectedTab("search")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Search users"
          >
            <UserPlus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setSelectedTab("conversations")}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              selectedTab === "conversations"
                ? "text-primary dark:text-accent border-b-2 border-primary dark:border-accent"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Conversations
          </button>
          <button
            onClick={() => setSelectedTab("search")}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              selectedTab === "search"
                ? "text-primary dark:text-accent border-b-2 border-primary dark:border-accent"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Search Users
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {selectedTab === "conversations" ? (
          // Conversations List
          conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Start a chat with someone
              </p>
              <button 
                onClick={() => setSelectedTab("search")}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
              >
                Find People
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveChat(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                    activeChat === conversation.id ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <img
                        src={conversation.otherUser.profile_image || "/default-avatar.png"}
                        alt={conversation.otherUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.otherUser.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800 dark:text-white truncate">
                            {conversation.otherUser.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.last_message_at)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {getLastMessagePreview(conversation)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          // Search Results
          <div className="p-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">
              {searchQuery ? "Search Results" : "All Users"}
            </h3>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? "No users found" : "Search for users to chat with"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.profile_image}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {user.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {user.name}
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartChat(user)}
                      className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}