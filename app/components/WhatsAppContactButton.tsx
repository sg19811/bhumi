import { formatINRShort } from "@/app/lib/format";

// Prominent "Chat on WhatsApp" button that opens a pre-filled message to the
// seller. India runs on WhatsApp, so this is often the highest-converting CTA.
// Renders nothing when the seller has no WhatsApp/phone number on file.
export default function WhatsAppContactButton({
  whatsapp,
  phone,
  title,
  price,
}: {
  whatsapp?: string | null;
  phone?: string | null;
  title: string;
  price: number | string;
}) {
  const num = String(whatsapp || phone || "").replace(/\D/g, "");
  if (!num) return null;
  // Assume 10-digit Indian numbers; prefix 91 if not already country-coded.
  const e164 = num.length === 10 ? `91${num}` : num;
  const msg = `Hi, I'm interested in your land "${title}" (${formatINRShort(price)}) on AcreHub. Is it still available?`;

  return (
    <a
      href={`https://wa.me/${e164}?text=${encodeURIComponent(msg)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-medium text-white shadow-sm transition-opacity hover:opacity-90"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.42 9.43-9.42a9.4 9.4 0 0 1 9.42 9.43c0 5.2-4.23 9.43-9.42 9.43zm5.5-14.93A11.8 11.8 0 0 0 12.04 0C5.46 0 .1 5.36.1 11.94c0 2.1.55 4.16 1.6 5.97L0 24l6.24-1.64a11.9 11.9 0 0 0 5.8 1.48h.01c6.58 0 11.93-5.36 11.94-11.94a11.86 11.86 0 0 0-3.49-8.43z" />
      </svg>
      Chat on WhatsApp
    </a>
  );
}
