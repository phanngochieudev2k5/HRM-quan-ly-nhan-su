import React, { useState } from 'react';
import { Briefcase, Plus, Users, ArrowRight, Star, Clock } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import { recruitmentJobs, candidatesPipeline } from '../../../data/mockData';
import '../../../styles/roles/hr/HrRecruitmentView.css';

export default function HrRecruitmentView({ subModule = 'jobs', onNavigate }) {
  const [jobs] = useState(recruitmentJobs || []);
  const [candidates] = useState(candidatesPipeline || []);

  const stages = [
    { key: 'Applied', label: 'Ứng tuyển mới', badge: 'b-p' },
    { key: 'Screening', label: 'Lọc hồ sơ', badge: 'b-blue' },
    { key: 'Interview', label: 'Phỏng vấn', badge: 'b-purple' },
    { key: 'Offer', label: 'Gửi Offer', badge: 'b-amber' },
    { key: 'Hired', label: 'Trúng tuyển', badge: 'b-green' }
  ];

  const currentTab = subModule === 'candidates' ? 'candidates' : 'jobs';

  return (
    <div className="hr-recruitment-container">
      <div className="attendance-tabs-header">
        <button
          className={`attendance-tab-btn ${currentTab === 'jobs' ? 'active' : ''}`}
          onClick={() => onNavigate && onNavigate('hr-recruitment', 'jobs')}
        >
          <Briefcase size={16} />
          <span>Vị trí tuyển dụng đang mở</span>
          <span className="badge b-p" style={{ marginLeft: '4px' }}>{jobs.length}</span>
        </button>
        <button
          className={`attendance-tab-btn ${currentTab === 'candidates' ? 'active' : ''}`}
          onClick={() => onNavigate && onNavigate('hr-recruitment', 'candidates')}
        >
          <Users size={16} />
          <span>Pipeline ứng viên (Kanban)</span>
          <span className="badge b-blue" style={{ marginLeft: '4px' }}>{candidates.length}</span>
        </button>
      </div>

      {currentTab === 'candidates' ? (
        <div>
          <div className="ph">
            <div>
              <h1>Quy trình tuyển dụng ứng viên (Kanban Pipeline)</h1>
              <p>Theo dõi tiến trình từ tiếp nhận CV, sàng lọc, phỏng vấn chuyên môn đến gửi thư mời nhận việc</p>
            </div>
          </div>

          <div className="kanban-board-grid">
            {stages.map((stage) => {
              const list = candidates.filter(c => c.stage === stage.key);
              return (
                <div key={stage.key} className="kanban-stage-column">
                  <div className="kanban-stage-header">
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#042f2e' }}>{stage.label}</span>
                    <span className={`badge ${stage.badge}`}>
                      {list.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {list.map(c => (
                      <div key={c.id} className="kanban-candidate-card">
                        <b style={{ fontSize: '13.5px', color: '#1e293b', display: 'block' }}>{c.name}</b>
                        <div style={{ fontSize: '12px', color: '#0f766e', fontWeight: 600, marginTop: '2px' }}>{c.job}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>{c.phone} · {c.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="ph">
            <div>
              <h1>Vị trí tuyển dụng đang mở</h1>
              <p>Kế hoạch định biên nhân sự, hạn nộp hồ sơ và dải lương đề xuất cho ứng viên</p>
            </div>
            <div className="ph-tools">
              <button className="btn pri">
                <Plus size={15} />
                <span>Tạo vị trí tuyển mới</span>
              </button>
            </div>
          </div>

          <div className="tbl-card">
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>VỊ TRÍ TUYỂN DỤNG</th>
                    <th>PHÒNG BAN</th>
                    <th className="c">CHỈ TIÊU</th>
                    <th className="c">HỒ SƠ ỨNG TUYỂN</th>
                    <th>DẢI LƯƠNG ĐỀ XUẤT</th>
                    <th>HẠN NỘP HỒ SƠ</th>
                    <th>TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <EmptyState
                      isTable
                      colSpan={7}
                      icon={Briefcase}
                      title="Chưa có tin tuyển dụng nào đang mở"
                      description="Danh sách vị trí tuyển dụng và chỉ tiêu định biên nhân sự sẵn sàng kết nối API."
                      actionLabel="Tạo vị trí tuyển mới"
                      onAction={() => alert('Mở form tạo vị trí tuyển mới')}
                    />
                  ) : (
                    jobs.map(job => (
                    <tr key={job.id}>
                      <td><b>{job.title}</b></td>
                      <td>{job.dept}</td>
                      <td className="c"><strong>{job.openCount} người</strong></td>
                      <td className="c"><span className="badge b-blue">{job.appliedCount} CVs</span></td>
                      <td><strong>{job.salaryRange}</strong></td>
                      <td>{job.deadline}</td>
                      <td>
                        <StatusBadge status={job.status} />
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
