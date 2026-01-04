"use client";

import { useState } from "react";

export default function ProfileHeader({ user, isFollowing, setIsFollowing }) {
  return (
    <>
      {/* Profile Image */}
      <div className="w-28 h-28 mb-3 relative">
        <img
          src={user.profile_image || "/default-avatar.png"}
          alt={user.name}
          className="w-28 h-28 rounded-full object-cover border-4 border-primary dark:border-accent shadow-lg"
        />
      </div>
      
      {/* Name and Bio */}
      <h2 className="text-2xl font-bold text-center">{user.name}</h2>
      {user.bio && (
        <p className="text-sm text-primary dark:text-accent font-semibold text-center mt-1 mb-4">
          {user.bio}
        </p>
      )}

      {/* Stats and Follow Button */}
      <div className="flex items-center gap-6 mb-4">
        {/* Followers */}
        <div className="text-center">
          <p className="text-lg font-bold text-primary dark:text-accent">
            {user.followers?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
        </div>

        {/* Following */}
        <div className="text-center">
          <p className="text-lg font-bold text-primary dark:text-accent">
            {user.following?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Following</p>
        </div>

        {/* Follow Button */}
        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            isFollowing
              ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              : "bg-primary dark:bg-accent text-white hover:bg-primary/90 dark:hover:bg-accent/90"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    </>
  );
}