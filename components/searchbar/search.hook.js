// components/searchbar/search.hook.js

"use client";

import { useEffect, useState } from "react";
import { searchUsersByName } from "./search.service";

export default function useUserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // debounce timer
    const timer = setTimeout(async () => {
      if (!query || query.trim().length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const users = await searchUsersByName(query);
      setResults(users);
      setLoading(false);
    }, 400); // debounce delay

    return () => clearTimeout(timer);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    loading,
  };
}
