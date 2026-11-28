"use client";

import { m as motion } from "motion/react";
import { Download, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { panel } from "../../components/ui/styles";
import { buildContext, type DocInput, fileNameOf, type PartyProfile } from "../../lib/documents/context";
import { renderDocx, saveBlob } from "../../lib/documents/render";
import { DOC_SPECS, docsFor } from "../../lib/documents/specs";
import { LOTS } from "../../lib/data/seed/lots";
import type { Order, Role } from "../../lib/domain/types";
import { initialProfil, type Profil, useProfil } from "../akun/profil";
import { ACCOUNTS } from "../auth/session";
import { customsOf, useLotCustomsStore } from "../pabrik/lotdoc";

/** Profil tersimpan, atau data akun demo bila belum pernah disimpan. */
function usePartyProfile(role: Role): PartyProfile | null {
  const saved = useProfil(role);
  return useMemo(() => {
    if (saved === undefined) return null;
    const p: Profil = initialProfil(ACCOUNTS[role], saved);
    return p;
  }, [saved, role]);
}

/** Susun masukan dokumen dari pesanan dan semua data yang tersimpan di browser ini. */
export function useDocInput(order: Order): DocInput | null {
  const seller = usePartyProfile("pabrik");
  const buyer = usePartyProfile("umkm");
  const admin = usePartyProfile("admin");
  const store = useLotCustomsStore();
  return useMemo(() => {
    if (!seller) return null;
    return {
      order,
      lot: LOTS.find((l) => l.slug === order.slug),
      seller,
      buyer,
      // petugas EXIM diambil dari profil pabrik (tanpa akun terpisah)
      exim: seller.pabrik?.eximNama ? { ...seller, person: seller.pabrik.eximNama, jabatan: seller.pabrik.eximJabatan ?? "" } : null,
      admin,
      customs: customsOf(store, order.slug),
      now: new Date(),
    };
  }, [order, seller, buyer, admin, store]);
}

/** Jumlah isian yang masih "Menunggu: ..." di dokumen, supaya pengguna tahu apa yang belum lengkap. */
export function pendingCount(ctx: Record<string, unknown>) {
  let n = 0;
  const walk = (v: unknown) => {
    if (typeof v === "string") {
      if (v.startsWith("Menunggu:") || v.includes(" Menunggu:") || v.includes("/ Menunggu:")) n++;
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(ctx);
  return n;
}

const btn =
  "inline-flex h-10 items-center gap-1.5 rounded-[2px] border border-brand px-4 text-[13px] font-semibold text-brand transition-colors hover:bg-brand-soft disabled:opacity-50";

/**
 * Unduh dokumen pesanan (.docx) sesuai peran. Dokumen dihasilkan dari satu sumber data transaksi.
 * Isian yang belum ada tertulis "Menunggu: ..." atau "Belum diverifikasi", tidak pernah angka karangan.
 */
export default function DokumenMenu({ order, role, title = "Dokumen" }: { order: Order; role: Role; title?: string }) {
  const input = useDocInput(order);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const kinds = docsFor(role);

  const ctxs = useMemo(
    () => (input ? Object.fromEntries(kinds.map((k) => [k, buildContext(k, input)])) : {}),
    [input, kinds],
  );

  if (!input || kinds.length === 0) return null;

  const download = async (kind: (typeof kinds)[number]) => {
    setBusy(kind);
    setErr("");
    try {
      const data = buildContext(kind, { ...input, now: new Date() });
      saveBlob(await renderDocx(kind, data), fileNameOf(DOC_SPECS[kind].prefix, order));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Dokumen gagal dibuat.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section aria-label={title} className={`${panel} flex flex-col gap-4 p-[25px]`}>
      <h2 className="flex items-center gap-2.5 text-[18px] font-medium leading-[22px]">
        <FileText aria-hidden="true" className="size-[18px] shrink-0 text-brand" strokeWidth={1.8} />
        {title}
      </h2>
      <ul className="flex flex-col gap-3">
        {kinds.map((k) => {
          const spec = DOC_SPECS[k];
          const wait = pendingCount(ctxs[k] as Record<string, unknown>);
          return (
            <li key={k} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium leading-[17px]">{spec.title}</p>
                <p className="mt-0.5 text-[12px] leading-[15px] text-text-muted">
                  {spec.desc} {wait > 0 ? `${wait} isian masih menunggu.` : "Semua isian terisi."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dokumen?id=${encodeURIComponent(order.id)}&jenis=${k}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-[2px] bg-brand px-4 text-[13px] font-semibold text-surface transition-colors hover:bg-brand-hover"
                >
                  <Eye aria-hidden="true" className="size-4" strokeWidth={1.9} />
                  Pratinjau
                </Link>
                <motion.button type="button" whileTap={{ scale: 0.97 }} disabled={busy !== null} onClick={() => download(k)} className={btn}>
                  <Download aria-hidden="true" className="size-4" strokeWidth={1.9} />
                  {busy === k ? "Menyiapkan..." : "Unduh .docx"}
                </motion.button>
              </div>
            </li>
          );
        })}
      </ul>
      <p role="alert" className="min-h-4 text-[12px] leading-[15px] text-text-soft">
        {err}
      </p>
      <p className="text-[12px] leading-[15px] text-text-muted">
        Rancangan dokumen internal. Isian yang belum ada tertulis &quot;Menunggu&quot; atau &quot;Belum diverifikasi&quot;, bukan angka karangan.
        Format dan perlakuan kepabeanan dan fiskal perlu divalidasi EXIM pabrik sebelum dipakai di transaksi nyata.
      </p>
    </section>
  );
}
