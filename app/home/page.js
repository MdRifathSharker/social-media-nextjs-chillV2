"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Post from "@/components/post"; // keep as-is

export default function HomePage() {
  const router = useRouter();
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);

  const posts = [
    { name: "Alice", username: "alice123", image: "https://picsum.photos/600/400?random=1", caption: "Hello world!" },
    { name: "Bob", username: "bob456", image: "https://picsum.photos/600/400?random=2", caption: "Chill vibes today 😎" },
    { name: "Charlie", username: "charlie789", image: "https://picsum.photos/600/400?random=3", caption: "This is a beautiful day!" },
  ];

  // Sample notifications
  const notifications = [
    "Alice liked your post.",
    "Bob commented on your post.",
    "Charlie followed you.",
    "New message from David.",
  ];

  // Sample messages
  const messages = [
    "Alice: Hey! How are you?",
    "Bob: Let's catch up later.",
    "Charlie: Did you see my post?",
    "David: Meeting at 5pm.",
  ];

  // Sample followers
  const followers = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank"];

  return (
    <main className="min-h-screen w-screen flex bg-bg text-text dark:bg-bg-dark dark:text-text-dark transition-colors duration-500">

      {/* Dark/Light Mode Toggle - top-left */}
      <div className="absolute top-4 left-4 z-50">
        <ThemeToggle />
      </div>

      {/* Logo - top-right */}
      <div className="absolute top-4 right-4 w-24 h-24">
        <Image src="/LogoUpdate.png" alt="Logo" fill style={{ objectFit: "contain" }} />
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 h-screen pt-32">

        {/* Posts Area - 3/4 width, scrollable */}
        <div className="w-3/4 pr-4 overflow-y-auto">
          {posts.map((p, i) => (
            <div key={i} className="mb-4">
              <Post name={p.name} username={p.username} image={p.image} caption={p.caption} />
            </div>
          ))}
        </div>

        {/* Profile Area - 1/4 width, fixed */}
        <div className="w-1/4 pl-4 flex flex-col items-center sticky top-32 h-[calc(100vh-8rem)] relative">

          {/* Profile Details Box */}
          {showProfileDetails && (
            <div
              className="absolute top-0 left-0 bg-primary-dark dark:bg-accent-dark text-white rounded shadow p-4 overflow-y-auto flex flex-col items-center"
              style={{ width: 'calc(85% - 2px)', height: 'calc(100% - 68px)' }}
            >
              {/* Profile Picture */}
              <div className="w-20 h-20 mb-4 relative">
                <Image src="/profile-pic.png" alt="Profile Picture" fill className="rounded-full object-cover" />
              </div>

              {/* Profile Details */}
              <h2 className="text-xl font-bold mb-2">John Doe</h2>
              <p className="text-sm mb-1">@johndoe</p>
              <p className="text-sm mb-1">Bio: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <p className="text-sm mb-1">Address: 123 Main St, City</p>
              <p className="text-sm mb-1">Contact: john@example.com</p>
              <p className="text-sm mb-1">Website: www.example.com</p>
              <p className="text-sm">Additional info can go here.</p>
            </div>
          )}

          {/* Notifications Box */}
          {showNotifications && (
            <div
              className="absolute top-0 left-0 bg-primary-dark dark:bg-accent-dark rounded shadow p-4 overflow-y-auto flex flex-col"
              style={{ width: 'calc(85% - 2px)', height: 'calc(100% - 68px)' }}
            >
              <h2 className="text-xl font-bold mb-2 text-white">Notifications</h2>
              <div className="flex flex-col gap-2">
                {notifications.map((n, i) => (
                  <p key={i} className="text-black dark:text-white bg-accent dark:bg-bg-dark p-2 rounded">{n}</p>
                ))}
              </div>
            </div>
          )}

          {/* Messages Box */}
          {showMessages && (
            <div
              className="absolute top-0 left-0 bg-primary-dark dark:bg-accent-dark rounded shadow p-4 overflow-y-auto flex flex-col"
              style={{ width: 'calc(85% - 2px)', height: 'calc(100% - 68px)' }}
            >
              <h2 className="text-xl font-bold mb-2 text-white">Messages</h2>
              <div className="flex flex-col gap-2">
                {messages.map((m, i) => (
                  <p key={i} className="text-black dark:text-white bg-accent dark:bg-bg-dark p-2 rounded">{m}</p>
                ))}
              </div>
            </div>
          )}

          {/* Followers Box */}
          {showFollowers && (
            <div
              className="absolute top-0 left-0 bg-primary-dark dark:bg-accent-dark rounded shadow p-4 overflow-y-auto flex flex-col"
              style={{ width: 'calc(85% - 2px)', height: 'calc(100% - 68px)' }}
            >
              <h2 className="text-xl font-bold mb-2 text-white">Followers</h2>
              <div className="flex flex-col gap-2">
                {followers.map((f, i) => (
                  <p key={i} className="text-black dark:text-white bg-accent dark:bg-bg-dark p-2 rounded">{f}</p>
                ))}
              </div>
            </div>
          )}

          {/* Bottom 4 Buttons */}
          <div className="absolute bottom-4 right-4 flex gap-4 w-[90%] justify-between">
            <button onClick={() => { setShowFollowers(!showFollowers); setShowMessages(false); setShowNotifications(false); setShowProfileDetails(false); }}>
              <Image src="/icons/followers.png" alt="Followers" width={32} height={32} />
            </button>

            <button onClick={() => { setShowMessages(!showMessages); setShowFollowers(false); setShowNotifications(false); setShowProfileDetails(false); }}>
              <Image src="/icons/message.png" alt="Messages" width={32} height={32} />
            </button>

            <button onClick={() => { setShowNotifications(!showNotifications); setShowFollowers(false); setShowMessages(false); setShowProfileDetails(false); }}>
              <Image src="/icons/notification.png" alt="Notifications" width={32} height={32} />
            </button>

            <button onClick={() => { setShowProfileDetails(!showProfileDetails); setShowFollowers(false); setShowMessages(false); setShowNotifications(false); }}>
              <Image src="/icons/profile.png" alt="Profile" width={32} height={32} />
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}

/* Dark/Light Mode Toggle */
function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="px-4 py-2 rounded bg-primary text-white dark:bg-primary-dark dark:text-black"
    >
      {darkMode ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
