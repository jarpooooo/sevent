import Link from "next/link";
import { Icon } from "../../../components/ui/icons";
import type { Lot } from "../../../lib/domain/types";
import { LotCard } from "./LotCard";
import BuyPanel from "./detail/BuyPanel";
import Gallery from "./detail/Gallery";
import Reviews from "./detail/Reviews";
import { h2, rule } from "./detail/shared";
import { Notes, Specs } from "./detail/SpecNotes";

/** Halaman detail lot. Komponen server; hanya galeri, panel beli, dan ulasan yang interaktif (klien). */
export default function LotDetail({ lot, related }: { lot: Lot; related: Lot[] }) {
  return (
    <div className="pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between gap-4 text-[13px]">
          <nav aria-label="Jalur halaman" className="min-w-0 truncate text-text-muted">
            <Link href="/katalog" className="hover:text-text">
              Katalog
            </Link>
            {"  /  "}
            {lot.category}
            {"  /  "}
            <span aria-current="page">{lot.title}</span>
          </nav>
          <Link href="/katalog" className="flex shrink-0 items-center gap-1.5 font-medium text-brand hover:text-brand-hover">
            <Icon name="arrow-left" size={14} />
            Kembali ke katalog
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-[minmax(0,1fr)] items-start gap-x-[60px] gap-y-10 lg:grid-cols-[minmax(0,1fr)_540px]">
          <div className="lg:col-start-1 lg:row-start-1">
            <Gallery lot={lot} />
          </div>
          {/* Panel beli membentang di samping galeri, spesifikasi, dan catatan: menempel saat scroll
              dan tidak pernah menimpa konten, karena kolom kirinya yang panjang. */}
          <div className="lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-stretch">
            <BuyPanel lot={lot} />
          </div>
          <div className="lg:col-start-1 lg:row-start-2">
            <Specs lot={lot} />
          </div>
          <div className="lg:col-start-1 lg:row-start-3">
            <Notes lot={lot} />
          </div>
        </div>

        <div className="mt-16 md:mt-20">
          <Reviews lot={lot} />
        </div>

        {related.length > 0 && (
          <section aria-label="Lot lain" className="mt-16 border-t border-line pt-10 md:mt-20">
            <div className="flex items-end justify-between gap-6">
              <h2 className={h2}>Lot lain</h2>
              <Link
                href="/katalog"
                className="flex items-center gap-1.5 pb-1 text-[13px] font-medium text-brand hover:text-brand-hover"
              >
                Semua lot
                <Icon name="arrow-up-right" size={14} />
              </Link>
            </div>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((l, i) => (
                <li key={l.slug}>
                  <LotCard lot={l} index={i} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className={`${rule} mt-16`} />
        <p className="py-5 text-[12px] text-text-muted">
          Data, harga, foto dan ulasan pada desain ini merupakan ilustrasi demo; bukan transaksi atau bukti mutu
          aktual.
        </p>
      </div>
    </div>
  );
}

