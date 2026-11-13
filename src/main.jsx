import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { listProjects, projectImages } from './lib/repository';
import { BrowserRouter, Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import AdminLoginPage from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import RequireAdmin from './auth/RequireAdmin';
import { useSite } from './lib/site';
import { GlyphField, Marquee, useParallax, useReveal, useSectionIndex } from './lib/motion';
import './styles.css';

const categories = [
  ['design', 'Design', 'Brand identity, visual systems, layout, and communication.'],
  ['ilustrasi', 'Ilustrasi', 'Illustration and visual storytelling with a personal hand.'],
  ['3d-dental-photography', '3D / Dental Photography', 'Technical visual work from dental design, 3D, and photography.'],
  ['it-website-automation', 'IT / Website / Automation', 'Websites, support, systems, and practical automation.'],
  ['content-creator-video', 'Content Creator Video', 'Short-form video, editing, motion, and content workflows.']
];

// Kata demi kata supaya headline naik berurutan; spasi tetap text node agar baris bisa dipatahkan.
const words = (text, delay = 0) => String(text).split(' ').map((word, i) => (
  <React.Fragment key={i}><span data-reveal style={{ transitionDelay: `${delay + i * 70}ms` }}>{word}</span>{' '}</React.Fragment>
));

function Header({ hiddenContact, active }) {
  return <header className="site-header"><Link className="wordmark" to="/">Candra Dwiguna<span>.</span></Link><nav aria-label="Main navigation">{active && <span className="section-chip" aria-hidden="true">{active}</span>}<Link to="/">Index</Link>{!hiddenContact && <a href="#contact">Contact</a>}<Link to="/admin/login">Admin</Link></nav></header>;
}
const contactLinks = (c) => [['mailto:' + c.email, c.email], [`https://wa.me/${c.whatsapp}`, 'WhatsApp'], [c.instagram, 'Instagram / personal'], [c.illustrationInstagram, 'Instagram / illustration'], [c.photographyInstagram, 'Instagram / photography']];
const drivePreviewUrl = (url = '') => { const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/); return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url; };
const driveFileId = (url = '') => (url.match(/drive\.google\.com\/file\/d\/([^/]+)/) || [])[1];

