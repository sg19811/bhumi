import { DISCLAIMER_FOOTER } from "@/app/lib/legal/copy";

// Page-bottom disclaimer rendered on every /legal/** page via the legal layout.
export default function LegalDisclaimerFooter() {
  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
        <p className="text-xs leading-relaxed text-gray-500">
          <span className="font-semibold text-gray-600">Disclaimer: </span>
          {DISCLAIMER_FOOTER}
        </p>
      </div>
    </div>
  );
}
