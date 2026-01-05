// components/othersprofile/OtherProfileView.jsx
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, User } from "lucide-react";
import OthersProfileInfo from "./OthersProfileInfo";
import ProfileHeader from "./ProfileHeader";
import OtherExperienceSection from "./OtherExperienceSection";
import FlexiblePost from "@/components/FlexiblePost";
import { getUserPosts } from "@/utils/posts";
import { getCompleteOtherUserData } from "@/utils/otherProfileService";
import { getPostsSharedByUser } from "@/utils/shares";
import { followUser, unfollowUser } from "@/utils/followService";

export default function OtherProfileView({ user: initialUser, onBack }) {
  const [user, setUser] = useState(initialUser);
  const [experience, setExperience] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId);
  }, []);

  useEffect(() => {
    if (!initialUser?.user_id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("🔍 Fetching data for user:", initialUser.user_id);

        // Get user profile and follow status
        const completeResult = await getCompleteOtherUserData(initialUser.user_id, currentUserId);
        
        if (completeResult.success) {
          setUser(prev => ({ ...prev, ...completeResult.user }));
          setExperience(completeResult.experiences || []);
          setIsFollowing(completeResult.isFollowing || false);
        }

        // Get their posts
        const postsResult = await getUserPosts(initialUser.user_id);
        if (postsResult.success) {
          setPosts(postsResult.posts || []);
        }

        // ✅ Get posts THEY shared (NEW)
        console.log("📤 Fetching posts shared BY this user:", initialUser.user_id);
        const sharedResult = await getPostsSharedByUser(initialUser.user_id);
        console.log("📤 Shared posts result:", sharedResult);
        
        if (sharedResult.success) {
          setSharedPosts(sharedResult.posts || []);
        }

      } catch (err) {
        console.error("❌ Error fetching profile data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [initialUser?.user_id, currentUserId]);

  if (!user) return null;

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUserId) {
      alert("Please login to follow users");
      return;
    }

    try {
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
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl flex flex-col overflow-hidden shadow-lg">
      {/* Top Header with Back Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button 
            onClick={handleBackClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
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
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
          
          {/* Profile Header Section */}
          <div className="flex flex-col items-center">
            <ProfileHeader 
              user={user} 
              isFollowing={isFollowing} 
              onFollowToggle={handleFollowToggle}
              isLoading={isLoading}
            />
          </div>

          {/* Two Column Layout: Info + Experience */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Profile Information */}
            <div className="flex flex-col h-full">
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 h-full shadow-md">
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

          {/* Posts Section */}
          <div className="w-full">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-6 text-text dark:text-text-dark">
                Posts ({posts.length})
              </h3>
              
              {posts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No posts yet</p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <FlexiblePost
                      key={post.id}
                      name={user.name}
                      username={user.email?.split("@")[0] || "@user"}
                      image={post.image_url || null}
                      caption={post.content || null}
                      profileImage={user.profile_image}
                      postId={post.id}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ✅ Shared Posts Section (NEW) */}
          <div className="w-full">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-6 text-text dark:text-text-dark">
                📤 Shared Posts ({sharedPosts.length})
              </h3>
              
              {sharedPosts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No shared posts</p>
              ) : (
                <div className="space-y-4">
                  {sharedPosts.map((share) => {
                    if (!share.posts) return null;
                    
                    const post = share.posts;
                    const author = post.users;

                    return (
                      <div key={share.share_id} className="space-y-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                          {author?.name}'s post {share.share_type === 'all' ? '📢 shared with all followers' : '🔗 shared'}
                        </div>

                        <FlexiblePost
                          name={author?.name || "Unknown"}
                          username={author?.email?.split("@")[0] || "@user"}
                          image={post.image_url || null}
                          caption={post.content || null}
                          profileImage={author?.profile_image}
                          postId={post.id}
                          currentUserId={currentUserId}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
