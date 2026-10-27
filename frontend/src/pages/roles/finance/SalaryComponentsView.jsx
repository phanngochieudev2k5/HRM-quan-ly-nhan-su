import React, { useState, useMemo } from 'react';
import {
  DollarSign, Calculator, Plus, Settings, CheckCircle2,
  Trash2, ShieldCheck, ArrowRightLeft, Sparkles
} from 'lucide-react';
import '../../../styles/roles/finance/SalaryComponentsView.css';

const DEFAULT_COMPONENTS = [
  { id: 'SC01', code: 'PC_ANTRUA', name: 'Phụ cấp ăn trưa ca', type: 'Miễn thuế TNCN', value: 730000, desc: 'Mức tối đa được miễn thuế theo thông tư 26/2015' },
  { id: 'SC02', code: 'PC_CHUYENCAN', name: 'Phụ cấp chuyên cần', type: 'Tính thuế TNCN', value: 500000, desc: 'Chỉ nhận khi số ngày nghỉ không vượt quá 1 ngày' },
  { id: 'SC03', code: 'PC_THAMNIEN', name: 'Phụ cấp thâm niên', type: 'Tính thuế TNCN', value: 100000, desc: 'Tự động nhân với số năm công tác của nhân sự' },
  { id: 'SC04', code: 'PC_XANGXE', name: 'Phụ cấp xăng xe & đi lại', type: 'Tính thuế TNCN', value: 500000, desc: 'Hỗ trợ chi phí di chuyển đối với khối kinh doanh, vận tải' },
  { id: 'SC05', code: 'TIEN_OT', name: 'Tiền làm thêm giờ (OT)', type: 'Miễn thuế phần chênh lệch', value: 0, desc: 'Nhân hệ số 1.5 ngày thường, 2.0 ngày nghỉ, 3.0 ngày lễ' }
];

