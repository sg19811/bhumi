// Native <details> accordion — server-safe, accessible, no JS needed.
export default function CoBuyFaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((f) => (
        <details key={f.q} className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer list-none font-semibold text-gray-900 marker:content-none">
            <span className="flex items-center justify-between gap-3">
              {f.q}
              <span aria-hidden="true" className="shrink-0 text-gray-400 transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
