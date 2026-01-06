import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload image to Supabase Storage (posts bucket)
 * @param {File} imageFile - The image file to upload
 * @param {string} userId - Current user ID for unique naming
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
export const uploadPostImage = async (imageFile, userId) => {
  try {
    if (!imageFile) {
      return { error: 'No image file provided' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `${userId}/${timestamp}-${randomId}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('posts')
      .upload(fileName, imageFile);

    if (error) {
      console.error('Image upload error:', error);
      return { error: 'Failed to upload image: ' + error.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('posts')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData?.publicUrl;

    return { success: true, imageUrl };

  } catch (error) {
    console.error('Upload image error:', error);
    return { error: error.message || 'Failed to upload image' };
  }
};

/**
 * Create a new post in the database
 * @param {object} postData - Post data object
 * @returns {Promise<{success: boolean, post?: object, error?: string}>}
 */
export const createPost = async ({ userId, content, imageUrl }) => {
  try {
    if (!userId) {
      console.error('No userId provided');
      return { error: 'User not authenticated' };
    }

    // Allow either content or image (or both), but not neither
    if ((!content || !content.trim()) && !imageUrl) {
      return { error: 'Please add either text or an image to your post!' };
    }

    console.log('Creating post for userId:', userId);

    // First, verify the user exists in the users table
    const { data: userExists, error: userCheckError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (userCheckError) {
      console.error('User check error:', userCheckError);
      return { error: 'User not found in database. Please log in again.' };
    }

    if (!userExists) {
      console.error('User not found:', userId);
      return { error: 'User not found in database. Please log in again.' };
    }

    console.log('User verified, proceeding with post creation');

    // Insert post into database
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: userId,
          content: content?.trim() || '',
          image_url: imageUrl || null,
          likes: 0,
          comments: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Create post error:', error);
      return { error: 'Failed to create post: ' + error.message };
    }

    console.log('Post created successfully:', data);
    return { success: true, post: data };

  } catch (error) {
    console.error('Post creation error:', error);
    return { error: error.message || 'Failed to create post' };
  }
};

/**
 * Get all posts from database with user info
 * @returns {Promise<{success: boolean, posts?: array, error?: string}>}
 */
export const getAllPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, users(name, username, user_id)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch posts error:', error);
      return { error: 'Failed to fetch posts' };
    }

    return { success: true, posts: data || [] };

  } catch (error) {
    console.error('Get posts error:', error);
    return { error: error.message || 'Failed to fetch posts' };
  }
};

/**
 * Get user's own posts
 * @param {string} userId - Current user ID
 * @returns {Promise<{success: boolean, posts?: array, error?: string}>}
 */
export const getUserPosts = async (userId) => {
  try {
    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*, users(name, username, user_id, profile_image)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch user posts error:', error);
      return { error: 'Failed to fetch your posts' };
    }

    return { success: true, posts: data || [] };

  } catch (error) {
    console.error('Get user posts error:', error);
    return { error: error.message || 'Failed to fetch posts' };
  }
};

/**
 * Delete a post by ID
 * @param {string} postId - Post ID to delete
 * @param {string} userId - Current user ID (for verification)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deletePost = async (postId, userId) => {
  try {
    if (!postId || !userId) {
      return { error: 'Missing post ID or user ID' };
    }

    console.log('Deleting post:', postId);

    // First verify this post belongs to the current user
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error('Fetch post error:', fetchError);
      return { error: 'Post not found' };
    }

    if (post.user_id !== userId) {
      return { error: 'You can only delete your own posts' };
    }

    // Delete the post
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Delete post error:', error);
      return { error: 'Failed to delete post: ' + error.message };
    }

    console.log('Post deleted successfully');
    return { success: true };

  } catch (error) {
    console.error('Delete post error:', error);
    return { error: error.message || 'Failed to delete post' };
  }
};

/**
 * Get current user profile with profile_image
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const getUserProfile = async (userId) => {
  try {
    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, email, profile_image')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Fetch user profile error:', error);
      return { error: 'Failed to fetch user profile' };
    }

    return { success: true, user: data };

  } catch (error) {
    console.error('Get user profile error:', error);
    return { error: error.message || 'Failed to fetch user profile' };
  }
};

/**
 * Toggle like on a post (add if not liked, remove if liked) - FIXED VERSION
 * @param {string} postId - Post ID
 * @param {string} userId - Current user ID
 * @returns {Promise<{success: boolean, liked?: boolean, error?: string}>}
 */
export const toggleLike = async (postId, userId) => {
  try {
    if (!postId || !userId) {
      return { error: 'Missing post or user ID' };
    }

    console.log('🔄 Toggling like:', { postId, userId });

    // Check if user already liked this post - FIXED: Handle PGRST116 error
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('like_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle() instead of single()

    // Log any non-PGRST116 errors
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Check like error:', checkError);
      return { error: 'Failed to check like status: ' + checkError.message };
    }

    if (existingLike) {
      // User already liked, so unlike it
      console.log('👎 Unliking post...');
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('like_id', existingLike.like_id);

      if (error) {
        console.error('❌ Unlike error:', error);
        return { error: 'Failed to unlike post: ' + error.message };
      }

      console.log('✅ Post unliked successfully');
      return { success: true, liked: false };
    }

    // User hasn't liked, so add like
    console.log('👍 Liking post...');
    const { error } = await supabase
      .from('likes')
      .insert([{ post_id: postId, user_id: userId }]);

    if (error) {
      console.error('❌ Like error:', error);
      console.error('❌ Full error details:', JSON.stringify(error, null, 2));
      return { error: 'Failed to like post: ' + error.message };
    }

    console.log('✅ Post liked successfully');
    return { success: true, liked: true };

  } catch (error) {
    console.error('❌ Toggle like exception:', error);
    return { error: error.message || 'Failed to toggle like' };
  }
};

/**
 * Get like count for a post
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
export const getLikeCount = async (postId) => {
  try {
    if (!postId) {
      return { error: 'Missing post ID' };
    }

    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      console.error('Get like count error:', error);
      return { error: 'Failed to fetch like count' };
    }

    return { success: true, count: count || 0 };

  } catch (error) {
    console.error('Like count error:', error);
    return { error: error.message || 'Failed to get like count' };
  }
};

/**
 * Check if current user liked a post
 * @param {string} postId - Post ID
 * @param {string} userId - Current user ID
 * @returns {Promise<{success: boolean, liked?: boolean, error?: string}>}
 */
export const isPostLikedByUser = async (postId, userId) => {
  try {
    if (!postId || !userId) {
      return { error: 'Missing post or user ID' };
    }

    const { data, error } = await supabase
      .from('likes')
      .select('like_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle() instead of single()

    if (error && error.code !== 'PGRST116') {
      console.error('Check like error:', error);
      return { error: 'Failed to check like status' };
    }

    return { success: true, liked: !!data };

  } catch (error) {
    console.error('Is liked error:', error);
    return { error: error.message || 'Failed to check like' };
  }
};

/**
 * Add a comment to a post - FIXED VERSION
 * @param {string} postId - Post ID
 * @param {string} userId - Current user ID
 * @param {string} commentText - Comment text
 * @returns {Promise<{success: boolean, comment?: object, error?: string}>}
 */
export const addComment = async (postId, userId, commentText) => {
  try {
    if (!postId || !userId) {
      return { error: 'Missing post or user ID' };
    }

    if (!commentText || !commentText.trim()) {
      return { error: 'Comment cannot be empty' };
    }

    console.log('💬 Adding comment:', { postId, userId, text: commentText.substring(0, 50) });

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          user_id: userId,
          comment_text: commentText.trim()
        }
      ])
      .select('*, users(name, email, profile_image)')
      .single();

    if (error) {
      console.error('❌ Add comment error:', error);
      console.error('❌ Full error details:', JSON.stringify(error, null, 2));
      return { error: 'Failed to add comment: ' + error.message };
    }

    console.log('✅ Comment added successfully');
    return { success: true, comment: data };

  } catch (error) {
    console.error('❌ Add comment exception:', error);
    return { error: error.message || 'Failed to add comment' };
  }
};

/**
 * Get all comments for a post
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, comments?: array, error?: string}>}
 */
export const getComments = async (postId) => {
  try {
    if (!postId) {
      return { error: 'Missing post ID' };
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*, users(user_id, name, email, profile_image, bio)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get comments error:', error);
      return { error: 'Failed to fetch comments' };
    }

    return { success: true, comments: data || [] };

  } catch (error) {
    console.error('Get comments error:', error);
    return { error: error.message || 'Failed to fetch comments' };
  }
};

/**
 * Delete a comment
 * @param {string} commentId - Comment ID
 * @param {string} userId - Current user ID (for verification)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteComment = async (commentId, userId) => {
  try {
    if (!commentId || !userId) {
      return { error: 'Missing comment or user ID' };
    }

    // Verify comment belongs to user
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('comment_id', commentId)
      .single();

    if (fetchError) {
      return { error: 'Comment not found' };
    }

    if (comment.user_id !== userId) {
      return { error: 'You can only delete your own comments' };
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('comment_id', commentId);

    if (error) {
      console.error('Delete comment error:', error);
      return { error: 'Failed to delete comment' };
    }

    return { success: true };

  } catch (error) {
    console.error('Delete comment error:', error);
    return { error: error.message || 'Failed to delete comment' };
  }
};

/**
 * 🆕 GET POSTS FROM USERS THAT CURRENT USER FOLLOWS
 * @param {string} userId - Current user ID
 * @param {number} offset - Pagination offset (default 0)
 * @param {number} limit - Number of posts to fetch (default 10)
 * @returns {Promise<{success: boolean, posts?: array, hasMore?: boolean, error?: string}>}
 */
export const getFollowingUsersPosts = async (userId, offset = 0, limit = 10) => {
  try {
    if (!userId) {
      return { error: 'User not authenticated' };
    }

    console.log(`📥 Fetching following users posts: offset=${offset}, limit=${limit}`);

    // Step 1: Get list of users that current user follows
    const { data: followingData, error: followError } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', userId);

    if (followError) {
      console.error('Get following error:', followError);
      return { error: 'Failed to fetch following list' };
    }

    const followingIds = followingData?.map(f => f.following_id) || [];

    if (followingIds.length === 0) {
      console.log('ℹ️ User not following anyone');
      return { success: true, posts: [], hasMore: false };
    }

    console.log(`📊 Following ${followingIds.length} users, fetching their posts...`);

    // Step 2: Get posts from following users
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*, users(name, username, user_id, profile_image, email)')
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error('Get posts error:', postsError);
      return { error: 'Failed to fetch posts' };
    }

    const hasMore = posts?.length === limit;
    console.log(`✅ Fetched ${posts?.length || 0} posts`);
    return { success: true, posts: posts || [], hasMore };

  } catch (error) {
    console.error('Get following posts error:', error);
    return { error: error.message || 'Failed to fetch posts' };
  }
};

/**
 * 👎 DISLIKE FUNCTIONS (NEW!)
 */

/**
 * Toggle dislike on a post (add if not disliked, remove if disliked)
 * @param {string} postId - Post ID
 * @param {string} userId - Current user ID
 * @returns {Promise<{success: boolean, disliked?: boolean, error?: string}>}
 */
export const toggleDislike = async (postId, userId) => {
  try {
    if (!postId || !userId) {
      return { error: 'Missing post or user ID' };
    }

    // Check if user already disliked this post
    const { data: existingDislike, error: checkError } = await supabase
      .from('dislikes')
      .select('dislike_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingDislike) {
      // User already disliked, so remove dislike
      const { error } = await supabase
        .from('dislikes')
        .delete()
        .eq('dislike_id', existingDislike.dislike_id);

      if (error) {
        console.error('❌ Remove dislike error:', error);
        console.error('❌ Full error details:', JSON.stringify(error, null, 2));
        return { error: 'Failed to remove dislike' };
      }

      return { success: true, disliked: false };
    }

    // User hasn't disliked, so add dislike
    const { error } = await supabase
      .from('dislikes')
      .insert([{ post_id: postId, user_id: userId }]);

    if (error) {
      console.error('❌ Dislike error:', error);
      console.error('❌ Full error details:', JSON.stringify(error, null, 2));
      return { error: 'Failed to dislike post' };
    }

    return { success: true, disliked: true };

  } catch (error) {
    console.error('Toggle dislike error:', error);
    return { error: error.message || 'Failed to toggle dislike' };
  }
};

/**
 * Get dislike count for a post
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
export const getDislikeCount = async (postId) => {
  try {
    if (!postId) {
      return { error: 'Missing post ID' };
    }

    const { count, error } = await supabase
      .from('dislikes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      console.error('Get dislike count error:', error);
      return { error: 'Failed to fetch dislike count' };
    }

    return { success: true, count: count || 0 };

  } catch (error) {
    console.error('Dislike count error:', error);
    return { error: error.message || 'Failed to get dislike count' };
  }
};

/**
 * Check if current user disliked a post
 * @param {string} postId - Post ID
 * @param {string} userId - Current user ID
 * @returns {Promise<{success: boolean, disliked?: boolean, error?: string}>}
 */
export const isPostDislikedByUser = async (postId, userId) => {
  try {
    if (!postId || !userId) {
      return { error: 'Missing post or user ID' };
    }

    const { data, error } = await supabase
      .from('dislikes')
      .select('dislike_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Check dislike error:', error);
      return { error: 'Failed to check dislike status' };
    }

    return { success: true, disliked: !!data };

  } catch (error) {
    console.error('Is disliked error:', error);
    return { error: error.message || 'Failed to check dislike' };
  }
};

/**
 * Get list of users who liked a post
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, users?: array, error?: string}>}
 */
export const getLikesUsers = async (postId) => {
  try {
    if (!postId) {
      return { error: 'Missing post ID' };
    }

    const { data, error } = await supabase
      .from('likes')
      .select('user_id, users(name, email, profile_image)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(20); // Limit to first 20 users

    if (error) {
      console.error('Get likes users error:', error);
      return { error: 'Failed to fetch likes users' };
    }

    const users = (data || []).map(like => ({
      user_id: like.user_id,
      name: like.users?.name || 'Unknown',
      email: like.users?.email,
      profile_image: like.users?.profile_image
    }));

    return { success: true, users };

  } catch (error) {
    console.error('Get likes users error:', error);
    return { error: error.message || 'Failed to fetch likes users' };
  }
};

/**
 * Get list of users who disliked a post
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, users?: array, error?: string}>}
 */
export const getDislikesUsers = async (postId) => {
  try {
    if (!postId) {
      return { error: 'Missing post ID' };
    }

    const { data, error } = await supabase
      .from('dislikes')
      .select('user_id, users(name, email, profile_image)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(20); // Limit to first 20 users

    if (error) {
      console.error('Get dislikes users error:', error);
      return { error: 'Failed to fetch dislikes users' };
    }

    const users = (data || []).map(dislike => ({
      user_id: dislike.user_id,
      name: dislike.users?.name || 'Unknown',
      email: dislike.users?.email,
      profile_image: dislike.users?.profile_image
    }));

    return { success: true, users };

  } catch (error) {
    console.error('Get dislikes users error:', error);
    return { error: error.message || 'Failed to fetch dislikes users' };
  }
};

