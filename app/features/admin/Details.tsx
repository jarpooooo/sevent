"use client";

import { m as motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { StatusPill } from "../../components/ui/table";
import { inputBox } from "../../components/ui/styles";
import { LOTS } from "../../lib/data/seed/lots";
import { PENGELUARAN_LABEL } from "../../lib/domain/types";
import { num, rupiah } from "../../lib/format";
import { saveProfil, SEKTOR_LABEL } from "../akun/profil";
import DokumenMenu from "../dokumen/DokumenMenu";
import { LockTiles, LotThumb } from "../pabrik/tiles";
import { advanceOrder, ORDER_STEPS } from "../umkm/pesanan/orders";
import { type Kind, V_LABEL, V_TONE, kotaOf, tgl, useAkunById, usePesanan, vstatus } from "./data";
import { back, Card, Kv, PageHead } from "./ui";

const btn = "h-11 rounded-[2px] px-5 text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const NotFound = ({ href, label }: { href: string; label: string }) => (
  <div className="flex flex-col items-start gap-4">
    <PageHead title="Tidak ditemukan" desc="Data ini tidak ada di browser ini." />
    {back(href, label)}
  </div>
);

const mask = (n?: string) => (n && n.length > 4 ? `•••• ${n.slice(-4)}` : n || "");

