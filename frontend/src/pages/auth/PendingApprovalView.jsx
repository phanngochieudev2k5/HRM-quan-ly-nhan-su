import React, { useState } from 'react';
import {
  Clock, ShieldCheck, User, Mail, Phone,
  Building2, RefreshCw, LogOut, CheckCircle2, AlertCircle
} from 'lucide-react';
import AuthService from '../../services/AuthService';
import '../../styles/auth/PendingApprovalView.css';

export default function PendingApprovalView({ currentUser, onAuthSuccess, onLogout }) {
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState(null);

  const handleRefreshStatus = async () => {
    setChecking(true);
    setCheckMessage(null);
    try {
      const res = await AuthService.getMe();
      if (res && res.data) {
        const updated = res.data;
        if (updated.departmentId || updated.employeeId || !updated.isPending) {
          const currentToken = AuthService.getToken();
          AuthService.setSession(currentToken, updated);
          if (onAuthSuccess) {
            onAuthSuccess(updated, currentToken);
          }
          return;
        }
      }
      setCheckMessage({
        type: 'info',
        text: 'Hồ sơ của bạn vẫn đang trong danh sách chờ HR tiếp nhận. Vui lòng kiểm tra lại sau!'
      });
    } catch {
      setCheckMessage({
        type: 'error',
        text: 'Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại sau!'
      });
    } finally {
      setChecking(false);
    }
  };

  const user = currentUser || AuthService.getCurrentUser() || {};

  return (
    <div className="pending-auth-container">
      <div className="pending-auth-card">
        <div className="pending-auth-header">
          <div className="pending-icon-badge">
            <Clock size={32} />
          </div>
          <h1 className="pending-title">Tài khoản của bạn đang chờ Bộ phận Nhân sự (HR) xếp phòng ban!</h1>
          <p className="pending-subtitle">
            Thông tin đăng ký của bạn đã được ghi nhận trên hệ thống HRM Enterprise. Quản trị viên hoặc bộ phận HR đang tiến hành phân bổ phòng ban, chức vụ và ca làm việc cho bạn.
          </p>
        </div>

        {checkMessage && (
          <div className={`pending-alert ${checkMessage.type === 'error' ? 'error' : 'info'}`}>
            {checkMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{checkMessage.text}</span>
          </div>
        )}

        <div className="pending-info-box">
          <div className="pending-info-title">
            <User size={16} />
            <span>Thông tin tài khoản đã đăng ký</span>
          </div>
          <div className="pending-info-grid">
            <div className="pending-info-item">
              <span className="label">Họ và tên:</span>
              <strong className="value">{user.name || user.fullName || 'Chưa cập nhật'}</strong>
            </div>
            <div className="pending-info-item">
              <span className="label">Tên đăng nhập:</span>
              <strong className="value">@{user.username || 'user'}</strong>
            </div>
            <div className="pending-info-item">
              <span className="label">Email:</span>
              <span className="value">{user.email || 'Chưa cập nhật'}</span>
            </div>
            <div className="pending-info-item">
              <span className="label">Số điện thoại:</span>
              <span className="value">{user.phone || 'Chưa cập nhật'}</span>
            </div>
            <div className="pending-info-item">
              <span className="label">Vai trò:</span>
              <span className="role-tag">Nhân viên (Chờ tiếp nhận)</span>
            </div>
            <div className="pending-info-item">
              <span className="label">Trạng thái:</span>
              <span className="status-tag-pending">Đang chờ xếp phòng ban</span>
            </div>
          </div>
        </div>

        <div className="pending-workflow-steps">
          <div className="step-item done">
            <div className="step-num"><CheckCircle2 size={14} /></div>
            <div className="step-text">
              <strong>1. Đăng ký tài khoản</strong>
              <small>Đã hoàn tất thông tin cá nhân</small>
            </div>
          </div>
          <div className="step-divider done"></div>
          <div className="step-item active">
            <div className="step-num">2</div>
            <div className="step-text">
              <strong>2. HR xếp phòng ban & chức vụ</strong>
              <small>Đang trong hàng đợi tiếp nhận</small>
            </div>
          </div>
          <div className="step-divider"></div>
          <div className="step-item">
            <div className="step-num">3</div>
            <div className="step-text">
              <strong>3. Kích hoạt không gian làm việc</strong>
              <small>Mở portal chấm công, lương, ca làm</small>
            </div>
          </div>
        </div>

        <div className="pending-actions">
          <button
            type="button"
            className="btn-refresh"
            onClick={handleRefreshStatus}
            disabled={checking}
          >
            <RefreshCw size={15} className={checking ? 'spin' : ''} />
            <span>{checking ? 'Đang kiểm tra...' : 'Kiểm tra lại trạng thái'}</span>
          </button>
          <button
            type="button"
            className="btn-logout"
            onClick={onLogout}
          >
            <LogOut size={15} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}

