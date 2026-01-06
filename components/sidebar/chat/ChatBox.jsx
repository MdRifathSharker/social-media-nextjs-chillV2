// components/sidebar/chat/ChatBox.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Smile, Paperclip, ChevronLeft, MoreVertical } from "lucide-react";
import ChatHeader from "./ChatHeader";

export default function ChatBox({ 
  conversation, 
  currentUser, 
  onSendMessage,
  onBack,
  setSelectedProfile,
  compactMode = true
}) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [conversation.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      senderId: currentUser.user_id,
      timestamp: new Date().toISOString(),
      delivered: true,
      read: false
    };
    
    onSendMessage(message);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
            onClick={() => {
              if (conversation?.user && setSelectedProfile) {
                setSelectedProfile({
                  user_id: conversation.user.id,
                  name: conversation.user.name,
                  profile_image: conversation.user.avatar,
                  email: conversation.user.email
                });
              }
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src={conversation.user.avatar}
              alt={conversation.user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-left">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                {conversation.user.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {conversation.user.online ? "Online" : "Offline"}
              </p>
            </div>
          </button>
        </div>
        
        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50/50 dark:bg-gray-950/50">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 ${message.senderId === currentUser.user_id ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-[80%] rounded-2xl p-3 ${
                message.senderId === currentUser.user_id
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm break-words">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">{formatTime(message.timestamp)}</p>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
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
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Smile className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
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
    </div>
  );
}