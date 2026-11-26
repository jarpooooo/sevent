"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Satu-satunya bagian interaktif di halaman Lot saya; sisanya komponen server. */
export default function TambahLotButton() {
  const [note, setNote] = useState("");
  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={() => setNote("Demo: unggah lot belum tersambung ke server.")}
        className="rounded-[10px] bg-brand px-[22px] py-3.5 text-[14px] font-medium text-surface transition-colors hover:bg-brand-hover"
      >
        +&nbsp;&nbsp;Tambah lot
      </button>
      <div role="status" className="min-h-4 text-[12px] text-text-muted">
        <AnimatePresence mode="wait">
          {note && (
            <motion.span
              key={note}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {note}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
