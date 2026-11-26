# Prompt untuk Claude (web): audit kritis dan rencana revisi ClearanceLoop

Salin semua isi di bawah garis ini ke Claude. Kalau Claude-nya punya akses ke repo atau Figma, bilang di awal supaya dia membaca sumber aslinya dulu. Kalau tidak, dia hanya boleh memakai fakta di prompt ini.

---

Kamu bertindak sebagai reviewer produk dan front-end senior yang kritis. Jangan menyetujui apa pun hanya karena sudah dikerjakan. Tugasmu: menilai kondisi website ClearanceLoop saat ini terhadap desain Figma dan kebutuhan lomba, lalu memberi daftar yang harus **ditambah**, **direvisi**, atau **dibuang**, berurutan menurut prioritas. Jangan mengarang isi file, angka pasar, atau aturan bisnis yang tidak ada di prompt ini. Kalau butuh data yang tidak kuberikan, tulis sebagai pertanyaan.

## 1. Konteks

- **Proyek:** ClearanceLoop, marketplace B2B sisa produksi tekstil. Pabrik menjual lot sisa (offcut, gulungan sisa, kain reject) langsung ke UMKM penjahit/pengrajin. Nama brand masih sementara ("nama kerja").
- **Lomba:** SEVENT X SoftDev. **Tenggat 30 November 2026.** Hari ini 26 November 2026, jadi sisa sekitar 4 hari kerja. Semua rekomendasi harus realistis untuk waktu itu.
- **Figma:** file `K0DtPToHYiomi0UCTwyRFJ`, dua halaman:
  - `userflow` (0:1): diagram alur dan aturan bisnis.
  - `mock up` (47:380): desain layar. **Semua frame desktop 1440px. Tidak ada desain mobile atau tablet.**
- **Kode:** Next.js 16.4 App Router (Cache Components aktif), React 19, Tailwind v4, Motion (`motion/react`, LazyMotion + domMax), Lenis untuk smooth scroll. Branch `jarpo`, hanya 2 commit, sekitar 60 file belum di-commit.
- **Ini front-end demo.** Belum ada backend, auth, database, atau pembayaran. Semua data berasal dari file statis.

## 2. Aturan produk yang sudah dikunci (dari tim)

- Komisi **2%** ditanggung **pabrik**, dihitung dari nilai barang (di luar ongkir dan pajak). UMKM tidak kena biaya platform.
- Dua model beli: **Harga Tetap Regional** dan **Lelang Menurun Nasional (Dutch auction), TTL 15 menit**.
- Ambil sendiri (Rp0) atau diantar. Beli sebagian diperbolehkan.
- Dana dilepas lewat PJP **hanya setelah barang diterima dan dikonfirmasi** pembeli.
- MOQ per kategori. **Angka MOQ belum final.**
- Catatan dari userflow: stok lot harus berubah secara atomik (lot 500 kg bisa terpecah ke banyak pesanan); selisih kg dan status kepabeanan disimpan sebagai audit trail; biaya akhir regional adalah *landed cost* (lokasi penerima, bobot, moda kirim), **bukan** harga berbeda menurut kekayaan daerah; status legal ditentukan instansi berwenang, bukan algoritma.
- Pilot awal: Bantul. Wilayah lain "belum dibuka".
- **Larangan:** jangan mengarang angka pasar. Angka demo harus berlabel "contoh demo". Jangan ubah hal di luar permintaan. Konfirmasi dulu sebelum menjadikan usulan di Google Doc sebagai keputusan tim.

## 3. Yang sudah dibangun (anggap benar, tapi nilai kualitasnya)

- **Beranda** (`/`): hero sticky-scroll dengan mosaik tile, pernyataan, slideshow "Dari cari bahan sampai bahan tiba" (autoplay 7 detik, klik untuk pindah), strip bahan, demo UMKM (daerah + slider kg), asal bahan, FAQ, footer CTA setinggi layar.
- `/alur-kerja` (panel UMKM dan Pabrik), `/kontak`, `/masuk` (tab Masuk dan Daftar).
- **`/katalog` dan `/katalog/[slug]`**: dibuat tanpa mengecek frame Katalog dan Detail lot di Figma. Lihat bagian 4.
- Navbar publik: Beranda, Katalog, Alur kerja, Kontak.
- Sistem warna semantik, `ICON_MAP`, reduced-motion, WebP.

