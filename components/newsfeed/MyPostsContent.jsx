// components/newsfeed/MyPostsContent.jsx
"use client";

import Post from "@/components/post";

export default function MyPostsContent({ currentUser }) {
  if (!currentUser) return <p>Loading user info...</p>;

  // Example data for "My Posts" – still same structure, but now uses currentUser
  const myPosts = [
    {
      name: currentUser.name,
      username: `@${currentUser.username || currentUser.name.toLowerCase()}`,
      image: "https://picsum.photos/500/300?random=1",
      caption: "This is my first post!"
    },
    {
      name: currentUser.name,
      username: `@${currentUser.username || currentUser.name.toLowerCase()}`,
      image: "https://picsum.photos/500/300?random=2",
      caption: "Learning Next.js is fun 😎"
    },
    {
      name: currentUser.name,
      username: `@${currentUser.username || currentUser.name.toLowerCase()}`,
      image: "https://picsum.photos/500/300?random=3",
      caption: "Just sharing my experience!"
    },
  ];

  return (
    <div className="space-y-4">
      {myPosts.map((post, index) => (
        <Post
          key={index}
          name={post.name}
          username={post.username}
          image={post.image}
          caption={post.caption}
        />
      ))}
    </div>
  );
}
