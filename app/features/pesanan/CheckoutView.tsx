"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Icon } from "../../components/ui/icons";
import { panel } from "../../components/ui/styles";
import { useAuction } from "../katalog/auction";
import Counter from "../../components/ui/Counter";
import type { Lot } from "../../lib/domain/types";
import { num, rupiah } from "../../lib/format";
import { addOrder, type Pickup } from "./orders";

const EASE = [0.16, 1, 0.3, 1] as const;
const card = `${panel} p-6 sm:p-7`;
const h2 = "font-display text-[22px] leading-tight tracking-[-0.02em]";

function Checkout({ lot, initialQty }: { lot: Lot; initialQty: number }) {
  const id = useId();
  const router = useRouter();
  const auction = useAuction(lot);
  const price = auction ? auction.price : (lot.price ?? 0);

  const min = Math.min(lot.moq, lot.stock);
  const qty = Math.max(min, Math.min(lot.stock, initialQty));
  const [pickup, setPickup] = useState<Pickup>("ambil");
  const [address, setAddress] = useState("");
  const [tried, setTried] = useState(false);

  const subtotal = qty * price;
  const needAddress = pickup === "kirim" && address.trim().length < 10;

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (needAddress) return;
    addOrder({
      slug: lot.slug,
      code: lot.code,
      title: lot.title,
      unit: lot.unit,
      qty,
      price,
      pickup,
      address: pickup === "kirim" ? address.trim() : undefined,
      model: lot.model,
    });
    router.push("/pesanan-saya");
  };

  return (
    <form onSubmit={pay} className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-[60px] gap-y-8 lg:grid-cols-[minmax(0,1fr)_460px]" noValidate>
      <div className="flex flex-col gap-6">
        {/* Lot */}
        <section aria-label="Lot yang dibeli" className={card}>
          <h2 className={h2}>Lot yang dibeli</h2>
          <div className="mt-5 flex gap-4">
            <div className="relative h-[84px] w-[112px] shrink-0 overflow-hidden rounded-[10px] bg-inverse">
              <Image
                src={lot.photo}
                alt={lot.alt}
                fill
                sizes="112px"
                className="object-cover"
                style={{ objectPosition: lot.focus }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] text-text-muted">Lot {lot.code}</p>
              <p className="text-[16px] font-semibold leading-snug">{lot.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-text-muted">
                <Icon name="map-pin" size={13} />
                Pabrik di {lot.origin}
              </p>
              <p className="mt-2 text-[14px] tabular-nums">
                {num(qty)} {lot.unit} × {rupiah(price)}
              </p>
            </div>
          </div>
          <Link
            href={`/katalog/${lot.slug}`}
            className="mt-4 inline-block text-[13px] font-medium text-brand underline underline-offset-4 hover:text-brand-hover"
          >
            Ubah jumlah di halaman lot
          </Link>
        </section>

        {/* Cara terima */}
        <fieldset className={card}>
          <legend className="sr-only">Cara terima</legend>
          <h2 className={h2} aria-hidden="true">
            Cara terima
          </h2>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {(
              [
                { v: "ambil", t: "Ambil sendiri", s: "Rp0. Ambil di lokasi pabrik." },
                { v: "kirim", t: "Minta diantar", s: "Ongkir dihitung setelah alamat dikonfirmasi." },
              ] as const
            ).map((o) => {
              const on = pickup === o.v;
              return (
                <label
                  key={o.v}
                  className={`relative cursor-pointer rounded-[12px] border px-4 py-3.5 transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
                    on ? "border-brand text-on-dark" : "border-line bg-card hover:bg-card/70"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${id}-pickup`}
                    value={o.v}
                    checked={on}
                    onChange={() => setPickup(o.v)}
                    className="sr-only"
                  />
                  {on && (
                    <motion.span
                      layoutId="co-pickup"
                      className="absolute inset-0 rounded-[11px] bg-brand"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative block text-[15px] font-medium">{o.t}</span>
                  <span className={`relative mt-0.5 block text-[13px] ${on ? "text-on-dark-muted" : "text-text-muted"}`}>
                    {o.s}
                  </span>
                </label>
              );
            })}
          </div>

          <AnimatePresence initial={false}>
            {pickup === "kirim" && (
              <motion.div
                key="alamat"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="pt-5">
                  <label htmlFor={`${id}-alamat`} className="text-[14px] font-medium">
                    Alamat pengiriman
                  </label>
                  <textarea
                    id={`${id}-alamat`}
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    aria-invalid={tried && needAddress}
                    aria-describedby={`${id}-alamat-err`}
                    placeholder="Jalan, kelurahan, kecamatan, kota"
                    className="mt-2 w-full resize-none rounded-[10px] border border-line bg-card p-3.5 text-[15px] outline-none placeholder:text-text-placeholder focus:border-brand"
                  />
                  <p id={`${id}-alamat-err`} role="alert" className="mt-1.5 min-h-5 text-[13px] text-text-soft">
                    {tried && needAddress ? "Isi alamat lengkap supaya pabrik bisa menghitung ongkir." : ""}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </fieldset>
      </div>

      {/* Rincian */}
      <aside aria-label="Rincian pembayaran" className={`${card} lg:sticky lg:top-[96px]`}>
        <h2 className={h2}>Rincian pembayaran</h2>
        <p className="mt-2 text-[13px] text-text-muted">Atas nama Sari Jahit · UMKM (akun demo)</p>

        <dl className="mt-5 border-y border-line [&>div]:flex [&>div]:items-baseline [&>div]:justify-between [&>div]:gap-4 [&>div]:py-3 [&>div+div]:border-t [&>div+div]:border-line">
          <div>
            <dt className="text-[14px] text-text-muted">
              {num(qty)} {lot.unit} × {rupiah(price)}
            </dt>
            <dd className="text-[15px] tabular-nums">
              <Counter value={subtotal} format={rupiah} />
            </dd>
          </div>
          <div>
            <dt className="text-[14px] text-text-muted">Biaya platform untukmu</dt>
            <dd className="text-[15px]">Rp0</dd>
          </div>
          <div>
            <dt className="text-[14px] text-text-muted">{pickup === "ambil" ? "Ambil sendiri" : "Ongkir"}</dt>
            <dd className="text-[15px]">{pickup === "ambil" ? "Rp0" : "Dihitung kemudian"}</dd>
          </div>
          <div>
            <dt className="text-[14px] font-medium">Perkiraan total</dt>
            <dd className="font-display text-[26px] tabular-nums">
              <Counter value={subtotal} format={rupiah} />
            </dd>
          </div>
        </dl>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.99 }}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-semibold text-on-dark transition-colors hover:bg-brand-hover"
        >
          Bayar (demo)
          <Icon name="arrow-up-right" size={16} />
        </motion.button>

        <p className="mt-4 text-[13px] leading-[1.45] text-text-soft">
          Dana ditahan penyedia pembayaran (PJP). Baru diteruskan ke pabrik setelah kamu konfirmasi bahan
          diterima.
        </p>
        <p className="mt-3 text-[12px] leading-[1.45] text-text-muted">
          Komisi platform 2% ditanggung pabrik, bukan kamu.{" "}
          {lot.model === "lelang" ? "Harga lelang di atas adalah harga yang berlaku saat ini. " : ""}
          Demo: tidak ada uang yang bergerak.
        </p>
      </aside>
    </form>
  );
}

/** Lot dan jumlah dibaca di server (halaman checkout) lalu dikirim sebagai props. */
export default function CheckoutView({ lot, qty }: { lot?: Lot; qty: number }) {
  return (
    <section aria-label="Checkout" className="pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-6 sm:px-10 lg:px-16">
        <Link
          href={lot ? `/katalog/${lot.slug}` : "/katalog"}
          className="inline-flex items-center gap-1.5 py-2 text-[13px] font-medium text-brand hover:text-brand-hover"
        >
          <Icon name="arrow-left" size={14} />
          {lot ? "Kembali ke lot" : "Kembali ke katalog"}
        </Link>
        <h1 className="font-display mt-3 text-[clamp(32px,3.6vw,44px)] leading-[1.1] tracking-[-0.03em]">Checkout</h1>

        <div className="mt-8">
          {lot ? (
            <Checkout key={lot.slug + qty} lot={lot} initialQty={qty} />
          ) : (
            <div className="max-w-[460px] py-6">
              <h2 className="font-display text-[26px] tracking-[-0.02em]">Belum ada lot yang dipilih.</h2>
              <p className="mt-3 text-[16px] leading-6 text-text-muted">
                Pilih lot dan jumlahnya di katalog, lalu lanjut ke checkout dari halaman lot.
              </p>
              <Link
                href="/katalog"
                className="mt-6 inline-block rounded-[10px] bg-brand px-5 py-3 text-[14px] font-medium text-on-dark transition-colors hover:bg-brand-hover"
              >
                Buka katalog
              </Link>
            </div>
          )}
        </div>
        <p className="mt-12 text-[12px] text-text-muted">
          Data, harga, dan pesanan di halaman ini adalah demo; bukan transaksi sebenarnya.
        </p>
      </div>
    </section>
  );
}
