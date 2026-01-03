//app/home/page.js
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AllPostsButton from "@/components/buttons/AllPostsButton";
import MyPostsButton from "@/components/buttons/MyPostsButton";
import CreatePostButton from "@/components/buttons/CreatePostButton";
import Sidebar from "@/components/sidebar/Sidebar";
import SearchBar from "@/components/SearchBar";

import AllPostsContent from "@/components/newsfeed/AllPostsContent";
import MyPostsContent from "@/components/newsfeed/MyPostsContent";
import CreatePostContent from "@/components/newsfeed/CreatePostContent";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); 
  const [currentUser, setCurrentUser] = useState(null);

  // In HomePage component, update the useEffect:
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");
      
      console.log("🔄 HomePage useEffect - localStorage data:", {
        userId,
        userName,
        userEmail
      });

      if (userId && userEmail) {
        // Try to get full user data from localStorage
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
          // Use the complete user object
          setCurrentUser(userData);
          console.log("✅ CurrentUser set from localStorage:", userData);
        } else {
          // Create basic user object
          setCurrentUser({
            user_id: userId,
            name: userName,
            email: userEmail
          });
          console.log("✅ CurrentUser created from localStorage data");
        }
      } else {
        console.log("⚠️ No user data in localStorage, redirecting to login");
        // Redirect to login if no user data
        window.location.href = "/";
      }
    }
  }, []);


  return (
    <main className={`${darkMode ? "dark" : ""} min-h-screen w-screen bg-bg text-text transition-colors duration-500 overflow-hidden`}>
      
      {/* Top Bar: Logo + Dark Mode */}
      <div className="fixed top-0 left-0 w-full flex justify-between items-center p-4 bg-bg dark:bg-bg-dark z-50 shadow-md">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(prev => !prev)}
          className="px-4 py-2 bg-primary dark:bg-accent text-white rounded-lg shadow-md"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center">
          <SearchBar onSearch={(query) => console.log("Search query:", query)} />
        </div>

        {/* Logo */}
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

        {/* Left: Newsfeed */}
        <div className="w-3/4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg h-full flex flex-col">
          {/* Fixed buttons */}
          <div className="flex gap-2 mb-4 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 p-2 rounded">
            <AllPostsButton activeTab={activeTab} setActiveTab={setActiveTab} />
            <MyPostsButton activeTab={activeTab} setActiveTab={setActiveTab} />
            <CreatePostButton activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Scrollable newsfeed content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "all" && <AllPostsContent currentUser={currentUser} />}
            {activeTab === "my" && <MyPostsContent currentUser={currentUser} />}
            {activeTab === "create" && <CreatePostContent currentUser={currentUser} />}
          </div>

        </div>

        {/* Right: Sidebar */}
        <Sidebar currentUser={currentUser} />

      </div>
    </main>
  );
}
