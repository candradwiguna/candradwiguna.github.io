// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

// Repository di-mock supaya halaman kategori bisa dirender dengan data gambar yang kita atur.
const state = vi.hoisted(() => ({ projects: [] }));
vi.mock('./lib/repository', () => ({
  getSiteSettings: () => Promise.resolve({ settings: {}, contact: {} }),
  listProjects: () => Promise.resolve(state.projects),
  projectImages: (item) => (item.images?.length ? item.images : [item.image].filter(Boolean)),
  saveProject: vi.fn(), removeProject: vi.fn(), saveSiteSettings: vi.fn()
}));

const project = (over = {}) => ({
  id: 'p1', title: 'Judul', summary: 'Ringkasan', category: 'content-creator-video',
  published: true, image: '/sampul.jpg', imageAlt: 'Alt contoh', ...over
});

async function renderCategory(projects) {
  state.projects = projects;
  document.body.innerHTML = '<div id="root"></div>';
  window.history.pushState({}, '', '/content-creator-video');
  vi.resetModules(); // main.jsx hanya bisa mount sekali per instance modul
  await import('./main');
  await waitFor(() => expect(document.querySelector('.public-project')).toBeTruthy());
}

describe('banyak gambar per project', () => {
  it('shows a swipe gallery with one image per view and a label for screen readers', async () => {
    await renderCategory([project({ images: ['/a.jpg', '/b.jpg', '/c.jpg'], imageLayout: 'swipe' })]);
    const gallery = document.querySelector('.gallery');
    expect(gallery).toBeTruthy();
    expect(document.querySelector('.collage')).toBeNull();
    expect(gallery.getAttribute('aria-label')).toBe('3 gambar, geser ke samping');
    const alts = [...gallery.querySelectorAll('img')].map((i) => i.getAttribute('alt'));
    expect(alts).toEqual(['Alt contoh 1', 'Alt contoh 2', 'Alt contoh 3']);
    // Gambar pertama memakai src sampul, sisanya daftar images.
    expect(gallery.querySelector('img').getAttribute('src')).toBe('/a.jpg');
    // Titik penanda geser: satu tombol per gambar, yang aktif ditandai aria-current.
    const dots = document.querySelectorAll('.gallery-dots button');
    expect(dots.length).toBe(3);
    expect([...dots].map((d) => d.getAttribute('aria-label'))).toEqual(['Gambar 1 dari 3', 'Gambar 2 dari 3', 'Gambar 3 dari 3']);
    expect(dots[0].getAttribute('aria-current')).toBe('true');
    expect(dots[2].getAttribute('aria-current')).toBe('false');
  });

  it('uses the collage grid when the project asks for it', async () => {
    await renderCategory([project({ images: ['/a.jpg', '/b.jpg', '/c.jpg', '/d.jpg'], imageLayout: 'collage' })]);
    const collage = document.querySelector('.collage');
    expect(collage).toBeTruthy();
    expect(collage.querySelectorAll('img').length).toBe(4);
    expect(document.querySelector('.gallery')).toBeNull();
    expect(collage.getAttribute('aria-label')).toBeNull();
    expect(document.querySelector('.gallery-dots')).toBeNull();
  });

  it('breaks a long summary into paragraphs on blank lines and keeps single line breaks', async () => {
    await renderCategory([project({ summary: 'Paragraf satu\nmasih paragraf satu.\n\nParagraf dua.\n\n\nParagraf tiga.', image: '/a.jpg' })]);
    const body = [...document.querySelectorAll('.public-project p:not(.eyebrow)')];
    expect(body.map((p) => p.textContent)).toEqual([
      'Paragraf satu\nmasih paragraf satu.',
      'Paragraf dua.',
      'Paragraf tiga.'
    ]);
    // Satu paragraf tetap satu <p> walau di dalamnya ada enter tunggal.
    expect(body[0].textContent).toContain('\n');
  });

  it('keeps a single image as a plain img, including legacy projects with only `image`', async () => {
    await renderCategory([project({ image: '/lama.jpg' })]);
    expect(document.querySelector('.gallery, .collage, .gallery-dots')).toBeNull();
    const img = document.querySelector('.public-project > img');
    expect(img.getAttribute('src')).toBe('/lama.jpg');
  });
});
