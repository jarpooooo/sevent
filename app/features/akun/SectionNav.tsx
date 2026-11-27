"use client";

import { useEffect, useState } from "react";
import Glyph from "./Glyph";

export type NavItem = { id: string; label: string; done: number; total: number; seed: number };

/**
 * Daftar isi yang menempel di samping: lompat ke bagian, dengan glyph mozaik kelengkapan tiap bagian.
 * Bagian yang sedang terlihat ditandai (scroll spy).
 */
export default function SectionNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Bagian profil" className="flex flex-col gap-1">
      {items.map((i) => {
        const complete = i.total > 0 && i.done >= i.total;
        return (
          <a
            key={i.id}
            href={`#${i.id}`}
            aria-current={active === i.id ? "location" : undefined}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(i.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              setActive(i.id);
            }}
            className={`flex items-center gap-3 rounded-[2px] px-3 py-2.5 text-[14px] transition-colors ${
              active === i.id ? "bg-brand-soft font-medium" : "hover:bg-brand-soft/50"
            }`}
          >
            <Glyph done={i.done} total={i.total} seed={i.seed} size={5} />
            <span className="min-w-0 flex-1 truncate">{i.label}</span>
            <span className={`text-[12px] tabular-nums ${complete ? "text-brand" : "text-text-muted"}`}>
              {i.done}/{i.total}
              <span className="sr-only"> isian terisi</span>
            </span>
          </a>
        );
      })}
    </nav>
  );
}
