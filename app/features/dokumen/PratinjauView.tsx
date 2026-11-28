"use client";

import { m as motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";
import { panel } from "../../components/ui/styles";
import { buildContext, fileNameOf } from "../../lib/documents/context";
import { renderDocx, saveBlob } from "../../lib/documents/render";
import { DOC_SPECS, type DocKind, docsFor } from "../../lib/documents/specs";
import type { Order, Role } from "../../lib/domain/types";
import { useRole } from "../auth/session";
import { useOrder } from "../umkm/pesanan/orders";
import { pendingCount, useDocInput } from "./DokumenMenu";

const EASE = [0.16, 1, 0.3, 1] as const;
const ZOOMS = [0.4, 0.5, 0.6, 0.75, 0.9, 1, 1.15, 1.25, 1.5, 1.75, 2];
const zbtn =
  "grid h-9 min-w-9 place-items-center rounded-[2px] border border-border-strong px-2.5 text-[14px] font-medium transition-colors hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-40";
const btn =
  "h-11 rounded-[2px] px-5 text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

/** Halaman asal sesuai peran, supaya tombol kembali selalu ke konteks yang benar. */
function backOf(role: Role, id: string): { href: string; label: string } {
  const q = encodeURIComponent(id);
  if (role === "umkm") return { href: `/pesanan-saya/detail?id=${q}`, label: "Kembali ke detail pesanan" };
  if (role === "pabrik") return { href: `/pesanan-masuk/detail?id=${q}`, label: "Kembali ke detail pesanan" };
  return { href: "/admin", label: "Kembali ke panel admin" };
}

/** Ubin yang menyala bergantian selagi dokumen disusun, sama seperti bahasa mozaik di layar lain. */
function Memuat() {
  const reduce = useSafeReducedMotion();
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 py-24">
      <div aria-hidden="true" className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 12 }, (_, i) => (
          <motion.span
            key={i}
            className="block size-6 rounded-[2px] bg-brand"
            initial={{ opacity: 0.15 }}
            animate={reduce ? { opacity: 0.4 } : { opacity: [0.15, 0.9, 0.15] }}
            transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: ((i * 7) % 12) * 0.1 }}
          />
        ))}
      </div>
      <p className="text-[14px] text-text-muted">Menyusun dokumen...</p>
    </div>
  );
}

