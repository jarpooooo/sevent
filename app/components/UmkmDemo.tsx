"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useSafeReducedMotion } from "./useSafeReducedMotion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Angka menghitung ke nilai baru, supaya perubahan kg dan daerah terbaca sebagai sebab-akibat. */
function Counter({
  value,
  format,
  empty = "—",
}: {
  value: number | null;
  format: (n: number) => string;
  empty?: string;
}) {
  const reduce = useSafeReducedMotion();
  const mv = useMotionValue(value ?? 0);
  const text = useTransform(mv, (v) => format(Math.round(v)));
  useEffect(() => {
    if (value === null) return;
    const c = animate(mv, value, { duration: reduce ? 0 : 0.6, ease: EASE });
    return () => c.stop();
  }, [value, mv, reduce]);
  if (value === null) return <>{empty}</>;
  return <motion.span>{text}</motion.span>;
}

/**
 * Demo beli untuk UMKM. Wilayah = kabupaten/kota; pilot awal Bantul.
 * Angka lot dan harga di bawah ADALAH CONTOH DEMO (bukan harga pasar) dan diberi label di UI.
 */
type Region = { name: string; open: boolean; lotKg?: number; pricePerKg?: number };

const REGIONS: Region[] = [
  { name: "Bantul", open: true, lotKg: 500, pricePerKg: 5000 }, // angka demo
  { name: "Sleman", open: false },
  { name: "Kota Yogyakarta", open: false },
  { name: "Kulon Progo", open: false },
  { name: "Gunungkidul", open: false },
];

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export default function UmkmDemo() {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);
  const [kg, setKg] = useState(200);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REGIONS.filter((r) => r.name.toLowerCase().includes(q));
  }, [query]);

  const showList = focused && !region && matches.length > 0;
  const pct = ((kg - 10) / (500 - 10)) * 100;
  const f = Math.min(1.25, 0.3 + (0.7 * kg) / 200);

  const pick = (r: Region) => {
    if (!r.open) return;
    setRegion(r);
    setQuery(r.name);
    setFocused(false);
  };
  const reset = () => {
    setRegion(null);
    setQuery("");
    setFocused(true);
  };

  const cost = region?.pricePerKg ? kg * region.pricePerKg : null;

  return (
    <section
      id="demo-umkm"
      aria-label="Demo beli untuk UMKM"
      className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-20 sm:px-10 md:py-[120px] lg:flex-row lg:gap-20"
    >
      <div className="w-full shrink-0 lg:w-[560px]">
        <h2 className="font-display text-[clamp(38px,5vw,56px)] leading-[1.04] tracking-[-0.03em]">
          Jahitanmu tetap jalan.
        </h2>
        <p className="mt-6 text-[16px] leading-6 text-muted">
          Ketik daerahmu dan geser kebutuhan kainmu. Biaya dihitung dari harga tetap regional. Demo ini
          belum membuat transaksi.
        </p>

        {/* Wilayah */}
        <div ref={wrapRef} className="relative mt-7 w-full max-w-[280px]">
          <label htmlFor={`${listId}-in`} className="text-[14px] text-muted">
            Daerahmu (kabupaten/kota)
          </label>
          <div
            className={`mt-2 flex h-10 items-center gap-2 rounded-[10px] bg-white/75 px-3 ${
              focused ? "border-[1.5px] border-teal" : "border border-[rgba(11,15,12,0.2)]"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-muted">
              <circle cx="6.5" cy="6.5" r="4.75" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10l4 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              id={`${listId}-in`}
              role="combobox"
              aria-expanded={showList}
              aria-controls={listId}
              aria-autocomplete="list"
              autoComplete="off"
              value={query}
              readOnly={!!region}
              placeholder="Mis. Bantul"
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={(e) => {
                if (!wrapRef.current?.contains(e.relatedTarget as Node)) setFocused(false);
              }}
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#8a948d]"
            />
            {region && (
              <button type="button" onClick={reset} className="text-[13px] text-muted hover:text-ink">
                Ganti
              </button>
            )}
          </div>

          <AnimatePresence>
          {showList && (
            <motion.ul
              id={listId}
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: EASE } }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
              style={{ transformOrigin: "50% 0%" }}
              className="absolute left-0 top-[72px] z-10 w-full rounded-[12px] border border-[var(--line)] bg-white p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            >
              {matches.map((r, i) => (
                <li key={r.name} role="option" aria-selected={false} aria-disabled={!r.open}>
                  <button
                    type="button"
                    disabled={!r.open}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(r)}
                    className={`flex h-[34px] w-full items-center justify-between rounded-[7px] px-2.5 text-left text-[14px] ${
                      r.open ? (i === 0 ? "bg-pale" : "hover:bg-pale") : "cursor-not-allowed text-[#8a948d]"
                    }`}
                  >
                    <span>{r.name}</span>
                    <span className="text-[11px] font-medium">{r.open ? "Pilot" : "Belum dibuka"}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
          </AnimatePresence>
        </div>

        {/* Slider */}
        <div className="mt-7">
          <div className="flex justify-between text-[14px]">
            <label htmlFor={`${listId}-kg`} className="text-muted">
              Kebutuhan kain per bulan
            </label>
            <output htmlFor={`${listId}-kg`} className="font-medium">
              {kg} kg
            </output>
          </div>
          <div className="relative mt-3">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-[9.25px] h-[1.5px] bg-ink"
              style={{ width: `${pct}%` }}
            />
            <input
              id={`${listId}-kg`}
              type="range"
              min={10}
              max={500}
              step={10}
              value={kg}
              onChange={(e) => setKg(Number(e.target.value))}
              className="range-demo relative"
            />
          </div>
        </div>

        {/* Tabel */}
        <dl className="mt-7 border-y border-[var(--line)] [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:gap-4 [&>div]:py-4 [&>div+div]:border-t [&>div+div]:border-[var(--line)]">
          <div>
            <dt className="text-[14px] text-muted">
              Lot tersedia{region ? ` di ${region.name}` : ""}
            </dt>
            <dd className="font-display text-[22px] tabular-nums md:text-[24px]">
              <Counter value={region?.lotKg ?? null} format={(n) => `${n} kg`} />
            </dd>
          </div>
          <div>
            <dt className="text-[14px] text-muted">Harga tetap regional</dt>
            <dd className="font-display text-[22px] tabular-nums md:text-[24px]">
              <Counter
                value={region?.pricePerKg ?? null}
                format={(n) => `${rupiah(n)} / kg`}
                empty="Rp — / kg"
              />
            </dd>
          </div>
          <div>
            <dt className="text-[14px] text-muted">
              Perkiraan biaya ({kg} kg × {region?.pricePerKg ? rupiah(region.pricePerKg) : "harga tetap"})
            </dt>
            <dd className="font-display text-[22px] tabular-nums md:text-[24px]">
              <Counter value={cost} format={rupiah} />
            </dd>
          </div>
        </dl>

        <div className="mt-7 flex gap-2">
          <Link
            href="/masuk"
            className="flex items-center bg-teal px-[22px] py-[17px] text-[14px] font-medium text-white transition-colors hover:bg-[#083f3c]"
          >
            Daftar sebagai UMKM
          </Link>
          <Link
            href="/masuk"
            aria-label="Menuju halaman daftar"
            className="flex size-[52px] items-center justify-center bg-teal text-[18px] text-white transition-colors hover:bg-[#083f3c]"
          >
            ↗
          </Link>
        </div>
        <p className="mt-6 text-[14px] leading-[1.45] text-muted">
          {region
            ? "Angka contoh untuk demo, bukan harga pasar. Biaya = kebutuhan × harga tetap regional."
            : "Angka muncul setelah survei harga di wilayah percobaan. Bukan penawaran."}
        </p>
      </div>

      {/* Foto + penanda kebutuhan */}
      <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-[2px] lg:min-h-[560px]">
        <Image
          src="/images/umkm.png"
          alt="Meja potong penjahit berisi kain dan pola"
          fill
          sizes="(min-width: 1024px) 700px, 100vw"
          className="object-cover"
        />
        <AnimatePresence>
          {region && (
            <motion.div
              key="penanda"
              aria-hidden="true"
              className="absolute left-[23.6%] top-[32.5%] border border-dashed border-white"
              initial={{ opacity: 0, width: "0%", height: "0%" }}
              animate={{
                opacity: 1,
                width: `${52.7 * f}%`,
                height: `${58 * f}%`,
                transition: { type: "spring", stiffness: 170, damping: 26 },
              }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <span className="absolute -top-[26px] left-0 whitespace-nowrap bg-white/90 px-2.5 py-1 text-[12px] md:text-[13px]">
                {region.name} · {kg} kg
              </span>
              {[
                [100, 38],
                [52, 78],
                [90, 74],
              ].map(([x, y], i) => (
                <motion.span
                  key={i}
                  className="absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-ink"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, transition: { delay: 0.35 + i * 0.1, ease: EASE, duration: 0.4 } }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
