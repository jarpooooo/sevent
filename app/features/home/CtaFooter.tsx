"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "../../components/ui/icons";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function CtaFooter() {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer
      id="mulai"
      className="relative min-h-[680px] overflow-hidden bg-inverse lg:h-svh lg:min-h-[640px]"
    >
      <Image src="/images/cta.webp" alt="" fill sizes="100vw" className="object-cover" />
      {/* Panel kaca: tinggi penuh di mobile, ~80% di desktop supaya foto gudang tetap terlihat di bawah */}
      <div className="relative flex min-h-[680px] flex-col bg-glass backdrop-blur-[14px] lg:h-[80%] lg:min-h-0">
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-6 sm:px-10 md:py-8">
          <div className="flex items-center gap-2.5 text-on-dark">
            <span aria-hidden="true" className="size-5 rounded-full border-2 border-on-dark" />
            <span className="font-display text-[20px] tracking-[-0.02em]">ClearanceLoop</span>
          </div>

          <h2 className="font-display mt-12 text-[clamp(40px,5.7vw,64px)] leading-[1.03] tracking-[-0.035em] text-on-dark md:mt-[72px]">
            {["Cari bahan?", "Mulai dari satu lot."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  whileInView={{ y: "0%" }}
                  viewport={{ once: true, margin: "0px 0px -20% 0px" }}
                  transition={{ duration: 0.9, ease: EASE, delay: i * 0.12 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h2>
          <p className="mt-6 max-w-[480px] text-[16px] leading-6 text-on-dark-soft">
            Tinggalkan emailmu dan kami kabari saat lot pertama di daerahmu terbuka.
          </p>

          <form
            className="mt-8 flex max-w-[460px] gap-2"
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
              whileTap={{ scale: 0.94 }}
              className="flex size-[52px] shrink-0 items-center justify-center rounded-[2px] bg-card text-[18px] transition-colors hover:bg-brand-soft"
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
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  Terima kasih. Kami kabari saat lot pertama di daerahmu terbuka.
                </motion.span>
              )}
            </AnimatePresence>
          </p>

          {/* Teks penutup ada di dalam panel, di bawah kolom email */}
          <div className="mt-auto flex flex-col justify-between gap-2 pt-10 text-[14px] text-on-dark-soft sm:flex-row">
            <p>© 2026 ClearanceLoop (nama kerja)</p>
            <p>Dibuat untuk SEVENT X Software Development</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
