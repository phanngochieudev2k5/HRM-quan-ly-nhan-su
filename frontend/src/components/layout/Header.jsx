import React, { useState } from 'react';
import {
  Search, Bell, Shield, LogOut, CheckCircle2,
  ChevronDown, User, Sparkles
} from 'lucide-react';
import '../../styles/layout/Header.css';

export default function Header({ currentRole, currentUser, onLogout, onNavigate }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Hệ thống xác thực JWT', desc: 'Phiên đăng nhập phân quyền bảo mật đang hoạt động', time: 'Vừa xong' },
    { id: 2, title: 'Đồng bộ cơ sở dữ liệu', desc: 'Kết nối thành công SQL Server HRM_Enterprise_DB', time: '10 phút trước' },
    { id: 3, title: 'Chấm công OpenCV', desc: 'Nhân diện khuôn mặt và chấm công sẵn sàng', time: '1 giờ trước' }
  ];

  const getRoleBadgeInfo = (role) => {
    switch (role) {
      case 'Admin':
        return { label: 'Quản trị Hệ thống', tag: 'ADMIN', color: '#dc2626', bg: '#fef2f2' };
      case 'HR':
        return { label: 'Quản trị Nhân sự', tag: 'HR MANAGER', color: '#0f766e', bg: '#f0fdfa' };
      case 'Manager':
        return { label: 'Trưởng bộ phận', tag: 'MANAGER', color: '#2563eb', bg: '#eff6ff' };
      case 'Finance':
        return { label: 'Kế toán Tiền lương', tag: 'FINANCE', color: '#7c3aed', bg: '#f5f3ff' };
      case 'Employee':
      default:
        return { label: 'Nhân viên Cá nhân', tag: 'EMPLOYEE', color: '#0284c7', bg: '#f0f9ff' };
    }
  };

  const roleInfo = getRoleBadgeInfo(currentUser?.role || currentRole);

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
        
        <div
          className="active-role-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            background: roleInfo.bg,
            border: `1px solid ${roleInfo.color}30`,
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            color: roleInfo.color
          }}
          title={`Tài khoản đang đăng nhập với quyền: ${roleInfo.label}`}
        >
          <Shield size={13} style={{ color: roleInfo.color }} />
          <span>Vai trò: <strong>{currentUser?.roleTitle || roleInfo.label}</strong></span>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            className="header-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            title="Thông báo hệ thống"
          >
            <Bell size={17} />
            <span className="header-badge-count">3</span>
          </button>

          {showNotifications && (
            <div className="role-dropdown-menu" style={{ width: '320px' }}>
              <div className="role-dropdown-header">
                Thông báo hệ thống
              </div>
              {notifications.map(n => (
                <div key={n.id} className="role-option-item">
                  <CheckCircle2 size={15} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
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

        <div style={{ position: 'relative' }}>
          <div
            className="user-profile-summary"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            <div className="user-avatar-header">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                currentUser?.name ? currentUser.name[0] : (currentUser?.fullName ? currentUser.fullName[0] : 'U')
              )}
            </div>
            <div className="user-text-info">
              <span className="user-text-name">{currentUser?.name || currentUser?.fullName || 'Người dùng'}</span>
              <span className="user-text-role">{currentUser?.username || currentUser?.roleTitle || 'HRM User'}</span>
            </div>
            <ChevronDown size={13} style={{ color: '#94a3b8', marginLeft: '4px' }} />
          </div>

          {showUserMenu && (
            <div className="role-dropdown-menu" style={{ width: '240px', right: 0 }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                  {currentUser?.name || currentUser?.fullName || 'Người dùng'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  {currentUser?.email || `@${currentUser?.username}`}
                </div>
                <div style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10.5px',
                  fontWeight: '700',
                  background: roleInfo.bg,
                  color: roleInfo.color
                }}>
                  {currentUser?.roleTitle || roleInfo.label}
                </div>
              </div>

              {currentUser?.role === 'Employee' && (
                <div
                  className="role-option-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onNavigate) onNavigate('employee-profile');
                  }}
                >
                  <User size={14} style={{ color: '#64748b' }} />
                  <div className="role-option-info">
                    <b style={{ fontSize: '12.5px' }}>Hồ sơ của tôi</b>
                  </div>
                </div>
              )}

              <div
                className="role-option-item"
                style={{ color: '#ef4444', marginTop: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}
                onClick={() => {
                  setShowUserMenu(false);
                  if (onLogout) onLogout();
                }}
              >
                <LogOut size={14} style={{ color: '#ef4444' }} />
                <div className="role-option-info">
                  <b style={{ fontSize: '12.5px', color: '#ef4444' }}>Đăng xuất khỏi hệ thống</b>
                  <small style={{ color: '#f87171' }}>Xóa phiên đăng nhập</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
