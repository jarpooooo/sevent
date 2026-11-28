import type { MetadataRoute } from "next";

export const dynamic = "force-static";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kainara-id.web.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/profil", "/lot-saya", "/pesanan-masuk", "/tagihan-komisi", "/admin", "/pemeriksaan-exim", "/checkout", "/pesanan-saya", "/dokumen", "/masuk"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
