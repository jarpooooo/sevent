"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { panel } from "../../components/ui/styles";
import { logout, type Role, ROLE_LABEL, useAccount, useRole } from "../auth/session";
import ProfilForm from "./ProfilForm";
import { useProfil } from "./profil";

/** Isi contoh demo, mengikuti desain Figma "Profil UMKM"; versi pabrik menyesuaikan teksnya. */
const NOTIFS: Record<Role, { t: string; d: string; when: string; unread: boolean }[]> = {
  umkm: [
    { t: "Paket #KN-0192 dikirim", d: "Estimasi tiba 29 Nov.", when: "Baru", unread: true },
    { t: "Pembayaran #KN-0192 berhasil", d: "Pabrik menyiapkan lotmu.", when: "Kemarin", unread: true },
    { t: "Lelang LL-007 berakhir", d: "Kamu belum mengambil lot ini.", when: "2 hari lalu", unread: false },
  ],
  exim: [
    { t: "Pesanan menunggu verifikasi", d: "Periksa klasifikasi dan dokumen pengeluaran.", when: "Baru", unread: true },
    { t: "Dokumen pengeluaran diminta", d: "Pabrik diminta melengkapi dokumen pemasukan.", when: "Kemarin", unread: false },
  ],
  admin: [
    { t: "Verifikasi menunggu", d: "Ada akun yang menunggu pemeriksaan di Panel admin.", when: "Baru", unread: true },
    { t: "Konfirmasi kurir menunggu", d: "Paket terkirim perlu dikonfirmasi lewat kurir.", when: "Kemarin", unread: false },
  ],
  pabrik: [
    { t: "Pesanan #KN-0192 masuk", d: "Siapkan lot Offcut denim polos.", when: "Baru", unread: true },
    { t: "Lot Offcut denim polos tayang", d: "Terlihat oleh UMKM di provinsimu.", when: "Kemarin", unread: true },
    { t: "Pembayaran #KN-0187 masuk", d: "PJP mengabari, siapkan barang.", when: "2 hari lalu", unread: false },
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
  const saved = useProfil(role ?? "umkm");
  if (!role || !a || saved === undefined) return null; // dijaga RoleGuard, tunggu hidrasi

  const onLogout = async () => {
    try {
      // Keluar dari Firebase juga bila sesi berasal dari login Google
      const { signOutFirebase } = await import("../auth/google-auth");
      await signOutFirebase();
    } catch {
      /* sesi dummy: tidak ada yang perlu ditutup di Firebase */
    }
    logout();
    router.push("/");
  };

  return (
    <section aria-label="Profil" className="pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-9 sm:px-10 lg:px-16">
        <ProfilForm key={role} role={role} a={a} saved={saved} notif={<Notifikasi key={role} role={role} />} onLogout={onLogout} />
        <p className="pt-10 text-[12px] text-text-muted">
          Data profil tersimpan di browser ini saja ({ROLE_LABEL[role]}). Notifikasi adalah contoh demo untuk mock up.
        </p>
      </div>
    </section>
  );
}
