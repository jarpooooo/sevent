# Peta placeholder dokumen

Tiga template ada di `public/templates/` (.docx, tanda `{{...}}`, perulangan `{{#items}} ... {{/items}}`).
Nilainya disusun di `app/lib/documents/context.ts`, diisi ke template oleh `app/lib/documents/render.ts`
(docxtemplater di browser), dan diunduh lewat `DokumenMenu` (`app/features/dokumen/`).

## Aturan isi

- **Tidak ada angka karangan.** NPWP, HS Code, nomor izin, nomor dokumen, tarif, dan nominal pajak hanya dari data yang diisi pengguna.
- Data yang harus diisi pihak tertentu tertulis **"Menunggu: <apa>, diisi <siapa>"**.
- Nilai fiskal yang belum dipastikan EXIM tertulis **"Belum diverifikasi"**. Itu **bukan Rp0**.
- Angka stok dan harga adalah contoh demo. Dokumen adalah rancangan internal dan perlu divalidasi EXIM pabrik sebelum dipakai di transaksi nyata.
- Platform hanya mencatat referensi. Tidak menerbitkan kode billing, NTPN, atau Faktur Pajak, dan tidak menggantikan Bea Cukai.

## Akses

| Dokumen | UMKM | Pabrik | EXIM | Admin |
|---|---|---|---|---|
| Invoice komersial | ya | ya | ya | ya |
| Laporan pendukung kepabeanan | tidak | ya | ya | ya |
| Rekonsiliasi fiskal dan stok | tidak | ya | ya | ya |

## Invoice komersial (`invoice-komersial.docx`)

| Placeholder | Sumber | Bila kosong |
|---|---|---|
| `nomor_invoice` | `INV-` + id pesanan | selalu ada |
| `tanggal_invoice`, `nomor_pesanan` | `Order.createdAt`, `Order.id` | selalu ada |
| `referensi_pembayaran` | `Order.va`, `Order.paidAt` | Menunggu: referensi PJP |
| `penjual_nama/alamat/kontak` | Profil pabrik: `business`, `address`+`kota`+`provinsi`, `phone`+`email` | Menunggu: nama/alamat/kontak pabrik |
| `penjual_npwp` | Profil pabrik: `npwp` | Menunggu: NPWP pabrik |
| `penjual_nib` | Profil pabrik: `nib` | Menunggu: NIB pabrik |
| `pembeli_nama/alamat/kontak` | `Order.buyer` (cadangan: profil UMKM) | Menunggu: ... |
| `pembeli_npwp`, `pembeli_nib` | `Order.buyer.npwp/nib` (opsional, "jika relevan") | Tidak diisi |
| `items` (`no, uraian, kode_lot, jumlah, satuan, harga_satuan, nilai`) | Lot, `Order.qty`, `Order.price` | selalu ada |
| `subtotal` | qty x harga | selalu ada |
| `biaya_kirim` | diantar: "Dibayar langsung ke kurir, di luar total"; ambil sendiri: 0 | |
| `potongan` | 0 (belum ada mekanisme potongan) | |
| `ppn` | belum ada sumber pajak | **Belum diverifikasi** |
| `total_tagihan` | subtotal, dengan catatan pajak belum diverifikasi | |
| `status_bayar` | `Order.status` >= 1 | Menunggu pembayaran |
| `metode_distribusi`, `alamat_kirim` | `Order.pickup`, `Order.courier`, `Order.address` | |
| `nomor_resi` | `Order.resi` (pabrik) | Menunggu: nomor resi / kode pickup |
| `metode_bayar` | Virtual account lewat PJP | |
| `ref_faktur_pajak` | `Order.refFakturPajak` (EXIM) | Belum diverifikasi |
| `ref_dokumen_pabean` | `Order.dokPengeluaran` (EXIM) | Belum diverifikasi |
| `ttd_penyiap_nama` | Profil admin: `person` | Sistem Kainara |
| `ttd_penjual_nama/jabatan` | Profil pabrik: `person`, `jabatan` | Menunggu: ... |

## Laporan pendukung kepabeanan (`laporan-pendukung-kepabeanan.docx`)

