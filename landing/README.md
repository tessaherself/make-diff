# make-diff landing

Marketing site for the make-diff Chrome extension.

## Stack

- **Next.js 15** (App Router, React 19)
- **Tailwind CSS 4** — single-file CSS-first config in `app/globals.css`
- **GSAP + ScrollTrigger** — scroll-rotated section transitions
- **TypeScript**

## Develop

```bash
cd landing
pnpm install   # or bun install / npm install
pnpm dev
```

→ http://localhost:3000

## Build

```bash
pnpm build
pnpm start
```

## Layout

- `app/page.tsx` — composition: `<Frame />` (corner accents + sticky header/footer + vertical right tab) + `<Hero />` + `<FlowSections />`
- `components/Hero.tsx` — editorial display headline with `<BrokenDiv />` mid-word; three-column tagline strip
- `components/FlowSections.tsx` — pinned scroll-triggered sections that rotate into view (Problem → Solution → How it works → Install)
- `components/Frame.tsx` — top brand header + bottom system-status footer + vertical "MAKE THE DIFF" tab

## Deploy

Vercel works out of the box (`vercel --prod` from this folder, or connect the repo with the Root Directory set to `landing`).
