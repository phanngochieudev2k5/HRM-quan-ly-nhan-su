import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileSpreadsheet, Printer, Search, CheckCircle2, Lock, Unlock,
  Eye, X, RefreshCw, Settings, Save, AlertTriangle, Calendar, MessageSquare
} from 'lucide-react';
import PayrollService from '../../../services/PayrollService';
import PayslipTemplate from '../../../components/common/PayslipTemplate';
import '../../../styles/roles/finance/PayrollCalculationView.css';
import '../../../styles/roles/finance/PayrollModalOverlay.css';

const DEFAULT_PERIOD = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function PayrollCalculationDynamic() {
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [deptFilter, setDeptFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [payrollData, setPayrollData] = useState({
    periodCode: DEFAULT_PERIOD(),
    periodName: '',
    isLocked: false,
    periodInfo: null,
    config: {
      congChuan: 26,
      gioCong: 8,
      luongCoSo: 2530000,
      ltVung: 5310000,
      bhxhNLD: 8,
      bhytNLD: 1.5,
      bhtnNLD: 1,
      bhxhDN: 17.5,
      bhytDN: 3,
      bhtnDN: 1,
      kpcdDN: 2,
      gtBanThan: 15500000,
      gtNPT: 6200000
    },
    salaryComponents: [],
    rows: [],
    summary: {}
  });

  const [savedPeriods, setSavedPeriods] = useState([]);
  const [draftEdits, setDraftEdits] = useState({});
  const [viewingSlip, setViewingSlip] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configForm, setConfigForm] = useState(null);
  const [toast, setToast] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [replyMap, setReplyMap] = useState({});

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const formatMoney = (n) => Math.round(+n || 0).toLocaleString('vi-VN');
  const formatVND = (n) => formatMoney(n) + ' đ';

  const loadPeriods = useCallback(async () => {
    try {
      const list = await PayrollService.getPeriods();
      setSavedPeriods(Array.isArray(list) ? list : []);
    } catch {
      // Ignore silent list fetch error
    }
  }, []);

  const loadPayroll = useCallback(async (targetPeriod = period) => {
    try {
      setLoading(true);
      const data = await PayrollService.getPayrollPreview({ period: targetPeriod });
      if (data) {
        setPayrollData(data);
        setConfigForm(data.config);
        const initEdits = {};
        (data.rows || []).forEach((r) => {
          initEdits[r.EmployeeId] = {
            manualWorkDays: r.ManualWorkDays !== null && r.ManualWorkDays !== undefined ? r.ManualWorkDays : '',
            bonusAmount: r.BonusAmount || 0,
            advanceAmount: r.AdvanceAmount || 0,
            otherDeduction: r.OtherDeduction || 0,
            note: r.Note || ''
          };
        });
        setDraftEdits(initEdits);
      }
    } catch (err) {
      showToast('error', err.message || 'Không thể tải dữ liệu bảng lương từ máy chủ!');
    } finally {
      setLoading(false);
    }
  }, [period]);

  const loadFeedbacks = useCallback(async (targetPeriod = period) => {
    try {
      const list = await PayrollService.getAllFeedbacks({ period: targetPeriod });
      setFeedbacks(Array.isArray(list) ? list : []);
    } catch {
      // Ignore silent fetch error
    }
  }, [period]);

  useEffect(() => {
    loadPayroll(period);
    loadPeriods();
    loadFeedbacks(period);
  }, [period, loadPayroll, loadPeriods, loadFeedbacks]);

  const pendingFeedbackCount = useMemo(
    () => feedbacks.filter((f) => f.Status === 'Chờ xử lý').length,
    [feedbacks]
  );

  const handleResolveFeedback = async (fb, status) => {
    try {
      setSaving(true);
      const replyText =
        replyMap[fb.FeedbackId] ||
        (status === 'Đã xử lý'
          ? `Đã kiểm tra và cập nhật lại số liệu bảng lương kỳ ${fb.PeriodCode}.`
          : 'Số liệu bảng công & lương đã được đối soát chính xác theo hệ thống.');
      await PayrollService.resolveFeedback(fb.FeedbackId, {
        status,
        accountantReply: replyText
      });
      await loadFeedbacks(period);
      showToast('success', `Đã phản hồi & cập nhật trạng thái cho ${fb.FullName} (${fb.EmployeeCode})!`);
    } catch (err) {
      showToast('error', err.message || 'Lỗi xử lý phản hồi!');
    } finally {
      setSaving(false);
    }
  };

  const rows = payrollData.rows || [];
  const isLocked = Boolean(payrollData.isLocked);

  const departments = useMemo(() => {
    return [...new Set(rows.map((r) => r.DepartmentName).filter(Boolean))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchDept = !deptFilter || r.DepartmentName === deptFilter;
      const matchSearch =
        !cleanSearch ||
        (r.FullName || '').toLowerCase().includes(cleanSearch) ||
        (r.EmployeeCode || '').toLowerCase().includes(cleanSearch);
      return matchDept && matchSearch;
    });
  }, [rows, deptFilter, searchTerm]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, cur) => {
        acc.actualBase += cur.ActualBaseSalary || 0;
        acc.taxableAllowance += cur.TaxableAllowance || 0;
        acc.nonTaxableAllowance += cur.NonTaxableAllowance || 0;
        acc.overtimeHours += cur.OvertimeHours || 0;
        acc.overtimePay += cur.OvertimePay || 0;
        acc.bonus += cur.BonusAmount || 0;
        acc.gross += cur.TotalGrossSalary || 0;
        acc.bhxh += cur.BhxhDeduction || 0;
        acc.bhyt += cur.BhytDeduction || 0;
        acc.bhtn += cur.BhtnDeduction || 0;
        acc.totalInsurance += cur.TotalInsuranceNLD || 0;
        acc.tax += cur.PersonalIncomeTax || 0;
        acc.advance += cur.AdvanceAmount || 0;
        acc.otherDeduction += cur.OtherDeduction || 0;
        acc.net += cur.NetSalary || 0;
        acc.companyCost += cur.TotalCompanyCost || 0;
        return acc;
      },
      {
        actualBase: 0,
        taxableAllowance: 0,
        nonTaxableAllowance: 0,
        overtimeHours: 0,
        overtimePay: 0,
        bonus: 0,
        gross: 0,
        bhxh: 0,
        bhyt: 0,
        bhtn: 0,
        totalInsurance: 0,
        tax: 0,
        advance: 0,
        otherDeduction: 0,
        net: 0,
        companyCost: 0
      }
    );
  }, [filteredRows]);

  const handleEditField = (empId, field, value) => {
    if (isLocked) return;
    setDraftEdits((prev) => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [field]: value
      }
    }));
  };

  const handlePersistAdjustment = async (empId) => {
    if (isLocked) return;
    const adj = draftEdits[empId];
    if (!adj) return;
    try {
      const updated = await PayrollService.saveAdjustment({
        periodCode: payrollData.periodCode || period,
        employeeId: empId,
        manualWorkDays: adj.manualWorkDays === '' ? null : Number(adj.manualWorkDays),
        bonusAmount: Number(adj.bonusAmount) || 0,
        advanceAmount: Number(adj.advanceAmount) || 0,
        otherDeduction: Number(adj.otherDeduction) || 0,
        note: adj.note || ''
      });
      if (updated) {
        setPayrollData(updated);
      }
    } catch (err) {
      showToast('error', err.message || 'Lỗi lưu điều chỉnh lương!');
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await PayrollService.calculateAndSaveDraft({
        period,
        standardWorkDays: payrollData.config?.congChuan
      });
      if (res) setPayrollData(res);
      await loadPeriods();
      showToast('success', `Đã tổng hợp & lưu nháp bảng lương kỳ ${period} vào CSDL để kiểm tra!`);
    } catch (err) {
      showToast('error', err.message || 'Lỗi lưu nháp bảng lương!');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLock = async () => {
    if (isLocked) {
      if (!window.confirm(`Bạn có chắc chắn muốn mở khóa bảng lương kỳ ${period} để chỉnh sửa lại?`)) return;
      try {
        setSaving(true);
        const res = await PayrollService.unlockPeriod({ period });
        if (res) setPayrollData(res);
        await loadPeriods();
        showToast('success', `Đã mở khóa bảng lương kỳ ${period}!`);
      } catch (err) {
        showToast('error', err.message || 'Không thể mở khóa bảng lương!');
      } finally {
        setSaving(false);
      }
    } else {
      if (
        !window.confirm(
          `Xác nhận CHỐT & KHÓA SỔ bảng lương kỳ ${period}?\nSau khi chốt, số liệu sẽ được lưu cố định vào CSDL và không thể chỉnh sửa.`
        )
      ) {
        return;
      }
      try {
        setSaving(true);
        const res = await PayrollService.lockPeriod({
          period,
          standardWorkDays: payrollData.config?.congChuan
        });
        if (res) setPayrollData(res);
        await loadPeriods();
        showToast('success', `Đã chốt và lưu chính thức bảng lương kỳ ${period}!`);
      } catch (err) {
        showToast('error', err.message || 'Không thể chốt bảng lương!');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await PayrollService.updateConfig(configForm);
      setIsConfigOpen(false);
      await loadPayroll(period);
      showToast('success', 'Đã lưu cấu hình công thức tính lương và tính lại toàn bộ bảng lương!');
    } catch (err) {
      showToast('error', err.message || 'Lỗi lưu cấu hình công thức!');
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    if (!filteredRows.length) {
      showToast('error', 'Không có dữ liệu bảng lương để xuất Excel!');
      return;
    }

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th { background: #0f766e; color: #fff; border: 1px solid #94a3b8; padding: 8px; }
        td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 12px; }
        .num { text-align: right; }
      </style></head><body>
      <h2 style="text-align:center;">BẢNG THANH TOÁN TIỀN LƯƠNG KỲ ${period}</h2>
      <table>
        <thead>
          <tr>
            <th>STT</th><th>Mã NV</th><th>Họ và tên</th><th>Phòng ban</th>
            <th>Lương CB</th><th>Công</th><th>Lương theo công</th><th>Phụ cấp</th>
            <th>Giờ OT</th><th>Tiền OT</th><th>Thưởng</th><th>Tổng Gross</th>
            <th>BHXH/YT/TN</th><th>Thuế TNCN</th><th>Tạm ứng</th><th>Khấu trừ</th><th>Thực lĩnh</th>
          </tr>
        </thead><tbody>
    `;

    filteredRows.forEach((r, idx) => {
      html += `
        <tr>
          <td>${idx + 1}</td><td>${r.EmployeeCode}</td><td>${r.FullName}</td><td>${r.DepartmentName}</td>
          <td class="num">${formatMoney(r.BaseSalary)}</td>
          <td class="num">${r.ActualWorkDays}</td>
          <td class="num">${formatMoney(r.ActualBaseSalary)}</td>
          <td class="num">${formatMoney(r.TotalAllowance)}</td>
          <td class="num">${r.OvertimeHours}</td>
          <td class="num">${formatMoney(r.OvertimePay)}</td>
          <td class="num">${formatMoney(r.BonusAmount)}</td>
          <td class="num"><b>${formatMoney(r.TotalGrossSalary)}</b></td>
          <td class="num">${formatMoney(r.TotalInsuranceNLD)}</td>
          <td class="num">${formatMoney(r.PersonalIncomeTax)}</td>
          <td class="num">${formatMoney(r.AdvanceAmount)}</td>
          <td class="num">${formatMoney(r.OtherDeduction)}</td>
          <td class="num"><b>${formatMoney(r.NetSalary)}</b></td>
        </tr>
      `;
    });

    html += `</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bang_luong_${period}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', `Đã xuất file Excel Bang_luong_${period}.xls`);
  };

  const numberToWords = (num) => {
    const n = Math.round(Math.abs(+num || 0));
    if (!n) return 'Không đồng';
    const c = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const u = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ'];
    const r3 = (x, full) => {
      const t = Math.floor(x / 100),
        ch = Math.floor((x % 100) / 10),
        d = x % 10;
      let s = '';
      if (full || t > 0) s += c[t] + ' trăm';
      if (ch > 1) {
        s += ' ' + c[ch] + ' mươi';
        if (d === 1) s += ' mốt';
        else if (d === 5) s += ' lăm';
        else if (d > 0) s += ' ' + c[d];
      } else if (ch === 1) {
        s += ' mười';
        if (d === 5) s += ' lăm';
        else if (d > 0) s += ' ' + c[d];
      } else if (d > 0) {
        if (full || t > 0) s += ' lẻ';
        s += ' ' + c[d];
      }
      return s.trim();
    };
    const g = [];
    let t = n;
    while (t > 0) {
      g.push(t % 1000);
      t = Math.floor(t / 1000);
    }
    const out = [];
    for (let i = g.length - 1; i >= 0; i--) {
      if (g[i] === 0) continue;
      out.push(r3(g[i], i !== g.length - 1) + u[i]);
    }
    const s = out.join(' ').replace(/\s+/g, ' ').trim();
    return s.charAt(0).toUpperCase() + s.slice(1) + ' đồng';
  };

  return (
    <div className="payroll-view-container">
      {toast && (
        <div
          className={`badge ${toast.type === 'success' ? 'b-green' : 'b-red'}`}
          style={{
            padding: '10px 16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '8px',
            marginBottom: '12px'
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="ph">
        <div>
          <h1>Bảng thanh toán tiền lương</h1>
          <p>
            Tổng hợp công chấm công, tăng ca (OT) đã duyệt, phụ cấp &amp; khấu trừ theo công thức cấu hình từ CSDL
          </p>
        </div>
        <div className="ph-tools">
          <button
            className="btn"
            onClick={() => loadPayroll(period)}
            disabled={loading || saving}
            title="Tổng hợp lại dữ liệu công & OT mới nhất từ CSDL"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Đồng bộ công &amp; OT</span>
          </button>

          <button
            className="btn"
            onClick={() => {
              loadFeedbacks(period);
              setIsFeedbackModalOpen(true);
            }}
            style={{ position: 'relative' }}
            title="Xem & xử lý phản hồi tra soát lương từ nhân viên"
          >
            <MessageSquare size={15} color={pendingFeedbackCount > 0 ? '#d97706' : '#0f766e'} />
            <span>Phản hồi NV</span>
            {pendingFeedbackCount > 0 && (
              <span
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '1px 6px',
                  marginLeft: '4px'
                }}
              >
                {pendingFeedbackCount}
              </span>
            )}
          </button>

          <button
            className="btn"
            onClick={() => {
              setConfigForm({ ...payrollData.config });
              setIsConfigOpen(true);
            }}
            disabled={isLocked}
            title="Cấu hình công thức tính lương"
          >
            <Settings size={15} />
            <span>Công thức</span>
          </button>

          {!isLocked && (
            <button
              className="btn"
              onClick={handleSaveDraft}
              disabled={loading || saving}
              title="Lưu bản kiểm tra dự thảo vào CSDL trước khi chốt"
            >
              <Save size={15} color="#0f766e" />
              <span>Lưu nháp kiểm tra</span>
            </button>
          )}

          <button
            className={`btn ${isLocked ? 'danger' : 'pri'}`}
            onClick={handleToggleLock}
            disabled={loading || saving}
          >
            {isLocked ? <Unlock size={15} /> : <Lock size={15} />}
            <span>{isLocked ? 'Mở khóa bảng lương' : 'Chốt bảng lương'}</span>
          </button>

          <button className="btn" onClick={handleExportExcel} title="Xuất file Excel">
            <FileSpreadsheet size={15} color="#16a34a" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Thanh chọn nhanh các kỳ lương đã lưu */}
      {savedPeriods.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '12px',
            padding: '8px 14px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12.5px'
          }}
        >
          <span style={{ color: '#475569', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} color="#0f766e" />
            Kỳ lương đã lưu:
          </span>
          {savedPeriods.map((p) => (
            <button
              key={p.PeriodCode}
              type="button"
              onClick={() => setPeriod(p.PeriodCode)}
              className={`btn ${period === p.PeriodCode ? 'pri' : ''}`}
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

      <div className="payroll-toolbar-card">
        <div className="payroll-toolbar-left">
          <label className="mp">
            <span>Kỳ lương:</span>
            <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
          </label>
          <select className="inp" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">Tất cả phòng ban</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <div className="search">
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo mã hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className={`badge ${isLocked ? 'b-green' : payrollData.periodInfo ? 'b-blue' : 'b-amber'}`}>
            {isLocked ? 'Đã khóa sổ' : payrollData.periodInfo ? 'Đã lưu nháp' : 'Dự thảo trực tiếp'}
          </span>
        </div>

        <div className="payroll-toolbar-right">
          <div className="payroll-summary-item">
            <span>Nhân sự:</span>
            <strong>{filteredRows.length} người</strong>
          </div>
          <div className="payroll-summary-item">
            <span>Tổng Gross:</span>
            <strong>{formatVND(totals.gross)}</strong>
          </div>
          <div className="payroll-summary-item">
            <span>Tổng Thực lĩnh:</span>
            <strong className="highlight">{formatVND(totals.net)}</strong>
          </div>
          <div className="payroll-summary-item">
            <span>Tổng chi phí DN:</span>
            <strong>{formatVND(totals.companyCost)}</strong>
          </div>
        </div>
      </div>

      <div className="payroll-table-card">
        <div className="payroll-table-scroll-container">
          <table className="payroll-table">
            <thead>
              <tr>
                <th className="stk-col stk-col-0 text-center-col" rowSpan="2">
                  STT
                </th>
                <th className="stk-col stk-col-1" rowSpan="2">
                  MÃ NV
                </th>
                <th className="stk-col stk-col-2 text-left-col" rowSpan="2">
                  HỌ VÀ TÊN
                </th>
                <th className="text-left-col" rowSpan="2">
                  PHÒNG BAN
                </th>
                <th rowSpan="2">LƯƠNG CƠ BẢN</th>
                <th colSpan="8" className="grp-header">
                  CÁC KHOẢN THU NHẬP &amp; TỔNG HỢP CÔNG / OT
                </th>
                <th colSpan="4" className="grp-header">
                  BẢO HIỂM NLĐ ({payrollData.config.bhxhNLD + payrollData.config.bhytNLD + payrollData.config.bhtnNLD}%)
                </th>
                <th colSpan="2" className="grp-header">
                  THUẾ THU NHẬP CÁ NHÂN
                </th>
                <th colSpan="2" className="grp-header">
                  KHẤU TRỪ KHÁC
                </th>
                <th rowSpan="2" className="grp-header" style={{ minWidth: '125px' }}>
                  THỰC LĨNH
                </th>
                <th rowSpan="2" className="text-center-col">
                  PHIẾU
                </th>
              </tr>
              <tr>
                <th title="Công chấm công + Nghỉ phép hưởng lương (Có thể điều chỉnh)">CÔNG TÍNH LƯƠNG</th>
                <th>LƯƠNG THEO CÔNG</th>
                <th>PC CHỊU THUẾ</th>
                <th>PC MIỄN THUẾ</th>
                <th title="Tổng giờ OT đã được quản lý duyệt">GIỜ OT DUYỆT</th>
                <th>TIỀN OT</th>
                <th>THƯỞNG</th>
                <th>TỔNG GROSS</th>
                <th>LƯƠNG ĐÓNG BH</th>
                <th>BHXH ({payrollData.config.bhxhNLD}%)</th>
                <th>BHYT ({payrollData.config.bhytNLD}%)</th>
                <th>BHTN ({payrollData.config.bhtnNLD}%)</th>
                <th>TN TÍNH THUẾ</th>
                <th>THUẾ TNCN</th>
                <th>TẠM ỨNG</th>
                <th>KHẤU TRỪ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="23" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <RefreshCw size={20} className="spin" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Đang tổng hợp dữ liệu chấm công, tăng ca và hợp đồng từ SQL Server...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="23" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    Không tìm thấy dữ liệu nhân viên cho kỳ lương này.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, index) => {
                  const edit = draftEdits[r.EmployeeId] || {};
                  return (
                    <tr key={r.EmployeeId}>
                      <td className="stk-col stk-col-0 text-center-col">{index + 1}</td>
                      <td className="stk-col stk-col-1 emp-code">{r.EmployeeCode}</td>
                      <td className="stk-col stk-col-2 text-left-col emp-name" title={r.PositionName}>
                        {r.FullName}
                      </td>
                      <td className="text-left-col">{r.DepartmentName}</td>
                      <td>{formatMoney(r.BaseSalary)}</td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="31"
                            className="payroll-num-input"
                            style={{ width: '64px' }}
                            disabled={isLocked}
                            placeholder={String(r.ActualWorkDays)}
                            value={edit.manualWorkDays !== undefined ? edit.manualWorkDays : ''}
                            onChange={(e) => handleEditField(r.EmployeeId, 'manualWorkDays', e.target.value)}
                            onBlur={() => handlePersistAdjustment(r.EmployeeId)}
                            title={`Chấm công: ${r.AttendanceWorkDays} | Phép hưởng lương: ${r.PaidLeaveDays}`}
                          />
                          <span style={{ fontSize: '10px', color: '#64748b' }}>
                            CC:{r.AttendanceWorkDays} | P:{r.PaidLeaveDays}
                          </span>
                        </div>
                      </td>

                      <td>{formatMoney(r.ActualBaseSalary)}</td>
                      <td>{formatMoney(r.TaxableAllowance)}</td>
                      <td>{formatMoney(r.NonTaxableAllowance)}</td>

                      <td>
                        <span
                          className="badge b-blue"
                          style={{ fontSize: '11px', padding: '2px 6px' }}
                          title="Tổng giờ tăng ca đã phê duyệt trong tháng"
                        >
                          {r.OvertimeHours}h
                        </span>
                      </td>
                      <td style={{ color: '#0f766e', fontWeight: 600 }}>{formatMoney(r.OvertimePay)}</td>

                      <td>
                        <input
                          type="number"
                          step="100000"
                          className="payroll-num-input"
                          style={{ width: '90px' }}
                          disabled={isLocked}
                          value={edit.bonusAmount ?? r.BonusAmount}
                          onChange={(e) => handleEditField(r.EmployeeId, 'bonusAmount', e.target.value)}
                          onBlur={() => handlePersistAdjustment(r.EmployeeId)}
                        />
                      </td>

                      <td style={{ fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}>
                        {formatMoney(r.TotalGrossSalary)}
                      </td>

                      <td>{formatMoney(r.InsuranceSalary)}</td>
                      <td>{formatMoney(r.BhxhDeduction)}</td>
                      <td>{formatMoney(r.BhytDeduction)}</td>
                      <td>{formatMoney(r.BhtnDeduction)}</td>

                      <td>{formatMoney(r.TaxableIncome)}</td>
                      <td style={{ color: '#b45309', fontWeight: 600 }}>{formatMoney(r.PersonalIncomeTax)}</td>

                      <td>
                        <input
                          type="number"
                          step="100000"
                          className="payroll-num-input"
                          style={{ width: '85px' }}
                          disabled={isLocked}
                          value={edit.advanceAmount ?? r.AdvanceAmount}
                          onChange={(e) => handleEditField(r.EmployeeId, 'advanceAmount', e.target.value)}
                          onBlur={() => handlePersistAdjustment(r.EmployeeId)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="50000"
                          className="payroll-num-input"
                          style={{ width: '85px' }}
                          disabled={isLocked}
                          value={edit.otherDeduction ?? r.OtherDeduction}
                          onChange={(e) => handleEditField(r.EmployeeId, 'otherDeduction', e.target.value)}
                          onBlur={() => handlePersistAdjustment(r.EmployeeId)}
                        />
                      </td>

                      <td style={{ fontWeight: 800, color: '#0f766e', background: '#f0fdfa', fontSize: '13px' }}>
                        {formatMoney(r.NetSalary)}
                      </td>

                      <td className="text-center-col">
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => setViewingSlip(r)}
                          title="Xem chi tiết phiếu lương"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredRows.length > 0 && (
              <tfoot>
                <tr className="payroll-total-row">
                  <td className="stk-col stk-col-0"></td>
                  <td className="stk-col stk-col-1"></td>
                  <td className="stk-col stk-col-2 text-left-col">TỔNG CỘNG ({filteredRows.length} NV)</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>{formatMoney(totals.actualBase)}</td>
                  <td>{formatMoney(totals.taxableAllowance)}</td>
                  <td>{formatMoney(totals.nonTaxableAllowance)}</td>
                  <td>{totals.overtimeHours}h</td>
                  <td>{formatMoney(totals.overtimePay)}</td>
                  <td>{formatMoney(totals.bonus)}</td>
                  <td>{formatMoney(totals.gross)}</td>
                  <td></td>
                  <td>{formatMoney(totals.bhxh)}</td>
                  <td>{formatMoney(totals.bhyt)}</td>
                  <td>{formatMoney(totals.bhtn)}</td>
                  <td></td>
                  <td>{formatMoney(totals.tax)}</td>
                  <td>{formatMoney(totals.advance)}</td>
                  <td>{formatMoney(totals.otherDeduction)}</td>
                  <td style={{ color: '#0f766e', fontSize: '13.5px' }}>{formatMoney(totals.net)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal Cấu hình Công thức Tính lương */}
      {isConfigOpen && configForm && (
        <div className="payslip-modal-overlay" onClick={() => setIsConfigOpen(false)}>
          <div className="payslip-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="payslip-modal-header">
              <h2>
                <Settings size={18} color="#0f766e" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Cấu hình Công thức Tính lương Kỳ {period}
              </h2>
              <button className="btn-close-modal" onClick={() => setIsConfigOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveConfig}>
              <div className="payslip-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Ngày công chuẩn / tháng</label>
                  <input
                    type="number"
                    className="inp"
                    style={{ width: '100%', marginTop: '4px' }}
                    value={configForm.congChuan}
                    onChange={(e) => setConfigForm({ ...configForm, congChuan: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Số giờ làm việc / ngày</label>
                  <input
                    type="number"
                    className="inp"
                    style={{ width: '100%', marginTop: '4px' }}
                    value={configForm.gioCong}
                    onChange={(e) => setConfigForm({ ...configForm, gioCong: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Lương cơ sở (VNĐ)</label>
                  <input
                    type="number"
                    className="inp"
                    style={{ width: '100%', marginTop: '4px' }}
                    value={configForm.luongCoSo}
                    onChange={(e) => setConfigForm({ ...configForm, luongCoSo: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>BHXH NLĐ (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="inp"
                    style={{ width: '100%', marginTop: '4px' }}
                    value={configForm.bhxhNLD}
                    onChange={(e) => setConfigForm({ ...configForm, bhxhNLD: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>BHYT NLĐ (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="inp"
                    style={{ width: '100%', marginTop: '4px' }}
                    value={configForm.bhytNLD}
                    onChange={(e) => setConfigForm({ ...configForm, bhytNLD: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>BHTN NLĐ (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="inp"
                    style={{ width: '100%', marginTop: '4px' }}
                    value={configForm.bhtnNLD}
                    onChange={(e) => setConfigForm({ ...configForm, bhtnNLD: Number(e.target.value) })}
                  />
                </div>

                {payrollData.salaryComponents?.length > 0 && (
                  <div style={{ gridColumn: '1 / -1', marginTop: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Thành phần lương đang cấu hình trong CSDL (tblSalaryComponent):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {payrollData.salaryComponents.map((c) => (
                        <span key={c.ComponentId} className="badge b-blue" style={{ fontSize: '11.5px' }}>
                          {c.ComponentName}: {c.DefaultAmount > 0 ? formatVND(c.DefaultAmount) : `${c.PercentageRate}%`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="payslip-modal-footer">
                <button type="button" className="btn" onClick={() => setIsConfigOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn pri" disabled={saving}>
                  <Save size={15} />
                  <span>Lưu công thức &amp; Tính lại lương</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Phiếu Lương Chi Tiết (Đồng bộ mẫu Phiếu lương cá nhân) */}
      {viewingSlip && (
        <div className="payslip-modal-overlay" onClick={() => setViewingSlip(null)}>
          <div
            className="payslip-modal"
            style={{ maxWidth: '940px', width: '95vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payslip-modal-header">
              <h2>
                Phiếu lương chi tiết — {viewingSlip.FullName} ({viewingSlip.EmployeeCode}) — Kỳ {period}
              </h2>
              <button className="btn-close-modal" onClick={() => setViewingSlip(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="payslip-modal-body" style={{ overflowY: 'auto', padding: '24px 28px' }}>
              <PayslipTemplate
                slip={viewingSlip}
                period={period}
                config={payrollData.config}
                isLocked={isLocked}
              />
            </div>
            <div className="payslip-modal-footer">
              <button type="button" className="btn" onClick={() => window.print()}>
                <Printer size={15} />
                <span>In phiếu lương</span>
              </button>
              <button type="button" className="btn pri" onClick={() => setViewingSlip(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hộp thư Phản hồi & Tra soát Lương từ Nhân viên */}
      {isFeedbackModalOpen && (
        <div className="payslip-modal-overlay" onClick={() => setIsFeedbackModalOpen(false)}>
          <div
            className="payslip-modal"
            style={{ maxWidth: '820px', width: '95vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payslip-modal-header">
              <h2>
                <MessageSquare size={18} color="#0f766e" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Phản hồi &amp; Tra soát Kỳ lương {period} ({feedbacks.length})
              </h2>
              <button className="btn-close-modal" onClick={() => setIsFeedbackModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="payslip-modal-body" style={{ overflowY: 'auto', padding: '18px 22px' }}>
              {feedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  Chưa có phản hồi hoặc yêu cầu tra soát nào từ nhân viên trong kỳ {period}.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.FeedbackId}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        background: fb.Status === 'Chờ xử lý' ? '#fffbeb' : '#f8fafc'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#0f172a', fontSize: '14px' }}>{fb.FullName}</strong>
                          <span className="badge b-blue">{fb.EmployeeCode}</span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {fb.DepartmentName || ''} · {fb.CreatedAt}
                          </span>
                        </div>
                        <span
                          className={`badge ${
                            fb.Status === 'Đã xử lý' ? 'b-green' : fb.Status === 'Từ chối' ? 'b-red' : 'b-amber'
                          }`}
                        >
                          {fb.Status}
                        </span>
                      </div>

                      <div style={{ fontSize: '13.5px', color: '#1e293b', background: '#fff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                        {fb.Content}
                      </div>

                      {fb.AccountantReply && (
                        <div style={{ fontSize: '12.5px', color: '#0f766e', marginBottom: '8px' }}>
                          <strong>Kế toán đã phản hồi:</strong> {fb.AccountantReply} ({fb.HandledAt || ''})
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                          onClick={() => {
                            setSearchTerm(fb.EmployeeCode);
                            setIsFeedbackModalOpen(false);
                            showToast('success', `Đã lọc nhân viên ${fb.FullName} (${fb.EmployeeCode}) để kiểm tra và cập nhật số liệu!`);
                          }}
                        >
                          <Search size={13} />
                          <span>Kiểm tra &amp; Cập nhật lương</span>
                        </button>

                        {fb.Status === 'Chờ xử lý' && (
                          <>
                            <input
                              type="text"
                              className="inp"
                              style={{ flex: 1, minWidth: '200px', fontSize: '12.5px' }}
                              placeholder="Nhập nội dung phản hồi lại cho nhân viên..."
                              value={replyMap[fb.FeedbackId] || ''}
                              onChange={(e) => setReplyMap((prev) => ({ ...prev, [fb.FeedbackId]: e.target.value }))}
                            />
                            <button
                              type="button"
                              className="btn pri"
                              style={{ fontSize: '12px', padding: '5px 12px' }}
                              disabled={saving}
                              onClick={() => handleResolveFeedback(fb, 'Đã xử lý')}
                            >
                              <CheckCircle2 size={13} />
                              <span>Đã cập nhật &amp; Phản hồi</span>
                            </button>
                            <button
                              type="button"
                              className="btn"
                              style={{ fontSize: '12px', padding: '5px 10px', color: '#dc2626', borderColor: '#fca5a5' }}
                              disabled={saving}
                              onClick={() => handleResolveFeedback(fb, 'Từ chối')}
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="payslip-modal-footer">
              <button type="button" className="btn pri" onClick={() => setIsFeedbackModalOpen(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
