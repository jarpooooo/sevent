import {
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { Role } from "./session";
import { PENDING_ROLE_KEY } from "./google-auth-keys";
import { firebaseAuth, firestore } from "../../lib/firebase";

/**
 * Login Google lewat Firebase Auth (proyek kainara-id).
 * Peran disimpan di Firestore (users/{uid}) saat login pertama dan tidak bisa diubah klien
 * (lihat firestore.rules). Login berikutnya membaca peran yang tersimpan.
 */
export type GoogleLogin = {
  uid: string;
  role: Role;
  name: string;
  email: string;
  photoURL?: string;
  created: boolean;
};

function makeProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

async function hydrateProfile(u: User, chosen: Role): Promise<GoogleLogin> {
  const name = u.displayName || u.email || "Pengguna";
  const email = u.email ?? "";
  const photoURL = u.photoURL ?? undefined;

  try {
    const ref = doc(firestore(), "users", u.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const stored = snap.data().role;
      return {
        uid: u.uid,
        role: stored === "pabrik" ? "pabrik" : "umkm",
        name,
        email,
        photoURL,
        created: false,
      };
    }
    await setDoc(ref, {
      role: chosen,
      name,
      email,
      photoURL: photoURL ?? "",
      createdAt: serverTimestamp(),
    });
    return { uid: u.uid, role: chosen, name, email, photoURL, created: true };
  } catch (err) {
    // Firebase Auth sudah berhasil; jika Firestore gagal sementara (offline/jaringan), sesi Google tetap dilanjutkan.
    console.warn("Sinkronisasi profil Firestore tertunda:", err);
    return { uid: u.uid, role: chosen, name, email, photoURL, created: false };
  }
}

/**
 * Masuk dengan Google via pop-up. Bila pop-up diblokir browser (mis. mobile WebView),
 * otomatis beralih ke signInWithRedirect dan mengembalikan null.
 */
export async function signInWithGoogle(chosen: Role): Promise<GoogleLogin | null> {
  const auth = firebaseAuth();
  const provider = makeProvider();
  try {
    const cred = await signInWithPopup(auth, provider);
    return await hydrateProfile(cred.user, chosen);
  } catch (e) {
    const code = typeof e === "object" && e && "code" in e ? String((e as { code: unknown }).code) : "";
    if (code === "auth/popup-blocked") {
      window.sessionStorage.setItem(PENDING_ROLE_KEY, chosen);
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw e;
  }
}

/** Selesaikan alur login Google bila sebelumnya dialihkan lewat signInWithRedirect. */
export async function completeGoogleRedirect(): Promise<GoogleLogin | null> {
  const cred = await getRedirectResult(firebaseAuth());
  if (!cred) return null;
  const saved = window.sessionStorage.getItem(PENDING_ROLE_KEY);
  window.sessionStorage.removeItem(PENDING_ROLE_KEY);
  const chosen: Role = saved === "pabrik" ? "pabrik" : "umkm";
  return hydrateProfile(cred.user, chosen);
}

/** Sinkronkan sesi Firebase Auth dengan sesi lokal ketika halaman dimuat ulang atau pindah tab. */
export function subscribeGoogleAuth(
  fallbackRole: Role,
  onUser: (profile: GoogleLogin) => void,
  onSignedOut: () => void,
): () => void {
  return onAuthStateChanged(firebaseAuth(), async (user) => {
    if (!user) {
      onSignedOut();
      return;
    }
    const profile = await hydrateProfile(user, fallbackRole);
    onUser(profile);
  });
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
      return "Jendela Google ditutup sebelum selesai. Silakan coba lagi.";
    case "auth/popup-blocked":
      return "Browser memblokir jendela pop-up. Mengalihkan ke halaman masuk Google...";
    case "auth/operation-not-allowed":
      return "Login Google belum diaktifkan di Firebase Console.";
    case "auth/unauthorized-domain":
      return "Domain ini belum terdaftar di Authorized domains Firebase Auth.";
    case "auth/network-request-failed":
      return "Koneksi internet terganggu saat menghubungi Google. Coba lagi.";
    case "auth/account-exists-with-different-credential":
      return "Email ini sudah terdaftar dengan metode masuk lain.";
    case "permission-denied":
      return "Aturan Firestore menolak penyimpanan profil. Coba lagi.";
    default:
      return "Login Google belum berhasil. Coba lagi atau pakai akun demo.";
  }
}
