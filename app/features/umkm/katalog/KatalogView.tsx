"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Icon } from "../../../components/ui/icons";
import { LotCard, LotRow } from "./LotCard";
import { filterLots } from "../../../lib/domain/lots";
import { type BuyModel, CATEGORIES, type Category, type Lot, LOT_TYPES, type LotType } from "../../../lib/domain/types";
import MosaicLoop from "../../../components/mosaic/MosaicLoop";

const EASE = [0.16, 1, 0.3, 1] as const;

type Tab = "semua" | BuyModel;

const COPY: Record<Tab, { place: string; title: string; text: string }> = {
  semua: {
    place: "DI Yogyakarta",
    title: "Semua lot",
    text: "Semua lot sisa produksi di satu tempat: harga tetap dari pabrik dalam radius 50 km darimu, dan lelang dengan harga turun bertahap.",
  },
  tetap: {
    place: "DI Yogyakarta",
    title: "Harga tetap regional",
    text: "Harga tetap per kg dari pabrik dalam radius 50 km darimu. Beli sebagian sesuai kebutuhan, ambil sendiri atau diantar.",
  },
  lelang: {
    place: "Seluruh Indonesia",
    title: "Lelang terbalik",
    text: "Harga turun tiap 6 jam selama 3 hari (72 jam), selama stok masih ada. Batas harga terendah pabrik tidak ditampilkan.",
  },
};

const TYPES: { id: "semua" | LotType; label: string }[] = [
  { id: "semua", label: "Semua tipe" },
  ...LOT_TYPES.map((t) => ({ id: t, label: t })),
];

const box = "border border-border bg-card/60";

