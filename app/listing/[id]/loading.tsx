import Header from "@/app/components/Header";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 h-4 w-24 animate-pulse rounded bg-gray-100" />
        <div className="mb-2 h-9 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="mb-6 h-4 w-1/3 animate-pulse rounded bg-gray-100" />
        <div className="mb-6 aspect-[4/3] w-full animate-pulse rounded-2xl bg-gray-100 md:aspect-[2/1]" />
        <div className="mb-6 h-[320px] animate-pulse rounded-2xl bg-gray-100 sm:h-[380px]" />
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="h-44 animate-pulse rounded-2xl bg-gray-100" />
      </main>
    </div>
  );
}
