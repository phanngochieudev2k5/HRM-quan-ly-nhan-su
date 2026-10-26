import React, { useState } from 'react';
import { CalendarDays, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import EmptyState from '../../common/EmptyState';
import { leaveRequestsData } from '../../../data/mockData';
import '../../../styles/roles/hr/HrLeaveView.css';

export default function HrLeaveView() {
  const [requests, setRequests] = useState(leaveRequestsData || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredRequests = requests.filter(r => {
    const matchSearch = !searchTerm ||
      (r.empName && r.empName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.id && r.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.type && r.type.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApprove = (id) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Đã duyệt' } : r));
  };

  const handleReject = (id) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Đã từ chối' } : r));
  };

  return (
    <div className="hr-leave-container">
      <div className="ph">
        <div>
          <h1>Quản lý đơn nghỉ phép toàn công ty</h1>
          <p>Dữ liệu nghỉ phép được đồng bộ trực tiếp vào Bảng chấm công (P: Phép năm, O: Ốm, KP: Không lương)</p>
        </div>
      </div>

      <div className="tbl-card">
        <div className="tbl-tools">
          <div className="search">
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo mã đơn, nhân viên, loại nghỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '280px' }}
            />
          </div>
          <select
            className="inp"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Đã từ chối">Đã từ chối</option>
          </select>
          <span className="grow"></span>
          <span className="small muted">
            Tổng cộng: <strong>{filteredRequests.length}</strong> đơn
          </span>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>MÃ ĐƠN</th>
                <th>NHÂN VIÊN</th>
                <th>LOẠI NGHỈ</th>
                <th>THỜI GIAN</th>
                <th className="c">SỐ NGÀY</th>
                <th>LÝ DO NGHỈ</th>
                <th>NGƯỜI DUYỆT</th>
                <th>TRẠNG THÁI</th>
                <th className="act">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={9}
                  icon={CalendarDays}
                  title="Chưa có yêu cầu nghỉ phép"
                  description="Danh sách đơn nghỉ phép của nhân sự toàn công ty sẽ hiển thị tại đây khi có dữ liệu từ backend."
                />
              ) : (
                filteredRequests.map((r) => (
                <tr key={r.id}>
                  <td><code>{r.id}</code></td>
                  <td>
                    <div className="who">
                      <div className="avatar">
                        {r.empName[0]}
                      </div>
                      <div>
                        <b>{r.empName}</b>
                        <small>{r.empId}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${r.type.includes('Phép') ? 'b-blue' : r.type.includes('Ốm') ? 'b-amber' : 'b-red'}`}>
                      {r.type}
                    </span>
                  </td>
                  <td>{r.startDate} {r.startDate !== r.endDate ? `đến ${r.endDate}` : ''}</td>
                  <td className="c"><strong>{r.days} ngày</strong></td>
                  <td style={{ maxWidth: '240px', whiteSpace: 'normal', fontSize: '12px' }}>{r.reason}</td>
                  <td>{r.approver}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="act">
                    {r.status === 'Chờ duyệt' && (
                      <div className="row" style={{ justifyContent: 'flex-end', gap: '4px' }}>
                        <button
                          className="btn sm"
                          style={{ color: '#15803d', borderColor: '#bbf7d0', background: '#dcfce7' }}
                          onClick={() => handleApprove(r.id)}
                        >
                          Duyệt
                        </button>
                        <button
                          className="btn sm danger"
                          onClick={() => handleReject(r.id)}
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
