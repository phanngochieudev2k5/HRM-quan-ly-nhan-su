import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Lock, UserCheck, CheckCircle2 } from 'lucide-react';
import HrService from '../../../../services/HrService';

export default function EmployeeModal({ isOpen, onClose, onSave, employee = null, departments = [], positions = [] }) {
  const isEdit = !!employee?.EmployeeId;

  const [formData, setFormData] = useState({
    UserId: null,
    EmployeeCode: '',
    FullName: '',
    Phone: '',
    Email: '',
    DepartmentId: '',
    PositionId: '',
    JoinDate: new Date().toISOString().slice(0, 10),
    WorkStatus: 'Đang làm việc',
    BaseSalary: 15000000,
    InsuranceSalary: 15000000
  });

  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && !isEdit) {
      setLoadingUnassigned(true);
      HrService.getUnassignedUsers()
        .then(users => {
          setUnassignedUsers(users || []);
        })
        .catch(() => setUnassignedUsers([]))
        .finally(() => setLoadingUnassigned(false));
    }
  }, [isOpen, isEdit]);

  useEffect(() => {
    if (employee) {
      setFormData({
        UserId: employee.UserId || null,
        EmployeeCode: employee.EmployeeCode || employee.id || '',
        FullName: employee.FullName || employee.name || '',
        Phone: employee.Phone || employee.phone || '',
        Email: employee.Email || employee.email || '',
        DepartmentId: employee.DepartmentId || '',
        PositionId: employee.PositionId || '',
        JoinDate: employee.JoinDate || employee.joinDate || new Date().toISOString().slice(0, 10),
        WorkStatus: employee.WorkStatus || employee.status || 'Đang làm việc',
        BaseSalary: employee.BaseSalary ?? employee.baseSalary ?? 15000000,
        InsuranceSalary: employee.InsuranceSalary ?? employee.insuranceSalary ?? 15000000
      });
      setSelectedUserId(employee.UserId ? String(employee.UserId) : '');
    } else {
      setFormData({
        UserId: null,
        EmployeeCode: '',
        FullName: '',
        Phone: '',
        Email: '',
        DepartmentId: departments[0]?.DepartmentId || '',
        PositionId: positions[0]?.PositionId || '',
        JoinDate: new Date().toISOString().slice(0, 10),
        WorkStatus: 'Đang làm việc',
        BaseSalary: 15000000,
        InsuranceSalary: 15000000
      });
      setSelectedUserId('');
    }
    setErrorMsg('');
  }, [employee, departments, positions, isOpen, isEdit]);

  if (!isOpen) return null;

  const handleSelectUser = (uId) => {
    setSelectedUserId(uId);
    if (!uId) {
      setFormData(prev => ({
        ...prev,
        UserId: null,
        FullName: '',
        Email: '',
        Phone: ''
      }));
      return;
    }
    const found = unassignedUsers.find(u => String(u.UserId) === String(uId));
    if (found) {
      setFormData(prev => ({
        ...prev,
        UserId: found.UserId,
        FullName: found.FullName || found.Username,
        Email: found.Email || '',
        Phone: found.Phone || ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !formData.UserId) {
      setErrorMsg('Vui lòng chọn tài khoản nhân sự đã đăng ký!');
      return;
    }

    if (!formData.FullName || !formData.FullName.trim()) {
      setErrorMsg('Họ và tên nhân viên là bắt buộc!');
      return;
    }

    if (!formData.DepartmentId) {
      setErrorMsg('Vui lòng chọn phòng ban trực thuộc cho nhân viên!');
      return;
    }

    if (!formData.PositionId) {
      setErrorMsg('Vui lòng chọn chức vụ công tác!');
      return;
    }

    if (!formData.JoinDate) {
      setErrorMsg('Vui lòng chọn ngày vào làm!');
      return;
    }

    if (formData.BaseSalary === '' || formData.BaseSalary === null || Number(formData.BaseSalary) < 0) {
      setErrorMsg('Vui lòng nhập mức lương cơ bản hợp lệ!');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onSave({
        ...formData,
        BaseSalary: Number(formData.BaseSalary) || 0,
        InsuranceSalary: Number(formData.InsuranceSalary) || 0
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi lưu thông tin nhân sự!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEdit ? <Save size={20} style={{ color: '#0f766e' }} /> : <UserPlus size={20} style={{ color: '#0f766e' }} />}
            <h3>{isEdit ? `Cập nhật thông tin phân bổ: ${formData.FullName || formData.EmployeeCode}` : 'Tiếp nhận & Xếp phòng ban nhân sự mới'}</h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ margin: '14px 20px 0', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-b" style={{ padding: '16px 20px' }}>
            <div className="form">
              {isEdit ? (
                <>
                  <div className="fsec" style={{ color: '#0f766e', fontWeight: 700 }}>1. THÔNG TIN NHÂN SỰ</div>
                  <label className="field">
                    <span>Mã nhân viên: <i className="req">*</i></span>
                    <input
                      name="EmployeeCode"
                      className="inp"
                      value={formData.EmployeeCode}
                      disabled
                      style={{ background: '#f1f5f9', cursor: 'not-allowed', fontWeight: 600 }}
                    />
                  </label>
                  <label className="field">
                    <span>Họ và tên: <i className="req">*</i></span>
                    <input
                      name="FullName"
                      className="inp"
                      value={formData.FullName}
                      disabled
                      style={{ background: '#f1f5f9', cursor: 'not-allowed', fontWeight: 600 }}
                    />
                  </label>
                  <label className="field">
                    <span>Email: <i className="req">*</i></span>
                    <input
                      name="Email"
                      className="inp"
                      value={formData.Email}
                      disabled
                      style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                    />
                  </label>
                  <label className="field">
                    <span>Số điện thoại:</span>
                    <input
                      name="Phone"
                      className="inp"
                      value={formData.Phone}
                      disabled
                      style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                    />
                  </label>
                </>
              ) : (
                <>
                  <div style={{ gridColumn: 'span 2', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '16px', borderRadius: '10px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', fontWeight: 700, fontSize: '13.5px' }}>
                        <UserCheck size={18} />
                        <span>Chọn tài khoản nhân sự đã đăng ký (Chờ xếp phòng ban) <i className="req">*</i></span>
                      </div>
                      {loadingUnassigned && (
                        <span style={{ fontSize: '12px', color: '#0d9488' }}>Đang tải danh sách tài khoản...</span>
                      )}
                    </div>
                    <select
                      className="inp"
                      value={selectedUserId}
                      onChange={(e) => handleSelectUser(e.target.value)}
                      style={{ borderColor: '#14b8a6', fontWeight: 600, background: '#ffffff', color: '#0f172a' }}
                      required
                    >
                      <option value="">
                        -- Chọn tài khoản từ danh sách đăng ký ({unassignedUsers.length} tài khoản chờ) --
                      </option>
                      {unassignedUsers.map(u => (
                        <option key={u.UserId} value={u.UserId}>
                          {u.FullName} (@{u.Username} - {u.Email}) {u.Phone ? `· SĐT: ${u.Phone}` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedUserId ? (
                      <div style={{ fontSize: '12px', color: '#0d9488', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={14} />
                        <span>Thông tin cá nhân do nhân sự tự đăng ký. HR chỉ phân bổ phòng ban, chức vụ và mức lương.</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                        {unassignedUsers.length === 0 && !loadingUnassigned
                          ? 'Hiện chưa có tài khoản nào đăng ký mới đang chờ tiếp nhận.'
                          : 'Vui lòng chọn tài khoản nhân sự từ danh sách trên để tiếp nhận vào tổ chức.'}
                      </div>
                    )}
                  </div>

                  <div className="fsec" style={{ color: '#0f766e', fontWeight: 700 }}>1. THÔNG TIN CÁ NHÂN (DO NHÂN SỰ ĐĂNG KÝ)</div>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Họ và tên: <i className="req">*</i>
                      {selectedUserId && <Lock size={12} style={{ color: '#64748b' }} />}
                    </span>
                    <input
                      name="FullName"
                      className="inp"
                      required
                      placeholder="Chọn tài khoản để hiển thị họ tên"
                      value={formData.FullName}
                      readOnly
                      style={{ background: '#f8fafc', color: '#1e293b', fontWeight: 600, cursor: 'not-allowed' }}
                    />
                  </label>

                  <label className="field">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Email: <i className="req">*</i>
                      {selectedUserId && <Lock size={12} style={{ color: '#64748b' }} />}
                    </span>
                    <input
                      type="email"
                      name="Email"
                      className="inp"
                      required
                      placeholder="Chọn tài khoản để hiển thị email"
                      value={formData.Email}
                      readOnly
                      style={{ background: '#f8fafc', color: '#1e293b', cursor: 'not-allowed' }}
                    />
                  </label>

                  <label className="field">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Số điện thoại:
                      {selectedUserId && <Lock size={12} style={{ color: '#64748b' }} />}
                    </span>
                    <input
                      name="Phone"
                      className="inp"
                      placeholder="Chọn tài khoản để hiển thị SĐT"
                      value={formData.Phone}
                      readOnly
                      style={{ background: '#f8fafc', color: '#1e293b', cursor: 'not-allowed' }}
                    />
                  </label>
                </>
              )}

              <div className="fsec" style={{ color: '#0f766e', fontWeight: 700, marginTop: '8px' }}>
                2. PHÒNG BAN & VỊ TRÍ CÔNG TÁC (HR PHÂN BỔ)
              </div>

              <label className="field">
                <span>Phòng ban: <i className="req">*</i></span>
                <select name="DepartmentId" className="inp" value={formData.DepartmentId} onChange={handleChange} required>
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map(d => (
                    <option key={d.DepartmentId} value={d.DepartmentId}>
                      {d.DepartmentName} ({d.DepartmentCode})
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Chức vụ: <i className="req">*</i></span>
                <select name="PositionId" className="inp" value={formData.PositionId} onChange={handleChange} required>
                  <option value="">-- Chọn chức vụ --</option>
                  {positions.map(p => (
                    <option key={p.PositionId} value={p.PositionId}>
                      {p.PositionName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Ngày vào làm: <i className="req">*</i></span>
                <input
                  type="date"
                  name="JoinDate"
                  className="inp"
                  required
                  value={formData.JoinDate}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Trạng thái làm việc:</span>
                <select name="WorkStatus" className="inp" value={formData.WorkStatus} onChange={handleChange}>
                  <option value="Đang làm việc">Đang làm việc</option>
                  <option value="Thử việc">Thử việc</option>
                  <option value="Tạm hoãn">Tạm hoãn</option>
                  <option value="Đã thôi việc">Đã thôi việc</option>
                </select>
              </label>

              <div className="fsec" style={{ color: '#0f766e', fontWeight: 700, marginTop: '8px' }}>
                3. CHẾ ĐỘ LƯƠNG, THUẾ & TÀI KHOẢN NGÂN HÀNG
              </div>

              <label className="field">
                <span>Lương cơ bản (VNĐ): <i className="req">*</i></span>
                <input
                  type="number"
                  step="500000"
                  name="BaseSalary"
                  className="inp num"
                  required
                  value={formData.BaseSalary}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Lương đóng BHXH:</span>
                <input
                  type="number"
                  step="500000"
                  name="InsuranceSalary"
                  className="inp num"
                  value={formData.InsuranceSalary}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn pri" disabled={submitting}>
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu cập nhật' : 'Lưu tiếp nhận nhân sự'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
