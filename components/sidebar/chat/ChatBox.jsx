// components/sidebar/chat/ChatBox.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Smile, Paperclip, ChevronLeft, MoreVertical, Check, CheckCheck } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ChatBox({ 
  conversation, 
  currentUser, 
  onSendMessage,
  onBack,
  setSelectedProfile,
  compactMode = true
}) {
  const [newMessage, setNewMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [conversation.messages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const message = {
      id: crypto.randomUUID(), // ✅ Browser built-in UUID
      text: newMessage.trim(),
      senderId: currentUser.user_id,
      timestamp: new Date().toISOString(),
      delivered: true,
      read: false
    };
    
    onSendMessage(message);
    setNewMessage("");
    
    // Stop typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  const handleTyping = async () => {
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Send typing indicator to other user
    if (conversation.id && currentUser?.user_id) {
      try {
        await supabase.channel(`typing-${conversation.id}`).send({
          type: 'broadcast',
          event: 'typing',
          payload: { user_id: currentUser.user_id }
        });
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    }
    
    // Set new timeout to stop typing after 1 second
    const timeout = setTimeout(() => {
      // Typing stopped
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const handleKeyPress = (e) => {
    handleTyping();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "";
    }
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  const MessageStatus = ({ delivered, read }) => {
    if (read) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    } else if (delivered) {
      return <Check className="w-3 h-3 text-gray-400" />;
    }
    return <Check className="w-3 h-3 text-gray-300" />;
  };

  const handleProfileClick = () => {
    if (conversation?.user && setSelectedProfile) {
      setSelectedProfile({
        user_id: conversation.user.id,
        name: conversation.user.name,
        profile_image: conversation.user.profile_image,
        email: conversation.user.email,
        online: conversation.user.online,
        lastSeen: conversation.user.lastSeen
      });
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this chat?")) {
      console.log("Clear chat for conversation:", conversation.id);
      setShowMenu(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* Clickable User Info */}
          <button 
            onClick={handleProfileClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <img
                src={conversation.user.profile_image || "/default-avatar.png"}
                alt={conversation.user.name}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
              />
              {conversation.user.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
              )}
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                {conversation.user.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {conversation.user.online ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </span>
                ) : `Last seen ${conversation.user.lastSeen || "recently"}`}
              </p>
            </div>
          </button>
        </div>
        
        {/* Three Dots Menu */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <button 
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                View Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50/50 dark:bg-gray-950/50">
        {conversation.messages.map((message, index) => {
          const showDate = index === 0 || 
            new Date(message.timestamp).toDateString() !== 
            new Date(conversation.messages[index - 1].timestamp).toDateString();
          
          return (
            <div key={`${message.id}-${index}`}> {/* ✅ index যোগ করুন */}
              {showDate && (
                <div className="text-center my-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              )}
              
              <div className={`mb-3 ${message.senderId === currentUser.user_id ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block max-w-[80%] rounded-2xl p-3 ${
                    message.senderId === currentUser.user_id
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm break-words">{message.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${
                    message.senderId === currentUser.user_id ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                    {message.senderId === currentUser.user_id && (
                      <MessageStatus delivered={message.delivered} read={message.read} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing Indicator */}
        {conversation.typing && (
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-bl-none p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-3 pr-12 bg-gray-100 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            
            {newMessage.trim() && (
              <button
                onClick={handleSendMessage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
      </div>
    </div>
  );
}