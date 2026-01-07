// components/sidebar/chat/ChatContainer.jsx
"use client";

import { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ChatBox from "./ChatBox";

// Dummy Data matching your user structure
const createDummyConversations = (currentUserId) => [
  {
    id: "1",
    user: {
      id: "101",
      name: "Alice Johnson",
      email: "alice@example.com",
      avatar: "https://i.pravatar.cc/150?img=1",
      profile_image: "https://i.pravatar.cc/150?img=1",
      online: true,
      lastSeen: "2 min ago"
    },
    messages: [
      {
        id: "m1",
        text: "Hey there! How are you doing?",
        senderId: "101",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        delivered: true,
        read: true
      },
      {
        id: "m2",
        text: "I'm good! Just working on some projects.",
        senderId: currentUserId,
        timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
        delivered: true,
        read: true
      },
      {
        id: "m3",
        text: "That's great! Want to meet for coffee tomorrow?",
        senderId: "101",
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        delivered: true,
        read: false
      }
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: "2",
    user: {
      id: "102",
      name: "Bob Smith",
      email: "bob@example.com",
      avatar: "https://i.pravatar.cc/150?img=5",
      profile_image: "https://i.pravatar.cc/150?img=5",
      online: false,
      lastSeen: "1 hour ago"
    },
    messages: [
      {
        id: "m1",
        text: "Did you see the latest design?",
        senderId: currentUserId,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        delivered: true,
        read: true
      },
      {
        id: "m2",
        text: "Not yet, send it over!",
        senderId: "102",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.8).toISOString(),
        delivered: true,
        read: true
      },
      {
        id: "m3",
        text: "Just sent it to your email. Let me know your thoughts!",
        senderId: currentUserId,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.7).toISOString(),
        delivered: true,
        read: true
      }
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 1.7).toISOString()
  },
  {
    id: "3",
    user: {
      id: "103",
      name: "Charlie Brown",
      email: "charlie@example.com",
      avatar: "https://i.pravatar.cc/150?img=8",
      profile_image: "https://i.pravatar.cc/150?img=8",
      online: true,
      lastSeen: "just now"
    },
    messages: [
      {
        id: "m1",
        text: "Hey, are you free for a quick call?",
        senderId: "103",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        delivered: true,
        read: false
      }
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: "4",
    user: {
      id: "104",
      name: "David Wilson",
      email: "david@example.com",
      avatar: "https://i.pravatar.cc/150?img=12",
      profile_image: "https://i.pravatar.cc/150?img=12",
      online: false,
      lastSeen: "yesterday"
    },
    messages: [
      {
        id: "m1",
        text: "Meeting notes from yesterday are ready.",
        senderId: "104",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        delivered: true,
        read: true
      },
      {
        id: "m2",
        text: "Perfect, thanks! I'll review them now.",
        senderId: currentUserId,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23.5).toISOString(),
        delivered: true,
        read: true
      }
    ],
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 23.5).toISOString()
  }
];

export default function ChatContainer({ 
  currentUser, 
  setSelectedProfile,
  compactMode = true
}) {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.user_id) {
      setIsLoading(true);
      setTimeout(() => {
        setConversations(createDummyConversations(currentUser.user_id));
        // Don't set activeChat by default - show chat list first
        setIsLoading(false);
      }, 500);
    }
  }, [currentUser]);

  const handleSendMessage = (message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeChat) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastActivity: new Date().toISOString()
        };
      }
      return conv;
    }));
  };

  const activeConversation = conversations.find(conv => conv.id === activeChat);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
      </div>
    );
  }

  // Always show chat list first when clicking chat button
  if (!activeChat) {
    return (
      <ChatList
        conversations={conversations}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        currentUser={currentUser}
        compactMode={true}
      />
    );
  }

  // Show chat box when a conversation is selected
  return (
    <ChatBox
      conversation={activeConversation}
      currentUser={currentUser}
      onSendMessage={handleSendMessage}
      onBack={() => setActiveChat(null)}
      setSelectedProfile={setSelectedProfile}
      compactMode={true}
    />
  );
}