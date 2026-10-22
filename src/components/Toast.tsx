import React from 'react';
import { Icon } from './Icon';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg shadow-elevated border text-sm font-medium transition-all duration-200 animate-in fade-in slide-in-from-top-3 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <Icon name="check" className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <Icon name="x" className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <Icon name="wallet" className="w-5 h-5 text-emerald-300" />}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg hover:bg-white/20 active:bg-white/30 text-white/80 hover:text-white transition-colors ml-2"
            aria-label="Tutup notifikasi"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
