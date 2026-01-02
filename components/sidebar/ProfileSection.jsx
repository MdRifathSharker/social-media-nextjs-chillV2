"use client";

import { useState, useRef } from "react";
import ProfileAvatar from "./profile/ProfileAvatar";
import ProfileStats from "./profile/ProfileStats";
import ProfileInfo from "./profile/ProfileInfo";
import ExperienceSection from "./profile/ExperienceSection";
import LogoutSection from "./profile/LogoutSection";

export default function ProfileSection({ currentUser }) {
  const dummyProfile = {
    name: "Rifath Sharker",
    headline: "Frontend Developer at Chill",
    profileImageUrl: "https://via.placeholder.com/150",
    followers: 1234,
    following: 567,
    email: "rifath@example.com",
    website: "www.rifath.com",
    location: "Dhaka, Bangladesh",
  };

  // ✅ ONLY this line adapts the name safely
  const profileName = currentUser?.name || dummyProfile.name;

  const [profileImage, setProfileImage] = useState(dummyProfile.profileImageUrl);
  const fileInputRef = useRef(null);

  const openImageModal = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImage(url);
    }
  };

  // Dummy logout function
  const handleLogout = () => {
    console.log("User logged out!");
    alert("Logout clicked!");
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Profile Picture */}
      <ProfileAvatar
        profileImageUrl={profileImage}
        name={profileName}
        headline={dummyProfile.headline}
        openImageModal={openImageModal}
      />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Stats */}
      <ProfileStats
        followers={dummyProfile.followers}
        following={dummyProfile.following}
      />

      {/* Profile Info */}
      <ProfileInfo
        profileData={{
          ...dummyProfile,
          name: profileName, // 👈 injected safely
        }}
      />

      {/* Experience */}
      <ExperienceSection />

      {/* Logout Button */}
      <LogoutSection handleLogout={handleLogout} />
    </div>
  );
}
