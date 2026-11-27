import Link from "next/link";
import { commission } from "../../lib/domain/pricing";
import { num, rupiah } from "../../lib/format";
import { panel } from "../../components/ui/styles";
import LotTable from "./LotTable";
import PabrikPage from "./PabrikPage";
import TileChart, { ChartLegend } from "./chart/TileChart";
import { WEEKS, sumTiles } from "./chart/data";

/** 98 ubin pabrik + 2 ubin komisi = 100 ubin, mewakili Rp1.000.000 (komisi 2%). */
function Ubin() {
  return (
    <div className="flex shrink-0 flex-col gap-2.5">
      <div
        role="img"
        aria-label="98 dari 100 ubin untuk pabrik, 2 ubin untuk komisi"
        className="grid grid-cols-10 gap-[3px]"
      >
        {Array.from({ length: 100 }, (_, i) => (
          <span key={i} className={`size-[14px] ${i >= 98 ? "bg-accent" : "bg-brand"}`} />
        ))}
      </div>
      <p className="text-[12px] leading-[15px] text-text-muted">98 ubin pabrik, 2 ubin komisi</p>
    </div>
  );
}

const DOCS = [
  { t: "Commercial invoice", tag: "Draf", wait: false },
  { t: "Laporan pendukung kepabeanan", tag: "Menunggu EXIM", wait: true },
  { t: "Rekonsiliasi fiskal dan stok", tag: "Draf", wait: false },
];

const SDG = [
  { k: "Bahan disalurkan", v: "1.240 kg", d: "4 lot" },
  { k: "Bahan terpakai", v: "870 kg", d: "70% dari yang disalurkan" },
  { k: "Tujuan akhir lot", v: "3 dari 4", d: "1 lot menunggu catatan UMKM" },
  { k: "Penjualan pendukung", v: "Rp9,8 juta", d: "contoh demo" },
];

