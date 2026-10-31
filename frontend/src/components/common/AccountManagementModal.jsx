import React, { useState, useEffect } from 'react';
import {
  X, User, Lock, KeyRound, Save, CheckCircle2,
  AlertCircle, Eye, EyeOff, ShieldCheck
} from 'lucide-react';
import AuthService from '../../services/AuthService';

export default function AccountManagementModal({ isOpen, onClose, currentUser, onUserUpdate, onToast }) {
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'Nam',
    birthDate: '',
    address: '',
    idCardNumber: '',
    bankName: '',
    bankAccountNumber: ''
  });

  const [accountInfo, setAccountInfo] = useState({
    username: '',
    roleTitle: '',
    employeeCode: '',
    department: '',
    position: '',
    joinDate: '',
    workStatus: ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      setProfileMsg({ type: '', text: '' });
      setPasswordMsg({ type: '', text: '' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(true);

      AuthService.getMe()
        .then(res => {
          const user = res?.data || currentUser || {};
          setProfileData({
            fullName: user.fullName || user.name || '',
            phone: user.phone || '',
            email: user.email || '',
            gender: user.gender || 'Nam',
            birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
            address: user.address || '',
            idCardNumber: user.idCardNumber || '',
            bankName: user.bankName || '',
            bankAccountNumber: user.bankAccountNumber || ''
          });

          setAccountInfo({
            username: user.username || '',
            roleTitle: user.roleTitle || user.role || 'Người dùng',
            employeeCode: user.employeeCode || '',
            department: user.department || '',
            position: user.position || '',
            joinDate: user.joinDate || '',
            workStatus: user.workStatus || ''
          });
        })
        .catch(() => {
          if (currentUser) {
            setProfileData({
              fullName: currentUser.name || currentUser.fullName || '',
              phone: currentUser.phone || '',
              email: currentUser.email || '',
              gender: currentUser.gender || 'Nam',
              birthDate: currentUser.birthDate ? currentUser.birthDate.slice(0, 10) : '',
              address: currentUser.address || '',
              idCardNumber: currentUser.idCardNumber || '',
              bankName: currentUser.bankName || '',
              bankAccountNumber: currentUser.bankAccountNumber || ''
            });
            setAccountInfo({
              username: currentUser.username || '',
              roleTitle: currentUser.roleTitle || currentUser.role || 'Người dùng',
              employeeCode: currentUser.employeeCode || '',
              department: currentUser.department || '',
              position: currentUser.position || '',
              joinDate: currentUser.joinDate || '',
              workStatus: currentUser.workStatus || ''
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.fullName || !profileData.fullName.trim()) {
      setProfileMsg({ type: 'error', text: 'Vui lòng nhập họ và tên!' });
      return;
    }
    if (!profileData.email || !profileData.email.trim()) {
      setProfileMsg({ type: 'error', text: 'Vui lòng nhập địa chỉ email!' });
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMsg({ type: '', text: '' });
      const res = await AuthService.updateProfile(profileData);
      setProfileMsg({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' });
      if (onUserUpdate && res?.data) {
        onUserUpdate(res.data);
      }
      if (onToast) {
        onToast('Cập nhật thông tin tài khoản thành công!', 'success');
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      const errMsg = err.message || 'Lỗi khi cập nhật thông tin cá nhân!';
      setProfileMsg({ type: 'error', text: errMsg });
      if (onToast) {
        onToast(errMsg, 'error');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại!' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự!' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp với mật khẩu mới!' });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới không được trùng với mật khẩu cũ!' });
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordMsg({ type: '', text: '' });
      await AuthService.changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      if (onToast) {
        onToast('Đổi mật khẩu tài khoản thành công!', 'success');
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      const errMsg = err.message || 'Lỗi khi thay đổi mật khẩu!';
      setPasswordMsg({ type: 'error', text: errMsg });
      if (onToast) {
        onToast(errMsg, 'error');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal"
        style={{ maxWidth: '760px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#f0fdfa',
              display: 'grid',
              placeItems: 'center',
              color: '#0f766e'
            }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>Quản lý tài khoản</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Cập nhật thông tin lý lịch cá nhân và bảo mật tài khoản
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 20px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid #0f766e' : '2px solid transparent',
              color: activeTab === 'profile' ? '#0f766e' : '#64748b',
              cursor: 'pointer'
            }}
          >
            <User size={16} />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'password' ? '2px solid #0f766e' : '2px solid transparent',
              color: activeTab === 'password' ? '#0f766e' : '#64748b',
              cursor: 'pointer'
            }}
          >
            <KeyRound size={16} />
            <span>Đổi mật khẩu</span>
          </button>
        </div>

        <div className="modal-b" style={{ padding: '20px' }}>
          {activeTab === 'profile' && (
            <div>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Tên đăng nhập</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f766e', marginTop: '2px' }}>
                    @{accountInfo.username}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Vai trò hệ thống</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                    {accountInfo.roleTitle}
                  </div>
                </div>

                {accountInfo.employeeCode && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Mã nhân viên</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                      {accountInfo.employeeCode}
                    </div>
                  </div>
                )}

                {accountInfo.department && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Phòng ban</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                      {accountInfo.department}
                    </div>
                  </div>
                )}

                {accountInfo.position && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Chức vụ</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                      {accountInfo.position}
                    </div>
                  </div>
                )}
              </div>

              {profileMsg.text && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: profileMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${profileMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                  color: profileMsg.type === 'success' ? '#15803d' : '#dc2626'
                }}>
                  {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className="fsec" style={{ color: '#0f766e', fontWeight: 700, marginBottom: '12px' }}>
                  Thông tin cá nhân có thể tùy chỉnh
                </div>

                <div className="form">
                  <label className="field">
                    <span>Họ và tên: <i className="req">*</i></span>
                    <input
                      name="fullName"
                      className="inp"
                      required
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      placeholder="Nguyễn Văn A"
                      disabled={savingProfile}
                    />
                  </label>

                  <label className="field">
                    <span>Số điện thoại:</span>
                    <input
                      name="phone"
                      className="inp"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="0912345678"
                      disabled={savingProfile}
                    />
                  </label>

                  <label className="field">
                    <span>Địa chỉ Email: <i className="req">*</i></span>
                    <input
                      type="email"
                      name="email"
                      className="inp"
                      required
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="email@company.com"
                      disabled={savingProfile}
                    />
                  </label>

                  <label className="field">
                    <span>Giới tính:</span>
                    <select
                      name="gender"
                      className="inp"
                      value={profileData.gender}
                      onChange={handleProfileChange}
                      disabled={savingProfile}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Ngày sinh:</span>
                    <input
                      type="date"
                      name="birthDate"
                      className="inp"
                      value={profileData.birthDate}
                      onChange={handleProfileChange}
                      disabled={savingProfile}
                    />
                  </label>

                  <label className="field">
                    <span>Số CCCD / CMND:</span>
                    <input
                      name="idCardNumber"
                      className="inp"
                      value={profileData.idCardNumber}
                      onChange={handleProfileChange}
                      placeholder="001095001234"
                      disabled={savingProfile}
                    />
                  </label>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Địa chỉ thường trú:</span>
                    <input
                      name="address"
                      className="inp"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP"
                      disabled={savingProfile}
                    />
                  </label>

                  <label className="field">
                    <span>Ngân hàng thụ hưởng:</span>
                    <input
                      name="bankName"
                      className="inp"
                      value={profileData.bankName}
                      onChange={handleProfileChange}
                      placeholder="Vietcombank, MB Bank, Techcombank..."
                      disabled={savingProfile}
                    />
                  </label>

                  <label className="field">
                    <span>Số tài khoản ngân hàng:</span>
                    <input
                      name="bankAccountNumber"
                      className="inp"
                      value={profileData.bankAccountNumber}
                      onChange={handleProfileChange}
                      placeholder="19036789123456"
                      disabled={savingProfile}
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
                  <button type="button" className="btn" onClick={onClose} disabled={savingProfile}>
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="btn pri"
                    disabled={savingProfile || profileMsg.type === 'success'}
                    style={profileMsg.type === 'success' ? { background: '#16a34a', borderColor: '#16a34a' } : {}}
                  >
                    {profileMsg.type === 'success' ? (
                      <>
                        <CheckCircle2 size={15} style={{ marginRight: '6px' }} />
                        Đã lưu thành công!
                      </>
                    ) : (
                      <>
                        <Save size={15} style={{ marginRight: '6px' }} />
                        {savingProfile ? 'Đang lưu thay đổi...' : 'Lưu thay đổi thông tin'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div>
              <div style={{
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '12.5px',
                color: '#0f766e',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <span>
                  Để bảo vệ tài khoản, mật khẩu mới phải có tối thiểu 6 ký tự. Hãy chọn mật khẩu an toàn và ghi nhớ cẩn thận.
                </span>
              </div>

              {passwordMsg.text && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: passwordMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${passwordMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                  color: passwordMsg.type === 'success' ? '#15803d' : '#dc2626'
                }}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '480px' }}>
                  <label className="field">
                    <span>Mật khẩu hiện tại: <i className="req">*</i></span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        name="currentPassword"
                        className="inp"
                        required
                        value={passwords.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu đang sử dụng"
                        style={{ paddingRight: '38px', width: '100%' }}
                        disabled={savingPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8'
                        }}
                      >
                        {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>

                  <label className="field">
                    <span>Mật khẩu mới: <i className="req">*</i></span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        name="newPassword"
                        className="inp"
                        required
                        value={passwords.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Tối thiểu 6 ký tự"
                        style={{ paddingRight: '38px', width: '100%' }}
                        disabled={savingPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8'
                        }}
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>

                  <label className="field">
                    <span>Xác nhận mật khẩu mới: <i className="req">*</i></span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        name="confirmPassword"
                        className="inp"
                        required
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập lại mật khẩu mới"
                        style={{ paddingRight: '38px', width: '100%' }}
                        disabled={savingPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8'
                        }}
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>

                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px', gap: '10px' }}>
                    <button
                      type="submit"
                      className="btn pri"
                      disabled={savingPassword || passwordMsg.type === 'success'}
                      style={passwordMsg.type === 'success' ? { background: '#16a34a', borderColor: '#16a34a' } : {}}
                    >
                      {passwordMsg.type === 'success' ? (
                        <>
                          <CheckCircle2 size={15} style={{ marginRight: '6px' }} />
                          Đã cập nhật thành công!
                        </>
                      ) : (
                        <>
                          <KeyRound size={15} style={{ marginRight: '6px' }} />
                          {savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
