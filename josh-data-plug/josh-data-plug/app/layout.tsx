import type { Metadata, Viewport } from "next";
import AnnouncementBar from "@/components/AnnouncementBar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ToastProvider } from "@/components/Toast";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getActiveAnnouncement } from "@/lib/auth";
import { BRAND } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: `${BRAND.name} | Cheap Data, Airtime & Bills in Nigeria`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    "Buy cheap MTN, Airtel, Glo and 9mobile data, airtime, cable TV, electricity and exam pins with instant delivery. Based in Jos, Plateau State.",
  applicationName: BRAND.name,
  keywords: ["cheap data", "MTN data", "Airtel data", "Glo data", "9mobile data", "airtime", "Jos", "Nigeria"],
  openGraph: {
    title: BRAND.name,
    description: BRAND.tagline,
    url: BRAND.siteUrl,
    siteName: BRAND.name,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "en_NG",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: BRAND.name, description: BRAND.tagline, images: ["/og.png"] },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#16A34A",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const announcement = await getActiveAnnouncement();

  return (
    <html lang="en-NG">
      <body>
        <ToastProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[70] focus:rounded focus:bg-white focus:p-2"
          >
            Skip to content
          </a>
          <AnnouncementBar message={announcement} />
          <Header />
          <main id="main" className="min-h-[60vh] pb-8">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
