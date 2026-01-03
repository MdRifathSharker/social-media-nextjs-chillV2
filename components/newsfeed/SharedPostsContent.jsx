"use client";

import { useState, useEffect } from "react";
import FlexiblePost from "@/components/FlexiblePost";
import { getSharedPostsForUser } from "@/utils/shares";

export default function SharedPostsContent({ currentUser }) {
  const [sharedPosts, setSharedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user ID from props or localStorage
  const userId = currentUser?.user_id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null);
  const userName = currentUser?.name || (typeof window !== 'undefined' ? localStorage.getItem("userName") : "User");
  const userEmail = currentUser?.email || (typeof window !== 'undefined' ? localStorage.getItem("userEmail") : "");

  useEffect(() => {
    const fetchSharedPosts = async () => {
      if (!userId) {
        setError("Please login to view shared posts");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching shared posts for user:", userId);

        const result = await getSharedPostsForUser(userId);

        if (result.success) {
          console.log("Shared posts fetched:", result.posts);
          setSharedPosts(result.posts || []);
        } else {
          console.error("Error fetching shared posts:", result.error);
          setError(result.error || "Failed to load shared posts");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("An error occurred while loading shared posts");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPosts();
  }, [userId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared posts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg">
          <p className="text-red-700 dark:text-red-200">❌ {error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (sharedPosts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">📤 No posts shared with you yet</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Posts shared by others will appear here</p>
        </div>
      </div>
    );
  }

  // Display shared posts
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        📤 {sharedPosts.length} post{sharedPosts.length !== 1 ? 's' : ''} shared with you
      </div>

      {sharedPosts.map((share) => (
        <div key={share.share_id} className="space-y-2">
          {/* Shared by info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2 flex items-center gap-2">
            <img
              src={share.sharer?.profile_image || `https://i.pravatar.cc/24?u=${share.sharer?.email}`}
              alt="avatar"
              className="w-5 h-5 rounded-full object-cover"
            />
            <span>
              <strong>{share.sharer?.name}</strong>
              {share.share_type === 'all' ? ' shared with all followers' : ' shared with you'}
            </span>
          </div>

          {/* Post */}
          {share.posts && (
            <FlexiblePost
              name={share.posts.users?.name || "Unknown"}
              username={share.posts.users?.email?.split("@")[0] || "@user"}
              image={share.posts.image_url || null}
              caption={share.posts.content || null}
              profileImage={share.posts.users?.profile_image}
              postId={share.posts.id}
              currentUserId={userId}
            />
          )}
        </div>
      ))}
    </div>
  );
}
