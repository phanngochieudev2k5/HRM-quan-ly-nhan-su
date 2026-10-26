import React, { useState } from 'react';
import { CalendarDays, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import StatCard from '../../common/StatCard';
import EmptyState from '../../common/EmptyState';
import { leaveRequestsData } from '../../../data/mockData';
import '../../../styles/roles/employee/MyLeaveView.css';

export default function MyLeaveView() {
  const [myLeaves, setMyLeaves] = useState(leaveRequestsData || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Nghỉ phép năm',
    startDate: '',
    endDate: '',
    days: 1,
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLeave = {
      id: `LP0${Math.floor(100 + Math.random() * 900)}`,
      empId: 'EMP003',
      empName: 'Lê Hoàng Long',
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      days: Number(formData.days),
      reason: formData.reason,
      createdAt: 'Hôm nay',
      approver: 'Trần Thị Bích',
      status: 'Chờ duyệt'
    };
    setMyLeaves([newLeave, ...myLeaves]);
    setModalOpen(false);
    setFormData({ type: 'Nghỉ phép năm', startDate: '', endDate: '', days: 1, reason: '' });
  };

  return (
    <div className="my-leave-container">
      <div className="ph">
        <div>
          <h1>Đơn xin nghỉ phép của tôi</h1>
          <p>Quản lý hạn mức phép năm, nộp đơn xin nghỉ và theo dõi tiến độ phê duyệt từ Trưởng bộ phận</p>
        </div>
        <div className="ph-tools">
          <button className="btn pri" onClick={() => setModalOpen(true)}>
            <Plus size={15} />
            <span>Tạo đơn xin nghỉ</span>
          </button>
        </div>
      </div>

      <div className="grid c3">
        <StatCard
          title="TỔNG PHÉP NĂM CẤP"
          value="12.0"
          unit="ngày"
          subtext="1 ngày phép / tháng làm việc"
          icon={CalendarDays}
          color="#0f766e"
          bg="#ccfbf1"
        />
        <StatCard
          title="ĐÃ NGHỈ HƯỞNG LƯƠNG"
          value="1.0"
          unit="ngày"
          subtext="Đã được duyệt"
          icon={CheckCircle2}
          color="#2563eb"
          bg="#dbeafe"
        />
        <StatCard
          title="SỐ NGÀY PHÉP CÒN LẠI"
          value="11.0"
          unit="ngày"
          subtext="Có giá trị đến hết năm 2026"
          icon={Clock}
          color="#16a34a"
          bg="#dcfce7"
        />
      </div>

      <div className="tbl-card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>MÃ ĐƠN</th>
                <th>LOẠI NGHỈ</th>
                <th>NGÀY BẮT ĐẦU</th>
                <th>NGÀY KẾT THÚC</th>
                <th className="c">SỐ NGÀY</th>
                <th>LÝ DO XIN NGHỈ</th>
                <th>NGƯỜI PHÊ DUYỆT</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={8}
                  icon={CalendarDays}
                  title="Bạn chưa có đơn xin nghỉ phép nào"
                  description="Bấm 'Tạo đơn xin nghỉ' để nộp đơn xin nghỉ phép mới đến cấp trên phê duyệt."
                  actionLabel="Tạo đơn xin nghỉ"
                  onAction={() => setModalOpen(true)}
                />
              ) : (
                myLeaves.map(leave => (
                <tr key={leave.id}>
                  <td><code>{leave.id}</code></td>
                  <td>
                    <span className={`badge ${leave.type.includes('phép') ? 'b-blue' : 'b-amber'}`}>
                      {leave.type}
                    </span>
                  </td>
                  <td>{leave.startDate}</td>
                  <td>{leave.endDate}</td>
                  <td className="c"><strong>{leave.days} ngày</strong></td>
                  <td>{leave.reason}</td>
                  <td>{leave.approver}</td>
                  <td>
                    <StatusBadge status={leave.status} />
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-wrap" onClick={() => setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <h3>Tạo đơn xin nghỉ phép</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-b">
                <div className="form">
                  <label className="field full">
                    <span>Loại nghỉ phép:</span>
                    <select
                      className="inp"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Nghỉ phép năm">Nghỉ phép năm (Có lương - Mã P)</option>
                      <option value="Nghỉ ốm đau">Nghỉ ốm đau hưởng BHXH (Mã O)</option>
                      <option value="Nghỉ không lương">Nghỉ không lương (Mã KP)</option>
                      <option value="Nghỉ việc riêng">Nghỉ việc riêng (Hiếu, hỷ, thai sản)</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Từ ngày:</span>
                    <input
                      type="date"
                      className="inp"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Đến ngày:</span>
                    <input
                      type="date"
                      className="inp"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Số ngày nghỉ thực tế:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      className="inp num"
                      required
                      value={formData.days}
                      onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                    />
                  </label>
                  <label className="field full">
                    <span>Lý do xin nghỉ chi tiết:</span>
                    <textarea
                      className="inp"
                      rows="3"
                      required
                      placeholder="Mô tả công việc bàn giao và lý do xin nghỉ..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </label>
                </div>
              </div>
              <div className="modal-f">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn pri">
                  Gửi đơn xin nghỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
