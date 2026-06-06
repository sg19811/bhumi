"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/lib/auth";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  const links = [
    { href: "/explore", label: "Explore" },
    { href: "/listing/new", label: "List your land" },
    { href: "/buy", label: "I want to buy" },
    { href: "/requirements", label: "Requirements" },
    { href: "/eligibility", label: "Eligibility" },
  ];

  return (
    <header className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-800">Bhūmi</Link>
        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>{open ? "✕" : "☰"}</button>
        <nav className="hidden md:flex items-center gap-5 text-sm">
          {links.map((l) => <Link key={l.href} href={l.href} className="text-gray-600 hover:text-green-700">{l.label}</Link>)}
          {user ? (
            <>
              <Link href="/admin" className="text-gray-600 hover:text-green-700">Dashboard</Link>
              <button onClick={signOut} className="text-gray-400 hover:text-red-600 text-xs">Sign out</button>
            </>
          ) : (
            <Link href="/auth/signin" className="px-4 py-1.5 bg-green-700 text-white rounded-lg hover:bg-green-800">Sign in</Link>
          )}
        </nav>
      </div>
      {open && (
        <nav className="md:hidden flex flex-col gap-3 pt-4 text-sm border-t mt-4">
          {links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>)}
          {user ? (
            <>
              <Link href="/admin" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { signOut(); setOpen(false); }} className="text-left text-red-600">Sign out</button>
            </>
          ) : <Link href="/auth/signin" onClick={() => setOpen(false)}>Sign in</Link>}
        </nav>
      )}
    </header>
  );
}
