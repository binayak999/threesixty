# 360Nepal Client — Next.js 15 (TypeScript)

This is the 360Nepal frontend converted to **Next.js 15** with **TypeScript** and the **App Router**.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Static assets**  
   Ensure all theme assets are available under `public/assets/` (images, CSS, JS, plugins). If your assets live in the project root `assets/` folder, copy them once:
   ```bash
   cp -r assets/* public/assets/
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Start dev server with Turbopack
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Project structure

- `app/` — App Router: `layout.tsx`, `page.tsx`, and route folders (`about/`, `contact/`, etc.)
- `components/` — React components (Navbar, Footer, HeroSection, CategoriesSection)
- `public/assets/` — Static files served at `/assets/`
- `tsconfig.json` — TypeScript config with `@/*` path alias

## Converting more pages

Original HTML pages (e.g. `listings-grid-1-left.html`, `blog-archive.html`) can be added as new routes under `app/`, e.g.:

- `app/listings-grid-1-left/page.tsx`
- `app/blog-archive/page.tsx`

Reuse `Navbar` and `Footer` from `@/components` and port the main content into React/TSX.
