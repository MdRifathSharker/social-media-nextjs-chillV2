"use client";

import { useState, useEffect } from "react";
import ShareModal from "@/components/ShareModal";
import { toggleLike, getLikeCount, isPostLikedByUser, addComment, getComments, deleteComment } from "@/utils/posts";
import { getShareCount } from "@/utils/shares";

export default function FlexiblePost({ name, username, image, caption, onDelete, profileImage, postId, currentUserId }) {
  // Like states
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  // Comment states
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [addingComment, setAddingComment] = useState(false);

  // Share Modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [loadingShareCount, setLoadingShareCount] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }, []);

  // Theme colors
  const upvoteColor = darkMode ? "#4cc297" : "#3EB489";
  const downvoteColor = "#DC143c";

  // Check if image exists
  const hasImage = image && !image.includes("placeholder");

  // Load like data on mount
  useEffect(() => {
    const loadLikeData = async () => {
      if (!postId || !currentUserId) return;

      try {
        const [likeCountResult, likedResult] = await Promise.all([
          getLikeCount(postId),
          isPostLikedByUser(postId, currentUserId)
        ]);

        if (likeCountResult.success) {
          setLikes(likeCountResult.count);
        }

        if (likedResult.success) {
          setIsLiked(likedResult.liked);
        }
      } catch (error) {
        console.error("Error loading likes:", error);
      }
    };

    loadLikeData();
  }, [postId, currentUserId]);

  // Load share count on mount
  useEffect(() => {
    const loadShareCount = async () => {
      if (!postId) return;

      try {
        setLoadingShareCount(true);
        const result = await getShareCount(postId);

        if (result.success) {
          setShareCount(result.count || 0);
        }
      } catch (error) {
        console.error("Error loading share count:", error);
      } finally {
        setLoadingShareCount(false);
      }
    };

    loadShareCount();
  }, [postId]);

  // Load comments on mount and when showComments changes
  useEffect(() => {
    const loadComments = async () => {
      if (!postId) return;

      try {
        setLoadingComments(true);
        const result = await getComments(postId);

        if (result.success) {
          setComments(result.comments);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    loadComments();
  }, [postId]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!postId || !currentUserId || liking) return;

    try {
      setLiking(true);
      const result = await toggleLike(postId, currentUserId);

      if (result.success) {
        if (result.liked) {
          setLikes(likes + 1);
          setIsLiked(true);
        } else {
          setLikes(likes - 1);
          setIsLiked(false);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLiking(false);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!postId || !currentUserId || !commentText.trim() || addingComment) return;

    try {
      setAddingComment(true);
      const result = await addComment(postId, currentUserId, commentText);

      if (result.success) {
        setComments([...comments, result.comment]);
        setCommentText("");
      } else {
        alert(result.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!currentUserId || !confirm("Delete this comment?")) return;

    try {
      const result = await deleteComment(commentId, currentUserId);

      if (result.success) {
        setComments(comments.filter(c => c.comment_id !== commentId));
      } else {
        alert(result.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  // Share
  const handleShare = () => {
    if (!currentUserId) {
      alert("Please login to share posts");
      return;
    }
    setShowShareModal(true);
  };

  // Handle successful share
  const handleShareSuccess = () => {
    // Increment share count
    setShareCount(shareCount + 1);
  };

  return (
    <div className="bg-accent dark:bg-accent-dark rounded-2xl shadow p-4 relative">
      {/* Delete button (if provided) */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg z-10 transition"
          title="Delete post"
        >
          ✕
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={profileImage || `https://i.pravatar.cc/40?u=${username}`}
          className="w-10 h-10 rounded-full object-cover"
          alt="avatar"
        />
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm opacity-70">{username}</p>
        </div>
      </div>

      {/* Caption - ONLY if it exists */}
      {caption && caption !== "(No caption)" && (
        <p className="mt-2 mb-3">{caption}</p>
      )}

      {/* Image - ONLY if it exists and is not placeholder */}
      {hasImage && (
        <img
          src={image}
          alt="post"
          className="w-full h-[320px] object-cover rounded-xl mb-3"
        />
      )}

      {/* Actions */}
      <div className="flex gap-6 mt-4 text-sm items-center">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={liking || !currentUserId}
          className="flex items-center gap-1 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill={isLiked ? upvoteColor : "none"}
            viewBox="0 0 24 24"
            stroke={upvoteColor}
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4l-8 12h16l-8-12z" />
          </svg>
          {likes}
        </button>

        {/* Comments button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 opacity-70 hover:opacity-100"
        >
          💬 {comments.length}
        </button>

        {/* Share button with count */}
        <button
          onClick={handleShare}
          disabled={!currentUserId}
          className="flex items-center gap-1 opacity-70 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📤 {shareCount}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 space-y-3 border-t border-gray-300 dark:border-gray-700 pt-3">
          {/* Add comment input */}
          {currentUserId && (
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleAddComment}
                disabled={addingComment || !commentText.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {addingComment ? "..." : "Post"}
              </button>
            </div>
          )}

          {/* Loading comments */}
          {loadingComments && (
            <div className="text-center text-gray-500 text-sm">Loading comments...</div>
          )}

          {/* Display comments */}
          {!loadingComments && comments.length === 0 && (
            <div className="text-center text-gray-500 text-sm">No comments yet</div>
          )}

          {comments.map((comment) => (
            <div key={comment.comment_id} className="text-sm bg-white dark:bg-gray-800 rounded-lg px-3 py-2 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <img
                    src={comment.users?.profile_image || `https://i.pravatar.cc/32?u=${comment.users?.email}`}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-semibold text-xs">{comment.users?.name}</span>
                </div>
                {currentUserId === comment.user_id && (
                  <button
                    onClick={() => handleDeleteComment(comment.comment_id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                    title="Delete comment"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.comment_text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          postId={postId}
          currentUserId={currentUserId}
          onClose={() => setShowShareModal(false)}
          onShareSuccess={handleShareSuccess}
        />
      )}
    </div>
  );
}