export default function KatalogView({ lots }: { lots: Lot[] }) {
  const [tab, setTab] = useState<Tab>("tetap");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "semua">("semua");
  const [lotType, setLotType] = useState<"semua" | LotType>("semua");
  const [view, setView] = useState<"kotak" | "daftar">("kotak");
  const [filterOpen, setFilterOpen] = useState(false);

  const counts = useMemo(
    () => ({
      semua: lots.length,
      tetap: lots.filter((l) => l.model === "tetap").length,
      lelang: lots.filter((l) => l.model === "lelang").length,
    }),
    [lots],
  );

  const results = useMemo(
    () => filterLots(lots, { model: tab, category: cat, lotType, q: query }),
    [lots, tab, cat, lotType, query],
  );

  const copy = COPY[tab];
  const filtered = lotType !== "semua";

  const clear = () => {
    setQuery("");
    setCat("semua");
    setLotType("semua");
  };

  return (
    <section aria-label="Katalog lot" className="pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        {/* Intro + banner mosaik yang menutup dan membuka pelan */}
        <div className="flex flex-col gap-8 pb-2 pt-8 lg:flex-row lg:items-start lg:justify-between lg:pt-11">
          <div className="flex min-w-0 flex-col items-start gap-3.5">
            <p className="flex items-center gap-2 rounded-full bg-brand-soft py-[9px] pl-3 pr-3.5 text-[13px] font-medium text-brand">
              <Icon name="map-pin" size={13} />
              {copy.place}
            </p>
            <h1 className="font-display overflow-hidden pb-1 text-[clamp(36px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={tab}
                  className="block"
                  initial={{ y: "100%" }}
                  animate={{ y: "0%", transition: { duration: 0.6, ease: EASE } }}
                  exit={{ y: "-100%", transition: { duration: 0.25 } }}
                >
                  {copy.title}
                </motion.span>
              </AnimatePresence>
            </h1>
<p className="max-w-[560px] text-[16px] leading-6 text-text-muted">{copy.text}</p>
          </div>

          <div
            aria-hidden="true"
            className="relative h-[110px] w-full shrink-0 overflow-hidden rounded-[2px] bg-inverse sm:h-[150px] lg:w-[600px]"
          >
            <Image
              src="/images/gudang.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 600px, 92vw"
              className="object-cover"
              style={{ objectPosition: "50% 55%" }}
            />
            <MosaicLoop cols={6} rows={2} seed={31} line={1} slow={1.1} className="absolute inset-0" />
          </div>
        </div>

        {/* Tab model beli + cari + filter + tampilan */}
        <div className="flex flex-col gap-4 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Model beli" className="-mx-5 flex shrink-0 items-center gap-6 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            {(
              [
                ["semua", "Semua"],
                ["tetap", "Harga tetap regional"],
                ["lelang", "Lelang terbalik"],
              ] as const
            ).map(([id, label]) => {
              const on = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(id)}
                  className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap pb-2 text-[14px] transition-colors ${
                    on ? "font-medium text-text" : "text-text-muted hover:text-text"
                  }`}
                >
                  {label}
                  <span className="text-[12px] tabular-nums text-text-muted">{counts[id]}</span>
                  {on && (
                    <motion.span
                      layoutId="kat-tab"
                      className="absolute inset-x-0 bottom-0 h-[2px] bg-brand"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <label
            className={`${box} flex h-11 min-w-0 items-center gap-2.5 rounded-[2px] px-4 focus-within:border-brand lg:min-w-[420px]`}
          >
            <Icon name="search" size={14} className="shrink-0 text-text-muted" />
            <span className="sr-only">Cari lot</span>
            <input
              type="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kain, perca, atau kota"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-text-placeholder"
            />
          </label>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-expanded={filterOpen}
              aria-controls="kat-filter"
              onClick={() => setFilterOpen((v) => !v)}
              className={`${box} relative flex h-11 items-center gap-2 rounded-[2px] px-4 text-[13px] font-medium transition-colors hover:bg-card`}
            >
              Filter
              {filtered && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
            </button>
            <div role="group" aria-label="Tampilan" className={`${box} flex gap-1 rounded-full p-1`}>
              {(["kotak", "daftar"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={`relative rounded-[2px] px-3 py-2 text-[12px] font-medium transition-colors ${
                    view === v ? "text-surface" : "text-text-muted hover:text-text"
                  }`}
                >
                  {view === v && (
                    <motion.span
                      layoutId="kat-view"
                      className="absolute inset-0 rounded-[2px] bg-brand"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative capitalize">{v}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {filterOpen && (
            <motion.div
              id="kat-filter"
              key="filter"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 pt-5">
                <span className="text-[13px] text-text-muted">Tipe lot</span>
                {TYPES.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    aria-pressed={lotType === u.id}
                    onClick={() => setLotType(u.id)}
                    className={`rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ${
                      lotType === u.id ? "bg-brand text-surface" : "border border-border-strong hover:bg-card"
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chip kategori */}
        <div role="group" aria-label="Kategori" className="-mx-5 flex gap-2 overflow-x-auto px-5 pt-5 sm:mx-0 sm:px-0">
          {(["semua", ...CATEGORIES] as const).map((c) => {
            const on = cat === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ${
                  on ? "bg-inverse text-surface" : "border border-border-strong hover:bg-card"
                }`}
              >
                {c === "semua" ? "Semua kategori" : c}
              </button>
            );
          })}
          <p role="status" className="ml-auto hidden shrink-0 self-center pl-4 text-[12px] tabular-nums text-text-muted sm:block">
            {results.length} lot
          </p>
        </div>

        {/* Daftar lot */}
        <div className="pb-4 pt-6">
          {results.length > 0 ? (
            <motion.ul
              layout
              className={
                view === "kotak"
                  ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-3"
              }
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((lot, i) => (
                  <motion.li
                    key={`${view}-${lot.slug}`}
                    layout="position"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  >
                    {view === "kotak" ? <LotCard lot={lot} index={i} /> : <LotRow lot={lot} index={i} />}
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <div className="max-w-[460px] py-10">
              <h2 className="font-display text-[28px] tracking-[-0.02em]">Belum ada lot yang cocok.</h2>
              <p className="mt-3 text-[16px] leading-6 text-text-muted">
                Coba kategori atau model beli lain, atau hapus kata pencarianmu.
              </p>
              <button
                type="button"
                onClick={clear}
                className="mt-6 rounded-[2px] bg-brand px-5 py-3 text-[14px] font-medium text-on-dark transition-colors hover:bg-brand-hover"
              >
                Tampilkan semua lot
              </button>
            </div>
          )}
        </div>

        {/* Strip mosaik di atas catatan kaki: menutup dan membuka pelan, tanpa henti */}
        <div
          aria-hidden="true"
          className="relative mt-12 h-[110px] overflow-hidden rounded-[2px] bg-inverse md:h-[150px]"
        >
          <Image
            src="/images/chip-1.webp"
            alt=""
            fill
            sizes="(min-width: 1440px) 1312px, 100vw"
            className="object-cover"
            style={{ objectPosition: "50% 60%" }}
          />
          <MosaicLoop cols={14} rows={2} seed={41} line={1} slow={1.2} className="absolute inset-0 hidden sm:block" />
          <MosaicLoop cols={6} rows={2} seed={42} line={1} slow={1.2} className="absolute inset-0 sm:hidden" />
        </div>

        <p className="pb-10 pt-6 text-[12px] text-text-muted">
          Data demo untuk mock up. Harga, stok, MOQ, dan lokasi akan diganti data lot nyata.
        </p>
      </div>
    </section>
  );
}
