"use client";

import { m as motion } from "motion/react";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Urutan isi 3x3 yang berbeda per seed, supaya tiap bagian punya pola mozaiknya sendiri. */
function order(seed: number) {
  const idx = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  let h = Math.imul(seed + 1, 2654435761) >>> 0;
  for (let i = idx.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
    const j = h % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/**
 * Glyph mozaik 3x3: makin banyak ubin hijau, makin lengkap bagian itu. Bukan hiasan: jumlah ubin
 * mengikuti isian yang sudah terisi (done dari total).
 */
export default function Glyph({
  done,
  total,
  seed = 1,
  size = 8,
  label,
}: {
  done: number;
  total: number;
  seed?: number;
  size?: number;
  label?: string;
}) {
  const reduce = useSafeReducedMotion();
  const filled = total > 0 ? Math.round((9 * done) / total) : 0;
  const on = new Set(order(seed).slice(0, filled));
  return (
    <span
      role="img"
      aria-label={label ?? `${done} dari ${total} isian terisi`}
      className="grid shrink-0 grid-cols-3 gap-[2px]"
      style={{ width: size * 3 + 4 }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className={`block rounded-[1px] transition-colors duration-500 ${on.has(i) ? "bg-brand" : "bg-brand-soft"}`}
          style={{ height: size }}
          initial={reduce ? false : { opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.05 * ((i * 4) % 9) }}
        />
      ))}
    </span>
  );
}
