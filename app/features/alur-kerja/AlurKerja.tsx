"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MosaicCover from "../../components/mosaic/MosaicCover";

type Panel = {
  id: "umkm" | "pabrik";
  title: string;
  desc: string;
  image: string;
  detailTitle: string;
  steps: { t: string; d: string }[];
  cta: { label: string; href: string };
  seed: number;
};

const PANELS: Panel[] = [
  {
    id: "umkm",
    title: "UMKM",
    desc: "Cari bahan, pilih cara beli, terima di tempatmu.",
    image: "/images/alur-umkm.webp",
    detailTitle: "Alur UMKM",
    steps: [
      { t: "Masuk", d: "Daftar sebagai UMKM, lolos verifikasi singkat." },
      { t: "Cari & bandingkan", d: "Isi daerah dan kebutuhan kain, lihat lot yang cocok." },
      { t: "Pilih model beli", d: "Harga tetap regional atau lelang nasional." },
      { t: "Jumlah & kirim", d: "Tentukan kg, ambil sendiri atau diantar." },
      { t: "Terima", d: "Bahan tiba, statusnya tercatat sampai selesai." },
    ],
    cta: { label: "Daftar sebagai UMKM", href: "/masuk" },
    seed: 3,
  },
  {
    id: "pabrik",
    title: "Pabrik",
    desc: "Catat sisa produksi, pilih kanal, terima hasil jualnya.",
    image: "/images/alur-pabrik.webp",
    detailTitle: "Alur Pabrik",
    steps: [
      { t: "Daftar", d: "Isi identitas pabrik dan penanggung jawab." },
      { t: "Catat lot", d: "Jenis, berat, foto, dan asal bahan." },
      { t: "Dicek tim", d: "Kami cek kelayakan sebelum lot tayang." },
      { t: "Pilih kanal", d: "Harga tetap regional atau lelang nasional." },
      {
        t: "Terjual & serah",
        // Dana cair setelah barang diterima dan dikonfirmasi (bukan langsung setelah komisi)
        d: "Dana cair lewat PJP setelah barang diterima dan dikonfirmasi. Komisi 2% ditanggung pabrik.",
      },
    ],
    cta: { label: "Daftar sebagai pabrik", href: "/masuk" },
    seed: 11,
  },
];

// Zona teks default yang selalu tertutup (pecahan panel). Sengaja lebih lebar dari teksnya:
// satu baris tile di atas dan di bawah teks, serta seluruh lebar panel, ikut tertutup. Foto hanya
// terbuka di pita atas dan bawah, jadi tidak ada potongan foto yang menempel di dekat tulisan.
const KEEP = [{ x0: 0, x1: 1, y0: 0.28, y1: 0.84 }];
const EASE = [0.16, 1, 0.3, 1] as const;

