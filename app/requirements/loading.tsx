import Header from "@/app/components/Header";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6">
        <div className="mb-6 h-9 w-56 animate-pulse rounded bg-gray-100" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 p-5">
              <div className="mb-2 h-4 w-1/3 animate-pulse rounded bg-gray-100" />
              <div className="mb-2 h-5 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
