// Hero band for the farm-plots hub, city, and corridor pages.
export default function FarmPlotHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="border-b border-gray-200 bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto max-w-5xl px-5 py-12 text-center sm:px-6 sm:py-16">
        <span className="inline-block rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
          Farm plot projects
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-gray-900 sm:text-5xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
