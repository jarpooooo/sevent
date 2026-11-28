"use client";

import { m as motion } from "motion/react";
import { Landmark, Package, Scale, Tags } from "lucide-react";
import Title from "../pabrik/Title";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { inputBox, panel } from "../../components/ui/styles";
import { StatusPill } from "../../components/ui/table";
import { LOTS } from "../../lib/data/seed/lots";
import {
  type DokRef,
  FISKAL_LABEL,
  type FiskalKey,
  type FiskalRow,
  type FiskalStatus,
  type Order,
  PENGELUARAN_LABEL,
} from "../../lib/domain/types";
import { num, rupiah } from "../../lib/format";
import { Field, Grid, Select } from "../akun/FormParts";
import DokumenMenu from "../dokumen/DokumenMenu";
import LotCustomsForm from "../pabrik/LotCustomsForm";
import { customsComplete, customsOf, useLotCustomsStore } from "../pabrik/lotdoc";
import PabrikPage from "../pabrik/PabrikPage";
import { FiskalTiles, LockTiles, LotThumb } from "../pabrik/tiles";
import { patchOrder, useOrder } from "../umkm/pesanan/orders";
import { lockTone } from "./EximView";

const KATEGORI = [
  { v: "Perca pemotongan", t: "Perca pemotongan" },
  { v: "Sisa bahan baku", t: "Sisa bahan baku" },
  { v: "Produk reject", t: "Produk reject" },
];
const FISKAL_STATUS = [
  { v: "belum", t: "Belum diverifikasi" },
  { v: "berlaku", t: "Berlaku" },
  { v: "dikecualikan", t: "Dikecualikan" },
  { v: "tidakBerlaku", t: "Tidak berlaku" },
];
const KEYS = Object.keys(FISKAL_LABEL) as FiskalKey[];
/** Usulan klasifikasi dari kategori lot. Bukan keputusan: EXIM yang menetapkan. */
const KATEGORI_USUL: Record<string, string> = { "Cutting offcuts": "Perca pemotongan", Perca: "Perca pemotongan", "Sisa gulungan": "Sisa bahan baku" };
const EMPTY_DOK: DokRef = { jenis: "", nomor: "", tanggal: "" };
const blankRow = (): FiskalRow => ({ status: "belum", dasar: "", tarif: "", nominal: "" });

const ghost =
  "h-11 rounded-[2px] border border-border-strong px-5 text-[14px] font-medium transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50";
const primary =
  "h-11 rounded-[2px] bg-brand px-5 text-[14px] font-medium text-surface transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50";

