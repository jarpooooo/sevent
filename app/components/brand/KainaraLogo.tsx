"use client";

import { m as motion, useTransform, type MotionValue } from "motion/react";

/**
 * Sistem logo vektor murni Kainara (Konsep B · Gulungan Kain).
 *  - Huruf K dengan ekor kiri-atas memanjang ke belakang seperti lembaran kain ditarik dari pabrik.
 *  - Huruf 'a' kedua berbentuk gulungan kain tekstil (true circular arcs) yang terurai turun.
 *  - Nol elemen <text>: seluruh huruf dan simbol adalah path geometris murni.
 */

const PATH_K =
  "M 0 20 L 55.5 20 L 55.5 53.5 L 85.5 20 L 100 20 L 69.2 53.5 L 101.5 96 L 87 96 L 61.5 61.8 L 55.5 68.2 L 55.5 96 L 44 96 L 44 42 C 44 33.5 40.5 30.2 31.5 29.8 C 19 29.2 9.5 25.5 0 20 Z";

const PATH_A =
  "M 37 40 L 48 40 L 48 96 L 37.5 96 L 37.5 87 C 34 93.4 28.2 97.5 20.5 97.5 C 8.5 97.5 0 85.8 0 68 C 0 50.2 8.5 38.5 20.5 38.5 C 28.2 38.5 34 42.6 37.5 49 L 37.5 40 Z M 23.2 48.5 C 15.2 48.5 10.6 56.4 10.6 68 C 10.6 79.6 15.2 87.5 23.2 87.5 C 31.6 87.5 37.4 79.8 37.4 68 C 37.4 56.2 31.6 48.5 23.2 48.5 Z";

const PATH_I =
  "M 0 40 L 11 40 L 11 96 L 0 96 Z M 5.5 19 A 6 6 0 1 1 5.49 19 Z";

const PATH_N =
  "M 0 40 L 11 40 L 11 48 C 14.5 41.8 20.4 38.5 28 38.5 C 39.2 38.5 46 46 46 59 L 46 96 L 35 96 L 35 61 C 35 53 31 48.5 24.4 48.5 C 16.8 48.5 11 54.2 11 63.5 L 11 96 L 0 96 Z";

const PATH_R =
  "M 0 40 L 11 40 L 11 49.5 C 14.2 42.2 19.6 38.6 27.5 38.6 L 29.5 38.6 L 29.5 49.4 L 26 49.4 C 16.8 49.4 11 55.2 11 66 L 11 96 L 0 96 Z";

// Simbol gulungan kain ('a' kedua): true circular arcs (outer roll + inner fabric core)
const BOLT_OUTER =
  "M 52.8 96 V 67.5 A 26.8 26.8 0 1 0 47.68 83.25 L 39.11 77.02 A 16.2 16.2 0 1 1 42.2 67.5 V 96 Z";

const BOLT_INNER =
  "M 37.98 71.39 A 12.6 12.6 0 1 0 29.89 79.48 L 28.04 73.78 A 6.6 6.6 0 1 1 32.28 69.54 Z";

type GlyphSpec =
  | { id: string; x: number; d: string; evenOdd?: boolean; isBolt?: false }
  | { id: string; x: number; isBolt: true };

const GLYPHS: GlyphSpec[] = [
  { id: "K", x: 0, d: PATH_K },
  { id: "a1", x: 101, d: PATH_A, evenOdd: true },
  { id: "i", x: 156, d: PATH_I },
  { id: "n", x: 175, d: PATH_N },
  { id: "a-bolt", x: 228, isBolt: true },
  { id: "r", x: 289, d: PATH_R },
  { id: "a2", x: 321, d: PATH_A, evenOdd: true },
];

const VIEWBOX = "-2 14 374 88";

type WordmarkProps = {
  /** "light" untuk latar terang (Navbar, Masuk); "dark" untuk latar hijau Kainara (Footer). */
  variant?: "light" | "dark";
  className?: string;
};

export function KainaraWordmark({ variant = "light", className = "h-6 w-auto" }: WordmarkProps) {
  const ink = variant === "dark" ? "var(--color-on-dark)" : "var(--color-text)";
  const boltMain = variant === "dark" ? "var(--color-on-dark)" : "var(--color-brand)";
  const boltAccent = "var(--color-accent)";

  return (
    <svg
      viewBox={VIEWBOX}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`block shrink-0 ${className}`}
    >
      {GLYPHS.map((g) => (
        <g key={g.id} transform={`translate(${g.x}, 0)`}>
          {g.isBolt ? (
            <>
              <path fill={boltMain} d={BOLT_OUTER} />
              <path fill={boltAccent} d={BOLT_INNER} />
            </>
          ) : (
            <path fill={ink} fillRule={g.evenOdd ? "evenodd" : undefined} d={g.d} />
          )}
        </g>
      ))}
    </svg>
  );
}

function AnimatedGlyph({
  g,
  i,
  n,
  intro,
}: {
  g: GlyphSpec;
  i: number;
  n: number;
  intro: MotionValue<number>;
}) {
  const a = 0.04 + (i / n) * 0.34;
  const y = useTransform(intro, [a, a + 0.28], [92, 0], { ease: (t) => 1 - Math.pow(1 - t, 4) });
  const opacity = useTransform(intro, [a, a + 0.14], [0, 1]);

  return (
    <g transform={`translate(${g.x}, 0)`}>
      <motion.g style={{ y, opacity }}>
        {g.isBolt ? (
          <>
            <path fill="var(--color-brand)" d={BOLT_OUTER} />
            <path fill="var(--color-accent)" d={BOLT_INNER} />
          </>
        ) : (
          <path fill="var(--color-text)" fillRule={g.evenOdd ? "evenodd" : undefined} d={g.d} />
        )}
      </motion.g>
    </g>
  );
}

/** Wordmark animasi huruf demi huruf untuk layar pembuka Hero StickyScrollStory. */
export function KainaraHeroWordmark({
  intro,
  className = "h-[clamp(44px,9.4vw,116px)] w-auto max-w-[90vw]",
}: {
  intro: MotionValue<number>;
  className?: string;
}) {
  return (
    <svg
      viewBox={VIEWBOX}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`block overflow-hidden ${className}`}
    >
      <defs>
        <clipPath id="kainara-hero-clip">
          <rect x="-2" y="14" width="374" height="88" />
        </clipPath>
      </defs>
      <g clipPath="url(#kainara-hero-clip)">
        {GLYPHS.map((g, i) => (
          <AnimatedGlyph key={g.id} g={g} i={i} n={GLYPHS.length} intro={intro} />
        ))}
      </g>
    </svg>
  );
}
