"use client";

import { m as motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MosaicCover from "../../../components/mosaic/MosaicCover";
import { useSafeReducedMotion } from "../../../components/motion/useSafeReducedMotion";
import { panel } from "../../../components/ui/styles";
import { StatusPill } from "../../../components/ui/table";
import { LOTS } from "../../../lib/data/seed/lots";
import { BUY_MODEL_LABEL } from "../../../lib/domain/types";
import { num, rupiah } from "../../../lib/format";
import { advanceOrder, COMPLAINT_HOURS, MAX_STATUS, ORDER_STEPS, useOrders } from "./orders";
import { SAMPLES, tone, when } from "./samples";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Aturan komplain dan refund (usulan tim, bukan janji hukum). */
const REFUND: [string, string][] = [
  ["Pabrik batal, stok habis, atau ekspor ditolak", "Refund penuh"],
  ["Berat kurang atau tidak sesuai bukti", "Dicek dengan foto timbangan, lalu dikoreksi"],
  ["Rusak di pengiriman", "Klaim ke kurir atau asuransi"],
  ["Barang tidak diambil pembeli", "Jadwal ulang, lalu dibatalkan"],
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={`${panel} flex flex-col gap-4 p-[25px]`}>
      <h2 className="text-[18px] font-medium leading-[22px]">{title}</h2>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 text-[14px] leading-[17px]">
      <dt className="text-text-muted">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

export default function DetailPesananView() {
  const id = useSearchParams().get("id");
  const orders = useOrders();
  const reduce = !!useSafeReducedMotion();

  const real = orders.find((o) => o.id === id);
  const sample = !real ? SAMPLES.find((r) => r.o.id === id) : undefined;
  const o = real ?? sample?.o;

  if (!o) {
    return (
      <section className="pt-[72px]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-4 px-5 pb-24 pt-12 sm:px-10 lg:px-16">
          <h1 className="font-display text-[clamp(32px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">Pesanan tidak ditemukan</h1>
          <p className="max-w-[520px] text-[15px] leading-[22px] text-text-muted">
            Nomor pesanan ini tidak ada di browser ini. Pesanan demo hanya tersimpan di perangkat tempat kamu membuatnya.
          </p>
          <Link href="/pesanan-saya" className="rounded-[2px] bg-brand px-6 py-3.5 text-[14px] font-medium text-surface hover:bg-brand-hover">
            Kembali ke pesanan saya
          </Link>
        </div>
      </section>
    );
  }

  const lot = LOTS.find((l) => l.slug === o.slug);
  const steps = ORDER_STEPS(o.pickup);
  const total = o.qty * o.price;
  const place = [o.origin, o.province].filter(Boolean).join(", ");
  const photo = o.photo ?? lot?.photo;
  const demo = !!sample;
  const kirim = o.pickup === "kirim";
  // Jendela komplain: 8 ubin x 6 jam. Hanya berjalan setelah barang diterima (status 4).
  const windowDone = o.status === 4 ? 5 : o.status === 5 ? 8 : 0;

  return (
    <section aria-label={`Pesanan ${o.id}`} className="pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 sm:px-10 lg:px-16">
        <nav aria-label="Jalur halaman" className="text-[12px] leading-[15px] text-text-muted">
          <Link href="/pesanan-saya" className="hover:text-text">Pesanan saya</Link> / #{o.id}
        </nav>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="font-display text-[clamp(32px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">Pesanan #{o.id}</h1>
          <StatusPill tone={tone(o.status)}>{steps[o.status].t}</StatusPill>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_444px]">
          <div className="flex min-w-0 flex-col gap-5">
            <Card title="Perjalanan pesanan">
              <ol className="flex flex-col">
                {steps.map((s, i) => {
                  const state = i < o.status ? "done" : i === o.status ? "now" : "next";
                  const last = i === steps.length - 1;
                  return (
                    <motion.li
                      key={s.t}
                      aria-current={state === "now" ? "step" : undefined}
                      className="flex gap-4"
                      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                    >
                      <div className="flex flex-col items-center">
                        <span
                          aria-hidden="true"
                          className={`block size-4 shrink-0 rounded-[2px] ${
                            state === "done" ? "bg-brand" : state === "now" ? "bg-accent" : "bg-brand-soft"
                          }`}
                        />
                        {!last && <span aria-hidden="true" className="my-0 block w-px flex-1 bg-border-strong" />}
                      </div>
                      <div className={`flex flex-col gap-0.5 ${last ? "" : "pb-6"}`}>
                        <p className={`text-[15px] leading-[18px] ${state === "next" ? "text-text-muted" : "font-medium"}`}>{s.t}</p>
                        <p className="text-[13px] leading-4 text-text-muted">{s.d}</p>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </Card>

            {kirim ? (
              <Card title="Pengiriman">
                <dl className="flex flex-col gap-3">
                  <Row k="Kurir" v="Dipilih pabrik, ongkir dibayar ke kurir" />
                  <Row k="Nomor resi" v={o.status >= 3 ? "Diisi pabrik saat dikirim (contoh demo)" : "Muncul setelah barang dikirim"} />
                  <Row k="Tujuan" v={o.address ?? "-"} />
                </dl>
              </Card>
            ) : (
              <Card title="Ambil sendiri">
                <dl className="flex flex-col gap-3">
                  <Row k="Lokasi" v={`Pabrik Contoh, ${place}`} />
                  <Row k="Jadwal" v="Disepakati dengan pabrik setelah barang siap" />
                  <Row k="Dokumen" v="Tunjukkan nomor pesanan dan identitas penerima" />
                </dl>
              </Card>
            )}

            <Card title="Komplain dan refund">
              <p className="text-[13px] leading-4 text-text-muted">
                Ada kendala? Ajukan dalam {COMPLAINT_HOURS} jam setelah barang diterima. Jendela waktu ini usulan tim.
              </p>
              <div
                role="img"
                aria-label={`${windowDone} dari 8 ubin jendela komplain sudah lewat`}
                className="flex gap-1"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <span key={i} className={`size-[22px] rounded-[2px] ${i < windowDone ? "bg-brand" : "bg-brand-soft"}`} />
                ))}
              </div>
              <p className="text-[12px] leading-[15px] text-text-muted">
                {o.status < 4
                  ? "Jendela mulai setelah kamu konfirmasi barang diterima. 1 ubin = 6 jam."
                  : o.status === 4
                    ? "Sisa 18 jam dari 48 jam, contoh demo. 1 ubin = 6 jam."
                    : "Jendela komplain sudah ditutup. 1 ubin = 6 jam."}
              </p>
              <ul className="flex flex-col">
                {REFUND.map(([k, v]) => (
                  <li key={k} className="grid gap-1 border-t border-border py-3 text-[14px] leading-[17px] sm:grid-cols-2 sm:gap-6">
                    <span>{k}</span>
                    <span className="text-brand">{v}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[12px] leading-[15px] text-text-muted">
                Refund ikut mengoreksi komisi 2%. Barang yang dikembalikan diperiksa dulu oleh EXIM.
              </p>
              <Link
                href="/kontak"
                className="w-fit rounded-[2px] border border-brand px-5 py-3 text-[14px] font-medium text-brand transition-colors hover:bg-brand-soft"
              >
                Ajukan komplain
              </Link>
            </Card>
          </div>

          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24">
            <section className={`${panel} flex flex-col gap-4 p-[25px]`}>
              <h2 className="text-[18px] font-medium leading-[22px]">Ringkasan</h2>
              <div className="flex gap-3">
                <div className="relative size-[54px] shrink-0 overflow-hidden rounded-[2px] bg-thumb-empty">
                  {photo && (
                    <Image src={photo} alt={o.alt ?? lot?.alt ?? o.title} fill sizes="54px" className="object-cover" style={{ objectPosition: o.focus ?? lot?.focus }} />
                  )}
                  <MosaicCover cols={3} rows={3} hidden seed={5} trigger="inView" startDelay={0.1} origin={{ x: 0.5, y: 0.5 }} className="absolute inset-0" />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <Link href={`/katalog/${o.slug}`} className="text-[14px] font-medium leading-[17px] hover:underline">
                    {o.title}
                  </Link>
                  <p className="text-[12px] leading-[15px] text-text-muted">
                    {num(o.qty)} {o.unit} × {rupiah(o.price)} / {o.unit}
                  </p>
                  <p className="text-[12px] leading-[15px] text-text-muted">
                    {[o.category, o.lotType, BUY_MODEL_LABEL[o.model]].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
              <dl className="flex flex-col gap-3">
                <Row k="Barang" v={rupiah(total)} />
                <Row k={kirim ? "Ongkir, dibayar ke kurir" : "Ongkir"} v={kirim ? "Di luar total" : "Tidak ada"} />
                <Row k="Biaya platform untukmu" v="Rp0" />
              </dl>
              <div aria-hidden="true" className="h-px bg-text/10" />
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[14px] font-medium">Total dibayar</p>
                <p className="font-display text-[28px] leading-8 tabular-nums tracking-[-0.02em] text-brand">{rupiah(total)}</p>
              </div>
              <p className="text-[12px] leading-[15px] text-text-muted">
                Dipesan {when(o.createdAt)}. Transfer langsung ke pabrik.{demo && " Contoh demo."}
              </p>
            </section>

            <div className="flex flex-col gap-2.5">
              {o.status === 3 && !demo && (
                <button
                  type="button"
                  onClick={() => advanceOrder(o.id)}
                  className="h-11 rounded-[2px] bg-brand text-[14px] font-medium text-surface transition-colors hover:bg-brand-hover"
                >
                  Konfirmasi barang diterima
                </button>
              )}
              {o.status < 3 && !demo && (
                <button
                  type="button"
                  onClick={() => advanceOrder(o.id)}
                  className="h-11 rounded-[2px] border border-brand text-[14px] font-medium text-brand transition-colors hover:bg-brand-soft"
                >
                  Simulasikan tahap berikutnya
                </button>
              )}
              {o.status === 4 && !demo && (
                <button
                  type="button"
                  onClick={() => advanceOrder(o.id)}
                  className="h-11 rounded-[2px] border border-brand text-[14px] font-medium text-brand transition-colors hover:bg-brand-soft"
                >
                  Simulasikan masa komplain selesai
                </button>
              )}
              {o.status >= 3 && o.status < MAX_STATUS && (
                <Link
                  href="/kontak"
                  className="flex h-11 items-center justify-center rounded-[2px] border border-border-strong text-[14px] font-medium transition-colors hover:bg-card"
                >
                  Laporkan masalah
                </Link>
              )}
              {o.status === 5 && (
                <Link
                  href={`/katalog/${o.slug}`}
                  className="flex h-11 items-center justify-center rounded-[2px] bg-brand text-[14px] font-medium text-surface transition-colors hover:bg-brand-hover"
                >
                  Lihat lot dan tulis ulasan
                </Link>
              )}
            </div>
            <p className="text-[12px] leading-[15px] text-text-muted">
              Konfirmasi hanya setelah paket tiba dan kamu cek isinya. Komplain bisa diajukan dalam {COMPLAINT_HOURS} jam.
              {demo && " Tombol simulasi hanya muncul di pesanan yang kamu buat sendiri."}
            </p>
          </aside>
        </div>

        <p className="mt-10 text-[12px] text-text-muted">Nomor pesanan, jadwal, dan angka adalah contoh demo untuk mock up.</p>
      </div>
    </section>
  );
}
