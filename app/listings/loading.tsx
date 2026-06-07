import Header from "@/app/components/Header";
import { ListingCardSkeletonGrid } from "@/app/components/ListingCardSkeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-6">
        <div className="mb-6 h-9 w-48 animate-pulse rounded bg-gray-100" />
        <ListingCardSkeletonGrid count={9} />
      </main>
    </div>
  );
}
