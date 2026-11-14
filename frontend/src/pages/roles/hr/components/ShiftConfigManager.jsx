import React, { useState } from 'react';
import {
  Clock, Plus, Search, Edit2, Moon, Sun, Coffee, Power, RefreshCw
} from 'lucide-react';
import HrService from '../../../../services/HrService';
import ShiftFormModal from './ShiftFormModal';
import { getShiftVisual, computeShiftMetrics } from './shiftUtils';
import EmptyState from '../../../../components/common/EmptyState';

export default function ShiftConfigManager({
  shifts = [],
  loading = false,
  onReload,
  showToast
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const filteredShifts = shifts.filter((s) => {
    if (activeFilter === '1' && !s.IsActive) return false;
    if (activeFilter === '0' && s.IsActive) return false;
    if (typeFilter !== 'all') {
      const visual = getShiftVisual(s.ShiftType, s.StartTime);
      if (s.ShiftType !== typeFilter && visual.value !== typeFilter) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        (s.ShiftCode || '').toLowerCase().includes(q) ||
        (s.ShiftName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift) => {
    setEditingShift(shift);
    setIsModalOpen(true);
  };

  const handleSaveShift = async (formData) => {
    if (editingShift?.ShiftId) {
      await HrService.updateShift(editingShift.ShiftId, formData);
      showToast?.(`Đã cập nhật ca làm việc ${formData.ShiftCode}!`, 'success');
    } else {
      await HrService.createShift(formData);
      showToast?.(`Đã tạo ca làm việc mới ${formData.ShiftCode}!`, 'success');
    }
    await onReload?.();
  };

  const handleToggleStatus = async (shift) => {
    try {
      setTogglingId(shift.ShiftId);
      const nextStatus = !shift.IsActive;
      await HrService.toggleShiftStatus(shift.ShiftId, nextStatus);
      showToast?.(
        nextStatus
          ? `Đã kích hoạt ca ${shift.ShiftCode}`
          : `Đã tạm ngưng ca ${shift.ShiftCode}`,
        'success'
      );
      await onReload?.();
    } catch (err) {
      showToast?.(err.message || 'Lỗi khi thay đổi trạng thái ca làm việc!', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="tbl-card">
        <div className="tbl-tools" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="search" style={{ minWidth: '240px' }}>
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo mã ca, tên ca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <select
            className="inp"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '170px' }}
          >
            <option value="all">Tất cả loại ca</option>
            <option value="Administrative">Ca hành chính</option>
            <option value="Night">Ca đêm</option>
            <option value="Rotating">Xoay ca</option>
          </select>

          <select
            className="inp"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="1">Đang kích hoạt (Active)</option>
            <option value="0">Tạm ngưng (Inactive)</option>
          </select>

          <span className="grow"></span>

          <button className="btn" onClick={() => onReload?.()} title="Làm mới">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button className="btn pri" onClick={handleOpenCreate}>
            <Plus size={15} />
            <span>Thêm loại ca mới</span>
          </button>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>MÃ CA</th>
                <th>TÊN CA LÀM VIỆC</th>
                <th>LOẠI CA</th>
                <th>KHUNG GIỜ LÀM VIỆC</th>
                <th>NGHỈ GIỮA CA</th>
                <th className="c">GIỜ CÔNG CHUẨN</th>
                <th className="c">TRẠNG THÁI</th>
                <th className="act">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Đang tải cấu hình ca làm việc...
                  </td>
                </tr>
              ) : filteredShifts.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={8}
                  icon={Clock}
                  title="Chưa có ca làm việc phù hợp"
                  description="Thêm cấu hình ca làm việc mới để sử dụng trong bảng phân ca."
                  actionLabel="Thêm ca mới"
                  onAction={handleOpenCreate}
                />
              ) : (
                filteredShifts.map((shift) => {
                  const visual = getShiftVisual(shift.ShiftType, shift.StartTime);
                  const metrics =
                    shift.TotalWorkHours !== undefined
                      ? {
                          isOvernight: shift.IsOvernight,
                          breakMinutes: shift.BreakMinutes,
                          totalWorkHours: shift.TotalWorkHours
                        }
                      : computeShiftMetrics(
                          shift.StartTime,
                          shift.EndTime,
                          shift.BreakStartTime,
                          shift.BreakEndTime
                        );

                  return (
                    <tr key={shift.ShiftId} style={{ opacity: shift.IsActive ? 1 : 0.65 }}>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '12px',
                            background: visual.bg,
                            color: visual.color,
                            border: `1px solid ${visual.border}`
                          }}
                        >
                          {shift.ShiftCode}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>{shift.ShiftName}</strong>
                      </td>
                      <td>
                        <span className={`badge ${visual.badgeClass}`}>{visual.label}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#1e293b' }}>
                          {metrics.isOvernight ? (
                            <Moon size={14} style={{ color: '#6d28d9' }} />
                          ) : (
                            <Sun size={14} style={{ color: '#0f766e' }} />
                          )}
                          <span>
                            {shift.StartTime} - {shift.EndTime}
                          </span>
                          {metrics.isOvernight && (
                            <span
                              style={{
                                fontSize: '10px',
                                background: '#ede9fe',
                                color: '#6d28d9',
                                padding: '1px 6px',
                                borderRadius: '999px',
                                fontWeight: 700
                              }}
                            >
                              +1 ngày
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {shift.BreakStartTime && shift.BreakEndTime ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#475569' }}>
                            <Coffee size={13} style={{ color: '#94a3b8' }} />
                            <span>
                              {shift.BreakStartTime} - {shift.BreakEndTime} ({metrics.breakMinutes}p)
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Không nghỉ giữa ca</span>
                        )}
                      </td>
                      <td className="c">
                        <strong style={{ color: '#0f766e', fontSize: '14px' }}>
                          {metrics.totalWorkHours}h
                        </strong>
                      </td>
                      <td className="c">
                        <button
                          type="button"
                          disabled={togglingId === shift.ShiftId}
                          onClick={() => handleToggleStatus(shift)}
                          title="Nhấn để bật / tắt trạng thái ca"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            background: shift.IsActive ? '#dcfce7' : '#f1f5f9',
                            color: shift.IsActive ? '#15803d' : '#64748b'
                          }}
                        >
                          <Power size={12} />
                          <span>{shift.IsActive ? 'Kích hoạt' : 'Tạm ngưng'}</span>
                        </button>
                      </td>
                      <td className="act">
                        <button
                          type="button"
                          className="ibtn"
                          title="Chỉnh sửa ca làm việc"
                          onClick={() => handleOpenEdit(shift)}
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ShiftFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveShift}
        shift={editingShift}
      />
    </div>
  );
}
