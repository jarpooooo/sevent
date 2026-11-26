"use client";

import { animate, m as motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { useSafeReducedMotion } from "../useSafeReducedMotion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Angka menghitung ke nilai baru, supaya perubahan jumlah dan harga terbaca sebagai sebab-akibat. */
export default function Counter({ value, format }: { value: number; format: (n: number) => string }) {
  const reduce = useSafeReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => format(Math.round(v)));
  useEffect(() => {
    const c = animate(mv, value, { duration: reduce ? 0 : 0.5, ease: EASE });
    return () => c.stop();
  }, [value, mv, reduce]);
  return <motion.span>{text}</motion.span>;
}
