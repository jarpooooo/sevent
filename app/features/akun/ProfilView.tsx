"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { inputBox, panel } from "../../components/ui/styles";
import UserAvatar from "../../components/ui/UserAvatar";
import { logout, type Account, type Role, useAccount, useRole } from "../auth/session";
import { nibValid, phoneValid, type Profil, saveProfil, useProfil } from "./profil";

const EASE = [0.16, 1, 0.3, 1] as const;
const ghost =
  "rounded-[2px] border border-border-strong px-[22px] py-3.5 text-[14px] font-medium transition-colors hover:bg-brand-soft";

const STEPS_UMKM = ["Identitas", "Bukti usaha", "Kebutuhan material", "Cek admin"];
const STEPS_PABRIK = ["Identitas", "Bukti usaha", "Cek admin"];

/** Isi contoh demo, mengikuti desain Figma "Profil UMKM"; versi pabrik menyesuaikan teksnya. */
const NOTIFS: Record<Role, { t: string; d: string; when: string; unread: boolean }[]> = {
  umkm: [
    { t: "Paket #CL-0192 dikirim", d: "Estimasi tiba 29 Nov.", when: "Baru", unread: true },
    { t: "Pembayaran #CL-0192 berhasil", d: "Pabrik menyiapkan lotmu.", when: "Kemarin", unread: true },
    { t: "Lelang LL-007 berakhir", d: "Kamu belum mengambil lot ini.", when: "2 hari lalu", unread: false },
  ],
  admin: [
    { t: "Verifikasi menunggu", d: "Ada akun yang menunggu pemeriksaan di Panel admin.", when: "Baru", unread: true },
    { t: "Konfirmasi kurir menunggu", d: "Paket terkirim perlu dikonfirmasi lewat kurir.", when: "Kemarin", unread: false },
  ],
  pabrik: [
    { t: "Pesanan #CL-0192 masuk", d: "Siapkan lot Offcut denim polos.", when: "Baru", unread: true },
    { t: "Lot Offcut denim polos tayang", d: "Terlihat oleh UMKM di provinsimu.", when: "Kemarin", unread: true },
    { t: "Pembayaran #CL-0187 masuk", d: "PJP mengabari, siapkan barang.", when: "2 hari lalu", unread: false },
  ],
};

