import { Frame } from '@/components/Frame';
import { Hero } from '@/components/Hero';
import { FlowSections } from '@/components/FlowSections';

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <Frame />
      <Hero />
      <FlowSections />
    </main>
  );
}
