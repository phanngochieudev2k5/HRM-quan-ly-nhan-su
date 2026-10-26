import React, { useState } from 'react';
import { UserPlus, Shield, Lock, Unlock, Search, Key, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import { userAccountsData } from '../../../data/mockData';
import '../../../styles/roles/admin/UserAccountsView.css';

export default function UserAccountsView() {
  const [accounts, setAccounts] = useState(userAccountsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'Employee',
    password: ''
  });

  const handleToggleLock = (id) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === id) {
        return {
          ...acc,
          status: acc.status === 'Active' ? 'Locked' : 'Active'
        };
      }
      return acc;
    }));
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.name || !formData.email) return;
    const newAcc = {
      id: `ACC0${accounts.length + 1}`,
      username: formData.username,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'Active',
      lastLogin: 'Chưa đăng nhập',
      twoFactor: false
    };
    setAccounts([newAcc, ...accounts]);
    setModalOpen(false);
    setFormData({ username: '', name: '', email: '', role: 'Employee', password: '' });
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'ALL' || acc.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="user-accounts-container">
      <div className="ph">
        <div>
          <h1>Tài khoản đăng nhập & Phân quyền RBAC</h1>
          <p>Quản lý người dùng, mật khẩu, xác thực hai lớp 2FA và quyền hạn truy cập theo vai trò</p>
        </div>
        <div className="ph-tools">
          <button className="btn pri" onClick={() => setModalOpen(true)}>
            <UserPlus size={15} />
            <span>Tạo tài khoản mới</span>
          </button>
        </div>
      </div>

      <div className="tbl-card">
        <div className="tbl-tools">
          <div className="search">
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo tên, username, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '260px' }}
            />
          </div>
          <select
            className="inp"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="Admin">System Admin</option>
            <option value="HR">HR Manager</option>
            <option value="Finance">Finance</option>
            <option value="Manager">Team Manager</option>
            <option value="Employee">Employee</option>
          </select>
          <span className="grow"></span>
          <span className="small muted">
            Tổng: <strong>{filteredAccounts.length}</strong> tài khoản
          </span>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>TÊN ĐĂNG NHẬP</th>
                <th>HỌ VÀ TÊN</th>
                <th>EMAIL</th>
                <th>VAI TRÒ (RBAC)</th>
                <th>2FA BẢO MẬT</th>
                <th>LẦN ĐĂNG NHẬP CUỐI</th>
                <th>TRẠNG THÁI</th>
                <th className="act">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((acc) => (
                <tr key={acc.id}>
                  <td><code>{acc.username}</code></td>
                  <td>
                    <div className="who">
                      <div className="avatar">
                        {acc.name ? acc.name[0] : 'U'}
                      </div>
                      <div>
                        <b>{acc.name}</b>
                        <small>{acc.role}</small>
                      </div>
                    </div>
                  </td>
                  <td>{acc.email}</td>
                  <td>
                    <span className="badge b-p">{acc.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${acc.twoFactor ? 'b-green' : 'b-amber'}`}>
                      {acc.twoFactor ? 'Đã bật 2FA' : 'Chưa bật'}
                    </span>
                  </td>
                  <td>{acc.lastLogin}</td>
                  <td>
                    <StatusBadge status={acc.status} />
                  </td>
                  <td className="act">
                    <button
                      className={`ibtn ${acc.status === 'Active' ? 'del' : ''}`}
                      title={acc.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      onClick={() => handleToggleLock(acc.id)}
                    >
                      {acc.status === 'Active' ? <Lock size={15} /> : <Unlock size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-wrap" onClick={() => setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <h3>Tạo tài khoản người dùng mới</h3>
            </div>
            <form onSubmit={handleCreateAccount}>
              <div className="modal-b">
                <div className="form">
                  <label className="field">
                    <span>Tên đăng nhập (Username): <i className="req">*</i></span>
                    <input
                      className="inp"
                      required
                      placeholder="vd: nguyenvana"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Họ và tên người dùng: <i className="req">*</i></span>
                    <input
                      className="inp"
                      required
                      placeholder="vd: Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Email liên hệ: <i className="req">*</i></span>
                    <input
                      type="email"
                      className="inp"
                      required
                      placeholder="email@company.vn"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Vai trò phân quyền:</span>
                    <select
                      className="inp"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="Employee">Nhân viên (Employee)</option>
                      <option value="Manager">Trưởng bộ phận (Manager)</option>
                      <option value="Finance">Kế toán lương (Finance)</option>
                      <option value="HR">Quản trị nhân sự (HR)</option>
                      <option value="Admin">Quản trị hệ thống (Admin)</option>
                    </select>
                  </label>
                  <label className="field full">
                    <span>Mật khẩu ban đầu:</span>
                    <input
                      type="password"
                      className="inp"
                      required
                      placeholder="Tối thiểu 8 ký tự..."
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </label>
                </div>
              </div>
              <div className="modal-f">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn pri">
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
