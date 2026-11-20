import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays, CheckCircle2, XCircle, Search, Filter, RefreshCw,
  FileText, Users, Clock, Eye, Check, X, Building2, AlertCircle, Info, Calendar
} from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import StatCard from '../../../components/common/StatCard';
import ConfirmModal from '../../../components/common/ConfirmModal';
import EmptyState from '../../../components/common/EmptyState';
import LeaveService from '../../../services/LeaveService';
import HrService from '../../../services/HrService';
import AuthService from '../../../services/AuthService';
import '../../../styles/roles/hr/HrLeaveView.css';

const FALLBACK_LEAVE_TYPES = [
  { LeaveTypeId: 1, TypeCode: 'ANNUAL', TypeName: 'Nghỉ phép năm', IsPaid: true },
  { LeaveTypeId: 2, TypeCode: 'SICK', TypeName: 'Nghỉ ốm đau', IsPaid: false },
  { LeaveTypeId: 3, TypeCode: 'MATERNITY', TypeName: 'Nghỉ chế độ thai sản', IsPaid: false },
  { LeaveTypeId: 4, TypeCode: 'UNPAID', TypeName: 'Nghỉ việc riêng không hưởng lương', IsPaid: false }
];

export default function HrLeaveView() {
  const currentUser = useMemo(() => {
    return AuthService.getCurrentUser() || {};
  }, []);
  const hrEmployeeId = currentUser.employeeId || currentUser.EmployeeId || currentUser.id;

  const [requests, setRequests] = useState([]);
  const [statistics, setStatistics] = useState({
    totalRequests: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    cancelledCount: 0,
    totalDaysApproved: 0
  });

  const [leaveTypes, setLeaveTypes] = useState(FALLBACK_LEAVE_TYPES);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bộ lọc
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Xem chi tiết
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailReq, setSelectedDetailReq] = useState(null);

  // Modal Phê duyệt trực tiếp
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedApproveReq, setSelectedApproveReq] = useState(null);
  const [approveNote, setApproveNote] = useState('');
  const [approving, setApproving] = useState(false);

  // Modal Từ chối trực tiếp
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectReq, setSelectedRejectReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Tải danh mục phòng ban và loại phép
  const loadMetadata = async () => {
    try {
      const [deptRes, typeRes] = await Promise.all([
        HrService.getDepartments().catch(() => []),
        LeaveService.getLeaveTypes().catch(() => ({ data: FALLBACK_LEAVE_TYPES }))
      ]);
      if (Array.isArray(deptRes)) setDepartments(deptRes);
      if (typeRes?.data && Array.isArray(typeRes.data) && typeRes.data.length > 0) {
        setLeaveTypes(typeRes.data);
      } else {
        setLeaveTypes(FALLBACK_LEAVE_TYPES);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu danh mục:', err);
    }
  };

  // Tải toàn bộ danh sách đơn nghỉ phép công ty
  const loadAllRequests = async () => {
    try {
      setLoading(true);
      const res = await LeaveService.getAllRequests({
        departmentId: departmentFilter,
        leaveTypeId: typeFilter,
        status: statusFilter,
        search: searchTerm
      });

      if (res?.data) {
        setRequests(res.data.requests || []);
        if (res.data.statistics) {
          setStatistics(res.data.statistics);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách nghỉ phép toàn công ty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadAllRequests();
  }, [departmentFilter, typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadAllRequests();
  };

  // Mở modal chi tiết
  const handleOpenDetailModal = (req) => {
    setSelectedDetailReq(req);
    setDetailModalOpen(true);
  };

  // Mở modal duyệt
  const handleOpenApproveModal = (req) => {
    setSelectedApproveReq(req);
    setApproveNote('');
    setDetailModalOpen(false);
    setApproveModalOpen(true);
  };

  // Xác nhận phê duyệt
  const handleConfirmApprove = async () => {
    if (!selectedApproveReq) return;
    try {
      setApproving(true);
      await LeaveService.approveRequest(
        selectedApproveReq.LeaveRequestId,
        hrEmployeeId,
        approveNote.trim()
      );
      setApproveModalOpen(false);
      setSelectedApproveReq(null);
      setApproveNote('');
      loadAllRequests();
    } catch (err) {
      alert(err.message || 'Lỗi khi phê duyệt đơn nghỉ phép!');
    } finally {
      setApproving(false);
    }
  };

  // Duyệt trực tiếp ngay từ Modal Chi tiết
  const handleDirectApproveFromDetail = async () => {
    if (!selectedDetailReq) return;
    try {
      setApproving(true);
      await LeaveService.approveRequest(
        selectedDetailReq.LeaveRequestId,
        hrEmployeeId,
        approveNote.trim()
      );
      setDetailModalOpen(false);
      setSelectedDetailReq(null);
      setApproveNote('');
      loadAllRequests();
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
    setDetailModalOpen(false);
    setRejectModalOpen(true);
  };

  // Xác nhận từ chối
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
        hrEmployeeId,
        rejectReason.trim()
      );
      setRejectModalOpen(false);
      setSelectedRejectReq(null);
      if (detailModalOpen) setDetailModalOpen(false);
      loadAllRequests();
    } catch (err) {
      setRejectError(err.message || 'Lỗi khi từ chối đơn nghỉ phép!');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="hr-leave-container" style={{ padding: '20px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={24} style={{ color: '#0f766e' }} />
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Quản lý đơn nghỉ phép toàn công ty
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13.5px' }}>
            Theo dõi, phê duyệt và tự động đồng bộ dữ liệu nghỉ phép trên toàn hệ thống vào Bảng chấm công
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={loadAllRequests}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Tải lại dữ liệu"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* KPI Cards: Thống kê tổng quan */}
      <div className="grid c5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <StatCard
          title="TỔNG ĐƠN TOÀN CÔNG TY"
          value={String(statistics.totalRequests || 0)}
          unit="đơn"
          subtext="Toàn bộ lịch sử"
          icon={FileText}
          color="#0f766e"
          bg="#ccfbf1"
        />

        <StatCard
          title="ĐƠN ĐANG CHỜ DUYỆT"
          value={String(statistics.pendingCount || 0)}
          unit="đơn"
          subtext="Cần xét duyệt"
          icon={Clock}
          color="#d97706"
          bg="#fef3c7"
        />

        <StatCard
          title="ĐƠN ĐÃ PHÊ DUYỆT"
          value={String(statistics.approvedCount || 0)}
          unit="đơn"
          subtext="Đã đồng bộ chấm công"
          icon={CheckCircle2}
          color="#16a34a"
          bg="#dcfce7"
        />

        <StatCard
          title="ĐƠN BỊ TỪ CHỐI"
          value={String(statistics.rejectedCount || 0)}
          unit="đơn"
          subtext="Không chấp thuận"
          icon={XCircle}
          color="#dc2626"
          bg="#fee2e2"
        />

        <StatCard
          title="TỔNG NGÀY NGHỈ ĐÃ DUYỆT"
          value={Number(statistics.totalDaysApproved || 0).toFixed(1)}
          unit="ngày"
          subtext="Nghỉ thực tế tích lũy"
          icon={Calendar}
          color="#4338ca"
          bg="#e0e7ff"
        />
      </div>

      {/* Bộ lọc nâng cao */}
      <div
        className="card"
        style={{
          background: '#fff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            <Filter size={16} style={{ color: '#0f766e' }} />
            <span>Bộ lọc nâng cao:</span>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                className="inp"
                placeholder="Tìm mã đơn, tên NV, mã NV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '32px', width: '280px', fontSize: '13px' }}
              />
            </div>
            <button type="submit" className="btn sm">
              Tìm kiếm
            </button>
          </form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {/* Lọc theo Phòng ban */}
          <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Phòng ban</span>
            <select
              className="inp"
              style={{ fontSize: '12.5px' }}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="ALL">-- Tất cả phòng ban --</option>
              {departments.map((d) => (
                <option key={d.DepartmentId} value={d.DepartmentId}>
                  {d.DepartmentName}
                </option>
              ))}
            </select>
          </label>

          {/* Lọc theo Loại nghỉ phép */}
          <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Loại nghỉ phép</span>
            <select
              className="inp"
              style={{ fontSize: '12.5px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">-- Tất cả loại nghỉ --</option>
              {(leaveTypes && leaveTypes.length > 0 ? leaveTypes : FALLBACK_LEAVE_TYPES).map((t) => (
                <option key={t.LeaveTypeId} value={t.LeaveTypeId}>
                  {t.TypeName} ({t.IsPaid ? 'Hưởng lương' : 'Không lương'})
                </option>
              ))}
            </select>
          </label>

          {/* Lọc theo Trạng thái */}
          <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Trạng thái</span>
            <select
              className="inp"
              style={{ fontSize: '12.5px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">-- Tất cả trạng thái --</option>
              <option value="Pending">Chờ duyệt</option>
              <option value="Approved">Đã duyệt</option>
              <option value="Rejected">Đã từ chối</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </label>
        </div>
      </div>

      {/* Bảng danh sách toàn bộ đơn nghỉ */}
      <div className="card" style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
            Danh sách đơn nghỉ phép ({requests.length})
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Hiển thị tối đa các đơn phù hợp với bộ lọc
          </span>
        </div>

        <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
          <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>MÃ ĐƠN</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>NHÂN VIÊN</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>PHÒNG BAN</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>LOẠI NGHỈ</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>THỜI GIAN</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>SỐ NGÀY</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>NGƯỜI DUYỆT</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>TRẠNG THÁI</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center' }}>
                    <EmptyState
                      title="Không tìm thấy đơn xin nghỉ phép nào"
                      description="Hãy thử thay đổi điều kiện tìm kiếm hoặc bộ lọc phía trên."
                    />
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const isPending = req.Status === 'Pending';
                  const isApproved = req.Status === 'Approved';
                  const isRejected = req.Status === 'Rejected';
                  const isCancelled = req.Status === 'Cancelled';

                  return (
                    <tr key={req.LeaveRequestId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f766e', whiteSpace: 'nowrap' }}>
                        {req.RequestCode}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              background: '#0f766e',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '11.5px'
                            }}
                          >
                            {(req.EmployeeName || 'NV').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{req.EmployeeName}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{req.EmployeeCode}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', color: '#475569' }}>
                        {req.DepartmentName || 'Chung'}
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
                        {req.ApproverEmployeeName ? (
                          <span style={{ fontWeight: 500, color: '#0f172a' }}>{req.ApproverEmployeeName}</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa duyệt</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        {isPending && <StatusBadge status="PENDING" text="Chờ duyệt" />}
                        {isApproved && <StatusBadge status="APPROVED" text="Đã duyệt" />}
                        {isRejected && <StatusBadge status="REJECTED" text="Đã từ chối" />}
                        {isCancelled && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11.5px', background: '#f1f5f9', color: '#64748b' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }}></span>
                            Đã hủy
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn sm"
                            onClick={() => handleOpenDetailModal(req)}
                            title="Xem chi tiết đơn"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            <Eye size={13} />
                            <span>Chi tiết</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                className="btn sm"
                                style={{
                                  background: '#16a34a',
                                  color: '#fff',
                                  borderColor: '#16a34a',
                                  padding: '4px 8px',
                                  fontSize: '12px'
                                }}
                                onClick={() => handleOpenApproveModal(req)}
                                title="HR duyệt trực tiếp"
                              >
                                <Check size={13} />
                              </button>

                              <button
                                type="button"
                                className="btn sm"
                                style={{
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  borderColor: '#fca5a5',
                                  padding: '4px 8px',
                                  fontSize: '12px'
                                }}
                                onClick={() => handleOpenRejectModal(req)}
                                title="HR từ chối trực tiếp"
                              >
                                <X size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chi tiết đơn nghỉ phép */}
      {detailModalOpen && selectedDetailReq && (
        <div className="modal-wrap" onClick={() => setDetailModalOpen(false)} style={{ zIndex: 1100 }}>
          <div className="modal" style={{ maxWidth: '600px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: '#0f766e' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Chi tiết đơn xin nghỉ phép [{selectedDetailReq.RequestCode}]
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-b" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Nhân viên nộp đơn</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDetailReq.EmployeeName}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>Mã NV: {selectedDetailReq.EmployeeCode}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Phòng ban &amp; Chức vụ</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedDetailReq.DepartmentName || 'Chưa phân phòng'}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{selectedDetailReq.PositionName || 'Nhân viên'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Loại nghỉ phép</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedDetailReq.LeaveTypeName}</div>
                  <div style={{ fontSize: '12px', color: selectedDetailReq.IsPaid ? '#0f766e' : '#64748b' }}>
                    {selectedDetailReq.IsPaid ? 'Có hưởng lương' : 'Không hưởng lương'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Thời gian nghỉ &amp; Số ngày</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {selectedDetailReq.StartDate} → {selectedDetailReq.EndDate}
                  </div>
                  <div style={{ fontSize: '12px', color: '#0f766e', fontWeight: 700 }}>
                    Tổng cộng: {selectedDetailReq.TotalDays} ngày
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>Người nhận bàn giao công việc</div>
                <div style={{ fontWeight: 500, color: '#0f172a' }}>
                  {selectedDetailReq.HandoverToEmployeeName ? (
                    `${selectedDetailReq.HandoverToEmployeeName} (${selectedDetailReq.HandoverToEmployeeCode})`
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không có người nhận bàn giao</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>Lý do xin nghỉ</div>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', fontSize: '13px', lineHeight: 1.5 }}>
                  {selectedDetailReq.Reason}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Trạng thái hiện tại</div>
                  <div style={{ marginTop: '4px' }}>
                    {selectedDetailReq.Status === 'Pending' && <StatusBadge status="PENDING" text="Chờ duyệt" />}
                    {selectedDetailReq.Status === 'Approved' && <StatusBadge status="APPROVED" text="Đã duyệt" />}
                    {selectedDetailReq.Status === 'Rejected' && <StatusBadge status="REJECTED" text="Đã từ chối" />}
                    {selectedDetailReq.Status === 'Cancelled' && <span style={{ color: '#94a3b8' }}>Đã hủy</span>}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Người phê duyệt</div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                    {selectedDetailReq.ApproverEmployeeName || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa duyệt</span>}
                  </div>
                </div>
              </div>

              {selectedDetailReq.ResponseNote && (
                <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12.5px', color: '#991b1b' }}>
                  <b>Phản hồi của người duyệt:</b> {selectedDetailReq.ResponseNote}
                </div>
              )}

              {/* Thao tác duyệt trực tiếp cho HR khi đơn đang Pending */}
              {selectedDetailReq.Status === 'Pending' && (
                <div style={{ marginTop: '8px', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                    Ghi chú phản hồi của HR (Tùy chọn):
                  </label>
                  <input
                    className="inp"
                    placeholder="VD: Phòng Nhân sự phê duyệt đơn nghỉ phép..."
                    value={approveNote}
                    onChange={(e) => setApproveNote(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                </div>
              )}
            </div>

            <div className="modal-f" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button type="button" className="btn" onClick={() => setDetailModalOpen(false)} disabled={approving}>
                Đóng
              </button>

              {selectedDetailReq.Status === 'Pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }}
                    onClick={() => handleOpenRejectModal(selectedDetailReq)}
                    disabled={approving}
                  >
                    Từ chối
                  </button>
                  <button
                    type="button"
                    className="btn pri"
                    style={{ background: '#16a34a', borderColor: '#16a34a' }}
                    onClick={handleDirectApproveFromDetail}
                    disabled={approving}
                  >
                    {approving ? 'Đang duyệt...' : 'Phê duyệt ngay'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Phê duyệt */}
      <ConfirmModal
        isOpen={approveModalOpen}
        onClose={() => !approving && setApproveModalOpen(false)}
        title="Xác nhận phê duyệt đơn nghỉ phép"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn" onClick={() => setApproveModalOpen(false)} disabled={approving}>
              Hủy bỏ
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: '#16a34a', color: '#fff', borderColor: '#16a34a' }}
              onClick={handleConfirmApprove}
              disabled={approving}
            >
              {approving ? 'Đang duyệt...' : 'Xác nhận Phê duyệt'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#334155' }}>
          <div>
            Phê duyệt đơn xin nghỉ phép của nhân viên <b>{selectedApproveReq?.EmployeeName}</b> (Mã đơn:{' '}
            <b>{selectedApproveReq?.RequestCode}</b>).
          </div>

          <div style={{ padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>
              Hệ thống sẽ <b>tự động đồng bộ bản ghi nghỉ phép vào bảng chấm công</b> cho từng ngày làm việc từ{' '}
              {selectedApproveReq?.StartDate} đến {selectedApproveReq?.EndDate}.
            </span>
          </div>

          <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>
              Ghi chú phản hồi (Tùy chọn):
            </span>
            <input
              className="inp"
              placeholder="VD: Phòng Nhân sự đã duyệt đơn nghỉ phép..."
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
            />
          </label>
        </div>
      </ConfirmModal>

      {/* Modal Từ chối */}
      <ConfirmModal
        isOpen={rejectModalOpen}
        onClose={() => !rejecting && setRejectModalOpen(false)}
        title="Từ chối đơn xin nghỉ phép"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn" onClick={() => setRejectModalOpen(false)} disabled={rejecting}>
              Hủy bỏ
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}
              onClick={handleConfirmReject}
              disabled={rejecting}
            >
              {rejecting ? 'Đang từ chối...' : 'Xác nhận Từ chối'}
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
              placeholder="Vui lòng nêu rõ lý do từ chối đơn nghỉ phép..."
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
