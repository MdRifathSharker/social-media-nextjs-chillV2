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

    if (!content || !content.trim()) {
      return { error: 'Post content cannot be empty' };
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
          content: content.trim(),
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
      .select('*, users(name, username, user_id)')
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