/** Placeholder matching ListingCard's shape, shown while data loads. */
export default function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <div className="aspect-[4/3] animate-pulse bg-gray-100" />
      <div className="space-y-2.5 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

/** A responsive grid of skeleton cards. */
export function ListingCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
