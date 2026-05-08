# make-diff

> AI can't center divs. Don't burn a million tokens centering a div — make the diff yourself.

A Chrome extension that records the manual CSS / DOM edits you make in DevTools and exports a paste-ready diff for your coding agent (Claude Code, Cursor, etc.). Stop describing visual fixes in prose. Stop reverting AI's failed centering attempts. Tweak it once, copy the diff, paste it back.

## Why

Modern web work is increasingly "talk to the AI." The AI is fantastic at structure and logic, mediocre at "move that 8px to the left." Every round of "no, the *other* margin" wastes tokens, attention, and the will to live.

You already have the answer in your head. You can show it in DevTools in 10 seconds. **make-diff** captures that change with full context (selector, before/after value, viewport, surrounding HTML) and gives you a clean snippet to hand back to the agent — so the next iteration is precise, not guessed.

## Repo layout

```
extension/   Chrome extension (Vite + React + TypeScript, manifest v3)
landing/     Marketing site (Next.js + Tailwind + shadcn + GSAP)
```

See each folder's README for setup.

## Status

Pre-alpha. Building in public.

## License

MIT — see [LICENSE](LICENSE).
