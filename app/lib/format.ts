/** Format angka dan rupiah gaya Indonesia, dipakai di server dan klien. */
export const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
export const num = (n: number) => n.toLocaleString("id-ID");
