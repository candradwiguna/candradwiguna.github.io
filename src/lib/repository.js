import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';

function requireDb() {
  if (!db) throw new Error('Firestore belum terhubung. Periksa konfigurasi Firebase.');
  return db;
}

// Path gambar yang diketik manual sering datang sebagai "portofolio/x /y.jpeg" (spasi
// sebelum slash) atau tanpa slash depan, jadi URL-nya rusak. Normalisasi saat dibaca.
function normalizeImagePath(value) {
  if (!value) return value;
  if (/^(https?:|data:|\/\/)/.test(value)) return value;
  return `/${value.replace(/\s*\/\s*/g, '/').replace(/^\/+/, '')}`;
}

// publishedOnly wajib untuk pembaca anonim: rules hanya mengizinkan list kalau query
// sendiri sudah membatasi published == true. orderBy createdAt tidak bisa digabung
// tanpa composite index, jadi urutannya dikerjakan di klien.
export async function listProjects(publishedOnly = false) {
  const database = requireDb();
  const ref = publishedOnly
    ? query(collection(database, 'projects'), where('published', '==', true))
    : query(collection(database, 'projects'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(ref);
  const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  const normalized = items.map((item) => ({
    ...item,
    image: normalizeImagePath(item.image),
    videoThumbnail: normalizeImagePath(item.videoThumbnail),
  }));
  return publishedOnly ? normalized.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)) : normalized;
}

export async function saveProject(project) {
  const database = requireDb();
  const { id, ...data } = project;
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (id) {
    await setDoc(doc(database, 'projects', id), payload, { merge: true });
    return id;
  }
  const created = await addDoc(collection(database, 'projects'), { ...payload, createdAt: serverTimestamp() });
  return created.id;
}

export async function removeProject(id) {
  if (!id) throw new Error('Project ID tidak ditemukan.');
  await deleteDoc(doc(requireDb(), 'projects', id));
}

export async function getSiteSettings() {
  const snapshot = await getDocs(collection(requireDb(), 'site'));
  return Object.fromEntries(snapshot.docs.map((item) => [item.id, item.data()]));
}

export async function saveSiteSettings(id, data) {
  await setDoc(doc(requireDb(), 'site', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
