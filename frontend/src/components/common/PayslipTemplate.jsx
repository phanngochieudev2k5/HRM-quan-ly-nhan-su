import React from 'react';

const formatMoney = (n) => Math.round(+n || 0).toLocaleString('vi-VN');

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

export default function PayslipTemplate({ slip, period, config = {}, isLocked = false }) {
  if (!slip) return null;

  const standardDays = config.congChuan || 26;
  const bhxhRate = config.bhxhNLD ?? 8;
  const bhytRate = config.bhytNLD ?? 1.5;
  const bhtnRate = config.bhtnNLD ?? 1;
  const totalInsRate = bhxhRate + bhytRate + bhtnRate;

  const fullName = slip.FullName || slip.empName || 'Nhân viên';
  const empCode = slip.EmployeeCode || slip.empId || 'NV';
  const deptName = slip.DepartmentName || slip.dept || 'Chưa phân bổ';
  const posName = slip.PositionName || slip.position || 'Nhân viên';
  const joinDate = slip.JoinDate || slip.joinDate || '---';
  const taxCode = slip.TaxCode || slip.taxCode || '---';
  const bankName = slip.BankName || slip.bankName || '---';
  const bankAcc = slip.BankAccountNumber || slip.bankAccount || '---';

  const actualDays = slip.ActualWorkDays ?? slip.actualDays ?? 0;
  const otHours = slip.OvertimeHours ?? slip.otHours ?? 0;
  const unpaidDays = slip.UnpaidLeaveDays ?? slip.unpaidDays ?? 0;
  const baseSalary = slip.BaseSalary ?? slip.baseSalary ?? 0;
  const actualBase = slip.ActualBaseSalary ?? slip.salaryByDays ?? 0;
  const taxableAllowance = slip.TaxableAllowance ?? slip.taxableAllowance ?? 0;
  const nonTaxableAllowance = slip.NonTaxableAllowance ?? slip.lunchAllowance ?? 0;
  const otPay = slip.OvertimePay ?? slip.otPay ?? 0;
  const bonus = slip.BonusAmount ?? slip.performanceBonus ?? 0;
  const gross = slip.TotalGrossSalary ?? slip.gross ?? 0;

  const insSalary = slip.InsuranceSalary ?? slip.insuranceSalary ?? baseSalary;
  const bhxh = slip.BhxhDeduction ?? slip.bhxh ?? 0;
  const bhyt = slip.BhytDeduction ?? slip.bhyt ?? 0;
  const bhtn = slip.BhtnDeduction ?? slip.bhtn ?? 0;
  const totalIns = slip.TotalInsuranceNLD ?? slip.totalEmployeeInsurance ?? (bhxh + bhyt + bhtn);

  const personalDed = slip.PersonalTaxDeduction ?? slip.personalDeduction ?? 15500000;
  const depDed = slip.DependentTaxDeduction ?? slip.dependentDeduction ?? 0;
  const dependents = slip.DependentsCount ?? slip.dependents ?? 0;
  const taxableInc = slip.TaxableIncome ?? slip.calculatedTaxable ?? 0;
  const preDedIncome = Math.max(0, gross - nonTaxableAllowance - otPay);
  const tax = slip.PersonalIncomeTax ?? slip.tax ?? 0;

  const advance = slip.AdvanceAmount ?? slip.advance ?? 0;
  const otherDed = slip.OtherDeduction ?? slip.otherDeduction ?? 0;
  const net = slip.NetSalary ?? slip.net ?? 0;

  const avatarInitial = fullName.trim().split(' ').slice(-1)[0]?.[0]?.toUpperCase() || 'N';

  return (
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
          <div>
            Kỳ lương: <b>{period}</b>
          </div>
          <div>
            Số phiếu: <b>PL-{String(period || '').replace('-', '')}-{empCode}</b>
          </div>
        </div>
      </div>

      <div className="ps-band"></div>

      <div className="ps-emp">
        <div className="ps-av">{avatarInitial}</div>
        <div className="ps-eg">
          <div>
            <span>Họ và tên:</span>
            <b>{fullName}</b>
          </div>
          <div>
            <span>Mã nhân viên:</span>
            <b>{empCode}</b>
          </div>
          <div>
            <span>Phòng ban:</span>
            <b>{deptName}</b>
          </div>
          <div>
            <span>Chức vụ:</span>
            <b>{posName}</b>
          </div>
          <div>
            <span>Ngày vào làm:</span>
            <b>{joinDate}</b>
          </div>
          <div>
            <span>Mã số thuế:</span>
            <b>{taxCode}</b>
          </div>
          <div>
            <span>Ngân hàng:</span>
            <b>{bankName}</b>
          </div>
          <div>
            <span>Số tài khoản:</span>
            <b>{bankAcc}</b>
          </div>
        </div>
      </div>

      <div className="ps-att">
        <div>
          <b>{standardDays}</b>
          <span>Công chuẩn</span>
        </div>
        <div>
          <b>{actualDays}</b>
          <span>Công thực tế</span>
        </div>
        <div>
          <b>{otHours}</b>
          <span>Giờ làm thêm (OT)</span>
        </div>
        <div>
          <b>{unpaidDays}</b>
          <span>Nghỉ không lương</span>
        </div>
        <div>
          <b>{formatMoney(baseSalary)}</b>
          <span>Lương cơ bản</span>
        </div>
        <div className="hl">
          <b>{formatMoney(net)}</b>
          <span>Thực lĩnh (VND)</span>
        </div>
      </div>

      <table className="ps-t">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>STT</th>
            <th style={{ textAlign: 'left' }}>Khoản mục thu nhập &amp; khấu trừ</th>
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
            <td>
              <b>Lương thời gian thực tế</b>
            </td>
            <td>
              ({formatMoney(baseSalary)} / {standardDays}) × {actualDays} ngày
            </td>
            <td className="num">{formatMoney(actualBase)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>2</td>
            <td>Phụ cấp miễn thuế (Ăn trưa, xăng xe...)</td>
            <td>Khoản phụ cấp không chịu thuế TNCN theo cấu hình</td>
            <td className="num">{formatMoney(nonTaxableAllowance)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>3</td>
            <td>Phụ cấp chịu thuế</td>
            <td>Khoản phụ cấp chức vụ / trách nhiệm</td>
            <td className="num">{formatMoney(taxableAllowance)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>4</td>
            <td>Làm thêm giờ (OT)</td>
            <td>{otHours} giờ đã phê duyệt (Hệ số 150% / 200% / 300%)</td>
            <td className="num">{formatMoney(otPay)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>5</td>
            <td>Thưởng hiệu suất / KPI tháng</td>
            <td>Thưởng bổ sung kỳ lương</td>
            <td className="num">{formatMoney(bonus)}</td>
          </tr>
          <tr className="subt">
            <td colSpan="3">
              <b>TỔNG THU NHẬP (GROSS) [A]</b>
            </td>
            <td className="num">
              <b>{formatMoney(gross)}</b>
            </td>
          </tr>

          <tr className="sec">
            <td colSpan="4">B. CÁC KHOẢN TRÍCH NỘP BẢO HIỂM (NLĐ ĐÓNG {totalInsRate}%)</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>1</td>
            <td>Bảo hiểm xã hội (BHXH)</td>
            <td>
              {bhxhRate}% trên lương đóng BH ({formatMoney(insSalary)})
            </td>
            <td className="num red">-{formatMoney(bhxh)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>2</td>
            <td>Bảo hiểm y tế (BHYT)</td>
            <td>
              {bhytRate}% trên lương đóng BH ({formatMoney(insSalary)})
            </td>
            <td className="num red">-{formatMoney(bhyt)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>3</td>
            <td>Bảo hiểm thất nghiệp (BHTN)</td>
            <td>
              {bhtnRate}% trên lương đóng BH ({formatMoney(insSalary)})
            </td>
            <td className="num red">-{formatMoney(bhtn)}</td>
          </tr>
          <tr className="subt">
            <td colSpan="3">
              <b>TỔNG BẢO HIỂM KHẤU TRỪ [B]</b>
            </td>
            <td className="num red">
              <b>-{formatMoney(totalIns)}</b>
            </td>
          </tr>

          <tr className="sec">
            <td colSpan="4">C. THUẾ THU NHẬP CÁ NHÂN (TNCN)</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>1</td>
            <td>Thu nhập chịu thuế</td>
            <td>Tổng thu nhập trừ phụ cấp miễn thuế &amp; OT miễn thuế</td>
            <td className="num">{formatMoney(preDedIncome)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>2</td>
            <td>Giảm trừ gia cảnh bản thân</td>
            <td>Mức giảm trừ theo quy định</td>
            <td className="num">-{formatMoney(personalDed)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>3</td>
            <td>Giảm trừ người phụ thuộc</td>
            <td>{dependents} người phụ thuộc</td>
            <td className="num">-{formatMoney(depDed)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>4</td>
            <td>Thu nhập tính thuế</td>
            <td>Sau khi trừ bảo hiểm và các khoản giảm trừ</td>
            <td className="num">{formatMoney(taxableInc)}</td>
          </tr>
          <tr className="subt">
            <td colSpan="3">
              <b>THUẾ TNCN PHẢI NỘP [C]</b>
            </td>
            <td className="num red">
              <b>-{formatMoney(tax)}</b>
            </td>
          </tr>

          <tr className="sec">
            <td colSpan="4">D. CÁC KHOẢN GIẢM TRỪ KHÁC</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>1</td>
            <td>Tạm ứng lương</td>
            <td>Tiền tạm ứng trong kỳ</td>
            <td className="num red">-{formatMoney(advance)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>2</td>
            <td>Khấu trừ khác</td>
            <td>Các khoản khấu trừ bổ sung khác</td>
            <td className="num red">-{formatMoney(otherDed)}</td>
          </tr>

          <tr className="tot">
            <td colSpan="3">
              <div className="ps-tot-lbl">THỰC LĨNH CHUYỂN KHOẢN (NET) = [A] - [B] - [C] - [D]</div>
              <div className="ps-words">
                Bằng chữ: <em>{numberToWords(net)}</em>
              </div>
            </td>
            <td className="num">
              <span className="ps-net-val">{formatMoney(net)} đ</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="ps-sign">
        <div>
          <b>NGƯỜI LẬP PHIẾU</b>
          <div className="sub">(Kế toán tiền lương)</div>
          <div className="st">{isLocked ? 'Đã chốt sổ & ký điện tử' : 'Bản dự thảo xem trước'}</div>
          <div>Phòng Tài chính - Kế toán</div>
        </div>
        <div>
          <b>NGƯỜI LAO ĐỘNG</b>
          <div className="sub">(Xác nhận nhận lương)</div>
          <div className="st">{isLocked ? 'Đã phát hành phiếu lương' : 'Chờ chốt bảng lương'}</div>
          <div>{fullName}</div>
        </div>
      </div>
    </div>
  );
}
