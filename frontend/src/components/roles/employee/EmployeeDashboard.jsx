import React from 'react';
import { Camera, Calendar, Clock, DollarSign, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import StatCard from '../../common/StatCard';
import StatusBadge from '../../common/StatusBadge';
import '../../../styles/roles/employee/EmployeeDashboard.css';

export default function EmployeeDashboard({ onNavigate }) {
  return (
    <div className="employee-dashboard-container">
      <div className="emp-hero-banner">
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5eead4', fontWeight: 700 }}>
            CỔNG THÔNG TIN NHÂN SỰ CÁ NHÂN
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0' }}>Xin chào, Lê Hoàng Long!</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#99f6e4' }}>
            Hôm nay: Thứ Hai · Ca làm việc: Ca Hành Chính Chuẩn (08:00 - 17:30) · Đã check-in lúc 08:02
          </p>
        </div>

        <div className="ph-tools">
          <button
            className="btn pri"
            onClick={() => onNavigate('employee-checkin')}
          >
            <Camera size={15} />
            <span>Chấm công OpenCV</span>
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
          value="21.5 / 26"
          subtext="Đạt 96.2% chỉ tiêu công"
          icon={Clock}
          color="#0f766e"
          bg="#ccfbf1"
          trend="+1.2%"
        />
        <StatCard
          title="PHÉP NĂM CÒN LẠI"
          value="11.0"
          unit="ngày"
          subtext="Đã sử dụng 1.0 / 12 ngày phép"
          icon={Calendar}
          color="#2563eb"
          bg="#dbeafe"
        />
        <StatCard
          title="THỰC LĨNH THÁNG 04/2026"
          value="23.209.769"
          unit="đ"
          subtext="Đã giải ngân qua Vietcombank"
          icon={DollarSign}
          color="#16a34a"
          bg="#dcfce7"
        />
        <StatCard
          title="GIỜ TĂNG CA (OT)"
          value="8.0"
          unit="giờ"
          subtext="Được miễn thuế TNCN 2026"
          icon={Award}
          color="#7c3aed"
          bg="#ede9fe"
        />
      </div>

      <div className="grid c2">
        <div className="card">
          <div className="card-h">
            <h3>Lịch sử điểm danh 5 ngày gần nhất</h3>
            <button className="btn sm" onClick={() => onNavigate('employee-attendance')}>
              <span>Xem toàn bộ lịch</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-b">
            <div className="tli">
              <span className="badge b-green">Hôm nay</span>
              <div className="grow">
                <b>Thứ Hai, 25/04/2026</b>
                <small>Giờ vào: 08:02:15 · Giờ ra: Đang làm việc</small>
              </div>
              <span className="badge b-green">Đúng giờ</span>
            </div>
            <div className="tli">
              <span className="badge b-p">Hôm qua</span>
              <div className="grow">
                <b>Chủ nhật, 24/04/2026</b>
                <small>Ngày nghỉ tuần</small>
              </div>
              <span className="muted small">Nghỉ tuần</span>
            </div>
            <div className="tli">
              <span className="badge b-p">23/04</span>
              <div className="grow">
                <b>Thứ Bảy, 23/04/2026</b>
                <small>Giờ vào: 08:01:10 · Giờ ra: 17:32:00</small>
              </div>
              <span className="badge b-green">Đúng giờ</span>
            </div>
            <div className="tli">
              <span className="badge b-amber">16/04</span>
              <div className="grow">
                <b>Thứ Sáu, 16/04/2026</b>
                <small>Giờ vào: 08:45:00 (Đi muộn 15p) · Giờ ra: 17:30:00</small>
              </div>
              <span className="badge b-amber">Đi muộn 15p</span>
            </div>
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
