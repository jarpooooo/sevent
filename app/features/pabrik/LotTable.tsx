"use client";

import { useState } from "react";
import { num } from "../../lib/format";
import { panel } from "../../components/ui/styles";
import { MiniBar, StatusPill } from "../../components/ui/table";
import { SEED_LOTS, useAddedLots, type PabrikLot } from "./lots-store";

const W = "minmax(0,360px) 150px 150px 240px minmax(0,1fr) 82px";
const HEAD = ["Lot", "Kanal", "Harga", "Stok", "Status"];

type Stage = { t: string; d: string; state: "done" | "now" | "next" };

/** Tahap lot (contoh demo) menurut status dan stok lot. */
function stagesOf(l: PabrikLot): Stage[] {
  const sold = Math.max(0, l.capacity - l.stock);
  const now = l.status === "Menunggu pemeriksaan" ? 1 : sold > 0 ? 3 : 2;
  const st = (i: number): Stage["state"] => (i < now ? "done" : i === now ? "now" : "next");
  return [
    { t: "Draf", d: "Foto dan data terisi", state: st(0) },
    { t: "Diperiksa", d: now === 1 ? "Tim sedang memeriksa lot" : "Lolos pemeriksaan tim", state: st(1) },
    { t: "Tayang", d: "Terlihat oleh UMKM", state: st(2) },
    { t: "Terjual", d: sold > 0 ? `${num(sold)} kg terjual dari ${num(l.capacity)} kg` : "Belum ada pesanan", state: st(3) },
    { t: "Selesai", d: "Komisi menunggu", state: st(4) },
  ];
}

const BAR = { done: "bg-brand", now: "bg-accent", next: "bg-brand-soft" } as const;
const WORD = { done: ["Selesai", "text-brand"], now: ["Sekarang", "text-text"], next: ["Belum", "text-text-muted"] } as const;

function Journey({ lot }: { lot: PabrikLot }) {
  return (
    <div className="bg-surface/70 px-6 py-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[14px] font-medium leading-[17px]">Perjalanan lot, {lot.name}</p>
        <p className="text-[12px] leading-[15px] text-text-muted">Status contoh demo</p>
      </div>
      <ol className="mt-4 grid grid-cols-2 gap-x-2 gap-y-5 sm:grid-cols-5">
        {stagesOf(lot).map((s) => (
          <li key={s.t} className="flex flex-col">
            <span aria-hidden="true" className={`block h-2.5 rounded-[2px] ${BAR[s.state]}`} />
            <span className={`mt-1.5 text-[12px] font-medium leading-[15px] ${WORD[s.state][1]}`}>{WORD[s.state][0]}</span>
            <span className="mt-1.5 text-[14px] font-medium leading-[17px]">{s.t}</span>
            <span className="mt-1.5 text-[12px] leading-[15px] text-text-muted">{s.d}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LotRow({ lot, open, onToggle }: { lot: PabrikLot; open: boolean; onToggle: () => void }) {
  const pct = lot.capacity ? Math.round((lot.stock / lot.capacity) * 100) : 0;
  const tone = lot.status === "Menunggu pemeriksaan" ? "wait" : "ok";
  const panelId = `perjalanan-${lot.id}`;
  return (
    <div className="border-t border-text/10 first:border-t-0">
      <div
        className="grid items-center gap-4 px-6 py-[18px] text-[14px] leading-[17px]"
        style={{ gridTemplateColumns: W }}
      >
        <span className="font-medium">{lot.name}</span>
        <span>{lot.channel}</span>
        <span>{lot.price}</span>
        <span className="flex flex-col gap-[7px]">
          <span className="text-[13px] leading-4 text-text-muted">
            {num(lot.stock)} dari {num(lot.capacity)} kg
          </span>
          <MiniBar pct={pct} />
        </span>
        <span>
          <StatusPill tone={tone}>{lot.status}</StatusPill>
        </span>
        <span className="flex justify-end">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${open ? "Tutup" : "Buka"} perjalanan lot ${lot.name}`}
            className="grid size-8 place-items-center rounded-[2px] bg-brand-soft transition-colors hover:bg-[#cfe6e2]"
          >
            <svg
              width="8"
              height="4"
              viewBox="0 0 8 4"
              fill="none"
              aria-hidden="true"
              className={`transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
            >
              <path d="M.5.5 4 3.5 7.5.5" stroke="#16746a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </span>
      </div>
      <div
        id={panelId}
        role="region"
        aria-label={`Perjalanan lot ${lot.name}`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden" inert={!open}>
          <Journey lot={lot} />
        </div>
      </div>
    </div>
  );
}

/** Tabel lot dengan baris "Perjalanan lot" yang bisa dibuka. Lot baru dari Tambah lot muncul di atas. */
export default function LotTable() {
  const added = useAddedLots();
  const lots = [...added, ...SEED_LOTS];
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={`${panel} overflow-hidden`}>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabel lot saya">
        <div className="min-w-[980px]">
          <div
            className="mx-px mt-px grid items-center gap-4 rounded-full bg-brand-soft/50 px-6 py-3 text-[12px] font-medium leading-[15px] text-text-muted"
            style={{ gridTemplateColumns: W }}
          >
            {HEAD.map((h) => (
              <span key={h}>{h}</span>
            ))}
            <span aria-hidden="true" />
          </div>
          {lots.map((l) => (
            <LotRow key={l.id} lot={l} open={openId === l.id} onToggle={() => setOpenId(openId === l.id ? null : l.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
