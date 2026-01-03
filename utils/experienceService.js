import { supabase } from "./supabaseClient";

export const experienceService = {
  // Fetch all experiences for a user
  async fetchUserExperiences(userId) {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("user_id", userId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      
      // Format data for display
      const formattedData = data.map(exp => 
        this.formatExperienceForDisplay(exp)
      );
      
      return { data: formattedData, error: null };
    } catch (error) {
      console.error("Error fetching experiences:", error.message);
      return { data: [], error };
    }
  },

  // Add new experience
  async addExperience(experienceData) {
    try {
      // Prepare data for Supabase (remove duration field, format dates)
      const supabaseData = {
        ...experienceData,
        // Ensure dates are in YYYY-MM-DD format
        start_date: this.formatDateForStorage(experienceData.start_date),
        end_date: experienceData.currently_working ? null : this.formatDateForStorage(experienceData.end_date),
        currently_working: experienceData.currently_working || false,
        // Remove duration field as it's calculated on display
        duration: undefined
      };
      
      // Remove any undefined fields
      Object.keys(supabaseData).forEach(key => 
        supabaseData[key] === undefined && delete supabaseData[key]
      );

      const { data, error } = await supabase
        .from("experiences")
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;
      
      // Format the returned data for display
      const formattedData = this.formatExperienceForDisplay(data);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error("Error adding experience:", error.message);
      return { data: null, error };
    }
  },

  // Update existing experience
  async updateExperience(expId, experienceData) {
    try {
      // Prepare data for Supabase
      const supabaseData = {
        ...experienceData,
        start_date: this.formatDateForStorage(experienceData.start_date),
        end_date: experienceData.currently_working ? null : this.formatDateForStorage(experienceData.end_date),
        currently_working: experienceData.currently_working || false,
        duration: undefined,
        updated_at: new Date().toISOString()
      };
      
      // Remove any undefined fields
      Object.keys(supabaseData).forEach(key => 
        supabaseData[key] === undefined && delete supabaseData[key]
      );

      const { data, error } = await supabase
        .from("experiences")
        .update(supabaseData)
        .eq("id", expId)
        .select()
        .single();

      if (error) throw error;
      
      const formattedData = this.formatExperienceForDisplay(data);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error("Error updating experience:", error.message);
      return { data: null, error };
    }
  },

  // Delete experience
  async deleteExperience(expId) {
    try {
      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", expId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error deleting experience:", error.message);
      return { error };
    }
  },

  // Format date for storage (YYYY-MM-DD)
  formatDateForStorage(dateString) {
    if (!dateString) return null;
    
    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse and format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  // Format experience for display
  formatExperienceForDisplay(exp) {
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
      // Calculate duration for display
      duration: this.getDurationString(exp.start_date, exp.end_date, exp.currently_working),
      user_id: exp.user_id,
      created_at: exp.created_at,
      updated_at: exp.updated_at,
      // Keep original data for editing
      originalData: exp
    };
  },

  // Get duration string for display
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