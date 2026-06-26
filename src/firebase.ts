import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Baca dari environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Cek apakah ada yang kosong
const missing = Object.entries(firebaseConfig)
  .filter(([_, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0) {
  console.error('❌ Firebase missing:', missing);
}

console.log('🔥 Firebase status:', {
  apiKey: firebaseConfig.apiKey ? '✅' : '❌',
  authDomain: firebaseConfig.authDomain ? '✅' : '❌',
  projectId: firebaseConfig.projectId ? '✅' : '❌',
  storageBucket: firebaseConfig.storageBucket ? '✅' : '❌',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅' : '❌',
  appId: firebaseConfig.appId ? '✅' : '❌',
});

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
