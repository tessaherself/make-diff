# make-diff extension

Chrome extension that records manual CSS / DOM edits made in DevTools and exports a paste-ready diff for your coding agent.

## Stack

- **Manifest v3** — service worker, devtools page, no content scripts
- **Vite + React + TypeScript** — multi-entry build
- **`chrome.debugger`** — attaches the Chrome DevTools Protocol to the inspected tab; listens to `DOM.attributeModified` (inline styles) and `CSS.styleSheetChanged` (Styles panel edits)

## Develop

```bash
cd extension
pnpm install   # or bun install / npm install
pnpm dev       # builds to dist/ in watch mode
```

Then in Chrome: `chrome://extensions` → enable Developer mode → "Load unpacked" → select `extension/dist`.

Open any page → F12 → click the **make diff** panel. The panel attaches the debugger automatically. You'll see Chrome's "make diff started debugging this browser" banner — that's how the DevTools Protocol works.

Tweak any element in the Elements panel (inline styles or Styles rules). Each change appears as a row. Click **copy diff** to get a markdown block for Claude Code.

## Build

```bash
pnpm build
```

Outputs to `dist/`. Zip it for the Chrome Web Store later.

## How it captures

| Source | CDP event | What we record |
|---|---|---|
| Inline `style="…"` edit | `DOM.attributeModified` (name=style) | selector path + before/after declarations + outer HTML snippet |
| Styles panel rule edit | `CSS.styleSheetChanged` | full stylesheet text diff |

Each capture also tags the viewport size, DPR, and current page URL.
