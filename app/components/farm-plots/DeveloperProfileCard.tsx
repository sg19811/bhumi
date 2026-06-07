// Placeholder developer card (no developer dashboard/profile pages yet — Phase 2).
export default function DeveloperProfileCard({
  developerName,
  contactPhone,
}: {
  developerName?: string | null;
  contactPhone?: string | null;
}) {
  if (!developerName) return null;
  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Developer</h2>
      <p className="mt-1 font-medium text-gray-900">{developerName}</p>
      {contactPhone && (
        <p className="mt-1 text-sm text-gray-500">
          📞 <a href={`tel:${contactPhone}`} className="font-medium text-green-800 hover:underline">{contactPhone}</a>
        </p>
      )}
      <p className="mt-2 text-xs text-gray-400">Verified developer profiles are coming soon. Always verify the developer and documents independently.</p>
    </section>
  );
}
