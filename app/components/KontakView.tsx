"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import MosaicCover from "./MosaicCover";

const ROLES = ["UMKM penjahit", "Pabrik", "Lainnya"] as const;

const INFO = [
  { k: "Email", v: "halo@clearanceloop.id" },
  { k: "WhatsApp", v: "+62 8xx-xxxx-xxxx" },
  { k: "Daerah awal", v: "Pilot regional, daerah menyusul" },
];

const KEEPS = [
  { x0: 0, x1: 0.45, y0: 0.08, y1: 0.82 }, // teks kiri
  { x0: 0.6, x1: 1, y0: 0.06, y1: 0.7 }, // form
];

const field =
  "h-12 w-full rounded-[12px] bg-card px-3.5 text-[16px] outline-none placeholder:text-text-muted focus:ring-2 focus:ring-brand";

export default function KontakView() {
  const [role, setRole] = useState<(typeof ROLES)[number]>("UMKM penjahit");
  const [sent, setSent] = useState(false);

  return (
    <section aria-label="Kontak" className="relative bg-surface pt-[72px] md:min-h-svh">
      <div aria-hidden="true" className="absolute inset-0 hidden bg-inverse md:block">
        <Image src="/images/kontak.webp" alt="" fill priority sizes="100vw" className="object-cover" />
        <MosaicCover
          cols={12}
          rows={8}
          openRatio={0.3}
          seed={5}
          keeps={KEEPS}
          origin={{ x: 0.5, y: 0.1 }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-10 sm:px-10 md:grid-cols-[1fr_480px] md:items-center md:gap-16 md:px-[60px] md:py-16 lg:gap-[200px]">
        <div>
          <h1 className="font-display text-[clamp(44px,5vw,68px)] leading-[1.03] tracking-[-0.04em]">
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              >
                Bicara dengan
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.47 }}
              >
                kami.
              </motion.span>
            </span>
          </h1>
          <p className="mt-6 max-w-[430px] text-[18px] leading-7 text-text-muted">
            Penjahit yang cari bahan, atau pabrik yang punya sisa produksi: tulis saja. Kami balas lewat
            WhatsApp atau email.
          </p>
          <dl className="mt-10 flex flex-col gap-[18px] md:mt-[88px]">
            {INFO.map((i) => (
              <div key={i.k}>
                <dt className="text-[13px] font-medium text-text-muted">{i.k}</dt>
                <dd className="font-display text-[clamp(19px,1.8vw,23px)] tracking-[-0.02em]">{i.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <form
          className="flex flex-col gap-[18px] rounded-[24px] bg-brand-soft p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <h2 className="font-display text-[28px] tracking-[-0.02em]">Kirim pesan</h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="k-nama" className="text-[14px] font-medium">
              Nama
            </label>
            <input id="k-nama" required placeholder="Nama lengkap" className={field} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="k-kontak" className="text-[14px] font-medium">
              Email atau WhatsApp
            </label>
            <input id="k-kontak" required placeholder="Kontak yang bisa dihubungi" className={field} />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-[14px] font-medium">Kamu sebagai</legend>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                  className={`relative rounded-full px-4 py-2.5 text-[15px] font-medium transition-colors duration-300 ${
                    role === r ? "text-on-dark" : "bg-card text-text hover:bg-card/70"
                  }`}
                >
                  {role === r && (
                    <motion.span
                      layoutId="kontak-peran"
                      className="absolute inset-0 rounded-full bg-brand"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{r}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor="k-pesan" className="text-[14px] font-medium">
              Pesan
            </label>
            <textarea
              id="k-pesan"
              rows={4}
              placeholder="Ceritakan kebutuhan atau stokmu"
              className="w-full resize-none rounded-[12px] bg-card p-3.5 text-[16px] outline-none placeholder:text-text-muted focus:ring-2 focus:ring-brand"
            />
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="w-fit rounded-full bg-brand px-7 py-3.5 text-[16px] font-medium text-on-dark transition-colors hover:bg-brand-hover"
          >
            Kirim pesan
          </motion.button>
          <p role="status" className="min-h-5 text-[14px] text-text-muted">
            <AnimatePresence mode="wait">
              {sent && (
                <motion.span
                  key="ok"
                  className="inline-block"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  Pesan tercatat di halaman ini. Pengiriman sungguhan belum tersambung (demo).
                </motion.span>
              )}
            </AnimatePresence>
          </p>
        </form>
      </div>
    </section>
  );
}
