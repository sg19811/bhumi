import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import LegalDisclaimerFooter from "@/app/components/legal/LegalDisclaimerFooter";

// Shared shell for every /legal/** page: header, content, the mandatory
// disclaimer footer, then the site footer.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <div className="flex-1">{children}</div>
      <LegalDisclaimerFooter />
      <Footer />
    </div>
  );
}
