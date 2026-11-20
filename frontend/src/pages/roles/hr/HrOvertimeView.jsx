import React, { useState, useEffect } from 'react';
import {
  Timer, Search, RefreshCw, CheckCircle2, Clock,
  AlertTriangle, XCircle, FileText, Building2, User
} from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import OvertimeService from '../../../services/OvertimeService';
import '../../../styles/roles/hr/HrOvertimeView.css';

export default function HrOvertimeView() {
  const [otList, setOtList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalApprovedHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAllOts = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await OvertimeService.getAllRequests({
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
      setErrorMsg(err.message || 'Không thể tải danh sách giờ làm thêm toàn công ty.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOts();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAllOts();
  };

  return (
    <div className="hr-overtime-container">
      <div className="ph">
        <div>
          <h1>Quản lý giờ làm thêm (OT) toàn công ty</h1>
          <p>Theo dõi, tổng hợp số giờ làm thêm ngoài giờ toàn doanh nghiệp để đồng bộ Bảng chấm công và Quỹ lương (Áp dụng chính sách miễn thuế TNCN 2026)</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={fetchAllOts} disabled={loading} title="Làm mới dữ liệu">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div className="hr-ot-kpi-row">
        <div className="hr-ot-kpi-card">
          <div className="hr-ot-kpi-icon" style={{ background: '#f0fdfa', color: '#0f766e' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="hr-ot-kpi-num">{stats.total}</div>
            <div className="hr-ot-kpi-label">Tổng đơn toàn công ty</div>
          </div>
        </div>

        <div className="hr-ot-kpi-card">
          <div className="hr-ot-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="hr-ot-kpi-num">{stats.pending}</div>
            <div className="hr-ot-kpi-label">Đang chờ quản lý duyệt</div>
          </div>
        </div>

        <div className="hr-ot-kpi-card">
          <div className="hr-ot-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="hr-ot-kpi-num">{stats.approved}</div>
            <div className="hr-ot-kpi-label">Đã được phê duyệt</div>
          </div>
        </div>

        <div className="hr-ot-kpi-card">
          <div className="hr-ot-kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <XCircle size={22} />
          </div>
          <div>
            <div className="hr-ot-kpi-num">{stats.rejected}</div>
            <div className="hr-ot-kpi-label">Đã từ chối</div>
          </div>
        </div>

        <div className="hr-ot-kpi-card">
          <div className="hr-ot-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Timer size={22} />
          </div>
          <div>
            <div className="hr-ot-kpi-num">{stats.totalApprovedHours} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>giờ</span></div>
            <div className="hr-ot-kpi-label">Tổng giờ OT được duyệt</div>
          </div>
        </div>
      </div>

      <div className="hr-ot-filter-bar">
        <form onSubmit={handleSearchSubmit} className="hr-ot-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm theo nhân sự, mã nhân viên, mã OT, dự án..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <select
          className="hr-ot-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ phê duyệt</option>
          <option value="APPROVED">Đã phê duyệt</option>
          <option value="REJECTED">Đã từ chối</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

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

      <div className="tbl-card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th className="col-code">MÃ OT</th>
                <th className="col-user">NHÂN SỰ</th>
                <th className="col-dept">PHÒNG BAN</th>
                <th className="col-date">NGÀY LÀM THÊM</th>
                <th className="col-time">KHUNG GIỜ</th>
                <th className="col-hours">SỐ GIỜ</th>
                <th className="col-rate">HỆ SỐ LƯƠNG</th>
                <th className="col-reason">DỰ ÁN / NHIỆM VỤ</th>
                <th className="col-approver">QUẢN LÝ DUYỆT</th>
                <th className="col-status">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    <span>Đang tải danh sách làm thêm giờ toàn công ty...</span>
                  </td>
                </tr>
              ) : otList.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={10}
                  icon={Timer}
                  title="Chưa có ca làm thêm giờ (OT) nào"
                  description="Danh sách đăng ký làm thêm giờ toàn công ty sẽ hiển thị tại đây khi có dữ liệu từ các bộ phận."
                />
              ) : (
                otList.map((ot) => (
                  <tr key={ot.OvertimeRequestId}>
                    <td className="col-code"><code style={{ fontWeight: 700, color: '#0f766e' }}>{ot.RequestCode}</code></td>
                    <td className="col-user">
                      <div className="who">
                        {ot.AvatarUrl ? (
                          <img
                            src={ot.AvatarUrl}
                            alt={ot.EmployeeName}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="avatar">
                            {ot.EmployeeName ? ot.EmployeeName.trim().slice(-1) : 'U'}
                          </div>
                        )}
                        <div>
                          <b>{ot.EmployeeName}</b>
                          <small>{ot.EmployeeCode}</small>
                        </div>
                      </div>
                    </td>
                    <td className="col-dept">{ot.DepartmentName || '-'}</td>
                    <td className="col-date" style={{ fontWeight: 600 }}>{ot.OvertimeDate}</td>
                    <td className="col-time" style={{ color: '#475569' }}>{ot.StartTime?.slice(0, 5)} - {ot.EndTime?.slice(0, 5)}</td>
                    <td className="col-hours"><strong style={{ color: '#0f766e' }}>{ot.TotalHours}h</strong></td>
                    <td className="col-rate"><span className="badge b-p">{ot.OvertimeRateType}</span></td>
                    <td className="col-reason">
                      <div>{ot.Reason}</div>
                      {ot.ManagerComment && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>
                          Phản hồi: {ot.ManagerComment}
                        </div>
                      )}
                    </td>
                    <td className="col-approver">
                      <span style={{ fontSize: '12.5px', color: '#334155' }}>
                        {ot.ApproverName || 'Chờ chỉ định'}
                      </span>
                    </td>
                    <td className="col-status">
                      <StatusBadge status={ot.Status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
