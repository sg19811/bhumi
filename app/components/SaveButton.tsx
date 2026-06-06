"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { useRouter } from "next/navigation";

export default function SaveButton({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("saved_listings").select("id").eq("user_id", user.id).eq("listing_id", listingId).maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [user, listingId]);

  async function toggle() {
    if (!user) { router.push("/auth/signin"); return; }
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
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border ${saved ? "bg-green-50 border-green-600 text-green-800" : "border-gray-300 hover:bg-gray-50"}`}>
      {saved ? "♥ Saved" : "♡ Save"}
    </button>
  );
}
