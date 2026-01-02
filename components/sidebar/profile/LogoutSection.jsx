"use client";

export default function LogoutSection({ handleLogout }) {
  return (
    <div className="w-full flex justify-center mt-4">
      <button
        onClick={handleLogout}
        className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold shadow-md hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
