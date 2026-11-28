"use client";

import { MapPin, TrendingDown } from "lucide-react";
import { AnimatePresence, m as motion } from "motion/react";
import { useId } from "react";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";
import { inputBox, panel } from "../../components/ui/styles";
import { AUCTION_STEP_S, AUCTION_STEPS, AUCTION_TOTAL_S, COMMISSION_RATE, RESERVATION_TTL_S } from "../../lib/domain/pricing";
import { rupiah } from "../../lib/format";

const EASE = [0.16, 1, 0.3, 1] as const;

export type Jenis = "tetap" | "lelang";
export type Kanal = {
  jenis: Jenis;
  /** harga tetap per kg */
  harga: string;
  /** lelang: harga awal dan batas bawah (batas bawah tidak terlihat UMKM) */
  awal: string;
  bawah: string;
  /** harga tetap: bila belum laku, naik ke lelang nasional */
  naik: boolean;
  /** lelang: bila tidak laku setelah 72 jam */
  gagal: "ulang" | "tetap" | "sendiri";
  /** kalkulator batas bawah: penerimaan bersih per kg dari pengepul, dan biaya tambahan per kg */
  hp: string;
  b: string;
};

export const KANAL_AWAL: Kanal = { jenis: "tetap", harga: "Rp12.000", awal: "Rp8.000", bawah: "Rp6.000", naik: true, gagal: "ulang", hp: "", b: "" };

const num = (s: string) => Number(s.replace(/\D/g, "")) || 0;

/** Pesan galat per isian. Kosong berarti siap dikirim. */
export function kanalErrors(k: Kanal): Partial<Record<"harga" | "awal" | "bawah", string>> {
  const e: Partial<Record<"harga" | "awal" | "bawah", string>> = {};
  if (k.jenis === "tetap") {
    if (num(k.harga) <= 0) e.harga = "Isi harga per kg.";
  } else {
    if (num(k.awal) <= 0) e.awal = "Isi harga awal.";
    if (num(k.bawah) <= 0) e.bawah = "Isi batas bawah.";
    else if (num(k.bawah) >= num(k.awal)) e.bawah = "Batas bawah harus lebih rendah dari harga awal.";
  }
  return e;
}

/** Teks ringkas untuk daftar lot dan pratinjau. */
export const kanalLabel = (k: Kanal) => (k.jenis === "tetap" ? "Regional, tetap" : "Lelang terbalik");
export const kanalHarga = (k: Kanal) => (k.jenis === "tetap" ? `${k.harga} / kg` : `Dari ${k.awal} / kg`);

const OPSI: { v: Jenis; t: string; d: string; Icon: typeof MapPin }[] = [
  { v: "tetap", t: "Harga tetap regional", d: "Satu harga per kg. Terlihat UMKM dalam radius 50 km dari pabrik.", Icon: MapPin },
  { v: "lelang", t: "Lelang terbalik nasional", d: "Harga turun tiap 6 jam selama 72 jam. Terlihat UMKM di seluruh daerah yang sudah dibuka.", Icon: TrendingDown },
];

/** Tangga harga lelang: 11 langkah dari harga awal ke batas bawah, dibulatkan ke Rp100 (sama dengan hitungan di Katalog). */
const ladder = (awal: number, bawah: number) =>
  Array.from({ length: AUCTION_STEPS }, (_, i) => Math.round((awal - ((awal - bawah) * i) / (AUCTION_STEPS - 1)) / 100) * 100);

/**
 * Pilihan kanal jual: harga tetap regional atau lelang terbalik nasional. Satu lot memilih satu kanal.
 * Angka hanya contoh demo atau isian pabrik; tidak ada harga pasar bawaan.
 */
