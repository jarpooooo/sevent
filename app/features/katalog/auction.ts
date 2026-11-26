"use client";

import { useSyncExternalStore } from "react";
import { AUCTION_TTL_S, auctionAt } from "../../lib/domain/pricing";
import type { Lot } from "../../lib/domain/types";

export { AUCTION_TTL_S };

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

export type AuctionView = {
  /** false di server dan saat hidrasi (jam belum diketahui) */
  ready: boolean;
  price: number;
  /** detik tersisa */
  remaining: number;
  /** 0..1, porsi waktu yang sudah lewat */
  progress: number;
};

/** Keadaan lelang untuk satu lot; null jika lot bukan lelang. Perhitungan harga ada di domain/pricing. */
export function useAuction(lot: Lot): AuctionView | null {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (lot.model !== "lelang" || !lot.auction) return null;
  if (!now) return { ready: false, price: lot.auction.start, remaining: AUCTION_TTL_S, progress: 0 };
  const a = auctionAt(lot, now);
  return a ? { ready: true, ...a } : null;
}

export function mmss(totalS: number) {
  const m = Math.floor(totalS / 60);
  const s = totalS % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
