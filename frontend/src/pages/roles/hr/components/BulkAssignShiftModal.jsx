import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Users, Calendar, Repeat, Layers, AlertCircle, CheckSquare, Plus, Trash2
} from 'lucide-react';
import HrService from '../../../../services/HrService';
import { formatDateYMD, getShiftVisual } from './shiftUtils';

export default function BulkAssignShiftModal({
  isOpen,
  onClose,
  onSuccess,
  shifts = [],
  employees = [],
  departments = [],
  defaultStartDate,
  defaultEndDate
}) {
  const activeShifts = useMemo(() => shifts.filter((s) => s.IsActive !== false), [shifts]);

  const [mode, setMode] = useState('fixed'); // 'fixed' | 'rotating'
  const [deptFilter, setDeptFilter] = useState('all');
  const [empSearch, setEmpSearch] = useState('');
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [excludeWeekends, setExcludeWeekends] = useState(true);

  const [fixedShiftId, setFixedShiftId] = useState('');
  const [rotationShiftIds, setRotationShiftIds] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const todayStr = formatDateYMD(new Date());
    setStartDate(defaultStartDate || todayStr);
    setEndDate(defaultEndDate || todayStr);
    setDeptFilter('all');
    setEmpSearch('');
    setSelectedEmpIds([]);
    setExcludeWeekends(true);
    setErrorMsg('');

    if (activeShifts.length > 0) {
      setFixedShiftId(String(activeShifts[0].ShiftId));
      if (activeShifts.length >= 2) {
        setRotationShiftIds([String(activeShifts[0].ShiftId), String(activeShifts[1].ShiftId)]);
      } else {
        setRotationShiftIds([String(activeShifts[0].ShiftId), String(activeShifts[0].ShiftId)]);
      }
    } else {
      setFixedShiftId('');
      setRotationShiftIds([]);
    }
  }, [isOpen, defaultStartDate, defaultEndDate, activeShifts]);

  const visibleEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (deptFilter !== 'all' && String(emp.DepartmentId) !== String(deptFilter)) return false;
      if (empSearch.trim()) {
        const q = empSearch.toLowerCase();
        return (
          (emp.FullName || '').toLowerCase().includes(q) ||
          (emp.EmployeeCode || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [employees, deptFilter, empSearch]);

  if (!isOpen) return null;

  const toggleEmployee = (empId) => {
    setSelectedEmpIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = visibleEmployees.map((e) => e.EmployeeId);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedEmpIds.includes(id));
    if (allSelected) {
      setSelectedEmpIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedEmpIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleRotationChange = (index, val) => {
    setRotationShiftIds((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleAddRotationWeek = () => {
    if (activeShifts.length === 0) return;
    const nextShift = activeShifts[rotationShiftIds.length % activeShifts.length];
    setRotationShiftIds((prev) => [...prev, String(nextShift.ShiftId)]);
  };

  const handleRemoveRotationWeek = (index) => {
    if (rotationShiftIds.length <= 2) return;
    setRotationShiftIds((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedEmpIds.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất một nhân viên để phân ca!');
      return;
    }
    if (!startDate || !endDate || startDate > endDate) {
      setErrorMsg('Khoảng thời gian áp dụng không hợp lệ!');
      return;
    }
    if (mode === 'fixed' && !fixedShiftId) {
      setErrorMsg('Vui lòng chọn ca làm việc!');
      return;
    }
    if (mode === 'rotating' && rotationShiftIds.filter(Boolean).length < 2) {
      setErrorMsg('Chế độ xoay ca cần ít nhất 2 ca trong chu kỳ tuần!');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const payload = {
        employeeIds: selectedEmpIds,
        startDate,
        endDate,
        excludeWeekends,
        mode,
        shiftId: mode === 'fixed' ? parseInt(fixedShiftId, 10) : undefined,
        rotationShiftIds:
          mode === 'rotating'
            ? rotationShiftIds.map((id) => parseInt(id, 10))
            : undefined
      };
      const res = await HrService.assignShifts(payload);
      onSuccess?.(res?.message || 'Phân ca hàng loạt thành công!');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi phân ca hàng loạt!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal" style={{ maxWidth: '820px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: '#0f766e' }} />
            <h3>Phân ca hàng loạt & Xoay ca tự động</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              margin: '14px 20px 0',
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-b" style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '18px' }}>
            {/* Cột trái: Chọn nhân viên */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={15} style={{ color: '#0f766e' }} />
                  1. Chọn nhân viên ({selectedEmpIds.length} đã chọn)
                </span>
                <button
                  type="button"
                  className="btn sm"
                  onClick={handleSelectAllVisible}
                >
                  <CheckSquare size={13} />
                  <span>Chọn / Bỏ tất cả</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="inp"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  style={{ flex: 1, fontSize: '12.5px' }}
                >
                  <option value="all">Tất cả phòng ban</option>
                  {departments.map((d) => (
                    <option key={d.DepartmentId} value={d.DepartmentId}>
                      {d.DepartmentName}
                    </option>
                  ))}
                </select>
                <input
                  className="inp"
                  placeholder="Tìm mã / tên..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  style={{ flex: 1, fontSize: '12.5px' }}
                />
              </div>

              <div
                style={{
                  maxHeight: '290px',
                  overflowY: 'auto',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '6px'
                }}
              >
                {visibleEmployees.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12.5px' }}>
                    Không tìm thấy nhân viên phù hợp
                  </div>
                ) : (
                  visibleEmployees.map((emp) => {
                    const checked = selectedEmpIds.includes(emp.EmployeeId);
                    return (
                      <label
                        key={emp.EmployeeId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: checked ? '#f0fdfa' : 'transparent',
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEmployee(emp.EmployeeId)}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {emp.EmployeeCode} - {emp.FullName}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            {emp.DepartmentName || 'Chưa phân phòng ban'}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cột phải: Thời gian & Quy tắc phân ca */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} style={{ color: '#0f766e' }} />
                  2. Khoảng thời gian áp dụng
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label className="field">
                    <span>Từ ngày:</span>
                    <input
                      type="date"
                      className="inp"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Đến ngày:</span>
                    <input
                      type="date"
                      className="inp"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '10px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={excludeWeekends}
                    onChange={(e) => setExcludeWeekends(e.target.checked)}
                  />
                  <span>Bỏ qua Thứ 7 & Chủ nhật (chỉ phân ngày hành chính)</span>
                </label>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Repeat size={15} style={{ color: '#0f766e' }} />
                  3. Hình thức phân ca
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    className={`btn sm ${mode === 'fixed' ? 'pri' : ''}`}
                    onClick={() => setMode('fixed')}
                    style={{ justifyContent: 'center' }}
                  >
                    Phân ca cố định
                  </button>
                  <button
                    type="button"
                    className={`btn sm ${mode === 'rotating' ? 'pri' : ''}`}
                    onClick={() => setMode('rotating')}
                    style={{ justifyContent: 'center' }}
                  >
                    Xoay ca theo tuần
                  </button>
                </div>

                {mode === 'fixed' ? (
                  <label className="field">
                    <span>Chọn ca áp dụng:</span>
                    <select
                      className="inp"
                      value={fixedShiftId}
                      onChange={(e) => setFixedShiftId(e.target.value)}
                    >
                      {activeShifts.length === 0 ? (
                        <option value="">Chưa có ca làm việc đang kích hoạt</option>
                      ) : (
                        activeShifts.map((s) => (
                          <option key={s.ShiftId} value={s.ShiftId}>
                            [{s.ShiftCode}] {s.ShiftName} ({s.StartTime} - {s.EndTime})
                          </option>
                        ))
                      )}
                    </select>
                  </label>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Chu kỳ luân chuyển theo từng tuần:
                      </span>
                      <button
                        type="button"
                        className="btn sm"
                        onClick={handleAddRotationWeek}
                      >
                        <Plus size={12} />
                        <span>Thêm tuần</span>
                      </button>
                    </div>

                    {rotationShiftIds.map((sId, idx) => {
                      const chosen = activeShifts.find((s) => String(s.ShiftId) === String(sId));
                      const visual = chosen ? getShiftVisual(chosen.ShiftType, chosen.StartTime) : null;
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              minWidth: '58px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: visual?.color || '#0f766e',
                              background: visual?.bg || '#f0fdfa',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              textAlign: 'center'
                            }}
                          >
                            Tuần {idx + 1}
                          </span>
                          <select
                            className="inp"
                            value={sId}
                            onChange={(e) => handleRotationChange(idx, e.target.value)}
                            style={{ flex: 1, fontSize: '12.5px' }}
                          >
                            {activeShifts.map((s) => (
                              <option key={s.ShiftId} value={s.ShiftId}>
                                [{s.ShiftCode}] {s.ShiftName} ({s.StartTime}-{s.EndTime})
                              </option>
                            ))}
                          </select>
                          {rotationShiftIds.length > 2 && (
                            <button
                              type="button"
                              className="ibtn del"
                              onClick={() => handleRemoveRotationWeek(idx)}
                              title="Bỏ tuần này"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    <div style={{ fontSize: '11.5px', color: '#64748b', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', marginTop: '4px' }}>
                      Hệ thống tự động luân chuyển theo chu kỳ {rotationShiftIds.length} tuần liên tiếp (Tuần 1 → Tuần {rotationShiftIds.length} → lặp lại).
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="modal-f"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              borderTop: '1px solid #e2e8f0'
            }}
          >
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Các ngày đã có check-in thực tế sẽ được bảo toàn, không bị ghi đè.
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn" onClick={onClose} disabled={submitting}>
                Hủy
              </button>
              <button type="submit" className="btn pri" disabled={submitting || activeShifts.length === 0}>
                {submitting ? 'Đang phân ca...' : 'Áp dụng lịch phân ca'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
