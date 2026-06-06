"use client";
import { useAuth } from "@/app/lib/auth";
import Link from "next/link";

export default function OwnerEditLink({ listingId, ownerUserId }: { listingId: string; ownerUserId: string | null }) {
  const { user } = useAuth();
  if (!user || !ownerUserId || user.id !== ownerUserId) return null;
  return (
    <Link href={`/listing/${listingId}/edit`} className="text-sm text-green-700 hover:underline">Edit listing</Link>
  );
}
