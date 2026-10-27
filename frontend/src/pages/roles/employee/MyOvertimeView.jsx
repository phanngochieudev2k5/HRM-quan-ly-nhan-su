import React, { useState } from 'react';
import { Timer, Plus } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import { overtimeRequestsData } from '../../../data/mockData';
import '../../../styles/roles/employee/MyOvertimeView.css';

export default function MyOvertimeView() {
  const [myOts, setMyOts] = useState(overtimeRequestsData || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    timeRange: '18:00 - 21:00',
    hours: 3,
    multiplier: '1.5x',
    project: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newOt = {
      id: `OT0${Math.floor(100 + Math.random() * 900)}`,
      empId: 'EMP003',
      empName: 'Lê Hoàng Long',
      date: formData.date,
      timeRange: formData.timeRange,
      hours: Number(formData.hours),
      multiplier: formData.multiplier,
      project: formData.project,
      status: 'Chờ duyệt'
    };
    setMyOts([newOt, ...myOts]);
    setModalOpen(false);
    setFormData({ date: '', timeRange: '18:00 - 21:00', hours: 3, multiplier: '1.5x', project: '' });
  };

  return (
    <div className="my-overtime-container">
      <div className="ph">
        <div>
          <h1>Đăng ký làm thêm giờ (Overtime)</h1>
          <p>Yêu cầu làm thêm giờ ngoài giờ làm việc chuẩn để quản lý phê duyệt và chuyển kế toán tính lương</p>
        </div>
        <div className="ph-tools">
          <button className="btn pri" onClick={() => setModalOpen(true)}>
            <Plus size={15} />
            <span>Đăng ký tăng ca</span>
          </button>
        </div>
      </div>

      <div className="tbl-card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>MÃ OT</th>
                <th>NGÀY LÀM THÊM</th>
                <th>KHUNG GIỜ</th>
                <th className="c">SỐ GIỜ</th>
                <th className="c">HỆ SỐ LƯƠNG</th>
                <th>DỰ ÁN / NHIỆM VỤ</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {myOts.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={7}
                  icon={Timer}
                  title="Bạn chưa có đăng ký làm thêm giờ (OT) nào"
                  description="Bấm 'Đăng ký tăng ca' để gửi kế hoạch làm thêm giờ ngoài giờ hành chính."
                  actionLabel="Đăng ký tăng ca"
                  onAction={() => setModalOpen(true)}
                />
              ) : (
                myOts.map(ot => (
                <tr key={ot.id}>
                  <td><code>{ot.id}</code></td>
                  <td>{ot.date}</td>
                  <td>{ot.timeRange}</td>
                  <td className="c"><strong style={{ color: '#0f766e' }}>{ot.hours}h</strong></td>
                  <td className="c"><span className="badge b-p">× {ot.multiplier}</span></td>
                  <td>{ot.project}</td>
                  <td>
                    <StatusBadge status={ot.status} />
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
              <h3>Đăng ký tăng ca (OT)</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-b">
                <div className="form">
                  <label className="field">
                    <span>Ngày làm thêm:</span>
                    <input
                      type="date"
                      className="inp"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Khung giờ dự kiến:</span>
                    <input
                      className="inp"
                      required
                      placeholder="18:00 - 21:00"
                      value={formData.timeRange}
                      onChange={(e) => setFormData({ ...formData, timeRange: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Số giờ tăng ca:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      className="inp num"
                      required
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Hệ số làm thêm:</span>
                    <select
                      className="inp"
                      value={formData.multiplier}
                      onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })}
                    >
                      <option value="1.5x">Ngày thường (150%)</option>
                      <option value="2.0x">Ngày nghỉ tuần (200%)</option>
                      <option value="3.0x">Ngày lễ tết (300%)</option>
                    </select>
                  </label>
                  <label className="field full">
                    <span>Dự án & Nội dung công việc:</span>
                    <textarea
                      className="inp"
                      rows="3"
                      required
                      placeholder="Mô tả công việc cần xử lý ngoài giờ..."
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    />
                  </label>
                </div>
              </div>
              <div className="modal-f">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn pri">
                  Gửi yêu cầu tăng ca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
