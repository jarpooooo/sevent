import type { Lot } from "../../../lib/domain/types";
import { h2, rule } from "./shared";

/* ───────── Spesifikasi dan catatan ───────── */
export function Specs({ lot }: { lot: Lot }) {
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

export function Notes({ lot }: { lot: Lot }) {
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