function Preview({ order, role, kind }: { order: Order; role: Role; kind: DocKind }) {
  const input = useDocInput(order);
  const reduce = useSafeReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const blobRef = useRef<Blob | null>(null);
  const [state, setState] = useState<"memuat" | "siap" | "gagal">("memuat");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<"docx" | "pdf" | null>(null);
  const [zoom, setZoom] = useState(1);
  const area = useRef<HTMLDivElement>(null);
  const natural = useRef(0); // lebar halaman pada zoom 100%, diukur saat dokumen siap
  const spec = DOC_SPECS[kind];

  const waiting = useMemo(() => {
    if (!input) return 0;
    return pendingCount(buildContext(kind, input));
  }, [input, kind]);

  // Susun .docx dari data tersimpan, lalu tampilkan sebagai halaman di layar.
  useEffect(() => {
    if (!input || !host.current) return;
    let live = true;
    setState("memuat");
    (async () => {
      try {
        const blob = await renderDocx(kind, buildContext(kind, { ...input, now: new Date() }));
        const { renderAsync } = await import("docx-preview");
        if (!live || !host.current) return;
        host.current.innerHTML = "";
        await renderAsync(blob, host.current, undefined, {
          className: "docx",
          inWrapper: true,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          useBase64URL: true,
        });
        if (!live) return;
        blobRef.current = blob;
        setState("siap");
      } catch (e) {
        if (!live) return;
        setErr(e instanceof Error ? e.message : "Dokumen gagal ditampilkan.");
        setState("gagal");
      }
    })();
    return () => {
      live = false;
    };
  }, [input, kind]);

  const step = (dir: 1 | -1) => {
    setZoom((z) => {
      const i = ZOOMS.findIndex((v) => Math.abs(v - z) < 0.011);
      if (i >= 0) return ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, i + dir))];
      // dari nilai "pas lebar": ke langkah terdekat di arah yang diminta
      return dir > 0 ? (ZOOMS.find((v) => v > z) ?? ZOOMS[ZOOMS.length - 1]) : ([...ZOOMS].reverse().find((v) => v < z) ?? ZOOMS[0]);
    });
  };
  const fit = () => {
    if (!natural.current || !area.current) return;
    const inner = area.current.clientWidth - 32; // ruang dalam kotak, dikurangi padding
    setZoom(Math.min(2, Math.max(0.4, Math.floor((inner / natural.current) * 100) / 100)));
  };

  // Layar sempit: mulai dari pas lebar supaya satu halaman langsung terbaca utuh.
  useEffect(() => {
    if (state !== "siap" || !area.current) return;
    const page = host.current?.querySelector<HTMLElement>("section.docx");
    if (!page) return;
    natural.current = page.offsetWidth;
    const inner = area.current.clientWidth - 32;
    if (inner < natural.current) setZoom(Math.max(0.4, Math.floor((inner / natural.current) * 100) / 100));
  }, [state]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "+" || e.key === "=") step(1);
    else if (e.key === "-" || e.key === "_") step(-1);
    else if (e.key === "0") setZoom(1);
    else return;
    e.preventDefault();
  };

  const downloadDocx = () => {
    if (!blobRef.current) return;
    setBusy("docx");
    saveBlob(blobRef.current, fileNameOf(spec.prefix, order));
    setBusy(null);
  };

  // PDF dibuat dari halaman pratinjau: tiap halaman difoto lalu disusun ulang menjadi PDF dengan ukuran halaman yang sama.
  const downloadPdf = async () => {
    const pages = Array.from(host.current?.querySelectorAll<HTMLElement>("section.docx") ?? []);
    if (!pages.length) return;
    setBusy("pdf");
    setErr("");
    const prevZoom = host.current ? host.current.style.zoom : "";
    if (host.current) host.current.style.zoom = "1"; // foto halaman selalu pada ukuran aslinya, apa pun zoom layar
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
      let pdf: InstanceType<typeof jsPDF> | null = null;
      for (let i = 0; i < pages.length; i++) {
        const r = pages[i].getBoundingClientRect();
        const w = r.width * 0.75; // px ke pt
        const h = r.height * 0.75;
        const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: "#ffffff", useCORS: true });
        const img = canvas.toDataURL("image/jpeg", 0.92);
        const orient = w > h ? "l" : "p";
        if (!pdf) pdf = new jsPDF({ unit: "pt", format: [w, h], orientation: orient });
        else pdf.addPage([w, h], orient);
        pdf.addImage(img, "JPEG", 0, 0, w, h);
      }
      pdf?.save(fileNameOf(spec.prefix, order).replace(/\.docx$/, ".pdf"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "PDF gagal dibuat.");
    } finally {
      if (host.current) host.current.style.zoom = prevZoom;
      setBusy(null);
    }
  };

  const kinds = docsFor(role);
  const back = backOf(role, order.id);

  return (
    <section aria-label={`Pratinjau ${spec.title}`} className="pt-[72px]">
      <style>{`
        .dok-host .docx-wrapper{background:transparent!important;padding:0!important;align-items:flex-start}
        .dok-host section.docx{box-shadow:0 0 0 1px rgba(11,15,12,.15)!important;margin-bottom:20px!important;max-width:none}
      `}</style>
      <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-9 sm:px-10 lg:px-16">
        <Link href={back.href} className="text-[13px] font-medium text-brand underline underline-offset-4 hover:text-brand-hover">
          {back.label}
        </Link>
        <header className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2.5">
            <h1 className="font-display text-[clamp(32px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">{spec.title}</h1>
            <p className="max-w-[640px] text-[15px] leading-[22px] text-text-muted">
              Pesanan #{order.id}. {spec.desc}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={downloadDocx} disabled={state !== "siap" || busy !== null} className={`${btn} border border-brand text-brand hover:bg-brand-soft`}>
              Unduh DOCX
            </button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={downloadPdf}
              disabled={state !== "siap" || busy !== null}
              className={`${btn} bg-brand text-surface hover:bg-brand-hover`}
            >
              {busy === "pdf" ? "Menyiapkan PDF..." : "Unduh PDF"}
            </motion.button>
          </div>
        </header>

        {kinds.length > 1 && (
          <nav aria-label="Pilih dokumen" className="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-b border-line">
            {kinds.map((k) => (
              <Link
                key={k}
                href={`/dokumen?id=${encodeURIComponent(order.id)}&jenis=${k}`}
                aria-current={k === kind ? "page" : undefined}
                className={`-mb-px border-b-2 py-3 text-[14px] transition-colors ${
                  k === kind ? "border-brand font-medium text-text" : "border-transparent text-text-muted hover:text-text"
                }`}
              >
                {DOC_SPECS[k].title}
              </Link>
            ))}
          </nav>
        )}

        <p className={`${panel} mt-6 px-4 py-3 text-[13px] leading-5 ${waiting > 0 ? "bg-warn-soft" : ""}`}>
          {waiting > 0
            ? `${waiting} isian masih "Menunggu" pihak yang mengisinya. Dokumen ini berubah otomatis setelah datanya dilengkapi.`
            : "Semua isian terisi."}{" "}
          Format dan perlakuan kepabeanan dan fiskal perlu divalidasi EXIM pabrik sebelum dipakai di transaksi nyata.
        </p>

        <div role="group" aria-label="Zoom pratinjau" className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[13px] text-text-muted">Zoom</span>
          <button type="button" aria-label="Perkecil" onClick={() => step(-1)} disabled={state !== "siap" || zoom <= ZOOMS[0]} className={zbtn}>
            &minus;
          </button>
          <output aria-live="polite" className="min-w-[52px] text-center text-[14px] font-medium tabular-nums">
            {Math.round(zoom * 100)}%
          </output>
          <button type="button" aria-label="Perbesar" onClick={() => step(1)} disabled={state !== "siap" || zoom >= ZOOMS[ZOOMS.length - 1]} className={zbtn}>
            +
          </button>
          <button type="button" onClick={() => setZoom(1)} disabled={state !== "siap"} className={zbtn}>
            100%
          </button>
          <button type="button" onClick={fit} disabled={state !== "siap"} className={zbtn}>
            Pas lebar
          </button>
          <span className="hidden text-[12px] text-text-muted sm:inline">Tombol + dan - juga bisa dipakai saat halaman dokumen terfokus.</span>
        </div>

        <div
          ref={area}
          className="mt-3 overflow-auto rounded-[2px] border border-line bg-surface/40 p-4 sm:p-6"
          style={{ maxHeight: "calc(100svh - 160px)" }}
          role="region"
          aria-label="Halaman dokumen"
          tabIndex={0}
          onKeyDown={onKey}
        >
          {state === "memuat" && <Memuat />}
          {state === "gagal" && (
            <p role="alert" className="py-16 text-[14px] text-text-soft">
              {err || "Dokumen gagal ditampilkan."}
            </p>
          )}
          <motion.div
            ref={host}
            className="dok-host mx-auto w-fit"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={state === "siap" ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ display: state === "siap" ? undefined : "none", zoom }}
          />
        </div>
        <p role="alert" className="mt-4 min-h-4 text-[13px] text-text-soft">
          {state === "siap" ? err : ""}
        </p>
        <p className="mt-2 text-[12px] leading-[15px] text-text-muted">
          PDF dibuat dari tampilan di atas dan berupa gambar per halaman, jadi teksnya tidak bisa diseleksi. Untuk teks yang bisa disunting, unduh DOCX.
        </p>
      </div>
    </section>
  );
}

