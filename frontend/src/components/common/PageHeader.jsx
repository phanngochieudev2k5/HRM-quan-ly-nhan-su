import React from 'react';
import '../../styles/common/PageHeader.css';

export default function PageHeader({ title, subtitle, breadcrumb, actions }) {
  return (
    <div className="page-header-container">
      <div className="page-header-title-box">
        {breadcrumb && (
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
            <span>Enterprise HRM</span>
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: '#0f766e', fontWeight: 600 }}>{breadcrumb}</span>
          </div>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && (
        <div className="page-header-actions-box">
          {actions}
        </div>
      )}
    </div>
  );
}
