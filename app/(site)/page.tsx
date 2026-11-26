import dynamic from "next/dynamic";
import MaterialStrip from "../components/MaterialStrip";
import StickyScrollStory from "../components/StickyScrollStory";

// Bagian di bawah layar pertama dipecah jadi chunk sendiri. HTML-nya tetap dirender server,
// tetapi hidrasinya berlangsung per bagian (bukan satu tugas panjang) dan bundle awal lebih kecil.
const Pernyataan = dynamic(() => import("../components/Pernyataan"));
const StageSteps = dynamic(() => import("../components/StageSteps"));
const UmkmDemo = dynamic(() => import("../components/UmkmDemo"));
const AsalBahan = dynamic(() => import("../components/AsalBahan"));
const Faq = dynamic(() => import("../components/Faq"));
const CtaFooter = dynamic(() => import("../components/CtaFooter"));

const STORY = [
  "Sisa produksi pabrik terlalu sering berakhir di pengepul dengan harga murah.",
  "UMKM penjahit lalu membeli bahan yang sama dengan harga yang jauh lebih tinggi.",
  "ClearanceLoop mempertemukan keduanya langsung, di harga yang adil bagi dua sisi.",
  "Satu lot dicatat, dijual regional, dilelang nasional, lalu sampai ke penjahit.",
];

export default function Home() {
  return (
    <>
      <main>
        <StickyScrollStory
          texts={STORY}
          introTitle="ClearanceLoop"
          image="/images/hero.webp"
          finale={{
            title: ["Bahan yang adil.", "Jahitan yang jalan."],
            body: "Pasar B2B untuk sisa tekstil. Pabrik menjual langsung ke UMKM yang sudah kami verifikasi.",
            primary: { label: "Daftar sebagai UMKM", href: "#demo-umkm" },
            secondary: { label: "Jual surplus pabrik", href: "#mulai" },
          }}
        />
        <Pernyataan />
        <StageSteps />
        <MaterialStrip />
        <UmkmDemo />
        <AsalBahan />
        <Faq />
      </main>
      <CtaFooter />
    </>
  );
}
