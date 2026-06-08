import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import FarmPlotHero from "@/app/components/farm-plots/FarmPlotHero";
import { getResales } from "@/app/lib/farm-plots/queries";
import { corridorLabel } from "@/app/lib/farm-plots/corridors";
import { cityLabel } from "@/app/lib/farm-plots/cities";
import { formatINRShort } from "@/app/lib/format";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Farm plot resale — buy & sell plots in existing projects | AcreHub",
  description: "Plots being resold by owners in farm-plot projects across India. Verify ownership and documents independently before buying.",
  alternates: { canonical: "/farm-plots/resale" },
};

export default async function ResaleMarketplace() {
  const resales = await getResales();

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1">
        <FarmPlotHero title="Plot resale" subtitle="Plots being resold by owners in existing farm-plot projects." />
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
              <Link href="/farm-plots" className="hover:text-green-800">Farm plots</Link>
              <span aria-hidden="true" className="text-gray-300">/</span>
              <span className="text-gray-400">Resale</span>
            </nav>
            <Link href="/farm-plots/resale/new" className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800">List your plot for resale</Link>
          </div>

          {resales.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 py-14 text-center text-gray-500">
              No resale plots listed yet.{" "}
              <Link href="/farm-plots/resale/new" className="font-medium text-green-800 hover:underline">Be the first to list one →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {resales.map((r) => {
                const size = r.plot_size_value ? `${r.plot_size_value} ${r.plot_size_unit ?? ""}`.trim() : null;
                const place = [corridorLabel(r.corridor as string | null), cityLabel(r.nearest_city as string | null)].filter(Boolean).join(", ");
                return (
                  <div key={String(r.id)} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Resale</span>
                      {r.listing_id ? <Link href={`/listing/${String(r.listing_id)}`} className="text-xs text-green-700 hover:underline">View project →</Link> : null}
                    </div>
                    <h3 className="mt-2 font-semibold text-gray-900">{String(r.project_name || "Farm plot")}</h3>
                    {place && <p className="text-sm text-gray-500">{place}</p>}
                    {r.price ? <p className="mt-1.5 text-lg font-bold text-green-800">{formatINRShort(Number(r.price))}</p> : null}
                    <p className="mt-1 text-sm text-gray-500">{size ?? "Size on request"}</p>
                    {r.notes ? <p className="mt-2 text-sm text-gray-600 line-clamp-3">{String(r.notes)}</p> : null}
                    {r.contact_phone ? (
                      <a href={`tel:${r.contact_phone}`} className="mt-3 inline-block rounded-full border border-green-700 px-4 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50">
                        📞 {String(r.contact_name || "Contact")}
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            AcreHub doesn&apos;t verify resale posts. Confirm the seller actually owns the plot (sale deed, latest records)
            and check dues/transfer rules with the developer before paying. <Link href="/legal/checklist" className="font-medium underline">Checklist →</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
