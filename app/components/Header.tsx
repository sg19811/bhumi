"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/auth";
import Logo from "@/app/components/Logo";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const links = [
    { href: "/explore", label: "Explore" },
    { href: "/listing/new", label: "List your land" },
    { href: "/buy", label: "I want to buy" },
    { href: "/requirements", label: "Requirements" },
    { href: "/eligibility", label: "Eligibility" },
  ];
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
        <Logo />
        <button
          className="-mr-1 flex h-10 w-10 items-center justify-center rounded-lg text-xl text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 transition-colors ${
                isActive(l.href)
                  ? "font-medium text-green-800"
                  : "text-gray-600 hover:bg-gray-100 hover:text-green-800"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <span className="mx-1 h-5 w-px bg-gray-200" />
          {user ? (
            <>
              <Link
                href="/saved"
                className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-800"
              >
                Saved
              </Link>
              <Link
                href="/admin"
                className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-800"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:text-red-600"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-full bg-green-700 px-5 py-2 font-medium text-white shadow-sm transition-colors hover:bg-green-800"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-gray-200 px-4 py-3 text-sm md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2.5 ${
                isActive(l.href)
                  ? "bg-green-50 font-medium text-green-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <span className="my-1 h-px w-full bg-gray-200" />
          {user ? (
            <>
              <Link href="/saved" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100">
                Saved
              </Link>
              <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100">
                Dashboard
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
                className="rounded-lg px-3 py-2.5 text-left text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-full bg-green-700 px-3 py-2.5 text-center font-medium text-white"
            >
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
