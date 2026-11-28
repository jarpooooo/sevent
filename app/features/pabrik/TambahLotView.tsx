"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "../../components/ui/icons";
import { inputBox, panel } from "../../components/ui/styles";
import { LOT_TYPES, type LotCustoms, type LotType } from "../../lib/domain/types";
import { num, rupiah } from "../../lib/format";
import { customsComplete, EMPTY_CUSTOMS, saveLotCustoms } from "./lotdoc";
import FotoSlot from "./FotoSlot";
import KanalJual, { KANAL_AWAL, type Kanal, kanalErrors, kanalHarga, kanalLabel } from "./KanalJual";
import { addLot } from "./lots-store";

const EASE = [0.16, 1, 0.3, 1] as const;

const TYPE_HELP: Record<LotType, string> = {
  Homogen: "Homogen: satu bahan, satu warna. Foto bukti tiap tipe dinilai terpisah.",
  "Semi-campuran": "Semi-campuran: satu bahan, beberapa warna atau motif. Foto bukti tiap tipe dinilai terpisah.",
  "Campuran penuh": "Campuran penuh: beberapa bahan dan warna dalam satu lot. Foto bukti tiap tipe dinilai terpisah.",
};

const CHECKS = [
  "Foto seluruh lot jelas",
  "Tekstur dan ukuran terlihat",
  "Ada benda pembanding ukuran",
  "Kode lot terbaca di foto",
] as const;

const FOTO = [
  { label: "Foto seluruh lot", hint: "Tampak keseluruhan tumpukan." },
  { label: "Tekstur dan ukuran", hint: "Dekat, dengan ukuran potongan terlihat." },
  { label: "Foto skala", hint: "Dengan benda pembanding ukuran." },
  { label: "Foto kode lot", hint: "Label atau kode batch terbaca." },
] as const;

const MAX_MB = 8;

/** Kategori mengikuti nama bahan: Perca, Sisa gulungan, atau Cutting offcuts. */
function categoryOf(bahan: string) {
  const b = bahan.trim().toLowerCase();
  if (b.startsWith("perca")) return "Perca";
  if (b.startsWith("sisa gulungan")) return "Sisa gulungan";
  return "Cutting offcuts";
}

const digits = (s: string) => Number(s.replace(/\D/g, "")) || 0;

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[12px] font-medium text-text-muted">{label}</span>
      {children}
    </div>
  );
}

const panelIn = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

/** Tombol pilih atau ganti thumbnail (kotaknya sudah ada di pratinjau). */
function ThumbButton({ url, onFile }: { url: string | null; onFile: (f: File | undefined) => void }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[2px] border border-brand px-3 text-[13px] font-medium text-brand transition-colors hover:bg-brand-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand"
    >
      <ImagePlus aria-hidden="true" className="size-3.5" strokeWidth={1.9} />
      {url ? "Ganti thumbnail" : "Pilih thumbnail"}
      <input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </label>
  );
}

