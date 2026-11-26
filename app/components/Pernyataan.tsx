"use client";

import { m as motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useSafeReducedMotion } from "./useSafeReducedMotion";
import Image from "next/image";
import { useRef } from "react";

type Token = { word: string } | { chip: string };

const TOKENS: Token[] = [
  { word: "Kami" },
  { word: "membawa" },
  { word: "sisa" },
  { word: "produksi" },
  { word: "dari" },
  { chip: "/images/chip-1.webp" },
  { word: "pabrik," },
  { word: "menjualnya" },
  { word: "ke" },
  { chip: "/images/chip-2.webp" },
  { word: "penjahit" },
  { word: "terverifikasi" },
  { word: "dan" },
  { word: "menjaga" },
  { word: "catatannya" },
  { chip: "/images/chip-3.webp" },
  { word: "sampai" },
  { word: "tuntas." },
];

/** Tiap kata menyala berurutan; tiap foto kecil terbuka seperti jendela mosaik di antara kata. */
function Word({
  i,
  n,
  progress,
  reduce,
  children,
}: {
  i: number;
  n: number;
  progress: MotionValue<number>;
  reduce: boolean;
  children: string;
}) {
  const a = (i / n) * 0.82;
  const opacity = useTransform(progress, [a, a + 0.12], [0.2, 1]);
  return (
    <motion.span style={{ opacity }} className={reduce ? "" : "will-change-[opacity]"}>
      {children}
    </motion.span>
  );
}

function Chip({
  i,
  n,
  src,
  progress,
  reduce,
}: {
  i: number;
  n: number;
  src: string;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const a = (i / n) * 0.82;
  const cover = useTransform(progress, [a, a + 0.14], [1, 0], { ease: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <span
      aria-hidden="true"
      className="relative inline-block h-[0.93em] w-[1.86em] shrink-0 overflow-hidden rounded-[2px]"
    >
      <Image src={src} alt="" fill sizes="120px" className="object-cover" />
      <motion.span
        className="absolute inset-0 bg-surface"
        style={reduce ? { opacity: cover } : { scaleX: cover, transformOrigin: "100% 50%" }}
      />
    </span>
  );
}

export default function Pernyataan() {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useSafeReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "center 42%"] });

  const n = TOKENS.length;
  return (
    <section ref={ref} aria-label="Tentang kami" className="px-5 py-20 sm:px-10 md:py-[140px]">
      <p className="font-display mx-auto flex max-w-[1040px] flex-wrap items-center justify-center gap-x-[0.28em] gap-y-[0.18em] text-center text-[clamp(30px,4.9vw,56px)] leading-[1.1] tracking-[-0.03em]">
        {TOKENS.map((t, i) =>
          "chip" in t ? (
            <Chip key={i} i={i} n={n} src={t.chip} progress={scrollYProgress} reduce={reduce} />
          ) : (
            <Word key={i} i={i} n={n} progress={scrollYProgress} reduce={reduce}>
              {t.word}
            </Word>
          ),
        )}
      </p>
    </section>
  );
}
