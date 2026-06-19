"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { withUtm } from "@/app/lib/utm";

// Share buttons that automatically attach the signed-in user's referral code to
// the shared URL and log a growth_event on each share. Replaces the standalone
// WhatsAppShare + ShareButton. See growth-engine-spec-aggressive-v2.md §1.5.
export default function ShareButtonGroup({
  title,
  price,
  url,
  entityType = "listing",
  entityId,
}: {
  title: string;
  price?: number;
  url: string;
  entityType?: string;
  entityId?: string;
}) {
  const { user } = useAuth();
  const [refCode, setRefCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch the viewer's own referral code (RLS allows reading your own).
  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) {
        if (active) setRefCode(null);
        return;
      }
      const { data } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (active) setRefCode(data?.code ?? null);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const shareUrl = withUtm(url, { source: "share", medium: "social", campaign: `${entityType}_share` }, refCode);

  function track(channel: "whatsapp" | "direct") {
    fetch("/api/growth/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: channel === "whatsapp" ? "whatsapp_share_clicked" : "listing_share_clicked",
        entity_type: entityType,
        entity_id: entityId ?? null,
        referral_code: refCode,
        channel,
      }),
    }).catch(() => {});
  }

  const waText = `Check out this on AcreHub:\n\n*${title}*${price ? `\n₹${Number(price).toLocaleString("en-IN")}` : ""}\n\n${shareUrl}`;
  const btn =
    "inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:text-green-800";

  async function copyOrShare() {
    track("direct");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("whatsapp")}
        className={btn}
      >
        📱 Share on WhatsApp
      </a>
      <button onClick={copyOrShare} className={btn}>
        {copied ? "✓ Link copied" : "🔗 Share"}
      </button>
    </>
  );
}
