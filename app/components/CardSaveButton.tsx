"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { hasGuestSave, toggleGuestSave } from "@/app/lib/guest-saves";

// Compact heart toggle for listing cards. Stops navigation (cards are links).
// Guests save to localStorage; signed-in users to the saved_listings table.
export default function CardSaveButton({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from("saved_listings").select("id").eq("user_id", user.id).eq("listing_id", listingId).maybeSingle()
        .then(({ data }) => setSaved(!!data));
    } else {
      setSaved(hasGuestSave(listingId));
    }
  }, [user, listingId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setSaved(toggleGuestSave(listingId));
      return;
    }
    if (saved) {
      await supabase.from("saved_listings").delete().eq("user_id", user.id).eq("listing_id", listingId);
      setSaved(false);
    } else {
      await supabase.from("saved_listings").insert({ user_id: user.id, listing_id: listingId });
      setSaved(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-base shadow-sm backdrop-blur transition-transform hover:scale-110"
    >
      <span className={saved ? "text-green-700" : "text-gray-500"}>{saved ? "♥" : "♡"}</span>
    </button>
  );
}
