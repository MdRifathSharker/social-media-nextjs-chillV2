//components/sidebar/profile/ExperienceSection.jsx
"use client";

import { useState, useEffect } from "react";
import ExperienceItem from "@/components/sidebar/lists/ExperienceItem";
import ExperienceModal from "./ExperienceModal";  // ✅ Same folder, so use ./
import { experienceService } from "@/utils/experienceService";

export default function ExperienceSection({ currentUser }) {
  const [expandedExp, setExpandedExp] = useState(null);
  const [experience, setExperience] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    employment_type: "",
    start_date: "",
    end_date: "",
    currently_working: false,
    location: "",
    description: "",
    skills: [],
  });
  const [skillInput, setSkillInput] = useState("");

  // Get user ID from multiple sources
  const getUserId = () => {
    // First try from currentUser prop
    if (currentUser?.user_id) {
      return currentUser.user_id;
    }
    
    // Then try localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("userId") || 
             localStorage.getItem("user_id") || 
             localStorage.getItem("id");
    }
    
    return null;
  };

  // Fetch experiences on component mount
  useEffect(() => {
    const userId = currentUser?.user_id || getUserId();
    if (userId) {
      fetchExperiences(userId);
    } else {
      console.log("No user ID available for fetching experiences");
    }
  }, [currentUser]);

  const fetchExperiences = async (userId) => {
    if (!userId) {
      console.error("Cannot fetch experiences: No user ID");
      return;
    }
    
    setLoading(true);
    const { data, error } = await experienceService.fetchUserExperiences(userId);
    
    if (!error && data) {
      const formattedData = data.map(exp => 
        experienceService.formatExperienceForDisplay(exp)
      );
      setExperience(formattedData);
      console.log("Fetched experiences:", formattedData.length);
    } else if (error) {
      console.error("Failed to fetch experiences:", error.message);
      if (data === null && error.message.includes("JSON")) {
        setExperience([]);
      }
    }
    setLoading(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      employment_type: "",
      start_date: "",
      end_date: "",
      currently_working: false,
      location: "",
      description: "",
      skills: [],
    });
    setSkillInput("");
    setEditingIndex(null);
  };

  // Open modal for adding new experience
  const openAddModal = () => {
    const userId = getUserId();
    if (!userId) {
      alert("Please log in to add experiences");
      return;
    }
    resetForm();
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (index) => {
    const userId = getUserId();
    if (!userId) {
      alert("Please log in to edit experiences");
      return;
    }
    
    const exp = experience[index];
    const originalExp = exp.originalData || exp;
    
    setFormData({
      title: originalExp.title || "",
      company: originalExp.company || "",
      employment_type: originalExp.employment_type || originalExp.employmentType || "",
      start_date: originalExp.start_date || "",
      end_date: originalExp.end_date || "",
      currently_working: originalExp.currently_working || false,
      location: originalExp.location || "",
      description: originalExp.description || "",
      skills: originalExp.skills || [],
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  // Save experience (Add or Update)
    // Save experience (Add or Update)
  const saveExperience = async (experienceData) => {
    // Get user ID
    const userId = getUserId();
    if (!userId) {
      alert("User not logged in! Please log in again.");
      return;
    }

    // Prepare data for service
    const dataForService = {
      ...experienceData,
      user_id: userId,
    };

    console.log("Saving experience for user:", userId);
    console.log("Experience data:", dataForService);

    setLoading(true);
    
    try {
      let result;
      
      if (editingIndex !== null) {
        // Update existing experience
        const expId = experience[editingIndex].id;
        console.log("Updating experience ID:", expId);
        result = await experienceService.updateExperience(expId, dataForService);
      } else {
        // Insert new experience
        console.log("Adding new experience");
        result = await experienceService.addExperience(dataForService);
      }

      if (result.error) {
        console.error("Supabase error:", result.error);
        throw new Error(result.error.message || "Failed to save experience");
      }

      console.log("Save successful, refreshing list...");
      await fetchExperiences(userId);
      setShowModal(false);
      resetForm();
      alert(editingIndex !== null ? "Experience updated successfully!" : "Experience added successfully!");
    } catch (error) {
      console.error("Error saving experience:", error);
      alert(`Failed to save experience: ${error.message}`);
    } finally {
    setLoading(false);
    }
  };
  // Delete experience
  const deleteExperience = async (index) => {
    const userId = getUserId();
    if (!userId) {
      alert("Please log in to delete experiences");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this experience?")) {
      return;
    }

    const expId = experience[index].id;
    console.log("Deleting experience ID:", expId);

    setLoading(true);
    const { error } = await experienceService.deleteExperience(expId);
    
    if (error) {
      console.error("Error deleting experience:", error.message);
      alert("Failed to delete experience. Please try again.");
    } else {
      console.log("Delete successful, refreshing list...");
      await fetchExperiences(userId);
      alert("Experience deleted successfully!");
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full mt-4">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-text dark:text-text-dark">
          Experience
        </h3>
        <button
          onClick={openAddModal}
          className="px-3 py-1 text-xs font-semibold rounded-lg text-white hover:opacity-90 transition"
          style={{ backgroundColor: "#3EB489" }}
          disabled={loading}
        >
          {loading ? "Loading..." : "+ Add"}
        </button>
      </div>

      {/* User ID Info (for debugging) */}
      <div className="text-xs text-gray-500 mb-2">
        User: {getUserId() ? `Logged in (${getUserId().substring(0, 8)}...)` : "Not logged in"}
      </div>

      {/* Loading State */}
      {loading && experience.length === 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Loading experiences...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && experience.length === 0 && (
        <div className="text-center py-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            No experiences added yet.
          </p>
          <button
            onClick={openAddModal}
            className="mt-2 px-4 py-2 text-sm bg-primary dark:bg-accent text-white rounded hover:opacity-90 transition"
          >
            Add Your First Experience
          </button>
        </div>
      )}

      {/* Experience List */}
      {!loading && experience.length > 0 && (
        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
          {experience.map((exp, index) => (
            <ExperienceItem
              key={exp.id || index}
              exp={exp}
              index={index}
              expandedExp={expandedExp}
              setExpandedExp={setExpandedExp}
              onEdit={() => openEditModal(index)}
              onDelete={() => deleteExperience(index)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <ExperienceModal
        showModal={showModal}
        setShowModal={setShowModal}
        formData={formData}
        setFormData={setFormData}
        skillInput={skillInput}
        setSkillInput={setSkillInput}
        editingIndex={editingIndex}
        saveExperience={saveExperience}
      />
    </div>
  );
}