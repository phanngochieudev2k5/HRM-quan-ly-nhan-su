import React, { useState, useEffect } from 'react';
import {
  UserPlus, Shield, Lock, Unlock, Search, Key,
  CheckCircle2, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import AdminService from '../../../services/AdminService';
import AuthService from '../../../services/AuthService';
import '../../../styles/roles/admin/UserAccountsView.css';

export default function UserAccountsView() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'Employee',
    password: ''
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getAccounts();
      const mapped = data.map(u => ({
        id: u.UserId,
        username: u.Username,
        name: u.FullName || u.Username,
        email: u.Email,
        role: u.RoleCode || 'Employee',
        roleTitle: u.RoleName || u.RoleCode,
        status: u.IsLocked ? 'Locked' : 'Active',
        lastLogin: u.LastLoginAt ? new Date(u.LastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập',
        twoFactor: !!u.TwoFactorEnabled,
        empCode: u.EmployeeCode
      }));
      setAccounts(mapped);
    } catch (err) {
      console.error('Lỗi tải danh sách tài khoản:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await AdminService.updateUserRole(userId, newRole);
      setAccounts(prev => prev.map(acc => acc.id === userId ? { ...acc, role: newRole } : acc));
      setNotification(`Đã phân quyền thành công tài khoản sang vai trò ${newRole}!`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert('Không thể cập nhật phân quyền: ' + err.message);
    }
  };

  const handleToggleLock = async (userId) => {
    try {
      const res = await AdminService.toggleUserLock(userId);
      setAccounts(prev => prev.map(acc => {
        if (acc.id === userId) {
          const isLocked = res.isLocked;
          return {
            ...acc,
            status: isLocked ? 'Locked' : 'Active'
          };
        }
        return acc;
      }));
    } catch (err) {
      alert('Không thể thay đổi trạng thái khóa tài khoản: ' + err.message);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.name || !formData.email) return;
    try {

      const res = await AuthService.register({
        username: formData.username,
        password: formData.password || '123456',
        fullName: formData.name,
        email: formData.email
      });
      if (res.success && formData.role !== 'Employee') {
        await AdminService.updateUserRole(res.data.user.id, formData.role);
      }
      setModalOpen(false);
      setFormData({ username: '', name: '', email: '', role: 'Employee', password: '' });
      fetchAccounts();
      setNotification(`Đã tạo tài khoản ${formData.username} thành công với quyền ${formData.role}!`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert('Lỗi tạo tài khoản: ' + err.message);
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchSearch = (acc.name && acc.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (acc.username && acc.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (acc.email && acc.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRole = roleFilter === 'ALL' || acc.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="user-accounts-container">
      <div className="ph">
        <div>
          <h1>Tài khoản đăng nhập & Phân quyền RBAC</h1>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={fetchAccounts} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Làm mới dữ liệu</span>
          </button>
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
                <th>VAI TRÒ (ADMIN ĐỔI QUYỀN)</th>
                <th>2FA BẢO MẬT</th>
                <th>LẦN ĐĂNG NHẬP CUỐI</th>
                <th>TRẠNG THÁI</th>
                <th className="act">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={8}
                  title="Chưa có dữ liệu tài khoản từ máy chủ"
                  description="Bấm 'Làm mới dữ liệu' để tải danh sách người dùng từ SQL Server hoặc 'Tạo tài khoản mới'."
                  actionLabel="Tạo tài khoản mới"
                  onAction={() => setModalOpen(true)}
                  onRefresh={fetchAccounts}
                />
              ) : (
                filteredAccounts.map((acc) => (
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

                      <select
                        className="inp"
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '6px',
                          color: '#0f766e',
                          background: '#f0fdfa',
                          borderColor: '#99f6e4'
                        }}
                        value={acc.role}
                        onChange={(e) => handleRoleChange(acc.id, e.target.value)}
                        title="Admin thay đổi phân quyền vai trò cho tài khoản"
                      >
                        <option value="Employee">Employee (Nhân viên)</option>
                        <option value="HR">HR (Quản trị Nhân sự)</option>
                        <option value="Manager">Manager (Trưởng nhóm)</option>
                        <option value="Finance">Finance (Kế toán)</option>
                        <option value="Admin">Admin (Quản trị hệ thống)</option>
                      </select>
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
                ))
              )}
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
                      placeholder="Tối thiểu 6 ký tự..."
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