export default function LotSayaView() {
  const total = sumTiles(WEEKS);
  const orders = WEEKS.reduce((a, w) => a + w.tiles.length, 0);
  const waiting = WEEKS.flatMap((w) => w.tiles).filter((t) => t.pending);
  const waitingSum = waiting.reduce((a, t) => a + t.value, 0);

  return (
    <PabrikPage
      label="Lot saya"
      title="Lot saya"
      desc="Kelola lot sisa produksi pabrikmu. Komisi 2% ditagih Kami per periode, UMKM tidak membayar biaya platform."
      note="Nama pabrik, lot, harga, dan stok adalah contoh demo untuk mock up."
      action={
        <Link
          href="/lot-saya/tambah"
          className="self-start rounded-[2px] bg-brand px-[22px] py-[14px] text-[14px] font-medium leading-[17px] text-surface transition-colors hover:bg-brand-hover sm:self-auto"
        >
          + Tambah lot
        </Link>
      }
    >
      <LotTable />

      <section
        aria-label="Penjualan dan komisi"
        className={`${panel} flex flex-col gap-10 p-[25px] lg:flex-row lg:gap-6`}
      >
        <div className="flex min-w-0 flex-col gap-4 lg:flex-1">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-medium leading-[22px]">Penjualan dan komisi</h2>
            <p className="text-[13px] leading-4 text-text-muted">
              Satu ubin = satu pesanan. Warna = produk, tinggi = nilai, putus-putus = menunggu konfirmasi. Klik ubin untuk
              detail. Angka contoh demo.
            </p>
          </div>
          <ChartLegend items={["denim", "kaos", "katun", "chino"]} pending />
          <div className="overflow-x-auto pb-1">
            <div className="flex min-h-[251px] min-w-[538px] items-end">
              <TileChart
                cols={WEEKS}
                scale={1 / 25000}
                barW={55}
                href="/pesanan-masuk"
                label="Penjualan per minggu, satu ubin satu pesanan"
              />
            </div>
          </div>
        </div>

        <dl className="flex w-full flex-col gap-5 lg:w-[372px] lg:shrink-0 lg:pl-10">
          <div className="flex flex-col gap-1">
            <dt className="text-[14px] leading-[17px] text-text-muted">Penjualan 8 minggu</dt>
            <dd className="font-display text-[32px] leading-[35px] tracking-[-0.02em] text-brand">{rupiah(total)}</dd>
            <dd className="text-[13px] leading-4 text-text-muted">Dari {orders} pesanan, contoh demo</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[14px] leading-[17px] text-text-muted">Komisi 2% ditagih</dt>
            <dd className="font-display text-[32px] leading-[35px] tracking-[-0.02em]">{rupiah(commission(total))}</dd>
            <dd className="text-[13px] leading-4 text-text-muted">Ditanggung pabrik, UMKM Rp0</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[14px] leading-[17px] text-text-muted">Menunggu konfirmasi</dt>
            <dd className="font-display text-[32px] leading-[35px] tracking-[-0.02em]">{rupiah(waitingSum)}</dd>
            <dd className="text-[13px] leading-4 text-text-muted">
              {num(waiting.length)} pesanan belum dikonfirmasi UMKM
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-label="Contoh pembagian dana"
        className={`${panel} flex flex-col gap-8 px-[33px] py-[29px] md:flex-row md:justify-between md:gap-12`}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:max-w-[1031px]">
          <h2 className="text-[18px] font-medium leading-[22px]">Contoh komisi satu pesanan</h2>
          <dl className="flex flex-col gap-3 text-[14px] leading-[17px]">
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Penjualan, 100 kg × Rp10.000</dt>
              <dd className="font-medium tabular-nums">Rp1.000.000</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Komisi platform 2%, ditagih ke pabrik</dt>
              <dd className="font-medium tabular-nums">−Rp20.000</dd>
            </div>
            <div aria-hidden="true" className="h-px bg-text/10" />
            <div className="flex justify-between gap-4">
              <dt className="font-medium">Bersih untuk pabrik</dt>
              <dd className="font-medium tabular-nums text-brand">Rp980.000</dd>
            </div>
          </dl>
          <p className="text-[12px] leading-[15px] text-text-muted">
            Angka contoh demo. UMKM membayar lewat virtual account PJP, dana diteruskan ke pabrik setelah barang diterima. Kami mencatat komisi 2% dan menagihnya ke pabrik tiap
            periode.
          </p>
        </div>
        <Ubin />
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-2">
        <section aria-label="Dokumen internal dan Compliance Lock" className={`${panel} flex flex-col gap-4 p-[25px]`}>
          <div className="flex flex-col gap-4">
            <h2 className="text-[18px] font-medium leading-[22px]">Dokumen internal dan Compliance Lock</h2>
            <p className="text-[13px] leading-4 text-text-muted">
              Tiga dokumen Kainara untuk tiap pesanan. Ini bukan Faktur Pajak atau dokumen BC.
            </p>
          </div>
          <ul className="flex flex-col gap-4">
            {DOCS.map((d) => (
              <li key={d.t} className="flex h-11 items-center justify-between gap-3 border-b border-line text-[14px] leading-[17px]">
                <span>{d.t}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-medium leading-[15px] ${
                    d.wait ? "bg-[#f7e4c7] text-[#734705]" : "bg-brand-soft text-brand"
                  }`}
                >
                  {d.tag}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-0.5 rounded-[2px] bg-[#f7e4c7] px-3.5 py-3">
            <p className="text-[14px] font-medium leading-[17px]">Compliance Lock tertutup</p>
            <p className="text-[12px] leading-[15px] text-text-muted">
              Terbuka setelah EXIM memeriksa bukti. Pajak yang belum diketahui tidak ditulis Rp0.
            </p>
          </div>
        </section>

        <section aria-label="Indikator pilot SDG 12" className={`${panel} flex flex-col gap-4 p-[25px]`}>
          <div className="flex flex-col gap-4">
            <h2 className="text-[18px] font-medium leading-[22px]">Indikator pilot SDG 12</h2>
            <p className="text-[13px] leading-4 text-text-muted">
              Angka contoh demo. Indikator pilot, bukan klaim dampak lingkungan.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SDG.map((s) => (
              <div key={s.k} className="flex flex-col gap-1">
                <dt className="text-[12px] leading-[15px] text-text-muted">{s.k}</dt>
                <dd className="font-display text-[26px] leading-7 tracking-[-0.02em] text-brand">{s.v}</dd>
                <dd className="text-[12px] leading-[15px] text-text-muted">{s.d}</dd>
              </div>
            ))}
          </dl>
          <div
            role="img"
            aria-label="14 dari 20 ubin terpakai, 70% dari bahan yang disalurkan"
            className="flex flex-wrap gap-1"
          >
            {Array.from({ length: 20 }, (_, i) => (
              <span key={i} className={`size-[22px] rounded-[2px] ${i < 14 ? "bg-brand" : "bg-accent"}`} />
            ))}
          </div>
          <p className="text-[12px] leading-[15px] text-text-muted">
            Hijau terpakai, kuning sisa. 1 ubin = 5% dari bahan yang disalurkan.
          </p>
        </section>
      </div>
    </PabrikPage>
  );
}
