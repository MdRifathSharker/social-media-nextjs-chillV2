"use client";

import { useState, useEffect } from "react";
import FlexiblePost from "@/components/FlexiblePost";
import { getUserPosts } from "@/utils/posts";
import { getPostsSharedByUser } from "@/utils/shares";

export default function SharedPostsContent({ currentUser }) {
  const [allItems, setAllItems] = useState([]); // Combined posts + shared posts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = currentUser?.user_id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null);

  useEffect(() => {
    const fetchAllContent = async () => {
      if (!userId) {
        setError("Please login");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("📥 Fetching user's posts and shares:", userId);

        // Fetch both regular posts AND shared posts
        const [postsResult, sharedResult] = await Promise.all([
          getUserPosts(userId),
          getPostsSharedByUser(userId)
        ]);

        console.log("📥 Posts result:", postsResult);
        console.log("📤 Shared posts result:", sharedResult);

        // Combine them
        const combined = [];

        // Add regular posts
        if (postsResult.success && postsResult.posts) {
          postsResult.posts.forEach(post => {
            combined.push({
              type: 'post',
              id: post.id,
              data: post,
              timestamp: post.created_at
            });
          });
        }

        // Add shared posts
        if (sharedResult.success && sharedResult.posts) {
          sharedResult.posts.forEach(share => {
            if (share.posts) {
              combined.push({
                type: 'share',
                id: share.share_id,
                data: share,
                timestamp: share.created_at
              });
            }
          });
        }

        // Sort by timestamp (newest first)
        combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.log(`✅ Combined ${combined.length} items (posts + shares)`);
        setAllItems(combined);

      } catch (err) {
        console.error("❌ Error:", err);
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchAllContent();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg">
          <p className="text-red-700 dark:text-red-200">❌ {error}</p>
        </div>
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">📭 No posts or shared content</p>
          <p className="text-gray-500 text-sm mt-2">Create or share posts to see them here</p>
        </div>
      </div>
    );
  }

  // Display combined timeline
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        📊 {allItems.length} item{allItems.length !== 1 ? 's' : ''} (posts + shares)
      </div>

      {allItems.map((item) => {
        if (item.type === 'post') {
          // Regular post
          const post = item.data;
          const author = post.users;

          return (
            <div key={`post-${item.id}`} className="relative">
              <FlexiblePost
                name={author?.name || "Unknown"}
                username={author?.email?.split("@")[0] || "@user"}
                image={post.image_url || null}
                caption={post.content || null}
                profileImage={author?.profile_image}
                postId={post.id}
                currentUserId={userId}
              />
            </div>
          );
        } else if (item.type === 'share') {
          // Shared post
          const share = item.data;
          const post = share.posts;
          const author = post?.users;

          if (!post) return null;

          return (
            <div key={`share-${item.id}`} className="relative">
              {/* Badge showing this is a shared post */}
              <div className="absolute top-2 right-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-semibold z-10">
                {share.share_type === 'all' ? '📢 Shared' : '🔗 Shared'}
              </div>

              <FlexiblePost
                name={author?.name || "Unknown"}
                username={author?.email?.split("@")[0] || "@user"}
                image={post.image_url || null}
                caption={post.content || null}
                profileImage={author?.profile_image}
                postId={post.id}
                currentUserId={userId}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
