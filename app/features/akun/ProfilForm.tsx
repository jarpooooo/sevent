"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";
import { inputBox } from "../../components/ui/styles";
import { PROVINSI } from "../../lib/domain/wilayah";
import type { Account, Role } from "../auth/session";
import { Field, Grid, Section, Select } from "./FormParts";
import ProfilHero from "./ProfilHero";
import SectionNav, { type NavItem } from "./SectionNav";
import {
  emailValid,
  initialProfil,
  nibValid,
  npwpValid,
  phoneValid,
  type Profil,
  rekeningValid,
  saveProfil,
  SEKTOR_LABEL,
  type SektorPabrik,
} from "./profil";

const EASE = [0.16, 1, 0.3, 1] as const;
const ghost =
  "rounded-[2px] border border-border-strong px-[22px] py-3.5 text-[14px] font-medium transition-colors hover:bg-brand-soft";

const STEPS_UMKM = ["Identitas", "Bukti usaha", "Kebutuhan material", "Cek admin"];
const STEPS_PABRIK = ["Identitas", "Izin dan bukti usaha", "Cek admin"];

type Errs = Partial<Record<string, string>>;
type Kind = "umkm" | "pabrik" | "staf";

const PROV_OPTS = PROVINSI.map((p) => ({ v: p, t: p }));
const SEKTOR_OPTS = (Object.keys(SEKTOR_LABEL) as Exclude<SektorPabrik, "">[]).map((k) => ({ v: k, t: SEKTOR_LABEL[k] }));

function check(f: Profil, verify: boolean, kind: Kind): Errs {
  const e: Errs = {};
  if (!f.person.trim()) e.person = "Isi nama lengkap.";
  if (kind !== "staf" && !f.business.trim()) e.business = kind === "pabrik" ? "Isi nama pabrik." : "Isi nama usaha.";
  if (!f.phone.trim()) e.phone = "Isi nomor telepon.";
  else if (!phoneValid(f.phone)) e.phone = "Nomor tidak valid. Contoh: 0812 3456 7890.";
  if (!(f.email ?? "").trim()) e.email = "Isi email.";
  else if (!emailValid(f.email ?? "")) e.email = "Format email belum benar.";
  if ((kind === "pabrik" || kind === "staf") && !(f.jabatan ?? "").trim()) {
    e.jabatan = "Isi jabatan. Dipakai di kolom tanda tangan dokumen.";
  }
  if (kind !== "staf") {
    if (!f.address.trim()) e.address = "Isi alamat lengkap.";
    if (!(f.provinsi ?? "").trim()) e.provinsi = "Pilih provinsi.";
    if (f.nib.trim() && !nibValid(f.nib)) e.nib = "NIB terdiri dari 13 angka.";
    if ((f.npwp ?? "").trim() && !npwpValid(f.npwp ?? "")) e.npwp = "NPWP terdiri dari 15 atau 16 angka.";
    if ((f.rekening?.nomor ?? "").trim() && !rekeningValid(f.rekening?.nomor ?? "")) e.rekNo = "Nomor rekening 6 sampai 20 angka.";
    const tel = f.pabrik?.picTelepon ?? "";
    if (tel.trim() && !phoneValid(tel)) e.picTelepon = "Nomor tidak valid.";
  }
  if (verify && kind !== "staf") {
    if (!(f.kota ?? "").trim()) e.kota = "Isi kota atau kabupaten.";
    if (!nibValid(f.nib) && f.docs.length === 0) {
      e.docs = "Belum punya NIB? Unggah minimal satu bukti usaha lain, mis. foto tempat produksi atau katalog produk.";
    }
  }
  if (verify && kind === "umkm") {
    if (!f.needs?.fabric.trim()) e.fabric = "Isi jenis kain yang kamu cari.";
    if (!/^\d+$/.test((f.needs?.monthlyKg ?? "").trim())) e.monthlyKg = "Isi kapasitas beli per bulan dalam kg (angka).";
  }
  if (verify && kind === "pabrik") {
    if (!(f.npwp ?? "").trim()) e.npwp = "Isi NPWP pabrik. Dipakai di invoice.";
    if (!f.pabrik?.sektor) e.sektor = "Pilih kegiatan usaha pabrik.";
    if (!(f.pabrik?.nomorIzinKB ?? "").trim()) e.izin = "Isi nomor izin fasilitas Kawasan Berikat.";
    if (!(f.pabrik?.kantorPabean ?? "").trim()) e.kantor = "Isi kantor pabean pengawas.";
    if (!(f.rekening?.bank ?? "").trim()) e.bank = "Isi nama bank.";
    if (!(f.rekening?.nomor ?? "").trim()) e.rekNo = "Isi nomor rekening.";
    if (!(f.rekening?.atasNama ?? "").trim()) e.rekNama = "Isi nama pemilik rekening.";
  }
  return e;
}

