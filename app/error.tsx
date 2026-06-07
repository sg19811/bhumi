"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 px-5 py-3.5 sm:px-6">
        <Logo />
      </header>
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-2xl text-amber-700">!</div>
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-gray-500">
          We hit a snag loading this page. Please try again — if it keeps happening, head back home.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-full bg-green-700 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Go home
          </Link>
        </div>
      </main>
    </div>
  );
}
