import TambahLotButton from "./TambahLotButton";
import { panel } from "../../components/ui/styles";
import { MiniBar, Row, StatusPill, Table } from "../../components/ui/table";
import PabrikPage from "./PabrikPage";

/** Data contoh demo, mengikuti desain Figma "Lot saya". */
const LOTS = [
  { name: "Offcut denim polos", channel: "Regional · tetap", price: "Rp4.000 / kg", stock: "800 dari 1.000 kg", pct: 80, status: "Tayang", tone: "ok" as const },
  { name: "Reject kaos polos non-branded", channel: "Regional · tetap", price: "Rp12.000 / pcs", stock: "300 dari 300 pcs", pct: 100, status: "Tayang", tone: "ok" as const },
  { name: "Perca katun polos", channel: "Nasional · lelang", price: "Dari Rp8.000 / kg", stock: "300 dari 300 kg", pct: 100, status: "Lelang berjalan", tone: "ok" as const },
  { name: "Reject celana chino non-branded", channel: "Regional · tetap", price: "Rp18.000 / pcs", stock: "95 dari 120 pcs", pct: 79, status: "Menunggu pemeriksaan", tone: "wait" as const },
];

const STAGES = [
  { t: "Draf", d: "Isi foto dan data", done: true },
  { t: "Diperiksa", d: "Tim memeriksa lot", done: true },
  { t: "Tayang", d: "Terlihat oleh UMKM", done: true },
  { t: "Terjual", d: "Pesanan masuk", done: false },
  { t: "Dana cair", d: "Setelah UMKM konfirmasi", done: false },
];

const W = "minmax(0,360px) 150px 150px 240px minmax(0,1fr)";

/** 98 ubin pabrik + 2 ubin komisi = 100 ubin, mewakili Rp1.000.000 (komisi 2%). */
function Ubin() {
  return (
    <div className="flex flex-col gap-2.5">
      <div
        role="img"
        aria-label="98 dari 100 ubin untuk pabrik, 2 ubin untuk komisi"
        className="grid grid-cols-10 gap-[3px]"
      >
        {Array.from({ length: 100 }, (_, i) => (
          <span key={i} className={`size-[14px] ${i >= 98 ? "bg-accent" : "bg-brand"}`} />
        ))}
      </div>
      <p className="text-[12px] text-text-muted">98 ubin pabrik, 2 ubin komisi</p>
    </div>
  );
}

export default function LotSayaView() {
  return (
    <PabrikPage
      label="Lot saya"
      title="Lot saya"
      desc="Kelola lot sisa produksi pabrikmu. Komisi 2% dipotong dari penjualan, UMKM tidak membayar biaya platform."
      note="Nama pabrik, lot, harga, dan stok adalah contoh demo untuk mock up."
      action={<TambahLotButton />}
    >
      <Table label="Tabel lot saya" head={["Lot", "Kanal", "Harga", "Stok", "Status"]} widths={W}>
        {LOTS.map((l) => (
          <Row key={l.name} widths={W}>
            <span className="font-medium">{l.name}</span>
            <span>{l.channel}</span>
            <span>{l.price}</span>
            <span className="flex flex-col gap-[7px]">
              <span className="text-[13px] text-text-muted">{l.stock}</span>
              <MiniBar pct={l.pct} />
            </span>
            <span>
              <StatusPill tone={l.tone}>{l.status}</StatusPill>
            </span>
          </Row>
        ))}
      </Table>

      <section aria-label="Perjalanan satu lot" className="flex flex-col gap-3.5">
        <h2 className="text-[18px] font-medium">Perjalanan satu lot</h2>
        <ol className="grid grid-cols-2 gap-x-1.5 gap-y-4 sm:grid-cols-5">
          {STAGES.map((s) => (
            <li key={s.t} className="flex flex-col gap-2.5">
              <span aria-hidden="true" className={`block h-2.5 ${s.done ? "bg-brand" : "bg-brand-soft"}`} />
              <p className="text-[14px] font-medium">{s.t}</p>
              <p className="text-[12px] text-text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Contoh pembagian dana" className={`${panel} flex flex-col gap-8 px-6 py-7 md:flex-row md:gap-12 md:px-8`}>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h2 className="text-[18px] font-medium">Contoh pembagian dana satu pesanan</h2>
          <dl className="flex flex-col gap-3 text-[14px]">
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Penjualan · 100 kg × Rp10.000</dt>
              <dd className="font-medium tabular-nums">Rp1.000.000</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Komisi platform 2% · ditanggung pabrik</dt>
              <dd className="font-medium tabular-nums">−Rp20.000</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="font-medium">Dana untuk pabrik</dt>
              <dd className="font-medium tabular-nums text-brand">Rp980.000</dd>
            </div>
          </dl>
          <p className="text-[12px] text-text-muted">
            Angka contoh demo. Dana diteruskan setelah UMKM konfirmasi barang diterima.
          </p>
        </div>
        <Ubin />
      </section>
    </PabrikPage>
  );
}
