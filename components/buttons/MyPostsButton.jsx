"use client";

export default function MyPostsButton({ activeTab, setActiveTab }) {
  const isActive = activeTab === "my";

  return (
    <button
      onClick={() => setActiveTab("my")}
      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition
        ${isActive
          ? "bg-primary dark:bg-accent text-white"
          : "bg-gray-200 dark:bg-gray-800 text-text dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-700"}`}
    >
      My Posts
    </button>
  );
}
