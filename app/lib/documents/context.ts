import type { DokRef, FiskalKey, FiskalRow, Lot, LotCustoms, Order, PengeluaranStatus } from "../domain/types";
import { PENGELUARAN_LABEL } from "../domain/types";
import { num, rupiah } from "../format";
import type { DocKind } from "./specs";

/**
 * Menyusun nilai untuk placeholder template (lihat docs/PLACEHOLDER.md).
 *
 * Aturan isi:
 *  - Data yang belum ada tidak pernah dikarang. Ditulis "Menunggu: <apa>" (data yang harus diisi pihak tertentu)
 *    atau "Belum diverifikasi" (nilai fiskal yang belum dipastikan EXIM).
 *  - "Belum diverifikasi" TIDAK sama dengan Rp0. Nominal pajak tidak pernah diisi 0 bila belum diketahui.
 *  - Angka contoh demo (stok, harga) ikut dari data demo; dokumen ini rancangan internal dan belum
 *    divalidasi EXIM pabrik sebelum dipakai di transaksi nyata.
 */

/** Profil yang dibutuhkan dokumen; subset dari `Profil` supaya lib ini tidak bergantung pada fitur akun. */
export type PartyProfile = {
  person: string;
  business: string;
  phone: string;
  address: string;
  nib: string;
  email?: string;
  jabatan?: string;
  npwp?: string;
  kota?: string;
  provinsi?: string;
  pabrik?: { nomorIzinKB: string; kantorPabean: string; eximNama?: string; eximJabatan?: string };
};

export type DocInput = {
  order: Order;
  lot?: Lot;
  /** pabrik penjual */
  seller: PartyProfile;
  /** profil UMKM pembeli (cadangan bila pesanan tidak menyimpan data pembeli) */
  buyer: PartyProfile | null;
  customs: LotCustoms;
  exim: PartyProfile | null;
  admin: PartyProfile | null;
  now: Date;
};

export const P = (what: string) => `Menunggu: ${what}`;
export const BELUM = "Belum diverifikasi";

