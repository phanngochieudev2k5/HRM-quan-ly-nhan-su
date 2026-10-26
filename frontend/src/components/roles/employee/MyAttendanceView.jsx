import React, { useState } from 'react';
import {
  Clock, Calendar, CheckCircle2, AlertTriangle, Send,
  Plus, X, HelpCircle
} from 'lucide-react';
import '../../../styles/roles/employee/MyAttendanceView.css';

export default function MyAttendanceView() {
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [explainDate, setExplainDate] = useState('2026-04-16');
  const [explainReason, setExplainReason] = useState('');
  const [explainSubmitted, setExplainSubmitted] = useState(false);

  const daysData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const dow = (day + 2) % 7;
    const isWeekend = dow === 0;
    const isToday = day === 25;
    let status = 'ON_TIME';
    let label = 'Đúng giờ';
    let checkIn = '08:02';
    let checkOut = '17:35';
    let badgeClass = 'b-green';

    if (isWeekend) {
      status = 'WEEKEND';
      label = 'Nghỉ tuần';
      checkIn = '-';
      checkOut = '-';
      badgeClass = '';
    } else if (day === 16) {
      status = 'LATE';
      label = 'Đi muộn 15p';
      checkIn = '08:45';
      checkOut = '17:30';
      badgeClass = 'b-amber';
    } else if (day === 21) {
      status = 'LEAVE';
      label = 'Nghỉ phép';
      checkIn = '-';
      checkOut = '-';
      badgeClass = 'b-blue';
    } else if (day > 25) {
      status = 'FUTURE';
      label = 'Chưa tới';
      checkIn = '-';
      checkOut = '-';
      badgeClass = '';
    }

    return {
      day,
      dowName: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dow],
      isWeekend,
      isToday,
      status,
      label,
      checkIn,
      checkOut,
      badgeClass,
      ot: (day === 10 || day === 18) ? 2 : 0
    };
  });

  const handleOpenExplain = (day) => {
    setExplainDate(`2026-04-${String(day).padStart(2, '0')}`);
    setIsExplainOpen(true);
  };

  const handleExplainSubmit = (e) => {
    e.preventDefault();
    if (!explainReason.trim()) return;
    setExplainSubmitted(true);
    setTimeout(() => {
      setIsExplainOpen(false);
      setExplainSubmitted(false);
      setExplainReason('');
    }, 1500);
  };

  return (
    <div className="my-attendance-container">
      <div className="ph">
        <div>
          <h1>Lịch sử công & Điểm danh cá nhân</h1>
          <p>Xem toàn bộ nhật ký check-in khuôn mặt, số ngày công thực tế và giải trình quên chấm công</p>
        </div>
        <div className="ph-tools">
          <label className="mp">
            <span>Kỳ:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </label>
          <button className="btn pri" onClick={() => setIsExplainOpen(true)}>
            <Plus size={15} />
            <span>Tạo giải trình công</span>
          </button>
        </div>
      </div>

      <div className="grid c4">
        <div className="kc" style={{ '--c': '#0f766e', '--cb': '#ccfbf1' }}>
          <div className="kc-h">
            <span className="kc-ic"><Clock size={18} /></span>
            <span className="kc-l">Công thực tế</span>
            <span className="pill pu">Đạt chuẩn</span>
          </div>
          <div className="kc-v">21.5 / 26 <small>công</small></div>
          <div className="kc-s">Tính tới thời điểm hiện tại</div>
        </div>

        <div className="kc" style={{ '--c': '#2563eb', '--cb': '#dbeafe' }}>
          <div className="kc-h">
            <span className="kc-ic"><Calendar size={18} /></span>
            <span className="kc-l">Nghỉ phép có lương</span>
            <span className="pill pu">1 ngày</span>
          </div>
          <div className="kc-v">1.0 <small>ngày</small></div>
          <div className="kc-s">Còn 11/12 ngày phép năm</div>
        </div>

        <div className="kc" style={{ '--c': '#d97706', '--cb': '#fef3c7' }}>
          <div className="kc-h">
            <span className="kc-ic"><AlertTriangle size={18} /></span>
            <span className="kc-l">Đi muộn / Về sớm</span>
            <span className="pill pd">1 lần</span>
          </div>
          <div className="kc-v">1 <small>lần (15p)</small></div>
          <div className="kc-s">Ngày 16/04/2026</div>
        </div>

        <div className="kc" style={{ '--c': '#7c3aed', '--cb': '#ede9fe' }}>
          <div className="kc-h">
            <span className="kc-ic"><CheckCircle2 size={18} /></span>
            <span className="kc-l">Làm thêm giờ (OT)</span>
            <span className="pill pu">Đã duyệt</span>
          </div>
          <div className="kc-v">8.0 <small>giờ</small></div>
          <div className="kc-s">Được miễn thuế TNCN</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Bảng lịch chấm công tháng {selectedMonth}</h3>
          <span className="sub">Bấm vào ngày có sự cố để tạo đơn giải trình</span>
        </div>
        <div className="card-b">
          <div className="calendar-month-grid">
            {['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((dow, idx) => (
              <div key={dow} className={`calendar-dow-header ${idx === 0 ? 'weekend' : ''}`}>
                {dow}
              </div>
            ))}
            {daysData.map((d) => (
              <div
                key={d.day}
                className={`calendar-day-tile ${d.isToday ? 'today' : ''} ${d.isWeekend ? 'weekend' : ''}`}
                onClick={() => handleOpenExplain(d.day)}
              >
                <div className="calendar-tile-top">
                  <span className="calendar-tile-number">{d.day}</span>
                  {d.badgeClass && (
                    <span className={`badge ${d.badgeClass}`} style={{ fontSize: '10px', padding: '1px 5px' }}>
                      {d.label}
                    </span>
                  )}
                </div>
                <div className="calendar-tile-body">
                  {!d.isWeekend && d.status !== 'FUTURE' && (
                    <>
                      <div>Vào: <strong>{d.checkIn}</strong></div>
                      <div>Ra: <strong>{d.checkOut}</strong></div>
                      {d.ot > 0 && <div style={{ color: '#7c3aed', fontWeight: 600 }}>+OT: {d.ot}h</div>}
                    </>
                  )}
                  {d.isWeekend && <span style={{ color: '#94a3b8' }}>Nghỉ tuần</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isExplainOpen && (
        <div className="modal-wrap" onClick={() => setIsExplainOpen(false)}>
          <div className="modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <h3>Tạo đơn giải trình công ngày {explainDate}</h3>
              <button className="ibtn" onClick={() => setIsExplainOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleExplainSubmit}>
              <div className="modal-b">
                {explainSubmitted ? (
                  <div className="banner" style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#15803d' }}>
                    <CheckCircle2 size={18} />
                    <span>Đơn giải trình đã gửi tới Quản lý trực tiếp và HR phê duyệt!</span>
                  </div>
                ) : (
                  <div className="form">
                    <label className="field full">
                      <span>Ngày cần giải trình:</span>
                      <input
                        type="date"
                        className="inp"
                        value={explainDate}
                        onChange={(e) => setExplainDate(e.target.value)}
                      />
                    </label>
                    <label className="field full">
                      <span>Loại sự cố:</span>
                      <select className="inp">
                        <option>Quên chấm công đầu vào (Check-in)</option>
                        <option>Quên chấm công đầu ra (Check-out)</option>
                        <option>Đi muộn do lý do bất khả kháng (Tắc đường/Hỏng xe)</option>
                        <option>Gặp sự cố camera Kiosk không quét được Face ID</option>
                      </select>
                    </label>
                    <label className="field full">
                      <span>Lý do giải trình chi tiết:</span>
                      <textarea
                        className="inp"
                        rows="3"
                        required
                        placeholder="Mô tả nguyên nhân cụ thể để Trưởng phòng xét duyệt..."
                        value={explainReason}
                        onChange={(e) => setExplainReason(e.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="modal-f">
                <button type="button" className="btn" onClick={() => setIsExplainOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn pri" disabled={explainSubmitted}>
                  <Send size={14} />
                  <span>Gửi giải trình</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
