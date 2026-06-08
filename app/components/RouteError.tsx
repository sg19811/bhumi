"use client";

import { useEffect } from "react";
import Link from "next/link";

// Shared, on-brand route error UI. Each segment's error.tsx renders this.
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in Vercel logs.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl" aria-hidden="true">🌾</div>
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="mt-2 text-gray-500">We hit a snag loading this page. Try again, or head back home.</p>
      {error?.digest && <p className="mt-2 text-xs text-gray-400">Ref: {error.digest}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
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
  );
}
