// Changed: Added edit button next to name, integrated with Supabase
"use client";

import { useState, useRef, useEffect } from "react";
import ProfileAvatar from "./profile/ProfileAvatar";
import ProfileStats from "./profile/ProfileStats";
import ProfileInfo from "./profile/ProfileInfo";
import ExperienceSection from "./profile/ExperienceSection"; // Use no-auth version
import LogoutSection from "./profile/LogoutSection";
import ProfileEditModal from "./profile/ProfileEditModal";

// components/sidebar/ProfileSection.jsx
// components/sidebar/profile/ProfileSection.jsx

import { fetchUserProfile, updateUserProfile } from "@/utils/profileService";
import { storageService } from "@/utils/storageService";

export default function ProfileSection({ currentUser }) {
  const [profileData, setProfileData] = useState({
    name: "",
    headline: "",
    email: "",
    website: "",
    location: "",
    followers: 0,
    following: 0,
    profileImageUrl: "/default-avatar.png"
  });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("🔄 ProfileSection useEffect - currentUser:", currentUser);
    fetchUserData();
    
    // Ensure storage bucket exists on load
    storageService.ensureBucketExists();
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const userId = getUserId();
      console.log("👤 Fetching data for userId:", userId);
      
      if (!userId) {
        // Try to get from localStorage
        const userName = localStorage.getItem("userName");
        const userEmail = localStorage.getItem("userEmail");
        
        console.log("📝 Using localStorage data:", { userName, userEmail });
        
        setProfileData(prev => ({
          ...prev,
          name: userName || "User",
          email: userEmail || "",
          headline: "Welcome!"
        }));
        setLoading(false);
        return;
      }

      // Fetch profile from database
      const { data, error } = await fetchUserProfile(userId);
      
      if (error) {
        console.error("❌ Profile fetch error:", error);
        // Use data from localStorage
        const userName = localStorage.getItem("userName") || "User";
        setProfileData(prev => ({
          ...prev,
          name: userName,
          headline: `${userName}'s Profile`
        }));
      } else if (data) {
        console.log("✅ Profile data fetched:", data);
        
        // Get profile image
        const { url: imageUrl } = await storageService.getProfileImageUrl(userId);

        setProfileData({
          name: data.name || "User",
          headline: data.bio || "Frontend Developer",
          email: data.email || "",
          website: data.website || "",
          location: data.location || "",
          followers: data.followers_count || 0,
          following: data.following_count || 0,
          profileImageUrl: imageUrl
        });
      }

    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      // Set default data
      const userName = localStorage.getItem("userName") || "User";
      setProfileData(prev => ({
        ...prev,
        name: userName,
        headline: `${userName}'s Profile`
      }));
    } finally {
      setLoading(false);
    }
  };

  const getUserId = () => {
    if (currentUser?.user_id) {
      console.log("✅ Using user_id from currentUser prop:", currentUser.user_id);
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

  const openImageModal = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userId = getUserId();
    if (!userId) {
      alert("⚠️ Please log in to upload images");
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("⚠️ Please select an image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    
    try {
      const result = await storageService.uploadProfileImage(userId, file);
      
      if (result.success) {
        console.log("✅ Image uploaded successfully:", result.url);
        setProfileData(prev => ({ 
          ...prev, 
          profileImageUrl: result.url 
        }));
        alert("✅ Profile image updated successfully!");
      } else {
        console.error("❌ Upload failed:", result.error);
        alert(`❌ Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert("❌ Upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error("⚠️ Please log in to update profile");
      }

      console.log("✏️ Updating profile for userId:", userId);
      
      const { data, error } = await updateUserProfile(userId, {
        name: updatedData.name,
        bio: updatedData.headline,
        website: updatedData.website,
        location: updatedData.location
      });

      if (error) throw error;

      console.log("✅ Profile updated successfully");
      
      setProfileData(prev => ({
        ...prev,
        ...updatedData
      }));

      if (typeof window !== "undefined") {
        localStorage.setItem("userName", updatedData.name);
      }

      setShowEditModal(false);
      return { success: true };
    } catch (error) {
      console.error("❌ Update error:", error);
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    
    alert("✅ Logged out successfully!");
    window.location.href = "/";
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
      {/* Profile Picture */}
      <div className="relative">
        <ProfileAvatar
          profileImageUrl={profileData.profileImageUrl}
          name={profileData.name}
          headline={profileData.headline}
          openImageModal={openImageModal}
        />
        
        {uploadingImage && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute top-0 right-0 p-2 bg-primary text-white rounded-full hover:opacity-90 transition"
          title="Edit Profile"
          disabled={uploadingImage}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4h2m2 2l4 4-10 10H5v-4L15 6z" />
          </svg>
        </button>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={uploadingImage}
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

      {/* Experience - Use no-auth version */}
      <ExperienceSection currentUser={currentUser} />

      {/* Logout */}
      <LogoutSection handleLogout={handleLogout} />

      {/* Edit Modal */}
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