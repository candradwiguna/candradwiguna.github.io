// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Modul membaca import.meta.env saat di-import, jadi env di-stub dulu lalu modul di-import ulang.
async function load(cloud, preset) {
  vi.resetModules();
  vi.stubEnv('VITE_CLOUDINARY_CLOUD', cloud);
  vi.stubEnv('VITE_CLOUDINARY_PRESET', preset);
  return import('./cloudinary');
}

describe('uploadImage', () => {
  beforeEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('posts the file with the unsigned preset and returns a delivery-optimised URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ secure_url: 'https://res.cloudinary.com/demo/image/upload/v1712/portfolio/foto.jpg' })
    });
    vi.stubGlobal('fetch', fetchMock);
    const { uploadImage, uploadConfigured } = await load('demo', 'portofolio');
    expect(uploadConfigured).toBe(true);

    const url = await uploadImage(new File(['x'], 'foto.jpg', { type: 'image/jpeg' }));
    expect(url).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1600/v1712/portfolio/foto.jpg');
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe('https://api.cloudinary.com/v1_1/demo/image/upload');
    expect(options.method).toBe('POST');
    expect(options.body.get('upload_preset')).toBe('portofolio');
    expect(options.body.get('file')).toBeInstanceOf(File);
  });

  it('surfaces the Cloudinary error message and rejects without config', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400, json: () => Promise.resolve({ error: { message: 'Upload preset not found' } }) }));
    const configured = await load('demo', 'salah');
    await expect(configured.uploadImage(new File(['x'], 'a.jpg', { type: 'image/jpeg' }))).rejects.toThrow('Upload preset not found');

    const unconfigured = await load(undefined, undefined);
    expect(unconfigured.uploadConfigured).toBe(false);
    await expect(unconfigured.uploadImage(new File(['x'], 'a.jpg', { type: 'image/jpeg' }))).rejects.toThrow('belum dikonfigurasi');
  });
});
