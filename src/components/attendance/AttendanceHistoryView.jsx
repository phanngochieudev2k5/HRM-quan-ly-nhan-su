import React, { useState } from 'react';
import { Calendar, Download, Filter, Search, RotateCcw, Clock, ShieldCheck } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import SearchFilter from '../common/SearchFilter';
import StatusBadge from '../common/StatusBadge';
import { attendanceHistoryData } from '../../data/mockData';

export default function AttendanceHistoryView() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState('21/04/2025');

  const filtered = attendanceHistoryData.filter(item => {
    const matchSearch =
      item.empName.toLowerCase().includes(search.toLowerCase()) ||
      item.empId.toLowerCase().includes(search.toLowerCase());
    const matchDept = !dept || item.dept === dept;
    const matchStatus = !status || item.status === status;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div>
      <PageHeader
        title="Lịch Sử Chấm Công Nhân Viên"
        subtitle="Dữ liệu chấm công tự động từ các trạm camera OpenCV và hệ thống ERP"
        breadcrumb="Chấm công / Lịch sử chấm công"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => alert('Xuất báo cáo chấm công dạng Excel')}>
              <Download size={15} /> Xuất bảng công Excel
            </button>
          </>
        }
      />

      <SearchFilter
        searchPlaceholder="Tìm theo tên nhân viên, mã NV..."
        searchValue={search}
        onSearchChange={setSearch}
        departmentValue={dept}
        onDepartmentChange={setDept}
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={[
          { value: 'PRESENT', label: 'Có mặt (Đúng giờ)' },
          { value: 'LATE', label: 'Đi muộn' },
          { value: 'EARLY', label: 'Về sớm' },
          { value: 'ABSENT', label: 'Vắng mặt' },
          { value: 'LEAVE', label: 'Nghỉ phép' }
        ]}
        onReset={() => { setSearch(''); setDept(''); setStatus(''); }}
      />

      {/* Summary Stat Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '18px'
      }}>
        <div className="hrm-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Tổng nhân sự cần công</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{attendanceHistoryData.length}</div>
        </div>
        <div className="hrm-card" style={{ padding: '14px 18px', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <div style={{ fontSize: '12px', color: '#065f46' }}>Có mặt đúng giờ</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>
            {attendanceHistoryData.filter(x => x.status === 'PRESENT').length}
          </div>
        </div>
        <div className="hrm-card" style={{ padding: '14px 18px', background: '#fffbeb', borderColor: '#fde68a' }}>
          <div style={{ fontSize: '12px', color: '#92400e' }}>Đi muộn / Về sớm</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#d97706' }}>
            {attendanceHistoryData.filter(x => x.status === 'LATE' || x.status === 'EARLY').length}
          </div>
        </div>
        <div className="hrm-card" style={{ padding: '14px 18px', background: '#fef2f2', borderColor: '#fecaca' }}>
          <div style={{ fontSize: '12px', color: '#991b1b' }}>Vắng mặt không phép</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>
            {attendanceHistoryData.filter(x => x.status === 'ABSENT').length}
          </div>
        </div>
        <div className="hrm-card" style={{ padding: '14px 18px', background: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div style={{ fontSize: '12px', color: '#1e40af' }}>Nghỉ phép có phép</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>
            {attendanceHistoryData.filter(x => x.status === 'LEAVE').length}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="hrm-table-container">
        <table className="hrm-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
              <th>Họ và tên</th>
              <th>Mã NV</th>
              <th>Phòng ban</th>
              <th>Ngày</th>
              <th>Giờ vào</th>
              <th>Giờ ra</th>
              <th>Số giờ làm</th>
              <th>Thiết bị nhận diện</th>
              <th>Độ chính xác</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={row.id}>
                <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.empName}</td>
                <td><span style={{ fontFamily: 'monospace', fontWeight: 600, background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{row.empId}</span></td>
                <td>{row.dept}</td>
                <td>{row.date}</td>
                <td style={{ fontWeight: 600, color: row.status === 'LATE' ? '#ea580c' : '#2563eb' }}>{row.timeIn}</td>
                <td style={{ fontWeight: 600 }}>{row.timeOut}</td>
                <td>{row.workHours > 0 ? `${row.workHours}h` : '-'}</td>
                <td style={{ fontSize: '12.5px', color: '#475569' }}>{row.device}</td>
                <td>
                  {row.confidence !== '-' ? (
                    <span style={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>
                      {row.confidence}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
