"use client";
export default function WhatsAppShare({ title, price, url }: { title: string; price: number; url: string }) {
  const text = `Check out this land on AcreHub:\n\n*${title}*\n₹${Number(price).toLocaleString("en-IN")}\n\n${url}`;
  return (
    <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:text-green-800">
      📱 Share on WhatsApp
    </a>
  );
}
