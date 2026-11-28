"use client";

import type { LucideIcon } from "lucide-react";
import { m as motion } from "motion/react";
import type { ReactNode } from "react";
import { useSafeReducedMotion } from "../../components/motion/useSafeReducedMotion";
import { inputBox, panel } from "../../components/ui/styles";
import Glyph from "./Glyph";

/** Isian berlabel: label, kontrol, lalu pesan galat atau petunjuk. */
export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
  className = "",
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  htmlFor: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-[14px] font-medium leading-[17px]">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[13px] leading-4 text-text-soft">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] leading-[15px] text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Kartu bagian formulir: glyph mozaik kelengkapan, judul, penjelasan, dan slot kanan (mis. status).
 * Masuk dengan gerak singkat saat pertama terlihat; dengan reduced motion langsung tampil.
 */
export function Section({
  id,
  title,
  desc,
  label,
  done,
  total,
  seed = 1,
  icon: Icon,
  aside,
  children,
}: {
  id?: string;
  title: string;
  desc?: string;
  label?: string;
  done?: number;
  total?: number;
  seed?: number;
  icon?: LucideIcon;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const reduce = useSafeReducedMotion();
  return (
    <motion.section
      id={id}
      aria-label={label ?? title}
      className={`${panel} flex scroll-mt-28 flex-col gap-6 p-6 sm:p-7`}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-start gap-4">
        {Icon ? (
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-[2px] bg-brand-soft text-brand">
            <Icon className="size-5" strokeWidth={1.8} />
          </span>
        ) : (
          total !== undefined && done !== undefined && <Glyph done={done} total={total} seed={seed} size={9} />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="font-display text-[22px] leading-[1.15] tracking-[-0.02em]">{title}</h2>
          {desc && <p className="max-w-[620px] text-[13px] leading-5 text-text-muted">{desc}</p>}
        </div>
        {aside}
      </div>
      {children}
    </motion.section>
  );
}

/** Baris isian: satu kolom di ponsel, dua kolom mulai layar sedang. */
export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

export function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { v: string; t: string }[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      aria-invalid={invalid}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputBox} appearance-none bg-[length:12px] bg-[right_15px_center] bg-no-repeat pr-10`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%235b6560' stroke-width='1.6'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E\")",
      }}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.t}
        </option>
      ))}
    </select>
  );
}
