"use client";

import { m as motion } from "motion/react";
import { ClipboardList, ListChecks, Package, ShieldCheck } from "lucide-react";
import Title from "./Title";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { inputBox, panel } from "../../components/ui/styles";
import { StatusPill } from "../../components/ui/table";
import { LOTS } from "../../lib/data/seed/lots";
import { type Order, PENGELUARAN_LABEL, type PengeluaranStatus } from "../../lib/domain/types";
import { num, rupiah } from "../../lib/format";
import { Field, Grid } from "../akun/FormParts";
import DokumenMenu from "../dokumen/DokumenMenu";
import { advanceOrder, patchOrder, useOrder } from "../umkm/pesanan/orders";
import { STATUS_LABEL } from "./incoming";
import LotCustomsForm from "./LotCustomsForm";
import { customsComplete, customsOf, useLotCustomsStore } from "./lotdoc";
import PabrikPage from "./PabrikPage";
import { LockTiles, LotThumb } from "./tiles";

const LOCK_TONE: Record<PengeluaranStatus, "ok" | "wait" | "idle"> = {
  draf: "idle",
  verifikasi: "wait",
  dokumen: "wait",
  ditahan: "wait",
  terpenuhi: "ok",
};

const LOCK_TEXT: Record<PengeluaranStatus, string> = {
  draf: "Pesanan belum dikirim ke EXIM. Isi stock opname dan data kepabeanan lot, lalu tandai disiapkan.",
  verifikasi: "EXIM sedang memeriksa asal barang, klasifikasi, dan dokumen pengeluaran.",
  dokumen: "EXIM meminta dokumen tambahan. Lengkapi lalu kabari EXIM.",
  ditahan: "Pengeluaran ditahan. Barang belum boleh keluar sampai EXIM memutuskan lain.",
  terpenuhi: "EXIM menyatakan persyaratan pengeluaran terpenuhi. Barang boleh dikirim atau diambil.",
};

