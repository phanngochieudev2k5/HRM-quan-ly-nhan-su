import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet, Printer, Search, Download,
  CheckCircle2, Lock, Unlock, Eye, X, RefreshCw
} from 'lucide-react';
import '../../../styles/roles/finance/PayrollCalculationView.css';

const DEFAULT_SETTINGS = {
  congChuan: 26,
  gioCong: 8,
  heSoOT: 1.5,
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
  gtNPT: 6200000,
  bac: [
    { den: 10000000, ts: 5 },
    { den: 30000000, ts: 10 },
    { den: 60000000, ts: 20 },
    { den: 100000000, ts: 30 },
    { den: Infinity, ts: 35 }
  ]
};

const INITIAL_EMPLOYEES = [
  { id: 'NV001', ma: 'NV001', ten: 'Nguyễn Văn A', phongBan: 'Ban Giám Đốc', chucVu: 'Giám đốc', luongCB: 45000000, luongBH: 45000000, pcChiuThue: 5000000, pcKhongThue: 730000, pcChuyenCan: 0, pcThamNien: 0, pcXangXe: 1000000, dgSanLuong: 0, soNPT: 1, mst: '8029381729', stk: '19036789123456', nganHang: 'Techcombank' },
  { id: 'NV002', ma: 'NV002', ten: 'Trần Thị Bích', phongBan: 'Khối Kỹ Thuật (IT)', chucVu: 'Senior Fullstack Lead', luongCB: 32000000, luongBH: 32000000, pcChiuThue: 2000000, pcKhongThue: 730000, pcChuyenCan: 500000, pcThamNien: 200000, pcXangXe: 500000, dgSanLuong: 0, soNPT: 0, mst: '8492019284', stk: '102839485712', nganHang: 'Vietcombank' },
  { id: 'NV003', ma: 'NV003', ten: 'Lê Hoàng Long', phongBan: 'Khối Kỹ Thuật (IT)', chucVu: 'Backend Developer', luongCB: 22000000, luongBH: 22000000, pcChiuThue: 1000000, pcKhongThue: 730000, pcChuyenCan: 500000, pcThamNien: 100000, pcXangXe: 500000, dgSanLuong: 0, soNPT: 1, mst: '8719283719', stk: '045100039281', nganHang: 'Vietcombank' },
  { id: 'NV004', ma: 'NV004', ten: 'Phạm Minh Đức', phongBan: 'Phòng Kế Toán', chucVu: 'Kế toán trưởng', luongCB: 24000000, luongBH: 24000000, pcChiuThue: 2500000, pcKhongThue: 730000, pcChuyenCan: 500000, pcThamNien: 300000, pcXangXe: 500000, dgSanLuong: 0, soNPT: 2, mst: '8129384712', stk: '190333444555', nganHang: 'Techcombank' },
  { id: 'NV005', ma: 'NV005', ten: 'Vũ Thị Hoa', phongBan: 'Phòng Nhân Sự', chucVu: 'Chuyên viên C&B', luongCB: 16000000, luongBH: 16000000, pcChiuThue: 800000, pcKhongThue: 730000, pcChuyenCan: 500000, pcThamNien: 100000, pcXangXe: 300000, dgSanLuong: 0, soNPT: 0, mst: '8291029381', stk: '215100012398', nganHang: 'BIDV' },
  { id: 'NV006', ma: 'NV006', ten: 'Đỗ Gia Huy', phongBan: 'Khối Sản Xuất', chucVu: 'Tổ trưởng sản xuất', luongCB: 13000000, luongBH: 13000000, pcChiuThue: 1000000, pcKhongThue: 730000, pcChuyenCan: 500000, pcThamNien: 150000, pcXangXe: 300000, dgSanLuong: 6000, soNPT: 1, mst: '8392019283', stk: '109827364512', nganHang: 'VietinBank' },
  { id: 'NV007', ma: 'NV007', ten: 'Hoàng Quốc Bảo', phongBan: 'Khối Kinh Doanh', chucVu: 'Trưởng nhóm kinh doanh', luongCB: 18000000, luongBH: 18000000, pcChiuThue: 2000000, pcKhongThue: 730000, pcChuyenCan: 500000, pcThamNien: 200000, pcXangXe: 1000000, dgSanLuong: 0, soNPT: 0, mst: '8491029384', stk: '007100019283', nganHang: 'Vietcombank' }
];