## 4. Temuan kritis

### 4.1 Katalog dan Detail lot tidak sesuai Figma

Figma sudah punya frame **Katalog** (109:380) dan **11 — Detail lot** (130:380). Implementasiku memakai rancangan sendiri, jadi ini harus dibangun ulang atau disejajarkan.

**Katalog, ada di Figma tapi belum ada di kode:**
- Header aplikasi setelah login: avatar "SJ · Sari Jahit · UMKM", tab **Katalog / Lelang nasional / Pesanan saya**.
- Banner mosaik foto di kanan judul. Deskripsi: "Lot sisa produksi dari pabrik terdaftar di sekitarmu. Harga tetap per kg atau per pcs, beli sebagian sesuai kebutuhan, ambil sendiri atau diantar."
- Tab **Regional (48) / Nasional (120)** dengan hitungan, kolom cari bentuk pil ("Cari kain, baju, celana, atau kota").
- Chip lokasi "Bantul, DI Yogyakarta", tombol **Filter**, toggle tampilan **Kotak / Daftar** (tampilan Daftar belum ada rancangannya).
- Chip kategori **Semua kategori / Baju / Celana / Kain**. Versiku memakai jenis bahan, itu salah arah.
- Kartu lot: harga + satuan (**/pcs atau /kg**), nama, "Regional · Kain · MOQ 5 kg", "Pabrik di …" dengan ikon pin, **bar stok** ("Stok 800 kg dari 1.000 kg"), tombol bulat "+". Kartu terpilih punya outline brand.
- Catatan kaki: "Data demo untuk mock up. Harga, stok dan lokasi akan diganti data lot nyata."

**Detail lot, ada di Figma tapi belum ada di kode:**
- Breadcrumb "Katalog / Kain / Offcut denim polos" dan tautan "Kembali ke katalog".
- Galeri: foto utama + 5 thumbnail berlabel (Keseluruhan, Tekstur, Ukuran potongan, Timbangan, Identitas lot) + slot video 10–20 detik. Thumbnail kosong berlabel "Belum ada". Keterangan: "Foto & video lot. Aset ilustratif, bukti asli menyusul."
- Panel beli: label "REGIONAL / KAIN", judul, "Pabrik di Kota Yogyakarta · Lot DM-024", harga, "Harga tetap regional", **bar stok 800 / 1.000 kg**, "Min. 5 kg · Pembelian sesuai batas usaha", stepper jumlah (− 25 kg +), subtotal, "Pengiriman atau pickup dipilih saat checkout", tombol **Lanjut checkout**, "Khusus UMKM terverifikasi · Ongkir belum termasuk".
- **01 Spesifikasi material:** jenis, komposisi (deklarasi pabrik), ukuran potongan (sampel), warna, kondisi (estimasi), campuran, kontaminasi, identitas lot.
- **02 Catatan kondisi:** teks, "Catatan dari pabrik", "Dokumentasi lot".
- **03 Rating & ulasan pembeli:** skor 4,6, distribusi bintang 5 sampai 1, "Ulasan hanya dapat ditulis setelah transaksi selesai", tombol "Tulis ulasan", filter bintang, dua ulasan contoh berlabel "Contoh pembelian", "Lihat semua ulasan".
- Catatan kaki: "Data, harga, foto dan ulasan pada desain ini merupakan ilustrasi demo; bukan transaksi atau bukti mutu aktual."

**Yang aku buat sendiri dan tidak ada di Figma (nilai: pertahankan, ubah, atau buang):**
- Lot lelang dengan harga turun tiap 15 detik, jam yang berulang, harga awal dan **batas bawah yang ditampilkan**, garis ochre penurun harga. Aturan "turun tiap 15 detik" dan "batas bawah terlihat pembeli" adalah **asumsiku, bukan keputusan tim**.
- Pilihan "Ambil sendiri / Minta dikirim" di panel beli (Figma menaruhnya di checkout).
- "Biaya platform untukmu Rp0" dan alur "Setelah kamu beli" di detail.
- Data 10 lot rekaan (denim, katun, poliester, perca, kain reject) dan daerah asal rekaan (Sleman, Kulon Progo, Gunungkidul, Kota Yogyakarta).

