import { CTAButton } from './CTAButton';
import { BrokenDiv } from './BrokenDiv';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-20 pb-24">
      <div className="absolute inset-0 bg-dotgrid opacity-60" />
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-12 sm:pt-20">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-fg-dim)]">
          <span className="h-px w-6 bg-[var(--color-fg-faint)]" />
          <span>Chrome Extension · Pre-Alpha</span>
          <span className="h-px flex-1 bg-[var(--color-fg-faint)]/40" />
        </div>

        {/* Headline — editorial display, three-line stack */}
        <h1
          className="mt-8 leading-[0.85] font-light tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="block text-[16vw] sm:text-[14vw] lg:text-[11rem] xl:text-[14rem]">
            AI CAN&rsquo;T
          </span>
          <span className="block text-[16vw] sm:text-[14vw] lg:text-[11rem] xl:text-[14rem]">
            <span>CEN</span>
            <BrokenDiv className="inline-block align-middle mx-2 size-[0.75em] text-[var(--color-danger)]" />
            <span>TER</span>
          </span>
          <span className="block text-[16vw] sm:text-[14vw] lg:text-[11rem] xl:text-[14rem] italic text-[var(--color-fg-dim)]">
            divs.
          </span>
        </h1>

        {/* Sub-headline + meta column */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <p className="max-w-xl font-mono text-sm leading-relaxed text-[var(--color-fg-dim)] sm:text-base">
            Don&rsquo;t burn a million tokens centering a div. Tweak it once in DevTools,
            copy the diff, paste it back. <span className="text-[var(--color-fg)]">make-diff</span> records
            every CSS / DOM edit you make by hand &mdash; selector, before/after, viewport, surrounding HTML &mdash;
            and exports a paste-ready snippet for Claude Code, Cursor, or whatever agent you use.
          </p>
          <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-fg-faint)] lg:text-right">
            <div>Bokaro Steel City — Bochum — Berlin</div>
            <div>For developers who&rsquo;d rather show than tell.</div>
          </div>
        </div>

        {/* Separator */}
        <div className="my-10 h-px w-full bg-[var(--color-line)]" />

        {/* CTA row */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <CTAButton href="#install" variant="primary">
            INSTALL EXTENSION
          </CTAButton>
          <CTAButton href="https://github.com/tessaherself/make-diff" variant="ghost">
            VIEW ON GITHUB →
          </CTAButton>
          <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-faint)] sm:inline">
            ∞ &nbsp; SISYPHUS.PROTOCOL
          </span>
        </div>

        {/* Tagline strip — the actual punchline */}
        <div className="mt-14 grid gap-6 border-t border-[var(--color-line)] pt-8 sm:grid-cols-3">
          <Tagline kind="problem">
            You: <span className="text-[var(--color-fg)]">"please center this div"</span>.
            AI: returns the same uncentered div, four times in a row.
          </Tagline>
          <Tagline kind="diagnosis">
            CSS is one of the few things <em>showing</em> beats <em>telling</em>.
            Yet we keep telling.
          </Tagline>
          <Tagline kind="solution">
            Edit it yourself in DevTools. <span className="text-[var(--color-fg)]">make-diff</span> records
            the change. Paste the diff. Done in one shot.
          </Tagline>
        </div>
      </div>
    </section>
  );
}

function Tagline({
  kind,
  children,
}: {
  kind: 'problem' | 'diagnosis' | 'solution';
  children: React.ReactNode;
}) {
  const label =
    kind === 'problem' ? '01 / SYMPTOM' : kind === 'diagnosis' ? '02 / DIAGNOSIS' : '03 / FIX';
  const color =
    kind === 'problem'
      ? 'text-[var(--color-danger)]'
      : kind === 'diagnosis'
      ? 'text-[var(--color-accent)]'
      : 'text-[var(--color-good)]';
  return (
    <div className="font-mono text-xs leading-relaxed text-[var(--color-fg-dim)]">
      <div className={`mb-2 text-[10px] uppercase tracking-[0.2em] ${color}`}>{label}</div>
      <p>{children}</p>
    </div>
  );
}
