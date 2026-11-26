"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { Icon } from "./icons";
import MosaicCover from "./MosaicCover";
import { AUCTION_TTL_S, mmss, useAuction } from "./katalog/auction";
import Counter from "./katalog/Counter";
import { DescentBar, LotCard } from "./katalog/LotCard";
import { BUY_MODEL_LABEL, defaultQty, type Lot, num, rupiah, stepOf } from "./katalog/lots";

const EASE = [0.16, 1, 0.3, 1] as const;

const rule = "h-px w-full bg-line";
const h2 = "font-display text-[clamp(24px,2.2vw,30px)] leading-tight tracking-[-0.02em]";

function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-1 text-brand" role="img" aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name={n <= value ? "star-filled" : "star"} size={size} />
      ))}
    </span>
  );
}

/* ───────── Galeri: hanya foto keseluruhan yang sudah ada, sisanya "Belum ada" seperti di Figma ───────── */
const THUMBS = ["Keseluruhan", "Tekstur", "Ukuran potongan", "Timbangan", "Identitas lot"];

function Gallery({ lot }: { lot: Lot }) {
  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-[14px] bg-inverse lg:aspect-auto lg:h-[414px]">
        <Image
          src={lot.photo}
          alt={lot.alt}
          fill
          priority
          sizes="(min-width: 1024px) 736px, 92vw"
          className="object-cover"
          style={{ objectPosition: lot.focus }}
        />
        <MosaicCover
          cols={8}
          rows={4}
          hidden
          seed={11}
          origin={{ x: 0.5, y: 0.5 }}
          startDelay={0.2}
          className="absolute inset-0"
        />
        <span className="absolute right-0 top-0 z-10 flex h-12 w-[150px] items-center bg-surface px-6 text-[13px] font-medium text-brand">
          Lot {lot.code}
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:gap-2">
        {THUMBS.map((t, i) => (
          <li key={t}>
            {i === 0 ? (
              <div className="relative h-[78px] overflow-hidden rounded-[10px] border border-brand">
                <Image
                  src={lot.photo}
                  alt=""
                  fill
                  sizes="116px"
                  className="object-cover"
                  style={{ objectPosition: lot.focus }}
                />
              </div>
            ) : (
              <div className="flex h-[78px] items-center justify-center rounded-[10px] border border-line bg-thumb-empty text-[11px] text-text-muted">
                Belum ada
              </div>
            )}
            <p className="mt-2 text-[11px] font-medium text-text-muted">{t}</p>
          </li>
        ))}
        <li>
          <div className="flex h-[78px] flex-col items-center justify-center gap-1 rounded-[10px] border border-line bg-panel text-[11px] text-text-muted">
            <Icon name="play-circle" size={24} />
            Belum ada
          </div>
          <p className="mt-2 text-[11px] font-medium text-text-muted">Video 10–20 dtk</p>
        </li>
      </ul>
      <p className="mt-3 text-[12px] text-text-muted">Foto &amp; video lot · Aset ilustratif, bukti asli menyusul.</p>
    </div>
  );
}

