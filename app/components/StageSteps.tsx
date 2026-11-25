"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  type Variants,
} from "motion/react";
import { useSafeReducedMotion } from "./useSafeReducedMotion";
import Image from "next/image";
import { useRef, useState } from "react";

type Card = {
  title: string;
  body: string;
  label: string;
  chart?: { color: "teal" | "ochre"; heights: number[] }[];
};

type Step = {
  stepper: string;
  word: string;
  note: string;
  image: string;
  cards: Card[];
};

const STEPS: Step[] = [
  {
    stepper: "Masuk",
    word: "Masuk",
    note: "Daftar atau masuk, lalu lanjut mencari bahan.",
    image: "/images/stage-1.png",
    cards: [
      {
        title: "Masuk dulu.",
        body: "Tim kami memverifikasi identitas dan lokasi penerima, supaya yang membeli memang penjahit atau pengrajin.",
        label: "Identitas dan lokasi penerima",
      },
    ],
  },
  {
    stepper: "Cari & bandingkan",
    word: "Cari",
    note: "Pabrik asal terlihat di setiap lot.",
    image: "/images/stage-2.png",
    cards: [
      {
        title: "Isi kebutuhanmu.",
        body: "Jenis kain, ukuran, jumlah, dan budget. Hasilnya menampilkan pabrik asal, stok, dan total biaya: harga jual ditambah ongkir.",
        label: "Bandingkan sebelum memilih",
      },
    ],
  },
  {
    stepper: "Pilih model beli",
    word: "Pilih",
    note: "Dua model beli. Kamu yang memilih.",
    image: "/images/stage-3.png",
    cards: [
      {
        title: "Harga tetap regional",
        body: "Harga tetap, bisa langsung checkout jika stok tersedia.",
        label: "Fixed price regional",
        chart: [{ color: "teal", heights: [40, 40, 40, 40, 40] }],
      },
      {
        title: "Lelang nasional",
        body: "Harga turun otomatis. Terima saat harga aktif cocok untukmu.",
        label: "Dutch auction nasional",
        chart: [{ color: "ochre", heights: [64, 54, 44, 34, 26] }],
      },
    ],
  },
  {
    stepper: "Jumlah & kirim",
    word: "Kirim",
    note: "Kg atau budget tidak cocok? Ubah kg atau pilih listing di kanal lain.",
    image: "/images/stage-4.png",
    cards: [
      {
        title: "Ambil sendiri",
        body: "Datang ke lokasi pabrik setelah barang siap. Ongkir platform Rp0.",
        label: "Total = harga barang",
        chart: [{ color: "teal", heights: [40] }],
      },
      {
        title: "Diantar ke alamat",
        body: "Platform menghitung ongkir dari berat, tujuan, dan kurir yang dipilih.",
        label: "Total = harga barang + ongkir",
        chart: [
          { color: "teal", heights: [40] },
          { color: "ochre", heights: [18] },
        ],
      },
    ],
  },
  {
    stepper: "Terima",
    word: "Terima",
    note: "Bukti pengiriman dan konfirmasi terima tercatat di pesananmu.",
    image: "/images/stage-5.png",
    cards: [],
  },
];

const BAR = { teal: "#0a4f4b", ochre: "#e8a33d" } as const;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Gambar baru menyapu naik (atau turun saat scroll balik) di atas gambar lama, seperti daun jendela. */
const layerVariants: Variants = {
  enter: (d: { dir: number; reduce: boolean }) =>
    d.reduce ? { opacity: 0 } : { clipPath: d.dir > 0 ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)" },
  center: (d: { dir: number; reduce: boolean }) =>
    d.reduce
      ? { opacity: 1, transition: { duration: 0.3 } }
      : { clipPath: "inset(0% 0 0 0)", transition: { duration: 0.85, ease: EASE } },
  exit: (d: { dir: number; reduce: boolean }) => ({
    opacity: d.reduce ? 0 : 1,
    transition: { delay: d.reduce ? 0.3 : 0.9, duration: 0.01 },
  }),
};

