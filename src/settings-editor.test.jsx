// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SiteSettings from './pages/SiteSettings';

const saveSiteSettings = vi.fn(() => Promise.resolve());
vi.mock('./lib/repository', () => ({
  getSiteSettings: () => Promise.resolve({ settings: { theme: { accent: '#ff0000', radius: 12 }, hidden: { paths: true }, hero: { headline: 'Halo' } }, contact: {} }),
  saveSiteSettings: (...args) => saveSiteSettings(...args)
}));

describe('site settings editor', () => {
  it('loads saved values, previews them live and saves the whole document', async () => {
    render(<SiteSettings />);
    await waitFor(() => expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#ff0000'));
    expect(screen.getByLabelText(/Headline utama/).value).toBe('Halo');
    expect(screen.getByLabelText(/Tampilkan Selected paths/).checked).toBe(false);
    expect(document.querySelectorAll('input[type=color]')).toHaveLength(5);
    expect(screen.getByLabelText('Font').tagName).toBe('SELECT');
    expect(screen.getByLabelText(/Spacing \/ density/)).toBeTruthy();
    expect(screen.getByLabelText(/Radius sudut/)).toBeTruthy();
    expect(document.querySelectorAll('.check input[type=checkbox]')).toHaveLength(4);
    ['Eyebrow hero', 'Headline aksen (italic)', 'Deskripsi hero', 'Biography / statement', 'Foto profil (path repository)', 'Alt text foto']
      .forEach((label) => expect(screen.getByLabelText(label)).toBeTruthy());

    fireEvent.input(screen.getByLabelText(/Radius sudut/), { target: { value: '20' } });
    expect(document.documentElement.style.getPropertyValue('--radius')).toBe('20px');

    fireEvent.click(screen.getByLabelText(/Tampilkan Hero/));
    fireEvent.click(screen.getByRole('button', { name: 'Simpan tampilan' }));

    await waitFor(() => expect(saveSiteSettings).toHaveBeenCalled());
    const [id, payload] = saveSiteSettings.mock.calls[0];
    expect(id).toBe('settings');
    expect(payload.theme).toEqual(expect.objectContaining({ accent: '#ff0000', radius: 20 }));
    expect(payload.hidden).toEqual({ hero: true, bio: false, paths: true, contact: false });
    expect(payload.hero.headline).toBe('Halo');
  });
});
