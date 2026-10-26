import React, { useState } from 'react';
import { ShieldCheck, Search, Download, Filter } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import { systemAuditLogsData } from '../../../data/mockData';
import '../../../styles/roles/admin/SystemAuditLogs.css';

export default function SystemAuditLogs() {
  const [logs] = useState(systemAuditLogsData);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log =>
    (log.userName && log.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.ipAddress && log.ipAddress.includes(searchTerm)) ||
    (log.ip && log.ip.includes(searchTerm))
  );

  return (
    <div className="system-audit-logs-container">
      <div className="ph">
        <div>
          <h1>Nhật ký kiểm toán an ninh & Thao tác (Audit Logs)</h1>
          <p>Ghi vết toàn diện mọi sự kiện đăng nhập, sửa đổi dữ liệu nhân sự, bảng lương và chấm công</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={() => window.print()}>
            <Download size={15} />
            <span>Kết xuất nhật ký</span>
          </button>
        </div>
      </div>

      <div className="tbl-card">
        <div className="tbl-tools">
          <div className="search">
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo người thực hiện, thao tác, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '320px' }}
            />
          </div>
          <span className="grow"></span>
          <span className="small muted">
            Ghi nhận: <strong>{filteredLogs.length}</strong> sự kiện
          </span>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>MÃ SỰ KIỆN</th>
                <th>THỜI GIAN</th>
                <th>NGƯỜI THỰC HIỆN</th>
                <th>THAO TÁC / HÀNH ĐỘNG</th>
                <th>ĐỊA CHỈ IP</th>
                <th>KẾT QUẢ</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td><code>{log.id}</code></td>
                  <td>{log.time || log.timestamp || '25/04/2026 08:30'}</td>
                  <td>
                    <b>{log.userName || log.user}</b>
                  </td>
                  <td>{log.action}</td>
                  <td><code>{log.ipAddress || log.ip}</code></td>
                  <td>
                    <StatusBadge status={log.status || 'Thành công'} />
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
