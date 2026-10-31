import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

export default function EmployeeModal({ isOpen, onClose, onSave, employee = null, departments = [], positions = [] }) {
  const isEdit = !!employee?.EmployeeId;

  const [formData, setFormData] = useState({
    EmployeeCode: '',
    FullName: '',
    Gender: 'Nam',
    BirthDate: '1995-01-01',
    Phone: '',
    Email: '',
    Address: '',
    IdCardNumber: '',
    IdCardDate: '',
    IdCardPlace: '',
    TaxCode: '',
    InsuranceBookNumber: '',
    BankName: 'Vietcombank',
    BankAccountNumber: '',
    DependentsCount: 0,
    DepartmentId: '',
    PositionId: '',
    JoinDate: new Date().toISOString().slice(0, 10),
    WorkStatus: 'Đang làm việc',
    BaseSalary: 15000000,
    InsuranceSalary: 15000000,
    FaceRegistered: false,
    AvatarUrl: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        EmployeeCode: employee.EmployeeCode || employee.id || '',
        FullName: employee.FullName || employee.name || '',
        Gender: employee.Gender || employee.gender || 'Nam',
        BirthDate: employee.BirthDate || employee.birthDate || '',
        Phone: employee.Phone || employee.phone || '',
        Email: employee.Email || employee.email || '',
        Address: employee.Address || employee.address || '',
        IdCardNumber: employee.IdCardNumber || employee.idCard || '',
        IdCardDate: employee.IdCardDate || employee.idCardDate || '',
        IdCardPlace: employee.IdCardPlace || employee.idCardPlace || '',
        TaxCode: employee.TaxCode || employee.taxCode || '',
        InsuranceBookNumber: employee.InsuranceBookNumber || employee.insuranceBookNumber || '',
        BankName: employee.BankName || employee.bankName || 'Vietcombank',
        BankAccountNumber: employee.BankAccountNumber || employee.bankAccount || '',
        DependentsCount: employee.DependentsCount ?? employee.dependents ?? 0,
        DepartmentId: employee.DepartmentId || '',
        PositionId: employee.PositionId || '',
        JoinDate: employee.JoinDate || employee.joinDate || new Date().toISOString().slice(0, 10),
        WorkStatus: employee.WorkStatus || employee.status || 'Đang làm việc',
        BaseSalary: employee.BaseSalary ?? employee.baseSalary ?? 15000000,
        InsuranceSalary: employee.InsuranceSalary ?? employee.insuranceSalary ?? 15000000,
        FaceRegistered: !!(employee.FaceRegistered ?? employee.faceRegistered),
        AvatarUrl: employee.AvatarUrl || employee.avatar || ''
      });
    } else {
      setFormData({
        EmployeeCode: '',
        FullName: '',
        Gender: 'Nam',
        BirthDate: '1995-01-01',
        Phone: '',
        Email: '',
        Address: '',
        IdCardNumber: '',
        IdCardDate: '',
        IdCardPlace: '',
        TaxCode: '',
        InsuranceBookNumber: '',
        BankName: 'Vietcombank',
        BankAccountNumber: '',
        DependentsCount: 0,
        DepartmentId: departments[0]?.DepartmentId || '',
        PositionId: positions[0]?.PositionId || '',
        JoinDate: new Date().toISOString().slice(0, 10),
        WorkStatus: 'Đang làm việc',
        BaseSalary: 15000000,
        InsuranceSalary: 15000000,
        FaceRegistered: false,
        AvatarUrl: ''
      });
    }
    setErrorMsg('');
  }, [employee, departments, positions, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.FullName || !formData.FullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên nhân viên!');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onSave(formData);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi lưu thông tin nhân sự!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEdit ? <Save size={20} style={{ color: '#0f766e' }} /> : <UserPlus size={20} style={{ color: '#0f766e' }} />}
            <h3>{isEdit ? `Cập nhật hồ sơ: ${formData.FullName || formData.EmployeeCode}` : 'Thêm mới hồ sơ nhân sự (tblEmployee)'}</h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ margin: '14px 20px 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-b" style={{ padding: '16px 20px' }}>
            <div className="form">
              {/* PHẦN 1 */}
              <div className="fsec" style={{ color: '#0f766e', fontWeight: 700 }}>1. Thông tin lý lịch & Định danh cá nhân</div>

              <label className="field">
                <span>Mã nhân viên: <i className="req">*</i></span>
                <input
                  name="EmployeeCode"
                  className="inp"
                  required
                  placeholder="Để trống để tự tạo (VD: NV010)"
                  value={formData.EmployeeCode}
                  onChange={handleChange}
                  disabled={isEdit}
                />
              </label>

              <label className="field">
                <span>Họ và tên: <i className="req">*</i></span>
                <input
                  name="FullName"
                  className="inp"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.FullName}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Giới tính:</span>
                <select name="Gender" className="inp" value={formData.Gender} onChange={handleChange}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </label>

              <label className="field">
                <span>Ngày sinh:</span>
                <input
                  type="date"
                  name="BirthDate"
                  className="inp"
                  value={formData.BirthDate}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Số điện thoại:</span>
                <input
                  name="Phone"
                  className="inp"
                  placeholder="0912345678"
                  value={formData.Phone}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Email:</span>
                <input
                  type="email"
                  name="Email"
                  className="inp"
                  placeholder="nhanvien@company.vn"
                  value={formData.Email}
                  onChange={handleChange}
                />
              </label>

              <label className="field" style={{ gridColumn: 'span 2' }}>
                <span>Địa chỉ thường trú:</span>
                <input
                  name="Address"
                  className="inp"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP"
                  value={formData.Address}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Số CCCD / CMND:</span>
                <input
                  name="IdCardNumber"
                  className="inp"
                  placeholder="001095001234"
                  value={formData.IdCardNumber}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Ngày cấp CCCD:</span>
                <input
                  type="date"
                  name="IdCardDate"
                  className="inp"
                  value={formData.IdCardDate}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Nơi cấp CCCD:</span>
                <input
                  name="IdCardPlace"
                  className="inp"
                  placeholder="Cục CS QLHC về TTXH"
                  value={formData.IdCardPlace}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Ảnh đại diện (URL):</span>
                <input
                  name="AvatarUrl"
                  className="inp"
                  placeholder="https://..."
                  value={formData.AvatarUrl}
                  onChange={handleChange}
                />
              </label>

              {/* PHẦN 2 */}
              <div className="fsec" style={{ color: '#0f766e', fontWeight: 700, marginTop: '10px' }}>2. Phòng ban & Vị trí công tác</div>

              <label className="field">
                <span>Phòng ban:</span>
                <select name="DepartmentId" className="inp" value={formData.DepartmentId} onChange={handleChange}>
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map(d => (
                    <option key={d.DepartmentId} value={d.DepartmentId}>
                      {d.DepartmentName} ({d.DepartmentCode})
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Chức vụ:</span>
                <select name="PositionId" className="inp" value={formData.PositionId} onChange={handleChange}>
                  <option value="">-- Chọn chức vụ --</option>
                  {positions.map(p => (
                    <option key={p.PositionId} value={p.PositionId}>
                      {p.PositionName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Ngày vào làm:</span>
                <input
                  type="date"
                  name="JoinDate"
                  className="inp"
                  value={formData.JoinDate}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Trạng thái làm việc:</span>
                <select name="WorkStatus" className="inp" value={formData.WorkStatus} onChange={handleChange}>
                  <option value="Đang làm việc">Đang làm việc</option>
                  <option value="Thử việc">Thử việc</option>
                  <option value="Tạm hoãn">Tạm hoãn</option>
                  <option value="Đã thôi việc">Đã thôi việc</option>
                </select>
              </label>

              {/* PHẦN 3 */}
              <div className="fsec" style={{ color: '#0f766e', fontWeight: 700, marginTop: '10px' }}>3. Chế độ lương, Thuế & Tài khoản ngân hàng</div>

              <label className="field">
                <span>Lương cơ bản (VNĐ): <i className="req">*</i></span>
                <input
                  type="number"
                  step="500000"
                  name="BaseSalary"
                  className="inp num"
                  required
                  value={formData.BaseSalary}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Lương đóng BHXH:</span>
                <input
                  type="number"
                  step="500000"
                  name="InsuranceSalary"
                  className="inp num"
                  value={formData.InsuranceSalary}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Số người phụ thuộc (NPT):</span>
                <input
                  type="number"
                  min="0"
                  name="DependentsCount"
                  className="inp num"
                  value={formData.DependentsCount}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Mã số thuế cá nhân:</span>
                <input
                  name="TaxCode"
                  className="inp"
                  placeholder="8019283741"
                  value={formData.TaxCode}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Số sổ BHXH:</span>
                <input
                  name="InsuranceBookNumber"
                  className="inp"
                  placeholder="7912345678"
                  value={formData.InsuranceBookNumber}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Ngân hàng thụ hưởng:</span>
                <input
                  name="BankName"
                  className="inp"
                  placeholder="Vietcombank, MB Bank, Techcombank..."
                  value={formData.BankName}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Số tài khoản ngân hàng:</span>
                <input
                  name="BankAccountNumber"
                  className="inp"
                  placeholder="19036789123456"
                  value={formData.BankAccountNumber}
                  onChange={handleChange}
                />
              </label>

              <div className="field" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="FaceRegisteredCheckbox"
                  name="FaceRegistered"
                  checked={formData.FaceRegistered}
                  onChange={handleChange}
                  style={{ width: '17px', height: '17px', accentColor: '#0f766e', cursor: 'pointer' }}
                />
                <label htmlFor="FaceRegisteredCheckbox" style={{ fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                  Đã hoàn tất đăng ký dữ liệu nhận diện khuôn mặt OpenCV (FaceRegistered)
                </label>
              </div>
            </div>
          </div>

          <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn pri" disabled={submitting}>
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu cập nhật' : 'Thêm mới nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

