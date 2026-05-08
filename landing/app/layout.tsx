import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'make diff — AI can\'t center divs',
  description:
    'Chrome extension that records the manual CSS edits you make in DevTools and exports a paste-ready diff for your coding agent. Stop burning tokens centering a div.',
  openGraph: {
    title: 'make diff — AI can\'t center divs',
    description:
      'Tweak it once in DevTools, copy the diff, paste it back. No more reverts.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