export default function KanalJual({ k, onChange, errors }: { k: Kanal; onChange: (n: Kanal) => void; errors: ReturnType<typeof kanalErrors> }) {
  const id = useId();
  const reduce = useSafeReducedMotion();
  const set = <K extends keyof Kanal>(key: K, v: Kanal[K]) => onChange({ ...k, [key]: v });
  const harga = num(k.harga);
  const awal = num(k.awal);
  const bawah = num(k.bawah);
  const rekomendasi = k.hp.trim() ? Math.ceil((num(k.hp) + num(k.b)) / (1 - COMMISSION_RATE)) : 0;
  const tangga = awal > bawah && bawah > 0 ? ladder(awal, bawah) : [];

  return (
    <section aria-label="Kanal jual" className={`${panel} flex flex-col gap-5 p-[25px]`}>
      <div className="flex flex-col gap-1">
        <h2 className="text-[18px] font-medium">Kanal jual</h2>
        <p className="text-[13px] text-text-muted">Pilih satu kanal untuk lot ini. Angka contoh demo.</p>
      </div>

      <div role="radiogroup" aria-label="Kanal jual" className="grid gap-3 sm:grid-cols-2">
        {OPSI.map((o) => {
          const on = k.jenis === o.v;
          return (
            <label
              key={o.v}
              className={`relative flex cursor-pointer flex-col gap-2 rounded-[2px] border p-4 transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
                on ? "border-brand text-on-dark" : "border-line bg-card hover:bg-card/70"
              }`}
            >
              <input type="radio" name={`${id}-kanal`} value={o.v} checked={on} onChange={() => set("jenis", o.v)} className="sr-only" />
              {on && (
                <motion.span layoutId="kanal-jual" className="absolute inset-0 rounded-[2px] bg-brand" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              )}
              <span className="relative flex items-center gap-2.5">
                <o.Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                <span className="text-[15px] font-medium">{o.t}</span>
              </span>
              <span className={`relative text-[13px] leading-5 ${on ? "text-on-dark-muted" : "text-text-muted"}`}>{o.d}</span>
            </label>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {k.jenis === "tetap" ? (
          <motion.div
            key="tetap"
            className="flex flex-col gap-4"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-harga`} className="text-[12px] font-medium text-text-muted">
                Harga per kg
              </label>
              <input id={`${id}-harga`} className={`${inputBox} sm:max-w-[260px]`} inputMode="numeric" value={k.harga} onChange={(e) => set("harga", e.target.value)} aria-invalid={!!errors.harga} />
              {errors.harga ? (
                <p role="alert" className="text-[13px] text-text-soft">
                  {errors.harga}
                </p>
              ) : (
                <p className="text-[13px] text-text-muted">
                  Hasil bersih untukmu sekitar <span className="font-medium text-text">{rupiah(Math.round(harga * (1 - COMMISSION_RATE)))}</span> per kg, setelah komisi 2% yang ditanggung pabrik.
                </p>
              )}
            </div>
            <label className="flex w-fit cursor-pointer items-start gap-2.5 text-[14px] leading-5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand">
              <input type="checkbox" checked={k.naik} onChange={(e) => set("naik", e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-brand)]" />
              <span>
                Jika belum laku, naikkan ke lelang terbalik nasional
                <span className="block text-[13px] text-text-muted">Stok yang tersisa ditawarkan lagi ke UMKM di luar radius 50 km.</span>
              </span>
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="lelang"
            className="flex flex-col gap-5"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${id}-awal`} className="text-[12px] font-medium text-text-muted">
                  Harga awal per kg
                </label>
                <input id={`${id}-awal`} className={inputBox} inputMode="numeric" value={k.awal} onChange={(e) => set("awal", e.target.value)} aria-invalid={!!errors.awal} />
                {errors.awal && (
                  <p role="alert" className="text-[13px] text-text-soft">
                    {errors.awal}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${id}-bawah`} className="text-[12px] font-medium text-text-muted">
                  Batas bawah per kg
                </label>
                <input id={`${id}-bawah`} className={inputBox} inputMode="numeric" value={k.bawah} onChange={(e) => set("bawah", e.target.value)} aria-invalid={!!errors.bawah} />
                {errors.bawah ? (
                  <p role="alert" className="text-[13px] text-text-soft">
                    {errors.bawah}
                  </p>
                ) : (
                  <p className="text-[13px] text-text-muted">Tidak terlihat UMKM. Pabrik yang menetapkan batas akhir.</p>
                )}
              </div>
            </div>

            {tangga.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[12px] font-medium text-text-muted">Tangga harga, {AUCTION_STEPS} langkah</p>
                <ul aria-label="Tangga harga lelang" className="flex h-[72px] items-end gap-1">
                  {tangga.map((p, i) => (
                    <motion.li
                      key={i}
                      title={`Langkah ${i + 1}: ${rupiah(p)}`}
                      className="flex-1 bg-accent"
                      style={{ height: `${Math.max(14, (p / tangga[0]) * 100)}%`, originY: 1 }}
                      initial={reduce ? false : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, ease: EASE, delay: i * 0.04 }}
                    />
                  ))}
                </ul>
                <p className="flex justify-between text-[12px] tabular-nums text-text-muted">
                  <span>{rupiah(tangga[0])}</span>
                  <span>turun tiap {AUCTION_STEP_S / 3600} jam, total {AUCTION_TOTAL_S / 3600} jam</span>
                  <span>{rupiah(tangga[tangga.length - 1])}</span>
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-[2px] border border-line bg-card p-4">
              <p className="text-[14px] font-medium">Rekomendasi batas bawah</p>
              <p className="text-[13px] leading-5 text-text-muted">
                Batas bawah = (penerimaan bersih dari pengepul + biaya tambahan) dibagi (1 − 2%). Isi dengan angkamu sendiri; ini bukan harga pasar.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`${id}-hp`} className="text-[12px] font-medium text-text-muted">
                    Penerimaan dari pengepul per kg
                  </label>
                  <input id={`${id}-hp`} className={inputBox} inputMode="numeric" value={k.hp} onChange={(e) => set("hp", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`${id}-b`} className="text-[12px] font-medium text-text-muted">
                    Biaya sortir, QC, kemas, kirim per kg
                  </label>
                  <input id={`${id}-b`} className={inputBox} inputMode="numeric" value={k.b} onChange={(e) => set("b", e.target.value)} />
                </div>
              </div>
              {rekomendasi > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[14px]">
                    Rekomendasi: <span className="font-medium tabular-nums">{rupiah(rekomendasi)}</span> per kg
                  </p>
                  <button type="button" onClick={() => set("bawah", rupiah(rekomendasi))} className="h-9 rounded-[2px] border border-brand px-3 text-[13px] font-medium text-brand transition-colors hover:bg-brand-soft">
                    Pakai rekomendasi
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-gagal`} className="text-[12px] font-medium text-text-muted">
                Jika tidak ada pembeli setelah 72 jam
              </label>
              <select id={`${id}-gagal`} className={`${inputBox} sm:max-w-[360px]`} value={k.gagal} onChange={(e) => set("gagal", e.target.value as Kanal["gagal"])}>
                <option value="ulang">Lelang ulang</option>
                <option value="tetap">Tawarkan harga tetap regional</option>
                <option value="sendiri">Kembali ke saya, saya putuskan sendiri</option>
              </select>
            </div>
            <p className="text-[13px] leading-5 text-text-muted">
              Pembeli mengunci harga dan stok {RESERVATION_TTL_S / 60} menit saat memesan. Stok yang dipesan sebagian tetap berkurang selama lelang berjalan.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
