import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2, XCircle, Search, RefreshCw, Users, Calendar,
  Clock, AlertCircle, FileText, Check, X, MessageSquare, AlertTriangle
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import StatCard from '../../../components/common/StatCard';
import ConfirmModal from '../../../components/common/ConfirmModal';
import EmptyState from '../../../components/common/EmptyState';
import LeaveService from '../../../services/LeaveService';
import AuthService from '../../../services/AuthService';
import '../../../styles/roles/manager/TeamLeaveApprovals.css';

export default function TeamLeaveApprovals() {
  const currentUser = useMemo(() => {
    return AuthService.getCurrentUser() || {};
  }, []);
  const managerId = currentUser.employeeId || currentUser.EmployeeId || currentUser.id;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Phê duyệt
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedApproveReq, setSelectedApproveReq] = useState(null);
  const [approveNote, setApproveNote] = useState('');
  const [approving, setApproving] = useState(false);

  // Modal Từ chối
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectReq, setSelectedRejectReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Tải danh sách đơn nghỉ của nhóm
  const loadTeamRequests = async () => {
    if (!managerId) return;
    try {
      setLoading(true);
      const res = await LeaveService.getTeamRequests(managerId, statusFilter, searchTerm);
      if (res?.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách đơn nhóm:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamRequests();
  }, [managerId, statusFilter]);

  // Tìm kiếm debounce hoặc khi submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTeamRequests();
  };

  // Thống kê nhanh theo các trạng thái
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.Status === 'Pending').length;
    const approved = requests.filter((r) => r.Status === 'Approved').length;
    const rejected = requests.filter((r) => r.Status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // Mở modal phê duyệt
  const handleOpenApproveModal = (req) => {
    setSelectedApproveReq(req);
    setApproveNote('');
    setApproveModalOpen(true);
  };

  // Xác nhận phê duyệt đơn
  const handleConfirmApprove = async () => {
    if (!selectedApproveReq) return;
    try {
      setApproving(true);
      await LeaveService.approveRequest(
        selectedApproveReq.LeaveRequestId,
        managerId,
        approveNote.trim()
      );
      setApproveModalOpen(false);
      setSelectedApproveReq(null);
      loadTeamRequests();
    } catch (err) {
      alert(err.message || 'Lỗi khi phê duyệt đơn nghỉ phép!');
    } finally {
      setApproving(false);
    }
  };

  // Mở modal từ chối
  const handleOpenRejectModal = (req) => {
    setSelectedRejectReq(req);
    setRejectReason('');
    setRejectError('');
    setRejectModalOpen(true);
  };

  // Xác nhận từ chối đơn
  const handleConfirmReject = async () => {
    if (!selectedRejectReq) return;
    if (!rejectReason.trim()) {
      setRejectError('Vui lòng nhập lý do từ chối đơn nghỉ phép!');
      return;
    }

    try {
      setRejecting(true);
      await LeaveService.rejectRequest(
        selectedRejectReq.LeaveRequestId,
        managerId,
        rejectReason.trim()
      );
      setRejectModalOpen(false);
      setSelectedRejectReq(null);
      loadTeamRequests();
    } catch (err) {
      setRejectError(err.message || 'Lỗi khi từ chối đơn nghỉ phép!');
    } finally {
      setRejecting(false);
    }
  };

  // Lọc tìm kiếm client-side nếu search được gõ
  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) return requests;
    const q = searchTerm.toLowerCase();
    return requests.filter((r) => {
      return (
        (r.EmployeeName || '').toLowerCase().includes(q) ||
        (r.EmployeeCode || '').toLowerCase().includes(q) ||
        (r.RequestCode || '').toLowerCase().includes(q) ||
        (r.LeaveTypeName || '').toLowerCase().includes(q)
      );
    });
  }, [requests, searchTerm]);

  return (
    <div className="team-leave-container" style={{ padding: '20px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page Header */}
      <PageHeader
        breadcrumb="Quản lý Nhóm / Phê duyệt Nghỉ phép"
        title="Phê duyệt Đơn Nghỉ phép của Nhóm"
        subtitle="Xét duyệt hoặc từ chối kế hoạch nghỉ việc riêng, nghỉ ốm, nghỉ phép năm của các thành viên trực thuộc"
      />

      {/* KPI Stat Cards */}
      <div className="grid c4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', margin: '20px 0' }}>
        <StatCard
          title="TỔNG SỐ ĐƠN CỦA NHÓM"
          value={String(stats.total)}
          unit="đơn"
          subtext="Tất cả các đơn đã nộp"
          icon={FileText}
          color="#0f766e"
          bg="#ccfbf1"
        />

        <StatCard
          title="ĐƠN ĐANG CHỜ DUYỆT"
          value={String(stats.pending)}
          unit="đơn"
          subtext="Cần xử lý ngay"
          icon={Clock}
          color="#d97706"
          bg="#fef3c7"
        />

        <StatCard
          title="ĐƠN ĐÃ PHÊ DUYỆT"
          value={String(stats.approved)}
          unit="đơn"
          subtext="Đã đồng bộ sang chấm công"
          icon={CheckCircle2}
          color="#16a34a"
          bg="#dcfce7"
        />

        <StatCard
          title="ĐƠN ĐÃ TỪ CHỐI"
          value={String(stats.rejected)}
          unit="đơn"
          subtext="Không chấp thuận"
          icon={XCircle}
          color="#dc2626"
          bg="#fee2e2"
        />
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div
        className="card"
        style={{
          background: '#fff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'Pending', label: 'Chờ duyệt' },
            { key: 'Approved', label: 'Đã duyệt' },
            { key: 'Rejected', label: 'Đã từ chối' }
          ].map((tab) => {
            const count =
              tab.key === 'ALL'
                ? requests.length
                : requests.filter((r) => r.Status === tab.key).length;
            return (
              <button
                key={tab.key}
                type="button"
                className={`btn sm ${statusFilter === tab.key ? 'pri' : ''}`}
                onClick={() => setStatusFilter(tab.key)}
                style={{ fontSize: '12.5px', padding: '5px 12px' }}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="inp"
              placeholder="Tìm theo tên NV, mã NV, mã đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', width: '260px', fontSize: '13px' }}
            />
          </div>

          <button type="submit" className="btn sm">
            Tìm
          </button>

          <button
            type="button"
            className="btn sm"
            onClick={loadTeamRequests}
            title="Tải lại danh sách"
            style={{ padding: '6px 10px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </form>
      </div>

      {/* Bảng danh sách đơn phê duyệt */}
      <div className="card" style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
          <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>MÃ ĐƠN</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>THÀNH VIÊN</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>LOẠI NGHỈ</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>THỜI GIAN NGHỈ</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>SỐ NGÀY</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>BÀN GIAO CHO</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>LÝ DO XIN NGHỈ</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>TRẠNG THÁI</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center' }}>
                    <EmptyState
                      title="Không có đơn xin nghỉ phép nào"
                      description={
                        statusFilter === 'ALL'
                          ? 'Hiện tại không có thành viên nào trong nhóm nộp đơn nghỉ phép.'
                          : `Không có đơn nghỉ phép ở trạng thái "${statusFilter}".`
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = req.Status === 'Pending';
                  const isApproved = req.Status === 'Approved';
                  const isRejected = req.Status === 'Rejected';

                  return (
                    <tr key={req.LeaveRequestId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f766e', whiteSpace: 'nowrap' }}>
                        {req.RequestCode}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#0f766e',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px'
                            }}
                          >
                            {(req.EmployeeName || 'NV').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{req.EmployeeName}</div>
                            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                              {req.EmployeeCode} • {req.PositionName || req.DepartmentName || 'Nhân viên'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{req.LeaveTypeName}</div>
                        <span
                          style={{
                            fontSize: '11px',
                            color: req.IsPaid ? '#0f766e' : '#64748b',
                            background: req.IsPaid ? '#ccfbf1' : '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginTop: '2px'
                          }}
                        >
                          {req.IsPaid ? 'Hưởng lương' : 'Không lương'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 500, color: '#0f172a' }}>
                          {req.StartDate} <span style={{ color: '#94a3b8' }}>→</span> {req.EndDate}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#0f766e' }}>
                        {req.TotalDays} ngày
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        {req.HandoverToEmployeeName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={14} style={{ color: '#64748b' }} />
                            <span>{req.HandoverToEmployeeName}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không có</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', maxWidth: '240px' }}>
                        <div style={{ color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.Reason}>
                          {req.Reason}
                        </div>
                        {req.ResponseNote && (
                          <div style={{ fontSize: '11.5px', color: '#dc2626', marginTop: '2px', fontStyle: 'italic' }}>
                            Phản hồi: {req.ResponseNote}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        {isPending && <StatusBadge status="PENDING" text="Chờ duyệt" />}
                        {isApproved && <StatusBadge status="APPROVED" text="Đã duyệt" />}
                        {isRejected && <StatusBadge status="REJECTED" text="Đã từ chối" />}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {isPending ? (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn sm"
                              style={{
                                background: '#16a34a',
                                color: '#fff',
                                borderColor: '#16a34a',
                                padding: '4px 8px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onClick={() => handleOpenApproveModal(req)}
                              title="Phê duyệt đơn"
                            >
                              <Check size={13} />
                              <span>Duyệt</span>
                            </button>

                            <button
                              type="button"
                              className="btn sm"
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                borderColor: '#fca5a5',
                                padding: '4px 8px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onClick={() => handleOpenRejectModal(req)}
                              title="Từ chối đơn"
                            >
                              <X size={13} />
                              <span>Từ chối</span>
                            </button>
                          </div>
                        ) : (
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            {isApproved ? 'Đã phê duyệt' : 'Đã từ chối'}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Phê duyệt đơn */}
      <ConfirmModal
        isOpen={approveModalOpen}
        onClose={() => !approving && setApproveModalOpen(false)}
        title="Xác nhận phê duyệt đơn nghỉ phép"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setApproveModalOpen(false)}
              disabled={approving}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: '#16a34a', color: '#fff', borderColor: '#16a34a' }}
              onClick={handleConfirmApprove}
              disabled={approving}
            >
              {approving ? 'Đang xử lý...' : 'Xác nhận Phê duyệt'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#334155' }}>
          <div>
            Bạn có chắc chắn muốn phê duyệt đơn xin nghỉ phép của nhân viên{' '}
            <b>{selectedApproveReq?.EmployeeName}</b> (Mã NV: <b>{selectedApproveReq?.EmployeeCode}</b>) không?
          </div>

          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
            <div><b>Mã đơn:</b> {selectedApproveReq?.RequestCode}</div>
            <div><b>Loại nghỉ:</b> {selectedApproveReq?.LeaveTypeName}</div>
            <div><b>Thời gian nghỉ:</b> {selectedApproveReq?.StartDate} đến {selectedApproveReq?.EndDate} ({selectedApproveReq?.TotalDays} ngày)</div>
            <div><b>Lý do:</b> {selectedApproveReq?.Reason}</div>
          </div>

          <div style={{ padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>
              Sau khi duyệt, hệ thống sẽ <b>tự động đồng bộ bản ghi nghỉ phép vào bảng chấm công</b> cho từng ngày làm việc tương ứng.
            </span>
          </div>

          <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>
              Ghi chú phản hồi (Tùy chọn):
            </span>
            <input
              className="inp"
              placeholder="VD: Đồng ý duyệt, chúc bạn mau khỏe / hoàn thành việc tốt..."
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
            />
          </label>
        </div>
      </ConfirmModal>

      {/* Modal Từ chối đơn */}
      <ConfirmModal
        isOpen={rejectModalOpen}
        onClose={() => !rejecting && setRejectModalOpen(false)}
        title="Từ chối đơn xin nghỉ phép"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setRejectModalOpen(false)}
              disabled={rejecting}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}
              onClick={handleConfirmReject}
              disabled={rejecting}
            >
              {rejecting ? 'Đang xử lý...' : 'Xác nhận Từ chối'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#334155' }}>
          <div>
            Từ chối đơn xin nghỉ phép của nhân viên <b>{selectedRejectReq?.EmployeeName}</b> (Mã đơn:{' '}
            <b>{selectedRejectReq?.RequestCode}</b>).
          </div>

          {rejectError && (
            <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={15} />
              <span>{rejectError}</span>
            </div>
          )}

          <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>
              Lý do từ chối <span style={{ color: '#dc2626' }}>*</span>:
            </span>
            <textarea
              className="inp"
              rows="3"
              placeholder="Vui lòng nêu rõ lý do từ chối (VD: Trùng lịch dự án gấp, thiếu người trực thay thế...)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            ></textarea>
          </label>
        </div>
      </ConfirmModal>
    </div>
  );
}
