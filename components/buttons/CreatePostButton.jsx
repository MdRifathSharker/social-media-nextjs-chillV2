"use client";

export default function CreatePostButton({ activeTab, setActiveTab }) {
  const isActive = activeTab === "create";

  return (
    <button
      onClick={() => setActiveTab("create")}
      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition
        ${isActive
          ? "bg-primary dark:bg-accent text-white"
          : "bg-gray-200 dark:bg-gray-800 text-text dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-700"}`}
    >
      Create Post
    </button>
  );
}
