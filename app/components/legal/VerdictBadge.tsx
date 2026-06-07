import type { Verdict } from "@/app/lib/legal/types";
import { VERDICT_META, toneClasses } from "@/app/lib/legal/copy";

export default function VerdictBadge({ verdict, size = "md" }: { verdict: Verdict; size?: "sm" | "md" | "lg" }) {
  const meta = VERDICT_META[verdict];
  const pad = size === "lg" ? "px-4 py-2 text-base" : size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${toneClasses[meta.tone]} ${pad}`}>
      <span aria-hidden="true">
        {meta.tone === "green" ? "✓" : meta.tone === "red" ? "✕" : meta.tone === "grey" ? "?" : "!"}
      </span>
      {meta.label}
    </span>
  );
}