/** Daftar data yang dipakai dokumen dan apakah sudah terisi. */
function readiness(f: Profil, kind: Kind) {
  const ok = (v?: string) => !!v?.trim();
  if (kind === "pabrik") {
    return [
      ["Nama, alamat, dan telepon pabrik", ok(f.business) && ok(f.address) && ok(f.phone)],
      ["NPWP", ok(f.npwp)],
      ["NIB", ok(f.nib)],
      ["Nomor izin fasilitas Kawasan Berikat", ok(f.pabrik?.nomorIzinKB)],
      ["Kantor pabean pengawas", ok(f.pabrik?.kantorPabean)],
      ["Jabatan penanda tangan", ok(f.jabatan)],
      ["Rekening pencairan dana", ok(f.rekening?.nomor) && ok(f.rekening?.bank) && ok(f.rekening?.atasNama)],
    ] as [string, boolean][];
  }
  return [
    ["Nama usaha, alamat, dan telepon", ok(f.business) && ok(f.address) && ok(f.phone)],
    ["Alamat kirim", ok(f.alamatKirim) || ok(f.address)],
    ["NIB atau NPWP (jika relevan)", ok(f.nib) || ok(f.npwp)],
    ["Email kontak", ok(f.email)],
  ] as [string, boolean][];
}

