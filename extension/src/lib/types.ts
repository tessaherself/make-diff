export type Viewport = {
  width: number;
  height: number;
  dpr: number;
};

export type InlineStyleEdit = {
  kind: 'inline-style';
  id: string;
  ts: number;
  selector: string;
  outerHTML: string;
  before: string;
  after: string;
  viewport: Viewport;
  url: string;
};

export type StylesheetEdit = {
  kind: 'stylesheet';
  id: string;
  ts: number;
  styleSheetId: string;
  sourceURL: string;
  before: string;
  after: string;
  viewport: Viewport;
  url: string;
};

export type Edit = InlineStyleEdit | StylesheetEdit;

export type BgInbound =
  | { type: 'attach'; tabId: number }
  | { type: 'detach' }
  | { type: 'cdp'; id: number; method: string; params?: unknown };

export type BgOutbound =
  | { type: 'attached' }
  | { type: 'detached'; reason?: string }
  | { type: 'error'; message: string }
  | { type: 'cdp-result'; id: number; result: unknown }
  | { type: 'cdp-error'; id: number; message: string }
  | { type: 'cdp-event'; method: string; params: unknown };
