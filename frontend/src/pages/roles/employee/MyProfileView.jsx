import React from 'react';
import { User, Mail, Phone, MapPin, Building, Briefcase, Calendar, ShieldCheck, FileText } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import AuthService from '../../../services/AuthService';
import '../../../styles/roles/employee/MyProfileView.css';

export default function MyProfileView({ user }) {
  const currentUser = user || AuthService.getCurrentUser() || {};

  const me = {
    id: currentUser.employeeCode || `NV${String(currentUser.id || 1).padStart(3, '0')}`,
    name: currentUser.name || currentUser.fullName || currentUser.username || 'Nhân sự',
    gender: currentUser.gender || 'Nam',
    birthDate: currentUser.birthDate || 'Chưa cập nhật',
    phone: currentUser.phone || 'Chưa cập nhật',
    email: currentUser.email || 'Chưa cập nhật',
    idCard: currentUser.idCard || 'Chưa cập nhật',
    taxCode: currentUser.taxCode || 'Chưa cập nhật',
    department: currentUser.department || 'Phòng Nhân sự & Kỹ thuật',
    position: currentUser.position || currentUser.roleTitle || 'Chuyên viên',
    joinDate: currentUser.joinDate || '2026-01-01',
    status: 'Đang làm việc',
    contractType: 'Hợp đồng lao động chính thức',
    baseSalary: 15000000,
    faceRegistered: !!currentUser.faceRegistered,
    address: 'Việt Nam',
    manager: 'Trưởng bộ phận'
  };

  const formatVND = (n) => Math.round(+n || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div className="my-profile-container">
      <div className="ph">
        <div>
          <h1>Hồ sơ lý lịch cá nhân</h1>
          <p>Dữ liệu hợp đồng lao động, thông tin thuế, bảo hiểm và sinh trắc học Face ID của bạn</p>
        </div>
      </div>

      <div className="grid c21">
        <div className="card">
          <div className="card-h">
            <h3>Chi tiết lý lịch nhân sự</h3>
          </div>
          <div className="profile-details-grid">
            <div className="profile-detail-field">
              <span>Họ và tên:</span>
              <strong>{me.name}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Mã nhân viên:</span>
              <strong>{me.id}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Giới tính:</span>
              <strong>{me.gender}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Ngày sinh:</span>
              <strong>{me.birthDate}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Số điện thoại:</span>
              <strong>{me.phone}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Email công ty:</span>
              <strong>{me.email}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Số CCCD:</span>
              <strong>{me.idCard}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Mã số thuế:</span>
              <strong>{me.taxCode}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Phòng ban:</span>
              <strong>{me.department}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Chức vụ:</span>
              <strong>{me.position}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Ngày nhận việc:</span>
              <strong>{me.joinDate}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Loại hợp đồng:</span>
              <strong>{me.contractType}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Ảnh chân dung & Sinh trắc Face ID</h3>
          </div>
          <div className="card-b" style={{ textAlign: 'center' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: '#0f766e',
              color: '#ffffff',
              fontSize: '36px',
              fontWeight: '700',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px auto'
            }}>
              {me.name[0]}
            </div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{me.name}</h4>
            <p style={{ margin: '0 0 16px 0', color: 'var(--muted)', fontSize: '13px' }}>
              {me.position} · {me.id}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: 'var(--p50)', color: 'var(--pd)', fontSize: '12.5px', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>Face ID: Đã kích hoạt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
