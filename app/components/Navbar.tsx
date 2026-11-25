"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/alur-kerja", label: "Alur kerja" },
  { href: "/kontak", label: "Kontak" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-bg">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 md:px-10"
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="ClearanceLoop, ke beranda">
          <Image src="/images/mark.svg" alt="" width={36} height={36} priority />
          <span className="font-display text-[20px] tracking-[-0.02em]">ClearanceLoop</span>
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 gap-8 text-[14px] font-medium md:flex">
          {LINKS.map((l) => {
            const current = pathname === l.href;
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
                      className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-teal"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.97 }} className="hidden sm:block">
            <Link
              href="/kontak"
              className="block rounded-[2px] bg-teal px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#083f3c]"
            >
              Bicara dengan kami
            </Link>
          </motion.div>
          <button
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
            className="relative size-11 rounded-[2px] bg-teal md:hidden"
          >
            <motion.span
              className="absolute left-[13px] top-[21px] h-[2px] w-[18px] bg-white"
              initial={false}
              animate={{ y: open ? 0 : -5, rotate: open ? 45 : 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
            <motion.span
              className="absolute left-[13px] top-[21px] h-[2px] w-[18px] bg-white"
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
            className="overflow-hidden border-t border-[var(--line)] bg-bg md:hidden"
          >
            <div className="px-4 pb-5 pt-3">
              <ul className="flex flex-col text-[18px]">
                {LINKS.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.08 + i * 0.05 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="font-display block border-b border-[var(--line)] py-3"
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <Link
                href="/kontak"
                onClick={() => setOpen(false)}
                className="mt-4 block rounded-[2px] bg-teal px-5 py-3 text-center text-[14px] font-medium text-white sm:hidden"
              >
                Bicara dengan kami
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
