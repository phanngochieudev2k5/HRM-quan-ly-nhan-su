import React, { useState } from 'react';
import { Timer, Search, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import EmptyState from '../../common/EmptyState';
import { overtimeRequestsData } from '../../../data/mockData';
import '../../../styles/roles/hr/HrOvertimeView.css';

export default function HrOvertimeView() {
  const [otList, setOtList] = useState(overtimeRequestsData || []);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOt = otList.filter(ot =>
    !searchTerm ||
    (ot.empName && ot.empName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (ot.id && ot.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (ot.project && ot.project.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="hr-overtime-container">
      <div className="ph">
        <div>
          <h1>Quản lý giờ làm thêm (OT) toàn công ty</h1>
          <p>Số giờ OT đã duyệt tự động chuyển sang Bảng lương và Bảng chấm công (Áp dụng miễn thuế TNCN 2026)</p>
        </div>
      </div>

      <div className="tbl-card">
        <div className="tbl-tools">
          <div className="search">
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo mã OT, nhân viên, dự án..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '280px' }}
            />
          </div>
          <span className="grow"></span>
          <span className="small muted">
            Tổng cộng: <strong>{filteredOt.length}</strong> ca tăng ca
          </span>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>MÃ OT</th>
                <th>NHÂN VIÊN</th>
                <th>NGÀY LÀM THÊM</th>
                <th>KHUNG GIỜ</th>
                <th className="c">SỐ GIỜ</th>
                <th className="c">HỆ SỐ LƯƠNG</th>
                <th>DỰ ÁN / LÝ DO</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {filteredOt.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={8}
                  icon={Timer}
                  title="Chưa có ca làm thêm giờ (OT)"
                  description="Danh sách đăng ký làm thêm ngoài giờ toàn công ty sẵn sàng hiển thị khi có dữ liệu backend."
                />
              ) : (
                filteredOt.map((ot) => (
                <tr key={ot.id}>
                  <td><code>{ot.id}</code></td>
                  <td>
                    <div className="who">
                      <div className="avatar">
                        {ot.empName[0]}
                      </div>
                      <div>
                        <b>{ot.empName}</b>
                        <small>{ot.empId}</small>
                      </div>
                    </div>
                  </td>
                  <td>{ot.date}</td>
                  <td>{ot.timeRange}</td>
                  <td className="c"><strong style={{ color: '#0f766e' }}>{ot.hours} giờ</strong></td>
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
    </div>
  );
}
