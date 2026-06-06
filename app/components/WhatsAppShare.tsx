"use client";
export default function WhatsAppShare({ title, price, url }: { title: string; price: number; url: string }) {
  const text = `Check out this land on Bhūmi:\n\n*${title}*\n₹${Number(price).toLocaleString("en-IN")}\n\n${url}`;
  return (
    <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
      📱 Share on WhatsApp
    </a>
  );
}