const INITIAL_EXTRA = {
  NV001: { cong: 26, ot: 0, slSP: 0, dgSP: 0, thuong: 10000000, tamUng: 0, khauTru: 0 },
  NV002: { cong: 25.5, ot: 12, slSP: 0, dgSP: 0, thuong: 3000000, tamUng: 0, khauTru: 0 },
  NV003: { cong: 26, ot: 8, slSP: 0, dgSP: 0, thuong: 1500000, tamUng: 2000000, khauTru: 0 },
  NV004: { cong: 26, ot: 4, slSP: 0, dgSP: 0, thuong: 2000000, tamUng: 0, khauTru: 0 },
  NV005: { cong: 24.5, ot: 0, slSP: 0, dgSP: 0, thuong: 1000000, tamUng: 0, khauTru: 0 },
  NV006: { cong: 26, ot: 18, slSP: 1250, dgSP: 6000, thuong: 2000000, tamUng: 1500000, khauTru: 0 },
  NV007: { cong: 25, ot: 6, slSP: 0, dgSP: 0, thuong: 8500000, tamUng: 0, khauTru: 0 }
};

export default function PayrollCalculationView() {
  const [period, setPeriod] = useState('2026-04');
  const [deptFilter, setDeptFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [extras, setExtras] = useState(INITIAL_EXTRA);
  const [viewingSlip, setViewingSlip] = useState(null);
  const [settings] = useState(DEFAULT_SETTINGS);

  const formatMoney = (n) => Math.round(+n || 0).toLocaleString('vi-VN');
  const formatVND = (n) => formatMoney(n) + ' đ';

  const calculateTax = (income) => {
    let tax = 0;
    let prevLimit = 0;
    for (const b of settings.bac) {
      if (income <= prevLimit) break;
      tax += (Math.min(income, b.den) - prevLimit) * (b.ts / 100);
      prevLimit = b.den;
    }
    return Math.round(tax);
  };

  const calculatedRows = useMemo(() => {
    return INITIAL_EMPLOYEES.map((emp) => {
      const ex = extras[emp.id] || { cong: 26, ot: 0, slSP: 0, dgSP: 0, thuong: 0, tamUng: 0, khauTru: 0 };
      const cc = settings.congChuan;
      const luongNgay = emp.luongCB / cc;
      const luongGio = luongNgay / settings.gioCong;
      const cong = ex.cong !== undefined ? +ex.cong : cc;
      const luongCong = Math.round(luongNgay * cong);

      const pcCC = cong >= cc - 1 ? (emp.pcChuyenCan || 0) : 0;
      const pcTN = emp.pcThamNien || 0;
      const pcXX = emp.pcXangXe || 0;
      const pcCT = emp.pcChiuThue || 0;
      const pcKT = emp.pcKhongThue || 0;

      const slSP = +ex.slSP || 0;
      const dgSP = +ex.dgSP || emp.dgSanLuong || 0;
      const tienSL = Math.round(slSP * dgSP);

      const ot = +ex.ot || 0;
      const tienOT = Math.round(luongGio * ot * settings.heSoOT);
      const otMien = tienOT;

      const thuong = +ex.thuong || 0;
      const gross = luongCong + pcCT + pcKT + pcCC + pcTN + pcXX + tienSL + tienOT + thuong;

      const capBX = 20 * settings.luongCoSo;
      const capBT = 20 * settings.ltVung;
      const bx = Math.min(emp.luongBH, capBX);
      const bt = Math.min(emp.luongBH, capBT);

      const bhxh = Math.round(bx * (settings.bhxhNLD / 100));
      const bhyt = Math.round(bx * (settings.bhytNLD / 100));
      const bhtn = Math.round(bt * (settings.bhtnNLD / 100));
      const bhNLD = bhxh + bhyt + bhtn;

      const tnChiuThue = Math.max(0, gross - pcKT - otMien);
      const giamTru = settings.gtBanThan + (emp.soNPT || 0) * settings.gtNPT;
      const tnTinhThue = Math.max(0, tnChiuThue - bhNLD - giamTru);
      const thue = calculateTax(tnTinhThue);

      const tamUng = +ex.tamUng || 0;
      const khauTru = +ex.khauTru || 0;
      const thucLinh = gross - bhNLD - thue - tamUng - khauTru;

      const bdxh = Math.round(bx * (settings.bhxhDN / 100));
      const bdyt = Math.round(bx * (settings.bhytDN / 100));
      const bdtn = Math.round(bt * (settings.bhtnDN / 100));
      const kpcd = Math.round(bx * (settings.kpcdDN / 100));
      const bhDN = bdxh + bdyt + bdtn + kpcd;
      const chiPhiDN = gross + bhDN;

      return {
        ...emp,
        cong,
        luongCong,
        pcCC,
        pcTN,
        pcXX,
        pcCT,
        pcKT,
        slSP,
        dgSP,
        tienSL,
        ot,
        tienOT,
        otMien,
        thuong,
        gross,
        bhxh,
        bhyt,
        bhtn,
        bhNLD,
        tnChiuThue,
        giamTru,
        tnTinhThue,
        thue,
        tamUng,
        khauTru,
        thucLinh,
        bdxh,
        bdyt,
        bdtn,
        kpcd,
        bhDN,
        chiPhiDN
      };
    });
  }, [extras, settings]);

  const filteredRows = useMemo(() => {
    return calculatedRows.filter((r) => {
      const matchDept = !deptFilter || r.phongBan === deptFilter;
      const matchSearch = !searchTerm ||
        r.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ma.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [calculatedRows, deptFilter, searchTerm]);

  const departments = useMemo(() => {
    return [...new Set(INITIAL_EMPLOYEES.map(e => e.phongBan))];
  }, []);

  const totals = useMemo(() => {
    return filteredRows.reduce((acc, cur) => {
      acc.luongCong += cur.luongCong;
      acc.pcCC += cur.pcCC;
      acc.pcTN += cur.pcTN;
      acc.pcXX += cur.pcXX;
      acc.pcCT += cur.pcCT;
      acc.pcKT += cur.pcKT;
      acc.tienSL += cur.tienSL;
      acc.ot += cur.ot;
      acc.tienOT += cur.tienOT;
      acc.thuong += cur.thuong;
      acc.gross += cur.gross;
      acc.bhxh += cur.bhxh;
      acc.bhyt += cur.bhyt;
      acc.bhtn += cur.bhtn;
      acc.bhNLD += cur.bhNLD;
      acc.thue += cur.thue;
      acc.tamUng += cur.tamUng;
      acc.khauTru += cur.khauTru;
      acc.thucLinh += cur.thucLinh;
      acc.chiPhiDN += cur.chiPhiDN;
      return acc;
    }, {
      luongCong: 0, pcCC: 0, pcTN: 0, pcXX: 0, pcCT: 0, pcKT: 0, tienSL: 0, ot: 0,
      tienOT: 0, thuong: 0, gross: 0, bhxh: 0, bhyt: 0, bhtn: 0, bhNLD: 0,
      thue: 0, tamUng: 0, khauTru: 0, thucLinh: 0, chiPhiDN: 0
    });
  }, [filteredRows]);

  const handleInputChange = (empId, field, value) => {
    if (isLocked) return;
    const num = parseFloat(String(value).replace(/[^\d.-]/g, '')) || 0;
    setExtras(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [field]: num
      }
    }));
  };

  const handleToggleLock = () => {
    setIsLocked(prev => !prev);
  };

  const numberToWords = (num) => {
    const n = Math.round(Math.abs(+num || 0));
    if (!n) return 'Không đồng';
    const c = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const u = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ'];
    const r3 = (x, full) => {
      const t = Math.floor(x / 100), ch = Math.floor((x % 100) / 10), d = x % 10;
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
      <div className="ph">
        <div>
          <h1>Bảng thanh toán tiền lương</h1>
          <p>Tự động tính lương theo ngày công, phụ cấp, OT, trích bảo hiểm & thuế TNCN chuẩn 2026</p>
        </div>
        <div className="ph-tools">
          <button
            className={`btn ${isLocked ? 'danger' : 'pri'}`}
            onClick={handleToggleLock}
          >
            {isLocked ? <Unlock size={15} /> : <Lock size={15} />}
            <span>{isLocked ? 'Mở khóa bảng lương' : 'Chốt bảng lương'}</span>
          </button>
          <button
            className="btn"
            onClick={() => window.print()}
          >
            <Printer size={15} />
            <span>In toàn bộ</span>
          </button>
        </div>
      </div>

      <div className="payroll-toolbar-card">
        <div className="payroll-toolbar-left">
          <label className="mp">
            <span>Kỳ lương:</span>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </label>
          <select
            className="inp"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
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
          <span className={`badge ${isLocked ? 'b-green' : 'b-amber'}`}>
            {isLocked ? 'Đã khóa sổ' : 'Đang dự thảo'}
          </span>
        </div>

        <div className="payroll-toolbar-right">
          <div className="payroll-summary-item">
            <span>Tổng nhân sự:</span>
            <strong>{filteredRows.length} người</strong>
          </div>
          <div className="payroll-summary-item">
            <span>Tổng quỹ thực lĩnh:</span>
            <strong className="highlight">{formatVND(totals.thucLinh)}</strong>
          </div>
          <div className="payroll-summary-item">
            <span>Tổng chi phí DN:</span>
            <strong>{formatVND(totals.chiPhiDN)}</strong>
          </div>
        </div>
      </div>

      <div className="payroll-table-card">
        <div className="payroll-table-scroll-container">
          <table className="payroll-table">
            <thead>
              <tr>
                <th className="stk-col stk-col-0 text-center-col" rowSpan="2">STT</th>
                <th className="stk-col stk-col-1" rowSpan="2">MÃ NV</th>
                <th className="stk-col stk-col-2 text-left-col" rowSpan="2">HỌ VÀ TÊN</th>
                <th className="text-left-col" rowSpan="2">PHÒNG BAN</th>
                <th rowSpan="2">LƯƠNG CƠ BẢN</th>
                <th colSpan="11" className="grp-header">CÁC KHOẢN THU NHẬP</th>
                <th colSpan="4" className="grp-header">BẢO HIỂM NLĐ (10.5%)</th>
                <th colSpan="4" className="grp-header">THUẾ THU NHẬP CÁ NHÂN</th>
                <th colSpan="2" className="grp-header">CÁC KHOẢN KHẤU TRỪ</th>
                <th rowSpan="2" className="grp-header" style={{ minWidth: '120px' }}>THỰC LĨNH</th>
                <th rowSpan="2" className="text-center-col">PHIẾU</th>
              </tr>
              <tr>
                <th>CÔNG</th>
                <th>LƯƠNG CÔNG</th>
                <th>PC CHUYÊN CẦN</th>
                <th>PC THÂM NIÊN</th>
                <th>PC XĂNG XE</th>
                <th>PC CHỊU THUẾ</th>
                <th>PC MIỄN THUẾ</th>
                <th>SẢN LƯỢNG</th>
                <th>GIỜ OT</th>
                <th>TIỀN OT</th>
                <th>THƯỞNG</th>
                <th>LƯƠNG ĐÓNG BH</th>
                <th>BHXH (8%)</th>
                <th>BHYT (1.5%)</th>
                <th>BHTN (1%)</th>
                <th>TN CHỊU THUẾ</th>
                <th>GIẢM TRỪ</th>
                <th>TN TÍNH THUẾ</th>
                <th>THUẾ TNCN</th>
                <th>TẠM ỨNG</th>
                <th>KHẤU TRỪ KHÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr key={row.id}>
                  <td className="stk-col stk-col-0 text-center-col">{idx + 1}</td>
                  <td className="stk-col stk-col-1"><strong>{row.ma}</strong></td>
                  <td className="stk-col stk-col-2 text-left-col">
                    <strong>{row.ten}</strong>
                  </td>
                  <td className="text-left-col">{row.phongBan}</td>
                  <td>{formatMoney(row.luongCB)}</td>

                  <td className="editable-input-cell">
                    <input
                      type="number"
                      step="0.5"
                      value={row.cong}
                      disabled={isLocked}
                      onChange={(e) => handleInputChange(row.id, 'cong', e.target.value)}
                    />
                  </td>
                  <td>{formatMoney(row.luongCong)}</td>
                  <td>{formatMoney(row.pcCC)}</td>
                  <td>{formatMoney(row.pcTN)}</td>
                  <td>{formatMoney(row.pcXX)}</td>
                  <td>{formatMoney(row.pcCT)}</td>
                  <td>{formatMoney(row.pcKT)}</td>
                  <td className="editable-input-cell">
                    <input
                      type="number"
                      value={row.slSP || ''}
                      placeholder="0"
                      disabled={isLocked}
                      onChange={(e) => handleInputChange(row.id, 'slSP', e.target.value)}
                    />
                  </td>
                  <td>{row.ot}</td>
                  <td>{formatMoney(row.tienOT)}</td>
                  <td className="editable-input-cell">
                    <input
                      type="text"
                      value={row.thuong ? formatMoney(row.thuong) : ''}
                      placeholder="0"
                      disabled={isLocked}
                      onChange={(e) => handleInputChange(row.id, 'thuong', e.target.value)}
                    />
                  </td>

                  <td>{formatMoney(row.luongBH)}</td>
                  <td>{formatMoney(row.bhxh)}</td>
                  <td>{formatMoney(row.bhyt)}</td>
                  <td>{formatMoney(row.bhtn)}</td>

                  <td>{formatMoney(row.tnChiuThue)}</td>
                  <td>{formatMoney(row.giamTru)}</td>
                  <td>{formatMoney(row.tnTinhThue)}</td>
                  <td>{formatMoney(row.thue)}</td>

                  <td className="editable-input-cell">
                    <input
                      type="text"
                      value={row.tamUng ? formatMoney(row.tamUng) : ''}
                      placeholder="0"
                      disabled={isLocked}
                      onChange={(e) => handleInputChange(row.id, 'tamUng', e.target.value)}
                    />
                  </td>
                  <td className="editable-input-cell">
                    <input
                      type="text"
                      value={row.khauTru ? formatMoney(row.khauTru) : ''}
                      placeholder="0"
                      disabled={isLocked}
                      onChange={(e) => handleInputChange(row.id, 'khauTru', e.target.value)}
                    />
                  </td>

                  <td className="net-salary-cell">{formatMoney(row.thucLinh)}</td>
                  <td className="text-center-col">
                    <button
                      className="ibtn"
                      title="Xem phiếu lương"
                      onClick={() => setViewingSlip(row)}
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="stk-col stk-col-0"></td>
                <td className="stk-col stk-col-1"></td>
                <td className="stk-col stk-col-2 text-left-col"><strong>TỔNG CỘNG</strong></td>
                <td></td>
                <td></td>
                <td></td>
                <td>{formatMoney(totals.luongCong)}</td>
                <td>{formatMoney(totals.pcCC)}</td>
                <td>{formatMoney(totals.pcTN)}</td>
                <td>{formatMoney(totals.pcXX)}</td>
                <td>{formatMoney(totals.pcCT)}</td>
                <td>{formatMoney(totals.pcKT)}</td>
                <td></td>
                <td>{totals.ot}</td>
                <td>{formatMoney(totals.tienOT)}</td>
                <td>{formatMoney(totals.thuong)}</td>
                <td></td>
                <td>{formatMoney(totals.bhxh)}</td>
                <td>{formatMoney(totals.bhyt)}</td>
                <td>{formatMoney(totals.bhtn)}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>{formatMoney(totals.thue)}</td>
                <td>{formatMoney(totals.tamUng)}</td>
                <td>{formatMoney(totals.khauTru)}</td>
                <td className="net-salary-cell">{formatMoney(totals.thucLinh)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {viewingSlip && (
        <div className="modal-wrap" onClick={() => setViewingSlip(null)}>
          <div className="modal" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <h3>Phiếu lương chi tiết nhân viên</h3>
              <button className="ibtn" onClick={() => setViewingSlip(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-b">
              <div className="ps">
                <div className="ps-top">
                  <div className="ps-co">
                    <div>
                      <b>CÔNG TY CỔ PHẦN CÔNG NGHỆ ENTERPRISE VN</b>
                      <div className="l">Số 12 Phố Mẫu, Quận Cầu Giấy, Hà Nội</div>
                      <div className="l">ĐT: 024 3999 8888 · MST: 0101 234 567</div>
                    </div>
                  </div>
                  <div className="ps-tt">
                    <h1>PHIẾU LƯƠNG</h1>
                    <div>Kỳ tính lương: <b>{period}</b></div>
                    <div>Số phiếu: <b>PL-{period.replace('-', '')}-{viewingSlip.ma}</b></div>
                  </div>
                </div>

                <div className="ps-band"></div>

                <div className="ps-emp">
                  <div className="ps-av">
                    {(viewingSlip?.ten || 'N').split(' ').slice(-1)[0]?.[0] || 'N'}
                  </div>
                  <div className="ps-eg">
                    <div><span>Họ và tên:</span><b>{viewingSlip.ten}</b></div>
                    <div><span>Mã nhân viên:</span><b>{viewingSlip.ma}</b></div>
                    <div><span>Phòng ban:</span><b>{viewingSlip.phongBan}</b></div>
                    <div><span>Chức vụ:</span><b>{viewingSlip.chucVu}</b></div>
                    <div><span>Số CCCD:</span><b>{viewingSlip.mst}</b></div>
                    <div><span>Mã số thuế:</span><b>{viewingSlip.mst}</b></div>
                    <div><span>Ngân hàng:</span><b>{viewingSlip.nganHang}</b></div>
                    <div><span>Số tài khoản:</span><b>{viewingSlip.stk}</b></div>
                  </div>
                </div>

                <div className="ps-att">
                  <div><b>{settings.congChuan}</b><span>Công chuẩn</span></div>
                  <div><b>{viewingSlip.cong}</b><span>Công hưởng</span></div>
                  <div><b>{viewingSlip.ot}</b><span>Giờ làm thêm (OT)</span></div>
                  <div><b>{viewingSlip.soNPT || 0}</b><span>Người phụ thuộc</span></div>
                  <div><b>{formatMoney(viewingSlip.luongCB)}</b><span>Lương cơ bản</span></div>
                  <div className="hl"><b>{formatMoney(viewingSlip.thucLinh)}</b><span>Thực lĩnh (VND)</span></div>
                </div>

                <table className="ps-t">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>STT</th>
                      <th style={{ textAlign: 'left' }}>Khoản mục thu nhập & khấu trừ</th>
                      <th style={{ textAlign: 'left' }}>Diễn giải công thức</th>
                      <th style={{ textAlign: 'right', width: '140px' }}>Số tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="sec">
                      <td colSpan="4">A. CÁC KHOẢN THU NHẬP (EARNINGS)</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>1</td>
                      <td>Lương theo ngày công làm việc</td>
                      <td className="dg">{formatMoney(viewingSlip.luongCB)} ÷ {settings.congChuan} × {viewingSlip.cong} công</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.luongCong)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>2</td>
                      <td>Phụ cấp chuyên cần & trách nhiệm</td>
                      <td className="dg">Đạt chuẩn ngày công chuyên cần</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.pcCC + viewingSlip.pcCT)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>3</td>
                      <td>Phụ cấp thâm niên & xăng xe</td>
                      <td className="dg">Theo quy chế công tác nội bộ</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.pcTN + viewingSlip.pcXX)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>4</td>
                      <td>Phụ cấp ăn trưa (miễn thuế)</td>
                      <td className="dg">Quy chuẩn 730.000 đ/tháng</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.pcKT)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>5</td>
                      <td>Tiền làm thêm giờ (OT)</td>
                      <td className="dg">{viewingSlip.ot} giờ × hệ số {settings.heSoOT} (miễn thuế TNCN)</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.tienOT)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>6</td>
                      <td>Thưởng năng suất & kinh doanh</td>
                      <td className="dg">Đánh giá hiệu quả công việc tháng</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.thuong)}</td>
                    </tr>
                    <tr className="sub">
                      <td></td>
                      <td colSpan="2">TỔNG THU NHẬP (A)</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.gross)}</td>
                    </tr>

                    <tr className="sec">
                      <td colSpan="4">B. CÁC KHOẢN TRÍCH KHẤU TRỪ (DEDUCTIONS)</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>1</td>
                      <td>Bảo hiểm xã hội (BHXH 8%)</td>
                      <td className="dg">8% trên mức lương đóng {formatMoney(viewingSlip.luongBH)}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.bhxh)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>2</td>
                      <td>Bảo hiểm y tế (BHYT 1.5%)</td>
                      <td className="dg">1.5% trên mức lương đóng</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.bhyt)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>3</td>
                      <td>Bảo hiểm thất nghiệp (BHTN 1%)</td>
                      <td className="dg">1% trên mức lương đóng</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.bhtn)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>4</td>
                      <td>Thuế thu nhập cá nhân (TNCN)</td>
                      <td className="dg">Giảm trừ bản thân {formatMoney(settings.gtBanThan)} + NPT</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.thue)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>5</td>
                      <td>Tạm ứng & khoản trừ khác</td>
                      <td className="dg">Đã ứng trong kỳ</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(viewingSlip.tamUng + viewingSlip.khauTru)}</td>
                    </tr>
                    <tr className="sub">
                      <td></td>
                      <td colSpan="2">TỔNG KHẤU TRỪ (B)</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatMoney(viewingSlip.bhNLD + viewingSlip.thue + viewingSlip.tamUng + viewingSlip.khauTru)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="ps-net">
                  <div>
                    <span>SỐ TIỀN THỰC LĨNH CHUYỂN KHOẢN (A - B)</span>
                    <small>Bằng chữ: {numberToWords(viewingSlip.thucLinh)}</small>
                  </div>
                  <b>{formatVND(viewingSlip.thucLinh)}</b>
                </div>

                <div className="ps-2">
                  <div className="ps-box">
                    <h4>Chi tiết tính thuế TNCN</h4>
                    <div><span>Thu nhập chịu thuế:</span><b>{formatVND(viewingSlip.tnChiuThue)}</b></div>
                    <div><span>Giảm trừ gia cảnh:</span><b>- {formatVND(viewingSlip.giamTru)}</b></div>
                    <div><span>Bảo hiểm phần NLĐ:</span><b>- {formatVND(viewingSlip.bhNLD)}</b></div>
                    <div><span>Thu nhập tính thuế:</span><b>{formatVND(viewingSlip.tnTinhThue)}</b></div>
                    <div><span>Thuế TNCN phát sinh:</span><b>{formatVND(viewingSlip.thue)}</b></div>
                  </div>
                  <div className="ps-box">
                    <h4>Phần doanh nghiệp đóng thêm (21.5%)</h4>
                    <div><span>BHXH (17.5%):</span><b>{formatVND(viewingSlip.bdxh)}</b></div>
                    <div><span>BHYT (3%):</span><b>{formatVND(viewingSlip.bdyt)}</b></div>
                    <div><span>BHTN (1%):</span><b>{formatVND(viewingSlip.bdtn)}</b></div>
                    <div><span>Kinh phí công đoàn (2%):</span><b>{formatVND(viewingSlip.kpcd)}</b></div>
                    <div><span>Tổng chi phí nhân sự công ty:</span><b>{formatVND(viewingSlip.chiPhiDN)}</b></div>
                  </div>
                </div>

                <div className="ps-sign">
                  <div>
                    <b>Người lập biểu</b>
                    <i>(Ký và ghi rõ họ tên)</i>
                    <div className="sp"></div>
                  </div>
                  <div>
                    <b>Kế toán trưởng</b>
                    <i>(Ký và ghi rõ họ tên)</i>
                    <div className="sp"></div>
                  </div>
                  <div>
                    <b>Người nhận lương</b>
                    <i>(Ký và ghi rõ họ tên)</i>
                    <div className="sp"></div>
                    <b>{viewingSlip.ten}</b>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-f">
              <button className="btn" onClick={() => window.print()}>
                <Printer size={15} />
                <span>In phiếu lương này</span>
              </button>
              <button className="btn pri" onClick={() => setViewingSlip(null)}>
                <span>Đóng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
