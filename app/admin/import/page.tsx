"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { parseCSV } from "@/app/lib/csv";

const HEADERS = "title,land_type,price,price_basis,area_value,area_unit,latitude,longitude,district,taluka,village,water_source,road_access,electricity,contact_phone,contact_email,description";

type Row = { raw: Record<string, string>; error: string | null };

function validate(r: Record<string, string>): string | null {
  if (!r.title?.trim()) return "missing title";
  if (!(Number(r.price) > 0)) return "invalid price";
  if (!(Number(r.area_value) > 0)) return "invalid area";
  if (!Number.isFinite(Number(r.latitude)) || !Number.isFinite(Number(r.longitude))) return "invalid coordinates";
  if (!r.district?.trim()) return "missing district";
  return null;
}

export default function BulkImport() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [parsed, setParsed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  function parse() {
    const data = parseCSV(text);
    setRows(data.map((raw) => ({ raw, error: validate(raw) })));
    setParsed(true);
    setResult("");
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setText(await file.text());
  }

  async function importValid() {
    if (!user) return;
    const valid = rows.filter((r) => !r.error).map((r) => r.raw);
    if (!valid.length) return;
    setBusy(true);
    const payload = valid.map((r) => ({
      owner_user_id: user.id,
      status: "active",
      title: r.title,
      land_type: r.land_type || "agri_land",
      price: Number(r.price),
      price_basis: r.price_basis || "total",
      area_value: Number(r.area_value),
      area_unit: r.area_unit || "acre",
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      district: r.district,
      taluka: r.taluka || null,
      village: r.village || null,
      water_source: r.water_source || null,
      road_access: r.road_access || null,
      electricity: ["true", "yes", "1"].includes((r.electricity || "").toLowerCase()),
      contact_phone: r.contact_phone || null,
      contact_email: r.contact_email || null,
      description: r.description || null,
    }));
    const { error, count } = await supabase.from("listings").insert(payload, { count: "exact" });
    setBusy(false);
    if (error) setResult(`Error: ${error.message}`);
    else {
      setResult(`✓ Imported ${count ?? payload.length} listings (live).`);
      setRows([]);
      setParsed(false);
      setText("");
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Admins only</h1>
          <Link href="/" className="text-green-700 hover:underline">Go home</Link>
        </main>
      </div>
    );
  }

  const validCount = rows.filter((r) => !r.error).length;
  const errorCount = rows.length - validCount;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-1 text-3xl font-bold">Bulk import listings</h1>
        <p className="mb-6 text-sm text-gray-500">Paste or upload a CSV. Imported listings go live immediately, owned by your admin account.</p>

        <div className="mb-3 rounded-xl border border-gray-200 bg-white p-3 text-xs">
          <p className="mb-1 font-medium text-gray-700">Required columns (header row):</p>
          <code className="block overflow-x-auto whitespace-nowrap text-gray-500">{HEADERS}</code>
          <p className="mt-2 text-gray-400">Required values: title, price, area_value, latitude, longitude, district. electricity = true/false.</p>
        </div>

        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder={HEADERS} className="w-full rounded-xl border border-gray-300 bg-white p-3 font-mono text-xs outline-none focus:border-green-600" />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input type="file" accept=".csv,text/csv" onChange={onFile} className="text-sm" />
          <button onClick={parse} disabled={!text.trim()} className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">Parse &amp; preview</button>
          {parsed && validCount > 0 && (
            <button onClick={importValid} disabled={busy} className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">
              {busy ? "Importing…" : `Import ${validCount} listing${validCount > 1 ? "s" : ""}`}
            </button>
          )}
        </div>

        {result && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{result}</p>}

        {parsed && (
          <div className="mt-6">
            <p className="mb-2 text-sm text-gray-600">{validCount} valid · {errorCount} with errors</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500"><th className="p-2">#</th><th className="p-2">Title</th><th className="p-2">Price</th><th className="p-2">District</th><th className="p-2">Status</th></tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="p-2 text-gray-400">{i + 1}</td>
                      <td className="p-2">{r.raw.title || <span className="text-gray-400">—</span>}</td>
                      <td className="p-2">{r.raw.price}</td>
                      <td className="p-2">{r.raw.district}</td>
                      <td className="p-2">{r.error ? <span className="text-red-600">⚠ {r.error}</span> : <span className="text-green-700">✓ ok</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
