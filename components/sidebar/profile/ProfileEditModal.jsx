"use client";

import { useState, useEffect } from "react";

export default function ProfileEditModal({ profileData, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    email: "",
    website: "",
    location: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData({
      name: profileData.name || "",
      headline: profileData.headline || "",
      email: profileData.email || "",
      website: profileData.website || "",
      location: profileData.location || ""
    });
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await onSave(formData);
      if (!result.success) {
        setError(result.error || "Failed to update profile");
      }
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Headline</label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g., Frontend Developer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-100"
              disabled
              title="Email cannot be changed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="City, Country"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}