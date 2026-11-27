"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount, useRole } from "../../features/auth/session";
import { KainaraWordmark } from "../brand/KainaraLogo";
import UserAvatar from "../ui/UserAvatar";

// Menu mengikuti peran. Sebelum login mengikuti UMKM; pabrik mendapat menu kerjanya sendiri.
const UMKM_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/pesanan-saya", label: "Pesanan saya" },
  { href: "/alur-kerja", label: "Alur kerja" },
  { href: "/kontak", label: "Kontak" },
];
const PABRIK_LINKS = [
  { href: "/lot-saya", label: "Lot saya" },
  { href: "/pesanan-masuk", label: "Pesanan masuk" },
  { href: "/tagihan-komisi", label: "Tagihan komisi" },
  { href: "/kontak", label: "Kontak" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const role = useRole();
  const links = role === "pabrik" ? PABRIK_LINKS : UMKM_LINKS;
  const account = useAccount();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto grid h-[72px] max-w-[1440px] grid-cols-[1fr_auto] items-center px-4 md:px-10 lg:grid-cols-[1fr_auto_1fr]"
      >
        <Link href="/" className="flex w-fit items-center py-1" aria-label="Kainara, ke beranda">
          <KainaraWordmark className="h-[26px] w-auto" />
        </Link>

        <ul className="hidden gap-6 text-[14px] font-medium lg:flex xl:gap-8">
          {links.map((l) => {
            // Halaman detail lot (/katalog/xxx) tetap menandai "Katalog" sebagai menu aktif
            const current = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={current ? "page" : undefined}
                  className={`relative block pb-1 transition-opacity hover:opacity-60 ${current ? "font-semibold" : ""}`}
                >
                  {l.label}
                  {current && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-brand"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-end gap-2">
          {account ? (
            <Link
              href="/profil"
              aria-label={`Profil: ${account.name}, ${account.kind}`}
              className="flex items-center gap-2.5 rounded-full py-1 pr-1 lg:pr-3"
            >
              <UserAvatar
                photoURL={account.photoURL}
                initials={account.initials}
                sizeClass="size-9"
                textClass="text-[13px]"
              />
              <span className="hidden whitespace-nowrap text-[13px] font-medium lg:block">{account.name}</span>
              <span
                className={`hidden rounded-full px-2.5 py-[3px] text-[12px] font-medium leading-[15px] lg:block ${
                  role === "pabrik" ? "bg-warn-soft text-text" : "bg-brand-soft text-brand"
                }`}
              >
                {role === "pabrik" ? "Pabrik" : "UMKM"}
              </span>
            </Link>
          ) : (
            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                href="/masuk"
                className="block rounded-[2px] bg-brand px-5 py-3 text-[14px] font-medium text-on-dark transition-colors hover:bg-brand-hover"
              >
                Masuk
              </Link>
            </motion.div>
          )}
          <button
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
            className="relative size-11 rounded-[2px] bg-brand lg:hidden"
          >
            <motion.span
              className="absolute left-[13px] top-[21px] h-[2px] w-[18px] bg-card"
              initial={false}
              animate={{ y: open ? 0 : -5, rotate: open ? 45 : 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
            <motion.span
              className="absolute left-[13px] top-[21px] h-[2px] w-[18px] bg-card"
              initial={false}
              animate={{ y: open ? 0 : 5, rotate: open ? -45 : 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="menu-mobile"
            key="menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden border-t border-border bg-surface lg:hidden"
          >
            <div className="px-4 pb-5 pt-3">
              <ul className="flex flex-col text-[18px]">
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.08 + i * 0.05 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="font-display block border-b border-border py-3"
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
