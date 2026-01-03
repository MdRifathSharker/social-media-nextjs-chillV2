// Changed: Added proper logout logic
"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LogoutSection({ handleLogout }) {
  const handleLogoutClick = async () => {
    try {
      // Call parent logout handler
      handleLogout();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error during logout");
    }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <button
        onClick={handleLogoutClick}
        className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold shadow-md hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}