"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { gridLines } from "./gridLines";
import { useSafeReducedMotion } from "../motion/useSafeReducedMotion";

/**
 * Mosaik yang terus bergerak: tiap tile menutup lalu membuka pelan (slow motion), tanpa henti.
 * Dipakai di atas foto, jadi foto seperti "bernapas" lewat jendela-jendela kecil.
 *
 * - Murni animasi CSS pada transform: jalan di compositor, tanpa JS per frame.
 * - Setiap tile punya durasi, jeda, sisi buka, dan varian sendiri (diturunkan dari hash seed),
 *   jadi hasil server dan klien identik dan polanya tidak terlihat berulang.
 * - Berhenti saat keluar layar. Dengan reduced-motion: pola statis, tidak bergerak.
 */
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

type Rect = { x0: number; x1: number; y0: number; y1: number };

type Props = {
  cols: number;
  rows: number;
  seed?: number;
  /** pengali durasi siklus: 1 = 12 sampai 22 detik per tile; makin besar makin lambat */
  slow?: number;
  /** tebal garis antar tile (px di tiap sisi sel); 0 = tanpa garis */
  line?: number;
  /** area (pecahan 0..1) yang selalu tertutup rapat, mis. di dekat teks */
  keeps?: Rect[];
  className?: string;
};

export default function MosaicLoop({
  cols,
  rows,
  seed = 1,
  slow = 1,
  line = 1,
  keeps = [],
  className = "",
}: Props) {
  const reduce = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: "120px 0px 120px 0px" });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ ["--tile-play" as string]: visible ? "running" : "paused" }}
    >
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
          const kept = keeps.some((z) => cx >= z.x0 && cx <= z.x1 && cy >= z.y0 && cy <= z.y1);

          const dir = DIRS[Math.floor(hash(r, c, seed + 99) * 4)];
          const axis = dir === "top" || dir === "bottom" ? "y" : "x";
          const variant = hash(r, c, seed + 3) < 0.5 ? "a" : "b";
          const dur = (12 + hash(r, c, seed + 5) * 10) * slow;
          const delay = -hash(r, c, seed + 7) * dur;

          // Tile yang dikunci tertutup, atau semua tile berpola statis saat reduced-motion
          const staticClosed = kept || (reduce && hash(r, c, seed) >= 0.35);
          const staticOpen = reduce && !kept && !staticClosed;

          return (
            <div key={k} className="relative">
              <div
                className={`absolute inset-0 bg-surface ${staticClosed || staticOpen ? "" : "tile-loop"}`}
                style={
                  staticClosed
                    ? undefined
                    : staticOpen
                      ? { transform: `scale${axis.toUpperCase()}(0)` }
                      : {
                          transformOrigin: ORIGIN[dir],
                          animationName: `tile-${axis}${variant}`,
                          animationDuration: `${dur.toFixed(2)}s`,
                          animationDelay: `${delay.toFixed(2)}s`,
                        }
                }
              />
            </div>
          );
        })}
      </div>

      {line > 0 && <div className="absolute inset-0" style={gridLines(cols, rows, line)} />}
    </div>
  );
}
