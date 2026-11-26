"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import dynamic from "next/dynamic";
import { type ReactNode, useEffect, useState } from "react";

// Fitur animasi (layout, gesture) dan Lenis dimuat belakangan, bukan di bundle awal.
const loadFeatures = () => import("./motionFeatures").then((m) => m.default);
const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });

/** Jalankan setelah browser menganggur supaya hidrasi dan paint awal tidak terganggu. */
function useIdle() {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const id = w.requestIdleCallback ? w.requestIdleCallback(() => setIdle(true)) : window.setTimeout(() => setIdle(true), 200);
    return () => {
      if (!w.requestIdleCallback) window.clearTimeout(id);
    };
  }, []);
  return idle;
}

/** Satu pengaturan untuk semua animasi dan scroll: ikuti prefers-reduced-motion pengunjung. */
export default function MotionProvider({ children }: { children: ReactNode }) {
  const idle = useIdle();
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        {children}
        {idle && <SmoothScroll />}
      </MotionConfig>
    </LazyMotion>
  );
}
