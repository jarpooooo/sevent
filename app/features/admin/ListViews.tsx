"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusPill } from "../../components/ui/table";
import { SEKTOR_LABEL } from "../akun/profil";
import { num, rupiah } from "../../lib/format";
import { ORDER_STEPS } from "../umkm/pesanan/orders";
import { type Akun, V_LABEL, V_TONE, type Kind, kotaOf, tgl, useAkun, usePesanan, vstatus, type VStatus } from "./data";
import { filterRows, LinkTable, PageHead, Toolbar } from "./ui";

const Tag = ({ sample }: { sample: boolean }) => (
  <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[11px] font-normal text-text-muted">{sample ? "contoh demo" : "akun demo"}</span>
);

const VCHIPS: VStatus[] = ["ok", "menunggu", "revisi", "belum"];

/** Daftar UMKM atau pabrik: cari, filter status, urutkan; tiap baris menuju detail. */
export function ListAkun({ kind }: { kind: Kind }) {
  const items = useAkun(kind);
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("semua");
  const [sort, setSort] = useState("baru");
  const umkm = kind === "umkm";

  const rows = useMemo(() => {
    const f = filterRows(
      items,
      q,
      chip,
      (a) => `${a.p.business} ${a.p.person} ${kotaOf(a.p)} ${a.p.provinsi ?? ""} ${a.p.needs?.fabric ?? ""} ${a.p.pabrik?.jenisSisa ?? ""} ${a.id}`,
      (a) => vstatus(a.p),
    );
    return [...f].sort((a, b) => (sort === "nama" ? a.p.business.localeCompare(b.p.business) : b.joined.localeCompare(a.joined)));
  }, [items, q, chip, sort]);

  const chips = [{ v: "semua", t: "Semua", n: items.length }, ...VCHIPS.map((v) => ({ v, t: V_LABEL[v], n: items.filter((a) => vstatus(a.p) === v).length }))];
  const W = umkm ? "minmax(0,1.5fr) 130px minmax(0,1.1fr) 150px 180px 110px" : "minmax(0,1.5fr) 130px minmax(0,1.3fr) 130px 180px 110px";

  const cell = (a: Akun) => {
    const v = vstatus(a.p);
    const name = (
      <span className="flex flex-col">
        <span className="font-medium">
          {a.p.business}
          <Tag sample={a.sample} />
        </span>
        <span className="text-[12px] text-text-muted">{a.p.person}</span>
      </span>
    );
    const status = <StatusPill tone={V_TONE[v]}>{V_LABEL[v]}</StatusPill>;
    return umkm
      ? [
          name,
          kotaOf(a.p),
          a.p.needs?.fabric ? `${a.p.needs.fabric}, ${a.p.needs.monthlyKg || "?"} kg/bln` : <span className="text-text-muted">Belum diisi</span>,
          a.p.nib ? "NIB ada" : a.p.docs.length ? `${a.p.docs.length} berkas` : <span className="text-text-muted">Belum ada</span>,
          status,
          tgl(a.joined),
        ]
      : [
          name,
          kotaOf(a.p),
          a.p.pabrik?.sektor ? `${SEKTOR_LABEL[a.p.pabrik.sektor].split(",")[0]}${a.p.pabrik.jenisSisa ? `, ${a.p.pabrik.jenisSisa}` : ""}` : <span className="text-text-muted">Belum diisi</span>,
          a.p.pabrik?.nomorIzinKB ? "Terisi" : <span className="text-text-muted">Menunggu</span>,
          status,
          tgl(a.joined),
        ];
  };

  return (
    <div className="flex flex-col gap-7">
      <PageHead
        title={umkm ? "UMKM" : "Pabrik"}
        desc={umkm ? "Akun penjahit dan pengrajin. Klik baris untuk melihat bukti dan memutuskan verifikasi." : "Akun pabrik penjual. Klik baris untuk memeriksa izin, data usaha, dan memutuskan verifikasi."}
      />
      <Toolbar
        q={q}
        onQ={setQ}
        chips={chips}
        chip={chip}
        onChip={setChip}
        sort={sort}
        onSort={setSort}
        sorts={[{ v: "baru", t: "Terbaru" }, { v: "nama", t: "Nama A sampai Z" }]}
        shown={rows.length}
        total={items.length}
        label={umkm ? "UMKM, kota, atau kain" : "pabrik, kota, atau jenis sisa"}
      />
      <LinkTable
        label={`Tabel ${kind}`}
        widths={W}
        head={umkm ? ["Usaha", "Kota", "Kebutuhan", "Bukti", "Status", "Bergabung"] : ["Pabrik", "Kota", "Kegiatan", "Izin KB", "Status", "Bergabung"]}
        rows={rows.map((a) => ({ id: a.id, href: `/admin/${kind}/detail?id=${a.id}`, cells: cell(a) }))}
        empty="Tidak ada yang cocok. Ubah kata cari atau filter."
      />
      <p className="text-[12px] text-text-muted">Baris berlabel &quot;contoh demo&quot; adalah data rekaan supaya tabel terlihat; hanya akun demo yang bisa diubah.</p>
    </div>
  );
}

