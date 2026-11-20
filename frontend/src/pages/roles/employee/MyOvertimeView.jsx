import React, { useState, useEffect } from 'react';
import {
  Timer, Plus, Search, RefreshCw, CheckCircle2, Clock,
  AlertTriangle, XCircle, FileText, Calendar, DollarSign, X
} from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import OvertimeService from '../../../services/OvertimeService';
import '../../../styles/roles/employee/MyOvertimeView.css';

export default function MyOvertimeView() {
  const [myOts, setMyOts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalApprovedHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    overtimeDate: new Date().toISOString().slice(0, 10),
    startTime: '18:00',
    endTime: '21:00',
    totalHours: 3.0,
    overtimeRateType: 'Ngày thường (150%)',
    reason: ''
  });

  const fetchMyOts = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await OvertimeService.getMyRequests();
      if (data) {
        setMyOts(data.requests || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Không thể tải danh sách làm thêm giờ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOts();
  }, []);

  const handleTimeChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    const startParts = (field === 'startTime' ? val : formData.startTime).split(':');
    const endParts = (field === 'endTime' ? val : formData.endTime).split(':');

    if (startParts.length === 2 && endParts.length === 2) {
      const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1] || 0);
      const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1] || 0);
      const diffMin = endMin >= startMin ? (endMin - startMin) : (24 * 60 - startMin + endMin);
      updated.totalHours = Math.round((diffMin / 60) * 10) / 10;
    }
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');
      await OvertimeService.createRequest(formData);
      setSuccessMsg('Gửi yêu cầu đăng ký tăng ca (OT) thành công!');
      setModalOpen(false);
      setFormData({
        overtimeDate: new Date().toISOString().slice(0, 10),
        startTime: '18:00',
        endTime: '21:00',
        totalHours: 3.0,
        overtimeRateType: 'Ngày thường (150%)',
        reason: ''
      });
      fetchMyOts();
    } catch (err) {
      alert(err.message || 'Lỗi khi gửi yêu cầu làm thêm giờ!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu làm thêm giờ này?')) return;
    try {
      await OvertimeService.cancelRequest(id);
      setSuccessMsg('Đã hủy yêu cầu tăng ca thành công!');
      fetchMyOts();
    } catch (err) {
      alert(err.message || 'Không thể hủy yêu cầu tăng ca.');
    }
  };

  return (
    <div className="my-overtime-container">
      <div className="ph">
        <div>
          <h1>Đăng ký làm thêm giờ (Overtime)</h1>
          <p>Yêu cầu làm thêm giờ ngoài giờ làm việc chuẩn để quản lý phê duyệt và chuyển kế toán tính lương (Miễn thuế TNCN 2026)</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={fetchMyOts} title="Tải lại dữ liệu" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          <button className="btn pri" onClick={() => setModalOpen(true)}>
            <Plus size={15} />
            <span>Đăng ký tăng ca</span>
          </button>
        </div>
      </div>

      <div className="ot-kpi-row">
        <div className="ot-kpi-card">
          <div className="ot-kpi-icon" style={{ background: '#f0fdfa', color: '#0f766e' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="ot-kpi-num">{stats.total}</div>
            <div className="ot-kpi-label">Tổng lượt đăng ký</div>
          </div>
        </div>

        <div className="ot-kpi-card">
          <div className="ot-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="ot-kpi-num">{stats.pending}</div>
            <div className="ot-kpi-label">Đang chờ phê duyệt</div>
          </div>
        </div>

        <div className="ot-kpi-card">
          <div className="ot-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="ot-kpi-num">{stats.approved}</div>
            <div className="ot-kpi-label">Đã được phê duyệt</div>
          </div>
        </div>

        <div className="ot-kpi-card">
          <div className="ot-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Timer size={22} />
          </div>
          <div>
            <div className="ot-kpi-num">{stats.totalApprovedHours} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>giờ</span></div>
            <div className="ot-kpi-label">Giờ OT tích lũy được duyệt</div>
          </div>
        </div>
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

      <div className="tbl-card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th className="col-code">MÃ OT</th>
                <th className="col-date">NGÀY LÀM THÊM</th>
                <th className="col-time">KHUNG GIỜ</th>
                <th className="col-hours">SỐ GIỜ</th>
                <th className="col-rate">HỆ SỐ LƯƠNG</th>
                <th className="col-reason">DỰ ÁN / NHIỆM VỤ</th>
                <th className="col-status">TRẠNG THÁI</th>
                <th className="col-comment">QUẢN LÝ PHẢN HỒI</th>
                <th className="col-actions">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    <span>Đang tải danh sách đăng ký tăng ca...</span>
                  </td>
                </tr>
              ) : myOts.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={9}
                  icon={Timer}
                  title="Bạn chưa có đăng ký làm thêm giờ (OT) nào"
                  description="Bấm 'Đăng ký tăng ca' để gửi kế hoạch làm thêm giờ ngoài giờ hành chính."
                  actionLabel="Đăng ký tăng ca"
                  onAction={() => setModalOpen(true)}
                />
              ) : (
                myOts.map((ot) => (
                  <tr key={ot.OvertimeRequestId}>
                    <td className="col-code"><code style={{ fontWeight: 700, color: '#0f766e' }}>{ot.RequestCode}</code></td>
                    <td className="col-date" style={{ fontWeight: 600 }}>{ot.OvertimeDate}</td>
                    <td className="col-time" style={{ color: '#475569' }}>{ot.StartTime?.slice(0, 5)} - {ot.EndTime?.slice(0, 5)}</td>
                    <td className="col-hours"><strong style={{ color: '#0f766e' }}>{ot.TotalHours}h</strong></td>
                    <td className="col-rate"><span className="ot-rate-badge">{ot.OvertimeRateType}</span></td>
                    <td className="col-reason">{ot.Reason}</td>
                    <td className="col-status">
                      <StatusBadge status={ot.Status} />
                    </td>
                    <td className="col-comment">
                      {ot.ManagerComment || (ot.ApproverName ? `Phụ trách: ${ot.ApproverName}` : '-')}
                    </td>
                    <td className="col-actions">
                      {ot.Status === 'PENDING' ? (
                        <button
                          className="ot-cancel-btn"
                          onClick={() => handleCancelRequest(ot.OvertimeRequestId)}
                        >
                          Hủy đơn
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-wrap" onClick={() => !submitting && setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Timer size={18} color="#0f766e" />
                <h3>Đăng ký làm thêm giờ (OT)</h3>
              </div>
              {!submitting && (
                <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-b" style={{ padding: '18px 22px' }}>
                <div className="form">
                  <label className="field">
                    <span>Ngày làm thêm: <i className="req">*</i></span>
                    <input
                      type="date"
                      className="inp"
                      required
                      value={formData.overtimeDate}
                      onChange={(e) => setFormData({ ...formData, overtimeDate: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Hệ số làm thêm: <i className="req">*</i></span>
                    <select
                      className="inp"
                      value={formData.overtimeRateType}
                      onChange={(e) => setFormData({ ...formData, overtimeRateType: e.target.value })}
                    >
                      <option value="Ngày thường (150%)">Ngày thường (150%)</option>
                      <option value="Cuối tuần (200%)">Cuối tuần (200%)</option>
                      <option value="Ngày lễ (300%)">Ngày lễ (300%)</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Giờ bắt đầu: <i className="req">*</i></span>
                    <input
                      type="time"
                      className="inp"
                      required
                      value={formData.startTime}
                      onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span>Giờ kết thúc: <i className="req">*</i></span>
                    <input
                      type="time"
                      className="inp"
                      required
                      value={formData.endTime}
                      onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    />
                  </label>

                  <label className="field full">
                    <span>Số giờ tăng ca tính toán (giờ):</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="12"
                      className="inp num"
                      required
                      value={formData.totalHours}
                      onChange={(e) => setFormData({ ...formData, totalHours: parseFloat(e.target.value) || 0 })}
                    />
                  </label>

                  <label className="field full">
                    <span>Dự án & Nội dung công việc: <i className="req">*</i></span>
                    <textarea
                      className="inp"
                      rows="3"
                      required
                      placeholder="Ghi rõ dự án, nhiệm vụ gấp hoặc khối lượng công việc cần xử lý ngoài giờ..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  disabled={submitting}
                  onClick={() => setModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn pri"
                  disabled={submitting}
                >
                  <Plus size={15} />
                  <span>{submitting ? 'Đang gửi...' : 'Gửi yêu cầu tăng ca'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
