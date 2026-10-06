import React, { useState } from 'react';
import { Award, Star, CheckCircle, TrendingUp, User } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import { performanceKpiData } from '../../data/mockData';

export default function PerformanceView() {
  const [data, setData] = useState(performanceKpiData);

  const totalScore = data.criteria.reduce((sum, item) => sum + item.score, 0);

  return (
    <div>
      <PageHeader
        title="Đánh Giá Hiệu Suất & KPI Nhân Viên"
        subtitle="Hệ thống chấm điểm chỉ số hiệu quả công việc theo chu kỳ định kỳ"
        breadcrumb="Đánh giá / KPI"
      />

      {/* Employee banner as shown in Section 13 */}
      <div className="hrm-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <Award size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                {data.employee.name}
              </h2>
              <div style={{ fontSize: '13.5px', color: '#64748b' }}>
                <strong>{data.employee.code}</strong> • {data.employee.position} • {data.employee.period}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Xếp loại hiệu suất</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>
              {data.employee.rating}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Evaluation Criteria Table */}
      <div className="hrm-card">
        <div className="card-header">
          <span className="card-title">
            Bảng chỉ số đánh giá KPI chi tiết
          </span>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>Chu kỳ 2024 - 2025</span>
        </div>

        <div className="hrm-table-container">
          <table className="hrm-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
                <th>Tiêu chí đánh giá</th>
                <th>Trọng số (%)</th>
                <th>Mục tiêu cam kết</th>
                <th>Kết quả thực tế</th>
                <th style={{ textAlign: 'right' }}>Điểm quy đổi</th>
              </tr>
            </thead>
            <tbody>
              {data.criteria.map((c, idx) => (
                <tr key={c.id}>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#2563eb' }}>{c.weight}%</span>
                  </td>
                  <td>{c.target}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#059669' }}>{c.actual}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                    {c.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Final score footer */}
        <div style={{
          marginTop: '20px',
          padding: '16px 20px',
          background: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Quy đổi điểm tổng kết</div>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
              Điểm đạt = Tổng (Trọng số × Tỷ lệ hoàn thành)
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#64748b' }}>Tổng điểm KPI:</span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb' }}>
              {totalScore} / 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
