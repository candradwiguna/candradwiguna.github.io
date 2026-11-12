// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';

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
  });
});
