"use client";

import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { m as motion } from "motion/react";
import Image from "next/image";
import { useId } from "react";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";

const EASE = [0.16, 1, 0.3, 1] as const;
const btn =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[2px] border border-brand px-3 text-[13px] font-medium text-brand transition-colors hover:bg-brand-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand";

/**
 * Satu slot foto: kotak placeholder dulu, lalu tombol di bawahnya untuk memilih foto.
 * Setelah ada foto, kotak menampilkan foto dan tombol berubah jadi "Ganti" dan "Hapus".
 */
export default function FotoSlot({
  label,
  hint,
  url,
  onFile,
  onClear,
  height = 112,
  tall = false,
}: {
  label: string;
  hint?: string;
  url: string | null;
  onFile: (f: File | undefined) => void;
  onClear: () => void;
  height?: number;
  tall?: boolean;
}) {
  const id = useId();
  const reduce = useSafeReducedMotion();
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div
        className={`relative overflow-hidden rounded-[2px] ${url ? "bg-inverse" : "border border-dashed border-border-strong bg-brand-soft/50"}`}
        style={{ height }}
      >
        {url ? (
          <motion.div
            key={url}
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Image unoptimized src={url} alt={`${label}, foto yang kamu unggah`} fill sizes="320px" className="object-cover" />
          </motion.div>
        ) : (
          <div aria-hidden="true" className="absolute inset-0 grid place-items-center text-text-muted">
            <ImagePlus className={tall ? "size-8" : "size-6"} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[12px] font-medium leading-[15px]">{label}</p>
        {hint && !url && <p className="text-[12px] leading-[15px] text-text-muted">{hint}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <label htmlFor={id} className={btn}>
          {url ? <RefreshCw aria-hidden="true" className="size-3.5" strokeWidth={1.9} /> : <ImagePlus aria-hidden="true" className="size-3.5" strokeWidth={1.9} />}
          {url ? "Ganti foto" : "Pilih foto"}
          <input
            id={id}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = ""; // memilih berkas yang sama setelah dihapus tetap terdeteksi
            }}
          />
        </label>
        {url && (
          <button type="button" onClick={onClear} className="inline-flex h-9 items-center gap-1.5 rounded-[2px] px-2.5 text-[13px] font-medium text-text-muted transition-colors hover:text-text">
            <Trash2 aria-hidden="true" className="size-3.5" strokeWidth={1.9} />
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}
