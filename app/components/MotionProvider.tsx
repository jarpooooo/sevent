"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import SmoothScroll from "./SmoothScroll";

// Fitur animasi (layout, gesture) dimuat belakangan, bukan di bundle awal.
const loadFeatures = () => import("./motionFeatures").then((m) => m.default);

/** Satu pengaturan untuk semua animasi dan scroll: ikuti prefers-reduced-motion pengunjung. */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <SmoothScroll>{children}</SmoothScroll>
      </MotionConfig>
    </LazyMotion>
  );
}
