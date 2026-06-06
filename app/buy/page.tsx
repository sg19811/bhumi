"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";

export default function BuyLand() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const f = new FormData(e.currentTarget);

    const landTypes = Array.from(f.getAll("land_types")) as string[];

    const { error: dbError } = await supabase.from("buyer_interests").insert({
      intent: f.get("intent"),
      preferred_district: f.get("preferred_district"),
      preferred_taluka: f.get("preferred_taluka"),
      land_types: landTypes,
      budget_min: f.get("budget_min") ? Number(f.get("budget_min")) : null,
      budget_max: f.get("budget_max") ? Number(f.get("budget_max")) : null,
      acreage_min: f.get("acreage_min") ? Number(f.get("acreage_min")) : null,
      acreage_max: f.get("acreage_max") ? Number(f.get("acreage_max")) : null,
      irrigation_pref: f.get("irrigation_pref"),
      contact_phone: f.get("contact_phone"),
      contact_whatsapp: f.get("contact_whatsapp"),
      notes: f.get("notes"),
    });

    setSubmitting(false);
    if (dbError) {
      setError(dbError.message);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <header className="border-b px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-green-800">Bhūmi</Link>
        </header>
        <main className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">Requirement posted!</h1>
          <p className="text-gray-500 mb-8">
            We&apos;ll match you with suitable land listings and notify you.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/explore"
              className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
            >
              Browse listings
            </Link>
            <Link
              href="/"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Go home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-green-800">Bhūmi</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">I want to buy land</h1>
        <p className="text-gray-500 mb-8">
          Tell us what you&apos;re looking for and we&apos;ll match you with listings.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            Something went wrong: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">What are you looking for?</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Purpose *</label>
              <select
                name="intent"
                required
                className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600"
              >
                <option value="">Select</option>
                <option value="farming">Farming</option>
                <option value="farmhouse">Farmhouse / weekend home</option>
                <option value="investment">Investment</option>
                <option value="development">Development / conversion</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Land types of interest</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["agri_land", "Agricultural land"],
                  ["irrigated_farmland", "Irrigated farmland"],
                  ["orchard", "Orchard"],
                  ["farmhouse_land", "Farmhouse land"],
                  ["na_converted", "NA-converted"],
                  ["plantation", "Plantation"],
                ].map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="land_types"
                      value={value}
                      className="w-4 h-4 accent-green-700"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Where?</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Preferred district</label>
                <input
                  name="preferred_district"
                  placeholder="e.g. Mysuru"
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preferred taluka</label>
                <input
                  name="preferred_taluka"
                  placeholder="e.g. Hunsur"
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Budget and size</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min budget (₹)</label>
                <input
                  name="budget_min"
                  type="number"
                  placeholder="e.g. 2000000"
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max budget (₹)</label>
                <input
                  name="budget_max"
                  type="number"
                  placeholder="e.g. 10000000"
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Min area (acres)</label>
                <input
                  name="acreage_min"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 1"
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max area (acres)</label>
                <input
                  name="acreage_max"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 5"
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Irrigation preference</label>
              <select
                name="irrigation_pref"
                className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600"
              >
                <option value="">No preference</option>
                <option value="borewell">Borewell</option>
                <option value="canal">Canal</option>
                <option value="river">River</option>
                <option value="any">Any irrigation</option>
              </select>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Your contact</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  name="contact_phone"
                  required
                  placeholder="e.g. 9876543210"
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp</label>
                <input
                  name="contact_whatsapp"
                  placeholder="Same as phone if blank"
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anything else?</label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Any specific requirements — soil type, nearby town, timeline..."
                className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600"
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-700 text-white py-3 rounded-lg text-lg font-medium hover:bg-green-800 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Post my requirement"}
          </button>
        </form>
      </main>
    </div>
  );
}
