import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get all followers of current user
 * @param {string} userId - Current user ID
 * @returns {Promise<{success: boolean, followers?: array, error?: string}>}
 */
export const getFollowers = async (userId) => {
  try {
    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('followers')
      .select('follower:follower_id(user_id, name, email, profile_image)')
      .eq('following_id', userId);

    if (error) {
      console.error('Get followers error:', error);
      return { error: 'Failed to fetch followers' };
    }

    const followers = data?.map(f => f.follower) || [];
    return { success: true, followers };

  } catch (error) {
    console.error('Get followers error:', error);
    return { error: error.message || 'Failed to fetch followers' };
  }
};

/**
 * Share post with specific user
 * @param {string} postId - Post ID
 * @param {string} sharedBy - Who is sharing
 * @param {string} sharedWith - Who to share with
 * @returns {Promise<{success: boolean, share?: object, error?: string}>}
 */
export const sharePostWithUser = async (postId, sharedBy, sharedWith) => {
  try {
    if (!postId || !sharedBy || !sharedWith) {
      return { error: 'Missing required data' };
    }

    const { data, error } = await supabase
      .from('shares')
      .insert([
        {
          post_id: postId,
          shared_by: sharedBy,
          shared_with: sharedWith,
          share_type: 'individual'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Share post error:', error);
      return { error: 'Failed to share post' };
    }

    return { success: true, share: data };

  } catch (error) {
    console.error('Share post error:', error);
    return { error: error.message || 'Failed to share post' };
  }
};

/**
 * Share post to all followers
 * @param {string} postId - Post ID
 * @param {string} sharedBy - Who is sharing
 * @returns {Promise<{success: boolean, share?: object, error?: string}>}
 */
export const sharePostToAllFollowers = async (postId, sharedBy) => {
  try {
    if (!postId || !sharedBy) {
      return { error: 'Missing required data' };
    }

    console.log("📢 Sharing post to all followers:", { postId, sharedBy });

    const { data, error } = await supabase
      .from('shares')
      .insert([
        {
          post_id: postId,
          shared_by: sharedBy,
          shared_with: null,
          share_type: 'all'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Share to all error:', error);
      return { error: 'Failed to share to all followers' };
    }

    console.log("✅ Shared successfully");
    return { success: true, share: data };

  } catch (error) {
    console.error('Share to all error:', error);
    return { error: error.message || 'Failed to share post' };
  }
};

/**
 * Get share count for a post
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
export const getShareCount = async (postId) => {
  try {
    if (!postId) {
      return { error: 'Missing post ID' };
    }

    const { count, error } = await supabase
      .from('shares')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      console.error('Get share count error:', error);
      return { error: 'Failed to fetch share count' };
    }

    return { success: true, count: count || 0 };

  } catch (error) {
    console.error('Share count error:', error);
    return { error: error.message || 'Failed to get share count' };
  }
};

/**
 * ✅ NEW FUNCTION: Get posts SHARED BY user (posts this user shared out)
 * This is different from getSharedPostsForUser (posts shared WITH you)
 * @param {string} userId - User ID who shared the posts
 * @returns {Promise<{success: boolean, posts?: array}>}
 */
export const getPostsSharedByUser = async (userId) => {
  try {
    if (!userId) {
      console.log("❌ No userId provided");
      return { success: true, posts: [] };
    }

    console.log("📤 Fetching posts shared BY user:", userId);

    // Step 1: Get all shares where this user is the sharer
    const { data: shares, error: sharesError } = await supabase
      .from('shares')
      .select('*')
      .eq('shared_by', userId);

    if (sharesError) {
      console.error("❌ Shares fetch error:", sharesError);
      return { success: true, posts: [] };
    }

    console.log(`✅ Found ${shares?.length || 0} shares for user`);

    if (!shares || shares.length === 0) {
      return { success: true, posts: [] };
    }

    // Step 2: Get all unique post IDs
    const postIds = [...new Set(shares.map(s => s.post_id))];
    console.log(`📋 Fetching ${postIds.length} unique posts...`);

    // Step 3: Fetch the actual posts with user data
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*, users(user_id, name, email, profile_image)')
      .in('id', postIds);

    if (postsError) {
      console.error("❌ Posts fetch error:", postsError);
      return { success: true, posts: [] };
    }

    console.log(`✅ Got ${posts?.length || 0} posts from DB`);

    // Step 4: Combine shares with posts
    const result = shares
      .map(share => {
        const post = posts?.find(p => p.id === share.post_id);
        if (!post) return null;

        return {
          share_id: share.id || share.share_id,
          post_id: share.post_id,
          shared_with: share.shared_with,
          share_type: share.share_type,
          created_at: share.created_at,
          posts: post
        };
      })
      .filter(s => s !== null);

    console.log(`✅ Returning ${result.length} complete shared posts`);
    return { success: true, posts: result };

  } catch (error) {
    console.error('❌ Exception in getPostsSharedByUser:', error);
    return { success: true, posts: [] };
  }
};

/**
 * Get posts shared WITH current user
 * @param {string} userId - Current user ID
 * @returns {Promise<{success: boolean, posts?: array, error?: string}>}
 */
export const getSharedPostsForUser = async (userId) => {
  try {
    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('shares')
      .select('post_id, shared_by, share_type, created_at, posts(*, users(name, email, profile_image)), sharer:shared_by(name, email, profile_image)')
      .or(`shared_with.eq.${userId},and(share_type.eq.all,shared_with.is.null)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get shared posts error:', error);
      return { error: 'Failed to fetch shared posts' };
    }

    return { success: true, posts: data || [] };

  } catch (error) {
    console.error('Get shared posts error:', error);
    return { error: error.message || 'Failed to fetch shared posts' };
  }
};

/**
 * Check if user already shared a post with someone
 * @param {string} postId - Post ID
 * @param {string} sharedBy - Who shared
 * @param {string} sharedWith - Who received (null for share to all)
 * @returns {Promise<{success: boolean, alreadyShared?: boolean, error?: string}>}
 */
export const isPostAlreadyShared = async (postId, sharedBy, sharedWith = null) => {
  try {
    if (!postId || !sharedBy) {
      return { error: 'Missing required data' };
    }

    const { data, error } = await supabase
      .from('shares')
      .select('share_id')
      .eq('post_id', postId)
      .eq('shared_by', sharedBy)
      .eq('shared_with', sharedWith)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Check share error:', error);
      return { error: 'Failed to check share status' };
    }

    return { success: true, alreadyShared: !!data };

  } catch (error) {
    console.error('Check share error:', error);
    return { error: error.message || 'Failed to check share status' };
  }
};

/**
 * Delete a share record
 * @param {string} shareId - Share ID
 * @param {string} userId - Current user ID (for verification)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteShare = async (shareId, userId) => {
  try {
    if (!shareId || !userId) {
      return { error: 'Missing share or user ID' };
    }

    const { data: share, error: fetchError } = await supabase
      .from('shares')
      .select('shared_by')
      .eq('share_id', shareId)
      .single();

    if (fetchError) {
      return { error: 'Share not found' };
    }

    if (share.shared_by !== userId) {
      return { error: 'You can only delete your own shares' };
    }

    const { error } = await supabase
      .from('shares')
      .delete()
      .eq('share_id', shareId);

    if (error) {
      console.error('Delete share error:', error);
      return { error: 'Failed to delete share' };
    }

    return { success: true };

  } catch (error) {
    console.error('Delete share error:', error);
    return { error: error.message || 'Failed to delete share' };
  }
};

/**
 * Get followers count for user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
export const getFollowersCount = async (userId) => {
  try {
    if (!userId) {
      return { error: 'Missing user ID' };
    }

    const { count, error } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (error) {
      console.error('Get followers count error:', error);
      return { error: 'Failed to fetch followers count' };
    }

    return { success: true, count: count || 0 };

  } catch (error) {
    console.error('Followers count error:', error);
    return { error: error.message || 'Failed to get followers count' };
  }
};
