// components/othersprofile/OtherProfileView.jsx
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User } from "lucide-react";
import OthersProfileInfo from "./OthersProfileInfo";
import ProfileHeader from "./ProfileHeader";
import OtherExperienceSection from "./OtherExperienceSection";
import { getCompleteOtherUserData } from "@/utils/otherProfileService";

export default function OtherProfileView({ user: initialUser, onBack }) {
  const [user, setUser] = useState(initialUser);
  const [experience, setExperience] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get current user ID from localStorage
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId);
  }, []);

  useEffect(() => {
    if (!user?.user_id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // ✅ CHANGED: Using new service to fetch all data at once
        const result = await getCompleteOtherUserData(user.user_id, currentUserId);
        
        if (result.success) {
          setUser(prev => ({ ...prev, ...result.user }));
          setExperience(result.experiences || []);
          setIsFollowing(result.isFollowing);
          
          // ✅ NEW: Update localStorage with latest data
          localStorage.setItem(`user_${user.user_id}`, JSON.stringify(result.user));
        } else {
          console.error("Failed to fetch user data:", result.error);
          setExperience([]);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setExperience([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.user_id, currentUserId]);

  if (!user) return null;

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    }
  };

  // ✅ NEW: Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUserId) {
      alert("Please login to follow users");
      return;
    }

    try {
      setIsLoading(true);
      
      if (isFollowing) {
        // Unfollow user
        const { success } = await unfollowUser(currentUserId, user.user_id);
        if (success) {
          setIsFollowing(false);
          setUser(prev => ({
            ...prev,
            followers_count: Math.max(0, (prev.followers_count || 1) - 1)
          }));
        }
      } else {
        // Follow user
        const { success } = await followUser(currentUserId, user.user_id);
        if (success) {
          setIsFollowing(true);
          setUser(prev => ({
            ...prev,
            followers_count: (prev.followers_count || 0) + 1
          }));
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert("Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl flex flex-col overflow-hidden shadow-lg">
      {/* Top Header with Back Button and Small Profile */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button 
            onClick={handleBackClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                     transition-colors group"
            disabled={isLoading}
          >
            <ArrowLeft className="w-5 h-5 text-primary dark:text-accent group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-primary dark:text-accent">Back to Home</span>
          </button>

          {/* Small Profile Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-text dark:text-text-dark">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Viewing Profile</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary dark:border-accent overflow-hidden">
              <img
                src={user.profile_image || "/default-avatar.png"}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Profile Header Section */}
          <div className="flex flex-col items-center mb-10">
            <ProfileHeader 
              user={user} 
              isFollowing={isFollowing} 
              onFollowToggle={handleFollowToggle} // ✅ CHANGED: Added handler
              isLoading={isLoading}
            />
          </div>

          {/* Two Column Layout with Equal Height */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Profile Information */}
            <div className="flex flex-col h-full">
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 
                            rounded-2xl p-6 h-full shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 dark:bg-accent/10">
                    <User className="w-5 h-5 text-primary dark:text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-text dark:text-text-dark">
                    Personal Information
                  </h3>
                </div>
                <OthersProfileInfo profileData={user} />
              </div>
            </div>

            {/* Right Column - Experiences */}
            <div className="flex flex-col h-full">
              {isLoading ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-accent mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading experiences...</p>
                  </div>
                </div>
              ) : (
                <OtherExperienceSection experience={experience} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ NEW: Import follow functions
import { followUser, unfollowUser } from "@/utils/followService";

