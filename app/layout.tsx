import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import MotionProvider from "./components/motion/MotionProvider";
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

export const metadata: Metadata = {
  title: "ClearanceLoop — Bahan yang adil. Jahitan yang jalan.",
  description:
    "Marketplace B2B sisa tekstil yang menghubungkan pabrik dengan UMKM penjahit terverifikasi.",
};

export const viewport: Viewport = {
  themeColor: "#EEF1EA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${archivo.variable} ${inter.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
