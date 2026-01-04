// utils/otherProfileService.js
"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ NEW: Fetch other user's profile data
export const fetchOtherUserProfile = async (userId) => {
  try {
    console.log("👤 Fetching other user profile:", userId);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("❌ Profile fetch error:", error);
      return { success: false, error: error.message, data: null };
    }

    console.log("✅ Other user profile fetched successfully");
    return { success: true, data };
  } catch (error) {
    console.error("❌ Exception fetching other profile:", error);
    return { success: false, error: error.message, data: null };
  }
};

// ✅ NEW: Fetch other user's experiences
export const fetchOtherUserExperiences = async (userId) => {
  try {
    console.log("📚 Fetching experiences for user:", userId);

    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error("❌ Experiences fetch error:", error);
      return { success: false, error: error.message, experiences: [] };
    }

    console.log("✅ Experiences fetched successfully");
    return { success: true, experiences: data || [] };
  } catch (error) {
    console.error("❌ Exception fetching experiences:", error);
    return { success: false, error: error.message, experiences: [] };
  }
};

// ✅ NEW: Get complete other user data with follow status
export const getCompleteOtherUserData = async (otherUserId, currentUserId) => {
  try {
    console.log("🔍 Getting complete user data:", { otherUserId, currentUserId });

    // Fetch user profile
    const { success: profileSuccess, data: userData, error: profileError } = 
      await fetchOtherUserProfile(otherUserId);

    if (!profileSuccess) {
      throw new Error(profileError || "Failed to fetch profile");
    }

    // Fetch experiences
    const { success: expSuccess, experiences, error: expError } = 
      await fetchOtherUserExperiences(otherUserId);

    if (!expSuccess) {
      console.warn("⚠️ Could not fetch experiences:", expError);
    }

    // Check follow status (if current user is logged in)
    let isFollowing = false;
    if (currentUserId) {
      const { isFollowing: followStatus } = await checkIsFollowing(currentUserId, otherUserId);
      isFollowing = followStatus;
    }

    return {
      success: true,
      user: userData,
      experiences: experiences || [],
      isFollowing,
      followers_count: userData.followers_count || 0,
      following_count: userData.following_count || 0
    };
  } catch (error) {
    console.error("❌ Error getting complete user data:", error);
    return {
      success: false,
      error: error.message,
      user: null,
      experiences: [],
      isFollowing: false
    };
  }
};

// Import checkIsFollowing from followService
import { checkIsFollowing } from './followService';