import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays, Plus, CheckCircle2, Clock, AlertCircle, XCircle,
  FileText, Users, ArrowRight, RefreshCw, Calendar, Info, X, ShieldAlert
} from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import StatCard from '../../../components/common/StatCard';
import EmptyState from '../../../components/common/EmptyState';
import ConfirmModal from '../../../components/common/ConfirmModal';
import LeaveService from '../../../services/LeaveService';
import AuthService from '../../../services/AuthService';
import '../../../styles/roles/employee/MyLeaveView.css';

// Danh mục loại nghỉ phép chuẩn khớp chính xác với bảng tblLeaveType trong SQL Server
export const FALLBACK_LEAVE_TYPES = [
  { LeaveTypeId: 1, TypeCode: 'ANNUAL', TypeName: 'Nghỉ phép năm', IsPaid: true },
  { LeaveTypeId: 2, TypeCode: 'SICK', TypeName: 'Nghỉ ốm đau', IsPaid: false },
  { LeaveTypeId: 3, TypeCode: 'MATERNITY', TypeName: 'Nghỉ chế độ thai sản', IsPaid: false },
  { LeaveTypeId: 4, TypeCode: 'UNPAID', TypeName: 'Nghỉ việc riêng không hưởng lương', IsPaid: false }
];

export default function MyLeaveView() {
  const currentUser = useMemo(() => {
    return AuthService.getCurrentUser() || {};
  }, []);
  const employeeId = currentUser.employeeId || currentUser.EmployeeId || currentUser.id;

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState({
    standardAnnualQuota: 12.0,
    approvedAnnualDays: 0,
    pendingAnnualDays: 0,
    remainingAnnualDays: 12.0,
    availableAnnualDays: 12.0,
    usedSickDays: 0,
    usedUnpaidDays: 0
  });
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState(FALLBACK_LEAVE_TYPES);
  const [colleagues, setColleagues] = useState([]);

  // State Modal Tạo đơn
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [formData, setFormData] = useState({
    leaveTypeId: '1',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    totalDays: 1.0,
    reason: '',
    handoverToEmployeeId: ''
  });

  // State Modal Hủy đơn
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedCancelReq, setSelectedCancelReq] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Tải dữ liệu ban đầu
  const loadData = async () => {
    try {
      setLoading(true);
      // 1. Luôn tải danh mục loại nghỉ phép và danh sách đồng nghiệp trước
      const [typesRes, colleaguesRes] = await Promise.all([
        LeaveService.getLeaveTypes().catch(() => ({ data: FALLBACK_LEAVE_TYPES })),
        LeaveService.getColleagues(employeeId || 0).catch(() => ({ data: [] }))
      ]);

      if (typesRes?.data && Array.isArray(typesRes.data) && typesRes.data.length > 0) {
        setLeaveTypes(typesRes.data);
      } else {
        setLeaveTypes(FALLBACK_LEAVE_TYPES);
      }

      if (colleaguesRes?.data && Array.isArray(colleaguesRes.data)) {
        setColleagues(colleaguesRes.data);
      }

      // 2. Nếu có thông tin nhân viên, tải tiếp hạn mức phép và lịch sử đơn cá nhân
      if (employeeId) {
        const [quotaRes, leavesRes] = await Promise.all([
          LeaveService.getQuota(employeeId, selectedYear).catch(() => ({ data: null })),
          LeaveService.getMyRequests(employeeId, selectedYear).catch(() => ({ data: [] }))
        ]);

        if (quotaRes?.data) setQuota(quotaRes.data);
        if (leavesRes?.data && Array.isArray(leavesRes.data)) setMyLeaves(leavesRes.data);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu nghỉ phép:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employeeId, selectedYear]);

  // Tự động tính toán số ngày nghỉ khi thay đổi ngày bắt đầu / kết thúc / nửa ngày
  const calculateDays = (start, end, halfDay) => {
    if (!start || !end) return 1.0;
    if (start > end) return 0;
    if (halfDay && start === end) return 0.5;

    const s = new Date(`${start}T00:00:00`);
    const e = new Date(`${end}T00:00:00`);
    const diff = Math.round((e.getTime() - s.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    return Math.max(1, diff);
  };

  const handleStartDateChange = (val) => {
    const newEnd = formData.endDate && formData.endDate >= val ? formData.endDate : val;
    const days = calculateDays(val, newEnd, formData.isHalfDay);
    setFormData((prev) => ({
      ...prev,
      startDate: val,
      endDate: newEnd,
      totalDays: days
    }));
  };

  const handleEndDateChange = (val) => {
    const days = calculateDays(formData.startDate, val, formData.isHalfDay);
    setFormData((prev) => ({
      ...prev,
      endDate: val,
      totalDays: days
    }));
  };

  const handleHalfDayToggle = (checked) => {
    let newEnd = formData.endDate;
    if (checked && formData.startDate) {
      newEnd = formData.startDate;
    }
    const days = calculateDays(formData.startDate, newEnd, checked);
    setFormData((prev) => ({
      ...prev,
      isHalfDay: checked,
      endDate: newEnd,
      totalDays: days
    }));
  };

  // Mở modal tạo đơn mới
  const handleOpenCreateModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const activeTypes = (leaveTypes && leaveTypes.length > 0) ? leaveTypes : FALLBACK_LEAVE_TYPES;
    const defaultTypeId = activeTypes[0] ? String(activeTypes[0].LeaveTypeId) : '1';
    setFormData({
      leaveTypeId: defaultTypeId,
      startDate: today,
      endDate: today,
      isHalfDay: false,
      totalDays: 1.0,
      reason: '',
      handoverToEmployeeId: ''
    });
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  // Nộp đơn xin nghỉ phép
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!employeeId) {
      setFormError('Không tìm thấy mã nhân viên của tài khoản hiện tại. Vui lòng liên hệ HR hoặc Quản trị viên để gắn thông tin hồ sơ nhân sự!');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setFormError('Vui lòng chọn ngày bắt đầu và ngày kết thúc!');
      return;
    }
    if (formData.startDate > formData.endDate) {
      setFormError('Ngày bắt đầu không được lớn hơn ngày kết thúc!');
      return;
    }
    if (!formData.reason.trim()) {
      setFormError('Vui lòng nhập lý do xin nghỉ phép!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        employeeId,
        leaveTypeId: parseInt(formData.leaveTypeId, 10),
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: parseFloat(formData.totalDays),
        reason: formData.reason.trim(),
        handoverToEmployeeId: formData.handoverToEmployeeId ? parseInt(formData.handoverToEmployeeId, 10) : null
      };

      const res = await LeaveService.createRequest(payload);
      setFormSuccess(res.message || 'Nộp đơn xin nghỉ phép thành công!');
      setTimeout(() => {
        setModalOpen(false);
        loadData();
      }, 1200);
    } catch (err) {
      setFormError(err.message || 'Lỗi khi nộp đơn xin nghỉ phép!');
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal xác nhận hủy đơn
  const handleOpenCancelModal = (req) => {
    setSelectedCancelReq(req);
    setCancelModalOpen(true);
  };

  // Xác nhận hủy đơn
  const handleConfirmCancel = async () => {
    if (!selectedCancelReq) return;
    try {
      setCancelling(true);
      await LeaveService.cancelRequest(selectedCancelReq.LeaveRequestId, employeeId);
      setCancelModalOpen(false);
      setSelectedCancelReq(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Lỗi khi hủy đơn xin nghỉ phép!');
    } finally {
      setCancelling(false);
    }
  };

  // Lọc danh sách theo trạng thái
  const filteredLeaves = useMemo(() => {
    return myLeaves.filter((item) => {
      if (statusFilter === 'ALL') return true;
      return item.Status === statusFilter;
    });
  }, [myLeaves, statusFilter]);

  // Danh sách loại phép hiệu lực (DB hoặc Fallback nếu mạng chậm)
  const activeLeaveTypes = useMemo(() => {
    return (leaveTypes && leaveTypes.length > 0) ? leaveTypes : FALLBACK_LEAVE_TYPES;
  }, [leaveTypes]);

  // Thông tin loại phép hiện đang chọn trong form
  const selectedTypeInfo = useMemo(() => {
    return activeLeaveTypes.find((t) => String(t.LeaveTypeId) === String(formData.leaveTypeId)) || activeLeaveTypes[0];
  }, [activeLeaveTypes, formData.leaveTypeId]);

  return (
    <div className="my-leave-container" style={{ padding: '20px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Cảnh báo nếu tài khoản chưa gắn với nhân viên */}
      {!employeeId && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>
            <b>Lưu ý:</b> Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên trong hệ thống (thiếu mã EmployeeId). Bạn vẫn có thể xem trước danh mục loại nghỉ phép, nhưng cần cập nhật hồ sơ để nộp đơn và theo dõi hạn mức phép.
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={24} style={{ color: '#0f766e' }} />
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Đơn xin nghỉ phép của tôi
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13.5px' }}>
            Theo dõi hạn mức phép năm {selectedYear}, nộp đơn xin nghỉ và theo dõi tiến độ phê duyệt từ Quản lý trực tiếp
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            className="inp"
            style={{ width: '130px', fontSize: '13px' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          >
            <option value={currentYear}>Năm {currentYear}</option>
            <option value={currentYear - 1}>Năm {currentYear - 1}</option>
          </select>

          <button
            type="button"
            className="btn"
            style={{ padding: '8px 12px' }}
            onClick={loadData}
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            className="btn pri"
            onClick={handleOpenCreateModal}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
          >
            <Plus size={16} />
            <span>Tạo đơn xin nghỉ</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Hạn mức phép năm */}
      <div className="grid c4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          title="TỔNG PHÉP NĂM TIÊU CHUẨN"
          value={Number(quota.standardAnnualQuota || 12).toFixed(1)}
          unit="ngày"
          subtext="1 ngày phép / tháng làm việc"
          icon={CalendarDays}
          color="#0f766e"
          bg="#ccfbf1"
        />

        <StatCard
          title="ĐÃ NGHỈ HƯỞNG LƯƠNG"
          value={Number(quota.approvedAnnualDays || 0).toFixed(1)}
          unit="ngày"
          subtext="Đơn phép năm đã duyệt"
          icon={CheckCircle2}
          color="#2563eb"
          bg="#dbeafe"
        />

        <StatCard
          title="ĐANG CHỜ PHÊ DUYỆT"
          value={Number(quota.pendingAnnualDays || 0).toFixed(1)}
          unit="ngày"
          subtext="Đang chờ Quản lý duyệt"
          icon={Clock}
          color="#d97706"
          bg="#fef3c7"
        />

        <StatCard
          title="SỐ NGÀY PHÉP CÒN LẠI"
          value={Number(quota.remainingAnnualDays !== undefined ? quota.remainingAnnualDays : 12).toFixed(1)}
          unit="ngày"
          subtext={`Khả dụng nộp mới: ${Number(quota.availableAnnualDays !== undefined ? quota.availableAnnualDays : 12).toFixed(1)} ngày`}
          icon={CheckCircle2}
          color="#16a34a"
          bg="#dcfce7"
        />
      </div>

      {/* Bảng lịch sử đơn xin nghỉ */}
      <div className="card" style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: '#0f766e' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Lịch sử đơn xin nghỉ phép ({filteredLeaves.length})
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['ALL', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((st) => {
              const labelMap = {
                ALL: 'Tất cả',
                Pending: 'Chờ duyệt',
                Approved: 'Đã duyệt',
                Rejected: 'Bị từ chối',
                Cancelled: 'Đã hủy'
              };
              const count = myLeaves.filter((item) => (st === 'ALL' ? true : item.Status === st)).length;
              return (
                <button
                  key={st}
                  type="button"
                  className={`btn sm ${statusFilter === st ? 'pri' : ''}`}
                  onClick={() => setStatusFilter(st)}
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  {labelMap[st]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
          <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>MÃ ĐƠN</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>LOẠI NGHỈ</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>THỜI GIAN NGHỈ</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'center' }}>SỐ NGÀY</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>NGƯỜI BÀN GIAO</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>NGƯỜI DUYỆT</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>TRẠNG THÁI</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>LÝ DO &amp; PHẢN HỒI</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '36px', textAlign: 'center' }}>
                    <EmptyState
                      title="Không có đơn xin nghỉ phép nào"
                      description={statusFilter === 'ALL' ? 'Bạn chưa nộp đơn xin nghỉ phép nào trong năm này.' : `Không có đơn nghỉ phép ở trạng thái "${statusFilter}".`}
                    />
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((req) => {
                  const isPending = req.Status === 'Pending';
                  const isApproved = req.Status === 'Approved';
                  const isRejected = req.Status === 'Rejected';
                  const isCancelled = req.Status === 'Cancelled';

                  return (
                    <tr key={req.LeaveRequestId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f766e' }}>
                        {req.RequestCode}
                      </td>

                      <td style={{ padding: '10px 14px' }}>
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
                          {req.IsPaid ? 'Hưởng lương' : 'Không hưởng lương'}
                        </span>
                      </td>

                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ color: '#0f172a', fontWeight: 500 }}>
                          {req.StartDate} <span style={{ color: '#94a3b8' }}>→</span> {req.EndDate}
                        </div>
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#0f766e' }}>
                        {req.TotalDays} ngày
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        {req.HandoverToEmployeeName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={14} style={{ color: '#64748b' }} />
                            <span>{req.HandoverToEmployeeName}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không có</span>
                        )}
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        {req.ApproverEmployeeName ? (
                          <span style={{ fontWeight: 500, color: '#0f172a' }}>{req.ApproverEmployeeName}</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chờ phân công</span>
                        )}
                      </td>

                      <td style={{ padding: '10px 14px' }}>
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

                      <td style={{ padding: '10px 14px', maxWidth: '220px' }}>
                        <div style={{ color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.Reason}>
                          {req.Reason}
                        </div>
                        {req.ResponseNote && (
                          <div style={{ fontSize: '11.5px', color: '#dc2626', marginTop: '2px', fontStyle: 'italic' }}>
                            Ghi chú: {req.ResponseNote}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {isPending ? (
                          <button
                            type="button"
                            className="btn sm"
                            style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2', padding: '4px 8px', fontSize: '11.5px' }}
                            onClick={() => handleOpenCancelModal(req)}
                            title="Hủy đơn xin nghỉ này"
                          >
                            <XCircle size={13} />
                            <span>Hủy đơn</span>
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>—</span>
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

      {/* Modal Nộp đơn xin nghỉ phép */}
      {modalOpen && (
        <div className="modal-wrap" onClick={() => !submitting && setModalOpen(false)} style={{ zIndex: 1100 }}>
          <div className="modal" style={{ maxWidth: '640px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={18} style={{ color: '#0f766e' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Tạo đơn xin nghỉ phép mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave}>
              <div className="modal-b" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {formError && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Chọn Loại nghỉ phép */}
                <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Loại nghỉ phép <span style={{ color: '#dc2626' }}>*</span>
                  </span>
                  <select
                    className="inp"
                    value={formData.leaveTypeId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, leaveTypeId: e.target.value }))}
                    required
                  >
                    {activeLeaveTypes.map((t) => (
                      <option key={t.LeaveTypeId} value={t.LeaveTypeId}>
                        {t.TypeName} ({t.IsPaid ? 'Có hưởng lương' : 'Không hưởng lương'})
                      </option>
                    ))}
                  </select>
                </label>

                {/* Thông tin số dư ngày phép nếu chọn phép năm */}
                {selectedTypeInfo?.TypeCode === 'ANNUAL' && (
                  <div style={{ padding: '10px 12px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', fontSize: '12.5px', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} style={{ flexShrink: 0 }} />
                    <span>
                      Số ngày phép năm còn lại của bạn trong năm {selectedYear}: <b>{quota.remainingAnnualDays} ngày</b> (Khả dụng: {quota.availableAnnualDays} ngày).
                    </span>
                  </div>
                )}

                {/* Chọn ngày bắt đầu & kết thúc */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      Từ ngày <span style={{ color: '#dc2626' }}>*</span>
                    </span>
                    <input
                      type="date"
                      className="inp"
                      value={formData.startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      required
                    />
                  </label>

                  <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      Đến ngày <span style={{ color: '#dc2626' }}>*</span>
                    </span>
                    <input
                      type="date"
                      className="inp"
                      value={formData.endDate}
                      min={formData.startDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      required
                      disabled={formData.isHalfDay}
                    />
                  </label>
                </div>

                {/* Checkbox nghỉ nửa ngày & Tổng số ngày tính toán */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={formData.isHalfDay}
                      onChange={(e) => handleHalfDayToggle(e.target.checked)}
                    />
                    <span>Nghỉ nửa ngày (0.5 ngày)</span>
                  </label>

                  <div style={{ fontSize: '13px', color: '#0f766e', fontWeight: 700 }}>
                    Tổng số ngày nghỉ: {formData.totalDays} ngày
                  </div>
                </div>

                {/* Chọn người nhận bàn giao công việc */}
                <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Người nhận bàn giao công việc (Tùy chọn)
                  </span>
                  <select
                    className="inp"
                    value={formData.handoverToEmployeeId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, handoverToEmployeeId: e.target.value }))}
                  >
                    <option value="">-- Chọn đồng nghiệp tiếp nhận công việc --</option>
                    {colleagues.map((col) => (
                      <option key={col.EmployeeId} value={col.EmployeeId}>
                        [{col.EmployeeCode}] {col.FullName} - {col.DepartmentName || 'Chung'}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Lý do xin nghỉ phép */}
                <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Lý do xin nghỉ phép <span style={{ color: '#dc2626' }}>*</span>
                  </span>
                  <textarea
                    className="inp"
                    rows="3"
                    placeholder="Mô tả cụ thể lý do xin nghỉ (việc cá nhân, khám chữa bệnh, giải quyết việc gia đình...)"
                    value={formData.reason}
                    onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                    required
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </label>
              </div>

              <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn pri"
                  disabled={submitting}
                >
                  {submitting ? 'Đang gửi đơn...' : 'Gửi đơn xin nghỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận Hủy đơn */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => !cancelling && setCancelModalOpen(false)}
        title="Xác nhận hủy đơn xin nghỉ phép"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelling}
            >
              Quay lại
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}
              onClick={handleConfirmCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Đang hủy...' : 'Đồng ý hủy đơn'}
            </button>
          </div>
        }
      >
        <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
          Bạn có chắc chắn muốn hủy đơn xin nghỉ phép <b>[{selectedCancelReq?.RequestCode}]</b>{' '}
          ({selectedCancelReq?.LeaveTypeName}, từ ngày {selectedCancelReq?.StartDate} đến {selectedCancelReq?.EndDate}) không?
          <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#64748b' }}>
            Lưu ý: Sau khi hủy, bạn sẽ cần tạo một đơn mới nếu muốn xin nghỉ lại.
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}
