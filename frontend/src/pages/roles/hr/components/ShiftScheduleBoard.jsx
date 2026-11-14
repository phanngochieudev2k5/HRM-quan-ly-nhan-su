import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Search, Layers, RefreshCw,
  Trash2, Clock, CheckCircle2, X, Plus
} from 'lucide-react';
import HrService from '../../../../services/HrService';
import BulkAssignShiftModal from './BulkAssignShiftModal';
import {
  getPeriodDays,
  addDays,
  getShiftVisual,
  formatDateYMD
} from './shiftUtils';
import EmptyState from '../../../../components/common/EmptyState';

export default function ShiftScheduleBoard({
  shifts = [],
  departments = [],
  allEmployees = [],
  showToast
}) {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [deptFilter, setDeptFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [scheduleData, setScheduleData] = useState({ employees: [], totalAssignments: 0 });
  const [loading, setLoading] = useState(false);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [cellEditor, setCellEditor] = useState(null); // { emp, dayMeta, existing }
  const [cellSaving, setCellSaving] = useState(false);

  const periodDays = useMemo(
    () => getPeriodDays(anchorDate, viewMode),
    [anchorDate, viewMode]
  );

  const startDate = periodDays[0]?.dateStr || formatDateYMD(new Date());
  const endDate = periodDays[periodDays.length - 1]?.dateStr || startDate;

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const data = await HrService.getShiftSchedule({
        startDate,
        endDate,
        departmentId: deptFilter,
        search: searchTerm.trim()
      });
      setScheduleData(data || { employees: [], totalAssignments: 0 });
    } catch (err) {
      showToast?.(err.message || 'Lỗi khi tải bảng phân ca!', 'error');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, deptFilter, searchTerm, showToast]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const activeShifts = useMemo(() => shifts.filter((s) => s.IsActive !== false), [shifts]);

  const handleNavigatePeriod = (direction) => {
    setAnchorDate((prev) => {
      if (viewMode === 'month') {
        return new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
      }
      return addDays(prev, direction * 7);
    });
  };

  const handleToday = () => {
    setAnchorDate(new Date());
  };

  const periodLabel = useMemo(() => {
    if (viewMode === 'month') {
      return `Tháng ${anchorDate.getMonth() + 1} / ${anchorDate.getFullYear()}`;
    }
    const first = periodDays[0];
    const last = periodDays[periodDays.length - 1];
    if (!first || !last) return '';
    return `Tuần ${String(first.dayNum).padStart(2, '0')}/${String(first.monthNum).padStart(2, '0')} - ${String(last.dayNum).padStart(2, '0')}/${String(last.monthNum).padStart(2, '0')}/${anchorDate.getFullYear()}`;
  }, [viewMode, anchorDate, periodDays]);

  const handleCellClick = (emp, dayMeta) => {
    const existing = emp.assignments?.[dayMeta.dateStr] || null;
    setCellEditor({
      emp,
      dayMeta,
      existing,
      selectedShiftId: existing?.ShiftId
        ? String(existing.ShiftId)
        : activeShifts[0]?.ShiftId
        ? String(activeShifts[0].ShiftId)
        : ''
    });
  };

  const handleQuickAssignCell = async () => {
    if (!cellEditor?.selectedShiftId) {
      showToast?.('Vui lòng chọn ca làm việc!', 'error');
      return;
    }
    try {
      setCellSaving(true);
      await HrService.assignShifts({
        assignments: [
          {
            EmployeeId: cellEditor.emp.EmployeeId,
            AttendanceDate: cellEditor.dayMeta.dateStr,
            ShiftId: parseInt(cellEditor.selectedShiftId, 10),
            forceOverwriteCheckedIn: false
          }
        ]
      });
      showToast?.(
        `Đã phân ca cho ${cellEditor.emp.FullName} ngày ${cellEditor.dayMeta.dayNum}/${cellEditor.dayMeta.monthNum}!`,
        'success'
      );
      setCellEditor(null);
      await loadSchedule();
    } catch (err) {
      showToast?.(err.message || 'Lỗi khi cập nhật ca cho nhân viên!', 'error');
    } finally {
      setCellSaving(false);
    }
  };

  const handleQuickRemoveCell = async () => {
    if (!cellEditor?.existing?.AttendanceId) return;
    try {
      setCellSaving(true);
      await HrService.removeShiftAssignment(cellEditor.existing.AttendanceId);
      showToast?.('Đã xóa lịch phân ca trong ngày!', 'success');
      setCellEditor(null);
      await loadSchedule();
    } catch (err) {
      showToast?.(err.message || 'Không thể xóa lịch phân ca!', 'error');
    } finally {
      setCellSaving(false);
    }
  };

  const employees = scheduleData.employees || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Thanh công cụ lọc & điều hướng thời gian */}
      <div className="tbl-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Chế độ xem Tuần / Tháng + Điều hướng */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="shift-mode-switch">
              <button
                type="button"
                className={`btn sm ${viewMode === 'week' ? 'pri' : ''}`}
                onClick={() => setViewMode('week')}
              >
                Tuần (7 ngày)
              </button>
              <button
                type="button"
                className={`btn sm ${viewMode === 'month' ? 'pri' : ''}`}
                onClick={() => setViewMode('month')}
              >
                Tháng ({viewMode === 'month' ? periodDays.length : '30'} ngày)
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                className="btn sm"
                onClick={() => handleNavigatePeriod(-1)}
                title={viewMode === 'week' ? 'Tuần trước' : 'Tháng trước'}
              >
                <ChevronLeft size={15} />
              </button>
              <button type="button" className="btn sm" onClick={handleToday}>
                Hôm nay
              </button>
              <button
                type="button"
                className="btn sm"
                onClick={() => handleNavigatePeriod(1)}
                title={viewMode === 'week' ? 'Tuần sau' : 'Tháng sau'}
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px', color: '#042f2e', paddingLeft: '4px' }}>
              <Calendar size={15} style={{ color: '#0f766e' }} />
              <span>{periodLabel}</span>
            </div>
          </div>

          {/* Bộ lọc phòng ban, tìm kiếm & Phân ca hàng loạt */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="search" style={{ minWidth: '200px' }}>
              <Search size={14} />
              <input
                className="inp"
                placeholder="Tìm mã NV / họ tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <select
              className="inp"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '170px' }}
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.map((d) => (
                <option key={d.DepartmentId} value={d.DepartmentId}>
                  {d.DepartmentName}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn"
              onClick={loadSchedule}
              title="Tải lại bảng phân ca"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>

            <button
              type="button"
              className="btn pri"
              onClick={() => setIsBulkModalOpen(true)}
            >
              <Layers size={15} />
              <span>Phân ca hàng loạt & Xoay ca</span>
            </button>
          </div>
        </div>

        {/* Thanh chú thích ca làm việc (Shift Legend) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #eef2f1'
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
            Chú thích ca (click trực tiếp vào ô trên bảng để phân/đổi ca nhanh):
          </span>
          {activeShifts.map((s) => {
            const visual = getShiftVisual(s.ShiftType, s.StartTime);
            return (
              <span
                key={s.ShiftId}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  background: visual.bg,
                  color: visual.color,
                  border: `1px solid ${visual.border}`
                }}
              >
                <span>{s.ShiftCode}</span>
                <span style={{ fontWeight: 500, opacity: 0.9 }}>
                  {s.ShiftName} ({s.StartTime}-{s.EndTime})
                </span>
              </span>
            );
          })}
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b' }}>
            Tổng lịch đã phân trong kỳ: <strong style={{ color: '#0f766e' }}>{scheduleData.totalAssignments || 0}</strong> lượt
          </span>
        </div>
      </div>

      {/* Bảng Ma Trận Phân Ca */}
      <div className="attendance-matrix-wrapper" style={{ maxHeight: 'calc(100vh - 340px)' }}>
        <table className="attendance-matrix-table shift-matrix-table">
          <thead>
            <tr>
              <th className="emp-name-col" style={{ minWidth: '220px', maxWidth: '220px', padding: '8px 12px' }}>
                NHÂN VIÊN / PHÒNG BAN
              </th>
              {periodDays.map((day) => (
                <th
                  key={day.dateStr}
                  className={`${day.isWeekend ? 'weekend' : ''} ${day.isToday ? 'today' : ''}`}
                  style={{
                    minWidth: viewMode === 'week' ? '115px' : '58px',
                    padding: '6px 4px'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700 }}>{day.dowLabel}</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, marginTop: '2px' }}>
                    {String(day.dayNum).padStart(2, '0')}/{String(day.monthNum).padStart(2, '0')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={periodDays.length + 1} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  Đang tải bảng phân ca từ hệ thống...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <EmptyState
                isTable
                colSpan={periodDays.length + 1}
                icon={Calendar}
                title="Không có nhân viên nào phù hợp"
                description="Thử thay đổi bộ lọc phòng ban hoặc từ khóa tìm kiếm."
              />
            ) : (
              employees.map((emp) => (
                <tr key={emp.EmployeeId}>
                  <td className="emp-name-col" style={{ minWidth: '220px', maxWidth: '220px', padding: '8px 12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.EmployeeCode} · {emp.FullName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.DepartmentName || 'Chưa gán phòng ban'}
                    </div>
                  </td>

                  {periodDays.map((day) => {
                    const cell = emp.assignments?.[day.dateStr];
                    const visual = cell ? getShiftVisual(cell.ShiftType, cell.StartTime) : null;
                    const hasCheckedIn = Boolean(cell?.TimeIn);

                    return (
                      <td
                        key={day.dateStr}
                        className={`day-cell ${day.isWeekend ? 'weekend' : ''}`}
                        onClick={() => handleCellClick(emp, day)}
                        title={
                          cell
                            ? `${cell.ShiftCode} - ${cell.ShiftName} (${cell.StartTime} - ${cell.EndTime})${
                                hasCheckedIn ? ` | Đã check-in: ${cell.TimeIn}` : ' | Click để đổi/xóa ca'
                              }`
                            : 'Click để phân ca ngày này'
                        }
                        style={{
                          padding: '4px',
                          height: '46px',
                          verticalAlign: 'middle'
                        }}
                      >
                        {cell ? (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '3px 5px',
                              borderRadius: '6px',
                              background: visual.bg,
                              border: `1px solid ${visual.border}`,
                              color: visual.color,
                              lineHeight: 1.2
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 800, fontSize: '11px' }}>
                              <span>{cell.ShiftCode}</span>
                              {hasCheckedIn && (
                                <CheckCircle2 size={10} style={{ color: '#059669' }} />
                              )}
                            </div>
                            {viewMode === 'week' && (
                              <div style={{ fontSize: '10px', fontWeight: 600, opacity: 0.85, marginTop: '2px' }}>
                                {cell.StartTime}-{cell.EndTime}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="shift-cell-empty">
                            <Plus size={12} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal nhanh chỉnh sửa/xóa ca cho 1 ô cụ thể */}
      {cellEditor && (
        <div className="modal-wrap" onClick={() => setCellEditor(null)} style={{ zIndex: 1150 }}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={17} style={{ color: '#0f766e' }} />
                <h3>Phân ca ngày {String(cellEditor.dayMeta.dayNum).padStart(2, '0')}/{String(cellEditor.dayMeta.monthNum).padStart(2, '0')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCellEditor(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-b" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                  {cellEditor.emp.EmployeeCode} - {cellEditor.emp.FullName}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  {cellEditor.emp.DepartmentName || 'Chưa phân phòng ban'} · Ngày {cellEditor.dayMeta.dateStr} ({cellEditor.dayMeta.dowLabel})
                </div>
              </div>

              {cellEditor.existing?.TimeIn && (
                <div style={{ padding: '9px 12px', borderRadius: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: '12.5px', fontWeight: 600 }}>
                  Nhân viên đã check-in thực tế lúc {cellEditor.existing.TimeIn}. Không thể xóa lịch phân ca của ngày này.
                </div>
              )}

              <label className="field">
                <span>Chọn ca làm việc:</span>
                <select
                  className="inp"
                  value={cellEditor.selectedShiftId}
                  onChange={(e) =>
                    setCellEditor((prev) => ({ ...prev, selectedShiftId: e.target.value }))
                  }
                  disabled={Boolean(cellEditor.existing?.TimeIn)}
                >
                  {activeShifts.length === 0 ? (
                    <option value="">Không có ca kích hoạt</option>
                  ) : (
                    activeShifts.map((s) => (
                      <option key={s.ShiftId} value={s.ShiftId}>
                        [{s.ShiftCode}] {s.ShiftName} ({s.StartTime} - {s.EndTime})
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>

            <div
              className="modal-f"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderTop: '1px solid #e2e8f0'
              }}
            >
              {cellEditor.existing && !cellEditor.existing.TimeIn ? (
                <button
                  type="button"
                  className="btn sm"
                  style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
                  onClick={handleQuickRemoveCell}
                  disabled={cellSaving}
                >
                  <Trash2 size={14} />
                  <span>Xóa lịch ca</span>
                </button>
              ) : (
                <span></span>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn" onClick={() => setCellEditor(null)} disabled={cellSaving}>
                  Đóng
                </button>
                {!cellEditor.existing?.TimeIn && (
                  <button
                    type="button"
                    className="btn pri"
                    onClick={handleQuickAssignCell}
                    disabled={cellSaving || activeShifts.length === 0}
                  >
                    {cellSaving ? 'Đang lưu...' : 'Lưu phân ca'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Phân Ca Hàng Loạt & Xoay Ca */}
      <BulkAssignShiftModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={async (msg) => {
          showToast?.(msg, 'success');
          await loadSchedule();
        }}
        shifts={shifts}
        employees={allEmployees.length > 0 ? allEmployees : employees}
        departments={departments}
        defaultStartDate={startDate}
        defaultEndDate={endDate}
      />
    </div>
  );
}
