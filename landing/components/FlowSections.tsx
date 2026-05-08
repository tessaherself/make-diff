'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const sections = [
  {
    eyebrow: '01 / PROBLEM',
    title: 'You can\'t describe a margin.',
    body: 'CSS is geometry. Geometry doesn\'t survive prose. "Move it 8px to the left" gets re-interpreted four different ways across four agent rounds, each one shipping a slightly different bug.',
    accent: 'text-[var(--color-danger)]',
  },
  {
    eyebrow: '02 / SOLUTION',
    title: 'Skip the prose. Diff the change.',
    body: 'Tweak the element in DevTools the way you want it. make-diff captures the exact mutation — selector, before, after, viewport — as a structured payload your coding agent can apply directly. No re-interpretation. No revert loops.',
    accent: 'text-[var(--color-accent)]',
  },
  {
    eyebrow: '03 / HOW IT WORKS',
    title: 'CDP attach. Mutation listen. Markdown export.',
    body: 'The extension attaches the Chrome DevTools Protocol to the inspected tab and listens to DOM.attributeModified and CSS.styleSheetChanged. Every edit gets a row in the panel. Click "copy diff", paste into Claude Code, ship.',
    accent: 'text-[var(--color-good)]',
  },
  {
    eyebrow: '04 / INSTALL',
    title: 'Pre-alpha. Load unpacked for now.',
    body: 'Chrome Web Store listing coming once we\'re past pre-alpha. Until then: clone the repo, build the extension, load unpacked. Five minutes — the README walks you through it.',
    accent: 'text-[var(--color-fg)]',
    cta: { label: 'GITHUB.COM/MAKE-DIFF', href: 'https://github.com/timo-wacke/make-diff' },
  },
];

export function FlowSections() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion) return;
      const els = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>('[data-flow-section]')
      );
      if (els.length === 0) return;

      const triggers: ScrollTrigger[] = [];
      els.forEach((section, i) => {
        gsap.set(section, { zIndex: i + 1 });
        const inner = section.querySelector<HTMLElement>('[data-flow-inner]');
        if (!inner) return;

        if (i > 0) {
          gsap.set(inner, { rotation: 18, transformOrigin: 'bottom left' });
          const tween = gsap.to(inner, {
            rotation: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top 30%',
              scrub: true,
            },
          });
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

        if (i < els.length - 1) {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: 'bottom bottom',
              end: 'bottom top',
              pin: true,
              pinSpacing: false,
            })
          );
        }
      });

      ScrollTrigger.refresh();
      return () => triggers.forEach((t) => t.kill());
    },
    { scope: containerRef, dependencies: [reducedMotion] }
  );

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden">
      {sections.map((s, i) => (
        <section
          key={i}
          data-flow-section
          className="relative min-h-screen w-full overflow-hidden"
        >
          <div
            data-flow-inner
            className="relative flex min-h-screen w-full flex-col justify-between gap-6 bg-[var(--color-bg)] px-[5vw] pt-[12vh] pb-[12vh]"
            style={{ transformOrigin: 'bottom left' }}
          >
            <div className="absolute inset-0 bg-dotgrid opacity-50" />
            <div className="corner corner-tl" />
            <div className="corner corner-tr" />
            <div className="corner corner-bl" />
            <div className="corner corner-br" />

            <div className="relative z-10 flex max-w-5xl flex-col gap-6">
              <div
                className={`flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] ${s.accent}`}
              >
                <span className="h-px w-6 bg-current" />
                <span>{s.eyebrow}</span>
                <span className="h-px w-12 bg-current/30" />
              </div>
              <h2
                className="text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.95] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {s.title}
              </h2>
              <p className="max-w-2xl font-mono text-sm leading-relaxed text-[var(--color-fg-dim)] sm:text-base">
                {s.body}
              </p>
              {s.cta && (
                <a
                  href={s.cta.href}
                  className="mt-4 inline-flex w-fit items-center gap-2 border border-[var(--color-fg)] px-5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--color-fg)] transition-colors hover:bg-[var(--color-fg)] hover:text-[var(--color-bg)]"
                >
                  {s.cta.label} →
                </a>
              )}
            </div>

            <div className="relative z-10 flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-fg-faint)]">
              <span>
                {String(i + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
              </span>
              <span className="hidden sm:inline">SCROLL ↓</span>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
