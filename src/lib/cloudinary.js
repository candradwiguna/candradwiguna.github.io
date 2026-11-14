// Upload preset Cloudinary yang dipakai bersifat "unsigned": cloud name dan nama preset memang
// publik, jadi tidak ada rahasia yang ikut ke browser. Kalau dua nilai ini kosong, kontrol
// upload tidak dirender dan form admin tetap bisa memakai path repo / link Drive seperti biasa.
const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD;
const preset = import.meta.env.VITE_CLOUDINARY_PRESET;

export const uploadConfigured = Boolean(cloud && preset);

// f_auto + q_auto menyerahkan format (webp/avif) dan kualitas ke Cloudinary. c_limit wajib:
// tanpa itu w_1600 justru memperbesar gambar kecil (terbukti: sumber 900px jadi 1600px).
export async function uploadImage(file) {
  if (!uploadConfigured) throw new Error('Upload gambar belum dikonfigurasi.');
  if (!file) throw new Error('Tidak ada file yang dipilih.');
  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', preset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.secure_url) throw new Error(data.error?.message || `Upload gagal (${response.status}).`);
  return data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,c_limit,w_1600/');
}

// Video diunggah ke endpoint /video/upload: Cloudinary mengubah format apa pun (termasuk .mov
// dari iPhone) menjadi MP4, jadi bisa diputar <video> bawaan browser tanpa player pihak ketiga.
export async function uploadVideo(file) {
  if (!uploadConfigured) throw new Error('Upload video belum dikonfigurasi.');
  if (!file) throw new Error('Tidak ada file yang dipilih.');
  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', preset);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/video/upload`, { method: 'POST', body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.secure_url) throw new Error(data.error?.message || `Upload gagal (${response.status}).`);
  // Rasio disimpan supaya kotak video tidak melompat saat metadata baru dimuat.
  return { url: data.secure_url, ratio: data.width && data.height ? +(data.width / data.height).toFixed(4) : 0 };
}