function Layer({ s, reduce }: { s: Step; reduce: boolean }) {
  return (
    <>
      <motion.div
        className="absolute inset-0"
        initial={{ scale: reduce ? 1 : 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: EASE }}
      >
        <Image
          src={s.image}
          alt=""
          fill
          sizes="(min-width: 1440px) 1360px, 100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 via-55% to-black/60" />

      {s.cards.length > 0 && (
        <div className="absolute inset-x-3 top-3 flex flex-col gap-2 md:inset-x-auto md:right-8 md:top-11 md:flex-row md:gap-5">
          {s.cards.map((c, i) => (
            <motion.article
              key={c.title}
              className="rounded-[20px] bg-white/[0.93] p-4 backdrop-blur-sm md:w-[380px] md:p-7"
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.5 + i * 0.1 }}
            >
              {c.chart && (
                <div className="mb-3 hidden h-16 items-end gap-2 md:flex" aria-hidden="true">
                  {c.chart.flatMap((g) =>
                    g.heights.map((h, k) => (
                      <motion.span
                        key={`${g.color}${k}`}
                        className="w-[18px] rounded-[3px]"
                        style={{ backgroundColor: BAR[g.color], transformOrigin: "50% 100%", height: h }}
                        initial={{ scaleY: reduce ? 1 : 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.6, ease: EASE, delay: 0.75 + i * 0.1 + k * 0.05 }}
                      />
                    )),
                  )}
                </div>
              )}
              <h3 className="font-display text-[clamp(20px,2.1vw,30px)] leading-tight tracking-[-0.03em]">
                {c.title}
              </h3>
              <p
                className={`mt-2 text-[13px] leading-[1.5] text-[#4a544d] md:mt-3.5 md:text-[15px] ${
                  s.cards.length > 1 ? "hidden sm:block" : ""
                }`}
              >
                {c.body}
              </p>
              <p className="mt-2 text-[13px] font-medium md:mt-3.5 md:text-[14px]">{c.label}</p>
            </motion.article>
          ))}
        </div>
      )}

      <motion.p
        className="absolute bottom-[calc(var(--w)*0.92+10px)] left-4 right-4 text-[13px] leading-5 text-white md:bottom-[72px] md:left-auto md:right-8 md:w-[300px] md:text-[14px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        {s.note}
      </motion.p>

      {/* Kata besar: huruf naik dari topeng */}
      <p
        aria-label={s.word}
        className="font-display absolute bottom-0 left-4 whitespace-nowrap leading-[0.95] tracking-[-0.05em] text-white md:left-7"
        style={{ fontSize: "var(--w)" }}
      >
        {s.word.split("").map((ch, i) => (
          <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.06em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: reduce ? "0%" : "105%", opacity: reduce ? 0 : 1 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: reduce ? 0.3 : 0.8, ease: EASE, delay: 0.3 + i * 0.045 }}
            >
              {ch}
            </motion.span>
          </span>
        ))}
      </p>
    </>
  );
}

export default function StageSteps() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = !!useSafeReducedMotion();
  const [{ step, dir }, setState] = useState({ step: 0, dir: 1 });
  const n = STEPS.length;

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(n - 1, Math.floor(p * n));
    setState((prev) => (prev.step === i ? prev : { step: i, dir: i > prev.step ? 1 : -1 }));
  });

  const goTo = (i: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * ((i + 0.5) / n) });
  };

  const pos = (i: number) => (i / (n - 1)) * 100;
  const custom = { dir, reduce };

  return (
    <section
      ref={wrapRef}
      aria-label="Tahap pembeli"
      className="relative"
      style={{ height: `${n * 75}svh` }}
    >
      <div className="sticky top-0 flex h-svh flex-col gap-4 overflow-clip bg-bg px-4 pb-6 pt-[88px] md:gap-6 md:px-10 md:pb-6 md:pt-[96px]">
        <h2 className="font-display text-center text-[clamp(24px,3.4vw,44px)] leading-[1.1] tracking-[-0.025em]">
          Dari cari bahan sampai bahan tiba.
        </h2>

        {/* Gambar tahap */}
        <div
          className="relative min-h-0 flex-1 overflow-hidden rounded-[2px] bg-ink"
          style={{ "--w": "clamp(84px, min(12.4vw, 22svh), 176px)" } as React.CSSProperties}
        >
          <AnimatePresence initial={false} custom={custom}>
            <motion.div
              key={step}
              className="absolute inset-0"
              custom={custom}
              variants={layerVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Layer s={STEPS[step]} reduce={reduce} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stepper */}
        <div className="relative h-[34px] shrink-0 md:h-[52px]">
          <div className="absolute inset-x-0 top-[6px] h-px bg-ink/25" />
          <motion.span
            aria-hidden="true"
            className="absolute left-0 top-[6px] h-px w-full origin-left bg-ink"
            initial={false}
            animate={{ scaleX: step / (n - 1) }}
            transition={{ duration: 0.8, ease: EASE }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute top-[2px] size-[10px] bg-ink"
            initial={false}
            animate={{ left: `${pos(step)}%`, x: `-${pos(step)}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          />
          <ol className="hidden md:block">
            {STEPS.map((s, i) => (
              <li
                key={s.stepper}
                className="absolute top-7"
                style={i === n - 1 ? { right: 0 } : { left: `${pos(i)}%` }}
              >
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === step ? "step" : undefined}
                  className={`whitespace-nowrap text-[14px] transition-colors duration-300 ${
                    i === step ? "font-medium text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {s.stepper}
                </button>
              </li>
            ))}
          </ol>
          <p className="absolute left-0 top-4 text-[13px] font-medium md:hidden" aria-live="polite">
            {step + 1}/{n} · {STEPS[step].stepper}
          </p>
        </div>
      </div>
    </section>
  );
}
