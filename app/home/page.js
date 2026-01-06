"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AllPostsButton from "@/components/buttons/AllPostsButton";
import MyPostsButton from "@/components/buttons/MyPostsButton";
import CreatePostButton from "@/components/buttons/CreatePostButton";
import Sidebar from "@/components/sidebar/Sidebar";
import SearchBarUI from "@/components/searchbar/searchbarUI";
import OtherProfileView from "@/components/othersprofile/OtherProfileView";

import AllPostsContent from "@/components/newsfeed/AllPostsContent";
import MyPostsContent from "@/components/newsfeed/MyPostsContent";
import CreatePostContent from "@/components/newsfeed/CreatePostContent";
import CreatePostContentV2 from "@/components/newsfeed/CreatePostContent-v2";
import MyPostsContentV2 from "@/components/newsfeed/MyPostsContent-v2";

import SharedPostsButton from "@/components/buttons/SharedPostsButton";
import SharedPostsContent from "@/components/newsfeed/SharedPostsContent";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); 
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");
      
      console.log("ðŸ“„ HomePage useEffect - localStorage data:", {
        userId,
        userName,
        userEmail
      });

      if (userId && userEmail) {
        const storedUser = localStorage.getItem('currentUser');
        let userData;
        
        if (storedUser) {
          try {
            userData = JSON.parse(storedUser);
          } catch (e) {
            console.error("Error parsing stored user:", e);
            userData = null;
          }
        }
        
        if (userData) {
          setCurrentUser(userData);
          console.log("âœ… CurrentUser set from localStorage:", userData);
        } else {
          setCurrentUser({
            user_id: userId,
            name: userName,
            email: userEmail
          });
          console.log("âœ… CurrentUser created from localStorage data");
        }
      } else {
        console.log("âš ï¸ No user data in localStorage, redirecting to login");
        window.location.href = "/";
      }
    }
  }, []);

  return (
    <main className={`${darkMode ? "dark" : ""} min-h-screen w-screen bg-bg text-text transition-colors duration-500 overflow-hidden`}>
      
      {/* Top Bar: Logo + Dark Mode */}
      <div className="fixed top-0 left-0 w-full flex justify-between items-center p-4 bg-bg dark:bg-bg-dark z-50 shadow-md">
        <button
          onClick={() => setDarkMode(prev => !prev)}
          className="px-4 py-2 bg-primary dark:bg-accent text-white rounded-lg shadow-md"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <div className="flex-1 flex justify-center">
          <SearchBarUI setSelectedProfile={setSelectedProfile} />
        </div>

        <div className="w-24 h-24 relative">
          <img
            src="/chill_logo.gif"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen pt-32 px-4 gap-4">

        {/* Left: Newsfeed or Selected Profile */}
        <div className="w-3/4 p-4 rounded-lg h-full flex flex-col">
          {selectedProfile ? (
            <OtherProfileView 
              user={selectedProfile}
              onBack={() => setSelectedProfile(null)}
              setSelectedProfile={setSelectedProfile}
            />
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg h-full flex flex-col">
              {/* Fixed buttons */}
              <div className="flex gap-2 mb-4 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 p-2 rounded">
                <AllPostsButton activeTab={activeTab} setActiveTab={setActiveTab} />
                <MyPostsButton activeTab={activeTab} setActiveTab={setActiveTab} />
                <CreatePostButton activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>

              {/* Scrollable newsfeed content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "all" && <AllPostsContent currentUser={currentUser} setSelectedProfile={setSelectedProfile} />}
                {activeTab === "my" && <MyPostsContentV2 currentUser={currentUser} />}
                {activeTab === "create" && <CreatePostContentV2 currentUser={currentUser} />}
                {activeTab === "shared" && <SharedPostsContent currentUser={currentUser} />}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <Sidebar currentUser={currentUser} setSelectedProfile={setSelectedProfile} />

      </div>
    </main>
  );
}
