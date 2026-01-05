"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import FlexiblePost from "@/components/FlexiblePost";
import { getUserPosts } from "@/utils/posts";

const POSTS_PER_PAGE = 10;

export default function ProfilePostsSection({ userId, currentUserId }) {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Refs for infinite scroll
  const observerTarget = useRef(null);

  // Initial fetch
  useEffect(() => {
    fetchInitialPosts();
  }, [userId]);

  const fetchInitialPosts = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Fetching initial posts for profile user:", userId);

      const result = await getUserPosts(userId);

      if (result.success) {
        console.log("✅ Profile posts fetched:", result.posts?.length || 0);
        // Apply pagination manually to initial load
        const initialPosts = (result.posts || []).slice(0, POSTS_PER_PAGE);
        setPosts(initialPosts);
        setHasMore((result.posts?.length || 0) > POSTS_PER_PAGE);
        setOffset(POSTS_PER_PAGE);
      } else {
        console.error("Error fetching posts:", result.error);
        setPosts([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error:", err);
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchMorePosts = useCallback(async () => {
    if (!userId || !hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      console.log("📥 Loading more posts... offset:", offset);

      // Since getUserPosts returns all posts, we fetch all and handle pagination client-side
      const result = await getUserPosts(userId);

      if (result.success) {
        const allPosts = result.posts || [];
        const nextBatch = allPosts.slice(offset, offset + POSTS_PER_PAGE);
        
        console.log("✅ Loaded", nextBatch.length, "more posts");
        setPosts(prev => [...prev, ...nextBatch]);
        setHasMore(nextBatch.length === POSTS_PER_PAGE);
        setOffset(prev => prev + POSTS_PER_PAGE);
      } else {
        console.error("Error fetching more posts:", result.error);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more:", err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [userId, offset, hasMore, loadingMore]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchMorePosts, hasMore, loadingMore]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-600 dark:text-gray-400">
            This user hasn't posted yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Posts count */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        📊 {posts.length} post{posts.length !== 1 ? 's' : ''}
      </div>

      {/* Posts list */}
      {posts.map((post) => (
        <FlexiblePost
          key={post.id}
          name={post.users?.name || "Unknown"}
          username={post.users?.email?.split("@")[0] || "@user"}
          image={post.image_url || null}
          caption={post.content || null}
          profileImage={post.users?.profile_image}
          postId={post.id}
          currentUserId={currentUserId}
        />
      ))}

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {loadingMore ? "Loading more posts..." : "Scroll for more"}
            </p>
          </div>
        </div>
      )}

      {/* End of posts */}
      {!hasMore && posts.length > 0 && (
        <div className="flex justify-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            ✅ No more posts
          </p>
        </div>
      )}
    </div>
  );
}