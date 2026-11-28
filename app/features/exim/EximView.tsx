"use client";

import { ScanSearch } from "lucide-react";
import Link from "next/link";
import { Row, StatusPill, Table } from "../../components/ui/table";
import { PENGELUARAN_LABEL, type PengeluaranStatus } from "../../lib/domain/types";
import { num } from "../../lib/format";
import PabrikPage from "../pabrik/PabrikPage";
import { customsComplete, customsOf, useLotCustomsStore } from "../pabrik/lotdoc";
import { useOrders } from "../umkm/pesanan/orders";

const W = "110px minmax(0,1fr) 110px 170px 190px 150px";
export const lockTone = (l: PengeluaranStatus) => (l === "terpenuhi" ? "ok" : l === "draf" ? "idle" : "wait");

/** Panel EXIM: daftar pesanan yang menunggu pemeriksaan persyaratan pengeluaran barang. */
export default function EximView() {
  const orders = useOrders().filter((o) => o.status >= 1);
  const store = useLotCustomsStore();
  const waiting = orders.filter((o) => (o.statusPengeluaran ?? "draf") === "verifikasi").length;

  return (
    <PabrikPage
      label="Pemeriksaan EXIM"
      title="Pemeriksaan EXIM"
      desc="Periksa asal barang, klasifikasi, dan dokumen pengeluaran sebelum barang keluar dari pabrik. Dilakukan petugas EXIM pabrik; pesanan baru bisa dikirim setelah persyaratan terpenuhi."
      note="Demo: data dibaca dari browser ini. Platform membantu administrasi dan tidak menggantikan Bea Cukai. Jenis pemberitahuan pabean, klasifikasi, dan persyaratan ditentukan EXIM sesuai ketentuan yang berlaku."
    >
      {waiting > 0 && <p className="rounded-[2px] bg-brand-soft px-4 py-3 text-[14px]">{waiting} pesanan menunggu verifikasi EXIM.</p>}
      {orders.length === 0 ? (
        <p className="rounded-[2px] border border-line bg-panel px-5 py-4 text-[14px] text-text-muted">
          Belum ada pesanan yang sudah dibayar. Buat pesanan sebagai UMKM, simulasikan pembayaran, lalu siapkan sebagai pabrik.
        </p>
      ) : (
        <Table label="Tabel pesanan untuk EXIM" head={["Pesanan", "Lot", "Jumlah", "Data lot", "Pengeluaran", "Tindakan"]} widths={W}>
          {orders.map((o) => {
            const lock = o.statusPengeluaran ?? "draf";
            const lotOk = customsComplete(customsOf(store, o.slug));
            return (
              <Row key={o.id} widths={W}>
                <span className="font-medium">{o.id}</span>
                <span>{o.title}</span>
                <span className="tabular-nums">
                  {num(o.qty)} {o.unit}
                </span>
                <span>
                  <StatusPill tone={lotOk ? "ok" : "wait"}>{lotOk ? "Lengkap" : "Menunggu pabrik"}</StatusPill>
                </span>
                <span>
                  <StatusPill tone={lockTone(lock)}>{PENGELUARAN_LABEL[lock]}</StatusPill>
                </span>
                <span>
                  <Link
                    href={`/pemeriksaan-exim/periksa?id=${encodeURIComponent(o.id)}`}
                    className="inline-flex h-10 items-center gap-1.5 rounded-[2px] border border-brand px-4 text-[13px] font-semibold text-brand transition-colors hover:bg-brand-soft"
                  >
                    <ScanSearch aria-hidden="true" className="size-4" strokeWidth={1.9} />
                    Periksa
                  </Link>
                </span>
              </Row>
            );
          })}
        </Table>
      )}
    </PabrikPage>
  );
}
