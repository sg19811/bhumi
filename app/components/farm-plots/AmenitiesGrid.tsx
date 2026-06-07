import { amenity } from "@/app/lib/farm-plots/amenities";

// Renders the amenities jsonb array. Null/empty-safe — returns nothing when empty.
export default function AmenitiesGrid({ amenities }: { amenities?: string[] | null }) {
  const list = Array.isArray(amenities) ? amenities.filter(Boolean) : [];
  if (list.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold">Amenities</h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {list.map((key) => {
          const a = amenity(key);
          return (
            <div key={key} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700">
              <span aria-hidden="true">{a.emoji}</span>
              <span>{a.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
