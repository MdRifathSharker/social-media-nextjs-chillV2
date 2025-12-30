import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Using fallback.');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

/**
 * Check if user exists in the database
 */
export const checkUserExists = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email, user_id, name')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code === 'PGRST116') {
      // No user found
      return { exists: false };
    }

    if (error) {
      throw error;
    }

    return { exists: true, user: data };
  } catch (error) {
    console.error('Error checking user existence:', error);
    return { exists: false, error: error.message };
  }
};

/**
 * Generate 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Complete user registration after OTP verification
 */
export const completeUserRegistration = async (email, password, name, contact = '') => {
  try {
    console.log('Starting registration for:', email);

    // First, sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password: password,
      options: {
        data: {
          name: name,
          contact: contact
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      
      // If user already exists in auth
      if (authError.message.includes('already registered') || authError.code === 'user_already_exists') {
        return { 
          error: 'User already exists. Please login instead.', 
          userExists: true 
        };
      }
      
      return { error: authError.message };
    }

    console.log('Auth signup successful, user ID:', authData.user?.id);

    if (!authData.user) {
      return { error: 'Registration failed - no user created' };
    }

    // Generate username from email
    const username = email.split('@')[0].toLowerCase() + 
                     Math.floor(Math.random() * 1000).toString();

    // Create user record in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          user_id: authData.user.id,
          name: name,
          username: username,
          email: email.toLowerCase().trim(),
          contact: contact || '',
          password: password, // Note: This is just for your schema, actual auth handled by Supabase
          profile_image: null,
          bio: '',
          followers_count: 0,
          following_count: 0
        }
      ])
      .select()
      .single();

    if (userError) {
      console.error('Error creating user record:', userError);
      
      // Try to delete the auth user if user table insertion fails
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('Error deleting auth user:', deleteError);
      }
      
      if (userError.code === '23505') { // Unique violation
        return { 
          error: 'User already exists in database. Please login.', 
          userExists: true 
        };
      }
      
      return { error: userError.message };
    }

    console.log('User record created successfully:', userData);

    return { 
      success: true, 
      user: userData,
      message: 'Registration successful!'
    };

  } catch (error) {
    console.error('Registration error:', error);
    return { error: error.message || 'Registration failed' };
  }
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  try {
    console.log('Attempting login for:', email);

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password
    });

    if (authError) {
      console.error('Auth login error:', authError);
      
      if (authError.message.includes('Invalid login credentials')) {
        return { error: 'Invalid email or password' };
      }
      
      if (authError.message.includes('Email not confirmed')) {
        return { error: 'Please verify your email address first' };
      }
      
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: 'Login failed - no user found' };
    }

    console.log('Auth login successful, user ID:', authData.user.id);

    // Get user details from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user details:', userError);
      // Even if we can't get user details, auth succeeded
      return { 
        success: true, 
        user: { 
          user_id: authData.user.id, 
          email: authData.user.email,
          name: authData.user.user_metadata?.name || email.split('@')[0]
        }
      };
    }

    console.log('User details fetched:', userData);

    return { 
      success: true, 
      user: userData 
    };

  } catch (error) {
    console.error('Login error:', error);
    return { error: error.message || 'Login failed' };
  }
};

/**
 * Get current user session
 */
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    if (!session) {
      return { user: null };
    }
    
    // Get user details from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (userError) {
      console.error('Error fetching user details:', userError);
      return { 
        user: { 
          user_id: session.user.id, 
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0]
        }
      };
    }
    
    return { user: userData };
  } catch (error) {
    console.error('Get current user error:', error);
    return { error: error.message };
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: error.message };
  }
};