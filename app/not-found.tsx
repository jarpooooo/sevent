import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-start justify-center px-5 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-[1440px]">
        <p className="text-[14px] font-medium text-text-muted">Halaman tidak ditemukan</p>
        <h1 className="font-display mt-3 text-[clamp(44px,7vw,88px)] leading-[1.02] tracking-[-0.04em]">
          Lot ini tidak
          <br />
          ada di sini.
        </h1>
        <p className="mt-6 max-w-[460px] text-[18px] leading-7 text-text-muted">
          Alamatnya mungkin salah ketik, atau lotnya sudah tidak tersedia. Mulai lagi dari katalog.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/katalog"
            className="rounded-[2px] bg-brand px-[22px] py-[17px] text-[14px] font-medium text-on-dark transition-colors hover:bg-brand-hover"
          >
            Buka katalog
          </Link>
          <Link
            href="/"
            className="rounded-[2px] border border-border-strong px-[22px] py-[17px] text-[14px] font-medium transition-colors hover:bg-card"
          >
            Ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
