import React from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

export default function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  candidateName = 'Ứng viên'
}) {
  if (!isOpen || !pdfUrl) return null;

  const downloadName = `CV_${candidateName.replace(/\s+/g, '_')}.pdf`;

  return (
    <div className="modal-wrap" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal"
        style={{
          maxWidth: '960px',
          width: '92vw',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-h"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: '#0f766e' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                Hồ sơ CV (PDF): {candidateName}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={pdfUrl}
              download={downloadName}
              className="btn pri"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '6px 12px' }}
              title="Tải file PDF về máy tính"
            >
              <Download size={14} />
              <span>Tải về</span>
            </a>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '6px 12px' }}
              title="Mở file PDF trong tab trình duyệt mới"
            >
              <ExternalLink size={14} />
              <span>Tab mới</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              title="Đóng cửa sổ xem trước"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, background: '#f1f5f9' }}>
          <iframe
            src={pdfUrl}
            title={`CV của ${candidateName}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

