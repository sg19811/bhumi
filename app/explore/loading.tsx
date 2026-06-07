import Header from "@/app/components/Header";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-[52px] border-b border-gray-200 bg-gray-50" />
      <div className="h-[380px] animate-pulse border-b border-gray-200 bg-gray-100 sm:h-[420px]" />
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
        <div className="mb-6 h-6 w-44 animate-pulse rounded bg-gray-100" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="aspect-[4/3] animate-pulse bg-gray-100" />
              <div className="space-y-2.5 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-5 w-1/2 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
