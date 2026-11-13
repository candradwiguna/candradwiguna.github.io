// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { normalizeImagePath, projectImages } from './repository';

describe('normalizeImagePath', () => {
  it('turns every Drive link shape into a hotlinkable thumbnail URL', () => {
    expect(normalizeImagePath('https://drive.google.com/file/d/ABC123/view?usp=sharing')).toBe('https://drive.google.com/thumbnail?id=ABC123&sz=w2000');
    expect(normalizeImagePath('https://drive.google.com/open?id=ABC123')).toBe('https://drive.google.com/thumbnail?id=ABC123&sz=w2000');
    expect(normalizeImagePath('https://drive.google.com/uc?export=view&id=ABC123')).toBe('https://drive.google.com/thumbnail?id=ABC123&sz=w2000');
  });

  it('leaves repo paths and other URLs alone', () => {
    expect(normalizeImagePath('portofolio/design/a.jpg')).toBe('/portofolio/design/a.jpg');
    expect(normalizeImagePath('portofolio / design / a.jpg')).toBe('/portofolio/design/a.jpg');
    expect(normalizeImagePath('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    expect(normalizeImagePath('')).toBe('');
    expect(normalizeImagePath(undefined)).toBeUndefined();
  });
});

describe('projectImages', () => {
  it('keeps every stored image and normalises Drive links inside the list', () => {
    expect(projectImages({ images: ['portofolio/a.jpg', 'https://drive.google.com/file/d/XYZ/view'] })).toEqual([
      '/portofolio/a.jpg',
      'https://drive.google.com/thumbnail?id=XYZ&sz=w2000'
    ]);
  });

  it('falls back to the legacy single image so old projects keep working', () => {
    expect(projectImages({ image: 'portofolio/lama.jpg' })).toEqual(['/portofolio/lama.jpg']);
    expect(projectImages({ image: 'portofolio/lama.jpg', images: [] })).toEqual(['/portofolio/lama.jpg']);
    expect(projectImages({})).toEqual([]);
    expect(projectImages(undefined)).toEqual([]);
  });
});
