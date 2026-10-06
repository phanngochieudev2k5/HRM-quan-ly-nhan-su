import React, { useState } from 'react';
import { Timer, Plus, Check, XCircle, Clock, Calendar } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import StatusBadge from '../common/StatusBadge';
import ConfirmModal from '../common/ConfirmModal';
import { overtimeRequestsData } from '../../data/mockData';

export default function OvertimeView() {
  const [otList, setOtList] = useState(overtimeRequestsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOt, setNewOt] = useState({
    empName: 'Nguyễn Văn A',
    empId: 'EMP001',
    date: '2025-04-22',
    timeRange: '18:00 - 21:00',
    hours: 3,
    multiplier: '1.5x',
    project: ''
  });

  const handleApprove = (id) => {
    setOtList(otList.map(o => o.id === id ? { ...o, status: 'APPROVED' } : o));
  };

  const handleReject = (id) => {
    setOtList(otList.map(o => o.id === id ? { ...o, status: 'REJECTED' } : o));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newOt.project) return;
    const item = {
      ...newOt,
      id: `OT0${otList.length + 16}`,
      date: newOt.date.split('-').reverse().join('/'),
      status: 'PENDING'
    };
    setOtList([item, ...otList]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Quản Lý Đăng Ký Tăng Ca (Overtime - OT)"
        subtitle="Đăng ký giờ làm thêm, tính hệ số lương OT và xét duyệt cấp quản lý"
        breadcrumb="Tăng ca / Danh sách yêu cầu"
        actions={
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Đăng ký tăng ca mới
          </button>
        }
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div className="hrm-card">
          <div style={{ fontSize: '13px', color: '#64748b' }}>Tổng giờ OT tháng 04</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>124 giờ</div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>Trong giới hạn quy định pháp luật</div>
        </div>
        <div className="hrm-card">
          <div style={{ fontSize: '13px', color: '#64748b' }}>Chờ phê duyệt</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ea580c' }}>
            {otList.filter(x => x.status === 'PENDING').length} yêu cầu
          </div>
        </div>
        <div className="hrm-card">
          <div style={{ fontSize: '13px', color: '#64748b' }}>Đã phê duyệt</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
            {otList.filter(x => x.status === 'APPROVED').length} yêu cầu
          </div>
        </div>
      </div>

      <div className="hrm-table-container">
        <table className="hrm-table">
          <thead>
            <tr>
              <th>Mã OT</th>
              <th>Nhân viên</th>
              <th>Mã NV</th>
              <th>Ngày tăng ca</th>
              <th>Khung giờ OT</th>
              <th>Số giờ</th>
              <th>Hệ số lương</th>
              <th>Dự án / Lý do tăng ca</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Phê duyệt</th>
            </tr>
          </thead>
          <tbody>
            {otList.map(ot => (
              <tr key={ot.id}>
                <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{ot.id}</td>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{ot.empName}</td>
                <td><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{ot.empId}</span></td>
                <td>{ot.date}</td>
                <td>{ot.timeRange}</td>
                <td style={{ fontWeight: 600 }}>{ot.hours}h</td>
                <td>
                  <span style={{ fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                    {ot.multiplier}
                  </span>
                </td>
                <td>{ot.project}</td>
                <td><StatusBadge status={ot.status} /></td>
                <td style={{ textAlign: 'right' }}>
                  {ot.status === 'PENDING' ? (
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button className="btn btn-sm btn-success" onClick={() => handleApprove(ot.id)}>
                        <Check size={14} /> Duyệt
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleReject(ot.id)}>
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

      {/* Modal create OT */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Đăng ký làm thêm giờ (Overtime)"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleCreate}>Gửi đơn OT</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Ngày tăng ca <span className="required">*</span></label>
          <input
            type="date"
            className="form-control"
            value={newOt.date}
            onChange={e => setNewOt({ ...newOt, date: e.target.value })}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Khung giờ</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: 18:00 - 21:00"
              value={newOt.timeRange}
              onChange={e => setNewOt({ ...newOt, timeRange: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Số giờ (giờ)</label>
            <input
              type="number"
              className="form-control"
              value={newOt.hours}
              onChange={e => setNewOt({ ...newOt, hours: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Hệ số tính lương</label>
          <select
            className="form-control"
            value={newOt.multiplier}
            onChange={e => setNewOt({ ...newOt, multiplier: e.target.value })}
          >
            <option value="1.5x">1.5x (Ngày thường sau 18h)</option>
            <option value="2.0x">2.0x (Ngày nghỉ Thứ 7 / Chủ nhật)</option>
            <option value="3.0x">3.0x (Ngày Lễ, Tết)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Dự án & Lý do tăng ca <span className="required">*</span></label>
          <textarea
            className="form-control"
            rows="2"
            placeholder="VD: Triển khai server sprint 4, sửa lỗi gấp..."
            value={newOt.project}
            onChange={e => setNewOt({ ...newOt, project: e.target.value })}
          />
        </div>
      </ConfirmModal>
    </div>
  );
}
