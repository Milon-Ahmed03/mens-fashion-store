// লগইন অবস্থা: Firebase দিয়ে Customer লগইন, তারপর Backend থেকে JWT নেওয়া
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import api, { errMsg } from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const FIREBASE_ERRORS = {
  'auth/invalid-credential': 'Invalid email or password',
  'auth/wrong-password': 'Invalid email or password',
  'auth/user-not-found': 'No account found with this email',
  'auth/email-already-in-use': 'This email is already registered',
  'auth/weak-password': 'Password must be at least 6 characters',
  'auth/invalid-email': 'Please enter a valid email',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled',
  'auth/too-many-requests': 'Too many attempts. Please try again later',
  'auth/network-request-failed': 'Network error. Check your internet connection',
};
export const authError = (e) => FIREBASE_ERRORS[e?.code] || errMsg(e);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveSession = ({ token, user: u }) => {
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  };

  const logout = useCallback(async () => {
    localStorage.removeItem('token');
    setUser(null);
    if (auth) await signOut(auth).catch(() => {});
  }, []);

  // পেজ রিলোডে আগের লগইন ফিরিয়ে আনে
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth-expired', handler);
    return () => window.removeEventListener('auth-expired', handler);
  }, [logout]);

  const needFirebase = () => {
    if (!auth) throw new Error('Firebase is not configured. Add REACT_APP_FIREBASE_API_KEY in frontend/.env');
  };

  // Firebase Token পাঠিয়ে Backend থেকে আমাদের JWT নেয়
  const syncWithBackend = async (cred, name) => {
    try {
      const idToken = await cred.user.getIdToken();
      const { data } = await api.post('/auth/firebase-login', { idToken, name });
      return saveSession(data);
    } catch (e) {
      await signOut(auth).catch(() => {});
      throw e;
    }
  };

  const register = async (name, email, password) => {
    needFirebase();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name }).catch(() => {});
    return syncWithBackend(cred, name);
  };

  const login = async (email, password) => {
    needFirebase();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return syncWithBackend(cred);
  };

  const googleLogin = async () => {
    needFirebase();
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    return syncWithBackend(cred);
  };

  const resetPassword = async (email) => {
    needFirebase();
    await sendPasswordResetEmail(auth, email);
  };

  const adminLogin = async (email, password) => {
    const { data } = await api.post('/auth/admin-login', { email, password });
    return saveSession(data);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, register, login, googleLogin, resetPassword, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
