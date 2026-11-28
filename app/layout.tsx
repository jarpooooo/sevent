import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import MotionProvider from "./components/motion/MotionProvider";
import AuthSync from "./features/auth/AuthSync";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kainara-id.web.app";
const DESC = "Marketplace B2B sisa tekstil yang menghubungkan pabrik dengan UMKM penjahit terverifikasi.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Kainara | Bahan yang adil. Jahitan yang jalan.", template: "%s" },
  description: DESC,
  applicationName: "Kainara",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Kainara",
    title: "Kainara | Bahan yang adil. Jahitan yang jalan.",
    description: DESC,
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Kainara, marketplace sisa tekstil" }],
  },
  twitter: { card: "summary_large_image", title: "Kainara", description: DESC, images: ["/images/og.jpg"] },
};

const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: "Kainara", url: SITE, logo: `${SITE}/icon.svg`, description: DESC },
    { "@type": "WebSite", name: "Kainara", url: SITE, inLanguage: "id" },
  ],
});

export const viewport: Viewport = {
  themeColor: "#EEF1EA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${archivo.variable} ${inter.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />
        <MotionProvider>
          <AuthSync />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
