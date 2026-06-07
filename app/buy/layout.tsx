import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post what land you want to buy | AcreHub",
  description: "Tell us your budget, location and land type, and we'll match you with verified agricultural land — and notify you when the right parcel is listed.",
  alternates: { canonical: "/buy" },
};

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
