// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

// main.jsx hanya bisa di-mount sekali per berkas tes, jadi tes video dipisah ke berkas sendiri.
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

describe('sematan video Google Drive', () => {
  it('renders the Drive player, the thumbnail and the link, and stays away from projects without video', async () => {
    state.projects = [
      project({ videoUrl: 'https://drive.google.com/file/d/ABC123/view', videoThumbnail: '/thumb.jpg', videoDuration: '00:15', videoRole: 'Concept' }),
      project({ id: 'p2', image: '/b.jpg' })
    ];
    document.body.innerHTML = '<div id="root"></div>';
    window.history.pushState({}, '', '/content-creator-video');
    await import('./main');
    await waitFor(() => expect(document.querySelector('.public-project')).toBeTruthy());

    const frames = document.querySelectorAll('.video-preview iframe');
    expect(frames.length).toBe(1);
    expect(frames[0].getAttribute('src')).toBe('https://drive.google.com/file/d/ABC123/preview');
    expect(document.querySelector('.video-preview img').getAttribute('src')).toBe('/thumb.jpg');
    expect(document.querySelector('.video-preview .text-link').getAttribute('href')).toBe('https://drive.google.com/file/d/ABC123/view');
    expect(document.querySelectorAll('.public-project')[1].querySelector('.video-preview')).toBeNull();
  });
});