### 4.2 Konflik di dalam Figma sendiri (jangan dipilihkan diam-diam, minta keputusan)

1. **Cakupan produk: kain saja atau juga pakaian?** Strip bahan di beranda sengaja membuang "pakaian reject" (fokus perca dan sisa gulungan non-branded). Tapi katalog Figma menjual "Reject kaos polos non-branded" dan "Reject celana chino" **per pcs**, dengan kategori Baju dan Celana. Salah satunya harus mengalah, dan beranda, FAQ, serta katalog harus konsisten.
2. **Definisi "regional":** kabupaten/kota (keputusan tim, pilot Bantul) atau provinsi? Demo di beranda Figma memakai **provinsi** (Jawa Barat/Tengah/Timur, "Ketik provinsi"). Kode memakai kabupaten/kota (Bantul, Sleman, …). Katalog Figma menampilkan chip "Bantul, DI Yogyakarta" tetapi daftar Regional berisi pabrik di Sleman dan Kota Yogyakarta. Jadi regional itu satu kabupaten atau satu provinsi?
3. **Angka MOQ:** aturan tim bilang angka MOQ belum final dan tidak boleh ditampilkan. Katalog dan detail Figma menampilkan "MOQ 12 pcs", "MOQ 10 kg", "Min. 5 kg". Boleh ditampilkan sebagai contoh demo berlabel, atau tidak?
4. **Dua bahasa visual.** Beranda dan halaman publik: sudut tajam (2px), mosaik, tanpa kartu. Katalog dan detail Figma: kartu putih membulat, pil, ikon Lucide, header akun. Ini dua gaya berbeda. Apakah memang sengaja dipisah antara situs pemasaran dan aplikasi? Kalau ya, perlu route group dan layout terpisah.
5. **Siapa boleh melihat katalog?** Figma menaruhnya di dalam akun UMKM ("Khusus UMKM terverifikasi"). Aku menaruhnya publik dan menambah "Katalog" di navbar publik, atas permintaan "buat navbar punya bagian katalog". Perlu diputuskan: katalog publik (dengan harga?) atau di balik login.
6. **"Batas usaha"** ("Pembelian sesuai batas usaha"): aturan baru yang belum dijelaskan. Batas per UMKM berdasarkan apa?
7. **Nama brand** masih "nama kerja". Footer dan metadata menyebutnya begitu.

### 4.3 Halaman dan alur yang belum ada sama sekali

- **Lelang nasional** dan **Pesanan saya**: hanya tab di Figma, tanpa frame. Butuh keputusan: dibuat sederhana atau ditunda.
- **Checkout** (pilih pickup/delivery, total, bayar, status dana ditahan PJP) dan alur penutup: kirim, terima, konfirmasi, pelepasan dana, ulasan.
- Sisi **Pabrik**: unggah/publikasi lot, kepatuhan dan kepabeanan, neraca material, material passport, payout. Ada di userflow (lajur PABRIK) tapi tidak ada layar di mock up.
- Sisi **Admin/Kami**: verifikasi UMKM (KYC), review kepatuhan, ledger komisi. Sama: ada di userflow, tidak ada layar.
- Slot **video** di beranda (catatan "video slot" di Figma).
- Halaman 404 dan error yang bermerek, halaman kebijakan privasi dan syarat. Sekarang tidak ada.

### 4.4 Kelemahan di implementasiku (kritik untuk diriku sendiri)

