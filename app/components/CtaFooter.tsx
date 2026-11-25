"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function CtaFooter() {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer id="mulai" className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-10">
      <div className="relative min-h-[680px] overflow-hidden rounded-[2px] bg-ink lg:min-h-[760px]">
        <Image
          src="/images/cta.png"
          alt=""
          fill
          sizes="(min-width: 1440px) 1360px, 100vw"
          className="object-cover"
        />
        <div className="relative flex min-h-[500px] flex-col bg-[rgba(94,123,126,0.78)] p-6 backdrop-blur-[14px] md:p-7 lg:min-h-[500px]">
          <div className="flex items-center gap-2.5 text-white">
            <span aria-hidden="true" className="size-5 rounded-full border-2 border-white" />
            <span className="font-display text-[20px] tracking-[-0.02em]">ClearanceLoop</span>
          </div>

          <h2 className="font-display mt-12 text-[clamp(40px,5.7vw,64px)] leading-[1.03] tracking-[-0.035em] text-white md:mt-[72px]">
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
          <p className="mt-6 max-w-[480px] text-[16px] leading-6 text-[#e6f0ee]">
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
              className="h-[52px] min-w-0 flex-1 rounded-[2px] bg-white/[0.28] px-[18px] text-[14px] text-white outline-none placeholder:text-white focus:bg-white/40"
            />
            <motion.button
              type="submit"
              aria-label="Kirim"
              whileTap={{ scale: 0.94 }}
              className="flex size-[52px] shrink-0 items-center justify-center rounded-[2px] bg-white text-[18px] transition-colors hover:bg-pale"
            >
              ↗
            </motion.button>
          </form>
          <p role="status" className="mt-3 min-h-5 text-[14px] text-white">
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
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 pt-5 text-[14px] text-muted sm:flex-row">
        <p>© 2026 ClearanceLoop (nama kerja)</p>
        <p>Dibuat untuk SEVENT X Software Development</p>
      </div>
    </footer>
  );
}
