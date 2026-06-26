import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Baca dari environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 🔥 Cek apakah ada yang kosong
const missingVars = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  const errorMsg = `Firebase config missing: ${missingVars.join(', ')}`;
  console.error('❌', errorMsg);
  // ❗ Jangan throw error di sini, nanti ditangani di komponen
}

console.log('🔥 Firebase config:', {
  apiKey: firebaseConfig.apiKey ? '✅ OK' : '❌ MISSING',
  authDomain: firebaseConfig.authDomain ? '✅ OK' : '❌ MISSING',
  projectId: firebaseConfig.projectId ? '✅ OK' : '❌ MISSING',
  storageBucket: firebaseConfig.storageBucket ? '✅ OK' : '❌ MISSING',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ OK' : '❌ MISSING',
  appId: firebaseConfig.appId ? '✅ OK' : '❌ MISSING',
});

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
