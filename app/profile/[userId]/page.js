"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import FlexiblePost from "@/components/FlexiblePost";
import { getUserPosts, getUserProfile } from "@/utils/posts";
import { getFollowersCount } from "@/utils/shares";
import { isUserFollowing, toggleFollow } from "@/utils/follow";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId;

  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current logged in user
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const profileResult = await getUserProfile(userId);
        if (!profileResult.success) {
          setError("User not found");
          setLoading(false);
          return;
        }

        setUserProfile(profileResult.user);

        // Fetch user's posts
        const postsResult = await getUserPosts(userId);
        setUserPosts(postsResult.posts || []);

        // Fetch followers count
        const followersResult = await getFollowersCount(userId);
        setFollowersCount(followersResult.count || 0);

        // Check if current user is following this profile
        if (currentUserId && currentUserId !== userId) {
          const followingResult = await isUserFollowing(currentUserId, userId);
          if (followingResult.success) {
            setIsFollowing(followingResult.isFollowing);
          }
        }

      } catch (err) {
        console.error("Error loading user data:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId, currentUserId]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUserId) {
      alert("Please login to follow users");
      return;
    }

    try {
      setLoadingFollow(true);
      const result = await toggleFollow(currentUserId, userId);

      if (result.success) {
        setIsFollowing(result.isFollowing);
        // Update followers count
        if (result.isFollowing) {
          setFollowersCount(followersCount + 1);
        } else {
          setFollowersCount(Math.max(0, followersCount - 1));
        }
      } else {
        alert(result.error || "Failed to update follow status");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert("Error updating follow status");
    } finally {
      setLoadingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{error || "User not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold">{userProfile.name}'s Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-3 gap-6">
        {/* Left: Posts (2/3 width) */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Posts ({userPosts.length})</h2>

            {userPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No posts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <FlexiblePost
                    key={post.id}
                    name={userProfile.name}
                    username={userProfile.email?.split("@")[0] || "@user"}
                    image={post.image_url || null}
                    caption={post.content || null}
                    profileImage={userProfile.profile_image}
                    postId={post.id}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Profile Info (1/3 width) */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow sticky top-24">
            {/* Profile Picture */}
            <div className="text-center mb-6">
              <img
                src={userProfile.profile_image || `https://i.pravatar.cc/150?u=${userProfile.email}`}
                alt={userProfile.name}
                className="w-24 h-24 rounded-full mx-auto object-cover mb-4"
              />
              <h2 className="text-xl font-bold">{userProfile.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">@{userProfile.email?.split("@")[0]}</p>
            </div>

            {/* Follow Button - Only show if not viewing own profile */}
            {currentUserId && currentUserId !== userId && (
              <button
                onClick={handleFollowToggle}
                disabled={loadingFollow}
                className={`w-full px-4 py-2 rounded-lg font-semibold mb-4 transition disabled:opacity-50 ${
                  isFollowing
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-400'
                    : 'bg-primary text-white hover:opacity-90'
                }`}
              >
                {loadingFollow ? (
                  <>
                    <span className="animate-spin">⏳</span> {isFollowing ? 'Unfollowing...' : 'Following...'}
                  </>
                ) : (
                  isFollowing ? '✓ Following' : '+ Follow'
                )}
              </button>
            )}

            {/* Bio */}
            {userProfile.bio && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">{userProfile.bio}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-lg font-bold">{userPosts.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{followersCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Email</p>
              <p className="text-sm break-all">{userProfile.email}</p>
            </div>

            {/* Website */}
            {userProfile.website && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Website</p>
                <a
                  href={userProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  {userProfile.website}
                </a>
              </div>
            )}

            {/* Location */}
            {userProfile.location && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Location</p>
                <p className="text-sm">{userProfile.location}</p>
              </div>
            )}

            {/* Headline */}
            {userProfile.headline && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Headline</p>
                <p className="text-sm">{userProfile.headline}</p>
              </div>
            )}

            {/* Member Since */}
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Joined {new Date(userProfile.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
