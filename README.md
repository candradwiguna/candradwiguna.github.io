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

## Firebase setup

The public shell is currently usable without Firebase. The admin CRUD/auth layer is the next connection step. Follow the complete guide in [`docs/firebase-setup.md`](docs/firebase-setup.md).

Never commit `.env.local`, passwords, service-account JSON, or Firebase Admin SDK credentials.

## GitHub Pages

The repository is intended for the organization user site `candradwiguna.github.io`. GitHub Actions deploys `dist/` after a successful build. The expected public URL is:

<https://candradwiguna.github.io>
