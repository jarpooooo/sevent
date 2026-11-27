"use client";

import { m as motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { panel } from "../../../components/ui/styles";
import { StatusPill } from "../../../components/ui/table";
import MosaicCover from "../../../components/mosaic/MosaicCover";
import { LOTS } from "../../../lib/data/seed/lots";
import { BUY_MODEL_LABEL } from "../../../lib/domain/types";
import { num, rupiah } from "../../../lib/format";
import { SAMPLES, tone, when, type Row } from "./samples";
import { advanceOrder, clearOrders, COMPLAINT_HOURS, MAX_STATUS, ORDER_STEPS, useOrders } from "./orders";

function Dl({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <h3 className="text-[13px] font-medium">{title}</h3>
      <dl className="flex flex-col gap-2 text-[13px] leading-[18px]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
            <dt className="text-text-muted">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function OrderCard({ r, open, onToggle }: { r: Row; open: boolean; onToggle: () => void }) {
  const { o, sample } = r;
  const lot = LOTS.find((l) => l.slug === o.slug);
  const steps = ORDER_STEPS(o.pickup);
  const total = o.qty * o.price;
  const place = [o.origin, o.province].filter(Boolean).join(", ");
  const panelId = `rincian-${o.id}`;
  const next = steps[o.status + 1];
  const photo = o.photo ?? lot?.photo;

  return (
    <article className={`${panel} overflow-hidden ${open ? "!border-brand" : ""}`}>
      <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
        <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[2px] bg-thumb-empty sm:h-[112px] sm:w-[112px]">
          {photo && (
            <Image
              src={photo}
              alt={o.alt ?? lot?.alt ?? o.title}
              fill
              sizes="112px"
              className="object-cover"
              style={{ objectPosition: o.focus ?? lot?.focus }}
            />
          )}
          <MosaicCover cols={3} rows={3} hidden seed={o.id.length + o.qty} trigger="inView" startDelay={0.1} origin={{ x: 0.5, y: 0.5 }} className="absolute inset-0" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:justify-between md:gap-6">
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-[18px] font-medium leading-[22px]">
              <Link href={`/katalog/${o.slug}`} className="underline-offset-4 hover:underline">
                {o.title}
              </Link>
            </h2>
            <ul className="flex flex-wrap gap-1.5 text-[12px] leading-[15px]">
              {[o.category, o.lotType, BUY_MODEL_LABEL[o.model]].filter(Boolean).map((c) => (
                <li key={c} className="rounded-full bg-brand-soft/70 px-2.5 py-1 text-text">
                  {c}
                </li>
              ))}
            </ul>
            <p className="text-[13px] leading-[18px] text-text-muted">
              {num(o.qty)} {o.unit} × {rupiah(o.price)} per {o.unit}. {o.pickup === "ambil" ? "Ambil sendiri" : "Diantar"}
              {place && `, ${place}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 md:shrink-0 md:flex-col md:items-end md:gap-1.5">
            <StatusPill tone={tone(o.status)}>{steps[o.status].t}</StatusPill>
            <p className="font-display text-[22px] leading-6 tabular-nums tracking-[-0.02em] text-brand">{rupiah(total)}</p>
            <p className="text-[12px] leading-[15px] text-text-muted">
              #{o.id}, {when(o.createdAt)}
              {sample && ", contoh demo"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? "Tutup" : "Buka"} rincian pesanan ${o.title}`}
          className="grid size-8 shrink-0 place-items-center self-start rounded-[2px] bg-brand-soft transition-colors hover:bg-[#cfe6e2]"
        >
          <svg
            width="8"
            height="4"
            viewBox="0 0 8 4"
            fill="none"
            aria-hidden="true"
            className={`transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
          >
            <path d="M.5.5 4 3.5 7.5.5" stroke="#16746a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="flex flex-col gap-6 border-t border-border px-4 pb-5 pt-5 sm:px-5">
            <ol className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
              {steps.map((s, i) => {
                const state = i < o.status ? "done" : i === o.status ? "now" : "next";
                return (
                  <li key={s.t} aria-current={state === "now" ? "step" : undefined} className="flex flex-col gap-1.5">
                    <span
                      aria-hidden="true"
                      className={`block h-2.5 rounded-[2px] ${
                        state === "done" ? "bg-brand" : state === "now" ? "bg-accent" : "bg-brand-soft"
                      }`}
                    />
                    <p className={`text-[13px] leading-4 ${state === "next" ? "text-text-muted" : "font-medium"}`}>{s.t}</p>
                    <p className="text-[12px] leading-[15px] text-text-muted">{s.d}</p>
                  </li>
                );
              })}
            </ol>

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              <Dl
                title="Tentang lot"
                rows={[
                  ["Kode lot", o.code],
                  ["Bahan", lot?.spec.jenis ?? "-"],
                  ["Warna", lot?.spec.warna ?? "-"],
                  ["Ukuran", lot?.spec.ukuran ?? "-"],
                  ["Kondisi", lot?.spec.kondisi ?? "-"],
                ]}
              />
              <Dl
                title="Rincian pembayaran"
                rows={[
                  ["Barang", `${num(o.qty)} ${o.unit} × ${rupiah(o.price)} = ${rupiah(total)}`],
                  ["Biaya platform", "Rp0, UMKM tidak membayar"],
                  ["Ongkir", o.pickup === "ambil" ? "Tidak ada, ambil sendiri" : "Dibayar ke kurir, di luar total"],
                  ["Transfer", `${rupiah(total)} langsung ke pabrik`],
                ]}
              />
              <Dl
                title="Penerimaan"
                rows={[
                  ["Cara terima", o.pickup === "ambil" ? "Ambil sendiri" : "Diantar"],
                  [o.pickup === "ambil" ? "Lokasi" : "Alamat", o.pickup === "ambil" ? `Pabrik Contoh, ${place}` : (o.address ?? "-")],
                  ["Dipesan", when(o.createdAt)],
                  ["Komplain", `${COMPLAINT_HOURS} jam setelah barang diterima`],
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {o.status === 3 && !sample && o.pickup === "kirim" && (
                <p className="rounded-[2px] bg-warn-soft px-3.5 py-3 text-[13px] leading-5">
                  Menunggu konfirmasi kurir lewat admin.
                </p>
              )}
              {o.status === 3 && !sample && o.pickup === "ambil" && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => advanceOrder(o.id)}
                  className="h-11 rounded-[2px] bg-brand px-5 text-[14px] font-medium text-surface transition-colors hover:bg-brand-hover"
                >
                  Konfirmasi barang diterima
                </motion.button>
              )}
              {o.status < 3 && !sample && (
                <button
                  type="button"
                  onClick={() => advanceOrder(o.id)}
                  className="h-11 rounded-[2px] border border-brand px-5 text-[14px] font-medium text-brand transition-colors hover:bg-brand-soft"
                >
                  Simulasikan tahap berikutnya
                </button>
              )}
              {o.status === 4 && !sample && (
                <button
                  type="button"
                  onClick={() => advanceOrder(o.id)}
                  className="h-11 rounded-[2px] border border-brand px-5 text-[14px] font-medium text-brand transition-colors hover:bg-brand-soft"
                >
                  Simulasikan masa komplain selesai
                </button>
              )}
              {o.status >= 3 && o.status < MAX_STATUS && (
                <Link
                  href="/kontak"
                  className="flex h-11 items-center rounded-[2px] border border-border-strong px-5 text-[14px] font-medium transition-colors hover:bg-card"
                >
                  Laporkan masalah
                </Link>
              )}
              <Link
                href={`/pesanan-saya/detail?id=${encodeURIComponent(o.id)}`}
                className="flex h-11 items-center rounded-[2px] border border-brand px-5 text-[14px] font-medium text-brand transition-colors hover:bg-brand-soft"
              >
                Lihat detail pesanan
              </Link>
              <Link
                href={`/katalog/${o.slug}`}
                className="text-[14px] font-medium text-brand underline underline-offset-4"
              >
                {o.status === 5 ? "Lihat lot dan tulis ulasan" : "Lihat lot"}
              </Link>
              <p className="text-[12px] leading-[15px] text-text-muted">
                {sample
                  ? "Contoh agar alur terlihat. Pesanan sungguhanmu muncul di sini setelah checkout."
                  : next
                    ? o.pickup === "kirim" && o.status >= 3
                      ? `Selanjutnya: ${next.t}. Diantar: kurir ${o.courier ?? "(JNE atau J&T)"} yang mengonfirmasi, diteruskan ke panel admin. Konfirmasi kurir diteruskan lewat Panel admin (demo).`
                      : `Selanjutnya: ${next.t}. Tombol simulasi mewakili pabrik dan kurir (demo).`
                    : "Transaksi selesai. Komisi 2% dicatat dan ditanggung pabrik."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

type Filter = "semua" | "jalan" | "selesai";
const FILTERS: { k: Filter; t: string }[] = [
  { k: "semua", t: "Semua" },
  { k: "jalan", t: "Berjalan" },
  { k: "selesai", t: "Selesai" },
];

export default function PesananView() {
  const orders = useOrders();
  const [filter, setFilter] = useState<Filter>("semua");
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);

  const rows: Row[] = orders.length ? orders.map((o) => ({ o, sample: false })) : SAMPLES;
  const count = (f: Filter) => rows.filter((r) => (f === "semua" ? true : f === "jalan" ? r.o.status < 5 : r.o.status === 5)).length;
  const shown = rows.filter((r) => (filter === "semua" ? true : filter === "jalan" ? r.o.status < 5 : r.o.status === 5));
  const firstActive = rows.find((r) => r.o.status < 5)?.o.id ?? null;
  const open = openId === undefined ? firstActive : openId;

  return (
    <section aria-label="Pesanan saya" className="pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 sm:px-10 lg:px-16">
        <h1 className="font-display text-[clamp(36px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">Pesanan saya</h1>
        <p className="mt-2.5 max-w-[640px] text-[15px] leading-[22px] text-text-muted">
          Pantau lot yang sudah kamu pesan, dari dibuat sampai diterima. Kamu membayar lewat virtual account PJP, tanpa biaya platform.
        </p>

        <div role="group" aria-label="Saring pesanan" className="mt-7 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.k}
              type="button"
              aria-pressed={filter === f.k}
              onClick={() => setFilter(f.k)}
              className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                filter === f.k ? "border-text bg-text text-surface" : "border-border-strong bg-card hover:bg-surface"
              }`}
            >
              {f.t} <span className="ml-1 tabular-nums">{count(f.k)}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {shown.length === 0 ? (
            <p className="py-8 text-[15px] text-text-muted">Belum ada pesanan di daftar ini.</p>
          ) : (
            shown.map((r) => (
              <OrderCard key={r.o.id} r={r} open={open === r.o.id} onToggle={() => setOpenId(open === r.o.id ? null : r.o.id)} />
            ))
          )}
        </div>

        {orders.length === 0 ? (
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <p className="text-[15px] text-text-muted">Belum ada pesananmu.</p>
            <Link
              href="/katalog"
              className="rounded-[2px] bg-brand px-5 py-3 text-[14px] font-medium text-surface transition-colors hover:bg-brand-hover"
            >
              Buka katalog
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={clearOrders}
            className="mt-6 w-fit text-[13px] text-text-muted underline underline-offset-4 hover:text-text"
          >
            Hapus semua pesanan demo
          </button>
        )}

        <p className="mt-10 text-[12px] text-text-muted">
          Nomor pesanan, harga, dan status adalah contoh demo untuk mock up. Pesananmu hanya tersimpan di browser ini.
        </p>
      </div>
    </section>
  );
}
