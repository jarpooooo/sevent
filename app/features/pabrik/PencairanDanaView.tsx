"use client";

import { num, rupiah } from "../../lib/format";
import { commission, type Incoming, useIncoming } from "./incoming";
import { panel } from "../../components/ui/styles";
import { Row, StatusPill, Table } from "../../components/ui/table";
import PabrikPage from "./PabrikPage";

const W = "110px minmax(0,1fr) 130px 150px 150px 150px";

const dana = (o: Incoming) => o.total - commission(o.total);

export default function PencairanDanaView() {
  const rows = useIncoming();
  const held = rows.filter((r) => r.status < 3).reduce((a, r) => a + dana(r), 0);
  const sent = rows.filter((r) => r.status === 3).reduce((a, r) => a + dana(r), 0);
  const fee = rows.reduce((a, r) => a + commission(r.total), 0);

  const stats = [
    { k: "Ditahan PJP", v: held, d: "Menunggu UMKM konfirmasi barang diterima" },
    { k: "Sudah diteruskan", v: sent, d: "Sudah dikonfirmasi UMKM" },
    { k: "Komisi platform 2%", v: fee, d: "Ditanggung pabrik, dari nilai barang" },
  ];

  return (
    <PabrikPage
      label="Pencairan dana"
      title="Pencairan dana"
      desc="Dana dari penjualanmu ditahan penyedia pembayaran (PJP) dan baru diteruskan setelah UMKM konfirmasi barang diterima."
      note="Angka contoh demo. Komisi 2% dihitung dari nilai barang, di luar ongkir dan pajak."
    >
      <ul className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <li key={s.k} className={`${panel} px-6 py-5`}>
            <p className="text-[13px] text-text-muted">{s.k}</p>
            <p className="font-display mt-2 text-[28px] tabular-nums tracking-[-0.02em]">{rupiah(s.v)}</p>
            <p className="mt-1.5 text-[12px] text-text-muted">{s.d}</p>
          </li>
        ))}
      </ul>

      <Table
        label="Tabel pencairan dana"
        head={["Pesanan", "Lot", "Jumlah", "Penjualan", "Komisi 2%", "Dana untuk pabrik"]}
        widths={W}
      >
        {rows.map((o) => (
          <Row key={o.id} widths={W}>
            <span className="font-medium">{o.id}</span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {o.lot}
              <StatusPill tone={o.status === 3 ? "ok" : "wait"}>{o.status === 3 ? "Diteruskan" : "Ditahan PJP"}</StatusPill>
            </span>
            <span className="tabular-nums">
              {num(o.qty)} {o.unit}
            </span>
            <span className="tabular-nums">{rupiah(o.total)}</span>
            <span className="tabular-nums text-text-muted">−{rupiah(commission(o.total))}</span>
            <span className="font-medium tabular-nums text-brand">{rupiah(dana(o))}</span>
          </Row>
        ))}
      </Table>
    </PabrikPage>
  );
}
