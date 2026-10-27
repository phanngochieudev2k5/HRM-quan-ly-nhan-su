import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import ConfirmModal from '../../../components/common/ConfirmModal';
import EmptyState from '../../../components/common/EmptyState';
import { leaveRequestsData } from '../../../data/mockData';
import '../../../styles/roles/manager/TeamLeaveApprovals.css';

export default function TeamLeaveApprovals() {
  const [requests, setRequests] = useState(leaveRequestsData || []);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReq, setSelectedReq] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (id) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
  };

  const openRejectModal = (req) => {
    setSelectedReq(req);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedReq) return;
    setRequests(requests.map(r => r.id === selectedReq.id ? { ...r, status: 'REJECTED', rejectReason } : r));
    setRejectModalOpen(false);
  };

  const filteredRequests = requests.filter(r => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="team-leave-container">
      <PageHeader
        breadcrumb="Quản lý Nhóm / Phê duyệt"
        title="Phê duyệt Đơn Nghỉ phép của Nhóm"
        subtitle="Xét duyệt hoặc từ chối kế hoạch nghỉ việc riêng, nghỉ ốm, nghỉ phép năm của các thành viên trực thuộc"
      />

      <div className="card" style={{ padding: '12px 16px' }}>
        <div className="team-leave-filters">
          <button
            className={`btn sm ${statusFilter === 'ALL' ? 'pri' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            Tất cả ({requests.length})
          </button>
          <button
            className={`btn sm ${statusFilter === 'PENDING' ? 'pri' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            Chờ duyệt ({requests.filter(r => r.status === 'PENDING').length})
          </button>
          <button
            className={`btn sm ${statusFilter === 'APPROVED' ? 'pri' : ''}`}
            onClick={() => setStatusFilter('APPROVED')}
          >
            Đã duyệt ({requests.filter(r => r.status === 'APPROVED').length})
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Nhân viên</th>
                <th>Loại nghỉ</th>
                <th>Thời gian nghỉ</th>
                <th>Số ngày</th>
                <th>Lý do xin nghỉ</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={8}
                  title="Chưa có đơn nghỉ phép cần duyệt"
                  description="Các yêu cầu xin nghỉ phép của thành viên trong nhóm sẽ hiển thị tại đây."
                />
              ) : (
                filteredRequests.map(req => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 700, color: 'var(--muted)', fontFamily: 'monospace' }}>{req.id}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{req.empName}</div>
                    <div className="muted small">{req.empId}</div>
                  </td>
                  <td>
                    <span className="badge b-p">{req.type}</span>
                  </td>
                  <td style={{ fontSize: '12.5px' }}>
                    {req.startDate} {req.startDate !== req.endDate ? `đến ${req.endDate}` : ''}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--p)' }}>{req.days} ngày</span>
                  </td>
                  <td>
                    <div className="team-leave-reason">{req.reason}</div>
                  </td>
                  <td>
                    <StatusBadge status={req.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {req.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn pri sm"
                          onClick={() => handleApprove(req.id)}
                        >
                          <CheckCircle2 size={13} />
                          <span>Duyệt</span>
                        </button>
                        <button
                          className="btn sm"
                          style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() => openRejectModal(req)}
                        >
                          <XCircle size={13} />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    ) : (
                      <span className="muted small">Đã hoàn tất</span>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Từ chối đơn xin nghỉ phép"
      >
        <div className="team-reject-box">
          <p className="team-reject-desc">
            Bạn đang từ chối đơn nghỉ của <strong>{selectedReq?.empName}</strong> ({selectedReq?.days} ngày).
          </p>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Lý do từ chối *</label>
          <textarea
            className="inp"
            rows="3"
            placeholder="Nhập lý do từ chối để nhân sự nắm bắt..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          ></textarea>
          <div className="team-reject-actions">
            <button className="btn" onClick={() => setRejectModalOpen(false)}>Hủy</button>
            <button className="btn" style={{ background: '#ef4444', color: '#ffffff', borderColor: '#ef4444' }} onClick={handleConfirmReject}>
              Xác nhận từ chối
            </button>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}
