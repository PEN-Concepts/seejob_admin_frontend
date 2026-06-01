# See Job Run — Admin Frontend (Angular)

This README explains how to set up and run the frontend portion of the See Job Run admin portal locally.

## Overview

- Tech: Angular 17, TypeScript
- Entry: `src/main.ts`
- App routing is in `src/app/app-routing.module.ts`
- Main modules/components (sample):
  - `src/app/modules/login` — Login / password recovery
  - `src/app/modules/members` — Members list (previously Users)
  - `src/app/modules/dashboard` — Dashboard summary
  - `src/app/modules/billing` — Billing samples
  - `src/app/modules/analytics` — Analytics samples
  - `src/app/modules/support` — Support tickets
  - `src/app/shared/left-menu` — Left navigation menu

## Prerequisites

- Node.js (v18+ recommended)
- npm (v8+ recommended)
- The backend server should be running locally at `http://localhost:4000` (default in `ApiService`).

## Install

Open PowerShell in `frontend/` and run:

```powershell
npm install
# If you run into peer dependency issues, try:
# npm install --legacy-peer-deps
```

## Commands

Run the dev server (PowerShell):

```powershell
npm start
# This runs: ng serve --host 0.0.0.0 --port 4500
# Dev UI will be available at http://localhost:4500
```

Create a production build:

```powershell
npm run build
```

Run tests (if any):

```powershell
npm test
```

## Important files / configuration

- API base URL is set in `src/app/services/api.service.ts` (property `base`). Change it if your backend is on another host/port.
- Global styles are imported from `src/styles.scss` which aggregates partials under `src/styles/`.
- The left navigation menu component is `src/app/shared/left-menu/left-menu.component.*`. The app hides this menu automatically on `/login` and `/signup` routes.

## Adding components / modules

Follow the existing pattern under `src/app/modules/`:
- Create a folder (`my-module`) with `my-module.component.ts`, `.html`, and `.css`.
- Register the component in `src/app/app.module.ts` (or create a feature module and lazy-load it) and add a route in `src/app/app-routing.module.ts`.

## Backend / API notes

- Many sample endpoints are in the backend running at `http://localhost:4000`:
  - `/api/dashboard/summary`
  - `/api/members` (list)
  - `/api/billing/invoices`
  - `/api/analytics/summary`
  - `/api/support/tickets`

Make sure the backend is running and reachable before testing API-driven pages.

## Troubleshooting

- Styles not applied: ensure `src/styles.scss` and the `angular.json` `styles` entry reference the correct file. Restart `ng serve` after changes to `angular.json`.
- PrimeNG components: if you use PrimeNG, ensure PrimeNG CSS + theme + primeicons are included in `angular.json` or `styles.scss`.
- Build errors related to TypeScript/peer deps: use `npm install --legacy-peer-deps` or align package versions.

## Next steps / suggestions

- Convert the sample pages to feature modules and lazy-load them for better performance.
- Add form validation and better typed interfaces for API responses (update `ApiService` to return typed observables/promises).
- Add E2E tests and CI configuration.

---

If you want, I can: wire the login reactive form, add icons and active-route highlighting to the left menu, or make the left menu collapsible for small screens — tell me which one to do next.
