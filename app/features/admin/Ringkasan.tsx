"use client";

import { ArrowUpRight, PackageCheck, PencilLine, ShieldAlert, Truck, type LucideIcon } from "lucide-react";
import { m as motion } from "motion/react";
import Link from "next/link";
import Counter from "../../components/ui/Counter";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";
import { num } from "../../lib/format";
import { V_LABEL, type VStatus, useAkun, usePesanan, vstatus } from "./data";
import { Card, PageHead } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const SHORT = ["Dibuat", "Dibayar", "Disiapkan", "Dikirim", "Diterima", "Selesai"];

/** Satu angka besar dengan meteran 10 ubin (porsi dari total). */
function Kpi({ label, value, of, hint, i, Icon }: { label: string; value: number; of: number; hint: string; i: number; Icon: LucideIcon }) {
  const reduce = useSafeReducedMotion();
  return (
    <motion.div
      className="flex flex-col gap-4 rounded-[2px] border border-line bg-panel p-5"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.08 * i }}
    >
      <p className="flex items-center justify-between gap-2 text-[13px] text-text-muted">
        {label}
        <Icon aria-hidden="true" className="size-[18px] text-brand" strokeWidth={1.8} />
      </p>
      <p className="font-display text-[44px] leading-none tabular-nums tracking-[-0.03em]">
        <Counter value={value} format={num} />
      </p>
      <div aria-hidden="true" className="h-1.5 overflow-hidden bg-brand-soft">
        <motion.div
          className="h-full bg-brand"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: of ? value / of : 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: reduce ? 0 : 0.25 + 0.08 * i }}
          style={{ originX: 0 }}
        />
      </div>
      <p className="text-[12px] text-text-muted">{hint}</p>
    </motion.div>
  );
}

const SEG: { v: VStatus; bg: string }[] = [
  { v: "ok", bg: "bg-brand" },
  { v: "menunggu", bg: "bg-accent" },
  { v: "revisi", bg: "bg-warn-soft" },
  { v: "belum", bg: "bg-brand-soft" },
];

