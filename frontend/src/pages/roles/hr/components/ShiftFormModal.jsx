import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, Moon, Sun, AlertCircle, CheckCircle2 } from 'lucide-react';
import { computeShiftMetrics } from './shiftUtils';

export default function ShiftFormModal({
  isOpen,
  onClose,
  onSave,
  shift = null
}) {
  const isEdit = Boolean(shift?.ShiftId);

  const [formData, setFormData] = useState({
    ShiftCode: '',
    ShiftName: '',
    ShiftType: 'Administrative',
    StartTime: '08:00',
    EndTime: '17:30',
    BreakStartTime: '12:00',
    BreakEndTime: '13:30',
    IsActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (shift) {
      let normalizedType = shift.ShiftType || 'Administrative';
      if (normalizedType === 'Toàn thời gian') normalizedType = 'Administrative';
      if (normalizedType === 'Xoay ca') normalizedType = 'Rotating';
      if (normalizedType === 'Ca đêm') normalizedType = 'Night';

      setFormData({
        ShiftCode: shift.ShiftCode || '',
        ShiftName: shift.ShiftName || '',
        ShiftType: ['Administrative', 'Night', 'Rotating'].includes(normalizedType)
          ? normalizedType
          : 'Administrative',
        StartTime: shift.StartTime || '08:00',
        EndTime: shift.EndTime || '17:30',
        BreakStartTime: shift.BreakStartTime || '',
        BreakEndTime: shift.BreakEndTime || '',
        IsActive: shift.IsActive !== undefined ? Boolean(shift.IsActive) : true
      });
    } else {
      setFormData({
        ShiftCode: '',
        ShiftName: '',
        ShiftType: 'Administrative',
        StartTime: '08:00',
        EndTime: '17:30',
        BreakStartTime: '12:00',
        BreakEndTime: '13:30',
        IsActive: true
      });
    }
    setErrorMsg('');
  }, [shift, isOpen]);

  const metrics = useMemo(
    () =>
      computeShiftMetrics(
        formData.StartTime,
        formData.EndTime,
        formData.BreakStartTime,
        formData.BreakEndTime
      ),
    [formData.StartTime, formData.EndTime, formData.BreakStartTime, formData.BreakEndTime]
  );

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      if (name === 'ShiftCode') {
        next.ShiftCode = value.toUpperCase().replace(/\s+/g, '_');
      }
      return next;
    });
  };

  const applyPreset = (preset) => {
    if (preset === 'Administrative') {
      setFormData((p) => ({
        ...p,
        ShiftType: 'Administrative',
        StartTime: '08:00',
        EndTime: '17:30',
        BreakStartTime: '12:00',
        BreakEndTime: '13:30'
      }));
    } else if (preset === 'Night') {
      setFormData((p) => ({
        ...p,
        ShiftType: 'Night',
        StartTime: '22:00',
        EndTime: '06:00',
        BreakStartTime: '02:00',
        BreakEndTime: '03:00'
      }));
    } else if (preset === 'Rotating') {
      setFormData((p) => ({
        ...p,
        ShiftType: 'Rotating',
        StartTime: '06:00',
        EndTime: '14:00',
        BreakStartTime: '10:00',
        BreakEndTime: '10:30'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ShiftCode.trim()) {
      setErrorMsg('Vui lòng nhập mã ca làm việc (VD: CA_HC, CA_DEM)!');
      return;
    }
    if (!formData.ShiftName.trim()) {
      setErrorMsg('Vui lòng nhập tên ca làm việc!');
      return;
    }
    if (!formData.StartTime || !formData.EndTime) {
      setErrorMsg('Vui lòng chọn đầy đủ giờ bắt đầu và giờ kết thúc ca!');
      return;
    }
    if ((formData.BreakStartTime && !formData.BreakEndTime) || (!formData.BreakStartTime && formData.BreakEndTime)) {
      setErrorMsg('Vui lòng nhập đủ cả giờ bắt đầu nghỉ và kết thúc nghỉ (hoặc để trống cả hai)!');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onSave({
        ...formData,
        BreakStartTime: formData.BreakStartTime || null,
        BreakEndTime: formData.BreakEndTime || null
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Không thể lưu cấu hình ca làm việc!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: '#0f766e' }} />
            <h3>{isEdit ? `Cập nhật ca làm việc: ${formData.ShiftCode}` : 'Thêm loại ca làm việc mới (tblShift)'}</h3>
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
          <div className="modal-b" style={{ padding: '16px 20px' }}>
            {!isEdit && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Mẫu nhanh:</span>
                <button type="button" className="btn sm" onClick={() => applyPreset('Administrative')}>
                  Ca hành chính (08:00 - 17:30)
                </button>
                <button type="button" className="btn sm" onClick={() => applyPreset('Rotating')}>
                  Ca xoay sáng (06:00 - 14:00)
                </button>
                <button type="button" className="btn sm" onClick={() => applyPreset('Night')}>
                  Ca đêm qua ngày (22:00 - 06:00)
                </button>
              </div>
            )}

            <div className="form">
              <label className="field">
                <span>Mã ca (ShiftCode): <i className="req">*</i></span>
                <input
                  name="ShiftCode"
                  className="inp"
                  required
                  placeholder="VD: CA_HC, CA_DEM"
                  value={formData.ShiftCode}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Phân loại ca (ShiftType): <i className="req">*</i></span>
                <select name="ShiftType" className="inp" value={formData.ShiftType} onChange={handleChange}>
                  <option value="Administrative">Administrative (Ca hành chính)</option>
                  <option value="Night">Night (Ca đêm)</option>
                  <option value="Rotating">Rotating (Xoay ca)</option>
                </select>
              </label>

              <label className="field" style={{ gridColumn: 'span 2' }}>
                <span>Tên ca làm việc (ShiftName): <i className="req">*</i></span>
                <input
                  name="ShiftName"
                  className="inp"
                  required
                  placeholder="VD: Ca hành chính tiêu chuẩn / Ca trực đêm vận hành"
                  value={formData.ShiftName}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Giờ bắt đầu vào ca (StartTime): <i className="req">*</i></span>
                <input
                  type="time"
                  name="StartTime"
                  className="inp"
                  required
                  value={formData.StartTime}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Giờ kết thúc ca (EndTime): <i className="req">*</i></span>
                <input
                  type="time"
                  name="EndTime"
                  className="inp"
                  required
                  value={formData.EndTime}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Nghỉ giữa ca từ (BreakStartTime):</span>
                <input
                  type="time"
                  name="BreakStartTime"
                  className="inp"
                  value={formData.BreakStartTime}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Nghỉ giữa ca đến (BreakEndTime):</span>
                <input
                  type="time"
                  name="BreakEndTime"
                  className="inp"
                  value={formData.BreakEndTime}
                  onChange={handleChange}
                />
              </label>

              <div
                style={{
                  gridColumn: 'span 2',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: metrics.isOvernight ? '#f5f3ff' : '#f0fdfa',
                  border: `1px solid ${metrics.isOvernight ? '#ddd6fe' : '#99f6e4'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {metrics.isOvernight ? (
                    <Moon size={18} style={{ color: '#6d28d9' }} />
                  ) : (
                    <Sun size={18} style={{ color: '#0f766e' }} />
                  )}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: metrics.isOvernight ? '#5b21b6' : '#115e59' }}>
                      {metrics.isOvernight
                        ? 'Ca đêm qua ngày hôm sau (+1 ngày)'
                        : 'Ca làm việc trong ngày'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Tổng thời gian: <b>{(metrics.grossMinutes / 60).toFixed(2)}h</b> · Nghỉ giữa ca: <b>{metrics.breakMinutes} phút</b>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Giờ công chuẩn thực tế
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: metrics.isOvernight ? '#6d28d9' : '#0f766e' }}>
                    {metrics.totalWorkHours} giờ
                  </div>
                </div>
              </div>

              <label
                style={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginTop: '4px'
                }}
              >
                <input
                  type="checkbox"
                  name="IsActive"
                  checked={formData.IsActive}
                  onChange={handleChange}
                />
                <CheckCircle2 size={15} style={{ color: formData.IsActive ? '#059669' : '#94a3b8' }} />
                <span>Kích hoạt ca làm việc này để sử dụng khi phân ca (IsActive = 1)</span>
              </label>
            </div>
          </div>

          <div
            className="modal-f"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              padding: '14px 20px',
              borderTop: '1px solid #e2e8f0'
            }}
          >
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn pri" disabled={submitting}>
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu cập nhật ca' : 'Tạo ca làm việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
