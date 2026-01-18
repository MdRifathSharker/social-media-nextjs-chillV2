"use client";

import { useState, useEffect } from "react";
import { getFollowers, sharePostWithUser, sharePostToAllFollowers } from "@/utils/shares";

export default function ShareModal({ postId, currentUserId, onClose, onShareSuccess }) {
  const [followers, setFollowers] = useState([]);
  const [selectedFollowers, setSelectedFollowers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [shareType, setShareType] = useState("select"); 
  const [message, setMessage] = useState("");

  
  useEffect(() => {
    const loadFollowers = async () => {
      try {
        const result = await getFollowers(currentUserId);
        if (result.success) {
          setFollowers(result.followers || []);
        } else {
          setMessage(result.error || "Failed to load followers");
        }
      } catch (error) {
        console.error("Error loading followers:", error);
        setMessage("Error loading followers");
      } finally {
        setLoading(false);
      }
    };

    loadFollowers();
  }, [currentUserId]);


  const toggleFollower = (followerId) => {
    const newSelected = new Set(selectedFollowers);
    if (newSelected.has(followerId)) {
      newSelected.delete(followerId);
    } else {
      newSelected.add(followerId);
    }
    setSelectedFollowers(newSelected);
  };

  // Handle share
  const handleShare = async () => {
    if (!postId || !currentUserId) return;

    // Validate selection
    if (shareType === "select" && selectedFollowers.size === 0) {
      setMessage("Please select at least one follower");
      return;
    }

    try {
      setSharing(true);
      setMessage("");

      if (shareType === "all") {
        // Share to all followers
        const result = await sharePostToAllFollowers(postId, currentUserId);
        if (result.success) {
          setMessage("Shared with all followers!");
          setTimeout(() => {
            onShareSuccess?.();
            onClose();
          }, 1500);
        } else {
          setMessage(result.error || "Failed to share");
        }
      } else {
        // Share with selected followers
        const sharePromises = Array.from(selectedFollowers).map(followerId =>
          sharePostWithUser(postId, currentUserId, followerId)
        );

        const results = await Promise.all(sharePromises);
        const allSuccess = results.every(r => r.success);

        if (allSuccess) {
          setMessage(`Shared with ${selectedFollowers.size} follower${selectedFollowers.size !== 1 ? 's' : ''}!`);
          setTimeout(() => {
            onShareSuccess?.();
            onClose();
          }, 1500);
        } else {
          setMessage("Some shares failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Share error:", error);
      setMessage("Error sharing post");
    } finally {
      setSharing(false);
    }
  };

  // Handle external share
  const handleExternalShare = async () => {
    const shareData = {
      title: "Check out this post!",
      text: "Check out this amazing post",
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("Link copied to clipboard!");
      setTimeout(() => onClose(), 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Share Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Share Type Selection */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Share with:</p>

            <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="radio"
                name="shareType"
                value="select"
                checked={shareType === "select"}
                onChange={(e) => setShareType(e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-sm">Selected Followers ({selectedFollowers.size})</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="radio"
                name="shareType"
                value="all"
                checked={shareType === "all"}
                onChange={(e) => setShareType(e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-sm">All Followers ({followers.length})</span>
            </label>
          </div>

          {/* Followers List (show only if "select" is chosen) */}
          {shareType === "select" && (
            <div className="space-y-2 border-t dark:border-gray-700 pt-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Select followers to share with:</p>

              {loading ? (
                <div className="text-center text-gray-500 py-4">Loading followers...</div>
              ) : followers.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <p>No followers yet</p>
                  <p className="text-xs">Your followers will appear here</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {followers.map((follower) => (
                    <label
                      key={follower.user_id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFollowers.has(follower.user_id)}
                        onChange={() => toggleFollower(follower.user_id)}
                        className="w-4 h-4"
                      />
                      <img
                        src={follower.profile_image || `https://i.pravatar.cc/32?u=${follower.email}`}
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{follower.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{follower.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes("")
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
                : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200"
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleExternalShare}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-1"
          >
            External
          </button>

          <button
            onClick={handleShare}
            disabled={sharing || (shareType === "select" && selectedFollowers.size === 0)}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-1"
          >
            {sharing ? (
              <>
                <span className="animate-spin">⏳</span> Sharing...
              </>
            ) : (
              <>
                Share
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
