"use client";

import { useState, useEffect } from "react";
import Post from "@/components/post";
import { getUserPosts } from "@/utils/posts";

export default function MyPostsContentV2({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user ID from props or localStorage
  const userId = currentUser?.user_id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null);
  const userName = currentUser?.name || (typeof window !== 'undefined' ? localStorage.getItem("userName") : "User");
  const userEmail = currentUser?.email || (typeof window !== 'undefined' ? localStorage.getItem("userEmail") : "");

  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!userId) {
        setError("Please login to view your posts");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching posts for user:", userId);

        const result = await getUserPosts(userId);

        if (result.success) {
          console.log("Posts fetched:", result.posts);
          setPosts(result.posts || []);
        } else {
          console.error("Error fetching posts:", result.error);
          setError(result.error || "Failed to load posts");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("An error occurred while loading posts");
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [userId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading your posts...</p>
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
  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">📝 You haven't created any posts yet</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Go to "Create Post" to share something!</p>
        </div>
      </div>
    );
  }

  // Display posts
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        📊 You have {posts.length} post{posts.length !== 1 ? 's' : ''}
      </div>

      {posts.map((post) => (
        <Post
          key={post.id}
          name={userName}
          username={userEmail?.split("@")[0] || "@user"}
          image={post.image_url || "https://via.placeholder.com/500x300?text=No+Image"}
          caption={post.content}
        />
      ))}
    </div>
  );
}