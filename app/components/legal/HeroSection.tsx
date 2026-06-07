import Link from "next/link";

// Hub hero with the three primary entry CTAs.
export default function HeroSection() {
  return (
    <section className="border-b border-gray-200 bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto max-w-5xl px-5 py-12 text-center sm:px-6 sm:py-16">
        <span className="inline-block rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
          Land Legal Navigator
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-gray-900 sm:text-5xl">
          Buy agricultural land with legal clarity
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
          Check your eligibility, understand state-wise rules, and get lawyer-backed guidance before
          you buy farmland in India. We help you ask the right questions — and connect you to a verified lawyer.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link href="/legal/wizard" className="rounded-2xl bg-green-700 px-5 py-4 font-semibold text-white shadow-sm transition-colors hover:bg-green-800">
            <span className="block text-lg">Check eligibility</span>
            <span className="mt-0.5 block text-sm font-normal text-green-100">2-minute guided wizard</span>
          </Link>
          <Link href="/legal/checklist" className="rounded-2xl border border-green-700 bg-white px-5 py-4 font-semibold text-green-800 transition-colors hover:bg-green-50">
            <span className="block text-lg">Document checklist</span>
            <span className="mt-0.5 block text-sm font-normal text-gray-500">By state &amp; land type</span>
          </Link>
          <Link href="/legal/talk-to-lawyer" className="rounded-2xl border border-green-700 bg-white px-5 py-4 font-semibold text-green-800 transition-colors hover:bg-green-50">
            <span className="block text-lg">Talk to a lawyer</span>
            <span className="mt-0.5 block text-sm font-normal text-gray-500">Verified land advocates</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
