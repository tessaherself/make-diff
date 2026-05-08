import type { CDPClient } from './cdp';
import type { Edit, InlineStyleEdit, StylesheetEdit, Viewport } from './types';

type DescribeNodeResult = {
  node: {
    nodeId: number;
    parentId?: number;
    nodeName: string;
    localName?: string;
    nodeType: number;
    attributes?: string[];
  };
};

type AttributeModifiedEvent = {
  nodeId: number;
  name: string;
  value: string;
};

type AttributeRemovedEvent = {
  nodeId: number;
  name: string;
};

type StyleSheetChangedEvent = {
  styleSheetId: string;
};

type StyleSheetAddedEvent = {
  header: { styleSheetId: string; sourceURL: string; origin: string };
};

type LayoutMetricsResult = {
  visualViewport: { clientWidth: number; clientHeight: number; scale: number };
};

export class Recorder {
  private cdp: CDPClient;
  private inlineStyles = new Map<number, string>(); // nodeId -> last seen style
  private stylesheetText = new Map<string, string>(); // styleSheetId -> last seen text
  private stylesheetMeta = new Map<string, { sourceURL: string }>();
  private edits: Edit[] = [];
  private listeners = new Set<(edits: Edit[]) => void>();
  private unsubscribe?: () => void;

  constructor(cdp: CDPClient) {
    this.cdp = cdp;
  }

  start() {
    this.unsubscribe = this.cdp.onEvent((method, params) => {
      this.onCDPEvent(method, params).catch(console.error);
    });
    this.bootstrapStylesheets().catch(console.error);
  }

  stop() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  getEdits(): Edit[] {
    return this.edits;
  }

  clear() {
    this.edits = [];
    this.notify();
  }

  onChange(listener: (edits: Edit[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const l of this.listeners) l(this.edits);
  }

  private async bootstrapStylesheets() {
    // Page.enable already requested. Stylesheets emit CSS.styleSheetAdded as they load,
    // but for sheets that already exist we proactively cache them when first edited.
  }

  private async onCDPEvent(method: string, params: unknown) {
    if (method === 'DOM.attributeModified') {
      const p = params as AttributeModifiedEvent;
      if (p.name !== 'style') {
        // also track style attribute removal-then-add by stashing other attrs? skip for v0
        return;
      }
      const before = this.inlineStyles.get(p.nodeId) ?? '';
      const after = p.value;
      this.inlineStyles.set(p.nodeId, after);
      if (before === after) return;
      // Skip the very first observation if it just hydrates state (no real edit signal).
      // Heuristic: if before is empty and we have not seen any edits yet for this node,
      // we still record — first edit of an element is meaningful.
      await this.recordInlineEdit(p.nodeId, before, after);
    } else if (method === 'DOM.attributeRemoved') {
      const p = params as AttributeRemovedEvent;
      if (p.name !== 'style') return;
      const before = this.inlineStyles.get(p.nodeId) ?? '';
      this.inlineStyles.set(p.nodeId, '');
      if (before) await this.recordInlineEdit(p.nodeId, before, '');
    } else if (method === 'CSS.styleSheetAdded') {
      const p = params as StyleSheetAddedEvent;
      this.stylesheetMeta.set(p.header.styleSheetId, { sourceURL: p.header.sourceURL });
      try {
        const res = await this.cdp.call<{ text: string }>('CSS.getStyleSheetText', {
          styleSheetId: p.header.styleSheetId,
        });
        this.stylesheetText.set(p.header.styleSheetId, res.text ?? '');
      } catch {
        // some sheets are not retrievable (cross-origin etc.)
      }
    } else if (method === 'CSS.styleSheetChanged') {
      const p = params as StyleSheetChangedEvent;
      try {
        const res = await this.cdp.call<{ text: string }>('CSS.getStyleSheetText', {
          styleSheetId: p.styleSheetId,
        });
        const before = this.stylesheetText.get(p.styleSheetId) ?? '';
        const after = res.text ?? '';
        if (before === after) return;
        this.stylesheetText.set(p.styleSheetId, after);
        await this.recordStylesheetEdit(p.styleSheetId, before, after);
      } catch {
        // ignore
      }
    } else if (method === 'DOM.documentUpdated') {
      // Document re-loaded; clear caches for this tab
      this.inlineStyles.clear();
    }
  }

  private async recordInlineEdit(nodeId: number, before: string, after: string) {
    const [selector, outerHTML, viewport, url] = await Promise.all([
      this.computeSelector(nodeId),
      this.computeOuterHTML(nodeId),
      this.computeViewport(),
      this.computeUrl(),
    ]);
    const edit: InlineStyleEdit = {
      kind: 'inline-style',
      id: crypto.randomUUID(),
      ts: Date.now(),
      selector,
      outerHTML,
      before,
      after,
      viewport,
      url,
    };
    this.edits.push(edit);
    this.notify();
  }

  private async recordStylesheetEdit(styleSheetId: string, before: string, after: string) {
    const [viewport, url] = await Promise.all([this.computeViewport(), this.computeUrl()]);
    const meta = this.stylesheetMeta.get(styleSheetId);
    const edit: StylesheetEdit = {
      kind: 'stylesheet',
      id: crypto.randomUUID(),
      ts: Date.now(),
      styleSheetId,
      sourceURL: meta?.sourceURL ?? '',
      before,
      after,
      viewport,
      url,
    };
    this.edits.push(edit);
    this.notify();
  }

  private async computeSelector(nodeId: number): Promise<string> {
    const parts: string[] = [];
    let current = nodeId;
    let safety = 0;
    while (current && safety++ < 20) {
      let res: DescribeNodeResult;
      try {
        res = await this.cdp.call<DescribeNodeResult>('DOM.describeNode', { nodeId: current });
      } catch {
        break;
      }
      const node = res.node;
      if (!node || node.nodeType !== 1) break;
      const tag = (node.localName || node.nodeName).toLowerCase();
      let part = tag;
      const attrs = node.attributes ?? [];
      for (let i = 0; i < attrs.length; i += 2) {
        const k = attrs[i];
        const v = attrs[i + 1] ?? '';
        if (k === 'id' && v) {
          part = `${tag}#${v}`;
          parts.unshift(part);
          return parts.join(' > ');
        }
        if (k === 'class' && v) {
          const classes = v.trim().split(/\s+/).slice(0, 3);
          if (classes.length && classes[0]) part += '.' + classes.join('.');
        }
      }
      parts.unshift(part);
      if (!node.parentId) break;
      current = node.parentId;
    }
    return parts.join(' > ');
  }

  private async computeOuterHTML(nodeId: number): Promise<string> {
    try {
      const res = await this.cdp.call<{ outerHTML: string }>('DOM.getOuterHTML', { nodeId });
      const html = res.outerHTML ?? '';
      // truncate to keep diffs lean
      return html.length > 600 ? html.slice(0, 600) + '…' : html;
    } catch {
      return '';
    }
  }

  private async computeViewport(): Promise<Viewport> {
    try {
      const res = await this.cdp.call<LayoutMetricsResult>('Page.getLayoutMetrics');
      const v = res.visualViewport;
      return { width: Math.round(v.clientWidth), height: Math.round(v.clientHeight), dpr: v.scale };
    } catch {
      return { width: 0, height: 0, dpr: 1 };
    }
  }

  private async computeUrl(): Promise<string> {
    try {
      const res = await this.cdp.call<{ frameTree: { frame: { url: string } } }>(
        'Page.getFrameTree'
      );
      return res.frameTree?.frame?.url ?? '';
    } catch {
      return '';
    }
  }
}
