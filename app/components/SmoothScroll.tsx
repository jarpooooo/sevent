"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { useSafeReducedMotion } from "./useSafeReducedMotion";

/**
 * Smooth scroll lewat Lenis. Lenis tetap memakai scroll native, jadi useScroll milik Motion
 * dan posisi sticky tidak berubah; hanya gerak roda mouse yang dihaluskan.
 * Dimatikan untuk pengunjung dengan prefers-reduced-motion.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useSafeReducedMotion();
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: !reduce,
        anchors: { offset: -72 }, // tautan #id berhenti di bawah navbar tetap
      }}
    >
      {children}
    </ReactLenis>
  );
}
