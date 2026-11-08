import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Search, MapPin, DollarSign, Calendar, Users,
  CheckCircle, ArrowRight, X, Building2, UploadCloud,
  FileText, Sparkles, Send, ExternalLink, ShieldCheck
} from 'lucide-react';
import HrService from '../../services/HrService';
import '../../styles/public/CareersPage.css';

export default function CareersPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [cvMode, setCvMode] = useState('file');
  const [cvFile, setCvFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    Phone: '',
    CvUrl: '',
    Note: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await HrService.getPublicCareersJobs();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const departments = useMemo(() => {
    const depts = new Set();
    jobs.forEach(j => {
      if (j.DepartmentName) depts.add(j.DepartmentName);
    });
    return Array.from(depts);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchSearch = !search.trim() ||
        job.JobTitle?.toLowerCase().includes(search.trim().toLowerCase()) ||
        job.DepartmentName?.toLowerCase().includes(search.trim().toLowerCase()) ||
        job.JobDescription?.toLowerCase().includes(search.trim().toLowerCase());
      const matchDept = !deptFilter || job.DepartmentName === deptFilter;
      return matchSearch && matchDept;
    });
  }, [jobs, search, deptFilter]);

  const handleOpenDetail = (job) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  const handleOpenApply = (job) => {
    setSelectedJob(job);
    setApplyError('');
    setApplySuccess(false);
    setCvMode('file');
    setCvFile(null);
    setFormData({
      FullName: '',
      Email: '',
      Phone: '',
      CvUrl: '',
      Note: ''
    });
    setIsApplyModalOpen(true);
  };

  const handleSubmitApply = async (e) => {
    e.preventDefault();
    if (!formData.FullName.trim()) {
      setApplyError('Vui lòng nhập họ và tên của bạn!');
      return;
    }
    if (!formData.Email.trim()) {
      setApplyError('Vui lòng nhập email liên hệ!');
      return;
    }
    if (!formData.Phone.trim()) {
      setApplyError('Vui lòng nhập số điện thoại liên hệ!');
      return;
    }

    let finalCvUrl = formData.CvUrl.trim();

    if (cvMode === 'file') {
      if (!cvFile) {
        setApplyError('Vui lòng chọn file PDF CV của bạn để tải lên!');
        return;
      }
    } else {
      if (!finalCvUrl) {
        setApplyError('Vui lòng cung cấp link CV trực tuyến (Google Drive, Dropbox, LinkedIn...)!');
        return;
      }
    }

    try {
      setSubmitting(true);
      setApplyError('');

      if (cvMode === 'file' && cvFile) {
        setUploadingPdf(true);
        const uploadRes = await HrService.uploadPublicCv(cvFile);
        finalCvUrl = uploadRes?.fileUrl || uploadRes?.data?.fileUrl;
        if (!finalCvUrl) {
          throw new Error('Không thể nhận đường dẫn file sau khi tải lên!');
        }
      }

      await HrService.applyPublicCareer({
        JobId: selectedJob.JobId,
        FullName: formData.FullName.trim(),
        Email: formData.Email.trim(),
        Phone: formData.Phone.trim(),
        CvUrl: finalCvUrl,
        Note: formData.Note.trim()
      });
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err.message || 'Không thể gửi hồ sơ ứng tuyển, vui lòng thử lại sau!');
    } finally {
      setSubmitting(false);
      setUploadingPdf(false);
    }
  };

  return (
    <div className="careers-container">
      <header className="careers-hero">
        <div className="careers-hero-inner">
          <div className="careers-badge">
            <Sparkles size={14} />
            <span>Cơ Hội Nghề Nghiệp Hấp Dẫn 2026</span>
          </div>
          <h1 className="careers-title">Gia Nhập Đội Ngũ Nhân Sự Xuất Sắc</h1>
          <p className="careers-subtitle">
            Khám phá các vị trí tuyển dụng mới nhất tại công ty chúng tôi. Môi trường năng động,
            đãi ngộ cạnh tranh, chế độ chăm sóc toàn diện và cơ hội thăng tiến rộng mở.
          </p>
          <div className="careers-hero-actions">
            <button
              className="careers-btn-login"
              onClick={() => navigate('/login')}
            >
              <ShieldCheck size={16} />
              <span>Cổng Thông Tin Nhân Viên</span>
            </button>
          </div>
        </div>
      </header>

      <section className="careers-search-bar">
        <div className="careers-search-card">
          <div className="careers-search-input-wrap">
            <Search size={18} className="careers-search-input-icon" />
            <input
              type="text"
              className="careers-search-input"
              placeholder="Tìm kiếm vị trí, chức danh hoặc từ khóa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              className="careers-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: 'right', fontSize: '13px', color: '#64748b' }}>
            Đang mở: <strong>{filteredJobs.length}</strong> vị trí
          </div>
        </div>
      </section>

      <main className="careers-body">
        <div className="careers-stats-row">
          <div>
            Hiển thị <strong>{filteredJobs.length}</strong> cơ hội nghề nghiệp phù hợp
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '15px' }}>Đang tải danh sách vị trí tuyển dụng...</div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            color: '#64748b'
          }}>
            <Briefcase size={44} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#1e293b', margin: '0 0 8px' }}>Chưa có vị trí tuyển dụng phù hợp</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>Hãy thử thay đổi từ khóa tìm kiếm hoặc lọc phòng ban khác</p>
          </div>
        ) : (
          <div className="careers-grid">
            {filteredJobs.map(job => (
              <div key={job.JobId} className="job-card">
                <div className="job-card-badge">Đang tuyển dụng</div>
                <h3 className="job-card-title">{job.JobTitle}</h3>
                <div className="job-card-dept">
                  <Building2 size={15} />
                  <span>{job.DepartmentName || 'Khối Kỹ Thuật'}</span>
                </div>

                <div className="job-card-meta">
                  <div className="job-card-meta-item">
                    <DollarSign size={15} className="job-card-meta-icon" />
                    <span>Mức lương: <strong>{job.SalaryRange || 'Thỏa thuận theo năng lực'}</strong></span>
                  </div>
                  <div className="job-card-meta-item">
                    <Users size={15} className="job-card-meta-icon" />
                    <span>Chỉ tiêu tuyển: <strong>{job.TargetQuantity} nhân sự</strong></span>
                  </div>
                  <div className="job-card-meta-item">
                    <Calendar size={15} className="job-card-meta-icon" />
                    <span>Hạn nộp hồ sơ: <strong>{job.Deadline ? new Date(job.Deadline).toLocaleDateString('vi-VN') : 'Mở liên tục'}</strong></span>
                  </div>
                </div>

                <p className="job-card-desc">{job.JobDescription || 'Mô tả chi tiết công việc sẽ được trao đổi thêm trong buổi phỏng vấn trực tiếp.'}</p>

                <div className="job-card-actions">
                  <button
                    className="job-btn-detail"
                    onClick={() => handleOpenDetail(job)}
                  >
                    Xem chi tiết
                  </button>
                  <button
                    className="job-btn-apply"
                    onClick={() => handleOpenApply(job)}
                  >
                    <span>Ứng tuyển ngay</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isDetailModalOpen && selectedJob && (
        <div className="careers-modal-backdrop" onClick={() => setIsDetailModalOpen(false)}>
          <div className="careers-modal" onClick={e => e.stopPropagation()}>
            <div className="careers-modal-header">
              <h3 className="careers-modal-title">Chi Tiết Vị Trí Tuyển Dụng</h3>
              <button className="careers-modal-close" onClick={() => setIsDetailModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="careers-modal-body">
              <div>
                <span className="job-card-badge" style={{ marginBottom: '8px' }}>Mã vị trí: {selectedJob.JobCode || `JOB${selectedJob.JobId}`}</span>
                <h2 style={{ fontSize: '22px', margin: '4px 0 8px', color: '#0f172a' }}>{selectedJob.JobTitle}</h2>
                <div style={{ color: '#0f766e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} />
                  <span>Phòng ban: {selectedJob.DepartmentName}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Mức thu nhập</div>
                  <div style={{ fontWeight: 700, color: '#0f766e', marginTop: '2px' }}>{selectedJob.SalaryRange || 'Thỏa thuận'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Chỉ tiêu tuyển dụng</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedJob.TargetQuantity} vị trí</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Hạn chót ứng tuyển</div>
                  <div style={{ fontWeight: 700, color: '#dc2626', marginTop: '2px' }}>
                    {selectedJob.Deadline ? new Date(selectedJob.Deadline).toLocaleDateString('vi-VN') : 'Tuyển liên tục'}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '15px', color: '#1e293b', margin: '0 0 8px' }}>Mô tả công việc & Yêu cầu</h4>
                <div style={{
                  fontSize: '14px',
                  color: '#475569',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line',
                  background: '#ffffff',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  {selectedJob.JobDescription || 'Chưa cập nhật mô tả chi tiết công việc.'}
                </div>
              </div>

              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '14px',
                borderRadius: '8px',
                color: '#166534',
                fontSize: '13px',
                lineHeight: '1.5'
              }}>
                <strong>Quyền lợi được hưởng:</strong> Bảo hiểm theo quy định, tháng lương 13, review lương định kỳ, môi trường làm việc cởi mở, trang thiết bị hiện đại.
              </div>
            </div>
            <div className="careers-modal-footer">
              <button
                className="job-btn-detail"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Đóng lại
              </button>
              <button
                className="job-btn-apply"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenApply(selectedJob);
                }}
              >
                <span>Nộp hồ sơ ngay</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isApplyModalOpen && selectedJob && (
        <div className="careers-modal-backdrop" onClick={() => !submitting && setIsApplyModalOpen(false)}>
          <div className="careers-modal" onClick={e => e.stopPropagation()}>
            <div className="careers-modal-header">
              <h3 className="careers-modal-title">
                {applySuccess ? 'Nộp Hồ Sơ Thành Công' : `Ứng Tuyển: ${selectedJob.JobTitle}`}
              </h3>
              {!submitting && (
                <button className="careers-modal-close" onClick={() => setIsApplyModalOpen(false)}>
                  <X size={20} />
                </button>
              )}
            </div>

            {applySuccess ? (
              <div className="careers-modal-body" style={{ textAlign: 'center', padding: '36px 24px' }}>
                <CheckCircle size={56} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', color: '#0f172a', margin: '0 0 10px' }}>
                  Hồ sơ của bạn đã được tiếp nhận thành công!
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '440px', margin: '0 auto 20px', lineHeight: '1.6' }}>
                  Cảm ơn bạn đã quan tâm đến cơ hội nghề nghiệp tại công ty. Bộ phận Tuyển dụng (HR) sẽ rà soát thông tin và liên hệ phỏng vấn qua Email/SĐT trong vòng 3-5 ngày làm việc.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    className="job-btn-apply"
                    onClick={() => setIsApplyModalOpen(false)}
                  >
                    Hoàn tất
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApply}>
                <div className="careers-modal-body">
                  {applyError && (
                    <div style={{
                      padding: '10px 14px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#dc2626',
                      fontSize: '13.5px'
                    }}>
                      {applyError}
                    </div>
                  )}

                  <div className="careers-form-group">
                    <label className="careers-form-label">
                      Họ và tên ứng viên <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="careers-form-input"
                      placeholder="Nguyễn Văn A"
                      required
                      value={formData.FullName}
                      onChange={e => setFormData({ ...formData, FullName: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="careers-form-group">
                      <label className="careers-form-label">
                        Email liên hệ <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="email"
                        className="careers-form-input"
                        placeholder="example@gmail.com"
                        required
                        value={formData.Email}
                        onChange={e => setFormData({ ...formData, Email: e.target.value })}
                      />
                    </div>
                    <div className="careers-form-group">
                      <label className="careers-form-label">
                        Số điện thoại <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="careers-form-input"
                        placeholder="0912345678"
                        required
                        value={formData.Phone}
                        onChange={e => setFormData({ ...formData, Phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="careers-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="careers-form-label" style={{ margin: 0 }}>
                        Hồ sơ CV ứng tuyển <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setCvMode('file')}
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            border: cvMode === 'file' ? '1.5px solid #0f766e' : '1px solid #cbd5e1',
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
                            padding: '4px 10px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            border: cvMode === 'link' ? '1.5px solid #0f766e' : '1px solid #cbd5e1',
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
                        border: '2px dashed #cbd5e1',
                        borderRadius: '10px',
                        padding: '18px',
                        background: '#f8fafc',
                        textAlign: 'center'
                      }}>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          id="publicCvFileUpload"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
                                setApplyError('Vui lòng chỉ tải lên file có định dạng PDF!');
                                return;
                              }
                              setApplyError('');
                              setCvFile(file);
                            }
                          }}
                        />
                        <label htmlFor="publicCvFileUpload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <UploadCloud size={28} style={{ color: '#0f766e' }} />
                          <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                            {cvFile ? `Đã chọn: ${cvFile.name}` : 'Nhấn để chọn file CV (PDF) từ máy tính'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {cvFile ? `Kích thước: ${(cvFile.size / 1024 / 1024).toFixed(2)} MB` : 'Định dạng .PDF dung lượng tối đa 15MB'}
                          </span>
                        </label>
                        {cvFile && (
                          <div style={{ marginTop: '10px' }}>
                            <button
                              type="button"
                              onClick={() => setCvFile(null)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Hủy chọn file
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <input
                          type="url"
                          className="careers-form-input"
                          placeholder="https://drive.google.com/file/d/... hoặc link LinkedIn, Dropbox"
                          required={cvMode === 'link'}
                          value={formData.CvUrl}
                          onChange={e => setFormData({ ...formData, CvUrl: e.target.value })}
                        />
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                          Vui lòng mở quyền xem công khai (Anyone with link can view) đối với liên kết Google Drive / Dropbox.
                        </span>
                      </>
                    )}
                  </div>

                  <div className="careers-form-group">
                    <label className="careers-form-label">
                      Thư ngỏ / Giới thiệu bản thân & Kinh nghiệm liên quan
                    </label>
                    <textarea
                      className="careers-form-textarea"
                      placeholder="Tóm tắt ngắn gọn năng lực, dự án nổi bật hoặc nguyện vọng nghề nghiệp..."
                      value={formData.Note}
                      onChange={e => setFormData({ ...formData, Note: e.target.value })}
                    />
                  </div>
                </div>

                <div className="careers-modal-footer">
                  <button
                    type="button"
                    className="job-btn-detail"
                    disabled={submitting}
                    onClick={() => setIsApplyModalOpen(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="job-btn-apply"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span>Đang gửi hồ sơ...</span>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Gửi hồ sơ ứng tuyển</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <footer className="careers-footer">
        <div>Enterprise HRM Recruiting Portal &copy; 2026. Mọi quyền được bảo lưu.</div>
      </footer>
    </div>
  );
}

