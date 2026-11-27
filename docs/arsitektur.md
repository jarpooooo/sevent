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
    (akun)/     Profil
    (admin)/    Panel admin (verifikasi akun, konfirmasi kurir)
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
- **Admin**: hanya akun demo ("Masuk sebagai admin (demo)" di halaman Masuk). Memverifikasi akun dan meneruskan konfirmasi kurir.

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

## Belum ada

Backend pesanan dan stok atomik, webhook PJP sungguhan, Compliance Lock dan tiga dokumen (invoice, laporan kepabeanan, rekonsiliasi stok),
kelas pembeli (Fair Access), alur sengketa dan refund, Demand Pool, simulasi hasil bersih untuk pabrik.

## Perintah

- `npm run dev` / `npm run build`
- `firebase deploy --only hosting --project kainara-id`
- `firebase deploy --only firestore:rules --project kainara-id`
