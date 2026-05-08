/// <reference types="chrome" />
import type { BgInbound, BgOutbound } from './lib/types';

type PanelPort = chrome.runtime.Port & { tabId?: number };

const portsByTab = new Map<number, PanelPort>();

function send(port: chrome.runtime.Port, msg: BgOutbound) {
  try {
    port.postMessage(msg);
  } catch {
    // port already closed
  }
}

chrome.runtime.onConnect.addListener((rawPort) => {
  if (rawPort.name !== 'make-diff-panel') return;
  const port = rawPort as PanelPort;

  port.onMessage.addListener(async (msg: BgInbound) => {
    if (msg.type === 'attach') {
      const tabId = msg.tabId;
      port.tabId = tabId;
      portsByTab.set(tabId, port);
      try {
        await chrome.debugger.attach({ tabId }, '1.3');
        await chrome.debugger.sendCommand({ tabId }, 'DOM.enable');
        await chrome.debugger.sendCommand({ tabId }, 'CSS.enable');
        await chrome.debugger.sendCommand({ tabId }, 'Page.enable');
        send(port, { type: 'attached' });
      } catch (e) {
        send(port, { type: 'error', message: String((e as Error)?.message ?? e) });
      }
    } else if (msg.type === 'detach') {
      const tabId = port.tabId;
      if (tabId !== undefined) {
        try { await chrome.debugger.detach({ tabId }); } catch {}
        portsByTab.delete(tabId);
        send(port, { type: 'detached' });
      }
    } else if (msg.type === 'cdp') {
      const tabId = port.tabId;
      if (tabId === undefined) {
        send(port, { type: 'cdp-error', id: msg.id, message: 'not attached' });
        return;
      }
      try {
        const result = await chrome.debugger.sendCommand(
          { tabId },
          msg.method,
          msg.params as object | undefined
        );
        send(port, { type: 'cdp-result', id: msg.id, result });
      } catch (e) {
        send(port, { type: 'cdp-error', id: msg.id, message: String((e as Error)?.message ?? e) });
      }
    }
  });

  port.onDisconnect.addListener(async () => {
    const tabId = port.tabId;
    if (tabId !== undefined) {
      portsByTab.delete(tabId);
      try { await chrome.debugger.detach({ tabId }); } catch {}
    }
  });
});

chrome.debugger.onEvent.addListener((source, method, params) => {
  if (source.tabId === undefined) return;
  const port = portsByTab.get(source.tabId);
  if (!port) return;
  send(port, { type: 'cdp-event', method, params });
});

chrome.debugger.onDetach.addListener((source, reason) => {
  if (source.tabId === undefined) return;
  const port = portsByTab.get(source.tabId);
  if (port) send(port, { type: 'detached', reason });
  portsByTab.delete(source.tabId);
});
