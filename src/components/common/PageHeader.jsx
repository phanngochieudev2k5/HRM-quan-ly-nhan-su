import React from 'react';

export default function PageHeader({ title, subtitle, breadcrumb, actions }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        {breadcrumb && (
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Hệ thống HRM</span>
            <span>/</span>
            <span style={{ color: '#2563eb', fontWeight: 500 }}>{breadcrumb}</span>
          </div>
        )}
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
