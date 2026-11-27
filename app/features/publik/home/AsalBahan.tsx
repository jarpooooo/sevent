"use client";

import { AnimatePresence, m as motion, useInView } from "motion/react";
import { useSafeReducedMotion } from "../../../components/motion/useSafeReducedMotion";
import Image from "next/image";
import { useRef, useState } from "react";

const EASE = [0.2, 0, 0, 1] as const;
const EASE_CSS = "cubic-bezier(0.2, 0, 0, 1)";
const COLS = 9;
const ROWS = 6;

/** Titik stok menyala bergelombang dari pojok kiri atas, sekali saat kartu terlihat. */
function StockDots() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduce = useSafeReducedMotion();
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="mt-auto grid grid-cols-9 gap-x-[clamp(14px,3vw,36px)] gap-y-9 pt-6"
      style={{ maxWidth: 368 }}
    >
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        return (
          <span
            key={i}
            className="size-[6px] rounded-full bg-dot-stock"
            style={{
              opacity: seen ? 1 : 0,
              transform: reduce ? undefined : `scale(${seen ? 1 : 0.8})`,
              transition: `opacity 0.45s ${EASE_CSS} ${seen ? 0.08 + (r + c) * 0.04 : 0}s, transform 0.45s ${EASE_CSS} ${seen ? 0.08 + (r + c) * 0.04 : 0}s`,
            }}
          />
        );
      })}
    </div>
  );
}

type OrderStage = {
  code: string;
  label: string;
  note: string;
};

/** Tahapan perjalanan pesanan: UMKM transfer langsung ke pabrik, lalu konfirmasi penerimaan. */
const ORDER_STAGES: OrderStage[] = [
  {
    code: "01",
    label: "Dibayar",
    note: "UMKM transfer langsung ke rekening pabrik dan mengunggah bukti pembayaran.",
  },
  {
    code: "02",
    label: "Disiapkan",
    note: "Pabrik menimbang lot dan mengirim bukti foto beserta dokumen keluar.",
  },
  {
    code: "03",
    label: "Dikirim",
    note: "Lot menuju alamat UMKM atau siap diambil langsung di gudang pabrik.",
  },
  {
    code: "04",
    label: "Diterima",
    note: "Pembeli mengonfirmasi barang tiba. Komplain terbuka 48 jam, lalu transaksi selesai.",
  },
];

/**
 * Ledger 4 tahap transaksi bergaya editorial-hairline (selaras dengan tabel UmkmDemo dan DescentBar).
 * Pengunjung dapat mengetuk tiap tahap untuk membaca apa yang terjadi pada dana dan barang.
 */
