import React from 'react';
import {
  Users, UserCheck, UserMinus, UserPlus,
  Clock, AlertCircle, Calendar, ArrowRight,
  TrendingUp, Award, CheckCircle2, ChevronRight, Camera
} from 'lucide-react';

export default function DashboardView({ onNavigate, currentUser }) {
  const kpis = [
    { label: 'Tổng nhân viên', value: 128, sub: '+4 tháng này', icon: Users, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Đang làm việc', value: 112, sub: '87.5% tổng số', icon: UserCheck, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Nghỉ việc / Thôi việc', value: 5, sub: 'Tỷ lệ rời bỏ 3.9%', icon: UserMinus, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Ứng tuyển đang xét', value: 12, sub: '4 vòng phỏng vấn', icon: UserPlus, color: '#f59e0b', bg: '#fffbeb' }
  ];

  const tasks = [
    { id: 1, title: '3 yêu cầu nghỉ phép cần duyệt', desc: 'Trần Thị Bích và 2 nhân viên khác chờ xét duyệt', path: ['leave', null], badge: 'Cần duyệt', color: 'badge-warning' },
    { id: 2, title: '2 yêu cầu tăng ca (OT) chờ phê duyệt', desc: 'Dự án sprint 4 & tối ưu hóa cơ sở dữ liệu', path: ['overtime', null], badge: 'Ưu tiên', color: 'badge-info' },
    { id: 3, title: '8 hợp đồng lao động sắp hết hạn', desc: 'Đỗ Gia Huy (thử việc), Trần Bích (3 năm)... trong 30 ngày', path: ['employees', 'contracts'], badge: 'Hạn chót', color: 'badge-danger' },
    { id: 4, title: 'Camera OpenCV Cổng A cần hiệu chuẩn độ nhạy', desc: 'Độ tin cậy trung bình đạt 96.8% hôm nay', path: ['attendance', 'face-checkin'], badge: 'Hệ thống', color: 'badge-success' }
  ];

  const attendanceWeek = [
    { day: 'Thứ 2', onTime: 104, late: 6, leave: 2 },
    { day: 'Thứ 3', onTime: 108, late: 3, leave: 1 },
    { day: 'Thứ 4', onTime: 106, late: 5, leave: 1 },
    { day: 'Thứ 5', onTime: 109, late: 2, leave: 1 },
    { day: 'Thứ 6', onTime: 105, late: 4, leave: 3 },
    { day: 'Thứ 7', onTime: 42, late: 1, leave: 0 }
  ];

  const leaveTypes = [
    { name: 'Nghỉ phép năm', percent: 60, color: '#2563eb', days: 24 },
    { name: 'Nghỉ ốm / Khám bệnh', percent: 25, color: '#10b981', days: 10 },
    { name: 'Nghỉ không lương', percent: 10, color: '#f59e0b', days: 4 },
    { name: 'Nghỉ thai sản / Khác', percent: 5, color: '#8b5cf6', days: 2 }
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
        borderRadius: '12px',
        padding: '24px 28px',
        color: '#ffffff',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, marginBottom: '6px' }}>
            Hệ thống Quản Trị Nhân Sự Doanh Nghiệp
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>
            Xin chào, {currentUser.name}! 👋
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px', maxWidth: '580px' }}>
            Chúc bạn một ngày làm việc tràn đầy năng lượng và hiệu quả. Hệ thống chấm công OpenCV đang hoạt động ổn định trên toàn bộ 2 cổng ra vào.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 2 }}>
          <button
            onClick={() => onNavigate('attendance', 'face-checkin')}
            className="btn"
            style={{
              background: '#ffffff',
              color: '#1d4ed8',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <Camera size={16} />
            Mở Camera Chấm Công OpenCV
          </button>
          <button
            onClick={() => onNavigate('employees', 'list')}
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              fontWeight: 500
            }}
          >
            Quản lý Nhân viên
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        marginBottom: '24px'
      }}>
        {kpis.map((k, idx) => {
          const Icon = k.icon;
          return (
            <div key={idx} className="hrm-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: k.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: k.color,
                flexShrink: 0
              }}>
                <Icon size={24} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{k.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{k.value}</div>
                <div style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 500, marginTop: '2px' }}>{k.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section: Attendance Trend & Leave Types */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Attendance Statistics */}
        <div className="hrm-card">
          <div className="card-header">
            <span className="card-title">
              <Clock size={18} color="#2563eb" />
              Tình hình chấm công tuần này
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Tuần 16 (14/04 - 20/04)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attendanceWeek.map((item, idx) => {
              const total = item.onTime + item.late + item.leave;
              const onTimePct = (item.onTime / total) * 100;
              const latePct = (item.late / total) * 100;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{item.day}</span>
                    <span style={{ color: '#64748b' }}>
                      <strong style={{ color: '#10b981' }}>{item.onTime}</strong> đúng giờ • <strong style={{ color: '#f59e0b' }}>{item.late}</strong> muộn • <strong style={{ color: '#64748b' }}>{item.leave}</strong> phép
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${onTimePct}%`, background: '#10b981' }} title={`Đúng giờ: ${item.onTime}`}></div>
                    <div style={{ width: `${latePct}%`, background: '#f59e0b' }} title={`Đi muộn: ${item.late}`}></div>
                    <div style={{ width: `${100 - onTimePct - latePct}%`, background: '#94a3b8' }} title={`Nghỉ phép: ${item.leave}`}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Đúng giờ
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> Đi muộn
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }}></span> Vắng/Nghỉ phép
            </span>
          </div>
        </div>

        {/* Leave Distribution */}
        <div className="hrm-card">
          <div className="card-header">
            <span className="card-title">
              <Calendar size={18} color="#2563eb" />
              Phân bổ loại nghỉ phép tháng 04
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Tổng: 40 lượt xin nghỉ</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {leaveTypes.map((lt, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 500, color: '#334155' }}>{lt.name}</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{lt.days} ngày ({lt.percent}%)</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${lt.percent}%`, height: '100%', background: lt.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '12.5px', color: '#475569' }}>
              Quỹ phép trung bình toàn công ty còn lại: <strong>8.4 ngày / nhân viên</strong>
            </div>
            <button
              onClick={() => onNavigate('leave', null)}
              className="btn btn-sm btn-outline-primary"
            >
              Xem quỹ phép
            </button>
          </div>
        </div>
      </div>

      {/* Task & Action Items Section */}
      <div className="hrm-card">
        <div className="card-header">
          <span className="card-title">
            <AlertCircle size={18} color="#ea580c" />
            Công việc & Yêu cầu cần xử lý ngay ({tasks.length})
          </span>
          <span style={{ fontSize: '12.5px', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>
            Đánh dấu hoàn tất tất cả
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.map(t => (
            <div
              key={t.id}
              onClick={() => onNavigate(t.path[0], t.path[1])}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, transform 0.1s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`status-badge ${t.color}`}>{t.badge}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a' }}>{t.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{t.desc}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontSize: '13px', fontWeight: 500 }}>
                <span>Xử lý</span>
                <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
