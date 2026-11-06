import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, get, set } from 'firebase/database';
import { firestoreDb, realtimeDb } from '../lib/firebase';
import { AppState } from '../types';

/**
 * Fetch financial state for a given user from Firebase Cloud (Firestore or Realtime Database)
 */
export const fetchUserFinancialState = async (uid: string): Promise<AppState | null> => {
  if (!uid || uid === 'guest_user') return null;

  // 1. Try Firestore first
  if (firestoreDb) {
    try {
      const userDocRef = doc(firestoreDb, 'users', uid);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.state) {
          return data.state as AppState;
        }
      }
    } catch (_err) {
      // Quiet fallback to Realtime Database
    }
  }

  // 2. Fallback to Realtime Database
  if (realtimeDb) {
    try {
      const dbRef = ref(realtimeDb, `users/${uid}/state`);
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        return snapshot.val() as AppState;
      }
    } catch (_err) {
      // Ignored
    }
  }

  return null;
};

/**
 * Save financial state for a given user to Firebase Cloud
 */
export const saveUserFinancialState = async (uid: string, state: AppState): Promise<boolean> => {
  if (!uid || uid === 'guest_user') return false;

  let saved = false;

  // 1. Try Firestore
  if (firestoreDb) {
    try {
      const userDocRef = doc(firestoreDb, 'users', uid);
      await setDoc(userDocRef, {
        state,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      saved = true;
    } catch (_err) {
      // Fallback to Realtime DB
    }
  }

  // 2. Try Realtime Database
  if (realtimeDb) {
    try {
      const dbRef = ref(realtimeDb, `users/${uid}/state`);
      await set(dbRef, {
        ...state,
        _updatedAt: new Date().toISOString(),
      });
      saved = true;
    } catch (_err) {
      // Ignored
    }
  }

  return saved;
};
