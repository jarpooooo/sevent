"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, type Role } from "./session";

const EASE = [0.16, 1, 0.3, 1] as const;
import MosaicLoop from "../../components/mosaic/MosaicLoop";
import { Icon } from "../../components/ui/icons";

type Tab = "masuk" | "daftar";

const KEEPS = [
  { x0: 0, x1: 1, y0: 0, y1: 0.12 }, // logo
  { x0: 0, x1: 1, y0: 0.66, y1: 0.92 }, // tagline: satu baris tile di sekelilingnya ikut tertutup
];

const googleBtn =
  "flex h-14 w-full items-center justify-center gap-3 rounded-[14px] border border-border-strong bg-card text-[17px] font-medium transition-colors hover:bg-brand-soft disabled:opacity-60 md:h-[clamp(44px,6.4svh,56px)]";

export default function MasukView() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("masuk");
  const [role, setRole] = useState<Role>("umkm");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const switchTab = (t: Tab) => {
    setTab(t);
    setNote("");
  };

  // Login dummy: peran yang dipilih disimpan di browser, lalu ke Beranda dengan navbar sesuai peran
  const signIn = () => {
    login(role);
    router.push("/");
  };

  // Login Google sungguhan (Firebase Auth). Peran dibaca dari Firestore; login pertama memakai peran yang dipilih.
  const signInGoogle = async () => {
    setBusy(true);
    setNote("");
    try {
      const { signInWithGoogle } = await import("./google-auth");
      const r = await signInWithGoogle(role);
      login(r.role, { name: r.name, email: r.email });
      router.push("/");
    } catch (e) {
      const { authErrorMessage } = await import("./google-auth");
      setNote(authErrorMessage(e));
      setBusy(false);
    }
  };

  const roles: { id: Role; t: string; d: string }[] = [
    { id: "umkm", t: "UMKM penjahit", d: "Cari dan beli bahan" },
    { id: "pabrik", t: "Pabrik", d: "Jual sisa produksi" },
  ];

  return (
    <main className="relative grid min-h-svh md:h-svh md:min-h-0 md:grid-cols-2 md:overflow-hidden">
        <Link
          href="/"
          className="absolute left-10 top-[30px] z-10 hidden items-center gap-2.5 md:flex"
          aria-label="ClearanceLoop, ke beranda"
        >
          <span aria-hidden="true" className="size-[26px] rounded-full border-[7px] border-brand" />
          <span className="font-display text-[21px] tracking-[-0.03em]">ClearanceLoop</span>
        </Link>
      {/* Foto + mosaik */}
      <div className="relative hidden bg-inverse md:block">
        <Image src="/images/masuk.webp" alt="" fill priority sizes="50vw" className="object-cover" />
        {/* Mosaik menutup dan membuka sendiri, pelan dan tanpa henti (seperti header katalog).
            Zona logo dan tagline selalu tertutup supaya teksnya tetap terbaca. */}
        <MosaicLoop cols={6} rows={8} seed={7} line={1} slow={1.2} keeps={KEEPS} className="absolute inset-0" />
        <p className="font-display absolute bottom-[14%] left-[60px] max-w-[480px] text-[clamp(26px,2.4vw,34px)] leading-[1.12] tracking-[-0.03em]">
          Bahan jelas asalnya. Harga jelas. Status terlihat.
        </p>
      </div>

      {/* Form */}
      <div className="relative flex flex-col px-5 sm:px-10 md:h-full md:items-center md:overflow-y-auto">
        <Link
          href="/"
          className="absolute left-5 top-8 flex items-center gap-2.5 sm:left-10 md:hidden"
          aria-label="ClearanceLoop, ke beranda"
        >
          <span aria-hidden="true" className="size-[26px] rounded-full border-[7px] border-brand" />
          <span className="font-display text-[21px] tracking-[-0.03em]">ClearanceLoop</span>
        </Link>
        <Link
          href="/"
          className="absolute right-5 top-9 flex items-center gap-2 text-[15px] font-medium text-text-muted transition-colors hover:text-text sm:right-10 md:top-10"
        >
          <Icon name="arrow-left" size={16} />
          Kembali ke beranda
        </Link>

        {/* my-auto: konten berada di tengah tinggi layar, dan tetap aman bila layar sangat pendek */}
        <div className="my-auto flex w-full max-w-[440px] flex-col gap-[22px] pb-12 pt-28 md:gap-[clamp(8px,2.1svh,22px)] md:py-[clamp(48px,7.5svh,100px)]">
          <div
            role="tablist"
            aria-label="Masuk atau daftar"
            className="flex w-fit gap-1 rounded-full bg-brand-soft p-1"
          >
            {(["masuk", "daftar"] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => switchTab(t)}
                className={`relative rounded-full px-[26px] py-2.5 text-[15px] font-medium capitalize transition-colors duration-300 md:py-[clamp(7px,1.3svh,10px)] ${
                  tab === t ? "text-on-dark" : "text-text"
                }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="masuk-tab"
                    className="absolute inset-0 rounded-full bg-brand"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              className="flex flex-col gap-[22px] md:gap-[clamp(8px,1.9svh,22px)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            >
              <h1 className="font-display text-[clamp(34px,3.2vw,42px)] leading-[1.1] tracking-[-0.03em] md:text-[clamp(24px,min(3.2vw,4.6svh),42px)]">
                {tab === "masuk" ? "Masuk ke ClearanceLoop" : "Daftar ke ClearanceLoop"}
              </h1>
              <p className="text-[17px] leading-[26px] text-text-muted md:text-[clamp(14px,2.2svh,17px)] md:leading-[1.5] md:[@media(max-height:780px)]:hidden">
                {tab === "masuk"
                  ? "Lanjutkan dengan akun Google yang kamu pakai untuk usahamu."
                  : "Pilih perannya dulu, lalu lanjutkan dengan Google."}
              </p>
            </motion.div>
          </AnimatePresence>

          {tab === "daftar" && (
            <motion.div
              role="radiogroup"
              aria-label="Peran"
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
            >
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={role === r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex flex-1 flex-col items-start gap-1 rounded-[16px] p-[18px] text-left transition-colors md:p-[clamp(12px,2.2svh,18px)] ${
                    role === r.id
                      ? "border-2 border-brand bg-brand-soft"
                      : "border border-border bg-card hover:bg-brand-soft/50"
                  }`}
                >
                  <span className="font-display text-[20px] tracking-[-0.02em] sm:text-[22px]">{r.t}</span>
                  <span className="text-[15px] text-text-muted">{r.d}</span>
                </button>
              ))}
            </motion.div>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            className={googleBtn}
            disabled={busy}
            onClick={signInGoogle}
          >
            <Icon name="google" size={22} />
            {tab === "masuk" ? "Lanjut dengan Google" : "Daftar dengan Google"}
          </motion.button>

          {tab === "masuk" && (
            <fieldset className="flex flex-col gap-2.5">
              <legend className="mb-2.5 text-[14px] font-medium">Masuk sebagai</legend>
              <div role="radiogroup" aria-label="Masuk sebagai" className="flex gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={role === r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex flex-1 flex-col items-start gap-0.5 rounded-[14px] px-4 py-3 text-left transition-colors md:py-[clamp(8px,1.6svh,12px)] ${
                      role === r.id
                        ? "border-2 border-brand bg-brand-soft"
                        : "border border-border bg-card hover:bg-brand-soft/50"
                    }`}
                  >
                    <span className="font-display text-[18px] tracking-[-0.02em]">{r.t}</span>
                    <span className="text-[13px] text-text-muted">Akun demo: {r.id === "umkm" ? "Sari Jahit" : "Pabrik Contoh"}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {tab === "masuk" ? (
            <form
              className="flex flex-col gap-[22px] md:gap-[clamp(8px,1.9svh,22px)]"
              onSubmit={(e) => {
                e.preventDefault();
                signIn();
              }}
            >
              <div className="flex items-center gap-3.5 text-[14px] text-text-muted">
                <span className="h-px flex-1 bg-border-strong" />
                atau
                <span className="h-px flex-1 bg-border-strong" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="m-email" className="text-[14px] font-medium">
                  Email usaha (demo)
                </label>
                <input
                  id="m-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@usahamu.id"
                  className="h-12 w-full rounded-[12px] bg-card px-3.5 text-[16px] outline-none placeholder:text-text-muted focus:ring-2 focus:ring-brand md:h-[clamp(40px,5.6svh,48px)]"
                />
              </div>
              <button
                type="submit"
                className="h-[52px] rounded-full bg-brand text-[16px] font-medium text-on-dark transition-colors hover:bg-brand-hover md:h-[clamp(42px,6svh,52px)]"
              >
                Masuk dengan akun demo
              </button>
            </form>
          ) : (
            <p className="text-[15px] leading-[23px] text-text-muted">
              Setelah daftar, tim kami melakukan verifikasi singkat sebelum akunmu aktif.
            </p>
          )}

          <p role="status" className="min-h-5 text-[14px] text-text-muted">
            <AnimatePresence mode="wait" initial={false}>
              {note && (
                <motion.span
                  key={note}
                  className="inline-block"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {note}
                </motion.span>
              )}
            </AnimatePresence>
          </p>

          <button
            type="button"
            onClick={() => switchTab(tab === "masuk" ? "daftar" : "masuk")}
            className="w-fit text-[15px] font-medium text-brand hover:underline"
          >
            {tab === "masuk" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
          </button>
        </div>
      </div>
    </main>
  );
}