export default function PratinjauView() {
  const params = useSearchParams();
  const id = params.get("id");
  const jenis = params.get("jenis");
  const role = useRole();
  const order = useOrder(id);

  if (role === undefined) return null;
  if (!role) return null; // dijaga RoleGuard
  const kinds = docsFor(role);
  const kind = (kinds.find((k) => k === jenis) ?? kinds[0]) as DocKind | undefined;
  const msg = !order
    ? { t: "Pesanan tidak ditemukan", d: "Pesanan demo hanya tersimpan di browser tempat UMKM membuatnya." }
    : !kind
      ? { t: "Tidak ada dokumen untuk perananmu", d: "Peranmu tidak punya akses ke dokumen pesanan." }
      : null;

  if (msg || !order || !kind) {
    return (
      <section className="pt-[72px]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-4 px-5 pb-24 pt-12 sm:px-10 lg:px-16">
          <h1 className="font-display text-[clamp(32px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">{msg?.t}</h1>
          <p className="max-w-[520px] text-[15px] leading-[22px] text-text-muted">{msg?.d}</p>
          <Link href="/" className="rounded-[2px] bg-brand px-6 py-3.5 text-[14px] font-medium text-surface hover:bg-brand-hover">
            Ke beranda
          </Link>
        </div>
      </section>
    );
  }
  return <Preview key={`${order.id}-${kind}`} order={order} role={role} kind={kind} />;
}
