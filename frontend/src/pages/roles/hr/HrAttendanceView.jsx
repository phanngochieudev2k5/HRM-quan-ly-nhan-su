import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar, Camera, Clock, UserCheck, CheckCircle2,
  Scan, RefreshCw, Plus, Printer, Search, ArrowLeft,
  Video, VideoOff, ShieldCheck, Sparkles, AlertCircle
} from 'lucide-react';
import '../../../styles/roles/hr/HrAttendanceView.css';

const ATTENDANCE_CODES = {
  X: { label: 'Đi làm cả ngày', lv: 1, hl: 1, kl: 0, bg: '#dcfce7', c: '#15803d' },
  N: { label: 'Làm nửa ngày', lv: 0.5, hl: 0.5, kl: 0.5, bg: '#ccfbf1', c: '#0f766e' },
  CT: { label: 'Đi công tác', lv: 1, hl: 1, kl: 0, bg: '#e0f2fe', c: '#0369a1' },
  P: { label: 'Nghỉ phép năm', lv: 0, hl: 1, kl: 0, bg: '#dbeafe', c: '#1d4ed8' },
  L: { label: 'Nghỉ lễ, Tết', lv: 0, hl: 1, kl: 0, bg: '#ede9fe', c: '#6d28d9' },
  O: { label: 'Nghỉ ốm (BHXH)', lv: 0, hl: 0, kl: 1, bg: '#fef3c7', c: '#b45309' },
  KP: { label: 'Nghỉ không lương', lv: 0, hl: 0, kl: 1, bg: '#fee2e2', c: '#b91c1c' }
};

const EMPLOYEES = [
  { id: 'NV001', ma: 'NV001', ten: 'Nguyễn Văn A', phongBan: 'Ban Giám Đốc' },
  { id: 'NV002', ma: 'NV002', ten: 'Trần Thị Bích', phongBan: 'Khối Kỹ Thuật (IT)' },
  { id: 'NV003', ma: 'NV003', ten: 'Lê Hoàng Long', phongBan: 'Khối Kỹ Thuật (IT)' },
  { id: 'NV004', ma: 'NV004', ten: 'Phạm Minh Đức', phongBan: 'Phòng Kế Toán' },
  { id: 'NV005', ma: 'NV005', ten: 'Vũ Thị Hoa', phongBan: 'Phòng Nhân Sự' },
  { id: 'NV006', ma: 'NV006', ten: 'Đỗ Gia Huy', phongBan: 'Khối Sản Xuất' },
  { id: 'NV007', ma: 'NV007', ten: 'Hoàng Quốc Bảo', phongBan: 'Khối Kinh Doanh' }
];

