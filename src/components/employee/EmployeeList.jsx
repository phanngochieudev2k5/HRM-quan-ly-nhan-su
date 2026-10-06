import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, Eye, ShieldCheck,
  Download, Upload, Check, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import SearchFilter from '../common/SearchFilter';
import StatusBadge from '../common/StatusBadge';
import ConfirmModal from '../common/ConfirmModal';

export default function EmployeeList({ employees, onSelectEmployee, onAddEmployee, onDeleteEmployee }) {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Khối Kỹ Thuật (IT)',
    position: '',
    status: 'Đang làm việc',
    baseSalary: 15000000,
    gender: 'Nam',
    birthDate: '1995-01-01',
    address: 'Hà Nội'
  });

  const filteredEmployees = employees.filter(emp => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.id.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !department || emp.department === department;
    const matchStatus = !status || emp.status === status;
    return matchSearch && matchDept && matchStatus;
  });

  const handleSaveNew = (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email) {
      alert('Vui lòng điền họ tên và email hợp lệ');
      return;
    }
    const created = {
      ...newEmp,
      id: `EMP00${employees.length + 1}`,
      joinDate: new Date().toLocaleDateString('vi-VN'),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      faceRegistered: false,
      manager: 'Nguyễn Văn A'
    };
    onAddEmployee(created);
    setIsAddModalOpen(false);
    setNewEmp({
      name: '',
      email: '',
      phone: '',
      department: 'Khối Kỹ Thuật (IT)',
      position: '',
      status: 'Đang làm việc',
      baseSalary: 15000000,
      gender: 'Nam',
      birthDate: '1995-01-01',
      address: 'Hà Nội'
    });
  };

  return (
    <div>
      <PageHeader
        title="Quản lý Danh sách Nhân viên"
        subtitle={`Tổng số ${employees.length} nhân sự trên toàn hệ thống công ty`}
        breadcrumb="Nhân sự / Danh sách nhân viên"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => alert('Đã xuất file Excel dữ liệu nhân viên!')}>
              <Download size={15} />
              Xuất Excel
            </button>
            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} />
              Thêm nhân viên mới
            </button>
          </>
        }
      />

      <SearchFilter
        searchPlaceholder="Tìm theo họ tên, mã nhân viên, email..."
        searchValue={search}
        onSearchChange={setSearch}
        departmentValue={department}
        onDepartmentChange={setDepartment}
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={[
          { value: 'Đang làm việc', label: 'Đang làm việc' },
          { value: 'Thử việc', label: 'Thử việc' },
          { value: 'Đã nghỉ việc', label: 'Đã nghỉ việc' }
        ]}
        onReset={() => { setSearch(''); setDepartment(''); setStatus(''); }}
      />

      {/* Table */}
      <div className="hrm-table-container">
        <table className="hrm-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
              <th style={{ width: '60px' }}>Ảnh</th>
              <th>Họ và tên</th>
              <th>Mã NV</th>
              <th>Phòng ban</th>
              <th>Vị trí chức danh</th>
              <th>Khuôn mặt OpenCV</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <AlertCircle size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                  <div>Không tìm thấy nhân viên nào phù hợp bộ lọc</div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, index) => (
                <tr key={emp.id}>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                  <td>
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                    />
                  </td>
                  <td>
                    <div
                      onClick={() => onSelectEmployee(emp)}
                      style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
                    >
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>{emp.email}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {emp.id}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{emp.department}</td>
                  <td>{emp.position}</td>
                  <td>
                    {emp.faceRegistered ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '12px', fontWeight: 500 }}>
                        <ShieldCheck size={15} /> Đã đăng ký
                      </span>
                    ) : (
                      <span style={{ color: '#ea580c', fontSize: '12px' }}>
                        Chưa đăng ký
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={emp.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn-icon"
                        title="Xem hồ sơ chi tiết"
                        onClick={() => onSelectEmployee(emp)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        title="Chỉnh sửa"
                        onClick={() => onSelectEmployee(emp)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        title="Xóa nhân viên"
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa nhân viên ${emp.name}?`)) {
                            onDeleteEmployee(emp.id);
                          }
                        }}
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '13px', color: '#64748b' }}>
        <span>Hiển thị 1 - {filteredEmployees.length} trong tổng số {employees.length} kết quả</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-secondary btn-sm" disabled>Trước</button>
          <button className="btn btn-primary btn-sm">1</button>
          <button className="btn btn-secondary btn-sm" disabled>Tiếp</button>
        </div>
      </div>

      {/* Modal Add Employee */}
      <ConfirmModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm nhân viên mới vào hệ thống"
        maxWidth="680px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Hủy bỏ</button>
            <button className="btn btn-primary" onClick={handleSaveNew}>Lưu nhân viên</button>
          </>
        }
      >
        <form onSubmit={handleSaveNew}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Họ và tên <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: Nguyễn Văn Nam"
                required
                value={newEmp.name}
                onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email công việc <span className="required">*</span></label>
              <input
                type="email"
                className="form-control"
                placeholder="VD: namnv@company.com"
                required
                value={newEmp.email}
                onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="form-control"
                placeholder="0987 654 321"
                value={newEmp.phone}
                onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phòng ban</label>
              <select
                className="form-control"
                value={newEmp.department}
                onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}
              >
                <option value="Khối Kỹ Thuật (IT)">Khối Kỹ Thuật (IT)</option>
                <option value="Phòng Nhân sự">Phòng Nhân sự</option>
                <option value="Marketing & Truyền thông">Marketing & Truyền thông</option>
                <option value="Tài chính - Kế toán">Tài chính - Kế toán</option>
                <option value="Kinh doanh & Bán hàng">Kinh doanh & Bán hàng</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vị trí / Chức danh</label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: Fullstack Developer"
                value={newEmp.position}
                onChange={e => setNewEmp({ ...newEmp, position: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mức lương cơ bản (VNĐ)</label>
              <input
                type="number"
                className="form-control"
                value={newEmp.baseSalary}
                onChange={e => setNewEmp({ ...newEmp, baseSalary: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái nhân sự</label>
              <select
                className="form-control"
                value={newEmp.status}
                onChange={e => setNewEmp({ ...newEmp, status: e.target.value })}
              >
                <option value="Đang làm việc">Đang làm việc</option>
                <option value="Thử việc">Thử việc</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Địa chỉ liên hệ</label>
              <input
                type="text"
                className="form-control"
                placeholder="VD: Cầu Giấy, Hà Nội"
                value={newEmp.address}
                onChange={e => setNewEmp({ ...newEmp, address: e.target.value })}
              />
            </div>
          </div>
        </form>
      </ConfirmModal>
    </div>
  );
}
