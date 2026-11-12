import { useEffect, useState } from 'react';
import { getSiteSettings } from './repository';

// Font dimuat on demand lewat <link>; pasangan default sudah ada di @import styles.css.
export const FONT_PAIRS = [
  { id: 'editorial', label: 'Editorial — DM Serif Display / Manrope', serif: "'DM Serif Display',Georgia,serif", sans: 'Manrope,Arial,sans-serif', href: '' },
  { id: 'klasik', label: 'Klasik — Playfair Display / Inter', serif: "'Playfair Display',Georgia,serif", sans: 'Inter,Arial,sans-serif', href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap' },
  { id: 'modern', label: 'Modern — Fraunces / Work Sans', serif: 'Fraunces,Georgia,serif', sans: "'Work Sans',Arial,sans-serif", href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400&family=Work+Sans:wght@400;500;600&display=swap' },
  { id: 'tegas', label: 'Tegas — Space Grotesk', serif: "'Space Grotesk',Arial,sans-serif", sans: "'Space Grotesk',Arial,sans-serif", href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap' }
];

export const SECTIONS = [['hero', 'Hero / headline'], ['bio', 'Biography'], ['paths', 'Selected paths'], ['contact', 'Contact']];

export const DEFAULT_CONTACT = {
  email: 'dwiguna.candra@gmail.com',
  whatsapp: '6289616424972',
  instagram: 'https://www.instagram.com/candradwig/',
  illustrationInstagram: 'https://www.instagram.com/canillustration/',
  photographyInstagram: 'https://www.instagram.com/cndrdwgn/'
};

export const DEFAULT_SITE = {
  theme: { paper: '#f4f0e8', ink: '#1e2421', muted: '#72786b', accent: '#b65f45', line: '#d6d0c4', font: 'editorial', density: 1, radius: 0 },
  hidden: {},
  hero: {
    eyebrow: '01 / Candra Dwiguna',
    headline: 'Creative work, technical thinking,',
    accent: 'useful outcomes.',
    lede: 'Multi-disciplinary creative and technical specialist working across design, illustration, 3D, photography, video, websites, and automation.'
  },
  bio: {
    eyebrow: '02 / How I work',
    statement: 'I move between the visual and the practical. A good result should be clear enough to understand, considered enough to remember, and useful enough to keep.'
  },
  profile: { image: '/profile.jpg', alt: 'Foto profil Candra Dwiguna' }
};

const HEX = /^#[0-9a-f]{3,8}$/i;
const text = (value, fallback) => (typeof value === 'string' ? value : fallback);
const bounded = (value, min, max, fallback) => (Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback);

export function resolveContact(raw = {}) {
  return Object.fromEntries(Object.keys(DEFAULT_CONTACT).map((key) => [key, text(raw?.[key], DEFAULT_CONTACT[key])]));
}

export function resolveSite(raw = {}) {
  const theme = raw.theme || {};
  const color = (key) => (HEX.test(theme[key] || '') ? theme[key] : DEFAULT_SITE.theme[key]);
  const hero = raw.hero || {};
  const bio = raw.bio || {};
  const profile = raw.profile || {};
  return {
    theme: {
      paper: color('paper'), ink: color('ink'), muted: color('muted'), accent: color('accent'), line: color('line'),
      font: FONT_PAIRS.some((pair) => pair.id === theme.font) ? theme.font : DEFAULT_SITE.theme.font,
      density: bounded(theme.density, 0.85, 1.25, 1),
      radius: bounded(theme.radius, 0, 32, 0)
    },
    hidden: Object.fromEntries(SECTIONS.filter(([id]) => raw.hidden?.[id] === true).map(([id]) => [id, true])),
    hero: {
      eyebrow: text(hero.eyebrow, DEFAULT_SITE.hero.eyebrow),
      headline: text(hero.headline, DEFAULT_SITE.hero.headline),
      accent: text(hero.accent, DEFAULT_SITE.hero.accent),
      lede: text(hero.lede, DEFAULT_SITE.hero.lede)
    },
    bio: { eyebrow: text(bio.eyebrow, DEFAULT_SITE.bio.eyebrow), statement: text(bio.statement, DEFAULT_SITE.bio.statement) },
    profile: { image: text(profile.image, DEFAULT_SITE.profile.image), alt: text(profile.alt, DEFAULT_SITE.profile.alt) }
  };
}

export function applyTheme(theme) {
  const style = document.documentElement.style;
  ['paper', 'ink', 'muted', 'accent', 'line'].forEach((key) => style.setProperty(`--${key}`, theme[key]));
  style.setProperty('--density', theme.density);
  style.setProperty('--radius', `${theme.radius}px`);
  const pair = FONT_PAIRS.find((item) => item.id === theme.font) || FONT_PAIRS[0];
  style.setProperty('--serif', pair.serif);
  style.setProperty('--sans', pair.sans);
  if (pair.href && !document.querySelector(`link[data-font="${pair.id}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = pair.href;
    link.dataset.font = pair.id;
    document.head.append(link);
  }
}

export function useSite() {
  const [site, setSite] = useState(() => ({ ...resolveSite(), contact: DEFAULT_CONTACT }));
  useEffect(() => {
    getSiteSettings()
      .then((all) => setSite({ ...resolveSite(all.settings), contact: resolveContact(all.contact) }))
      .catch(() => {}); // offline / Firebase belum dikonfigurasi: tetap pakai default
  }, []);
  useEffect(() => { applyTheme(site.theme); }, [site]);
  return site;
}
