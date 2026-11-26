# Arsitektur ClearanceLoop

## Struktur folder

```
app/
  (site)/            Halaman (tipis): ambil data di server, lalu pasang tampilan fitur
  api/               Route Handler: /api/lots, /api/lots/[slug], /api/quote
  features/          Satu folder per fitur: home, katalog, pesanan, pabrik, auth, profil, kontak, alur-kerja
  components/
    ui/              Komponen dasar bersama (ikon, tabel, pil status, panel, hitung-naik)
    mosaic/          Mosaik tile (MosaicCover, MosaicLoop)
    motion/          Motion + Lenis + hook reduced-motion
    layout/          Navbar
  lib/
    domain/          Aturan bisnis murni (tipe, harga, komisi 2%, lelang, filter). Dipakai klien dan server.
    data/            Akses data: lots-repo (antarmuka), seed/, lots.ts (cache), tempat tukar backend
    format.ts        rupiah, num
    firebase.ts      Inisialisasi Firebase klien (lazy)
firestore.rules      Aturan keamanan Firestore (sudah dipasang di proyek kainara-id)
```

## Aliran data

- **Server:** `getLots()` / `getLot(slug)` (`lib/data/lots.ts`) memakai `"use cache"` + `cacheLife("hours")`.
  Halaman katalog, detail, dan checkout mengambil data di sini lalu mengirimnya sebagai props. Bundel
  klien tidak memuat data contoh.
- **Aturan bisnis:** semua hitungan (harga lelang, komisi, validasi jumlah) ada di `lib/domain/pricing.ts`.
  Layar checkout dan `POST /api/quote` memakai fungsi yang sama, jadi angkanya tidak bisa berbeda.
- **API:**
  - `GET /api/lots?model=&category=&unit=&q=` daftar lot, disaring di server
  - `GET /api/lots/{slug}` satu lot
  - `POST /api/quote` `{slug, qty, pickup}` hitung dan validasi pesanan (200, 422 bila ditolak)
- **Sesi dan pesanan** masih di browser (`features/auth/session.ts`, `features/pesanan/orders.ts`).

## Pindah ke Firestore (saat siap)

1. Isi koleksi `lots` dari `lib/data/seed/lots.ts` (satu dokumen per lot, id = slug, tambah `ownerId`).
2. Tulis `firestoreLotsRepo` yang memenuhi `LotsRepo` (`list`, `bySlug`) di `lib/data/lots-repo.ts`.
   Pembacaan `lots` boleh publik menurut `firestore.rules`, jadi tidak perlu service account untuk membaca.
3. Ganti isi `getLotsRepo()` agar mengembalikan repositori itu. Halaman dan API tidak perlu diubah.
4. Untuk pesanan: buat `OrdersRepo` dengan pola yang sama, panggil `quote()` sebelum menyimpan, dan
   kurangi stok dalam satu transaksi Firestore (atomik). Penulisan dari server membutuhkan
   `firebase-admin` dan service account.

## Perintah

- `npm run dev` / `npm run build` / `npm start`
- `firebase deploy --only firestore:rules --project kainara-id` memasang ulang aturan Firestore
