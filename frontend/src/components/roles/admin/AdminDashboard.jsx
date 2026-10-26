import React from 'react';
import {
  Users, ShieldAlert, Key, Server, Cpu, Activity,
  UserPlus, Database, ShieldCheck, ArrowRight
} from 'lucide-react';
import StatCard from '../../common/StatCard';
import StatusBadge from '../../common/StatusBadge';
import { userAccountsData, systemAuditLogsData } from '../../../data/mockData';
import '../../../styles/roles/admin/AdminDashboard.css';

export default function AdminDashboard({ onNavigate }) {
  const activeCount = userAccountsData.filter(a => a.status === 'Active').length;
  const lockedCount = userAccountsData.filter(a => a.status === 'Locked').length;

  return (
    <div className="admin-dashboard-container">
      <div className="ph">
        <div>
          <h1>Bảng điều khiển quản trị hệ thống (System Admin)</h1>
          <p>Giám sát tài khoản người dùng, máy chủ AI OpenCV, phân quyền RBAC và nhật ký bảo mật</p>
        </div>
        <div className="ph-tools">
          <button className="btn pri" onClick={() => onNavigate('admin-accounts')}>
            <UserPlus size={15} />
            <span>Thêm tài khoản</span>
          </button>
          <button className="btn" onClick={() => onNavigate('admin-settings')}>
            <span>Cấu hình tham số</span>
          </button>
        </div>
      </div>

      <div className="grid c4">
        <StatCard
          title="TỔNG TÀI KHOẢN RBAC"
          value={userAccountsData.length}
          subtext="5 nhóm phân quyền vai trò"
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
          title="MÁY CHỦ OPENCV AI"
          value="Trực tuyến"
          subtext="Độ chính xác Face ID 99.4%"
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
            {systemAuditLogsData.slice(0, 4).map((log) => {
              const timeStr = log.time || log.timestamp || '25/04/2026 08:30:00';
              const userName = log.user || log.userName || 'System';
              const ipStr = log.ip || log.ipAddress || '192.168.1.1';
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
