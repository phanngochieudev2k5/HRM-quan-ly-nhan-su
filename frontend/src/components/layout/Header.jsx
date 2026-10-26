import React, { useState } from 'react';
import {
  Search, Bell, MessageSquare, ChevronDown, Shield,
  Settings, LogOut, CheckCircle2
} from 'lucide-react';
import '../../styles/layout/Header.css';

export default function Header({ currentRole, setCurrentRole, currentUser, onNavigate }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles = [
    { key: 'HR', label: 'HR Manager (Quản trị Nhân sự)', desc: 'Toàn quyền hồ sơ, tuyển dụng, hợp đồng, chấm công' },
    { key: 'Finance', label: 'Finance (Kế toán tiền lương)', desc: 'Tính lương tự động, chốt bảng lương & thuế TNCN' },
    { key: 'Manager', label: 'Team Manager (Trưởng bộ phận)', desc: 'Quản lý nhóm, duyệt nghỉ phép, duyệt OT, KPI' },
    { key: 'Employee', label: 'Nhân viên (Cá nhân / Nhân sự)', desc: 'Chấm công khuôn mặt, xin nghỉ, xem phiếu lương' },
    { key: 'Admin', label: 'System Admin (Quản trị Hệ thống)', desc: 'Quản lý tài khoản, cấu hình tham số & audit logs' }
  ];

  const notifications = [
    { id: 1, title: 'Yêu cầu nghỉ phép mới', desc: 'Trần Thị Bích xin nghỉ phép 2 ngày từ 28/04', time: '10 phút trước' },
    { id: 2, title: 'Cảnh báo hợp đồng sắp hết hạn', desc: '2 nhân viên sắp hết hạn hợp đồng trong 15 ngày tới', time: '1 giờ trước' },
    { id: 3, title: 'Chấm công OpenCV ghi nhận', desc: 'Nguyễn Văn A check-in thành công lúc 08:02', time: '2 giờ trước' }
  ];

  return (
    <header className="app-header">
      <div className="header-search">
        <Search size={15} className="header-search-icon" />
        <input
          type="text"
          className="header-search-input"
          placeholder="Tìm nhân viên, hợp đồng, bảng lương..."
        />
      </div>

      <div className="header-actions">
        <div style={{ position: 'relative' }}>
          <button
            className="role-switcher-btn"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            title="Đổi vai trò người dùng"
          >
            <Shield size={14} />
            <span>Vai trò: <strong>{currentRole}</strong></span>
            <ChevronDown size={12} />
          </button>

          {showRoleMenu && (
            <div className="role-dropdown-menu">
              <div className="role-dropdown-header">
                Chọn vai trò phân quyền
              </div>
              {roles.map(r => (
                <div
                  key={r.key}
                  className={`role-option-item ${currentRole === r.key ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentRole(r.key);
                    setShowRoleMenu(false);
                  }}
                >
                  <Shield size={14} style={{ marginTop: '2px', color: currentRole === r.key ? '#0f766e' : '#94a3b8' }} />
                  <div className="role-option-info">
                    <b>{r.label}</b>
                    <small>{r.desc}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            className="header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Thông báo hệ thống"
          >
            <Bell size={17} />
            <span className="header-badge-count">3</span>
          </button>

          {showNotifications && (
            <div className="role-dropdown-menu" style={{ width: '320px' }}>
              <div className="role-dropdown-header">
                Thông báo mới nhất
              </div>
              {notifications.map(n => (
                <div key={n.id} className="role-option-item">
                  <CheckCircle2 size={15} style={{ color: '#10b981', marginTop: '2px' }} />
                  <div className="role-option-info">
                    <b>{n.title}</b>
                    <small>{n.desc}</small>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="user-profile-summary">
          <div className="user-avatar-header">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              currentUser?.name ? currentUser.name[0] : 'U'
            )}
          </div>
          <div className="user-text-info">
            <span className="user-text-name">{currentUser?.name || 'Nguyễn Văn A'}</span>
            <span className="user-text-role">{currentUser?.roleTitle || 'HR Manager'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
