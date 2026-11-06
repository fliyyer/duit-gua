import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isFirebaseReady: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'duit_gua_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isFirebaseReady = isFirebaseConfigured();

  // Listen to Auth State and Redirect Result
  useEffect(() => {
    if (auth) {
      // Check for redirect result from Google Sign-In
      getRedirectResult(auth)
        .then((result) => {
          if (result && result.user) {
            setUser({
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Pengguna',
              photoURL: result.user.photoURL,
              isGuest: false,
            });
          }
        })
        .catch(() => {
          // Quiet catch for redirect listener
        });

      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Pengguna',
            photoURL: fbUser.photoURL,
            isGuest: false,
          });
        } else {
          // Check for guest or offline session
          const localSession = localStorage.getItem(LOCAL_USER_KEY);
          if (localSession) {
            try {
              setUser(JSON.parse(localSession));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Offline / Mock Auth Session Check
      const localSession = localStorage.getItem(LOCAL_USER_KEY);
      if (localSession) {
        try {
          setUser(JSON.parse(localSession));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (auth) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      // Mock Login simulation
      await new Promise((res) => setTimeout(res, 600));
      const mockUser: AuthUser = {
        uid: `user_${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        photoURL: null,
        isGuest: false,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    if (auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name,
          photoURL: null,
          isGuest: false,
        });
      }
    } else {
      // Mock Register simulation
      await new Promise((res) => setTimeout(res, 600));
      const mockUser: AuthUser = {
        uid: `user_${Date.now()}`,
        email,
        displayName: name,
        photoURL: null,
        isGuest: false,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const loginWithGoogle = async () => {
    if (auth) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        if (result && result.user) {
          setUser({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Pengguna',
            photoURL: result.user.photoURL,
            isGuest: false,
          });
        }
      } catch (popupErr: any) {
        // If popup is blocked by browser, automatically fallback to redirect
        if (
          popupErr.code === 'auth/popup-blocked' ||
          popupErr.code === 'auth/cancelled-popup-request' ||
          popupErr.message?.includes('popup')
        ) {
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupErr;
      }
    } else {
      // Mock Google Login simulation
      await new Promise((res) => setTimeout(res, 600));
      const mockUser: AuthUser = {
        uid: `google_user_${Date.now()}`,
        email: 'user.demo@gmail.com',
        displayName: 'Google Demo User',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        isGuest: false,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const loginAsGuest = () => {
    const guestUser: AuthUser = {
      uid: 'guest_user',
      email: 'tamu@duitgua.local',
      displayName: 'Tamu Duit Gua',
      photoURL: null,
      isGuest: true,
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      await new Promise((res) => setTimeout(res, 600));
      // Mock success
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseReady,
        login,
        register,
        loginWithGoogle,
        loginAsGuest,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
