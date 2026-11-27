"use client";

import { m as motion } from "motion/react";
import Image from "next/image";
import MosaicCover from "../../components/mosaic/MosaicCover";
import MosaicLoop from "../../components/mosaic/MosaicLoop";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";
import UserAvatar from "../../components/ui/UserAvatar";
import type { Account, Role } from "../auth/session";

const EASE = [0.16, 1, 0.3, 1] as const;
const TILES = 20; // tiap ubin = 5%

const PHOTO: Record<Role, { src: string; pos: string; alt: string }> = {
  umkm: { src: "/images/umkm.webp", pos: "50% 40%", alt: "Penjahit UMKM bekerja dengan kain perca" },
  pabrik: { src: "/images/gudang.webp", pos: "50% 55%", alt: "Gudang pabrik tekstil" },
  admin: { src: "/images/hero.webp", pos: "50% 45%", alt: "Tumpukan material sisa tekstil" },
  exim: { src: "/images/hero.webp", pos: "50% 45%", alt: "Tumpukan material sisa tekstil" },
};

const ROLE_NOTE: Record<Role, string> = {
  umkm: "Semakin lengkap, semakin mudah pabrik dan admin memercayai pesananmu.",
  pabrik: "Data ini tercetak di invoice dan laporan kepabeanan. Yang kosong tertulis \"menunggu\", bukan angka karangan.",
  admin: "Nama dan jabatan tercetak di kolom tanda tangan dokumen.",
  exim: "Nama dan jabatan tercetak di kolom pemeriksa pada dokumen.",
};

/**
 * Kepala halaman profil: identitas, status verifikasi, dan meteran kelengkapan berbentuk mozaik (satu ubin = 5%).
 * Foto di kanan dibuka oleh mozaik lalu "bernapas" pelan, sama seperti layar lain.
 */
export default function ProfilHero({
  a,
  role,
  name,
  business,
  pct,
  done,
  total,
  status,
  onLogout,
}: {
  a: Account;
  role: Role;
  name: string;
  business: string;
  pct: number;
  done: number;
  total: number;
  status: { tone: "ok" | "wait" | "idle"; text: string } | null;
  onLogout: () => void;
}) {
  const reduce = useSafeReducedMotion();
  const filled = Math.round((pct / 100) * TILES);
  const photo = PHOTO[role];
  return (
    <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch lg:gap-12">
      <div className="flex min-w-0 flex-col justify-between gap-10">
        <div className="flex items-start gap-5">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <UserAvatar photoURL={a.photoURL} initials={a.initials} sizeClass="size-[76px]" textClass="text-[24px]" />
          </motion.div>
          <div className="flex min-w-0 flex-col gap-3">
            <motion.h1
              className="font-display text-[clamp(34px,4.4vw,54px)] leading-[1.04] tracking-[-0.03em]"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
            >
              <span className="sr-only">Profil, </span>
              {name || a.name}
            </motion.h1>
            <p className="text-[16px] leading-6 text-text-muted">
              {business ? `${business}, ` : ""}
              {a.kind}
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-brand-soft px-3 py-1.5 text-[13px] font-medium text-brand">
                {a.provider === "google" ? "Masuk dengan Google" : "Akun demo"}
              </span>
              {status && (
                <span
                  className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${status.tone === "wait" ? "bg-warn-soft text-text" : status.tone === "ok" ? "bg-brand-soft text-brand" : "border border-line text-text-muted"}`}
                >
                  {status.text}
                </span>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="rounded-[2px] border border-border-strong px-4 py-1.5 text-[13px] font-medium transition-colors hover:bg-brand-soft"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3" aria-label="Kelengkapan profil">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-display text-[44px] leading-none tabular-nums tracking-[-0.03em] text-brand">
              {pct}
              <span className="text-[24px]">%</span>
            </p>
            <p className="text-right text-[13px] text-text-muted">
              {done} dari {total} isian terisi
            </p>
          </div>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Kelengkapan profil" className="flex gap-[3px]">
            {Array.from({ length: TILES }, (_, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className={`block h-4 flex-1 rounded-[2px] transition-colors duration-500 ${i < filled ? "bg-brand" : "bg-brand-soft"}`}
                initial={reduce ? false : { opacity: 0, scaleY: 0.3 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.25 + i * 0.03 }}
                style={{ originY: 1 }}
              />
            ))}
          </div>
          <p className="max-w-[520px] text-[13px] leading-5 text-text-muted">{ROLE_NOTE[role]}</p>
        </div>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-thumb-empty lg:aspect-auto lg:min-h-[300px]">
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width:1024px) 420px, 100vw" priority className="object-cover" style={{ objectPosition: photo.pos }} />
        <MosaicCover cols={7} rows={5} hidden seed={21} trigger="mount" startDelay={0.25} origin={{ x: 0.2, y: 0.8 }} className="absolute inset-0" />
        <MosaicLoop cols={7} rows={5} seed={22} line={1} slow={1.4} className="absolute inset-0" />
      </div>
    </header>
  );
}
