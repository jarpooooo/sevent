# Arsitektur Kainara

Kainara (sebelumnya nama kerja ClearanceLoop) adalah marketplace B2B sisa produksi tekstil: pabrik menjual lot ke UMKM penjahit.
Ini front-end demo: Next.js static export (`output: "export"`), Firebase Hosting, Firebase Auth (Google) dan Firestore hanya untuk peran akun.
Belum ada backend untuk pesanan, pembayaran, atau stok. Semua pesanan, profil, dan stok tersimpan di `localStorage` browser.

## Struktur folder

```
app/
  (site)/
    (publik)/   Beranda, Alur kerja, Kontak
    (umkm)/     Katalog, Detail lot, Checkout, Pesanan saya (bayar, berhasil, detail)
    (pabrik)/   Lot saya, Tambah lot, Pesanan masuk, Tagihan komisi
    (akun)/     Profil, Pratinjau dokumen (/dokumen)
    (admin)/    Panel admin (verifikasi akun, konfirmasi kurir, dokumen)
    (exim)/     Panel EXIM (Compliance Lock, klasifikasi, dokumen pengeluaran, fiskal)
    masuk/      Masuk dan daftar
  features/     Satu folder per area: publik, umkm, pabrik, admin, akun, auth
  components/   ui, mosaic, motion, layout (Navbar), brand
  lib/
    domain/     Aturan bisnis murni (tipe, harga, komisi 2%, lelang, filter)
    data/       lots-repo (antarmuka), seed/, cache
    format.ts   rupiah, num
    firebase.ts Inisialisasi Firebase klien (lazy)
firestore.rules  Aturan Firestore (proyek kainara-id)
```

Route group `(publik)`, `(umkm)`, `(pabrik)`, `(admin)`, `(akun)` tidak muncul di URL. Pembatas akses ada di `features/auth/RoleGuard.tsx`
(untuk demo, bukan keamanan sungguhan).

## Peran

- **UMKM** dan **Pabrik**: bisa masuk dengan Google (peran disimpan di Firestore `users/{uid}`) atau akun demo.
- **Admin** dan **EXIM**: hanya akun demo (tautan di halaman Masuk). Admin memverifikasi akun dan meneruskan konfirmasi kurir. EXIM memeriksa
  persyaratan pengeluaran barang; hanya EXIM yang bisa menetapkan "Persyaratan terpenuhi".

## Alur pesanan (6 status)

Pesanan dibuat, Pembayaran berhasil, Barang dipersiapkan, Dikirim atau siap diambil, Barang diterima, Transaksi selesai.

- **Pembayaran:** virtual account lewat PJP. Di produksi, PJP mengirim webhook ke server (tanda tangan diperiksa, lalu Get Status API sebagai
  pemeriksaan kedua) dan dana ditahan sampai barang diterima. Di demo, tombol "Simulasikan notifikasi PJP" di `/pesanan-saya/bayar` meniru webhook.
  Webhook butuh server (mis. Cloud Functions); static export tidak bisa menerimanya.
- **Konfirmasi barang diterima:** ambil sendiri, dikonfirmasi UMKM. Diantar (JNE atau J&T), dikonfirmasi kurir dan diteruskan ke Panel admin.
- **Stok:** stok tersedia = stok lot dikurangi jumlah pesanan (`useAvailable` di `features/umkm/pesanan/orders.ts`). Stok fisik tidak berkurang
  sampai barang keluar.
- **Komisi 2%** dihitung dari nilai barang dan ditanggung pabrik. UMKM tidak kena biaya platform.
- **Lelang terbalik:** 72 jam, 11 langkah, reservasi 20 menit (`lib/domain/pricing.ts`).

## Verifikasi akun

UMKM: identitas, bukti usaha (NIB opsional; boleh foto tempat produksi atau katalog), kebutuhan material, pemeriksaan admin.
Pabrik: identitas, bukti usaha, pemeriksaan admin. Admin menyetujui atau meminta revisi dengan catatan.

## Compliance Lock dan dokumen

- Barang tidak boleh dikirim atau diambil hanya karena UMKM sudah membayar. Pabrik mengisi stock opname dan data kepabeanan lot, lalu "Tandai
  disiapkan" mengirim pesanan ke EXIM (`statusPengeluaran`: draf, verifikasi, dokumen, ditahan, terpenuhi). Tombol kirim pabrik baru aktif setelah
  EXIM menyatakan terpenuhi dan resi atau kode pickup terisi.
- Tiga dokumen .docx (invoice, laporan kepabeanan, rekonsiliasi) dihasilkan dari satu sumber data: `app/lib/documents/` (specs, context, render),
  template di `public/templates/`, peta placeholder di `docs/PLACEHOLDER.md`. Data kosong tertulis "Menunggu" atau "Belum diverifikasi", tidak pernah angka karangan.
- **Pratinjau dan unduhan** (`/dokumen?id=&jenis=`): template .docx diisi lalu ditampilkan sebagai halaman (docx-preview). Unduh DOCX langsung dari berkas yang
  diisi; Unduh PDF dibuat di browser (html2canvas-pro + jsPDF) dari halaman pratinjau, berupa gambar per halaman. Tombol "Pratinjau" ada di kartu Dokumen
  tiap konteks: detail pesanan UMKM (invoice), detail pesanan pabrik, Periksa pesanan EXIM, dan panel admin.
- Profil menyimpan data dokumen: NPWP, nomor izin KB, kantor pabean, rekening pencairan, jabatan, alamat kirim, detail usaha (`features/akun/profil.ts`).

## Belum ada

Backend pesanan dan stok atomik, webhook PJP sungguhan, form data kepabeanan di halaman Tambah lot (sekarang diisi dari detail pesanan),
kelas pembeli (Fair Access), alur sengketa dan refund, Demand Pool, simulasi hasil bersih untuk pabrik.

## Perintah

- `npm run dev` / `npm run build`
- `firebase deploy --only hosting --project kainara-id`
- `firebase deploy --only firestore:rules --project kainara-id`
