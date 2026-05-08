import { useEffect, useMemo, useRef, useState } from 'react';
import { CDPClient } from '../lib/cdp';
import { Recorder } from '../lib/recorder';
import { renderDiff } from '../lib/diff';
import type { Edit } from '../lib/types';

type Status = 'idle' | 'attaching' | 'attached' | 'detached' | 'error';

export function App() {
  const cdpRef = useRef<CDPClient | null>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [statusDetail, setStatusDetail] = useState<string | null>(null);
  const [edits, setEdits] = useState<Edit[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const cdp = new CDPClient();
    cdpRef.current = cdp;
    const recorder = new Recorder(cdp);
    recorderRef.current = recorder;

    const offStatus = cdp.onStatus((s, detail) => {
      if (s === 'attached') {
        setStatus('attached');
        setStatusDetail(null);
        recorder.start();
      } else if (s === 'detached') {
        setStatus('detached');
        setStatusDetail(detail ?? null);
        recorder.stop();
      } else if (s === 'error') {
        setStatus('error');
        setStatusDetail(detail ?? null);
      }
    });
    const offEdits = recorder.onChange((next) => setEdits([...next]));

    setStatus('attaching');
    cdp.connect(chrome.devtools.inspectedWindow.tabId);

    return () => {
      offStatus();
      offEdits();
      recorder.stop();
      cdp.disconnect();
    };
  }, []);

  const diffMarkdown = useMemo(() => renderDiff(edits), [edits]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(diffMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('clipboard failed', e);
    }
  };

  const onClear = () => recorderRef.current?.clear();

  const onReattach = () => {
    setStatus('attaching');
    cdpRef.current?.connect(chrome.devtools.inspectedWindow.tabId);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">⌘</span>
          <span className="brand-name">make diff</span>
          <span className="brand-version">v0.1</span>
        </div>
        <div className="status">
          <span className={`status-dot status-${status}`} />
          <span className="status-label">
            {status === 'attaching' && 'attaching…'}
            {status === 'attached' && 'recording'}
            {status === 'detached' && 'detached'}
            {status === 'error' && 'error'}
            {status === 'idle' && 'idle'}
          </span>
          {statusDetail && <span className="status-detail" title={statusDetail}>{statusDetail}</span>}
          {(status === 'detached' || status === 'error') && (
            <button className="btn-ghost" onClick={onReattach}>reattach</button>
          )}
        </div>
        <div className="actions">
          <button className="btn-ghost" onClick={onClear} disabled={edits.length === 0}>
            clear
          </button>
          <button className="btn-primary" onClick={onCopy} disabled={edits.length === 0}>
            {copied ? 'copied ✓' : `copy diff (${edits.length})`}
          </button>
        </div>
      </header>

      <main className="main">
        {edits.length === 0 ? (
          <Empty status={status} />
        ) : (
          <ul className="edits">
            {edits.map((e, i) => (
              <EditRow key={e.id} edit={e} idx={i} />
            ))}
          </ul>
        )}
      </main>

      {edits.length > 0 && (
        <details className="preview">
          <summary>preview diff</summary>
          <pre>{diffMarkdown}</pre>
        </details>
      )}
    </div>
  );
}

function Empty({ status }: { status: Status }) {
  return (
    <div className="empty">
      <div className="empty-title">No edits captured yet.</div>
      <div className="empty-sub">
        {status === 'attached'
          ? 'Open Elements, tweak styles. Every change shows up here.'
          : status === 'attaching'
            ? 'Attaching to the inspected page…'
            : 'Not attached. Reattach to start recording.'}
      </div>
      {status === 'attached' && (
        <div className="empty-banner">
          <strong>Heads up:</strong> Chrome shows a yellow “make diff started debugging this browser”
          banner while attached. That’s how the DevTools Protocol works — closing the panel detaches.
        </div>
      )}
    </div>
  );
}

function EditRow({ edit, idx }: { edit: Edit; idx: number }) {
  if (edit.kind === 'inline-style') {
    return (
      <li className="edit edit-inline">
        <div className="edit-head">
          <span className="edit-num">{String(idx + 1).padStart(2, '0')}</span>
          <span className="edit-kind">inline</span>
          <code className="edit-selector">{edit.selector}</code>
          <span className="edit-vp">{edit.viewport.width}×{edit.viewport.height}</span>
        </div>
        <div className="edit-body">
          {edit.before && (
            <pre className="diff-line diff-removed">{edit.before}</pre>
          )}
          <pre className="diff-line diff-added">{edit.after || '(removed)'}</pre>
        </div>
      </li>
    );
  }
  return (
    <li className="edit edit-stylesheet">
      <div className="edit-head">
        <span className="edit-num">{String(idx + 1).padStart(2, '0')}</span>
        <span className="edit-kind">stylesheet</span>
        <code className="edit-selector">{edit.sourceURL || edit.styleSheetId}</code>
        <span className="edit-vp">{edit.viewport.width}×{edit.viewport.height}</span>
      </div>
      <div className="edit-body">
        <details>
          <summary>view diff</summary>
          <pre className="diff-block">{quickDiff(edit.before, edit.after)}</pre>
        </details>
      </div>
    </li>
  );
}

function quickDiff(before: string, after: string): string {
  if (before === after) return '(no change)';
  const a = before.split('\n');
  const b = after.split('\n');
  const max = Math.max(a.length, b.length);
  const lines: string[] = [];
  for (let i = 0; i < max; i++) {
    const x = a[i];
    const y = b[i];
    if (x === y) continue;
    if (x !== undefined) lines.push('- ' + x);
    if (y !== undefined) lines.push('+ ' + y);
  }
  return lines.slice(0, 80).join('\n') + (lines.length > 80 ? '\n…' : '');
}
