"use client";

import { useState, useEffect } from "react";

export default function Post({ name, username, image, caption }) {
  const [upvotes, setUpvotes] = useState(124);
  const [downvotes, setDownvotes] = useState(8);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  // Detect dark mode
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
  const upvoteColor = darkMode ? "#4cc297" : "#3EB489"; // Primary
  const downvoteColor = "#DC143c"; // Changed as requested

  // Upvote handler
  const handleUpvote = () => {
    if (upvoted) {
      setUpvotes(upvotes - 1);
      setUpvoted(false);
    } else {
      setUpvotes(upvotes + 1);
      setUpvoted(true);
      if (downvoted) {
        setDownvoted(false);
        setDownvotes(downvotes - 1);
      }
    }
  };

  // Downvote handler
  const handleDownvote = () => {
    if (downvoted) {
      setDownvotes(downvotes - 1);
      setDownvoted(false);
    } else {
      setDownvotes(downvotes + 1);
      setDownvoted(true);
      if (upvoted) {
        setUpvoted(false);
        setUpvotes(upvotes - 1);
      }
    }
  };

  // Add comment
  const addComment = () => {
    if (!commentText.trim()) return;
    setComments([...comments, commentText]);
    setCommentText("");
  };

  // Share
  const handleShare = async () => {
    const shareData = {
      title: "Chill Post",
      text: caption,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Post link copied to clipboard!");
    }
  };

  return (
    <div className="bg-accent dark:bg-accent-dark rounded-2xl shadow p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={`https://i.pravatar.cc/40?u=${username}`}
          className="w-10 h-10 rounded-full"
          alt="avatar"
        />
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm opacity-70">{username}</p>
        </div>
      </div>

      {/* Caption ABOVE image */}
      <p className="mt-2 mb-3">{caption}</p>

      {/* Image */}
      <img
        src={image}
        alt="post"
        className="w-full h-[320px] object-cover rounded-xl"
      />

      {/* Actions */}
      <div className="flex gap-6 mt-4 text-sm items-center">
        {/* Upvote */}
        <button
          onClick={handleUpvote}
          className="flex items-center gap-1 font-semibold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill={upvoted ? upvoteColor : "none"}
            viewBox="0 0 24 24"
            stroke={upvoteColor}
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4l-8 12h16l-8-12z" />
          </svg>
          {upvotes}
        </button>

        {/* Downvote */}
        <button
          onClick={handleDownvote}
          className="flex items-center gap-1 font-semibold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill={downvoted ? downvoteColor : "none"}
            viewBox="0 0 24 24"
            stroke={downvoteColor}
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20l8-12H4l8 12z" />
          </svg>
          {downvotes}
        </button>

        {/* Comments */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 opacity-70"
        >
          💬 {comments.length}
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1 opacity-70"
        >
          🔗 Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 rounded-lg border dark:bg-bg-dark dark:border-gray-700"
            />
            <button
              onClick={addComment}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Post
            </button>
          </div>

          {comments.map((c, i) => (
            <div
              key={i}
              className="text-sm bg-white dark:bg-bg-dark rounded-lg px-3 py-2"
            >
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
