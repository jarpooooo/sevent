"use client";

import { m as motion, useInView } from "motion/react";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";
import Image from "next/image";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;
const EASE_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";
const COLS = 9;
const ROWS = 6;

/** Titik stok menyala bergelombang dari pojok kiri atas, sekali saat kartu terlihat. */
function StockDots() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduce = useSafeReducedMotion();
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="mt-3 grid grid-cols-9 gap-x-[clamp(14px,3vw,38px)] gap-y-[38px] py-1 lg:mt-0"
      style={{ maxWidth: 366 }}
    >
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        return (
          <span
            key={i}
            className="size-[6px] rounded-full bg-dot-stock"
            style={{
              opacity: seen ? 1 : 0,
              transform: reduce ? undefined : `scale(${seen ? 1 : 0})`,
              transition: `opacity 0.5s ${EASE_CSS} ${seen ? 0.1 + (r + c) * 0.045 : 0}s, transform 0.5s ${EASE_CSS} ${seen ? 0.1 + (r + c) * 0.045 : 0}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Dua benang tergambar, lalu penanda ochre menyusuri benang pertama: status bergerak sampai tiba. */
function Thread() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduce = useSafeReducedMotion();
  const draw = (delay: number) => ({
    initial: false as const,
    animate: { pathLength: seen || reduce ? 1 : 0 },
    transition: { duration: reduce ? 0 : 1.6, ease: EASE, delay },
  });
  return (
    <div ref={ref} aria-hidden="true" className="relative mt-2 h-[240px] w-full max-w-[360px]">
      <svg width="190" height="190" viewBox="0 0 190 190" fill="none" className="absolute left-[30px] top-[30px] rotate-180">
        <motion.circle
          cx="95"
          cy="95"
          r="94.25"
          className="stroke-accent"
          strokeOpacity="0.9"
          strokeWidth="1.5"
          {...draw(0.1)}
        />
      </svg>
      <svg
        width="270"
        height="270"
        viewBox="0 0 270 270"
        fill="none"
        className="absolute left-[90px] top-[-10px] max-w-none rotate-180"
      >
        <motion.circle
          cx="135"
          cy="135"
          r="134.25"
          className="stroke-accent"
          strokeOpacity="0.55"
          strokeWidth="1.5"
          {...draw(0.35)}
        />
      </svg>
      {/* Penanda: berputar sekali mengelilingi benang pertama lalu berhenti di titik awal */}
      <motion.div
        className="absolute left-[30px] top-[30px] size-[190px]"
        initial={false}
        animate={{ rotate: seen && !reduce ? 360 : 0 }}
        transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1], delay: 1.2 }}
      >
        <span className="absolute -left-1 top-1/2 size-2 -translate-y-1/2 bg-accent" />
      </motion.div>
    </div>
  );
}

export default function AsalBahan() {
  return (
    <section
      aria-label="Asal bahan"
      className="mx-auto max-w-[1440px] px-5 pb-20 pt-6 sm:px-10 md:pb-[120px] md:pt-10"
    >
      <h2 className="font-display text-balance text-[clamp(34px,4.9vw,56px)] leading-[1.04] tracking-[-0.03em]">
        Kamu tahu bahannya datang dari mana.
      </h2>

      <div className="mt-10 grid gap-4 md:mt-12 lg:grid-cols-3 lg:items-start">
        {/* Asal yang jelas */}
        <article className="flex flex-col gap-3.5 bg-brand-soft p-7 lg:h-[580px]">
          <h3 className="font-display text-[clamp(26px,2.5vw,34px)] leading-[1.1] tracking-[-0.02em]">
            Asal yang jelas.
          </h3>
          <p className="text-[15px] leading-[22px] text-text-muted">
            Setiap lot mencantumkan pabrik asal dan daerahnya, jadi sumber bahan terlihat sebelum kamu
            membeli.
          </p>
          <StockDots />
        </article>

        {/* Harga yang jelas */}
        <article className="flex flex-col gap-[18px] lg:h-[580px]">
          <div className="relative h-[280px] overflow-hidden rounded-[2px] sm:h-[340px]">
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 1.4, ease: EASE }}
            >
              <Image
                src="/images/handoff.webp"
                alt="Serah terima kain denim antara dua orang"
                fill
                sizes="(min-width: 1024px) 450px, 100vw"
                className="object-cover"
              />
            </motion.div>
          </div>
          <h3 className="font-display text-[clamp(26px,2.5vw,34px)] leading-[1.1] tracking-[-0.02em]">
            Harga yang jelas.
          </h3>
          <p className="text-[15px] leading-[22px] text-text-muted">
            Harga tetap atau harga lelang terlihat sebelum membeli, lengkap dengan total sampai
            tempatmu.
          </p>
        </article>

        {/* Status */}
        <article className="flex min-h-[440px] flex-col gap-3.5 overflow-hidden bg-brand p-7 text-on-dark lg:h-[580px]">
          <h3 className="font-display text-[clamp(26px,2.5vw,34px)] leading-[1.1] tracking-[-0.02em]">
            Statusnya selalu terlihat.
          </h3>
          <p className="text-[15px] leading-[22px] text-on-dark-muted">
            Pantau pesananmu dari dipesan sampai bahan tiba. Tim kami yang memperbarui statusnya.
          </p>
          <Thread />
        </article>
      </div>
    </section>
  );
}
