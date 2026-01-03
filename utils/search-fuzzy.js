import { createClient } from '@supabase/supabase-js';
import Fuse from 'fuse.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Search posts with fuzzy matching
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<{success: boolean, posts?: array, error?: string}>}
 */
export const searchPosts = async (query, limit = 10) => {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, posts: [] };
    }

    // Fetch all posts (or recent posts to avoid huge datasets)
    const { data: allPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, content, image_url, created_at, users(user_id, name, email, profile_image)')
      .order('created_at', { ascending: false })
      .limit(100); // Limit initial fetch

    if (fetchError) {
      console.error('Fetch posts error:', fetchError);
      return { error: 'Failed to fetch posts' };
    }

    if (!allPosts || allPosts.length === 0) {
      return { success: true, posts: [] };
    }

    // Apply fuzzy matching using Fuse.js
    const fuse = new Fuse(allPosts, {
      keys: ['content', 'users.name', 'users.email'],
      threshold: 0.3, // 0 = exact match, 1 = matches anything
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      useExtendedSearch: true,
    });

    const results = fuse.search(query).slice(0, limit);
    const posts = results.map(result => result.item);

    return { success: true, posts };

  } catch (error) {
    console.error('Search posts error:', error);
    return { error: error.message || 'Failed to search posts' };
  }
};

/**
 * Search users with fuzzy matching
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<{success: boolean, users?: array, error?: string}>}
 */
export const searchUsers = async (query, limit = 10) => {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, users: [] };
    }

    // Fetch all users (or recent active users)
    const { data: allUsers, error: fetchError } = await supabase
      .from('users')
      .select('user_id, name, username, email, profile_image, bio')
      .limit(200); // Limit initial fetch

    if (fetchError) {
      console.error('Fetch users error:', fetchError);
      return { error: 'Failed to fetch users' };
    }

    if (!allUsers || allUsers.length === 0) {
      return { success: true, users: [] };
    }

    // Apply fuzzy matching using Fuse.js
    const fuse = new Fuse(allUsers, {
      keys: ['name', 'username', 'email', 'bio'],
      threshold: 0.3, // Fuzzy match threshold
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      useExtendedSearch: true,
    });

    const results = fuse.search(query).slice(0, limit);
    const users = results.map(result => result.item);

    return { success: true, users };

  } catch (error) {
    console.error('Search users error:', error);
    return { error: error.message || 'Failed to search users' };
  }
};

/**
 * Combined search with fuzzy matching
 * @param {string} query - Search query
 * @returns {Promise<{success: boolean, posts?: array, users?: array, error?: string}>}
 */
export const combinedSearch = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, posts: [], users: [] };
    }

    const [postsResult, usersResult] = await Promise.all([
      searchPosts(query, 5),
      searchUsers(query, 5)
    ]);

    return {
      success: true,
      posts: postsResult.posts || [],
      users: usersResult.users || []
    };

  } catch (error) {
    console.error('Combined search error:', error);
    return { error: error.message || 'Failed to search' };
  }
};

/**
 * Search hashtags with fuzzy matching
 * @param {string} hashtag - Hashtag to search
 * @param {number} limit - Max results
 * @returns {Promise<{success: boolean, posts?: array, error?: string}>}
 */
export const searchHashtag = async (hashtag, limit = 10) => {
  try {
    if (!hashtag || hashtag.trim().length < 1) {
      return { success: true, posts: [] };
    }

    // Remove # if present
    const tag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;

    // Fetch posts with hashtags
    const { data: allPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, content, image_url, created_at, users(user_id, name, email, profile_image)')
      .ilike('content', `%#${tag}%`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (fetchError) {
      console.error('Fetch hashtag posts error:', fetchError);
      return { error: 'Failed to fetch hashtag posts' };
    }

    if (!allPosts || allPosts.length === 0) {
      return { success: true, posts: [] };
    }

    // Apply fuzzy matching to results
    const fuse = new Fuse(allPosts, {
      keys: ['content'],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });

    const results = fuse.search(`#${tag}`).slice(0, limit);
    const posts = results.map(result => result.item);

    return { success: true, posts };

  } catch (error) {
    console.error('Search hashtag error:', error);
    return { error: error.message || 'Failed to search hashtag' };
  }
};

/**
 * Get trending hashtags
 * @param {number} limit - Max results
 * @returns {Promise<{success: boolean, hashtags?: array, error?: string}>}
 */
export const getTrendingHashtags = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('content')
      .not('content', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Get trending hashtags error:', error);
      return { error: 'Failed to fetch trending hashtags' };
    }

    // Extract hashtags from content
    const hashtags = new Map();
    
    data?.forEach(post => {
      if (post.content) {
        const matches = post.content.match(/#\w+/g) || [];
        matches.forEach(tag => {
          hashtags.set(tag, (hashtags.get(tag) || 0) + 1);
        });
      }
    });

    // Sort by frequency and get top N
    const trending = Array.from(hashtags.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));

    return { success: true, hashtags: trending };

  } catch (error) {
    console.error('Get trending hashtags error:', error);
    return { error: error.message || 'Failed to fetch trending hashtags' };
  }
};

/**
 * Smart search - detects if searching for hashtag or regular query
 * @param {string} query - Search query
 * @returns {Promise<{success: boolean, posts?: array, users?: array, error?: string}>}
 */
export const smartSearch = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, posts: [], users: [] };
    }

    // Check if it's a hashtag search
    if (query.startsWith('#')) {
      const hashtagResult = await searchHashtag(query, 5);
      return {
        success: true,
        posts: hashtagResult.posts || [],
        users: [],
        isHashtag: true
      };
    }

    // Regular combined search
    return await combinedSearch(query);

  } catch (error) {
    console.error('Smart search error:', error);
    return { error: error.message || 'Failed to search' };
  }
};