function Notifikasi({ role }: { role: Role }) {
  const [items, setItems] = useState(NOTIFS[role]);
  return (
    <section aria-label="Notifikasi" className={`${panel} overflow-hidden`}>
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-[18px] font-medium">Notifikasi</h2>
        <button
          type="button"
          onClick={() => setItems((l) => l.map((n) => ({ ...n, unread: false })))}
          className="text-[13px] font-medium text-brand underline underline-offset-4 hover:text-brand-hover"
        >
          Tandai terbaca
        </button>
      </div>
      <ul>
        {items.map((n) => (
          <li key={n.t} className="flex items-start gap-3 border-t border-border px-6 py-4">
            <span
              aria-hidden="true"
              className={`mt-[7px] size-2 shrink-0 rounded-full ${n.unread ? "bg-brand" : "bg-border-strong"}`}
            />
            <div className="min-w-0 flex-1">
              <p className={`text-[14px] ${n.unread ? "font-medium" : ""}`}>
                {n.t}
                {n.unread && <span className="sr-only"> (belum dibaca)</span>}
              </p>
              <p className="mt-0.5 text-[13px] text-text-muted">{n.d}</p>
            </div>
            <span className="shrink-0 text-[12px] text-text-muted">{n.when}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Errs = Partial<Record<"person" | "business" | "phone" | "address" | "nib" | "docs" | "fabric" | "monthlyKg", string>>;

function check(f: Profil, forVerify: boolean, isPabrik = false): Errs {
  const e: Errs = {};
  if (!f.person.trim()) e.person = "Isi nama lengkap.";
  if (!f.business.trim()) e.business = "Isi nama usaha.";
  if (!f.phone.trim()) e.phone = "Isi nomor telepon.";
  else if (!phoneValid(f.phone)) e.phone = "Nomor tidak valid. Contoh: 0812 3456 7890.";
  if (!f.address.trim()) e.address = "Isi alamat lengkap.";
  // NIB opsional (penjahit rumahan sering belum punya). Bila diisi harus 13 angka.
  if (f.nib.trim() && !nibValid(f.nib)) e.nib = "NIB terdiri dari 13 angka.";
  if (forVerify && !nibValid(f.nib) && f.docs.length === 0) {
    e.docs = "Belum punya NIB? Unggah minimal satu bukti usaha lain, mis. foto tempat produksi atau katalog produk.";
  }
  if (forVerify && !isPabrik) {
    if (!f.needs?.fabric.trim()) e.fabric = "Isi jenis kain yang kamu cari.";
    if (!/^\d+$/.test((f.needs?.monthlyKg ?? "").trim())) e.monthlyKg = "Isi kapasitas beli per bulan dalam kg (angka).";
  }
  return e;
}

function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[14px] font-medium leading-[17px]">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[13px] leading-4 text-text-soft">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] leading-[15px] text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

function ProfilForm({ role, a, saved }: { role: Role; a: Account; saved: Profil | null }) {
  const id = useId();
  const isPabrik = role === "pabrik";
  const [f, setF] = useState<Profil>(
    saved ?? {
      person: a.name,
      business: a.business,
      phone: a.whatsapp,
      address: a.address,
      nib: a.nib ?? "",
      docs: [],
    },
  );
  const [errs, setErrs] = useState<Errs>({});
  const [note, setNote] = useState("");
  const set = <K extends keyof Profil>(k: K, v: Profil[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrs((p) => ({ ...p, [k]: undefined }));
  };

  const submitted = !!f.submittedAt && !!saved?.submittedAt;
  const approved = submitted && !!f.approvedAt;
  const base = check(f, false, isPabrik);
  const idOk = !base.person && !base.business && !base.phone && !base.address;
  const proofOk = nibValid(f.nib) || f.docs.length > 0;
  const needsOk = !!f.needs?.fabric.trim() && /^\d+$/.test((f.needs?.monthlyKg ?? "").trim());
  const STEPS = isPabrik ? STEPS_PABRIK : STEPS_UMKM;
  const state = (i: number) => {
    const flags = isPabrik ? [idOk, idOk && proofOk, approved] : [idOk, idOk && proofOk, idOk && proofOk && needsOk, approved];
    if (flags[i]) return "done";
    const firstOpen = flags.findIndex((d) => !d);
    return i === firstOpen ? "now" : "next";
  };

  const save = (verify: boolean) => {
    const e = check(f, verify, isPabrik);
    setErrs(e);
    if (Object.keys(e).length) {
      setNote(verify ? "Lengkapi data yang ditandai dulu." : "Periksa isian yang ditandai.");
      return;
    }
    const next: Profil = verify ? { ...f, submittedAt: new Date().toISOString() } : f;
    saveProfil(role, next);
    setF(next);
    setNote(verify ? "Data terkirim. Admin Kainara memeriksa bukti usahamu." : "Profil tersimpan di browser ini.");
  };

  const setNeed = (k: "fabric" | "minSize" | "monthlyKg" | "budget", v: string) => {
    setF((p) => ({ ...p, needs: { fabric: "", minSize: "", monthlyKg: "", budget: "", ...p.needs, [k]: v } }));
    setErrs((p) => ({ ...p, fabric: undefined, monthlyKg: undefined }));
  };

  const addDocs = (list: FileList | null) => {
    if (!list) return;
    const names = Array.from(list).map((x) => x.name);
    setF((p) => ({ ...p, docs: Array.from(new Set([...p.docs, ...names])) }));
    setErrs((p) => ({ ...p, docs: undefined }));
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save(false);
      }}
      className="flex flex-col gap-6"
    >
      <section aria-label="Data diri" className={`${panel} flex flex-col gap-5 p-6`}>
        <h2 className="text-[18px] font-medium">Data diri</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nama lengkap" error={errs.person} htmlFor={`${id}-person`}>
            <input
              id={`${id}-person`}
              className={inputBox}
              autoComplete="name"
              value={f.person}
              onChange={(e) => set("person", e.target.value)}
              aria-invalid={!!errs.person}
            />
          </Field>
          <Field label={isPabrik ? "Nama pabrik" : "Nama usaha"} error={errs.business} htmlFor={`${id}-biz`}>
            <input
              id={`${id}-biz`}
              className={inputBox}
              autoComplete="organization"
              placeholder={isPabrik ? "Contoh: CV Tekstil Maju" : "Contoh: Sari Jahit Rumahan"}
              value={f.business}
              onChange={(e) => set("business", e.target.value)}
              aria-invalid={!!errs.business}
            />
          </Field>
          <Field
            label="Nomor telepon"
            error={errs.phone}
            hint="Nomor aktif untuk dihubungi pabrik atau kurir."
            htmlFor={`${id}-phone`}
          >
            <input
              id={`${id}-phone`}
              className={inputBox}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0812 3456 7890"
              value={f.phone}
              onChange={(e) => set("phone", e.target.value)}
              aria-invalid={!!errs.phone}
            />
          </Field>
          <Field label="Email" htmlFor={`${id}-email`} hint="Dari akun masuk. Tidak bisa diubah di sini.">
            <input id={`${id}-email`} className={`${inputBox} text-text-muted`} value={a.email} readOnly />
          </Field>
        </div>
      </section>

      <section aria-label={isPabrik ? "Alamat pabrik" : "Alamat penerima"} className={`${panel} flex flex-col gap-4 p-6`}>
        <h2 className="text-[18px] font-medium">{isPabrik ? "Alamat pabrik" : "Alamat penerima"}</h2>
        <Field
          label="Alamat lengkap"
          error={errs.address}
          hint={
            isPabrik
              ? "Jalan, kelurahan, kecamatan, kota. Dipakai pembeli yang ambil sendiri."
              : "Jalan, kelurahan, kecamatan, kota. Dipakai untuk pengiriman."
          }
          htmlFor={`${id}-addr`}
        >
          <textarea
            id={`${id}-addr`}
            rows={3}
            className={`${inputBox} h-auto resize-y py-3 leading-5`}
            value={f.address}
            onChange={(e) => set("address", e.target.value)}
            aria-invalid={!!errs.address}
          />
        </Field>
        <p className="max-w-[520px] text-[12px] leading-[18px] text-text-muted">
          Provinsi: {a.province}.{" "}
          {isPabrik
            ? "Provinsi menentukan UMKM mana yang melihat lotmu di Katalog regional."
            : "Provinsi menentukan lot yang tampil di Katalog regional. Untuk pindah provinsi, hubungi kami."}
        </p>
      </section>

      <section aria-label="Verifikasi usaha" className={`${panel} flex flex-col gap-5 p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[18px] font-medium">Verifikasi usaha</h2>
          <span
            className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${submitted && !approved ? "bg-warn-soft text-text" : "bg-brand-soft text-brand"}`}
          >
            {approved ? "Terverifikasi" : submitted ? "Menunggu cek admin" : "Belum dikirim"}
          </span>
        </div>
        <ol className={`grid gap-1.5 ${isPabrik ? "grid-cols-3" : "grid-cols-4"}`}>
          {STEPS.map((s, i) => {
            const st = state(i);
            return (
              <li key={s} aria-current={st === "now" ? "step" : undefined} className="flex flex-col gap-2">
                <span
                  aria-hidden="true"
                  className={`block h-2.5 rounded-[2px] ${st === "done" ? "bg-brand" : st === "now" ? "bg-accent" : "bg-brand-soft"}`}
                />
                <span className={`text-[13px] ${st === "next" ? "text-text-muted" : "font-medium"}`}>{s}</span>
              </li>
            );
          })}
        </ol>

        {!isPabrik && (
          <div className="flex flex-col gap-4">
            <p className="text-[14px] font-medium leading-[17px]">Kebutuhan material</p>
            {f.revisionNote && !submitted && (
              <p role="status" className="rounded-[2px] bg-warn-soft px-3.5 py-3 text-[13px] leading-5">
                Catatan admin: {f.revisionNote}
              </p>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Jenis kain yang dicari" error={errs.fabric} htmlFor={`${id}-fabric`}>
                <input
                  id={`${id}-fabric`}
                  className={inputBox}
                  placeholder="Contoh: denim, katun polos"
                  value={f.needs?.fabric ?? ""}
                  disabled={submitted}
                  onChange={(e) => setNeed("fabric", e.target.value)}
                  aria-invalid={!!errs.fabric}
                />
              </Field>
              <Field label="Ukuran minimum potongan" htmlFor={`${id}-minsize`} hint="Boleh kosong.">
                <input
                  id={`${id}-minsize`}
                  className={inputBox}
                  placeholder="Contoh: 20 cm"
                  value={f.needs?.minSize ?? ""}
                  disabled={submitted}
                  onChange={(e) => setNeed("minSize", e.target.value)}
                />
              </Field>
              <Field label="Kapasitas beli per bulan (kg)" error={errs.monthlyKg} htmlFor={`${id}-kg`}>
                <input
                  id={`${id}-kg`}
                  className={`${inputBox} tabular-nums`}
                  inputMode="numeric"
                  placeholder="Contoh: 40"
                  value={f.needs?.monthlyKg ?? ""}
                  disabled={submitted}
                  onChange={(e) => setNeed("monthlyKg", e.target.value)}
                  aria-invalid={!!errs.monthlyKg}
                />
              </Field>
              <Field label="Anggaran per bulan (Rp)" htmlFor={`${id}-budget`} hint="Boleh kosong.">
                <input
                  id={`${id}-budget`}
                  className={`${inputBox} tabular-nums`}
                  inputMode="numeric"
                  placeholder="Contoh: 500000"
                  value={f.needs?.budget ?? ""}
                  disabled={submitted}
                  onChange={(e) => setNeed("budget", e.target.value)}
                />
              </Field>
            </div>
          </div>
        )}

        <Field
          label="Nomor Induk Berusaha (NIB), opsional"
          error={errs.nib}
          hint="13 angka, ada di dokumen NIB dari OSS. Belum punya? Cukup unggah bukti usaha lain di bawah."
          htmlFor={`${id}-nib`}
        >
          <input
            id={`${id}-nib`}
            className={`${inputBox} tabular-nums sm:max-w-[320px]`}
            inputMode="numeric"
            autoComplete="off"
            placeholder="1234567890123"
            value={f.nib}
            onChange={(e) => set("nib", e.target.value)}
            aria-invalid={!!errs.nib}
            disabled={submitted}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <p className="text-[14px] font-medium leading-[17px]">Bukti usaha</p>
          <ul className="flex flex-col gap-2">
            {f.docs.map((d) => (
              <li
                key={d}
                className="flex items-center justify-between gap-3 rounded-[2px] border border-line bg-card px-4 py-2.5 text-[14px]"
              >
                <span className="min-w-0 truncate">{d}</span>
                {!submitted && (
                  <button
                    type="button"
                    onClick={() => set("docs", f.docs.filter((x) => x !== d))}
                    className="shrink-0 text-[13px] font-medium text-brand underline underline-offset-4 hover:text-brand-hover"
                    aria-label={`Hapus ${d}`}
                  >
                    Hapus
                  </button>
                )}
              </li>
            ))}
          </ul>
          {!submitted && (
            <label
              htmlFor={`${id}-docs`}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-[2px] border border-dashed px-4 py-6 text-center transition-colors hover:bg-brand-soft/50 ${errs.docs ? "border-text" : "border-brand"}`}
            >
              <span className="text-[14px] font-medium text-brand">Pilih berkas dokumen</span>
              <span className="text-[12px] leading-[15px] text-text-muted">
                Foto tempat produksi, hasil kerajinan, katalog produk, akun usaha, atau salinan NIB. JPG, PNG, atau PDF. Di demo ini hanya nama berkas yang dicatat.
              </span>
              <input
                id={`${id}-docs`}
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
              ? "Admin Kainara memeriksa bukti usahamu: menyetujui, menolak, atau meminta revisi. Selama itu, data tidak bisa diubah."
              : isPabrik
                ? "Setelah admin menyetujui, lotmu bisa tayang di Katalog."
                : "Setelah admin menyetujui, akunmu bisa membeli lot yang punya syarat verifikasi."}
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          className="h-12 rounded-[2px] bg-brand px-7 text-[15px] font-medium text-surface transition-colors hover:bg-brand-hover"
        >
          Simpan profil
        </motion.button>
        {!submitted && (
          <button type="button" onClick={() => save(true)} className={`${ghost} h-12 py-0`}>
            Kirim untuk verifikasi
          </button>
        )}
        <div role="status" className="min-h-4 text-[13px] text-text-muted">
          <AnimatePresence mode="wait">
            {note && (
              <motion.span
                key={note}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {note}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
}

export default function ProfilView() {
  const role = useRole();
  const a = useAccount();
  const router = useRouter();
  const saved = useProfil(role ?? "umkm");
  if (!role || !a || saved === undefined) return null; // dijaga RoleGuard, tunggu hidrasi

  return (
    <section aria-label="Profil" className="pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-9 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <h1 className="font-display text-[clamp(34px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">Profil</h1>

            <section aria-label="Akun" className={`${panel} flex flex-wrap items-center gap-4 p-6`}>
              <UserAvatar photoURL={a.photoURL} initials={a.initials} sizeClass="size-14" textClass="text-[16px]" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[20px] tracking-[-0.01em]">{saved?.person || a.name}</p>
                <p className="text-[13px] text-text-muted">
                  {saved?.business ? `${saved.business}, ` : ""}
                  {a.kind}, {a.provider === "google" ? "Masuk dengan Google" : "Akun demo"}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    // Keluar dari Firebase juga bila sesi berasal dari login Google
                    const { signOutFirebase } = await import("../auth/google-auth");
                    await signOutFirebase();
                  } catch {
                    /* sesi dummy: tidak ada yang perlu ditutup di Firebase */
                  }
                  logout();
                  router.push("/");
                }}
                className="rounded-[2px] bg-brand px-[22px] py-3.5 text-[14px] font-medium text-surface transition-colors hover:bg-brand-hover"
              >
                Keluar
              </button>
            </section>

            {role === "admin" ? (
              <p className="text-[14px] leading-[22px] text-text-muted">
                Akun admin tidak punya data usaha. Pemeriksaan akun dan konfirmasi kurir ada di Panel admin.
              </p>
            ) : (
              <ProfilForm key={role} role={role} a={a} saved={saved} />
            )}
          </div>

          <div className="w-full shrink-0 lg:w-[444px] lg:pt-[68px]">
            <Notifikasi key={role} role={role} />
          </div>
        </div>
        <p className="pt-10 text-[12px] text-text-muted">
          Data profil tersimpan di browser ini saja. Notifikasi adalah contoh demo untuk mock up.
        </p>
      </div>
    </section>
  );
}
