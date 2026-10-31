import React, { useState } from 'react';
import {
  Search, Plus, Eye, Edit2, Trash2, Camera, Building2, User,
  ChevronLeft, ChevronRight, Filter, ShieldCheck, Mail, Phone
} from 'lucide-react';
import StatusBadge from '../../../../components/common/StatusBadge';
import EmptyState from '../../../../components/common/EmptyState';
import EmployeeModal from './EmployeeModal';

export default function EmployeeList({
  employees = [],
  pagination = { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading = false,
  searchTerm = '',
  onSearchChange,
  departmentFilter = '',
  onDepartmentChange,
  statusFilter = '',
  onStatusChange,
  departments = [],
  positions = [],
  onPageChange,
  onViewProfile,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const formatVND = (n) => `${Math.round(+n || 0).toLocaleString('vi-VN')} đ`;

  const getInitials = (name) => {
    if (!name) return 'N';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1][0] || 'N';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đang làm việc':
        return <span className="badge b-green">Đang làm việc</span>;
      case 'Thử việc':
        return <span className="badge b-blue">Thử việc</span>;
      case 'Tạm hoãn':
        return <span className="badge b-amber">Tạm hoãn</span>;
      case 'Đã thôi việc':
      case 'Đã nghỉ việc':
        return <span className="badge b-red">Đã thôi việc</span>;
      default:
        return <span className="badge">{status || 'Đang làm việc'}</span>;
    }
  };

  const handleOpenEdit = (emp, e) => {
    e.stopPropagation();
    setEditingEmployee(emp);
    setIsAddModalOpen(true);
  };

  const handleDelete = (emp, e) => {
    e.stopPropagation();
    const name = emp.FullName || emp.name;
    const code = emp.EmployeeCode || emp.id;
    if (window.confirm(`Xác nhận xóa hồ sơ nhân viên ${name} (${code}) khỏi CSDL?`)) {
      onDeleteEmployee(emp.EmployeeId || emp.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* TOOLBAR: TIÊU ĐỀ & NÚT THÊM MỚI */}
      <div className="ph" style={{ marginBottom: 0 }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, color: '#042f2e' }}>
            Quản lý hồ sơ nhân viên (tblEmployee)
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
            Hệ thống dữ liệu động kết nối trực tiếp CSDL SQL Server (HRM_Enterprise_DB)
          </p>
        </div>
        <div className="ph-tools">
          <button
            className="btn pri"
            onClick={() => {
              setEditingEmployee(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Thêm nhân viên mới</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="tbl-card">
        <div className="tbl-tools" style={{ flexWrap: 'wrap', gap: '10px' }}>
          {/* SEARCH INPUT */}
          <div className="search" style={{ minWidth: '260px' }}>
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo họ tên, mã NV, SĐT..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* DEPARTMENT FILTER */}
          <select
            className="inp"
            value={departmentFilter}
            onChange={(e) => onDepartmentChange(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((d) => (
              <option key={d.DepartmentId} value={d.DepartmentId}>
                {d.DepartmentName}
              </option>
            ))}
          </select>

          {/* WORK STATUS FILTER */}
          <select
            className="inp"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Đang làm việc">Đang làm việc</option>
            <option value="Thử việc">Thử việc</option>
            <option value="Tạm hoãn">Tạm hoãn</option>
            <option value="Đã thôi việc">Đã thôi việc</option>
          </select>

          <span className="grow"></span>

          <span className="small muted">
            Tổng số: <strong>{pagination.total || employees.length}</strong> nhân sự
          </span>
        </div>

        {/* DATA TABLE */}
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>MÃ NV</th>
                <th>ẢNH</th>
                <th>HỌ VÀ TÊN</th>
                <th>EMAIL</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th>PHÒNG BAN</th>
                <th>CHỨC VỤ</th>
                <th>TRẠNG THÁI</th>
                <th className="c">FACE ID</th>
                <th className="act">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div className="status-dot-pulse" style={{ background: '#0f766e' }}></div>
                      <span>Đang tải danh sách nhân sự từ CSDL SQL Server...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={10}
                  title="Không tìm thấy nhân viên phù hợp"
                  description="Thử tìm kiếm với từ khóa khác hoặc bấm 'Thêm nhân viên mới' để tạo mới."
                  actionLabel="Thêm nhân viên mới"
                  onAction={() => {
                    setEditingEmployee(null);
                    setIsAddModalOpen(true);
                  }}
                />
              ) : (
                employees.map((emp) => {
                  const empName = emp.FullName || emp.name || 'Nhân viên';
                  const empCode = emp.EmployeeCode || emp.id || 'NV---';
                  const isFace = !!(emp.FaceRegistered ?? emp.faceRegistered);

                  return (
                    <tr
                      key={emp.EmployeeId || emp.id}
                      className="click"
                      onClick={() => onViewProfile(emp)}
                    >
                      {/* Cột 1: Mã NV */}
                      <td>
                        <code style={{ fontWeight: 700, color: '#0f766e', fontSize: '13px' }}>
                          {empCode}
                        </code>
                      </td>

                      {/* Cột 2: Ảnh đại diện */}
                      <td onClick={(e) => e.stopPropagation()}>
                        {emp.AvatarUrl ? (
                          <img
                            src={emp.AvatarUrl}
                            alt={empName}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #0f766e'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#ccfbf1',
                              color: '#0f766e',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 700,
                              fontSize: '14px'
                            }}
                          >
                            {getInitials(empName)}
                          </div>
                        )}
                      </td>

                      {/* Cột 3: Họ và tên */}
                      <td>
                        <b style={{ color: '#0f172a', fontSize: '14px' }}>{empName}</b>
                      </td>

                      {/* Cột 4: Email */}
                      <td>
                        <span style={{ color: '#475569', fontSize: '13px' }}>
                          {emp.Email || emp.email || '-'}
                        </span>
                      </td>

                      {/* Cột 5: SĐT */}
                      <td>
                        <span style={{ color: '#475569', fontSize: '13px' }}>
                          {emp.Phone || emp.phone || '-'}
                        </span>
                      </td>

                      {/* Cột 6: Phòng ban */}
                      <td>
                        <span style={{ fontWeight: 500, color: '#1e293b' }}>
                          {emp.DepartmentName || emp.department || '-'}
                        </span>
                      </td>

                      {/* Cột 7: Chức vụ */}
                      <td>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>
                          {emp.PositionName || emp.position || '-'}
                        </span>
                      </td>

                      {/* Cột 8: Trạng thái */}
                      <td>
                        {getStatusBadge(emp.WorkStatus || emp.status)}
                      </td>

                      {/* Cột 9: Face ID */}
                      <td className="c">
                        <span className={`badge ${isFace ? 'b-p' : 'b-amber'}`} style={{ fontSize: '11px' }}>
                          {isFace ? 'Đã quét' : 'Chưa có'}
                        </span>
                      </td>

                      {/* Cột 10: Thao tác */}
                      <td className="act" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="ibtn"
                          title="Xem Hồ sơ 360°"
                          onClick={() => onViewProfile(emp)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="ibtn"
                          title="Chỉnh sửa thông tin"
                          onClick={(e) => handleOpenEdit(emp, e)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="ibtn del"
                          title="Xóa nhân viên"
                          onClick={(e) => handleDelete(emp, e)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG (PAGINATION) */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}
          >
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Trang <strong>{pagination.page}</strong> / <strong>{pagination.totalPages}</strong> (Tổng <strong>{pagination.total}</strong> bản ghi)
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                className="btn sm"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                <ChevronLeft size={14} />
                <span>Trước</span>
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
                const isCurrent = p === pagination.page;
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: isCurrent ? '1px solid #0f766e' : '1px solid #cbd5e1',
                      background: isCurrent ? '#0f766e' : '#ffffff',
                      color: isCurrent ? '#ffffff' : '#334155',
                      fontWeight: isCurrent ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                className="btn sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                <span>Tiếp</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL THÊM / SỬA NHÂN VIÊN */}
      <EmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={async (formData) => {
          if (editingEmployee) {
            await onUpdateEmployee(editingEmployee.EmployeeId || editingEmployee.id, formData);
          } else {
            await onCreateEmployee(formData);
          }
        }}
        employee={editingEmployee}
        departments={departments}
        positions={positions}
      />
    </div>
  );
}

