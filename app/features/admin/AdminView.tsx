"use client";

import { m as motion } from "motion/react";
import { useState } from "react";
import { Row, StatusPill, Table } from "../../components/ui/table";
import { rupiah } from "../../lib/format";
import { type Profil, saveProfil, useProfil } from "../akun/profil";
import type { Role } from "../auth/session";
import PabrikPage from "../pabrik/PabrikPage";
import { advanceOrder, useOrders } from "../umkm/pesanan/orders";

const WV = "minmax(0,150px) minmax(0,190px) minmax(0,1fr) 150px minmax(0,300px)";
const WK = "110px minmax(0,1fr) 120px minmax(0,1fr) 150px 220px";
const btn =
  "h-10 rounded-[2px] border border-brand px-4 text-[13px] font-semibold text-brand transition-colors hover:bg-brand-soft";

type Who = Exclude<Role, "admin">;
const LABEL: Record<Who, string> = { umkm: "UMKM", pabrik: "Pabrik" };

function stateOf(p: Profil | null | undefined) {
  if (!p) return { tone: "idle" as const, text: "Belum mengisi" };
  if (p.approvedAt) return { tone: "ok" as const, text: "Terverifikasi" };
  if (p.submittedAt) return { tone: "wait" as const, text: "Menunggu cek admin" };
  return { tone: "idle" as const, text: p.revisionNote ? "Perlu revisi" : "Belum dikirim" };
}

function VerifRow({ who }: { who: Who }) {
  const p = useProfil(who);
  const [note, setNote] = useState("");
  const [asking, setAsking] = useState(false);
  if (p === undefined) return null;
  const st = stateOf(p);
  const pending = !!p?.submittedAt && !p.approvedAt;

  const approve = () => p && saveProfil(who, { ...p, approvedAt: new Date().toISOString(), revisionNote: undefined });
  const revise = () => {
    if (!p) return;
    saveProfil(who, {
      ...p,
      submittedAt: undefined,
      approvedAt: undefined,
      revisionNote: note.trim() || "Lengkapi bukti usaha lalu kirim ulang.",
    });
    setAsking(false);
    setNote("");
  };

  return (
    <Row widths={WV}>
      <span className="font-medium">{LABEL[who]}</span>
      <span className="flex flex-col">
        <span>{p?.business || "-"}</span>
        <span className="text-[12px] text-text-muted">{p?.person || ""}</span>
      </span>
      <span className="flex flex-col gap-0.5 text-[13px]">
        <span>NIB: {p?.nib ? p.nib : "tidak ada"}</span>
        <span className="text-text-muted">Bukti: {p?.docs.length ? p.docs.join(", ") : "belum ada"}</span>
        {who === "umkm" && p?.needs && (
          <span className="text-text-muted">
            Butuh {p.needs.fabric || "-"}, {p.needs.monthlyKg || "?"} kg per bulan
            {p.needs.budget ? `, anggaran ${rupiah(Number(p.needs.budget) || 0)}` : ""}
          </span>
        )}
      </span>
      <span>
        <StatusPill tone={st.tone}>{st.text}</StatusPill>
      </span>
      <span className="flex flex-col gap-2">
        {pending && !asking && (
          <span className="flex flex-wrap gap-2">
            <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={approve} className={btn}>
              Setujui
            </motion.button>
            <button type="button" onClick={() => setAsking(true)} className={`${btn} border-border-strong text-text hover:bg-card`}>
              Minta revisi
            </button>
          </span>
        )}
        {pending && asking && (
          <span className="flex flex-wrap items-center gap-2">
            <input
              aria-label={`Catatan revisi ${LABEL[who]}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan revisi"
              className="h-10 min-w-0 flex-1 rounded-[2px] border border-line bg-card px-3 text-[13px] outline-none focus:border-brand"
            />
            <button type="button" onClick={revise} className={btn}>
              Kirim
            </button>
          </span>
        )}
        {!pending && <span className="text-[13px] text-text-muted">{p?.approvedAt ? "Sudah disetujui" : "Menunggu pengguna"}</span>}
      </span>
    </Row>
  );
}

export default function AdminView() {
  const orders = useOrders();
  const kirim = orders.filter((o) => o.pickup === "kirim" && o.status >= 3);

  return (
    <PabrikPage
      label="Panel admin"
      title="Panel admin"
      desc="Dua pekerjaan admin Kainara: memeriksa akun UMKM dan pabrik sebelum bisa bertransaksi, dan meneruskan konfirmasi penerimaan dari kurir (JNE atau J&T) untuk pesanan yang diantar."
      note="Demo: data dibaca dari browser ini. Di produksi, konfirmasi kurir datang dari sistem kurir, bukan dari tombol."
    >
      <section aria-label="Verifikasi akun" className="flex flex-col gap-3">
        <h2 className="text-[20px] font-medium leading-6">Verifikasi akun</h2>
        <Table label="Tabel verifikasi akun" head={["Peran", "Usaha", "Bukti", "Status", "Tindakan"]} widths={WV}>
          <VerifRow who="umkm" />
          <VerifRow who="pabrik" />
        </Table>
      </section>

      <section aria-label="Konfirmasi kurir" className="flex flex-col gap-3">
        <h2 className="text-[20px] font-medium leading-6">Konfirmasi kurir</h2>
        {kirim.length === 0 ? (
          <p className="rounded-[2px] border border-line bg-panel px-5 py-4 text-[14px] text-text-muted">
            Belum ada pesanan diantar yang sedang dikirim. Buat pesanan dengan &quot;Minta diantar&quot; sebagai UMKM, lalu majukan
            statusnya sebagai pabrik sampai &quot;Dikirim&quot;.
          </p>
        ) : (
          <Table label="Tabel konfirmasi kurir" head={["Pesanan", "Tujuan", "Kurir", "Penerima", "Status", "Tindakan"]} widths={WK}>
            {kirim.map((o) => (
              <Row key={o.id} widths={WK}>
                <span className="font-medium">{o.id}</span>
                <span className="text-[13px]">{o.address ?? "-"}</span>
                <span>{o.courier === "J&T" ? "J&T Express" : (o.courier ?? "JNE")}</span>
                <span className="text-[13px]">{o.buyer ? `${o.buyer.person}, ${o.buyer.phone}` : "-"}</span>
                <span>
                  <StatusPill tone={o.status === 3 ? "wait" : "ok"}>
                    {o.status === 3 ? "Dikirim" : "Diterima, dikonfirmasi kurir"}
                  </StatusPill>
                </span>
                <span>
                  {o.status === 3 ? (
                    <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => advanceOrder(o.id)} className={btn}>
                      Teruskan konfirmasi kurir
                    </motion.button>
                  ) : (
                    <span className="text-[13px] text-text-muted">Masa komplain 48 jam berjalan</span>
                  )}
                </span>
              </Row>
            ))}
          </Table>
        )}
      </section>
    </PabrikPage>
  );
}
