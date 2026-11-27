"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MosaicLoop from "../../../components/mosaic/MosaicLoop";
import { Icon } from "../../../components/ui/icons";

const EASE = [0.16, 1, 0.3, 1] as const;

const ITEMS = [
  {
    q: "Dari mana bahannya?",
    a: "Dari sisa produksi pabrik yang sudah terdaftar. Setiap lot mencantumkan pabrik asal dan daerahnya, jadi kamu tahu sumbernya sebelum membeli.",
  },
  {
    q: "Apa bedanya harga tetap regional dan lelang terbalik?",
    a: "Harga tetap regional dipakai untuk pabrik dalam radius 50 km darimu: harganya tetap dan bisa langsung checkout jika stok tersedia. Lelang terbalik berjalan 72 jam: harga turun tiap 6 jam selama stok masih ada, dan batas harga terendah pabrik tidak ditampilkan.",
  },
  {
    q: "Boleh beli sebagian lot?",
    a: "Boleh. Misalnya 40 kg dari lot 500 kg, sisanya 460 kg tetap tersedia untuk pembeli lain. Batas minimum beli (MOQ) default 5 kg, dan angkanya tertera di halaman lot.",
  },
  {
    q: "Ada biaya tambahan untuk UMKM?",
    a: "Tidak ada fee platform untuk UMKM. Komisi 2% ditanggung pabrik. Kamu hanya membayar harga barang, ditambah ongkir bila memilih diantar (ongkir ditanggung pembeli).",
  },
  {
    q: "Bagaimana bahannya sampai?",
    a: "Pilih ambil sendiri atau diantar ke alamatmu; ongkir ditanggung pembeli. Kamu membayar ke virtual account lewat PJP, dan dana ditahan sampai barang diterima. Setelah barang tiba, penerimaan dikonfirmasi (oleh kamu bila ambil sendiri, oleh kurir bila diantar), lalu dana diteruskan ke pabrik. Komplain terbuka 48 jam setelah barang diterima.",
  },
  {
    q: "Siapa yang bisa daftar?",
    a: "UMKM penjahit dan pengrajin yang lolos verifikasi empat tingkat: identitas usaha, bukti aktivitas, NIB atau dokumen lain, serta kebutuhan dan kapasitas. Admin memeriksa setiap tingkat. Pabrik yang ingin menjual sisa produksi juga mendaftar dan melalui pengecekan.",
  },
];

// Mosaik penutup foto gudang: [baris, kolom] tile yang tertutup (12 kolom x 2 baris)
export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section
      id="faq"
      aria-label="Pertanyaan yang sering muncul"
      className="mx-auto flex max-w-[1440px] flex-col gap-14 px-5 py-20 sm:px-10 md:gap-20 md:py-[120px]"
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-20">
        <div className="shrink-0 lg:w-[420px]">
          <h2 className="font-display text-[clamp(36px,4.9vw,56px)] leading-[1.06] tracking-[-0.03em]">
            Pertanyaan yang sering muncul.
          </h2>
          <p className="mt-5 max-w-[380px] text-[18px] leading-7 text-text-muted">
            Belum ketemu jawabannya? Tulis ke kami lewat halaman Kontak.
          </p>
          <Link
            href="/kontak"
            className="mt-5 inline-block rounded-full bg-brand px-6 py-3 text-[16px] font-medium text-on-dark transition-colors hover:bg-brand-hover"
          >
            Buka Kontak
          </Link>
        </div>

        <div className="min-w-0 flex-1 border-t border-border">
          {ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q} className="border-b border-border">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-6 py-[26px] text-left"
                  >
                    <span className="font-display max-w-[640px] text-[clamp(20px,2vw,26px)] leading-tight tracking-[-0.02em]">
                      {it.q}
                    </span>
                    <motion.span
                      aria-hidden="true"
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                        isOpen ? "bg-brand text-on-dark" : "bg-brand-soft text-text"
                      }`}
                      initial={false}
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <Icon name={isOpen ? "minus" : "plus"} size={18} />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${i}`}
                      role="region"
                      key="isi"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[640px] pb-[26px] text-[clamp(16px,1.4vw,18px)] leading-7 text-text-muted">
                        {it.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strip foto gudang + mosaik yang menutup dan membuka pelan, tanpa henti */}
      <div aria-hidden="true" className="relative h-[130px] overflow-hidden bg-inverse sm:h-[180px] lg:h-[225px]">
        <Image
          src="/images/gudang.webp"
          alt=""
          fill
          sizes="(min-width: 1440px) 1360px, 100vw"
          className="object-cover"
        />
        <MosaicLoop cols={12} rows={2} seed={21} line={1} className="absolute inset-0 hidden sm:block" />
        <MosaicLoop cols={6} rows={2} seed={22} line={1} className="absolute inset-0 sm:hidden" />
      </div>
    </section>
  );
}
