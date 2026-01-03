"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import FlexiblePost from "@/components/FlexiblePost";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.postId;

  const [post, setPost] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current logged in user
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const loadPost = async () => {
      try {
        console.log("Loading post with ID:", postId);
        setLoading(true);
        setError(null);

        if (!postId) {
          setError("No post ID provided");
          setLoading(false);
          return;
        }

        // Fetch post data
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (postError) {
          console.error("Post fetch error:", postError);
          setError("Post not found");
          setLoading(false);
          return;
        }

        if (!postData) {
          setError("Post not found");
          setLoading(false);
          return;
        }

        console.log("Post loaded:", postData);
        setPost(postData);

        // Fetch user data separately
        if (postData.user_id) {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('user_id, name, email, profile_image')
            .eq('user_id', postData.user_id)
            .single();

          if (userError) {
            console.error("User fetch error:", userError);
            // Don't fail if user fetch fails
            setUserData(null);
          } else {
            console.log("User loaded:", user);
            setUserData(user);
          }
        }

      } catch (err) {
        console.error("Error loading post:", err);
        setError("Failed to load post: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
          <p className="text-xs text-gray-500 mt-2">Post ID: {postId}</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">❌ {error || "Post not found"}</p>
          <p className="text-xs text-gray-500 mb-4">Post ID: {postId}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold">Post</h1>
        </div>
      </div>

      {/* Post Detail */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4">
          {/* Author Info */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <img
              src={userData?.profile_image || `https://i.pravatar.cc/48?u=${userData?.email}`}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h2 className="font-bold">{userData?.name || "Unknown User"}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">@{userData?.email?.split("@")[0] || "user"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
            {userData?.user_id && (
              <button
                onClick={() => router.push(`/profile/${userData.user_id}`)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
              >
                View Profile
              </button>
            )}
          </div>

          {/* Post Content */}
          <div className="mb-6">
            {post.content && (
              <p className="text-lg mb-4">{post.content}</p>
            )}

            {post.image_url && (
              <img
                src={post.image_url}
                alt="post"
                className="w-full max-h-96 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Post Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700 text-center text-sm">
            <div>
              <p className="font-bold">{post.likes || 0}</p>
              <p className="text-gray-600 dark:text-gray-400">Likes</p>
            </div>
            <div>
              <p className="font-bold">{post.comments || 0}</p>
              <p className="text-gray-600 dark:text-gray-400">Comments</p>
            </div>
            <div>
              <p className="font-bold">0</p>
              <p className="text-gray-600 dark:text-gray-400">Shares</p>
            </div>
          </div>
        </div>

        {/* Interactive Post Component */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">Interact with this post:</h3>
          {userData && (
            <FlexiblePost
              name={userData.name}
              username={userData.email?.split("@")[0] || "@user"}
              image={post.image_url || null}
              caption={post.content || null}
              profileImage={userData.profile_image}
              postId={post.id}
              currentUserId={currentUserId}
            />
          )}
          {!userData && (
            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg text-yellow-700 dark:text-yellow-200">
              Post loaded but user data unavailable. You can still interact with the post.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
