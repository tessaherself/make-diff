import type { BgInbound, BgOutbound } from './types';

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void };

export type CDPEventHandler = (method: string, params: unknown) => void;

export class CDPClient {
  private port: chrome.runtime.Port | null = null;
  private nextId = 1;
  private pending = new Map<number, Pending>();
  private eventHandlers = new Set<CDPEventHandler>();
  private statusHandlers = new Set<(s: 'attached' | 'detached' | 'error', detail?: string) => void>();

  connect(tabId: number) {
    this.disconnect();
    this.port = chrome.runtime.connect({ name: 'make-diff-panel' });
    this.port.onMessage.addListener((msg: BgOutbound) => this.handle(msg));
    this.port.onDisconnect.addListener(() => {
      this.port = null;
      this.notifyStatus('detached', 'port closed');
    });
    this.send({ type: 'attach', tabId });
  }

  disconnect() {
    if (this.port) {
      try { this.send({ type: 'detach' }); } catch {}
      try { this.port.disconnect(); } catch {}
      this.port = null;
    }
    for (const p of this.pending.values()) p.reject(new Error('disconnected'));
    this.pending.clear();
  }

  call<T = unknown>(method: string, params?: unknown): Promise<T> {
    if (!this.port) return Promise.reject(new Error('not connected'));
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      this.send({ type: 'cdp', id, method, params });
    });
  }

  onEvent(handler: CDPEventHandler) {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  onStatus(handler: (s: 'attached' | 'detached' | 'error', detail?: string) => void) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private send(msg: BgInbound) {
    this.port?.postMessage(msg);
  }

  private handle(msg: BgOutbound) {
    if (msg.type === 'attached') this.notifyStatus('attached');
    else if (msg.type === 'detached') this.notifyStatus('detached', msg.reason);
    else if (msg.type === 'error') this.notifyStatus('error', msg.message);
    else if (msg.type === 'cdp-result') {
      const p = this.pending.get(msg.id);
      if (p) { this.pending.delete(msg.id); p.resolve(msg.result); }
    } else if (msg.type === 'cdp-error') {
      const p = this.pending.get(msg.id);
      if (p) { this.pending.delete(msg.id); p.reject(new Error(msg.message)); }
    } else if (msg.type === 'cdp-event') {
      for (const h of this.eventHandlers) h(msg.method, msg.params);
    }
  }

  private notifyStatus(s: 'attached' | 'detached' | 'error', detail?: string) {
    for (const h of this.statusHandlers) h(s, detail);
  }
}
