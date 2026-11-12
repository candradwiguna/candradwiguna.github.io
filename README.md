# Candra Dwiguna Portfolio

Editorial portfolio for Candra Dwiguna, a multi-disciplinary creative and technical specialist.

## Local development

```bash
npm install
npm run dev
```

Production check:

```bash
npm test
npm run build
```

## Public routes

- `/`
- `/design`
- `/ilustrasi`
- `/3d-dental-photography`
- `/it-website-automation`
- `/content-creator-video`

## Mengelola tampilan dari admin

Login di `/admin/login`, lalu di dashboard ada panel **Tampilan & isi halaman utama** (`site/settings`):

- palette (paper, ink, muted, accent, line)
- font (4 pasangan yang dimuat on demand dari Google Fonts)
- spacing/density dan radius sudut
- show/hide section: hero, biography, selected paths, contact
- headline utama, headline aksen, deskripsi hero, biography
- foto profil (path repository seperti `/profile.jpg`, atau URL gambar penuh) dan alt text

Perubahan tersimpan di `site/settings` dan langsung dipakai halaman publik; `hidden` disimpan lengkap agar section yang di-uncheck benar-benar hilang.
Firebase Storage tidak dipakai, jadi foto profil diunggah lewat GitHub di `public/`.

## Firebase setup gratis

Firebase dipakai hanya untuk Authentication dan Firestore pada Spark. Firebase Storage sengaja tidak dipakai karena memerlukan Blaze/pay-as-you-go. Gambar disimpan di `public/portfolio/` dan dideploy lewat GitHub Pages. Lihat [`docs/firebase-setup.md`](docs/firebase-setup.md).

Jangan pernah commit `.env.local`, password, service-account JSON, atau Firebase Admin SDK credentials.

## GitHub Pages

The repository is intended for the organization user site `candradwiguna.github.io`. GitHub Actions deploys `dist/` after a successful build. The expected public URL is:

<https://candradwiguna.github.io>
