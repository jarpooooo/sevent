"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { panel } from "../../components/ui/styles";
import { logout, type Role, useAccount, useRole } from "../auth/session";

const EASE = [0.16, 1, 0.3, 1] as const;
const ghost =
  "rounded-[10px] border border-border-strong px-[22px] py-3.5 text-[14px] font-medium transition-colors hover:bg-brand-soft";

const STEPS = ["Identitas", "Bukti usaha", "Cek admin", "Aktif"];

/** Isi contoh demo, mengikuti desain Figma "Profil UMKM"; versi pabrik menyesuaikan teksnya. */
const NOTIFS: Record<Role, { t: string; d: string; when: string; unread: boolean }[]> = {
  umkm: [
    { t: "Paket #CL-0192 dikirim", d: "Estimasi tiba 29 Nov.", when: "Baru", unread: true },
    { t: "Pembayaran #CL-0192 diterima", d: "Dana ditahan PJP.", when: "Kemarin", unread: true },
    { t: "Lelang LL-007 berakhir", d: "Kamu belum mengambil lot ini.", when: "2 hari lalu", unread: false },
    { t: "Akun terverifikasi", d: "Kamu bisa membeli di Katalog.", when: "5 hari lalu", unread: false },
  ],
  pabrik: [
    { t: "Pesanan #CL-0192 masuk", d: "Siapkan lot Offcut denim polos.", when: "Baru", unread: true },
    { t: "Lot Offcut denim polos tayang", d: "Terlihat oleh UMKM di provinsimu.", when: "Kemarin", unread: true },
    { t: "Dana #CL-0187 diteruskan", d: "Rp980.000 untuk pabrik.", when: "2 hari lalu", unread: false },
    { t: "Akun terverifikasi", d: "Lotmu bisa tayang di Katalog.", when: "5 hari lalu", unread: false },
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

export default function ProfilView() {
  const role = useRole();
  const a = useAccount();
  const router = useRouter();
  const [note, setNote] = useState("");
  if (!role || !a) return null; // dijaga RoleGuard

  const isPabrik = role === "pabrik";

  const rows = (list: [string, string][]) =>
    list.map(([k, v]) => (
      <div key={k} className="flex items-center justify-between gap-4 text-[14px]">
        <dt className="text-text-muted">{k}</dt>
        <dd className="text-right font-medium">{v}</dd>
      </div>
    ));

  return (
    <section aria-label="Profil" className="pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-9 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <h1 className="font-display text-[clamp(34px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">Profil</h1>

            <section aria-label="Akun" className={`${panel} flex flex-col gap-4 p-6`}>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex size-14 items-center justify-center rounded-full bg-brand text-[16px] font-medium text-surface">
                  {a.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[20px] tracking-[-0.01em]">{a.name}</p>
                  <p className="text-[13px] text-text-muted">{a.kind}</p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    className={ghost}
                    onClick={() => setNote("Demo: ubah data akun belum tersambung ke server.")}
                  >
                    Ubah
                  </button>
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
                    className="rounded-[10px] bg-brand px-[22px] py-3.5 text-[14px] font-medium text-surface transition-colors hover:bg-brand-hover"
                  >
                    Keluar
                  </button>
                </div>
              </div>
              <dl className="flex flex-col gap-4">
                {rows([
                  ["Email", a.email],
                  ["WhatsApp", a.whatsapp],
                ])}
              </dl>
              <div role="status" className="min-h-4 text-[12px] text-text-muted">
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
            </section>

            <section aria-label="Verifikasi usaha" className={`${panel} flex flex-col gap-4 p-6`}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[18px] font-medium">Verifikasi usaha</h2>
                <span className="rounded-full bg-brand-soft px-3 py-1.5 text-[13px] font-medium text-brand">
                  Terverifikasi
                </span>
              </div>
              <ol className="grid grid-cols-4 gap-1.5">
                {STEPS.map((s) => (
                  <li key={s} className="flex flex-col gap-2">
                    <span aria-hidden="true" className="block h-2.5 bg-brand" />
                    <span className="text-[13px] font-medium">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="text-[13px] text-text-muted">
                {isPabrik
                  ? "Terverifikasi: lotmu bisa tayang di Katalog dan Lelang nasional."
                  : "Terverifikasi: akunmu bisa membeli di Katalog dan Lelang nasional."}
              </p>
            </section>

            <section
              aria-label={isPabrik ? "Alamat pabrik" : "Alamat penerima"}
              className={`${panel} flex flex-col gap-3.5 p-6`}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[18px] font-medium">{isPabrik ? "Alamat pabrik" : "Alamat penerima"}</h2>
                <button
                  type="button"
                  className={ghost}
                  onClick={() => setNote("Demo: ubah alamat belum tersambung ke server.")}
                >
                  Ubah alamat
                </button>
              </div>
              <dl className="flex flex-col gap-3.5">
                {rows([
                  ["Alamat", a.address],
                  ["Provinsi", a.province],
                ])}
              </dl>
              <p className="max-w-[496px] text-[12px] leading-[18px] text-text-muted">
                {isPabrik
                  ? "Provinsi menentukan UMKM mana yang melihat lotmu di Katalog regional."
                  : "Provinsi menentukan lot yang tampil di Katalog regional. Untuk pindah provinsi, hubungi kami."}
              </p>
            </section>
          </div>

          <div className="w-full shrink-0 lg:w-[444px] lg:pt-[68px]">
            <Notifikasi key={role} role={role} />
          </div>
        </div>
        <p className="pt-10 text-[12px] text-text-muted">
          Data akun, alamat, dan notifikasi adalah contoh demo untuk mock up.
        </p>
      </div>
    </section>
  );
}