/* ───────── Panel beli ───────── */
function BuyPanel({ lot }: { lot: Lot }) {
  const id = useId();
  const auction = useAuction(lot);
  const price = auction ? auction.price : (lot.price ?? 0);

  const step = stepOf(lot);
  const min = Math.min(lot.moq, lot.stock);
  const max = lot.stock;
  const [qty, setQty] = useState(defaultQty(lot));
  const [text, setText] = useState(String(defaultQty(lot)));

  const apply = (n: number) => {
    const v = Math.max(min, Math.min(max, Math.round(n)));
    setQty(v);
    setText(String(v));
  };
  const pct = Math.max(0, Math.min(100, (lot.stock / lot.capacity) * 100));

  return (
    <aside
      aria-label="Beli lot ini"
      className="rounded-[14px] border border-line bg-panel p-6 sm:p-7 lg:sticky lg:top-[96px]"
    >
      <p className="text-[12px] font-medium text-brand">
        {lot.model === "tetap" ? "Regional" : "Lelang nasional"} / {lot.category}
      </p>
      <h1 className="font-display mt-2 text-[clamp(30px,3vw,38px)] leading-[1.1] tracking-[-0.02em]">
        {lot.title}
      </h1>
      <p className="mt-3 flex items-center gap-2 text-[14px] text-text-muted">
        <Icon name="map-pin" size={16} />
        Pabrik di {lot.origin} · Lot {lot.code}
      </p>

      <div className={`${rule} my-5`} />

      <p className="flex items-end gap-2">
        <span className="font-display text-[clamp(32px,3vw,38px)] leading-none tabular-nums text-brand">
          <Counter value={price} format={rupiah} />
        </span>
        <span className="pb-1 text-[15px] text-text-muted">/ {lot.unit}</span>
      </p>
      <p className="mt-2 text-[13px] text-text-muted">{BUY_MODEL_LABEL[lot.model]}</p>

      {auction && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[13px] tabular-nums">
            <span className="text-text-muted">Harga turun bertahap (simulasi demo)</span>
            <span role="timer" aria-label="Sisa waktu lelang" className="flex items-center gap-1.5 font-medium">
              <Icon name="clock" size={15} />
              {auction.ready ? mmss(auction.remaining) : mmss(AUCTION_TTL_S)}
            </span>
          </div>
          <div className="mt-2">
            <DescentBar progress={auction.progress} />
          </div>
          <div className="mt-1.5 flex justify-between text-[12px] tabular-nums text-text-muted">
            <span>Awal {rupiah(lot.auction!.start)}</span>
            <span>Batas bawah {rupiah(lot.auction!.floor)}</span>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-baseline justify-between text-[14px] font-medium">
        <span>Stok tersedia</span>
        <span className="text-brand tabular-nums">
          {num(lot.stock)} / {num(lot.capacity)} {lot.unit}
        </span>
      </div>
      <span aria-hidden="true" className="mt-2 block h-1.5 overflow-hidden rounded-full bg-brand-soft">
        <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </span>
      <p className="mt-3 text-[13px] text-text-muted">
        Min. {num(lot.moq)} {lot.unit} · contoh demo
      </p>

      <div className={`${rule} my-5`} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label htmlFor={`${id}-qty`} className="text-[14px] font-medium">
            Jumlah pembelian
          </label>
          <div className="mt-2.5 flex h-11 w-[238px] max-w-full items-center rounded-[10px] border border-line bg-card">
            <button
              type="button"
              aria-label="Kurangi jumlah"
              disabled={qty <= min}
              onClick={() => apply(qty - step)}
              className="flex h-full w-11 items-center justify-center rounded-l-[10px] text-[18px] transition-colors hover:bg-brand-soft disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Icon name="minus" size={16} />
            </button>
            <div className="flex flex-1 items-center justify-center gap-1.5">
              <input
                id={`${id}-qty`}
                inputMode="numeric"
                value={text}
                onChange={(e) => setText(e.target.value.replace(/\D/g, ""))}
                onBlur={() => apply(Number(text) || min)}
                onKeyDown={(e) => e.key === "Enter" && apply(Number(text) || min)}
                className="w-12 bg-transparent text-right text-[15px] font-medium tabular-nums outline-none"
              />
              <span className="text-[15px] font-medium">{lot.unit}</span>
            </div>
            <button
              type="button"
              aria-label="Tambah jumlah"
              disabled={qty >= max}
              onClick={() => apply(qty + step)}
              className="flex h-full w-11 items-center justify-center rounded-r-[10px] transition-colors hover:bg-brand-soft disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Icon name="plus" size={16} />
            </button>
          </div>
        </div>
        <div className="flex shrink-0 items-baseline justify-between gap-4 sm:block sm:text-right">
          <p className="text-[12px] text-text-muted">Subtotal</p>
          <p className="text-[22px] font-semibold tabular-nums sm:mt-2.5 sm:leading-[44px]">
            <Counter value={qty * price} format={rupiah} />
          </p>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-text-muted">Pengiriman atau pickup dipilih saat checkout.</p>

      <motion.div whileTap={{ scale: 0.99 }} className="mt-5">
        <Link
          href={`/checkout?lot=${lot.slug}&qty=${qty}`}
          className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-semibold text-on-dark transition-colors hover:bg-brand-hover"
        >
          Lanjut checkout
          <Icon name="arrow-up-right" size={16} />
        </Link>
      </motion.div>
      <p className="mt-3.5 text-[12px] leading-[1.45] text-text-muted">
        Khusus UMKM terverifikasi · Ongkir belum termasuk
        {auction ? ". Kamu membayar harga yang berlaku saat membayar." : ""}
      </p>
    </aside>
  );
}

/* ───────── Spesifikasi dan catatan ───────── */
function Specs({ lot }: { lot: Lot }) {
  const rows: [string, string][] = [
    ["Jenis material", lot.spec.jenis],
    ["Komposisi", lot.spec.komposisi],
    [lot.category === "Kain" ? "Ukuran potongan" : "Ukuran (size)", lot.spec.ukuran],
    ["Warna", lot.spec.warna],
    ["Kondisi", lot.spec.kondisi],
    ["Satuan jual", `Per ${lot.unit}, boleh beli sebagian`],
    ["Kontaminasi", lot.spec.kontaminasi],
    ["Identitas lot", lot.code],
  ];
  return (
    <div>
      <h2 className={h2}>01 / Spesifikasi material</h2>
      <dl className="mt-5 border-t border-line">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="grid gap-x-6 border-b border-line py-3.5 sm:grid-cols-[minmax(0,180px)_1fr] lg:grid-cols-[243px_1fr]"
          >
            <dt className="text-[13px] text-text-muted">{k}</dt>
            <dd className="text-[14px] font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Notes({ lot }: { lot: Lot }) {
  return (
    <div>
      <h2 className={h2}>02 / Catatan kondisi</h2>
      <div className="mt-5 border-t border-line pt-5">
        <p className="text-[15px] leading-[22px] text-text-muted">{lot.notes}</p>
      </div>
      <div className={`${rule} mt-8`} />
      <h3 className="mt-6 text-[14px] font-medium">Catatan dari pabrik</h3>
      <p className="mt-2 text-[14px] leading-[21px] text-text-muted">
        Informasi kondisi bersifat deklarasi. Periksa foto dan video lot sebelum memesan; bukti material aktual
        perlu diunggah pabrik.
      </p>
      <div className={`${rule} mt-8`} />
      <h3 className="mt-6 text-[14px] font-medium">Dokumentasi lot</h3>
      <p className="mt-2 text-[14px] leading-[21px] text-text-muted">
        Foto timbangan, identitas batch dan video tersedia dalam galeri apabila telah diunggah.
      </p>
    </div>
  );
}

/* ───────── Rating dan ulasan ───────── */
const LABELS = ["Sangat kurang", "Kurang", "Cukup", "Bagus", "Sangat bagus"];

function Reviews({ lot }: { lot: Lot }) {
  const r = lot.reviews;
  const [filter, setFilter] = useState<number | "semua">("semua");
  const [note, setNote] = useState<string | null>(null);

  const total = r ? r.counts.reduce((a, b) => a + b, 0) : 0;
  const shown = r ? r.items.filter((i) => filter === "semua" || i.stars === filter) : [];

  return (
    <section aria-label="Rating dan ulasan pembeli">
      <h2 className={h2}>03 / Rating &amp; ulasan pembeli</h2>
      <p className="mt-2 text-[13px] text-text-muted">Contoh tampilan ulasan · data simulasi</p>
      <div className={`${rule} mt-6`} />

      <div className="grid gap-10 py-8 md:grid-cols-[200px_1fr] lg:grid-cols-[260px_minmax(0,1fr)_346px] lg:gap-16">
        <div>
          <p className="font-display text-[clamp(56px,6vw,76px)] leading-none">
            {r ? r.average.toLocaleString("id-ID", { minimumFractionDigits: 1 }) : "–"}
          </p>
          <div className="mt-3">
            <Stars value={r ? Math.round(r.average) : 0} size={18} />
          </div>
          <p className="mt-3 text-[14px] text-text-muted">
            {r ? `dari 5 · ${total} penilaian` : "Belum ada penilaian"}
          </p>
        </div>

        <ul className="flex flex-col gap-3 self-center">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = r ? r.counts[n - 1] : 0;
            return (
              <li key={n} className="grid grid-cols-[18px_150px_1fr_24px] items-center gap-3 text-[13px] sm:grid-cols-[18px_130px_1fr_24px]">
                <span className="flex items-center gap-1 font-medium">
                  {n}
                </span>
                <span className="flex items-center gap-2 text-text-muted">
                  <Icon name="star-filled" size={14} className="text-brand" />
                  {LABELS[n - 1]}
                </span>
                <span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-brand-soft">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${total ? (c / total) * 100 : 0}%` }} />
                </span>
                <span className="text-right font-medium tabular-nums text-text-muted">{c}</span>
              </li>
            );
          })}
        </ul>

        <div className="md:col-span-2 lg:col-span-1">
          <p className="text-[16px] font-medium">Bagaimana kualitas materialnya?</p>
          <p className="mt-2 text-[13px] text-text-muted">Ulasan hanya dapat ditulis setelah transaksi selesai.</p>
          <button
            type="button"
            onClick={() => setNote("Demo: tulis ulasan aktif setelah pesananmu selesai dan kamu konfirmasi barang diterima.")}
            className="mt-5 h-11 w-full rounded-[10px] border border-brand bg-panel text-[14px] font-semibold text-brand transition-colors hover:bg-brand-soft"
          >
            Tulis ulasan
          </button>
        </div>
      </div>

      <div className={rule} />

      <div className="flex flex-col gap-4 pb-2 pt-7 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-[22px] font-semibold">Ulasan pembeli</h3>
          <p className="mt-1 text-[13px] text-text-muted">{r ? `${total} ulasan · contoh` : "0 ulasan"}</p>
        </div>
        {r && (
          <div role="group" aria-label="Saring ulasan" className="flex flex-wrap gap-2">
            {(["semua", 5, 4, 3, 2, 1] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`h-9 rounded-full border px-4 text-[12px] font-medium transition-colors ${
                  filter === f
                    ? "border-brand bg-brand text-on-dark"
                    : "border-line bg-panel text-text-muted hover:bg-brand-soft"
                }`}
              >
                {f === "semua" ? "Semua" : `${f} bintang`}
              </button>
            ))}
          </div>
        )}
      </div>

      {r ? (
        <ul>
          {shown.length === 0 && <li className="py-8 text-[14px] text-text-muted">Belum ada ulasan dengan bintang ini.</li>}
          {shown.map((v) => (
            <li key={v.name} className="grid grid-cols-[42px_1fr] gap-x-4 border-b border-line py-6">
              <span className="flex size-[42px] items-center justify-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand">
                {v.initials}
              </span>
              <div>
                <p className="text-[15px] font-semibold">{v.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-text-muted">
                  <Icon name="map-pin" size={13} />
                  {v.place}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-text-muted">
                  <Stars value={v.stars} />
                  <span>
                    {v.date} · {v.qty} · Contoh pembelian
                  </span>
                </div>
                <p className="mt-3 max-w-[1160px] text-[15px] leading-[22px]">{v.text}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-b border-line py-8 text-[14px] text-text-muted">
          Belum ada ulasan untuk lot ini. Ulasan muncul setelah pembeli menyelesaikan transaksi.
        </p>
      )}

      <div className="flex flex-col gap-4 pt-8 md:flex-row md:items-center md:justify-between">
        {r && (
          <button
            type="button"
            onClick={() => setNote(`Demo: hanya ${r.items.length} ulasan contoh yang tersedia, bukan ${total}.`)}
            className="h-10 w-fit rounded-[10px] border border-line bg-panel px-5 text-[13px] font-medium text-brand transition-colors hover:bg-brand-soft"
          >
            Lihat semua ulasan
          </button>
        )}
        <p className="text-[12px] text-text-muted md:max-w-[346px]">Ulasan di atas adalah contoh UI, bukan penilaian nyata.</p>
      </div>
      <div role="status" className="min-h-5">
        <AnimatePresence mode="wait">
          {note && (
            <motion.p
              key={note}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-3 text-[13px] text-text-soft"
            >
              {note}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default function LotDetail({ lot, related }: { lot: Lot; related: Lot[] }) {
  return (
    <div className="pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between gap-4 text-[13px]">
          <nav aria-label="Jalur halaman" className="min-w-0 truncate text-text-muted">
            <Link href="/katalog" className="hover:text-text">
              Katalog
            </Link>
            {"  /  "}
            {lot.category}
            {"  /  "}
            <span aria-current="page">{lot.title}</span>
          </nav>
          <Link href="/katalog" className="flex shrink-0 items-center gap-1.5 font-medium text-brand hover:text-brand-hover">
            <Icon name="arrow-left" size={14} />
            Kembali ke katalog
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-[minmax(0,1fr)] items-start gap-x-[60px] gap-y-10 lg:grid-cols-[minmax(0,1fr)_540px]">
          <div className="lg:col-start-1 lg:row-start-1">
            <Gallery lot={lot} />
          </div>
          {/* Panel beli membentang di samping galeri, spesifikasi, dan catatan: menempel saat scroll
              dan tidak pernah menimpa konten, karena kolom kirinya yang panjang. */}
          <div className="lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-stretch">
            <BuyPanel lot={lot} />
          </div>
          <div className="lg:col-start-1 lg:row-start-2">
            <Specs lot={lot} />
          </div>
          <div className="lg:col-start-1 lg:row-start-3">
            <Notes lot={lot} />
          </div>
        </div>

        <div className="mt-16 md:mt-20">
          <Reviews lot={lot} />
        </div>

        {related.length > 0 && (
          <section aria-label="Lot lain" className="mt-16 border-t border-line pt-10 md:mt-20">
            <div className="flex items-end justify-between gap-6">
              <h2 className={h2}>Lot lain</h2>
              <Link
                href="/katalog"
                className="flex items-center gap-1.5 pb-1 text-[13px] font-medium text-brand hover:text-brand-hover"
              >
                Semua lot
                <Icon name="arrow-up-right" size={14} />
              </Link>
            </div>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((l, i) => (
                <li key={l.slug}>
                  <LotCard lot={l} index={i} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className={`${rule} mt-16`} />
        <p className="py-5 text-[12px] text-text-muted">
          Data, harga, foto dan ulasan pada desain ini merupakan ilustrasi demo; bukan transaksi atau bukti mutu
          aktual.
        </p>
      </div>
    </div>
  );
}
