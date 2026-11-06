import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Plus, RefreshCw, Star, Phone, Mail, FileText,
  Calendar, ExternalLink, ArrowRight, UserCheck, XCircle, MoreVertical, Trash2, Edit2
} from 'lucide-react';
import HrService from '../../../../services/HrService';
import CandidateModal from './CandidateModal';
import EmptyState from '../../../../components/common/EmptyState';

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

  // Kéo thả Kanban state
  const [draggedCandidateId, setDraggedCandidateId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // 5 cột Pipeline chuẩn theo yêu cầu US-05
  const stages = [
    { key: 'Applied', label: '1. Ứng tuyển mới', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    { key: 'Screening', label: '2. Lọc hồ sơ', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    { key: 'Interviewing', label: '3. Phỏng vấn', color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
    { key: 'Offered', label: '4. Đề nghị nhận việc', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    { key: 'Rejected', label: '5. Từ chối / Loại', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
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
      console.error('Lỗi khi tải danh sách ứng viên:', err);
      if (showToast) showToast('Lỗi khi tải danh sách ứng viên!', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedJobId, searchTerm, showToast]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Kéo thả xử lý HTML5
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

    // Cập nhật Optimistic UI ngay lập tức
    setCandidates(prev => prev.map(c => c.CandidateId === candidateId ? { ...c, Stage: targetStage } : c));

    try {
      await HrService.updateCandidateStage(candidateId, targetStage);
      if (showToast) showToast(`Đã chuyển ứng viên ${targetCandidate.FullName} sang "${targetStage}"`, 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi cập nhật trạng thái ứng viên!', 'error');
      loadCandidates(); // rollback nếu lỗi
    } finally {
      setDraggedCandidateId(null);
    }
  };

  // Nút chuyển cột nhanh không cần kéo thả
  const handleQuickMoveStage = async (candidate, targetStage, e) => {
    e.stopPropagation();
    if (candidate.Stage === targetStage) return;

    setCandidates(prev => prev.map(c => c.CandidateId === candidate.CandidateId ? { ...c, Stage: targetStage } : c));

    try {
      await HrService.updateCandidateStage(candidate.CandidateId, targetStage);
      if (showToast) showToast(`Chuyển ứng viên ${candidate.FullName} sang "${targetStage}"`, 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi cập nhật trạng thái!', 'error');
      loadCandidates();
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
      {/* HEADER SECTION */}
      <div className="ph" style={{ marginBottom: 0 }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, color: '#042f2e' }}>
            Quy trình tuyển dụng ứng viên - Pipeline Kanban (tblCandidate)
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
            Kéo thả ứng viên qua từng giai đoạn tuyển dụng từ tiếp nhận hồ sơ, sàng lọc, phỏng vấn đến gửi Offer
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

      {/* FILTER BAR */}
      <div className="tbl-card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* TÌM KIẾM */}
          <div className="search" style={{ minWidth: '260px' }}>
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo tên ứng viên, mã UV, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* LỌC THEO JOB */}
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

      {/* KANBAN BOARD 5 CỘT GIAI ĐOẠN */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(250px, 1fr))',
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
              {/* HEADER CỘT */}
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

              {/* DANH SÁCH THẺ ỨNG VIÊN */}
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
                      {/* TIÊU ĐỀ CARD */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <b style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                            {c.FullName}
                          </b>
                          <code style={{ fontSize: '11.5px', color: '#0f766e', fontWeight: 700 }}>
                            {c.CandidateCode}
                          </code>
                        </div>

                        {/* RATING SCORE */}
                        {c.RatingScore ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }} title={`Đánh giá: ${c.RatingScore}/5 sao`}>
                            <Star size={13} fill="#f59e0b" />
                            <span style={{ fontSize: '12px', fontWeight: 700 }}>{c.RatingScore}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* VỊ TRÍ ỨNG TUYỂN */}
                      <div style={{ fontSize: '12.5px', color: '#0f766e', fontWeight: 600 }}>
                        {c.JobTitle || 'Vị trí chuyên môn'}
                      </div>

                      {/* LIÊN HỆ */}
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

                      {/* NGƯỜI PHỎNG VẤN */}
                      {c.InterviewerName && (
                        <div style={{ fontSize: '11.5px', color: '#0284c7', background: '#e0f2fe', padding: '3px 6px', borderRadius: '4px' }}>
                          Phỏng vấn: <strong>{c.InterviewerName}</strong>
                        </div>
                      )}

                      {/* GHI CHÚ */}
                      {c.Note && (
                        <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#475569', fontStyle: 'italic', background: '#f8fafc', padding: '4px 6px', borderRadius: '4px' }}>
                          "{c.Note}"
                        </p>
                      )}

                      {/* FOOTER ACTIONS TRÊN CARD */}
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
                          <a
                            href={c.CvUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11.5px',
                              color: '#0f766e',
                              fontWeight: 600
                            }}
                          >
                            <ExternalLink size={12} />
                            <span>Xem CV</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Chưa có link CV</span>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
    </div>
  );
}

