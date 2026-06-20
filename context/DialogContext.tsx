'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

interface DialogConfig {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'default' | 'danger';
  showCancel: boolean;
}

interface DialogContextValue {
  confirm: (message: string, opts?: { title?: string; confirmLabel?: string; cancelLabel?: string; variant?: 'default' | 'danger' }) => Promise<boolean>;
  alert: (message: string, opts?: { title?: string }) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within DialogProvider');
  return ctx;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const resolveRef          = useRef<(v: boolean) => void>(() => {});

  const confirm = useCallback((
    message: string,
    opts?: { title?: string; confirmLabel?: string; cancelLabel?: string; variant?: 'default' | 'danger' },
  ): Promise<boolean> => {
    return new Promise(resolve => {
      resolveRef.current = resolve;
      setConfig({
        title:        opts?.title        ?? 'Confirm',
        message,
        confirmLabel: opts?.confirmLabel ?? 'Confirm',
        cancelLabel:  opts?.cancelLabel  ?? 'Cancel',
        variant:      opts?.variant      ?? 'default',
        showCancel:   true,
      });
    });
  }, []);

  const alert = useCallback((message: string, opts?: { title?: string }): Promise<void> => {
    return new Promise(resolve => {
      resolveRef.current = () => resolve();
      setConfig({
        title:        opts?.title ?? 'Notice',
        message,
        confirmLabel: 'OK',
        cancelLabel:  '',
        variant:      'default',
        showCancel:   false,
      });
    });
  }, []);

  function handleConfirm() { resolveRef.current(true);  setConfig(null); }
  function handleCancel()  { resolveRef.current(false); setConfig(null); }

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {config && (
        <div className="modal-overlay" onClick={config.showCancel ? handleCancel : undefined}>
          <div
            className="modal"
            style={{ maxWidth: 420 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <h3 style={{ margin: 0 }}>{config.title}</h3>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--grey-700)' }}>{config.message}</p>
            </div>
            <div className="formfoot">
              {config.showCancel && (
                <button className="btn btn-ghost" onClick={handleCancel}>
                  {config.cancelLabel}
                </button>
              )}
              <button
                className={`btn ${config.variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleConfirm}
                autoFocus
              >
                {config.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
