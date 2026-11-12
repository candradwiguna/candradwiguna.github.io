import { describe, expect, it } from 'vitest';
import { DEFAULT_SITE, resolveContact, resolveSite } from './site';

describe('site settings', () => {
  it('falls back to defaults when Firestore is empty', () => {
    expect(resolveSite().hero.headline).toBe(DEFAULT_SITE.hero.headline);
    expect(resolveSite({}).theme.accent).toBe(DEFAULT_SITE.theme.accent);
    expect(resolveContact(null).email).toBe('dwiguna.candra@gmail.com');
  });

  it('keeps valid values and rejects bad colors, fonts and ranges', () => {
    const site = resolveSite({
      theme: { accent: '#123456', font: 'nope', density: 99, radius: -4 },
      hidden: { hero: true, contact: 'yes' },
      hero: { headline: '' }
    });
    expect(site.theme.accent).toBe('#123456');
    expect(site.theme.font).toBe(DEFAULT_SITE.theme.font);
    expect(site.theme.density).toBe(1.25);
    expect(site.theme.radius).toBe(0);
    expect(site.hidden).toEqual({ hero: true });
    expect(site.hero.headline).toBe('');
  });
});
