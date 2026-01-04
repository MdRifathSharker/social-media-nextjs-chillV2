"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import SearchDropdown from "./SearchDropdown";
import { searchUsersByName } from "./search.service";

export default function SearchBarUI({ setSelectedProfile }) { // ✅ receive prop
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ New state to control dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value) {
      setResults([]);
      setShowDropdown(false); // hide dropdown if input is empty
      return;
    }

    setLoading(true);
    setShowDropdown(true); // show dropdown while typing
    const data = await searchUsersByName(value);
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="relative w-full max-w-md mx-4">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={20} className="text-gray-400 dark:text-gray-300" />
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search users by name"
        className="w-full pl-10 pr-4 py-2 rounded-lg border-2
                   border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900 text-sm
                   focus:outline-none focus:ring-2
                   focus:ring-primary transition"
        value={query}
        onChange={handleChange}
      />

      {/* Dropdown */}
      {showDropdown && (
        <SearchDropdown
          results={results}
          loading={loading}
          setSelectedProfile={(user) => {
            setSelectedProfile(user); // ✅ set profile in HomePage
            setShowDropdown(false);   // ✅ hide dropdown on click
          }}
        />
      )}
    </div>
  );
}
