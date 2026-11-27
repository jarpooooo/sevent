"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { KainaraWordmark } from "../../../components/brand/KainaraLogo";
import { Icon } from "../../../components/ui/icons";

const EASE = [0.2, 0, 0, 1] as const;

export default function CtaFooter() {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer
      id="mulai"
      className="relative flex min-h-[640px] flex-col overflow-hidden bg-inverse lg:min-h-[calc(100svh-72px)]"
    >
      <Image src="/images/cta.webp" alt="" fill sizes="100vw" className="object-cover" />

      {/* Panel kaca: tinggi mengikuti konten (tidak pernah meluber) agar baris penutup tetap rapi di dalam panel */}
      <div className="relative flex flex-col bg-glass backdrop-blur-[14px]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col px-5 pb-7 pt-10 sm:px-10 md:pb-8 md:pt-12">
          <div className="flex items-center">
            <KainaraWordmark variant="dark" className="h-[26px] w-auto" />
          </div>

          <h2 className="font-display mt-10 text-[clamp(38px,5.2vw,60px)] leading-[1.04] tracking-[-0.035em] text-on-dark md:mt-14">
            {["Cari bahan?", "Mulai dari satu lot."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  whileInView={{ y: "0%" }}
                  viewport={{ once: true, margin: "0px 0px -20% 0px" }}
                  transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h2>
          <p className="mt-5 max-w-[480px] text-[16px] leading-6 text-on-dark-soft">
            Tinggalkan emailmu dan kami kabari saat lot pertama di daerahmu terbuka.
          </p>

          <form
            className="mt-7 flex max-w-[460px] gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (value.trim()) setSent(true);
            }}
          >
            <label htmlFor="kontak-daftar" className="sr-only">
              Email usaha atau WhatsApp
            </label>
            <input
              id="kontak-daftar"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setSent(false);
              }}
              placeholder="Email usaha atau WhatsApp"
              className="h-[52px] min-w-0 flex-1 rounded-[2px] bg-glass-field px-[18px] text-[14px] text-on-dark outline-none placeholder:text-on-dark focus:bg-glass-field-focus"
            />
            <motion.button
              type="submit"
              aria-label="Kirim"
              whileTap={{ scale: 0.96 }}
              className="flex size-[52px] shrink-0 items-center justify-center rounded-[2px] bg-card text-[18px] text-text transition-colors hover:bg-brand-soft"
            >
              <Icon name="arrow-up-right" size={20} />
            </motion.button>
          </form>
          <p role="status" className="mt-3 min-h-5 text-[14px] text-on-dark">
            <AnimatePresence mode="wait">
              {sent && (
                <motion.span
                  key="ok"
                  className="inline-block"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  Terima kasih. Kami kabari saat lot pertama di daerahmu terbuka.
                </motion.span>
              )}
            </AnimatePresence>
          </p>

          {/* Baris penutup terkunci rapi di dalam panel dengan garis pemisah tipis */}
          <div className="mt-8 flex flex-col justify-between gap-2 border-t border-on-dark/15 pt-5 text-[14px] text-on-dark-soft sm:flex-row sm:items-center md:mt-10">
            <p>© 2026 Kainara</p>
            <p>Pasar B2B sisa produksi tekstil untuk UMKM dan pabrik</p>
          </div>
        </div>
      </div>

      {/* Pita foto gudang di bagian bawah footer: selalu tampil bersih di bawah panel kaca */}
      <div aria-hidden="true" className="min-h-[120px] flex-1" />
    </footer>
  );
}
