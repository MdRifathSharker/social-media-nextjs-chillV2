"use client";

import { useRouter } from "next/navigation";

export default function SearchResultsDropdown({ 
  posts = [], 
  users = [], 
  query = "", 
  loading = false,
  onResultClick = () => {}
}) {
  const router = useRouter();

  if (!query || query.trim().length < 2) {
    return null;
  }

  const hasResults = posts.length > 0 || users.length > 0;

  const handlePostClick = (postId) => {
    onResultClick();
    router.push(`/post/${postId}`);
  };

  const handleUserClick = (userId) => {
    onResultClick();
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700">
      {loading && (
        <div className="p-4 text-center text-gray-500">
          <span className="animate-spin">⏳</span> Searching...
        </div>
      )}

      {!loading && !hasResults && (
        <div className="p-4 text-center text-gray-500 text-sm">
          No results found for "{query}"
        </div>
      )}

      {!loading && hasResults && (
        <>
          {/* Users Section */}
          {users.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 sticky top-0 font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase">
                👥 Users ({users.length})
              </div>

              {users.map((user) => (
                <button
                  key={user.user_id}
                  onClick={() => handleUserClick(user.user_id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 transition flex items-center gap-3"
                >
                  <img
                    src={user.profile_image || `https://i.pravatar.cc/40?u=${user.email}`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                  {user.bio && (
                    <p className="text-xs text-gray-500 line-clamp-1">{user.bio}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Posts Section */}
          {posts.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 sticky top-12 font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase">
                📝 Posts ({posts.length})
              </div>

              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 transition flex gap-3"
                >
                  {/* Post image if exists */}
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="post"
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Author info */}
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={post.users?.profile_image || `https://i.pravatar.cc/24?u=${post.users?.email}`}
                        alt="avatar"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                        {post.users?.name}
                      </p>
                    </div>

                    {/* Post content */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {post.content}
                    </p>

                    {/* Date */}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
