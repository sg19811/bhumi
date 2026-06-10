const STEPS = [
  { n: "1", title: "Find a parcel", body: "Browse large agricultural parcels marked Buying Circle eligible, or get matched to one." },
  { n: "2", title: "Express interest", body: "Tell us your budget and what you're looking for. It's free and non-binding." },
  { n: "3", title: "We call you", body: "AcrehubIndia calls to understand your needs and explain the parcel, legal status, and process." },
  { n: "4", title: "Form the circle", body: "Interested, qualified buyers are grouped. Everyone reviews the parcel and the legal documents with their own lawyer." },
  { n: "5", title: "Due diligence & site visit", body: "Title, encumbrance, and approvals are verified. The group visits the site together." },
  { n: "6", title: "Execute & register", body: "With lawyer-reviewed agreements, the purchase and registration are coordinated. Optional services (survey, fencing, civil work) follow." },
];

export default function CoBuyHowItWorks() {
  return (
    <section id="how" className="scroll-mt-20">
      <h2 className="mb-2 text-2xl font-bold sm:text-3xl">How a Buying Circle works</h2>
      <p className="mb-8 text-gray-500">Six steps from interest to ownership — with lawyer review at every stage that matters.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">{s.n}</div>
            <h3 className="font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