function Review({ o }: { o: Order }) {
  const id = useId();
  const fid = (k: string) => `${id}-${k}`;
  const store = useLotCustomsStore();
  const customs = customsOf(store, o.slug);
  const lot = LOTS.find((l) => l.slug === o.slug);
  const lock = o.statusPengeluaran ?? "draf";

  const usulKategori = lot ? (KATEGORI_USUL[lot.category] ?? "") : "";
  const usulLapFiskal = `LPK-${o.id}`;
  const usulDasar = `Nilai transaksi ${rupiah(o.qty * o.price)}`;
  const [kategori, setKategori] = useState(o.kategoriMaterial ?? usulKategori);
  const [dok, setDok] = useState<DokRef>({ ...EMPTY_DOK, ...o.dokPengeluaran });
  const [setuju, setSetuju] = useState(o.persetujuanPengeluaran ?? "");
  const [lapFiskal, setLapFiskal] = useState(o.refLaporanFiskal ?? usulLapFiskal);
  const [faktur, setFaktur] = useState(o.refFakturPajak ?? "");
  const [billing, setBilling] = useState(o.kodeBilling ?? "");
  const [ntpn, setNtpn] = useState(o.ntpn ?? "");
  const [fasilitas, setFasilitas] = useState(o.dasarFasilitas ?? "");
  const [fiskal, setFiskal] = useState<Record<FiskalKey, FiskalRow>>(() =>
    Object.fromEntries(KEYS.map((k) => [k, { ...blankRow(), ...(k === "pabean" ? { dasar: usulDasar } : {}), ...o.fiskal?.[k] }])) as Record<FiskalKey, FiskalRow>,
  );
  const [catatan, setCatatan] = useState(o.catatanExim ?? "");
  const [note, setNote] = useState("");

  const setRow = (k: FiskalKey, patch: Partial<FiskalRow>) => setFiskal((p) => ({ ...p, [k]: { ...p[k], ...patch } }));
  const draft = () => ({
    kategoriMaterial: kategori || undefined,
    dokPengeluaran: dok.jenis || dok.nomor || dok.tanggal ? dok : undefined,
    persetujuanPengeluaran: setuju.trim() || undefined,
    refLaporanFiskal: lapFiskal.trim() || undefined,
    refFakturPajak: faktur.trim() || undefined,
    kodeBilling: billing.trim() || undefined,
    ntpn: ntpn.trim() || undefined,
    dasarFasilitas: fasilitas.trim() || undefined,
    fiskal,
    catatanExim: catatan.trim() || undefined,
  });

  const saveDraft = () => {
    patchOrder(o.id, draft());
    setNote("Isian tersimpan.");
  };

  // Syarat sebelum "Persyaratan terpenuhi": tidak ada komponen fiskal yang masih "belum diverifikasi" (belum diketahui bukan Rp0).
  const missing = [
    !kategori && "klasifikasi material",
    !customsComplete(customs) && "data kepabeanan lot (HS Code, negara asal, asal bahan)",
    !dok.nomor.trim() && "nomor dokumen pengeluaran",
    !setuju.trim() && "referensi persetujuan pengeluaran",
    KEYS.some((k) => fiskal[k].status === "belum") && "status semua komponen fiskal",
  ].filter(Boolean) as string[];
  const berlakuKosong = KEYS.filter((k) => fiskal[k].status === "berlaku" && (!fiskal[k].tarif.trim() || !fiskal[k].nominal.trim()));

  const decide = (status: "dokumen" | "ditahan" | "terpenuhi") => {
    if (status !== "terpenuhi" && !catatan.trim()) {
      setNote("Isi catatan supaya pabrik tahu apa yang diminta atau mengapa ditahan.");
      return;
    }
    if (status === "terpenuhi" && (missing.length || berlakuKosong.length)) {
      setNote(
        missing.length
          ? `Belum bisa dinyatakan terpenuhi: ${missing.join("; ")}.`
          : "Komponen fiskal yang berlaku harus punya tarif dan nominal.",
      );
      return;
    }
    patchOrder(o.id, { ...draft(), statusPengeluaran: status });
    setNote(`Status pengeluaran: ${PENGELUARAN_LABEL[status]}.`);
  };

  return (
    <PabrikPage
      label={`Periksa ${o.id}`}
      title={`Periksa pesanan #${o.id}`}
      desc="Konfirmasi asal barang, klasifikasi, dokumen pengeluaran, dan kewajiban fiskal. Nilai yang belum diketahui tidak boleh dianggap nihil."
      note="Demo. Platform hanya mencatat referensi: tidak menerbitkan kode billing, NTPN, atau Faktur Pajak resmi, dan tidak menggantikan persetujuan Bea Cukai."
      action={<StatusPill tone={lockTone(lock)}>{PENGELUARAN_LABEL[lock]}</StatusPill>}
    >
      <Link href="/pemeriksaan-exim" className="-mt-4 text-[13px] font-medium text-brand underline underline-offset-4">
        Kembali ke pemeriksaan EXIM
      </Link>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_444px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-label="Ringkasan" className={`${panel} flex flex-col gap-3 p-[25px]`}>
            <Title icon={Package}>Ringkasan</Title>
            <div className="flex gap-4">
              <LotThumb lot={lot} seed={5} />
              <p className="text-[13px] leading-5 text-text-muted">
                {lot?.title ?? o.title}. {lot?.category}, {lot?.lotType}.
              </p>
            </div>
            <dl className="flex flex-col gap-3 text-[14px] leading-[17px]">
              {(
                [
                  ["Lot", `${lot?.title ?? o.title}, ${o.code}`],
                  ["Jumlah", `${num(o.qty)} ${o.unit}, ${rupiah(o.qty * o.price)}`],
                  ["Penerima", o.buyer ? `${o.buyer.business || o.buyer.person}` : "-"],
                  ["Stock opname", o.tglOpname ? `${o.tglOpname}, stok fisik ${o.stokFisik ?? "-"} ${o.unit}` : "Belum diisi pabrik"],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-text-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-label="Klasifikasi dan dokumen pengeluaran" className={`${panel} flex flex-col gap-5 p-[25px]`}>
            <Title icon={Tags}>Klasifikasi dan dokumen pengeluaran</Title>
            <Grid>
              <Field label="Kategori material (klasifikasi EXIM)" hint={!o.kategoriMaterial && kategori === usulKategori && usulKategori ? "Usulan dari kategori lot. Konfirmasi atau ganti; tidak semua sisa tekstil sama dengan limbah." : "Tidak semua sisa tekstil sama dengan limbah."} htmlFor={fid("kat")} className="sm:col-span-2">
                <Select id={fid("kat")} value={kategori} onChange={setKategori} options={KATEGORI} placeholder="Pilih kategori" />
              </Field>
              <Field label="Jenis dokumen pengeluaran" htmlFor={fid("dokJenis")}>
                <input id={fid("dokJenis")} className={inputBox} value={dok.jenis} onChange={(e) => setDok({ ...dok, jenis: e.target.value })} />
              </Field>
              <Field label="Nomor dokumen pengeluaran" htmlFor={fid("dokNo")}>
                <input id={fid("dokNo")} className={inputBox} value={dok.nomor} onChange={(e) => setDok({ ...dok, nomor: e.target.value })} />
              </Field>
              <Field label="Tanggal dokumen" htmlFor={fid("dokTgl")}>
                <input id={fid("dokTgl")} type="date" className={inputBox} value={dok.tanggal} onChange={(e) => setDok({ ...dok, tanggal: e.target.value })} />
              </Field>
              <Field label="Referensi persetujuan pengeluaran" htmlFor={fid("setuju")}>
                <input id={fid("setuju")} className={inputBox} value={setuju} onChange={(e) => setSetuju(e.target.value)} />
              </Field>
              <Field label="Referensi laporan fiskal" hint={!o.refLaporanFiskal && lapFiskal === usulLapFiskal ? "Usulan: nomor lembar rekonsiliasi Kainara untuk pesanan ini." : undefined} htmlFor={fid("lap")} className="sm:col-span-2">
                <input id={fid("lap")} className={inputBox} value={lapFiskal} onChange={(e) => setLapFiskal(e.target.value)} />
              </Field>
            </Grid>
          </section>

          <LotCustomsForm slug={o.slug} title={lot?.title ?? o.title} by="exim" />

          <section aria-label="Kewajiban fiskal" className={`${panel} flex flex-col gap-5 p-[25px]`}>
            <div className="flex flex-col gap-1">
              <Title icon={Landmark}>Kewajiban fiskal</Title>
              <p className="max-w-[640px] text-[13px] leading-5 text-text-muted">
                Tentukan status tiap komponen. Berlaku: isi dasar, tarif, dan nominal. Dikecualikan: catat dasar hukumnya. &quot;Belum diverifikasi&quot;
                tidak sama dengan Rp0 dan menahan status &quot;Persyaratan terpenuhi&quot;.
              </p>
            </div>
            <FiskalTiles rows={fiskal} />
            <ul className="flex flex-col gap-4">
              {KEYS.map((k) => {
                const r = fiskal[k];
                return (
                  <li key={k} className="flex flex-col gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
                    <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
                      <p className="text-[14px] font-medium">{FISKAL_LABEL[k]}</p>
                      <Select id={fid(`f-${k}`)} value={r.status} onChange={(v) => setRow(k, { status: v as FiskalStatus })} options={FISKAL_STATUS} />
                    </div>
                    {k === "pabean" && r.status === "belum" && (
                      <input aria-label="Nilai pabean, dasar nilai (usulan)" className={inputBox} value={r.dasar} onChange={(e) => setRow(k, { dasar: e.target.value })} />
                    )}
                    {(r.status === "berlaku" || r.status === "dikecualikan") && (
                      <div className={`grid gap-3 ${r.status === "berlaku" ? "sm:grid-cols-3" : ""}`}>
                        <input aria-label={`${FISKAL_LABEL[k]}, ${r.status === "berlaku" ? "dasar pengenaan" : "dasar hukum pengecualian"}`} className={inputBox} placeholder={r.status === "berlaku" ? "Dasar pengenaan" : "Dasar hukum pengecualian"} value={r.dasar} onChange={(e) => setRow(k, { dasar: e.target.value })} />
                        {r.status === "berlaku" && (
                          <>
                            <input aria-label={`${FISKAL_LABEL[k]}, tarif`} className={inputBox} placeholder="Tarif" value={r.tarif} onChange={(e) => setRow(k, { tarif: e.target.value })} />
                            <input aria-label={`${FISKAL_LABEL[k]}, nominal`} className={`${inputBox} tabular-nums`} placeholder="Nominal (Rp)" inputMode="numeric" value={r.nominal} onChange={(e) => setRow(k, { nominal: e.target.value })} />
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <Grid>
              <Field label="Dasar fasilitas atau pengecualian" htmlFor={fid("fas")} className="sm:col-span-2">
                <input id={fid("fas")} className={inputBox} value={fasilitas} onChange={(e) => setFasilitas(e.target.value)} />
              </Field>
              <Field label="Referensi Faktur Pajak" htmlFor={fid("faktur")}>
                <input id={fid("faktur")} className={inputBox} value={faktur} onChange={(e) => setFaktur(e.target.value)} />
              </Field>
              <Field label="Kode billing" htmlFor={fid("bill")}>
                <input id={fid("bill")} className={inputBox} value={billing} onChange={(e) => setBilling(e.target.value)} />
              </Field>
              <Field label="NTPN atau bukti pelunasan" htmlFor={fid("ntpn")} className="sm:col-span-2">
                <input id={fid("ntpn")} className={inputBox} value={ntpn} onChange={(e) => setNtpn(e.target.value)} />
              </Field>
            </Grid>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24">
          <section aria-label="Keputusan EXIM" className={`${panel} flex flex-col gap-4 p-[25px]`}>
            <Title icon={Scale}>Keputusan</Title>
            <LockTiles status={lock} />
            <Field label="Catatan untuk pabrik" hint="Wajib bila meminta dokumen atau menahan." htmlFor={fid("catatan")}>
              <textarea id={fid("catatan")} rows={3} className={`${inputBox} h-auto resize-y py-3 leading-5`} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-2.5">
              <button type="button" onClick={saveDraft} className={ghost}>
                Simpan isian
              </button>
              <button type="button" onClick={() => decide("dokumen")} className={ghost}>
                Minta dokumen
              </button>
              <button type="button" onClick={() => decide("ditahan")} className={ghost}>
                Tahan
              </button>
            </div>
            <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={() => decide("terpenuhi")} className={primary}>
              Nyatakan persyaratan terpenuhi
            </motion.button>
            {missing.length > 0 && <p className="text-[12px] leading-[15px] text-text-muted">Belum bisa dinyatakan terpenuhi: {missing.join("; ")}.</p>}
            <p role="status" className="min-h-4 text-[13px] leading-5">
              {note}
            </p>
          </section>
          <DokumenMenu order={o} role="pabrik" />
        </aside>
      </div>
    </PabrikPage>
  );
}

export default function EximPesananView() {
  const id = useSearchParams().get("id");
  const o = useOrder(id);
  if (!o) {
    return (
      <PabrikPage label="Pesanan tidak ditemukan" title="Pesanan tidak ditemukan" desc="Pesanan demo hanya tersimpan di browser tempat UMKM membuatnya." note="Demo.">
        <Link href="/pemeriksaan-exim" className="text-[14px] font-medium text-brand underline underline-offset-4">
          Kembali ke pemeriksaan EXIM
        </Link>
      </PabrikPage>
    );
  }
  return <Review key={o.id} o={o} />;
}
