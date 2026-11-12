# Tutorial setup Firebase gratis untuk Portfolio Candra

## Prinsip biaya

Project ini **tidak memakai Firebase Storage**. Cloud Storage for Firebase memerlukan paket Blaze/pay-as-you-go, sehingga tidak cocok untuk target tanpa billing. Gunakan Firebase Spark hanya untuk Authentication dan Firestore, lalu simpan gambar di GitHub repository.

## Yang sudah ditentukan

- Firebase project ID: `candra-dwiguna-portofolio`
- Email admin: `dwigunacandra7@gmail.com`
- Email publik: `dwiguna.candra@gmail.com`
- Website: `https://candradwiguna.github.io`
- Gambar: `public/profile.jpg` dan `public/portfolio/<category>/`

## 1. Buka Firebase Console

1. Buka <https://console.firebase.google.com/>.
2. Pilih project **candra-dwiguna-portofolio**.
3. Jika project belum ada, klik **Add project**, isi Project ID persis `candra-dwiguna-portofolio`, lalu buat project tanpa Google Analytics untuk setup minimum.
4. Jangan membuka menu **Storage** dan jangan upgrade ke Blaze.

## 2. Aktifkan Authentication tanpa billing

1. Buka **Build > Authentication**.
2. Klik **Get started**.
3. Buka tab **Sign-in method**.
4. Aktifkan **Email/Password**.
5. Buka tab **Users**, klik **Add user**.
6. Masukkan `dwigunacandra7@gmail.com` dan buat password admin yang unik.
7. Password hanya dimasukkan langsung di Firebase Console. Jangan kirim password lewat chat dan jangan masukkan ke GitHub.

## 3. Buat Firestore Database pada Spark

1. Buka **Build > Firestore Database**.
2. Klik **Create database**.
3. Pilih region yang dekat dengan pengguna, misalnya `asia-southeast2` jika tersedia.
4. Mulai dalam locked/production mode.
5. Collections yang dipakai aplikasi:
   - `site/settings`
   - `site/profile`
   - `categories/{categoryId}`
   - `projects/{projectId}`

Firestore menyimpan teks, metadata project, settings, dan path gambar. Jangan menyimpan gambar sebagai Base64 di Firestore.

## 4. Daftarkan aplikasi Web

1. Buka **Project settings**.
2. Pada **Your apps**, klik ikon Web `</>`.
3. Isi nama aplikasi, misalnya `candra-portfolio-web`.
4. Firebase menampilkan object `firebaseConfig`.
5. Salin nilainya ke file lokal `.env.local`:

```env
VITE_FIREBASE_API_KEY=isi_dari_firebaseConfig
VITE_FIREBASE_AUTH_DOMAIN=candra-dwiguna-portofolio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=candra-dwiguna-portofolio
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=isi_dari_firebaseConfig
VITE_FIREBASE_APP_ID=isi_dari_firebaseConfig
VITE_FIREBASE_ADMIN_EMAIL=dwigunacandra7@gmail.com
```

Biarkan `VITE_FIREBASE_STORAGE_BUCKET` kosong. Jangan menambahkan Firebase Storage hanya karena field tersebut muncul pada config snippet.

Firebase web config bukan password. Keamanan tetap ditegakkan lewat Authentication dan Firestore Rules. Jangan menaruh service-account JSON atau private key di frontend.

## 5. Siapkan gambar melalui GitHub, bukan Firebase Storage

Folder gambar:

```text
public/
├── profile.jpg
└── portfolio/
    ├── design/
    ├── ilustrasi/
    ├── 3d-dental-photography/
    ├── it-website-automation/
    └── content-creator-video/
```

Workflow menambah gambar:

1. Salin file gambar ke folder kategori yang benar.
2. Gunakan nama file sederhana tanpa spasi, misalnya `poster-branding-01.jpg`.
3. Commit dan push ke GitHub.
4. Isi path pada admin panel, misalnya `/portfolio/design/poster-branding-01.jpg`.
5. Isi alt text, width/height, dan catatan izin publikasi.

Admin panel mengelola metadata path, bukan meng-upload file ke cloud. Ini tetap gratis dan asset ikut ter-backup di repository.

## 6. Install Firebase CLI dan login

```bash
npm install -g firebase-tools
firebase login
firebase projects:list
firebase use candra-dwiguna-portofolio
```

Expected output: project `candra-dwiguna-portofolio` terlihat dan terpilih sebagai active project.

## 7. Deploy Firestore Rules saja

Dari root repository:

```bash
firebase deploy --only firestore:rules
```

Jangan menjalankan `firebase deploy --only storage` dan jangan membuat `storage.rules`.

Rules production harus memastikan:

- public hanya membaca data yang `published`;
- hanya `dwigunacandra7@gmail.com` yang dapat create/update/delete Firestore;
- anonymous dan user lain tidak dapat melakukan mutasi;
- path gambar hanya metadata dan tidak dianggap sebagai upload permission.

Jangan memakai `allow read, write: if true`.

## 8. Hubungkan GitHub Pages ke Firebase Auth

Di Firebase Console, buka **Authentication > Settings > Authorized domains**, lalu pastikan ada:

- `candradwiguna.github.io`
- `localhost`

## 9. Verifikasi admin tanpa Storage

Setelah admin route selesai:

1. Buka `https://candradwiguna.github.io/admin/login`.
2. Login sebagai `dwigunacandra7@gmail.com`.
3. Tambahkan metadata project dengan path gambar repository.
4. Refresh browser dan pastikan data Firestore tetap ada.
5. Logout.
6. Pastikan anonymous hanya melihat halaman publik.
7. Pastikan user lain tidak dapat menulis ke Firestore.
8. Push gambar repository, lalu pastikan path gambar tampil setelah deployment.

## Troubleshooting

- `auth/unauthorized-domain`: tambahkan `candradwiguna.github.io` ke Authorized domains.
- `permission-denied`: periksa email admin dan Firestore Rules, bukan hanya tombol UI.
- Gambar 404: periksa path berada di `public/portfolio/`, nama file case-sensitive, dan sudah di-push.
- Data hilang setelah refresh: backend adapter atau `.env.local` belum benar.
- Jangan mengatasi error dengan membuka rules untuk semua orang atau mengaktifkan Storage.
