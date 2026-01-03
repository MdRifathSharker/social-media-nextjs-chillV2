//components/sidebar/profile/ExperienceSection.jsx
"use client";

import { useState, useEffect } from "react";
import ExperienceItem from "@/components/sidebar/lists/ExperienceItem";
import ExperienceModal from "./ExperienceModal";  // ✅ Same folder, so use ./
import { experienceService  } from "@/utils/experienceService";

// components/sidebar/profile/ExperienceSection.jsx

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

  // Get user ID from currentUser or localStorage
  const getUserId = () => {
    if (currentUser?.user_id) {
      console.log("✅ Using user_id from currentUser:", currentUser.user_id);
      return currentUser.user_id;
    }
    
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      console.log("📝 Using user_id from localStorage:", userId);
      return userId;
    }
    
    console.warn("⚠️ No user ID found");
    return null;
  };

  // Fetch experiences
  useEffect(() => {
    const userId = getUserId();
    console.log("🔄 ExperienceSection useEffect - userId:", userId);
    
    if (userId) {
      fetchExperiences(userId);
    } else {
      console.log("⚠️ No user ID available for fetching experiences");
      setExperience([]);
    }
  }, [currentUser]);

  const fetchExperiences = async (userId) => {
    console.log("📥 Calling fetchExperiences for userId:", userId);
    setLoading(true);
    
    const { data, error } = await experienceService.fetchUserExperiences(userId);
    
    if (!error && data) {
      console.log(`✅ Fetched ${data.length} experiences`);
      setExperience(data);
    } else {
      console.log("ℹ️ No experiences found or error:", error?.message);
      setExperience([]);
    }
    setLoading(false);
  };

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

  const openAddModal = () => {
    const userId = getUserId();
    if (!userId) {
      alert("⚠️ Please log in to add experiences");
      return;
    }
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (index) => {
    const userId = getUserId();
    if (!userId) {
      alert("⚠️ Please log in to edit experiences");
      return;
    }
    
    const exp = experience[index];
    
    setFormData({
      title: exp.title || "",
      company: exp.company || "",
      employment_type: exp.employment_type || "",
      start_date: exp.start_date || "",
      end_date: exp.end_date || "",
      currently_working: exp.currently_working || false,
      location: exp.location || "",
      description: exp.description || "",
      skills: exp.skills || [],
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  const saveExperience = async (experienceData) => {
    const userId = getUserId();
    if (!userId) {
      alert("⚠️ Please log in to save experiences");
      return;
    }

    const dataForService = {
      ...experienceData,
      user_id: userId,
    };

    console.log("💾 Saving experience for user:", userId);
    setLoading(true);
    
    try {
      let result;
      
      if (editingIndex !== null) {
        const expId = experience[editingIndex].id;
        console.log("✏️ Updating experience ID:", expId);
        result = await experienceService.updateExperience(expId, dataForService);
      } else {
        console.log("➕ Adding new experience");
        result = await experienceService.addExperience(dataForService);
      }

      if (result.error) {
        console.error("❌ Save error:", result.error);
        alert(`Error: ${result.error}`);
      } else {
        console.log("✅ Save successful, refreshing list...");
        await fetchExperiences(userId);
        setShowModal(false);
        resetForm();
        alert(editingIndex !== null ? "✅ Experience updated!" : "✅ Experience added!");
      }
    } catch (error) {
      console.error("❌ Error saving experience:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteExperience = async (index) => {
    const userId = getUserId();
    if (!userId) {
      alert("⚠️ Please log in to delete experiences");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this experience?")) {
      return;
    }

    const expId = experience[index].id;
    setLoading(true);
    
    const { error } = await experienceService.deleteExperience(expId);
    
    if (error) {
      alert(`❌ Failed to delete: ${error.message}`);
    } else {
      await fetchExperiences(userId);
      alert("✅ Deleted successfully!");
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full mt-4">
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
          {loading ? "..." : "+ Add"}
        </button>
      </div>

      {/* Debug info */}
      <div className="text-xs text-gray-500 mb-2">
        User ID: {getUserId() ? `${getUserId().substring(0, 8)}...` : "Not found"}
      </div>

      {loading && experience.length === 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Loading experiences...
          </p>
        </div>
      )}

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