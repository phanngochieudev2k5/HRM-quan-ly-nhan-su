import React from 'react';
import { User, Mail, Phone, MapPin, Building, Briefcase, Calendar, ShieldCheck, FileText } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import { employeesData } from '../../../data/mockData';
import '../../../styles/roles/employee/MyProfileView.css';

export default function MyProfileView() {
  const me = employeesData.find(e => e.id === 'EMP003') || employeesData[0];

  const formatVND = (n) => Math.round(+n || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div className="my-profile-container">
      <div className="ph">
        <div>
          <h1>Hồ sơ lý lịch cá nhân</h1>
          <p>Dữ liệu hợp đồng lao động, thông tin thuế, bảo hiểm và sinh trắc học Face ID</p>
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
              <span>Ngày vào làm:</span>
              <strong>{me.joinDate}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Người quản lý trực tiếp:</span>
              <strong>{me.manager}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Ngân hàng nhận lương:</span>
              <strong>{me.bankName}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Số tài khoản:</span>
              <strong>{me.bankAccount}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Số người phụ thuộc (NPT):</span>
              <strong>{me.dependents} người</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-b" style={{ textAlign: 'center' }}>
            <div className="profile-avatar-large" style={{ margin: '0 auto 12px', width: '84px', height: '84px', fontSize: '28px' }}>
              {me.name[0]}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#042f2e', margin: 0 }}>{me.name}</h2>
            <div style={{ color: '#0f766e', fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>{me.position}</div>
            <div style={{ color: '#64748b', fontSize: '12px' }}>{me.department} · {me.id}</div>

            <div className="row mt" style={{ justifyContent: 'center', gap: '6px' }}>
              <span className="badge b-green">{me.status}</span>
              <span className="badge b-p">Đã nạp Face ID AI</span>
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid #eef2f1', paddingTop: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
              <div><span>Địa chỉ liên hệ:</span> <strong>{me.address}</strong></div>
              <div><span>Hợp đồng lao động:</span> <strong>{me.contractType}</strong></div>
              <div><span>Mã số BHXH:</span> <strong>{me.socialInsuranceNo}</strong></div>
              <div><span>Lương cơ bản tháng:</span> <strong style={{ color: '#0f766e' }}>{formatVND(me.baseSalary)}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
