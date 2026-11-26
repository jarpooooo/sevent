"use client";

import { useSyncExternalStore } from "react";
import type { Lot } from "./lots";

/** Lelang Belanda Nasional: TTL 15 menit. Harga turun bertahap tiap STEP_S detik (nilai demo). */
export const AUCTION_TTL_S = 15 * 60;
export const AUCTION_STEP_S = 15;

/* Satu jam bersama untuk semua kartu: satu interval, bukan satu per kartu. */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let current = 0;
const nowS = () => Math.floor(Date.now() / 1000);

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    current = nowS();
    timer = setInterval(() => {
      current = nowS();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot() {
  if (!current) current = nowS();
  return current;
}

/** 0 di server dan saat hidrasi: tidak ada beda HTML antara server dan klien. */
const getServerSnapshot = () => 0;

export type AuctionState = {
  ready: boolean;
  price: number;
  /** detik tersisa */
  remaining: number;
  /** 0..1, porsi waktu yang sudah lewat */
  progress: number;
};

/** Keadaan lelang untuk satu lot; null jika lot bukan lelang. */
export function useAuction(lot: Lot): AuctionState | null {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (lot.model !== "lelang" || !lot.auction) return null;
  const { start, floor, phaseS } = lot.auction;
  if (!now) return { ready: false, price: start, remaining: AUCTION_TTL_S, progress: 0 };

  const elapsed = (now + phaseS) % AUCTION_TTL_S;
  const steps = AUCTION_TTL_S / AUCTION_STEP_S;
  const step = Math.floor(elapsed / AUCTION_STEP_S);
  const raw = start - ((start - floor) * step) / steps;
  return {
    ready: true,
    price: Math.round(raw / 10) * 10,
    remaining: AUCTION_TTL_S - elapsed,
    progress: elapsed / AUCTION_TTL_S,
  };
}

export function mmss(totalS: number) {
  const m = Math.floor(totalS / 60);
  const s = totalS % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
