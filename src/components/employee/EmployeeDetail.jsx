import React, { useState } from 'react';
import {
  ArrowLeft, Edit3, Mail, Phone, MapPin,
  Calendar, Shield, Award, Laptop, FileText,
  Clock, CheckCircle, AlertCircle, ScanFace
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import StatusBadge from '../common/StatusBadge';
import { attendanceHistoryData, leaveRequestsData, assetsData, contractsData } from '../../data/mockData';

export default function EmployeeDetail({ employee, onBack, onNavigateFaceRegistration }) {
  const [activeTab, setActiveTab] = useState('basic');

  if (!employee) return null;

  const empAttendance = attendanceHistoryData.filter(a => a.empId === employee.id);
  const empLeave = leaveRequestsData.filter(l => l.empId === employee.id);
  const empAssets = assetsData.filter(ast => ast.assignedTo.includes(employee.id));
  const empContract = contractsData.find(c => c.empId === employee.id);

  return (
    <div>
      <PageHeader
        title={`Hồ sơ Nhân viên: ${employee.name}`}
        subtitle={`Mã nhân viên: ${employee.id} • ${employee.department}`}
        breadcrumb="Nhân sự / Hồ sơ chi tiết"
        actions={
          <>
            <button className="btn btn-secondary" onClick={onBack}>
              <ArrowLeft size={16} />
              Quay lại danh sách
            </button>
            <button className="btn btn-primary" onClick={() => alert('Chức năng chỉnh sửa hồ sơ')}>
              <Edit3 size={15} />
              Chỉnh sửa thông tin
            </button>
          </>
        }
      />

      {/* Profile Header Banner */}
      <div className="hrm-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img
              src={employee.avatar}
              alt={employee.name}
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {employee.name}
                </h2>
                <StatusBadge status={employee.status} />
              </div>
              <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
                <strong style={{ color: '#0f172a' }}>{employee.id}</strong> • {employee.position} • {employee.department}
              </div>
              <div style={{ display: 'flex', gap: '18px', marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={14} color="#3b82f6" /> {employee.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Phone size={14} color="#10b981" /> {employee.phone}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} color="#ea580c" /> {employee.address}
                </span>
              </div>
            </div>
          </div>

          {/* Face OpenCV status card */}
          <div style={{
            background: employee.faceRegistered ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${employee.faceRegistered ? '#a7f3d0' : '#fde68a'}`,
            padding: '12px 18px',
            borderRadius: '10px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Dữ liệu OpenCV</div>
            <div style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: employee.faceRegistered ? '#065f46' : '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'flex-end',
              margin: '3px 0'
            }}>
              <ScanFace size={16} />
              {employee.faceRegistered ? 'Đã kích hoạt Face ID' : 'Chưa có Face Model'}
            </div>
            <button
              onClick={() => onNavigateFaceRegistration(employee)}
              className="btn btn-sm btn-outline-primary"
              style={{ marginTop: '6px' }}
            >
              {employee.faceRegistered ? 'Đăng ký lại khuôn mặt' : 'Đăng ký khuôn mặt ngay'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="hrm-tabs">
        <button
          className={`hrm-tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          <FileText size={16} />
          Thông tin cơ bản & Gia đình
        </button>
        <button
          className={`hrm-tab-btn ${activeTab === 'contract' ? 'active' : ''}`}
          onClick={() => setActiveTab('contract')}
        >
          <Award size={16} />
          Hợp đồng & Lương
        </button>
        <button
          className={`hrm-tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <Clock size={16} />
          Lịch sử Chấm công ({empAttendance.length})
        </button>
        <button
          className={`hrm-tab-btn ${activeTab === 'leave' ? 'active' : ''}`}
          onClick={() => setActiveTab('leave')}
        >
          <Calendar size={16} />
          Nghỉ phép ({empLeave.length})
        </button>
        <button
          className={`hrm-tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          <Laptop size={16} />
          Tài sản cấp phát ({empAssets.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'basic' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="hrm-card">
            <div className="card-header">
              <span className="card-title">Thông tin nhân sự</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: '12px', fontSize: '13.5px' }}>
              <span style={{ color: '#64748b' }}>Họ và tên:</span>
              <span style={{ fontWeight: 600 }}>{employee.name}</span>
              <span style={{ color: '#64748b' }}>Ngày sinh:</span>
              <span>{employee.birthDate}</span>
              <span style={{ color: '#64748b' }}>Giới tính:</span>
              <span>{employee.gender}</span>
              <span style={{ color: '#64748b' }}>Ngày vào công ty:</span>
              <span>{employee.joinDate}</span>
              <span style={{ color: '#64748b' }}>Quản lý trực tiếp:</span>
              <span style={{ fontWeight: 500, color: '#2563eb' }}>{employee.manager}</span>
              <span style={{ color: '#64748b' }}>Trạng thái làm việc:</span>
              <span><StatusBadge status={employee.status} /></span>
            </div>
          </div>

          <div className="hrm-card">
            <div className="card-header">
              <span className="card-title">Liên hệ & Thường trú</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: '12px', fontSize: '13.5px' }}>
              <span style={{ color: '#64748b' }}>Email công ty:</span>
              <span>{employee.email}</span>
              <span style={{ color: '#64748b' }}>Email cá nhân:</span>
              <span>{employee.email.replace('@company.com', '@gmail.com')}</span>
              <span style={{ color: '#64748b' }}>Số điện thoại:</span>
              <span>{employee.phone}</span>
              <span style={{ color: '#64748b' }}>Địa chỉ hiện tại:</span>
              <span>{employee.address}</span>
              <span style={{ color: '#64748b' }}>Người liên hệ khẩn cấp:</span>
              <span>Nguyễn Thị Mơ (Mẹ ruột - 0912 888 999)</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contract' && (
        <div className="hrm-card">
          <div className="card-header">
            <span className="card-title">Thông tin hợp đồng lao động & Chế độ</span>
          </div>
          {empContract ? (
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: '14px', fontSize: '14px' }}>
              <span style={{ color: '#64748b' }}>Mã hợp đồng:</span>
              <span style={{ fontWeight: 600 }}>{empContract.id}</span>
              <span style={{ color: '#64748b' }}>Loại hợp đồng:</span>
              <span>{empContract.type}</span>
              <span style={{ color: '#64748b' }}>Ngày bắt đầu ký:</span>
              <span>{empContract.signDate}</span>
              <span style={{ color: '#64748b' }}>Ngày kết thúc:</span>
              <span>{empContract.endDate}</span>
              <span style={{ color: '#64748b' }}>Mức lương cơ bản:</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#059669' }}>
                {employee.baseSalary.toLocaleString('vi-VN')} VNĐ / tháng
              </span>
              <span style={{ color: '#64748b' }}>Trạng thái hợp đồng:</span>
              <span><StatusBadge status={empContract.status} /></span>
            </div>
          ) : (
            <div style={{ padding: '20px', color: '#64748b' }}>Chưa có hợp đồng nào được cập nhật cho nhân viên này.</div>
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="hrm-table-container">
          <table className="hrm-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Giờ vào (Check-in)</th>
                <th>Giờ ra (Check-out)</th>
                <th>Số giờ làm</th>
                <th>Thiết bị nhận diện</th>
                <th>Độ tin cậy</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {empAttendance.length > 0 ? (
                empAttendance.map(a => (
                  <tr key={a.id}>
                    <td>{a.date}</td>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{a.timeIn}</td>
                    <td>{a.timeOut}</td>
                    <td>{a.workHours} giờ</td>
                    <td>{a.device}</td>
                    <td><span style={{ fontWeight: 600, color: '#059669' }}>{a.confidence}</span></td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Không có lịch sử chấm công phát sinh
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="hrm-table-container">
          <table className="hrm-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Loại nghỉ</th>
                <th>Thời gian</th>
                <th>Số ngày</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {empLeave.length > 0 ? (
                empLeave.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.id}</td>
                    <td>{l.type}</td>
                    <td>{l.startDate} - {l.endDate}</td>
                    <td>{l.days} ngày</td>
                    <td>{l.reason}</td>
                    <td><StatusBadge status={l.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Nhân viên chưa có đơn nghỉ phép nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="hrm-table-container">
          <table className="hrm-table">
            <thead>
              <tr>
                <th>Mã tài sản</th>
                <th>Tên thiết bị</th>
                <th>Danh mục</th>
                <th>Ngày cấp phát</th>
                <th>Tình trạng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {empAssets.length > 0 ? (
                empAssets.map(ast => (
                  <tr key={ast.id}>
                    <td style={{ fontWeight: 600 }}>{ast.code}</td>
                    <td style={{ fontWeight: 500, color: '#0f172a' }}>{ast.name}</td>
                    <td>{ast.category}</td>
                    <td>{ast.assignDate}</td>
                    <td>{ast.condition}</td>
                    <td><StatusBadge status={ast.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Chưa có thiết bị nào được cấp phát
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