function OrderLedger() {
  const [active, setActive] = useState(2);
  const reduce = !!useSafeReducedMotion();
  const progress = (active + 1) / ORDER_STAGES.length;

  return (
    <div className="mt-auto pt-6">
      <ol
        aria-label="Tahap perjalanan status pesanan"
        className="border-y border-on-dark/20 divide-y divide-on-dark/15"
      >
        {ORDER_STAGES.map((stage, i) => {
          const isCurrent = i === active;
          const isPassed = i < active;
          const stateText = isCurrent ? "Aktif" : isPassed ? "Selesai" : "Berikutnya";

          return (
            <li key={stage.code}>
              <button
                type="button"
                aria-expanded={isCurrent}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => setActive(i)}
                className="flex min-h-[44px] w-full items-center justify-between gap-4 py-3 text-left transition-colors duration-150 hover:text-on-dark focus-visible:outline-on-dark"
              >
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`size-[6px] shrink-0 transition-colors duration-200 ${
                      isCurrent
                        ? "bg-accent"
                        : isPassed
                          ? "bg-on-dark/70"
                          : "border border-on-dark/40 bg-transparent"
                    }`}
                  />
                  <span className="text-[12px] tabular-nums text-on-dark-muted">{stage.code}</span>
                  <span
                    className={`text-[15px] leading-5 transition-colors duration-150 ${
                      isCurrent
                        ? "font-semibold text-on-dark"
                        : isPassed
                          ? "font-medium text-on-dark-soft"
                          : "font-normal text-on-dark-muted"
                    }`}
                  >
                    {stage.label}
                  </span>
                </span>
                <span
                  className={`text-[12px] transition-colors duration-150 ${
                    isCurrent ? "font-medium text-on-dark" : "text-on-dark-muted"
                  }`}
                >
                  {stateText}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isCurrent && (
                  <motion.div
                    key={stage.code}
                    initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="pb-3.5 pl-[42px] pr-2 text-[13px] leading-[1.45] text-on-dark-soft">
                      {stage.note}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <div className="pt-4">
        <span aria-hidden="true" className="relative block h-[2px] w-full bg-on-dark/20">
          <motion.span
            className="absolute inset-0 origin-left bg-accent"
            initial={false}
            animate={{ scaleX: progress }}
            transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
          />
        </span>
        <div className="mt-2.5 flex items-center justify-between gap-2 text-[12px] text-on-dark-muted">
          <span>Ketuk tahap untuk melihat rincian</span>
          <span className="tabular-nums text-on-dark-soft">
            Tahap {active + 1} dari {ORDER_STAGES.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AsalBahan() {
  return (
    <section
      aria-label="Asal bahan"
      className="mx-auto max-w-[1440px] px-5 pb-20 pt-6 sm:px-10 md:pb-[120px] md:pt-10"
    >
      <h2 className="font-display text-balance text-[clamp(34px,4.9vw,56px)] leading-[1.04] tracking-[-0.03em]">
        Kamu tahu bahannya datang dari mana.
      </h2>

      <div className="mt-10 grid gap-4 md:mt-12 lg:grid-cols-3 lg:items-stretch">
        {/* Asal yang jelas */}
        <article className="flex flex-col gap-3.5 rounded-[2px] bg-brand-soft p-7 lg:min-h-[580px]">
          <h3 className="font-display text-[clamp(26px,2.5vw,34px)] leading-[1.1] tracking-[-0.02em]">
            Asal yang jelas.
          </h3>
          <p className="text-[15px] leading-[22px] text-text-muted">
            Setiap lot mencantumkan pabrik asal dan daerahnya, jadi sumber bahan terlihat sebelum kamu
            membeli.
          </p>
          <StockDots />
        </article>

        {/* Harga yang jelas */}
        <article className="flex flex-col gap-[18px] lg:min-h-[580px]">
          <div className="relative h-[280px] overflow-hidden rounded-[2px] sm:h-[340px]">
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.06 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <Image
                src="/images/handoff.webp"
                alt="Serah terima kain denim antara dua orang"
                fill
                sizes="(min-width: 1024px) 450px, 100vw"
                className="object-cover"
              />
            </motion.div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[2px] ring-1 ring-inset ring-black/10"
            />
          </div>
          <h3 className="font-display text-[clamp(26px,2.5vw,34px)] leading-[1.1] tracking-[-0.02em]">
            Harga yang jelas.
          </h3>
          <p className="text-[15px] leading-[22px] text-text-muted">
            Harga tetap atau harga lelang terlihat sebelum membeli, lengkap dengan total sampai
            tempatmu.
          </p>
        </article>

        {/* Status */}
        <article className="flex flex-col gap-3.5 rounded-[2px] bg-brand p-7 text-on-dark lg:min-h-[580px]">
          <h3 className="font-display text-[clamp(26px,2.5vw,34px)] leading-[1.1] tracking-[-0.02em]">
            Statusnya selalu terlihat.
          </h3>
          <p className="text-[15px] leading-[22px] text-on-dark-muted">
            Pantau pesananmu dari dipesan sampai bahan tiba. Tim kami yang memperbarui statusnya.
          </p>
          <OrderLedger />
        </article>
      </div>
    </section>
  );
}
