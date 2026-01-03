// Changed: Added edit button next to name, integrated with Supabase
"use client";

import { useState, useRef, useEffect } from "react";
import ProfileAvatar from "./profile/ProfileAvatar";
import ProfileStats from "./profile/ProfileStats";
import ProfileInfo from "./profile/ProfileInfo";
import ExperienceSection from "./profile/ExperienceSection";
import LogoutSection from "./profile/LogoutSection";
import ProfileEditModal from "./profile/ProfileEditModal";

// components/sidebar/ProfileSection.jsx

import { fetchUserProfile, updateUserProfile, logoutUserFromSupabase } from "@/utils/profileService";

export default function ProfileSection({ currentUser }) {
  const [profileData, setProfileData] = useState({
    name: "",
    headline: "",
    email: "",
    website: "",
    location: "",
    followers: 1234,
    following: 567,
    profileImageUrl: "https://via.placeholder.com/150"
  });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Fetch user profile data from Supabase
  useEffect(() => {
    if (currentUser?.user_id) {
      fetchUserProfileData();
    } else {
      // Use localStorage data if available
      if (typeof window !== "undefined") {
        const userName = localStorage.getItem("userName");
        const userEmail = localStorage.getItem("userEmail");
        
        setProfileData(prev => ({
          ...prev,
          name: userName || "No Name",
          email: userEmail || "",
          // Use name for headline if no headline
          headline: userName ? `${userName}'s Profile` : "Frontend Developer"
        }));
        setLoading(false);
      }
    }
  }, [currentUser]);

  const fetchUserProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch from users table using service
      const { data, error } = await fetchUserProfile(currentUser.user_id);

      if (error) throw error;

      setProfileData({
        name: data.name || currentUser.name || "No Name",
        headline: data.bio || "Frontend Developer",
        email: data.email || currentUser.email || "",
        website: data.website || "",
        location: data.location || "",
        followers: data.followers_count || 1234,
        following: data.following_count || 567,
        profileImageUrl: data.profile_image || "https://via.placeholder.com/150"
      });

    } catch (error) {
      console.error("Error fetching profile:", error);
      
      // Fallback to localStorage data
      if (typeof window !== "undefined") {
        const userName = localStorage.getItem("userName");
        const userEmail = localStorage.getItem("userEmail");
        
        setProfileData(prev => ({
          ...prev,
          name: userName || "No Name",
          email: userEmail || "",
          headline: "Frontend Developer"
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, profileImageUrl: url }));
      // Here you would upload to Supabase Storage
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      // Use service to update profile
      const { data, error } = await updateUserProfile(currentUser.user_id, {
        name: updatedData.name,
        bio: updatedData.headline,
        website: updatedData.website,
        location: updatedData.location
      });

      if (error) throw error;

      // Update local state
      setProfileData(prev => ({
        ...prev,
        ...updatedData
      }));

      // Update localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("userName", updatedData.name);
      }

      setShowEditModal(false);
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      // Clear all auth data
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('session');
      
      // Clear Supabase session using service
      await logoutUserFromSupabase();
    }
    
    console.log("User logged out!");
    alert("Logged out successfully!");
    window.location.href = "/"; // Redirect to login page
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Profile Picture with Edit Button */}
      <div className="relative">
        <ProfileAvatar
          profileImageUrl={profileData.profileImageUrl}
          name={profileData.name}
          headline={profileData.headline}
          openImageModal={openImageModal}
        />
        
        {/* Edit Button next to name */}
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute top-0 right-0 p-2 bg-primary text-white rounded-full hover:opacity-90 transition-opacity"
          title="Edit Profile"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 4h2m2 2l4 4-10 10H5v-4L15 6z"
            />
          </svg>
        </button>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Stats */}
      <ProfileStats
        followers={profileData.followers}
        following={profileData.following}
      />

      {/* Profile Info */}
      <ProfileInfo
        profileData={{
          email: profileData.email,
          website: profileData.website,
          location: profileData.location
        }}
      />

      {/* Experience */}
      <ExperienceSection currentUser={currentUser} />

      {/* Logout Button */}
      <LogoutSection handleLogout={handleLogout} />

      {/* Profile Edit Modal */}
      {showEditModal && (
        <ProfileEditModal
          profileData={profileData}
          onSave={handleUpdateProfile}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}