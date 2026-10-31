import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: '10px',
        background: isSuccess ? '#064e3b' : isError ? '#7f1d1d' : '#0f172a',
        color: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
        border: `1px solid ${isSuccess ? '#059669' : isError ? '#dc2626' : '#334155'}`,
        fontSize: '13.5px',
        fontWeight: '500',
        animation: 'slideUp 0.25s ease-out',
        maxWidth: '420px'
      }}
    >
      {isSuccess && <CheckCircle2 size={18} style={{ color: '#34d399', flexShrink: 0 }} />}
      {isError && <AlertCircle size={18} style={{ color: '#f87171', flexShrink: 0 }} />}
      {!isSuccess && !isError && <Info size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#cbd5e1',
          cursor: 'pointer',
          padding: '2px',
          display: 'grid',
          placeItems: 'center'
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

