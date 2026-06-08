import Link from "next/link";
import { slugifyDeveloper } from "@/app/lib/farm-plots/developers";

// Developer card. Shows the developer's other active projects on AcreHub so a
// buyer can see their footprint. Verified developer profiles are still Phase 2.
export default function DeveloperProfileCard({
  developerName,
  contactPhone,
  otherProjects = [],
}: {
  developerName?: string | null;
  contactPhone?: string | null;
  otherProjects?: Record<string, unknown>[];
}) {
  if (!developerName) return null;
  const count = otherProjects.length;

  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Developer</h2>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <Link href={`/farm-plots/developer/${slugifyDeveloper(developerName)}`} className="font-medium text-gray-900 hover:text-green-800 hover:underline">
          {developerName}
        </Link>
        {count > 0 && (
          <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800">
            {count} other project{count === 1 ? "" : "s"} on AcreHub
          </span>
        )}
      </div>
      {contactPhone && (
        <p className="mt-1 text-sm text-gray-500">
          📞 <a href={`tel:${contactPhone}`} className="font-medium text-green-800 hover:underline">{contactPhone}</a>
        </p>
      )}

      {count > 0 && (
        <ul className="mt-3 divide-y divide-gray-100 border-t border-gray-100">
          {otherProjects.map((p) => (
            <li key={String(p.id)}>
              <Link href={`/listing/${p.id}`} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-green-800">
                <span className="truncate font-medium text-gray-700">
                  {String(p.project_name || p.title || "Untitled project")}
                </span>
                <span className="shrink-0 text-gray-400">View →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Verified developer profiles are coming soon. Always verify the developer&apos;s registration, track record and
        documents independently.
      </p>
    </section>
  );
}