export default function ProfilForm({
  role,
  a,
  saved,
  notif,
  onLogout,
}: {
  role: Role;
  a: Account;
  saved: Profil | null;
  notif: ReactNode;
  onLogout: () => void;
}) {
  const id = useId();
  const reduce = useSafeReducedMotion();
  const kind: Kind = role === "pabrik" ? "pabrik" : role === "umkm" ? "umkm" : "staf";
  const isPabrik = kind === "pabrik";
  const [f, setF] = useState<Profil>(() => initialProfil(a, saved));
  const [errs, setErrs] = useState<Errs>({});
  const [note, setNote] = useState("");

  const clear = (...ks: string[]) => setErrs((p) => Object.fromEntries(Object.entries(p).filter(([k]) => !ks.includes(k))));
  const set = <K extends keyof Profil>(k: K, v: Profil[K], ...also: string[]) => {
    setF((p) => ({ ...p, [k]: v }));
    clear(String(k), ...also);
  };
  const setUsaha = (k: "jenis" | "produk" | "lamaTahun" | "pekerja" | "akun", v: string) =>
    setF((p) => ({ ...p, usaha: { jenis: "", produk: "", lamaTahun: "", pekerja: "", akun: "", ...p.usaha, [k]: v } }));
  const setPabrik = (k: "sektor" | "jenisSisa" | "nomorIzinKB" | "kantorPabean" | "picNama" | "picTelepon" | "jamAmbil", v: string, ...also: string[]) => {
    setF((p) => ({
      ...p,
      pabrik: { sektor: "", jenisSisa: "", nomorIzinKB: "", kantorPabean: "", picNama: "", picTelepon: "", jamAmbil: "", ...p.pabrik, [k]: v } as NonNullable<Profil["pabrik"]>,
    }));
    clear(...also);
  };
  const setRek = (k: "bank" | "nomor" | "atasNama", v: string, ...also: string[]) => {
    setF((p) => ({ ...p, rekening: { bank: "", nomor: "", atasNama: "", ...p.rekening, [k]: v } }));
    clear(...also);
  };
  const setNeed = (k: "fabric" | "minSize" | "monthlyKg" | "budget", v: string) => {
    setF((p) => ({ ...p, needs: { fabric: "", minSize: "", monthlyKg: "", budget: "", ...p.needs, [k]: v } }));
    clear("fabric", "monthlyKg");
  };

  const submitted = !!f.submittedAt && !!saved?.submittedAt;
  const approved = submitted && !!f.approvedAt;
  const lock = submitted && kind !== "staf";
  const base = check(f, false, kind);
  const idOk = !base.person && !base.business && !base.phone && !base.address && !base.email;
  const proofOk = nibValid(f.nib) || f.docs.length > 0;
  const legalOk =
    npwpValid(f.npwp ?? "") && !!f.pabrik?.nomorIzinKB.trim() && !!f.pabrik?.kantorPabean.trim() && !!f.pabrik?.sektor;
  const needsOk = !!f.needs?.fabric.trim() && /^\d+$/.test((f.needs?.monthlyKg ?? "").trim());
  const STEPS = isPabrik ? STEPS_PABRIK : STEPS_UMKM;
  const flags = isPabrik
    ? [idOk, idOk && proofOk && legalOk, approved]
    : [idOk, idOk && proofOk, idOk && proofOk && needsOk, approved];
  const state = (i: number) => {
    if (flags[i]) return "done";
    return i === flags.findIndex((d) => !d) ? "now" : "next";
  };

  const save = (verify: boolean) => {
    const e = check(f, verify, kind);
    setErrs(e);
    const keys = Object.keys(e);
    if (keys.length) {
      setNote(verify ? "Lengkapi data yang ditandai dulu." : "Periksa isian yang ditandai.");
      const el = document.getElementById(`${id}-${keys[0]}`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.focus({ preventScroll: true });
      return;
    }
    const next: Profil = verify ? { ...f, submittedAt: new Date().toISOString() } : f;
    saveProfil(role, next);
    setF(next);
    setNote(verify ? "Data terkirim. Admin Kainara memeriksa data dan bukti usahamu." : "Profil tersimpan di browser ini.");
  };

  const addDocs = (list: FileList | null) => {
    if (!list) return;
    const names = Array.from(list).map((x) => x.name);
    setF((p) => ({ ...p, docs: Array.from(new Set([...p.docs, ...names])) }));
    clear("docs");
  };

  const fid = (k: string) => `${id}-${k}`;
  const sameAddr = f.alamatKirim === undefined;
  const ready = kind === "staf" ? [] : readiness(f, kind);

  // Kelengkapan per bagian: dasar glyph mozaik, daftar isi, dan meteran di kepala halaman.
  const okv = (v?: string) => !!v?.trim();
  const count = (list: boolean[]) => ({ done: list.filter(Boolean).length, total: list.length });
  const cDiri = count([okv(f.person), kind === "staf" || okv(f.business), phoneValid(f.phone), emailValid(f.email ?? ""), ...(kind === "umkm" ? [] : [okv(f.jabatan)])]);
  const cUsaha = count([okv(f.usaha?.jenis), okv(f.usaha?.produk), okv(f.usaha?.lamaTahun), okv(f.usaha?.pekerja), okv(f.usaha?.akun)]);
  const cPabrik = count([!!f.pabrik?.sektor, okv(f.pabrik?.jenisSisa), okv(f.pabrik?.picNama), okv(f.pabrik?.picTelepon), okv(f.pabrik?.jamAmbil)]);
  const cAlamat = count([okv(f.address), okv(f.kota), okv(f.provinsi), ...(kind === "umkm" ? [sameAddr || okv(f.alamatKirim)] : [])]);
  const cPajak = count(isPabrik ? [npwpValid(f.npwp ?? ""), okv(f.pabrik?.nomorIzinKB), okv(f.pabrik?.kantorPabean)] : [npwpValid(f.npwp ?? "")]);
  const cRek = count([okv(f.rekening?.bank), rekeningValid(f.rekening?.nomor ?? ""), okv(f.rekening?.atasNama)]);
  const cVerif = count(kind === "umkm" ? [proofOk, okv(f.needs?.fabric), /^\d+$/.test((f.needs?.monthlyKg ?? "").trim())] : [proofOk]);
  const navItems: NavItem[] = [
    { id: "diri", label: "Data diri", ...cDiri, seed: 3 },
    ...(kind === "umkm" ? [{ id: "usaha", label: "Tentang usahamu", ...cUsaha, seed: 7 }] : []),
    ...(isPabrik ? [{ id: "pabrik", label: "Tentang pabrikmu", ...cPabrik, seed: 11 }] : []),
    ...(kind !== "staf" ? [{ id: "alamat", label: "Alamat", ...cAlamat, seed: 5 }, { id: "pajak", label: isPabrik ? "Pajak dan izin" : "Identitas pajak", ...cPajak, seed: 9 }] : []),
    ...(isPabrik ? [{ id: "rekening", label: "Rekening", ...cRek, seed: 13 }] : []),
    ...(kind !== "staf" ? [{ id: "verifikasi", label: "Verifikasi", ...cVerif, seed: 17 }] : []),
  ];
  const totDone = navItems.reduce((n, i) => n + i.done, 0);
  const totAll = navItems.reduce((n, i) => n + i.total, 0);
  const pct = totAll ? Math.round((totDone / totAll) * 100) : 0;
  const heroStatus =
    kind === "staf"
      ? null
      : approved
        ? { tone: "ok" as const, text: "Terverifikasi" }
        : submitted
          ? { tone: "wait" as const, text: "Menunggu cek admin" }
          : { tone: "idle" as const, text: "Belum dikirim" };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save(false);
      }}
      className="flex flex-col gap-10"
    >
      <ProfilHero
        a={a}
        role={role}
        name={f.person}
        business={kind === "staf" ? "" : f.business}
        pct={pct}
        done={totDone}
        total={totAll}
        status={heroStatus}
        onLogout={onLogout}
      />

      <div className="grid gap-8 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-12">
        <aside className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
          <SectionNav items={navItems} />
          {notif}
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
      {/* ---------- Data diri ---------- */}
      <Section
        id="diri"
        done={cDiri.done}
        total={cDiri.total}
        seed={3}
        title="Data diri"
        desc={
          kind === "staf"
            ? "Nama dan jabatan tercetak di kolom tanda tangan dokumen."
            : "Penanggung jawab usaha. Nama dan jabatan tercetak di kolom tanda tangan dokumen."
        }
      >
        <Grid>
          <Field label="Nama lengkap" error={errs.person} htmlFor={fid("person")}>
            <input id={fid("person")} className={inputBox} autoComplete="name" value={f.person} disabled={lock} onChange={(e) => set("person", e.target.value)} aria-invalid={!!errs.person} />
          </Field>
          <Field
            label={kind === "umkm" ? "Jabatan, opsional" : "Jabatan"}
            error={errs.jabatan}
            hint={kind === "umkm" ? "Contoh: pemilik." : "Contoh: manajer produksi."}
            htmlFor={fid("jabatan")}
          >
            <input id={fid("jabatan")} className={inputBox} autoComplete="organization-title" value={f.jabatan ?? ""} disabled={lock} onChange={(e) => set("jabatan", e.target.value)} aria-invalid={!!errs.jabatan} />
          </Field>
          {kind !== "staf" && (
            <Field label={isPabrik ? "Nama pabrik" : "Nama usaha"} error={errs.business} htmlFor={fid("business")}>
              <input
                id={fid("business")}
                className={inputBox}
                autoComplete="organization"
                placeholder={isPabrik ? "Contoh: CV Tekstil Maju" : "Contoh: Sari Jahit Rumahan"}
                value={f.business}
                disabled={lock}
                onChange={(e) => set("business", e.target.value)}
                aria-invalid={!!errs.business}
              />
            </Field>
          )}
          <Field label="Nomor telepon" error={errs.phone} hint="Nomor aktif untuk dihubungi pabrik, kurir, atau admin." htmlFor={fid("phone")}>
            <input id={fid("phone")} className={inputBox} type="tel" inputMode="tel" autoComplete="tel" placeholder="0812 3456 7890" value={f.phone} disabled={lock} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errs.phone} />
          </Field>
          <Field label="Email" error={errs.email} hint="Tampil di invoice sebagai kontak. Bawaannya email akun masuk." htmlFor={fid("email")}>
            <input id={fid("email")} className={inputBox} type="email" autoComplete="email" value={f.email ?? ""} disabled={lock} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errs.email} />
          </Field>
        </Grid>
      </Section>

      {/* ---------- Detail usaha UMKM ---------- */}
      {kind === "umkm" && (
        <Section id="usaha" done={cUsaha.done} total={cUsaha.total} seed={7} title="Tentang usahamu" desc="Membantu pabrik memahami kebutuhanmu. Semua boleh dikosongkan.">
          <Grid>
            <Field label="Jenis usaha" htmlFor={fid("ujenis")}>
              <input id={fid("ujenis")} className={inputBox} placeholder="Contoh: konveksi, penjahit rumahan" value={f.usaha?.jenis ?? ""} disabled={lock} onChange={(e) => setUsaha("jenis", e.target.value)} />
            </Field>
            <Field label="Produk utama" htmlFor={fid("uproduk")}>
              <input id={fid("uproduk")} className={inputBox} placeholder="Contoh: tas, seragam, aksesori" value={f.usaha?.produk ?? ""} disabled={lock} onChange={(e) => setUsaha("produk", e.target.value)} />
            </Field>
            <Field label="Lama usaha (tahun)" htmlFor={fid("ulama")}>
              <input id={fid("ulama")} className={`${inputBox} tabular-nums`} inputMode="numeric" value={f.usaha?.lamaTahun ?? ""} disabled={lock} onChange={(e) => setUsaha("lamaTahun", e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Jumlah pekerja" htmlFor={fid("upekerja")}>
              <input id={fid("upekerja")} className={`${inputBox} tabular-nums`} inputMode="numeric" value={f.usaha?.pekerja ?? ""} disabled={lock} onChange={(e) => setUsaha("pekerja", e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Akun usaha" hint="Instagram, marketplace, atau situs." htmlFor={fid("uakun")} className="sm:col-span-2">
              <input id={fid("uakun")} className={inputBox} placeholder="Contoh: @sarijahit" value={f.usaha?.akun ?? ""} disabled={lock} onChange={(e) => setUsaha("akun", e.target.value)} />
            </Field>
          </Grid>
        </Section>
      )}

      {/* ---------- Detail pabrik ---------- */}
      {isPabrik && (
        <Section id="pabrik" done={cPabrik.done} total={cPabrik.total} seed={11} title="Tentang pabrikmu" desc="Menentukan jenis lot yang kamu jual dan siapa yang menyerahkan barang.">
          <Grid>
            <Field label="Kegiatan usaha" error={errs.sektor} htmlFor={fid("sektor")}>
              <Select id={fid("sektor")} value={f.pabrik?.sektor ?? ""} onChange={(v) => setPabrik("sektor", v, "sektor")} options={SEKTOR_OPTS} placeholder="Pilih kegiatan usaha" disabled={lock} invalid={!!errs.sektor} />
            </Field>
            <Field label="Jenis sisa produksi utama" htmlFor={fid("jenisSisa")}>
              <input id={fid("jenisSisa")} className={inputBox} placeholder="Contoh: perca cutting denim" value={f.pabrik?.jenisSisa ?? ""} disabled={lock} onChange={(e) => setPabrik("jenisSisa", e.target.value)} />
            </Field>
            <Field label="Petugas lapangan" hint="Yang menyerahkan barang ke pembeli atau kurir." htmlFor={fid("picNama")}>
              <input id={fid("picNama")} className={inputBox} value={f.pabrik?.picNama ?? ""} disabled={lock} onChange={(e) => setPabrik("picNama", e.target.value)} />
            </Field>
            <Field label="Telepon petugas lapangan" error={errs.picTelepon} htmlFor={fid("picTelepon")}>
              <input id={fid("picTelepon")} className={inputBox} type="tel" inputMode="tel" value={f.pabrik?.picTelepon ?? ""} disabled={lock} onChange={(e) => setPabrik("picTelepon", e.target.value, "picTelepon")} aria-invalid={!!errs.picTelepon} />
            </Field>
            <Field label="Jam serah terima barang" hint="Contoh: Senin sampai Jumat, 08.00 sampai 15.00." htmlFor={fid("jamAmbil")} className="sm:col-span-2">
              <input id={fid("jamAmbil")} className={inputBox} value={f.pabrik?.jamAmbil ?? ""} disabled={lock} onChange={(e) => setPabrik("jamAmbil", e.target.value)} />
            </Field>
          </Grid>
        </Section>
      )}

      {/* ---------- Alamat ---------- */}
      {kind !== "staf" && (
        <Section id="alamat" done={cAlamat.done} total={cAlamat.total} seed={5} title={isPabrik ? "Alamat pabrik" : "Alamat usaha dan kirim"}>
          <Field
            label="Alamat lengkap"
            error={errs.address}
            hint={isPabrik ? "Jalan, kelurahan, kecamatan. Dipakai pembeli yang ambil sendiri dan di dokumen." : "Jalan, kelurahan, kecamatan. Tercetak sebagai alamat usaha di invoice."}
            htmlFor={fid("address")}
          >
            <textarea id={fid("address")} rows={3} className={`${inputBox} h-auto resize-y py-3 leading-5`} value={f.address} disabled={lock} onChange={(e) => set("address", e.target.value)} aria-invalid={!!errs.address} />
          </Field>
          <Grid>
            <Field label="Kota atau kabupaten" error={errs.kota} htmlFor={fid("kota")}>
              <input id={fid("kota")} className={inputBox} autoComplete="address-level2" placeholder="Contoh: Bantul" value={f.kota ?? ""} disabled={lock} onChange={(e) => set("kota", e.target.value)} aria-invalid={!!errs.kota} />
            </Field>
            <Field label="Provinsi" error={errs.provinsi} htmlFor={fid("provinsi")}>
              <Select id={fid("provinsi")} value={f.provinsi ?? ""} onChange={(v) => set("provinsi", v)} options={PROV_OPTS} placeholder="Pilih provinsi" disabled={lock} invalid={!!errs.provinsi} />
            </Field>
          </Grid>
          {kind === "umkm" && (
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center gap-2.5 text-[14px]">
                <input
                  type="checkbox"
                  checked={sameAddr}
                  disabled={lock}
                  onChange={(e) => set("alamatKirim", e.target.checked ? undefined : "")}
                  className="size-4 accent-[var(--color-brand)]"
                />
                Alamat kirim sama dengan alamat usaha
              </label>
              {f.alamatKirim !== undefined && (
                <Field label="Alamat kirim" htmlFor={fid("alamatKirim")} hint="Dipakai sebagai tujuan di checkout dan dokumen pengiriman.">
                  <textarea id={fid("alamatKirim")} rows={2} className={`${inputBox} h-auto resize-y py-3 leading-5`} value={f.alamatKirim} disabled={lock} onChange={(e) => set("alamatKirim", e.target.value)} />
                </Field>
              )}
            </div>
          )}
          <p className="max-w-[520px] text-[12px] leading-[18px] text-text-muted">
            {isPabrik
              ? "Provinsi dan kota menentukan UMKM mana yang melihat lotmu di Katalog regional."
              : "Provinsi dan kota menentukan lot yang tampil di Katalog regional."}
          </p>
        </Section>
      )}

      {/* ---------- Perpajakan dan izin ---------- */}
      {kind !== "staf" && (
        <Section
          id="pajak"
          done={cPajak.done}
          total={cPajak.total}
          seed={9}
          title={isPabrik ? "Perpajakan dan izin" : "Identitas perpajakan"}
          desc={
            isPabrik
              ? "Dipakai di invoice dan laporan pendukung kepabeanan. Tidak ada isian bawaan: kosong berarti dokumen menandainya \"menunggu\"."
              : "Opsional. Hanya tercetak di invoice bila kamu mengisinya."
          }
        >
          <Grid>
            <Field label={isPabrik ? "NPWP" : "NPWP, opsional"} error={errs.npwp} hint="15 atau 16 angka. Titik dan strip boleh." htmlFor={fid("npwp")}>
              <input id={fid("npwp")} className={`${inputBox} tabular-nums`} inputMode="numeric" value={f.npwp ?? ""} disabled={lock} onChange={(e) => set("npwp", e.target.value)} aria-invalid={!!errs.npwp} />
            </Field>
            {isPabrik && (
              <Field label="Nomor izin fasilitas Kawasan Berikat" error={errs.izin} htmlFor={fid("izin")}>
                <input id={fid("izin")} className={inputBox} value={f.pabrik?.nomorIzinKB ?? ""} disabled={lock} onChange={(e) => setPabrik("nomorIzinKB", e.target.value, "izin")} aria-invalid={!!errs.izin} />
              </Field>
            )}
            {isPabrik && (
              <Field label="Kantor pabean pengawas" error={errs.kantor} hint="Kantor Bea Cukai yang mengawasi pabrikmu." htmlFor={fid("kantor")} className="sm:col-span-2">
                <input id={fid("kantor")} className={inputBox} value={f.pabrik?.kantorPabean ?? ""} disabled={lock} onChange={(e) => setPabrik("kantorPabean", e.target.value, "kantor")} aria-invalid={!!errs.kantor} />
              </Field>
            )}
          </Grid>
        </Section>
      )}

      {/* ---------- Rekening pencairan (pabrik) ---------- */}
      {isPabrik && (
        <Section id="rekening" done={cRek.done} total={cRek.total} seed={13} title="Rekening pencairan dana" desc="Setelah barang diterima, PJP meneruskan dana ke rekening ini. Di demo tidak ada uang yang bergerak.">
          <Grid>
            <Field label="Bank" error={errs.bank} htmlFor={fid("bank")}>
              <input id={fid("bank")} className={inputBox} placeholder="Contoh: Bank Mandiri" value={f.rekening?.bank ?? ""} disabled={lock} onChange={(e) => setRek("bank", e.target.value, "bank")} aria-invalid={!!errs.bank} />
            </Field>
            <Field label="Nomor rekening" error={errs.rekNo} htmlFor={fid("rekNo")}>
              <input id={fid("rekNo")} className={`${inputBox} tabular-nums`} inputMode="numeric" value={f.rekening?.nomor ?? ""} disabled={lock} onChange={(e) => setRek("nomor", e.target.value, "rekNo")} aria-invalid={!!errs.rekNo} />
            </Field>
            <Field label="Atas nama" error={errs.rekNama} htmlFor={fid("rekNama")} className="sm:col-span-2">
              <input id={fid("rekNama")} className={inputBox} value={f.rekening?.atasNama ?? ""} disabled={lock} onChange={(e) => setRek("atasNama", e.target.value, "rekNama")} aria-invalid={!!errs.rekNama} />
            </Field>
          </Grid>
        </Section>
      )}

      {/* ---------- Verifikasi ---------- */}
      {kind !== "staf" && (
        <Section
          id="verifikasi"
          done={cVerif.done}
          total={cVerif.total}
          seed={17}
          title="Verifikasi usaha"
          desc="Admin memeriksa bukti usahamu sebelum akun bisa bertransaksi."
          aside={
            <span className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium ${submitted && !approved ? "bg-warn-soft text-text" : "bg-brand-soft text-brand"}`}>
              {approved ? "Terverifikasi" : submitted ? "Menunggu cek admin" : "Belum dikirim"}
            </span>
          }
        >
          <ol aria-label="Jalur verifikasi" className={`grid gap-2 ${isPabrik ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
            {STEPS.map((s, i) => {
              const st = state(i);
              return (
                <motion.li
                  key={s}
                  aria-current={st === "now" ? "step" : undefined}
                  className={`flex h-[72px] flex-col justify-end gap-0.5 rounded-[2px] px-3 py-2.5 transition-colors duration-500 ${
                    st === "done" ? "bg-brand text-on-dark" : st === "now" ? "bg-accent text-text" : "bg-brand-soft text-text-muted"
                  }`}
                  style={{ originX: 0 }}
                  initial={reduce ? false : { opacity: 0, scaleX: 0.5 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: EASE, delay: reduce ? 0 : 0.1 + i * 0.1 }}
                >
                  <span className="text-[12px] leading-4 opacity-80">{st === "done" ? "Selesai" : st === "now" ? "Sekarang" : "Berikutnya"}</span>
                  <span className="text-[14px] font-medium leading-[17px]">{s}</span>
                </motion.li>
              );
            })}
          </ol>

          {kind === "umkm" && (
            <div className="flex flex-col gap-4">
              <p className="text-[14px] font-medium leading-[17px]">Kebutuhan material</p>
              {f.revisionNote && !submitted && (
                <p role="status" className="rounded-[2px] bg-warn-soft px-3.5 py-3 text-[13px] leading-5">
                  Catatan admin: {f.revisionNote}
                </p>
              )}
              <Grid>
                <Field label="Jenis kain yang dicari" error={errs.fabric} htmlFor={fid("fabric")}>
                  <input id={fid("fabric")} className={inputBox} placeholder="Contoh: denim, katun polos" value={f.needs?.fabric ?? ""} disabled={lock} onChange={(e) => setNeed("fabric", e.target.value)} aria-invalid={!!errs.fabric} />
                </Field>
                <Field label="Ukuran minimum potongan" hint="Boleh kosong." htmlFor={fid("minsize")}>
                  <input id={fid("minsize")} className={inputBox} placeholder="Contoh: 20 cm" value={f.needs?.minSize ?? ""} disabled={lock} onChange={(e) => setNeed("minSize", e.target.value)} />
                </Field>
                <Field label="Kapasitas beli per bulan (kg)" error={errs.monthlyKg} htmlFor={fid("monthlyKg")}>
                  <input id={fid("monthlyKg")} className={`${inputBox} tabular-nums`} inputMode="numeric" placeholder="Contoh: 40" value={f.needs?.monthlyKg ?? ""} disabled={lock} onChange={(e) => setNeed("monthlyKg", e.target.value)} aria-invalid={!!errs.monthlyKg} />
                </Field>
                <Field label="Anggaran per bulan (Rp)" hint="Boleh kosong." htmlFor={fid("budget")}>
                  <input id={fid("budget")} className={`${inputBox} tabular-nums`} inputMode="numeric" placeholder="Contoh: 500000" value={f.needs?.budget ?? ""} disabled={lock} onChange={(e) => setNeed("budget", e.target.value)} />
                </Field>
              </Grid>
            </div>
          )}

          {isPabrik && f.revisionNote && !submitted && (
            <p role="status" className="rounded-[2px] bg-warn-soft px-3.5 py-3 text-[13px] leading-5">
              Catatan admin: {f.revisionNote}
            </p>
          )}

          <Field
            label="Nomor Induk Berusaha (NIB), opsional"
            error={errs.nib}
            hint="13 angka, ada di dokumen NIB dari OSS. Belum punya? Cukup unggah bukti usaha lain di bawah."
            htmlFor={fid("nib")}
          >
            <input id={fid("nib")} className={`${inputBox} tabular-nums sm:max-w-[320px]`} inputMode="numeric" autoComplete="off" placeholder="1234567890123" value={f.nib} onChange={(e) => set("nib", e.target.value)} aria-invalid={!!errs.nib} disabled={lock} />
          </Field>

          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium leading-[17px]">Bukti usaha</p>
            <ul className="flex flex-col gap-2">
              {f.docs.map((d) => (
                <li key={d} className="flex items-center justify-between gap-3 rounded-[2px] border border-line bg-card px-4 py-2.5 text-[14px]">
                  <span className="min-w-0 truncate">{d}</span>
                  {!lock && (
                    <button type="button" onClick={() => set("docs", f.docs.filter((x) => x !== d))} className="shrink-0 text-[13px] font-medium text-brand underline underline-offset-4 hover:text-brand-hover" aria-label={`Hapus ${d}`}>
                      Hapus
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {!lock && (
              <label
                htmlFor={fid("docs")}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-[2px] border border-dashed px-4 py-6 text-center transition-colors hover:bg-brand-soft/50 ${errs.docs ? "border-text" : "border-brand"}`}
              >
                <span className="text-[14px] font-medium text-brand">Pilih berkas bukti usaha</span>
                <span className="text-[12px] leading-[15px] text-text-muted">
                  Foto tempat produksi, hasil kerajinan, katalog produk, akun usaha, atau salinan NIB. JPG, PNG, atau PDF. Di demo ini hanya nama berkas yang dicatat.
                </span>
                <input
                  id={fid("docs")}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="sr-only"
                  onChange={(e) => {
                    addDocs(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
            {errs.docs && (
              <p role="alert" className="text-[13px] leading-4 text-text-soft">
                {errs.docs}
              </p>
            )}
          </div>

          <p className="max-w-[560px] text-[13px] leading-5 text-text-muted">
            {approved
              ? isPabrik
                ? "Terverifikasi: lotmu bisa tayang di Katalog."
                : "Terverifikasi: akunmu bisa membeli lot yang punya syarat verifikasi."
              : submitted
                ? "Admin Kainara memeriksa data dan bukti usahamu: menyetujui, menolak, atau meminta revisi. Selama itu, data tidak bisa diubah."
                : isPabrik
                  ? "Setelah admin menyetujui, lotmu bisa tayang di Katalog."
                  : "Setelah admin menyetujui, akunmu bisa membeli lot yang punya syarat verifikasi."}
          </p>
        </Section>
      )}

      {/* ---------- Kelengkapan data dokumen ---------- */}
      {kind !== "staf" && (
        <Section
          id="dokumen"
          title="Kelengkapan data untuk dokumen"
          desc={'Invoice komersial, laporan kepabeanan, dan lembar rekonsiliasi memakai data di atas. Data yang kosong tertulis "menunggu" di dokumen, bukan angka karangan.'}
        >
          <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {ready.map(([t, ok]) => (
              <li key={t} className="flex items-center gap-2.5 text-[14px]">
                <span aria-hidden="true" className={`block size-3 shrink-0 rounded-[2px] ${ok ? "bg-brand" : "border border-border-strong"}`} />
                <span className={ok ? "" : "text-text-muted"}>
                  {t}
                  <span className="sr-only">{ok ? ", terisi" : ", belum terisi"}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

        </div>
      </div>

      <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[2px] border border-line bg-panel px-4 py-3 sm:px-5">
        <p className="mr-auto flex items-baseline gap-2">
          <span className="font-display text-[24px] leading-none tabular-nums tracking-[-0.02em] text-brand">{pct}%</span>
          <span className="text-[13px] text-text-muted">lengkap</span>
        </p>
        <div role="status" className="min-h-4 max-w-[420px] text-[13px] leading-[17px] text-text-muted">
          <AnimatePresence mode="wait">
            {note && (
              <motion.span key={note} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                {note}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {!submitted && kind !== "staf" && (
          <button type="button" onClick={() => save(true)} className={`${ghost} h-11 py-0`}>
            Kirim untuk verifikasi
          </button>
        )}
        <motion.button type="submit" whileTap={{ scale: 0.98 }} className="h-11 rounded-[2px] bg-brand px-6 text-[14px] font-medium text-surface transition-colors hover:bg-brand-hover">
          Simpan profil
        </motion.button>
      </div>
    </form>
  );
}
