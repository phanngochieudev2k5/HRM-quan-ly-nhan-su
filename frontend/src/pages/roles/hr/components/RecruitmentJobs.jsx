import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Search, Plus, RefreshCw, CheckCircle2,
  Edit2, Trash2, Users, Calendar, Building2, Archive
} from 'lucide-react';
import HrService from '../../../../services/HrService';
import JobModal from './JobModal';
import EmptyState from '../../../../components/common/EmptyState';

export default function RecruitmentJobs({
  departments = [],
  onNavigateCandidates,
  showToast
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await HrService.getRecruitmentJobs({
        search: searchTerm,
        departmentId: departmentFilter,
        status: statusFilter
      });
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Lỗi khi tải danh sách vị trí tuyển dụng!', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, departmentFilter, statusFilter, showToast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const openCount = jobs.filter(j => j.Status !== 'Closed' && j.Status !== 'Rejected').length;
  const closedCount = jobs.filter(j => j.Status === 'Closed' || j.Status === 'Rejected').length;
  const totalTargetQuantity = jobs.reduce((sum, j) => sum + (j.TargetQuantity || 0), 0);
  const totalAppliedCount = jobs.reduce((sum, j) => sum + (j.AppliedCount || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Closed':
      case 'Rejected':
        return <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>Đã đóng (Đủ chỉ tiêu)</span>;
      case 'Approved':
      default:
        return <span className="badge b-green">Đang mở tuyển</span>;
    }
  };

  const handleOpenCreate = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job, e) => {
    e.stopPropagation();
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleSaveJob = async (jobData) => {
    try {
      if (editingJob?.JobId) {
        await HrService.updateRecruitmentJob(editingJob.JobId, jobData);
        if (showToast) showToast('Cập nhật vị trí tuyển dụng thành công!', 'success');
      } else {
        await HrService.createRecruitmentJob(jobData);
        if (showToast) showToast('Tạo mới đề xuất tuyển dụng thành công!', 'success');
      }
      loadJobs();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi lưu vị trí tuyển dụng!', 'error');
      throw err;
    }
  };

  const handleDeleteJob = async (job, e) => {
    e.stopPropagation();
    if (window.confirm(`Xác nhận xóa vị trí tuyển dụng "${job.JobTitle}" khỏi hệ thống?`)) {
      try {
        await HrService.deleteRecruitmentJob(job.JobId);
        if (showToast) showToast(`Đã xóa vị trí "${job.JobTitle}" thành công!`, 'success');
        loadJobs();
      } catch (err) {
        if (showToast) showToast(err.message || 'Lỗi khi xóa vị trí tuyển dụng!', 'error');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="ph" style={{ marginBottom: 0 }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, color: '#042f2e' }}>
            Quản lý nhu cầu & đề xuất tuyển dụng
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
            Quản lý vị trí tuyển dụng theo phòng ban, mở tuyển trực tiếp và theo dõi tiến độ tuyển dụng
          </p>
        </div>

        <div className="ph-tools">
          <button className="btn" onClick={() => loadJobs()} title="Làm mới danh sách">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          <button className="btn pri" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Tạo đề xuất tuyển dụng mới</span>
          </button>
        </div>
      </div>

      <div className="grid c4" style={{ marginBottom: '2px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              TỔNG VỊ TRÍ TUYỂN DỤNG
            </span>
            <Briefcase size={18} style={{ color: '#0f766e' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#042f2e', marginTop: '8px' }}>
            {jobs.length} <small style={{ fontSize: '12px', fontWeight: 400, color: '#64748b' }}>vị trí</small>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Tổng chỉ tiêu: <strong>{totalTargetQuantity}</strong> nhân sự
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', textTransform: 'uppercase' }}>
              ĐANG MỞ TUYỂN
            </span>
            <CheckCircle2 size={18} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '8px' }}>
            {openCount} <small style={{ fontSize: '12px', fontWeight: 400, color: '#64748b' }}>đang tuyển</small>
          </div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
            Sẵn sàng tiếp nhận hồ sơ CV
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
              ĐÃ ĐÓNG / ĐỦ CHỈ TIÊU
            </span>
            <Archive size={18} style={{ color: '#475569' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#475569', marginTop: '8px' }}>
            {closedCount} <small style={{ fontSize: '12px', fontWeight: 400, color: '#64748b' }}>vị trí</small>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Đã hoàn tất hoặc ngừng tuyển
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase' }}>
              HỒ SƠ CV ĐÃ NHẬN
            </span>
            <Users size={18} style={{ color: '#0284c7' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', marginTop: '8px' }}>
            {totalAppliedCount} <small style={{ fontSize: '12px', fontWeight: 400, color: '#64748b' }}>hồ sơ</small>
          </div>
          <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '4px' }}>
            Tổng ứng viên các vị trí
          </div>
        </div>
      </div>

      <div className="tbl-card">
        <div className="tbl-tools" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="search" style={{ minWidth: '260px' }}>
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo vị trí, mô tả công việc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <select
            className="inp"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((d) => (
              <option key={d.DepartmentId} value={d.DepartmentId}>
                {d.DepartmentName}
              </option>
            ))}
          </select>

          <select
            className="inp"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Approved">Đang mở tuyển</option>
            <option value="Closed">Đã đóng / Đủ chỉ tiêu</option>
          </select>

          <span className="grow"></span>

          <span className="small muted">
            Hiển thị <strong>{jobs.length}</strong> vị trí tuyển dụng
          </span>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>VỊ TRÍ TUYỂN DỤNG</th>
                <th>PHÒNG BAN</th>
                <th className="c">CHỈ TIÊU</th>
                <th className="c">HỒ SƠ CV</th>
                <th>DẢI LƯƠNG ĐỀ XUẤT</th>
                <th>HẠN CHÓT</th>
                <th>TRẠNG THÁI</th>
                <th className="act">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div className="status-dot-pulse" style={{ background: '#0f766e' }}></div>
                      <span>Đang tải danh sách vị trí tuyển dụng...</span>
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={8}
                  icon={Briefcase}
                  title="Chưa có đề xuất tuyển dụng nào"
                  description="Bấm 'Tạo đề xuất tuyển dụng mới' để gửi yêu cầu định biên nhân sự lên hệ thống."
                  actionLabel="Tạo đề xuất mới"
                  onAction={handleOpenCreate}
                />
              ) : (
                jobs.map((job) => (
                  <tr key={job.JobId}>
                    <td>
                      <div>
                        <b style={{ color: '#0f172a', fontSize: '14px', display: 'block' }}>{job.JobTitle}</b>
                        {job.JobDescription && (
                          <small style={{ color: '#64748b', display: 'block', marginTop: '2px', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.JobDescription}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={14} style={{ color: '#0f766e' }} />
                        <span style={{ fontWeight: 500, color: '#334155' }}>{job.DepartmentName || '-'}</span>
                      </div>
                    </td>
                    <td className="c">
                      <strong style={{ color: '#0f766e' }}>{job.TargetQuantity || 1}</strong> người
                    </td>
                    <td className="c">
                      <button
                        className="badge b-blue"
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Xem danh sách ứng viên của vị trí này"
                        onClick={() => onNavigateCandidates && onNavigateCandidates(job.JobId)}
                      >
                        <Users size={12} style={{ marginRight: '4px' }} />
                        {job.AppliedCount || 0} CVs
                      </button>
                    </td>
                    <td>
                      <strong style={{ color: '#042f2e' }}>{job.SalaryRange || 'Thỏa thuận'}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#475569' }}>
                        <Calendar size={13} style={{ color: '#64748b' }} />
                        <span>{job.Deadline || 'Không giới hạn'}</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(job.Status)}</td>
                    <td className="act" onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <button
                          className="ibtn"
                          title="Chỉnh sửa vị trí"
                          onClick={(e) => handleOpenEdit(job, e)}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          className="ibtn del"
                          title="Xóa đề xuất"
                          onClick={(e) => handleDeleteJob(job, e)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveJob}
        job={editingJob}
        departments={departments}
      />
    </div>
  );
}
