import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { adminEmail, auth, firebaseConfigured } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    configured: firebaseConfigured,
    isAdmin: Boolean(user?.email && user.email.toLowerCase() === adminEmail.toLowerCase()),
    login: (email, password) => {
      if (!auth) return Promise.reject(new Error('Firebase belum dikonfigurasi. Isi .env.local lalu build ulang.'));
      return signInWithEmailAndPassword(auth, email.trim(), password);
    },
    logout: () => auth ? signOut(auth) : Promise.resolve()
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return context;
}
