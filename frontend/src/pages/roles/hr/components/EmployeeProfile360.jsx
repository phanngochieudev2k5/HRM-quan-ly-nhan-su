import React, { useState } from 'react';
import {
  ArrowLeft, Edit2, ShieldCheck, Camera, FileText, User, Key,
  CheckCircle2, AlertCircle, Phone, Mail, MapPin, Calendar, Building2,
  DollarSign, CreditCard, Shield, ExternalLink, Sparkles
} from 'lucide-react';
import ContractTab from './ContractTab';
import EmployeeModal from './EmployeeModal';

export default function EmployeeProfile360({
  employee,
  departments = [],
  positions = [],
  onBackToList,
  onUpdateEmployee,
  onCreateContract,
  onUpdateContract,
  onDeleteContract,
  onNavigateFaceRegistration
}) {
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'contracts' | 'account'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [togglingFace, setTogglingFace] = useState(false);

  if (!employee) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <p>Không có dữ liệu nhân viên để hiển thị.</p>
        <button className="btn pri" onClick={onBackToList}>Quay lại danh sách</button>
      </div>
    );
  }

  const formatVND = (n) => `${Math.round(+n || 0).toLocaleString('vi-VN')} đ`;

  const fullName = employee.FullName || employee.name || 'Nhân viên';
  const employeeCode = employee.EmployeeCode || employee.id || 'NV---';
  const departmentName = employee.DepartmentName || employee.department || 'Chưa phân bổ';
  const positionName = employee.PositionName || employee.position || 'Nhân viên';
  const workStatus = employee.WorkStatus || employee.status || 'Đang làm việc';
  const isFaceRegistered = !!(employee.FaceRegistered ?? employee.faceRegistered);

  const getInitials = (name) => {
    if (!name) return 'N';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1][0] || 'N';
  };

  const handleToggleFace = async () => {
    try {
      setTogglingFace(true);
      await onUpdateEmployee(employee.EmployeeId, {
        FaceRegistered: !isFaceRegistered
      });
    } finally {
      setTogglingFace(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* HEADER PHẦN TRÊN CỦA PROFILE */}
      <div className="ph" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn" onClick={onBackToList} title="Quay lại danh sách nhân viên">
            <ArrowLeft size={16} />
            <span>Quay lại danh sách</span>
          </button>
          <div>
            <h1 style={{ fontSize: '20px', margin: 0, color: '#042f2e' }}>
              Hồ sơ 360°: {fullName}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
              Mã NV: <strong>{employeeCode}</strong> · {departmentName} · {positionName}
            </p>
          </div>
        </div>

        <div className="ph-tools" style={{ gap: '8px' }}>
          <button className="btn" onClick={() => setIsEditModalOpen(true)}>
            <Edit2 size={15} />
            <span>Chỉnh sửa hồ sơ</span>
          </button>
          <button
            className="btn pri"
            onClick={() => onNavigateFaceRegistration && onNavigateFaceRegistration(employee)}
          >
            <ShieldCheck size={15} />
            <span>Đăng ký Face ID OpenCV</span>
          </button>
        </div>
      </div>

      {/* HERO CARD HỒ SƠ 360° */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)', border: '1px solid #ccfbf1' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
          {/* AVATAR */}
          <div style={{ position: 'relative' }}>
            {employee.AvatarUrl ? (
              <img
                src={employee.AvatarUrl}
                alt={fullName}
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #0f766e',
                  boxShadow: '0 4px 12px rgba(15, 118, 110, 0.15)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: '#0f766e',
                  color: '#ffffff',
                  fontSize: '30px',
                  fontWeight: 800,
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
                }}
              >
                {getInitials(fullName)}
              </div>
            )}
            <div
              title={isFaceRegistered ? 'Đã kích hoạt Face ID' : 'Chưa đăng ký Face ID'}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: isFaceRegistered ? '#10b981' : '#f59e0b',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                border: '2px solid #fff'
              }}
            >
              {isFaceRegistered ? <CheckCircle2 size={14} /> : <Camera size={14} />}
            </div>
          </div>

          {/* MAIN INFO */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#042f2e' }}>
                {fullName}
              </h2>
              <code style={{ fontSize: '13px', background: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {employeeCode}
              </code>
              <span className={`badge ${workStatus === 'Đang làm việc' ? 'b-green' : workStatus === 'Thử việc' ? 'b-blue' : 'b-amber'}`}>
                {workStatus}
              </span>
              <span className={`badge ${isFaceRegistered ? 'b-p' : 'b-amber'}`}>
                {isFaceRegistered ? 'Sinh trắc Face ID AI' : 'Chưa quét Face ID'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px', fontSize: '13px', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={15} style={{ color: '#0f766e' }} />
                <span>{departmentName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={15} style={{ color: '#0f766e' }} />
                <span>{positionName}</span>
              </div>
              {employee.Email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} style={{ color: '#0f766e' }} />
                  <span>{employee.Email}</span>
                </div>
              )}
              {employee.Phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={15} style={{ color: '#0f766e' }} />
                  <span>{employee.Phone}</span>
                </div>
              )}
              {employee.JoinDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} style={{ color: '#0f766e' }} />
                  <span>Ngày vào: {employee.JoinDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="attendance-tabs-header" style={{ margin: '4px 0' }}>
        <button
          className={`attendance-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <User size={16} />
          <span>Thông tin chi tiết cá nhân</span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          <FileText size={16} />
          <span>Hợp đồng lao động</span>
          <span className="badge b-amber" style={{ marginLeft: '4px' }}>
            {employee.contracts?.length || 0}
          </span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <Key size={16} />
          <span>Tài khoản hệ thống & Face ID</span>
        </button>
      </div>

      {/* TAB 1: THÔNG TIN CHI TIẾT CÁ NHÂN */}
      {activeTab === 'details' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Nhóm 1: Lý lịch & Định danh */}
          <div className="card">
            <div className="card-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#042f2e' }}>
                1. Thông tin định danh & Lý lịch nhân sự
              </h3>
              <button className="btn sm" onClick={() => setIsEditModalOpen(true)}>
                <Edit2 size={13} />
                <span>Chỉnh sửa</span>
              </button>
            </div>
            <div className="profile-details-grid">
              <div className="profile-detail-field">
                <span>Họ và tên:</span>
                <strong>{fullName}</strong>
              </div>
              <div className="profile-detail-field">
                <span>Mã nhân viên:</span>
                <strong style={{ color: '#0f766e' }}>{employeeCode}</strong>
              </div>
              <div className="profile-detail-field">
                <span>Giới tính:</span>
                <strong>{employee.Gender || employee.gender || 'Nam'}</strong>
              </div>
              <div className="profile-detail-field">
                <span>Ngày sinh:</span>
                <strong>{employee.BirthDate || employee.birthDate || 'Chưa cập nhật'}</strong>
              </div>
              <div className="profile-detail-field">
                <span>Số điện thoại:</span>
                <strong>{employee.Phone || employee.phone || 'Chưa cập nhật'}</strong>
              </div>
              <div className="profile-detail-field">
                <span>Email liên hệ:</span>
                <strong>{employee.Email || employee.email || 'Chưa cập nhật'}</strong>
              </div>
              <div className="profile-detail-field" style={{ gridColumn: 'span 2' }}>
                <span>Địa chỉ thường trú:</span>
                <strong>{employee.Address || employee.address || 'Chưa cập nhật'}</strong>
              </div>
              <div className="profile-detail-field">
                <span>Số CCCD / CMND:</span>
                <strong>{employee.IdCardNumber || employee.idCard || 'Chưa cập nhật'}</strong>
              </div>
              <div className="profile-detail-field">
                <span>Ngày cấp CCCD:</span>
                <strong>{employee.IdCardDate || employee.idCardDate || 'Chưa cập nhật'}</strong>
              </div>
              <div className="profile-detail-field">
                <span>Nơi cấp CCCD:</span>
                <strong>{employee.IdCardPlace || employee.idCardPlace || 'Chưa cập nhật'}</strong>
              </div>
            </div>
          </div>

          {/* Nhóm 2: Chế độ Lương, Thuế & Ngân hàng */}
          <div className="card">
            <div className="card-h">
              <h3 style={{ margin: 0, fontSize: '15px', color: '#042f2e' }}>
                2. Chế độ lương, Thuế & Tài khoản thụ hưởng
              </h3>
            </div>
            <div className="profile-details-grid">
              <div className="profile-detail-field">
                <span>Lương cơ bản tháng:</span>
                <strong style={{ color: '#0f766e', fontSize: '15px' }}>
                  {formatVND(employee.BaseSalary ?? employee.baseSalary ?? 15000000)}
                </strong>
              </div>
              <div className="profile-detail-field">
                <span>Lương đóng bảo hiểm (BHXH):</span>
                <strong>
                  {formatVND(employee.InsuranceSalary ?? employee.insuranceSalary ?? employee.BaseSalary ?? 15000000)}
                </strong>
              </div>
              <div className="profile-detail-field">
                <span>Số người phụ thuộc (NPT):</span>
                <strong>{employee.DependentsCount ?? employee.dependents ?? 0} người</strong>
              </div>
              <div className="profile-detail-field">
                <span>Mã số thuế cá nhân:</span>
                <strong>{employee.TaxCode || employee.taxCode || 'Chưa cập nhật'}</strong>
              </div>
              <div className="profile-detail-field">
                <span>Số sổ bảo hiểm xã hội:</span>
                <strong>{employee.InsuranceBookNumber || employee.insuranceBookNumber || 'Chưa cập nhật'}</strong>
              </div>
              <div className="profile-detail-field">
                <span>Ngân hàng thụ hưởng:</span>
                <strong>{employee.BankName || employee.bankName || 'Vietcombank'}</strong>
              </div>
              <div className="profile-detail-field" style={{ gridColumn: 'span 2' }}>
                <span>Số tài khoản ngân hàng:</span>
                <strong style={{ letterSpacing: '0.04em' }}>{employee.BankAccountNumber || employee.bankAccount || 'Chưa cập nhật'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HỢP ĐỒNG LAO ĐỘNG */}
      {activeTab === 'contracts' && (
        <ContractTab
          employee={employee}
          contracts={employee.contracts || []}
          onCreateContract={onCreateContract}
          onUpdateContract={onUpdateContract}
          onDeleteContract={onDeleteContract}
        />
      )}

      {/* TAB 3: TÀI KHOẢN HỆ THỐNG & FACE ID */}
      {activeTab === 'account' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {/* Card Tài khoản hệ thống */}
          <div className="card">
            <div className="card-h">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} style={{ color: '#0f766e' }} />
                <h3 style={{ margin: 0, fontSize: '15px', color: '#042f2e' }}>
                  Tài khoản đăng nhập hệ thống (tblUser)
                </h3>
              </div>
            </div>
            <div className="card-b" style={{ padding: '20px' }}>
              {employee.UserId || employee.Username ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Tên đăng nhập:</span>
                    <strong style={{ color: '#0f766e' }}>{employee.Username || 'user_' + employeeCode.toLowerCase()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Email tài khoản:</span>
                    <strong>{employee.UserEmail || employee.Email || '-'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Trạng thái tài khoản:</span>
                    <span className={`badge ${employee.UserIsLocked ? 'b-red' : 'b-green'}`}>
                      {employee.UserIsLocked ? 'Đang bị khóa' : 'Đang hoạt động'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Xác thực 2 yếu tố (2FA):</span>
                    <span className={`badge ${employee.TwoFactorEnabled ? 'b-p' : 'b-amber'}`}>
                      {employee.TwoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Đăng nhập gần nhất:</span>
                    <span style={{ fontSize: '12.5px', color: '#334155' }}>
                      {employee.LastLoginAt || 'Chưa đăng nhập'}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                  <p style={{ margin: '0 0 12px' }}>Nhân viên này chưa liên kết tài khoản đăng nhập hệ thống.</p>
                </div>
              )}
            </div>
          </div>

          {/* Card Sinh trắc khuôn mặt Face ID OpenCV */}
          <div className="card">
            <div className="card-h">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} style={{ color: '#0f766e' }} />
                <h3 style={{ margin: 0, fontSize: '15px', color: '#042f2e' }}>
                  Nhận diện khuôn mặt OpenCV (FaceRegistered)
                </h3>
              </div>
            </div>
            <div className="card-b" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: isFaceRegistered ? '#ecfdf5' : '#fffbeb',
                    border: `1px solid ${isFaceRegistered ? '#a7f3d0' : '#fde68a'}`,
                    display: 'grid',
                    placeItems: 'center',
                    color: isFaceRegistered ? '#059669' : '#d97706'
                  }}
                >
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                    {isFaceRegistered ? 'Đã kích hoạt Face ID OpenCV' : 'Chưa có dữ liệu khuôn mặt'}
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                    {isFaceRegistered
                      ? 'Dữ liệu vector 128 chiều đã được lưu trữ trong CSDL và sẵn sàng điểm danh Kiosk.'
                      : 'Nhân viên cần chụp và nạp dữ liệu khuôn mặt để thực hiện chấm công AI.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  className="btn pri"
                  onClick={() => onNavigateFaceRegistration && onNavigateFaceRegistration(employee)}
                >
                  <Camera size={15} />
                  <span>Kiosk đăng ký Face ID OpenCV</span>
                </button>

                <button
                  className="btn"
                  onClick={handleToggleFace}
                  disabled={togglingFace}
                >
                  {isFaceRegistered ? 'Hủy kích hoạt Face ID' : 'Đánh dấu đã có Face ID'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT EMPLOYEE */}
      <EmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async (updatedData) => {
          await onUpdateEmployee(employee.EmployeeId, updatedData);
        }}
        employee={employee}
        departments={departments}
        positions={positions}
      />
    </div>
  );
}

