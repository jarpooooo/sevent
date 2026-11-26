import type { CSSProperties } from "react";

/**
 * Garis tipis antar tile (px di tiap sisi sel, bawaan 4) sebagai satu latar CSS,
 * bukan satu elemen per sel: DOM lebih kecil, paint lebih murah.
 */
export function gridLines(cols: number, rows: number, px = 4): CSSProperties {
  const edge = (dir: "right" | "bottom") =>
    `linear-gradient(to ${dir}, var(--color-surface) ${px}px, transparent ${px}px, transparent calc(100% - ${px}px), var(--color-surface) calc(100% - ${px}px))`;
  return {
    backgroundImage: `${edge("right")}, ${edge("bottom")}`,
    backgroundSize: `calc(100% / ${cols}) calc(100% / ${rows})`,
  };
}
