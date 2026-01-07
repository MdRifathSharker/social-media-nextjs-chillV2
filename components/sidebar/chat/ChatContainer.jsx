// components/sidebar/chat/ChatContainer.jsx - FULL FIXED CODE

"use client";

import { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ChatBox from "./ChatBox";
import { chatService } from "@/utils/chatService";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ChatContainer({ 
  currentUser, 
  setSelectedProfile,
  onBack
}) {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [isStartingNewChat, setIsStartingNewChat] = useState(false);

  // Load user's conversations
  useEffect(() => {
    if (!currentUser?.user_id) return;

    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const { success, conversations: convs } = await chatService.getUserConversations(currentUser.user_id);
        
        if (success) {
          setConversations(convs);
          
          // Load messages for each conversation
          const messagesMap = {};
          for (const conv of convs) {
            const { success: msgSuccess, messages: msgs } = await chatService.getMessages(conv.id);
            if (msgSuccess && msgs.length > 0) {
              messagesMap[conv.id] = msgs;
            }
          }
          setMessages(messagesMap);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [currentUser]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!currentUser?.user_id || conversations.length === 0) return;

    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=in.(${conversations.map(c => c.id).join(',')})`
        },
        async (payload) => {
          const newMessage = payload.new;
          console.log("🆕 New message received:", newMessage);
          
          // Add message to state
          setMessages(prev => ({
            ...prev,
            [newMessage.conversation_id]: [
              ...(prev[newMessage.conversation_id] || []),
              newMessage
            ]
          }));

          // Update conversation last message time
          setConversations(prev => 
            prev.map(conv => 
              conv.id === newMessage.conversation_id
                ? { 
                    ...conv, 
                    last_message_at: newMessage.created_at,
                    lastMessage: {
                      text: newMessage.message_text,
                      senderId: newMessage.sender_id,
                      timestamp: newMessage.created_at,
                      read: newMessage.read,
                      delivered: newMessage.delivered
                    },
                    unreadCount: newMessage.sender_id !== currentUser.user_id 
                      ? (conv.unreadCount || 0) + 1 
                      : conv.unreadCount
                  }
                : conv
            )
          );

          // Mark as read if it's the active chat
          if (activeChat === newMessage.conversation_id && newMessage.sender_id !== currentUser.user_id) {
            await chatService.markMessagesAsRead(newMessage.conversation_id, currentUser.user_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, conversations, activeChat]);

  const handleSendMessage = async (message) => {
    if (!activeChat || !message.text.trim() || !currentUser?.user_id) return;

    try {
      const { success, message: sentMessage, error } = await chatService.sendMessage(
        activeChat,
        currentUser.user_id,
        message.text
      );

      if (success && sentMessage) {
        // Update messages state
        setMessages(prev => ({
          ...prev,
          [activeChat]: [...(prev[activeChat] || []), sentMessage]
        }));

        // Update conversation
        setConversations(prev => 
          prev.map(conv => 
            conv.id === activeChat
              ? { 
                  ...conv, 
                  last_message_at: sentMessage.created_at,
                  lastMessage: {
                    text: sentMessage.message_text,
                    senderId: sentMessage.sender_id,
                    timestamp: sentMessage.created_at,
                    read: sentMessage.read,
                    delivered: sentMessage.delivered
                  },
                  unreadCount: 0
                }
              : conv
          )
        );
      } else {
        console.error("Error sending message:", error);
      }
    } catch (error) {
      console.error("Exception sending message:", error);
    }
  };

  const handleSelectChat = async (conversationId) => {
    setActiveChat(conversationId);
    
    // Mark messages as read
    if (currentUser?.user_id) {
      await chatService.markMessagesAsRead(conversationId, currentUser.user_id);
      
      // Update UI
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
    
    // Load messages if not already loaded
    if (!messages[conversationId]) {
      const { success, messages: msgs } = await chatService.getMessages(conversationId);
      if (success) {
        setMessages(prev => ({ ...prev, [conversationId]: msgs }));
      }
    }
  };

  const handleStartNewChat = async (user) => {
    if (!currentUser?.user_id || !user.user_id) return;
    
    setIsStartingNewChat(true);
    
    try {
      console.log("🆕 Starting new chat with:", user.user_id);
      
      const { success, conversation, error } = await chatService.startNewConversation(
        currentUser.user_id,
        user.user_id
      );
      
      if (success && conversation) {
        console.log("✅ Conversation created:", conversation.id);
        
        // 1. Set activeChat immediately
        setActiveChat(conversation.id);
        
        // 2. Create conversation object
        const newConversation = {
          id: conversation.id,
          conversation_id: conversation.id,
          user1_id: conversation.user1_id,
          user2_id: conversation.user2_id,
          last_message_at: conversation.last_message_at,
          created_at: conversation.created_at,
          otherUser: {
            id: user.user_id,
            user_id: user.user_id,
            name: user.name,
            username: user.username,
            profile_image: user.profile_image || "/default-avatar.png",
            bio: user.bio || "",
            email: user.email || "",
            online: user.online || false,
            lastSeen: user.lastSeen || "never"
          },
          lastMessage: null,
          unreadCount: 0
        };
        
        // 3. Add to conversations list
        setConversations(prev => {
          // Remove if already exists
          const filtered = prev.filter(c => c.id !== conversation.id);
          return [newConversation, ...filtered];
        });
        
        // 4. Initialize empty messages
        setMessages(prev => ({
          ...prev,
          [conversation.id]: []
        }));
        
        // 5. Mark as read
        await chatService.markMessagesAsRead(conversation.id, currentUser.user_id);
        
        console.log("✅ Chat started successfully");
        
      } else {
        console.error("❌ Failed to start conversation:", error);
        alert("Failed to start conversation. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error starting chat:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsStartingNewChat(false);
    }
  };

  const handleBackToChatList = () => {
    setActiveChat(null);
  };

  const activeConversation = conversations.find(conv => conv.id === activeChat);
  const activeMessages = messages[activeChat] || [];

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
      </div>
    );
  }

  // 🚨 IMPORTANT FIX: Check if starting new chat
  if (isStartingNewChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Starting conversation...</p>
      </div>
    );
  }

  // 🚨 IMPORTANT FIX: Check if activeConversation exists
  if (activeChat && !activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading conversation...</p>
      </div>
    );
  }

  if (!activeChat) {
    return (
      <ChatList
        conversations={conversations}
        activeChat={activeChat}
        setActiveChat={handleSelectChat}
        currentUser={currentUser}
        compactMode={true}
        onStartNewChat={handleStartNewChat}
      />
    );
  }

  // Show chat box only when we have activeConversation
  return (
    <ChatBox
      conversation={{
        id: activeConversation.id,
        user: activeConversation.otherUser,
        messages: activeMessages.map(msg => ({
          id: msg.id,
          text: msg.message_text,
          senderId: msg.sender_id,
          timestamp: msg.created_at,
          delivered: msg.delivered,
          read: msg.read
        })),
        typing: typingUsers[activeChat] || false
      }}
      currentUser={currentUser}
      onSendMessage={handleSendMessage}
      onBack={handleBackToChatList}
      setSelectedProfile={setSelectedProfile}
      compactMode={true}
    />
  );
}