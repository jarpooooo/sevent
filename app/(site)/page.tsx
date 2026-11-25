import AsalBahan from "../components/AsalBahan";
import CtaFooter from "../components/CtaFooter";
import Faq from "../components/Faq";
import MaterialStrip from "../components/MaterialStrip";
import Pernyataan from "../components/Pernyataan";
import StageSteps from "../components/StageSteps";
import StickyScrollStory from "../components/StickyScrollStory";
import UmkmDemo from "../components/UmkmDemo";

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
          image="/images/hero.png"
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
