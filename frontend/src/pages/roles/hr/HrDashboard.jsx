import React from 'react';
import {
  Users, UserCheck, Clock, AlertCircle, Calendar,
  TrendingUp, Award, Camera, Building2, FileText, Cake, ArrowRight
} from 'lucide-react';
import '../../../styles/roles/hr/HrDashboard.css';

export default function HrDashboard({ onNavigate, currentUser }) {
  const birthdays = [
    { name: 'Trần Thị Bích', dept: 'Khối Kỹ Thuật (IT)', date: '20/04' },
    { name: 'Vũ Thị Hoa', dept: 'Phòng Nhân Sự', date: '25/04' },
    { name: 'Hoàng Quốc Bảo', dept: 'Khối Kinh Doanh', date: '28/04' }
  ];

  const recentEvents = [
    { name: 'Nguyễn Văn A', code: 'NV001', type: 'Check-in OpenCV', time: '08:02:15', status: 'Hợp lệ 99.4%' },
    { name: 'Trần Thị Bích', code: 'NV002', type: 'Check-in OpenCV', time: '08:14:40', status: 'Hợp lệ 98.7%' },
    { name: 'Lê Hoàng Long', code: 'NV003', type: 'Check-in OpenCV', time: '08:29:10', status: 'Hợp lệ 99.5%' }
  ];

  return (
    <div className="hr-dashboard-container">
      <div className="hr-hero-banner">
        <div className="hr-hero-title-group">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5eead4', fontWeight: 700 }}>
            HỆ THỐNG QUẢN TRỊ NHÂN SỰ DOANH NGHIỆP
          </div>
          <h1>Trung tâm điều hành nhân sự & Điểm danh OpenCV</h1>
          <p className="hr-hero-subtitle">
            Quản trị vòng đời 128 nhân sự · Tỷ lệ điểm danh đạt 96.2% · Chuẩn bị chốt bảng lương kỳ 2026-04
          </p>
        </div>

        <div className="ph-tools">
          <button
            className="btn pri"
            onClick={() => onNavigate('hr-attendance', 'face-checkin')}
          >
            <Camera size={15} />
            <span>Kiosk OpenCV</span>
          </button>
          <button
            className="btn"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
            onClick={() => onNavigate('hr-employees', 'org')}
          >
            <Building2 size={15} />
            <span>Sơ đồ tổ chức</span>
          </button>
        </div>
      </div>

      <div className="grid c4">
        <div className="kc" style={{ '--c': '#0f766e', '--cb': '#ccfbf1' }}>
          <div className="kc-h">
            <span className="kc-ic"><Users size={18} /></span>
            <span className="kc-l">Tổng nhân sự</span>
            <span className="pill pu">▲ +4 mới</span>
          </div>
          <div className="kc-v">128 <small>người</small></div>
          <div className="kc-s">124 chính thức · 4 thử việc</div>
          <svg className="spk" viewBox="0 0 240 42" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hr-spk1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0f766e" stopOpacity="0.25" />
                <stop offset="1" stopColor="#0f766e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,36 L60,30 L120,32 L180,22 L240,16 L240,42 L0,42 Z" fill="url(#hr-spk1)" />
            <path d="M0,36 L60,30 L120,32 L180,22 L240,16" fill="none" stroke="#0f766e" strokeWidth="2" />
          </svg>
        </div>

        <div className="kc" style={{ '--c': '#2563eb', '--cb': '#dbeafe' }}>
          <div className="kc-h">
            <span className="kc-ic"><Clock size={18} /></span>
            <span className="kc-l">Tỷ lệ đi làm hôm nay</span>
            <span className="pill pu">96.2%</span>
          </div>
          <div className="kc-v">122 / 128 <small>người</small></div>
          <div className="kc-s">6 vắng (4 phép năm, 2 công tác)</div>
          <svg className="spk" viewBox="0 0 240 42" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hr-spk2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2563eb" stopOpacity="0.25" />
                <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,30 L60,26 L120,28 L180,18 L240,14 L240,42 L0,42 Z" fill="url(#hr-spk2)" />
            <path d="M0,30 L60,26 L120,28 L180,18 L240,14" fill="none" stroke="#2563eb" strokeWidth="2" />
          </svg>
        </div>

        <div className="kc" style={{ '--c': '#d97706', '--cb': '#fef3c7' }}>
          <div className="kc-h">
            <span className="kc-ic"><AlertCircle size={18} /></span>
            <span className="kc-l">Đơn chờ phê duyệt</span>
            <span className="pill pd">3 đơn mới</span>
          </div>
          <div className="kc-v">3 <small>yêu cầu</small></div>
          <div className="kc-s">2 nghỉ phép · 1 giải trình công</div>
          <svg className="spk" viewBox="0 0 240 42" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hr-spk3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d97706" stopOpacity="0.25" />
                <stop offset="1" stopColor="#d97706" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,26 L60,34 L120,24 L180,28 L240,18 L240,42 L0,42 Z" fill="url(#hr-spk3)" />
            <path d="M0,26 L60,34 L120,24 L180,28 L240,18" fill="none" stroke="#d97706" strokeWidth="2" />
          </svg>
        </div>

        <div className="kc" style={{ '--c': '#7c3aed', '--cb': '#ede9fe' }}>
          <div className="kc-h">
            <span className="kc-ic"><FileText size={18} /></span>
            <span className="kc-l">Hợp đồng sắp hết hạn</span>
            <span className="pill pd">Trong 30 ngày</span>
          </div>
          <div className="kc-v">2 <small>hợp đồng</small></div>
          <div className="kc-s">Cần ký gia hạn hợp đồng mới</div>
          <svg className="spk" viewBox="0 0 240 42" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hr-spk4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#7c3aed" stopOpacity="0.25" />
                <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,28 L60,28 L120,24 L180,20 L240,20 L240,42 L0,42 Z" fill="url(#hr-spk4)" />
            <path d="M0,28 L60,28 L120,24 L180,20 L240,20" fill="none" stroke="#7c3aed" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="grid c21">
        <div className="card">
          <div className="card-h">
            <h3>Cơ cấu nhân sự theo khối phòng ban</h3>
            <span className="sub">Tổng: 128 người</span>
          </div>
          <div className="card-b">
            <div className="donut">
              <svg viewBox="0 0 170 170">
                <circle cx="85" cy="85" r="62" fill="none" stroke="#eef2f1" strokeWidth="24" />
                <circle cx="85" cy="85" r="62" fill="none" stroke="#0f766e" strokeWidth="24" strokeDasharray="180 210" transform="rotate(-90 85 85)" />
                <circle cx="85" cy="85" r="62" fill="none" stroke="#2563eb" strokeWidth="24" strokeDasharray="100 290" strokeDashoffset="-180" transform="rotate(-90 85 85)" />
                <circle cx="85" cy="85" r="62" fill="none" stroke="#f59e0b" strokeWidth="24" strokeDasharray="60 330" strokeDashoffset="-280" transform="rotate(-90 85 85)" />
                <circle cx="85" cy="85" r="62" fill="none" stroke="#ec4899" strokeWidth="24" strokeDasharray="50 340" strokeDashoffset="-340" transform="rotate(-90 85 85)" />
                <text x="85" y="82" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b">128</text>
                <text x="85" y="100" textAnchor="middle" fontSize="11" fill="#94a3b8">Nhân sự</text>
              </svg>
              <div className="dl">
                <div>
                  <i style={{ background: '#0f766e' }}></i>
                  <span>Khối Kỹ Thuật (IT)</span>
                  <b>54 người</b>
                  <em>42.2%</em>
                </div>
                <div>
                  <i style={{ background: '#2563eb' }}></i>
                  <span>Khối Sản Xuất</span>
                  <b>36 người</b>
                  <em>28.1%</em>
                </div>
                <div>
                  <i style={{ background: '#f59e0b' }}></i>
                  <span>Khối Kinh Doanh</span>
                  <b>22 người</b>
                  <em>17.2%</em>
                </div>
                <div>
                  <i style={{ background: '#ec4899' }}></i>
                  <span>Hành chính & Kế toán</span>
                  <b>16 người</b>
                  <em>12.5%</em>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Tỷ lệ điểm danh khuôn mặt OpenCV</h3>
          </div>
          <div className="card-b">
            <div className="ring">
              <svg viewBox="0 0 170 170">
                <circle cx="85" cy="85" r="62" fill="none" stroke="#e6f2f0" strokeWidth="16" />
                <circle
                  cx="85"
                  cy="85"
                  r="62"
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray="375 400"
                  transform="rotate(-90 85 85)"
                />
                <text x="85" y="92" textAnchor="middle" fontSize="30" fontWeight="800" fill="#0f766e">
                  96%
                </text>
              </svg>
              <b>122 / 128 nhân sự có mặt</b>
              <span className="muted small">Điểm danh qua Camera Kiosk AI</span>
              <div className="row mt" style={{ justifyContent: 'center' }}>
                <span className="badge b-p">Đúng giờ: 118</span>
                <span className="badge b-amber">Đi muộn: 4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid c2">
        <div className="card">
          <div className="card-h">
            <h3>Nhật ký điểm danh OpenCV gần nhất</h3>
            <button className="btn sm" onClick={() => onNavigate('hr-attendance', 'face-checkin')}>
              <span>Xem trực tiếp Kiosk</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-b">
            {recentEvents.map((ev, i) => (
              <div key={i} className="tli">
                <div className="avatar" style={{ background: '#ccfbf1', color: '#0f766e' }}>
                  {(ev.name || 'N').split(' ').slice(-1)[0]?.[0] || 'N'}
                </div>
                <div className="grow">
                  <b>{ev.name}</b>
                  <small>{ev.code} · {ev.type}</small>
                </div>
                <div className="v">
                  <span className="badge b-green">{ev.time}</span>
                  <small style={{ color: '#15803d', marginTop: '2px' }}>{ev.status}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Sinh nhật nhân sự trong tháng</h3>
            <span className="badge b-purple">3 nhân sự</span>
          </div>
          <div className="card-b">
            {birthdays.map((b, i) => (
              <div key={i} className="tli">
                <div className="avatar" style={{ background: '#fce7f3', color: '#db2777' }}>
                  <Cake size={16} />
                </div>
                <div className="grow">
                  <b>{b.name}</b>
                  <small>{b.dept}</small>
                </div>
                <span className="badge b-p">{b.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
