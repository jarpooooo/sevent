"use client";

import { ArrowLeft, Search } from "lucide-react";
import { m as motion } from "motion/react";
import Link from "next/link";
import { type ReactNode, useId } from "react";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";
import { inputBox, panel } from "../../components/ui/styles";

const EASE = [0.16, 1, 0.3, 1] as const;

export function PageHead({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  const reduce = useSafeReducedMotion();
  return (
    <motion.header
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[clamp(30px,3.4vw,42px)] leading-[1.08] tracking-[-0.03em]">{title}</h1>
        {desc && <p className="max-w-[680px] text-[15px] leading-[22px] text-text-muted">{desc}</p>}
      </div>
      {action}
    </motion.header>
  );
}

export const back = (href: string, label: string) => (
  <Link href={href} className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-brand hover:text-brand-hover">
    <ArrowLeft aria-hidden="true" className="size-3.5" strokeWidth={2} />
    {label}
  </Link>
);

/** Kartu dengan judul, dipakai di halaman detail dan ringkasan. */
export function Card({ title, desc, aside, children, className = "" }: { title: string; desc?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={`${panel} flex flex-col gap-4 p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-[20px] leading-[1.15] tracking-[-0.02em]">{title}</h2>
          {desc && <p className="text-[13px] leading-5 text-text-muted">{desc}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export const Kv = ({ k, v }: { k: string; v: ReactNode }) => (
  <div className="flex justify-between gap-6 text-[14px] leading-[18px]">
    <dt className="shrink-0 text-text-muted">{k}</dt>
    <dd className="text-right font-medium">{v || "-"}</dd>
  </div>
);

/** Bar alat tabel: kotak cari, chip filter, dan pilihan urutan. */
export function Toolbar({
  q,
  onQ,
  chips,
  chip,
  onChip,
  sort,
  onSort,
  sorts,
  shown,
  total,
  label,
}: {
  q: string;
  onQ: (v: string) => void;
  chips: { v: string; t: string; n: number }[];
  chip: string;
  onChip: (v: string) => void;
  sort: string;
  onSort: (v: string) => void;
  sorts: { v: string; t: string }[];
  shown: number;
  total: number;
  label: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor={`${id}-q`} className="sr-only">
            Cari {label}
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
          <input id={`${id}-q`} type="search" value={q} onChange={(e) => onQ(e.target.value)} placeholder={`Cari ${label}`} className={`${inputBox} pl-10`} />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={`${id}-s`} className="text-[13px] text-text-muted">
            Urutkan
          </label>
          <select id={`${id}-s`} value={sort} onChange={(e) => onSort(e.target.value)} className={`${inputBox} w-auto pr-8`}>
            {sorts.map((s) => (
              <option key={s.v} value={s.v}>
                {s.t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter status">
        {chips.map((c) => (
          <button
            key={c.v}
            type="button"
            aria-pressed={chip === c.v}
            onClick={() => onChip(c.v)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${chip === c.v ? "bg-brand text-on-dark" : "bg-card text-text hover:bg-brand-soft"}`}
          >
            {c.t} <span className="tabular-nums opacity-70">{c.n}</span>
          </button>
        ))}
        <span role="status" className="ml-auto text-[13px] text-text-muted">
          {shown} dari {total}
        </span>
      </div>
    </div>
  );
}

export type Row = { id: string; href: string; cells: ReactNode[] };

/** Tabel baris-tautan: seluruh baris bisa diklik ke halaman detail. Baris masuk berurutan. */
export function LinkTable({ head, widths, rows, label, empty }: { head: string[]; widths: string; rows: Row[]; label: string; empty: string }) {
  const reduce = useSafeReducedMotion();
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={label}>
        <div className="min-w-[860px]">
          <div className="grid items-center gap-4 bg-brand-soft/50 px-6 py-3 text-[12px] font-medium text-text-muted" style={{ gridTemplateColumns: widths }}>
            {head.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          {rows.length === 0 ? (
            <p className="px-6 py-10 text-[14px] text-text-muted">{empty}</p>
          ) : (
            rows.map((r, i) => (
              <motion.div
                key={r.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : Math.min(i, 10) * 0.04 }}
              >
                <Link
                  href={r.href}
                  className="grid items-center gap-4 border-t border-line px-6 py-4 text-[14px] transition-colors hover:bg-brand-soft/40 focus-visible:bg-brand-soft/40 focus-visible:outline-none"
                  style={{ gridTemplateColumns: widths }}
                >
                  {r.cells.map((c, k) => (
                    <span key={k} className="min-w-0">
                      {c}
                    </span>
                  ))}
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/** Saring dan urutkan daftar dengan cari teks bebas dan satu filter status. */
export function filterRows<T>(items: T[], q: string, chip: string, text: (t: T) => string, status: (t: T) => string) {
  const k = q.trim().toLowerCase();
  return items.filter((t) => (chip === "semua" || status(t) === chip) && (!k || text(t).toLowerCase().includes(k)));
}
