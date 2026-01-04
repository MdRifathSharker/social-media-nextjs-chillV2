"use client";

import { useState } from "react";

export default function ProfileHeader({ user, isFollowing, setIsFollowing }) {
  return (
    <>
      {/* Profile Image */}
      <div className="w-32 h-32 mb-4 relative group">
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-primary/20 dark:border-accent/20 
                      shadow-lg group-hover:border-primary dark:group-hover:border-accent transition-all duration-300">
          <img
            src={user.profile_image || "/default-avatar.png"}
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-avatar.png";
            }}
          />
        </div>
      </div>
      
      {/* Name and Bio */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-2">
          {user.name}
        </h2>
        {user.bio && (
            <p className="text-sm text-primary dark:text-accent font-semibold text-center">
            {user.bio}
          </p>
        )}
      </div>

      {/* Stats and Follow Button - Compact one line */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {/* Followers with badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <span className="text-base font-bold text-primary dark:text-accent">
            {user.followers_count?.toLocaleString() || 0}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">Followers</span>
        </div>

        {/* Following with badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <span className="text-base font-bold text-primary dark:text-accent">
            {user.following_count?.toLocaleString() || 0}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">Following</span>
        </div>

        {/* Follow Button */}
        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
            isFollowing
              ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              : "bg-primary dark:bg-accent text-white hover:bg-primary/90 dark:hover:bg-accent/90"
          }`}
        >
          {isFollowing ? "✓ Following" : "+ Follow"}
        </button>
      </div>
    </>
  );
}