import React, { useState, useEffect } from 'react';
import {
  Users, ShieldAlert, Key, Server, Cpu, Activity,
  UserPlus, Database, ShieldCheck, ArrowRight, Inbox
} from 'lucide-react';
import StatCard from '../../common/StatCard';
import StatusBadge from '../../common/StatusBadge';
import AdminService from '../../../services/AdminService';
import '../../../styles/roles/admin/AdminDashboard.css';

export default function AdminDashboard({ onNavigate }) {
  const [accounts, setAccounts] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accs, auditLogs] = await Promise.all([
          AdminService.getAccounts(),
          AdminService.getAuditLogs()
        ]);
        setAccounts(accs || []);
        setLogs(auditLogs || []);
      } catch (err) {
        console.error('Lỗi tải dữ liệu admin dashboard:', err);
      }
    };
    loadData();
  }, []);

  const activeCount = accounts.filter(a => !a.IsLocked).length;
  const lockedCount = accounts.filter(a => a.IsLocked).length;

  return (
    <div className="admin-dashboard-container">
      <div className="ph">
        <div>
          <h1>Bảng điều khiển quản trị hệ thống (System Admin)</h1>
          <p>Dữ liệu động kết nối trực tiếp CSDL SQL Server (HRM_Enterprise_DB) qua API Backend Node.js</p>
        </div>
        <div className="ph-tools">
          <button className="btn pri" onClick={() => onNavigate('admin-accounts')}>
            <UserPlus size={15} />
            <span>Quản lý tài khoản</span>
          </button>
          <button className="btn" onClick={() => onNavigate('admin-settings')}>
            <span>Cấu hình tham số</span>
          </button>
        </div>
      </div>

      <div className="grid c4">
        <StatCard
          title="TỔNG TÀI KHOẢN RBAC"
          value={accounts.length}
          subtext="Đồng bộ từ CSDL SQL Server"
          icon={Users}
          color="#0f766e"
          bg="#ccfbf1"
        />
        <StatCard
          title="ĐANG HOẠT ĐỘNG"
          value={activeCount}
          subtext="Tài khoản sẵn sàng đăng nhập"
          icon={Activity}
          color="#16a34a"
          bg="#dcfce7"
          trend="+100%"
        />
        <StatCard
          title="TÀI KHOẢN ĐÃ KHÓA"
          value={lockedCount}
          subtext="Thôi việc hoặc khóa an toàn"
          icon={ShieldAlert}
          color="#dc2626"
          bg="#fee2e2"
        />
        <StatCard
          title="MÁY CHỦ CSDL SQL SERVER"
          value="Trực tuyến"
          subtext="CODER\\SQLEXPRESS01"
          icon={Server}
          color="#7c3aed"
          bg="#ede9fe"
        />
      </div>

      <div className="grid c2">
        <div className="card">
          <div className="card-h">
            <h3>Tài nguyên phần cứng & Máy chủ dịch vụ</h3>
          </div>
          <div className="card-b">
            <div className="hb">
              <div className="hb-top">
                <span>CPU Server AI (Intel Xeon 16 Cores)</span>
                <b>24.5% (Ổn định)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '24.5%', background: '#0f766e' }}></i>
              </div>
            </div>
            <div className="hb">
              <div className="hb-top">
                <span>RAM Bộ nhớ (64 GB DDR5)</span>
                <b>38.2% (24.4 GB)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '38.2%', background: '#2563eb' }}></i>
              </div>
            </div>
            <div className="hb">
              <div className="hb-top">
                <span>Dung lượng ổ đĩa NVMe (2 TB)</span>
                <b>18.0% (360 GB)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '18%', background: '#7c3aed' }}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Nhật ký bảo mật & Kiểm toán gần nhất (Audit Logs)</h3>
            <button className="btn sm" onClick={() => onNavigate('admin-logs')}>
              <span>Xem toàn bộ</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-b">
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                <Inbox size={28} style={{ color: '#cbd5e1', marginBottom: '6px' }} />
                <div style={{ fontSize: '13px' }}>Chưa có nhật ký bảo mật mới từ SQL Server.</div>
              </div>
            ) : (
              logs.slice(0, 4).map((log) => {
                const timeStr = log.time || log.timestamp || 'Vừa xong';
                const userName = log.user || log.userName || 'System';
                const ipStr = log.ip || log.ipAddress || '127.0.0.1';
                const displayTime = timeStr.includes(' ') ? timeStr.split(' ')[1] : timeStr;
                return (
                  <div key={log.id} className="tli">
                    <div className="avatar" style={{ background: '#f0fdfa', color: '#0f766e' }}>
                      <ShieldCheck size={16} />
                    </div>
                    <div className="grow">
                      <b>{log.action}</b>
                      <small>{userName} · {ipStr}</small>
                    </div>
                    <div className="v">
                      <span className="badge b-green">{displayTime}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
