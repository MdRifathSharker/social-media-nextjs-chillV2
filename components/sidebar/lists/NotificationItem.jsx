"use client";

import { useState } from "react";
import { notificationService } from "@/utils/notificationService";

export default function NotificationItem({ 
  text, 
  time, 
  type, 
  isRead, 
  notificationId,
  actor,
  post,
  onMarkAsRead,
  onDelete
}) {
  const [isDeleted, setIsDeleted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async () => {
    if (!isRead && onMarkAsRead) {
      await onMarkAsRead(notificationId);
    }
    console.log('Notification clicked:', type);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const { success } = await notificationService.deleteNotification(notificationId);
    if (success) {
      setIsDeleted(true);
      if (onDelete) onDelete(notificationId);
    }
  };

  if (isDeleted) return null;

  // Different styles for follow vs unfollow
  const getNotificationStyle = () => {
    switch(type) {
      case 'follow':
        return {
          borderColor: '#3EB489', // Green for follow
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        };
      case 'unfollow':
        return {
          borderColor: '#EF4444', // Red for unfollow
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        };
      case 'like':
        return {
          borderColor: '#3B82F6', // Blue for like
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
      case 'dislike':
        return {
          borderColor: '#EF4444', // Red for dislike
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        };
      default:
        return {
          borderColor: '#3EB489',
          bgColor: !isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        };
    }
  };

  const style = getNotificationStyle();

  // Get icon based on type
  const getIcon = () => {
    switch(type) {
      case 'follow': return '';
      case 'unfollow': return '';
      case 'like': return '';
      case 'dislike': return '';
      case 'comment': return '';
      default: return '';
    }
  };

  return (
    <div
      className={`flex flex-col p-3 rounded-lg cursor-pointer transition border-l-4 relative group ${
        !isRead ? style.bgColor : ''
      }`}
      style={{ borderColor: style.borderColor }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Unread indicator */}
      {!isRead && (
        <div 
          className="absolute top-3 left-3 w-2 h-2 rounded-full"
          style={{ backgroundColor: style.borderColor }}
        ></div>
      )}

      <div className="flex items-start ml-4">
        {actor?.profile_image && (
          <img 
            src={actor.profile_image} 
            alt={actor.name}
            className="w-8 h-8 rounded-full mr-3"
          />
        )}
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="text-sm">{getIcon()}</span>
              <span className={`text-sm font-medium ${!isRead ? 'font-semibold' : ''}`}>
                {text}
              </span>
            </div>
            {isHovered && (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 text-xs px-2 py-1"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs opacity-70">{time}</span>
            
            {/* Notification type badge with color coding */}
            {type && (
              <span 
                className={`text-xs px-2 py-0.5 rounded-full ${
                  type === 'follow' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  type === 'unfollow' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  type === 'like' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {type}
              </span>
            )}
          </div>

          {/* Post preview for post-related notifications
          {post?.content && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
              {post.content.substring(0, 100)}...
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}