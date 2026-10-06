import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export default function SearchFilter({
  searchPlaceholder = "Tìm kiếm...",
  searchValue,
  onSearchChange,
  departmentValue,
  onDepartmentChange,
  statusValue,
  onStatusChange,
  statusOptions = [],
  departments = ["Tất cả", "Khối Kỹ Thuật (IT)", "Phòng Nhân sự", "Marketing & Truyền thông", "Tài chính - Kế toán", "Kinh doanh & Bán hàng"],
  onReset
}) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
      marginBottom: '18px',
      background: '#ffffff',
      padding: '14px 18px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          className="form-control"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ paddingLeft: '36px', height: '38px' }}
        />
      </div>

      {/* Department Filter */}
      {onDepartmentChange && (
        <div style={{ width: '180px' }}>
          <select
            className="form-control"
            value={departmentValue}
            onChange={(e) => onDepartmentChange(e.target.value)}
            style={{ height: '38px' }}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept === "Tất cả" ? "" : dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Filter */}
      {onStatusChange && statusOptions.length > 0 && (
        <div style={{ width: '160px' }}>
          <select
            className="form-control"
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{ height: '38px' }}
          >
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Reset */}
      {onReset && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={onReset}
          title="Đặt lại bộ lọc"
          style={{ height: '38px', padding: '0 12px' }}
        >
          <RotateCcw size={14} />
          <span>Làm mới</span>
        </button>
      )}
    </div>
  );
}
