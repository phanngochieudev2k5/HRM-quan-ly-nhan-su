import React from 'react';
import { BarChart3, Download, Users, TrendingUp, Calendar, Printer } from 'lucide-react';
import StatCard from '../../../components/common/StatCard';
import '../../../styles/roles/hr/HrReportsView.css';

export default function HrReportsView() {
  return (
    <div className="hr-reports-container">
      <div className="ph">
        <div>
          <h1>Báo cáo thống kê nhân sự tổng hợp</h1>
          <p>Phân tích tỷ lệ đi làm, cơ cấu giới tính, trình độ học vấn và thâm niên công tác</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={() => window.print()}>
            <Printer size={15} />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      <div className="grid c3">
        <StatCard
          title="TỶ LỆ ĐI LÀM ĐÚNG GIỜ"
          value="96.2%"
          subtext="Điểm danh qua Camera OpenCV"
          icon={TrendingUp}
          color="#0f766e"
          bg="#ccfbf1"
          trend="+1.5%"
        />
        <StatCard
          title="THÂM NIÊN BÌNH QUÂN"
          value="2.8"
          unit="năm"
          subtext="Độ tuổi trung bình: 28.5 tuổi"
          icon={Users}
          color="#2563eb"
          bg="#dbeafe"
        />
        <StatCard
          title="TỔNG GIỜ LÀM THÊM (OT)"
          value="142"
          unit="giờ"
          subtext="Đạt chuẩn chính sách miễn thuế 2026"
          icon={Calendar}
          color="#7c3aed"
          bg="#ede9fe"
        />
      </div>

      <div className="grid c2">
        <div className="card">
          <div className="card-h">
            <h3>Cơ cấu theo trình độ học vấn</h3>
          </div>
          <div className="card-b">
            <div className="hb">
              <div className="hb-top">
                <span>Đại học chính quy</span>
                <b>75% (96 người)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '75%', background: '#0f766e' }}></i>
              </div>
            </div>
            <div className="hb">
              <div className="hb-top">
                <span>Thạc sĩ & Sau đại học</span>
                <b>15% (19 người)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '15%', background: '#2563eb' }}></i>
              </div>
            </div>
            <div className="hb">
              <div className="hb-top">
                <span>Cao đẳng & Chuyên môn kỹ thuật</span>
                <b>10% (13 người)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '10%', background: '#f59e0b' }}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Tỷ lệ giới tính nhân sự</h3>
          </div>
          <div className="card-b">
            <div className="hb">
              <div className="hb-top">
                <span>Nam giới</span>
                <b>62% (79 người)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '62%', background: '#0f766e' }}></i>
              </div>
            </div>
            <div className="hb">
              <div className="hb-top">
                <span>Nữ giới</span>
                <b>38% (49 người)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '38%', background: '#ec4899' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
