import React, { useState, useEffect } from 'react';
import { X, Briefcase, AlertCircle, Save } from 'lucide-react';

export default function JobModal({
  isOpen,
  onClose,
  onSave,
  job = null,
  departments = []
}) {
  const isEdit = !!job?.JobId;

  const [formData, setFormData] = useState({
    JobTitle: '',
    DepartmentId: '',
    TargetQuantity: 1,
    SalaryRange: '15.000.000 - 25.000.000 VNĐ',
    Deadline: '',
    JobDescription: '',
    Status: 'Approved'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (job) {
      setFormData({
        JobTitle: job.JobTitle || '',
        DepartmentId: job.DepartmentId || '',
        TargetQuantity: job.TargetQuantity || 1,
        SalaryRange: job.SalaryRange || '',
        Deadline: job.Deadline || '',
        JobDescription: job.JobDescription || '',
        Status: job.Status === 'Closed' ? 'Closed' : 'Approved'
      });
    } else {
      setFormData({
        JobTitle: '',
        DepartmentId: departments[0]?.DepartmentId || '',
        TargetQuantity: 1,
        SalaryRange: '15.000.000 - 25.000.000 VNĐ',
        Deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        JobDescription: '',
        Status: 'Approved'
      });
    }
    setErrorMsg('');
  }, [job, departments, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.JobTitle || !formData.JobTitle.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề vị trí tuyển dụng!');
      return;
    }
    if (!formData.DepartmentId) {
      setErrorMsg('Vui lòng chọn phòng ban đề xuất!');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onSave({
        ...formData,
        TargetQuantity: parseInt(formData.TargetQuantity) || 1,
        DepartmentId: parseInt(formData.DepartmentId)
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu đề xuất tuyển dụng!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} style={{ color: '#0f766e' }} />
            <h3>{isEdit ? `Cập nhật vị trí tuyển dụng: ${formData.JobTitle}` : 'Tạo đề xuất tuyển dụng mới'}</h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ margin: '14px 20px 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-b" style={{ padding: '16px 20px' }}>
            <div className="form">
              <label className="field" style={{ gridColumn: 'span 2' }}>
                <span>Tiêu đề vị trí tuyển dụng: <i className="req">*</i></span>
                <input
                  name="JobTitle"
                  className="inp"
                  required
                  placeholder="VD: Senior Backend Developer (Node.js & Database)"
                  value={formData.JobTitle}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Phòng ban đề xuất: <i className="req">*</i></span>
                <select
                  name="DepartmentId"
                  className="inp"
                  value={formData.DepartmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map(d => (
                    <option key={d.DepartmentId} value={d.DepartmentId}>
                      {d.DepartmentName} ({d.DepartmentCode})
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Chỉ tiêu tuyển dụng (người): <i className="req">*</i></span>
                <input
                  type="number"
                  min="1"
                  name="TargetQuantity"
                  className="inp num"
                  required
                  value={formData.TargetQuantity}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Dải lương đề xuất:</span>
                <input
                  name="SalaryRange"
                  className="inp"
                  placeholder="VD: 20.000.000 - 35.000.000 VNĐ"
                  value={formData.SalaryRange}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Hạn chót nhận hồ sơ:</span>
                <input
                  type="date"
                  name="Deadline"
                  className="inp"
                  value={formData.Deadline}
                  onChange={handleChange}
                />
              </label>

              {isEdit && (
                <label className="field">
                  <span>Trạng thái tuyển dụng:</span>
                  <select name="Status" className="inp" value={formData.Status} onChange={handleChange}>
                    <option value="Approved">Đang mở tuyển</option>
                    <option value="Closed">Đã đóng / Đủ chỉ tiêu</option>
                  </select>
                </label>
              )}

              <label className="field" style={{ gridColumn: 'span 2' }}>
                <span>Mô tả công việc & Yêu cầu (JD):</span>
                <textarea
                  name="JobDescription"
                  className="inp"
                  rows={4}
                  placeholder="Chi tiết trách nhiệm công việc, kỹ năng yêu cầu và chế độ đãi ngộ..."
                  value={formData.JobDescription}
                  onChange={handleChange}
                  style={{ resize: 'vertical' }}
                />
              </label>
            </div>
          </div>

          <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn pri" disabled={submitting}>
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu cập nhật' : 'Tạo & Mở tuyển dụng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
