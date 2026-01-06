"use client";

import { useState, useEffect, useCallback } from "react";
import FlexiblePost from "@/components/FlexiblePost";
import { getFollowingUsersPosts } from "@/utils/posts";

export default function AllPostsContent({ currentUser, setSelectedProfile }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const userId = currentUser?.user_id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null);

  const fetchPosts = useCallback(async (pageNum = 0) => {
    if (!userId) {
      setError("Please login to view posts");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching posts for page:", pageNum);
      const result = await getFollowingUsersPosts(userId, pageNum);

      if (result.success) {
        if (pageNum === 0) {
          setPosts(result.posts || []);
        } else {
          setPosts(prev => [...prev, ...(result.posts || [])]);
        }
        setHasMore(result.hasMore !== false);
      } else {
        setError(result.error || "Failed to load posts");
        setPosts([]);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred while loading posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setPage(0);
    fetchPosts(0);
  }, [userId, fetchPosts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleUserClick = (user) => {
    if (setSelectedProfile && user) {
      setSelectedProfile(user);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-lg">
          <p className="text-red-700 dark:text-red-200">❌ {error}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">📰 No posts yet</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Follow people to see their posts!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FlexiblePost
          key={post.id}
          name={post.users?.name || "Unknown"}
          username={`@${post.users?.email?.split("@")[0] || "user"}`}
          image={post.image_url || null}
          caption={post.content || null}
          profileImage={post.users?.profile_image}
          postId={post.id}
          currentUserId={userId}
          onUserClick={handleUserClick}
          postAuthor={post.users}
          createdAt={post.created_at}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-primary dark:bg-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
