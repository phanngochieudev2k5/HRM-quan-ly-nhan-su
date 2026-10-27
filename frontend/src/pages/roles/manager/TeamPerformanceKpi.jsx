import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import ConfirmModal from '../../../components/common/ConfirmModal';
import '../../../styles/roles/manager/TeamPerformanceKpi.css';

export default function TeamPerformanceKpi() {
  const [teamKpi, setTeamKpi] = useState([
    { id: 'EMP003', name: 'Lê Hoàng Long', position: 'Backend Developer', period: 'Q1/2026', score: 88.5, rating: 'Tốt (B+)', status: 'Đã đánh giá' },
    { id: 'EMP006', name: 'Đỗ Gia Huy', position: 'Frontend Developer', period: 'Q1/2026', score: 76.0, rating: 'Khá (B)', status: 'Đang đánh giá' }
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [scores, setScores] = useState({ c1: 90, c2: 85, c3: 80, c4: 85 });

  const handleOpenAssess = (member) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  const handleSaveAssessment = () => {
    const totalScore = (scores.c1 * 0.4) + (scores.c2 * 0.3) + (scores.c3 * 0.2) + (scores.c4 * 0.1);
    let rating = 'Xuất sắc (A)';
    if (totalScore < 90) rating = 'Tốt (B+)';
    if (totalScore < 80) rating = 'Khá (B)';
    if (totalScore < 65) rating = 'Trung bình (C)';

    setTeamKpi(teamKpi.map(m => m.id === selectedMember.id ? {
      ...m,
      score: parseFloat(totalScore.toFixed(1)),
      rating,
      status: 'Đã đánh giá'
    } : m));
    setModalOpen(false);
  };

  return (
    <div className="team-kpi-container">
      <PageHeader
        breadcrumb="Quản lý Nhóm / KPI"
        title="Đánh giá Hiệu suất & KPI Nhân sự"
        subtitle="Chấm điểm hiệu suất định kỳ theo tiêu chí chất lượng giao việc, kỷ luật ca làm việc và sáng kiến kỹ thuật"
      />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ tên</th>
                <th>Vị trí</th>
                <th>Kỳ đánh giá</th>
                <th>Điểm tổng kết</th>
                <th>Xếp loại</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {teamKpi.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700, color: 'var(--muted)', fontFamily: 'monospace' }}>{item.id}</td>
                  <td style={{ fontWeight: 700, color: 'var(--ink)' }}>{item.name}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--muted)' }}>{item.position}</td>
                  <td style={{ fontSize: '12.5px' }}>{item.period}</td>
                  <td>
                    <span className="kpi-score-badge">{item.score} / 100</span>
                  </td>
                  <td>
                    <span className="kpi-rating-tag" style={{
                      color: item.rating.startsWith('Xuất sắc') ? '#10b981' : item.rating.startsWith('Tốt') ? 'var(--p)' : '#f59e0b'
                    }}>
                      {item.rating}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={item.status === 'Đã đánh giá' ? 'APPROVED' : 'PENDING'} text={item.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn sm"
                      onClick={() => handleOpenAssess(item)}
                    >
                      <Edit3 size={13} />
                      <span>Chấm điểm</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Chấm điểm KPI cho ${selectedMember?.name} (${selectedMember?.period})`}
        maxWidth="600px"
      >
        <div className="kpi-modal-form">
          <div className="kpi-criterion-row">
            <div className="kpi-criterion-head">
              <span className="kpi-criterion-label">1. Tiến độ & Chất lượng giao việc (Trọng số 40%)</span>
              <span className="kpi-criterion-val">{scores.c1} điểm</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scores.c1}
              onChange={(e) => setScores({ ...scores, c1: Number(e.target.value) })}
            />
          </div>

          <div className="kpi-criterion-row">
            <div className="kpi-criterion-head">
              <span className="kpi-criterion-label">2. Kỷ luật ca làm & Chấp hành nội quy (Trọng số 30%)</span>
              <span className="kpi-criterion-val">{scores.c2} điểm</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scores.c2}
              onChange={(e) => setScores({ ...scores, c2: Number(e.target.value) })}
            />
          </div>

          <div className="kpi-criterion-row">
            <div className="kpi-criterion-head">
              <span className="kpi-criterion-label">3. Tinh thần đồng đội & Hỗ trợ nội bộ (Trọng số 20%)</span>
              <span className="kpi-criterion-val">{scores.c3} điểm</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scores.c3}
              onChange={(e) => setScores({ ...scores, c3: Number(e.target.value) })}
            />
          </div>

          <div className="kpi-criterion-row">
            <div className="kpi-criterion-head">
              <span className="kpi-criterion-label">4. Sáng kiến cải tiến kỹ thuật (Trọng số 10%)</span>
              <span className="kpi-criterion-val">{scores.c4} điểm</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={scores.c4}
              onChange={(e) => setScores({ ...scores, c4: Number(e.target.value) })}
            />
          </div>

          <div className="kpi-summary-box">
            <span className="kpi-summary-title">Tổng điểm tính toán dự kiến:</span>
            <span className="kpi-summary-num">
              {((scores.c1 * 0.4) + (scores.c2 * 0.3) + (scores.c3 * 0.2) + (scores.c4 * 0.1)).toFixed(1)} / 100
            </span>
          </div>

          <div className="kpi-actions-row">
            <button className="btn" onClick={() => setModalOpen(false)}>Hủy</button>
            <button className="btn pri" onClick={handleSaveAssessment}>Lưu kết quả KPI</button>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}
