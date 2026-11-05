import React, { useState, useEffect } from 'react';
import { X, User, Star, FileText, Phone, Mail, Calendar, ExternalLink, AlertCircle, Save } from 'lucide-react';

export default function CandidateModal({
  isOpen,
  onClose,
  onSave,
  candidate = null,
  jobs = [],
  employees = [],
  stages = []
}) {
  const isEdit = !!candidate?.CandidateId;

  const [formData, setFormData] = useState({
    CandidateCode: '',
    JobId: '',
    FullName: '',
    Phone: '',
    Email: '',
    CvUrl: '',
    Stage: 'Applied',
    AppliedDate: new Date().toISOString().slice(0, 10),
    InterviewerEmployeeId: '',
    RatingScore: 0,
    Note: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (candidate) {
      setFormData({
        CandidateCode: candidate.CandidateCode || '',
        JobId: candidate.JobId || '',
        FullName: candidate.FullName || '',
        Phone: candidate.Phone || '',
        Email: candidate.Email || '',
        CvUrl: candidate.CvUrl || '',
        Stage: candidate.Stage || 'Applied',
        AppliedDate: candidate.AppliedDate || new Date().toISOString().slice(0, 10),
        InterviewerEmployeeId: candidate.InterviewerEmployeeId || '',
        RatingScore: candidate.RatingScore ?? 0,
        Note: candidate.Note || ''
      });
    } else {
      setFormData({
        CandidateCode: '',
        JobId: jobs[0]?.JobId || '',
        FullName: '',
        Phone: '',
        Email: '',
        CvUrl: '',
        Stage: 'Applied',
        AppliedDate: new Date().toISOString().slice(0, 10),
        InterviewerEmployeeId: '',
        RatingScore: 3,
        Note: ''
      });
    }
    setErrorMsg('');
  }, [candidate, jobs, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (score) => {
    setFormData(prev => ({ ...prev, RatingScore: score }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.FullName || !formData.FullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên ứng viên!');
      return;
    }
    if (!formData.JobId) {
      setErrorMsg('Vui lòng chọn vị trí tuyển dụng ứng tuyển!');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onSave({
        ...formData,
        JobId: parseInt(formData.JobId),
        RatingScore: parseInt(formData.RatingScore) || 0,
        InterviewerEmployeeId: formData.InterviewerEmployeeId ? parseInt(formData.InterviewerEmployeeId) : null
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu hồ sơ ứng viên!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: '#0f766e' }} />
            <h3>
              {isEdit
                ? `Hồ sơ ứng viên: ${candidate.FullName} (${candidate.CandidateCode})`
                : 'Thêm mới ứng viên ứng tuyển (tblCandidate)'}
            </h3>
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
              <label className="field">
                <span>Mã ứng viên:</span>
                <input
                  name="CandidateCode"
                  className="inp"
                  placeholder="Để trống để tự tạo (VD: UV010)"
                  value={formData.CandidateCode}
                  onChange={handleChange}
                  disabled={isEdit}
                />
              </label>

              <label className="field">
                <span>Họ và tên ứng viên: <i className="req">*</i></span>
                <input
                  name="FullName"
                  className="inp"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.FullName}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Số điện thoại:</span>
                <input
                  name="Phone"
                  className="inp"
                  placeholder="0912345678"
                  value={formData.Phone}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Email liên hệ:</span>
                <input
                  type="email"
                  name="Email"
                  className="inp"
                  placeholder="ungvien@gmail.com"
                  value={formData.Email}
                  onChange={handleChange}
                />
              </label>

              <label className="field" style={{ gridColumn: 'span 2' }}>
                <span>Vị trí ứng tuyển (Job): <i className="req">*</i></span>
                <select
                  name="JobId"
                  className="inp"
                  value={formData.JobId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn vị trí tuyển dụng --</option>
                  {jobs.map(j => (
                    <option key={j.JobId} value={j.JobId}>
                      {j.JobTitle} ({j.DepartmentName || 'Khối Kỹ Thuật'})
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Giai đoạn tuyển dụng (Stage):</span>
                <select name="Stage" className="inp" value={formData.Stage} onChange={handleChange}>
                  <option value="Applied">Applied (Ứng tuyển mới)</option>
                  <option value="Screening">Screening (Sàng lọc hồ sơ)</option>
                  <option value="Interviewing">Interviewing (Phỏng vấn)</option>
                  <option value="Offered">Offered (Gửi thư mời nhận việc)</option>
                  <option value="Rejected">Rejected (Từ chối / Loại)</option>
                </select>
              </label>

              <label className="field">
                <span>Ngày nộp hồ sơ:</span>
                <input
                  type="date"
                  name="AppliedDate"
                  className="inp"
                  value={formData.AppliedDate}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Người phỏng vấn phụ trách:</span>
                <select
                  name="InterviewerEmployeeId"
                  className="inp"
                  value={formData.InterviewerEmployeeId}
                  onChange={handleChange}
                >
                  <option value="">-- Chưa chỉ định --</option>
                  {employees.map(e => (
                    <option key={e.EmployeeId || e.id} value={e.EmployeeId || e.id}>
                      {e.FullName || e.name} ({e.EmployeeCode || e.id} - {e.DepartmentName || e.department || 'HR'})
                    </option>
                  ))}
                </select>
              </label>

              <div className="field">
                <span>Đánh giá năng lực (RatingScore 1-5 sao):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      type="button"
                      key={score}
                      onClick={() => handleRatingClick(score)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: score <= formData.RatingScore ? '#f59e0b' : '#cbd5e1'
                      }}
                    >
                      <Star size={22} fill={score <= formData.RatingScore ? '#f59e0b' : 'none'} />
                    </button>
                  ))}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginLeft: '6px' }}>
                    {formData.RatingScore ? `${formData.RatingScore} / 5 điểm` : 'Chưa chấm điểm'}
                  </span>
                </div>
              </div>

              <label className="field" style={{ gridColumn: 'span 2' }}>
                <span>Đường dẫn hồ sơ CV (URL):</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    name="CvUrl"
                    className="inp"
                    placeholder="https://drive.google.com/... hoặc link CV"
                    value={formData.CvUrl}
                    onChange={handleChange}
                    style={{ flex: 1 }}
                  />
                  {formData.CvUrl && (
                    <a
                      href={formData.CvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ExternalLink size={14} />
                      <span>Xem CV</span>
                    </a>
                  )}
                </div>
              </label>

              <label className="field" style={{ gridColumn: 'span 2' }}>
                <span>Ghi chú phỏng vấn & Nhận xét đánh giá:</span>
                <textarea
                  name="Note"
                  className="inp"
                  rows={3}
                  placeholder="Nhận xét kỹ năng chuyên môn, thái độ, mức lương mong muốn..."
                  value={formData.Note}
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
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu cập nhật' : 'Thêm ứng viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

