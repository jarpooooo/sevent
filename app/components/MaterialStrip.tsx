// Strip bahan yang dijual. "Pakaian reject" dihapus: fokus bahan perca, sisa gulungan, offcut non-branded.
const MATERIALS = ["Kain reject", "Katun", "Poliester", "Denim", "Sisa potongan"];

export default function MaterialStrip() {
  return (
    <section
      aria-label="Bahan yang dijual"
      className="border-y border-[rgba(11,15,12,0.15)] px-5 py-8 md:py-11"
    >
      <ul className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-12">
        {MATERIALS.map((m, i) => (
          <li key={m} className="flex items-center gap-6 md:gap-12">
            <span className="font-display text-[clamp(18px,2vw,26px)] tracking-[-0.015em] text-[#7c877f]">
              {m}
            </span>
            {i < MATERIALS.length - 1 && (
              <span
                aria-hidden="true"
                className="hidden size-2 rotate-45 bg-[#b7c0b8] sm:block"
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
