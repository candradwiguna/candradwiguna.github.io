import React, { useEffect, useState } from 'react';
import { getSiteSettings, saveSiteSettings } from '../lib/repository';
import { DEFAULT_SITE, FONT_PAIRS, SECTIONS, applyTheme, resolveSite } from '../lib/site';

const fields = [
  ['hero.eyebrow', 'Eyebrow hero'], ['hero.headline', 'Headline utama'], ['hero.accent', 'Headline aksen (italic)'], ['hero.lede', 'Deskripsi hero', 'textarea'],
  ['bio.eyebrow', 'Eyebrow biography'], ['bio.statement', 'Biography / statement', 'textarea'],
  ['profile.image', 'Foto profil (path repository)'], ['profile.alt', 'Alt text foto']
];

export default function SiteSettings() {
  const [site, setSite] = useState(DEFAULT_SITE);
  const [status, setStatus] = useState('');

  useEffect(() => { getSiteSettings().then((all) => setSite(resolveSite(all.settings))).catch(() => {}); }, []);
  useEffect(() => { applyTheme(site.theme); }, [site.theme]); // preview langsung

  const set = (path, value) => setSite((current) => {
    const [group, key] = path.split('.');
    return { ...current, [group]: { ...current[group], [key]: value } };
  });
  const setTheme = (key, value) => setSite((current) => ({ ...current, theme: { ...current.theme, [key]: value } }));
  const toggle = (id) => setSite((current) => ({ ...current, hidden: { ...current.hidden, [id]: !current.hidden[id] } }));

  async function save(event) {
    event.preventDefault();
    // merge:true menggabungkan map nested, jadi hidden harus dikirim lengkap agar uncheck benar-benar tersimpan
    const hidden = Object.fromEntries(SECTIONS.map(([id]) => [id, Boolean(site.hidden[id])]));
    try { await saveSiteSettings('settings', { ...site, hidden }); setStatus('Tampilan tersimpan.'); } catch (error) { setStatus(error.message); }
  }
  async function reset() { setSite(resolveSite({})); setStatus('Dikembalikan ke default. Simpan untuk menerapkan.'); }

  return <form className="settings-editor" onSubmit={save}>
    <p className="eyebrow">Tampilan & isi halaman utama</p>

    <fieldset><legend>Palette</legend><div className="swatches">
      {['paper', 'ink', 'muted', 'accent', 'line'].map((key) => <label key={key}>{key}<input type="color" value={site.theme[key]} onChange={(e) => setTheme(key, e.target.value)} /></label>)}
    </div></fieldset>

    <fieldset><legend>Tipografi & bentuk</legend>
      <label htmlFor="set-font">Font</label>
      <select id="set-font" value={site.theme.font} onChange={(e) => setTheme('font', e.target.value)}>{FONT_PAIRS.map((pair) => <option key={pair.id} value={pair.id}>{pair.label}</option>)}</select>
      <label htmlFor="set-density">Spacing / density: {site.theme.density.toFixed(2)}×</label>
      <input id="set-density" type="range" min="0.85" max="1.25" step="0.05" value={site.theme.density} onChange={(e) => setTheme('density', Number(e.target.value))} />
      <label htmlFor="set-radius">Radius sudut: {site.theme.radius}px</label>
      <input id="set-radius" type="range" min="0" max="32" step="1" value={site.theme.radius} onChange={(e) => setTheme('radius', Number(e.target.value))} />
    </fieldset>

    <fieldset><legend>Section</legend>
      {SECTIONS.map(([id, label]) => <label className="check" key={id}><input type="checkbox" checked={!site.hidden[id]} onChange={() => toggle(id)} /> Tampilkan {label}</label>)}
    </fieldset>

    <fieldset><legend>Headline, biography & foto</legend>
      {fields.map(([path, label, type]) => <React.Fragment key={path}>
        <label htmlFor={`set-${path}`}>{label}</label>
        {type === 'textarea'
          ? <textarea id={`set-${path}`} rows="3" value={path.split('.').reduce((v, k) => v?.[k] ?? '', site)} onChange={(e) => set(path, e.target.value)} />
          : <input id={`set-${path}`} value={path.split('.').reduce((v, k) => v?.[k] ?? '', site)} onChange={(e) => set(path, e.target.value)} />}
      </React.Fragment>)}
    </fieldset>

    <div className="form-actions"><button type="submit">Simpan tampilan</button><button type="button" className="secondary" onClick={reset}>Pakai default</button></div>
    {status && <p className="dashboard-status" role="status">{status}</p>}
  </form>;
}
