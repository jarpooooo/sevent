import Navbar from "../components/layout/Navbar";

// Navbar tinggal di layout supaya tetap ada saat pindah halaman,
// dan garis bawah menu aktif bisa bergeser mulus antar halaman.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