export default function AlurKerja() {
  const [active, setActive] = useState<Panel["id"] | null>(null);
  const [origin, setOrigin] = useState({ x: 0.5, y: 0.5 });
  const reduce = !!useSafeReducedMotion();

  // Gelombang membuka dari titik masuk kursor (atau tengah panel untuk keyboard/sentuh)
  const enter = (id: Panel["id"], e?: React.PointerEvent<HTMLDivElement>) => {
    if (e) {
      const r = e.currentTarget.getBoundingClientRect();
      setOrigin({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    } else {
      setOrigin({ x: 0.5, y: 0.5 });
    }
    setActive(id);
  };

  return (
    <section
      aria-label="Alur kerja"
      className="flex min-h-svh flex-col pt-[72px] md:h-svh md:min-h-0 md:flex-row"
      onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
    >
      {PANELS.map((p) => {
        const on = active === p.id;
        return (
          <div
            key={p.id}
            onPointerEnter={(e) => e.pointerType === "mouse" && enter(p.id, e)}
            onFocus={() => setActive(p.id)}
            className={`relative flex-1 overflow-hidden bg-inverse transition-[min-height] duration-500 md:min-h-0 ${
              on ? "min-h-[860px]" : "min-h-[max(340px,calc((100svh-72px)/2))]"
            }`}
          >
            {/* Pembatas tengah 4px per panel, warna bg (bukan border aksen) */}
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 z-10 hidden w-1 bg-surface md:block ${p.id === "umkm" ? "right-0" : "left-0"}`}
            />
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{ scale: on && !reduce ? 1.04 : 1 }}
              transition={{ duration: 1.2, ease: EASE }}
            >
              <Image
                src={p.image}
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </motion.div>
            <MosaicCover
              cols={6}
              rows={8}
              openRatio={0.34}
              seed={p.seed}
              keeps={KEEP}
              hidden={on}
              origin={on ? origin : { x: 0.5, y: 0.5 }}
              startDelay={p.id === "umkm" ? 0.2 : 0.45}
              className="absolute inset-0"
            />
            {/* Peredam di atas mosaik: teks putih terbaca sejak daun jendela pertama bergerak */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 bg-scrim"
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            />

            {/* Tampilan awal */}
            <motion.div
              className="absolute inset-0 flex flex-col justify-center px-8 md:px-[60px]"
              initial={false}
              animate={{ opacity: on ? 0 : 1, y: on && !reduce ? -12 : 0 }}
              transition={{ duration: on ? 0.25 : 0.5, ease: EASE, delay: on ? 0 : 0.25 }}
              style={{ pointerEvents: on ? "none" : "auto" }}
            >
              <button
                type="button"
                aria-expanded={on}
                onClick={() => (on ? setActive(null) : enter(p.id))}
                className="flex w-fit flex-col items-start text-left"
              >
                <h2 className="font-display text-[clamp(56px,6vw,84px)] leading-none tracking-[-0.04em]">
                  {p.title}
                </h2>
                <p className="mt-6 max-w-[420px] text-[clamp(17px,1.4vw,20px)] leading-[1.5] text-text-muted">
                  {p.desc}
                </p>
                <span className="mt-6 flex items-center gap-2.5 text-[15px] font-medium text-brand">
                  <span aria-hidden="true" className="size-[10px] rounded-full bg-accent" />
                  <span className="hidden md:inline">Arahkan kursor untuk lihat alurnya</span>
                  <span className="md:hidden">Ketuk untuk lihat alurnya</span>
                </span>
              </button>
            </motion.div>

            {/* Detail alur */}
            <div
              aria-hidden={!on}
              className={`absolute inset-0 flex flex-col overflow-y-auto px-8 pb-10 pt-12 text-on-dark md:px-[60px] md:pb-[clamp(16px,4svh,40px)] md:pt-[clamp(16px,5svh,48px)] ${
                on ? "" : "pointer-events-none"
              }`}
            >
              <AnimatePresence>
                {on && (
                  <motion.div
                    key="detail"
                    className="flex min-h-full flex-col"
                    initial="hidden"
                    animate="show"
                    exit="out"
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
                      out: { opacity: 0, transition: { duration: 0.15 } },
                    }}
                  >
                    <h3 className="overflow-hidden pb-1 font-display text-[clamp(40px,4.2vw,60px)] leading-none tracking-[-0.03em] md:text-[clamp(30px,min(4.2vw,7svh),60px)]">
                      <motion.span
                        className="block"
                        variants={{
                          hidden: { y: reduce ? "0%" : "105%", opacity: reduce ? 0 : 1 },
                          show: { y: "0%", opacity: 1, transition: { duration: 0.8, ease: EASE } },
                        }}
                      >
                        {p.detailTitle}
                      </motion.span>
                    </h3>
                    <ol className="mt-8 flex flex-col gap-6 md:mt-[clamp(12px,4svh,40px)] md:gap-[clamp(10px,2.6svh,24px)]">
                      {p.steps.map((s, i) => (
                        <motion.li
                          key={s.t}
                          className="flex items-start gap-[clamp(12px,1.6vw,18px)]"
                          variants={{
                            hidden: { opacity: 0, y: reduce ? 0 : 14 },
                            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
                          }}
                        >
                          <span
                            className={`font-display flex size-9 shrink-0 items-center justify-center rounded-full text-[16px] md:size-[clamp(28px,4.2svh,36px)] md:text-[clamp(13px,1.9svh,16px)] ${
                              i === p.steps.length - 1 ? "bg-accent text-text" : "bg-brand text-on-dark"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-display text-[22px] leading-tight tracking-[-0.02em] md:text-[clamp(18px,3.1svh,24px)]">
                              {s.t}
                            </p>
                            <p className="mt-1 max-w-[460px] text-[15px] leading-[23px] text-on-dark/80 md:text-[clamp(13px,2svh,16px)] md:leading-[1.45]">
                              {s.d}
                            </p>
                          </div>
                        </motion.li>
                      ))}
                    </ol>
                    <motion.div
                      className="mt-auto pt-8 md:pt-[clamp(12px,3svh,32px)]"
                      variants={{
                        hidden: { opacity: 0, y: reduce ? 0 : 14 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
                      }}
                    >
                      <motion.div whileTap={{ scale: 0.97 }} className="w-fit">
                        <Link
                          href={p.cta.href}
                          className="block rounded-full bg-card px-[26px] py-3.5 text-[16px] font-medium text-brand transition-colors hover:bg-brand-soft md:py-[clamp(10px,1.8svh,14px)]"
                        >
                          {p.cta.label}
                        </Link>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </section>
  );
}
