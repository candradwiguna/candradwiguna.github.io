import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function RequireAdmin() {
  const { configured, loading, user, isAdmin } = useAuth();
  const location = useLocation();

  if (!configured) return <main className="admin"><p className="eyebrow">Setup required</p><h1>Firebase belum terhubung.</h1><p>Isi `.env.local` dengan Firebase Web Config, lalu jalankan build ulang.</p></main>;
  if (loading) return <main className="admin"><p className="eyebrow">Private area</p><h1>Memeriksa sesi...</h1></main>;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) return <main className="admin"><p className="eyebrow">403 / Forbidden</p><h1>Akun ini bukan admin.</h1><p>Logout dan masuk menggunakan akun admin yang terdaftar.</p></main>;
  return <Outlet />;
}
