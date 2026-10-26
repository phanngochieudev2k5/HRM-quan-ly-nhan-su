import React from 'react';
import { Database, Plus, RefreshCw, Sparkles, Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'Chưa có dữ liệu từ máy chủ',
  description = 'Giao diện mẫu đã sẵn sàng tiếp nhận dữ liệu động từ backend API.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  onRefresh,
  isTable = false,
  colSpan = 8,
  sampleColumns = []
}) {
  const content = (
    <div style={{
      padding: '48px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      background: 'rgba(248, 250, 252, 0.6)',
      borderRadius: '12px',
      border: '1px dashed #cbd5e1',
      margin: isTable ? '12px' : '16px 0'
    }}>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: '#e0f2fe',
        color: '#0284c7',
        display: 'grid',
        placeItems: 'center',
        marginBottom: '4px'
      }}>
        <Icon size={26} />
      </div>

      <div style={{ maxWidth: '420px' }}>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
          {title}
        </h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        {onRefresh && (
          <button
            type="button"
            className="btn"
            style={{ fontSize: '12.5px', padding: '6px 14px' }}
            onClick={onRefresh}
          >
            <RefreshCw size={14} />
            <span>Tải lại dữ liệu</span>
          </button>
        )}
        {actionLabel && onAction && (
          <button
            type="button"
            className="btn pri"
            style={{ fontSize: '12.5px', padding: '6px 14px' }}
            onClick={onAction}
          >
            <Plus size={14} />
            <span>{actionLabel}</span>
          </button>
        )}
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11.5px',
        color: '#0f766e',
        background: '#f0fdfa',
        padding: '4px 10px',
        borderRadius: '6px',
        marginTop: '8px',
        fontWeight: '500'
      }}>
        <Sparkles size={13} />
        <span>Sẵn sàng kết nối cơ sở dữ liệu SQL Server (HRM_Enterprise_DB)</span>
      </div>
    </div>
  );

  if (isTable) {
    return (
      <tr>
        <td colSpan={colSpan} style={{ padding: 0 }}>
          {content}
        </td>
      </tr>
    );
  }

  return content;
}
