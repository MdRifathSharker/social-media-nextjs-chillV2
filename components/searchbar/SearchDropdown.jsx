"use client";

import Image from "next/image";

export default function SearchDropdown({
  results,
  loading,
  setSelectedProfile,
  setShowDropdown, // receive the prop to hide dropdown
}) {
  if (loading) return <div>Searching...</div>;
  if (!results || results.length === 0) return null;

  const handleClick = (user) => {
    if (setSelectedProfile) {
      setSelectedProfile(user); // ✅ set profile in HomePage
    }
    if (typeof setShowDropdown === "function") {
      setShowDropdown(false); // hide the dropdown
    }
  };

  return (
    <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg z-50 overflow-hidden">
      {results.map((user) => (
        <div
          key={user.user_id}
          className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          onClick={() => handleClick(user)} // send entire user and hide dropdown
        >
          {/* Profile Picture */}
          <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
            <Image
              src={user.profile_image || "/default-avatar.png"}
              alt={user.name}
              fill
              className="object-cover"
              unoptimized={true}
            />
          </div>

          {/* Name + Bio */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {user.name}
            </span>
            {user.bio && (
              <span className="text-xs text-primary dark:text-primary/80 mt-1">
                {user.bio}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
