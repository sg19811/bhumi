"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { hasGuestSave, toggleGuestSave } from "@/app/lib/guest-saves";

export default function SaveButton({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from("saved_listings").select("id").eq("user_id", user.id).eq("listing_id", listingId).maybeSingle()
        .then(({ data }) => setSaved(!!data));
    } else {
      setSaved(hasGuestSave(listingId));
    }
  }, [user, listingId]);

  async function toggle() {
    if (!user) {
      // Guests save to localStorage — no sign-in required.
      setSaved(toggleGuestSave(listingId));
      return;
    }
    setBusy(true);
    if (saved) {
      await supabase.from("saved_listings").delete().eq("user_id", user.id).eq("listing_id", listingId);
      setSaved(false);
    } else {
      await supabase.from("saved_listings").insert({ user_id: user.id, listing_id: listingId });
      setSaved(true);
    }
    setBusy(false);
  }

  return (
    <button onClick={toggle} disabled={busy}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-colors disabled:opacity-50 ${saved ? "border-green-600 bg-green-50 text-green-800" : "border-gray-300 bg-white text-gray-700 hover:border-green-600 hover:text-green-800"}`}>
      {saved ? "♥ Saved" : "♡ Save"}
    </button>
  );
}
