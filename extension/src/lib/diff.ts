import { createTwoFilesPatch, diffLines } from 'diff';
import type { Edit, InlineStyleEdit, StylesheetEdit } from './types';

export function parseInlineStyle(s: string): Array<[string, string]> {
  return s
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((decl) => {
      const idx = decl.indexOf(':');
      if (idx === -1) return [decl, ''] as [string, string];
      return [decl.slice(0, idx).trim(), decl.slice(idx + 1).trim()] as [string, string];
    });
}

function inlineStyleDiff(before: string, after: string): string[] {
  const beforeMap = new Map(parseInlineStyle(before));
  const afterMap = new Map(parseInlineStyle(after));
  const lines: string[] = [];
  const keys = new Set<string>([...beforeMap.keys(), ...afterMap.keys()]);
  for (const k of keys) {
    const b = beforeMap.get(k);
    const a = afterMap.get(k);
    if (b !== undefined && a === undefined) lines.push(`- ${k}: ${b};`);
    else if (b === undefined && a !== undefined) lines.push(`+ ${k}: ${a};`);
    else if (b !== a) {
      lines.push(`- ${k}: ${b};`);
      lines.push(`+ ${k}: ${a};`);
    }
  }
  return lines;
}

function renderInlineEdit(e: InlineStyleEdit, idx: number): string {
  const lines = inlineStyleDiff(e.before, e.after);
  return [
    `### ${idx + 1}. inline style on \`${e.selector}\``,
    '',
    '```html',
    e.outerHTML.trim(),
    '```',
    '',
    '```css',
    `/* ${e.selector} */`,
    ...lines,
    '```',
  ].join('\n');
}

function renderStylesheetEdit(e: StylesheetEdit, idx: number): string {
  const label = e.sourceURL || `stylesheet ${e.styleSheetId}`;
  // Use a unified patch for stylesheet edits — line-level granularity
  const patch = createTwoFilesPatch(label, label, e.before, e.after, '', '', { context: 2 });
  // Strip the leading "Index:" line and "===" separator that some renderers add — diff lib does not emit those by default, so we keep as-is
  const trimmed = trimPatch(patch);
  return [
    `### ${idx + 1}. stylesheet edit — ${label}`,
    '',
    '```diff',
    trimmed,
    '```',
  ].join('\n');
}

function trimPatch(patch: string): string {
  // The `diff` library outputs a header like:
  //   ===================================================================
  //   --- file
  //   +++ file
  //   @@ -1,4 +1,4 @@
  // We want to keep the @@ hunks but show a single concise file marker.
  const lines = patch.split('\n');
  const out: string[] = [];
  let seenHunk = false;
  for (const ln of lines) {
    if (!seenHunk && (ln.startsWith('===') || ln.startsWith('Index:'))) continue;
    if (ln.startsWith('@@')) seenHunk = true;
    out.push(ln);
  }
  return out.join('\n').trim();
}

export function renderDiff(edits: Edit[]): string {
  if (edits.length === 0) return '_(no edits captured yet)_';
  const first = edits[0];
  const url = first.url || '(unknown)';
  const vp = first.viewport;
  const header = [
    '# make-diff capture',
    '',
    `**Page:** ${url}`,
    `**Viewport:** ${vp.width}×${vp.height} @${vp.dpr}x`,
    `**Captured:** ${edits.length} change${edits.length === 1 ? '' : 's'}`,
    '',
    '> Visual edits I just made by hand in DevTools. Apply these intents to the source — match the result, not necessarily the literal CSS path (e.g. update Tailwind classes / styled-components / source CSS as appropriate for this codebase).',
    '',
  ].join('\n');

  const sections = edits.map((e, i) =>
    e.kind === 'inline-style' ? renderInlineEdit(e, i) : renderStylesheetEdit(e, i)
  );

  return [header, ...sections].join('\n\n');
}

export function unifiedTextDiff(before: string, after: string, label = 'styles'): string {
  const parts = diffLines(before, after);
  const out: string[] = [`--- ${label} (before)`, `+++ ${label} (after)`];
  for (const p of parts) {
    const prefix = p.added ? '+' : p.removed ? '-' : ' ';
    for (const line of p.value.split('\n')) {
      if (line === '' && p.value.endsWith('\n')) continue;
      out.push(prefix + line);
    }
  }
  return out.join('\n');
}
