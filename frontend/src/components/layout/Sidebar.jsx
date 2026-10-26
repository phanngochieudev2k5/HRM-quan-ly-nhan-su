import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Clock, CalendarDays, Timer,
  DollarSign, Briefcase, Award, Laptop, BarChart3,
  Settings, ChevronDown, ChevronRight, ChevronLeft,
  ScanFace, FileText, UserCheck, ShieldCheck, GraduationCap,
  Shield, CreditCard, Building2, Calendar
} from 'lucide-react';
import '../../styles/layout/Sidebar.css';

export default function Sidebar({ currentRole, activeModule, activeSubModule, onNavigate, collapsed, setCollapsed }) {
  const [openSubmenus, setOpenSubmenus] = useState({
    'hr-employees': true,
    'hr-attendance': true,
    'hr-recruitment': true
  });

  useEffect(() => {
    if (activeModule) {
      setOpenSubmenus(prev => ({
        ...prev,
        [activeModule]: true
      }));
    }
  }, [activeModule]);

  const toggleSubmenu = (key) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getNavItemsByRole = () => {
    switch (currentRole) {
      case 'Admin':
        return [
          { id: 'admin-dashboard', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
          { id: 'admin-accounts', label: 'Tài khoản & Phân quyền', icon: Users },
          { id: 'admin-logs', label: 'Nhật ký bảo mật (Logs)', icon: FileText },
          { id: 'admin-settings', label: 'Cấu hình hệ thống', icon: Settings }
        ];

      case 'Manager':
        return [
          { id: 'manager-dashboard', label: 'Tổng quan nhóm', icon: LayoutDashboard },
          { id: 'manager-team', label: 'Thành viên trong nhóm', icon: Users },
          { id: 'manager-leaves', label: 'Phê duyệt đơn nghỉ', icon: CalendarDays, badge: '1 chờ' },
          { id: 'manager-overtime', label: 'Phê duyệt tăng ca', icon: Timer, badge: '1 chờ' },
          { id: 'manager-performance', label: 'Đánh giá KPI nhóm', icon: Award }
        ];

      case 'Employee':
        return [
          { id: 'employee-dashboard', label: 'Không gian cá nhân', icon: LayoutDashboard },
          { id: 'employee-profile', label: 'Hồ sơ của tôi', icon: UserCheck },
          { id: 'employee-checkin', label: 'Chấm công khuôn mặt', icon: ScanFace, badge: 'OpenCV' },
          { id: 'employee-attendance', label: 'Lịch sử công của tôi', icon: Clock },
          { id: 'employee-leave', label: 'Nghỉ phép của tôi', icon: CalendarDays },
          { id: 'employee-overtime', label: 'Đăng ký tăng ca (OT)', icon: Timer },
          { id: 'employee-payslip', label: 'Phiếu lương cá nhân', icon: DollarSign },
          { id: 'employee-training', label: 'Khóa đào tạo nội bộ', icon: GraduationCap }
        ];

      case 'Finance':
        return [
          { id: 'finance-dashboard', label: 'Tổng quan quỹ lương', icon: LayoutDashboard },
          { id: 'finance-calc', label: 'Bảng thanh toán lương', icon: DollarSign, badge: 'T04' },
          { id: 'finance-components', label: 'Gross ⇄ Net & Phụ cấp', icon: Settings },
          { id: 'finance-reports', label: 'Báo cáo thuế & Ngân hàng', icon: BarChart3 }
        ];

      case 'HR':
      default:
        return [
          { id: 'hr-dashboard', label: 'Tổng quan nhân sự', icon: LayoutDashboard },
          {
            id: 'hr-employees',
            label: 'Quản lý nhân sự',
            icon: Users,
            subItems: [
              { id: 'list', label: 'Danh sách nhân viên' },
              { id: 'onboarding', label: 'Tiếp nhận Onboarding' },
              { id: 'contracts', label: 'Hợp đồng lao động' },
              { id: 'org', label: 'Sơ đồ tổ chức' }
            ]
          },
          {
            id: 'hr-attendance',
            label: 'Chấm công & Điểm danh',
            icon: Clock,
            badge: 'OpenCV',
            subItems: [
              { id: 'history', label: 'Bảng chấm công tháng' },
              { id: 'face-checkin', label: 'Camera Kiosk OpenCV' },
              { id: 'register-face', label: 'Đăng ký Face ID' },
              { id: 'shifts', label: 'Ca làm việc & Lịch trực' }
            ]
          },
          {
            id: 'hr-recruitment',
            label: 'Tuyển dụng',
            icon: Briefcase,
            subItems: [
              { id: 'jobs', label: 'Vị trí tuyển dụng' },
              { id: 'candidates', label: 'Pipeline ứng viên' }
            ]
          },
          { id: 'hr-leave', label: 'Quản lý nghỉ phép', icon: CalendarDays },
          { id: 'hr-overtime', label: 'Quản lý tăng ca (OT)', icon: Timer },
          { id: 'hr-assets', label: 'Tài sản thiết bị', icon: Laptop },
          { id: 'hr-reports', label: 'Báo cáo nhân sự', icon: BarChart3 }
        ];
    }
  };

  const navItems = getNavItemsByRole();

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-wrapper">
          <div className="brand-logo-box">
            <Building2 size={20} />
          </div>
          {!collapsed && (
            <div className="brand-text-box">
              <b>ENTERPRISE HRM</b>
              <small>Hệ thống Quản trị Nhân sự</small>
            </div>
          )}
        </div>
        <button
          className="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          const hasSub = item.subItems && item.subItems.length > 0;
          const isSubOpen = !!openSubmenus[item.id];

          return (
            <div key={item.id}>
              <button
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (hasSub) {
                    if (!isActive) {
                      
                      setOpenSubmenus(prev => ({ ...prev, [item.id]: true }));
                      onNavigate(item.id, item.subItems[0].id);
                    } else {
                      
                      toggleSubmenu(item.id);
                    }
                  } else {
                    onNavigate(item.id);
                  }
                }}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon"><Icon size={18} /></span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="nav-badge-pill">{item.badge}</span>
                )}
                {!collapsed && hasSub && (
                  <span
                    style={{ marginLeft: 'auto', display: 'grid', placeItems: 'center', padding: '2px 4px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubmenu(item.id);
                    }}
                    title={isSubOpen ? 'Thu gọn menu con' : 'Mở rộng menu con'}
                  >
                    {isSubOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                )}
              </button>

              {!collapsed && hasSub && isSubOpen && (
                <div className="nav-submenu">
                  {item.subItems.map((sub) => {
                    const isSubActive = isActive && (
                      activeSubModule === sub.id ||
                      (!activeSubModule && sub.id === item.subItems[0]?.id)
                    );
                    return (
                      <button
                        key={sub.id}
                        className={`subnav-item-btn ${isSubActive ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id, sub.id)}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="system-status-indicator">
            <span className="status-dot-pulse"></span>
            <span>Hệ thống trực tuyến</span>
          </div>
          <div className="sidebar-footer-text">
            Doanh nghiệp: <b>Enterprise VN</b>
            <br />
            Phiên bản HRM 2026
          </div>
        </div>
      )}
    </aside>
  );
}
