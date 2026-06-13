"use client";
import { useRef, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { trackEvent } from "@/app/lib/analytics";
import Link from "next/link";
import Header from "@/app/components/Header";
import PhotoUpload from "@/app/components/PhotoUpload";
import VideoUpload from "@/app/components/VideoUpload";
import LocationField from "@/app/components/LocationField";
import WantedAreas from "@/app/components/WantedAreas";
import ProjectFieldsStep from "@/app/components/farm-plots/ProjectFieldsStep";
import AiListingAssist from "@/app/components/farm-plots/AiListingAssist";
import PlotInventoryEditor, { type DraftPlot } from "@/app/components/farm-plots/PlotInventoryEditor";
import { isProjectType } from "@/app/lib/farm-plots/types";
import { collectProjectFields, validateProjectFields, plotRowsForInsert } from "@/app/lib/farm-plots/submit";
import { validateListingPayload } from "@/app/lib/validation/client";

export default function NewListing() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [landType, setLandType] = useState("");
  const [plots, setPlots] = useState<DraftPlot[]>([]);
  const [step, setStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stepLabels = ["Photos & video", "Basics", "Location & features", "Contact"];

  function validateStep(i: number) {
    const el = stepRefs.current[i];
    if (!el) return true;
    const controls = Array.from(el.querySelectorAll<HTMLInputElement>("input, select, textarea"));
    for (const c of controls) {
      if (!c.checkValidity()) { c.reportValidity(); return false; }
    }
    return true;
  }
  function next() {
    if (!validateStep(step)) return;
    setError("");
    setStep((s) => Math.min(s + 1, stepLabels.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    // Honeypot: real users never see/fill this; bots do. Pretend success, skip DB.
    if (f.get("company")) { setSuccess(true); return; }
    const latRaw = f.get("latitude");
    const lngRaw = f.get("longitude");
    const projectType = isProjectType(landType);
    const payload: Record<string, unknown> = {
      owner_user_id: user?.id ?? null,
      title: f.get("title"), description: f.get("description"), land_type: f.get("land_type"),
      price: Number(f.get("price")), price_basis: f.get("price_basis"),
      area_value: Number(f.get("area_value")), area_unit: f.get("area_unit"),
      latitude: latRaw ? Number(latRaw) : null, longitude: lngRaw ? Number(lngRaw) : null,
      district: f.get("district"), taluka: f.get("taluka"), village: f.get("village"),
      water_source: f.get("water_source"), road_access: f.get("road_access"),
      electricity: f.get("electricity") === "on",
      contact_email: f.get("contact_email"), contact_phone: f.get("contact_phone"), contact_whatsapp: f.get("contact_whatsapp"),
      photos, videos,
      status: "pending",
    };
    // Only project listings carry the new columns (they may not exist in DB until the migration runs).
    if (projectType) {
      const project = collectProjectFields(f);
      const pErr = validateProjectFields(project, plots);
      if (pErr) { setError(pErr); setStep(1); return; }
      Object.assign(payload, project);
    }
    setSubmitting(true); setError("");
    // Server-shape validation gate (foundation-hardening) before writing.
    const verr = await validateListingPayload(payload);
    if (verr) { setError(verr); setSubmitting(false); return; }
    // .select() returns the id when readable; pending listings aren't owner-readable
    // under current RLS, so plot inventory is best saved later via edit (where the id is known).
    const { data: inserted, error: dbError } = await supabase.from("listings").insert(payload).select("id").maybeSingle();
    if (dbError) { setSubmitting(false); setError(dbError.message); return; }
    if (projectType && inserted?.id && plots.length) {
      const rows = plotRowsForInsert(inserted.id, plots);
      if (rows.length) { try { await supabase.from("farm_project_plots").insert(rows); } catch { /* best-effort */ } }
    }
    setSubmitting(false);
    trackEvent("listing_posted", { land_type: landType || null, has_photos: photos.length > 0 });
    setSuccess(true); setPhotos([]); setVideos([]); setPlots([]); setLandType(""); e.currentTarget.reset();
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-lg px-6 py-20 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">✓</div>
          <h1 className="mb-2 text-2xl font-bold">Listing submitted!</h1>
          <p className="mb-4 text-gray-600">Thanks — we&apos;ve received your land details.</p>
          <div className="mx-auto mb-8 max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800">
            <p className="font-semibold">⏳ Pending review</p>
            <p className="mt-1">Your land will become visible to buyers on AcreHub <span className="font-medium">once our team approves it</span>. This helps keep listings trustworthy. You can track its status anytime under <Link href="/my-listings" className="font-medium underline">My listings</Link>.</p>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => { setSuccess(false); setStep(0); }} className="rounded-full bg-green-700 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800">Create another</button>
            <Link href="/my-listings" className="rounded-full border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50">My listings</Link>
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
        <p className="text-gray-500 mb-6">Step {step + 1} of {stepLabels.length} · {stepLabels[step]}</p>
        <div className="mb-8 flex gap-1.5">
          {stepLabels.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-green-600" : "bg-gray-200"}`} />
          ))}
        </div>
        {step === 0 && <div className="mb-6"><WantedAreas /></div>}
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
            <label>Company (leave blank)<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
          </div>

          {/* Step 1: media */}
          <div ref={(el) => { stepRefs.current[0] = el; }} className={step === 0 ? "space-y-8" : "hidden"}>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Photos</h2>
            <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
              <span aria-hidden="true">📸</span>
              <p>
                <span className="font-semibold">Add at least 3 photos</span> — a wide view of the land, the approach road, and the water source.
                Listings with photos get far more inquiries and a higher Trust Score. No photos shows buyers a &ldquo;Photo coming soon&rdquo; placeholder, which they tend to skip.
              </p>
            </div>
            <PhotoUpload value={photos} onChange={setPhotos} />
            {photos.length === 0 && (
              <p className="text-xs text-amber-600">No photos added yet — your listing will show a &ldquo;Photo coming soon&rdquo; placeholder until you add some.</p>
            )}
          </section>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Videos</h2>
            <VideoUpload value={videos} onChange={setVideos} />
          </section>
          </div>

          {/* Step 2: basics */}
          <div ref={(el) => { stepRefs.current[1] = el; }} className={step === 1 ? "space-y-8" : "hidden"}>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Basic information</h2>
            <div><label className="block text-sm font-medium mb-1">Title *</label>
              <input name="title" required placeholder="2-acre farmhouse plot near Hunsur, Mysuru" className={inp} /></div>
            <div><label className="block text-sm font-medium mb-1">Land type *</label>
              <select name="land_type" required className={inp} value={landType} onChange={(e) => setLandType(e.target.value)}>
                <option value="">Select type</option>
                <option value="agri_land">Agricultural land</option><option value="irrigated_farmland">Irrigated farmland</option>
                <option value="dryland">Dryland</option><option value="orchard">Orchard</option>
                <option value="plantation">Plantation</option><option value="farmhouse_land">Farmhouse land</option>
                <option value="built_farmhouse">Built farmhouse</option><option value="na_converted">NA-converted</option>
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
              <div><label className="block text-sm font-medium mb-1">Price (₹) *</label><input name="price" type="number" min="1" required placeholder="5000000" className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1">Price is for</label>
                <select name="price_basis" className={inp}><option value="total">Total</option><option value="per_acre">Per acre</option><option value="per_guntha">Per guntha</option><option value="per_sqft">Per sq ft</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Area *</label><input name="area_value" type="number" step="0.01" min="0.01" required placeholder="2.5" className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1">Unit</label>
                <select name="area_unit" className={inp}><option value="acre">Acres</option><option value="guntha">Gunthas</option><option value="hectare">Hectares</option><option value="sqft">Sq ft</option><option value="cent">Cents</option><option value="bigha">Bighas</option></select></div>
            </div>
          </section>

          {isProjectType(landType) && (
            <div className="space-y-6">
              <ProjectFieldsStep />
              <div className="rounded-2xl border border-gray-200 p-5">
                <PlotInventoryEditor value={plots} onChange={setPlots} />
              </div>
            </div>
          )}
          </div>

          {/* Step 3: location & features */}
          <div ref={(el) => { stepRefs.current[2] = el; }} className={step === 2 ? "space-y-8" : "hidden"}>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Location</h2>
            <LocationField />
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
          </div>

          {/* Step 4: contact & description */}
          <div ref={(el) => { stepRefs.current[3] = el; }} className={step === 3 ? "space-y-8" : "hidden"}>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Contact</h2>
            <p className="text-sm text-gray-500">No account needed — buyers will reach you using the details below.</p>
            <div><label className="block text-sm font-medium mb-1">Email *</label><input name="contact_email" type="email" required placeholder="you@example.com" className={inp} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Phone *</label><input name="contact_phone" required inputMode="numeric" pattern="[0-9]{10}" title="Enter a 10-digit phone number" placeholder="9876543210" className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1">WhatsApp</label><input name="contact_whatsapp" inputMode="numeric" pattern="[0-9]{10}" title="Enter a 10-digit WhatsApp number" placeholder="Same if blank" className={inp} /></div>
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-green-800">Description</h2>
            <textarea name="description" rows={4} aria-label="Description" placeholder="Crops grown, soil type, nearby landmarks, why you're selling..." className={inp} />
            <AiListingAssist />
          </section>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button type="button" onClick={back} className="rounded-full border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50">← Back</button>
            ) : <span />}
            {step < stepLabels.length - 1 ? (
              <button type="button" onClick={next} className="rounded-full bg-green-700 px-8 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800">Next →</button>
            ) : (
              <button type="submit" disabled={submitting} className="rounded-full bg-green-700 px-8 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">
                {submitting ? "Publishing…" : "Publish listing"}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
