import type { ChartCol, ChartTile, ProductKey } from "./products";

/** Data contoh demo, sama dengan desain Figma "Lot saya" dan "Tagihan komisi". */
const t = (id: string, product: ProductKey, kg: number, value: number, pending?: boolean): ChartTile => ({
  id,
  product,
  kg,
  value,
  pending,
});

/** Penjualan 8 minggu (Lot saya). Tiap kolom dari atas ke bawah. */
export const WEEKS: ChartCol[] = [
  { key: "m1", label: "M1", tiles: [t("KN-0101", "denim", 106, 425000), t("KN-0102", "denim", 56, 225000), t("KN-0103", "katun", 43, 345000)] },
  {
    key: "m2",
    label: "M2",
    tiles: [
      t("KN-0104", "katun", 37, 295000),
      t("KN-0105", "chino", 11, 195000),
      t("KN-0106", "chino", 18, 330000),
      t("KN-0107", "chino", 11, 205000),
      t("KN-0108", "chino", 12, 215000),
    ],
  },
  {
    key: "m3",
    label: "M3",
    tiles: [
      t("KN-0109", "denim", 61, 245000),
      t("KN-0110", "denim", 88, 350000),
      t("KN-0111", "denim", 99, 395000),
      t("KN-0112", "chino", 18, 325000),
      t("KN-0113", "denim", 148, 590000),
      t("KN-0114", "chino", 23, 410000),
    ],
  },
  {
    key: "m4",
    label: "M4",
    tiles: [
      t("KN-0115", "chino", 10, 180000),
      t("KN-0116", "kaos", 26, 310000),
      t("KN-0117", "denim", 83, 330000),
      t("KN-0118", "kaos", 32, 380000),
    ],
  },
  {
    key: "m5",
    label: "M5",
    tiles: [
      t("KN-0119", "katun", 72, 575000),
      t("KN-0120", "denim", 75, 300000),
      t("KN-0121", "denim", 90, 360000),
      t("KN-0122", "kaos", 18, 215000),
      t("KN-0123", "katun", 21, 165000),
      t("KN-0124", "chino", 15, 275000),
      t("KN-0125", "denim", 69, 275000),
      t("KN-0126", "denim", 136, 545000),
    ],
  },
  {
    key: "m6",
    label: "M6",
    tiles: [
      t("KN-0127", "kaos", 23, 275000),
      t("KN-0128", "chino", 22, 400000),
      t("KN-0129", "katun", 71, 570000),
      t("KN-0130", "katun", 55, 440000),
      t("KN-0131", "chino", 12, 210000),
      t("KN-0132", "kaos", 43, 515000),
      t("KN-0133", "katun", 29, 230000),
    ],
  },
  {
    key: "m7",
    label: "M7",
    tiles: [
      t("KN-0134", "denim", 115, 460000),
      t("KN-0135", "katun", 55, 440000),
      t("KN-0136", "chino", 18, 315000),
      t("KN-0137", "chino", 16, 285000),
      t("KN-0138", "denim", 81, 325000),
      t("KN-0139", "katun", 52, 415000),
      t("KN-0140", "chino", 29, 525000),
      t("KN-0141", "kaos", 40, 480000),
      t("KN-0142", "chino", 9, 165000),
      t("KN-0143", "denim", 100, 400000),
    ],
  },
  {
    key: "m8",
    label: "M8",
    tiles: [
      t("KN-0154", "kaos", 29, 350000, true),
      t("KN-0155", "denim", 88, 350000, true),
      t("KN-0156", "chino", 19, 350000, true),
      t("KN-0144", "kaos", 33, 400000),
      t("KN-0145", "chino", 33, 590000),
      t("KN-0146", "kaos", 23, 270000),
      t("KN-0147", "katun", 69, 555000),
      t("KN-0148", "denim", 111, 445000),
      t("KN-0149", "chino", 14, 250000),
      t("KN-0150", "katun", 58, 465000),
      t("KN-0151", "katun", 51, 410000),
      t("KN-0152", "kaos", 17, 205000),
      t("KN-0153", "chino", 25, 450000),
    ],
  },
];

/** Penjualan 7 hari (Tagihan komisi). */
export const DAYS: ChartCol[] = [
  { key: "sen", label: "Sen", full: "Senin", tiles: [t("KN-0201", "katun", 1, 10000), t("KN-0202", "chino", 1, 20000), t("KN-0203", "kaos", 2, 25000), t("KN-0204", "denim", 11, 45000)] },
  { key: "sel", label: "Sel", full: "Selasa", tiles: [t("KN-0205", "kaos", 1, 15000), t("KN-0206", "denim", 8, 30000)] },
  { key: "rab", label: "Rab", full: "Rabu", tiles: [t("KN-0207", "katun", 1, 10000), t("KN-0208", "chino", 1, 25000), t("KN-0209", "denim", 15, 60000)] },
  { key: "kam", label: "Kam", full: "Kamis", tiles: [t("KN-0210", "katun", 2, 15000), t("KN-0211", "kaos", 2, 20000)] },
  {
    key: "jum",
    label: "Jum",
    full: "Jumat",
    tiles: [t("KN-0212", "katun", 2, 15000), t("KN-0213", "chino", 1, 20000), t("KN-0214", "kaos", 3, 30000), t("KN-0215", "denim", 13, 50000)],
  },
  { key: "sab", label: "Sab", full: "Sabtu", tiles: [t("KN-0216", "kaos", 1, 15000), t("KN-0217", "chino", 2, 35000), t("KN-0218", "denim", 18, 70000)] },
  { key: "min", label: "Min", full: "Minggu", tiles: [t("KN-0219", "katun", 1, 5000), t("KN-0220", "kaos", 1, 10000)] },
];

export const sumTiles = (cols: ChartCol[], only?: (t: ChartTile) => boolean) =>
  cols.reduce((a, c) => a + c.tiles.filter((x) => (only ? only(x) : true)).reduce((b, x) => b + x.value, 0), 0);