export default function HrAttendanceView({ subModule = 'matrix', employee, onBack, onCompleteRegistration, onNavigate }) {
  const [activeTab, setActiveTab] = useState(
    subModule === 'face-checkin' ? 'kiosk' :
    subModule === 'register-face' ? 'register' :
    subModule === 'shifts' ? 'shifts' : 'matrix'
  );

  useEffect(() => {
    if (subModule === 'face-checkin') {
      setActiveTab('kiosk');
    } else if (subModule === 'register-face') {
      setActiveTab('register');
    } else if (subModule === 'shifts') {
      setActiveTab('shifts');
    } else {
      setActiveTab('matrix');
    }
  }, [subModule]);
  const [period, setPeriod] = useState('2026-04');
  const [selectedBrush, setSelectedBrush] = useState('X');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [isPainting, setIsPainting] = useState(false);

  const [attendanceData, setAttendanceData] = useState(() => {
    const init = {};
    EMPLOYEES.forEach((emp, i) => {
      init[emp.id] = { d: {}, ot: i === 1 ? 12 : i === 2 ? 8 : i === 5 ? 18 : 0 };
      for (let day = 1; day <= 28; day++) {
        const dow = (day + 2) % 7;
        if (dow === 0) continue;
        init[emp.id].d[day] = (day === 12 && i === 4) ? 'P' : (day === 18 && i === 6) ? 'CT' : 'X';
      }
    });
    return init;
  });

  const [useRealWebcam, setUseRealWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [liveLogs, setLiveLogs] = useState([
    { id: 1, name: 'Nguyễn Văn A', code: 'NV001', time: '08:02:15', status: 'Hợp lệ', score: 99.2, device: 'Cổng Kiosk A' },
    { id: 2, name: 'Trần Thị Bích', code: 'NV002', time: '08:14:40', status: 'Hợp lệ', score: 98.7, device: 'Cổng Kiosk A' },
    { id: 3, name: 'Lê Hoàng Long', code: 'NV003', time: '08:29:10', status: 'Hợp lệ', score: 99.5, device: 'Cổng Kiosk B' }
  ]);

  const [regAngle, setRegAngle] = useState(1);
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    let stream = null;
    if (useRealWebcam) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setWebcamError('Không thể mở Camera thực tế hoặc quyền bị chặn');
          setUseRealWebcam(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [useRealWebcam]);

  const daysInMonth = 30;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayOfWeekName = (day) => {
    const dow = (day + 2) % 7;
    const names = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return names[dow];
  };

  const isWeekendDay = (day) => {
    return (day + 2) % 7 === 0;
  };

  const summarizeEmp = (empId) => {
    const a = attendanceData[empId] || { d: {}, ot: 0 };
    let lv = 0;
    let hl = 0;
    let kl = 0;
    let pL = 0;
    for (const d in a.d) {
      const code = a.d[d];
      const c = ATTENDANCE_CODES[code];
      if (c) {
        lv += c.lv;
        hl += c.hl;
        kl += c.kl;
        if (code === 'P' || code === 'L') pL += 1;
      }
    }
    return { lv, hl, kl, pL, ot: a.ot || 0 };
  };

  const handleCellClick = (empId, day) => {
    setAttendanceData(prev => {
      const currentEmp = prev[empId] || { d: {}, ot: 0 };
      const currentDays = { ...currentEmp.d };
      if (!selectedBrush) {
        delete currentDays[day];
      } else {
        currentDays[day] = selectedBrush;
      }
      return {
        ...prev,
        [empId]: {
          ...currentEmp,
          d: currentDays
        }
      };
    });
  };

  const handleCellHover = (empId, day) => {
    if (!isPainting) return;
    handleCellClick(empId, day);
  };

  const handleFillEmpty = () => {
    setAttendanceData(prev => {
      const updated = { ...prev };
      EMPLOYEES.forEach(emp => {
        const empAtt = updated[emp.id] || { d: {}, ot: 0 };
        const newD = { ...empAtt.d };
        for (let d = 1; d <= daysInMonth; d++) {
          if (isWeekendDay(d)) continue;
          if (!newD[d]) newD[d] = 'X';
        }
        updated[emp.id] = { ...empAtt, d: newD };
      });
      return updated;
    });
  };

  const handleClearMonth = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dữ liệu chấm công tháng này?')) {
      setAttendanceData(prev => {
        const updated = {};
        EMPLOYEES.forEach(emp => {
          updated[emp.id] = { d: {}, ot: 0 };
        });
        return updated;
      });
    }
  };

  const handleOtChange = (empId, value) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setAttendanceData(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || { d: {} }),
        ot: num
      }
    }));
  };

  const handleSimulateCheckin = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const newLog = {
        id: Date.now(),
        name: 'Đỗ Gia Huy',
        code: 'NV006',
        time: new Date().toLocaleTimeString('vi-VN'),
        status: 'Hợp lệ',
        score: 99.8,
        device: 'Camera Kiosk Chính'
      };
      setLiveLogs(prev => [newLog, ...prev]);
    }, 1200);
  };

  const filteredEmployees = EMPLOYEES.filter(e => {
    const matchDept = !deptFilter || e.phongBan === deptFilter;
    const matchSearch = !searchTerm ||
      e.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.ma.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <div className="attendance-view-container" onMouseUp={() => setIsPainting(false)}>
      <div className="ph">
        <div>
          <h1>Quản lý chấm công & Điểm danh OpenCV</h1>
          <p>Bảng chấm công ma trận đa ký hiệu, đồng bộ nhận diện khuôn mặt Kiosk và phân ca</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={() => window.print()}>
            <Printer size={15} />
            <span>In biểu chấm công</span>
          </button>
        </div>
      </div>

      <div className="attendance-tabs-header">
        <button
          className={`attendance-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('matrix');
            if (onNavigate) onNavigate('hr-attendance', 'history');
          }}
        >
          <Calendar size={16} />
          <span>Bảng chấm công ma trận tháng</span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'kiosk' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('kiosk');
            if (onNavigate) onNavigate('hr-attendance', 'face-checkin');
          }}
        >
          <Camera size={16} />
          <span>Camera Kiosk OpenCV Face Check-in</span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('register');
            if (onNavigate) onNavigate('hr-attendance', 'register-face');
          }}
        >
          <UserCheck size={16} />
          <span>Đăng ký Face ID AI</span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'shifts' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('shifts');
            if (onNavigate) onNavigate('hr-attendance', 'shifts');
          }}
        >
          <Clock size={16} />
          <span>Ca làm việc & Lịch trực</span>
        </button>
      </div>

      {activeTab === 'matrix' && (
        <>
          <div className="attendance-brush-toolbar">
            {Object.entries(ATTENDANCE_CODES).map(([k, c]) => (
              <button
                key={k}
                className={`brush-code-btn ${selectedBrush === k ? 'active' : ''}`}
                style={{ background: c.bg, color: c.c }}
                onClick={() => setSelectedBrush(k)}
              >
                <span>{k}</span>
                <small>{c.label}</small>
              </button>
            ))}
            <button
              className={`brush-code-btn ${selectedBrush === '' ? 'active' : ''}`}
              style={{ background: '#f1f5f9', color: '#475569' }}
              onClick={() => setSelectedBrush('')}
            >
              <span>Tẩy</span>
              <small>Xóa ô</small>
            </button>

            <span className="grow"></span>

            <div className="search">
              <Search size={15} />
              <input
                className="inp"
                placeholder="Tìm nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '180px' }}
              />
            </div>

            <label className="mp">
              <span>Kỳ:</span>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </label>

            <button className="btn" onClick={handleFillEmpty}>
              <CheckCircle2 size={15} />
              <span>Điền "X" ngày trống</span>
            </button>

            <button className="btn danger" onClick={handleClearMonth}>
              <span>Xóa tháng</span>
            </button>
          </div>

          <div className="attendance-matrix-wrapper">
            <table className="attendance-matrix-table">
              <thead>
                <tr>
                  <th className="emp-name-col">
                    <div>NHÂN VIÊN</div>
                    <small style={{ color: '#94a3b8' }}>{period}</small>
                  </th>
                  {daysArray.map((day) => {
                    const isWe = isWeekendDay(day);
                    const isTd = day === 25;
                    return (
                      <th
                        key={day}
                        className={`${isTd ? 'today' : isWe ? 'weekend' : ''}`}
                      >
                        <div>{day}</div>
                        <div>{getDayOfWeekName(day)}</div>
                      </th>
                    );
                  })}
                  <th>Công<br />làm</th>
                  <th>Phép<br />+Lễ</th>
                  <th>Nghỉ<br />KL</th>
                  <th>Công<br />hưởng</th>
                  <th>Giờ<br />OT</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const empAtt = attendanceData[emp.id] || { d: {}, ot: 0 };
                  const sum = summarizeEmp(emp.id);
                  return (
                    <tr key={emp.id}>
                      <td className="emp-name-col">
                        <b>{emp.ten}</b>
                        <br />
                        <small style={{ color: '#64748b' }}>{emp.ma} · {emp.phongBan}</small>
                      </td>
                      {daysArray.map((day) => {
                        const code = empAtt.d[day] || '';
                        const c = ATTENDANCE_CODES[code];
                        const isWe = isWeekendDay(day);
                        return (
                          <td
                            key={day}
                            className={`day-cell ${isWe ? 'weekend' : ''}`}
                            style={{
                              background: c ? c.bg : undefined,
                              color: c ? c.c : undefined
                            }}
                            onMouseDown={() => {
                              setIsPainting(true);
                              handleCellClick(emp.id, day);
                            }}
                            onMouseEnter={() => handleCellHover(emp.id, day)}
                          >
                            {code}
                          </td>
                        );
                      })}
                      <td className="summary-col">{sum.lv}</td>
                      <td className="summary-col">{sum.pL}</td>
                      <td className="summary-col">{sum.kl}</td>
                      <td className="summary-col highlight">{sum.hl}</td>
                      <td className="ot-col">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={empAtt.ot || ''}
                          onChange={(e) => handleOtChange(emp.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="small muted mt">
            Quy định: Công chuẩn <strong>26 ngày/tháng</strong> · Nghỉ tuần: <strong>Chủ nhật</strong> · Công hưởng = Đi làm + Công tác + Nghỉ phép + Nghỉ lễ có lương. Bấm giữ chuột và kéo để chấm nhanh nhiều ngày.
          </div>
        </>
      )}

      {activeTab === 'kiosk' && (
        <div className="kiosk-grid-container">
          <div className="card">
            <div className="card-h">
              <h3>Camera Nhận diện Khuôn mặt Kiosk</h3>
              <div className="ph-tools">
                <button
                  className={`btn sm ${useRealWebcam ? 'danger' : 'teal'}`}
                  onClick={() => setUseRealWebcam(!useRealWebcam)}
                >
                  {useRealWebcam ? <VideoOff size={14} /> : <Video size={14} />}
                  <span>{useRealWebcam ? 'Tắt Webcam' : 'Bật Webcam thật'}</span>
                </button>
                <button
                  className="btn sm pri"
                  disabled={scanning}
                  onClick={handleSimulateCheckin}
                >
                  <Scan size={14} />
                  <span>{scanning ? 'Đang nhận diện...' : 'Quét thử Face ID'}</span>
                </button>
              </div>
            </div>
            <div className="card-b">
              <div className="camera-preview-box">
                {useRealWebcam ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-preview-video"
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <Scan size={52} style={{ color: '#4ade80', margin: '0 auto 12px' }} />
                    <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>
                      Kiosk AI OpenCV Sẵn sàng
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      Bật webcam thật hoặc nhấn "Quét thử Face ID" để kiểm tra luồng nhận diện
                    </div>
                  </div>
                )}

                <div className="face-scanning-overlay">
                  <div className="face-bounding-box">
                    <div className="face-bounding-box-badge">
                      OpenCV Liveness: 99.4%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="kiosk-log-card">
            <div className="card-h" style={{ padding: '0 0 10px', borderBottom: '1px solid #eef2f1' }}>
              <h3>Nhật ký điểm danh thời gian thực</h3>
              <span className="badge b-green">Trực tiếp</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {liveLogs.map((log) => (
                <div key={log.id} className="tli">
                  <div className="avatar" style={{ background: '#ccfbf1', color: '#0f766e' }}>
                    {(log.name || 'N').split(' ').slice(-1)[0]?.[0] || 'N'}
                  </div>
                  <div className="grow">
                    <b>{log.name}</b>
                    <small>{log.code} · {log.device}</small>
                  </div>
                  <div className="v">
                    <span className="badge b-green">{log.time}</span>
                    <small style={{ color: '#15803d', marginTop: '2px' }}>Độ khớp {log.score}%</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'register' && (
        <div className="card">
          <div className="card-h">
            <h3>Đăng ký hồ sơ sinh trắc học Face ID</h3>
            <span className="badge b-p">Mô hình ResNet50 OpenCV</span>
          </div>
          <div className="card-b">
            {regSuccess ? (
              <div className="banner" style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#15803d' }}>
                <CheckCircle2 size={20} />
                <div className="grow">
                  <b>Đăng ký Face ID thành công!</b> Vector đặc trưng 512 chiều đã được lưu trữ an toàn trong cơ sở dữ liệu.
                </div>
                <button className="btn sm pri" onClick={() => setRegSuccess(false)}>
                  Đăng ký nhân sự khác
                </button>
              </div>
            ) : (
              <div className="grid c2">
                <div className="camera-preview-box" style={{ height: '320px' }}>
                  <div style={{ textAlign: 'center', color: '#ffffff' }}>
                    <Camera size={44} style={{ color: '#38bdf8', margin: '0 auto 10px' }} />
                    <div style={{ fontWeight: 700 }}>Góc chụp {regAngle}/3: {regAngle === 1 ? 'Chính diện' : regAngle === 2 ? 'Nghiêng trái 20°' : 'Nghiêng phải 20°'}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Giữ khuôn mặt ổn định trong khung hình</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="field">
                    <span>Chọn nhân viên đăng ký Face ID:</span>
                    <select className="inp">
                      {EMPLOYEES.map(e => (
                        <option key={e.id} value={e.id}>{e.ma} - {e.ten} ({e.phongBan})</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <span>Đánh giá chất lượng hình ảnh AI:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span>Độ sáng & cân bằng quang học:</span>
                        <strong>96% (Tốt)</strong>
                      </div>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span>Độ sắc nét điểm mắt/mũi/miệng:</span>
                        <strong>98% (Chuẩn)</strong>
                      </div>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span>Chống giả mạo (Anti-spoofing):</span>
                        <strong>99.5% (Người thật)</strong>
                      </div>
                    </div>
                  </div>
                  <div className="row mt">
                    <button
                      className="btn pri"
                      onClick={() => {
                        if (regAngle < 3) {
                          setRegAngle(regAngle + 1);
                        } else {
                          setRegSuccess(true);
                          setRegAngle(1);
                        }
                      }}
                    >
                      <Sparkles size={15} />
                      <span>{regAngle < 3 ? `Chụp góc tiếp theo (${regAngle}/3)` : 'Hoàn tất đăng ký Face ID'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="card">
          <div className="card-h">
            <h3>Danh sách ca làm việc & Phân ca chuẩn</h3>
            <button className="btn sm pri">
              <Plus size={14} />
              <span>Thêm ca làm việc</span>
            </button>
          </div>
          <div className="card-b">
            <div className="grid c3">
              <div className="card" style={{ border: '1px solid #ccfbf1', background: '#f0fdfa' }}>
                <div className="card-b">
                  <span className="badge b-p">Ca chuẩn</span>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '16px' }}>Ca Hành chính Chuẩn</h3>
                  <div style={{ fontSize: '13px', color: '#115e59', fontWeight: 600 }}>08:00 - 17:30 (Nghỉ trưa 12:00 - 13:30)</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Áp dụng: Khối Văn phòng, Kỹ thuật, Nhân sự, Kế toán</div>
                </div>
              </div>
              <div className="card" style={{ border: '1px solid #fef3c7', background: '#fffbeb' }}>
                <div className="card-b">
                  <span className="badge b-amber">Ca sản xuất</span>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '16px' }}>Ca Xoay Sản xuất Sáng</h3>
                  <div style={{ fontSize: '13px', color: '#b45309', fontWeight: 600 }}>06:00 - 14:00 (Nghỉ giữa ca 30 phút)</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Áp dụng: Công nhân & Tổ trưởng phân xưởng</div>
                </div>
              </div>
              <div className="card" style={{ border: '1px solid #ede9fe', background: '#faf5ff' }}>
                <div className="card-b">
                  <span className="badge b-purple">Ca trực đêm</span>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '16px' }}>Ca Trực IT & Vận hành</h3>
                  <div style={{ fontSize: '13px', color: '#6d28d9', fontWeight: 600 }}>22:00 - 06:00 (Hưởng phụ cấp ca đêm 30%)</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Áp dụng: Kỹ sư trực hệ thống máy chủ 24/7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
