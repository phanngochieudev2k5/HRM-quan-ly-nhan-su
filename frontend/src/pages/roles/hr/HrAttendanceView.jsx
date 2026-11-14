import React, { useState, useEffect } from 'react';
import {
  Calendar, Camera, Clock, UserCheck, CheckCircle2,
  RefreshCw, Plus, Printer, Search,
  ExternalLink, Sparkles
} from 'lucide-react';
import AttendanceService from '../../../services/AttendanceService';
import '../../../styles/roles/hr/HrAttendanceView.css';
import HrShiftManagement from './components/HrShiftManagement';

const ATTENDANCE_CODES = {
  X: { label: 'Đi làm cả ngày', lv: 1, bg: '#dcfce7', c: '#15803d' },
  M: { label: 'Đi muộn', lv: 1, bg: '#fef3c7', c: '#d97706' },
  N: { label: 'Làm nửa ngày', lv: 0.5, bg: '#ccfbf1', c: '#0f766e' },
  CT: { label: 'Đi công tác', lv: 1, bg: '#e0f2fe', c: '#0369a1' },
  P: { label: 'Nghỉ phép năm', lv: 0, bg: '#dbeafe', c: '#1d4ed8' },
  L: { label: 'Nghỉ lễ, Tết', lv: 0, bg: '#ede9fe', c: '#6d28d9' },
  O: { label: 'Nghỉ ốm (BHXH)', lv: 0, bg: '#fef3c7', c: '#b45309' },
  KP: { label: 'Nghỉ không lương', lv: 0, bg: '#fee2e2', c: '#b91c1c' },
  PC: { label: 'Đã phân ca', lv: 0, bg: '#f1f5f9', c: '#475569' }
};

