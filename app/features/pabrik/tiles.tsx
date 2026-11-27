"use client";

import { m as motion } from "motion/react";
import Image from "next/image";
import MosaicCover from "../../components/mosaic/MosaicCover";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";
import {
  FISKAL_LABEL,
  type FiskalKey,
  type FiskalRow,
  type FiskalStatus,
  type Lot,
  type PengeluaranStatus,
} from "../../lib/domain/types";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Urutan ubin Compliance Lock. "Ditahan" adalah cabang pengecualian di antara verifikasi dan terpenuhi. */
const LOCK_ORDER: { k: PengeluaranStatus; t: string }[] = [
  { k: "draf", t: "Draf" },
  { k: "verifikasi", t: "Verifikasi" },
  { k: "dokumen", t: "Dokumen" },
  { k: "ditahan", t: "Ditahan" },
  { k: "terpenuhi", t: "Terpenuhi" },
];

/**
 * Lima ubin status pengeluaran barang. Ubin sebelum status berjalan terisi hijau, ubin berjalan kuning
 * (hijau bila terpenuhi), sisanya pucat. Ubin muncul berurutan; dengan reduced motion langsung tampil.
 */
export function LockTiles({ status }: { status: PengeluaranStatus }) {
  const reduce = useSafeReducedMotion();
  const at = LOCK_ORDER.findIndex((s) => s.k === status);
  return (
    <ol aria-label="Tahap pengeluaran barang" className="grid grid-cols-5 gap-1.5">
      {LOCK_ORDER.map((s, i) => {
        const state = i < at ? "done" : i === at ? "now" : "next";
        const color =
          state === "done" || (state === "now" && status === "terpenuhi")
            ? "bg-brand"
            : state === "now"
              ? "bg-accent"
              : "bg-brand-soft";
        return (
          <motion.li
            key={s.k}
            aria-current={state === "now" ? "step" : undefined}
            className="flex flex-col gap-1.5"
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.1 + i * 0.07 }}
          >
            <span aria-hidden="true" className={`block h-7 rounded-[2px] transition-colors duration-500 ${color}`} />
            <span className={`text-[11px] leading-[14px] ${state === "next" ? "text-text-muted" : "font-medium"}`}>{s.t}</span>
          </motion.li>
        );
      })}
    </ol>
  );
}

const FISKAL_TONE: Record<FiskalStatus, { bg: string; t: string }> = {
  belum: { bg: "bg-brand-soft", t: "belum diverifikasi" },
  berlaku: { bg: "bg-brand", t: "berlaku" },
  dikecualikan: { bg: "bg-accent", t: "dikecualikan" },
  tidakBerlaku: { bg: "border border-border-strong bg-card", t: "tidak berlaku" },
};

const FISKAL_SHORT: Record<FiskalKey, string> = {
  pabean: "Pabean",
  bm: "BM",
  ppnImpor: "PPN imp",
  pph22: "PPh 22",
  ppnbm: "PPnBM",
  cukai: "Cukai",
  ppnDom: "PPN dom",
};

/** Tujuh ubin, satu per komponen fiskal. Pucat = belum diverifikasi (bukan nihil). */
export function FiskalTiles({ rows }: { rows: Record<FiskalKey, FiskalRow> }) {
  const reduce = useSafeReducedMotion();
  const keys = Object.keys(FISKAL_LABEL) as FiskalKey[];
  const decided = keys.filter((k) => rows[k].status !== "belum").length;
  return (
    <div className="flex flex-col gap-2.5">
      <ul aria-label={`Status komponen fiskal, ${decided} dari ${keys.length} sudah ditentukan`} className="grid grid-cols-7 gap-1.5">
        {keys.map((k, i) => {
          const tone = FISKAL_TONE[rows[k].status];
          return (
            <motion.li
              key={k}
              className="flex flex-col gap-1.5"
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : i * 0.05 }}
            >
              <span aria-hidden="true" className={`block h-6 rounded-[2px] transition-colors duration-500 ${tone.bg}`} />
              <span className="text-[11px] leading-[14px] text-text-muted">
                {FISKAL_SHORT[k]}
                <span className="sr-only">, {tone.t}</span>
              </span>
            </motion.li>
          );
        })}
      </ul>
      <p className="text-[12px] leading-[15px] text-text-muted">
        {decided} dari {keys.length} komponen sudah ditentukan. Ubin pucat belum diverifikasi dan tidak sama dengan Rp0.
      </p>
    </div>
  );
}

/** Foto lot kecil dengan mozaik yang terbuka saat masuk layar, sama seperti di Pesanan saya. */
export function LotThumb({ lot, seed = 7 }: { lot?: Lot; seed?: number }) {
  if (!lot) return null;
  return (
    <div className="relative h-[84px] w-[112px] shrink-0 overflow-hidden rounded-[2px] bg-thumb-empty">
      <Image src={lot.photo} alt={lot.alt} fill sizes="112px" className="object-cover" style={{ objectPosition: lot.focus }} />
      <MosaicCover cols={4} rows={3} hidden seed={seed} trigger="inView" startDelay={0.1} origin={{ x: 0.5, y: 0.5 }} className="absolute inset-0" />
    </div>
  );
}
