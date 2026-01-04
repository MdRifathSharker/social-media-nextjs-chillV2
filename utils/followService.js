// utils/followService.js
"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ NEW: Follow a user
export const followUser = async (followerId, followingId) => {
  try {
    console.log("🔗 Following user:", { followerId, followingId });
    
    // Check if already following
    const { data: existingFollow } = await supabase
      .from('followers')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existingFollow) {
      return { success: false, error: "Already following this user" };
    }

    // Create follow relationship
    const { data, error } = await supabase
      .from('followers')
      .insert({
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // ✅ NEW: Update followers_count and following_count
    await updateFollowCounts(followerId, followingId, 'increment');

    console.log("✅ Successfully followed user");
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error following user:", error);
    return { success: false, error: error.message };
  }
};

// ✅ NEW: Unfollow a user
export const unfollowUser = async (followerId, followingId) => {
  try {
    console.log("🔗 Unfollowing user:", { followerId, followingId });

    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;

    // ✅ NEW: Update followers_count and following_count
    await updateFollowCounts(followerId, followingId, 'decrement');

    console.log("✅ Successfully unfollowed user");
    return { success: true };
  } catch (error) {
    console.error("❌ Error unfollowing user:", error);
    return { success: false, error: error.message };
  }
};

// ✅ NEW: Check if user is following another user
export const checkIsFollowing = async (followerId, followingId) => {
  try {
    console.log("🔍 Checking follow status:", { followerId, followingId });

    const { data, error } = await supabase
      .from('followers')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { isFollowing: !!data };
  } catch (error) {
    console.error("❌ Error checking follow status:", error);
    return { isFollowing: false, error: error.message };
  }
};

// ✅ NEW: Get followers list
export const getFollowers = async (userId) => {
  try {
    console.log("👥 Getting followers for:", userId);

    const { data, error } = await supabase
      .from('followers')
      .select(`
        follower_id,
        users:follower_id (user_id, name, username, profile_image, bio)
      `)
      .eq('following_id', userId);

    if (error) throw error;

    const followers = data.map(item => ({
      user_id: item.follower_id,
      name: item.users?.name || 'Unknown',
      username: item.users?.username,
      profile_image: item.users?.profile_image,
      bio: item.users?.bio
    }));

    return { success: true, followers };
  } catch (error) {
    console.error("❌ Error getting followers:", error);
    return { success: false, error: error.message, followers: [] };
  }
};

// ✅ NEW: Get following list
export const getFollowing = async (userId) => {
  try {
    console.log("👥 Getting following for:", userId);

    const { data, error } = await supabase
      .from('followers')
      .select(`
        following_id,
        users:following_id (user_id, name, username, profile_image, bio)
      `)
      .eq('follower_id', userId);

    if (error) throw error;

    const following = data.map(item => ({
      user_id: item.following_id,
      name: item.users?.name || 'Unknown',
      username: item.users?.username,
      profile_image: item.users?.profile_image,
      bio: item.users?.bio
    }));

    return { success: true, following };
  } catch (error) {
    console.error("❌ Error getting following:", error);
    return { success: false, error: error.message, following: [] };
  }
};

// ✅ NEW: Helper function to update follow counts
const updateFollowCounts = async (followerId, followingId, operation) => {
  try {
    const increment = operation === 'increment' ? 1 : -1;

    // Update follower's following_count
    const { data: followerData } = await supabase
      .from('users')
      .select('following_count')
      .eq('user_id', followerId)
      .single();

    await supabase
      .from('users')
      .update({
        following_count: Math.max(0, (followerData?.following_count || 0) + increment),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', followerId);

    // Update following user's followers_count
    const { data: followingData } = await supabase
      .from('users')
      .select('followers_count')
      .eq('user_id', followingId)
      .single();

    await supabase
      .from('users')
      .update({
        followers_count: Math.max(0, (followingData?.followers_count || 0) + increment),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', followingId);

    console.log("✅ Updated follow counts");
  } catch (error) {
    console.error("❌ Error updating follow counts:", error);
  }
};