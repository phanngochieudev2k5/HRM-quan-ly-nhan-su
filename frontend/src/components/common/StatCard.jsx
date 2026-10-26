import React from 'react';
import '../../styles/common/StatCard.css';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  color = '#0f766e',
  bg = '#ccfbf1',
  trend,
  unit,
  sparklineData
}) {
  const isUp = trend && trend.startsWith('+');
  const isDown = trend && trend.startsWith('-');

  return (
    <div
      className="stat-card-kc"
      style={{
        '--indicator-color': color
      }}
    >
      <div className="stat-card-header">
        {Icon && (
          <div
            className="stat-card-icon-box"
            style={{ background: bg, color: color }}
          >
            <Icon size={18} />
          </div>
        )}
        <span className="stat-card-title">{title}</span>
        {trend && (
          <span className={`stat-card-pill ${isUp ? 'up' : isDown ? 'down' : 'neutral'}`}>
            {isUp ? '▲ ' : isDown ? '▼ ' : ''}{trend}
          </span>
        )}
      </div>

      <div className="stat-card-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>

      {subtext && <div className="stat-card-subtext">{subtext}</div>}

      <svg className="stat-card-sparkline" viewBox="0 0 240 42" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`spk-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.22" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,32 L40,28 L80,30 L120,18 L160,22 L200,12 L240,16 L240,42 L0,42 Z"
          fill={`url(#spk-${color.replace('#', '')})`}
        />
        <path
          d="M0,32 L40,28 L80,30 L120,18 L160,22 L200,12 L240,16"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
