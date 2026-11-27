"use client";

import { AnimatePresence, m as motion } from "motion/react";
import Image from "next/image";
import { useId, useState } from "react";
import MosaicCover from "../../../components/mosaic/MosaicCover";
import MosaicLoop from "../../../components/mosaic/MosaicLoop";
import { useSafeReducedMotion } from "../../../components/motion/useSafeReducedMotion";
import { inputBox, panel } from "../../../components/ui/styles";
import { Field } from "../../akun/FormParts";
import Glyph from "../../akun/Glyph";
import { emailValid, phoneValid } from "../../akun/profil";

const EASE = [0.16, 1, 0.3, 1] as const;

type Peran = "umkm" | "pabrik" | "lain";

const PERAN: { v: Peran; t: string; d: string; seed: number; tips: string }[] = [
  {
    v: "umkm",
    t: "UMKM penjahit",
    d: "Cari bahan",
    seed: 3,
    tips: "Sebut jenis kain, perkiraan kebutuhan per bulan, dan kota. Kami arahkan ke lot yang cocok.",
  },
  {
    v: "pabrik",
    t: "Pabrik",
    d: "Punya sisa produksi",
    seed: 8,
    tips: "Sebut jenis sisa, perkiraan jumlah, dan lokasi pabrik. Kami jelaskan cara menayangkan lot dan dokumen yang diminta.",
  },
  {
    v: "lain",
    t: "Lainnya",
    d: "Kerja sama atau pertanyaan",
    seed: 5,
    tips: "Tulis topiknya dan siapa kamu. Kami arahkan ke orang yang tepat.",
  },
];

const KONTAK = [
  { k: "Email", v: "halo@kainara.id", copy: true },
  { k: "WhatsApp", v: "+62 8xx-xxxx-xxxx", copy: false },
  { k: "Daerah awal", v: "Pilot regional, daerah menyusul", copy: false },
];

function Tiles({ n, total, label }: { n: number; total: number; label: string }) {
  const reduce = useSafeReducedMotion();
  return (
    <ol aria-label={label} className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <motion.li
          key={i}
          aria-hidden="true"
          className={`block h-3 w-9 rounded-[2px] transition-colors duration-500 ${i < n ? "bg-brand" : "bg-brand-soft"}`}
          initial={reduce ? false : { opacity: 0, scaleY: 0.3 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.5 + i * 0.06 }}
          style={{ originY: 1 }}
        />
      ))}
    </ol>
  );
}

