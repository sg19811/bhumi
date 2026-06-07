"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import Header from "@/app/components/Header";
import PhotoUpload from "@/app/components/PhotoUpload";
import VideoUpload from "@/app/components/VideoUpload";
import LocationField from "@/app/components/LocationField";
import Link from "next/link";
import ProjectFieldsStep from "@/app/components/farm-plots/ProjectFieldsStep";
import PlotInventoryEditor, { type DraftPlot } from "@/app/components/farm-plots/PlotInventoryEditor";
import { isProjectType } from "@/app/lib/farm-plots/types";
import { collectProjectFields, validateProjectFields, plotRowsForInsert } from "@/app/lib/farm-plots/submit";

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [landType, setLandType] = useState("");
  const [plots, setPlots] = useState<DraftPlot[]>([]);

  useEffect(() => {
    supabase.from("listings").select("*").eq("id", id).single().then(({ data }) => {
      if (!data) { setNotFound(true); return; }
      setListing(data);
      setPhotos(data.photos ?? []);
      setVideos(data.videos ?? []);
      setLandType(data.land_type ?? "");
    });
    // Existing plot inventory (table may not exist until the migration runs — handled gracefully).
    supabase.from("farm_project_plots").select("*").eq("listing_id", id).order("created_at", { ascending: true }).then(({ data }) => {
      if (data?.length) setPlots(data.map((p: Record<string, unknown>) => ({
        plot_label: (p.plot_label as string) ?? "",
        size_value: p.size_value != null ? String(p.size_value) : "",
        size_unit: ((p.size_unit as string) ?? "sqft") as DraftPlot["size_unit"],
        price: p.price != null ? String(p.price) : "",
        status: ((p.status as string) ?? "available") as DraftPlot["status"],
      })));
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
    const f = new FormData(e.currentTarget);
    const latRaw = f.get("latitude");
    const lngRaw = f.get("longitude");
    const newPrice = Number(f.get("price"));
    const dropped = Number.isFinite(newPrice) && newPrice < Number(listing.price);
    const updates: Record<string, unknown> = {
      title: f.get("title"), description: f.get("description"), land_type: f.get("land_type"),
      price: newPrice, area_value: Number(f.get("area_value")), area_unit: f.get("area_unit"),
      previous_price: dropped ? listing.price : null,
      price_changed_at: dropped ? new Date().toISOString() : null,
      latitude: latRaw ? Number(latRaw) : listing.latitude,
      longitude: lngRaw ? Number(lngRaw) : listing.longitude,
      district: f.get("district"), taluka: f.get("taluka"), village: f.get("village"),
      water_source: f.get("water_source"), road_access: f.get("road_access"),
      electricity: f.get("electricity") === "on", status: f.get("status"),
      contact_phone: f.get("contact_phone"), contact_whatsapp: f.get("contact_whatsapp"),
      photos, videos, updated_at: new Date().toISOString(),
    };
    const projectType = isProjectType(f.get("land_type") as string);
    if (projectType) {
      const project = collectProjectFields(f);
      const verr = validateProjectFields(project, plots);
      if (verr) { setError(verr); return; }
      Object.assign(updates, project);
    }
    setSaving(true); setError("");
    const { error: dbError } = await supabase.from("listings").update(updates).eq("id", id);
    if (dbError) { setSaving(false); setError(dbError.message); return; }
    // Sync plot inventory (replace-all). Best-effort: table may not exist until the migration runs.
    if (projectType) {
      try {
        await supabase.from("farm_project_plots").delete().eq("listing_id", id);
        const rows = plotRowsForInsert(id, plots);
        if (rows.length) await supabase.from("farm_project_plots").insert(rows);
      } catch { /* best-effort */ }
    }
    setSaving(false);
    router.push(`/listing/${id}`);
  }

  const inp = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold">Edit listing</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label className="mb-1 block text-sm font-medium">Photos</label><PhotoUpload value={photos} onChange={setPhotos} /></div>
          <div><label className="mb-1 block text-sm font-medium">Videos</label><VideoUpload value={videos} onChange={setVideos} /></div>
          <div><label className="block text-sm font-medium mb-1">Title</label><input name="title" defaultValue={listing.title} className={inp} /></div>
          <div><label className="block text-sm font-medium mb-1">Land type</label>
            <select name="land_type" value={landType} onChange={(e) => setLandType(e.target.value)} className={inp}>
              <option value="agri_land">Agricultural land</option><option value="irrigated_farmland">Irrigated farmland</option>
              <option value="dryland">Dryland</option><option value="orchard">Orchard</option><option value="plantation">Plantation</option>
              <option value="farmhouse_land">Farmhouse land</option><option value="built_farmhouse">Built farmhouse</option><option value="na_converted">NA-converted</option>
              <option value="developed_rural_plot">Developed rural plot</option><option value="other">Other</option>
              <optgroup label="Farm plot projects">
                <option value="farm_plot_project">Farm plot project</option>
                <option value="managed_farmland">Managed farmland</option>
                <option value="farmhouse_plot">Farmhouse plot</option>
                <option value="gated_farm_plot">Gated farm plot</option>
                <option value="plantation_project">Plantation project</option>
              </optgroup>
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Price (₹)</label><input name="price" type="number" defaultValue={listing.price} className={inp} /></div>
            <div><label className="block text-sm font-medium mb-1">Status</label>
              {listing.status === "pending" ? (
                <select name="status" defaultValue="pending" className={inp}><option value="pending">Pending review</option><option value="withdrawn">Withdrawn</option></select>
              ) : (
                <select name="status" defaultValue={listing.status} className={inp}><option value="active">Active</option><option value="sold">Sold</option><option value="withdrawn">Withdrawn</option></select>
              )}
              {listing.status === "pending" && <p className="mt-1 text-xs text-gray-400">Pending listings go live once an admin approves them.</p>}</div>
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
          <div><label className="mb-1 block text-sm font-medium">Location</label>
            <LocationField defaultLat={listing.latitude} defaultLng={listing.longitude} defaultDistrict={listing.district ?? ""} defaultTaluka={listing.taluka ?? ""} defaultVillage={listing.village ?? ""} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer"><input name="electricity" type="checkbox" defaultChecked={listing.electricity} className="w-4 h-4 accent-green-700" /><span className="text-sm">Electricity available</span></label>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Phone</label><input name="contact_phone" defaultValue={listing.contact_phone ?? ""} className={inp} /></div>
            <div><label className="block text-sm font-medium mb-1">WhatsApp</label><input name="contact_whatsapp" defaultValue={listing.contact_whatsapp ?? ""} className={inp} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" rows={4} defaultValue={listing.description ?? ""} className={inp} /></div>

          {isProjectType(landType) && (
            <div className="space-y-6">
              <ProjectFieldsStep d={listing} />
              <div className="rounded-2xl border border-gray-200 p-5">
                <PlotInventoryEditor value={plots} onChange={setPlots} />
              </div>
            </div>
          )}

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 rounded-full bg-green-700 py-3 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
            <Link href={`/listing/${id}`} className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
