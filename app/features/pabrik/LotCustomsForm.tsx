"use client";

import { useId, useState } from "react";
import { FileSearch } from "lucide-react";
import Title from "./Title";
import { inputBox, panel } from "../../components/ui/styles";
import type { LotCustoms } from "../../lib/domain/types";
import { Field, Grid, Select } from "../akun/FormParts";
import { customsComplete, readLotCustoms, saveLotCustoms } from "./lotdoc";

const ASAL = [
  { v: "domestik", t: "Domestik" },
  { v: "impor", t: "Impor" },
];

const hsValid = (v: string) => /^\d{4}([.\s]?\d{2}){0,3}$/.test(v.trim());

/**
 * Data kepabeanan satu lot. Diisi pabrik, dikonfirmasi EXIM. HS Code, negara asal, dan nomor dokumen tidak
 * pernah terisi otomatis: kosong berarti dokumen menulis "Menunggu".
 */
export default function LotCustomsForm({ slug, title, by }: { slug: string; title: string; by: "pabrik" | "exim" }) {
  const id = useId();
  // Negara asal diusulkan "Indonesia" bila asal bahan domestik dan kolomnya masih kosong.
  const [c, setC] = useState<LotCustoms>(() => {
    const d = readLotCustoms(slug);
    return d.asalBahan === "domestik" && !d.negaraAsal.trim() ? { ...d, negaraAsal: "Indonesia" } : d;
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");

  const set = <K extends keyof LotCustoms>(k: K, v: LotCustoms[K]) => {
    setC((p) => ({ ...p, [k]: v }));
    setErrs((p) => ({ ...p, [k]: "" }));
  };
  const setDok = (k: "jenis" | "nomor" | "tanggal", v: string) => setC((p) => ({ ...p, dokPemasukan: { ...p.dokPemasukan, [k]: v } }));
  const fid = (k: string) => `${id}-${k}`;

  const save = () => {
    const e: Record<string, string> = {};
    if (c.hsCode.trim() && !hsValid(c.hsCode)) e.hsCode = "HS Code terdiri dari 4 sampai 10 angka, mis. 6310.10.00.";
    if (c.kemasanJumlah.trim() && !/^\d+$/.test(c.kemasanJumlah.trim())) e.kemasanJumlah = "Isi angka.";
    if (c.beratKotor.trim() && !/^\d+([.,]\d+)?$/.test(c.beratKotor.trim())) e.beratKotor = "Isi angka.";
    setErrs(e);
    if (Object.keys(e).length) {
      setNote("Periksa isian yang ditandai.");
      return;
    }
    saveLotCustoms(slug, c);
    setNote(customsComplete(c) ? "Data lot tersimpan." : "Data lot tersimpan. HS Code, negara asal, dan asal bahan masih perlu diisi.");
  };

  return (
    <section aria-label="Data kepabeanan lot" className={`${panel} flex flex-col gap-5 p-[25px]`}>
      <div className="flex flex-col gap-1">
        <Title icon={FileSearch}>Data kepabeanan lot</Title>
        <p className="max-w-[640px] text-[13px] leading-5 text-text-muted">
          {title}. {by === "pabrik" ? "Diisi pabrik, lalu dikonfirmasi EXIM." : "Dikonfirmasi EXIM; pabrik mengisi data awalnya."} Tidak ada
          isian bawaan: HS Code, negara asal, dan nomor dokumen hanya dari data nyata.
        </p>
      </div>
      <Grid>
        <Field label="HS Code" error={errs.hsCode} hint="Pos tarif barang. Klasifikasi akhir ditentukan EXIM." htmlFor={fid("hs")}>
          <input id={fid("hs")} className={`${inputBox} tabular-nums`} value={c.hsCode} onChange={(e) => set("hsCode", e.target.value)} aria-invalid={!!errs.hsCode} />
        </Field>
        <Field label="Negara asal" htmlFor={fid("negara")}>
          <input id={fid("negara")} className={inputBox} value={c.negaraAsal} onChange={(e) => set("negaraAsal", e.target.value)} />
        </Field>
        <Field label="Asal bahan" htmlFor={fid("asal")}>
          <Select id={fid("asal")} value={c.asalBahan} onChange={(v) => setC((p) => ({ ...p, asalBahan: v as LotCustoms["asalBahan"], negaraAsal: v === "domestik" && !p.negaraAsal.trim() ? "Indonesia" : p.negaraAsal }))} options={ASAL} placeholder="Pilih asal bahan" />
        </Field>
        <Field label="Berat kotor (kg)" error={errs.beratKotor} hint="Berat bersama kemasan." htmlFor={fid("kotor")}>
          <input id={fid("kotor")} className={`${inputBox} tabular-nums`} inputMode="decimal" value={c.beratKotor} onChange={(e) => set("beratKotor", e.target.value)} aria-invalid={!!errs.beratKotor} />
        </Field>
        <Field label="Jenis kemasan" htmlFor={fid("kemJenis")}>
          <input id={fid("kemJenis")} className={inputBox} placeholder="Contoh: karung, bal" value={c.kemasanJenis} onChange={(e) => set("kemasanJenis", e.target.value)} />
        </Field>
        <Field label="Jumlah kemasan" error={errs.kemasanJumlah} htmlFor={fid("kemJml")}>
          <input id={fid("kemJml")} className={`${inputBox} tabular-nums`} inputMode="numeric" value={c.kemasanJumlah} onChange={(e) => set("kemasanJumlah", e.target.value)} aria-invalid={!!errs.kemasanJumlah} />
        </Field>
      </Grid>
      <div className="flex flex-col gap-3">
        <p className="text-[14px] font-medium leading-[17px]">Dokumen pemasukan bahan</p>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Jenis dokumen" htmlFor={fid("dokJenis")}>
            <input id={fid("dokJenis")} className={inputBox} value={c.dokPemasukan.jenis} onChange={(e) => setDok("jenis", e.target.value)} />
          </Field>
          <Field label="Nomor" htmlFor={fid("dokNo")}>
            <input id={fid("dokNo")} className={inputBox} value={c.dokPemasukan.nomor} onChange={(e) => setDok("nomor", e.target.value)} />
          </Field>
          <Field label="Tanggal" htmlFor={fid("dokTgl")}>
            <input id={fid("dokTgl")} type="date" className={inputBox} value={c.dokPemasukan.tanggal} onChange={(e) => setDok("tanggal", e.target.value)} />
          </Field>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={save} className="h-11 rounded-[2px] border border-brand px-5 text-[14px] font-medium text-brand transition-colors hover:bg-brand-soft">
          Simpan data lot
        </button>
        <p role="status" className="min-h-4 text-[13px] text-text-muted">
          {note}
        </p>
      </div>
    </section>
  );
}
