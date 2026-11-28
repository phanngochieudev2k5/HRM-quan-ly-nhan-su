import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Printer, HelpCircle, CheckCircle2, Send, X,
  FileSpreadsheet, RefreshCw, ArrowLeft, UserCheck, Calendar
} from 'lucide-react';
import AuthService from '../../../services/AuthService';
import PayrollService from '../../../services/PayrollService';
import EmptyState from '../../../components/common/EmptyState';
import PayslipTemplate from '../../../components/common/PayslipTemplate';
import '../../../styles/roles/employee/MyPayslipView.css';
import '../../../styles/roles/finance/PayrollModalOverlay.css';

const DEFAULT_PERIOD = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function MyPayslipDynamic({ role, user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentUser = user || AuthService.getCurrentUser() || {};
  const currentRole = role || currentUser?.role || 'Employee';
  const isPrivileged = ['Finance', 'Admin', 'HR'].includes(currentRole);

  const initialPeriod = searchParams.get('period') || DEFAULT_PERIOD();
  const initialEmpCode = searchParams.get('empCode') || '';

  const [selectedMonth, setSelectedMonth] = useState(initialPeriod);
  const [selectedEmpCode, setSelectedEmpCode] = useState(initialEmpCode);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [publishedPeriods, setPublishedPeriods] = useState([]);

  const [loading, setLoading] = useState(true);
  const [payslipRes, setPayslipRes] = useState({
    hasData: false,
    isLocked: false,
    periodCode: initialPeriod,
    config: {},
    slip: null
  });

  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeText, setDisputeText] = useState('');
  const [disputeSent, setDisputeSent] = useState(false);
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState([]);

  useEffect(() => {
    const p = searchParams.get('period');
    const c = searchParams.get('empCode');
    if (p) setSelectedMonth(p);
    if (c !== null) setSelectedEmpCode(c);
  }, [searchParams]);

  const loadPayslip = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PayrollService.getMyPayslip({
        period: selectedMonth,
        employeeCode: isPrivileged && selectedEmpCode ? selectedEmpCode : undefined,
        includeDraft: true
      });
      if (data) {
        setPayslipRes(data);
      }
    } catch (err) {
      console.error('Lỗi tải phiếu lương:', err);
      setPayslipRes({ hasData: false, isLocked: false, periodCode: selectedMonth, config: {}, slip: null });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedEmpCode, isPrivileged]);

  const loadEmployeeOptions = useCallback(async () => {
    if (!isPrivileged) return;
    try {
      const preview = await PayrollService.getPayrollPreview({ period: selectedMonth });
      if (preview?.rows) {
        setEmployeeOptions(preview.rows);
      }
    } catch {
      // Ignore if unable to load list
    }
  }, [isPrivileged, selectedMonth]);

  const loadPublishedPeriods = useCallback(async () => {
    try {
      const list = await PayrollService.getMyPeriods();
      const arr = Array.isArray(list) ? list : [];
      setPublishedPeriods(arr);
      if (!searchParams.get('period') && arr.length > 0) {
        const hasCurrent = arr.some(p => p.PeriodCode === selectedMonth);
        if (!hasCurrent) {
          setSelectedMonth(arr[0].PeriodCode);
        }
      }
    } catch {
      // Ignore silent fetch error
    }
  }, [searchParams, selectedMonth]);

  useEffect(() => {
    loadPublishedPeriods();
  }, []);

  const loadMyFeedbacks = useCallback(async () => {
    try {
      const list = await PayrollService.getMyFeedbacks({ period: selectedMonth });
      setMyFeedbacks(Array.isArray(list) ? list : []);
    } catch {
      // Ignore silent feedback fetch error
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadPayslip();
    loadEmployeeOptions();
    loadMyFeedbacks();
  }, [loadPayslip, loadEmployeeOptions, loadMyFeedbacks]);

  const handleMonthChange = (val) => {
    setSelectedMonth(val);
    const next = new URLSearchParams(searchParams);
    next.set('period', val);
    setSearchParams(next, { replace: true });
  };

  const handleEmpChange = (code) => {
    setSelectedEmpCode(code);
    const next = new URLSearchParams(searchParams);
    if (code) next.set('empCode', code);
    else next.delete('empCode');
    setSearchParams(next, { replace: true });
  };

  const handleSendDispute = async (e) => {
    e.preventDefault();
    if (!disputeText.trim() || disputeSubmitting) return;
    try {
      setDisputeSubmitting(true);
      await PayrollService.submitFeedback({
        periodCode: selectedMonth,
        content: disputeText.trim()
      });
      setDisputeSent(true);
      await loadMyFeedbacks();
      setTimeout(() => {
        setIsDisputeOpen(false);
        setDisputeSent(false);
        setDisputeText('');
      }, 1400);
    } catch (err) {
      alert(err.message || 'Không thể gửi phản hồi kỳ lương!');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const hasData = Boolean(payslipRes?.hasData && payslipRes?.slip);
  const isLocked = Boolean(payslipRes?.isLocked);

  return (
    <div className="payslip-container">
      <div className="ph">
        <div>
          <h1>Phiếu lương cá nhân</h1>
          <p>
            Dữ liệu đồng bộ trực tiếp từ Bảng thanh toán lương kỳ {selectedMonth} —
            {isPrivileged ? ' Chế độ Kế toán / Quản trị tra cứu & đối chiếu' : ` ${currentUser.name || currentUser.fullName || 'Nhân viên'}`}
          </p>
        </div>
        <div className="ph-tools">
          {isPrivileged && (
            <button
              className="btn"
              onClick={() => navigate('/finance/calc')}
              title="Quay lại Bảng thanh toán lương"
            >
              <ArrowLeft size={15} />
              <span>Về Bảng thanh toán lương</span>
            </button>
          )}
          <button className="btn" onClick={loadPayslip} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          {hasData && (
            <button className="btn" onClick={() => window.print()}>
              <Printer size={15} />
              <span>In phiếu lương</span>
            </button>
          )}
          {hasData && (
            <button className="btn pri" onClick={() => setIsDisputeOpen(true)}>
              <HelpCircle size={15} />
              <span>Phản hồi kỳ lương</span>
            </button>
          )}
        </div>
      </div>

      <div className="payslip-selector-card">
        <div className="payslip-selector-left" style={{ flexWrap: 'wrap' }}>
          <label className="mp">
            <span>Chọn kỳ lương:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
            />
          </label>

          {isPrivileged && employeeOptions.length > 0 && (
            <label className="mp" style={{ marginLeft: '6px' }}>
              <UserCheck size={14} color="#0f766e" />
              <span>Nhân viên:</span>
              <select
                className="inp"
                style={{ minWidth: '220px' }}
                value={selectedEmpCode}
                onChange={(e) => handleEmpChange(e.target.value)}
              >
                <option value="">-- Phiếu lương của tôi --</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.EmployeeCode} value={emp.EmployeeCode}>
                    {emp.EmployeeCode} — {emp.FullName}
                  </option>
                ))}
              </select>
            </label>
          )}

          <span className={`badge ${isLocked ? 'b-green' : hasData ? 'b-amber' : 'b-red'}`}>
            {isLocked ? 'Đã chốt & Phát hành' : hasData ? 'Bản dự thảo (Chờ đối soát & Chốt sổ)' : 'Chưa có dữ liệu'}
          </span>
        </div>

        <div className="small muted">
          Tài khoản: <strong>{currentUser.name || currentUser.fullName || 'Người dùng'} ({currentUser.roleTitle || currentRole})</strong>
        </div>
      </div>

      {publishedPeriods.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            padding: '8px 14px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12.5px'
          }}
        >
          <span style={{ color: '#475569', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} color="#0f766e" />
            Kỳ lương đã phát hành:
          </span>
          {publishedPeriods.map((p) => (
            <button
              key={p.PeriodCode}
              type="button"
              onClick={() => handleMonthChange(p.PeriodCode)}
              className={`btn ${selectedMonth === p.PeriodCode ? 'pri' : ''}`}
              style={{ padding: '3px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <span>{p.PeriodCode}</span>
              <span
                style={{
                  fontSize: '10.5px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: p.IsLocked ? '#dcfce7' : '#fef3c7',
                  color: p.IsLocked ? '#15803d' : '#b45309'
                }}
              >
                {p.IsLocked ? 'Đã chốt' : 'Nháp'}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="payslip-main-card" style={{ textAlign: 'center', padding: '56px 24px', color: '#64748b' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '10px', color: '#0f766e' }} />
          <div>Đang đồng bộ phiếu lương từ CSDL bảng thanh toán lương...</div>
        </div>
      ) : !hasData ? (
        <div className="payslip-main-card" style={{ padding: '24px' }}>
          <EmptyState
            title={`Chưa có dữ liệu phiếu lương kỳ ${selectedMonth}`}
            description={
              isPrivileged
                ? `Nhân sự này chưa có hợp đồng lao động hiệu lực hoặc chưa được tổng hợp trong Bảng thanh toán lương kỳ ${selectedMonth}.`
                : `Tài khoản của bạn hiện chưa có hợp đồng lao động ở trạng thái Hiệu lực hoặc chưa được tổng hợp công trong kỳ ${selectedMonth}.`
            }
            icon={FileSpreadsheet}
            actionLabel={isPrivileged ? 'Mở Bảng thanh toán lương' : undefined}
            onAction={isPrivileged ? () => navigate('/finance/calc') : undefined}
          />
        </div>
      ) : (
        <div className="payslip-main-card">
          {!isLocked && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <span>
                <strong>Bản dự thảo đối soát:</strong> Bảng lương kỳ <strong>{selectedMonth}</strong> đang được Kế toán mở để bạn kiểm tra lại ngày công, giờ OT và phụ cấp trước khi chốt sổ. Nếu có sai sót, vui lòng bấm <strong>Phản hồi kỳ lương</strong>.
              </span>
            </div>
          )}
          <PayslipTemplate
            slip={payslipRes.slip}
            period={selectedMonth}
            config={payslipRes.config}
            isLocked={isLocked}
          />
        </div>
      )}

      {myFeedbacks.length > 0 && (
        <div className="payslip-main-card" style={{ padding: '18px 22px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
            Lịch sử phản hồi &amp; Tra soát kỳ lương {selectedMonth}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {myFeedbacks.map((fb) => (
              <div
                key={fb.FeedbackId}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>Gửi lúc: {fb.CreatedAt}</span>
                  <span
                    className={`badge ${
                      fb.Status === 'Đã xử lý' ? 'b-green' : fb.Status === 'Từ chối' ? 'b-red' : 'b-amber'
                    }`}
                  >
                    {fb.Status}
                  </span>
                </div>
                <div style={{ color: '#1e293b', fontWeight: 500 }}>{fb.Content}</div>
                {fb.AccountantReply && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: '#f0fdfa',
                      border: '1px solid #99f6e4',
                      borderRadius: '6px',
                      color: '#0f766e',
                      fontSize: '12.5px'
                    }}
                  >
                    <strong>Phản hồi từ Kế toán ({fb.HandledAt || ''}):</strong> {fb.AccountantReply}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isDisputeOpen && (
        <div className="payslip-modal-overlay" onClick={() => setIsDisputeOpen(false)}>
          <div className="payslip-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="payslip-modal-header">
              <h2>Phản hồi / Tra soát kỳ lương {selectedMonth}</h2>
              <button className="btn-close-modal" onClick={() => setIsDisputeOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSendDispute}>
              <div className="payslip-modal-body">
                {disputeSent ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#15803d' }}>
                    <CheckCircle2 size={36} style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700 }}>Đã gửi phản hồi tới Bộ phận Kế toán tiền lương!</div>
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Nội dung cần tra soát (Ngày công, OT, Phụ cấp, Thuế TNCN...):
                    </label>
                    <textarea
                      rows="4"
                      className="inp"
                      style={{ width: '100%' }}
                      placeholder="Nhập chi tiết thắc mắc của bạn..."
                      value={disputeText}
                      onChange={(e) => setDisputeText(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
              {!disputeSent && (
                <div className="payslip-modal-footer">
                  <button type="button" className="btn" onClick={() => setIsDisputeOpen(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn pri">
                    <Send size={14} />
                    <span>Gửi phản hồi</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
