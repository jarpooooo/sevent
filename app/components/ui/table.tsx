import type { ReactNode } from "react";
import { panel } from "./styles";

type Tone = "ok" | "wait" | "idle";
const TONE: Record<Tone, string> = {
  ok: "bg-brand-soft text-brand",
  wait: "bg-warn-soft text-text",
  idle: "border border-line text-text-muted",
};

/** Pil status. Warna kuning = menunggu tindakan; hijau muda = berjalan baik. */
export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-[5px] text-[12px] font-medium ${TONE[tone]}`}>
      {children}
    </span>
  );
}

/** Tabel sederhana dengan kepala bertinta lembut, bisa digeser ke samping di layar sempit. */
export function Table({
  head,
  widths,
  children,
  label,
}: {
  head: string[];
  widths: string;
  children: ReactNode;
  label: string;
}) {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={label}>
        <div className="min-w-[860px]">
          <div
            className="grid items-center gap-4 rounded-full bg-brand-soft/50 px-6 py-3 text-[12px] font-medium text-text-muted"
            style={{ gridTemplateColumns: widths }}
          >
            {head.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Row({ widths, children }: { widths: string; children: ReactNode }) {
  return (
    <div
      className="grid items-center gap-4 border-t border-border px-6 py-[18px] text-[14px] first:border-t-0"
      style={{ gridTemplateColumns: widths }}
    >
      {children}
    </div>
  );
}

export function MiniBar({ pct }: { pct: number }) {
  return (
    <span aria-hidden="true" className="block h-1.5 w-[127px] overflow-hidden rounded-full bg-brand-soft">
      <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
    </span>
  );
}
