"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import Link from "next/link";
import Header from "@/app/components/Header";
import PhotoUpload from "@/app/components/PhotoUpload";
import VideoUpload from "@/app/components/VideoUpload";

export default function NewListing() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true); setError("");
    const f = new FormData(e.currentTarget);
    const { error: dbError } = await supabase.from("listings").insert({
      owner_user_id: user?.id ?? null,
      title: f.get("title"), description: f.get("description"), land_type: f.get("land_type"),
      price: Number(f.get("price")), price_basis: f.get("price_basis"),
      area_value: Number(f.get("area_value")), area_unit: f.get("area_unit"),
      latitude: Number(f.get("latitude")), longitude: Number(f.get("longitude")),
      district: f.get("district"), taluka: f.get("taluka"), village: f.get("village"),
      water_source: f.get("water_source"), road_access: f.get("road_access"),
      electricity: f.get("electricity") === "on",
      contact_email: f.get("contact_email"), contact_phone: f.get("contact_phone"), contact_whatsapp: f.get("contact_whatsapp"),
      photos, videos,
    });
    setSubmitting(false);
    if (dbError) setError(dbError.message);
    else { setSuccess(true); setPhotos([]); setVideos([]); e.currentTarget.reset(); }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-lg px-6 py-20 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">✓</div>
          <h1 className="mb-2 text-2xl font-bold">Listing created!</h1>
          <p className="mb-8 text-gray-500">Your land listing is now live on Bhūmi.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => setSuccess(false)} className="rounded-full bg-green-700 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800">Create another</button>
            <Link href="/explore" className="rounded-full border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50">View listings</Link>
          </div>
        </main>
      </div>
    );
  }

  const inp = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">List your land</h1>
        <p className="text-gray-500 mb-8">The more you share, the faster it sells.</p>
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Photos</h2>
            <PhotoUpload value={photos} onChange={setPhotos} />
          </section>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Videos</h2>
            <VideoUpload value={videos} onChange={setVideos} />
          </section>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Basic information</h2>
            <div><label className="block text-sm font-medium mb-1">Title *</label>
              <input name="title" required placeholder="2-acre farmhouse plot near Hunsur, Mysuru" className={inp} /></div>
            <div><label className="block text-sm font-medium mb-1">Land type *</label>
              <select name="land_type" required className={inp}>
                <option value="">Select type</option>
                <option value="agri_land">Agricultural land</option><option value="irrigated_farmland">Irrigated farmland</option>
                <option value="dryland">Dryland</option><option value="orchard">Orchard</option>
                <option value="plantation">Plantation</option><option value="farmhouse_land">Farmhouse land</option>
                <option value="built_farmhouse">Built farmhouse</option><option value="na_converted">NA-converted</option>
                <option value="developed_rural_plot">Developed rural plot</option><option value="other">Other</option>
              </select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Price (₹) *</label><input name="price" type="number" required placeholder="5000000" className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1">Price is for</label>
                <select name="price_basis" className={inp}><option value="total">Total</option><option value="per_acre">Per acre</option><option value="per_guntha">Per guntha</option><option value="per_sqft">Per sq ft</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Area *</label><input name="area_value" type="number" step="0.01" required placeholder="2.5" className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1">Unit</label>
                <select name="area_unit" className={inp}><option value="acre">Acres</option><option value="guntha">Gunthas</option><option value="hectare">Hectares</option><option value="sqft">Sq ft</option><option value="cent">Cents</option><option value="bigha">Bighas</option></select></div>
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Location</h2>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium mb-1">District *</label><input name="district" required placeholder="Mysuru" className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1">Taluka</label><input name="taluka" placeholder="Hunsur" className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1">Village</label><input name="village" placeholder="Kallahalli" className={inp} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Latitude *</label><input name="latitude" type="number" step="any" required placeholder="12.31" className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1">Longitude *</label><input name="longitude" type="number" step="any" required placeholder="76.21" className={inp} /></div>
            </div>
            <p className="text-xs text-gray-400">Tip: in Google Maps, right-click the land and click the coordinates to copy them.</p>
          </section>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Features</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Water source</label>
                <select name="water_source" className={inp}><option value="">Select</option><option value="borewell">Borewell</option><option value="canal">Canal</option><option value="river">River</option><option value="rainfed">Rainfed</option><option value="none">None</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Road access</label>
                <select name="road_access" className={inp}><option value="">Select</option><option value="highway">Highway</option><option value="paved">Paved</option><option value="dirt">Dirt road</option><option value="none">None</option></select></div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer"><input name="electricity" type="checkbox" className="w-4 h-4 accent-green-700" /><span className="text-sm">Electricity available</span></label>
          </section>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Contact</h2>
            <p className="text-sm text-gray-500">No account needed — buyers will reach you using the details below.</p>
            <div><label className="block text-sm font-medium mb-1">Email *</label><input name="contact_email" type="email" required placeholder="you@example.com" className={inp} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Phone *</label><input name="contact_phone" required placeholder="9876543210" className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1">WhatsApp</label><input name="contact_whatsapp" placeholder="Same if blank" className={inp} /></div>
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Description</h2>
            <textarea name="description" rows={4} placeholder="Crops grown, soil type, nearby landmarks, why you're selling..." className={inp} />
          </section>
          <button type="submit" disabled={submitting} className="w-full rounded-full bg-green-700 py-3.5 text-lg font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">
            {submitting ? "Publishing…" : "Publish listing"}
          </button>
        </form>
      </main>
    </div>
  );
}
