"use client";

import { Factory, LayoutDashboard, LogOut, PackageCheck, Store, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KainaraWordmark } from "../../components/brand/KainaraLogo";
import UserAvatar from "../../components/ui/UserAvatar";
import { logout, useAccount } from "../auth/session";
import { useAkun, usePesanan, vstatus } from "./data";

const NAV: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/admin", label: "Ringkasan", Icon: LayoutDashboard },
  { href: "/admin/umkm", label: "UMKM", Icon: Store },
  { href: "/admin/pabrik", label: "Pabrik", Icon: Factory },
  { href: "/admin/pesanan", label: "Pesanan", Icon: PackageCheck },
];

/** Kerangka dashboard admin: sidebar kiri (tanpa navbar atas), dan konten di kanan. */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const a = useAccount();
  const umkm = useAkun("umkm");
  const pabrik = useAkun("pabrik");
  const pesanan = usePesanan();

  const count = (href: string) =>
    href === "/admin/umkm"
      ? umkm.filter((x) => vstatus(x.p) === "menunggu").length
      : href === "/admin/pabrik"
        ? pabrik.filter((x) => vstatus(x.p) === "menunggu").length
        : href === "/admin/pesanan"
          ? pesanan.filter(({ o, sample }) => !sample && o.pickup === "kirim" && o.status === 3).length
          : 0;
  const queue = NAV.reduce((n, i) => n + count(i.href), 0);

  const out = () => {
    logout();
    router.push("/masuk");
  };

  const links = NAV.map((i) => {
    const active = i.href === "/admin" ? path === "/admin" : path === i.href || path.startsWith(`${i.href}/`);
    const c = count(i.href);
    return (
      <Link
        key={i.href}
        href={i.href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-[2px] px-3 py-2.5 text-[14px] transition-colors ${active ? "bg-brand-soft font-medium" : "hover:bg-brand-soft/50"}`}
      >
        <i.Icon aria-hidden="true" className={`size-[18px] shrink-0 ${active ? "text-brand" : "text-text-muted"}`} strokeWidth={1.8} />
        <span className="flex-1">{i.label}</span>
        {c > 0 && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[12px] font-medium tabular-nums text-text">
            {c}
            <span className="sr-only"> menunggu</span>
          </span>
        )}
      </Link>
    );
  });

  return (
    <div className="min-h-svh overflow-x-clip bg-surface lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Sidebar desktop */}
      <aside className="hidden border-r border-line bg-surface lg:flex lg:h-svh lg:flex-col lg:justify-between lg:gap-8 lg:px-4 lg:py-6 lg:sticky lg:top-0">
        <div className="flex flex-col gap-8">
          <Link href="/admin" aria-label="Kainara, ringkasan admin" className="px-3">
            <KainaraWordmark className="h-[26px] w-auto" />
          </Link>
          <nav aria-label="Menu admin" className="flex flex-col gap-1">
            {links}
          </nav>
        </div>

        <div className="flex flex-col gap-5">
          <p className="px-3 text-[12px] leading-4 text-text-muted">
            {queue > 0 ? (
              <>
                <span className="font-medium text-text tabular-nums">{queue}</span> hal menunggu tindakan
              </>
            ) : (
              "Antrean kosong"
            )}
          </p>
          <div className="flex items-center gap-3 border-t border-line px-3 pt-4">
            <UserAvatar photoURL={a?.photoURL} initials={a?.initials ?? "AK"} sizeClass="size-9" textClass="text-[13px]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{a?.name ?? "Admin Kainara"}</p>
              <button type="button" onClick={out} className="flex items-center gap-1 text-[12px] text-text-muted hover:text-text">
                <LogOut aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Bar atas ringkas untuk layar kecil */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" aria-label="Kainara, ringkasan admin">
            <KainaraWordmark className="h-[22px] w-auto" />
          </Link>
          <button type="button" onClick={out} className="text-[13px] text-text-muted underline underline-offset-4">
            Keluar
          </button>
        </div>
        <nav aria-label="Menu admin" className="flex w-full max-w-full gap-1 overflow-x-auto px-3 pb-2 [&>a]:shrink-0">
          {links}
        </nav>
      </header>

      <main className="min-w-0 px-5 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-10">{children}</main>
    </div>
  );
}
