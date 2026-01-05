// components/sidebar/FollowingSection.jsx
"use client";

import { useState, useEffect } from "react";
import FollowingItem from "./lists/FollowingItem";
import { getFollowing } from "@/utils/followService";

export default function FollowingSection({ currentUser, setSelectedProfile }) {
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = currentUser?.user_id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null);

  const fetchFollowingData = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching following for user:", id);
      const result = await getFollowing(id);
      
      console.log("Following result:", result);
      
      if (result.success) {
        setFollowing(result.following || []);
      } else {
        setError(result.error || "Failed to load following");
        console.error("Failed to fetch following:", result.error);
        setFollowing([]);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error fetching following:", err);
      setFollowing([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      setError("User not logged in");
      return;
    }
    fetchFollowingData(userId);
  }, [userId]);

  const handleRefresh = () => {
    const currentUserId = userId || localStorage.getItem("userId");
    if (currentUserId) {
      fetchFollowingData(currentUserId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Following</h3>
          <span className="text-xs text-gray-500">Loading...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Following</h3>
          <button
            onClick={handleRefresh}
            className="text-xs text-primary dark:text-accent hover:underline"
          >
            Retry
          </button>
        </div>
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p className="text-sm">Unable to load following list</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className="space-y-2 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Following</h3>
          <span className="text-xs text-gray-500">0 people</span>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">Not following anyone yet</p>
          <p className="text-xs mt-1">Start following people to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-2">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Following</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{following.length} people</span>
          <button
            onClick={handleRefresh}
            className="text-xs text-gray-500 hover:text-primary dark:hover:text-accent"
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {following.map((user) => (
          <FollowingItem
            key={user.user_id}
            user_id={user.user_id}
            name={user.name}
            avatar={user.profile_image || "/default-avatar.png"}
            headline={user.bio || "Member"}
            userData={user}
            setSelectedProfile={setSelectedProfile}
          />
        ))}
      </div>
    </div>
  );
}
