import React, { useState } from 'react';
import {
  Printer, HelpCircle, CheckCircle2,
  Calendar, Send, X, ShieldAlert
} from 'lucide-react';
import '../../../styles/roles/employee/MyPayslipView.css';

export default function MyPayslipView() {
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeText, setDisputeText] = useState('');
  const [disputeSent, setDisputeSent] = useState(false);

  const payslips = {
    '2026-04': {
      empName: 'Lê Hoàng Long',
      empId: 'NV003',
      dept: 'Khối Kỹ Thuật (IT)',
      position: 'Backend Developer',
      joinDate: '01/06/2023',
      idCard: '001096009876',
      taxCode: '8719283719',
      bankName: 'Vietcombank - CN Ba Đình',
      bankAccount: '045100039281',
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
      empName: 'Lê Hoàng Long',
      empId: 'NV003',
      dept: 'Khối Kỹ Thuật (IT)',
      position: 'Backend Developer',
      joinDate: '01/06/2023',
      idCard: '001096009876',
      taxCode: '8719283719',
      bankName: 'Vietcombank - CN Ba Đình',
      bankAccount: '045100039281',
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

  return (
    <div className="payslip-container">
      <div className="ph">
        <div>
          <h1>Phiếu lương cá nhân</h1>
          <p>Xem chi tiết ngày công làm việc, phụ cấp, bảo hiểm và thu nhập thực lĩnh chuyển khoản</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={() => window.print()}>
            <Printer size={15} />
            <span>In phiếu lương</span>
          </button>
          <button className="btn pri" onClick={() => setIsDisputeOpen(true)}>
            <HelpCircle size={15} />
            <span>Phản hồi kỳ lương</span>
          </button>
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
          <span className="badge b-green">Đã thanh toán ngân hàng</span>
        </div>
        <div className="small muted">
          Hình thức chi trả: <strong>{current.bankName} - {current.bankAccount}</strong>
        </div>
      </div>

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
                <td>Lương theo ngày công làm việc</td>
                <td className="dg">{formatMoney(current.baseSalary)} ÷ {current.standardDays} × {current.paidDays} công</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.salaryByDays)}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>2</td>
                <td>Phụ cấp chuyên cần & trách nhiệm</td>
                <td className="dg">Đạt chuẩn ngày công trong tháng</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.attendanceBonus + current.taxableAllowance)}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>3</td>
                <td>Phụ cấp thâm niên & xăng xe</td>
                <td className="dg">Quy chế nội bộ công ty</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.seniorityBonus + current.transportAllowance)}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>4</td>
                <td>Phụ cấp ăn trưa (miễn thuế TNCN)</td>
                <td className="dg">Hạn mức tối đa 730.000 đ/tháng</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.lunchAllowance)}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>5</td>
                <td>Tiền làm thêm giờ (OT)</td>
                <td className="dg">{current.otHours} giờ × hệ số 1.5 (miễn thuế TNCN)</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.otPay)}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>6</td>
                <td>Thưởng năng suất & hiệu quả dự án</td>
                <td className="dg">Đánh giá hiệu suất đạt A</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.performanceBonus)}</td>
              </tr>
              <tr className="sub">
                <td></td>
                <td colSpan="2">TỔNG THU NHẬP (A)</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.gross)}</td>
              </tr>

              <tr className="sec">
                <td colSpan="4">B. CÁC KHOẢN KHẤU TRỪ BẮT BUỘC (DEDUCTIONS)</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>1</td>
                <td>Bảo hiểm xã hội (BHXH 8%)</td>
                <td className="dg">8% trên mức đóng {formatMoney(current.insuranceSalary)}</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.bhxh)}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>2</td>
                <td>Bảo hiểm y tế (BHYT 1.5%)</td>
                <td className="dg">1.5% trên mức lương đóng</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.bhyt)}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>3</td>
                <td>Bảo hiểm thất nghiệp (BHTN 1%)</td>
                <td className="dg">1% trên mức lương đóng</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.bhtn)}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>4</td>
                <td>Thuế thu nhập cá nhân (TNCN)</td>
                <td className="dg">Giảm trừ bản thân 15.5tr + {current.dependents} người phụ thuộc</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.tax)}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>5</td>
                <td>Tạm ứng lương đã nhận trong tháng</td>
                <td className="dg">Khấu trừ tiền ứng</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.advance)}</td>
              </tr>
              <tr className="sub">
                <td></td>
                <td colSpan="2">TỔNG KHẤU TRỪ (B)</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(current.totalDeduction)}</td>
              </tr>
            </tbody>
          </table>

          <div className="ps-net">
            <div>
              <span>THỰC LĨNH CHUYỂN KHOẢN (A - B)</span>
              <small>Bằng chữ: {numberToWords(current.net)}</small>
            </div>
            <b>{formatVND(current.net)}</b>
          </div>

          <div className="ps-2">
            <div className="ps-box">
              <h4>Chi tiết giảm trừ thuế TNCN</h4>
              <div><span>Thu nhập chịu thuế:</span><b>{formatVND(current.taxableIncome)}</b></div>
              <div><span>Giảm trừ bản thân:</span><b>- {formatVND(current.personalDeduction)}</b></div>
              <div><span>Giảm trừ người phụ thuộc:</span><b>- {formatVND(current.dependentDeduction)}</b></div>
              <div><span>Bảo hiểm phần NLĐ trích nộp:</span><b>- {formatVND(current.totalEmployeeInsurance)}</b></div>
              <div><span>Thu nhập tính thuế:</span><b>{formatVND(current.calculatedTaxable)}</b></div>
              <div><span>Thuế TNCN nộp ngân sách:</span><b>{formatVND(current.tax)}</b></div>
            </div>
            <div className="ps-box">
              <h4>Doanh nghiệp đóng thêm cho bạn (21.5%)</h4>
              <div><span>BHXH doanh nghiệp (17.5%):</span><b>{formatVND(current.bdxh)}</b></div>
              <div><span>BHYT doanh nghiệp (3%):</span><b>{formatVND(current.bdyt)}</b></div>
              <div><span>BHTN doanh nghiệp (1%):</span><b>{formatVND(current.bdtn)}</b></div>
              <div><span>Kinh phí công đoàn (2%):</span><b>{formatVND(current.kpcd)}</b></div>
              <div><span>Tổng quỹ công ty chi cho bạn:</span><b>{formatVND(current.totalCompanyCost)}</b></div>
            </div>
          </div>

          <div className="ps-sign">
            <div>
              <b>Người lập phiếu</b>
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
              <b>{current.empName}</b>
            </div>
          </div>

          <div className="ps-foot">
            Phiếu lương là thông tin bảo mật cá nhân, vui lòng không chia sẻ ra ngoài. Mọi thắc mắc xin phản hồi phòng Kế toán - Nhân sự trong vòng 03 ngày làm việc kể từ ngày nhận phiếu.
          </div>
        </div>

        <div className="payslip-dispute-box">
          <div className="payslip-dispute-info">
            <ShieldAlert size={18} />
            <span>Phát hiện sai sót về ngày công, giờ OT hoặc số tiền khấu trừ? Bạn có thể gửi phản hồi trực tiếp tới bộ phận C&B / Kế toán lương.</span>
          </div>
          <button className="btn sm teal" onClick={() => setIsDisputeOpen(true)}>
            Gửi yêu cầu giải trình
          </button>
        </div>
      </div>

      {isDisputeOpen && (
        <div className="modal-wrap" onClick={() => setIsDisputeOpen(false)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <h3>Phản hồi thắc mắc về phiếu lương {selectedMonth}</h3>
              <button className="ibtn" onClick={() => setIsDisputeOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSendDispute}>
              <div className="modal-b">
                {disputeSent ? (
                  <div className="banner" style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#15803d' }}>
                    <CheckCircle2 size={18} />
                    <span>Đã gửi phản hồi thành công đến bộ phận C&B! Kế toán sẽ liên hệ xác minh trong 24 giờ làm việc.</span>
                  </div>
                ) : (
                  <div className="field">
                    <span>Nội dung phản hồi hoặc nghi vấn:</span>
                    <textarea
                      className="inp"
                      rows="4"
                      required
                      placeholder="Ví dụ: Ngày 15/04 tôi có tăng ca 2 giờ nhưng phiếu lương chưa ghi nhận đủ..."
                      value={disputeText}
                      onChange={(e) => setDisputeText(e.target.value)}
                    ></textarea>
                    <small>Yêu cầu sẽ được chuyển tới Kế toán trưởng và Nhân sự phụ trách bảng lương.</small>
                  </div>
                )}
              </div>
              <div className="modal-f">
                <button type="button" className="btn" onClick={() => setIsDisputeOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn pri" disabled={disputeSent}>
                  <Send size={14} />
                  <span>Gửi phản hồi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
