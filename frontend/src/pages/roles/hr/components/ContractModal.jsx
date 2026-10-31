import React, { useState, useEffect } from 'react';
import { X, FileText, Save, AlertCircle } from 'lucide-react';

export default function ContractModal({
  isOpen,
  onClose,
  onSave,
  contract = null,
  employeeId = null,
  employeeName = '',
  employees = []
}) {
  const isEdit = !!contract?.ContractId;

  const [formData, setFormData] = useState({
    ContractNumber: '',
    EmployeeId: employeeId || '',
    ContractType: 'Hợp đồng 1 năm',
    SignDate: new Date().toISOString().slice(0, 10),
    StartDate: new Date().toISOString().slice(0, 10),
    EndDate: '',
    AgreedSalary: 20000000,
    Status: 'Hiệu lực',
    ContractFileUrl: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (contract) {
      setFormData({
        ContractNumber: contract.ContractNumber || '',
        EmployeeId: contract.EmployeeId || employeeId || '',
        ContractType: contract.ContractType || 'Hợp đồng 1 năm',
        SignDate: contract.SignDate || new Date().toISOString().slice(0, 10),
        StartDate: contract.StartDate || new Date().toISOString().slice(0, 10),
        EndDate: contract.EndDate || '',
        AgreedSalary: contract.AgreedSalary ?? 20000000,
        Status: contract.Status || 'Hiệu lực',
        ContractFileUrl: contract.ContractFileUrl || ''
      });
    } else {
      setFormData({
        ContractNumber: '',
        EmployeeId: employeeId || (employees[0]?.EmployeeId || employees[0]?.id || ''),
        ContractType: 'Hợp đồng 1 năm',
        SignDate: new Date().toISOString().slice(0, 10),
        StartDate: new Date().toISOString().slice(0, 10),
        EndDate: '',
        AgreedSalary: 20000000,
        Status: 'Hiệu lực',
        ContractFileUrl: ''
      });
    }
    setErrorMsg('');
  }, [contract, employeeId, employees, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.EmployeeId) {
      setErrorMsg('Vui lòng chọn nhân viên áp dụng hợp đồng!');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onSave({
        ...formData,
        EmployeeId: parseInt(formData.EmployeeId)
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu hợp đồng!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-wrap" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: '#0f766e' }} />
            <h3>
              {isEdit
                ? `Cập nhật hợp đồng: ${formData.ContractNumber || 'HD'}`
                : employeeName
                ? `Thêm hợp đồng mới cho ${employeeName}`
                : 'Thêm mới hợp đồng lao động (tblContract)'}
            </h3>
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
              {/* CHỌN NHÂN VIÊN */}
              {!employeeId && !isEdit ? (
                <label className="field" style={{ gridColumn: 'span 2' }}>
                  <span>Nhân viên áp dụng: <i className="req">*</i></span>
                  <select
                    name="EmployeeId"
                    className="inp"
                    value={formData.EmployeeId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn nhân viên từ danh sách --</option>
                    {employees.map(emp => (
                      <option key={emp.EmployeeId || emp.id} value={emp.EmployeeId || emp.id}>
                        {emp.FullName || emp.name} - Mã: {emp.EmployeeCode || emp.id} ({emp.DepartmentName || emp.department || 'Nhân sự'})
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="field">
                <span>Số hợp đồng:</span>
                <input
                  name="ContractNumber"
                  className="inp"
                  placeholder="Để trống để tự tạo (VD: HD010)"
                  value={formData.ContractNumber}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Loại hợp đồng: <i className="req">*</i></span>
                <select name="ContractType" className="inp" value={formData.ContractType} onChange={handleChange} required>
                  <option value="Hợp đồng thử việc">Hợp đồng thử việc</option>
                  <option value="Hợp đồng 1 năm">Hợp đồng 1 năm</option>
                  <option value="Hợp đồng 2 năm">Hợp đồng 2 năm</option>
                  <option value="Hợp đồng 3 năm">Hợp đồng 3 năm</option>
                  <option value="Hợp đồng vô thời hạn">Hợp đồng vô thời hạn</option>
                  <option value="Hợp đồng thời vụ">Hợp đồng thời vụ</option>
                </select>
              </label>

              <label className="field">
                <span>Ngày ký hợp đồng:</span>
                <input
                  type="date"
                  name="SignDate"
                  className="inp"
                  value={formData.SignDate}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Ngày bắt đầu hiệu lực: <i className="req">*</i></span>
                <input
                  type="date"
                  name="StartDate"
                  className="inp"
                  value={formData.StartDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>Ngày kết thúc hiệu lực:</span>
                <input
                  type="date"
                  name="EndDate"
                  className="inp"
                  value={formData.EndDate}
                  onChange={handleChange}
                />
              </label>

              <label className="field">
                <span>Lương thỏa thuận (VNĐ): <i className="req">*</i></span>
                <input
                  type="number"
                  step="500000"
                  name="AgreedSalary"
                  className="inp num"
                  value={formData.AgreedSalary}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>Trạng thái hợp đồng:</span>
                <select name="Status" className="inp" value={formData.Status} onChange={handleChange}>
                  <option value="Hiệu lực">Hiệu lực</option>
                  <option value="Sắp hết hạn">Sắp hết hạn</option>
                  <option value="Hết hạn">Hết hạn</option>
                  <option value="Đã chấm dứt">Đã chấm dứt</option>
                </select>
              </label>

              <label className="field">
                <span>Link file đính kèm (URL):</span>
                <input
                  name="ContractFileUrl"
                  className="inp"
                  placeholder="https://drive... hoặc link pdf"
                  value={formData.ContractFileUrl}
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
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu cập nhật' : 'Tạo hợp đồng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
