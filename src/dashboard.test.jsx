// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import { uploadConfigured } from './lib/cloudinary';

vi.mock('./auth/AuthProvider', () => ({ useAuth: () => ({ user: { email: 'admin@example.com' }, logout: () => {} }) }));
vi.mock('./lib/repository', () => ({
  listProjects: () => Promise.resolve([]),
  saveProject: vi.fn(), removeProject: vi.fn(),
  getSiteSettings: () => Promise.resolve({ settings: { theme: { accent: '#123456' } }, contact: { email: 'me@example.com' } }),
  saveSiteSettings: vi.fn()
}));

describe('admin dashboard', () => {
  it('shows the display settings editor alongside projects and contact', async () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Tampilan & isi halaman utama/)).toBeTruthy());
    expect(screen.getByLabelText('Judul project')).toBeTruthy();
    expect(screen.getByLabelText('Email').value).toBe('me@example.com');
    expect(screen.getByRole('button', { name: 'Simpan tampilan' })).toBeTruthy();
    expect(document.querySelectorAll('form').length).toBe(3);
    // Kontrol upload hanya muncul kalau env Cloudinary ada; jumlahnya ikut flag supaya tes
    // tidak bergantung pada .env.local yang dipakai saat menjalankan tes secara lokal.
    // Dua kontrol upload: gambar project (boleh banyak) dan thumbnail video.
    expect(document.querySelectorAll('input[type="file"]').length).toBe(uploadConfigured ? 2 : 0);
    expect(screen.getByLabelText('Tambah gambar: path repo atau link Google Drive')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Tambahkan' })).toBeTruthy();
    expect(screen.getByLabelText('Tampilan kalau gambar lebih dari satu').value).toBe('swipe');
  });
});
