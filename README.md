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

## Firebase setup gratis

Firebase dipakai hanya untuk Authentication dan Firestore pada Spark. Firebase Storage sengaja tidak dipakai karena memerlukan Blaze/pay-as-you-go. Gambar disimpan di `public/portfolio/` dan dideploy lewat GitHub Pages. Lihat [`docs/firebase-setup.md`](docs/firebase-setup.md).

Jangan pernah commit `.env.local`, password, service-account JSON, atau Firebase Admin SDK credentials.

## GitHub Pages

The repository is intended for the organization user site `candradwiguna.github.io`. GitHub Actions deploys `dist/` after a successful build. The expected public URL is:

<https://candradwiguna.github.io>