export default function TambahLotView() {
  const id = useId();
  const router = useRouter();

  const [tipe, setTipe] = useState<LotType>("Homogen");
  const [kode, setKode] = useState("KN-BTG-0412 (contoh demo)");
  const [bahan, setBahan] = useState("Perca katun polos");
  const [berat, setBerat] = useState("300 kg");
  const [moq, setMoq] = useState("5 kg");
  const [lokasi, setLokasi] = useState("Kab. Bantul, DI Yogyakarta");
  const [kanal, setKanal] = useState<Kanal>(KANAL_AWAL);
  const [kanalTried, setKanalTried] = useState(false);
  // Foto bukti (4 slot) dan thumbnail pratinjau. Kosong dulu: kotak placeholder, lalu tombol pilih foto.
  const [fotos, setFotos] = useState<(string | null)[]>([null, null, null, null]);
  const [thumb, setThumb] = useState<string | null>(null);
  const [fotoErr, setFotoErr] = useState("");
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);
  const [checks, setChecks] = useState<boolean[]>([false, false, false, false]);
  const [sent, setSent] = useState(false);
  // Data kepabeanan lot (opsional di sini; bisa dilengkapi lagi dari detail pesanan). Tidak ada isian bawaan.
  const [kb, setKb] = useState<LotCustoms>(EMPTY_CUSTOMS);
  const setK = <K extends keyof LotCustoms>(k: K, v: LotCustoms[K]) => setKb((p) => ({ ...p, [k]: v }));
  const setKDok = (k: "jenis" | "nomor" | "tanggal", v: string) => setKb((p) => ({ ...p, dokPemasukan: { ...p.dokPemasukan, [k]: v } }));

  const kg = digits(berat) || 25;

  const category = useMemo(() => categoryOf(bahan), [bahan]);
  const codeShort = kode.replace(/\s*\(contoh demo\)\s*$/i, "");
  const moqKg = digits(moq) || 5;

  const toggleCheck = (i: number) => setChecks((c) => c.map((v, k) => (k === i ? !v : v)));

  /** Terima satu berkas gambar: cek tipe dan ukuran, lalu pakai sebagai alamat sementara di browser. */
  const toUrl = (file: File | undefined): string | null => {
    if (!file) return null;
    if (!file.type.startsWith("image/")) {
      setFotoErr("Berkas harus gambar (JPG, PNG, atau WebP).");
      return null;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setFotoErr(`Ukuran foto maksimal ${MAX_MB} MB.`);
      return null;
    }
    setFotoErr("");
    const u = URL.createObjectURL(file);
    urls.current.push(u);
    return u;
  };
  const setFoto = (i: number, file: File | undefined) => {
    const u = toUrl(file);
    if (!u) return;
    setFotos((f) => f.map((v, k) => (k === i ? u : v)));
    setChecks((c) => c.map((v, k) => (k === i ? true : v))); // slot terisi = butir checklist yang sesuai tercentang
  };
  const clearFoto = (i: number) => {
    setFotos((f) => f.map((v, k) => (k === i ? null : v)));
    setChecks((c) => c.map((v, k) => (k === i ? false : v)));
  };
  // Thumbnail: pilihan sendiri, atau foto seluruh lot bila belum memilih, atau placeholder.
  const thumbUrl = thumb ?? fotos[0];

  const submit = () => {
    setKanalTried(true);
    if (Object.keys(kanalErrors(kanal)).length) {
      document.getElementById(`${id}-kanal`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    if (!fotos[0]) {
      setFotoErr("Tambahkan minimal foto seluruh lot sebelum dikirim.");
      document.getElementById(`${id}-bukti`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    const created = addLot({
      name: bahan.trim() || "Lot baru",
      code: codeShort,
      channel: kanalLabel(kanal),
      price: kanalHarga(kanal),
      stock: kg,
      capacity: kg,
    });
    saveLotCustoms(created.id, kb);
    setSent(true);
    window.setTimeout(() => router.push("/lot-saya"), 1400);
  };

  return (
    <section aria-label="Tambah lot" className="pt-[72px] leading-[1.23]">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-9 sm:px-10 lg:px-16">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex flex-col gap-2.5">
            <h1 className="font-display text-[clamp(34px,4vw,44px)] leading-[1.09] tracking-[-0.03em]">Tambah lot</h1>
            <p className="max-w-[700px] text-[15px] text-text-muted">
              Isi data lot dan unggah bukti lapangan. Halaman lot tampil di Katalog setelah Kami memeriksa.
            </p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={submit}
            disabled={sent}
            className="h-[45px] shrink-0 rounded-[2px] bg-brand px-[22px] text-[14px] font-medium text-surface transition-colors hover:bg-brand-hover disabled:opacity-70"
          >
            {sent ? "Terkirim, dibuka di Lot saya" : "Kirim untuk diperiksa"}
          </motion.button>
        </motion.header>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
          className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,800px)_minmax(0,480px)]"
        >
          <div className="flex flex-col gap-6">
            {/* Data lot */}
            <motion.section variants={panelIn} aria-label="Data lot" className={`${panel} flex flex-col gap-5 p-[25px]`}>
              <h2 className="text-[18px] font-medium">Data lot</h2>
              <div>
                <span className="block text-[12px] font-medium text-text-muted">Tipe lot</span>
                <div role="radiogroup" aria-label="Tipe lot" className="mt-2 flex flex-wrap gap-2">
                  {LOT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={tipe === t}
                      onClick={() => setTipe(t)}
                      className={`h-9 rounded-[2px] px-4 text-[13px] font-medium transition-colors duration-300 ${
                        tipe === t ? "bg-brand text-surface" : "bg-brand-soft text-brand hover:bg-brand-soft/70"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[13px] text-text-muted">{TYPE_HELP[tipe]}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kode batch">
                  <input className={inputBox} value={kode} onChange={(e) => setKode(e.target.value)} aria-label="Kode batch" />
                </Field>
                <Field label="Bahan">
                  <input className={inputBox} value={bahan} onChange={(e) => setBahan(e.target.value)} aria-label="Bahan" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Berat total">
                  <input className={inputBox} value={berat} onChange={(e) => setBerat(e.target.value)} aria-label="Berat total" inputMode="numeric" />
                </Field>
                <Field label="MOQ per pembelian">
                  <input className={inputBox} value={moq} onChange={(e) => setMoq(e.target.value)} aria-label="MOQ per pembelian" inputMode="numeric" />
                </Field>
                <Field label="Lokasi pabrik">
                  <input className={inputBox} value={lokasi} onChange={(e) => setLokasi(e.target.value)} aria-label="Lokasi pabrik" />
                </Field>
              </div>
            </motion.section>

            {/* Bukti lapangan */}
            <motion.section variants={panelIn} aria-label="Bukti lapangan" className={`${panel} flex flex-col gap-5 p-[25px]`}>
              <h2 className="text-[18px] font-medium">Bukti lapangan</h2>
              <p className="text-[13px] text-text-muted">
                Foto ini tampil di halaman lot. UMKM melihat kondisi bahan sebelum membeli.
              </p>

              <ul id={`${id}-bukti`} className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                {FOTO.map((f, i) => (
                  <li key={f.label} className="min-w-0">
                    <FotoSlot label={f.label} hint={f.hint} url={fotos[i]} onFile={(file) => setFoto(i, file)} onClear={() => clearFoto(i)} />
                  </li>
                ))}
              </ul>
              <p role="alert" className="min-h-4 text-[13px] leading-4 text-text-soft">
                {fotoErr}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[2px] border border-line bg-card px-[15px] py-3">
                <span className="text-[13px] font-medium">Video 10 sampai 20 detik (opsional)</span>
                <span className="text-[13px] text-text-muted">Tunjukkan tumpukan dari dekat. Tidak wajib.</span>
              </div>

              <fieldset>
                <legend className="block text-[12px] font-medium leading-[15px] text-text-muted">Checklist sebelum kirim</legend>
                <ul className="mt-2.5 flex flex-col gap-2.5">
                  {CHECKS.map((c, i) => (
                    <li key={c}>
                      <label className="flex w-fit cursor-pointer items-center gap-[10px] text-[14px] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand">
                        <input type="checkbox" checked={checks[i]} onChange={() => toggleCheck(i)} className="sr-only" />
                        <span
                          aria-hidden="true"
                          className={`flex size-[18px] items-center justify-center rounded-[2px] border transition-colors ${
                            checks[i] ? "border-brand bg-brand text-on-dark" : "border-line bg-card"
                          }`}
                        >
                          {checks[i] && (
                            <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2.5 6.2 5 8.6 9.5 3.6" />
                            </svg>
                          )}
                        </span>
                        <span className={checks[i] ? "" : "text-text-muted"}>{c}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            </motion.section>

            {/* Kanal jual */}
            <motion.div variants={panelIn} id={`${id}-kanal`}>
              <KanalJual k={kanal} onChange={setKanal} errors={kanalTried ? kanalErrors(kanal) : {}} />
            </motion.div>

            {/* Data kepabeanan */}
            <motion.section variants={panelIn} aria-label="Data kepabeanan lot" className={`${panel} flex flex-col gap-5 p-[25px]`}>
              <h2 className="text-[18px] font-medium">Data kepabeanan lot</h2>
              <p className="text-[13px] text-text-muted">
                Dipakai di laporan pendukung kepabeanan. Boleh dikosongkan dulu; EXIM mengonfirmasi, dan HS Code atau negara asal tidak pernah terisi otomatis.
              </p>
              <div>
                <span className="block text-[12px] font-medium text-text-muted">Data minimal untuk dokumen</span>
                <ul aria-label="Kelengkapan data minimal" className="mt-2 flex gap-1.5">
                  {[
                    ["HS Code", !!kb.hsCode.trim()],
                    ["Negara asal", !!kb.negaraAsal.trim()],
                    ["Asal bahan", !!kb.asalBahan],
                  ].map(([t, ok], i) => (
                    <motion.li
                      key={t as string}
                      className="flex flex-col gap-1.5"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, ease: EASE, delay: 0.5 + i * 0.05 }}
                    >
                      <span aria-hidden="true" className={`block h-7 w-[76px] rounded-[2px] transition-colors duration-300 ${ok ? "bg-brand" : "bg-brand-soft"}`} />
                      <span className="text-[11px] text-text-muted">
                        {t as string}
                        <span className="sr-only">{ok ? ", terisi" : ", belum terisi"}</span>
                      </span>
                    </motion.li>
                  ))}
                </ul>
                <p className="mt-2 text-[13px] text-text-muted">
                  {customsComplete(kb) ? "Data minimal lengkap." : "Tiga ubin hijau berarti HS Code, negara asal, dan asal bahan sudah diisi."}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="HS Code">
                  <input className={inputBox} value={kb.hsCode} onChange={(e) => setK("hsCode", e.target.value)} aria-label="HS Code" inputMode="numeric" />
                </Field>
                <Field label="Negara asal">
                  <input className={inputBox} value={kb.negaraAsal} onChange={(e) => setK("negaraAsal", e.target.value)} aria-label="Negara asal" />
                </Field>
                <Field label="Asal bahan">
                  <select className={inputBox} value={kb.asalBahan} onChange={(e) => setK("asalBahan", e.target.value as LotCustoms["asalBahan"])} aria-label="Asal bahan">
                    <option value="">Pilih</option>
                    <option value="domestik">Domestik</option>
                    <option value="impor">Impor</option>
                  </select>
                </Field>
                <Field label="Jenis kemasan">
                  <input className={inputBox} value={kb.kemasanJenis} onChange={(e) => setK("kemasanJenis", e.target.value)} aria-label="Jenis kemasan" placeholder="Contoh: karung" />
                </Field>
                <Field label="Jumlah kemasan">
                  <input className={inputBox} value={kb.kemasanJumlah} onChange={(e) => setK("kemasanJumlah", e.target.value.replace(/\D/g, ""))} aria-label="Jumlah kemasan" inputMode="numeric" />
                </Field>
                <Field label="Berat kotor (kg)">
                  <input className={inputBox} value={kb.beratKotor} onChange={(e) => setK("beratKotor", e.target.value)} aria-label="Berat kotor" inputMode="decimal" />
                </Field>
                <Field label="Dokumen pemasukan, jenis">
                  <input className={inputBox} value={kb.dokPemasukan.jenis} onChange={(e) => setKDok("jenis", e.target.value)} aria-label="Jenis dokumen pemasukan" />
                </Field>
                <Field label="Nomor">
                  <input className={inputBox} value={kb.dokPemasukan.nomor} onChange={(e) => setKDok("nomor", e.target.value)} aria-label="Nomor dokumen pemasukan" />
                </Field>
                <Field label="Tanggal">
                  <input type="date" className={inputBox} value={kb.dokPemasukan.tanggal} onChange={(e) => setKDok("tanggal", e.target.value)} aria-label="Tanggal dokumen pemasukan" />
                </Field>
              </div>
            </motion.section>
          </div>

          {/* Pratinjau */}
          <motion.aside variants={panelIn} aria-label="Pratinjau halaman lot" className={`${panel} flex flex-col p-[25px] lg:sticky lg:top-[96px]`}>
            <h2 className="text-[18px] font-medium">Pratinjau halaman lot</h2>
            <p className="mt-4 text-[13px] text-text-muted">Begini lot tampil di Katalog setelah diperiksa.</p>

            <div className={`relative mt-4 h-[250px] overflow-hidden rounded-[2px] ${thumbUrl ? "bg-inverse" : "border border-dashed border-border-strong bg-brand-soft/50"}`}>
              {thumbUrl ? (
                <Image unoptimized src={thumbUrl} alt="Thumbnail lot di Katalog" fill sizes="430px" className="object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <ImagePlus aria-hidden="true" className="size-9" strokeWidth={1.4} />
                    <p className="text-[13px]">Thumbnail belum ada</p>
                  </div>
                </div>
              )}
              <span className="absolute left-0 top-0 flex h-7 w-[150px] items-center bg-panel px-3 text-[12px] font-medium">Belum tayang</span>
              <motion.span
                aria-hidden="true"
                initial={{ y: -54 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
                className="absolute bottom-0 left-0 h-[54px] w-[76px] bg-panel"
              />
              <motion.span
                aria-hidden="true"
                initial={{ y: -54 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.62 }}
                className="absolute bottom-0 left-[152px] h-[54px] w-[76px] bg-panel"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ThumbButton
                url={thumb}
                onFile={(f) => {
                  const u = toUrl(f);
                  if (u) setThumb(u);
                }}
              />
              {thumb && (
                <button type="button" onClick={() => setThumb(null)} className="h-9 rounded-[2px] px-2.5 text-[13px] font-medium text-text-muted transition-colors hover:text-text">
                  {fotos[0] ? "Pakai foto seluruh lot" : "Hapus thumbnail"}
                </button>
              )}
            </div>
            <p className="mt-1.5 text-[12px] leading-[15px] text-text-muted">
              {thumb ? "Thumbnail pilihanmu." : fotos[0] ? "Memakai foto seluruh lot. Pilih foto lain bila mau menggantinya." : "Isi foto seluruh lot atau pilih thumbnail sendiri."}
            </p>

            <p className="mt-4 text-[12px] text-text-muted">
              Lot {codeShort}, Pabrik Contoh, {lokasi.split(",")[0]}
            </p>
            <p className="font-display mt-4 text-[26px] leading-[28px] tracking-[-0.02em]">{bahan || "Nama bahan"}</p>
            <p className="mt-4 text-[13px] text-text-muted">
              {kanal.jenis === "tetap" ? "Regional" : "Lelang terbalik"}, {category}, MOQ {num(moqKg)} kg
            </p>
            <p className="mt-4 flex items-end gap-1.5">
              {kanal.jenis === "lelang" && <span className="pb-0.5 text-[14px] text-text-muted">Dari</span>}
              <span className="font-display text-[32px] leading-[35px] tabular-nums tracking-[-0.02em] text-brand">
                {digits(kanal.jenis === "tetap" ? kanal.harga : kanal.awal) ? rupiah(digits(kanal.jenis === "tetap" ? kanal.harga : kanal.awal)) : "Rp0"}
              </span>
              <span className="pb-0.5 text-[14px] text-text-muted">/ kg</span>
            </p>
            <p className="mt-4 rounded-[2px] bg-brand-soft px-3 py-[8px] text-[12px] font-medium leading-[15px] text-brand">
              {kanal.jenis === "tetap" ? "Pembelian kecil 5 sampai 25 kg dilayani lebih dulu" : "Harga turun tiap 6 jam selama 72 jam. Batas bawah tidak terlihat."}
            </p>

            <div className="mt-4">
              <span className="block text-[12px] font-medium text-text-muted">Status halaman</span>
              <ol className="mt-2 flex gap-1">
                {(["Draf", "Dikirim", "Diperiksa Kami", "Tayang"] as const).map((s, i) => {
                  const done = i < 2 || (sent && i === 2);
                  return (
                    <li
                      key={s}
                      aria-current={done && i === (sent ? 2 : 1) ? "step" : undefined}
                      className={`flex h-9 flex-1 items-center justify-center whitespace-nowrap rounded-[2px] px-1 text-[12px] font-medium transition-colors duration-500 ${
                        done ? "bg-brand text-surface" : "border border-dashed border-brand text-brand"
                      }`}
                    >
                      {s}
                    </li>
                  );
                })}
              </ol>
              <p className="mt-4 text-[12px] text-text-muted">
                Kami memeriksa foto dan data sebelum lot tayang. Pemeriksaan biasanya satu hari kerja, contoh demo.
              </p>
            </div>

            <AnimatePresence>
              {sent && (
                <motion.p
                  role="status"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-[13px] text-text-soft"
                >
                  Lot terkirim. Kami membukanya di Lot saya dengan status Menunggu pemeriksaan.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.aside>
        </motion.div>

        <div className="flex items-center justify-between gap-4 pt-10">
          <p className="text-[12px] text-text-muted">Nama pabrik, lot, harga, dan stok adalah contoh demo untuk mock up.</p>
          <Link href="/lot-saya" className="flex items-center gap-1.5 text-[13px] font-medium text-brand hover:text-brand-hover">
            <Icon name="arrow-left" size={14} />
            Kembali ke Lot saya
          </Link>
        </div>
      </div>
    </section>
  );
}
