"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { useState } from "react";
import { Icon } from "../../../../components/ui/icons";
import type { Lot } from "../../../../lib/domain/types";
import { h2, rule, Stars } from "./shared";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ───────── Rating dan ulasan ───────── */
const LABELS = ["Sangat kurang", "Kurang", "Cukup", "Bagus", "Sangat bagus"];

export default function Reviews({ lot }: { lot: Lot }) {
  const r = lot.reviews;
  const [filter, setFilter] = useState<number | "semua">("semua");
  const [note, setNote] = useState<string | null>(null);

  const total = r ? r.counts.reduce((a, b) => a + b, 0) : 0;
  const shown = r ? r.items.filter((i) => filter === "semua" || i.stars === filter) : [];

  return (
    <section aria-label="Rating dan ulasan pembeli">
      <h2 className={h2}>03 / Rating &amp; ulasan pembeli</h2>
      <p className="mt-2 text-[13px] text-text-muted">Contoh tampilan ulasan, data simulasi</p>
      <div className={`${rule} mt-6`} />

      <div className="grid gap-10 py-8 md:grid-cols-[200px_1fr] lg:grid-cols-[260px_minmax(0,1fr)_346px] lg:gap-16">
        <div>
          <p className="font-display text-[clamp(56px,6vw,76px)] leading-none">
            {r ? r.average.toLocaleString("id-ID", { minimumFractionDigits: 1 }) : "–"}
          </p>
          <div className="mt-3">
            <Stars value={r ? Math.round(r.average) : 0} size={18} />
          </div>
          <p className="mt-3 text-[14px] text-text-muted">
            {r ? `dari 5, ${total} penilaian` : "Belum ada penilaian"}
          </p>
        </div>

        <ul className="flex flex-col gap-3 self-center">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = r ? r.counts[n - 1] : 0;
            return (
              <li key={n} className="grid grid-cols-[18px_150px_1fr_24px] items-center gap-3 text-[13px] sm:grid-cols-[18px_130px_1fr_24px]">
                <span className="flex items-center gap-1 font-medium">
                  {n}
                </span>
                <span className="flex items-center gap-2 text-text-muted">
                  <Icon name="star-filled" size={14} className="text-brand" />
                  {LABELS[n - 1]}
                </span>
                <span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-brand-soft">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${total ? (c / total) * 100 : 0}%` }} />
                </span>
                <span className="text-right font-medium tabular-nums text-text-muted">{c}</span>
              </li>
            );
          })}
        </ul>

        <div className="md:col-span-2 lg:col-span-1">
          <p className="text-[16px] font-medium">Bagaimana kualitas materialnya?</p>
          <p className="mt-2 text-[13px] text-text-muted">Ulasan hanya dapat ditulis setelah transaksi selesai.</p>
          <button
            type="button"
            onClick={() => setNote("Demo: tulis ulasan aktif setelah pesananmu selesai dan kamu konfirmasi barang diterima.")}
            className="mt-5 h-11 w-full rounded-[2px] border border-brand bg-panel text-[14px] font-semibold text-brand transition-colors hover:bg-brand-soft"
          >
            Tulis ulasan
          </button>
        </div>
      </div>

      <div className={rule} />

      <div className="flex flex-col gap-4 pb-2 pt-7 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-[22px] font-semibold">Ulasan pembeli</h3>
          <p className="mt-1 text-[13px] text-text-muted">{r ? `${total} ulasan, contoh` : "0 ulasan"}</p>
        </div>
        {r && (
          <div role="group" aria-label="Saring ulasan" className="flex flex-wrap gap-2">
            {(["semua", 5, 4, 3, 2, 1] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`h-9 rounded-full border px-4 text-[12px] font-medium transition-colors ${
                  filter === f
                    ? "border-brand bg-brand text-on-dark"
                    : "border-line bg-panel text-text-muted hover:bg-brand-soft"
                }`}
              >
                {f === "semua" ? "Semua" : `${f} bintang`}
              </button>
            ))}
          </div>
        )}
      </div>

      {r ? (
        <ul>
          {shown.length === 0 && <li className="py-8 text-[14px] text-text-muted">Belum ada ulasan dengan bintang ini.</li>}
          {shown.map((v) => (
            <li key={v.name} className="grid grid-cols-[42px_1fr] gap-x-4 border-b border-line py-6">
              <span className="flex size-[42px] items-center justify-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand">
                {v.initials}
              </span>
              <div>
                <p className="text-[15px] font-semibold">{v.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-text-muted">
                  <Icon name="map-pin" size={13} />
                  {v.place}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-text-muted">
                  <Stars value={v.stars} />
                  <span>
                    {v.date}, {v.qty}, Contoh pembelian
                  </span>
                </div>
                <p className="mt-3 max-w-[1160px] text-[15px] leading-[22px]">{v.text}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-b border-line py-8 text-[14px] text-text-muted">
          Belum ada ulasan untuk lot ini. Ulasan muncul setelah pembeli menyelesaikan transaksi.
        </p>
      )}

      <div className="flex flex-col gap-4 pt-8 md:flex-row md:items-center md:justify-between">
        {r && (
          <button
            type="button"
            onClick={() => setNote(`Demo: hanya ${r.items.length} ulasan contoh yang tersedia, bukan ${total}.`)}
            className="h-10 w-fit rounded-[2px] border border-line bg-panel px-5 text-[13px] font-medium text-brand transition-colors hover:bg-brand-soft"
          >
            Lihat semua ulasan
          </button>
        )}
        <p className="text-[12px] text-text-muted md:max-w-[346px]">Ulasan di atas adalah contoh UI, bukan penilaian nyata.</p>
      </div>
      <div role="status" className="min-h-5">
        <AnimatePresence mode="wait">
          {note && (
            <motion.p
              key={note}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-3 text-[13px] text-text-soft"
            >
              {note}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

