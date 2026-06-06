"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import Header from "@/app/components/Header";
import PhotoUpload from "@/app/components/PhotoUpload";
import Link from "next/link";

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.from("listings").select("*").eq("id", id).single().then(({ data }) => {
      if (!data) { setNotFound(true); return; }
      setListing(data);
      setPhotos(data.photos ?? []);
    });
  }, [id]);

  if (loading || (!listing && !notFound)) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (notFound) return <div className="min-h-screen flex items-center justify-center text-gray-400">Listing not found.</div>;

  if (!user || (listing.owner_user_id && listing.owner_user_id !== user.id)) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="max-w-md mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl font-bold mb-2">You can&apos;t edit this listing</h1>
          <p className="text-gray-500 mb-6">Only the owner can edit it.</p>
          <Link href={`/listing/${id}`} className="text-green-700 hover:underline">← Back to listing</Link>
        </main>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const f = new FormData(e.currentTarget);
    await supabase.from("listings").update({
      title: f.get("title"), description: f.get("description"), land_type: f.get("land_type"),
      price: Number(f.get("price")), area_value: Number(f.get("area_value")), area_unit: f.get("area_unit"),
      water_source: f.get("water_source"), road_access: f.get("road_access"),
      electricity: f.get("electricity") === "on", status: f.get("status"),
      contact_phone: f.get("contact_phone"), contact_whatsapp: f.get("contact_whatsapp"),
      photos, updated_at: new Date().toISOString(),
    }).eq("id", id);
    setSaving(false);
    router.push(`/listing/${id}`);
  }

  const inp = "w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600";
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Edit listing</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PhotoUpload value={photos} onChange={setPhotos} />
          <div><label className="block text-sm font-medium mb-1">Title</label><input name="title" defaultValue={listing.title} className={inp} /></div>
          <div><label className="block text-sm font-medium mb-1">Land type</label>
            <select name="land_type" defaultValue={listing.land_type} className={inp}>
              <option value="agri_land">Agricultural land</option><option value="irrigated_farmland">Irrigated farmland</option>
              <option value="dryland">Dryland</option><option value="orchard">Orchard</option><option value="plantation">Plantation</option>
              <option value="farmhouse_land">Farmhouse land</option><option value="na_converted">NA-converted</option><option value="other">Other</option>
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Price (₹)</label><input name="price" type="number" defaultValue={listing.price} className={inp} /></div>
            <div><label className="block text-sm font-medium mb-1">Status</label>
              <select name="status" defaultValue={listing.status} className={inp}><option value="active">Active</option><option value="sold">Sold</option><option value="withdrawn">Withdrawn</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Area</label><input name="area_value" type="number" step="0.01" defaultValue={listing.area_value} className={inp} /></div>
            <div><label className="block text-sm font-medium mb-1">Unit</label>
              <select name="area_unit" defaultValue={listing.area_unit} className={inp}><option value="acre">Acres</option><option value="guntha">Gunthas</option><option value="hectare">Hectares</option><option value="sqft">Sq ft</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Water source</label>
              <select name="water_source" defaultValue={listing.water_source ?? ""} className={inp}><option value="">Select</option><option value="borewell">Borewell</option><option value="canal">Canal</option><option value="river">River</option><option value="rainfed">Rainfed</option><option value="none">None</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Road access</label>
              <select name="road_access" defaultValue={listing.road_access ?? ""} className={inp}><option value="">Select</option><option value="highway">Highway</option><option value="paved">Paved</option><option value="dirt">Dirt</option><option value="none">None</option></select></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer"><input name="electricity" type="checkbox" defaultChecked={listing.electricity} className="w-4 h-4 accent-green-700" /><span className="text-sm">Electricity available</span></label>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Phone</label><input name="contact_phone" defaultValue={listing.contact_phone ?? ""} className={inp} /></div>
            <div><label className="block text-sm font-medium mb-1">WhatsApp</label><input name="contact_whatsapp" defaultValue={listing.contact_whatsapp ?? ""} className={inp} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" rows={4} defaultValue={listing.description ?? ""} className={inp} /></div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 bg-green-700 text-white py-3 rounded-lg font-medium hover:bg-green-800 disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
            <Link href={`/listing/${id}`} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
