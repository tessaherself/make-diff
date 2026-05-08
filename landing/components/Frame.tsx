export function Frame() {
  return (
    <>
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-bg)]/70 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3 font-mono text-[11px] tracking-wider text-[var(--color-fg-dim)]">
          <div className="flex items-center gap-3">
            <span className="text-[var(--color-fg)] font-semibold italic tracking-wide">
              make-diff
            </span>
            <span className="h-3 w-px bg-[var(--color-fg-faint)]" />
            <span>EST. 2026</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>v0.1 · OPEN BETA</span>
            <span className="h-3 w-px bg-[var(--color-fg-faint)]" />
            <a
              href="https://github.com/tessaherself/make-diff"
              className="hover:text-[var(--color-fg)] transition-colors"
            >
              GITHUB
            </a>
          </div>
        </div>
      </header>

      {/* Vertical right tab */}
      <aside className="fixed right-0 top-1/2 z-30 -translate-y-1/2">
        <a
          href="#install"
          className="block bg-[var(--color-fg)] px-2.5 py-5 font-mono text-[11px] font-semibold text-[var(--color-bg)] hover:bg-[var(--color-accent)] transition-colors vtab"
        >
          MAKE THE DIFF
        </a>
      </aside>

      {/* Bottom system-status footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--color-line)] bg-[var(--color-bg)]/70 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-2 font-mono text-[10px] tracking-wider text-[var(--color-fg-dim)]">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">SYSTEM.ACTIVE</span>
            <span className="sm:hidden">SYS.ACT</span>
            <div className="hidden sm:flex gap-[3px]">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="block w-[2px] bg-[var(--color-fg-dim)]/60"
                  style={{ height: `${4 + ((i * 7) % 12)}px` }}
                />
              ))}
            </div>
            <span>V0.1.0</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">◐ RECORDING</span>
            <div className="flex gap-[3px]">
              <span className="block h-1 w-1 rounded-full bg-[var(--color-good)]/80 pulse" />
              <span className="block h-1 w-1 rounded-full bg-[var(--color-good)]/60 pulse-2" />
              <span className="block h-1 w-1 rounded-full bg-[var(--color-good)]/40 pulse-3" />
            </div>
            <span className="hidden sm:inline">DIFF: LIVE</span>
          </div>
        </div>
      </footer>
    </>
  );
}
