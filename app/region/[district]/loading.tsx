import Header from "@/app/components/Header";
import { ListingCardSkeletonGrid } from "@/app/components/ListingCardSkeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-6">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
          <div className="mt-4 h-9 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="mx-auto mt-6 max-w-5xl px-5 sm:px-6">
          <div className="h-[320px] animate-pulse rounded-2xl bg-gray-100 sm:h-[380px]" />
        </div>
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <ListingCardSkeletonGrid count={6} />
        </div>
      </main>
    </div>
  );
}
