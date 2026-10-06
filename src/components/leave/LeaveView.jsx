import React, { useState } from 'react';
import {
  CalendarDays, Plus, CheckCircle, XCircle, Clock,
  Calendar, Check, AlertCircle, FileText
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import StatusBadge from '../common/StatusBadge';
import { leaveRequestsData } from '../../data/mockData';

export default function LeaveView({ currentRole }) {
  const [requests, setRequests] = useState(leaveRequestsData);
  const [formData, setFormData] = useState({
    type: 'Nghỉ phép năm',
    startDate: '2025-04-25',
    endDate: '2025-04-27',
    days: 3,
    reason: ''
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Leave balances
  const balances = [
    { type: 'Nghỉ phép năm', total: 14, used: 2, remain: 12, color: '#2563eb', bg: '#eff6ff' },
    { type: 'Nghỉ ốm / Khám bệnh', total: 6, used: 1, remain: 5, color: '#10b981', bg: '#ecfdf5' },
    { type: 'Nghỉ không lương', total: 5, used: 3, remain: 2, color: '#f59e0b', bg: '#fffbeb' }
  ];

  const handleDateChange = (start, end) => {
    // simple day calculation
    const d1 = new Date(start);
    const d2 = new Date(end);
    let diffDays = 1;
    if (d2 >= d1) {
      diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    }
    setFormData(prev => ({
      ...prev,
      startDate: start,
      endDate: end,
      days: diffDays > 0 ? diffDays : 1
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.reason) {
      alert('Vui lòng nhập lý do xin nghỉ');
      return;
    }
    const newReq = {
      id: `LP0${requests.length + 33}`,
      empId: "EMP001",
      empName: "Nguyễn Văn A",
      type: formData.type,
      startDate: formData.startDate.split('-').reverse().join('/'),
      endDate: formData.endDate.split('-').reverse().join('/'),
      days: formData.days,
      reason: formData.reason,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      approver: "Ban Giám Đốc",
      status: "PENDING"
    };
    setRequests([newReq, ...requests]);
    setFormData({
      type: 'Nghỉ phép năm',
      startDate: '2025-04-25',
      endDate: '2025-04-27',
      days: 3,
      reason: ''
    });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleApprove = (id) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
  };

  const handleReject = (id) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
  };

  return (
    <div>
      <PageHeader
        title="Quản Lý Nghỉ Phép & Quỹ Phép"
        subtitle="Đăng ký nghỉ phép trực tuyến, theo dõi hạn mức phép và quy trình phê duyệt"
        breadcrumb="Nghỉ phép / Đăng ký & Phê duyệt"
      />

      {showSuccessToast && (
        <div className="toast-notice">
          <CheckCircle size={18} color="#4ade80" />
          <span>Đơn xin nghỉ phép đã được gửi thành công đến người phê duyệt!</span>
        </div>
      )}

      {/* Top 2 Columns: Application Form & Leave Balances */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '24px',
        marginBottom: '28px',
        alignItems: 'start'
      }}>
        {/* Form: Đăng ký nghỉ phép (Section 10) */}
        <div className="hrm-card">
          <div className="card-header">
            <span className="card-title">
              <CalendarDays size={18} color="#2563eb" />
              Tạo đơn đăng ký nghỉ phép
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>* Bắt buộc điền</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Loại nghỉ phép <span className="required">*</span></label>
              <select
                className="form-control"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Nghỉ phép năm">Nghỉ phép năm (Có hưởng lương)</option>
                <option value="Nghỉ ốm / bệnh">Nghỉ ốm / Chữa bệnh (Có giấy BHXH)</option>
                <option value="Nghỉ không lương">Nghỉ việc riêng không hưởng lương</option>
                <option value="Nghỉ thai sản / chế độ">Nghỉ chế độ / Thai sản</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Ngày bắt đầu <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.startDate}
                  onChange={e => handleDateChange(e.target.value, formData.endDate)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ngày kết thúc <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.endDate}
                  onChange={e => handleDateChange(formData.startDate, e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tổng số ngày đăng ký nghỉ</label>
              <input
                type="text"
                className="form-control"
                value={`${formData.days} ngày`}
                readOnly
                style={{ background: '#f8fafc', fontWeight: 600, color: '#2563eb' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lý do nghỉ phép <span className="required">*</span></label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="VD: Du lịch gia đình, có việc hiếu hỉ, khám định kỳ..."
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFormData({ type: 'Nghỉ phép năm', startDate: '2025-04-25', endDate: '2025-04-27', days: 3, reason: '' })}
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                Gửi yêu cầu nghỉ phép
              </button>
            </div>
          </form>
        </div>

        {/* Right: Số ngày nghỉ còn lại (Section 10) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="hrm-card">
            <div className="card-header">
              <span className="card-title">
                Số ngày nghỉ phép còn lại (Năm 2025)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {balances.map((b, idx) => (
                <div key={idx} style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: b.bg,
                  border: `1px solid ${b.color}30`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a' }}>{b.type}</span>
                    <span style={{ fontWeight: 700, fontSize: '18px', color: b.color }}>{b.remain} ngày</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Hạn mức: {b.total} ngày • Đã sử dụng: {b.used} ngày
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hrm-card" style={{ background: '#f8fafc' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
              📌 Quy định nghỉ phép công ty
            </div>
            <ul style={{ fontSize: '12.5px', color: '#64748b', paddingLeft: '18px', lineHeight: 1.6 }}>
              <li>Nghỉ từ 3 ngày trở lên cần báo trước tối thiểu 3 ngày làm việc.</li>
              <li>Nghỉ ốm cần nộp giấy khám bệnh/giấy ra viện trong vòng 48h.</li>
              <li>Phép năm còn dư được cộng dồn tối đa đến 31/03 năm kế tiếp.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lịch sử yêu cầu nghỉ phép */}
      <div className="hrm-card">
        <div className="card-header">
          <span className="card-title">
            Danh sách đơn yêu cầu nghỉ phép
          </span>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            {requests.length} đơn yêu cầu
          </span>
        </div>

        <div className="hrm-table-container">
          <table className="hrm-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Nhân viên</th>
                <th>Mã NV</th>
                <th>Loại nghỉ</th>
                <th>Khoảng thời gian</th>
                <th>Số ngày</th>
                <th>Lý do</th>
                <th>Ngày gửi</th>
                <th>Người duyệt</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Phê duyệt</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{r.id}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{r.empName}</td>
                  <td><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{r.empId}</span></td>
                  <td>{r.type}</td>
                  <td>{r.startDate} - {r.endDate}</td>
                  <td style={{ fontWeight: 600 }}>{r.days} ngày</td>
                  <td>{r.reason}</td>
                  <td>{r.createdAt}</td>
                  <td>{r.approver}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    {r.status === 'PENDING' ? (
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-sm btn-success"
                          title="Duyệt đơn"
                          onClick={() => handleApprove(r.id)}
                        >
                          <Check size={14} /> Duyệt
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          title="Từ chối đơn"
                          onClick={() => handleReject(r.id)}
                        >
                          <XCircle size={14} /> Từ chối
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Đã xử lý</span>
                    )}
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
