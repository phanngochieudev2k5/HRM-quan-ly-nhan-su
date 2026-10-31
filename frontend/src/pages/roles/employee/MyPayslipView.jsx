import React, { useState } from 'react';
import {
  Printer, HelpCircle, CheckCircle2,
  Calendar, Send, X, ShieldAlert,
  FileSpreadsheet, Eye, EyeOff
} from 'lucide-react';
import AuthService from '../../../services/AuthService';
import EmptyState from '../../../components/common/EmptyState';
import '../../../styles/roles/employee/MyPayslipView.css';

export default function MyPayslipView({ role, user }) {
  const currentUser = user || AuthService.getCurrentUser() || {};
  const currentRole = role || currentUser?.role || 'Employee';
  const isEmployeeRole = currentRole === 'Employee';

  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeText, setDisputeText] = useState('');
  const [disputeSent, setDisputeSent] = useState(false);
  const [showPreviewSample, setShowPreviewSample] = useState(false);

  const payslips = {
    '2026-04': {
      empName: currentUser.name || currentUser.fullName || 'Lê Hoàng Long',
      empId: currentUser.employeeCode || 'NV003',
      dept: currentUser.department || 'Khối Kỹ Thuật (IT)',
      position: currentUser.position || currentUser.roleTitle || 'Backend Developer',
      joinDate: currentUser.joinDate || '01/06/2023',
      idCard: currentUser.idCardNumber || '001096009876',
      taxCode: currentUser.taxCode || '8719283719',
      bankName: currentUser.bankName || 'Vietcombank - CN Ba Đình',
      bankAccount: currentUser.bankAccountNumber || '045100039281',
      standardDays: 26,
      actualDays: 26.0,
      paidDays: 26.0,
      unpaidDays: 0,
      otHours: 8,
      dependents: 1,
      baseSalary: 22000000,
      salaryByDays: 22000000,
      attendanceBonus: 500000,
      seniorityBonus: 100000,
      transportAllowance: 500000,
      taxableAllowance: 1000000,
      lunchAllowance: 730000,
      otPay: 1269231,
      performanceBonus: 1500000,
      gross: 27599231,
      insuranceSalary: 22000000,
      bhxh: 1760000,
      bhyt: 330000,
      bhtn: 220000,
      totalEmployeeInsurance: 2310000,
      taxableIncome: 25599231,
      personalDeduction: 15500000,
      dependentDeduction: 6200000,
      calculatedTaxable: 1589231,
      tax: 79462,
      advance: 2000000,
      otherDeduction: 0,
      totalDeduction: 4389462,
      net: 23209769,
      bdxh: 3850000,
      bdyt: 660000,
      bdtn: 220000,
      kpcd: 440000,
      companyInsurance: 5170000,
      totalCompanyCost: 32769231
    },
    '2026-03': {
      empName: currentUser.name || currentUser.fullName || 'Lê Hoàng Long',
      empId: currentUser.employeeCode || 'NV003',
      dept: currentUser.department || 'Khối Kỹ Thuật (IT)',
      position: currentUser.position || currentUser.roleTitle || 'Backend Developer',
      joinDate: currentUser.joinDate || '01/06/2023',
      idCard: currentUser.idCardNumber || '001096009876',
      taxCode: currentUser.taxCode || '8719283719',
      bankName: currentUser.bankName || 'Vietcombank - CN Ba Đình',
      bankAccount: currentUser.bankAccountNumber || '045100039281',
      standardDays: 26,
      actualDays: 25.5,
      paidDays: 25.5,
      unpaidDays: 0.5,
      otHours: 4,
      dependents: 1,
      baseSalary: 22000000,
      salaryByDays: 21576923,
      attendanceBonus: 500000,
      seniorityBonus: 100000,
      transportAllowance: 500000,
      taxableAllowance: 1000000,
      lunchAllowance: 730000,
      otPay: 634615,
      performanceBonus: 2000000,
      gross: 27041538,
      insuranceSalary: 22000000,
      bhxh: 1760000,
      bhyt: 330000,
      bhtn: 220000,
      totalEmployeeInsurance: 2310000,
      taxableIncome: 25676923,
      personalDeduction: 15500000,
      dependentDeduction: 6200000,
      calculatedTaxable: 1666923,
      tax: 83346,
      advance: 0,
      otherDeduction: 0,
      totalDeduction: 2393346,
      net: 24648192,
      bdxh: 3850000,
      bdyt: 660000,
      bdtn: 220000,
      kpcd: 440000,
      companyInsurance: 5170000,
      totalCompanyCost: 32211538
    }
  };

  const current = payslips[selectedMonth] || payslips['2026-04'];

  const formatVND = (n) => Math.round(+n || 0).toLocaleString('vi-VN') + ' đ';
  const formatMoney = (n) => Math.round(+n || 0).toLocaleString('vi-VN');

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

  const handleSendDispute = (e) => {
    e.preventDefault();
    if (!disputeText.trim()) return;
    setDisputeSent(true);
    setTimeout(() => {
      setIsDisputeOpen(false);
      setDisputeSent(false);
      setDisputeText('');
    }, 1500);
  };

  const hasData = isEmployeeRole || showPreviewSample;

  return (
    <div className="payslip-container">
      <div className="ph">
        <div>
          <h1>Phiếu lương cá nhân</h1>
          <p>
            Xem chi tiết ngày công làm việc, phụ cấp, bảo hiểm và thu nhập thực lĩnh chuyển khoản của {currentUser.name || currentUser.fullName || 'bạn'}
          </p>
        </div>
        <div className="ph-tools">
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
          {!isEmployeeRole && (
            <button
              className="btn"
              onClick={() => setShowPreviewSample(!showPreviewSample)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {showPreviewSample ? <EyeOff size={15} /> : <Eye size={15} />}
              <span>{showPreviewSample ? 'Trở về trạng thái chưa có dữ liệu' : 'Xem giao diện mẫu phiếu lương'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="payslip-selector-card">
        <div className="payslip-selector-left">
          <label className="mp">
            <span>Chọn kỳ lương:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </label>
          <span className={`badge ${hasData ? 'b-green' : 'b-amber'}`}>
            {hasData ? (showPreviewSample ? 'Bản xem trước mẫu' : 'Đã thanh toán ngân hàng') : 'Chưa chốt số liệu'}
          </span>
        </div>
        <div className="small muted">
          Tài khoản: <strong>{currentUser.name || currentUser.fullName || 'Người dùng'} ({currentUser.roleTitle || currentRole})</strong>
        </div>
      </div>

      {!hasData ? (
        <div className="payslip-main-card" style={{ padding: '24px' }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Họ và tên</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                {currentUser.name || currentUser.fullName || 'Chưa cập nhật'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Mã nhân sự</span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f766e', marginTop: '2px' }}>
                {currentUser.employeeCode || `NV${String(currentUser.id || 1).padStart(3, '0')}`}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Phòng ban</span>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                {currentUser.department || (currentRole === 'HR' ? 'Phòng Nhân Sự' : currentRole === 'Finance' ? 'Phòng Kế Toán' : 'Khối Kỹ Thuật (IT)')}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Chức danh</span>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                {currentUser.position || currentUser.roleTitle || currentRole}
              </div>
            </div>
          </div>

          <EmptyState
            title={`Chưa có dữ liệu phiếu lương kỳ ${selectedMonth}`}
            description={`Tài khoản của bạn (${currentUser.roleTitle || currentRole}) hiện chưa có dữ liệu bảng lương được tính và chốt sổ kỳ này. Sau khi Kế toán hoàn tất khóa sổ bảng thanh toán lương (/finance/calc), phiếu lương chi tiết sẽ tự động hiển thị tại đây.`}
            icon={FileSpreadsheet}
            actionLabel="Xem thử bố cục mẫu phiếu lương"
            onAction={() => setShowPreviewSample(true)}
          />
        </div>
      ) : (
        <div className="payslip-main-card">
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
                <div>Kỳ lương: <b>{selectedMonth}</b></div>
                <div>Số phiếu: <b>PL-{selectedMonth.replace('-', '')}-{current.empId}</b></div>
              </div>
            </div>

            <div className="ps-band"></div>

            <div className="ps-emp">
              <div className="ps-av">
                {(current?.empName || 'N').split(' ').slice(-1)[0]?.[0] || 'N'}
              </div>
              <div className="ps-eg">
                <div><span>Họ và tên:</span><b>{current.empName}</b></div>
                <div><span>Mã nhân viên:</span><b>{current.empId}</b></div>
                <div><span>Phòng ban:</span><b>{current.dept}</b></div>
                <div><span>Chức vụ:</span><b>{current.position}</b></div>
                <div><span>Ngày vào làm:</span><b>{current.joinDate}</b></div>
                <div><span>Mã số thuế:</span><b>{current.taxCode}</b></div>
                <div><span>Ngân hàng:</span><b>{current.bankName}</b></div>
                <div><span>Số tài khoản:</span><b>{current.bankAccount}</b></div>
              </div>
            </div>

            <div className="ps-att">
              <div><b>{current.standardDays}</b><span>Công chuẩn</span></div>
              <div><b>{current.actualDays}</b><span>Công thực tế</span></div>
              <div><b>{current.otHours}</b><span>Giờ làm thêm (OT)</span></div>
              <div><b>{current.unpaidDays}</b><span>Nghỉ không lương</span></div>
              <div><b>{formatMoney(current.baseSalary)}</b><span>Lương cơ bản</span></div>
              <div className="hl"><b>{formatMoney(current.net)}</b><span>Thực lĩnh (VND)</span></div>
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
                  <td><b>Lương thời gian thực tế</b></td>
                  <td>({formatMoney(current.baseSalary)} / {current.standardDays}) × {current.actualDays} ngày</td>
                  <td className="num">{formatMoney(current.salaryByDays)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>2</td>
                  <td>Phụ cấp ăn trưa</td>
                  <td>Mức chi ăn ca hỗ trợ 730.000 đ/tháng</td>
                  <td className="num">{formatMoney(current.lunchAllowance)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>3</td>
                  <td>Phụ cấp chuyên cần</td>
                  <td>Nghỉ phép không quá 1 ngày trong tháng</td>
                  <td className="num">{formatMoney(current.attendanceBonus)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>4</td>
                  <td>Phụ cấp thâm niên công tác</td>
                  <td>Theo quy chế thâm niên làm việc</td>
                  <td className="num">{formatMoney(current.seniorityBonus)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>5</td>
                  <td>Phụ cấp xăng xe & đi lại</td>
                  <td>Hỗ trợ phương tiện di chuyển</td>
                  <td className="num">{formatMoney(current.transportAllowance)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>6</td>
                  <td>Phụ cấp chức vụ / trách nhiệm</td>
                  <td>Khoản phụ cấp chịu thuế TNCN</td>
                  <td className="num">{formatMoney(current.taxableAllowance)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>7</td>
                  <td>Làm thêm giờ (OT)</td>
                  <td>{current.otHours} giờ × hệ số 1.5</td>
                  <td className="num">{formatMoney(current.otPay)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>8</td>
                  <td>Thưởng hiệu suất / KPI tháng</td>
                  <td>Đánh giá hoàn thành công việc xuất sắc</td>
                  <td className="num">{formatMoney(current.performanceBonus)}</td>
                </tr>
                <tr className="subt">
                  <td colSpan="3"><b>TỔNG THU NHẬP (GROSS) [A]</b></td>
                  <td className="num"><b>{formatMoney(current.gross)}</b></td>
                </tr>

                <tr className="sec">
                  <td colSpan="4">B. CÁC KHOẢN TRÍCH NỘP BẢO HIỂM (NLĐ ĐÓNG 10.5%)</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>1</td>
                  <td>Bảo hiểm xã hội (BHXH)</td>
                  <td>8.0% trên lương đóng BH ({formatMoney(current.insuranceSalary)})</td>
                  <td className="num red">-{formatMoney(current.bhxh)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>2</td>
                  <td>Bảo hiểm y tế (BHYT)</td>
                  <td>1.5% trên lương đóng BH ({formatMoney(current.insuranceSalary)})</td>
                  <td className="num red">-{formatMoney(current.bhyt)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>3</td>
                  <td>Bảo hiểm thất nghiệp (BHTN)</td>
                  <td>1.0% trên lương đóng BH ({formatMoney(current.insuranceSalary)})</td>
                  <td className="num red">-{formatMoney(current.bhtn)}</td>
                </tr>
                <tr className="subt">
                  <td colSpan="3"><b>TỔNG BẢO HIỂM KHẤU TRỪ [B]</b></td>
                  <td className="num red"><b>-{formatMoney(current.totalEmployeeInsurance)}</b></td>
                </tr>

                <tr className="sec">
                  <td colSpan="4">C. THUẾ THU NHẬP CÁ NHÂN (TNCN)</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>1</td>
                  <td>Thu nhập chịu thuế</td>
                  <td>Tổng thu nhập trừ tiền ăn trưa miễn thuế</td>
                  <td className="num">{formatMoney(current.taxableIncome)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>2</td>
                  <td>Giảm trừ gia cảnh bản thân</td>
                  <td>Mức giảm trừ theo quy định</td>
                  <td className="num">-{formatMoney(current.personalDeduction)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>3</td>
                  <td>Giảm trừ người phụ thuộc</td>
                  <td>{current.dependents} người phụ thuộc</td>
                  <td className="num">-{formatMoney(current.dependentDeduction)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>4</td>
                  <td>Thu nhập tính thuế</td>
                  <td>Sau khi trừ bảo hiểm và các khoản giảm trừ</td>
                  <td className="num">{formatMoney(current.calculatedTaxable)}</td>
                </tr>
                <tr className="subt">
                  <td colSpan="3"><b>THUẾ TNCN PHẢI NỘP [C]</b></td>
                  <td className="num red"><b>-{formatMoney(current.tax)}</b></td>
                </tr>

                <tr className="sec">
                  <td colSpan="4">D. CÁC KHOẢN GIẢM TRỪ KHÁC</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>1</td>
                  <td>Tạm ứng lương</td>
                  <td>Tiền tạm ứng trong kỳ</td>
                  <td className="num red">-{formatMoney(current.advance)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>2</td>
                  <td>Khấu trừ khác</td>
                  <td>Thu hồi hoặc xử lý vi phạm nội quy</td>
                  <td className="num red">-{formatMoney(current.otherDeduction)}</td>
                </tr>

                <tr className="tot">
                  <td colSpan="3">
                    <div className="ps-tot-lbl">THỰC LĨNH CHUYỂN KHOẢN (NET) = [A] - [B] - [C] - [D]</div>
                    <div className="ps-words">Bằng chữ: <em>{numberToWords(current.net)}</em></div>
                  </td>
                  <td className="num">
                    <span className="ps-net-val">{formatMoney(current.net)} đ</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="ps-sign">
              <div>
                <b>NGƯỜI LẬP PHIẾU</b>
                <div className="sub">(Kế toán tiền lương)</div>
                <div className="st">Đã ký điện tử</div>
                <div>Vũ Thị Hoa</div>
              </div>
              <div>
                <b>KẾ TOÁN TRƯỞNG</b>
                <div className="sub">(Phê duyệt bảng lương)</div>
                <div className="st">Đã ký điện tử</div>
                <div>Phạm Minh Đức</div>
              </div>
              <div>
                <b>NGƯỜI NHẬN TIỀN</b>
                <div className="sub">(Xác nhận nhận đủ lương)</div>
                <div className="st">Xác nhận trực tuyến</div>
                <div>{current.empName}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDisputeOpen && (
        <div className="modal-wrap" onClick={() => setIsDisputeOpen(false)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-h">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} style={{ color: '#0f766e' }} />
                <h3>Gửi khiếu nại / Phản hồi kỳ lương</h3>
              </div>
              <button type="button" onClick={() => setIsDisputeOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSendDispute}>
              <div className="modal-b">
                {disputeSent ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a' }}>
                    <CheckCircle2 size={40} style={{ margin: '0 auto 12px' }} />
                    <h4>Đã gửi phản hồi thành công!</h4>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>Bộ phận Kế toán & HR sẽ xem xét và phản hồi qua email của bạn.</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                      Nếu bạn phát hiện sai sót về số ngày công, tiền làm thêm giờ (OT), mức khấu trừ hoặc thông tin tài khoản ngân hàng, vui lòng gửi phản hồi chi tiết tại đây:
                    </p>
                    <textarea
                      className="inp"
                      rows="5"
                      required
                      placeholder="Mô tả cụ thể nội dung cần kiểm tra lại (VD: Ngày 15/04 em có tăng ca 2 tiếng nhưng trên phiếu ghi nhận 0 tiếng...)"
                      value={disputeText}
                      onChange={(e) => setDisputeText(e.target.value)}
                    />
                  </div>
                )}
              </div>
              {!disputeSent && (
                <div className="modal-f">
                  <button type="button" className="btn" onClick={() => setIsDisputeOpen(false)}>Hủy</button>
                  <button type="submit" className="btn pri">
                    <Send size={15} style={{ marginRight: '6px' }} />
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
