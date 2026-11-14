import React, { useState, useEffect } from 'react';
import {
  Clock, Calendar, CheckCircle2, AlertTriangle, Send,
  Plus, X, HelpCircle, Camera, RefreshCw, Upload, Sparkles,
  UserCheck, Award, ListFilter, LayoutGrid
} from 'lucide-react';
import AttendanceService from '../../../services/AttendanceService';
import '../../../styles/roles/employee/MyAttendanceView.css';

export default function MyAttendanceView() {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [viewMode, setViewMode] = useState('CALENDAR');

  const todayFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [explainDate, setExplainDate] = useState(todayFormatted);
  const [explainReason, setExplainReason] = useState('');
  const [explainSubmitted, setExplainSubmitted] = useState(false);

  const [realRecords, setRealRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('hrm_user')) || {};
    } catch {
      return {};
    }
  })();

  const [faceRequest, setFaceRequest] = useState(null);
  const [isFaceUploadOpen, setIsFaceUploadOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadingFaces, setUploadingFaces] = useState(false);
  const [faceUploadSuccess, setFaceUploadSuccess] = useState(false);

  const checkFaceRequest = async () => {
    try {
      const res = await AttendanceService.getPendingFaceRequest({
        employeeId: currentUser.EmployeeId || currentUser.id,
        username: currentUser.username || currentUser.Username,
        email: currentUser.email || currentUser.Email
      });
      if (res?.data) {
        setFaceRequest(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkFaceRequest();
  }, []);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedPhotos(files);
      const urls = files.map(f => URL.createObjectURL(f));
      setPreviewUrls(urls);
    }
  };

  const handleFaceUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedPhotos.length === 0) return;

    try {
      setUploadingFaces(true);
      const formData = new FormData();
      const code = currentUser.employeeCode || currentUser.EmployeeCode || currentUser.username || currentUser.Username || 'emp';
      formData.append('employeeCode', code);
      if (currentUser.EmployeeId || currentUser.id) {
        formData.append('employeeId', currentUser.EmployeeId || currentUser.id);
      }
      selectedPhotos.forEach(f => {
        formData.append('faceImages', f);
      });

      await AttendanceService.registerFace(formData);
      setFaceUploadSuccess(true);
      setFaceRequest(prev => prev ? { ...prev, hasRequest: false, faceEnrolled: true, facePhotosCount: selectedPhotos.length } : null);
      setTimeout(() => {
        setIsFaceUploadOpen(false);
        setFaceUploadSuccess(false);
        setSelectedPhotos([]);
        setPreviewUrls([]);
      }, 2000);
    } catch (err) {
      alert(err.message || 'Lỗi khi gửi ảnh Face ID!');
    } finally {
      setUploadingFaces(false);
    }
  };

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const [y, m] = selectedMonth.split('-').map(Number);
      const res = await AttendanceService.getMyAttendance({
        employeeId: currentUser.employeeId || currentUser.EmployeeId || null,
        userId: currentUser.userId || currentUser.id || null,
        employeeCode: currentUser.employeeCode || currentUser.EmployeeCode || currentUser.username,
        username: currentUser.username || currentUser.Username,
        year: y,
        month: m
      });
      const list = (res?.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
      setRealRecords(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, [selectedMonth]);

  const [y, m] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDow = new Date(y, m - 1, 1).getDay();
  const offsetDays = (firstDow + 6) % 7;

  const realMap = {};
  realRecords.forEach(r => {
    realMap[r.DayNum] = r;
  });

  const todayDate = new Date();
  const isCurrentViewingMonth = todayDate.getFullYear() === y && (todayDate.getMonth() + 1) === m;
  const isFutureMonth = (y > todayDate.getFullYear()) || (y === todayDate.getFullYear() && m > (todayDate.getMonth() + 1));
  const currentDayNum = todayDate.getDate();

  const daysData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateObj = new Date(y, m - 1, day);
    const dow = dateObj.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isToday = isCurrentViewingMonth && day === currentDayNum;

    const r = realMap[day];

    let status = 'FUTURE';
    let label = 'Chưa tới';
    let checkIn = '-';
    let checkOut = '-';
    let badgeType = 'muted';

    let workCredit = 0;

    if (r) {
      checkIn = r.TimeInStr ? r.TimeInStr.slice(0, 5) : '---';
      checkOut = r.TimeOutStr ? r.TimeOutStr.slice(0, 5) : (isToday ? 'Đang làm việc' : '---');
      workCredit = r.WorkCredit !== null && r.WorkCredit !== undefined ? Number(r.WorkCredit) : 0;
      const lateM = r.LateMinutes || 0;
      const earlyM = r.EarlyMinutes || 0;
      const isLateOrEarly = lateM > 0 || earlyM > 0 || r.AttendanceCode === 'M' || r.AttendanceCode === 'MUON';
      const isNoCredit = lateM > 10 || earlyM > 10 || (workCredit === 0);

      if (isLateOrEarly) {
        status = 'LATE';
        if (lateM > 0 && earlyM > 0) {
          label = `Muộn ${lateM}p, sớm ${earlyM}p${isNoCredit ? ' (0 công)' : ' (1 công)'}`;
        } else if (lateM > 0) {
          label = `Muộn ${lateM}p${isNoCredit ? ' (0 công)' : ' (1 công)'}`;
        } else if (earlyM > 0) {
          label = `Về sớm ${earlyM}p${isNoCredit ? ' (0 công)' : ' (1 công)'}`;
        } else {
          label = `Đi muộn (M)${isNoCredit ? ' (0 công)' : ' (1 công)'}`;
        }
        badgeType = isNoCredit ? 'danger' : 'warning';
      } else {
        status = 'ON_TIME';
        label = 'Đúng giờ';
        badgeType = 'success';
      }
    } else if (isWeekend) {
      status = 'WEEKEND';
      label = 'Nghỉ tuần';
      badgeType = 'muted';
    } else if (isFutureMonth || (isCurrentViewingMonth && day > currentDayNum)) {
      status = 'FUTURE';
      label = 'Chưa tới';
      badgeType = 'muted';
    } else if (isToday) {
      status = 'TODAY_NO_CHECKIN';
      label = 'Chưa điểm danh';
      badgeType = 'muted';
    } else {
      status = 'ABSENT';
      label = 'Chưa chấm công';
      badgeType = 'muted';
    }

    return {
      day,
      dowName: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dow],
      dateStr: `${selectedMonth}-${String(day).padStart(2, '0')}`,
      isWeekend,
      isToday,
      status,
      label,
      checkIn,
      checkOut,
      badgeType,
      workCredit
    };
  });

  const totalWorkCredit = realRecords.reduce((acc, r) => acc + (parseFloat(r.WorkCredit) || 0), 0);
  const workDaysCount = totalWorkCredit;
  const lateDaysCount = daysData.filter(d => d.status === 'LATE').length;
  const onTimeDaysCount = daysData.filter(d => d.status === 'ON_TIME').length;
  const totalOtHours = realRecords.reduce((acc, r) => acc + (parseFloat(r.OvertimeHours) || 0), 0);

  const handleOpenExplain = (dateStr) => {
    setExplainDate(dateStr);
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
      <div className="ph" style={{ marginBottom: 0 }}>
        <div>
          <h1>Lịch sử công & Điểm danh cá nhân</h1>
          <p>Xem toàn bộ nhật ký check-in khuôn mặt OpenCV, số ngày công thực tế và giải trình quên chấm công</p>
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
          <button
            className="btn"
            style={{ background: '#0284c7', color: '#ffffff', borderColor: '#0284c7' }}
            onClick={() => window.open('/kiosk', '_blank')}
          >
            <Camera size={15} />
            <span>Mở Kiosk Chấm Công</span>
          </button>
          <button className="btn pri" onClick={() => setIsExplainOpen(true)}>
            <Plus size={15} />
            <span>Tạo giải trình công</span>
          </button>
        </div>
      </div>

      {faceRequest && faceRequest.hasRequest && !faceRequest.faceEnrolled && (
        <div className="face-req-alert">
          <div className="face-req-left">
            <div className="face-req-icon">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="face-req-title">
                Yêu cầu hồ sơ nhân sự mới: Nộp ảnh khuôn mặt kích hoạt điểm danh Face ID
              </div>
              <div className="face-req-desc">
                Bộ phận Nhân sự (HR) đã gửi yêu cầu thu thập dữ liệu khuôn mặt. Vui lòng gửi từ 1 đến 5 ảnh chân dung (chính diện, góc nghiêng nhẹ) để hệ thống nhận diện đạt độ chính xác cao nhất tại Kiosk.
              </div>
            </div>
          </div>
          <button
            className="btn pri"
            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '13.5px' }}
            onClick={() => setIsFaceUploadOpen(true)}
          >
            <Upload size={16} />
            <span>Nộp ảnh Face ID ngay</span>
          </button>
        </div>
      )}

      <div className="attendance-stats-grid">
        <div className="att-stat-card">
          <div className="att-stat-header">
            <span className="att-stat-title">TỔNG CÔNG TÍCH LŨY</span>
            <div className="att-stat-icon" style={{ background: '#ccfbf1', color: '#0f766e' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div className="att-stat-value">{workDaysCount} / 22</div>
          <div className="att-stat-sub">
            <strong style={{ color: '#0d9488' }}>{((workDaysCount / 22) * 100).toFixed(1)}%</strong> công chuẩn tháng
          </div>
        </div>

        <div className="att-stat-card">
          <div className="att-stat-header">
            <span className="att-stat-title">ĐI LÀM ĐÚNG GIỜ</span>
            <div className="att-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="att-stat-value" style={{ color: '#16a34a' }}>{onTimeDaysCount} <small style={{ fontSize: '15px' }}>ngày</small></div>
          <div className="att-stat-sub">Nhận diện Face ID Kiosk</div>
        </div>

        <div className="att-stat-card">
          <div className="att-stat-header">
            <span className="att-stat-title">ĐI MUỘN / VỀ SỚM</span>
            <div className="att-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="att-stat-value" style={{ color: lateDaysCount > 0 ? '#d97706' : '#10b981' }}>
            {lateDaysCount} <small style={{ fontSize: '15px' }}>lần</small>
          </div>
          <div className="att-stat-sub">{lateDaysCount > 0 ? 'Cần bổ sung giải trình' : 'Không có vi phạm'}</div>
        </div>

        <div className="att-stat-card">
          <div className="att-stat-header">
            <span className="att-stat-title">TĂNG CA (OT)</span>
            <div className="att-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <Award size={18} />
            </div>
          </div>
          <div className="att-stat-value" style={{ color: '#2563eb' }}>{totalOtHours.toFixed(1)} <small style={{ fontSize: '15px' }}>giờ</small></div>
          <div className="att-stat-sub">{totalOtHours > 0 ? 'Đã được Quản lý duyệt' : 'Chưa có giờ tăng ca'}</div>
        </div>
      </div>

      <div className="att-calendar-card">
        <div className="att-calendar-header">
          <div>
            <h3>Bảng chấm công chi tiết theo ngày · Tháng {selectedMonth}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div className="att-legend">
              <div className="att-legend-item">
                <span className="att-legend-dot" style={{ background: '#22c55e' }} />
                <span>Đúng giờ (X)</span>
              </div>
              <div className="att-legend-item">
                <span className="att-legend-dot" style={{ background: '#f59e0b' }} />
                <span>Đi muộn (M)</span>
              </div>
              <div className="att-legend-item">
                <span className="att-legend-dot" style={{ background: '#94a3b8' }} />
                <span>Nghỉ tuần / Chưa tới</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button
                className="btn sm"
                style={{
                  background: viewMode === 'CALENDAR' ? '#ffffff' : 'transparent',
                  border: 'none',
                  boxShadow: viewMode === 'CALENDAR' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: 600,
                  fontSize: '12px'
                }}
                onClick={() => setViewMode('CALENDAR')}
              >
                <LayoutGrid size={14} />
                <span>Lịch tháng</span>
              </button>
              <button
                className="btn sm"
                style={{
                  background: viewMode === 'TABLE' ? '#ffffff' : 'transparent',
                  border: 'none',
                  boxShadow: viewMode === 'TABLE' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: 600,
                  fontSize: '12px'
                }}
                onClick={() => setViewMode('TABLE')}
              >
                <ListFilter size={14} />
                <span>Bảng danh sách</span>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'CALENDAR' ? (
          <div>
            <div className="calendar-dow-row">
              <div className="calendar-dow-col">Thứ 2</div>
              <div className="calendar-dow-col">Thứ 3</div>
              <div className="calendar-dow-col">Thứ 4</div>
              <div className="calendar-dow-col">Thứ 5</div>
              <div className="calendar-dow-col">Thứ 6</div>
              <div className="calendar-dow-col weekend">Thứ 7</div>
              <div className="calendar-dow-col weekend">Chủ Nhật</div>
            </div>

            <div className="calendar-grid-cells">
              {Array.from({ length: offsetDays }).map((_, idx) => (
                <div key={`empty-${idx}`} style={{ minHeight: '98px', background: '#f8fafc', borderRadius: '10px', opacity: 0.4 }} />
              ))}

              {daysData.map((d) => (
                <div
                  key={d.day}
                  className={`cal-cell ${d.isWeekend ? 'weekend' : ''} ${d.isToday ? 'today' : ''}`}
                  onClick={() => (d.status === 'LATE' || d.status === 'ABSENT') && handleOpenExplain(d.dateStr)}
                  title={d.status === 'LATE' || d.status === 'ABSENT' ? 'Bấm để tạo giải trình' : undefined}
                >
                  <div className="cal-cell-top">
                    <span className="cal-day-num">{d.day}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{d.dowName}</span>
                  </div>

                  <div className="cal-times">
                    {d.checkIn !== '-' ? (
                      <>
                        <div className="cal-time-row">
                          <span>Vào:</span>
                          <span className="cal-time-val">{d.checkIn}</span>
                        </div>
                        <div className="cal-time-row">
                          <span>Ra:</span>
                          <span className="cal-time-val">{d.checkOut}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '12px 0', color: d.isToday ? '#0d9488' : '#94a3b8', fontStyle: 'italic', fontWeight: d.isToday ? 600 : 'normal' }}>
                        {d.label}
                      </div>
                    )}
                  </div>

                  {d.checkIn !== '-' && (
                    <span className={`cal-badge ${d.badgeType}`}>
                      {d.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="att-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Thứ</th>
                  <th>Ca chuẩn</th>
                  <th>Giờ vào (TimeIn)</th>
                  <th>Giờ ra (TimeOut)</th>
                  <th>Trạng thái</th>
                  <th>Công</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {daysData.map((d) => (
                  <tr key={d.day} style={{ background: d.isToday ? '#f0fdfa' : undefined }}>
                    <td style={{ fontWeight: 700 }}>{d.dateStr}</td>
                    <td>{d.dowName}</td>
                    <td>08:00 - 17:30</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f766e' }}>
                      {d.checkIn}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: d.checkOut !== '-' ? '#2563eb' : '#94a3b8' }}>
                      {d.checkOut}
                    </td>
                    <td>
                      <span className={`cal-badge ${d.badgeType}`}>
                        {d.label}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {d.workCredit.toFixed(1)}
                    </td>
                    <td>
                      {(d.status === 'LATE' || d.status === 'ABSENT') && (
                        <button
                          className="btn sm"
                          style={{ padding: '4px 10px', fontSize: '11.5px', color: d.status === 'LATE' ? '#d97706' : '#0284c7', borderColor: d.status === 'LATE' ? '#fde68a' : '#bae6fd' }}
                          onClick={() => handleOpenExplain(d.dateStr)}
                        >
                          Giải trình
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFaceUploadOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setIsFaceUploadOpen(false); }}>
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="#0d9488" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Nộp dữ liệu Face ID kích hoạt chấm công</h3>
              </div>
              <button className="icon-btn" onClick={() => setIsFaceUploadOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleFaceUploadSubmit}>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', color: '#0f766e', marginBottom: '16px', lineHeight: 1.5 }}>
                  Vui lòng tải lên từ <strong>1 đến 5 ảnh chân dung</strong> rõ nét, đủ ánh sáng (chính diện, nghiêng trái, nghiêng phải) để máy quét Kiosk AI nhận diện chuẩn xác nhất.
                </div>

                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }} onClick={() => document.getElementById('employee-face-file-input').click()}>
                  <Upload size={32} color="#0d9488" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>Nhấp để chọn ảnh từ máy tính</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Hỗ trợ định dạng .jpg, .jpeg, .png (Chọn nhiều ảnh cùng lúc)</div>
                  <input
                    id="employee-face-file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoSelect}
                  />
                </div>

                {previewUrls.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Đã chọn {previewUrls.length} ảnh chân dung:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {previewUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Face Preview"
                          style={{ width: '100%', height: '84px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #0d9488' }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {faceUploadSuccess && (
                  <div style={{ marginTop: '16px', background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                    <CheckCircle2 size={18} />
                    <span>Đã gửi và kích hoạt Face ID thành công vào Kiosk!</span>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsFaceUploadOpen(false)}>Đóng</button>
                <button type="submit" className="btn pri" disabled={selectedPhotos.length === 0 || uploadingFaces}>
                  {uploadingFaces ? 'Đang tải lên AI...' : `Kích hoạt Face ID (${selectedPhotos.length} ảnh)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExplainOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setIsExplainOpen(false); }}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Tạo giải trình công</h3>
              <button className="icon-btn" onClick={() => setIsExplainOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleExplainSubmit}>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Ngày cần giải trình:
                  </label>
                  <input
                    type="date"
                    className="kiosk-input"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    value={explainDate}
                    onChange={(e) => setExplainDate(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Lý do giải trình:
                  </label>
                  <textarea
                    rows={4}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    placeholder="Ví dụ: Gặp sự cố giao thông, quên chấm công lúc vào ca, đi gặp khách hàng..."
                    value={explainReason}
                    onChange={(e) => setExplainReason(e.target.value)}
                  />
                </div>
                {explainSubmitted && (
                  <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                    Đã gửi giải trình tới Quản lý và HR thành công!
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsExplainOpen(false)}>Hủy</button>
                <button type="submit" className="btn pri">Gửi giải trình</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
