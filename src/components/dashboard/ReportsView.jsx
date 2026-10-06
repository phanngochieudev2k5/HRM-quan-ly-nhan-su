import React from 'react';
import { BarChart3, TrendingUp, Download, Users, DollarSign, Clock, Calendar } from 'lucide-react';
import PageHeader from '../common/PageHeader';

export default function ReportsView() {
  const deptsStats = [
    { name: 'Khối Kỹ Thuật (IT)', count: 52, budget: 1450000000, lateRate: '3.2%' },
    { name: 'Khối Kinh Doanh (Sales)', count: 35, budget: 850000000, lateRate: '5.1%' },
    { name: 'Marketing & Truyền thông', count: 18, budget: 480000000, lateRate: '4.0%' },
    { name: 'Phòng Nhân sự (HR)', count: 8, budget: 190000000, lateRate: '1.2%' },
    { name: 'Tài chính - Kế toán', count: 10, budget: 220000000, lateRate: '1.5%' },
    { name: 'Khối R&D (AI/OpenCV)', count: 5, budget: 180000000, lateRate: '2.0%' }
  ];

  return (
    <div>
      <PageHeader
        title="Báo Cáo & Thống Kê Tổng Hợp"
        subtitle="Phân tích dữ liệu nhân sự, hiệu suất làm việc, biến động lương và tỷ lệ chuyên cần"
        breadcrumb="Báo cáo / Tổng hợp"
        actions={
          <button className="btn btn-primary" onClick={() => alert('Đang xuất toàn bộ file báo cáo PDF/Excel...')}>
            <Download size={15} /> Xuất trọn bộ báo cáo
          </button>
        }
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div className="hrm-card">
          <div style={{ fontSize: '13px', color: '#64748b' }}>Tỷ lệ nhân viên đi làm đúng giờ</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>96.8%</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Nhờ hệ thống camera OpenCV check-in tự động</div>
        </div>

        <div className="hrm-card">
          <div style={{ fontSize: '13px', color: '#64748b' }}>Tỷ lệ luân chuyển nhân sự (Turnover Rate)</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#2563eb', margin: '4px 0' }}>3.9%</div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>Mức ổn định cao hơn trung bình ngành (8%)</div>
        </div>

        <div className="hrm-card">
          <div style={{ fontSize: '13px', color: '#64748b' }}>Tỷ lệ đáp ứng tuyển dụng (Time-to-Hire)</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b', margin: '4px 0' }}>18 ngày</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Trung bình từ sơ vấn đến nhận việc</div>
        </div>
      </div>

      <div className="hrm-card">
        <div className="card-header">
          <span className="card-title">
            <BarChart3 size={18} color="#2563eb" />
            Thống kê chỉ số nhân sự theo phòng ban
          </span>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>Tháng 04/2025</span>
        </div>

        <div className="hrm-table-container">
          <table className="hrm-table">
            <thead>
              <tr>
                <th>Phòng ban / Khối chức năng</th>
                <th>Quy mô nhân sự</th>
                <th>Tổng quỹ lương</th>
                <th>Tỷ lệ đi muộn</th>
                <th style={{ textAlign: 'right' }}>Đánh giá hiệu suất</th>
              </tr>
            </thead>
            <tbody>
              {deptsStats.map((d, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{d.name}</td>
                  <td>{d.count} nhân viên</td>
                  <td style={{ fontWeight: 600 }}>{d.budget.toLocaleString('vi-VN')} đ</td>
                  <td>
                    <span style={{ color: '#ea580c', fontWeight: 600 }}>{d.lateRate}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="status-badge badge-success">Đạt chỉ tiêu A</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