const btnPrimary =
  "h-11 rounded-[2px] bg-brand px-5 text-[14px] font-medium text-surface transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 text-[14px] leading-[17px]">
      <dt className="text-text-muted">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function Detail({ o }: { o: Order }) {
  const id = useId();
  const kirim = o.pickup === "kirim";
  const store = useLotCustomsStore();
  const customs = customsOf(store, o.slug);
  const lot = LOTS.find((l) => l.slug === o.slug);
  const lock = o.statusPengeluaran ?? "draf";

  const [tgl, setTgl] = useState(o.tglOpname ?? "");
  const [fisik, setFisik] = useState(o.stokFisik ?? "");
  const [inv, setInv] = useState(o.refItInventory ?? "");
  const [resi, setResi] = useState(o.resi ?? "");
  const [note, setNote] = useState("");

  const fisikOk = fisik.trim() !== "" && Number.isFinite(Number(fisik)) && Number(fisik) >= 0;
  const opnameOk = !!tgl && fisikOk;
  const lotOk = customsComplete(customs);

  const saveData = (quiet = false) => {
    patchOrder(o.id, { tglOpname: tgl || undefined, stokFisik: fisik.trim() || undefined, refItInventory: inv.trim() || undefined, resi: resi.trim() || undefined });
    if (!quiet) setNote("Data pesanan tersimpan.");
  };

  const prepare = () => {
    patchOrder(o.id, { tglOpname: tgl, stokFisik: fisik.trim(), refItInventory: inv.trim() || undefined, statusPengeluaran: "verifikasi" });
    advanceOrder(o.id);
  };
  const dispatch = () => {
    patchOrder(o.id, { resi: resi.trim() });
    advanceOrder(o.id);
  };

  const whyNotPrepare = [!opnameOk && "isi tanggal stock opname dan stok fisik", !lotOk && "lengkapi HS Code, negara asal, dan asal bahan lot"].filter(Boolean) as string[];
  const whyNotSend = [lock !== "terpenuhi" && "tunggu EXIM menyatakan persyaratan terpenuhi", !resi.trim() && (kirim ? "isi nomor resi" : "isi kode pickup")].filter(Boolean) as string[];

  return (
    <PabrikPage
      label={`Pesanan ${o.id}`}
      title={`Pesanan #${o.id}`}
      desc="Siapkan barang, isi data yang diminta dokumen, lalu tunggu EXIM sebelum barang keluar."
      note="Nomor, jumlah, dan stok adalah contoh demo. Dokumen adalah rancangan internal dan perlu divalidasi EXIM pabrik."
      action={<StatusPill tone={o.status === 0 ? "wait" : o.status === 5 ? "idle" : "ok"}>{STATUS_LABEL(o.status, o.pickup)}</StatusPill>}
    >
      <Link href="/pesanan-masuk" className="-mt-4 text-[13px] font-medium text-brand underline underline-offset-4">
        Kembali ke pesanan masuk
      </Link>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_444px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-label="Ringkasan pesanan" className={`${panel} flex flex-col gap-3 p-[25px]`}>
            <Title icon={Package}>Ringkasan</Title>
            <div className="flex gap-4">
              <LotThumb lot={lot} seed={11} />
              <p className="text-[13px] leading-5 text-text-muted">
                {lot?.title ?? o.title}. {lot?.category}, {lot?.lotType}.
              </p>
            </div>
            <dl className="flex flex-col gap-3">
              <Row k="Lot" v={`${lot?.title ?? o.title}, ${o.code}`} />
              <Row k="Jumlah" v={`${num(o.qty)} ${o.unit}, ${rupiah(o.qty * o.price)}`} />
              <Row k="Pembeli" v={o.buyer ? `${o.buyer.business || o.buyer.person}, ${o.buyer.phone}` : "-"} />
              <Row k="Penerimaan" v={kirim ? `Diantar kurir ${o.courier === "J&T" ? "J&T Express" : (o.courier ?? "JNE")}` : "Ambil sendiri"} />
              {kirim && <Row k="Tujuan" v={o.address ?? "-"} />}
            </dl>
          </section>

          <section aria-label="Stock opname dan pengiriman" className={`${panel} flex flex-col gap-5 p-[25px]`}>
            <div className="flex flex-col gap-1">
              <Title icon={ClipboardList}>Stock opname dan {kirim ? "resi" : "kode pickup"}</Title>
              <p className="max-w-[640px] text-[13px] leading-5 text-text-muted">
                Reservasi dan pembayaran bukan pengeluaran fisik. Stok fisik dicocokkan dengan catatan sistem sebelum barang keluar.
              </p>
            </div>
            <Grid>
              <Field label="Tanggal stock opname" htmlFor={`${id}-tgl`}>
                <input id={`${id}-tgl`} type="date" className={inputBox} value={tgl} onChange={(e) => setTgl(e.target.value)} disabled={o.status > 1} />
              </Field>
              <Field label={`Stok fisik (${o.unit})`} hint={lot ? `Catatan sistem: ${num(lot.stock)} ${o.unit}, contoh demo.` : undefined} htmlFor={`${id}-fisik`}>
                <input id={`${id}-fisik`} inputMode="decimal" className={`${inputBox} tabular-nums`} value={fisik} onChange={(e) => setFisik(e.target.value)} disabled={o.status > 1} />
              </Field>
              <Field label="Referensi IT Inventory" hint="Boleh kosong." htmlFor={`${id}-inv`}>
                <input id={`${id}-inv`} className={inputBox} value={inv} onChange={(e) => setInv(e.target.value)} />
              </Field>
              <Field label={kirim ? "Nomor resi kurir" : "Kode pickup"} hint={kirim ? "Diisi saat barang diserahkan ke kurir." : "Kode yang ditunjukkan pembeli saat mengambil."} htmlFor={`${id}-resi`}>
                <input id={`${id}-resi`} className={inputBox} value={resi} onChange={(e) => setResi(e.target.value)} />
              </Field>
            </Grid>
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => saveData()} className="h-11 rounded-[2px] border border-brand px-5 text-[14px] font-medium text-brand transition-colors hover:bg-brand-soft">
                Simpan data pesanan
              </button>
              <p role="status" className="min-h-4 text-[13px] text-text-muted">
                {note}
              </p>
            </div>
          </section>

          <LotCustomsForm slug={o.slug} title={lot?.title ?? o.title} by="pabrik" />
        </div>

        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24">
          <section aria-label="Compliance Lock" className={`${panel} flex flex-col gap-3 p-[25px]`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Title icon={ShieldCheck}>Compliance Lock</Title>
              <StatusPill tone={LOCK_TONE[lock]}>{PENGELUARAN_LABEL[lock]}</StatusPill>
            </div>
            <LockTiles status={lock} />
            <p className="text-[13px] leading-5 text-text-muted">{LOCK_TEXT[lock]}</p>
            {o.catatanExim && (lock === "dokumen" || lock === "ditahan") && (
              <p className="rounded-[2px] bg-warn-soft px-3.5 py-3 text-[13px] leading-5">Catatan EXIM: {o.catatanExim}</p>
            )}
            <p className="text-[12px] leading-[15px] text-text-muted">Barang tidak dikeluarkan hanya karena UMKM sudah membayar.</p>
            {lock !== "draf" && (
              <Link href={`/pemeriksaan-exim/periksa?id=${encodeURIComponent(o.id)}`} className="w-fit text-[13px] font-medium text-brand underline underline-offset-4 hover:text-brand-hover">
                Buka pemeriksaan EXIM
              </Link>
            )}
          </section>

          <section aria-label="Tindakan" className={`${panel} flex flex-col gap-3 p-[25px]`}>
            <Title icon={ListChecks}>Tindakan</Title>
            {o.status === 0 && <p className="text-[13px] leading-5 text-text-muted">Menunggu pembayaran PJP. Pesanan baru bisa disiapkan setelah pembayaran masuk.</p>}
            {o.status === 1 && (
              <>
                <motion.button type="button" whileTap={{ scale: 0.98 }} disabled={whyNotPrepare.length > 0} onClick={prepare} className={btnPrimary}>
                  Tandai disiapkan dan kirim ke EXIM
                </motion.button>
                {whyNotPrepare.length > 0 && <p className="text-[12px] leading-[15px] text-text-muted">Sebelum itu: {whyNotPrepare.join("; ")}.</p>}
              </>
            )}
            {o.status === 2 && (
              <>
                <motion.button type="button" whileTap={{ scale: 0.98 }} disabled={whyNotSend.length > 0} onClick={dispatch} className={btnPrimary}>
                  {kirim ? "Tandai dikirim" : "Tandai siap diambil"}
                </motion.button>
                {whyNotSend.length > 0 && <p className="text-[12px] leading-[15px] text-text-muted">Sebelum itu: {whyNotSend.join("; ")}.</p>}
              </>
            )}
            {o.status >= 3 && <p className="text-[13px] leading-5 text-text-muted">Barang sudah {kirim ? "dikirim" : "siap diambil"}. Pantau konfirmasi penerimaan di Pesanan masuk.</p>}
          </section>

          <DokumenMenu order={o} role="pabrik" />
        </aside>
      </div>
    </PabrikPage>
  );
}

export default function PabrikPesananDetailView() {
  const id = useSearchParams().get("id");
  const o = useOrder(id);
  if (!o) {
    return (
      <PabrikPage label="Pesanan tidak ditemukan" title="Pesanan tidak ditemukan" desc="Pesanan demo hanya tersimpan di browser tempat UMKM membuatnya." note="Demo.">
        <Link href="/pesanan-masuk" className="text-[14px] font-medium text-brand underline underline-offset-4">
          Kembali ke pesanan masuk
        </Link>
      </PabrikPage>
    );
  }
  return <Detail key={o.id} o={o} />;
}