/** Enam tahap pesanan, sama dengan batang di Ringkasan: klik batang membuka daftar ini dengan filter tahap itu. */
const TAHAP = ["Dibuat", "Dibayar", "Disiapkan", "Dikirim", "Diterima", "Selesai"];

export function ListPesanan() {
  const items = usePesanan();
  const [q, setQ] = useState("");
  const tahap = useSearchParams().get("tahap");
  const [chip, setChip] = useState(tahap && /^[0-5]$/.test(tahap) ? tahap : "semua");
  const [sort, setSort] = useState("baru");

  const rows = useMemo(() => {
    const f = filterRows(
      items,
      q,
      chip,
      ({ o }) => `${o.id} ${o.title} ${o.code} ${o.buyer?.business ?? ""} ${o.buyer?.person ?? ""} ${o.courier ?? ""} ${o.pickup}`,
      ({ o }) => String(o.status),
    );
    return [...f].sort((a, b) => (sort === "nilai" ? b.o.qty * b.o.price - a.o.qty * a.o.price : b.o.createdAt.localeCompare(a.o.createdAt)));
  }, [items, q, chip, sort]);

  const chips = [{ v: "semua", t: "Semua", n: items.length }, ...TAHAP.map((t, i) => ({ v: String(i), t, n: items.filter(({ o }) => o.status === i).length }))];

  return (
    <div className="flex flex-col gap-7">
      <PageHead title="Pesanan" desc="Semua pesanan UMKM. Klik baris untuk melihat tahap, Compliance Lock, konfirmasi kurir, dan dokumen." />
      <Toolbar
        q={q}
        onQ={setQ}
        chips={chips}
        chip={chip}
        onChip={setChip}
        sort={sort}
        onSort={setSort}
        sorts={[{ v: "baru", t: "Terbaru" }, { v: "nilai", t: "Nilai terbesar" }]}
        shown={rows.length}
        total={items.length}
        label="nomor pesanan, lot, atau pembeli"
      />
      <LinkTable
        label="Tabel pesanan"
        widths="110px minmax(0,1.4fr) minmax(0,1fr) 150px 190px 120px 110px"
        head={["Pesanan", "Lot", "Pembeli", "Pengiriman", "Status", "Total", "Tanggal"]}
        rows={rows.map(({ o, sample }) => ({
          id: o.id,
          href: `/admin/pesanan/detail?id=${o.id}`,
          cells: [
            <span key="i" className="font-medium">
              {o.id}
            </span>,
            <span key="l" className="flex flex-col">
              <span>{o.title}</span>
              <span className="text-[12px] text-text-muted">
                {num(o.qty)} {o.unit}
                {sample ? ", contoh demo" : ""}
              </span>
            </span>,
            o.buyer ? o.buyer.business || o.buyer.person : "Sari Jahit Rumahan",
            o.pickup === "ambil" ? "Ambil sendiri" : `Diantar ${o.courier === "J&T" ? "J&T" : (o.courier ?? "JNE")}`,
            <StatusPill key="s" tone={o.status === 0 ? "wait" : o.status === 5 ? "idle" : "ok"}>
              {ORDER_STEPS(o.pickup)[o.status].t}
            </StatusPill>,
            <span key="t" className="tabular-nums">
              {rupiah(o.qty * o.price)}
            </span>,
            tgl(o.createdAt),
          ],
        }))}
        empty="Tidak ada pesanan yang cocok. Ubah kata cari atau filter."
      />
    </div>
  );
}
