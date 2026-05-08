/**
 * A small SVG that shows a "div" failing to center its child — the visual joke
 * embedded mid-headline. Outer box outlined, inner box deliberately offset.
 */
export function BrokenDiv({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      className={className}
      aria-label="a div with an off-center child"
    >
      <rect x="6" y="6" width="88" height="88" rx="4" />
      {/* Inner box — deliberately NOT centered. Should be at (35, 35) for true center; we offset. */}
      <rect
        x="58"
        y="22"
        width="30"
        height="30"
        rx="2"
        fill="currentColor"
        stroke="none"
      />
      {/* Tiny crosshair marking the true center for the reader who's paying attention */}
      <line x1="50" y1="46" x2="50" y2="54" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <line x1="46" y1="50" x2="54" y2="50" stroke="currentColor" strokeWidth="2" opacity="0.4" />
    </svg>
  );
}