export default function KontakView() {
  const id = useId();
  const reduce = useSafeReducedMotion();
  const fid = (k: string) => `${id}-${k}`;

  const [peran, setPeran] = useState<Peran>("umkm");
  const [nama, setNama] = useState("");
  const [kontak, setKontak] = useState("");
  const [x1, setX1] = useState(""); // isian khusus peran: jenis kain / jenis sisa / topik
  const [x2, setX2] = useState(""); // jumlah (kg), opsional
  const [kota, setKota] = useState("");
  const [pesan, setPesan] = useState("");
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const kontakOk = emailValid(kontak) || phoneValid(kontak);
  const errs = {
    nama: nama.trim() ? "" : "Isi namamu.",
    kontak: !kontak.trim() ? "Isi email atau nomor WhatsApp." : kontakOk ? "" : "Email atau nomor WhatsApp belum benar. Contoh: 0812 3456 7890.",
    pesan: pesan.trim().length >= 10 ? "" : "Tulis pesanmu, minimal 10 huruf.",
  };
  const done = [!errs.nama, !errs.kontak, !errs.pesan].filter(Boolean).length;
  const aktif = PERAN.find((p) => p.v === peran)!;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(KONTAK[0].v);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* klip papan tidak tersedia: abaikan */
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    const bad = (["nama", "kontak", "pesan"] as const).find((k) => errs[k]);
    if (bad) {
      const el = document.getElementById(fid(bad));
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.focus({ preventScroll: true });
      return;
    }
    setSent(true);
  };

  const reset = () => {
    setSent(false);
    setTried(false);
    setNama("");
    setKontak("");
    setX1("");
    setX2("");
    setKota("");
    setPesan("");
  };

  return (
    <section aria-label="Kontak" className="bg-surface pt-[72px]">
      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 sm:px-10 lg:px-16">
        {/* Kepala: judul, ajakan, dan foto yang dibuka mozaik */}
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-stretch lg:gap-14">
          <div className="flex min-w-0 flex-col justify-between gap-10">
            <div>
              <h1 className="font-display text-[clamp(44px,5.6vw,76px)] leading-[1.02] tracking-[-0.04em]">
                {["Bicara dengan", "kami."].map((line, i) => (
                  <span key={line} className="block overflow-hidden pb-[0.08em]">
                    <motion.span
                      className="block"
                      initial={reduce ? false : { y: "105%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.12 }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <p className="mt-6 max-w-[500px] text-[18px] leading-7 text-text-muted">
                Penjahit yang cari bahan, atau pabrik yang punya sisa produksi: tulis saja. Kami balas lewat WhatsApp atau email.
              </p>
            </div>

            <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {KONTAK.map((i, n) => (
                <motion.div
                  key={i.k}
                  className={`${panel} flex flex-col gap-1.5 p-4`}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE, delay: 0.45 + n * 0.08 }}
                >
                  <dt className="text-[13px] font-medium text-text-muted">{i.k}</dt>
                  <dd className="font-display text-[19px] leading-[1.2] tracking-[-0.02em]">{i.v}</dd>
                  {i.copy && (
                    <button
                      type="button"
                      onClick={copy}
                      className="mt-1 w-fit text-[13px] font-medium text-brand underline underline-offset-4 hover:text-brand-hover"
                    >
                      {copied ? "Tersalin" : "Salin email"}
                    </button>
                  )}
                </motion.div>
              ))}
            </dl>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-thumb-empty lg:aspect-auto lg:min-h-[420px]">
            <Image src="/images/kontak.webp" alt="" fill priority sizes="(min-width:1024px) 440px, 100vw" className="object-cover" />
            <MosaicCover cols={7} rows={6} hidden seed={5} trigger="mount" startDelay={0.3} origin={{ x: 0.5, y: 0.2 }} className="absolute inset-0" />
            <MosaicLoop cols={7} rows={6} seed={6} line={1} slow={1.4} className="absolute inset-0" />
          </div>
        </header>

        {/* Formulir */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,720px)] lg:gap-14">
          <div className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start lg:pt-2">
            <h2 className="font-display text-[clamp(26px,3vw,36px)] leading-[1.1] tracking-[-0.03em]">Kirim pesan</h2>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={peran}
                className="max-w-[420px] text-[15px] leading-6 text-text-muted"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {aktif.tips}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className={`${panel} relative overflow-hidden p-6 sm:p-8`}>
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="ok"
                  className="flex flex-col gap-6 py-4"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  role="status"
                >
                  <div aria-hidden="true" className="grid max-w-[360px] grid-cols-6 gap-1.5">
                    {Array.from({ length: 12 }, (_, i) => (
                      <motion.span
                        key={i}
                        className="block aspect-square rounded-[2px] bg-brand"
                        initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                        animate={{ opacity: i % 5 === 3 ? 0.35 : 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.08 * ((i * 5) % 12) }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-[30px] leading-[1.1] tracking-[-0.03em]">Pesan tercatat</h3>
                    <p className="max-w-[460px] text-[15px] leading-6 text-text-muted">
                      Terima kasih, {nama.trim().split(/\s+/)[0]}. Pesan hanya tercatat di halaman ini: pengiriman sungguhan belum tersambung (demo).
                    </p>
                  </div>
                  <dl className="flex flex-col gap-2.5 text-[14px]">
                    {(
                      [
                        ["Sebagai", aktif.t],
                        ["Kontak", kontak.trim()],
                        ...(x1.trim() ? ([[peran === "umkm" ? "Kain" : peran === "pabrik" ? "Sisa produksi" : "Topik", x1.trim()]] as [string, string][]) : []),
                      ] as [string, string][]
                    ).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <dt className="text-text-muted">{k}</dt>
                        <dd className="text-right font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <button
                    type="button"
                    onClick={reset}
                    className="w-fit rounded-[2px] border border-border-strong px-6 py-3 text-[14px] font-medium transition-colors hover:bg-brand-soft"
                  >
                    Tulis pesan lain
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={submit}
                  className="flex flex-col gap-6"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <fieldset className="flex flex-col gap-3">
                    <legend className="mb-1 text-[14px] font-medium">Kamu sebagai</legend>
                    <div role="radiogroup" aria-label="Kamu sebagai" className="grid gap-2.5 sm:grid-cols-3">
                      {PERAN.map((r, i) => {
                        const on = peran === r.v;
                        return (
                          <motion.label
                            key={r.v}
                            className={`relative flex cursor-pointer flex-col gap-3 rounded-[2px] border p-4 transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
                              on ? "border-brand text-on-dark" : "border-line bg-card hover:bg-card/70"
                            }`}
                            initial={reduce ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.07 }}
                          >
                            <input
                              type="radio"
                              name={`${id}-peran`}
                              value={r.v}
                              checked={on}
                              onChange={() => setPeran(r.v)}
                              className="sr-only"
                            />
                            {on && (
                              <motion.span
                                layoutId="kontak-peran"
                                className="absolute inset-0 rounded-[2px] bg-brand"
                                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                              />
                            )}
                            <span className="relative">
                              <Glyph done={on ? 9 : 4} total={9} seed={r.seed} size={7} label="" />
                            </span>
                            <span className="relative flex flex-col gap-0.5">
                              <span className="text-[15px] font-medium leading-[1.2]">{r.t}</span>
                              <span className={`text-[13px] leading-4 ${on ? "text-on-dark-muted" : "text-text-muted"}`}>{r.d}</span>
                            </span>
                          </motion.label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Nama" error={tried ? errs.nama : ""} htmlFor={fid("nama")}>
                      <input id={fid("nama")} className={inputBox} autoComplete="name" placeholder="Nama lengkap" value={nama} onChange={(e) => setNama(e.target.value)} aria-invalid={tried && !!errs.nama} />
                    </Field>
                    <Field label="Email atau WhatsApp" error={tried ? errs.kontak : ""} htmlFor={fid("kontak")}>
                      <input id={fid("kontak")} className={inputBox} autoComplete="email" placeholder="Kontak yang bisa dihubungi" value={kontak} onChange={(e) => setKontak(e.target.value)} aria-invalid={tried && !!errs.kontak} />
                    </Field>
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={peran}
                      className="grid gap-5 sm:grid-cols-2"
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      <Field
                        label={peran === "umkm" ? "Jenis kain yang dicari" : peran === "pabrik" ? "Jenis sisa produksi" : "Topik"}
                        hint="Boleh kosong."
                        htmlFor={fid("x1")}
                      >
                        <input
                          id={fid("x1")}
                          className={inputBox}
                          placeholder={peran === "umkm" ? "Contoh: denim, katun polos" : peran === "pabrik" ? "Contoh: perca cutting denim" : "Contoh: kerja sama"}
                          value={x1}
                          onChange={(e) => setX1(e.target.value)}
                        />
                      </Field>
                      {peran === "lain" ? (
                        <Field label="Asal atau instansi" hint="Boleh kosong." htmlFor={fid("kota")}>
                          <input id={fid("kota")} className={inputBox} value={kota} onChange={(e) => setKota(e.target.value)} />
                        </Field>
                      ) : (
                        <Field label={peran === "umkm" ? "Kebutuhan per bulan (kg)" : "Perkiraan jumlah (kg)"} hint="Boleh kosong." htmlFor={fid("x2")}>
                          <input id={fid("x2")} className={`${inputBox} tabular-nums`} inputMode="numeric" value={x2} onChange={(e) => setX2(e.target.value.replace(/\D/g, ""))} />
                        </Field>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <Field label="Pesan" error={tried ? errs.pesan : ""} htmlFor={fid("pesan")}>
                    <textarea
                      id={fid("pesan")}
                      rows={5}
                      placeholder="Ceritakan kebutuhan atau stokmu"
                      value={pesan}
                      onChange={(e) => setPesan(e.target.value)}
                      aria-invalid={tried && !!errs.pesan}
                      className={`${inputBox} h-auto resize-y py-3 leading-6`}
                    />
                  </Field>

                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div className="flex flex-col gap-2">
                      <Tiles n={done} total={3} label={`Kelengkapan pesan, ${done} dari 3`} />
                      <p className="text-[12px] text-text-muted">
                        {done === 3 ? "Siap dikirim." : `Nama, kontak, dan pesan: ${done} dari 3 terisi.`}
                      </p>
                    </div>
                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.97 }}
                      className="h-12 rounded-[2px] bg-brand px-8 text-[15px] font-medium text-on-dark transition-colors hover:bg-brand-hover"
                    >
                      Kirim pesan
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-12 text-[12px] text-text-muted">Email dan nomor WhatsApp di halaman ini adalah contoh demo untuk mock up.</p>
      </div>
    </section>
  );
}
