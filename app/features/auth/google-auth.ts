import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { Role } from "./session";
import { firebaseAuth, firestore } from "../../lib/firebase";

/**
 * Login Google lewat Firebase Auth. Peran disimpan di Firestore (users/{uid}) saat login pertama dan
 * tidak bisa diubah klien (lihat firestore.rules). Login berikutnya memakai peran yang sudah tersimpan.
 * Akun dummy (tanpa Firebase) tetap ada di halaman masuk dan tidak lewat modul ini.
 */
export type GoogleLogin = { role: Role; name: string; email: string; created: boolean };

export async function signInWithGoogle(chosen: Role): Promise<GoogleLogin> {
  const cred = await signInWithPopup(firebaseAuth(), new GoogleAuthProvider());
  const u = cred.user;
  const ref = doc(firestore(), "users", u.uid);
  const snap = await getDoc(ref);
  const name = u.displayName || u.email || "Pengguna";
  const email = u.email ?? "";

  if (snap.exists()) {
    const stored = snap.data().role;
    return { role: stored === "pabrik" ? "pabrik" : "umkm", name, email, created: false };
  }
  await setDoc(ref, { role: chosen, name, email, createdAt: serverTimestamp() });
  return { role: chosen, name, email, created: true };
}

export async function signOutFirebase() {
  await signOut(firebaseAuth());
}

/** Pesan galat yang bisa dibaca pengguna. */
export function authErrorMessage(e: unknown): string {
  const code = typeof e === "object" && e && "code" in e ? String((e as { code: unknown }).code) : "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Jendela Google ditutup sebelum selesai. Coba lagi.";
    case "auth/popup-blocked":
      return "Browser memblokir jendela Google. Izinkan pop-up untuk situs ini, lalu coba lagi.";
    case "auth/operation-not-allowed":
      return "Login Google belum diaktifkan di Firebase Console. Pakai akun demo dulu.";
    case "auth/unauthorized-domain":
      return "Domain ini belum diizinkan di Firebase Auth (Authorized domains). Pakai akun demo dulu.";
    case "permission-denied":
      return "Aturan Firestore menolak penyimpanan profil. Coba lagi atau pakai akun demo.";
    default:
      return "Login Google belum berhasil. Pakai akun demo dulu.";
  }
}
