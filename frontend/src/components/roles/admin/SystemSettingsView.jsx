import React, { useState } from 'react';
import {
  Building2, Clock, Shield, Percent, Camera,
  CheckCircle2, Save, RotateCcw
} from 'lucide-react';
import '../../../styles/roles/admin/SystemSettingsView.css';

export default function SystemSettingsView() {
  const [activeTab, setActiveTab] = useState('company');
  const [toastMessage, setToastMessage] = useState('');

  const [company, setCompany] = useState({
    ten: 'Công ty Cổ phần Công nghệ Enterprise VN',
    diaChi: 'Số 12 Phố Mẫu, Quận Cầu Giấy, TP. Hà Nội',
    sdt: '024 3999 8888',
    email: 'contact@enterprise.vn',
    mst: '0101 234 567',
    website: 'https://enterprise.vn'
  });

  const [workSettings, setWorkSettings] = useState({
    congChuan: 26,
    gioCong: 8,
    heSoOT: 1.5,
    ccNghiToiDa: 1,
    ngayNghi: 'CN'
  });

  const [departments, setDepartments] = useState([
    'Ban Giám Đốc',
    'Khối Kỹ Thuật (IT)',
    'Phòng Kế Toán',
    'Phòng Nhân Sự',
    'Khối Sản Xuất',
    'Khối Kinh Doanh'
  ].join('\n'));

  const [insurance, setInsurance] = useState({
    luongCoSo: 2530000,
    luongCoSoCu: 2340000,
    ltVung: 5310000,
    ltVungCu: 4960000,
    bhxhNLD: 8,
    bhytNLD: 1.5,
    bhtnNLD: 1,
    bhxhDN: 17.5,
    bhytDN: 3,
    bhtnDN: 1,
    kpcdDN: 2
  });

  const [tax, setTax] = useState({
    gtBanThan: 15500000,
    gtNPT: 6200000,
    bac: [
      { den: 10000000, ts: 5 },
      { den: 30000000, ts: 10 },
      { den: 60000000, ts: 20 },
      { den: 100000000, ts: 30 },
      { den: 0, ts: 35 }
    ]
  });

  const [camera, setCamera] = useState({
    rtspUrl: 'rtsp://admin:admin123@192.168.1.100:554/live',
    threshold: 95,
    liveness: true,
    model: 'OpenCV ResNet50 Deep Learning'
  });

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleSave = (e) => {
    e.preventDefault();
    showNotification('Đã lưu toàn bộ cấu hình hệ thống thành công!');
  };

  const handleResetTax = () => {
    setTax({
      gtBanThan: 15500000,
      gtNPT: 6200000,
      bac: [
        { den: 10000000, ts: 5 },
        { den: 30000000, ts: 10 },
        { den: 60000000, ts: 20 },
        { den: 100000000, ts: 30 },
        { den: 0, ts: 35 }
      ]
    });
    showNotification('Đã khôi phục biểu thuế 5 bậc theo quy định 2026!');
  };

  const formatMoney = (n) => Math.round(+n || 0).toLocaleString('vi-VN');

  return (
    <div className="system-settings-container">
      <div className="ph">
        <div>
          <h1>Cài đặt hệ thống & Tham số doanh nghiệp</h1>
          <p>Thông tin công ty, công chuẩn, tỷ lệ trích nộp bảo hiểm xã hội và biểu thuế TNCN 2026</p>
        </div>
        <div className="ph-tools">
          <button className="btn pri" onClick={handleSave}>
            <Save size={15} />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="banner" style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#15803d' }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="attendance-tabs-header">
        <button
          className={`attendance-tab-btn ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          <Building2 size={16} />
          <span>Thông tin công ty</span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <Clock size={16} />
          <span>Chấm công & Làm thêm giờ</span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'insurance' ? 'active' : ''}`}
          onClick={() => setActiveTab('insurance')}
        >
          <Shield size={16} />
          <span>Bảo hiểm bắt buộc</span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'tax' ? 'active' : ''}`}
          onClick={() => setActiveTab('tax')}
        >
          <Percent size={16} />
          <span>Thuế thu nhập cá nhân (TNCN)</span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => setActiveTab('camera')}
        >
          <Camera size={16} />
          <span>Cấu hình OpenCV Kiosk</span>
        </button>
      </div>

      {activeTab === 'company' && (
        <div className="grid c2">
          <div className="card">
            <div className="card-h">
              <h3>Thông tin pháp lý doanh nghiệp</h3>
            </div>
            <div className="card-b">
              <div className="form">
                <label className="field full">
                  <span>Tên công ty / Doanh nghiệp:</span>
                  <input
                    className="inp"
                    value={company.ten}
                    onChange={(e) => setCompany({ ...company, ten: e.target.value })}
                  />
                </label>
                <label className="field full">
                  <span>Địa chỉ trụ sở chính:</span>
                  <input
                    className="inp"
                    value={company.diaChi}
                    onChange={(e) => setCompany({ ...company, diaChi: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Số điện thoại:</span>
                  <input
                    className="inp"
                    value={company.sdt}
                    onChange={(e) => setCompany({ ...company, sdt: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Email liên hệ:</span>
                  <input
                    className="inp"
                    value={company.email}
                    onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Mã số thuế doanh nghiệp:</span>
                  <input
                    className="inp"
                    value={company.mst}
                    onChange={(e) => setCompany({ ...company, mst: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Website:</span>
                  <input
                    className="inp"
                    value={company.website}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <h3>Danh mục phòng ban trực thuộc</h3>
            </div>
            <div className="card-b">
              <div className="field">
                <span>Danh sách phòng ban (Mỗi dòng một phòng ban):</span>
                <textarea
                  className="inp"
                  rows="8"
                  value={departments}
                  onChange={(e) => setDepartments(e.target.value)}
                />
                <small>Hệ thống tự động đồng bộ danh sách này vào bộ lọc nhân sự và phân bổ chi phí lương.</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="card">
          <div className="card-h">
            <h3>Quy chuẩn công chuẩn & Chính sách làm thêm giờ</h3>
          </div>
          <div className="card-b">
            <div className="form">
              <label className="field">
                <span>Số công chuẩn trong tháng:</span>
                <input
                  type="number"
                  className="inp num"
                  value={workSettings.congChuan}
                  onChange={(e) => setWorkSettings({ ...workSettings, congChuan: parseFloat(e.target.value) || 26 })}
                />
                <small>Thường là 26 ngày (nghỉ CN) hoặc 22 ngày (nghỉ T7, CN)</small>
              </label>

              <label className="field">
                <span>Số giờ làm việc / ngày công:</span>
                <input
                  type="number"
                  className="inp num"
                  value={workSettings.gioCong}
                  onChange={(e) => setWorkSettings({ ...workSettings, gioCong: parseFloat(e.target.value) || 8 })}
                />
              </label>

              <label className="field">
                <span>Hệ số làm thêm giờ (OT ngày thường):</span>
                <input
                  type="number"
                  step="0.1"
                  className="inp num"
                  value={workSettings.heSoOT}
                  onChange={(e) => setWorkSettings({ ...workSettings, heSoOT: parseFloat(e.target.value) || 1.5 })}
                />
                <small>Quy định Bộ luật lao động: Ngày thường 1.5, Ngày nghỉ tuần 2.0, Lễ Tết 3.0</small>
              </label>

              <label className="field">
                <span>Chuyên cần: Số ngày nghỉ tối đa:</span>
                <input
                  type="number"
                  className="inp num"
                  value={workSettings.ccNghiToiDa}
                  onChange={(e) => setWorkSettings({ ...workSettings, ccNghiToiDa: parseFloat(e.target.value) || 0 })}
                />
                <small>Nghỉ không lương vượt mức này sẽ bị cắt phụ cấp chuyên cần trong tháng</small>
              </label>

              <label className="field full">
                <span>Ngày nghỉ tuần cố định:</span>
                <select
                  className="inp"
                  value={workSettings.ngayNghi}
                  onChange={(e) => setWorkSettings({ ...workSettings, ngayNghi: e.target.value })}
                >
                  <option value="CN">Chủ nhật</option>
                  <option value="T7CN">Thứ 7 và Chủ nhật</option>
                </select>
              </label>

              <div className="banner full" style={{ margin: 0 }}>
                <b>Lưu ý chính sách thuế 2026:</b> Toàn bộ tiền làm thêm giờ (OT) và làm ban đêm của người cư trú được miễn thuế thu nhập cá nhân theo Luật Thuế TNCN mới.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insurance' && (
        <div className="card">
          <div className="card-h">
            <h3>Tỷ lệ trích nộp bảo hiểm bắt buộc (Luật BHXH 2026)</h3>
          </div>
          <div className="card-b">
            <div className="form f3">
              <label className="field">
                <span>Lương cơ sở áp dụng (VNĐ):</span>
                <input
                  type="number"
                  className="inp num"
                  value={insurance.luongCoSo}
                  onChange={(e) => setInsurance({ ...insurance, luongCoSo: parseFloat(e.target.value) || 0 })}
                />
                <small>Trần đóng BHXH, BHYT = 20 lần mức lương cơ sở</small>
              </label>

              <label className="field">
                <span>Lương tối thiểu vùng I (VNĐ):</span>
                <input
                  type="number"
                  className="inp num"
                  value={insurance.ltVung}
                  onChange={(e) => setInsurance({ ...insurance, ltVung: parseFloat(e.target.value) || 0 })}
                />
                <small>Trần đóng BHTN = 20 lần lương tối thiểu vùng</small>
              </label>

              <div className="fsec">Phần người lao động đóng (Trừ vào lương: 10.5%)</div>
              <label className="field">
                <span>BHXH (Hưu trí & Tử tuất):</span>
                <input
                  type="number"
                  step="0.1"
                  className="inp num"
                  value={insurance.bhxhNLD}
                  onChange={(e) => setInsurance({ ...insurance, bhxhNLD: parseFloat(e.target.value) || 0 })}
                />
              </label>
              <label className="field">
                <span>BHYT (Y tế):</span>
                <input
                  type="number"
                  step="0.1"
                  className="inp num"
                  value={insurance.bhytNLD}
                  onChange={(e) => setInsurance({ ...insurance, bhytNLD: parseFloat(e.target.value) || 0 })}
                />
              </label>
              <label className="field">
                <span>BHTN (Thất nghiệp):</span>
                <input
                  type="number"
                  step="0.1"
                  className="inp num"
                  value={insurance.bhtnNLD}
                  onChange={(e) => setInsurance({ ...insurance, bhtnNLD: parseFloat(e.target.value) || 0 })}
                />
              </label>

              <div className="fsec">Phần người sử dụng lao động đóng (Doanh nghiệp chi trả thêm: 21.5%)</div>
              <label className="field">
                <span>BHXH doanh nghiệp:</span>
                <input
                  type="number"
                  step="0.1"
                  className="inp num"
                  value={insurance.bhxhDN}
                  onChange={(e) => setInsurance({ ...insurance, bhxhDN: parseFloat(e.target.value) || 0 })}
                />
              </label>
              <label className="field">
                <span>BHYT doanh nghiệp:</span>
                <input
                  type="number"
                  step="0.1"
                  className="inp num"
                  value={insurance.bhytDN}
                  onChange={(e) => setInsurance({ ...insurance, bhytDN: parseFloat(e.target.value) || 0 })}
                />
              </label>
              <label className="field">
                <span>BHTN doanh nghiệp:</span>
                <input
                  type="number"
                  step="0.1"
                  className="inp num"
                  value={insurance.bhtnDN}
                  onChange={(e) => setInsurance({ ...insurance, bhtnDN: parseFloat(e.target.value) || 0 })}
                />
              </label>
              <label className="field">
                <span>Kinh phí công đoàn (KPCĐ):</span>
                <input
                  type="number"
                  step="0.1"
                  className="inp num"
                  value={insurance.kpcdDN}
                  onChange={(e) => setInsurance({ ...insurance, kpcdDN: parseFloat(e.target.value) || 0 })}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tax' && (
        <div className="card">
          <div className="card-h">
            <h3>Thuế thu nhập cá nhân (Biểu lũy tiến từng phần 5 bậc 2026)</h3>
            <div className="ph-tools">
              <button className="btn sm" onClick={handleResetTax}>
                <RotateCcw size={14} />
                <span>Về mặc định Luật 2026</span>
              </button>
            </div>
          </div>
          <div className="card-b">
            <div className="form">
              <label className="field">
                <span>Giảm trừ bản thân (đồng / tháng):</span>
                <input
                  type="number"
                  step="500000"
                  className="inp num"
                  value={tax.gtBanThan}
                  onChange={(e) => setTax({ ...tax, gtBanThan: parseFloat(e.target.value) || 0 })}
                />
                <small>Mức áp dụng: 15.500.000 đ/tháng</small>
              </label>

              <label className="field">
                <span>Giảm trừ mỗi người phụ thuộc (đồng / tháng):</span>
                <input
                  type="number"
                  step="100000"
                  className="inp num"
                  value={tax.gtNPT}
                  onChange={(e) => setTax({ ...tax, gtNPT: parseFloat(e.target.value) || 0 })}
                />
                <small>Mức áp dụng: 6.200.000 đ/tháng / người</small>
              </label>
            </div>

            <table className="tbl mt">
              <thead>
                <tr>
                  <th className="c" style={{ width: '60px' }}>BẬC</th>
                  <th>THU NHẬP TÍNH THUẾ ĐẾN (ĐỒNG / THÁNG)</th>
                  <th className="r">THUẾ SUẤT (%)</th>
                </tr>
              </thead>
              <tbody>
                {tax.bac.map((b, idx) => (
                  <tr key={idx}>
                    <td className="c"><strong>Bậc {idx + 1}</strong></td>
                    <td>
                      {b.den > 0 ? (
                        <span>Đến {formatMoney(b.den)} đ</span>
                      ) : (
                        <span>Trên 100.000.000 đ (Không giới hạn)</span>
                      )}
                    </td>
                    <td className="r">
                      <strong style={{ color: '#0f766e', fontSize: '14px' }}>{b.ts}%</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'camera' && (
        <div className="card">
          <div className="card-h">
            <h3>Cấu hình Kiosk OpenCV Face ID</h3>
          </div>
          <div className="card-b">
            <div className="form">
              <label className="field full">
                <span>Đường dẫn luồng Camera RTSP:</span>
                <input
                  className="inp"
                  value={camera.rtspUrl}
                  onChange={(e) => setCamera({ ...camera, rtspUrl: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Ngưỡng độ tin cậy nhận diện (%):</span>
                <input
                  type="number"
                  className="inp num"
                  value={camera.threshold}
                  onChange={(e) => setCamera({ ...camera, threshold: parseInt(e.target.value) || 90 })}
                />
              </label>
              <label className="field">
                <span>Mô hình AI:</span>
                <input
                  className="inp"
                  value={camera.model}
                  onChange={(e) => setCamera({ ...camera, model: e.target.value })}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
