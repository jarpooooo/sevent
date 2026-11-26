"use client";

import {
  AnimatePresence,
  m as motion,
  useInView,
  type Variants,
} from "motion/react";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";
import Image from "next/image";
import { useRef, useState } from "react";

// Detik per tahap sebelum geser otomatis ke tahap berikutnya
const COUNTDOWN_S = 7;

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
    image: "/images/stage-1.webp",
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
    image: "/images/stage-2.webp",
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
    image: "/images/stage-3.webp",
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
    image: "/images/stage-4.webp",
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
    image: "/images/stage-5.webp",
    cards: [],
  },
];

const BAR = { teal: "var(--color-brand)", ochre: "var(--color-accent)" } as const;
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
              className="rounded-[20px] bg-card/[0.93] p-4 md:w-[380px] md:p-7"
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
                className={`mt-2 text-[13px] leading-[1.5] text-text-soft md:mt-3.5 md:text-[15px] ${
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
        className="absolute bottom-[calc(var(--w)*0.92+10px)] left-4 right-4 text-[13px] leading-5 text-on-dark md:bottom-[72px] md:left-auto md:right-8 md:w-[300px] md:text-[14px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        {s.note}
      </motion.p>

      {/* Kata besar: huruf naik dari topeng */}
      <p
        aria-label={s.word}
        className="font-display absolute bottom-0 left-4 whitespace-nowrap leading-[0.95] tracking-[-0.05em] text-on-dark md:left-7"
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
  const wrapRef = useRef<HTMLElement>(null);
  const reduce = !!useSafeReducedMotion();
  const [{ step, dir }, setState] = useState({ step: 0, dir: 1 });
  const n = STEPS.length;

  // Slideshow biasa: ganti tahap hanya lewat klik pada daftar di bawah gambar
  const goTo = (i: number) =>
    setState((prev) => (prev.step === i ? prev : { step: i, dir: i > prev.step ? 1 : -1 }));

  // Hitung mundur habis: maju satu tahap, setelah tahap terakhir kembali ke awal
  const next = () => setState((prev) => ({ step: (prev.step + 1) % n, dir: 1 }));

  const near = useInView(wrapRef, { once: true, margin: "800px 0px 800px 0px" });
  const visible = useInView(wrapRef, { margin: "-20% 0px -20% 0px" });
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  // Berhenti saat dihover, difokus, di luar layar, atau pengunjung minta gerak dikurangi
  const running = visible && !hover && !focusIn && !reduce;
  const bar = (
    <span
      key={step}
      aria-hidden="true"
      className="stage-countdown absolute inset-x-0 bottom-0 h-[2px] origin-left bg-accent"
      style={{
        animationDuration: `${COUNTDOWN_S}s`,
        animationPlayState: running ? "running" : "paused",
      }}
      onAnimationEnd={next}
    />
  );
  const pos = (i: number) => (i / (n - 1)) * 100;
  const custom = { dir, reduce };

  return (
    <section
      ref={wrapRef}
      aria-label="Tahap pembeli"
      className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-16 md:gap-8 md:px-10 md:py-24"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocusIn(true)}
      onBlur={() => setFocusIn(false)}
    >
      <h2 className="font-display text-center text-[clamp(26px,3.4vw,44px)] leading-[1.1] tracking-[-0.025em]">
        Dari cari bahan sampai bahan tiba.
      </h2>

      {/* Gambar tahap */}
      <div
        className="relative h-[560px] overflow-hidden rounded-[2px] bg-inverse md:h-[600px]"
        style={{ "--w": "clamp(84px, 12.4vw, 176px)" } as React.CSSProperties}
        aria-live="polite"
      >
        {/* Unduh gambar tahap lain lebih awal (prioritas rendah) supaya pergantian tidak menunggu jaringan */}
        <div aria-hidden="true" className="hidden">
          {STEPS.map(
            (st, i) =>
              near &&
              i !== step && (
                <Image
                  key={st.image}
                  src={st.image}
                  alt=""
                  fill
                  sizes="(min-width: 1440px) 1360px, 100vw"
                  loading="eager"
                  fetchPriority="low"
                />
              ),
          )}
        </div>
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

      {/* Daftar tahap: klik untuk mengganti */}
      <div className="relative">
        {/* Desktop: garis + penanda */}
        <div className="relative hidden h-[52px] md:block">
          <div className="absolute inset-x-0 top-[6px] h-px bg-inverse/25" />
          <motion.span
            aria-hidden="true"
            className="absolute left-0 top-[6px] h-px w-full origin-left bg-inverse"
            initial={false}
            animate={{ scaleX: step / (n - 1) }}
            transition={{ duration: 0.8, ease: EASE }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute top-[2px] size-[10px] bg-inverse"
            initial={false}
            animate={{ left: `${pos(step)}%`, x: `-${pos(step)}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          />
          <ol>
            {STEPS.map((s, i) => (
              <li
                key={s.stepper}
                className="absolute top-3"
                style={i === n - 1 ? { right: 0 } : { left: `${pos(i)}%` }}
              >
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === step ? "step" : undefined}
                  className={`relative whitespace-nowrap py-3 text-[14px] transition-colors duration-300 ${
                    i === step ? "font-medium text-text" : "text-text-muted hover:text-text"
                  }`}
                >
                  {s.stepper}
                  {i === step && !reduce && bar}
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* Mobile: deretan tombol yang bisa digeser */}
        <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
          {STEPS.map((s, i) => (
            <li key={s.stepper} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === step ? "step" : undefined}
                className={`relative overflow-hidden rounded-full px-4 py-2.5 text-[14px] font-medium transition-colors duration-300 ${
                  i === step ? "bg-brand text-on-dark" : "bg-brand-soft text-text"
                }`}
              >
                {s.stepper}
                {i === step && !reduce && bar}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
