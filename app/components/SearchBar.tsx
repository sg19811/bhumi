"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  function go(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : "/explore");
  }
  return (
    <form onSubmit={go} className="flex max-w-xl mx-auto border-2 border-green-700 rounded-lg overflow-hidden">
      <input value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search by village, taluka, or district..."
        className="flex-1 px-4 py-3 outline-none" />
      <button type="submit" className="bg-green-700 text-white px-6 hover:bg-green-800">Search</button>
    </form>
  );
}
