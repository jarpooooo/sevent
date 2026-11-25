"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Satu pengaturan untuk semua animasi: ikuti prefers-reduced-motion milik pengunjung. */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
