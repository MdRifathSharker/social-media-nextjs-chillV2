"use client";

import { useState, useEffect } from "react";
import ShareModal from "@/components/ShareModal";
import { 
  toggleLike, 
  getLikeCount, 
  isPostLikedByUser, 
  addComment, 
  getComments, 
  deleteComment, 
  toggleDislike, 
  getDislikeCount, 
  isPostDislikedByUser,
  getLikesUsers,
  getDislikesUsers
} from "@/utils/posts";
import { getShareCount } from "@/utils/shares";

// Helper function to format timestamp
const formatTimestamp = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  
  // For anything older than 1 day, show date AND time
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export default function FlexiblePost({ 
  name, 
  username, 
  image, 
  caption, 
  onDelete, 
  profileImage, 
  postId, 
  currentUserId, 
  onUserClick,
  createdAt, // Accept created_at prop
  postAuthor // NEW: Add post author data
}) {
  // Like states
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  // Dislike states
  const [dislikes, setDislikes] = useState(0);
  const [isDisliked, setIsDisliked] = useState(false);
  const [disliking, setDisliking] = useState(false);

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

  // Hover tooltip states
  const [showLikesHover, setShowLikesHover] = useState(false);
  const [showDislikesHover, setShowDislikesHover] = useState(false);
  const [likesUsers, setLikesUsers] = useState([]);
  const [dislikesUsers, setDislikesUsers] = useState([]);
  const [loadingLikesUsers, setLoadingLikesUsers] = useState(false);
  const [loadingDislikesUsers, setLoadingDislikesUsers] = useState(false);

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

  const hasImage = image && !image.includes("placeholder");

  // Load like and dislike data on mount
  useEffect(() => {
    const loadLikeDislikeData = async () => {
      if (!postId || !currentUserId) return;

      try {
        const [likeCountResult, likedResult, dislikeCountResult, dislikedResult] = await Promise.all([
          getLikeCount(postId),
          isPostLikedByUser(postId, currentUserId),
          getDislikeCount(postId),
          isPostDislikedByUser(postId, currentUserId)
        ]);

        if (likeCountResult.success) {
          setLikes(likeCountResult.count);
        }

        if (likedResult.success) {
          setIsLiked(likedResult.liked);
        }

        if (dislikeCountResult.success) {
          setDislikes(dislikeCountResult.count);
        }

        if (dislikedResult.success) {
          setIsDisliked(dislikedResult.disliked);
        }
      } catch (error) {
        console.error("Error loading likes/dislikes:", error);
      }
    };

    loadLikeDislikeData();
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

  // Load comments
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
      
      // If currently disliked, remove dislike first
      if (isDisliked) {
        const dislikeResult = await toggleDislike(postId, currentUserId);
        if (dislikeResult.success) {
          setDislikes(Math.max(0, dislikes - 1));
          setIsDisliked(false);
        }
      }
      
      // Then toggle like
      const result = await toggleLike(postId, currentUserId);

      if (result.success) {
        if (result.liked) {
          setLikes(likes + 1);
          setIsLiked(true);
        } else {
          setLikes(Math.max(0, likes - 1));
          setIsLiked(false);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLiking(false);
    }
  };

  // Handle dislike/undislike
  const handleDislike = async () => {
    if (!postId || !currentUserId || disliking) return;

    try {
      setDisliking(true);
      
      // If currently liked, remove like first
      if (isLiked) {
        const likeResult = await toggleLike(postId, currentUserId);
        if (likeResult.success) {
          setLikes(Math.max(0, likes - 1));
          setIsLiked(false);
        }
      }
      
      // Then toggle dislike
      const result = await toggleDislike(postId, currentUserId);

      if (result.success) {
        if (result.disliked) {
          setDislikes(dislikes + 1);
          setIsDisliked(true);
        } else {
          setDislikes(Math.max(0, dislikes - 1));
          setIsDisliked(false);
        }
      }
    } catch (error) {
      console.error("Error toggling dislike:", error);
    } finally {
      setDisliking(false);
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

  const handleShareSuccess = () => {
    setShareCount(shareCount + 1);
  };

  // Handle likes hover
  const handleLikesMouseEnter = async () => {
    if (!postId || loadingLikesUsers || likesUsers.length > 0) return;
    
    setShowLikesHover(true);
    setLoadingLikesUsers(true);
    
    const result = await getLikesUsers(postId);
    if (result.success) {
      setLikesUsers(result.users || []);
    }
    setLoadingLikesUsers(false);
  };

  const handleLikesMouseLeave = () => {
    setShowLikesHover(false);
  };

  // Handle dislikes hover
  const handleDislikesMouseEnter = async () => {
    if (!postId || loadingDislikesUsers || dislikesUsers.length > 0) return;
    
    setShowDislikesHover(true);
    setLoadingDislikesUsers(true);
    
    const result = await getDislikesUsers(postId);
    if (result.success) {
      setDislikesUsers(result.users || []);
    }
    setLoadingDislikesUsers(false);
  };

  const handleDislikesMouseLeave = () => {
    setShowDislikesHover(false);
  };

  return (
    <div className="bg-accent dark:bg-accent-dark rounded-2xl shadow p-4 relative">
      {/* Delete button */}
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
        <div className="flex-1">
          <button
            onClick={() => onUserClick && postAuthor && onUserClick(postAuthor)}
            className="font-semibold hover:text-primary dark:hover:text-accent transition cursor-pointer"
          >
            {name}
          </button>
          <div className="flex items-center gap-2">
            <p className="text-sm opacity-70">{username}</p>
            {/* NEW: Timestamp display */}
            {createdAt && (
              <>
                <span className="text-xs opacity-50">•</span>
                <p className="text-xs opacity-50">{formatTimestamp(createdAt)}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Caption */}
      {caption && caption !== "(No caption)" && (
        <p className="mt-2 mb-3">{caption}</p>
      )}

      {/* Image */}
      {hasImage && (
        <img
          src={image}
          alt="post"
          className="w-full h-[320px] object-cover rounded-xl mb-3"
        />
      )}

      {/* Actions */}
      <div className="flex gap-6 mt-4 text-sm items-center">
        {/* Upvote with hover tooltip */}
        <div 
          className="relative"
          onMouseEnter={handleLikesMouseEnter}
          onMouseLeave={handleLikesMouseLeave}
        >
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

          {/* Likes hover tooltip */}
          {showLikesHover && likes > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
              <div className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Liked by:
              </div>
              {loadingLikesUsers ? (
                <div className="text-xs text-gray-500">Loading...</div>
              ) : likesUsers.length === 0 ? (
                <div className="text-xs text-gray-500">No one yet</div>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {likesUsers.map((user) => (
                    <div key={user.user_id} className="flex items-center gap-2">
                      <img
                        src={user.profile_image || `https://i.pravatar.cc/24?u=${user.email}`}
                        alt="avatar"
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        {user.name}
                      </span>
                    </div>
                  ))}
                  {likes > 20 && (
                    <div className="text-xs text-gray-500 italic">
                      and {likes - 20} more...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Downvote with hover tooltip */}
        <div 
          className="relative"
          onMouseEnter={handleDislikesMouseEnter}
          onMouseLeave={handleDislikesMouseLeave}
        >
          <button
            onClick={handleDislike}
            disabled={disliking || !currentUserId}
            className="flex items-center gap-1 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill={isDisliked ? downvoteColor : "none"}
              viewBox="0 0 24 24"
              stroke={downvoteColor}
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20l8-12H4l8 12z" />
            </svg>
            {dislikes}
          </button>

          {/* Dislikes hover tooltip */}
          {showDislikesHover && dislikes > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
              <div className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Disliked by:
              </div>
              {loadingDislikesUsers ? (
                <div className="text-xs text-gray-500">Loading...</div>
              ) : dislikesUsers.length === 0 ? (
                <div className="text-xs text-gray-500">No one yet</div>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {dislikesUsers.map((user) => (
                    <div key={user.user_id} className="flex items-center gap-2">
                      <img
                        src={user.profile_image || `https://i.pravatar.cc/24?u=${user.email}`}
                        alt="avatar"
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        {user.name}
                      </span>
                    </div>
                  ))}
                  {dislikes > 20 && (
                    <div className="text-xs text-gray-500 italic">
                      and {dislikes - 20} more...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comments button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 opacity-70 hover:opacity-100"
        >
          💬 {comments.length}
        </button>

        {/* Share button */}
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
                  <button
                    onClick={() => onUserClick && comment.users && onUserClick(comment.users)}
                    className="font-semibold text-xs hover:text-primary dark:hover:text-accent transition cursor-pointer"
                  >
                    {comment.users?.name}
                  </button>
                  {comment.created_at && (
                    <>
                      <span className="text-xs opacity-50">•</span>
                      <span className="text-xs opacity-50">{formatTimestamp(comment.created_at)}</span>
                    </>
                  )}
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
