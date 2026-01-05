// components/sidebar/lists/FollowingItem.jsx
"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { unfollowUser } from "@/utils/followService";

export default function FollowingItem({ user_id, name, avatar, headline, userData, setSelectedProfile }) {
  const [isFollowing, setIsFollowing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);

  const handleUnfollow = async () => {
    try {
      setIsLoading(true);
      const currentUserId = localStorage.getItem("userId");
      
      if (!currentUserId) {
        alert("Please login to unfollow");
        return;
      }

      const { success } = await unfollowUser(currentUserId, user_id);
      
      if (success) {
        setIsFollowing(false);
        setShowUnfollowConfirm(false);
      } else {
        alert("Failed to unfollow");
      }
    } catch (error) {
      console.error("Error unfollowing:", error);
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (userData && setSelectedProfile) {
      setSelectedProfile(userData);
    }
  };

  if (!isFollowing) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={avatar || "/default-avatar.png"}
              alt={name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-avatar.png";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                {name}
              </p>
            </div>
            {headline && (
              <p className="text-sm text-primary dark:text-accent font-semibold text-center">
                {headline}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewProfile}
            className="p-1.5 text-gray-500 hover:text-primary dark:hover:text-accent transition-colors"
            title="View Profile"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowUnfollowConfirm(true)}
            disabled={isLoading}
            className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 
                     bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 
                     rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Following"}
          </button>
        </div>
      </div>

      {showUnfollowConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
              Unfollow {name}?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Their posts will no longer show up in your feed.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnfollowConfirm(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 
                         bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                         rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnfollow}
                disabled={isLoading}
                className="flex-1 py-2.5 text-sm font-medium text-white 
                         bg-red-600 hover:bg-red-700 rounded-lg transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Unfollow"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
