// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// /**
//  * Follow a user
//  * @param {string} followerId - Current user ID
//  * @param {string} followingId - User to follow
//  * @returns {Promise<{success: boolean, error?: string}>}
//  */
// export const followUser = async (followerId, followingId) => {
//   try {
//     if (!followerId || !followingId) {
//       return { error: 'Missing user IDs' };
//     }

//     if (followerId === followingId) {
//       return { error: 'You cannot follow yourself' };
//     }

//     const { error } = await supabase
//       .from('followers')
//       .insert([
//         {
//           follower_id: followerId,
//           following_id: followingId
//         }
//       ]);

//     if (error) {
//       if (error.code === '23505') { // Unique violation - already following
//         return { error: 'Already following this user' };
//       }
//       console.error('Follow error:', error);
//       return { error: 'Failed to follow user' };
//     }

//     return { success: true };

//   } catch (error) {
//     console.error('Follow error:', error);
//     return { error: error.message || 'Failed to follow user' };
//   }
// };

// /**
//  * Unfollow a user
//  * @param {string} followerId - Current user ID
//  * @param {string} followingId - User to unfollow
//  * @returns {Promise<{success: boolean, error?: string}>}
//  */
// export const unfollowUser = async (followerId, followingId) => {
//   try {
//     if (!followerId || !followingId) {
//       return { error: 'Missing user IDs' };
//     }

//     const { error } = await supabase
//       .from('followers')
//       .delete()
//       .eq('follower_id', followerId)
//       .eq('following_id', followingId);

//     if (error) {
//       console.error('Unfollow error:', error);
//       return { error: 'Failed to unfollow user' };
//     }

//     return { success: true };

//   } catch (error) {
//     console.error('Unfollow error:', error);
//     return { error: error.message || 'Failed to unfollow user' };
//   }
// };

// /**
//  * Check if current user follows another user
//  * @param {string} followerId - Current user ID
//  * @param {string} followingId - User to check
//  * @returns {Promise<{success: boolean, isFollowing?: boolean, error?: string}>}
//  */
// export const isUserFollowing = async (followerId, followingId) => {
//   try {
//     if (!followerId || !followingId) {
//       return { error: 'Missing user IDs' };
//     }

//     const { data, error } = await supabase
//       .from('followers')
//       .select('follower_id')
//       .eq('follower_id', followerId)
//       .eq('following_id', followingId)
//       .single();

//     if (error && error.code !== 'PGRST116') {
//       console.error('Check follow error:', error);
//       return { error: 'Failed to check follow status' };
//     }

//     return { success: true, isFollowing: !!data };

//   } catch (error) {
//     console.error('Is following error:', error);
//     return { error: error.message || 'Failed to check follow status' };
//   }
// };

// /**
//  * Get following count for a user
//  * @param {string} userId - User ID
//  * @returns {Promise<{success: boolean, count?: number, error?: string}>}
//  */
// export const getFollowingCount = async (userId) => {
//   try {
//     if (!userId) {
//       return { error: 'Missing user ID' };
//     }

//     const { count, error } = await supabase
//       .from('followers')
//       .select('*', { count: 'exact', head: true })
//       .eq('follower_id', userId);

//     if (error) {
//       console.error('Get following count error:', error);
//       return { error: 'Failed to fetch following count' };
//     }

//     return { success: true, count: count || 0 };

//   } catch (error) {
//     console.error('Following count error:', error);
//     return { error: error.message || 'Failed to get following count' };
//   }
// };

// /**
//  * Toggle follow (follow if not following, unfollow if following)
//  * @param {string} followerId - Current user ID
//  * @param {string} followingId - User to toggle follow
//  * @returns {Promise<{success: boolean, isFollowing?: boolean, error?: string}>}
//  */
// export const toggleFollow = async (followerId, followingId) => {
//   try {
//     if (!followerId || !followingId) {
//       return { error: 'Missing user IDs' };
//     }

//     // Check if already following
//     const checkResult = await isUserFollowing(followerId, followingId);

//     if (checkResult.isFollowing) {
//       // Unfollow
//       const unfollowResult = await unfollowUser(followerId, followingId);
//       if (unfollowResult.success) {
//         return { success: true, isFollowing: false };
//       }
//       return unfollowResult;
//     } else {
//       // Follow
//       const followResult = await followUser(followerId, followingId);
//       if (followResult.success) {
//         return { success: true, isFollowing: true };
//       }
//       return followResult;
//     }

//   } catch (error) {
//     console.error('Toggle follow error:', error);
//     return { error: error.message || 'Failed to toggle follow' };
//   }
// };
