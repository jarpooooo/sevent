"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "../../../components/ui/icons";
import MosaicCover from "../../../components/mosaic/MosaicCover";
import { sisaLabel, useAuction } from "./auction";
import { num, rupiah } from "../../../lib/format";
import type { Lot } from "../../../lib/domain/types";

/** Label model beli singkat untuk baris meta kartu. */
export const MODEL_SHORT = { tetap: "Regional", lelang: "Lelang" } as const;

/** Bar stok: sisa stok dari stok awal. */
export function StockBar({ lot, className = "" }: { lot: Lot; className?: string }) {
  const pct = Math.max(0, Math.min(100, (lot.stock / lot.capacity) * 100));
  return (
    <div className={className}>
      <p className="text-[12px] font-medium">
        Stok {num(lot.stock)} {lot.unit} dari {num(lot.capacity)} {lot.unit}
      </p>
      <span aria-hidden="true" className="mt-1.5 block h-[5px] overflow-hidden rounded-full bg-brand-soft">
        <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

/** Garis turun harga: mengecil dari kiri ke kanan seiring waktu lelang berjalan. */
export function DescentBar({ progress }: { progress: number }) {
  return (
    <span aria-hidden="true" className="relative block h-[2px] w-full bg-border">
      <span
        className="absolute inset-0 origin-left bg-accent"
        style={{ transform: `scaleX(${1 - progress})`, transition: "transform 1s linear" }}
      />
    </span>
  );
}

function Price({ lot }: { lot: Lot }) {
  const auction = useAuction(lot);
  const price = auction ? auction.price : (lot.price ?? 0);
  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <p className="flex items-end gap-1 whitespace-nowrap">
          <span className="font-display text-[18px] tracking-[-0.01em] tabular-nums text-brand">
            {rupiah(price)}
          </span>
          <span className="text-[12px] text-text-muted">/ {lot.unit}</span>
        </p>
        {auction && (
          <p
            role="timer"
            aria-label="Sisa waktu lelang terbalik"
            className="flex items-center gap-1.5 text-[12px] tabular-nums text-text-muted"
          >
            <Icon name="clock" size={14} />
            Sisa {sisaLabel(auction.remaining)}
          </p>
        )}
      </div>
      {auction && <DescentBar progress={auction.progress} />}
    </>
  );
}

function Origin({ lot }: { lot: Lot }) {
  return (
    <p className="flex items-center gap-1.5 text-[12px]">
      <Icon name="map-pin" size={12} className="shrink-0 text-brand" />
      Pabrik di {lot.origin}
    </p>
  );
}

/** Kartu lot (tampilan Kotak). Ubin "+" di pojok foto mengikuti motif mosaik dan menyala saat disorot. */
export function LotCard({ lot, index = 0 }: { lot: Lot; index?: number }) {
  return (
    <Link
      href={`/katalog/${lot.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2px] border border-border bg-panel"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-[2px] border-2 border-transparent transition-colors duration-300 group-hover:border-brand group-focus-visible:border-brand"
      />
      <div className="relative h-[190px] overflow-hidden rounded-[2px] bg-inverse">
        <Image
          src={lot.photo}
          alt={lot.alt}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 46vw, 92vw"
          className="object-cover"
          style={{ objectPosition: lot.focus }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[2px] ring-1 ring-inset ring-black/10"
        />
        <MosaicCover
          cols={4}
          rows={3}
          hidden
          seed={index + 3}
          trigger="inView"
          startDelay={0.05 + (index % 4) * 0.08}
          origin={{ x: 0.5, y: 0.5 }}
          className="absolute inset-0"
        />
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 z-10 flex size-14 items-center justify-center bg-surface text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-surface group-focus-visible:bg-brand group-focus-visible:text-surface"
        >
          <Icon name="plus" size={20} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-[18px] pt-3.5">
        <Price lot={lot} />
        <h3 className="text-[15px] font-semibold leading-snug">{lot.title}</h3>
        <p className="text-[12px] text-text-muted">
          {MODEL_SHORT[lot.model]}, {lot.category}, MOQ {num(lot.moq)} {lot.unit}
        </p>
        <Origin lot={lot} />
        <StockBar lot={lot} className="mt-auto pt-1" />
      </div>
    </Link>
  );
}

/** Baris lot (tampilan Daftar). */
export function LotRow({ lot, index = 0 }: { lot: Lot; index?: number }) {
  return (
    <Link
      href={`/katalog/${lot.slug}`}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-[2px] border border-border bg-panel p-3 sm:flex-row sm:items-center sm:gap-6"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-[2px] border-2 border-transparent transition-colors duration-300 group-hover:border-brand group-focus-visible:border-brand"
      />
      <div className="relative h-[150px] w-full shrink-0 overflow-hidden rounded-[2px] bg-inverse sm:h-[96px] sm:w-[148px]">
        <Image
          src={lot.photo}
          alt={lot.alt}
          fill
          sizes="(min-width: 640px) 148px, 92vw"
          className="object-cover"
          style={{ objectPosition: lot.focus }}
        />
        <MosaicCover
          cols={4}
          rows={3}
          hidden
          seed={index + 5}
          trigger="inView"
          origin={{ x: 0.5, y: 0.5 }}
          className="absolute inset-0"
        />
      </div>
      <div className="grid min-w-0 flex-1 gap-x-8 gap-y-1.5 sm:grid-cols-[1fr_220px] sm:items-center">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="text-[15px] font-semibold leading-snug">{lot.title}</h3>
          <p className="text-[12px] text-text-muted">
            {MODEL_SHORT[lot.model]}, {lot.category}, MOQ {num(lot.moq)} {lot.unit}
          </p>
          <Origin lot={lot} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Price lot={lot} />
          <StockBar lot={lot} className="pt-1" />
        </div>
      </div>
    </Link>
  );
}
