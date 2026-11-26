import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";

/**
 * Firebase (proyek kainara-id). Dipanggil lewat fungsi supaya inisialisasi malas dan aman dari SSR:
 * impor modul ini dari komponen klien, lalu panggil firebaseAuth() atau firestore() saat dibutuhkan.
 * Konfigurasi dibaca dari NEXT_PUBLIC_FIREBASE_* di .env.local (lihat .env.example).
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = (): FirebaseApp => (getApps().length ? getApp() : initializeApp(config));
export const firebaseAuth = (): Auth => getAuth(firebaseApp());
export const firestore = (): Firestore => getFirestore(firebaseApp());
