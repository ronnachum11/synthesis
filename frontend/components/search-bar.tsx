"use client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import { globalSearch } from "@/lib/actions/search";

export function SearchBar() {
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  async function performSearch(query: string) {
    const res = await globalSearch(query);
    console.log(res);
    // Encode the query for URL usage
    const encodedQuery = encodeURIComponent(query);

    if (!pathname.startsWith("/news")) {
      // Navigate to the desired page with the encoded query
      router.push(`results/?query=${encodedQuery}`);
    }
      // } else if (pathname.startsWith("/news")) {
      // Handle search specifically for "/news" path or do nothing
      // Example: navigate to news search results page
      // router.push(`/news?query=${encodedQuery}`);
    // }
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      await performSearch(search);
      setSearch(""); // Consider if you really want to clear the search after submission
    }
  }
  return (
    <div className="w-5/6 mx-auto">
      <Input
        placeholder="Search..."
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        value={search}
      />
    </div>
  );
}
