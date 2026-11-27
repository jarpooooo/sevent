import { commission } from "../../lib/domain/pricing";
import { rupiah } from "../../lib/format";
import { panel } from "../../components/ui/styles";
import PabrikPage from "./PabrikPage";
import TileChart, { ChartLegend } from "./chart/TileChart";
import { PRODUCTS, type ProductKey } from "./chart/products";
import { DAYS, sumTiles } from "./chart/data";

const LEGEND: ProductKey[] = ["denim", "kaos", "katun", "chino"];

/** Tagihan komisi pabrik: penjualan 7 hari sebagai tumpukan ubin per hari (contoh demo, sama dengan Figma). */
export default function TagihanKomisiView() {
  const total = sumTiles(DAYS);
  const orders = DAYS.reduce((a, d) => a + d.tiles.length, 0);
  const top = LEGEND.map((k) => ({ k, v: sumTiles(DAYS, (t) => t.product === k) })).sort((a, b) => b.v - a.v)[0];

  return (
    <PabrikPage
      label="Tagihan komisi"
      title="Tagihan komisi"
      desc="UMKM transfer langsung ke pabrik. Kami mencatat komisi 2% per pesanan dan menagihnya ke pabrik tiap periode."
      note="Nama pabrik, lot, harga, dan stok adalah contoh demo untuk mock up."
    >
      <section
        aria-label="Penjualan per hari"
        className={`${panel} flex flex-col gap-10 p-[25px] lg:flex-row lg:gap-12`}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-medium leading-[22px]">Penjualan per hari</h2>
            <p className="text-[13px] leading-4 text-text-muted">
              Satu kolom = satu hari. Satu ubin = satu pesanan, warna = produk, tinggi = nilai. Klik ubin untuk detail.
            </p>
          </div>
          <ChartLegend items={LEGEND} dailyStyle />
          <div className="overflow-x-auto pb-2 lg:overflow-visible lg:pb-0">
            <div className="flex min-w-[700px] flex-col">
              <p className="text-[13px] leading-4 text-text-muted">
                Arahkan kursor ke satu ubin untuk melihat pesanannya, klik untuk membuka detail pesanan.
              </p>
              <div className="mt-[144px]">
                <TileChart
                  cols={DAYS}
                  scale={0.0016}
                  barW={56}
                  zoneH={200}
                  daily
                  href="/pesanan-masuk"
                  label="Penjualan per hari, satu ubin satu pesanan"
                />
              </div>
            </div>
          </div>
        </div>

        <dl className="flex w-full flex-col gap-7 lg:w-[388px] lg:shrink-0">
          <div className="flex flex-col gap-1">
            <dt className="text-[14px] leading-[17px] text-text-muted">Penjualan 7 hari</dt>
            <dd className="font-display text-[32px] leading-[35px] tracking-[-0.02em] text-brand">{rupiah(total)}</dd>
            <dd className="text-[13px] leading-4 text-text-muted">Dari {orders} pesanan, angka contoh demo</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[14px] leading-[17px] text-text-muted">Produk terbesar</dt>
            <dd className="font-display text-[22px] leading-6 tracking-[-0.02em]">{PRODUCTS[top.k].name}</dd>
            <dd className="text-[13px] leading-4 text-text-muted">
              {rupiah(top.v)}, {Math.round((top.v / total) * 100)}% dari total
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[14px] leading-[17px] text-text-muted">Komisi 2% periode ini</dt>
            <dd className="font-display text-[32px] leading-[35px] tracking-[-0.02em]">{rupiah(commission(total))}</dd>
            <dd className="text-[13px] leading-4 text-text-muted">Ditagih Kami di akhir periode, contoh demo</dd>
          </div>
        </dl>
      </section>
    </PabrikPage>
  );
}
