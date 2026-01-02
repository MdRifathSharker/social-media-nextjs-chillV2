"use client";

export default function ProfileStats({ followers, following }) {
  return (
    <div className="flex gap-4 mb-4 w-full justify-around text-center
      border-y border-gray-200 dark:border-gray-700 py-3">
      <div>
        <p className="text-lg font-bold text-primary dark:text-accent">
          {followers.toLocaleString()}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
      </div>
      <div>
        <p className="text-lg font-bold text-primary dark:text-accent">
          {following.toLocaleString()}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">Following</p>
      </div>
    </div>
  );
}
