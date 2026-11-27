"use client";

import { m as motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import MosaicCover from "../../../components/mosaic/MosaicCover";
import { panel } from "../../../components/ui/styles";
import { num, rupiah } from "../../../lib/format";
import { ORDER_STEPS, submitProof, useOrder } from "./orders";

const EASE = [0.16, 1, 0.3, 1] as const;
const DEMO_REK = "8077 1234 5678 9012";

const CARA = [
  "Buka aplikasi bank, pilih transfer ke rekening pabrik.",
  "Masukkan nomor rekening di atas, cek nama pabrik dan jumlahnya.",
  "Selesaikan transfer, lalu unggah bukti transfer di bawah. Pabrik memeriksa bukti itu.",
];

/** Menunggu pembayaran: transfer langsung ke pabrik, unggah bukti. Tidak ada uang yang bergerak (demo). */
export default function BayarView() {
  const id = useSearchParams().get("id");
  const o = useOrder(id);
  const router = useRouter();
  const fid = useId();
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [tried, setTried] = useState(false);

  if (!o) {
    return (
      <section className="pt-[72px]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-4 px-5 pb-24 pt-12 sm:px-10 lg:px-16">
          <h1 className="font-display text-[clamp(32px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">Pesanan tidak ditemukan</h1>
          <p className="max-w-[520px] text-[15px] leading-[22px] text-text-muted">
            Pesanan demo hanya tersimpan di browser tempat kamu membuatnya. Mulai lagi dari katalog.
          </p>
          <Link href="/katalog" className="rounded-[2px] bg-brand px-6 py-3.5 text-[14px] font-medium text-surface hover:bg-brand-hover">
            Buka katalog
          </Link>
        </div>
      </section>
    );
  }

  const steps = ORDER_STEPS(o.pickup);
  const total = o.qty * o.price;
  const kirim = o.pickup === "kirim";
  const paid = o.status >= 1;

  const copy = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* klip papan tidak tersedia: abaikan */
    }
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!file) return;
    submitProof(o.id, file.name);
    router.push(`/pesanan-saya/berhasil?id=${encodeURIComponent(o.id)}`);
  };

  return (
    <section aria-label="Menunggu pembayaran" className="pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 sm:px-10 lg:px-16">
        <nav aria-label="Jalur halaman" className="text-[12px] leading-[15px] text-text-muted">
          <Link href="/katalog" className="hover:text-text">Katalog</Link> / {o.title} / Pembayaran
        </nav>
        <h1 className="mt-4 font-display text-[clamp(32px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">Selesaikan pembayaran</h1>
        <p className="mt-2.5 max-w-[640px] text-[15px] leading-[22px] text-text-muted">
          Transfer langsung ke rekening pabrik, lalu unggah bukti transfer. Kainara tidak memegang uangmu dan tidak menarik biaya darimu.
        </p>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_444px]">
          <form onSubmit={send} noValidate className="flex min-w-0 flex-col gap-5">
            <section className={`${panel} flex flex-col gap-5 p-[25px]`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-[13px] leading-4 text-text-muted">Rekening pabrik, contoh demo</p>
                  <p className="font-display text-[clamp(26px,3vw,34px)] leading-[1.1] tabular-nums tracking-[-0.02em] text-brand">{DEMO_REK}</p>
                  <p className="text-[13px] leading-4 text-text-muted">a.n. Pabrik di {o.origin ?? "Yogyakarta"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(DEMO_REK.replace(/ /g, ""))}
                  className="rounded-[2px] border border-border-strong px-5 py-3 text-[14px] font-medium transition-colors hover:bg-surface"
                >
                  {copied ? "Tersalin" : "Salin nomor"}
                </button>
              </div>
              <div aria-hidden="true" className="h-px bg-text/10" />
              <dl className="flex flex-col gap-3 text-[14px] leading-[17px]">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-text-muted">Jumlah yang harus ditransfer</dt>
                  <dd className="font-display text-[24px] leading-7 tabular-nums tracking-[-0.02em]">{rupiah(total)}</dd>
                </div>
                {o.model === "lelang" && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Batas waktu</dt>
                    <dd className="font-medium">20 menit sejak lot dipesan</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className={`${panel} flex flex-col gap-4 p-[25px]`}>
              <h2 className="text-[18px] font-medium leading-[22px]">Cara bayar</h2>
              <ol className="flex flex-col gap-3">
                {CARA.map((c, i) => (
                  <li key={c} className="flex items-start gap-3 text-[14px] leading-[20px] text-text-muted">
                    <span className="grid size-6 shrink-0 place-items-center rounded-[2px] bg-brand text-[12px] font-medium text-surface">{i + 1}</span>
                    {c}
                  </li>
                ))}
              </ol>
            </section>

            <section className={`${panel} flex flex-col gap-4 p-[25px]`}>
              <h2 className="text-[18px] font-medium leading-[22px]">Unggah bukti transfer</h2>
              {paid ? (
                <p className="text-[14px] leading-[20px] text-text-muted">
                  Bukti sudah terkirim{o.proofName ? `: ${o.proofName}` : ""}.{" "}
                  <Link href={`/pesanan-saya/berhasil?id=${encodeURIComponent(o.id)}`} className="font-medium text-brand underline underline-offset-4">
                    Lihat status
                  </Link>
                </p>
              ) : (
                <>
                  <label
                    htmlFor={fid}
                    className={`flex cursor-pointer flex-col items-center gap-1 rounded-[2px] border border-dashed px-4 py-7 text-center transition-colors hover:bg-brand-soft/50 ${
                      tried && !file ? "border-text" : "border-brand"
                    }`}
                  >
                    <span className="text-[14px] font-medium text-brand">{file ? file.name : "Pilih foto atau PDF bukti transfer"}</span>
                    <span className="text-[12px] leading-[15px] text-text-muted">
                      {file ? `${Math.max(1, Math.round(file.size / 1024))} KB. Klik untuk mengganti.` : "JPG, PNG, atau PDF. Di demo ini hanya nama berkas yang dicatat."}
                    </span>
                    <input
                      id={fid}
                      type="file"
                      accept="image/*,application/pdf"
                      className="sr-only"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <p role="alert" className="min-h-4 text-[13px] leading-4 text-text-soft">
                    {tried && !file ? "Pilih berkas bukti transfer dulu." : ""}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.98 }}
                      className="h-12 rounded-[2px] bg-brand px-7 text-[15px] font-medium text-surface transition-colors hover:bg-brand-hover"
                    >
                      Kirim bukti transfer
                    </motion.button>
                    <Link href="/pesanan-saya" className="text-[14px] font-medium text-brand underline underline-offset-4">
                      Bayar nanti, lihat pesanan saya
                    </Link>
                  </div>
                </>
              )}
            </section>
          </form>

          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24">
            <section className={`${panel} flex flex-col gap-4 p-[25px]`}>
              <h2 className="text-[18px] font-medium leading-[22px]">Ringkasan pesanan</h2>
              <div className="flex gap-3">
                <div className="relative size-[54px] shrink-0 overflow-hidden rounded-[2px] bg-thumb-empty">
                  {o.photo && <Image src={o.photo} alt={o.alt ?? o.title} fill sizes="54px" className="object-cover" style={{ objectPosition: o.focus }} />}
                  <MosaicCover cols={3} rows={3} hidden seed={9} trigger="mount" startDelay={0.15} origin={{ x: 0.5, y: 0.5 }} className="absolute inset-0" />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-[14px] font-medium leading-[17px]">{o.title}</p>
                  <p className="text-[12px] leading-[15px] text-text-muted">
                    {num(o.qty)} {o.unit}, lot {o.code}
                  </p>
                </div>
              </div>
              <dl className="flex flex-col gap-3 text-[14px] leading-[17px]">
                <div className="flex justify-between gap-4"><dt className="text-text-muted">Barang, {num(o.qty)} {o.unit}</dt><dd className="font-medium">{rupiah(total)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-text-muted">{kirim ? "Ongkir, dibayar ke kurir" : "Ongkir"}</dt><dd className="font-medium">{kirim ? "Di luar total" : "Tidak ada"}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-text-muted">Biaya platform untukmu</dt><dd className="font-medium">Rp0</dd></div>
              </dl>
              <div aria-hidden="true" className="h-px bg-text/10" />
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[14px] font-medium">Total</p>
                <p className="font-display text-[28px] leading-8 tabular-nums tracking-[-0.02em] text-brand">{rupiah(total)}</p>
              </div>
            </section>

            <section className={`${panel} flex flex-col gap-3 p-[25px]`}>
              <h2 className="text-[16px] font-medium leading-5">Status pesanan #{o.id}</h2>
              <ol className="flex flex-col gap-2.5">
                {steps.map((s, i) => {
                  const state = i < o.status ? "done" : i === o.status ? "now" : "next";
                  return (
                    <motion.li
                      key={s.t}
                      aria-current={state === "now" ? "step" : undefined}
                      className="flex items-center gap-3 text-[14px] leading-[17px]"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, ease: EASE, delay: 0.1 + i * 0.05 }}
                    >
                      <span
                        aria-hidden="true"
                        className={`block size-4 shrink-0 rounded-[2px] ${state === "done" ? "bg-brand" : state === "now" ? "bg-accent" : "bg-brand-soft"}`}
                      />
                      <span className={state === "next" ? "text-text-muted" : state === "now" ? "font-medium" : ""}>
                        {s.t}
                        {state === "now" && o.status === 0 ? ", menunggu pembayaran" : ""}
                      </span>
                    </motion.li>
                  );
                })}
              </ol>
            </section>
          </aside>
        </div>

        <p className="mt-10 text-[12px] text-text-muted">Nomor rekening dan angka adalah contoh demo untuk mock up. Tidak ada uang yang bergerak.</p>
      </div>
    </section>
  );
}
