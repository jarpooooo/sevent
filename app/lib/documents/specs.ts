import type { Role } from "../domain/types";

/** Tiga dokumen administrasi yang dihasilkan dari satu sumber data transaksi. Template ada di public/templates. */
export type DocKind = "invoice" | "laporan" | "rekon";

export type DocSpec = {
  kind: DocKind;
  title: string;
  /** nama berkas template di public/templates */
  template: string;
  /** awalan nama berkas unduhan */
  prefix: string;
  desc: string;
  /**
   * Siapa yang boleh mengunduh. Akses UMKM: invoice saja. Laporan kepabeanan untuk pabrik, EXIM, admin.
   * Lembar fiskal dan stok tidak untuk UMKM.
   */
  roles: Role[];
};

export const DOC_SPECS: Record<DocKind, DocSpec> = {
  invoice: {
    kind: "invoice",
    title: "Invoice komersial",
    template: "invoice-komersial.docx",
    prefix: "invoice",
    desc: "Siapa membeli apa, berapa jumlahnya, dan berapa tagihannya.",
    roles: ["umkm", "pabrik", "admin"],
  },
  laporan: {
    kind: "laporan",
    title: "Laporan pendukung kepabeanan",
    template: "laporan-pendukung-kepabeanan.docx",
    prefix: "laporan-kepabeanan",
    desc: "Asal barang, klasifikasi, dan status persyaratan pengeluaran.",
    roles: ["pabrik", "admin"],
  },
  rekon: {
    kind: "rekon",
    title: "Rekonsiliasi fiskal dan stok",
    template: "rekonsiliasi-fiskal-stok.docx",
    prefix: "rekonsiliasi",
    desc: "Kewajiban fiskal dan kecocokan stok sistem dengan stok fisik.",
    roles: ["pabrik", "admin"],
  },
};

export const DOC_ORDER: DocKind[] = ["invoice", "laporan", "rekon"];

/** Dokumen yang boleh dilihat peran tertentu. */
export const docsFor = (role: Role): DocKind[] => DOC_ORDER.filter((k) => DOC_SPECS[k].roles.includes(role));
