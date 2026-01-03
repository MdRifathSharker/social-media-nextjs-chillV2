// utils/profileService.js
import { createClient } from '@supabase/supabase-js';

// Create Supabase client WITHOUT auth requirements
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch user profile from Supabase (NO AUTH REQUIRED)
export const fetchUserProfile = async (userId) => {
  try {
    console.log("👤 Fetching profile for user (no auth):", userId);
    
    if (!userId) {
      return { 
        data: null, 
        error: "User ID is required" 
      };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("❌ Profile fetch error:", error);
      return { data: null, error: error.message };
    }

    console.log("✅ Profile fetched successfully");
    return { data, error: null };
  } catch (error) {
    console.error("❌ Exception fetching profile:", error);
    return { data: null, error: error.message };
  }
}

// Update user profile in Supabase (NO AUTH REQUIRED)
export const updateUserProfile = async (userId, updates) => {
  try {
    console.log("✏️ Updating profile for user (no auth):", userId);
    console.log("📝 Updates:", updates);
    
    if (!userId) {
      return { 
        data: null, 
        error: "User ID is required" 
      };
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error("❌ Update error:", error);
      return { data: null, error: error.message };
    }

    console.log("✅ Profile updated successfully");
    return { data, error: null };
  } catch (error) {
    console.error("❌ Exception updating profile:", error);
    return { data: null, error: error.message };
  }
}