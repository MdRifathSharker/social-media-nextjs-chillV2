"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import ProfileInfo from "./otherProfileInfo";
import ProfileHeader from "./ProfileHeader";
import ExperienceSection from "./ExperienceSectionOthers";

export default function OtherProfileView({ user, onBack }) {
  const [experience, setExperience] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchExperience = async () => {
      try {
        const res = await fetch(`/api/users/${user.user_id}/experience`);
        const data = await res.json();
        setExperience(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching experiences:", err);
        setExperience([]);
      }
    };

    fetchExperience();
  }, [user]);

  if (!user) return null;

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg flex flex-col overflow-hidden">

      {/* Top Row: Back Button in same row with Profile Image */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary dark:text-accent" />
            <span className="text-sm font-semibold text-primary dark:text-accent">Homepage</span>
          </button>

          {/* Profile Image (Small version for top row) */}
          <div className="w-10 h-10">
            <img
              src={user.profile_image || "/default-avatar.png"}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary dark:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Profile Header Section */}
        <div className="flex flex-col items-center mb-8">
          <ProfileHeader 
            user={user} 
            isFollowing={isFollowing} 
            setIsFollowing={setIsFollowing} 
          />
        </div>

        {/* Two Column Layout with Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Profile Information */}
          <div className="flex flex-col">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 h-full">
              <h3 className="text-lg font-bold mb-4 text-text dark:text-text-dark">
                Information
              </h3>
              <ProfileInfo profileData={user} />
            </div>
          </div>

          {/* Right Column - Experiences */}
          <div className="flex flex-col">
            <ExperienceSection experience={experience} />
          </div>
        </div>
      </div>
    </div>
  );
}