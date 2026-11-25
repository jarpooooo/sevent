"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;
import MosaicCover from "./MosaicCover";

type Tab = "masuk" | "daftar";
type Role = "umkm" | "pabrik";

const KEEPS = [
  { x0: 0, x1: 1, y0: 0, y1: 0.12 }, // brand
  { x0: 0, x1: 0.8, y0: 0.72, y1: 0.9 }, // tagline
];

const googleBtn =
  "flex h-14 w-full items-center justify-center gap-3 rounded-[14px] border border-[rgba(11,15,12,0.18)] bg-white text-[17px] font-medium transition-colors hover:bg-pale";

export default function MasukView() {
  const [tab, setTab] = useState<Tab>("masuk");
  const [role, setRole] = useState<Role>("umkm");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const switchTab = (t: Tab) => {
    setTab(t);
    setNote("");
  };

  const roles: { id: Role; t: string; d: string }[] = [
    { id: "umkm", t: "UMKM penjahit", d: "Cari dan beli bahan" },
    { id: "pabrik", t: "Pabrik", d: "Jual sisa produksi" },
  ];

  return (
    <main className="grid min-h-svh md:grid-cols-2">
      {/* Foto + mosaik */}
      <div className="relative hidden min-h-[640px] bg-ink md:block">
        <Image src="/images/masuk.png" alt="" fill priority sizes="50vw" className="object-cover" />
        <MosaicCover
          cols={6}
          rows={8}
          openRatio={tab === "masuk" ? 0.55 : 0.42}
          seed={tab === "masuk" ? 7 : 13}
          keeps={KEEPS}
          origin={{ x: 0.5, y: 0.5 }}
          className="absolute inset-0"
        />
        <p className="font-display absolute bottom-[14%] left-[60px] max-w-[480px] text-[clamp(26px,2.4vw,34px)] leading-[1.12] tracking-[-0.03em]">
          Bahan jelas asalnya. Harga jelas. Status terlihat.
        </p>
      </div>

      {/* Form */}
      <div className="relative flex flex-col px-5 pb-12 pt-6 sm:px-10 md:items-center md:justify-start md:pt-[170px]">
        <Link
          href="/"
          className="absolute left-5 top-8 flex items-center gap-2.5 sm:left-10 md:hidden"
          aria-label="ClearanceLoop, ke beranda"
        >
          <span aria-hidden="true" className="size-[26px] rounded-full border-[7px] border-teal" />
          <span className="font-display text-[21px] tracking-[-0.03em]">ClearanceLoop</span>
        </Link>
        <Link
          href="/"
          className="absolute -left-[calc(50vw-40px)] top-[30px] hidden items-center gap-2.5 md:flex"
          aria-label="ClearanceLoop, ke beranda"
        >
          <span aria-hidden="true" className="size-[26px] rounded-full border-[7px] border-teal" />
          <span className="font-display text-[21px] tracking-[-0.03em]">ClearanceLoop</span>
        </Link>
        <Link
          href="/"
          className="absolute right-5 top-9 text-[15px] font-medium text-muted transition-colors hover:text-ink sm:right-10 md:top-10"
        >
          ← Kembali ke beranda
        </Link>

        <div className="mt-24 flex w-full max-w-[440px] flex-col gap-[22px] md:mt-0">
          <div
            role="tablist"
            aria-label="Masuk atau daftar"
            className="flex w-fit gap-1 rounded-full bg-pale p-1"
          >
            {(["masuk", "daftar"] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => switchTab(t)}
                className={`relative rounded-full px-[26px] py-2.5 text-[15px] font-medium capitalize transition-colors duration-300 ${
                  tab === t ? "text-white" : "text-ink"
                }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="masuk-tab"
                    className="absolute inset-0 rounded-full bg-teal"
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
              className="flex flex-col gap-[22px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            >
              <h1 className="font-display text-[clamp(34px,3.2vw,42px)] leading-[1.1] tracking-[-0.03em]">
                {tab === "masuk" ? "Masuk ke ClearanceLoop" : "Daftar ke ClearanceLoop"}
              </h1>
              <p className="text-[17px] leading-[26px] text-muted">
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
                  className={`flex flex-1 flex-col items-start gap-1 rounded-[16px] p-[18px] text-left transition-colors ${
                    role === r.id
                      ? "border-2 border-teal bg-pale"
                      : "border border-[rgba(11,15,12,0.14)] bg-white hover:bg-pale/50"
                  }`}
                >
                  <span className="font-display text-[20px] tracking-[-0.02em] sm:text-[22px]">{r.t}</span>
                  <span className="text-[15px] text-muted">{r.d}</span>
                </button>
              ))}
            </motion.div>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            className={googleBtn}
            onClick={() =>
              setNote("Login Google belum tersambung ke server. Tombol ini masih tampilan (demo).")
            }
          >
            <span aria-hidden="true" className="text-[22px] font-semibold text-[#4285f4]">
              G
            </span>
            {tab === "masuk" ? "Lanjut dengan Google" : "Daftar dengan Google"}
          </motion.button>

          {tab === "masuk" ? (
            <form
              className="flex flex-col gap-[22px]"
              onSubmit={(e) => {
                e.preventDefault();
                setNote(`Tautan masuk untuk ${email} belum dikirim: backend belum tersambung (demo).`);
              }}
            >
              <div className="flex items-center gap-3.5 text-[14px] text-muted">
                <span className="h-px flex-1 bg-[rgba(11,15,12,0.16)]" />
                atau
                <span className="h-px flex-1 bg-[rgba(11,15,12,0.16)]" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="m-email" className="text-[14px] font-medium">
                  Email usaha
                </label>
                <input
                  id="m-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@usahamu.id"
                  className="h-12 w-full rounded-[12px] bg-white px-3.5 text-[16px] outline-none placeholder:text-muted focus:ring-2 focus:ring-teal"
                />
              </div>
              <button
                type="submit"
                className="h-[52px] rounded-full bg-teal text-[16px] font-medium text-white transition-colors hover:bg-[#083f3c]"
              >
                Kirim tautan masuk
              </button>
            </form>
          ) : (
            <p className="text-[15px] leading-[23px] text-muted">
              Setelah daftar, tim kami melakukan verifikasi singkat sebelum akunmu aktif.
            </p>
          )}

          <p role="status" className="min-h-5 text-[14px] text-muted">
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
            className="w-fit text-[15px] font-medium text-teal hover:underline"
          >
            {tab === "masuk" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
          </button>
        </div>
      </div>
    </main>
  );
}
