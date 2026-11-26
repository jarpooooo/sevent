"use client";

import { m as motion } from "motion/react";
import { advanceOrder } from "../pesanan/orders";
import { num, rupiah } from "../../lib/format";
import { type Incoming, STATUS_LABEL, useIncoming } from "./incoming";
import { Row, StatusPill, Table } from "../../components/ui/table";
import PabrikPage from "./PabrikPage";

const W = "110px minmax(0,190px) minmax(0,1fr) 110px 130px 170px minmax(0,190px)";

const tone = (s: Incoming["status"]) => (s === 0 ? "wait" : s === 3 ? "idle" : "ok");

function Action({ o }: { o: Incoming }) {
  if (o.status === 3) return <span className="text-[13px] text-text-muted">Dana diteruskan</span>;
  if (o.status === 2) return <span className="text-[13px] text-text-muted">Menunggu konfirmasi UMKM</span>;
  if (!o.live) return null;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => advanceOrder(o.id)}
      className="h-10 rounded-[10px] border border-brand px-4 text-[13px] font-semibold text-brand transition-colors hover:bg-brand-soft"
    >
      {o.status === 0 ? "Tandai disiapkan" : o.pickup === "ambil" ? "Tandai siap diambil" : "Tandai dikirim"}
    </motion.button>
  );
}

export default function PesananMasukView() {
  const rows = useIncoming();
  const live = rows.filter((r) => r.live).length;

  return (
    <PabrikPage
      label="Pesanan masuk"
      title="Pesanan masuk"
      desc="Pesanan UMKM atas lotmu. Siapkan lot, lalu tandai siap. Dana baru diteruskan setelah UMKM konfirmasi barang diterima."
      note="Dua baris terakhir adalah contoh demo. Pesanan yang kamu buat lewat Checkout sebagai UMKM di browser ini muncul di paling atas."
    >
      {live > 0 && (
        <p className="rounded-[10px] bg-brand-soft px-4 py-3 text-[14px]">
          {live} pesanan dari checkout demo masuk. Majukan statusnya di bawah, lalu masuk lagi sebagai UMKM untuk
          konfirmasi diterima.
        </p>
      )}
      <Table
        label="Tabel pesanan masuk"
        head={["Pesanan", "Pembeli", "Lot", "Jumlah", "Total", "Status", "Tindakan"]}
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
              <Action o={o} />
            </span>
          </Row>
        ))}
      </Table>
    </PabrikPage>
  );
}
