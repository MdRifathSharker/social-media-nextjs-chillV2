"use client";

export default function SharedPostsButton({ activeTab, setActiveTab }) {
  return (
    <button
      onClick={() => setActiveTab("shared")}
      className={`px-4 py-2 rounded-lg font-semibold transition ${
        activeTab === "shared"
          ? "bg-primary text-white shadow-md"
          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
      }`}
    >
      📤 Shared
    </button>
  );
}
