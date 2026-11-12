import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

function requireDb() {
  if (!db) throw new Error('Firestore belum terhubung. Periksa konfigurasi Firebase.');
  return db;
}

export async function listProjects() {
  const snapshot = await getDocs(query(collection(requireDb(), 'projects'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
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