/** Satu bar bertumpuk: lebar tiap segmen sebanding dengan jumlahnya, dengan hitungan di legenda. */
function StackBar({ label, href, items }: { label: string; href: string; items: VStatus[] }) {
  const reduce = useSafeReducedMotion();
  const total = items.length || 1;
  return (
    <div className="flex flex-col gap-2.5">
      <p className="flex items-baseline justify-between text-[13px]">
        <Link href={href} className="font-medium hover:text-brand">
          {label}
        </Link>
        <span className="tabular-nums text-text-muted">{items.length} akun</span>
      </p>
      <div role="img" aria-label={`${label}: ${SEG.map((s) => `${items.filter((x) => x === s.v).length} ${V_LABEL[s.v]}`).join(", ")}`} className="flex h-3 w-full overflow-hidden bg-brand-soft">
        {SEG.map((s, i) => {
          const n = items.filter((x) => x === s.v).length;
          return n ? (
            <motion.div
              key={s.v}
              className={s.bg}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${(n / total) * 100}%` }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.08 }}
            />
          ) : null;
        })}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-text-muted">
        {SEG.map((s) => (
          <li key={s.v} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`block size-2.5 ${s.bg} ${s.v === "revisi" ? "border border-accent" : ""}`} />
            {V_LABEL[s.v]} <span className="tabular-nums text-text">{items.filter((x) => x === s.v).length}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Ringkasan() {
  const umkm = useAkun("umkm");
  const pabrik = useAkun("pabrik");
  const pesanan = usePesanan();
  const reduce = useSafeReducedMotion();

  const akun = [...umkm, ...pabrik];
  const menunggu = akun.filter((a) => vstatus(a.p) === "menunggu");
  const revisi = akun.filter((a) => vstatus(a.p) === "revisi").length;
  const berjalan = pesanan.filter(({ o }) => o.status >= 1 && o.status <= 3).length;
  const kurir = pesanan.filter(({ o, sample }) => !sample && o.pickup === "kirim" && o.status === 3);

  const maxN = Math.max(0, ...SHORT.map((_, s) => pesanan.filter(({ o }) => o.status === s).length));
  const queue = [
    ...menunggu.map((a) => ({ id: a.id, href: `/admin/${a.kind}/detail?id=${a.id}`, t: `Periksa ${a.p.business}`, d: a.kind === "umkm" ? "Verifikasi UMKM" : "Verifikasi pabrik" })),
    ...kurir.map(({ o }) => ({ id: o.id, href: `/admin/pesanan/detail?id=${o.id}`, t: `Teruskan konfirmasi kurir #${o.id}`, d: `Diantar ${o.courier ?? "kurir"}` })),
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHead title="Ringkasan" desc="Yang perlu diputuskan hari ini: verifikasi akun dan konfirmasi kurir, plus gambaran status akun dan pesanan." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi i={0} Icon={ShieldAlert} label="Menunggu verifikasi" value={menunggu.length} of={akun.length} hint={`dari ${akun.length} akun UMKM dan pabrik`} />
        <Kpi i={1} Icon={PencilLine} label="Perlu revisi" value={revisi} of={akun.length} hint="menunggu pengguna melengkapi data" />
        <Kpi i={2} Icon={Truck} label="Pesanan berjalan" value={berjalan} of={pesanan.length} hint={`dari ${pesanan.length} pesanan`} />
        <Kpi i={3} Icon={PackageCheck} label="Konfirmasi kurir" value={kurir.length} of={pesanan.length} hint="paket terkirim, menunggu diteruskan" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card title="Status verifikasi" desc="Sebaran akun menurut status. Lebar bar mengikuti jumlah, jadi tetap terbaca untuk ratusan akun.">
          <div className="flex flex-col gap-6">
            <StackBar label="UMKM" href="/admin/umkm" items={umkm.map((a) => vstatus(a.p))} />
            <StackBar label="Pabrik" href="/admin/pabrik" items={pabrik.map((a) => vstatus(a.p))} />
          </div>
        </Card>

        <Card title="Antrean tindakan" desc={queue.length ? `${queue.length} hal menunggu keputusanmu.` : "Tidak ada yang menunggu."}>
          {queue.length === 0 ? (
            <p className="text-[14px] text-text-muted">Antrean kosong. Akun baru atau paket terkirim akan muncul di sini.</p>
          ) : (
            <ul className="flex flex-col">
              {queue.slice(0, 6).map((q, i) => (
                <motion.li
                  key={q.id}
                  className="border-t border-line first:border-t-0"
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.3 + i * 0.06 }}
                >
                  <Link href={q.href} className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-brand">
                    <span className="flex flex-col">
                      <span className="text-[14px] font-medium">{q.t}</span>
                      <span className="text-[12px] text-text-muted">{q.d}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[13px] text-brand">
                      Buka
                      <ArrowUpRight aria-hidden="true" className="size-3.5" strokeWidth={2} />
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Pesanan per tahap" desc="Tinggi batang mengikuti jumlah pesanan di tiap tahap. Klik batang untuk membuka daftar pesanan yang sudah disaring ke tahap itu.">
        <div className="grid grid-cols-6 items-end gap-3 sm:gap-5" role="list" aria-label="Pesanan per tahap">
          {SHORT.map((label, s) => {
            const n = pesanan.filter(({ o }) => o.status === s).length;
            return (
              <div key={label} role="listitem">
                <Link
                  href={`/admin/pesanan?tahap=${s}`}
                  aria-label={`${label}, ${n} pesanan. Buka daftar pesanan di tahap ini.`}
                  className="group flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                >
                  <div className="flex h-[160px] flex-col justify-end">
                    <p className="mb-1.5 text-center font-display text-[20px] leading-none tabular-nums">{n}</p>
                    <motion.div
                      className={`transition-opacity group-hover:opacity-80 ${s >= 4 ? "bg-brand" : s === 0 ? "bg-brand-soft" : "bg-accent"}`}
                      initial={reduce ? false : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.2 + s * 0.07 }}
                      style={{ height: `${maxN ? Math.max(n ? 4 : 1, (n / maxN) * 120) : 1}px`, originY: 1 }}
                    />
                  </div>
                  <p className="border-t border-line pt-2 text-center text-[12px] leading-4 text-text-muted group-hover:text-text">{label}</p>
                </Link>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
