import React, { useState } from 'react';
import { Mail, Phone, Calendar, X } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import { Users } from 'lucide-react';
import { employeesData, attendanceHistoryData } from '../../../data/mockData';
import '../../../styles/roles/manager/TeamMembersView.css';

export default function TeamMembersView() {
  const teamEmployees = (employeesData || []).filter(e => e.department === 'Khối Kỹ Thuật (IT)' || e.manager === 'Trần Thị Bích');
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <div className="team-members-container">
      <PageHeader
        breadcrumb="Quản lý Nhóm / Thành viên"
        title="Danh sách Nhân sự Trực thuộc Bộ phận"
        subtitle="Theo dõi thông tin liên lạc, hồ sơ pháp lý, tình hình chấm công và trạng thái công tác của thành viên trong nhóm"
      />

      {teamEmployees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có thành viên trực thuộc bộ phận"
          description="Danh sách nhân sự thuộc phòng ban quản lý sẽ hiển thị tại đây khi kết nối dữ liệu từ CSDL."
        />
      ) : (
        <div className="team-grid">
          {teamEmployees.map(emp => {
          const todayAttendance = attendanceHistoryData.find(a => a.empId === emp.id);
          return (
            <div key={emp.id} className="card team-card">
              <div className="team-card-head">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="team-avatar-lg"
                />
                <div className="team-head-info">
                  <div className="team-head-top">
                    <h3 className="team-member-name">{emp.name}</h3>
                    <StatusBadge status={emp.status} />
                  </div>
                  <div className="team-member-pos">{emp.position}</div>
                  <div className="team-member-id">Mã: {emp.id}</div>
                </div>
              </div>

              <div className="team-status-strip">
                <span className="muted small">Điểm danh hôm nay:</span>
                {todayAttendance ? (
                  <StatusBadge status={todayAttendance.status} text={`${todayAttendance.timeIn} - ${todayAttendance.status}`} />
                ) : (
                  <StatusBadge status="ABSENT" text="Chưa check-in" />
                )}
              </div>

              <div className="team-contact-list">
                <div className="team-contact-item">
                  <Mail size={14} color="#64748b" />
                  <span>{emp.email}</span>
                </div>
                <div className="team-contact-item">
                  <Phone size={14} color="#64748b" />
                  <span>{emp.phone}</span>
                </div>
                <div className="team-contact-item">
                  <Calendar size={14} color="#64748b" />
                  <span>Ngày vào: {emp.joinDate}</span>
                </div>
              </div>

              <div className="team-card-foot">
                <span className={emp.faceRegistered ? 'team-face-badge-valid' : 'team-face-badge-pending'}>
                  {emp.faceRegistered ? '✓ Face ID: Đã kích hoạt' : '⚠ Chưa đăng ký Face ID'}
                </span>
                <button
                  className="btn sm"
                  onClick={() => setSelectedMember(emp)}
                >
                  Hồ sơ 360°
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {selectedMember && (
        <div className="modal-backdrop">
          <div className="modal-box team-modal-card">
            <div className="team-modal-head">
              <div className="team-modal-profile">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="team-modal-avatar"
                />
                <div>
                  <h3 className="team-member-name" style={{ fontSize: '16px' }}>
                    {selectedMember.name}
                  </h3>
                  <div className="team-member-pos">
                    {selectedMember.position} · {selectedMember.id}
                  </div>
                </div>
              </div>
              <button
                className="btn sm"
                onClick={() => setSelectedMember(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="team-profile-grid">
              <div className="team-profile-field">
                <label>Số CCCD / CMND</label>
                <div className="val-mono">{selectedMember.idCard || '-'}</div>
              </div>
              <div className="team-profile-field">
                <label>Mã số thuế cá nhân</label>
                <div className="val-mono">{selectedMember.taxCode || '-'}</div>
              </div>
              <div className="team-profile-field">
                <label>Số sổ BHXH</label>
                <div className="val-mono">{selectedMember.socialInsuranceNo || '-'}</div>
              </div>
              <div className="team-profile-field">
                <label>Tài khoản ngân hàng</label>
                <div className="val-mono">{selectedMember.bankAccount || '-'}</div>
              </div>
              <div className="team-profile-field">
                <label>Ngân hàng chi trả</label>
                <div className="val">{selectedMember.bankName || '-'}</div>
              </div>
              <div className="team-profile-field">
                <label>Loại hợp đồng</label>
                <div className="val">{selectedMember.contractType}</div>
              </div>
              <div className="team-profile-field">
                <label>Ngày gia nhập</label>
                <div className="val">{selectedMember.joinDate}</div>
              </div>
              <div className="team-profile-field">
                <label>Nơi cư trú hiện tại</label>
                <div className="val">{selectedMember.address}</div>
              </div>
            </div>

            <div className="kpi-actions-row">
              <button className="btn pri" onClick={() => setSelectedMember(null)}>
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