export default function SalaryComponentsView() {
  const [components, setComponents] = useState(DEFAULT_COMPONENTS);
  const [calcInput, setCalcInput] = useState(30000000);
  const [calcType, setCalcType] = useState('gross');
  const [calcNpt, setCalcNpt] = useState(0);
  const [calcBhBase, setCalcBhBase] = useState(30000000);

  const [modalOpen, setModalOpen] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Tính thuế TNCN');
  const [formValue, setFormValue] = useState(500000);
  const [formDesc, setFormDesc] = useState('');

  const formatMoney = (n) => Math.round(+n || 0).toLocaleString('vi-VN');
  const formatVND = (n) => formatMoney(n) + ' đ';

  const taxSettings = {
    gtBanThan: 15500000,
    gtNPT: 6200000,
    bhxhNLD: 0.08,
    bhytNLD: 0.015,
    bhtnNLD: 0.01,
    bhxhDN: 0.175,
    bhytDN: 0.03,
    bhtnDN: 0.01,
    kpcdDN: 0.02,
    capBX: 20 * 2530000,
    capBT: 20 * 5310000,
    bac: [
      { den: 10000000, ts: 0.05 },
      { den: 30000000, ts: 0.10 },
      { den: 60000000, ts: 0.20 },
      { den: 100000000, ts: 0.30 },
      { den: Infinity, ts: 0.35 }
    ]
  };

  const calculateTax = (income) => {
    let t = 0;
    let prev = 0;
    for (const b of taxSettings.bac) {
      if (income <= prev) break;
      t += (Math.min(income, b.den) - prev) * b.ts;
      prev = b.den;
    }
    return Math.round(t);
  };

  const grossNetResult = useMemo(() => {
    const fromGross = (g, bh) => {
      const bBase = Math.min(bh || g, taxSettings.capBX);
      const btBase = Math.min(bh || g, taxSettings.capBT);
      const bhxh = Math.round(bBase * taxSettings.bhxhNLD);
      const bhyt = Math.round(bBase * taxSettings.bhytNLD);
      const bhtn = Math.round(btBase * taxSettings.bhtnNLD);
      const bhNLD = bhxh + bhyt + bhtn;

      const tnChiuThue = g;
      const giamTru = taxSettings.gtBanThan + calcNpt * taxSettings.gtNPT;
      const tnTinhThue = Math.max(0, tnChiuThue - bhNLD - giamTru);
      const thue = calculateTax(tnTinhThue);
      const net = g - bhNLD - thue;

      const bdxh = Math.round(bBase * taxSettings.bhxhDN);
      const bdyt = Math.round(bBase * taxSettings.bhytDN);
      const bdtn = Math.round(btBase * taxSettings.bhtnDN);
      const kpcd = Math.round(bBase * taxSettings.kpcdDN);
      const bhDN = bdxh + bdyt + bdtn + kpcd;
      const chiPhiDN = g + bhDN;

      return {
        gross: g,
        bhNLD,
        bhxh,
        bhyt,
        bhtn,
        giamTru,
        tnTinhThue,
        thue,
        net,
        bhDN,
        chiPhiDN
      };
    };

    if (calcType === 'gross') {
      return fromGross(calcInput, calcBhBase);
    } else {
      let lo = calcInput;
      let hi = calcInput * 2 + 10000000;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (fromGross(mid, calcBhBase).net < calcInput) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      return fromGross(Math.round(hi), calcBhBase);
    }
  }, [calcInput, calcType, calcNpt, calcBhBase]);

  const handleCreateComponent = (e) => {
    e.preventDefault();
    if (!formCode || !formName) return;
    const item = {
      id: `SC${Date.now().toString().slice(-3)}`,
      code: formCode.toUpperCase().replace(/\s+/g, '_'),
      name: formName,
      type: formType,
      value: formValue,
      desc: formDesc
    };
    setComponents(prev => [...prev, item]);
    setModalOpen(false);
    setFormCode('');
    setFormName('');
    setFormDesc('');
  };

  const handleDeleteComponent = (id) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="salary-components-container">
      <div className="ph">
        <div>
          <h1>Thành phần thu nhập & Công cụ tính Gross ⇄ Net</h1>
          <p>Cấu hình các khoản phụ cấp, bảo hiểm theo Luật 2026 và công cụ quy đổi Gross - Net tức thì</p>
        </div>
        <div className="ph-tools">
          <button className="btn pri" onClick={() => setModalOpen(true)}>
            <Plus size={15} />
            <span>Thêm thành phần phụ cấp</span>
          </button>
        </div>
      </div>

      <div className="grid c21">
        <div className="card">
          <div className="card-h">
            <h3>Danh mục thành phần lương & Phụ cấp doanh nghiệp</h3>
          </div>
          <div className="card-b" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>MÃ CODE</th>
                  <th>TÊN KHOẢN MỤC</th>
                  <th>PHÂN LOẠI THUẾ</th>
                  <th className="r">MỨC QUY ĐỊNH</th>
                  <th className="act"></th>
                </tr>
              </thead>
              <tbody>
                {components.map((comp) => (
                  <tr key={comp.id}>
                    <td><code>{comp.code}</code></td>
                    <td>
                      <b>{comp.name}</b>
                      <br />
                      <small style={{ color: '#64748b' }}>{comp.desc}</small>
                    </td>
                    <td>
                      <span className={`badge ${comp.type.includes('Miễn') ? 'b-green' : 'b-amber'}`}>
                        {comp.type}
                      </span>
                    </td>
                    <td className="r">
                      <strong>{comp.value > 0 ? formatVND(comp.value) : 'Theo biến số'}</strong>
                    </td>
                    <td className="act">
                      <button
                        className="ibtn del"
                        title="Xóa thành phần"
                        onClick={() => handleDeleteComponent(comp.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gross-net-card">
          <div className="card-h">
            <h3>Công cụ tính nhanh Gross ⇄ Net</h3>
            <span className="badge b-p">Biểu thuế 2026</span>
          </div>
          <div className="card-b">
            <div className="form">
              <label className="field full">
                <span>Số tiền quy đổi:</span>
                <input
                  type="number"
                  step="500000"
                  className="inp num"
                  value={calcInput}
                  onChange={(e) => setCalcInput(parseFloat(e.target.value) || 0)}
                />
              </label>

              <label className="field">
                <span>Loại lương nhập vào:</span>
                <select
                  className="inp"
                  value={calcType}
                  onChange={(e) => setCalcType(e.target.value)}
                >
                  <option value="gross">Lương Gross</option>
                  <option value="net">Lương Net</option>
                </select>
              </label>

              <label className="field">
                <span>Số người phụ thuộc (NPT):</span>
                <input
                  type="number"
                  min="0"
                  className="inp num"
                  value={calcNpt}
                  onChange={(e) => setCalcNpt(parseInt(e.target.value) || 0)}
                />
              </label>

              <label className="field full">
                <span>Mức lương đóng bảo hiểm:</span>
                <input
                  type="number"
                  className="inp num"
                  value={calcBhBase}
                  onChange={(e) => setCalcBhBase(parseFloat(e.target.value) || 0)}
                />
                <small>Trần BHXH/BHYT = 50.600.000 đ (20 lần lương cơ sở 2.53tr)</small>
              </label>
            </div>

            <div className="gross-net-calculator-box mt">
              <div className="calc-breakdown-row">
                <span>Lương Gross</span>
                <b>{formatVND(grossNetResult.gross)}</b>
              </div>
              <div className="calc-breakdown-row">
                <span>Bảo hiểm phần NLĐ (10.5%)</span>
                <b style={{ color: '#dc2626' }}>- {formatVND(grossNetResult.bhNLD)}</b>
              </div>
              <div className="calc-breakdown-row">
                <span>Giảm trừ gia cảnh ({calcNpt} NPT)</span>
                <b>{formatVND(grossNetResult.giamTru)}</b>
              </div>
              <div className="calc-breakdown-row">
                <span>Thu nhập tính thuế</span>
                <b>{formatVND(grossNetResult.tnTinhThue)}</b>
              </div>
              <div className="calc-breakdown-row">
                <span>Thuế TNCN khấu trừ</span>
                <b style={{ color: '#dc2626' }}>- {formatVND(grossNetResult.thue)}</b>
              </div>
              <div className="calc-breakdown-row net-highlight">
                <span>Lương thực nhận (Net)</span>
                <b>{formatVND(grossNetResult.net)}</b>
              </div>
              <div className="calc-breakdown-row">
                <span className="muted">Doanh nghiệp đóng thêm BH + KPCĐ (21.5%)</span>
                <b className="muted">{formatVND(grossNetResult.bhDN)}</b>
              </div>
              <div className="calc-breakdown-row">
                <span className="muted">Tổng chi phí doanh nghiệp</span>
                <b className="muted">{formatVND(grossNetResult.chiPhiDN)}</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-wrap" onClick={() => setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <h3>Thêm khoản mục phụ cấp mới</h3>
            </div>
            <form onSubmit={handleCreateComponent}>
              <div className="modal-b">
                <div className="form">
                  <label className="field">
                    <span>Mã code (Viết hoa không dấu):</span>
                    <input
                      className="inp"
                      required
                      placeholder="PC_CONGTAC"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Tên thành phần:</span>
                    <input
                      className="inp"
                      required
                      placeholder="Phụ cấp công tác"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Tính thuế TNCN:</span>
                    <select
                      className="inp"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                    >
                      <option value="Tính thuế TNCN">Tính thuế TNCN</option>
                      <option value="Miễn thuế TNCN">Miễn thuế TNCN</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Số tiền định mức (VNĐ):</span>
                    <input
                      type="number"
                      step="50000"
                      className="inp num"
                      value={formValue}
                      onChange={(e) => setFormValue(parseFloat(e.target.value) || 0)}
                    />
                  </label>
                  <label className="field full">
                    <span>Mô tả điều kiện hưởng:</span>
                    <textarea
                      className="inp"
                      rows="2"
                      placeholder="Quy định và đối tượng áp dụng chi trả..."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                    />
                  </label>
                </div>
              </div>
              <div className="modal-f">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn pri">
                  Lưu khoản mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