- **Semua layout mobile dan tablet adalah tebakanku.** Figma hanya 1440px. Belum ada tinjauan desainer. Anggap tidak tervalidasi.
- **Semua data palsu dan statis.** Form Kontak, Masuk, daftar tunggu, tombol Google, "Beli lot ini": hanya menampilkan pesan demo. Tidak ada auth atau state akun. Navbar selalu versi publik.
- **Foto adalah ilustrasi AI** yang dipakai ulang dan dipotong berbeda untuk lot berbeda. Kartu yang terlihat mirip itu bukan kebetulan. Perlu foto nyata atau minimal jujur di semua tempat.
- **Kontak masih placeholder** (`halo@clearanceloop.id`, `+62 8xx-xxxx-xxxx`).
- **Halaman lot yang tidak ada** mengembalikan HTTP 200 dengan UI "tidak ditemukan" (batasan Cache Components, `dynamicParams` tidak tersedia). Perlu diketahui, bukan kritis.
- **Aksesibilitas belum diaudit** dengan axe atau pembaca layar. Hal yang kuragukan: `<output>` slider berperan live-region dan mengumumkan tiap geseran; `role="timer"` pada hitung mundur; warna `text-faint`; target sentuh pil filter; fokus keyboard di slideshow dan mosaik.
- **Performa produksi belum diukur ulang.** Terakhir di dev: TBT saat load sekitar 280–390 ms (desktop), JS sekitar 239 kB. Belum ada Lighthouse produksi untuk `/katalog` dan detail.
- **Halaman beranda sangat panjang** (hero 140svh per cerita, total sekitar 13.000px). Itu permintaan pemilik, tapi perlu dinilai: apakah juri akan sabar scroll?
- **Sisa bawaan template:** `public/*.svg` bawaan Create Next App, `favicon.ico` bawaan, tidak ada OG image, sitemap, robots. `next.config.ts` masih memakai opsi eksperimental `agentFeedback`. `AGENTS.md` ikut berubah otomatis.
- **Tidak ada tes otomatis.**
- **Kebersihan git:** belasan PNG dihapus dan WebP baru belum di-commit; 2 commit saja ("sholat maghrib" dan template).
- **Klaim di teks yang perlu diverifikasi tim:** FAQ menyebut verifikasi UMKM "empat tahap" (identitas, bukti usaha, kebutuhan material, pengecekan admin). Pastikan itu sama dengan KYC di userflow. Soal "asal bahan" (impor, pabrik berikat, kepabeanan), pastikan tidak ada klaim legal yang melampaui catatan compliance di Figma.

## 5. Yang kuminta darimu

Kerjakan **berurutan**, dan berhenti di langkah 2 kalau jawabanku belum ada.

1. **Kritik dulu.** Tinjau semua temuan di atas. Tambahkan yang kulewatkan, bantah yang menurutmu salah, dan tandai mana yang benar-benar menentukan nilai di lomba SoftDev versus yang hanya kosmetik. Jangan memuji.
2. **Pertanyaan keputusan.** Dari bagian 4.2 dan 4.3, pilih paling banyak 8 pertanyaan yang jawabannya mengubah rencana. Untuk tiap pertanyaan beri **rekomendasimu** dan alasan, supaya aku cukup menjawab "setuju" atau mengoreksi. Jangan tanya hal yang bisa kamu putuskan sendiri dengan default yang wajar.
3. **Rencana kerja 4 hari**, dibagi:
   - **P0 (harus selesai, tanpa ini demo gagal):** biasanya kesesuaian Katalog dan Detail dengan Figma, konsistensi isi, tidak ada klaim palsu, tidak ada error.
   - **P1 (sangat disarankan):** Lelang nasional, Pesanan saya, checkout demo, header akun demo.
   - **P2 (kalau waktu ada):** sisi pabrik dan admin, tes, SEO, audit a11y lengkap.
   
   Untuk tiap item tulis: apa, kenapa penting untuk juri, file atau layar yang terkena, dan **kriteria selesai yang bisa dicek** (misalnya "Kartu katalog menampilkan bar stok dan satuan pcs/kg persis seperti Figma 109:453").
4. **Hal yang sebaiknya dibuang atau ditunda.** Sebutkan terang-terangan fitur yang tidak sepadan dengan waktunya.
5. **Bahasa:** Bahasa Indonesia, kalimat pendek, langsung ke inti. Tabel boleh untuk perbandingan Figma vs kode. Jangan mengulang isi prompt ini.

## 6. Batasan saat kamu mengerjakan

- Jangan mengubah Figma kecuali aku minta, dan kalau diminta, hanya lewat `use_figma`.
- Jangan menambah angka pasar. Setiap angka contoh harus berlabel demo, termasuk harga, stok, rating, dan ulasan.
- Jangan menyimpulkan keputusan tim dari Google Doc tanpa konfirmasiku.
- Kalau kamu tidak yakin, tanya. Jangan menebak lalu menyajikannya sebagai fakta.
