import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Briefcase, Calendar, ShieldCheck, CreditCard, Edit3, X, Save, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import AuthService from '../../../services/AuthService';
import '../../../styles/roles/employee/MyProfileView.css';

export default function MyProfileView({ user }) {
  const [currentUser, setCurrentUser] = useState(user || AuthService.getCurrentUser() || {});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [editFormData, setEditFormData] = useState({
    fullName: currentUser.name || currentUser.fullName || '',
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    gender: currentUser.gender || 'Nam',
    birthDate: currentUser.birthDate || '',
    address: currentUser.address || '',
    idCardNumber: currentUser.idCardNumber || currentUser.idCard || '',
    bankName: currentUser.bankName || 'Vietcombank',
    bankAccountNumber: currentUser.bankAccountNumber || ''
  });

  const me = {
    id: currentUser.employeeCode || `NV${String(currentUser.id || 1).padStart(3, '0')}`,
    name: currentUser.name || currentUser.fullName || currentUser.username || 'Nhân sự',
    gender: currentUser.gender || 'Chưa cập nhật',
    birthDate: currentUser.birthDate || 'Chưa cập nhật',
    phone: currentUser.phone || 'Chưa cập nhật',
    email: currentUser.email || 'Chưa cập nhật',
    idCard: currentUser.idCardNumber || currentUser.idCard || 'Chưa cập nhật',
    taxCode: currentUser.taxCode || 'Chưa cập nhật',
    bankName: currentUser.bankName || 'Chưa cập nhật',
    bankAccountNumber: currentUser.bankAccountNumber || 'Chưa cập nhật',
    department: currentUser.department || 'Phòng Nhân sự & Kỹ thuật',
    position: currentUser.position || currentUser.roleTitle || 'Chuyên viên',
    joinDate: currentUser.joinDate || '2026-01-01',
    status: 'Đang làm việc',
    contractType: 'Hợp đồng lao động chính thức',
    baseSalary: 15000000,
    faceRegistered: !!currentUser.faceRegistered,
    address: currentUser.address || 'Chưa cập nhật'
  };

  const handleOpenEdit = () => {
    setEditFormData({
      fullName: currentUser.name || currentUser.fullName || '',
      phone: currentUser.phone || '',
      email: currentUser.email || '',
      gender: currentUser.gender || 'Nam',
      birthDate: currentUser.birthDate || '',
      address: currentUser.address || '',
      idCardNumber: currentUser.idCardNumber || currentUser.idCard || '',
      bankName: currentUser.bankName || 'Vietcombank',
      bankAccountNumber: currentUser.bankAccountNumber || ''
    });
    setSuccessMsg('');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await AuthService.updateProfile(editFormData);
      if (res?.data) {
        setCurrentUser(prev => ({ ...prev, ...res.data }));
      }
      setSuccessMsg('Cập nhật hồ sơ cá nhân thành công!');
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật thông tin cá nhân!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="my-profile-container">
      <div className="ph">
        <div>
          <h1>Hồ sơ lý lịch cá nhân</h1>
          <p>Dữ liệu hợp đồng lao động, thông tin thuế, số CCCD, tài khoản ngân hàng và định danh của bạn</p>
        </div>
        <div className="ph-tools">
          <button className="btn pri" onClick={handleOpenEdit}>
            <Edit3 size={15} />
            <span>Cập nhật thông tin cá nhân</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{
          padding: '12px 18px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          marginBottom: '14px'
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid c21">
        <div className="card">
          <div className="card-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Chi tiết lý lịch nhân sự</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Thông tin công tác & định danh cá nhân</span>
          </div>
          <div className="profile-details-grid">
            <div className="profile-detail-field">
              <span>Họ và tên:</span>
              <strong>{me.name}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Mã nhân viên:</span>
              <strong>{me.id}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Phòng ban:</span>
              <strong style={{ color: '#0f766e' }}>{me.department}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Chức vụ / Vị trí:</span>
              <strong style={{ color: '#0f766e' }}>{me.position}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Ngày nhận việc:</span>
              <strong>{me.joinDate}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Trạng thái công tác:</span>
              <strong>{me.status}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Giới tính:</span>
              <strong>{me.gender}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Ngày sinh:</span>
              <strong>{me.birthDate}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Số điện thoại:</span>
              <strong>{me.phone}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Email:</span>
              <strong>{me.email}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Số CCCD / CMND:</span>
              <strong style={{ color: me.idCard === 'Chưa cập nhật' ? '#dc2626' : '#1e293b' }}>
                {me.idCard}
              </strong>
            </div>
            <div className="profile-detail-field">
              <span>Địa chỉ thường trú:</span>
              <strong>{me.address}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Ngân hàng thụ hưởng:</span>
              <strong>{me.bankName}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Số tài khoản ngân hàng:</span>
              <strong style={{ color: me.bankAccountNumber === 'Chưa cập nhật' ? '#dc2626' : '#1e293b' }}>
                {me.bankAccountNumber}
              </strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Ảnh chân dung & Sinh trắc Face ID</h3>
          </div>
          <div className="card-b" style={{ textAlign: 'center' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: '#0f766e',
              color: '#ffffff',
              fontSize: '36px',
              fontWeight: '700',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px auto'
            }}>
              {me.name[0]}
            </div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{me.name}</h4>
            <p style={{ margin: '0 0 16px 0', color: 'var(--muted)', fontSize: '13px' }}>
              {me.position} · {me.id}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: 'var(--p50)', color: 'var(--pd)', fontSize: '12.5px', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>Face ID: Đã kích hoạt</span>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="modal-wrap" onClick={() => !submitting && setIsEditModalOpen(false)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} style={{ color: '#0f766e' }} />
                <h3>Cập nhật thông tin lý lịch cá nhân</h3>
              </div>
              {!submitting && (
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="modal-b" style={{ padding: '16px 20px' }}>
                <div className="form">
                  <label className="field">
                    <span>Họ và tên: <i className="req">*</i></span>
                    <input
                      className="inp"
                      required
                      value={editFormData.fullName}
                      onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Giới tính:</span>
                    <select
                      className="inp"
                      value={editFormData.gender}
                      onChange={e => setEditFormData({ ...editFormData, gender: e.target.value })}
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
                      className="inp"
                      value={editFormData.birthDate}
                      onChange={e => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Số điện thoại:</span>
                    <input
                      className="inp"
                      placeholder="0912345678"
                      value={editFormData.phone}
                      onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </label>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Email liên hệ: <i className="req">*</i></span>
                    <input
                      type="email"
                      className="inp"
                      required
                      value={editFormData.email}
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Số CCCD / CMND: <i className="req">*</i></span>
                    <input
                      className="inp"
                      placeholder="VD: 001095000123"
                      value={editFormData.idCardNumber}
                      onChange={e => setEditFormData({ ...editFormData, idCardNumber: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Địa chỉ thường trú:</span>
                    <input
                      className="inp"
                      placeholder="VD: Cầu Giấy, Hà Nội"
                      value={editFormData.address}
                      onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Ngân hàng thụ hưởng:</span>
                    <input
                      className="inp"
                      placeholder="VD: Vietcombank / Techcombank / MB Bank"
                      value={editFormData.bankName}
                      onChange={e => setEditFormData({ ...editFormData, bankName: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Số tài khoản ngân hàng:</span>
                    <input
                      className="inp"
                      placeholder="VD: 190367891234"
                      value={editFormData.bankAccountNumber}
                      onChange={e => setEditFormData({ ...editFormData, bankAccountNumber: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  disabled={submitting}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn pri"
                  disabled={submitting}
                >
                  <Save size={16} />
                  <span>{submitting ? 'Đang lưu...' : 'Lưu thông tin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
