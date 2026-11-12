# QuickInvoice

A mobile-first invoice and quotation maker built with React, TypeScript, Vite, IndexedDB, jsPDF and PWA support.

## Deploy to GitHub Pages (repository: quickinvoice)

1. Upload the **contents** of this folder to the root of the GitHub repository named `quickinvoice`.
2. Open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Open the **Actions** tab and wait for **Deploy QuickInvoice** to finish with a green check.
5. Open https://subics34-gif.github.io/quickinvoice/ in Safari.

The deployment workflow builds the app automatically on every push to `main`. The Vite production base path and PWA scope are set to `/quickinvoice/`.

## Install on iPhone

Open the deployed site in Safari → Share → Add to Home Screen → Add.

## Local development

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

## Data and privacy

Business details, customers and documents are stored in IndexedDB in the current browser on the current device. They are not synced between devices. Export a backup from Settings regularly. Clearing browser/site data can erase locally stored records.

## MVP scope

Includes first-run business setup, dashboard, invoice and quotation editor, line-item calculations, optional discount/GST, payment status, customer list, document history/search/filter, PDF download, business settings and JSON backup/import.

Cloud accounts/sync and multi-device sharing are not included in this offline-first version.
