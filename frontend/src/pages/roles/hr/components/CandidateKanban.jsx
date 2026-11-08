import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Plus, RefreshCw, Star, Phone, Mail, FileText,
  Calendar, ExternalLink, ArrowRight, UserCheck, XCircle, MoreVertical, Trash2, Edit2, CheckCircle2,
  Clock, MapPin, Download
} from 'lucide-react';
import HrService from '../../../../services/HrService';
import CandidateModal from './CandidateModal';
import PdfViewerModal from '../../../../components/common/PdfViewerModal';
import EmptyState from '../../../../components/common/EmptyState';

const isPdfUrl = (url) => {
  if (!url) return false;
  const lower = String(url).toLowerCase();
  return lower.endsWith('.pdf') || lower.includes('/uploads/cv/') || lower.includes('.pdf?');
};

export default function CandidateKanban({
  jobs = [],
  employees = [],
  initialJobId = '',
  showToast
}) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || '');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [pdfPreview, setPdfPreview] = useState({ isOpen: false, url: '', name: '' });

  const [draggedCandidateId, setDraggedCandidateId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const stages = [
    { key: 'Applied', label: '1. Ứng tuyển mới', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    { key: 'Screening', label: '2. Lọc hồ sơ', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    { key: 'Interviewing', label: '3. Phỏng vấn', color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
    { key: 'Offered', label: '4. Đề nghị nhận việc', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    { key: 'Hired', label: '5. Trúng tuyển & Onboarding', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
    { key: 'Rejected', label: '6. Từ chối / Loại', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
  ];

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await HrService.getCandidates({
        jobId: selectedJobId,
        search: searchTerm
      });
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Lỗi khi tải danh sách ứng viên!', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedJobId, searchTerm, showToast]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleDragStart = (candidateId, e) => {
    e.dataTransfer.setData('text/plain', String(candidateId));
    setDraggedCandidateId(candidateId);
  };

  const handleDragOver = (stageKey, e) => {
    e.preventDefault();
    setDragOverStage(stageKey);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (targetStage, e) => {
    e.preventDefault();
    setDragOverStage(null);
    const candidateIdStr = e.dataTransfer.getData('text/plain') || draggedCandidateId;
    if (!candidateIdStr) return;

    const candidateId = parseInt(candidateIdStr);
    const targetCandidate = candidates.find(c => c.CandidateId === candidateId);
    if (!targetCandidate || targetCandidate.Stage === targetStage) return;

    if (['Interviewing', 'Offered', 'Hired', 'Rejected'].includes(targetStage)) {
      setEditingCandidate({ ...targetCandidate, Stage: targetStage });
      setIsModalOpen(true);
      return;
    }

    setCandidates(prev => prev.map(c => c.CandidateId === candidateId ? { ...c, Stage: targetStage } : c));

    try {
      await HrService.updateCandidateStage(candidateId, targetStage);
      if (showToast) {
        showToast(`Đã chuyển ứng viên ${targetCandidate.FullName} sang "${targetStage}"`, 'success');
      }
      loadCandidates();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi cập nhật trạng thái ứng viên!', 'error');
      loadCandidates();
    } finally {
      setDraggedCandidateId(null);
    }
  };

  const handleOpenCreate = () => {
    setEditingCandidate(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (candidate, e) => {
    if (e) e.stopPropagation();
    setEditingCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleSaveCandidate = async (candidateData) => {
    try {
      if (editingCandidate?.CandidateId) {
        await HrService.updateCandidate(editingCandidate.CandidateId, candidateData);
        if (showToast) showToast('Cập nhật hồ sơ ứng viên thành công!', 'success');
      } else {
        await HrService.createCandidate(candidateData);
        if (showToast) showToast('Thêm mới ứng viên thành công!', 'success');
      }
      loadCandidates();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi lưu ứng viên!', 'error');
      throw err;
    }
  };

  const handleDeleteCandidate = async (candidate, e) => {
    e.stopPropagation();
    if (window.confirm(`Xác nhận xóa ứng viên ${candidate.FullName} (${candidate.CandidateCode})?`)) {
      try {
        await HrService.deleteCandidate(candidate.CandidateId);
        if (showToast) showToast(`Đã xóa ứng viên ${candidate.FullName}!`, 'success');
        loadCandidates();
      } catch (err) {
        if (showToast) showToast(err.message || 'Lỗi khi xóa ứng viên!', 'error');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="ph" style={{ marginBottom: 0 }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, color: '#042f2e' }}>
            Quy trình tuyển dụng ứng viên - Pipeline Kanban
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
            Theo dõi ứng viên qua từng giai đoạn tuyển dụng: Sàng lọc, Phỏng vấn, Đề xuất mức lương và Trúng tuyển Onboarding
          </p>
        </div>

        <div className="ph-tools">
          <button className="btn" onClick={() => loadCandidates()} title="Làm mới danh sách ứng viên">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          <button className="btn pri" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Tiếp nhận ứng viên mới</span>
          </button>
        </div>
      </div>

      <div className="tbl-card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className="search" style={{ minWidth: '260px' }}>
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo tên ứng viên, mã UV, SĐT, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <select
            className="inp"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            style={{ width: 'auto', minWidth: '240px' }}
          >
            <option value="">Tất cả vị trí tuyển dụng</option>
            {jobs.map((j) => (
              <option key={j.JobId} value={j.JobId}>
                {j.JobTitle}
              </option>
            ))}
          </select>

          <span className="grow"></span>

          <span className="small muted">
            Tổng cộng: <strong>{candidates.length}</strong> ứng viên trong quy trình
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(260px, 1fr))',
          gap: '14px',
          alignItems: 'start',
          overflowX: 'auto',
          paddingBottom: '16px'
        }}
      >
        {stages.map((stage) => {
          const stageCandidates = candidates.filter(c => c.Stage === stage.key);
          const isOver = dragOverStage === stage.key;

          return (
            <div
              key={stage.key}
              onDragOver={(e) => handleDragOver(stage.key, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(stage.key, e)}
              style={{
                background: isOver ? '#ecfdf5' : '#f8fafc',
                borderRadius: '12px',
                border: isOver ? `2px dashed ${stage.color}` : `1px solid #e2e8f0`,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                minHeight: '480px',
                transition: 'all 0.15s ease'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 4px 10px',
                  borderBottom: `2px solid ${stage.color}`
                }}
              >
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                  {stage.label}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: stage.bg,
                    color: stage.color,
                    border: `1px solid ${stage.border}`
                  }}
                >
                  {stageCandidates.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stageCandidates.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '36px 12px',
                      color: '#94a3b8',
                      fontSize: '12.5px',
                      fontStyle: 'italic',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '8px'
                    }}
                  >
                    Kéo thả ứng viên vào đây
                  </div>
                ) : (
                  stageCandidates.map((c) => (
                    <div
                      key={c.CandidateId}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(c.CandidateId, e)}
                      onClick={() => handleOpenEdit(c)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '14px',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                        cursor: 'grab',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = stage.color;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.05)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <b style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                            {c.FullName}
                          </b>
                          <code style={{ fontSize: '11.5px', color: '#0f766e', fontWeight: 700 }}>
                            {c.CandidateCode}
                          </code>
                        </div>

                        {c.RatingScore ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }} title={`Đánh giá: ${c.RatingScore}/5 sao`}>
                            <Star size={13} fill="#f59e0b" />
                            <span style={{ fontSize: '12px', fontWeight: 700 }}>{c.RatingScore}</span>
                          </div>
                        ) : null}
                      </div>

                      <div style={{ fontSize: '12.5px', color: '#0f766e', fontWeight: 600 }}>
                        {c.JobTitle || 'Vị trí chuyên môn'}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                        {c.Phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={12} style={{ color: '#94a3b8' }} />
                            <span>{c.Phone}</span>
                          </div>
                        )}
                        {c.Email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={12} style={{ color: '#94a3b8' }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.Email}</span>
                          </div>
                        )}
                        {c.AppliedDate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={12} style={{ color: '#94a3b8' }} />
                            <span>Nộp: {c.AppliedDate}</span>
                          </div>
                        )}
                      </div>

                      {c.Stage === 'Interviewing' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {c.InterviewerName && (
                            <div style={{ fontSize: '11.5px', color: '#0284c7', background: '#e0f2fe', padding: '3px 6px', borderRadius: '4px' }}>
                              Phỏng vấn: <strong>{c.InterviewerName}</strong>
                            </div>
                          )}
                          {c.InterviewDateTime && (
                            <div style={{ fontSize: '11px', color: '#0f766e', background: '#ccfbf1', padding: '3px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={11} />
                              <span>{new Date(c.InterviewDateTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                          )}
                          {c.InterviewLocation && (
                            <div style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={11} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.InterviewLocation}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {c.Stage === 'Offered' && c.OfferedSalary && (
                        <div style={{ fontSize: '11.5px', color: '#059669', background: '#d1fae5', padding: '3px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          💰 Lương đề xuất: {Number(c.OfferedSalary).toLocaleString('vi-VN')} VNĐ
                        </div>
                      )}

                      {c.Stage === 'Hired' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {c.StartDate && (
                            <div style={{ fontSize: '11.5px', color: '#16a34a', background: '#dcfce7', padding: '3px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              📅 Đi làm: {c.StartDate}
                            </div>
                          )}
                          {c.OfferedSalary && (
                            <div style={{ fontSize: '11px', color: '#15803d', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>
                              💰 Lương: {Number(c.OfferedSalary).toLocaleString('vi-VN')} VNĐ
                            </div>
                          )}
                        </div>
                      )}

                      {c.Note && (
                        <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#475569', fontStyle: 'italic', background: '#f8fafc', padding: '4px 6px', borderRadius: '4px' }}>
                          "{c.Note}"
                        </p>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '6px',
                          paddingTop: '8px',
                          borderTop: '1px solid #f1f5f9'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.CvUrl ? (
                          isPdfUrl(c.CvUrl) ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                className="btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPdfPreview({ isOpen: true, url: c.CvUrl, name: c.FullName });
                                }}
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                  color: '#0f766e',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  border: '1px solid #99f6e4',
                                  background: '#f0fdfa'
                                }}
                                title="Xem trực tiếp file PDF không cần tải về"
                              >
                                <FileText size={11} />
                                <span>Xem PDF</span>
                              </button>
                              <a
                                href={c.CvUrl}
                                download={`CV_${c.FullName.replace(/\s+/g, '_')}.pdf`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{ color: '#64748b', padding: '2px 4px', display: 'flex', alignItems: 'center' }}
                                title="Tải file PDF về máy"
                              >
                                <Download size={12} />
                              </a>
                            </div>
                          ) : (
                            <a
                              href={c.CvUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11.5px',
                                color: '#0f766e',
                                fontWeight: 600
                              }}
                              title="Mở link hồ sơ trực tuyến"
                            >
                              <ExternalLink size={12} />
                              <span>Mở link CV</span>
                            </a>
                          )
                        ) : (
                          <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Chưa có link CV</span>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {['Interviewing', 'Offered', 'Hired', 'Rejected'].includes(c.Stage) && (
                            <button
                              className="ibtn"
                              title={
                                c.Stage === 'Interviewing' ? 'Gửi thư mời phỏng vấn qua Gmail' :
                                c.Stage === 'Offered' ? 'Gửi thư mời nhận việc (Offer) qua Gmail' :
                                c.Stage === 'Hired' ? 'Gửi thư chúc mừng trúng tuyển qua Gmail' :
                                'Gửi thư cảm ơn & từ chối qua Gmail'
                              }
                              onClick={(e) => handleOpenEdit(c, e)}
                            >
                              <Mail size={13} style={{ color: stage.color }} />
                            </button>
                          )}
                          <button
                            className="ibtn"
                            title="Chỉnh sửa / Đánh giá ứng viên"
                            onClick={(e) => handleOpenEdit(c, e)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="ibtn del"
                            title="Xóa ứng viên"
                            onClick={(e) => handleDeleteCandidate(c, e)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CandidateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCandidate}
        candidate={editingCandidate}
        jobs={jobs}
        employees={employees}
        stages={stages}
      />

      <PdfViewerModal
        isOpen={pdfPreview.isOpen}
        onClose={() => setPdfPreview({ isOpen: false, url: '', name: '' })}
        pdfUrl={pdfPreview.url}
        candidateName={pdfPreview.name}
      />
    </div>
  );
}
