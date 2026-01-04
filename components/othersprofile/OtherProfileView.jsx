"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react"; // ← Icon for back button

// Experience list item
function ExperienceItem({ exp }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
      <p className="font-semibold">{exp.title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {exp.company} • {exp.start_date} - {exp.end_date || "Present"}
      </p>
      {exp.description && (
        <p className="text-sm mt-1">{exp.description}</p>
      )}
    </div>
  );
}

export default function OtherProfileView({ user, onBack }) { // ✅ added onBack prop
  const [experience, setExperience] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchExperience = async () => {
      try {
        const res = await fetch(`/api/users/${user.user_id}/experience`);
        const data = await res.json();
        setExperience(Array.isArray(data) ? data : []); // always array
      } catch (err) {
        console.error("Error fetching experiences:", err);
        setExperience([]);
      }
    };

    fetchExperience();
  }, [user]);

  if (!user) return null;

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col gap-6 overflow-y-auto">

      {/* Back Button */}
      <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={onBack}>
        <ArrowLeft className="w-5 h-5 text-primary dark:text-accent" />
        <span className="text-sm font-semibold text-primary dark:text-accent">Homepage</span>
      </div>

      {/* Avatar + Name + Bio */}
      <div className="flex flex-col items-center">
        <div className="w-28 h-28 mb-2 relative">
          <img
            src={user.profile_image || "/default-avatar.png"}
            alt={user.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-primary dark:border-accent shadow-lg"
          />
        </div>
        <h2 className="text-2xl font-bold text-center">{user.name}</h2>
        {user.bio && (
          <p className="text-sm text-primary dark:text-accent font-semibold text-center mt-1">
            {user.bio}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 w-full justify-around text-center border-y border-gray-200 dark:border-gray-700 py-3">
        <div>
          <p className="text-lg font-bold text-primary dark:text-accent">
            {user.followers?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
        </div>
        <div>
          <p className="text-lg font-bold text-primary dark:text-accent">
            {user.following?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Following</p>
        </div>
      </div>

      {/* Public Info */}
      <div className="flex flex-col gap-3 text-sm">
        {user.email && (
          <div className="flex items-start gap-2">
            <span className="font-semibold text-primary dark:text-accent">
              Email:
            </span>
            <p className="text-xs">{user.email}</p>
          </div>
        )}
        {user.website && (
          <div className="flex items-start gap-2">
            <span className="font-semibold text-primary dark:text-accent">
              Website:
            </span>
            <p className="text-xs">{user.website}</p>
          </div>
        )}
        {user.location && (
          <div className="flex items-start gap-2">
            <span className="font-semibold text-primary dark:text-accent">
              Location:
            </span>
            <p className="text-xs">{user.location}</p>
          </div>
        )}
      </div>

      {/* Experiences */}
      <div className="flex flex-col gap-2 mt-4">
        <h3 className="text-lg font-bold text-text dark:text-text-dark">
          Experiences
        </h3>
        {experience.length === 0 && (
          <p className="text-gray-500 text-sm">No experiences added yet.</p>
        )}
        {experience.map((exp) => (
          <ExperienceItem key={exp.id} exp={exp} />
        ))}
      </div>
    </div>
  );
}
