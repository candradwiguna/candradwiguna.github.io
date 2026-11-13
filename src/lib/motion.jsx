import { useEffect, useRef, useState } from 'react';

// jsdom dan browser lama tidak punya matchMedia; jangan sampai animasi menggagalkan render.
const prefers = (query) => typeof matchMedia === 'function' && matchMedia(query).matches;

// Satu observer untuk seluruh halaman. Class .in baru dipasang kalau html.animate ada,
// jadi kalau JS gagal konten tetap terlihat (bukan opacity:0 selamanya).
// Elemen yang datang belakangan (hasil fetch Firestore) juga diobserve lewat MutationObserver,
// kalau tidak, konten async tetap opacity:0 dan halaman terlihat kosong.
export function useReveal(dep) {
  useEffect(() => {
    const els = () => [...document.querySelectorAll('[data-reveal]:not(.in)')];
    if (prefers('(prefers-reduced-motion: reduce)') || !('IntersectionObserver' in window)) {
      els().forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    }, { rootMargin: '0px 0px -10% 0px' });
    const watch = () => els().forEach((el) => io.observe(el));
    watch();
    // rAF throttle: jangan querySelectorAll di setiap mutation React.
    let queued = 0;
    const mo = new MutationObserver(() => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; watch(); }); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { if (queued) cancelAnimationFrame(queued); io.disconnect(); mo.disconnect(); };
  }, [dep]);
}

// Nomor section yang sedang di layar; dipakai chip di header.
export function useSectionIndex(ids) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.dataset.section || '');
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids.join()]);
  return active;
}

// Parallax tipis untuk foto profil: dimatikan di mobile dan saat reduced-motion.
export function useParallax(strength = 34) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefers('(prefers-reduced-motion: reduce)') || prefers('(max-width: 700px)')) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight));
      el.style.setProperty('--shift', `${(progress * strength).toFixed(1)}px`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    return () => { removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [strength]);
  return ref;
}

// Gelombang glyph: murni supaya bisa dites tanpa DOM.
export const glyphOffset = (i, t, amp = 1) => Math.sin(i * 0.55 + t) * amp;

const WORDS = 'DESIGN 3D PHOTO CODE TYPE VIDEO ILUSTRASI'.split('');
const NOISE = 'ABCDEFGHIKLMNOPRSTUVWXYZ0123456789';

function GlyphField() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext?.('2d');
    if (!ctx) return;
    const reduce = prefers('(prefers-reduced-motion: reduce)');
    const css = getComputedStyle(document.documentElement);
    const palette = {
      muted: css.getPropertyValue('--muted').trim() || '#72786b',
      accent: css.getPropertyValue('--accent').trim() || '#b65f45',
      serif: css.getPropertyValue('--serif').trim() || 'Georgia, serif'
    };
    let w = 0, h = 0, cols = 0, rows = 0, t = 0, raf = 0, cells = [];

    const layout = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.width; h = box.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cell = w < 700 ? 46 : 34;
      cols = Math.max(6, Math.floor(w / cell));
      rows = Math.max(3, Math.floor(h / (cell * 1.15)));
      cells = Array.from({ length: cols * rows }, (_, i) => WORDS[i % WORDS.length]);
    };

    const paint = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const size = w < 700 ? 18 : 24;
      ctx.font = `500 ${size}px ${palette.serif}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const cw = w / cols, chh = h / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = c + r * cols;
          const amp = 8 + (c % 4) * 5;
          const y = (r + 0.5) * chh + glyphOffset(i * 0.32, t + c * 0.22, amp);
          ctx.fillStyle = i % 17 === 0 ? palette.accent : palette.muted;
          ctx.globalAlpha = i % 17 === 0 ? 0.3 : 0.15;
          ctx.fillText(cells[i], (c + 0.5) * cw, y);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      t += 0.016;
      if (Math.random() < 0.5) cells[Math.floor(Math.random() * cells.length)] = NOISE[Math.floor(Math.random() * NOISE.length)];
      paint();
      raf = requestAnimationFrame(loop);
    };

    layout();
    if (reduce) { paint(); }
    else {
      // tunggu webfont siap, kalau tidak glyph tergambar dengan font fallback
      Promise.resolve(document.fonts?.ready).then(() => { layout(); paint(); raf = requestAnimationFrame(loop); });
    }

    const onResize = () => { layout(); paint(); };
    addEventListener('resize', onResize);
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reduce && !raf) raf = requestAnimationFrame(loop);
      if (!entry.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
    }) : null;
    io?.observe(canvas);
    return () => { if (raf) cancelAnimationFrame(raf); io?.disconnect(); removeEventListener('resize', onResize); };
  }, []);
  return <canvas className="glyph-field" ref={ref} aria-hidden="true" />;
}

const MARQUEE = ['Design', 'Ilustrasi', '3D', 'Photography', 'Automation', 'Video'];

function Marquee() {
  return <div className="marquee" aria-hidden="true"><div>{[...MARQUEE, ...MARQUEE].map((word, i) => <span key={i}>{word}<b>·</b></span>)}</div></div>;
}

export { GlyphField, Marquee };