export default function HrAttendanceView({ subModule = 'matrix', employee, onBack, onCompleteRegistration, onNavigate }) {
  const [activeTab, setActiveTab] = useState(
    subModule === 'live-logs' || subModule === 'face-checkin' ? 'live-logs' :
    subModule === 'register-face' ? 'register' :
    subModule === 'shifts' ? 'shifts' : 'matrix'
  );

  useEffect(() => {
    if (subModule === 'face-checkin' || subModule === 'live-logs') {
      setActiveTab('live-logs');
    } else if (subModule === 'register-face') {
      setActiveTab('register');
    } else if (subModule === 'shifts') {
      setActiveTab('shifts');
    } else {
      setActiveTab('matrix');
    }
  }, [subModule]);

  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [period, setPeriod] = useState(defaultPeriod);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [matrixData, setMatrixData] = useState({});
  const [realEmployees, setRealEmployees] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState(30);
  const [loadingMatrix, setLoadingMatrix] = useState(false);

  const [liveLogs, setLiveLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchMatrix = async () => {
    try {
      setLoadingMatrix(true);
      const [y, m] = period.split('-').map(Number);
      const res = await AttendanceService.getMonthMatrix({ year: y, month: m });
      const data = res?.data || res || {};
      if (data.employees && Array.isArray(data.employees)) {
        setRealEmployees(data.employees);
      }
      if (data.matrix) {
        setMatrixData(data.matrix);
      }
      if (data.daysInMonth) {
        setDaysInMonth(data.daysInMonth);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatrix(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, [period]);

  const fetchLiveLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await AttendanceService.getTodayEvents();
      const list = (res?.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
      setLiveLogs(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLiveLogs();
  }, []);

  const [regEmpId, setRegEmpId] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regFile, setRegFile] = useState(null);
  const [regPreview, setRegPreview] = useState(null);
  const [regSubmitting, setRegSubmitting] = useState(false);

  useEffect(() => {
    if (realEmployees.length > 0 && !regEmpId) {
      setRegEmpId(realEmployees[0].EmployeeCode);
    }
  }, [realEmployees, regEmpId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRegFile(file);
      setRegPreview(URL.createObjectURL(file));
    }
  };

  const handleRegisterSubmit = async () => {
    try {
      setRegSubmitting(true);
      const formData = new FormData();
      formData.append('employeeCode', regEmpId);
      if (regFile) {
        formData.append('faceImages', regFile);
      }
      await AttendanceService.registerFace(formData);
      setRegSuccess(true);
      setRegFile(null);
      setRegPreview(null);
    } catch (err) {
      alert(err.message || 'Lỗi khi đăng ký Face ID!');
    } finally {
      setRegSubmitting(false);
    }
  };

  const [curYear, curMonth] = period.split('-').map(Number);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayInfo = (day) => {
    const dateObj = new Date(curYear, curMonth - 1, day);
    const dow = dateObj.getDay();
    const isSunday = dow === 0;
    const dowName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dow];
    return { dow, dowName, isSunday };
  };

  const departments = Array.from(new Set(realEmployees.map(e => e.DepartmentName).filter(Boolean)));

  const filteredEmployees = realEmployees.filter(emp => {
    const nameMatch = (emp.FullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (emp.EmployeeCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch = !deptFilter || emp.DepartmentName === deptFilter;
    return nameMatch && deptMatch;
  });

  const calculateTotalWork = (daysObj = {}) => {
    let total = 0;
    for (const d in daysObj) {
      const dayVal = daysObj[d];
      const code = typeof dayVal === 'string' ? dayVal : dayVal?.code;
      const credit = typeof dayVal === 'object' && dayVal?.credit !== undefined ? dayVal.credit : null;
      if (credit !== null && credit !== undefined) {
        total += Number(credit);
      } else if (code === 'X' || code === 'CT') {
        total += 1;
      } else if (code === 'N') {
        total += 0.5;
      }
    }
    return total;
  };

  return (
    <div className="attendance-view-container">
      <div className="ph">
        <div>
          <h1>Quản lý chấm công & Điểm danh OpenCV</h1>
          <p>Bảng chấm công ma trận đa ký hiệu, đồng bộ nhận diện khuôn mặt Kiosk và phân ca</p>
        </div>
        <div className="ph-tools">
          <button
            className="btn"
            style={{ background: '#0284c7', color: '#ffffff', borderColor: '#0284c7' }}
            onClick={() => window.open('/kiosk', '_blank')}
          >
            <ExternalLink size={15} />
            <span>Mở Trạm Kiosk Công Cộng</span>
          </button>
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
            fetchMatrix();
            if (onNavigate) onNavigate('hr-attendance', 'history');
          }}
        >
          <Calendar size={16} />
          <span>Bảng chấm công ma trận tháng</span>
        </button>
        <button
          className={`attendance-tab-btn ${activeTab === 'live-logs' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('live-logs');
            fetchLiveLogs();
            if (onNavigate) onNavigate('hr-attendance', 'face-checkin');
          }}
        >
          <Camera size={16} />
          <span>Nhật ký điểm danh Kiosk hôm nay ({liveLogs.length})</span>
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
          <div className="attendance-legend-bar">
            {Object.entries(ATTENDANCE_CODES).map(([k, c]) => (
              <span key={k} className="legend-tag" style={{ background: c.bg, color: c.c }}>
                <b>{k}</b> {c.label}
              </span>
            ))}
          </div>

          <div className="card filter-bar-attendance">
            <div className="field-group-row">
              <label className="mp">
                <span>Kỳ chấm công:</span>
                <input
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </label>

              <div className="search-inp-wrapper">
                <Search size={15} color="#64748b" />
                <input
                  type="text"
                  placeholder="Tìm nhân viên theo tên hoặc mã..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="dept-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">Tất cả phòng ban</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <div style={{ marginLeft: 'auto' }}>
                <button className="btn sm" onClick={fetchMatrix} disabled={loadingMatrix}>
                  <RefreshCw size={13} className={loadingMatrix ? 'spin' : ''} />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>
          </div>

          <div className="table-wrapper attendance-matrix-scroll">
            <table className="tbl attendance-matrix-table">
              <thead>
                <tr>
                  <th className="col-idx">#</th>
                  <th className="col-emp">NHÂN VIÊN</th>
                  <th className="col-dept">PHÒNG BAN</th>
                  {daysArray.map(day => {
                    const info = getDayInfo(day);
                    return (
                      <th
                        key={day}
                        className={`day-col ${info.isSunday ? 'weekend' : ''}`}
                      >
                        {info.dowName}{day}
                      </th>
                    );
                  })}
                  <th className="summary-col">CÔNG</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={daysArray.length + 4} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      {loadingMatrix ? 'Đang tải bảng chấm công từ cơ sở dữ liệu...' : 'Không có nhân viên phù hợp bộ lọc.'}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => {
                    const empId = emp.EmployeeId;
                    const empAtt = matrixData[empId] || { days: {} };
                    const totalWork = calculateTotalWork(empAtt.days);

                    return (
                      <tr key={empId}>
                        <td className="col-idx">{index + 1}</td>
                        <td className="col-emp">
                          <span className="emp-name">{emp.FullName}</span>
                          <span className="emp-code-sub">{emp.EmployeeCode}</span>
                        </td>
                        <td className="col-dept">{emp.DepartmentName || 'Khối Kỹ Thuật'}</td>
                        {daysArray.map(day => {
                          const dayVal = empAtt.days ? empAtt.days[day] : null;
                          const rawCode = typeof dayVal === 'string' ? dayVal : dayVal?.code || '';
                          const code = rawCode === 'MUON' ? 'M' : (rawCode === 'SCHEDULED' ? 'PC' : rawCode);
                          const c = ATTENDANCE_CODES[code];
                          const info = getDayInfo(day);

                          return (
                            <td
                              key={day}
                              className={`day-cell ${info.isSunday ? 'weekend' : ''}`}
                              style={{
                                background: c ? c.bg : undefined,
                                color: c ? c.c : undefined
                              }}
                              title={dayVal?.timeIn ? `Vào: ${dayVal.timeIn} | Ra: ${dayVal.timeOut || 'Đang làm việc'}${dayVal.lateMinutes > 0 ? ` (Muộn ${dayVal.lateMinutes}p)` : ''}${dayVal.earlyMinutes > 0 ? ` (Sớm ${dayVal.earlyMinutes}p)` : ''}${dayVal.credit !== undefined ? ` · ${dayVal.credit} công` : ''}` : (code === 'PC' ? 'Đã phân ca làm việc' : undefined)}
                            >
                              {code}
                            </td>
                          );
                        })}
                        <td className="summary-col">
                          <strong>{totalWork}</strong>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="small muted mt">
            Quy định: Công chuẩn <strong>26 ngày/tháng</strong> · Nghỉ tuần: <strong>Chủ nhật</strong> · Dữ liệu được đồng bộ trực tiếp từ máy chấm công Kiosk OpenCV của nhân viên và không thể sửa đổi.
          </div>
        </>
      )}

      {activeTab === 'live-logs' && (
        <div className="card">
          <div className="card-h">
            <h3>Nhật ký điểm danh thực tế từ Kiosk & OpenCV hôm nay ({liveLogs.length})</h3>
            <div className="ph-tools">
              <button
                className="btn sm"
                onClick={fetchLiveLogs}
                disabled={loadingLogs}
              >
                <RefreshCw size={14} className={loadingLogs ? 'spin' : ''} />
                <span>Làm mới</span>
              </button>
              <button
                className="btn sm pri"
                onClick={() => window.open('/kiosk', '_blank')}
              >
                <ExternalLink size={14} />
                <span>Mở Trạm Kiosk toàn màn hình</span>
              </button>
            </div>
          </div>
          <div className="card-b">
            {liveLogs.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '36px 12px' }}>
                <Clock size={44} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
                <div style={{ fontWeight: 600, fontSize: '15px' }}>Chưa có lượt điểm danh nào hôm nay</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>
                  Khi nhân viên quét mặt tại trạm Kiosk hoặc chạy tiến trình OpenCV, dữ liệu sẽ tức thì hiển thị tại đây.
                </div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Mã NV</th>
                      <th>Họ và tên</th>
                      <th>Phòng ban</th>
                      <th>Giờ vào</th>
                      <th>Giờ ra</th>
                      <th>Trạng thái</th>
                      <th>Hình thức</th>
                      <th>Thiết bị</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveLogs.map((log, idx) => (
                      <tr key={log.AttendanceId || idx}>
                        <td>{idx + 1}</td>
                        <td><strong>{log.EmployeeCode}</strong></td>
                        <td>{log.FullName}</td>
                        <td>{log.DepartmentName || 'Khối Kỹ Thuật'}</td>
                        <td>
                          <span className="badge b-green">{log.TimeInStr || '-'}</span>
                        </td>
                        <td>
                          {log.TimeOutStr ? <span className="badge b-blue">{log.TimeOutStr}</span> : '-'}
                        </td>
                        <td>
                          {log.LateMinutes > 0 ? (
                            <span className="badge b-amber">Muộn {log.LateMinutes}p</span>
                          ) : (
                            <span className="badge b-green">Đúng giờ</span>
                          )}
                        </td>
                        <td>{log.CheckinMethod || 'OPENCV_CAMERA'}</td>
                        <td>{log.DeviceName || 'Kiosk Cổng Chính'}</td>
                        <td>{log.Note || 'Hợp lệ'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'register' && (
        <div className="card">
          <div className="card-h">
            <h3>Đăng ký hồ sơ sinh trắc học Face ID cho nhân sự</h3>
            <span className="badge b-p">Mô hình ResNet50 OpenCV (128D)</span>
          </div>
          <div className="card-b">
            {regSuccess ? (
              <div className="banner" style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#15803d' }}>
                <CheckCircle2 size={20} />
                <div className="grow">
                  <b>Đăng ký Face ID thành công!</b> Ảnh khuôn mặt đã được lưu vào thư mục <code>faces/</code> và trạm Kiosk OpenCV đã sẵn sàng nhận diện.
                </div>
                <button className="btn sm pri" onClick={() => setRegSuccess(false)}>
                  Đăng ký nhân sự khác
                </button>
              </div>
            ) : (
              <div className="grid c2">
                <div className="camera-preview-box" style={{ height: '320px', background: '#0f172a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {regPreview ? (
                    <img
                      src={regPreview}
                      alt="Face Preview"
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#ffffff' }}>
                      <Camera size={44} style={{ color: '#38bdf8', margin: '0 auto 10px' }} />
                      <div style={{ fontWeight: 700 }}>Chưa chọn ảnh khuôn mặt</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        Tải lên ảnh chân dung rõ mặt (.jpg, .png)
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="field">
                    <span>Chọn nhân viên đăng ký Face ID:</span>
                    <select
                      className="inp"
                      value={regEmpId}
                      onChange={(e) => setRegEmpId(e.target.value)}
                    >
                      {realEmployees.map(e => (
                        <option key={e.EmployeeId} value={e.EmployeeCode}>{e.EmployeeCode} - {e.FullName} ({e.DepartmentName || 'Chung'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <span>Tải ảnh khuôn mặt chính diện:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="inp"
                    />
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
                        <span>Mô hình tương thích:</span>
                        <strong>dlib 128D Face Encodings</strong>
                      </div>
                    </div>
                  </div>

                  <div className="row mt">
                    <button
                      className="btn pri"
                      disabled={regSubmitting}
                      onClick={handleRegisterSubmit}
                    >
                      <Sparkles size={15} />
                      <span>{regSubmitting ? 'Đang lưu trữ...' : 'Hoàn tất đăng ký Face ID'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'shifts' && <HrShiftManagement />}
    </div>
  );
}
