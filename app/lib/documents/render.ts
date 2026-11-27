import { DOC_SPECS, type DocKind } from "./specs";

/**
 * Mengisi template .docx di browser dan mengembalikan berkas. Paket pembuat dokumen dimuat saat dipakai
 * supaya tidak masuk ke bundel halaman. Tanda placeholder memakai {{ }} dan perulangan {{#items}} ... {{/items}}.
 */
export async function renderDocx(kind: DocKind, data: Record<string, unknown>): Promise<Blob> {
  const spec = DOC_SPECS[kind];
  const [{ default: PizZip }, { default: Docxtemplater }] = await Promise.all([import("pizzip"), import("docxtemplater")]);
  const res = await fetch(`/templates/${spec.template}`);
  if (!res.ok) throw new Error(`Template ${spec.template} tidak bisa dimuat (${res.status}).`);
  const zip = new PizZip(await res.arrayBuffer());
  const doc = new Docxtemplater(zip, {
    delimiters: { start: "{{", end: "}}" },
    paragraphLoop: true,
    linebreaks: true,
    // placeholder tanpa nilai tidak boleh meninggalkan "undefined" di dokumen
    nullGetter: () => "",
  });
  doc.render(data);
  return doc.getZip().generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
