// components/posts/CreatePostContent.jsx
"use client";

import { useState } from "react";
import Post from "@/components/post";

export default function CreatePostContent() {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Example user info (could later come from auth)
  const user = {
    name: "Rifath",
    username: "@rifath123",
  };

  // Handle file input
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  return (
    <div className="space-y-4">
      {/* Post Creation Form */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Create a Post</h3>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 rounded-lg border dark:bg-bg-dark dark:border-gray-700 resize-none"
          rows={4}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-primary text-white rounded-lg shadow-md"
          >
            {showPreview ? "Hide Preview" : "Preview Post"}
          </button>

          <button
            onClick={() => {
              if (!caption.trim()) return alert("Caption cannot be empty!");
              alert("Post created! (this is a placeholder for now)");
              setCaption("");
              setImageFile(null);
              setShowPreview(false);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md"
          >
            Submit Post
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div>
          <h3 className="font-semibold mb-2">Post Preview:</h3>
          <Post
            name={user.name}
            username={user.username}
            image={imageFile ? URL.createObjectURL(imageFile) : null}
            caption={caption}
          />
        </div>
      )}
    </div>
  );
}
