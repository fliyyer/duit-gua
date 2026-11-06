import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Environment-based Firebase Configuration (set via .env)
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const STORAGE_KEY = 'duit_gua_firebase_config';

export const getStoredFirebaseConfig = (): FirebaseConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse local firebase config', err);
  }
  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfig = (config: FirebaseConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const removeFirebaseConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Initialize Firebase App
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let realtimeDb: Database | null = null;
let firestoreDb: Firestore | null = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
googleProvider.addScope('email');
googleProvider.addScope('profile');

const activeConfig = getStoredFirebaseConfig();

try {
  if (activeConfig.apiKey && activeConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(activeConfig) : getApps()[0];
    auth = getAuth(app);
    if (activeConfig.databaseURL) {
      try {
        realtimeDb = getDatabase(app);
      } catch (_e) {
        // Realtime Database optional
      }
    }
    try {
      firestoreDb = getFirestore(app);
    } catch (_e) {
      // Firestore optional
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export const isFirebaseConfigured = (): boolean => {
  return auth !== null;
};

export { app, auth, realtimeDb, firestoreDb, googleProvider };
