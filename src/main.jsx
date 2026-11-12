import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { listProjects } from './lib/repository';
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import AdminLoginPage from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import RequireAdmin from './auth/RequireAdmin';
import { useSite } from './lib/site';
import './styles.css';

const categories = [
  ['design', 'Design', 'Brand identity, visual systems, layout, and communication.'],
  ['ilustrasi', 'Ilustrasi', 'Illustration and visual storytelling with a personal hand.'],
  ['3d-dental-photography', '3D / Dental Photography', 'Technical visual work from dental design, 3D, and photography.'],
  ['it-website-automation', 'IT / Website / Automation', 'Websites, support, systems, and practical automation.'],
  ['content-creator-video', 'Content Creator Video', 'Short-form video, editing, motion, and content workflows.']
];

function Header({ hiddenContact }) {
  return <header className="site-header"><Link className="wordmark" to="/">Candra Dwiguna<span>.</span></Link><nav aria-label="Main navigation"><Link to="/">Index</Link>{!hiddenContact && <a href="#contact">Contact</a>}<Link to="/admin/login">Admin</Link></nav></header>;
}
const contactLinks = (c) => [['mailto:' + c.email, c.email], [`https://wa.me/${c.whatsapp}`, 'WhatsApp'], [c.instagram, 'Instagram / personal'], [c.illustrationInstagram, 'Instagram / illustration'], [c.photographyInstagram, 'Instagram / photography']];
const drivePreviewUrl = (url = '') => { const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/); return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url; };
function Contact({ contact }) {
  return <section id="contact" className="contact"><p className="eyebrow">05 / Contact</p><h2>Let’s make the next useful thing.</h2><div className="contact-links">{contactLinks(contact).filter(([href]) => href).map(([href, label]) => <a key={label} href={href} {...(href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noreferrer' })}>{label}</a>)}</div></section>;
}
function Home() {
  const site = useSite();
  return <><Header hiddenContact={site.hidden.contact} /><main>{!site.hidden.hero && <section className="hero"><div><p className="eyebrow">{site.hero.eyebrow}</p><h1>{site.hero.headline} {site.hero.accent && <em>{site.hero.accent}</em>}</h1>{site.hero.lede && <p className="lede">{site.hero.lede}</p>}</div>{site.profile.image && <img className="profile" src={site.profile.image} width="640" height="800" fetchPriority="high" alt={site.profile.alt} />}</section>}{!site.hidden.bio && <section className="manifesto"><p className="eyebrow">{site.bio.eyebrow}</p><p className="statement">{site.bio.statement}</p></section>}{!site.hidden.paths && <section className="paths"><p className="eyebrow">03 / Selected paths</p><div className="path-list">{categories.map(([slug, title, text], i) => <Link className="path" to={`/${slug}`} key={slug}><span>0{i + 1}</span><div><h2>{title}</h2><p>{text}</p></div><b aria-hidden="true">↗</b></Link>)}</div></section>}{!site.hidden.contact && <Contact contact={site.contact} />}</main><Footer /></>;
}
function Category() {
  const { slug } = useParams(); const site = useSite(); const item = categories.find(([key]) => key === slug); const [projects, setProjects] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { listProjects().then((items) => setProjects(items.filter((project) => project.category === slug && project.published === true))).catch(() => setProjects([])).finally(() => setLoading(false)); }, [slug]);
  if (!item) return <><Header hiddenContact={site.hidden.contact} /><main className="not-found"><p className="eyebrow">404</p><h1>This page is not in the index.</h1><Link className="text-link" to="/">Return home</Link></main></>;
  return <><Header hiddenContact={site.hidden.contact} /><main><section className="category-intro"><p className="eyebrow">04 / Category</p><h1>{item[1]}</h1><p className="lede">{item[2]}</p></section><section className="work-list"><p className="eyebrow">Portfolio / {item[1]}</p>{loading ? <p>Memuat project...</p> : projects.length === 0 ? <div className="empty-work"><h2>Work will be added here.</h2><p>This category is ready for real projects, process notes, and images. No placeholder work is shown.</p><Link className="text-link" to="/admin/login">Add work through admin</Link></div> : projects.map((project) => <article className="public-project" key={project.id}>{project.image && <img src={project.image} width="1200" height="700" loading="lazy" alt={project.imageAlt || project.title} />}{project.videoUrl && <div className="video-preview">{project.videoThumbnail && <img src={project.videoThumbnail} width="1200" height="675" loading="lazy" alt={`Thumbnail video ${project.title}`} />}<iframe title={`Video ${project.title}`} src={drivePreviewUrl(project.videoUrl)} width="1200" height="675" allow="autoplay" loading="lazy"></iframe><a className="text-link" href={project.videoUrl} target="_blank" rel="noreferrer">Open video in Google Drive</a></div>}<p className="eyebrow">{project.role || 'Project'}</p><h2>{project.title}</h2><p>{project.summary}</p>{project.videoDuration && <small>Durasi: {project.videoDuration}</small>}{project.videoRole && <small>Role produksi: {project.videoRole}</small>}{project.externalUrl && <a className="text-link" href={project.externalUrl} target="_blank" rel="noreferrer">Open project</a>}</article>)}</section>{!site.hidden.contact && <Contact contact={site.contact} />}</main><Footer /></>;
}
function Footer() { return <footer><span>© Candra Dwiguna</span><span>Bandung, Indonesia</span><span>Built with care.</span></footer>; }
function AdminLogin() { return <AdminLoginPage />; }
function App() { return <Routes><Route path="/" element={<Home />} /><Route path="/admin/login" element={<AdminLogin />} /><Route element={<RequireAdmin />}><Route path="/admin/dashboard" element={<AdminDashboard />} /></Route><Route path="/:slug" element={<Category />} /></Routes>; }
createRoot(document.getElementById('root')).render(<BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>);
