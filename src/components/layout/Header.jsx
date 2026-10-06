import React, { useState } from 'react';
import {
  Search, Bell, MessageSquare, ChevronDown, User, Shield,
  LogOut, Settings, CheckCircle2, AlertTriangle, Calendar
} from 'lucide-react';

export default function Header({ currentRole, setCurrentRole, currentUser, onNavigate }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles = [
    { key: 'HR', label: 'HR Manager (Quản trị Nhân sự)', desc: 'Toàn quyền Nhân sự, Tuyển dụng, Chấm công' },
    { key: 'Admin', label: 'System Admin (Quản trị Hệ thống)', desc: 'Toàn quyền cấu hình hệ thống & người dùng' },
    { key: 'Manager', label: 'Team Manager (Trưởng bộ phận)', desc: 'Quản lý duyệt phép, duyệt OT, đánh giá KPI' },
    { key: 'Finance', label: 'Finance (Kế toán tiền lương)', desc: 'Chuyên viên Bảng lương & Chi phí' },
    { key: 'Employee', label: 'Nhân viên (Cá nhân)', desc: 'Xem hồ sơ cá nhân, chấm công, xin nghỉ phép' }
  ];

  const notifications = [
    { id: 1, title: 'Yêu cầu nghỉ phép mới', desc: 'Trần Thị Bích xin nghỉ phép 3 ngày từ 25/04', time: '10 phút trước', type: 'leave' },
    { id: 2, title: 'Cảnh báo hợp đồng sắp hết hạn', desc: '2 nhân viên sắp hết hạn hợp đồng trong 15 ngày tới', time: '1 giờ trước', type: 'contract' },
    { id: 3, title: 'Chấm công OpenCV ghi nhận', desc: 'Nguyễn Văn A check-in thành công lúc 08:05', time: '2 giờ trước', type: 'attendance' }
  ];

  return (
    <header style={{
      height: '64px',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'relative',
      zIndex: 100
    }}>
      {/* Global Search Bar */}
      <div style={{ position: 'relative', width: '380px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="🔍 Tìm nhân viên, mã NV, hợp đồng, đơn nghỉ, ứng viên..."
          style={{
            width: '100%',
            height: '38px',
            paddingLeft: '38px',
            paddingRight: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '13px',
            outline: 'none',
            color: '#0f172a'
          }}
        />
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Switch Role Pill (Demo helper) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 500,
              color: '#1d4ed8',
              cursor: 'pointer'
            }}
            title="Đổi vai trò để trải nghiệm phân quyền hệ thống"
          >
            <Shield size={14} />
            <span>Vai trò: <strong>{currentRole}</strong></span>
            <ChevronDown size={12} />
          </button>

          {showRoleMenu && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              width: '280px',
              background: '#ffffff',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0',
              padding: '8px',
              zIndex: 1000
            }}>
              <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                Chọn vai trò thử nghiệm
              </div>
              {roles.map(r => (
                <div
                  key={r.key}
                  onClick={() => {
                    setCurrentRole(r.key);
                    setShowRoleMenu(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: currentRole === r.key ? '#eff6ff' : 'transparent',
                    color: currentRole === r.key ? '#1d4ed8' : '#334155',
                    fontSize: '12.5px'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{r.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative' }}
          >
            <Bell size={19} />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444'
            }}></span>
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              width: '320px',
              background: '#ffffff',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13.5px' }}>Thông báo (3)</span>
                <span style={{ fontSize: '11.5px', color: '#2563eb', cursor: 'pointer' }}>Đánh dấu đã đọc</span>
              </div>
              <div>
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 500, fontSize: '13px', color: '#0f172a' }}>{n.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{n.desc}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <button className="btn-icon" title="Tin nhắn nội bộ">
          <MessageSquare size={19} />
        </button>

        {/* User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '12px',
          borderLeft: '1px solid #e2e8f0',
          cursor: 'pointer'
        }}
        onClick={() => onNavigate('employees', 'profile')}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
          />
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{currentUser.name}</div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>{currentUser.id} • {currentRole}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
