"use client";

import { useInView } from "motion/react";
import { useRef, useSyncExternalStore } from "react";
import { gridLines } from "./gridLines";
import { useSafeReducedMotion } from "./useSafeReducedMotion";

/**
 * Mosaik penutup: grid tile warna surface di atas foto. Tile yang dibuka = "jendela" ke foto.
 *
 * Tiap tile adalah daun jendela yang menutup/membuka lewat scale dari satu sisi.
 * Gelombang (delay) merambat dari titik `origin`: saat dimuat, saat panel di-hover,
 * dan saat pola berganti (mis. pindah tab), jadi perubahan terbaca sebagai satu gerakan.
 * Keadaan awal (SSR) = semua tertutup, sama dengan akhir tanpa JS, jadi tidak ada kilatan foto.
 *
 * Murni transisi CSS (transform/opacity): tanpa instance komponen animasi per tile,
 * jadi ratusan tile tetap murah dan jalan di compositor.
 */
export type Rect = { x0: number; x1: number; y0: number; y1: number };

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function hash(r: number, c: number, seed: number) {
  let h = (r * 73856093) ^ (c * 19349663) ^ Math.imul(seed, 83492791) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 13), 0x85ebca6b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

type Dir = "top" | "bottom" | "left" | "right";
const ORIGIN: Record<Dir, string> = {
  top: "50% 0%",
  bottom: "50% 100%",
  left: "0% 50%",
  right: "100% 50%",
};
const DIRS: Dir[] = ["top", "right", "bottom", "left"];

type Props = {
  cols: number;
  rows: number;
  /** 0..1, porsi tile yang terbuka di luar zona teks */
  openRatio?: number;
  seed?: number;
  /** area (pecahan 0..1) yang selalu tertutup supaya teks terbaca */
  keeps?: Rect[];
  /** pola eksplisit; menggantikan openRatio/seed/keeps. true = tertutup */
  closedFn?: (r: number, c: number) => boolean;
  /** true = seluruh mosaik membuka (mis. panel di-hover) */
  hidden?: boolean;
  /** titik asal gelombang, pecahan 0..1 dari area mosaik */
  origin?: { x: number; y: number };
  /** kapan pola pertama kali terbuka: saat dimuat atau saat terlihat di layar */
  trigger?: "mount" | "inView";
  /** detik jeda sebelum gelombang pertama */
  startDelay?: number;
  className?: string;
};

export default function MosaicCover({
  cols,
  rows,
  openRatio = 0.3,
  seed = 1,
  keeps = [],
  closedFn,
  hidden = false,
  origin = { x: 0.5, y: 0.5 },
  trigger = "mount",
  startDelay = 0.15,
  className = "",
}: Props) {
  const reduce = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  // false di server dan saat hidrasi, true sesudahnya: gelombang pertama jalan setelah JS siap
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const ready = trigger === "mount" ? mounted : inView;

  // Lebar gelombang total ~0.5 detik, berapa pun jumlah tile.
  const maxDist = Math.hypot(Math.max(origin.x, 1 - origin.x), Math.max(origin.y, 1 - origin.y));

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`}>
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: cols * rows }, (_, k) => {
          const r = Math.floor(k / cols);
          const c = k % cols;
          const cx = (c + 0.5) / cols;
          const cy = (r + 0.5) / rows;
          const closed = closedFn
            ? closedFn(r, c)
            : keeps.some((z) => cx >= z.x0 && cx <= z.x1 && cy >= z.y0 && cy <= z.y1) ||
              hash(r, c, seed) >= openRatio;

          const dir = DIRS[Math.floor(hash(r, c, seed + 99) * 4)];
          const axis = dir === "top" || dir === "bottom" ? "Y" : "X";
          const target = ready && (!closed || hidden) ? 0 : 1;
          const dist = Math.hypot(cx - origin.x, cy - origin.y) / (maxDist || 1);
          const delay = (ready ? startDelay : 0) + dist * 0.5 + hash(r, c, seed + 7) * 0.1;
          const dur = target === 0 ? 0.6 : 0.45;

          return (
            <div key={k} className="relative">
              <div
                className="absolute inset-0 bg-surface"
                style={
                  reduce
                    ? { opacity: target, transition: "opacity 0.3s linear" }
                    : {
                        transform: `scale${axis}(${target})`,
                        transformOrigin: ORIGIN[dir],
                        transition: `transform ${dur}s ${EASE} ${delay.toFixed(3)}s`,
                      }
                }
              />
            </div>
          );
        })}
      </div>

      {/* Garis tipis antar tile: ikut memudar saat mosaik dibuka penuh */}
      <div
        className="absolute inset-0"
        style={{
          ...gridLines(cols, rows),
          opacity: hidden ? 0 : 1,
          transition: `opacity 0.5s ${EASE}`,
        }}
      />
    </div>
  );
}
