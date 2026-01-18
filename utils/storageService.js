
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const storageService = {

  async uploadProfileImage(userId, file) {
    try {
      console.log("📤 Uploading profile image for user (no auth):", userId);
      
      if (!userId) {
        return { 
          success: false, 
          url: null, 
          error: "User ID is required" 
        };
      }

      if (!file) {
        return { 
          success: false, 
          url: null, 
          error: "No file selected" 
        };
      }

      if (!file.type.startsWith('image/')) {
        return { 
          success: false, 
          url: null, 
          error: "Please select an image file" 
        };
      }

      if (file.size > 5 * 1024 * 1024) { 
        return { 
          success: false, 
          url: null, 
          error: "Image size should be less than 5MB" 
        };
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log("📁 Uploading to:", filePath);

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error("Upload error:", error);
        return { 
          success: false, 
          url: null, 
          error: error.message || "Upload failed" 
        };
      }

      console.log("Upload successful:", data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log("🌐 Public URL:", publicUrl);

      // Update user record with new image URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          profile_image: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error("⚠️ Could not update user record:", updateError);
        // Still return success since image was uploaded
      }

      return { 
        success: true, 
        url: publicUrl,
        error: null 
      };
    } catch (error) {
      console.error("❌ Exception uploading profile image:", error);
      return { 
        success: false, 
        url: null, 
        error: error.message || "Upload failed" 
      };
    }
  },

  // Get profile image URL (NO AUTH REQUIRED)
  async getProfileImageUrl(userId) {
    try {
      console.log("📷 Getting profile image for user (no auth):", userId);
      
      if (!userId) {
        return { 
          url: '/default-avatar.png', 
          error: null 
        };
      }

      // First check if user has a profile image in database
      const { data: userData, error } = await supabase
        .from('users')
        .select('profile_image')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.log("ℹ️ User not found or no profile image:", error.message);
        return { 
          url: '/default-avatar.png', 
          error: null 
        };
      }

      // Return default if no image or invalid URL
      if (!userData?.profile_image || 
          userData.profile_image === 'null' || 
          userData.profile_image === 'undefined') {
        return { 
          url: '/default-avatar.png', 
          error: null 
        };
      }

      console.log("✅ Found profile image:", userData.profile_image);
      return { 
        url: userData.profile_image,
        error: null 
      };
    } catch (error) {
      console.error("❌ Exception getting profile image:", error);
      return { 
        url: '/default-avatar.png', 
        error: null 
      };
    }
  },

  // Delete profile image (NO AUTH REQUIRED)
  async deleteProfileImage(userId) {
    try {
      console.log("🗑️ Deleting profile image for user (no auth):", userId);
      
      if (!userId) {
        return { success: false, error: "User ID is required" }
      }

      // First, get current profile image to know which file to delete
      const { data: userData } = await supabase
        .from('users')
        .select('profile_image')
        .eq('user_id', userId)
        .single();

      if (userData?.profile_image) {
        // Extract filename from URL
        const urlParts = userData.profile_image.split('/')
        const filename = urlParts[urlParts.length - 1]
        
        if (filename) {
          // Remove from storage
          const { error: storageError } = await supabase.storage
            .from('avatars')
            .remove([`avatars/${filename}`])

          if (storageError) {
            console.warn("⚠️ Could not delete from storage:", storageError)
          }
        }
      }

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          profile_image: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error("❌ Update user error:", updateError)
        return { success: false, error: updateError.message }
      }

      console.log("✅ Profile image deleted successfully")
      return { success: true, error: null }
    } catch (error) {
      console.error("❌ Exception deleting profile image:", error)
      return { success: false, error: error.message }
    }
  },

  // Check if bucket exists
  async ensureBucketExists() {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()
      
      if (error) {
        console.error("❌ Error listing buckets:", error)
        return false
      }

      const avatarsBucket = buckets.find(b => b.name === 'avatars')
      
      if (!avatarsBucket) {
        console.log("📦 Creating avatars bucket...")
        const { error: createError } = await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        })
        
        if (createError) {
          console.error("❌ Error creating bucket:", createError)
          return false
        }
        
        console.log("✅ Avatars bucket created successfully")
      } else {
        console.log("✅ Avatars bucket already exists")
      }
      
      return true
    } catch (error) {
      console.error("❌ Exception ensuring bucket exists:", error)
      return false
    }
  }
}