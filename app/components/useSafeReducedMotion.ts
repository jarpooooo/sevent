"use client";

import { useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

/**
 * prefers-reduced-motion yang aman untuk SSR: false di server dan saat hidrasi,
 * lalu nilai sebenarnya setelah mount. Mencegah beda style antara HTML server dan klien.
 */
export function useSafeReducedMotion() {
  const reduced = useReducedMotion();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return mounted && !!reduced;
}
