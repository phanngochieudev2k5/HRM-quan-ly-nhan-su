import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../../common/PageHeader';
import StatusBadge from '../../common/StatusBadge';
import { overtimeRequestsData } from '../../../data/mockData';
import '../../../styles/roles/manager/TeamOvertimeApprovals.css';

export default function TeamOvertimeApprovals() {
  const [otList, setOtList] = useState(overtimeRequestsData);

  const handleAction = (id, newStatus) => {
    setOtList(otList.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  return (
    <div className="team-ot-container">
      <PageHeader
        breadcrumb="Quản lý Nhóm / Tăng ca"
        title="Phê duyệt Kế hoạch Tăng ca (OT)"
        subtitle="Kiểm soát và xét duyệt kế hoạch làm thêm giờ ngoài giờ hành chính của các nhân sự trực thuộc"
      />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Mã OT</th>
                <th>Nhân viên</th>
                <th>Ngày làm việc</th>
                <th>Khung giờ</th>
                <th>Số giờ</th>
                <th>Hệ số lương</th>
                <th>Công việc / Dự án</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {otList.map(ot => (
                <tr key={ot.id}>
                  <td style={{ fontWeight: 700, color: 'var(--muted)', fontFamily: 'monospace' }}>{ot.id}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{ot.empName}</div>
                    <div className="muted small">{ot.empId}</div>
                  </td>
                  <td style={{ fontSize: '12.5px' }}>{ot.date}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--muted)' }}>{ot.timeRange}</td>
                  <td>
                    <span className="ot-hours-tag">{ot.hours}h</span>
                  </td>
                  <td>
                    <span className="ot-mult-badge">x{ot.multiplier}</span>
                  </td>
                  <td>
                    <div className="ot-project-desc">{ot.project}</div>
                  </td>
                  <td>
                    <StatusBadge status={ot.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {ot.status === 'PENDING' ? (
                      <div className="ot-action-group">
                        <button
                          className="btn pri sm"
                          onClick={() => handleAction(ot.id, 'APPROVED')}
                        >
                          <CheckCircle2 size={13} />
                          <span>Duyệt</span>
                        </button>
                        <button
                          className="btn sm"
                          style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() => handleAction(ot.id, 'REJECTED')}
                        >
                          <XCircle size={13} />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    ) : (
                      <span className="muted small">Đã hoàn tất</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
