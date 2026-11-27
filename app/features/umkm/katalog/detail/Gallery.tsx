"use client";

import Image from "next/image";
import { Icon } from "../../../../components/ui/icons";
import MosaicCover from "../../../../components/mosaic/MosaicCover";
import type { Lot } from "../../../../lib/domain/types";

/* ───────── Galeri: hanya foto keseluruhan yang sudah ada, sisanya "Belum ada" seperti di Figma ───────── */
const THUMBS = ["Keseluruhan", "Tekstur", "Ukuran potongan", "Timbangan", "Identitas lot"];

export default function Gallery({ lot }: { lot: Lot }) {
  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-[2px] bg-inverse lg:aspect-auto lg:h-[414px]">
        <Image
          src={lot.photo}
          alt={lot.alt}
          fill
          priority
          sizes="(min-width: 1024px) 736px, 92vw"
          className="object-cover"
          style={{ objectPosition: lot.focus }}
        />
        <MosaicCover
          cols={8}
          rows={4}
          hidden
          seed={11}
          origin={{ x: 0.5, y: 0.5 }}
          startDelay={0.2}
          className="absolute inset-0"
        />
        <span className="absolute right-0 top-0 z-10 flex h-12 w-[150px] items-center bg-surface px-6 text-[13px] font-medium text-brand">
          Lot {lot.code}
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:gap-2">
        {THUMBS.map((t, i) => (
          <li key={t}>
            {i === 0 ? (
              <div className="relative h-[78px] overflow-hidden rounded-[2px] border border-brand">
                <Image
                  src={lot.photo}
                  alt=""
                  fill
                  sizes="116px"
                  className="object-cover"
                  style={{ objectPosition: lot.focus }}
                />
              </div>
            ) : (
              <div className="flex h-[78px] items-center justify-center rounded-[2px] border border-line bg-thumb-empty text-[11px] text-text-muted">
                Belum ada
              </div>
            )}
            <p className="mt-2 text-[11px] font-medium text-text-muted">{t}</p>
          </li>
        ))}
        <li>
          <div className="flex h-[78px] flex-col items-center justify-center gap-1 rounded-[2px] border border-line bg-panel text-[11px] text-text-muted">
            <Icon name="play-circle" size={24} />
            Belum ada
          </div>
          <p className="mt-2 text-[11px] font-medium text-text-muted">Video 10–20 dtk</p>
        </li>
      </ul>
      <p className="mt-3 text-[12px] text-text-muted">Foto &amp; video lot. Aset ilustratif, bukti asli menyusul.</p>
    </div>
  );
}

