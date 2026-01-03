"use client";

import { useState, useEffect, useRef } from "react";
import { LucideSearch } from "lucide-react";
import SearchResultsDropdown from "@/components/SearchResultsDropdown";
import { combinedSearch } from "@/utils/search-fuzzy";

export default function SearchBarEnhanced() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Real-time search as user types
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults({ posts: [], users: [] });
        setShowResults(false);
        return;
      }

      try {
        setLoading(true);
        setShowResults(true);
        const result = await combinedSearch(query);

        if (result.success) {
          setResults({
            posts: result.posts || [],
            users: result.users || []
          });
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults({ posts: [], users: [] });
    setShowResults(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Could implement full page search results view here
    console.log("Searching for:", query);
  };

  return (
    <div className="relative w-full max-w-md mx-4" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <LucideSearch size={20} className="text-gray-400 dark:text-gray-300" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          placeholder="Search posts, users..."
          className="w-full pl-10 pr-10 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <SearchResultsDropdown
          posts={results.posts}
          users={results.users}
          query={query}
          loading={loading}
          onResultClick={() => {
            setShowResults(false);
            setQuery("");
          }}
        />
      )}
    </div>
  );
}
