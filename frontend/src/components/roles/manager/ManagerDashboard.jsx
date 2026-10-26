import React from 'react';
import { Users, Clock, CalendarDays, Timer, ArrowRight } from 'lucide-react';
import PageHeader from '../../common/PageHeader';
import StatCard from '../../common/StatCard';
import StatusBadge from '../../common/StatusBadge';
import { employeesData, leaveRequestsData, overtimeRequestsData } from '../../../data/mockData';
import '../../../styles/roles/manager/ManagerDashboard.css';

export default function ManagerDashboard({ onNavigate }) {
  const teamEmps = employeesData.filter(e => e.department === 'Khối Kỹ Thuật (IT)' || e.manager === 'Trần Thị Bích');
  const pendingLeaves = leaveRequestsData.filter(l => l.status === 'PENDING').length;
  const pendingOts = overtimeRequestsData.filter(o => o.status === 'PENDING').length;

  return (
    <div className="mgr-dashboard-container">
      <PageHeader
        breadcrumb="Quản lý Nhóm / Bảng điều khiển"
        title="Bảng điều khiển Trưởng bộ phận"
        subtitle="Tổng quan tình hình nhân sự, quân số ca làm việc và các yêu cầu cần phê duyệt trong nhóm"
      />

      <div className="grid c4">
        <StatCard
          title="QUÂN SỐ NHÓM"
          value={teamEmps.length}
          unit="người"
          subtext="Thành viên chính thức & thử việc"
          icon={Users}
          color="#0f766e"
          bg="#ccfbf1"
        />
        <StatCard
          title="ĐI LÀM HÔM NAY"
          value="2 / 3"
          subtext="1 nhân sự vắng có phép"
          icon={Clock}
          color="#16a34a"
          bg="#dcfce7"
        />
        <StatCard
          title="ĐƠN NGHỈ CHỜ DUYỆT"
          value={pendingLeaves}
          unit="đơn"
          subtext="Cần xử lý phê duyệt kịp thời"
          icon={CalendarDays}
          color="#f59e0b"
          bg="#fef3c7"
        />
        <StatCard
          title="ĐĂNG KÝ OT CHỜ DUYỆT"
          value={pendingOts}
          unit="kế hoạch"
          subtext="Yêu cầu làm thêm ngoài giờ"
          icon={Timer}
          color="#7c3aed"
          bg="#ede9fe"
        />
      </div>

      <div className="grid c2">
        <div className="card">
          <div className="card-h">
            <h3>Thành viên trong bộ phận</h3>
            <button
              className="btn sm"
              onClick={() => onNavigate('manager-team')}
            >
              <span>Xem chi tiết</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-b">
            <div className="mgr-member-list">
              {teamEmps.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  Chưa có nhân sự nào trong bộ phận.
                </div>
              ) : (
                teamEmps.map(emp => (
                  <div key={emp.id} className="mgr-member-item">
                    <div className="mgr-member-info">
                      <img src={emp.avatar} alt={emp.name} className="mgr-avatar" />
                      <div>
                        <div className="mgr-member-name">{emp.name}</div>
                        <div className="mgr-member-pos">{emp.position} · {emp.id}</div>
                      </div>
                    </div>
                    <StatusBadge status={emp.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Yêu cầu chờ bạn phê duyệt</h3>
            <button
              className="btn sm"
              onClick={() => onNavigate('manager-leaves')}
            >
              <span>Xem tất cả</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-b">
            <div className="mgr-task-list">
              {leaveRequestsData.filter(l => l.status === 'PENDING').length === 0 && overtimeRequestsData.filter(o => o.status === 'PENDING').length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  Hiện tại không có yêu cầu nào chờ bạn phê duyệt.
                </div>
              ) : (
                <>
                  {leaveRequestsData.filter(l => l.status === 'PENDING').map(l => (
                    <div key={l.id} className="mgr-req-card mgr-req-leave">
                      <div>
                        <div className="mgr-req-title" style={{ color: '#92400e' }}>
                          {l.empName} - Xin nghỉ phép ({l.days} ngày)
                        </div>
                        <div className="mgr-req-sub" style={{ color: '#b45309' }}>
                          Lý do: {l.reason} · Thời gian: {l.startDate}
                        </div>
                      </div>
                      <button
                        className="btn pri sm"
                        onClick={() => onNavigate('manager-leaves')}
                      >
                        Xử lý
                      </button>
                    </div>
                  ))}

                  {overtimeRequestsData.filter(o => o.status === 'PENDING').map(o => (
                    <div key={o.id} className="mgr-req-card mgr-req-ot">
                      <div>
                        <div className="mgr-req-title" style={{ color: '#5b21b6' }}>
                          {o.empName} - Đăng ký tăng ca ({o.hours}h)
                        </div>
                        <div className="mgr-req-sub" style={{ color: '#6d28d9' }}>
                          Dự án: {o.project} · Thời gian: {o.date}
                        </div>
                      </div>
                      <button
                        className="btn pri sm"
                        onClick={() => onNavigate('manager-overtime')}
                      >
                        Xử lý
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
