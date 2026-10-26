import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Download, RefreshCw, FileText } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import EmptyState from '../../common/EmptyState';
import AdminService from '../../../services/AdminService';
import '../../../styles/roles/admin/SystemAuditLogs.css';

export default function SystemAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Lỗi tải audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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
          <p>Ghi vết toàn diện mọi sự kiện đăng nhập, sửa đổi dữ liệu nhân sự, bảng lương và chấm công từ CSDL SQL Server (tblAuditLog)</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
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
              {filteredLogs.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={6}
                  icon={FileText}
                  title="Chưa có nhật ký kiểm toán mới"
                  description="Hệ thống tự động ghi nhật ký khi người dùng đăng nhập, sửa đổi thông tin hoặc thực hiện phân quyền."
                  onRefresh={fetchLogs}
                />
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td><code>{log.id}</code></td>
                    <td>{log.time || log.timestamp || 'Vừa xong'}</td>
                    <td>
                      <b>{log.userName || log.user}</b>
                    </td>
                    <td>{log.action}</td>
                    <td><code>{log.ipAddress || log.ip}</code></td>
                    <td>
                      <StatusBadge status={log.status || 'Thành công'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
