import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Clock, CalendarDays, Timer,
  DollarSign, Briefcase, Award, Laptop, BarChart3,
  Settings, ChevronDown, ChevronRight, ChevronLeft,
  ScanFace, FileText, Building2, UserCheck, CheckSquare
} from 'lucide-react';

export default function Sidebar({ activeModule, activeSubModule, onNavigate, collapsed, setCollapsed }) {
  // Submenu open states
  const [openSubmenus, setOpenSubmenus] = useState({
    employees: true,
    attendance: true,
    payroll: false,
    recruitment: false,
    performance: false
  });

  const toggleSubmenu = (key) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard
    },
    {
      id: 'employees',
      label: 'Nhân sự',
      icon: Users,
      subItems: [
        { id: 'list', label: 'Danh sách nhân viên' },
        { id: 'profile', label: 'Hồ sơ nhân viên' },
        { id: 'contracts', label: 'Hợp đồng lao động' },
        { id: 'org', label: 'Cơ cấu tổ chức' },
        { id: 'history', label: 'Lịch sử công tác' }
      ]
    },
    {
      id: 'attendance',
      label: 'Chấm công',
      icon: Clock,
      badge: 'OpenCV',
      subItems: [
        { id: 'face-checkin', label: 'Chấm công khuôn mặt (OpenCV)' },
        { id: 'history', label: 'Lịch sử chấm công' },
        { id: 'register-face', label: 'Đăng ký khuôn mặt' },
        { id: 'shifts', label: 'Ca làm việc' },
        { id: 'report', label: 'Báo cáo chấm công' }
      ]
    },
    {
      id: 'leave',
      label: 'Nghỉ phép',
      icon: CalendarDays
    },
    {
      id: 'overtime',
      label: 'Tăng ca (OT)',
      icon: Timer
    },
    {
      id: 'payroll',
      label: 'Lương & Thưởng',
      icon: DollarSign,
      subItems: [
        { id: 'list', label: 'Bảng lương chi tiết' },
        { id: 'period', label: 'Kỳ tính lương' }
      ]
    },
    {
      id: 'recruitment',
      label: 'Tuyển dụng',
      icon: Briefcase,
      subItems: [
        { id: 'jobs', label: 'Vị trí tuyển dụng' },
        { id: 'candidates', label: 'Pipeline ứng viên' }
      ]
    },
    {
      id: 'performance',
      label: 'Đánh giá KPI',
      icon: Award
    },
    {
      id: 'assets',
      label: 'Tài sản & Thiết bị',
      icon: Laptop
    },
    {
      id: 'reports',
      label: 'Báo cáo thống kê',
      icon: BarChart3
    },
    {
      id: 'settings',
      label: 'Cài đặt hệ thống',
      icon: Settings
    }
  ];

  return (
    <aside style={{
      width: collapsed ? '68px' : '260px',
      background: '#0f172a',
      color: '#94a3b8',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      transition: 'width 0.25s ease',
      borderRight: '1px solid #1e293b',
      userSelect: 'none',
      position: 'relative',
      zIndex: 110
    }}>
      {/* Brand Header */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0' : '0 18px',
        borderBottom: '1px solid #1e293b'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '16px'
            }}>
              H
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>HRM ENTERPRISE</div>
              <div style={{ fontSize: '10.5px', color: '#64748b', letterSpacing: '0.04em' }}>MODERN WORKSPACE</div>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            color: '#94a3b8',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          const hasSubs = item.subItems && item.subItems.length > 0;
          const isOpen = openSubmenus[item.id];

          return (
            <div key={item.id} style={{ marginBottom: '4px' }}>
              <div
                onClick={() => {
                  if (hasSubs && !collapsed) {
                    toggleSubmenu(item.id);
                    onNavigate(item.id, item.subItems[0].id);
                  } else {
                    onNavigate(item.id, hasSubs ? item.subItems[0].id : null);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: collapsed ? '10px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13.5px',
                  transition: 'background 0.15s ease, color 0.15s ease'
                }}
                title={collapsed ? item.label : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                  {!collapsed && <span>{item.label}</span>}
                </div>

                {!collapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.badge && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        background: '#10b981',
                        color: '#ffffff',
                        padding: '1px 6px',
                        borderRadius: '10px'
                      }}>
                        {item.badge}
                      </span>
                    )}
                    {hasSubs && (
                      <span style={{ color: isActive ? '#ffffff' : '#64748b' }}>
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Submenu */}
              {hasSubs && isOpen && !collapsed && (
                <div style={{
                  paddingLeft: '32px',
                  marginTop: '2px',
                  marginBottom: '4px',
                  borderLeft: '1px solid #1e293b',
                  marginLeft: '18px'
                }}>
                  {item.subItems.map((sub) => {
                    const isSubActive = isActive && activeSubModule === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => onNavigate(item.id, sub.id)}
                        style={{
                          padding: '7px 10px',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          color: isSubActive ? '#60a5fa' : '#94a3b8',
                          fontWeight: isSubActive ? 600 : 400,
                          borderRadius: '6px',
                          background: isSubActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                          transition: 'color 0.15s ease'
                        }}
                      >
                        {sub.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid #1e293b',
          fontSize: '11.5px',
          color: '#64748b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Phiên bản v1.0.0</span>
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
            Online
          </span>
        </div>
      )}
    </aside>
  );
}
