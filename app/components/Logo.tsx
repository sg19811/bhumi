import Link from "next/link";

/**
 * Bhūmi wordmark + leaf mark. Server-safe (no hooks) so it can be used in
 * both server and client pages. Visual only — links to home, as before.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 font-display text-2xl font-semibold tracking-tight text-green-800 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-6 w-6 shrink-0 text-green-700"
        fill="none"
      >
        <path
          d="M12 21c0-5 0-8 0-8M12 13c0-3.5 2.2-6.5 6-7.2C18 9.5 15.8 13 12 13Zm0 0C8.2 13 6 9.8 6 6.4 9.8 7 12 9.6 12 13Z"
          fill="currentColor"
          fillOpacity="0.18"
        />
        <path
          d="M12 21v-8m0 0c0-3.5 2.2-6.5 6-7.2C18 9.5 15.8 13 12 13Zm0 0C8.2 13 6 9.8 6 6.4 9.8 7 12 9.6 12 13Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Bhūmi
    </Link>
  );
}
