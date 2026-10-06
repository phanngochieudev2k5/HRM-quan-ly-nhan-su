import React from 'react';
import { FileText, Download, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import StatusBadge from '../common/StatusBadge';
import { contractsData } from '../../data/mockData';

export default function ContractsList() {
  return (
    <div>
      <PageHeader
        title="Quản lý Hợp đồng Lao động"
        subtitle="Theo dõi thời hạn hợp đồng, mức lương và điều khoản nhân sự"
        breadcrumb="Nhân sự / Hợp đồng"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => alert('Xuất danh sách hợp đồng')}>
              <Download size={15} /> Xuất file
            </button>
            <button className="btn btn-primary" onClick={() => alert('Thêm hợp đồng mới')}>
              <Plus size={16} /> Tạo hợp đồng mới
            </button>
          </>
        }
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div className="hrm-card">
          <div style={{ fontSize: '13px', color: '#64748b' }}>Tổng hợp đồng</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>128</div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>100% nhân viên đã ký</div>
        </div>
        <div className="hrm-card">
          <div style={{ fontSize: '13px', color: '#64748b' }}>Đang có hiệu lực</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>116</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Hợp đồng chính thức & thử việc</div>
        </div>
        <div className="hrm-card" style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
          <div style={{ fontSize: '13px', color: '#92400e', fontWeight: 600 }}>Sắp hết hạn (30 ngày)</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706' }}>8</div>
          <div style={{ fontSize: '12px', color: '#b45309', marginTop: '4px' }}>Cần tiến hành tái ký</div>
        </div>
        <div className="hrm-card">
          <div style={{ fontSize: '13px', color: '#64748b' }}>Đã thanh lý</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>4</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Nhân viên đã nghỉ việc</div>
        </div>
      </div>

      <div className="hrm-table-container">
        <table className="hrm-table">
          <thead>
            <tr>
              <th>Mã HĐ</th>
              <th>Nhân viên</th>
              <th>Mã NV</th>
              <th>Loại hợp đồng</th>
              <th>Ngày ký</th>
              <th>Ngày hết hạn</th>
              <th>Mức lương đóng BH</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {contractsData.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{c.id}</td>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.empName}</td>
                <td><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{c.empId}</span></td>
                <td>{c.type}</td>
                <td>{c.signDate}</td>
                <td>
                  <span style={{ color: c.status === 'Sắp hết hạn' ? '#ea580c' : '#334155', fontWeight: c.status === 'Sắp hết hạn' ? 600 : 400 }}>
                    {c.endDate}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{c.salary.toLocaleString('vi-VN')} đ</td>
                <td><StatusBadge status={c.status} /></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => alert(`Xem chi tiết hợp đồng ${c.id}`)}>
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
