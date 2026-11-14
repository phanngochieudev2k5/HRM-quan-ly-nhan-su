import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Clock, DollarSign, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import AuthService from '../../../services/AuthService';
import AttendanceService from '../../../services/AttendanceService';
import '../../../styles/roles/employee/EmployeeDashboard.css';

export default function EmployeeDashboard({ onNavigate, currentUser }) {
  const user = currentUser || AuthService.getCurrentUser() || {};
  const displayName = user.name || user.fullName || user.username || 'Nhân viên';
  const [attRecords, setAttRecords] = useState([]);

  useEffect(() => {
    const fetchAtt = async () => {
      try {
        const now = new Date();
        const res = await AttendanceService.getMyAttendance({
          employeeId: user.employeeId || user.EmployeeId || null,
          userId: user.userId || user.id || null,
          employeeCode: user.employeeCode || user.EmployeeCode || user.username,
          username: user.username || user.Username,
          year: now.getFullYear(),
          month: now.getMonth() + 1
        });
        const list = (res?.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
        setAttRecords(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAtt();
  }, [user]);

  const workDaysCount = attRecords.filter(r => r.TimeInStr).length;
  const otHours = attRecords.reduce((acc, r) => acc + (parseFloat(r.OvertimeHours) || 0), 0);
  const recentRecords = [...attRecords].reverse().slice(0, 5);

  return (
    <div className="employee-dashboard-container">
      <div className="emp-hero-banner">
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5eead4', fontWeight: 700 }}>
            CỔNG THÔNG TIN NHÂN SỰ CÁ NHÂN
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0' }}>Xin chào, {displayName}!</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#99f6e4' }}>
            Vai trò: <strong>{user.roleTitle || 'Nhân viên cá nhân'}</strong> · Ca làm việc: Ca Hành Chính Chuẩn (08:00 - 17:30)
          </p>
        </div>

        <div className="ph-tools">
          <button
            className="btn pri"
            onClick={() => window.open('/kiosk', '_blank')}
          >
            <Camera size={15} />
            <span>Trạm Kiosk Chấm Công</span>
          </button>
          <button
            className="btn"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
            onClick={() => onNavigate('employee-payslip')}
          >
            <DollarSign size={15} />
            <span>Xem phiếu lương</span>
          </button>
        </div>
      </div>

      <div className="grid c4">
        <StatCard
          title="NGÀY CÔNG THÁNG"
          value={`${workDaysCount} / 22`}
          subtext={workDaysCount > 0 ? `Đạt ${((workDaysCount / 22) * 100).toFixed(1)}% chỉ tiêu công` : 'Chưa có ngày công trong tháng'}
          icon={Clock}
          color="#0f766e"
          bg="#ccfbf1"
        />
        <StatCard
          title="PHÉP NĂM CÒN LẠI"
          value="12.0"
          unit="ngày"
          subtext="Chưa sử dụng ngày phép"
          icon={Calendar}
          color="#2563eb"
          bg="#dbeafe"
        />
        <StatCard
          title="THỰC LĨNH TẠM TÍNH"
          value="0"
          unit="đ"
          subtext="Theo dữ liệu công thực tế"
          icon={DollarSign}
          color="#16a34a"
          bg="#dcfce7"
        />
        <StatCard
          title="GIỜ TĂNG CA (OT)"
          value={otHours.toFixed(1)}
          unit="giờ"
          subtext={otHours > 0 ? 'Đã được Quản lý duyệt' : 'Chưa có giờ tăng ca'}
          icon={Award}
          color="#7c3aed"
          bg="#ede9fe"
        />
      </div>

      <div className="grid c2">
        <div className="card">
          <div className="card-h">
            <h3>Lịch sử điểm danh gần nhất</h3>
            <button className="btn sm" onClick={() => onNavigate('employee-attendance')}>
              <span>Xem toàn bộ lịch</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-b">
            {recentRecords.length > 0 ? (
              recentRecords.map((r) => {
                const isLate = r.LateMinutes > 0;
                return (
                  <div className="tli" key={r.AttendanceId || r.DayNum}>
                    <span className={`badge ${isLate ? 'b-amber' : 'b-green'}`}>
                      {r.AttendanceDate ? String(r.AttendanceDate).slice(0, 10) : `Ngày ${r.DayNum}`}
                    </span>
                    <div className="grow">
                      <b>{r.AttendanceDate ? String(r.AttendanceDate).slice(0, 10) : `Ngày ${r.DayNum}`}</b>
                      <small>Giờ vào: {r.TimeInStr ? r.TimeInStr.slice(0, 5) : '---'} · Giờ ra: {r.TimeOutStr ? r.TimeOutStr.slice(0, 5) : 'Đang làm việc'}</small>
                    </div>
                    <span className={`badge ${isLate ? 'b-amber' : 'b-green'}`}>
                      {isLate ? `Muộn ${r.LateMinutes}p` : 'Đúng giờ'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontStyle: 'italic' }}>
                Chưa có dữ liệu điểm danh trong tháng. Hãy check-in tại Kiosk.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Tóm tắt phiếu lương kỳ 2026-04</h3>
            <button className="btn sm" onClick={() => onNavigate('employee-payslip')}>
              <span>Chi tiết phiếu</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-b">
            <div className="calc-out">
              <div>
                <span>Lương theo ngày công làm việc:</span>
                <b>22.000.000 đ</b>
              </div>
              <div>
                <span>Phụ cấp chuyên cần & thâm niên:</span>
                <b>+ 600.000 đ</b>
              </div>
              <div>
                <span>Phụ cấp ăn trưa (miễn thuế):</span>
                <b>+ 730.000 đ</b>
              </div>
              <div>
                <span>Tiền làm thêm giờ (OT miễn thuế):</span>
                <b>+ 1.269.231 đ</b>
              </div>
              <div>
                <span>Bảo hiểm xã hội, y tế, thất nghiệp:</span>
                <b style={{ color: '#dc2626' }}>- 2.310.000 đ</b>
              </div>
              <div>
                <span>Thuế thu nhập cá nhân (TNCN):</span>
                <b style={{ color: '#dc2626' }}>- 79.462 đ</b>
              </div>
              <div style={{ paddingTop: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#042f2e' }}>THỰC LĨNH CHUYỂN KHOẢN:</span>
                <b style={{ fontSize: '18px', color: '#0f766e', fontWeight: 800 }}>23.209.769 đ</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