| Placeholder | Sumber | Bila kosong |
|---|---|---|
| `nomor_laporan`, `tanggal_laporan`, `nomor_invoice`, `nomor_pesanan` | `LPK-` + id, tanggal unduh | selalu ada |
| `pengusaha_nama/alamat` | Profil pabrik | Menunggu |
| `pengusaha_npwp_nib` | Profil pabrik: `npwp`, `nib` | Menunggu per bagian |
| `nomor_izin_kb`, `kantor_pabean` | Profil pabrik: `pabrik.nomorIzinKB`, `pabrik.kantorPabean` | Menunggu, diisi pabrik |
| `penerima_nama/alamat/identitas` | `Order.buyer`, `Order.address` | Menunggu |
| `uraian_kode_lot`, `jumlah_satuan`, `nilai_barang` | Lot, `Order` | selalu ada |
| `kategori` | `Order.kategoriMaterial` (EXIM); tanpa itu, usulan dari kategori lot (Cutting offcuts, Perca = Perca pemotongan; Sisa gulungan = Sisa bahan baku) | Usulan: ..., menunggu konfirmasi EXIM |
| `komposisi_asal` | `Lot.spec.komposisi` + `LotCustoms.asalBahan` | Menunggu: asal bahan |
| `hs_code_negara` | `LotCustoms.hsCode`, `negaraAsal` (kosong dan asal bahan domestik: Indonesia) | Menunggu |
| `berat` | berat bersih = qty; `LotCustoms.beratKotor` | Menunggu: berat kotor |
| `kemasan` | `LotCustoms.kemasanJenis`, `kemasanJumlah` | Menunggu |
| `dok_pemasukan` | `LotCustoms.dokPemasukan` | Menunggu |
| `dok_pengeluaran`, `persetujuan_pengeluaran` | `Order.dokPengeluaran`, `persetujuanPengeluaran` (EXIM) | Menunggu |
| `ref_laporan_fiskal` | `Order.refLaporanFiskal`; bawaan: nomor lembar rekonsiliasi `LPK-<pesanan>` | LPK-... |
| `cb_draf`, `cb_verifikasi`, `cb_dokumen`, `cb_ditahan`, `cb_terpenuhi` | `Order.statusPengeluaran` (Compliance Lock) | satu kotak terisi |
| `ttd_penyiap_nama` | Profil pabrik: `person` | Menunggu |
| `ttd_exim_nama/jabatan` | Profil EXIM: `person`, `jabatan` | Menunggu |

## Rekonsiliasi fiskal dan stok (`rekonsiliasi-fiskal-stok.docx`)

| Placeholder | Sumber | Bila kosong |
|---|---|---|
| `nomor_laporan`, `periode`, `nomor_invoice_order`, `kode_lot`, `perusahaan_nama`, `tanggal_rekon` | pesanan, profil pabrik | |
| `pabean_*`, `bm_*`, `ppn_impor_*`, `pph22_*`, `ppnbm_*`, `cukai_*`, `ppn_dom_*` (`dasar`, `tarif`, `nominal`) | `Order.fiskal[...]` (EXIM) | Belum diverifikasi, bukan Rp0 |
| `pabean_dasar` (status belum) | nilai transaksi pesanan, ditandai "usulan, belum diverifikasi"; tarif dan nominal tetap "Belum diverifikasi" | |
| | status "Dikecualikan": dasar hukum dicatat, tarif dan nominal "-" | |
| | status "Tidak berlaku": "Tidak berlaku" | |
| `dasar_fasilitas`, `ref_faktur_pajak`, `kode_billing`, `ntpn` | `Order` (EXIM) | Belum diverifikasi |
| `saldo_awal` | `Lot.stock` (contoh demo) | |
| `masuk`, `penyesuaian` | 0 (tidak ada pemasukan atau koreksi tercatat) | |
| `keluar` | qty bila status >= Dikirim/siap diambil, selain itu 0 | |
| `saldo_akhir` | awal + masuk - keluar +/- penyesuaian | |
| `stok_fisik`, `tgl_opname`, `ref_it_inventory` | `Order.stokFisik`, `tglOpname`, `refItInventory` (pabrik) | Menunggu |
| `selisih` | stok fisik - saldo akhir | Menunggu bila stok fisik belum diisi |
| `rencana_keluar`, `proyeksi_saldo` | qty yang belum keluar, saldo akhir - rencana | |
| `catatan_status` | status pengeluaran dan selisih | |
| `lamp_*` | kelengkapan lampiran dari data di atas | Menunggu |
| `ttd_penyiap_nama` | Profil pabrik | Menunggu |
| `ttd_exim_nama` | Profil EXIM | Menunggu |
| `ttd_setuju_nama` | Profil admin | Menunggu |

## Siapa mengisi apa

| Data | Diisi | Tempat |
|---|---|---|
| NPWP, NIB, nomor izin KB, kantor pabean, rekening, jabatan | Pabrik | Profil |
| NPWP (opsional), NIB, alamat kirim | UMKM | Profil |
| Nama dan jabatan penanda tangan | Pabrik, EXIM, admin | Profil masing-masing |
| HS Code, negara asal, asal bahan, kemasan, berat kotor, dokumen pemasukan | Pabrik, dikonfirmasi EXIM | Detail pesanan masuk, Panel EXIM |
| Stock opname, stok fisik, IT Inventory, resi atau kode pickup | Pabrik | Detail pesanan masuk |
| Klasifikasi, dokumen pengeluaran, persetujuan, status fiskal, kode billing, NTPN | EXIM | Panel EXIM, Periksa pesanan |
| Status "Persyaratan terpenuhi" | **hanya EXIM**, dan hanya bila semua komponen fiskal sudah ditentukan | Panel EXIM |