const filled = (v?: string | null) => (v ?? "").trim();
const tanggal = (d: Date | string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const bulan = (d: Date | string) => new Date(d).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
const dokText = (d?: DokRef) => {
  if (!d) return "";
  const parts = [filled(d.jenis), filled(d.nomor), d.tanggal ? tanggal(d.tanggal) : ""].filter(Boolean);
  return parts.join(", ");
};
/** Alamat lengkap; kota dan provinsi tidak diulang bila sudah tertulis di alamat. */
const joinAlamat = (p: PartyProfile) => {
  const base = filled(p.address);
  const extra = [filled(p.kota), filled(p.provinsi)].filter((x) => x && !base.toLowerCase().includes(x.toLowerCase()));
  return [base, ...extra].filter(Boolean).join(", ");
};
const kontak = (p: { phone: string; email?: string }) => [filled(p.phone), filled(p.email)].filter(Boolean).join(", ");
const kurirName = (c?: string) => (c === "J&T" ? "J&T Express" : (c ?? "JNE atau J&T"));

const KATEGORI_USUL: Record<string, string> = { "Cutting offcuts": "Perca pemotongan", Perca: "Perca pemotongan", "Sisa gulungan": "Sisa bahan baku" };
const kategoriUsulan = (lot?: Lot) => (lot ? (KATEGORI_USUL[lot.category] ?? "") : "");

export const invoiceNo = (o: Order) => `INV-${o.id}`;
export const laporanNo = (o: Order) => `LPK-${o.id}`;

const unitPrice = (o: Order) => o.price;
const subtotal = (o: Order) => o.qty * o.price;

/** Bagian pembeli dari pesanan, dilengkapi profil UMKM bila pesanan lama tidak menyimpannya. */
function buyerOf(i: DocInput) {
  const b = i.order.buyer;
  const p = i.buyer;
  return {
    nama: filled(b?.business) || filled(p?.business),
    person: filled(b?.person) || filled(p?.person),
    phone: filled(b?.phone) || filled(p?.phone),
    email: filled(b?.email) || filled(p?.email),
    npwp: filled(b?.npwp) || filled(p?.npwp),
    nib: filled(b?.nib) || filled(p?.nib),
    alamatUsaha: filled(b?.alamatUsaha) || (p ? joinAlamat(p) : ""),
  };
}

function checkbox(status: PengeluaranStatus | undefined) {
  const s = status ?? "draf";
  const c = (k: PengeluaranStatus) => (s === k ? "☒" : "☐");
  return {
    cb_draf: c("draf"),
    cb_verifikasi: c("verifikasi"),
    cb_dokumen: c("dokumen"),
    cb_ditahan: c("ditahan"),
    cb_terpenuhi: c("terpenuhi"),
  };
}

function fiskalRow(r: FiskalRow | undefined) {
  const s = r?.status ?? "belum";
  if (s === "berlaku") {
    return {
      dasar: filled(r?.dasar) || P("dasar pengenaan"),
      tarif: filled(r?.tarif) || P("tarif"),
      nominal: filled(r?.nominal) || P("nominal"),
    };
  }
  if (s === "dikecualikan") return { dasar: `Dikecualikan. ${filled(r?.dasar) || P("dasar hukum pengecualian")}`, tarif: "-", nominal: "-" };
  if (s === "tidakBerlaku") return { dasar: "Tidak berlaku", tarif: "-", nominal: "-" };
  // belum diverifikasi: bukan nihil
  return { dasar: BELUM, tarif: BELUM, nominal: `${BELUM}, bukan Rp0` };
}

/** Konteks invoice komersial. */
export function invoiceContext(i: DocInput) {
  const { order: o, seller: s, lot } = i;
  const b = buyerOf(i);
  const kirim = o.pickup === "kirim";
  const dibayar = o.status >= 1;
  return {
    nomor_invoice: invoiceNo(o),
    tanggal_invoice: tanggal(o.createdAt),
    nomor_pesanan: o.id,
    referensi_pembayaran: o.va
      ? `Virtual account ${o.va}${o.paidAt ? `, dibayar ${tanggal(o.paidAt)}` : ", belum dibayar"}`
      : P("referensi PJP"),

    penjual_nama: filled(s.business) || P("nama pabrik"),
    penjual_alamat: joinAlamat(s) || P("alamat pabrik"),
    penjual_npwp: filled(s.npwp) || P("NPWP pabrik"),
    penjual_nib: filled(s.nib) || P("NIB pabrik"),
    penjual_kontak: kontak(s) || P("kontak pabrik"),

    pembeli_nama: b.nama || b.person || P("nama usaha pembeli"),
    pembeli_alamat: b.alamatUsaha || o.address || P("alamat usaha pembeli"),
    pembeli_npwp: b.npwp || "Tidak diisi",
    pembeli_nib: b.nib || "Tidak diisi",
    pembeli_kontak: kontak({ phone: b.phone, email: b.email }) || P("kontak pembeli"),

    items: [
      {
        no: "1",
        uraian: lot?.title ?? o.title,
        kode_lot: o.code,
        jumlah: num(o.qty),
        satuan: o.unit,
        harga_satuan: num(unitPrice(o)),
        nilai: num(subtotal(o)),
      },
    ],

    subtotal: num(subtotal(o)),
    biaya_kirim: kirim ? "Dibayar langsung ke kurir, di luar total" : "0",
    potongan: "0",
    // pajak yang belum dipastikan tidak boleh ditulis nihil
    ppn: BELUM,
    total_tagihan: `${num(subtotal(o))} (belum termasuk pajak yang belum diverifikasi)`,
    status_bayar: dibayar ? "Lunas, pembayaran dikonfirmasi PJP" : "Menunggu pembayaran",

    metode_distribusi: kirim ? `Diantar kurir ${kurirName(o.courier)}` : "Ambil sendiri di pabrik",
    nomor_resi: filled(o.resi) || P(kirim ? "nomor resi, diisi pabrik saat dikirim" : "kode pickup, diisi pabrik saat siap diambil"),
    alamat_kirim: kirim ? filled(o.address) || P("alamat kirim") : "Diambil di lokasi pabrik",
    metode_bayar: "Virtual account lewat PJP",
    ref_faktur_pajak: filled(o.refFakturPajak) || BELUM,
    ref_dokumen_pabean: dokText(o.dokPengeluaran) || BELUM,

    ttd_penyiap_nama: filled(i.admin?.person) || "Sistem Kainara",
    ttd_penjual_nama: filled(s.person) || P("nama penanda tangan pabrik"),
    ttd_penjual_jabatan: filled(s.jabatan) || P("jabatan penanda tangan"),
  };
}

/** Konteks laporan pendukung kepabeanan. */
export function laporanContext(i: DocInput) {
  const { order: o, seller: s, lot, customs: c } = i;
  const b = buyerOf(i);
  const kirim = o.pickup === "kirim";
  const idPenerima = [b.npwp && `NPWP ${b.npwp}`, b.nib && `NIB ${b.nib}`].filter(Boolean).join(", ");
  const kemasan = [filled(c.kemasanJenis), filled(c.kemasanJumlah)].filter(Boolean).join(", ");
  const asal = c.asalBahan ? (c.asalBahan === "impor" ? "impor" : "domestik") : "";
  return {
    nomor_laporan: laporanNo(o),
    tanggal_laporan: tanggal(i.now),
    nomor_invoice: invoiceNo(o),
    nomor_pesanan: o.id,

    pengusaha_nama: filled(s.business) || P("nama pabrik"),
    pengusaha_alamat: joinAlamat(s) || P("alamat pabrik"),
    pengusaha_npwp_nib: `${filled(s.npwp) ? `NPWP ${filled(s.npwp)}` : P("NPWP pabrik")} / ${filled(s.nib) ? `NIB ${filled(s.nib)}` : P("NIB pabrik")}`,
    nomor_izin_kb: filled(s.pabrik?.nomorIzinKB) || P("nomor izin Kawasan Berikat, diisi pabrik"),
    kantor_pabean: filled(s.pabrik?.kantorPabean) || P("kantor pabean pengawas, diisi pabrik"),
    penerima_nama: b.nama || b.person || P("nama penerima"),
    penerima_alamat: kirim ? filled(o.address) || b.alamatUsaha || P("alamat penerima") : "Diambil sendiri di lokasi pabrik",
    penerima_identitas: idPenerima || "Tidak dipersyaratkan atau belum diisi",

    uraian_kode_lot: `${lot?.title ?? o.title} / ${o.code}`,
    kategori:
      filled(o.kategoriMaterial) ||
      (kategoriUsulan(lot) ? `Usulan: ${kategoriUsulan(lot)}, menunggu konfirmasi EXIM` : P("klasifikasi EXIM (perca pemotongan, sisa bahan baku, atau produk reject)")),
    komposisi_asal: `${lot?.spec.komposisi ?? "-"}; asal bahan: ${asal || P("impor atau domestik, diisi pabrik")}`,
    hs_code_negara: `${filled(c.hsCode) || P("HS Code, diisi pabrik dan dikonfirmasi EXIM")} / ${filled(c.negaraAsal) || (c.asalBahan === "domestik" ? "Indonesia" : P("negara asal"))}`,
    jumlah_satuan: `${num(o.qty)} ${o.unit}`,
    berat: `${num(o.qty)} ${o.unit} / ${filled(c.beratKotor) ? `${c.beratKotor} ${o.unit}` : P("berat kotor, diisi pabrik")}`,
    kemasan: kemasan || P("jenis dan jumlah kemasan, diisi pabrik"),
    nilai_barang: `${rupiah(subtotal(o))} (IDR)`,

    dok_pemasukan: dokText(c.dokPemasukan) || P("dokumen pemasukan, diisi pabrik"),
    dok_pengeluaran: dokText(o.dokPengeluaran) || P("dokumen pengeluaran, diisi EXIM"),
    persetujuan_pengeluaran: filled(o.persetujuanPengeluaran) || P("referensi persetujuan pengeluaran, diisi EXIM"),
    // lembar rekonsiliasi Kainara untuk pesanan ini; EXIM boleh menggantinya dengan referensi lain
    ref_laporan_fiskal: filled(o.refLaporanFiskal) || `${laporanNo(o)} (lembar rekonsiliasi fiskal dan stok)`,
    ...checkbox(o.statusPengeluaran),

    ttd_penyiap_nama: filled(s.person) || P("nama penyiap"),
    ttd_exim_nama: filled(i.exim?.person) || P("nama EXIM"),
    ttd_exim_jabatan: filled(i.exim?.jabatan) || P("jabatan EXIM"),
  };
}

/** Konteks lembar rekonsiliasi fiskal dan stok. */
export function rekonContext(i: DocInput) {
  const { order: o, seller: s, lot, customs: c } = i;
  const keluar = o.status >= 3 ? o.qty : 0; // keluar aktual baru terjadi saat barang dikirim atau diambil
  const awal = lot?.stock ?? 0;
  const akhir = awal - keluar;
  const fisikStr = filled(o.stokFisik);
  const fisik = fisikStr === "" || Number.isNaN(Number(fisikStr)) ? null : Number(fisikStr);
  const selisih = fisik === null ? null : fisik - akhir;
  const rencana = o.status < 3 ? o.qty : 0;
  const fiskal = o.fiskal ?? {};
  const row = (k: FiskalKey) => fiskalRow(fiskal[k]);
  // dasar nilai pabean: nilai transaksi pesanan (hanya angka dasar); tarif dan nominal tetap menunggu EXIM
  const pabeanRaw = row("pabean");
  const pabean = fiskal.pabean?.status === undefined || fiskal.pabean.status === "belum"
    ? { ...pabeanRaw, dasar: `${filled(fiskal.pabean?.dasar) || `Nilai transaksi ${rupiah(subtotal(o))}`} (usulan, belum diverifikasi)` }
    : pabeanRaw;
  const bm = row("bm");
  const ppnImpor = row("ppnImpor");
  const pph22 = row("pph22");
  const ppnbm = row("ppnbm");
  const cukai = row("cukai");
  const ppnDom = row("ppnDom");
  const catatan =
    selisih === null
      ? `Status pengeluaran: ${PENGELUARAN_LABEL[o.statusPengeluaran ?? "draf"]}. Stok fisik belum diisi pabrik; selisih belum bisa dihitung. Angka stok adalah contoh demo.`
      : selisih === 0
        ? `Status pengeluaran: ${PENGELUARAN_LABEL[o.statusPengeluaran ?? "draf"]}. Stok fisik sesuai catatan sistem. Angka stok adalah contoh demo.`
        : `Status pengeluaran: ${PENGELUARAN_LABEL[o.statusPengeluaran ?? "draf"]}. Ada selisih ${num(selisih)} ${o.unit} antara stok fisik dan catatan sistem; perlu penjelasan sebelum pengeluaran.`;
  return {
    nomor_laporan: laporanNo(o),
    periode: bulan(o.createdAt),
    nomor_invoice_order: `${invoiceNo(o)} / ${o.id}`,
    kode_lot: o.code,
    perusahaan_nama: filled(s.business) || P("nama pabrik"),
    tanggal_rekon: tanggal(i.now),

    pabean_dasar: pabean.dasar,
    pabean_tarif: pabean.tarif,
    pabean_nominal: pabean.nominal,
    bm_dasar: bm.dasar,
    bm_tarif: bm.tarif,
    bm_nominal: bm.nominal,
    ppn_impor_dasar: ppnImpor.dasar,
    ppn_impor_tarif: ppnImpor.tarif,
    ppn_impor_nominal: ppnImpor.nominal,
    pph22_dasar: pph22.dasar,
    pph22_tarif: pph22.tarif,
    pph22_nominal: pph22.nominal,
    ppnbm_dasar: ppnbm.dasar,
    ppnbm_tarif: ppnbm.tarif,
    ppnbm_nominal: ppnbm.nominal,
    cukai_dasar: cukai.dasar,
    cukai_tarif: cukai.tarif,
    cukai_nominal: cukai.nominal,
    ppn_dom_dasar: ppnDom.dasar,
    ppn_dom_tarif: ppnDom.tarif,
    ppn_dom_nominal: ppnDom.nominal,
    dasar_fasilitas: filled(o.dasarFasilitas) || BELUM,
    ref_faktur_pajak: filled(o.refFakturPajak) || BELUM,
    kode_billing: filled(o.kodeBilling) || BELUM,
    ntpn: filled(o.ntpn) || BELUM,

    saldo_awal: num(awal),
    masuk: "0",
    keluar: num(keluar),
    penyesuaian: "0",
    saldo_akhir: num(akhir),
    stok_fisik: fisik === null ? P("stok fisik hasil opname, diisi pabrik") : num(fisik),
    selisih: selisih === null ? P("hitung setelah stok fisik diisi") : num(selisih),
    satuan: o.unit,
    rencana_keluar: num(rencana),
    proyeksi_saldo: num(akhir - rencana),
    tgl_opname: o.tglOpname ? tanggal(o.tglOpname) : P("tanggal stock opname, diisi pabrik"),
    ref_it_inventory: filled(o.refItInventory) || P("referensi IT Inventory, diisi pabrik"),
    catatan_status: catatan,

    lamp_invoice: `Invoice ${invoiceNo(o)} tersedia`,
    lamp_pemasukan: dokText(c.dokPemasukan) || P("dokumen pemasukan"),
    lamp_pabean: [dokText(o.dokPengeluaran), filled(o.persetujuanPengeluaran)].filter(Boolean).join("; ") || P("dokumen pabean dan persetujuan"),
    lamp_pelunasan: filled(o.ntpn) || "Belum diverifikasi, atau tidak berlaku bila dikecualikan",
    lamp_timbang: o.tglOpname ? `Stock opname ${tanggal(o.tglOpname)}, kode lot ${o.code}` : P("bukti timbang dan stock opname"),

    ttd_penyiap_nama: filled(s.person) || P("nama penyiap"),
    ttd_exim_nama: filled(i.exim?.person) || P("nama EXIM"),
    ttd_setuju_nama: filled(i.admin?.person) || P("nama penyetuju"),
  };
}

export function buildContext(kind: DocKind, i: DocInput): Record<string, unknown> {
  return kind === "invoice" ? invoiceContext(i) : kind === "laporan" ? laporanContext(i) : rekonContext(i);
}

/** Nama berkas unduhan, mis. invoice-KN-ABC123.docx */
export const fileNameOf = (prefix: string, o: Order) => `${prefix}-${o.id}.docx`;
