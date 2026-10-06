import React from 'react';
import { Clock, Plus, Users, Calendar, AlertCircle } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import { shiftsData } from '../../data/mockData';

export default function ShiftsView() {
  return (
    <div>
      <PageHeader
        title="Quản Lý Ca Làm Việc & Phân Ca"
        subtitle="Thiết lập khung giờ làm việc và quy định tính giờ đi muộn / về sớm"
        breadcrumb="Chấm công / Ca làm việc"
        actions={
          <button className="btn btn-primary" onClick={() => alert('Thêm ca làm việc mới')}>
            <Plus size={16} /> Thêm ca làm việc
          </button>
        }
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {shiftsData.map(s => (
          <div key={s.id} className="hrm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                  {s.name}
                </h3>
                <span className="status-badge badge-info">{s.type}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{s.id}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Khung giờ làm việc:</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{s.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Thời gian nghỉ giữa ca:</span>
                <span>{s.breakTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Nhân sự áp dụng:</span>
                <span style={{ fontWeight: 600 }}>{s.activeEmp} nhân viên</span>
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px'
            }}>
              <button className="btn btn-secondary btn-sm" onClick={() => alert(`Chỉnh sửa ${s.name}`)}>Chỉnh sửa</button>
              <button className="btn btn-outline-primary btn-sm" onClick={() => alert(`Gán nhân sự vào ${s.name}`)}>Phân ca nhân viên</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
