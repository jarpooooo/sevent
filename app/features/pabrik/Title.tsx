import type { LucideIcon } from "lucide-react";

/** Judul kartu dengan ikon Lucide di kiri. Ikon dekoratif, teks tetap yang dibaca pembaca layar. */
export default function Title({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-[18px] font-medium leading-[22px]">
      <Icon aria-hidden="true" className="size-[18px] shrink-0 text-brand" strokeWidth={1.8} />
      {children}
    </h2>
  );
}
