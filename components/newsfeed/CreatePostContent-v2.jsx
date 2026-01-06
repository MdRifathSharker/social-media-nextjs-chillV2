"use client";

import { useState, useEffect, useRef } from "react";
import FlexiblePost from "@/components/FlexiblePost";
import { uploadPostImage, createPost, getUserProfile } from "@/utils/posts";

export default function CreatePostContentV2({ currentUser }) {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [userProfile, setUserProfile] = useState(null);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  
  // File input ref for resetting
  const fileInputRef = useRef(null);

  // Get current user from props or localStorage
  const user = currentUser || {
    name: typeof window !== 'undefined' ? localStorage.getItem("userName") || "User" : "User",
    user_id: typeof window !== 'undefined' ? localStorage.getItem("userId") : null,
    email: typeof window !== 'undefined' ? localStorage.getItem("userEmail") : null,
  };

  // Check if user is authenticated
  const isAuthenticated = !!user.user_id;

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        setFetchingProfile(false);
        return;
      }

      try {
        const result = await getUserProfile(user.user_id);
        if (result.success) {
          setUserProfile(result.user);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [user.user_id, isAuthenticated]);

  // Handle file input and preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }
  };

  // FIXED: Complete form reset function
  const resetForm = () => {
    setCaption("");
    setImageFile(null);
    setImagePreviewUrl(null);
    setShowPreview(false);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    console.log("✅ Form reset completed");
  };

  // Handle post submission
  const handleSubmitPost = async () => {
    // Validation
    if (!isAuthenticated) {
      setMessage({ type: "error", text: "Please login to create a post" });
      return;
    }

    // Either text or image is required
    if (!caption.trim() && !imageFile) {
      setMessage({ type: "error", text: "Please add either text or an image to your post!" });
      return;
    }

    console.log("Starting post creation with user_id:", user.user_id);

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let imageUrl = null;

      // Step 1: Upload image if provided
      if (imageFile) {
        console.log("Uploading image...");
        const uploadResult = await uploadPostImage(imageFile, user.user_id);
        
        if (!uploadResult.success) {
          console.error("Image upload failed:", uploadResult.error);
          setMessage({ type: "error", text: uploadResult.error });
          setIsLoading(false);
          return;
        }

        imageUrl = uploadResult.imageUrl;
        console.log("Image uploaded successfully:", imageUrl);
      }

      // Step 2: Create post in database
      console.log("Creating post with data:", { userId: user.user_id, contentLength: caption.length, hasImage: !!imageUrl });
      const postResult = await createPost({
        userId: user.user_id,
        content: caption,
        imageUrl: imageUrl,
      });

      if (!postResult.success) {
        console.error("Post creation failed:", postResult.error);
        setMessage({ type: "error", text: postResult.error });
        setIsLoading(false);
        return;
      }

      // Success!
      console.log("Post created successfully!");
      setMessage({ 
        type: "success", 
        text: "Post created successfully! 🎉 Refreshing..." 
      });

      // FIXED: Reset form after success
      resetForm();

      // FIXED: Reload page after 1.5 seconds to show new post
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error("Post creation error:", error);
      setMessage({ 
        type: "error", 
        text: "An error occurred while creating the post" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear image
  const handleClearImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Post Creation Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Create a Post</h3>

        {/* User info display */}
        {isAuthenticated && (
          <div className="flex items-center gap-3 text-sm opacity-70">
            <img
              src={userProfile?.profile_image || `https://i.pravatar.cc/40?u=${user.email || user.name}`}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>{userProfile?.name || user.name}</span>
          </div>
        )}

        {/* Authentication warning */}
        {!isAuthenticated && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
            ⚠️ Please login to create posts
          </div>
        )}

        {/* Caption textarea */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={isAuthenticated ? "What's on your mind?" : "Login to post..."}
          disabled={!isAuthenticated || isLoading}
          className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          rows={4}
        />

        {/* Image upload with ref */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={!isAuthenticated || isLoading}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {imageFile && (
            <div className="flex items-center justify-between gap-2 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg text-sm">
              <span className="text-blue-700 dark:text-blue-200">
                📎 {imageFile.name}
              </span>
              <button
                onClick={handleClearImage}
                disabled={isLoading}
                className="text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        {message.text && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
                : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            disabled={!isAuthenticated || isLoading || (!caption.trim() && !imageFile)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {showPreview ? "Hide Preview" : "Preview Post"}
          </button>

          <button
            onClick={handleSubmitPost}
            disabled={!isAuthenticated || isLoading || (!caption.trim() && !imageFile)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span> Posting...
              </>
            ) : (
              "Submit Post"
            )}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (caption.trim() || imageFile) && (
        <div>
          <h3 className="font-semibold mb-2">Post Preview:</h3>
          <FlexiblePost
            name={userProfile?.name || user.name}
            username={userProfile?.email?.split("@")[0] || user.email?.split("@")[0] || "@user"}
            image={imagePreviewUrl || null}
            caption={caption || null}
            profileImage={userProfile?.profile_image}
            postId={null}
            currentUserId={user.user_id}
          />
        </div>
      )}
    </div>
  );
}
