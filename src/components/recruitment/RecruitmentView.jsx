import React, { useState } from 'react';
import {
  Briefcase, Plus, Users, UserPlus, Filter,
  CheckCircle, Star, Phone, Mail, ChevronRight
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import StatusBadge from '../common/StatusBadge';
import ConfirmModal from '../common/ConfirmModal';
import { recruitmentJobs, candidatesPipeline } from '../../data/mockData';

export default function RecruitmentView({ subModule }) {
  const [activeTab, setActiveTab] = useState(subModule === 'jobs' ? 'jobs' : 'pipeline'); // 'jobs' | 'pipeline'

  React.useEffect(() => {
    if (subModule === 'jobs') setActiveTab('jobs');
    else if (subModule === 'candidates') setActiveTab('pipeline');
  }, [subModule]);
  const [candidates, setCandidates] = useState(candidatesPipeline);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    dept: 'Khối Kỹ Thuật (IT)',
    openCount: 2,
    salaryRange: '20 - 30 Triệu VNĐ',
    deadline: '30/05/2025'
  });

  const stages = [
    { key: 'Applied', label: '1. Ứng tuyển', color: '#64748b' },
    { key: 'Screening', label: '2. Sơ vấn CV', color: '#0284c7' },
    { key: 'Interview', label: '3. Phỏng vấn', color: '#2563eb' },
    { key: 'Evaluation', label: '4. Đánh giá', color: '#d97706' },
    { key: 'Offer', label: '5. Đề nghị việc', color: '#7c3aed' },
    { key: 'Hired', label: '6. Tiếp nhận (Hired)', color: '#16a34a' }
  ];

  const handleAdvanceStage = (candId) => {
    setCandidates(candidates.map(c => {
      if (c.id !== candId) return c;
      const curIndex = stages.findIndex(s => s.key === c.stage);
      if (curIndex < stages.length - 1) {
        return { ...c, stage: stages[curIndex + 1].key };
      }
      return c;
    }));
  };

  return (
    <div>
      <PageHeader
        title="Quản Lý Tuyển Dụng & Phễu Ứng Viên"
        subtitle="Quy trình tuyển chọn nhân sự từ Ứng tuyển → Sơ vấn → Phỏng vấn → Offer → Onboarding"
        breadcrumb="Tuyển dụng / Tổng quan"
        actions={
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Tạo vị trí tuyển dụng mới
          </button>
        }
      />

      {/* Tabs */}
      <div className="hrm-tabs">
        <button
          className={`hrm-tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          <Users size={16} />
          Phễu Tuyển Dụng (Pipeline Board)
        </button>
        <button
          className={`hrm-tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <Briefcase size={16} />
          Vị trí tuyển dụng ({recruitmentJobs.length})
        </button>
      </div>

      {/* Pipeline Board View */}
      {activeTab === 'pipeline' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          overflowX: 'auto',
          paddingBottom: '16px'
        }}>
          {stages.map(stage => {
            const list = candidates.filter(c => c.stage === stage.key);
            return (
              <div
                key={stage.key}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '480px'
                }}
              >
                {/* Stage Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '10px',
                  borderBottom: `2px solid ${stage.color}`,
                  marginBottom: '12px'
                }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                    {stage.label}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1'
                  }}>
                    {list.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {list.map(cand => (
                    <div
                      key={cand.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a' }}>
                        {cand.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 500, marginTop: '2px' }}>
                        {cand.job}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11.5px', color: '#f59e0b' }}>
                        <Star size={12} fill="#f59e0b" />
                        <span>{cand.rating} / 5 điểm</span>
                      </div>

                      <div style={{
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>{cand.date}</span>
                        {stage.key !== 'Hired' && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                            onClick={() => handleAdvanceStage(cand.id)}
                            title="Chuyển sang vòng tiếp theo"
                          >
                            Tiếp <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Jobs Table View */}
      {activeTab === 'jobs' && (
        <div className="hrm-table-container">
          <table className="hrm-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
                <th>Vị trí tuyển dụng</th>
                <th>Phòng ban</th>
                <th>Số lượng</th>
                <th>Hồ sơ đã nhận</th>
                <th>Mức lương đề xuất</th>
                <th>Hạn nộp hồ sơ</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {recruitmentJobs.map((job, idx) => (
                <tr key={job.id}>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{job.title}</td>
                  <td>{job.dept}</td>
                  <td style={{ fontWeight: 600 }}>{job.openCount} chỉ tiêu</td>
                  <td style={{ color: '#2563eb', fontWeight: 600 }}>{job.appliedCount} ứng viên</td>
                  <td>{job.salaryRange}</td>
                  <td>{job.deadline}</td>
                  <td><StatusBadge status={job.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => alert(`Xem chi tiết hồ sơ vị trí ${job.title}`)}>
                      Xem ứng viên
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add Job */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo vị trí tuyển dụng mới"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={() => { alert('Đã đăng vị trí tuyển dụng thành công!'); setIsModalOpen(false); }}>
              Đăng tuyển
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Tên vị trí tuyển dụng <span className="required">*</span></label>
          <input
            type="text"
            className="form-control"
            placeholder="VD: Senior React Native Developer"
            value={newJob.title}
            onChange={e => setNewJob({ ...newJob, title: e.target.value })}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Phòng ban</label>
            <select
              className="form-control"
              value={newJob.dept}
              onChange={e => setNewJob({ ...newJob, dept: e.target.value })}
            >
              <option value="Khối Kỹ Thuật (IT)">Khối Kỹ Thuật (IT)</option>
              <option value="Phòng Nhân sự">Phòng Nhân sự</option>
              <option value="Marketing & Truyền thông">Marketing & Truyền thông</option>
              <option value="Tài chính - Kế toán">Tài chính - Kế toán</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Số lượng tuyển</label>
            <input
              type="number"
              className="form-control"
              value={newJob.openCount}
              onChange={e => setNewJob({ ...newJob, openCount: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Dải lương thỏa thuận</label>
          <input
            type="text"
            className="form-control"
            value={newJob.salaryRange}
            onChange={e => setNewJob({ ...newJob, salaryRange: e.target.value })}
          />
        </div>
      </ConfirmModal>
    </div>
  );
}
