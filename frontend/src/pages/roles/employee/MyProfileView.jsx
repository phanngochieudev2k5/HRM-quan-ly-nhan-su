import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Building, Briefcase, Calendar, ShieldCheck,
  CreditCard, Edit3, X, Save, CheckCircle2, FileText, AlertCircle, RefreshCw,
  Award, ShieldAlert, DollarSign, UserCheck, Check, Sparkles, Building2
} from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import AuthService from '../../../services/AuthService';
import EmployeeService from '../../../services/EmployeeService';
import '../../../styles/roles/employee/MyProfileView.css';

export default function MyProfileView({ user, onUserUpdate }) {
  const [currentUser, setCurrentUser] = useState(user || AuthService.getCurrentUser() || {});
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'Nam',
    birthDate: '',
    address: '',
    idCardNumber: '',
    idCardDate: '',
    idCardPlace: '',
    bankName: '',
    bankAccountNumber: ''
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await EmployeeService.getMyProfile();
      if (data) {
        setProfile(data);
        setCurrentUser(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Không thể tải hồ sơ cá nhân.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleOpenEdit = () => {
    const p = profile || currentUser;
    setEditFormData({
      fullName: p.FullName || p.fullName || p.name || '',
      phone: p.Phone || p.phone || '',
      email: p.Email || p.email || '',
      gender: p.Gender || p.gender || 'Nam',
      birthDate: p.BirthDate || p.birthDate || '',
      address: p.Address || p.address || '',
      idCardNumber: p.IdCardNumber || p.idCardNumber || p.idCard || '',
      idCardDate: p.IdCardDate || '',
      idCardPlace: p.IdCardPlace || '',
      bankName: p.BankName || p.bankName || 'Vietcombank',
      bankAccountNumber: p.BankAccountNumber || p.bankAccountNumber || ''
    });
    setSuccessMsg('');
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');
      const updated = await EmployeeService.updateMyProfile(editFormData);
      if (updated) {
        setProfile(updated);
        const userObj = {
          ...currentUser,
          ...updated,
          name: updated.FullName,
          fullName: updated.FullName,
          phone: updated.Phone,
          email: updated.Email,
          address: updated.Address,
          idCardNumber: updated.IdCardNumber,
          bankName: updated.BankName,
          bankAccountNumber: updated.BankAccountNumber
        };
        setCurrentUser(userObj);
        AuthService.setSession(null, userObj);
        if (onUserUpdate) {
          onUserUpdate(userObj);
        }
      }
      setSuccessMsg('Cập nhật hồ sơ cá nhân thành công!');
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật thông tin cá nhân!');
    } finally {
      setSubmitting(false);
    }
  };

  const p = profile || currentUser || {};
  const fullName = p.FullName || p.fullName || p.name || 'Nhân sự';
  const employeeCode = p.EmployeeCode || p.employeeCode || `NV${String(p.EmployeeId || p.id || 1).padStart(3, '0')}`;
  const departmentName = p.DepartmentName || p.department || 'Khối Kỹ Thuật (IT)';
  const positionName = p.PositionName || p.position || 'Chuyên viên';
  const managerName = p.ManagerName || p.manager || 'Trần Thị Bích';
  const workStatus = p.WorkStatus || p.workStatus || 'Đang làm việc';
  const joinDate = p.JoinDate || p.joinDate || 'Chưa cập nhật';
  const gender = p.Gender || p.gender || 'Nam';
  const birthDate = p.BirthDate || p.birthDate || 'Chưa cập nhật';
  const phone = p.Phone || p.phone || 'Chưa cập nhật';
  const email = p.Email || p.email || 'Chưa cập nhật';
  const idCard = p.IdCardNumber || p.idCardNumber || p.idCard || 'Chưa cập nhật';
  const idCardDate = p.IdCardDate || 'Chưa cập nhật';
  const idCardPlace = p.IdCardPlace || 'Chưa cập nhật';
  const address = p.Address || p.address || 'Chưa cập nhật';
  const taxCode = p.TaxCode || p.taxCode || 'Chưa cập nhật';
  const insuranceBookNumber = p.InsuranceBookNumber || p.insuranceBookNumber || 'Chưa cập nhật';
  const bankName = p.BankName || p.bankName || 'Chưa cập nhật';
  const bankAccountNumber = p.BankAccountNumber || p.bankAccountNumber || 'Chưa cập nhật';
  const dependentsCount = p.DependentsCount !== undefined ? p.DependentsCount : 0;
  const baseSalary = p.BaseSalary !== undefined ? p.BaseSalary : 15000000;
  const insuranceSalary = p.InsuranceSalary !== undefined ? p.InsuranceSalary : 5000000;
  const isFaceRegistered = !!(p.FaceRegistered ?? p.faceRegistered);
  const contracts = p.contracts || [];

  const formatVND = (num) => {
    if (!num && num !== 0) return 'Chưa cập nhật';
    return `${Math.round(+num).toLocaleString('vi-VN')} đ`;
  };

  return (
    <div className="my-profile-container">
      <div className="profile-banner-card">
        <div className="profile-banner-left">
          {p.AvatarUrl ? (
            <img
              src={p.AvatarUrl}
              alt={fullName}
              className="profile-banner-avatar"
            />
          ) : (
            <div className="profile-banner-avatar-placeholder">
              {fullName ? fullName.trim().slice(-1) : 'U'}
            </div>
          )}

          <div className="profile-banner-info">
            <h1 className="profile-banner-name">
              <span>{fullName}</span>
              <span className="profile-tag-pill code">{employeeCode}</span>
            </h1>

            <div className="profile-banner-tags">
              <span className="profile-tag-pill">
                <Briefcase size={12} />
                <span>{positionName}</span>
              </span>
              <span className="profile-tag-pill">
                <Building size={12} />
                <span>{departmentName}</span>
              </span>
              <span className="profile-tag-pill">
                <StatusBadge status={workStatus} />
              </span>
              <span className={`profile-tag-pill ${isFaceRegistered ? 'face-active' : 'face-pending'}`}>
                {isFaceRegistered ? (
                  <>
                    <ShieldCheck size={13} />
                    <span>Face ID: Đã kích hoạt</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={13} />
                    <span>Face ID: Chưa đăng ký</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-banner-actions">
          <button
            className="profile-banner-btn secondary"
            onClick={loadProfile}
            disabled={loading}
            title="Làm mới thông tin từ máy chủ"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          <button
            className="profile-banner-btn primary"
            onClick={handleOpenEdit}
          >
            <Edit3 size={15} />
            <span>Cập nhật hồ sơ</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{
          padding: '12px 18px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '10px',
          color: '#065f46',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '12px 18px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          color: '#991b1b',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="profile-content-layout">
        <div className="profile-main-column">
          <div className="profile-section-card">
            <div className="profile-section-head">
              <h3 className="profile-section-title">
                <Briefcase size={18} color="#0f766e" />
                <span>1. Thông tin công việc & Tổ chức</span>
              </h3>
              <span className="profile-section-subtitle">Chức vụ, phòng ban và cấp bậc quản lý</span>
            </div>

            <div className="profile-tiles-grid">
              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <Award size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Mã nhân sự</div>
                  <div className="profile-tile-value mono">{employeeCode}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <Building size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Phòng ban trực thuộc</div>
                  <div className="profile-tile-value" style={{ color: '#0f766e' }}>{departmentName}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <Briefcase size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Chức vụ / Vị trí</div>
                  <div className="profile-tile-value">{positionName}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <UserCheck size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Quản lý trực tiếp</div>
                  <div className="profile-tile-value">{managerName}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <Calendar size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Ngày nhận việc</div>
                  <div className="profile-tile-value">{joinDate}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <ShieldCheck size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Trạng thái công tác</div>
                  <div className="profile-tile-value">
                    <StatusBadge status={workStatus} />
                  </div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <DollarSign size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Lương cơ bản đóng thuế</div>
                  <div className="profile-tile-value" style={{ color: '#047857' }}>{formatVND(baseSalary)}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <DollarSign size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Lương đóng bảo hiểm</div>
                  <div className="profile-tile-value">{formatVND(insuranceSalary)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section-card">
            <div className="profile-section-head">
              <h3 className="profile-section-title">
                <User size={18} color="#0f766e" />
                <span>2. Lý lịch cá nhân & Liên hệ</span>
              </h3>
              <span className="profile-section-subtitle">Thông tin định danh công dân và nơi cư trú</span>
            </div>

            <div className="profile-tiles-grid">
              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <User size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Họ và tên đầy đủ</div>
                  <div className="profile-tile-value">{fullName}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <Calendar size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Giới tính & Ngày sinh</div>
                  <div className="profile-tile-value">{gender} · {birthDate}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <Phone size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Số điện thoại di động</div>
                  <div className="profile-tile-value">{phone}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <Mail size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Email liên hệ</div>
                  <div className="profile-tile-value">{email}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <CreditCard size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Số CCCD / CMND</div>
                  <div className={`profile-tile-value ${idCard === 'Chưa cập nhật' ? 'alert' : 'mono'}`}>
                    {idCard}
                  </div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <Award size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Ngày cấp / Nơi cấp CCCD</div>
                  <div className="profile-tile-value">{idCardDate} · {idCardPlace}</div>
                </div>
              </div>

              <div className="profile-tile" style={{ gridColumn: 'span 2' }}>
                <div className="profile-tile-icon-wrap">
                  <MapPin size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Địa chỉ thường trú</div>
                  <div className="profile-tile-value">{address}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section-card">
            <div className="profile-section-head">
              <h3 className="profile-section-title">
                <CreditCard size={18} color="#0f766e" />
                <span>3. Tài chính, Thuế & Ngân hàng</span>
              </h3>
              <span className="profile-section-subtitle">Dữ liệu chi trả thu nhập và bảo hiểm bắt buộc</span>
            </div>

            <div className="profile-tiles-grid">
              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <Award size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Mã số thuế cá nhân</div>
                  <div className={`profile-tile-value ${taxCode === 'Chưa cập nhật' ? 'alert' : 'mono'}`}>{taxCode}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <ShieldCheck size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Số sổ BHXH</div>
                  <div className={`profile-tile-value ${insuranceBookNumber === 'Chưa cập nhật' ? 'alert' : 'mono'}`}>{insuranceBookNumber}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <Building2 size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Ngân hàng thụ hưởng</div>
                  <div className="profile-tile-value">{bankName}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <CreditCard size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Số tài khoản ngân hàng</div>
                  <div className={`profile-tile-value ${bankAccountNumber === 'Chưa cập nhật' ? 'alert' : 'mono'}`}>{bankAccountNumber}</div>
                </div>
              </div>

              <div className="profile-tile">
                <div className="profile-tile-icon-wrap">
                  <User size={16} />
                </div>
                <div className="profile-tile-content">
                  <div className="profile-tile-label">Người phụ thuộc giảm trừ</div>
                  <div className="profile-tile-value">{dependentsCount} người</div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section-card">
            <div className="profile-section-head">
              <h3 className="profile-section-title">
                <FileText size={18} color="#0f766e" />
                <span>4. Hợp đồng lao động & Pháp lý</span>
              </h3>
              <span className="profile-section-subtitle">Đã ký kết: {contracts.length} văn bản hợp đồng</span>
            </div>

            {contracts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '10px' }}>
                <FileText size={26} style={{ margin: '0 auto 8px auto', display: 'block', color: '#94a3b8' }} />
                <span>Chưa có dữ liệu hợp đồng lao động điện tử được ghi nhận trên cơ sở dữ liệu.</span>
              </div>
            ) : (
              <div className="profile-table-wrapper">
                <table className="profile-table">
                  <thead>
                    <tr>
                      <th>Số hợp đồng</th>
                      <th>Loại hợp đồng</th>
                      <th>Ngày ký</th>
                      <th>Ngày bắt đầu</th>
                      <th>Ngày kết thúc</th>
                      <th>Lương thỏa thuận</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((c) => (
                      <tr key={c.ContractId}>
                        <td style={{ fontWeight: 700, color: '#0f766e', fontFamily: 'monospace' }}>
                          {c.ContractNumber}
                        </td>
                        <td>{c.ContractType}</td>
                        <td>{c.SignDate || '-'}</td>
                        <td>{c.StartDate || '-'}</td>
                        <td>{c.EndDate || 'Vô thời hạn'}</td>
                        <td style={{ fontWeight: 600 }}>{formatVND(c.AgreedSalary)}</td>
                        <td>
                          <StatusBadge status={c.Status || 'Hiệu lực'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="profile-sidebar-column">
          <div className="profile-sidebar-card">
            <div className="profile-section-head" style={{ marginBottom: '12px' }}>
              <h3 className="profile-section-title">
                <ShieldCheck size={18} color="#0f766e" />
                <span>Sinh trắc Face ID</span>
              </h3>
            </div>

            <div className="profile-face-preview-box">
              {p.AvatarUrl ? (
                <img
                  src={p.AvatarUrl}
                  alt={fullName}
                  className="profile-face-avatar-lg"
                />
              ) : (
                <div className="profile-face-placeholder-lg">
                  {fullName ? fullName.trim().slice(-1) : 'U'}
                </div>
              )}

              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a' }}>{fullName}</h4>
              <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '12.5px' }}>
                {positionName} · <strong style={{ color: '#0f766e' }}>{employeeCode}</strong>
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: isFaceRegistered ? '#ecfdf5' : '#fef3c7',
                color: isFaceRegistered ? '#047857' : '#b45309',
                fontSize: '12.5px',
                fontWeight: 600
              }}>
                {isFaceRegistered ? (
                  <>
                    <ShieldCheck size={15} />
                    <span>Đã kích hoạt Face ID</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={15} />
                    <span>Chưa có Face ID</span>
                  </>
                )}
              </div>
            </div>


          </div>

          <div className="profile-sidebar-card">
            <div className="profile-section-head" style={{ marginBottom: '12px' }}>
              <h3 className="profile-section-title">
                <Sparkles size={18} color="#0f766e" />
                <span>Kênh hỗ trợ nội bộ</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <UserCheck size={15} color="#0f766e" />
                <span>Quản lý: <strong>{managerName}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <Building2 size={15} color="#0f766e" />
                <span>Bộ phận: <strong>{departmentName}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <Mail size={15} color="#0f766e" />
                <span>HR: <strong>hr@company.com</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="modal-wrap" onClick={() => !submitting && setIsEditModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} style={{ color: '#0f766e' }} />
                <h3>Cập nhật thông tin lý lịch cá nhân</h3>
              </div>
              {!submitting && (
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="modal-b" style={{ padding: '18px 24px' }}>
                <div className="form">
                  <label className="field">
                    <span>Họ và tên: <i className="req">*</i></span>
                    <input
                      className="inp"
                      required
                      value={editFormData.fullName}
                      onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Giới tính:</span>
                    <select
                      className="inp"
                      value={editFormData.gender}
                      onChange={e => setEditFormData({ ...editFormData, gender: e.target.value })}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Ngày sinh:</span>
                    <input
                      type="date"
                      className="inp"
                      value={editFormData.birthDate}
                      onChange={e => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Số điện thoại:</span>
                    <input
                      className="inp"
                      placeholder="0912345678"
                      value={editFormData.phone}
                      onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </label>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Email liên hệ: <i className="req">*</i></span>
                    <input
                      type="email"
                      className="inp"
                      required
                      value={editFormData.email}
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Số CCCD / CMND: <i className="req">*</i></span>
                    <input
                      className="inp"
                      placeholder="VD: 001095000123"
                      value={editFormData.idCardNumber}
                      onChange={e => setEditFormData({ ...editFormData, idCardNumber: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Ngày cấp CCCD:</span>
                    <input
                      type="date"
                      className="inp"
                      value={editFormData.idCardDate}
                      onChange={e => setEditFormData({ ...editFormData, idCardDate: e.target.value })}
                    />
                  </label>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Nơi cấp CCCD:</span>
                    <input
                      className="inp"
                      placeholder="VD: Cục Cảnh sát QLHC về TTXH"
                      value={editFormData.idCardPlace}
                      onChange={e => setEditFormData({ ...editFormData, idCardPlace: e.target.value })}
                    />
                  </label>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Địa chỉ thường trú:</span>
                    <input
                      className="inp"
                      placeholder="VD: Cầu Giấy, Hà Nội"
                      value={editFormData.address}
                      onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Ngân hàng thụ hưởng:</span>
                    <input
                      className="inp"
                      placeholder="VD: Vietcombank / Techcombank / MB Bank"
                      value={editFormData.bankName}
                      onChange={e => setEditFormData({ ...editFormData, bankName: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Số tài khoản ngân hàng:</span>
                    <input
                      className="inp"
                      placeholder="VD: 190367891234"
                      value={editFormData.bankAccountNumber}
                      onChange={e => setEditFormData({ ...editFormData, bankAccountNumber: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  disabled={submitting}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn pri"
                  disabled={submitting}
                >
                  <Save size={16} />
                  <span>{submitting ? 'Đang lưu...' : 'Lưu thông tin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
