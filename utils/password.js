import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);


export const checkUserForPasswordReset = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email, user_id, name')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code === 'PGRST116') {
      return { error: 'No account found with this email address' };
    }

    if (error) {
      throw error;
    }

    return { 
      success: true, 
      user: data,
      message: 'User found' 
    };

  } catch (error) {
    console.error('Error checking user for password reset:', error);
    return { error: error.message || 'An error occurred' };
  }
};

/**
 * Reset user password
 */
export const resetPassword = async (email, newPassword) => {
  try {
    console.log('Resetting password for:', email);

    const { error: userError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('email', email.toLowerCase().trim());

    if (userError) {
      console.error('Error updating password in users table:', userError);
      return { error: 'Failed to update password: ' + userError.message };
    }

    console.log('Password updated in users table');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { error: authError } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (authError) {
          console.warn('Could not update auth password:', authError.message);
        } else {
          console.log('Auth password updated successfully');
        }
      }
    } catch (authUpdateError) {
      console.warn('Auth password update failed:', authUpdateError.message);
    }

    console.log('Password reset completed successfully');

    return { 
      success: true, 
      message: 'Password updated successfully!' 
    };

  } catch (error) {
    console.error('Password reset error:', error);
    return { error: error.message || 'Password reset failed' };
  }
};


export const sendPasswordResetEmail = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      console.error('Send reset email error:', error);
      
      if (error.message.includes('user not found')) {
        return { error: 'No account found with this email address' };
      }
      
      return { error: error.message };
    }

    return { 
      success: true, 
      message: 'Password reset email sent! Check your inbox.' 
    };

  } catch (error) {
    console.error('Send password reset email error:', error);
    return { error: error.message || 'Failed to send reset email' };
  }
};