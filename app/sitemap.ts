import type { MetadataRoute } from "next";
import { LOTS } from "./lib/data/seed/lots";

export const dynamic = "force-static";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kainara-id.web.app";

/** Hanya halaman publik. Halaman akun, pabrik, admin, EXIM, checkout, dan pesanan tidak ikut. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/alur-kerja", "/kontak", "/katalog"].map((p) => ({ url: `${SITE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));
  const lots = LOTS.map((l) => ({ url: `${SITE}/katalog/${l.slug}`, changeFrequency: "daily" as const, priority: 0.6 }));
  return [...pages, ...lots];
}
