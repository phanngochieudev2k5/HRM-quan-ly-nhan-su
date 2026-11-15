import React, { useState, useEffect } from 'react';
import {
  Calendar, Camera, Clock, UserCheck, CheckCircle2,
  RefreshCw, Plus, Printer, Search,
  ExternalLink, Sparkles
} from 'lucide-react';
import AttendanceService from '../../../services/AttendanceService';
import '../../../styles/roles/hr/HrAttendanceView.css';
import HrShiftManagement from './components/HrShiftManagement';
import HrFaceManagement from './components/HrFaceManagement';

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
          <span>Quản lý Face ID AI</span>
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
        <HrFaceManagement onNavigate={onNavigate} />
      )}

      {activeTab === 'shifts' && <HrShiftManagement />}
    </div>
  );
}
