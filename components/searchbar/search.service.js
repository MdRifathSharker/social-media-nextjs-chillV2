// components/searchbar/search.service.js

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Search users by name (case-insensitive, partial match)
 * @param {string} query
 * @returns {Array} users
 */
export async function searchUsersByName(query) {
  // Prevent empty or very short searches
  if (!query || query.trim().length < 1) {
    return [];
  }

  const { data, error } = await supabase
    .from("users")
    .select("user_id, name, profile_image, bio") 
    .ilike("name", `%${query}%`)
    .limit(10);

  if (error) {
    console.error("❌ User search error:", error);
    return [];
  }

  return data;
}
