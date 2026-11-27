"use client";

import Link from "next/link";
import { m as motion } from "motion/react";
import { useState, type MouseEvent, type FocusEvent } from "react";
import { rupiah } from "../../../lib/format";

const EASE = [0.16, 1, 0.3, 1] as const;

import { PRODUCTS, type ChartCol, type ChartTile, type ProductKey } from "./products";

type Hover = { col: number; tile?: string; top?: number };

const tileName = (t: ChartTile) =>
  `Pesanan #${t.id}, ${PRODUCTS[t.product].name}, ${t.kg} kg, ${rupiah(t.value)}${t.pending ? ", menunggu konfirmasi" : ""}`;

const rb = (v: number) => `${Math.round(v / 1000)}rb`;

/**
 * Grafik ubin: satu kolom = satu periode, satu ubin = satu pesanan, warna = produk, tinggi = nilai.
 * `scale` = piksel per rupiah. Dipakai di Lot saya (per minggu) dan Tagihan komisi (per hari).
 */
export default function TileChart({
  cols,
  scale,
  barW,
  zoneH,
  daily,
  href,
  label,
}: {
  cols: ChartCol[];
  scale: number;
  barW: number;
  /** tinggi zona batang; tanpa ini kolom rata bawah setinggi tumpukannya */
  zoneH?: number;
  /** true: kolom per hari dengan garis dasar, total, dan tooltip hari */
  daily?: boolean;
  href: string;
  label: string;
}) {
  const [hover, setHover] = useState<Hover | null>(null);
  const last = cols.length - 1;

  const enterTile = (i: number, t: ChartTile) => (e: MouseEvent | FocusEvent) => {
    const el = e.currentTarget as HTMLElement;
    const col = el.closest<HTMLElement>("[data-col]");
    const top = col ? el.getBoundingClientRect().top - col.getBoundingClientRect().top : 0;
    setHover({ col: i, tile: t.id, top });
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={`relative flex ${daily ? "" : "items-end gap-[14px]"}`}
      onMouseLeave={() => setHover(null)}
    >
      {cols.map((c, i) => {
        const total = c.tiles.reduce((a, t) => a + t.value, 0);
        const on = hover?.col === i;
        const flip = i >= last - 1;
        const tile = on && hover?.tile ? c.tiles.find((t) => t.id === hover.tile) : undefined;
        const byProduct = (Object.keys(PRODUCTS) as ProductKey[])
          .map((p) => ({ p, v: c.tiles.filter((t) => t.product === p && !t.pending).reduce((a, t) => a + t.value, 0) }))
          .filter((x) => x.v > 0)
          .sort((a, b) => b.v - a.v);

        return (
          <div
            key={c.key}
            data-col
            onMouseEnter={() => setHover((h) => (h?.col === i ? h : { col: i }))}
            className={`relative flex flex-col items-center rounded-[2px] transition-colors duration-200 ${
              daily ? "flex-1 py-2" : ""
            } ${daily && on ? "bg-brand-soft/60" : ""}`}
            style={daily ? undefined : { width: barW }}
          >
            <div className="flex w-full items-end justify-center" style={zoneH ? { height: zoneH } : undefined}>
              <motion.div
                className="flex flex-col gap-[2px]"
                style={{ width: barW, transformOrigin: "bottom" }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }}
              >
                {c.tiles.map((t) => {
                  const h = Math.max(6, Math.round(t.value * scale));
                  const p = PRODUCTS[t.product];
                  return (
                    <Link
                      key={t.id}
                      href={href}
                      aria-label={tileName(t)}
                      onMouseEnter={enterTile(i, t)}
                      onFocus={enterTile(i, t)}
                      onMouseLeave={() => setHover({ col: i })}
                      onBlur={() => setHover({ col: i })}
                      className={`flex items-center justify-center rounded-[2px] text-[11px] font-medium outline-offset-[1px] transition-[outline-color] hover:outline-2 hover:outline-text focus-visible:outline-2 focus-visible:outline-text ${
                        t.pending ? "border border-dashed border-brand bg-brand-soft" : ""
                      } ${p.dark ? "text-text" : "text-surface"}`}
                      style={{ height: h, backgroundColor: t.pending ? undefined : p.color }}
                    >
                      {daily && h >= 24 && !t.pending ? rb(t.value) : null}
                    </Link>
                  );
                })}
              </motion.div>
            </div>

            {daily && <span aria-hidden="true" className="mt-2 block h-px w-[calc(100%-8px)] bg-text/10" />}
            <span className={`block text-center font-medium leading-4 ${daily ? "mt-2 text-[13px]" : "mt-2 text-[12px] font-normal leading-[15px] text-text-muted"}`}>
              {c.label}
            </span>
            {daily && <span className="mt-2 block text-[12px] leading-[15px] text-text-muted">{rupiah(total)}</span>}

            {tile && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-20 flex flex-col gap-[3px] whitespace-nowrap rounded-[2px] bg-text px-3.5 py-3 text-[12px] leading-[15px] text-surface"
                style={{
                  top: hover?.top,
                  ...(flip
                    ? { right: `calc(50% + ${barW / 2 + 10}px)` }
                    : { left: `calc(50% + ${barW / 2 + 10}px)` }),
                }}
              >
                <span>{PRODUCTS[tile.product].name}</span>
                <span className="font-medium">{rupiah(tile.value)}</span>
                <span className="text-[#c9d6cf]">
                  Pesanan #{tile.id}
                  {tile.pending ? ", menunggu konfirmasi" : ", klik untuk detail"}
                </span>
              </div>
            )}

            {daily && on && !tile && (
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-full z-20 flex w-[310px] flex-col gap-1.5 rounded-[2px] bg-text px-3.5 py-3 text-[12px] leading-[15px] text-surface ${
                  i === 0 ? "left-0" : i === last ? "right-0" : "left-1/2 -translate-x-1/2"
                }`}
              >
                <span className="text-[#c9d6cf]">{c.full ?? c.label}</span>
                <span className="text-[16px] font-semibold leading-5">Total {rupiah(total)}</span>
                {byProduct.map((x) => (
                  <span key={x.p} className="flex items-center justify-between gap-4">
                    <span className="whitespace-nowrap">{PRODUCTS[x.p].name}</span>
                    <span className="font-medium">{rupiah(x.v)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Legenda warna produk, dengan ubin putus-putus untuk "Menunggu". */
export function ChartLegend({
  items,
  pending,
  dailyStyle,
}: {
  items: ProductKey[];
  pending?: boolean;
  /** Tagihan komisi: nama lengkap, teks 12px ink. Lot saya: nama pendek, 11px muted. */
  dailyStyle?: boolean;
}) {
  return (
    <ul className={`flex flex-wrap items-center ${dailyStyle ? "gap-x-5 gap-y-1" : "gap-x-3.5 gap-y-1"}`}>
      {items.map((k) => (
        <li key={k} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={`block rounded-[2px] ${dailyStyle ? "size-3" : "size-2.5"}`}
            style={{ backgroundColor: PRODUCTS[k].color }}
          />
          <span className={dailyStyle ? "text-[12px] leading-[15px]" : "text-[11px] leading-[13px] text-text-muted"}>
            {dailyStyle ? PRODUCTS[k].name : PRODUCTS[k].short}
          </span>
        </li>
      ))}
      {pending && (
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="block size-2.5 rounded-[2px] border border-dashed border-brand bg-brand-soft" />
          <span className="text-[11px] leading-[13px] text-text-muted">Menunggu</span>
        </li>
      )}
    </ul>
  );
}
