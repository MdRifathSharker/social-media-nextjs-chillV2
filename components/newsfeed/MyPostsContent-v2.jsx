"use client";

import { useState, useEffect } from "react";
import FlexiblePost from "@/components/FlexiblePost";
import { getUserPosts, deletePost } from "@/utils/posts";

export default function MyPostsContentV2({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, postId: null });
  const [deleting, setDeleting] = useState(false);

  // Get user ID from props or localStorage
  const userId = currentUser?.user_id || (typeof window !== 'undefined' ? localStorage.getItem("userId") : null);
  const userName = currentUser?.name || (typeof window !== 'undefined' ? localStorage.getItem("userName") : "User");
  const userEmail = currentUser?.email || (typeof window !== 'undefined' ? localStorage.getItem("userEmail") : "");

  // Fetch posts
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

  useEffect(() => {
    fetchMyPosts();
  }, [userId]);

  // Handle delete confirmation
  const handleDeleteClick = (postId) => {
    setDeleteConfirm({ show: true, postId });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      setDeleting(true);
      const result = await deletePost(deleteConfirm.postId, userId);

      if (result.success) {
        // Remove post from state
        setPosts(posts.filter(post => post.id !== deleteConfirm.postId));
        setDeleteConfirm({ show: false, postId: null });
      } else {
        alert(result.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting");
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, postId: null });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">â³</div>
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
          <p className="text-red-700 dark:text-red-200">âŒ {error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">ðŸ“ You haven't created any posts yet</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Go to "Create Post" to share something!</p>
        </div>
      </div>
    );
  }

  // Display posts
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        ðŸ“Š You have {posts.length} post{posts.length !== 1 ? 's' : ''}
      </div>

      {posts.map((post) => (
        <FlexiblePost
          key={post.id}
          name={post.users?.name || userName}
          username={post.users?.email?.split("@")[0] || userEmail?.split("@")[0] || "@user"}
          image={post.image_url || null}
          caption={post.content || null}
          profileImage={post.users?.profile_image}
          postId={post.id}
          currentUserId={userId}
          onDelete={() => handleDeleteClick(post.id)}
          postAuthor={post.users}
          createdAt={post.created_at}
        />
      ))}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              ðŸ—‘ï¸ Delete Post?
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 transition"
              >
                No, Cancel
              </button>
              
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2 transition"
              >
                {deleting ? (
                  <>
                    <span className="animate-spin">â³</span> Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