// Drive tidak memberi tahu rasio video, jadi orientasinya ditebak dari thumbnail resminya.
// Tinggi kotak dihitung dari lebar terukur, bukan diserahkan ke aspect-ratio: Safari lama
// mengabaikannya pada iframe dan jatuh ke tinggi default 150px, sehingga video vertikal
// tampil kecil dengan pita hitam lebar di kiri-kanan.
function VideoFrame({ url, title }) {
  const [portrait, setPortrait] = useState(false);
  const [height, setHeight] = useState(0);
  const box = useRef(null);
  useEffect(() => {
    const id = driveFileId(url); if (!id) return; let alive = true;
    const probe = new Image();
    probe.onload = () => { if (alive) setPortrait(probe.naturalHeight > probe.naturalWidth); };
    probe.onerror = () => { if (alive) probe.src = `https://drive.google.com/thumbnail?id=${id}`; };
    probe.src = `https://drive.google.com/thumbnail?id=${id}&sz=w64`;
    return () => { alive = false; };
  }, [url]);
  useEffect(() => {
    const measure = () => setHeight(box.current ? Math.round(box.current.clientWidth * (portrait ? 16 / 9 : 9 / 16)) : 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [portrait]);
  return <span ref={box} className={portrait ? 'video-box portrait' : 'video-box'}>
    <iframe title={`Video ${title}`} src={drivePreviewUrl(url)} style={height ? { height: `${height}px` } : undefined} allow="autoplay" loading="lazy"></iframe>
  </span>;
}
// Banyak gambar per project: "gallery" menggeser satu per satu, "collage" menaruh gambar
// pertama selebar kolom lalu sisanya berdampingan. Satu gambar tetap seperti sebelumnya.
function ProjectImages({ project }) {
  const [cover, ...rest] = projectImages(project);
  const [active, setActive] = useState(0);
  const strip = useRef(null);
  if (!cover) return null;
  const alt = project.imageAlt || project.title;
  if (!rest.length) return <img src={cover} loading="lazy" alt={alt} />;
  const layout = project.imageLayout === 'collage' ? 'collage' : 'gallery';
  const slides = [cover, ...rest];
  const count = slides.length;
  // Titik penanda: memberi tahu bahwa gambarnya bisa digeser dan sekarang di gambar ke berapa.
  const goTo = (index) => {
    const el = strip.current; if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: el.children[index].offsetLeft - el.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  };
  const track = (e) => {
    const el = e.currentTarget;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let found = 0;
    // offsetLeft diukur dari offsetParent yang sama, jadi harus dikurangi offset kotaknya dulu
    // supaya sebanding dengan scrollLeft; tanpa itu titik aktif selalu tertinggal satu gambar.
    [...el.children].forEach((slide, i) => {
      if (slide.offsetLeft - el.offsetLeft + slide.offsetWidth / 2 <= mid) found = i;
    });
    setActive(found);
  };
  const dots = layout === 'gallery' && <nav className="gallery-dots" aria-label={`Navigasi gambar, ${count} gambar`}>
    {slides.map((_, i) => <button key={i} type="button" aria-current={i === active} aria-label={`Gambar ${i + 1} dari ${count}`} onClick={() => goTo(i)} />)}
  </nav>;
  return <><div className={layout} ref={strip} onScroll={layout === 'gallery' ? track : undefined} data-count={count} {...(layout === 'gallery' ? { role: 'group', 'aria-label': `${count} gambar, geser ke samping` } : {})}>
    {slides.map((src, i) => <img key={src + i} src={src} loading={i ? 'lazy' : undefined} alt={`${alt} ${i + 1}`} />)}
  </div>{dots}</>;
}

function Contact({ contact }) {
  return <section id="contact" data-section="05 / Contact" className="contact"><p className="eyebrow" data-reveal>05 / Contact</p><h2 data-reveal>Let’s make the next useful thing.</h2><div className="contact-links" data-reveal>{contactLinks(contact).filter(([href]) => href).map(([href, label]) => <a key={label} href={href} {...(href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noreferrer' })}>{label}</a>)}</div></section>;
}
function Home() {
  const site = useSite();
  const parallax = useParallax();
  const active = useSectionIndex(['hero', 'bio', 'paths', 'contact']);
  useReveal();
  return <><Header hiddenContact={site.hidden.contact} active={active} /><main>{!site.hidden.hero && <section id="hero" data-section="01 / Intro" className="hero"><GlyphField /><div><p className="eyebrow" data-reveal>{site.hero.eyebrow}</p><h1>{words(site.hero.headline)}{site.hero.accent && <em>{words(site.hero.accent, 120)}</em>}</h1>{site.hero.lede && <p className="lede" data-reveal>{site.hero.lede}</p>}</div>{site.profile.image && <img ref={parallax} className="profile" src={site.profile.image} width="640" height="800" fetchPriority="high" alt={site.profile.alt} data-reveal />}</section>}<Marquee />{!site.hidden.bio && <section id="bio" data-section="02 / Biography" className="manifesto"><p className="eyebrow" data-reveal>{site.bio.eyebrow}</p><p className="statement" data-reveal>{site.bio.statement}</p></section>}{!site.hidden.paths && <section id="paths" data-section="03 / Selected paths" className="paths"><p className="eyebrow" data-reveal>03 / Selected paths</p><div className="path-list">{categories.map(([slug, title, text], i) => <Link className="path" to={`/${slug}`} key={slug} data-reveal style={{ transitionDelay: `${i * 70}ms` }}><span>0{i + 1}</span><div><h2>{title}</h2><p>{text}</p></div><b aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square"><path d="M7 17 17 7M9.5 7H17v7.5" /></svg></b></Link>)}</div></section>}{!site.hidden.contact && <Contact contact={site.contact} />}</main><Footer /></>;
}
function Category() {
  const { slug } = useParams(); const site = useSite(); const item = categories.find(([key]) => key === slug); const [projects, setProjects] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useReveal(slug);
  useEffect(() => { listProjects(true).then((items) => setProjects(items.filter((project) => project.category === slug))).catch((e) => { setError(e.message); setProjects([]); }).finally(() => setLoading(false)); }, [slug]);
  if (!item) return <><Header hiddenContact /><main className="not-found"><p className="eyebrow" data-reveal>404</p><h1>{words('This page is not in the index.')}</h1><Link className="text-link" to="/" data-reveal>Return home</Link></main></>;
  return <><Header hiddenContact={site.hidden.contact} active="04 / Category" /><main><section className="category-intro"><p className="eyebrow" data-reveal>04 / Category</p><h1>{words(item[1])}</h1><p className="lede" data-reveal>{item[2]}</p></section><section className="work-list"><p className="eyebrow" data-reveal>Portfolio / {item[1]}</p>{loading ? <p>Memuat project...</p> : error ? <p className="form-error" role="alert">Gagal memuat portfolio: {error}</p> : projects.length === 0 ? <div className="empty-work" data-reveal><h2>Work will be added here.</h2><p>This category is ready for real projects, process notes, and images. No placeholder work is shown.</p><Link className="text-link" to="/admin/login">Add work through admin</Link></div> : projects.map((project, i) => <article className="public-project" key={project.id} data-reveal style={{ transitionDelay: `${i * 80}ms` }}><ProjectImages project={project} />{project.videoUrl && <div className="video-preview">{project.videoThumbnail && <img src={project.videoThumbnail} loading="lazy" alt={`Thumbnail video ${project.title}`} />}<VideoFrame url={project.videoUrl} title={project.title} /><a className="text-link" href={project.videoUrl} target="_blank" rel="noreferrer">Open video in Google Drive</a></div>}<p className="eyebrow">{project.role || 'Project'}</p><h2>{project.title}</h2><p>{project.summary}</p>{project.videoDuration && <small>Durasi: {project.videoDuration}</small>}{project.videoRole && <small>Role produksi: {project.videoRole}</small>}{project.externalUrl && <a className="text-link" href={project.externalUrl} target="_blank" rel="noreferrer">Open project</a>}</article>)}</section>{!site.hidden.contact && <Contact contact={site.contact} />}</main><Footer /></>;
}
function Footer() { return <footer><span>© Candra Dwiguna</span><span>Bandung, Indonesia</span><span>Built with care.</span></footer>; }
function AdminLogin() { return <AdminLoginPage />; }
function App() { return <><ScrollToTop /><Routes><Route path="/" element={<Home />} /><Route path="/admin/login" element={<AdminLogin />} /><Route element={<RequireAdmin />}><Route path="/admin/dashboard" element={<AdminDashboard />} /></Route><Route path="/:slug" element={<Category />} /></Routes></>; }
// Tanpa ini React Router mempertahankan posisi scroll halaman sebelumnya, jadi kategori terbuka di tengah.
// Judul tab ikut di-set di sini karena semua halaman memakai satu index.html.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const slug = pathname.replace(/^\//, '');
    const page = categories.find(([key]) => key === slug);
    const label = slug === '' ? null : slug === 'admin/login' ? 'Admin' : slug === 'admin/dashboard' ? 'Dashboard' : page ? page[1] : 'Not found';
    document.title = label ? `${label} — Candra Dwiguna` : 'Candra Dwiguna — Creative & Technical Specialist';
  }, [pathname]);
  return null;
}
createRoot(document.getElementById('root')).render(<BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>);
