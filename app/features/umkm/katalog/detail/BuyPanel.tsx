"use client";

import { m as motion } from "motion/react";
import Link from "next/link";
import { useId, useState } from "react";
import { Icon } from "../../../../components/ui/icons";
import Counter from "../../../../components/ui/Counter";
import { panel } from "../../../../components/ui/styles";
import { defaultQty, stepOf } from "../../../../lib/domain/pricing";
import { BUY_MODEL_LABEL, type Lot } from "../../../../lib/domain/types";
import { num, rupiah } from "../../../../lib/format";
import { sisaLabel, useAuction } from "../auction";
import { DescentBar } from "../LotCard";
import { rule } from "./shared";

/* ───────── Panel beli ───────── */
export default function BuyPanel({ lot }: { lot: Lot }) {
  const id = useId();
  const auction = useAuction(lot);
  const price = auction ? auction.price : (lot.price ?? 0);

  const step = stepOf(lot);
  const min = Math.min(lot.moq, lot.stock);
  const max = lot.stock;
  const [qty, setQty] = useState(defaultQty(lot));
  const [text, setText] = useState(String(defaultQty(lot)));

  const apply = (n: number) => {
    const v = Math.max(min, Math.min(max, Math.round(n)));
    setQty(v);
    setText(String(v));
  };
  const pct = Math.max(0, Math.min(100, (lot.stock / lot.capacity) * 100));

  return (
    <aside
      aria-label="Beli lot ini"
      className={`${panel} p-6 sm:p-7 lg:sticky lg:top-[96px]`}
    >
      <p className="text-[12px] font-medium text-brand">
        {lot.model === "tetap" ? "Regional" : "Lelang terbalik"}, {lot.category}
      </p>
      <h1 className="font-display mt-2 text-[clamp(30px,3vw,38px)] leading-[1.1] tracking-[-0.02em]">
        {lot.title}
      </h1>
      <p className="mt-3 flex items-center gap-2 text-[14px] text-text-muted">
        <Icon name="map-pin" size={16} />
        Lot {lot.code}, Pabrik di {lot.origin}
      </p>

      <div className={`${rule} my-5`} />

      <p className="flex items-end gap-2">
        <span className="font-display text-[clamp(32px,3vw,38px)] leading-none tabular-nums text-brand">
          <Counter value={price} format={rupiah} />
        </span>
        <span className="pb-1 text-[15px] text-text-muted">/ {lot.unit}</span>
      </p>
      <p className="mt-2 text-[13px] text-text-muted">{BUY_MODEL_LABEL[lot.model]}</p>

      {auction && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 text-[13px] tabular-nums">
            <span className="text-text-muted">Harga turun tiap 6 jam, {auction.steps} langkah</span>
            <span role="timer" aria-label="Sisa waktu lelang terbalik" className="flex items-center gap-1.5 font-medium">
              <Icon name="clock" size={15} />
              Sisa {sisaLabel(auction.remaining)} dari 72 jam
            </span>
          </div>
          <div className="mt-2">
            <DescentBar progress={auction.progress} />
          </div>
          <p className="mt-1.5 text-[12px] text-text-muted">Batas terendah pabrik disembunyikan.</p>
        </div>
      )}

      <div className="mt-5 flex items-baseline justify-between text-[14px] font-medium">
        <span>Stok tersedia</span>
        <span className="text-brand tabular-nums">
          {num(lot.stock)} / {num(lot.capacity)} {lot.unit}
        </span>
      </div>
      <span aria-hidden="true" className="mt-2 block h-1.5 overflow-hidden rounded-full bg-brand-soft">
        <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </span>
      <p className="mt-3 text-[13px] text-text-muted">
        Min. {num(lot.moq)} {lot.unit}, contoh demo
      </p>

      <div className={`${rule} my-5`} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label htmlFor={`${id}-qty`} className="text-[14px] font-medium">
            Jumlah pembelian
          </label>
          <div className="mt-2.5 flex h-11 w-[238px] max-w-full items-center rounded-[2px] border border-line bg-card">
            <button
              type="button"
              aria-label="Kurangi jumlah"
              disabled={qty <= min}
              onClick={() => apply(qty - step)}
              className="flex h-full w-11 items-center justify-center rounded-l-[2px] text-[18px] transition-colors hover:bg-brand-soft disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Icon name="minus" size={16} />
            </button>
            <div className="flex flex-1 items-center justify-center gap-1.5">
              <input
                id={`${id}-qty`}
                inputMode="numeric"
                value={text}
                onChange={(e) => setText(e.target.value.replace(/\D/g, ""))}
                onBlur={() => apply(Number(text) || min)}
                onKeyDown={(e) => e.key === "Enter" && apply(Number(text) || min)}
                className="w-12 bg-transparent text-right text-[15px] font-medium tabular-nums outline-none"
              />
              <span className="text-[15px] font-medium">{lot.unit}</span>
            </div>
            <button
              type="button"
              aria-label="Tambah jumlah"
              disabled={qty >= max}
              onClick={() => apply(qty + step)}
              className="flex h-full w-11 items-center justify-center rounded-r-[2px] transition-colors hover:bg-brand-soft disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Icon name="plus" size={16} />
            </button>
          </div>
        </div>
        <div className="flex shrink-0 items-baseline justify-between gap-4 sm:block sm:text-right">
          <p className="text-[12px] text-text-muted">Subtotal</p>
          <p className="text-[22px] font-semibold tabular-nums sm:mt-2.5 sm:leading-[44px]">
            <Counter value={qty * price} format={rupiah} />
          </p>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-text-muted">Pengiriman atau pickup dipilih saat checkout.</p>

      <motion.div whileTap={{ scale: 0.99 }} className="mt-5">
        <Link
          href={`/checkout?lot=${lot.slug}&qty=${qty}`}
          className="flex h-12 items-center justify-center gap-2 rounded-[2px] bg-brand text-[15px] font-semibold text-on-dark transition-colors hover:bg-brand-hover"
        >
          Lanjut checkout
          <Icon name="arrow-up-right" size={16} />
        </Link>
      </motion.div>
      <p className="mt-3.5 text-[12px] leading-[1.45] text-text-muted">
        Khusus UMKM terverifikasi, Ongkir belum termasuk
        {auction ? ". Kamu membayar harga yang berlaku saat membayar." : ""}
      </p>
    </aside>
  );
}

