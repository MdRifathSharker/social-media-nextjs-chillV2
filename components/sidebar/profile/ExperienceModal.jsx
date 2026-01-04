"use client";

import { useState, useEffect } from "react";

export default function ExperienceModal({
  showModal,
  setShowModal,
  formData,
  setFormData,
  skillInput,
  setSkillInput,
  editingIndex,
  saveExperience,
}) {
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    // Reset form when modal closes
    if (!showModal) {
      setDateError("");
    }
  }, [showModal]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear date error when changing dates
    if (name === "start_date" || name === "end_date") {
      setDateError("");
    }

    // If currently_working is checked, clear end_date
    if (name === "currently_working" && checked) {
      setFormData(prev => ({
        ...prev,
        end_date: "",
        currently_working: true
      }));
    }
  };

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Format date to YYYY-MM-DD for date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse and format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const validateDates = () => {
    // Validate required fields
    if (!formData.title?.trim()) {
      setDateError("Title is required");
      return false;
    }

    if (!formData.company?.trim()) {
      setDateError("Company is required");
      return false;
    }

    if (!formData.start_date) {
      setDateError("Start date is required");
      return false;
    }

    // Validate start date not in future
    const startDate = new Date(formData.start_date);
    const today = new Date();
    if (startDate > today) {
      setDateError("Start date cannot be in the future");
      return false;
    }

    if (!formData.currently_working) {
      if (!formData.end_date) {
        setDateError("End date is required if not currently working");
        return false;
      }

      // Validate end date not before start date
      const endDate = new Date(formData.end_date);
      if (endDate < startDate) {
        setDateError("End date must be after start date");
        return false;
      }

      // Validate end date not in future
      if (endDate > today) {
        setDateError("End date cannot be in the future");
        return false;
      }
    }

    setDateError("");
    return true;
  };

  const handleSave = () => {
    if (!validateDates()) {
      return;
    }

    // Call saveExperience with the form data
    // The service will handle date formatting for Supabase
    saveExperience(formData);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md my-4" style={{ maxHeight: 'calc(100vh - 40px)' }}>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <h2 className="text-xl font-bold mb-4">
            {editingIndex !== null ? "Edit Experience" : "Add Experience"}
          </h2>

          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Frontend Developer"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
                required
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="e.g., Chill"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
                required
              />
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Employment Type
              </label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
              >
                <option value="">Select Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
                <option value="Temporary">Temporary</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Remote, Dhaka"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formatDateForInput(formData.start_date)}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date
                  {!formData.currently_working && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formatDateForInput(formData.end_date)}
                  onChange={handleInputChange}
                  disabled={formData.currently_working}
                  // End date এর জন্য min/max রিমুভ করুন যেকোনো তারিখ সিলেক্ট করতে
                  className={`w-full p-2 border rounded bg-transparent ${
                    formData.currently_working
                      ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
              </div>
            </div>

            {/* Date Error Message */}
            {dateError && (
              <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded">
                {dateError}
              </div>
            )}

            {/* Currently Working */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="currently_working"
                name="currently_working"
                checked={formData.currently_working}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <label htmlFor="currently_working" className="text-sm">
                Currently working here
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your role and achievements..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
                rows="3"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-1">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a skill and press Enter"
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(i)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 rounded transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
              disabled={!!dateError}
            >
              {editingIndex !== null ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}