import Link from 'next/link';

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
};

export function CTAButton({ href, children, variant = 'primary' }: Props) {
  const base =
    'group relative inline-flex items-center justify-center px-6 py-3 font-mono text-xs sm:text-sm tracking-wider transition-all duration-150';
  const styles =
    variant === 'primary'
      ? 'bg-[var(--color-fg)] text-[var(--color-bg)] hover:bg-[var(--color-accent)]'
      : 'border border-[var(--color-fg)] text-[var(--color-fg)] hover:bg-[var(--color-fg)] hover:text-[var(--color-bg)]';

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {/* Corner accents — visible on hover for primary, always for ghost */}
      <span className="pointer-events-none absolute -left-[3px] -top-[3px] h-2 w-2 border-l border-t border-[var(--color-fg)] opacity-0 transition-opacity group-hover:opacity-100" />
      <span className="pointer-events-none absolute -right-[3px] -bottom-[3px] h-2 w-2 border-r border-b border-[var(--color-fg)] opacity-0 transition-opacity group-hover:opacity-100" />
      {children}
    </Link>
  );
}
