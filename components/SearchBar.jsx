"use client";

import { useState } from "react";
import { LucideSearch } from "lucide-react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md mx-4">
      
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <LucideSearch size={20} className="text-gray-400 dark:text-gray-300" />
      </div>

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
      />
    </form>
  );
}
