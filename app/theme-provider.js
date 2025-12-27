"use client";

import { useState, useEffect } from "react";

export default function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <>
      {/* Dark/Light mode toggle */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded bg-primary text-white dark:bg-primary-dark dark:text-black"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
      {children}
    </>
  );
}
