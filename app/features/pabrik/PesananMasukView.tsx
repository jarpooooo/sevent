"use client";

import Link from "next/link";
import { PENGELUARAN_LABEL, type PengeluaranStatus } from "../../lib/domain/types";
import { num, rupiah } from "../../lib/format";
import { type Incoming, STATUS_LABEL, useIncoming } from "./incoming";
import { Row, StatusPill, Table } from "../../components/ui/table";
import PabrikPage from "./PabrikPage";

const W = "100px 140px minmax(0,1fr) 90px 110px 160px 170px minmax(0,180px)";

const tone = (s: Incoming["status"]) => (s === 0 ? "wait" : s === 5 ? "idle" : "ok");
const lockTone = (l: PengeluaranStatus) => (l === "terpenuhi" ? "ok" : l === "draf" ? "idle" : "wait");

function Action({ o }: { o: Incoming }) {
  if (o.status === 5) return <span className="text-[13px] text-text-muted">Komisi 2% masuk tagihan</span>;
  if (o.status === 4) return <span className="text-[13px] text-text-muted">Masa komplain 48 jam</span>;
  if (o.status === 3) {
    return (
      <span className="text-[13px] text-text-muted">
        {o.pickup === "ambil" ? "Menunggu konfirmasi UMKM" : "Menunggu konfirmasi kurir lewat admin"}
      </span>
    );
  }
  if (o.status === 0) return <span className="text-[13px] text-text-muted">Menunggu pembayaran PJP</span>;
  if (!o.live) return null;
  return (
    <Link
      href={`/pesanan-masuk/detail?id=${encodeURIComponent(o.id)}`}
      className="inline-flex h-10 items-center rounded-[2px] border border-brand px-4 text-[13px] font-semibold text-brand transition-colors hover:bg-brand-soft"
    >
      {o.status === 1 ? "Siapkan pesanan" : o.pickup === "ambil" ? "Kelola, siap diambil" : "Kelola, kirim"}
    </Link>
  );
}

export default function PesananMasukView() {
  const rows = useIncoming();
  const live = rows.filter((r) => r.live).length;

  return (
    <PabrikPage
      label="Pesanan masuk"
      title="Pesanan masuk"
      desc="Pesanan UMKM atas lotmu. UMKM membayar lewat virtual account PJP; setelah PJP mengabari pembayaran masuk, siapkan barang, lalu tandai siap diambil atau dikirim."
      note="Dua baris terakhir adalah contoh demo. Pesanan yang kamu buat lewat Checkout sebagai UMKM di browser ini muncul di paling atas."
    >
      {live > 0 && (
        <p className="rounded-[2px] bg-brand-soft px-4 py-3 text-[14px]">
          {live} pesanan dari checkout demo masuk. Majukan statusnya di bawah, lalu masuk lagi sebagai UMKM untuk
          konfirmasi diterima.
        </p>
      )}
      <Table
        label="Tabel pesanan masuk"
        head={["Pesanan", "Pembeli", "Lot", "Jumlah", "Total", "Status", "Pengeluaran", "Tindakan"]}
        widths={W}
      >
        {rows.map((o) => (
          <Row key={o.id} widths={W}>
            <span className="font-medium">{o.id}</span>
            <span>{o.buyer}</span>
            <span>{o.lot}</span>
            <span className="tabular-nums">
              {num(o.qty)} {o.unit}
            </span>
            <span className="tabular-nums">{rupiah(o.total)}</span>
            <span>
              <StatusPill tone={tone(o.status)}>{STATUS_LABEL(o.status, o.pickup)}</StatusPill>
            </span>
            <span>
              {o.lock ? <StatusPill tone={lockTone(o.lock)}>{PENGELUARAN_LABEL[o.lock]}</StatusPill> : <span className="text-[13px] text-text-muted">-</span>}
            </span>
            <span>
              <Action o={o} />
            </span>
          </Row>
        ))}
      </Table>
    </PabrikPage>
  );
}
