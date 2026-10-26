import React, { useState } from 'react';
import {
  Lock, User, Mail, Phone, Shield, ArrowRight,
  CheckCircle2, AlertCircle, Building2, KeyRound, Sparkles
} from 'lucide-react';
import AuthService from '../../services/AuthService';
import '../../styles/auth/AuthPage.css';

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!loginData.username.trim() || !loginData.password) {
        throw new Error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      }

      const res = await AuthService.login(loginData.username.trim(), loginData.password);
      if (res.success && res.data) {
        onAuthSuccess(res.data.user, res.data.token);
      } else {
        throw new Error(res.message || 'Đăng nhập không thành công!');
      }
    } catch (err) {
      setError(err.message || 'Không thể kết nối đến máy chủ xác thực.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!registerData.fullName.trim()) throw new Error('Vui lòng nhập họ và tên!');
      if (!registerData.username.trim()) throw new Error('Vui lòng nhập tên đăng nhập!');
      if (!registerData.email.trim()) throw new Error('Vui lòng nhập địa chỉ email!');
      if (!registerData.password) throw new Error('Vui lòng nhập mật khẩu!');
      if (registerData.password.length < 6) throw new Error('Mật khẩu tối thiểu phải từ 6 ký tự!');
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp với mật khẩu đã nhập!');
      }

      const res = await AuthService.register({
        username: registerData.username.trim(),
        password: registerData.password,
        fullName: registerData.fullName.trim(),
        email: registerData.email.trim(),
        phone: registerData.phone.trim()
      });

      if (res.success && res.data) {
        setSuccessMsg('Đăng ký thành công! Hệ thống đang tự động đăng nhập...');
        setTimeout(() => {
          onAuthSuccess(res.data.user, res.data.token);
        }, 1000);
      } else {
        throw new Error(res.message || 'Đăng ký không thành công!');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi đăng ký tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-logo">
            <Building2 size={28} />
          </div>
          <h1 className="auth-title">HRM ENTERPRISE</h1>
          <p className="auth-subtitle">Hệ thống Quản trị Nhân sự & Chấm công Doanh nghiệp</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
          >
            <KeyRound size={15} />
            <span>Đăng nhập</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
          >
            <User size={15} />
            <span>Đăng ký mới</span>
          </button>
        </div>

        {error && (
          <div className="auth-error-alert" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-role-locked-badge" style={{ marginBottom: '16px', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="auth-input-group">
              <label className="auth-label">Tên đăng nhập</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Ví dụ: admin.hieu hoặc hr.vana"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Mật khẩu</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Nhập mật khẩu..."
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span>Đang xác thực tài khoản...</span>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="auth-input-group">
              <label className="auth-label">Họ và tên nhân sự</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Nguyễn Văn B"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Tên đăng nhập (Username)</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="nguyenvanb"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="auth-input-group">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="email@company.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Số điện thoại</label>
                <div className="auth-input-wrapper">
                  <Phone size={16} className="auth-input-icon" />
                  <input
                    type="tel"
                    className="auth-input"
                    placeholder="0912345678"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="auth-input-group">
                <label className="auth-label">Mật khẩu</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Tối thiểu 6 ký tự"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Xác nhận mật khẩu</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Nhập lại mật khẩu"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span>Đang xử lý đăng ký...</span>
              ) : (
                <>
                  <span>Tạo tài khoản & Đăng nhập</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
