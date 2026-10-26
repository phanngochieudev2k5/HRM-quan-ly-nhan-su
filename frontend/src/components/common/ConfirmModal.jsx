import React from 'react';
import { X } from 'lucide-react';
import '../../styles/common/ConfirmModal.css';

export default function ConfirmModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '550px'
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div
        className="confirm-modal-dialog"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-modal-header">
          <h3>{title}</h3>
          <button className="ibtn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="confirm-modal-body">
          {children}
        </div>
        {footer && (
          <div className="confirm-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
