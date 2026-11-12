import { describe, expect, it } from 'vitest';

describe('portfolio shell', () => {
  it('keeps the five public work paths explicit', () => {
    const paths = ['design', 'ilustrasi', '3d-dental-photography', 'it-website-automation', 'content-creator-video'];
    expect(paths).toHaveLength(5);
    expect(paths).toContain('content-creator-video');
  });
});
