// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

vi.mock('./lib/repository', () => ({
  getSiteSettings: () => Promise.resolve({
    settings: { theme: { accent: '#ff0000', density: 1.2, font: 'modern' }, hidden: { hero: true }, hero: { headline: 'Halo dari admin' } },
    contact: { email: 'me@example.com' }
  }),
  listProjects: () => Promise.resolve([]),
  saveProject: vi.fn(), removeProject: vi.fn(), saveSiteSettings: vi.fn()
}));

describe('home page reads settings', () => {
  it('hides the hero, applies the theme and shows the saved headline and contact', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    window.history.pushState({}, '', '/');
    await import('./main');
    await waitFor(() => expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#ff0000'));
    expect(document.querySelector('.hero')).toBeNull();
    expect(document.documentElement.style.getPropertyValue('--sans')).toContain('Work Sans');
    expect(document.documentElement.style.getPropertyValue('--density')).toBe('1.2');
    expect(screen.getByRole('link', { name: 'me@example.com' }).getAttribute('href')).toBe('mailto:me@example.com');
  });
});
