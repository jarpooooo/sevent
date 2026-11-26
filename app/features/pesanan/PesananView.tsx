"use client";

import { m as motion } from "motion/react";
import Link from "next/link";
import { Icon } from "../../components/ui/icons";
import { panel } from "../../components/ui/styles";
import { num, rupiah } from "../../lib/format";
import { advanceOrder, clearOrders, ORDER_STEPS, type Order, useOrders } from "./orders";

/** Contoh yang tampil hanya saat belum ada pesanan, supaya alur status terlihat. Tidak disimpan. */
const SAMPLE: Order = {
  id: "CL-CONTOH",
  slug: "offcut-denim-polos",
  code: "DM-024",
  title: "Offcut denim polos",
  unit: "kg",
  qty: 25,
  price: 4000,
  pickup: "ambil",
  status: 2,
  createdAt: "2026-11-24T08:00:00.000Z",
  model: "tetap",
};

const when = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

function OrderCard({ o, sample = false }: { o: Order; sample?: boolean }) {
  const steps = ORDER_STEPS(o.pickup);
  const total = o.qty * o.price;
  return (
    <article className={`${panel} p-6 sm:p-7`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[12px] text-text-muted">
            {o.id} · {when(o.createdAt)} · Lot {o.code}
            {sample && " · Contoh demo"}
          </p>
          <h2 className="mt-1 text-[18px] font-semibold leading-snug">
            <Link href={`/katalog/${o.slug}`} className="underline-offset-4 hover:underline">
              {o.title}
            </Link>
          </h2>
          <p className="mt-1 text-[13px] text-text-muted">
            {num(o.qty)} {o.unit} × {rupiah(o.price)} · {o.pickup === "ambil" ? "Ambil sendiri" : "Diantar"}
          </p>
        </div>
        <p className="font-display text-[24px] tabular-nums sm:text-right">{rupiah(total)}</p>
      </div>

      <ol className="mt-6 grid gap-4 sm:grid-cols-4">
        {steps.map((s, i) => {
          const done = i <= o.status;
          const now = i === o.status;
          return (
            <li key={s.t} aria-current={now ? "step" : undefined} className="relative">
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0 h-[3px] w-full rounded-full ${done ? "bg-brand" : "bg-brand-soft"}`}
              />
              <p className={`pt-3 text-[14px] ${done ? "font-semibold" : "text-text-muted"}`}>{s.t}</p>
              <p className="mt-1 text-[12px] leading-[1.4] text-text-muted">{s.d}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {o.status === 2 && !sample && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => advanceOrder(o.id)}
            className="h-11 rounded-[10px] bg-brand px-5 text-[14px] font-semibold text-on-dark transition-colors hover:bg-brand-hover"
          >
            Konfirmasi barang diterima
          </motion.button>
        )}
        {o.status < 2 && !sample && (
          <button
            type="button"
            onClick={() => advanceOrder(o.id)}
            className="h-11 rounded-[10px] border border-brand px-5 text-[14px] font-semibold text-brand transition-colors hover:bg-brand-soft"
          >
            Simulasikan tahap berikutnya
          </button>
        )}
        {o.status === 3 && (
          <p className="text-[14px] text-text-soft">
            Selesai. Dana sudah diteruskan ke pabrik.{" "}
            <Link href={`/katalog/${o.slug}`} className="font-medium text-brand underline underline-offset-4">
              Lihat lot dan tulis ulasan
            </Link>
          </p>
        )}
        {sample && (
          <p className="text-[13px] text-text-muted">
            Ini contoh agar alur terlihat. Pesanan sungguhanmu muncul di sini setelah checkout.
          </p>
        )}
        {!sample && o.status < 3 && (
          <p className="text-[12px] text-text-muted">Tombol ini mensimulasikan tahap pabrik dan kurir (demo).</p>
        )}
      </div>
    </article>
  );
}

export default function PesananView() {
  const orders = useOrders();

  return (
    <section aria-label="Pesanan saya" className="pt-[72px]">
      <div className="mx-auto max-w-[1100px] px-5 pb-16 pt-8 sm:px-10 lg:pt-11">
        <h1 className="font-display text-[clamp(36px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">Pesanan saya</h1>
        <p className="mt-3 max-w-[560px] text-[16px] leading-6 text-text-muted">
          Pantau pesananmu dari bayar sampai bahan tiba. Dana baru sampai ke pabrik setelah kamu konfirmasi diterima.
        </p>

        <div className="mt-8 flex flex-col gap-5">
          {orders.length === 0 ? (
            <>
              <OrderCard o={SAMPLE} sample />
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <p className="text-[15px] text-text-muted">Belum ada pesananmu.</p>
                <Link
                  href="/katalog"
                  className="flex items-center gap-2 rounded-[10px] bg-brand px-5 py-3 text-[14px] font-medium text-on-dark transition-colors hover:bg-brand-hover"
                >
                  Buka katalog
                  <Icon name="arrow-up-right" size={16} />
                </Link>
              </div>
            </>
          ) : (
            <>
              {orders.map((o) => (
                <OrderCard key={o.id} o={o} />
              ))}
              <button
                type="button"
                onClick={clearOrders}
                className="w-fit text-[13px] text-text-muted underline underline-offset-4 hover:text-text"
              >
                Hapus semua pesanan demo
              </button>
            </>
          )}
        </div>

        <p className="mt-12 text-[12px] text-text-muted">
          Data dan pesanan di halaman ini adalah demo, tersimpan hanya di browsermu; bukan transaksi sebenarnya.
        </p>
      </div>
    </section>
  );
}
