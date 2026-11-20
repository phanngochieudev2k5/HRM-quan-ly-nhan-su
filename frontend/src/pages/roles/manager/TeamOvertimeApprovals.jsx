import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Search, RefreshCw, AlertTriangle,
  Clock, Timer, User, Building, X, MessageSquare
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import OvertimeService from '../../../services/OvertimeService';
import '../../../styles/roles/manager/TeamOvertimeApprovals.css';

export default function TeamOvertimeApprovals() {
  const [otList, setOtList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTeamOts = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await OvertimeService.getTeamRequests({
        search: searchTerm,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      if (data) {
        setOtList(data.requests || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Không thể tải danh sách duyệt tăng ca.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamOts();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTeamOts();
  };

  const handleApprove = async (id) => {
    try {
      setSubmittingAction(true);
      await OvertimeService.approveRequest(id, 'Đã duyệt yêu cầu làm thêm giờ.');
      setSuccessMsg(`Đã phê duyệt thành công yêu cầu tăng ca #${id}!`);
      fetchTeamOts();
    } catch (err) {
      alert(err.message || 'Lỗi khi phê duyệt yêu cầu.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingItem) return;
    try {
      setSubmittingAction(true);
      await OvertimeService.rejectRequest(rejectingItem.OvertimeRequestId, rejectComment || 'Không duyệt yêu cầu tăng ca.');
      setSuccessMsg(`Đã từ chối yêu cầu tăng ca #${rejectingItem.RequestCode}!`);
      setRejectingItem(null);
      setRejectComment('');
      fetchTeamOts();
    } catch (err) {
      alert(err.message || 'Lỗi khi từ chối yêu cầu.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="team-ot-container">
      <PageHeader
        breadcrumb="Quản lý Nhóm / Tăng ca"
        title="Phê duyệt Kế hoạch Tăng ca (OT)"
        subtitle="Kiểm soát và xét duyệt kế hoạch làm thêm giờ ngoài giờ hành chính của các nhân sự trực thuộc quyền quản lý"
      />

      <div className="ot-kpi-row">
        <div className="ot-kpi-card">
          <div className="ot-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="ot-kpi-num">{stats.pending}</div>
            <div className="ot-kpi-label">Yêu cầu chờ xét duyệt</div>
          </div>
        </div>

        <div className="ot-kpi-card">
          <div className="ot-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="ot-kpi-num">{stats.approved}</div>
            <div className="ot-kpi-label">Đã phê duyệt</div>
          </div>
        </div>

        <div className="ot-kpi-card">
          <div className="ot-kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <XCircle size={22} />
          </div>
          <div>
            <div className="ot-kpi-num">{stats.rejected}</div>
            <div className="ot-kpi-label">Đã từ chối</div>
          </div>
        </div>

        <div className="ot-kpi-card">
          <div className="ot-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Timer size={22} />
          </div>
          <div>
            <div className="ot-kpi-num">{stats.totalHours} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>giờ</span></div>
            <div className="ot-kpi-label">Tổng giờ OT nhóm đã duyệt</div>
          </div>
        </div>
      </div>

      <div className="ot-filter-bar">
        <form onSubmit={handleSearchSubmit} className="ot-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm theo nhân viên, mã NV, mã OT, dự án..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <select
          className="ot-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ phê duyệt</option>
          <option value="APPROVED">Đã phê duyệt</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>

        <button className="btn" onClick={fetchTeamOts} disabled={loading} title="Tải lại danh sách">
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {successMsg && (
        <div style={{
          padding: '12px 18px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '12px 18px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600
        }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th className="col-code">MÃ OT</th>
                <th className="col-user">NHÂN VIÊN</th>
                <th className="col-date">NGÀY LÀM THÊM</th>
                <th className="col-time">KHUNG GIỜ</th>
                <th className="col-hours">SỐ GIỜ</th>
                <th className="col-rate">HỆ SỐ LƯƠNG</th>
                <th className="col-reason">CÔNG VIỆC / DỰ ÁN</th>
                <th className="col-status">TRẠNG THÁI</th>
                <th className="col-actions">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    <span>Đang tải danh sách yêu cầu tăng ca của nhóm...</span>
                  </td>
                </tr>
              ) : otList.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={9}
                  title="Chưa có yêu cầu làm thêm giờ (OT)"
                  description="Kế hoạch tăng ca của nhân sự trong nhóm quản lý sẽ hiển thị tại đây khi có đăng ký mới."
                />
              ) : (
                otList.map((ot) => (
                  <tr key={ot.OvertimeRequestId}>
                    <td className="col-code" style={{ fontWeight: 700, color: 'var(--p)', fontFamily: 'monospace' }}>{ot.RequestCode}</td>
                    <td className="col-user">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {ot.AvatarUrl ? (
                          <img
                            src={ot.AvatarUrl}
                            alt={ot.EmployeeName}
                            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: '#0f766e',
                            color: '#ffffff',
                            fontWeight: 700,
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '13px'
                          }}>
                            {ot.EmployeeName ? ot.EmployeeName.trim().slice(-1) : 'U'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{ot.EmployeeName}</div>
                          <div className="muted small">{ot.EmployeeCode} · {ot.DepartmentName || ot.PositionName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="col-date" style={{ fontSize: '13px', fontWeight: 600 }}>{ot.OvertimeDate}</td>
                    <td className="col-time" style={{ fontSize: '12.5px', color: 'var(--muted)' }}>{ot.StartTime?.slice(0, 5)} - {ot.EndTime?.slice(0, 5)}</td>
                    <td className="col-hours">
                      <span className="ot-hours-tag">{ot.TotalHours}h</span>
                    </td>
                    <td className="col-rate">
                      <span className="ot-mult-badge">{ot.OvertimeRateType}</span>
                    </td>
                    <td className="col-reason">
                      <div className="ot-project-desc">{ot.Reason}</div>
                      {ot.ManagerComment && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                          Ghi chú: {ot.ManagerComment}
                        </div>
                      )}
                    </td>
                    <td className="col-status">
                      <StatusBadge status={ot.Status} />
                    </td>
                    <td className="col-actions">
                      {ot.Status === 'PENDING' ? (
                        <div className="ot-action-group">
                          <button
                            className="btn pri sm"
                            disabled={submittingAction}
                            onClick={() => handleApprove(ot.OvertimeRequestId)}
                            title="Phê duyệt yêu cầu này"
                          >
                            <CheckCircle2 size={13} />
                            <span>Duyệt</span>
                          </button>
                          <button
                            className="btn sm"
                            disabled={submittingAction}
                            style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                            onClick={() => { setRejectingItem(ot); setRejectComment(''); }}
                            title="Từ chối yêu cầu này"
                          >
                            <XCircle size={13} />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      ) : (
                        <span className="muted small">
                          {ot.Status === 'APPROVED' ? 'Đã duyệt' : ot.Status === 'REJECTED' ? 'Đã từ chối' : 'Đã hủy'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rejectingItem && (
        <div className="modal-wrap" onClick={() => !submittingAction && setRejectingItem(null)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={18} color="#dc2626" />
                <h3>Từ chối đơn tăng ca ({rejectingItem.RequestCode})</h3>
              </div>
              {!submittingAction && (
                <button type="button" onClick={() => setRejectingItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleConfirmReject}>
              <div className="modal-b" style={{ padding: '16px 20px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569' }}>
                  Nhân sự: <strong>{rejectingItem.EmployeeName}</strong> ({rejectingItem.EmployeeCode})<br />
                  Ngày OT: <strong>{rejectingItem.OvertimeDate}</strong> ({rejectingItem.TotalHours} giờ)
                </p>

                <label className="field full">
                  <span>Lý do từ chối đơn tăng ca: <i className="req">*</i></span>
                  <textarea
                    className="inp"
                    rows="3"
                    required
                    placeholder="Nhập lý do phản hồi cho nhân viên (VD: Chưa có sự chấp thuận trước, không cần thiết làm thêm...)"
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                  />
                </label>
              </div>

              <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  disabled={submittingAction}
                  onClick={() => setRejectingItem(null)}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: '#dc2626', color: '#ffffff', borderColor: '#dc2626' }}
                  disabled={submittingAction}
                >
                  <span>{submittingAction ? 'Đang xử lý...' : 'Xác nhận từ chối'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
