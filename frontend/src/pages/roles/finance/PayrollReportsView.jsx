import React, { useState } from 'react';
import {
  FileSpreadsheet, Printer, Download, CreditCard,
  Building2, Percent, Shield, ArrowUpRight
} from 'lucide-react';
import '../../../styles/roles/finance/PayrollReportsView.css';

export default function PayrollReportsView() {
  const [activeTab, setActiveTab] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState('2026');

  const formatMoney = (n) => Math.round(+n || 0).toLocaleString('vi-VN');
  const formatVND = (n) => formatMoney(n) + ' đ';

  const monthlyReport = [
    { month: 'Tháng 01/2026', emps: 7, gross: 198000000, tnct: 192890000, bhNld: 14700000, bhDn: 30100000, tax: 13900000, net: 169400000 },
    { month: 'Tháng 02/2026', emps: 7, gross: 205000000, tnct: 199890000, bhNld: 14700000, bhDn: 30100000, tax: 14850000, net: 175450000 },
    { month: 'Tháng 03/2026', emps: 7, gross: 199500000, tnct: 194390000, bhNld: 14700000, bhDn: 30100000, tax: 14200000, net: 170600000 },
    { month: 'Tháng 04/2026', emps: 7, gross: 201200000, tnct: 196090000, bhNld: 14700000, bhDn: 30100000, tax: 14620000, net: 171880000 }
  ];

  const taxSettlement = [
    { ma: 'NV001', ten: 'Nguyễn Văn A', mst: '8029381729', npt: 1, months: 4, gross: 204000000, tnct: 201080000, bh: 17001600, deduction: 86800000, tax: 18545680 },
    { ma: 'NV002', ten: 'Trần Thị Bích', mst: '8492019284', npt: 0, months: 4, gross: 150000000, tnct: 147080000, bh: 13440000, deduction: 62000000, tax: 10764000 },
    { ma: 'NV003', ten: 'Lê Hoàng Long', mst: '8719283719', npt: 1, months: 4, gross: 110396924, tnct: 107476924, bh: 9240000, deduction: 86800000, tax: 571846 },
    { ma: 'NV004', ten: 'Phạm Minh Đức', mst: '8129384712', npt: 2, months: 4, gross: 118000000, tnct: 115080000, bh: 10080000, deduction: 111600000, tax: 0 },
    { ma: 'NV005', ten: 'Vũ Thị Hoa', mst: '8291029381', npt: 0, months: 4, gross: 74800000, tnct: 71880000, bh: 6720000, deduction: 62000000, tax: 158000 },
    { ma: 'NV006', ten: 'Đỗ Gia Huy', mst: '8392019283', npt: 1, months: 4, gross: 66000000, tnct: 63080000, bh: 5460000, deduction: 86800000, tax: 0 },
    { ma: 'NV007', ten: 'Hoàng Quốc Bảo', mst: '8491029384', npt: 0, months: 4, gross: 80500000, tnct: 77580000, bh: 7560000, deduction: 62000000, tax: 401000 }
  ];

  const bankPayout = [
    { ma: 'NV001', ten: 'Nguyễn Văn A', stk: '19036789123456', bank: 'Techcombank', amount: 42150000, note: 'Lương T04/2026' },
    { ma: 'NV002', ten: 'Trần Thị Bích', stk: '102839485712', bank: 'Vietcombank', amount: 31200000, note: 'Lương T04/2026' },
    { ma: 'NV003', ten: 'Lê Hoàng Long', stk: '045100039281', bank: 'Vietcombank', amount: 23209769, note: 'Lương T04/2026' },
    { ma: 'NV004', ten: 'Phạm Minh Đức', stk: '190333444555', bank: 'Techcombank', amount: 24800000, note: 'Lương T04/2026' },
    { ma: 'NV005', ten: 'Vũ Thị Hoa', stk: '215100012398', bank: 'BIDV', amount: 15420000, note: 'Lương T04/2026' },
    { ma: 'NV006', ten: 'Đỗ Gia Huy', stk: '109827364512', bank: 'VietinBank', amount: 12300000, note: 'Lương T04/2026' },
    { ma: 'NV007', ten: 'Hoàng Quốc Bảo', stk: '007100019283', bank: 'Vietcombank', amount: 22800000, note: 'Lương T04/2026' }
  ];

  const totalBankAmount = bankPayout.reduce((s, x) => s + x.amount, 0);

  return (
    <div className="payroll-reports-container">
      <div className="ph">
        <div>
          <h1>Báo cáo thuế TNCN, bảo hiểm & Chi trả ngân hàng</h1>
          <p>Quyết toán theo người lao động cả năm, tổng hợp quỹ lương trích nộp và lệnh chi ngân hàng</p>
        </div>
        <div className="ph-tools">
          <label className="mp">
            <span>Năm:</span>
            <select
              className="inp"
              style={{ border: 0, padding: 0 }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2026">Năm 2026</option>
              <option value="2025">Năm 2025</option>
            </select>
          </label>
          <button className="btn" onClick={() => window.print()}>
            <Printer size={15} />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      <div className="attendance-tabs-header">
        <button
          className={`attendance-tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          <Percent size={16} />
          <span>Tổng hợp thuế & BH theo tháng ({selectedYear})</span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'tax' ? 'active' : ''}`}
          onClick={() => setActiveTab('tax')}
        >
          <Building2 size={16} />
          <span>Quyết toán thuế TNCN theo nhân viên</span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank')}
        >
          <CreditCard size={16} />
          <span>Lệnh chuyển khoản ngân hàng (Payout)</span>
        </button>
      </div>

      {activeTab === 'monthly' && (
        <div className="card">
          <div className="card-h">
            <h3>Bảng trích nộp bảo hiểm & Thuế TNCN năm {selectedYear}</h3>
          </div>
          <div className="card-b" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>KỲ LƯƠNG</th>
                  <th className="c">SỐ NV</th>
                  <th className="r">TỔNG THU NHẬP (GROSS)</th>
                  <th className="r">TN CHỊU THUẾ</th>
                  <th className="r">BH NLĐ (10.5%)</th>
                  <th className="r">BH + KPCĐ DN (21.5%)</th>
                  <th className="r">THUẾ TNCN</th>
                  <th className="r">THỰC LĨNH</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport.map((m) => (
                  <tr key={m.month}>
                    <td><b>{m.month}</b></td>
                    <td className="c">{m.emps}</td>
                    <td className="r">{formatMoney(m.gross)}</td>
                    <td className="r">{formatMoney(m.tnct)}</td>
                    <td className="r" style={{ color: '#7c3aed' }}>{formatMoney(m.bhNld)}</td>
                    <td className="r" style={{ color: '#0369a1' }}>{formatMoney(m.bhDn)}</td>
                    <td className="r" style={{ color: '#d97706', fontWeight: 600 }}>{formatMoney(m.tax)}</td>
                    <td className="r" style={{ color: '#0f766e', fontWeight: 700 }}>{formatMoney(m.net)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>TỔNG CỘNG</td>
                  <td className="c">7</td>
                  <td className="r">{formatMoney(803700000)}</td>
                  <td className="r">{formatMoney(783260000)}</td>
                  <td className="r">{formatMoney(58800000)}</td>
                  <td className="r">{formatMoney(120400000)}</td>
                  <td className="r">{formatMoney(57570000)}</td>
                  <td className="r">{formatMoney(687330000)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tax' && (
        <div className="card">
          <div className="card-h">
            <h3>Quyết toán thuế TNCN theo từng cá nhân · Năm {selectedYear}</h3>
            <span className="sub">Biểu thuế lũy tiến từng phần Luật 2026</span>
          </div>
          <div className="card-b" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>MÃ NV</th>
                  <th>HỌ VÀ TÊN</th>
                  <th>MÃ SỐ THUẾ</th>
                  <th className="c">NPT</th>
                  <th className="c">SỐ THÁNG</th>
                  <th className="r">TN CHỊU THUẾ</th>
                  <th className="r">BH BẮT BUỘC</th>
                  <th className="r">GIẢM TRỪ GIA CẢNH</th>
                  <th className="r">THUẾ ĐÃ KHẤU TRỪ</th>
                </tr>
              </thead>
              <tbody>
                {taxSettlement.map((row) => (
                  <tr key={row.ma}>
                    <td><code>{row.ma}</code></td>
                    <td><b>{row.ten}</b></td>
                    <td>{row.mst}</td>
                    <td className="c">{row.npt}</td>
                    <td className="c">{row.months}</td>
                    <td className="r">{formatMoney(row.tnct)}</td>
                    <td className="r">{formatMoney(row.bh)}</td>
                    <td className="r">{formatMoney(row.deduction)}</td>
                    <td className="r" style={{ color: '#d97706', fontWeight: 700 }}>
                      {formatMoney(row.tax)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bank' && (
        <div className="card">
          <div className="card-h">
            <h3>Bảng kê ủy nhiệm chi lương ngân hàng</h3>
            <span className="sub">Tổng lệnh chi: <strong>{formatVND(totalBankAmount)}</strong></span>
          </div>
          <div className="card-b" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th className="c">STT</th>
                  <th>MÃ NV</th>
                  <th>NGƯỜI THỤ HƯỞNG</th>
                  <th>NGÂN HÀNG</th>
                  <th>SỐ TÀI KHOẢN</th>
                  <th className="r">SỐ TIỀN CHI TRẢ</th>
                  <th>NỘI DUNG CHUYỂN TIỀN</th>
                </tr>
              </thead>
              <tbody>
                {bankPayout.map((b, idx) => (
                  <tr key={b.ma}>
                    <td className="c">{idx + 1}</td>
                    <td><code>{b.ma}</code></td>
                    <td><b>{b.ten}</b></td>
                    <td>{b.bank}</td>
                    <td><strong>{b.stk}</strong></td>
                    <td className="r" style={{ color: '#0f766e', fontWeight: 800 }}>
                      {formatVND(b.amount)}
                    </td>
                    <td>{b.note}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5">TỔNG CỘNG TIỀN CHI LƯƠNG</td>
                  <td className="r" style={{ color: '#0f766e', fontWeight: 800, fontSize: '14px' }}>
                    {formatVND(totalBankAmount)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
