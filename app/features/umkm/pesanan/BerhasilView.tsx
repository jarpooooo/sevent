"use client";

import { m as motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MosaicCover from "../../../components/mosaic/MosaicCover";
import MosaicLoop from "../../../components/mosaic/MosaicLoop";
import { panel } from "../../../components/ui/styles";
import { num, rupiah } from "../../../lib/format";
import { etaOf } from "./eta";
import { ORDER_STEPS, useOrder } from "./orders";

const EASE = [0.16, 1, 0.3, 1] as const;

const stamp = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

/** Pembayaran berhasil: bukti transfer sudah masuk, pabrik menyiapkan lot. */
export default function BerhasilView() {
  const id = useSearchParams().get("id");
  const o = useOrder(id);

  if (!o) {
    return (
      <section className="pt-[72px]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-4 px-5 pb-24 pt-12 sm:px-10 lg:px-16">
          <h1 className="font-display text-[clamp(32px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">Pesanan tidak ditemukan</h1>
          <Link href="/pesanan-saya" className="rounded-[2px] bg-brand px-6 py-3.5 text-[14px] font-medium text-surface hover:bg-brand-hover">
            Lihat pesanan saya
          </Link>
        </div>
      </section>
    );
  }

  const steps = ORDER_STEPS(o.pickup);
  const total = o.qty * o.price;
  const paid = o.status >= 1;
  const eta = etaOf(new Date(o.paidAt ?? o.createdAt), o.pickup);
  const rows: [string, string][] = [
    ["Nomor pesanan", `#${o.id}`],
    ["Barang", `${o.title}, ${num(o.qty)} ${o.unit}`],
    ...(o.buyer ? ([["Penerima", `${o.buyer.person}${o.buyer.business ? `, ${o.buyer.business}` : ""}`], ["Telepon", o.buyer.phone]] as [string, string][]) : []),
    ["Penerimaan", o.pickup === "ambil" ? "Ambil sendiri di pabrik" : `Diantar ke ${o.address ?? "alamatmu"}`],
    ...(o.pickup === "kirim" && o.courier ? ([["Kurir", o.courier === "J&T" ? "J&T Express" : "JNE"]] as [string, string][]) : []),
    [eta.label, eta.range],
    ["Metode bayar", "Virtual account lewat PJP (simulasi)"],
    ["Nomor virtual account", o.va ?? "-"],
    ["Waktu bayar", stamp(o.paidAt)],
  ];

  return (
    <section aria-label="Pembayaran berhasil" className="pt-[72px]">
      <div className="mx-auto grid max-w-[1440px] items-start gap-10 px-5 pb-16 pt-9 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16 lg:px-16">
        <div className="flex min-w-0 flex-col gap-6">
          <motion.span
            aria-hidden="true"
            className={`grid size-14 place-items-center rounded-[2px] text-[26px] text-surface ${paid ? "bg-brand" : "bg-accent"}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {paid ? "✓" : "…"}
          </motion.span>
          <div className="flex flex-col gap-2.5">
            <h1 className="font-display text-[clamp(34px,4.4vw,52px)] leading-[1.05] tracking-[-0.03em]">
              {paid ? "Pembayaran berhasil" : "Pesanan dibuat"}
            </h1>
            <p className="max-w-[560px] text-[15px] leading-[22px] text-text-muted">
              {paid
                ? `${rupiah(total)} sudah masuk. PJP menahan dana sampai barang diterima, lalu meneruskannya ke pabrik. Pabrik sekarang menyiapkan lotmu.`
                : "Pesanan sudah dibuat, tetapi pembayaran ke virtual account belum masuk."}
            </p>
          </div>

          <dl className={`${panel} flex flex-col gap-3 p-[25px] text-[14px] leading-[17px]`}>
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-text-muted">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="-mt-3 max-w-[560px] text-[12px] leading-[15px] text-text-muted">{eta.note} Angka hari adalah contoh demo.</p>

          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-medium leading-[22px]">Selanjutnya</h2>
            <ol className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 xl:grid-cols-6">
              {steps.map((s, i) => {
                const state = i < o.status ? "done" : i === o.status ? "now" : "next";
                return (
                  <motion.li
                    key={s.t}
                    aria-current={state === "now" ? "step" : undefined}
                    className="flex flex-col gap-1.5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.07 }}
                  >
                    <span
                      aria-hidden="true"
                      className={`block h-2.5 rounded-[2px] ${state === "done" ? "bg-brand" : state === "now" ? "bg-accent" : "bg-brand-soft"}`}
                    />
                    <p className={`text-[13px] leading-4 ${state === "next" ? "text-text-muted" : "font-medium"}`}>{s.t}</p>
                    <p className="text-[12px] leading-[15px] text-text-muted">{s.d}</p>
                  </motion.li>
                );
              })}
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/pesanan-saya/detail?id=${encodeURIComponent(o.id)}`}
              className="h-12 content-center rounded-[2px] bg-brand px-7 text-[15px] font-medium text-surface transition-colors hover:bg-brand-hover"
            >
              Lihat pesanan
            </Link>
            {!paid && (
              <Link href={`/pesanan-saya/bayar?id=${encodeURIComponent(o.id)}`} className="text-[14px] font-medium text-brand underline underline-offset-4">
                Bayar sekarang
              </Link>
            )}
            <Link href="/katalog" className="text-[14px] font-medium text-brand underline underline-offset-4">
              Lanjut belanja
            </Link>
          </div>
          <p className="text-[12px] leading-[15px] text-text-muted">Waktu, nomor pesanan, dan angka adalah contoh demo untuk mock up.</p>
        </div>

        <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[2px] bg-thumb-empty lg:block">
          {o.photo && <Image src={o.photo} alt={o.alt ?? o.title} fill sizes="420px" className="object-cover" style={{ objectPosition: o.focus }} />}
          <MosaicCover cols={4} rows={5} hidden seed={13} trigger="mount" startDelay={0.2} origin={{ x: 0.5, y: 0.5 }} className="absolute inset-0" />
          <MosaicLoop cols={4} rows={5} seed={14} line={1} slow={1.3} className="absolute inset-0" />
        </div>
      </div>
    </section>
  );
}
