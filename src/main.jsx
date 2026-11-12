import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import AdminLoginPage from './pages/AdminLogin';
import RequireAdmin from './auth/RequireAdmin';
import './styles.css';

const categories = [
  ['design', 'Design', 'Brand identity, visual systems, layout, and communication.'],
  ['ilustrasi', 'Ilustrasi', 'Illustration and visual storytelling with a personal hand.'],
  ['3d-dental-photography', '3D / Dental Photography', 'Technical visual work from dental design, 3D, and photography.'],
  ['it-website-automation', 'IT / Website / Automation', 'Websites, support, systems, and practical automation.'],
  ['content-creator-video', 'Content Creator Video', 'Short-form video, editing, motion, and content workflows.']
];

function Header() {
  return <header className="site-header"><Link className="wordmark" to="/">Candra Dwiguna<span>.</span></Link><nav aria-label="Main navigation"><Link to="/">Index</Link><a href="#contact">Contact</a><Link to="/admin/login">Admin</Link></nav></header>;
}
function Contact() {
  return <section id="contact" className="contact"><p className="eyebrow">05 / Contact</p><h2>Let’s make the next useful thing.</h2><div className="contact-links"><a href="mailto:dwiguna.candra@gmail.com">dwiguna.candra@gmail.com</a><a href="https://wa.me/6289616424972" target="_blank" rel="noreferrer">WhatsApp</a><a href="https://www.instagram.com/candradwig/" target="_blank" rel="noreferrer">Instagram / personal</a><a href="https://www.instagram.com/canillustration/" target="_blank" rel="noreferrer">Instagram / illustration</a><a href="https://www.instagram.com/cndrdwgn/" target="_blank" rel="noreferrer">Instagram / photography</a></div></section>;
}
function Home() {
  return <><Header /><main><section className="hero"><div><p className="eyebrow">01 / Candra Dwiguna</p><h1>Creative work, technical thinking, <em>useful outcomes.</em></h1><p className="lede">Multi-disciplinary creative and technical specialist working across design, illustration, 3D, photography, video, websites, and automation.</p></div><img className="profile" src="/profile.jpg" width="640" height="800" fetchPriority="high" alt="Foto profil Candra Dwiguna" /></section><section className="manifesto"><p className="eyebrow">02 / How I work</p><p className="statement">I move between the visual and the practical. A good result should be clear enough to understand, considered enough to remember, and useful enough to keep.</p></section><section className="paths"><p className="eyebrow">03 / Selected paths</p><div className="path-list">{categories.map(([slug, title, text], i) => <Link className="path" to={`/${slug}`} key={slug}><span>0{i + 1}</span><div><h2>{title}</h2><p>{text}</p></div><b aria-hidden="true">↗</b></Link>)}</div></section><Contact /></main><Footer /></>;
}
function Category() {
  const { slug } = useParams(); const item = categories.find(([key]) => key === slug);
  if (!item) return <><Header /><main className="not-found"><p className="eyebrow">404</p><h1>This page is not in the index.</h1><Link className="text-link" to="/">Return home</Link></main></>;
  return <><Header /><main><section className="category-intro"><p className="eyebrow">04 / Category</p><h1>{item[1]}</h1><p className="lede">{item[2]}</p></section><section className="empty-work"><p className="eyebrow">Portfolio / {item[1]}</p><h2>Work will be added here.</h2><p>This category is ready for real projects, process notes, and images. No placeholder work is shown.</p><Link className="text-link" to="/admin/login">Add work through admin</Link></section><Contact /></main><Footer /></>;
}
function Footer() { return <footer><span>© Candra Dwiguna</span><span>Bandung, Indonesia</span><span>Built with care.</span></footer>; }
function AdminLogin() { return <AdminLoginPage />; }
function AdminDashboard() { return <><Header /><main className="admin"><p className="eyebrow">Private area</p><h1>Portfolio editor</h1><p>Login berhasil. Dashboard CRUD akan ditambahkan pada tahap berikutnya.</p><Link className="text-link" to="/">Back to portfolio</Link></main></>; }
function App() { return <Routes><Route path="/" element={<Home />} /><Route path="/admin/login" element={<AdminLogin />} /><Route element={<RequireAdmin />}><Route path="/admin/dashboard" element={<AdminDashboard />} /></Route><Route path="/:slug" element={<Category />} /></Routes>; }
createRoot(document.getElementById('root')).render(<BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>);
