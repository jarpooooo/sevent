"use client";

import { animate, m as motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useSafeReducedMotion } from "./useSafeReducedMotion";
import Image from "next/image";
import Link from "next/link";
import { gridLines } from "./gridLines";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

/**
 * StickyScrollStory — adaptasi komponen Framer "Sticky Scroll Story", ditenagai Motion.
 *
 * Wrapper tinggi + panel sticky 100svh. Progres scroll (useScroll) menggerakkan:
 *  1. teks cerita: masuk dan keluar dengan fokus (blur -> tajam) dan geser vertikal,
 *  2. indikator titik: penanda aktif berpindah dengan layout animation,
 *  3. foto latar (parallax) dan mosaik: tiap tile adalah daun jendela yang menyusut dari
 *     satu sisi, makin jauh scroll makin banyak jendela terbuka ke foto.
 *
 * Momen utama saat dimuat: foto menyapu diagonal lewat jendela-jendela mosaik
 * (satu kali, ~2 detik), sambil wordmark naik huruf demi huruf.
 */

export type StoryFinale = {
  title: string[];
  body: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

type Props = {
  texts: string[];
  introTitle: string;
  image: string;
  finale: StoryFinale;
  activeDotColor?: string;
  inactiveDotColor?: string;
};

const ROWS = 8;
const FADE = 0.3; // porsi segmen untuk masuk / keluar, seperti versi Framer

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Hash deterministik 0..1, supaya pola jendela stabil (tanpa Math.random). */
function hash(r: number, c: number) {
  let h = (r * 73856093) ^ (c * 19349663) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 13), 0x85ebca6b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

/** Skor tiap tile: makin kecil makin cepat terbuka. Zona tengah (teks) tidak pernah terbuka. */
function tileScore(r: number, c: number, cols: number) {
  const cx = (c + 0.5) / cols;
  const cy = (r + 0.5) / ROWS;
  const zoneX = cols <= 4 ? 0.1 : 0.17;
  if (cx > zoneX && cx < 1 - zoneX && cy > 0.25 && cy < 0.75) return 9;
  return cy * 0.55 + hash(r, c) * 0.45;
}

function subscribeCols(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
const getCols = () => {
  const w = window.innerWidth;
  return w < 640 ? 4 : w < 1024 ? 8 : 12;
};

type Dir = "top" | "bottom" | "left" | "right";
const DIRS: Dir[] = ["top", "right", "bottom", "left"];
const ORIGIN: Record<Dir, string> = {
  top: "50% 0%",
  bottom: "50% 100%",
  left: "0% 50%",
  right: "100% 50%",
};

/* ---------- Mosaik (terhubung ke scroll) ---------- */

type TileMeta = { s: number; axis: "x" | "y"; origin: string; fixed: boolean };

/**
 * Seluruh tile diperbarui dari SATU langganan scroll, langsung ke DOM, dan hanya tile yang
 * nilainya berubah yang ditulis. Saat scroll, kebanyakan tile sudah penuh tertutup atau terbuka,
 * jadi yang disentuh hanya beberapa daun jendela di pita transisi.
 */
function TileGrid({
  cols,
  total,
  progress,
  reduce,
}: {
  cols: number;
  total: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const last = useRef<number[]>([]);

  const meta = useMemo<TileMeta[]>(
    () =>
      Array.from({ length: ROWS * cols }, (_, k) => {
        const r = Math.floor(k / cols);
        const c = k % cols;
        const s = tileScore(r, c, cols);
        const dir = DIRS[Math.floor(hash(r + 40, c + 40) * 4)];
        return {
          s,
          axis: dir === "top" || dir === "bottom" ? "y" : "x",
          origin: ORIGIN[dir],
          fixed: s >= 9, // zona teks: selalu tertutup
        };
      }),
    [cols],
  );

  const update = useCallback(() => {
    const p = progress.get();
    // Sebelum di-scroll semua tile tertutup (layar bersih); foto baru terbuka seiring scroll
    const open = clamp(p / ((total - 1) / total));
    for (let k = 0; k < meta.length; k++) {
      const el = refs.current[k];
      const t = meta[k];
      if (!el || t.fixed) continue;
      const v = clamp((t.s - open) * 30 + 0.5); // 1 = tertutup, 0 = terbuka
      const prev = last.current[k];
      if (prev !== undefined && Math.abs(prev - v) < 0.004) continue;
      last.current[k] = v;
      if (reduce) el.style.opacity = String(v);
      else el.style.transform = t.axis === "y" ? `scaleY(${v})` : `scaleX(${v})`;
    }
  }, [meta, progress, total, reduce]);

  useMotionValueEvent(progress, "change", update);
  useEffect(() => {
    last.current = [];
    update();
  }, [update]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 top-[72px] grid [contain:strict]"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
      }}
    >
      {meta.map((t, k) => (
        <div key={k} className="relative">
          <div
            ref={(el) => {
              refs.current[k] = el;
            }}
            className="absolute inset-0 bg-surface"
            style={{ transformOrigin: t.origin }}
          />
        </div>
      ))}
    </div>
  );
}

/* ---------- Teks cerita ---------- */

function StoryItem({
  index,
  total,
  progress,
  children,
  className = "",
  interactive = false,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  const seg = 1 / total;
  const start = index * seg;
  const end = (index + 1) * seg;
  const f = seg * FADE;
  const first = index === 0;
  const last = index === total - 1;

  const range = first ? [0, end - f, end] : last ? [start, start + f] : [start, start + f, end - f, end];
  const op = first ? [1, 1, 0] : last ? [0, 1] : [0, 1, 1, 0];
  const y = first ? [0, 0, -30] : last ? [30, 0] : [30, 0, 0, -30];
  const blur = (v: number) => `blur(${v}px)`;
  const bl = first ? [0, 0, 6] : last ? [6, 0] : [6, 0, 0, 6];

  const opacity = useTransform(progress, range, op);
  const translateY = useTransform(progress, range, y);
  const blurPx = useTransform(progress, range, bl);
  const filter = useTransform(blurPx, (v) => (v < 0.05 ? "none" : blur(v)));
  const pointerEvents = useTransform(opacity, (o) => (interactive && o > 0.6 ? "auto" : "none"));

  return (
    <motion.div
      className={`absolute inset-0 flex items-center justify-center px-6 ${className}`}
      style={{ opacity, y: translateY, filter, pointerEvents }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Huruf wordmark naik dari topeng ---------- */

function Letter({ ch, i, n, intro }: { ch: string; i: number; n: number; intro: MotionValue<number> }) {
  const a = 0.05 + (i / n) * 0.35;
  const y = useTransform(intro, [a, a + 0.28], ["108%", "0%"], { ease: (t) => 1 - Math.pow(1 - t, 4) });
  return (
    <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
      <motion.span className="inline-block" style={{ y }}>
        {ch}
      </motion.span>
    </span>
  );
}

function Mark({ intro }: { intro: MotionValue<number> }) {
  const scale = useTransform(intro, [0, 0.3], [0.5, 1], { ease: (t) => 1 - Math.pow(1 - t, 4) });
  const opacity = useTransform(intro, [0, 0.15], [0, 1]);
  return (
    <motion.span aria-hidden="true" className="inline-flex size-[0.81em]" style={{ scale, opacity }}>
      <Image src="/images/brand-mark.svg" alt="" width={84} height={84} priority className="size-full" />
    </motion.span>
  );
}

/* ---------- Komponen utama ---------- */

export default function StickyScrollStory({
  texts,
  introTitle,
  image,
  finale,
  activeDotColor = "var(--color-brand)",
  inactiveDotColor = "var(--color-dot-idle)",
}: Props) {
  const total = texts.length + 2; // intro + cerita + penutup
  const dotCount = texts.length + 1;
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = !!useSafeReducedMotion();
  const cols = useSyncExternalStore(subscribeCols, getCols, () => 12);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });

  // Sapuan awal: 0 -> 1 sekali saat dimuat. Mulai 0 = semua tertutup = tampilan SSR.
  const intro = useMotionValue(0);
  useEffect(() => {
    if (reduce) {
      intro.set(1);
      return;
    }
    const controls = animate(intro, 1, { duration: 2.4, ease: [0.45, 0, 0.2, 1], delay: 0.1 });
    return () => controls.stop();
  }, [intro, reduce]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const idx = Math.min(Math.floor(p * total), dotCount - 1);
    setActive((prev) => (prev === idx ? prev : idx));
  });

  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-20%"]);
  const lastStart = (total - 1) / total;
  const dotsOpacity = useTransform(scrollYProgress, [lastStart - 0.05, lastStart], [1, 0]);


  return (
    <section
      ref={wrapRef}
      aria-label="Cerita ClearanceLoop"
      className="relative"
      style={{ height: `${total * 140}svh` }}
    >
      <div className="sticky top-0 h-svh overflow-clip bg-surface">
        {/* Foto latar (parallax) */}
        <motion.div className="absolute inset-x-0 top-0 h-[125%]" style={{ y: photoY, willChange: "transform" }}>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
        </motion.div>

        {/* Mosaik penutup */}
        <TileGrid cols={cols} total={total} progress={scrollYProgress} reduce={reduce} />
        {/* Garis antar tile selalu terlihat */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[72px]"
          style={gridLines(cols, ROWS)}
        />

        {/* Bar atas menutup foto di bawah navbar */}
        <div className="absolute inset-x-0 top-0 h-[72px] bg-surface" />

        {/* Konten: intro, cerita, penutup */}
        <div className="absolute inset-x-0 bottom-0 top-[72px]">
          <StoryItem index={0} total={total} progress={scrollYProgress}>
            <h1
              aria-label={introTitle}
              className="font-display flex items-center gap-[0.23em] whitespace-nowrap text-[clamp(34px,8.5vw,104px)] leading-none tracking-[-0.04em]"
            >
              <Mark intro={intro} />
              <span aria-hidden="true">
                {introTitle.split("").map((ch, i) => (
                  <Letter key={i} ch={ch} i={i} n={introTitle.length} intro={intro} />
                ))}
              </span>
            </h1>
          </StoryItem>

          {texts.map((t, i) => (
            <StoryItem key={t} index={i + 1} total={total} progress={scrollYProgress}>
              <p className="font-display max-w-[760px] text-center text-[clamp(26px,3.1vw,44px)] leading-[1.2] tracking-[-0.04em] text-text">
                {t}
              </p>
            </StoryItem>
          ))}

          <StoryItem
            index={total - 1}
            total={total}
            progress={scrollYProgress}
            className="flex-col text-center"
            interactive
          >
            <h2 className="font-display text-[clamp(25px,4.5vw,60px)] leading-[0.98] tracking-[-0.04em]">
              {finale.title.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h2>
            <p className="mt-5 max-w-[440px] text-[clamp(14px,1.2vw,16px)] leading-[1.55] text-text-muted">
              {finale.body}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  href={finale.primary.href}
                  className="block rounded-[2px] bg-brand px-6 py-3.5 text-[14px] font-medium text-on-dark transition-colors hover:bg-brand-hover"
                >
                  {finale.primary.label}
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  href={finale.secondary.href}
                  className="block rounded-[2px] border border-text px-6 py-3.5 text-[14px] font-medium transition-colors hover:bg-inverse hover:text-surface"
                >
                  {finale.secondary.label}
                </Link>
              </motion.div>
            </div>
          </StoryItem>
        </div>

        {/* Indikator titik (desktop vertikal, mobile garis horizontal) */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-row gap-2 md:bottom-auto md:left-10 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:flex-col md:gap-2.5 lg:left-20"
          style={{ opacity: dotsOpacity }}
        >
          {Array.from({ length: dotCount }, (_, i) => (
            <span
              key={i}
              className="relative block h-[2px] w-[18px] rounded-full md:size-[13px]"
              style={{ backgroundColor: inactiveDotColor }}
            >
              {i === active && (
                <motion.span
                  layoutId="story-dot"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: activeDotColor }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
