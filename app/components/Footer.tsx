import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Logo className="text-xl" />
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600">
          <Link href="/explore" className="hover:text-green-800">Explore</Link>
          <Link href="/buy" className="hover:text-green-800">Buy land</Link>
          <Link href="/how-it-works" className="hover:text-green-800">How it works</Link>
          <Link href="/eligibility" className="hover:text-green-800">Eligibility</Link>
          <Link href="/about" className="hover:text-green-800">About</Link>
        </nav>
        <p className="text-xs text-gray-400">© 2026 Bhūmi · Trusted land marketplace</p>
      </div>
    </footer>
  );
}
