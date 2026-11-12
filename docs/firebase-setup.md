# Tutorial setup Firebase untuk Portfolio Candra

## Yang sudah ditentukan

- Firebase project ID: `candra-dwiguna-portofolio`
- Email admin: `dwigunacandra7@gmail.com`
- Email publik: `dwiguna.candra@gmail.com`
- Website: `https://candradwiguna.github.io`

## 1. Buka Firebase Console

1. Buka <https://console.firebase.google.com/>.
2. Pilih project **candra-dwiguna-portofolio**.
3. Jika project belum ada, klik **Add project**, isi Project ID persis `candra-dwiguna-portofolio`, lalu buat project tanpa Google Analytics untuk setup minimum.

## 2. Aktifkan Authentication

1. Buka **Build > Authentication**.
2. Klik **Get started**.
3. Buka tab **Sign-in method**.
4. Aktifkan **Email/Password**.
5. Buka tab **Users**, klik **Add user**.
6. Masukkan `dwigunacandra7@gmail.com` dan buat password admin yang unik.
7. Password hanya dimasukkan langsung di Firebase Console. Jangan kirim password lewat chat dan jangan masukkan ke GitHub.

## 3. Buat Firestore Database

1. Buka **Build > Firestore Database**.
2. Klik **Create database**.
3. Pilih region yang paling dekat dengan pengguna, misalnya `asia-southeast2` jika tersedia.
4. Mulai dalam locked/production mode.
5. Collections yang akan dipakai aplikasi:
   - `site/settings`
   - `site/profile`
   - `categories/{categoryId}`
   - `projects/{projectId}`

Jangan membuat data project palsu. Isi portfolio nanti melalui admin panel dengan project nyata.

## 4. Aktifkan Storage

1. Buka **Build > Storage**.
2. Klik **Get started**.
3. Pilih region yang sama dengan Firestore bila memungkinkan.
4. Mulai dalam locked/production mode.
5. Folder asset yang dipakai:
   - `portfolio/profile/`
   - `portfolio/projects/`

Foto awal tersedia di repository sebagai `public/profile.jpg`. Upload ulang ke Storage hanya setelah admin upload flow aktif.

## 5. Daftarkan aplikasi Web

1. Buka **Project settings**.
2. Pada bagian **Your apps**, klik ikon Web `</>`.
3. Isi nama aplikasi, misalnya `candra-portfolio-web`.
4. Firebase akan menampilkan object `firebaseConfig`.
5. Salin nilainya ke file lokal `.env.local` dengan format:

```env
VITE_FIREBASE_API_KEY=isi_dari_firebaseConfig
VITE_FIREBASE_AUTH_DOMAIN=candra-dwiguna-portofolio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=candra-dwiguna-portofolio
VITE_FIREBASE_STORAGE_BUCKET=isi_dari_firebaseConfig
VITE_FIREBASE_MESSAGING_SENDER_ID=isi_dari_firebaseConfig
VITE_FIREBASE_APP_ID=isi_dari_firebaseConfig
VITE_FIREBASE_ADMIN_EMAIL=dwigunacandra7@gmail.com
```

`firebaseConfig` untuk aplikasi web bukan password. Keamanan tetap harus ditegakkan lewat Authentication dan Firestore/Storage Rules. Jangan pernah menaruh service-account JSON atau private key di frontend.

## 6. Install Firebase CLI dan login

Di terminal:

```bash
npm install -g firebase-tools
firebase login
firebase projects:list
firebase use candra-dwiguna-portofolio
```

Expected output: project `candra-dwiguna-portofolio` terlihat dan terpilih sebagai active project.

## 7. Deploy rules setelah file rules dibuat

Dari root repository:

```bash
firebase deploy --only firestore:rules,storage
```

Jangan memakai `allow read, write: if true`. Rules production harus memastikan:

- public hanya dapat membaca data yang memang `published`;
- hanya `dwigunacandra7@gmail.com` yang dapat create/update/delete;
- anonymous dan user lain tidak dapat melakukan mutasi;
- Storage hanya menerima file image yang divalidasi aplikasi dan hanya admin yang dapat menulis.

Jika rules emulator tersedia, jalankan test rules sebelum deploy production.

## 8. Hubungkan GitHub Pages ke Firebase Auth

Di Firebase Console, buka **Authentication > Settings > Authorized domains**, lalu pastikan domain berikut ada:

- `candradwiguna.github.io`
- `localhost`

Jika Firebase menolak login, biasanya domain belum ditambahkan atau `.env.local` memakai project ID yang salah.

## 9. Verifikasi admin

Setelah admin route selesai diimplementasikan:

1. Buka `https://candradwiguna.github.io/admin/login`.
2. Login sebagai `dwigunacandra7@gmail.com`.
3. Tambahkan satu project percobaan nyata atau hapus kembali sebelum publish.
4. Refresh browser dan pastikan data tetap ada.
5. Logout.
6. Pastikan anonymous hanya melihat halaman publik.
7. Pastikan user lain tidak dapat menulis ke Firestore/Storage.

## 10. Troubleshooting singkat

- `auth/unauthorized-domain`: tambahkan `candradwiguna.github.io` ke Authorized domains.
- `permission-denied`: periksa email admin dan rules, bukan hanya tombol di UI.
- `storage/unauthorized`: periksa Storage Rules dan path asset.
- Data hilang setelah refresh: backend adapter belum aktif atau `.env.local` belum benar.
- Jangan mengatasi error dengan membuka rules untuk semua orang.
