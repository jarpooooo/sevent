"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { KainaraWordmark } from "../../components/brand/KainaraLogo";
import MosaicLoop from "../../components/mosaic/MosaicLoop";
import { Icon } from "../../components/ui/icons";
import { PENDING_ROLE_KEY } from "./google-auth-keys";
import { login, type Role, useAccount } from "./session";

const EASE = [0.2, 0, 0, 1] as const;

const KEEPS = [
  { x0: 0, x1: 1, y0: 0, y1: 0.12 }, // logo
  { x0: 0, x1: 1, y0: 0.66, y1: 0.92 }, // tagline: satu baris tile di sekelilingnya ikut tertutup
];

const googleBtn =
  "flex h-14 w-full items-center justify-center gap-3 rounded-[2px] border border-border-strong bg-card text-[16px] font-medium transition-colors hover:bg-brand-soft disabled:opacity-60 md:h-[clamp(44px,6.2svh,54px)]";

type Tab = "masuk" | "daftar";

export default function MasukView() {
  const router = useRouter();
  const account = useAccount();
  const [tab, setTab] = useState<Tab>("masuk");
  const [role, setRole] = useState<Role>("umkm");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  // Selesaikan alur login Google bila browser sebelumnya dialihkan lewat redirect (mis. pop-up diblokir).
  useEffect(() => {
    if (!window.sessionStorage.getItem(PENDING_ROLE_KEY)) return;
    let active = true;
    (async () => {
      try {
        const { completeGoogleRedirect } = await import("./google-auth");
        if (!active) return;
        setBusy(true);
        const r = await completeGoogleRedirect();
        if (!active) return;
        if (r) {
          login(r.role, {
            uid: r.uid,
            name: r.name,
            email: r.email,
            photoURL: r.photoURL,
            provider: "google",
          });
          router.push("/");
          return;
        }
        setBusy(false);
      } catch (e) {
        if (!active) return;
        const { authErrorMessage } = await import("./google-auth");
        setNote(authErrorMessage(e));
        setBusy(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setNote("");
  };

  // Login demo lokal: peran yang dipilih disimpan di browser, lalu ke Beranda dengan navbar sesuai peran.
  const signInDemo = () => {
    login(role, { provider: "demo" });
    router.push("/");
  };

  // Akun admin hanya ada sebagai akun demo (tidak lewat Google): memverifikasi UMKM dan mengonfirmasi kurir.
  const signInAdmin = () => {
    login("admin", { provider: "demo" });
    router.push("/admin");
  };

  // EXIM pabrik: memeriksa persyaratan pengeluaran barang. Juga hanya akun demo.
  const signInExim = () => {
    login("exim", { provider: "demo" });
    router.push("/exim");
  };

  // Login Google sungguhan (Firebase Auth + Firestore users/{uid}).
  const signInGoogle = async () => {
    setBusy(true);
    setNote("");
    try {
      const { signInWithGoogle } = await import("./google-auth");
      const r = await signInWithGoogle(role);
      if (!r) {
        setNote("Mengalihkan ke halaman masuk Google...");
        return;
      }
      login(r.role, {
        uid: r.uid,
        name: r.name,
        email: r.email,
        photoURL: r.photoURL,
        provider: "google",
      });
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
        className="absolute left-10 top-[30px] z-10 hidden items-center md:flex"
        aria-label="Kainara, ke beranda"
      >
        <KainaraWordmark className="h-[26px] w-auto" />
      </Link>

      {/* Foto + mosaik */}
      <div className="relative hidden bg-inverse md:block">
        <Image src="/images/masuk.webp" alt="" fill priority sizes="50vw" className="object-cover" />
        <MosaicLoop cols={6} rows={8} seed={7} line={1} slow={1.2} keeps={KEEPS} className="absolute inset-0" />
        <p className="font-display absolute bottom-[14%] left-[60px] max-w-[480px] text-[clamp(26px,2.4vw,34px)] leading-[1.12] tracking-[-0.03em]">
          Bahan jelas asalnya. Harga jelas. Status terlihat.
        </p>
      </div>

      {/* Form */}
      <div className="relative flex flex-col px-5 sm:px-10 md:h-full md:items-center md:overflow-y-auto">
        <Link
          href="/"
          className="absolute left-5 top-8 flex items-center sm:left-10 md:hidden"
          aria-label="Kainara, ke beranda"
        >
          <KainaraWordmark className="h-[24px] w-auto" />
        </Link>
        <Link
          href="/"
          className="absolute right-5 top-9 flex items-center gap-2 text-[15px] font-medium text-text-muted transition-colors hover:text-text sm:right-10 md:top-10"
        >
          <Icon name="arrow-left" size={16} />
          Kembali ke beranda
        </Link>

        {/* my-auto: konten berada di tengah tinggi layar, dan tetap aman bila layar sangat pendek */}
        <div className="my-auto flex w-full max-w-[440px] flex-col gap-5 pb-12 pt-28 md:gap-[clamp(10px,2svh,20px)] md:py-[clamp(48px,7svh,96px)]">
          {account && (
            <div className="flex items-center justify-between gap-3 rounded-[2px] border border-border bg-brand-soft px-4 py-3 text-[13px]">
              <span className="min-w-0 truncate text-text">
                Sudah masuk sebagai <strong>{account.name}</strong> ({account.role === "umkm" ? "UMKM" : "Pabrik"})
              </span>
              <Link href="/profil" className="shrink-0 font-medium text-brand underline underline-offset-4">
                Profil
              </Link>
            </div>
          )}

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
                className={`relative rounded-full px-[26px] py-2.5 text-[15px] font-medium capitalize transition-colors duration-200 md:py-[clamp(7px,1.3svh,10px)] ${
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
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
            >
              <h1 className="font-display text-[clamp(32px,3vw,40px)] leading-[1.1] tracking-[-0.03em] md:text-[clamp(24px,min(3vw,4.4svh),40px)]">
                {tab === "masuk" ? "Masuk ke Kainara" : "Daftar ke Kainara"}
              </h1>
              <p className="text-[16px] leading-6 text-text-muted md:text-[clamp(14px,2svh,16px)] md:[@media(max-height:760px)]:hidden">
                {tab === "masuk"
                  ? "Pilih peranmu lalu masuk dengan akun Google yang dipakai usahamu."
                  : "Pilih peran usahamu dulu, lalu lanjutkan pendaftaran dengan Google."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Pemilih peran tampil di atas tombol Google di kedua tab supaya pilihan peran selalu jelas */}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-[14px] font-medium">
              {tab === "masuk" ? "Masuk sebagai" : "Daftar sebagai"}
            </legend>
            <div role="radiogroup" aria-label="Pilih peran" className="flex gap-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={role === r.id}
                  disabled={busy}
                  onClick={() => setRole(r.id)}
                  className={`flex flex-1 flex-col items-start gap-0.5 rounded-[2px] px-4 py-3 text-left transition-colors md:py-[clamp(8px,1.6svh,13px)] ${
                    role === r.id
                      ? "border-2 border-brand bg-brand-soft"
                      : "border border-border bg-card hover:bg-brand-soft/50"
                  }`}
                >
                  <span className="font-display text-[18px] tracking-[-0.02em] sm:text-[19px]">{r.t}</span>
                  <span className="text-[13px] text-text-muted">{r.d}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <motion.button
              type="button"
              whileTap={busy ? undefined : { scale: 0.96 }}
              className={googleBtn}
              disabled={busy}
              aria-busy={busy}
              onClick={signInGoogle}
            >
              <Icon name="google" size={20} />
              <span>
                {busy
                  ? "Menghubungkan ke Google..."
                  : tab === "masuk"
                    ? "Lanjut dengan Google"
                    : "Daftar dengan Google"}
              </span>
            </motion.button>
            <p className="text-[12px] leading-[1.45] text-text-muted">
              Akun Google baru otomatis memakai peran terpilih. Akun lama mengikuti peran yang sudah tersimpan.
            </p>
          </div>

          {tab === "masuk" ? (
            <form
              className="flex flex-col gap-4 md:gap-[clamp(8px,1.7svh,16px)]"
              onSubmit={(e) => {
                e.preventDefault();
                signInDemo();
              }}
            >
              <div className="flex items-center gap-3.5 text-[13px] text-text-muted">
                <span className="h-px flex-1 bg-border-strong" />
                atau coba tanpa akun Google
                <span className="h-px flex-1 bg-border-strong" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="m-email" className="text-[14px] font-medium">
                  Email usaha (demo)
                </label>
                <input
                  id="m-email"
                  type="email"
                  disabled={busy}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@usahamu.id"
                  className="h-12 w-full rounded-[2px] border border-border bg-card px-3.5 text-[15px] outline-none placeholder:text-text-muted focus:border-brand md:h-[clamp(40px,5.4svh,46px)]"
                />
              </div>
              <motion.button
                type="submit"
                disabled={busy}
                whileTap={busy ? undefined : { scale: 0.96 }}
                className="h-[50px] rounded-full bg-brand text-[15px] font-medium text-on-dark transition-colors hover:bg-brand-hover disabled:opacity-60 md:h-[clamp(42px,5.6svh,50px)]"
              >
                Masuk dengan akun demo ({role === "pabrik" ? "Pabrik Contoh" : "Sari Jahit"})
              </motion.button>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={signInAdmin}
                  className="text-[13px] font-medium text-brand underline underline-offset-4 hover:text-brand-hover"
                >
                  Masuk sebagai admin (demo)
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={signInExim}
                  className="text-[13px] font-medium text-brand underline underline-offset-4 hover:text-brand-hover"
                >
                  Masuk sebagai EXIM (demo)
                </button>
              </div>
            </form>
          ) : (
            <p className="text-[14px] leading-[22px] text-text-muted">
              Setelah daftar dengan Google, tim kami melakukan verifikasi singkat sebelum akunmu aktif bertransaksi.
            </p>
          )}

          <p role="status" aria-live="polite" className="min-h-5 text-[14px] text-text-soft">
            <AnimatePresence mode="wait" initial={false}>
              {note && (
                <motion.span
                  key={note}
                  className="inline-block"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  {note}
                </motion.span>
              )}
            </AnimatePresence>
          </p>

          <button
            type="button"
            disabled={busy}
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
