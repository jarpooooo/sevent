"use client";

import { useSyncExternalStore } from "react";
import { AUCTION_STEPS, AUCTION_TOTAL_S, auctionAt } from "../../../lib/domain/pricing";
import type { Lot } from "../../../lib/domain/types";

export { AUCTION_STEPS, AUCTION_TOTAL_S };

/* Satu jam bersama untuk semua kartu: satu interval, bukan satu per kartu.
   Jam demo dimulai saat aplikasi dibuka, jadi sisa waktu tiap lot selalu sama dengan desain. */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let current = 0;
let bootS = 0;
const nowS = () => Math.floor(Date.now() / 1000);

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    current = nowS();
    if (!bootS) bootS = current;
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
  if (!bootS) bootS = current;
  return current;
}

/** 0 di server dan saat hidrasi: tidak ada beda HTML antara server dan klien. */
const getServerSnapshot = () => 0;

export type AuctionView = {
  /** false di server dan saat hidrasi; angka sama dengan awal, lalu berjalan */
  ready: boolean;
  /** harga per kg sekarang */
  price: number;
  /** langkah sekarang (0 sampai 10) dan jumlah langkah */
  step: number;
  steps: number;
  /** harga langkah yang sudah lewat sampai sekarang; langkah berikutnya tidak diberikan (disembunyikan) */
  shown: number[];
  /** detik tersisa dari 72 jam */
  remaining: number;
  /** 0..1 */
  progress: number;
  closed: boolean;
};

/** Keadaan lelang terbalik untuk satu lot; null jika bukan lelang. Hitungan ada di domain/pricing. */
export function useAuction(lot: Lot): AuctionView | null {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (lot.model !== "lelang" || !lot.auction) return null;
  const since = now ? now - bootS : 0;
  const a = auctionAt(lot, since);
  if (!a) return null;
  return {
    ready: !!now,
    price: a.price,
    step: a.step,
    steps: AUCTION_STEPS,
    shown: a.ladder.slice(0, a.step + 1),
    remaining: a.remaining,
    progress: a.progress,
    closed: a.closed,
  };
}

/** Sisa waktu untuk dibaca orang: "52 jam", "35 menit", "Selesai". */
export function sisaLabel(remainingS: number) {
  if (remainingS <= 0) return "Selesai";
  const h = Math.floor(remainingS / 3600);
  if (h >= 1) return `${h} jam`;
  return `${Math.max(1, Math.floor(remainingS / 60))} menit`;
}
