// components/sidebar/chat/ChatContainer.jsx - FULL FIXED CODE
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  
  // ✅ Refs to track subscriptions
  const channelRef = useRef(null);

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

  // ✅ Function to setup realtime subscription
  const setupRealtimeSubscription = useCallback(() => {
    if (!currentUser?.user_id || conversations.length === 0) return;

    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Get all conversation IDs
    const conversationIds = conversations.map(c => c.id);
    
    // If no conversations yet, don't setup subscription
    if (conversationIds.length === 0) {
      console.log("No conversations to subscribe to");
      return;
    }

    console.log("Setting up subscription for conversations:", conversationIds);

    // Create new subscription
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=in.(${conversationIds.join(',')})`
        },
        async (payload) => {
          const newMessage = payload.new;
          console.log("🆕 New message received via realtime:", newMessage);
          
          // ✅ Update messages state IMMEDIATELY
          setMessages(prev => {
            const existingMessages = prev[newMessage.conversation_id] || [];
            
            // Check if message already exists (prevent duplicates)
            const alreadyExists = existingMessages.some(msg => msg.id === newMessage.id);
            if (alreadyExists) {
              console.log("Message already exists, skipping:", newMessage.id);
              return prev;
            }
            
            return {
              ...prev,
              [newMessage.conversation_id]: [
                ...existingMessages,
                newMessage
              ]
            };
          });

          // ✅ Update conversation last message time
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

          // ✅ Mark as read if it's the active chat
          if (activeChat === newMessage.conversation_id && newMessage.sender_id !== currentUser.user_id) {
            await chatService.markMessagesAsRead(newMessage.conversation_id, currentUser.user_id);
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentUser, conversations, activeChat]);

  // ✅ Setup realtime subscription when conversations change
  useEffect(() => {
    setupRealtimeSubscription();
  }, [setupRealtimeSubscription]);

  // ✅ Function to reload conversations (call this when new conversation is created)
  const reloadConversations = useCallback(async () => {
    if (!currentUser?.user_id) return;
    
    try {
      setIsLoading(true);
      const { success, conversations: convs } = await chatService.getUserConversations(currentUser.user_id);
      
      if (success) {
        console.log("Reloaded conversations:", convs.length);
        setConversations(convs);
        
        // Load messages for each conversation
        const messagesMap = {};
        for (const conv of convs) {
          const { success: msgSuccess, messages: msgs } = await chatService.getMessages(conv.id);
          if (msgSuccess && msgs.length > 0) {
            messagesMap[conv.id] = msgs;
          } else {
            messagesMap[conv.id] = [];
          }
        }
        setMessages(messagesMap);
        
        // ✅ Re-setup subscription with new conversations
        setupRealtimeSubscription();
      }
    } catch (error) {
      console.error("Error reloading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, setupRealtimeSubscription]);

  const handleSendMessage = async (message) => {
    if (!activeChat || !message.text.trim() || !currentUser?.user_id) return;

    try {
      const { success, message: sentMessage, error } = await chatService.sendMessage(
        activeChat,
        currentUser.user_id,
        message.text
      );

      if (success && sentMessage) {
        console.log("✅ Message sent successfully:", sentMessage.id);
        // Real-time subscription will handle the update
      } else {
        console.error("Error sending message:", error);
      }
    } catch (error) {
      console.error("Exception sending message:", error);
    }
  };

  const handleSelectChat = async (conversationId) => {
    console.log("Selecting chat:", conversationId);
    setActiveChat(conversationId);
    
    // Load messages if not already loaded
    if (!messages[conversationId] || messages[conversationId].length === 0) {
      const { success, messages: msgs } = await chatService.getMessages(conversationId);
      if (success) {
        setMessages(prev => ({ ...prev, [conversationId]: msgs }));
      }
    }
    
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
  };

  const handleStartNewChat = async (user) => {
    if (!currentUser?.user_id || !user.user_id) return;
    
    setIsStartingNewChat(true);
    console.log("🆕 Starting new chat with user:", user.user_id);
    
    try {
      // 1. Create new conversation
      const { success, conversation, error } = await chatService.startNewConversation(
        currentUser.user_id,
        user.user_id
      );
      
      if (success && conversation) {
        console.log("✅ Conversation created:", conversation.id);
        
        // 2. Set active chat immediately
        setActiveChat(conversation.id);
        
        // 3. Reload ALL conversations to get the new one
        await reloadConversations();
        
        console.log("✅ Chat started successfully, activeChat:", conversation.id);
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

  if (isStartingNewChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Starting conversation...</p>
      </div>
    );
  }

  // ✅ Show loading state if active chat is selected but conversation not loaded yet
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
        onReloadConversations={reloadConversations}
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