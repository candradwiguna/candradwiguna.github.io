import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

function firebaseMessage(error) {
  const messages = {
    'auth/invalid-credential': 'Email atau password salah.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu beberapa saat.',
    'auth/network-request-failed': 'Koneksi gagal. Periksa internet lalu coba lagi.'
  };
  return messages[error?.code] || error?.message || 'Login gagal. Coba lagi.';
}

export default function AdminLogin() {
  const { configured, isAdmin, loading, login, logout, user } = useAuth();
  const [email, setEmail] = useState('dwigunacandra7@gmail.com');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('');
    setBusy(true);
    try {
      const result = await login(email, password);
      if (result.user.email?.toLowerCase() !== 'dwigunacandra7@gmail.com') {
        await logout();
        throw new Error('Akun berhasil login, tetapi tidak memiliki akses admin.');
      }
      navigate(location.state?.from || '/admin/dashboard', { replace: true });
    } catch (error) {
      setStatus(firebaseMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <><Header /><main className="admin"><p className="eyebrow">Private area</p><h1>Memeriksa sesi...</h1></main></>;
  if (user && isAdmin) return <><Header /><main className="admin"><p className="eyebrow">Authenticated</p><h1>Anda sudah login.</h1><p>{user.email}</p><Link className="text-link" to="/admin/dashboard">Buka dashboard</Link></main></>;

  return <><Header /><main className="admin"><p className="eyebrow">Private area</p><h1>Admin editor</h1>{!configured && <p className="form-error" role="alert">Firebase belum dikonfigurasi. Isi `.env.local`, lalu jalankan build ulang.</p>}<form className="login-form" onSubmit={handleSubmit}><label htmlFor="admin-email">Email admin</label><input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="submit" disabled={busy || !configured}>{busy ? 'Memeriksa...' : 'Masuk ke editor'}</button>{status && <p className="form-error" role="alert">{status}</p>}</form><Link className="text-link" to="/">Back to portfolio</Link></main></>;
}

function Header() { return <header className="site-header"><Link className="wordmark" to="/">Candra Dwiguna<span>.</span></Link><nav aria-label="Main navigation"><Link to="/">Index</Link><a href="/#contact">Contact</a></nav></header>; }
