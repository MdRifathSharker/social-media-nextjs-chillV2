// components/othersprofile/ProfileHeader.jsx
"use client";

import { useState, useEffect } from "react";
import { getFollowersCount } from "@/utils/shares";

export default function ProfileHeader({ user, isFollowing: initialIsFollowing, onFollowToggle, isLoading }) {
  const [optimisticFollowing, setOptimisticFollowing] = useState(initialIsFollowing);
  const [optimisticFollowers, setOptimisticFollowers] = useState(user?.followers_count || 0);

  // Update optimistic state when initial follow state changes
  useEffect(() => {
    console.log("ProfileHeader: isFollowing updated to:", initialIsFollowing);
    setOptimisticFollowing(initialIsFollowing || false);
  }, [initialIsFollowing]);

  // Update follower count when user changes
  useEffect(() => {
    if (!user?.user_id) return;

    const fetchFollowersCount = async () => {
      try {
        console.log("Fetching followers count for:", user.user_id);
        const result = await getFollowersCount(user.user_id);
        
        if (result.success) {
          console.log("Followers count fetched:", result.count);
          setOptimisticFollowers(result.count || 0);
        }
      } catch (error) {
        console.error("Error fetching followers count:", error);
        setOptimisticFollowers(user?.followers_count || 0);
      }
    };

    fetchFollowersCount();
  }, [user?.user_id]);

  const handleFollowClick = async () => {
    if (!onFollowToggle) return;
    
    // Optimistic update
    const newFollowingState = !optimisticFollowing;
    const newFollowersCount = newFollowingState ? optimisticFollowers + 1 : Math.max(0, optimisticFollowers - 1);
    
    setOptimisticFollowing(newFollowingState);
    setOptimisticFollowers(newFollowersCount);
    
    // Call actual API
    await onFollowToggle();
  };

  return (
    <>
      {/* Profile Image */}
      <div className="w-32 h-32 mb-4 relative group">
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-primary/20 dark:border-accent/20 
                      shadow-lg group-hover:border-primary dark:group-hover:border-accent transition-all duration-300">
          <img
            src={user.profile_image || "/default-avatar.png"}
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-avatar.png";
            }}
          />
        </div>
      </div>
      
      {/* Name and Bio */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-2">
          {user.name}
        </h2>
        {user.bio && (
          <p className="text-sm text-primary dark:text-accent font-semibold text-center">
            {user.bio}
          </p>
        )}
      </div>

      {/* Stats and Follow Button */}
      <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
        {/* Followers with badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <span className="text-base font-bold text-primary dark:text-accent">
            {optimisticFollowers.toLocaleString()}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">Followers</span>
        </div>

        {/* Following with badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <span className="text-base font-bold text-primary dark:text-accent">
            {(user.following_count || 0).toLocaleString()}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">Following</span>
        </div>

        {/* Follow Button */}
        <button
          onClick={handleFollowClick}
          disabled={isLoading}
          className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
            optimisticFollowing
              ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              : "bg-primary dark:bg-accent text-white hover:bg-primary/90 dark:hover:bg-accent/90"
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Processing...
            </span>
          ) : optimisticFollowing ? (
            "✓ Following"
          ) : (
            "+ Follow"
          )}
        </button>
      </div>
    </>
  );
}