/** Detail satu akun UMKM atau pabrik, dengan keputusan verifikasi untuk akun demo milik browser ini. */
export function DetailAkun({ kind }: { kind: Kind }) {
  const id = useSearchParams().get("id");
  const a = useAkunById(kind, id);
  const [note, setNote] = useState("");
  const [asking, setAsking] = useState(false);
  const umkm = kind === "umkm";
  const list = `/admin/${kind}`;
  if (!a) return <NotFound href={list} label={`Kembali ke daftar ${umkm ? "UMKM" : "pabrik"}`} />;

  const p = a.p;
  const v = vstatus(p);
  const pending = !a.sample && v === "menunggu";
  const decide = (ok: boolean) => {
    saveProfil(kind, ok ? { ...p, approvedAt: new Date().toISOString(), revisionNote: undefined } : { ...p, submittedAt: undefined, approvedAt: undefined, revisionNote: note.trim() || "Lengkapi bukti usaha lalu kirim ulang." });
    setAsking(false);
    setNote("");
  };

  const steps = umkm ? ["Identitas", "Bukti usaha", "Kebutuhan material", "Cek admin"] : ["Identitas", "Izin dan bukti usaha", "Cek admin"];
  const done = v === "ok" ? steps.length : v === "menunggu" ? steps.length - 1 : p.docs.length || p.nib ? 2 : 1;

  return (
    <div className="flex flex-col gap-7">
      {back(list, `Kembali ke daftar ${umkm ? "UMKM" : "pabrik"}`)}
      <PageHead
        title={p.business}
        desc={`${p.person}${p.jabatan ? `, ${p.jabatan}` : ""}. ${kotaOf(p)}, ${p.provinsi ?? ""}.`}
        action={<StatusPill tone={V_TONE[v]}>{V_LABEL[v]}</StatusPill>}
      />
      {a.sample && <p className="rounded-[2px] bg-warn-soft px-4 py-3 text-[13px] leading-5">Baris contoh demo: data rekaan, tidak bisa diubah. Akun demo milik browser ini bisa diputuskan.</p>}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Penanggung jawab">
            <dl className="flex flex-col gap-3">
              <Kv k="Nama" v={p.person} />
              <Kv k="Jabatan" v={p.jabatan} />
              <Kv k="Telepon" v={p.phone} />
              <Kv k="Email" v={p.email} />
            </dl>
          </Card>
          <Card title={umkm ? "Usaha dan kebutuhan" : "Pabrik"}>
            <dl className="flex flex-col gap-3">
              {umkm ? (
                <>
                  <Kv k="Jenis usaha" v={p.usaha?.jenis} />
                  <Kv k="Produk utama" v={p.usaha?.produk} />
                  <Kv k="Kain dicari" v={p.needs?.fabric} />
                  <Kv k="Kebutuhan per bulan" v={p.needs?.monthlyKg ? `${p.needs.monthlyKg} kg` : ""} />
                  <Kv k="Anggaran per bulan" v={p.needs?.budget ? rupiah(Number(p.needs.budget) || 0) : ""} />
                </>
              ) : (
                <>
                  <Kv k="Kegiatan usaha" v={p.pabrik?.sektor ? SEKTOR_LABEL[p.pabrik.sektor] : ""} />
                  <Kv k="Jenis sisa utama" v={p.pabrik?.jenisSisa} />
                  <Kv k="Izin Kawasan Berikat" v={p.pabrik?.nomorIzinKB} />
                  <Kv k="Kantor pabean" v={p.pabrik?.kantorPabean} />
                  <Kv k="Petugas lapangan" v={[p.pabrik?.picNama, p.pabrik?.picTelepon].filter(Boolean).join(", ")} />
                  <Kv k="Jam serah terima" v={p.pabrik?.jamAmbil} />
                </>
              )}
            </dl>
          </Card>
          <Card title="Alamat dan pajak">
            <dl className="flex flex-col gap-3">
              <Kv k="Alamat" v={p.address} />
              <Kv k="Alamat kirim" v={p.alamatKirim || "Sama dengan alamat usaha"} />
              <Kv k="NPWP" v={p.npwp} />
              <Kv k="NIB" v={p.nib} />
              {!umkm && <Kv k="Rekening pencairan" v={p.rekening?.nomor ? `${p.rekening.bank}, ${mask(p.rekening.nomor)}, a.n. ${p.rekening.atasNama}` : ""} />}
            </dl>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Verifikasi" aside={<StatusPill tone={V_TONE[v]}>{V_LABEL[v]}</StatusPill>}>
            <ol className="grid grid-cols-2 gap-2" aria-label="Jalur verifikasi">
              {steps.map((s, i) => {
                const st = i < done ? "done" : i === done ? "now" : "next";
                return (
                  <motion.li
                    key={s}
                    className={`flex h-[64px] flex-col justify-end rounded-[2px] px-3 py-2 text-[13px] font-medium ${st === "done" ? "bg-brand text-on-dark" : st === "now" ? "bg-accent text-text" : "bg-brand-soft text-text-muted"}`}
                    initial={{ opacity: 0, scaleX: 0.6 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.08 }}
                    style={{ originX: 0 }}
                  >
                    {s}
                  </motion.li>
                );
              })}
            </ol>
            <div className="flex flex-col gap-2">
              <p className="text-[14px] font-medium">Bukti usaha</p>
              {p.docs.length ? (
                <ul className="flex flex-col gap-2">
                  {p.docs.map((d) => (
                    <li key={d} className="rounded-[2px] border border-line bg-card px-3.5 py-2 text-[13px]">
                      {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-text-muted">{p.nib ? "Hanya NIB, tanpa berkas lain." : "Belum ada berkas."}</p>
              )}
            </div>
            {p.revisionNote && v === "revisi" && <p className="rounded-[2px] bg-warn-soft px-3.5 py-3 text-[13px] leading-5">Catatan revisi: {p.revisionNote}</p>}
            {pending && !asking && (
              <div className="flex flex-wrap gap-2.5">
                <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={() => decide(true)} className={`${btn} bg-brand text-surface hover:bg-brand-hover`}>
                  Setujui
                </motion.button>
                <button type="button" onClick={() => setAsking(true)} className={`${btn} border border-border-strong hover:bg-card`}>
                  Minta revisi
                </button>
              </div>
            )}
            {pending && asking && (
              <div className="flex flex-col gap-2.5">
                <label htmlFor="rev" className="text-[14px] font-medium">
                  Catatan revisi
                </label>
                <textarea id="rev" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={`${inputBox} h-auto resize-y py-3 leading-5`} />
                <div className="flex gap-2.5">
                  <button type="button" onClick={() => decide(false)} className={`${btn} bg-brand text-surface hover:bg-brand-hover`}>
                    Kirim catatan
                  </button>
                  <button type="button" onClick={() => setAsking(false)} className={`${btn} border border-border-strong hover:bg-card`}>
                    Batal
                  </button>
                </div>
              </div>
            )}
            {!pending && !a.sample && v !== "ok" && <p className="text-[13px] text-text-muted">Menunggu pengguna mengirim data untuk diperiksa.</p>}
            <p className="text-[12px] text-text-muted">Bergabung {tgl(a.joined)}.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

const SHORT = ["Dibuat", "Dibayar", "Disiapkan", "Dikirim", "Diterima", "Selesai"];

/** Detail satu pesanan: tahap, Compliance Lock, konfirmasi kurir, dan dokumen. */
export function DetailPesanan() {
  const id = useSearchParams().get("id");
  const r = usePesanan().find(({ o }) => o.id === id);
  if (!r) return <NotFound href="/admin/pesanan" label="Kembali ke daftar pesanan" />;
  const { o, sample } = r;
  const kirim = o.pickup === "kirim";
  const lot = LOTS.find((l) => l.slug === o.slug);
  const lock = o.statusPengeluaran ?? "draf";
  const steps = ORDER_STEPS(o.pickup);

  return (
    <div className="flex flex-col gap-7">
      {back("/admin/pesanan", "Kembali ke daftar pesanan")}
      <PageHead
        title={`Pesanan #${o.id}`}
        desc={`${o.title}, ${num(o.qty)} ${o.unit}, ${rupiah(o.qty * o.price)}. Dibuat ${tgl(o.createdAt)}.`}
        action={<StatusPill tone={o.status === 0 ? "wait" : o.status === 5 ? "idle" : "ok"}>{steps[o.status].t}</StatusPill>}
      />
      {sample && <p className="rounded-[2px] bg-warn-soft px-4 py-3 text-[13px] leading-5">Pesanan contoh demo: tidak bisa diubah.</p>}

      <Card title="Tahap pesanan">
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Tahap pesanan">
          {SHORT.map((s, i) => (
            <motion.li
              key={s}
              aria-current={i === o.status ? "step" : undefined}
              className={`flex h-[60px] flex-col justify-end rounded-[2px] px-3 py-2 text-[13px] font-medium ${i < o.status ? "bg-brand text-on-dark" : i === o.status ? "bg-accent text-text" : "bg-brand-soft text-text-muted"}`}
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.06 * i }}
              style={{ originX: 0 }}
            >
              {s}
            </motion.li>
          ))}
        </ol>
      </Card>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Ringkasan">
            <div className="flex gap-4">
              <LotThumb lot={lot} seed={9} />
              <p className="text-[13px] leading-5 text-text-muted">
                {lot?.title ?? o.title}. {lot?.category}, {lot?.lotType}. Kode lot {o.code}.
              </p>
            </div>
            <dl className="flex flex-col gap-3">
              <Kv k="Pembeli" v={<Link className="text-brand underline underline-offset-4" href="/admin/umkm/detail?id=umkm-demo">{o.buyer ? o.buyer.business || o.buyer.person : "Sari Jahit Rumahan"}</Link>} />
              <Kv k="Pabrik" v={<Link className="text-brand underline underline-offset-4" href="/admin/pabrik/detail?id=pabrik-demo">CV Contoh Tekstil</Link>} />
              <Kv k="Penerimaan" v={kirim ? `Diantar kurir ${o.courier === "J&T" ? "J&T Express" : (o.courier ?? "JNE")}` : "Ambil sendiri"} />
              {kirim && <Kv k="Tujuan" v={o.address} />}
              <Kv k="Resi atau kode pickup" v={o.resi} />
              <Kv k="Virtual account" v={o.va} />
            </dl>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Compliance Lock" aside={<StatusPill tone={lock === "terpenuhi" ? "ok" : lock === "draf" ? "idle" : "wait"}>{PENGELUARAN_LABEL[lock]}</StatusPill>}>
            <LockTiles status={lock} />
            <p className="text-[13px] leading-5 text-text-muted">Hanya EXIM yang menyatakan persyaratan terpenuhi. Barang tidak keluar hanya karena UMKM sudah membayar.</p>
          </Card>
          {kirim && o.status === 3 && !sample && (
            <Card title="Konfirmasi kurir" desc="Paket sudah dikirim. Teruskan setelah kurir mengonfirmasi barang sampai.">
              <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={() => advanceOrder(o.id)} className={`${btn} bg-brand text-surface hover:bg-brand-hover`}>
                Teruskan konfirmasi kurir
              </motion.button>
            </Card>
          )}
          <DokumenMenu order={o} role="admin" title="Dokumen" />
        </div>
      </div>
    </div>
  );
}
