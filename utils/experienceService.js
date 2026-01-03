// utils/experienceService.js
import { createClient } from '@supabase/supabase-js';

// Create Supabase client WITHOUT auth requirements
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const 
experienceService = {
  // Fetch all experiences for a user (NO AUTH REQUIRED)
  async fetchUserExperiences(userId) {
    try {
      console.log("📥 Fetching experiences for user (no auth):", userId);
      
      if (!userId) {
        console.warn("No user ID provided");
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("user_id", userId)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("❌ Error fetching experiences:", error);
        // Return empty array instead of throwing error
        return { data: [], error: null };
      }

      console.log(`✅ Found ${data?.length || 0} experiences`);
      
      // Format data for display
      const formattedData = (data || []).map(exp => 
        this.formatExperienceForDisplay(exp)
      );
      
      return { data: formattedData, error: null };
    } catch (error) {
      console.error("❌ Exception fetching experiences:", error);
      return { data: [], error: null }; // Always return empty array, never error
    }
  },

  // Add new experience (NO AUTH REQUIRED)
  async addExperience(experienceData) {
    try {
      console.log("➕ Adding experience (no auth):", experienceData);
      
      if (!experienceData.user_id) {
        console.error("No user_id in experience data");
        return { 
          data: null, 
          error: "User ID is required" 
        };
      }

      // Format dates properly
      const supabaseData = {
        title: experienceData.title?.trim() || '',
        company: experienceData.company?.trim() || '',
        employment_type: experienceData.employment_type || '',
        location: experienceData.location?.trim() || '',
        description: experienceData.description?.trim() || '',
        skills: experienceData.skills || [],
        start_date: this.formatDateForStorage(experienceData.start_date),
        currently_working: experienceData.currently_working || false,
        user_id: experienceData.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add end_date only if not currently working
      if (!experienceData.currently_working && experienceData.end_date) {
        supabaseData.end_date = this.formatDateForStorage(experienceData.end_date);
      }

      console.log("📤 Supabase data to insert:", supabaseData);

      const { data, error } = await supabase
        .from("experiences")
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase insert error:", error);
        return { 
          data: null, 
          error: error.message || "Failed to save experience" 
        };
      }
      
      const formattedData = this.formatExperienceForDisplay(data);
      console.log("✅ Experience added successfully");
      return { data: formattedData, error: null };
    } catch (error) {
      console.error("❌ Exception adding experience:", error);
      return { 
        data: null, 
        error: error.message || "Failed to save experience" 
      };
    }
  },

  // Update existing experience (NO AUTH REQUIRED)
  async updateExperience(expId, experienceData) {
    try {
      console.log("✏️ Updating experience ID (no auth):", expId);
      
      if (!expId) {
        return { 
          data: null, 
          error: "Experience ID is required" 
        };
      }

      // Format dates properly
      const supabaseData = {
        title: experienceData.title?.trim() || '',
        company: experienceData.company?.trim() || '',
        employment_type: experienceData.employment_type || '',
        location: experienceData.location?.trim() || '',
        description: experienceData.description?.trim() || '',
        skills: experienceData.skills || [],
        start_date: this.formatDateForStorage(experienceData.start_date),
        currently_working: experienceData.currently_working || false,
        updated_at: new Date().toISOString()
      };

      // Handle end_date based on currently_working
      if (experienceData.currently_working) {
        supabaseData.end_date = null;
      } else if (experienceData.end_date) {
        supabaseData.end_date = this.formatDateForStorage(experienceData.end_date);
      }

      console.log("📤 Supabase update data:", supabaseData);

      const { data, error } = await supabase
        .from("experiences")
        .update(supabaseData)
        .eq("id", expId)
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase update error:", error);
        return { data: null, error };
      }
      
      const formattedData = this.formatExperienceForDisplay(data);
      console.log("✅ Experience updated successfully");
      return { data: formattedData, error: null };
    } catch (error) {
      console.error("❌ Exception updating experience:", error);
      return { data: null, error };
    }
  },

  // Delete experience (NO AUTH REQUIRED)
  async deleteExperience(expId) {
    try {
      console.log("🗑️ Deleting experience ID (no auth):", expId);
      
      if (!expId) {
        return { error: "Experience ID is required" };
      }

      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", expId);

      if (error) {
        console.error("❌ Supabase delete error:", error);
        return { error };
      }
      
      console.log("✅ Experience deleted successfully");
      return { error: null };
    } catch (error) {
      console.error("❌ Exception deleting experience:", error);
      return { error };
    }
  },

  // Helper: Format date for storage (YYYY-MM-DD)
  formatDateForStorage(dateString) {
    if (!dateString) return null;
    
    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse and format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("⚠️ Invalid date:", dateString);
      return null;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  // Helper: Format experience for display
  formatExperienceForDisplay(exp) {
    if (!exp) return null;
    
    return {
      id: exp.id,
      title: exp.title || "",
      company: exp.company || "",
      employment_type: exp.employment_type || "",
      employmentType: exp.employment_type || "", // For backward compatibility
      location: exp.location || "",
      description: exp.description || "",
      skills: exp.skills || [],
      currently_working: exp.currently_working || false,
      start_date: exp.start_date,
      end_date: exp.end_date,
      duration: this.getDurationString(exp.start_date, exp.end_date, exp.currently_working),
      user_id: exp.user_id,
      created_at: exp.created_at,
      updated_at: exp.updated_at,
      originalData: exp
    };
  },

  // Helper: Get duration string for display
  getDurationString(startDate, endDate, currentlyWorking) {
    if (!startDate) return "";
    
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return "";
    
    const startStr = start.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    
    if (currentlyWorking) {
      return `${startStr} - Present`;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) return startStr;
      
      const endStr = end.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      return `${startStr} - ${endStr}`;
    }
    
    return startStr;
  }
};