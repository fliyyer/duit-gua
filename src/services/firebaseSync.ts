import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, get, set } from 'firebase/database';
import { firestoreDb, realtimeDb } from '../lib/firebase';
import { AppState } from '../types';

/**
 * Deep-clean undefined fields before saving to Firebase.
 * Firestore throws an error if any property in an object is `undefined`.
 */
export const sanitizeForCloud = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

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
    } catch (err) {
      console.warn('Firestore fetch failed, checking fallback...', err);
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
 * Listen to real-time changes from Firestore for instant cross-device/browser synchronization
 */
export const subscribeUserFinancialState = (
  uid: string,
  onUpdate: (state: AppState) => void,
  onError?: (err: any) => void
): (() => void) => {
  if (!uid || uid === 'guest_user' || !firestoreDb) {
    return () => {};
  }

  try {
    const userDocRef = doc(firestoreDb, 'users', uid);
    return onSnapshot(
      userDocRef,
      (snapshot) => {
        // Skip local pending writes to avoid feedback loops
        if (snapshot.metadata.hasPendingWrites) {
          return;
        }
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.state) {
            onUpdate(data.state as AppState);
          }
        }
      },
      (err) => {
        console.warn('Real-time sync subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('Failed to attach real-time listener:', err);
    return () => {};
  }
};

/**
 * Save financial state for a given user to Firebase Cloud
 */
export const saveUserFinancialState = async (uid: string, state: AppState): Promise<boolean> => {
  if (!uid || uid === 'guest_user') return false;

  const sanitized = sanitizeForCloud(state);
  let saved = false;

  // 1. Try Firestore
  if (firestoreDb) {
    try {
      const userDocRef = doc(firestoreDb, 'users', uid);
      await setDoc(userDocRef, {
        state: sanitized,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      saved = true;
    } catch (err) {
      console.error('Firestore save error:', err);
    }
  }

  // 2. Try Realtime Database (with timeout guard)
  if (!saved && realtimeDb) {
    try {
      const dbRef = ref(realtimeDb, `users/${uid}/state`);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('RTDB timeout')), 3000)
      );
      await Promise.race([
        set(dbRef, {
          ...sanitized,
          _updatedAt: new Date().toISOString(),
        }),
        timeoutPromise,
      ]);
      saved = true;
    } catch (_err) {
      // Ignored
    }
  }

  return saved;
};

