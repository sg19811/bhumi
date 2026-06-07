"use client";

import Link from "next/link";
import { track } from "@/app/lib/legal/analytics";
import { stateLabel } from "@/app/lib/legal/options";

type Lawyer = {
  id: string;
  name: string;
  state: string;
  districts?: string[] | null;
  languages: string[];
  practice_areas: string[];
  experience_years?: number | null;
  specializations?: string[] | null;
  consultation_modes?: string[] | null;
  consultation_fee_placeholder?: number | null;
  verification_badge?: string | null;
  rating_placeholder?: number | null;
  bio?: string | null;
  is_mock?: boolean | null;
};

export default function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-800">
          {lawyer.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-semibold text-gray-900">
            {lawyer.name}
            {lawyer.verification_badge === "verified" && <span title="Verified" className="text-green-700">✔</span>}
          </h3>
          <p className="text-sm text-gray-500">
            {stateLabel(lawyer.state)}
            {lawyer.experience_years ? ` · ${lawyer.experience_years} yrs` : ""}
            {lawyer.rating_placeholder ? ` · ★ ${lawyer.rating_placeholder}` : ""}
          </p>
        </div>
      </div>

      {lawyer.bio && <p className="mt-3 line-clamp-3 text-sm text-gray-600">{lawyer.bio}</p>}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(lawyer.specializations ?? lawyer.practice_areas).slice(0, 3).map((s) => (
          <span key={s} className="rounded-full bg-green-50 px-2.5 py-1 text-xs capitalize text-green-800">{s.replace(/_/g, " ")}</span>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {lawyer.languages?.length ? `Speaks ${lawyer.languages.join(", ")}` : ""}
        {lawyer.consultation_fee_placeholder ? ` · from ₹${lawyer.consultation_fee_placeholder.toLocaleString("en-IN")}*` : ""}
      </p>

      <div className="mt-auto pt-4">
        <Link
          href={`/legal/talk-to-lawyer?lawyer=${lawyer.id}`}
          onClick={() => track("legal_lawyer_card_clicked", { lawyer_id: lawyer.id })}
          className="block rounded-full bg-green-700 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-green-800"
        >
          Contact
        </Link>
      </div>
      {lawyer.is_mock && <p className="mt-2 text-center text-[10px] uppercase tracking-wide text-gray-400">Sample profile</p>}
    </div>
  );
}
