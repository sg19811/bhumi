"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import DocUpload from "@/app/components/DocUpload";

// Owner-only panel on the listing detail page to request team verification.
export default function VerificationPanel({
  listingId,
  ownerUserId,
  isVerified,
}: {
  listingId: string;
  ownerUserId: string | null;
  isVerified: boolean;
}) {
  const { user } = useAuth();
  const isOwner = !!user && !!ownerUserId && user.id === ownerUserId;

  const [req, setReq] = useState<any | null>(null);
  const [docs, setDocs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOwner) return;
    supabase
      .from("verification_requests")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setReq(data));
  }, [isOwner, listingId]);

  if (!isOwner) return null;

  if (isVerified) {
    return (
      <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-800">
        ✓ This listing is <strong>verified</strong> by the AcreHub team.
      </div>
    );
  }

  const status = submitted ? "pending" : req?.status;

  if (status === "pending") {
    return (
      <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        ⏳ Verification in progress — our team is reviewing your documents.
      </div>
    );
  }

  async function submit() {
    if (!docs.length || !user) return;
    setBusy(true);
    const { error } = await supabase.from("verification_requests").insert({
      listing_id: listingId,
      owner_user_id: user.id,
      documents: docs,
      status: "pending",
    });
    setBusy(false);
    if (!error) setSubmitted(true);
  }

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Get this listing verified</h2>
      <p className="mt-1 text-sm text-gray-500">
        Upload ownership documents (RTC / 7‑12 extract, sale deed, tax receipt). They&apos;re stored privately and
        reviewed by our team — verification raises your Trust Score and buyer confidence.
      </p>
      {req?.status === "rejected" && req?.note && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">Needs changes: {req.note}</p>
      )}
      <div className="mt-4">
        <DocUpload value={docs} onChange={setDocs} />
      </div>
      <button
        onClick={submit}
        disabled={busy || docs.length === 0}
        className="mt-4 rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit for verification"}
      </button>
    </div>
  );
}
