import type { ReactNode } from "react";

/** Kerangka halaman kerja pabrik: judul, deskripsi, aksi opsional, lalu isi. */
export default function PabrikPage({
  label,
  title,
  desc,
  action,
  children,
  note,
}: {
  label: string;
  title: string;
  desc: string;
  action?: ReactNode;
  children: ReactNode;
  note: string;
}) {
  return (
    <section aria-label={label} className="pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-9 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2.5">
            <h1 className="font-display text-[clamp(34px,4vw,44px)] leading-[1.1] tracking-[-0.03em]">{title}</h1>
            <p className="max-w-[640px] text-[15px] leading-6 text-text-muted">{desc}</p>
          </div>
          {action}
        </header>
        <div className="mt-8 flex flex-col gap-8">{children}</div>
        <p className="pt-10 text-[12px] text-text-muted">{note}</p>
      </div>
    </section>
  );
}

