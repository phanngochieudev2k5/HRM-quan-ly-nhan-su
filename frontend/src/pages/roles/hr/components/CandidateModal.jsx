import React, { useState, useEffect } from 'react';
import {
  X, User, Star, FileText, Phone, Mail, Calendar, ExternalLink,
  AlertCircle, Save, Lock, CheckCircle2, DollarSign, Award, XCircle, Clock, MapPin, RefreshCw,
  UploadCloud, Download
} from 'lucide-react';
import HrService from '../../../../services/HrService';
import PdfViewerModal from '../../../../components/common/PdfViewerModal';

const isPdfUrl = (url) => {
  if (!url) return false;
  const lower = String(url).toLowerCase();
  return lower.endsWith('.pdf') || lower.includes('/uploads/cv/') || lower.includes('.pdf?');
};

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

  const defaultStages = [
    { key: 'Applied', label: '1. Ứng tuyển mới', color: '#0284c7', bg: '#f0f9ff' },
    { key: 'Screening', label: '2. Lọc hồ sơ', color: '#7c3aed', bg: '#f5f3ff' },
    { key: 'Interviewing', label: '3. Phỏng vấn', color: '#0f766e', bg: '#f0fdfa' },
    { key: 'Offered', label: '4. Đề nghị nhận việc', color: '#059669', bg: '#ecfdf5' },
    { key: 'Hired', label: '5. Trúng tuyển & Onboarding', color: '#16a34a', bg: '#f0fdf4' },
    { key: 'Rejected', label: '6. Từ chối / Loại', color: '#dc2626', bg: '#fef2f2' }
  ];

  const activeStages = stages && stages.length > 0 ? stages : defaultStages;

  const toDatetimeLocalString = (val) => {
    if (!val) return '';
    const s = String(val).trim();
    if (!s) return '';
    if (s.includes('T')) return s.slice(0, 16);
    if (s.includes(' ')) {
      const parts = s.split(' ');
      return `${parts[0]}T${(parts[1] || '09:00').slice(0, 5)}`;
    }
    return `${s}T09:00`;
  };

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
    Note: '',
    InterviewDateTime: '',
    InterviewLocation: '',
    OfferedSalary: '',
    StartDate: ''
  });

  const [cvMode, setCvMode] = useState('file');
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
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
        Note: candidate.Note || '',
        InterviewDateTime: toDatetimeLocalString(candidate.InterviewDateTime),
        InterviewLocation: candidate.InterviewLocation || '',
        OfferedSalary: candidate.OfferedSalary || '',
        StartDate: candidate.StartDate || ''
      });
      setCvFile(null);
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
        Note: '',
        InterviewDateTime: '',
        InterviewLocation: '',
        OfferedSalary: '',
        StartDate: ''
      });
      setCvMode('file');
      setCvFile(null);
    }
    setErrorMsg('');
    setEmailStatus(null);
    setIsPdfModalOpen(false);
  }, [candidate, jobs, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (score) => {
    setFormData(prev => ({ ...prev, RatingScore: score }));
  };

  const handleStageChange = (newStage) => {
    setFormData(prev => ({ ...prev, Stage: newStage }));
    setEmailStatus(null);
    setErrorMsg('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Vui lòng chọn file tài liệu định dạng PDF!');
      return;
    }

    try {
      setCvUploading(true);
      setErrorMsg('');
      setCvFile(file);
      const res = await HrService.uploadCv(file);
      if (res?.fileUrl) {
        setFormData(prev => ({ ...prev, CvUrl: res.fileUrl }));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Không thể tải file PDF lên máy chủ!');
      setCvFile(null);
    } finally {
      setCvUploading(false);
    }
  };

  const handleSendEmail = async (emailType) => {
    if (!candidate?.CandidateId) {
      setErrorMsg('Vui lòng lưu thông tin ứng viên trước khi gửi email!');
      return;
    }
    if (!formData.Email || !formData.Email.includes('@')) {
      setErrorMsg('Ứng viên không có địa chỉ email hợp lệ để nhận thư!');
      return;
    }

    try {
      setEmailSending(true);
      setEmailStatus(null);
      setErrorMsg('');

      const interviewer = employees.find(e => String(e.EmployeeId || e.id) === String(formData.InterviewerEmployeeId));
      const interviewerName = interviewer ? (interviewer.FullName || interviewer.name) : '';

      const cleanInterviewDateTime = formData.InterviewDateTime ? formData.InterviewDateTime.replace('T', ' ') : null;

      const payload = {
        type: emailType,
        interviewDateTime: cleanInterviewDateTime,
        interviewLocation: formData.InterviewLocation || null,
        interviewerEmployeeId: formData.InterviewerEmployeeId ? parseInt(formData.InterviewerEmployeeId) : null,
        interviewerName,
        offeredSalary: formData.OfferedSalary ? parseFloat(formData.OfferedSalary) : null,
        startDate: formData.StartDate || null
      };

      const res = await HrService.sendCandidateEmail(candidate.CandidateId, payload);
      setEmailStatus({
        type: 'success',
        stage: emailType,
        message: res?.message || `Đã gửi email ${emailType} thành công đến hòm thư ${formData.Email}!`
      });
    } catch (err) {
      setEmailStatus({
        type: 'error',
        stage: emailType,
        message: err.message || 'Lỗi khi gửi email đến hòm thư ứng viên!'
      });
    } finally {
      setEmailSending(false);
    }
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

      const cleanInterviewDateTime = formData.InterviewDateTime ? formData.InterviewDateTime.replace('T', ' ') : null;

      await onSave({
        ...formData,
        JobId: parseInt(formData.JobId),
        RatingScore: parseInt(formData.RatingScore) || 0,
        InterviewerEmployeeId: formData.InterviewerEmployeeId ? parseInt(formData.InterviewerEmployeeId) : null,
        OfferedSalary: formData.OfferedSalary ? parseFloat(formData.OfferedSalary) : null,
        InterviewDateTime: cleanInterviewDateTime,
        InterviewLocation: formData.InterviewLocation || null,
        StartDate: formData.StartDate || null
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu hồ sơ ứng viên!');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedJob = jobs.find(j => String(j.JobId) === String(formData.JobId));
  const currentStageObj = activeStages.find(s => s.key === formData.Stage) || activeStages[0];

  const getModalTitle = () => {
    if (!isEdit) return 'Tiếp nhận ứng viên mới';
    switch (formData.Stage) {
      case 'Interviewing':
        return `Đặt lịch phỏng vấn: ${candidate.FullName} (${candidate.CandidateCode})`;
      case 'Offered':
        return `Đề nghị mức lương & Thư nhận việc: ${candidate.FullName} (${candidate.CandidateCode})`;
      case 'Hired':
        return `Xác nhận trúng tuyển & Onboarding: ${candidate.FullName} (${candidate.CandidateCode})`;
      case 'Rejected':
        return `Thông báo từ chối ứng viên: ${candidate.FullName} (${candidate.CandidateCode})`;
      default:
        return `Hồ sơ ứng viên: ${candidate.FullName} (${candidate.CandidateCode})`;
    }
  };

  return (
    <>
      <div className="modal-wrap" onClick={onClose} style={{ zIndex: 1000 }}>
        <div className="modal" style={{ maxWidth: '750px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
          <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} style={{ color: currentStageObj.color || '#0f766e' }} />
              <h3>{getModalTitle()}</h3>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="modal-b" style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              {errorMsg && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isEdit ? (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <b style={{ fontSize: '15px', color: '#0f172a' }}>{formData.FullName}</b>
                      <code style={{ fontSize: '12px', color: '#0f766e', fontWeight: 700, background: '#ccfbf1', padding: '2px 6px', borderRadius: '4px' }}>
                        {formData.CandidateCode}
                      </code>
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: currentStageObj.bg,
                        color: currentStageObj.color,
                        border: `1px solid ${currentStageObj.color}40`
                      }}>
                        {currentStageObj.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {formData.CvUrl && (
                        isPdfUrl(formData.CvUrl) ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn pri"
                              onClick={() => setIsPdfModalOpen(true)}
                              style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Xem file PDF trực tiếp trên giao diện"
                            >
                              <FileText size={13} />
                              <span>Xem PDF trực tiếp</span>
                            </button>
                            <a
                              href={formData.CvUrl}
                              download={`CV_${formData.FullName.replace(/\s+/g, '_')}.pdf`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn"
                              style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Tải file PDF về máy tính"
                            >
                              <Download size={13} />
                              <span>Tải về</span>
                            </a>
                          </div>
                        ) : (
                          <a
                            href={formData.CvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn"
                            style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Mở link hồ sơ trực tuyến"
                          >
                            <ExternalLink size={13} />
                            <span>Mở link CV</span>
                          </a>
                        )
                      )}

                      <select
                        value={formData.Stage}
                        onChange={(e) => handleStageChange(e.target.value)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontWeight: 600
                        }}
                        title="Chuyển sang giai đoạn khác"
                      >
                        {activeStages.map(s => (
                          <option key={s.key} value={s.key}>
                            Chuyển sang: {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                    <div><b>Vị trí tuyển dụng:</b> <span style={{ color: '#0f766e', fontWeight: 600 }}>{selectedJob?.JobTitle || candidate?.JobTitle || 'Chưa xác định'}</span></div>
                    {formData.Phone && <div><b>SĐT:</b> {formData.Phone}</div>}
                    {formData.Email && <div><b>Email:</b> <span style={{ color: '#0f172a', fontWeight: 600 }}>{formData.Email}</span></div>}
                    {formData.AppliedDate && <div><b>Nộp ngày:</b> {formData.AppliedDate}</div>}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Thông tin ứng viên mới
                  </div>
                  <div className="form">
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

                    <label className="field">
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

                    <div className="field" style={{ gridColumn: 'span 2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span>Hồ sơ CV ứng tuyển:</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setCvMode('file')}
                            style={{
                              padding: '2px 8px',
                              fontSize: '11px',
                              borderRadius: '4px',
                              border: cvMode === 'file' ? '1px solid #0f766e' : '1px solid #cbd5e1',
                              background: cvMode === 'file' ? '#f0fdfa' : '#ffffff',
                              color: cvMode === 'file' ? '#0f766e' : '#64748b',
                              fontWeight: cvMode === 'file' ? 700 : 500,
                              cursor: 'pointer'
                            }}
                          >
                            Tải file PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => setCvMode('link')}
                            style={{
                              padding: '2px 8px',
                              fontSize: '11px',
                              borderRadius: '4px',
                              border: cvMode === 'link' ? '1px solid #0f766e' : '1px solid #cbd5e1',
                              background: cvMode === 'link' ? '#f0fdfa' : '#ffffff',
                              color: cvMode === 'link' ? '#0f766e' : '#64748b',
                              fontWeight: cvMode === 'link' ? 700 : 500,
                              cursor: 'pointer'
                            }}
                          >
                            Nhập link trực tuyến
                          </button>
                        </div>
                      </div>

                      {cvMode === 'file' ? (
                        <div style={{
                          border: '1.5px dashed #cbd5e1',
                          borderRadius: '8px',
                          padding: '14px',
                          background: '#f8fafc',
                          textAlign: 'center'
                        }}>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            id="cvFileUpload"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                          />
                          <label htmlFor="cvFileUpload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <UploadCloud size={24} style={{ color: '#0f766e' }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                              {cvUploading ? 'Đang tải file PDF lên...' : cvFile ? `Đã chọn: ${cvFile.name}` : 'Nhấn để chọn file PDF từ máy tính'}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Chấp nhận định dạng file PDF (Tối đa 15MB)</span>
                          </label>
                          {formData.CvUrl && (
                            <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#16a34a', fontWeight: 600 }}>
                              ✓ Đã lưu trữ file thành công trên hệ thống
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          name="CvUrl"
                          className="inp"
                          placeholder="https://drive.google.com/file/d/..."
                          value={formData.CvUrl}
                          onChange={handleChange}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {formData.Stage === 'Interviewing' && (
                <div style={{
                  background: '#f0fdfa',
                  border: '1.5px solid #99f6e4',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>
                    <Calendar size={18} />
                    <span>Lịch phỏng vấn & Gửi thư mời</span>
                  </div>

                  <div className="form">
                    <label className="field">
                      <span>Người phỏng vấn phụ trách: <i className="req">*</i></span>
                      <select
                        name="InterviewerEmployeeId"
                        className="inp"
                        value={formData.InterviewerEmployeeId}
                        onChange={handleChange}
                      >
                        <option value="">-- Chọn nhân sự phỏng vấn --</option>
                        {employees.map(e => (
                          <option key={e.EmployeeId || e.id} value={e.EmployeeId || e.id}>
                            {e.FullName || e.name} ({e.EmployeeCode || e.id} - {e.DepartmentName || e.department || 'HR'})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Ngày và giờ phỏng vấn: <i className="req">*</i></span>
                      <input
                        type="datetime-local"
                        name="InterviewDateTime"
                        className="inp"
                        value={formData.InterviewDateTime}
                        onChange={handleChange}
                      />
                    </label>

                    <label className="field" style={{ gridColumn: 'span 2' }}>
                      <span>Địa điểm / Hình thức phỏng vấn:</span>
                      <input
                        name="InterviewLocation"
                        className="inp"
                        placeholder="VD: Phòng họp 302, Tòa nhà Enterprise (hoặc link Google Meet / Zoom)"
                        value={formData.InterviewLocation}
                        onChange={handleChange}
                      />
                    </label>

                    <div className="field">
                      <span>Đánh giá kết quả phỏng vấn (1-5 sao):</span>
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
                            <Star size={20} fill={score <= formData.RatingScore ? '#f59e0b' : 'none'} />
                          </button>
                        ))}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginLeft: '6px' }}>
                          {formData.RatingScore}/5 sao
                        </span>
                      </div>
                    </div>

                    <label className="field">
                      <span>Ghi chú sau phỏng vấn:</span>
                      <input
                        name="Note"
                        className="inp"
                        placeholder="Ghi nhận kiến thức chuyên môn, tác phong..."
                        value={formData.Note}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn pri"
                      onClick={() => handleSendEmail('interview')}
                      disabled={emailSending}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontWeight: 600 }}
                    >
                      {emailSending ? <RefreshCw size={15} className="spin" /> : <Mail size={15} />}
                      <span>{emailSending ? 'Đang gửi qua Gmail...' : 'Gửi thư mời phỏng vấn qua Gmail'}</span>
                    </button>
                  </div>

                  {emailSending && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0f766e' }}>
                      <RefreshCw size={15} className="spin" />
                      <span>Đang kết nối hệ thống gửi thư đến: <b>{formData.Email}</b>...</span>
                    </div>
                  )}

                  {emailStatus && (
                    <div style={{
                      marginTop: '10px',
                      padding: '12px 14px',
                      background: emailStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                      border: `1.5px solid ${emailStatus.type === 'success' ? '#86efac' : '#fecaca'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      {emailStatus.type === 'success' ? (
                        <CheckCircle2 size={18} style={{ color: '#16a34a', marginTop: '1px', flexShrink: 0 }} />
                      ) : (
                        <AlertCircle size={18} style={{ color: '#dc2626', marginTop: '1px', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: emailStatus.type === 'success' ? '#15803d' : '#dc2626' }}>
                          {emailStatus.type === 'success' ? 'Trạng thái: Gửi email thành công!' : 'Trạng thái: Gửi email thất bại!'}
                        </div>
                        <div style={{ fontSize: '12.5px', color: emailStatus.type === 'success' ? '#166534' : '#991b1b', marginTop: '2px', lineHeight: 1.4 }}>
                          {emailStatus.message}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formData.Stage === 'Offered' && (
                <div style={{
                  background: '#ecfdf5',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>
                    <DollarSign size={18} />
                    <span>Chức năng đề nghị mức lương (Job Offer)</span>
                  </div>

                  <div className="form">
                    <label className="field" style={{ gridColumn: 'span 2' }}>
                      <span>Đề nghị mức lương chính thức (Gross VNĐ / tháng): <i className="req">*</i></span>
                      <input
                        type="number"
                        name="OfferedSalary"
                        className="inp"
                        placeholder="VD: 25000000"
                        value={formData.OfferedSalary}
                        onChange={handleChange}
                        style={{ fontWeight: 700, color: '#059669', fontSize: '15px' }}
                      />
                      {formData.OfferedSalary ? (
                        <div style={{ fontSize: '12.5px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                          Số tiền hiển thị: {Number(formData.OfferedSalary).toLocaleString('vi-VN')} VNĐ / tháng
                        </div>
                      ) : null}
                    </label>

                    <label className="field" style={{ gridColumn: 'span 2' }}>
                      <span>Ghi chú thỏa thuận lương / Chế độ đãi ngộ:</span>
                      <textarea
                        name="Note"
                        className="inp"
                        rows={2}
                        placeholder="Thưởng hiệu quả, thời gian thử việc, quyền lợi bảo hiểm..."
                        value={formData.Note}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn pri"
                      onClick={() => handleSendEmail('offer')}
                      disabled={emailSending}
                      style={{ background: '#059669', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontWeight: 600 }}
                    >
                      {emailSending ? <RefreshCw size={15} className="spin" /> : <Mail size={15} />}
                      <span>{emailSending ? 'Đang gửi qua Gmail...' : 'Gửi thư mời nhận việc (Offer) qua Gmail'}</span>
                    </button>
                  </div>

                  {emailSending && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#059669' }}>
                      <RefreshCw size={15} className="spin" />
                      <span>Đang kết nối hệ thống gửi Offer Letter đến: <b>{formData.Email}</b>...</span>
                    </div>
                  )}

                  {emailStatus && (
                    <div style={{
                      marginTop: '10px',
                      padding: '12px 14px',
                      background: emailStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                      border: `1.5px solid ${emailStatus.type === 'success' ? '#86efac' : '#fecaca'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      {emailStatus.type === 'success' ? (
                        <CheckCircle2 size={18} style={{ color: '#16a34a', marginTop: '1px', flexShrink: 0 }} />
                      ) : (
                        <AlertCircle size={18} style={{ color: '#dc2626', marginTop: '1px', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: emailStatus.type === 'success' ? '#15803d' : '#dc2626' }}>
                          {emailStatus.type === 'success' ? 'Trạng thái: Gửi email thành công!' : 'Trạng thái: Gửi email thất bại!'}
                        </div>
                        <div style={{ fontSize: '12.5px', color: emailStatus.type === 'success' ? '#166534' : '#991b1b', marginTop: '2px', lineHeight: 1.4 }}>
                          {emailStatus.message}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formData.Stage === 'Hired' && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>
                    <Award size={18} />
                    <span>Thông tin tiếp nhận & Đi làm chính thức</span>
                  </div>

                  <div className="form">
                    <label className="field">
                      <span>Ngày đi làm chính thức: <i className="req">*</i></span>
                      <input
                        type="date"
                        name="StartDate"
                        className="inp"
                        value={formData.StartDate}
                        onChange={handleChange}
                        required={formData.Stage === 'Hired'}
                        style={{ fontWeight: 600, color: '#16a34a' }}
                      />
                    </label>

                    <label className="field">
                      <span>Mức lương chính thức áp dụng:</span>
                      <input
                        type="number"
                        name="OfferedSalary"
                        className="inp"
                        placeholder="VD: 25000000"
                        value={formData.OfferedSalary}
                        onChange={handleChange}
                        style={{ fontWeight: 600 }}
                      />
                      {formData.OfferedSalary ? (
                        <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, marginTop: '3px' }}>
                          Lương chốt: {Number(formData.OfferedSalary).toLocaleString('vi-VN')} VNĐ / tháng
                        </span>
                      ) : null}
                    </label>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn pri"
                      onClick={() => handleSendEmail('hired')}
                      disabled={emailSending}
                      style={{ background: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontWeight: 600 }}
                    >
                      {emailSending ? <RefreshCw size={15} className="spin" /> : <Mail size={15} />}
                      <span>{emailSending ? 'Đang gửi qua Gmail...' : 'Gửi thư chúc mừng trúng tuyển qua Gmail'}</span>
                    </button>
                  </div>

                  {emailSending && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#16a34a' }}>
                      <RefreshCw size={15} className="spin" />
                      <span>Đang gửi thư chúc mừng trúng tuyển đến: <b>{formData.Email}</b>...</span>
                    </div>
                  )}

                  {emailStatus && (
                    <div style={{
                      marginTop: '10px',
                      padding: '12px 14px',
                      background: emailStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                      border: `1.5px solid ${emailStatus.type === 'success' ? '#86efac' : '#fecaca'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      {emailStatus.type === 'success' ? (
                        <CheckCircle2 size={18} style={{ color: '#16a34a', marginTop: '1px', flexShrink: 0 }} />
                      ) : (
                        <AlertCircle size={18} style={{ color: '#dc2626', marginTop: '1px', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: emailStatus.type === 'success' ? '#15803d' : '#dc2626' }}>
                          {emailStatus.type === 'success' ? 'Trạng thái: Gửi email thành công!' : 'Trạng thái: Gửi email thất bại!'}
                        </div>
                        <div style={{ fontSize: '12.5px', color: emailStatus.type === 'success' ? '#166534' : '#991b1b', marginTop: '2px', lineHeight: 1.4 }}>
                          {emailStatus.message}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formData.Stage === 'Rejected' && (
                <div style={{
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 700, fontSize: '14px', marginBottom: '10px' }}>
                    <XCircle size={18} />
                    <span>Thông báo kết quả tuyển dụng</span>
                  </div>

                  <div className="form">
                    <label className="field" style={{ gridColumn: 'span 2' }}>
                      <span>Lý do / Ghi chú từ chối:</span>
                      <textarea
                        name="Note"
                        className="inp"
                        rows={2}
                        placeholder="Ghi nhận lý do chưa phù hợp..."
                        value={formData.Note}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  <p style={{ margin: '8px 0 12px', fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
                    Gửi thư cảm ơn và thông báo kết quả đến ứng viên.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => handleSendEmail('rejected')}
                      disabled={emailSending}
                      style={{ borderColor: '#dc2626', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontWeight: 600 }}
                    >
                      {emailSending ? <RefreshCw size={15} className="spin" /> : <Mail size={15} />}
                      <span>{emailSending ? 'Đang gửi qua Gmail...' : 'Gửi thư thông báo kết quả qua Gmail'}</span>
                    </button>
                  </div>

                  {emailSending && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#dc2626' }}>
                      <RefreshCw size={15} className="spin" />
                      <span>Đang gửi thư cảm ơn đến: <b>{formData.Email}</b>...</span>
                    </div>
                  )}

                  {emailStatus && (
                    <div style={{
                      marginTop: '10px',
                      padding: '12px 14px',
                      background: emailStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                      border: `1.5px solid ${emailStatus.type === 'success' ? '#86efac' : '#fecaca'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      {emailStatus.type === 'success' ? (
                        <CheckCircle2 size={18} style={{ color: '#16a34a', marginTop: '1px', flexShrink: 0 }} />
                      ) : (
                        <AlertCircle size={18} style={{ color: '#dc2626', marginTop: '1px', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: emailStatus.type === 'success' ? '#15803d' : '#dc2626' }}>
                          {emailStatus.type === 'success' ? 'Trạng thái: Gửi email thành công!' : 'Trạng thái: Gửi email thất bại!'}
                        </div>
                        <div style={{ fontSize: '12.5px', color: emailStatus.type === 'success' ? '#166534' : '#991b1b', marginTop: '2px', lineHeight: 1.4 }}>
                          {emailStatus.message}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(formData.Stage === 'Applied' || formData.Stage === 'Screening') && isEdit && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>
                    <FileText size={18} style={{ color: currentStageObj.color }} />
                    <span>Đánh giá sơ loại hồ sơ ứng viên</span>
                  </div>

                  <div className="form">
                    <div className="field">
                      <span>Đánh giá sơ bộ năng lực (1-5 sao):</span>
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
                            <Star size={20} fill={score <= formData.RatingScore ? '#f59e0b' : 'none'} />
                          </button>
                        ))}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginLeft: '6px' }}>
                          {formData.RatingScore}/5 sao
                        </span>
                      </div>
                    </div>

                    <label className="field" style={{ gridColumn: 'span 2' }}>
                      <span>Ghi chú / Nhận xét sau sàng lọc CV:</span>
                      <textarea
                        name="Note"
                        className="inp"
                        rows={3}
                        placeholder="Ghi nhận điểm nổi bật trong CV, kinh nghiệm chuyên môn..."
                        value={formData.Note}
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0, padding: '12px 20px', borderTop: '1px solid #e2e8f0' }}>
              <button type="button" className="btn" onClick={onClose} disabled={submitting || emailSending || cvUploading}>
                Đóng
              </button>
              <button type="submit" className="btn pri" disabled={submitting || emailSending || cvUploading}>
                <Save size={15} />
                <span>{submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm mới ứng viên'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfUrl={formData.CvUrl}
        candidateName={formData.FullName}
      />
    </>
  );
}
