import React, { useState, useEffect } from 'react';
import {
  Mail, Phone, Calendar, X, Users, Search, RefreshCw, CheckCircle2,
  Clock, AlertTriangle, ShieldCheck, FileText, UserCheck, ShieldAlert,
  Building, Briefcase, Award, User, MapPin, CreditCard, DollarSign
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import EmployeeService from '../../../services/EmployeeService';
import '../../../styles/roles/manager/TeamMembersView.css';

export default function TeamMembersView() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    working: 0,
    late: 0,
    absent: 0,
    faceActive: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [faceFilter, setFaceFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetail, setMemberDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('profile');

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await EmployeeService.getTeamMembers({
        search: searchTerm,
        faceStatus: faceFilter !== 'all' ? faceFilter : undefined
      });
      if (res) {
        setTeamMembers(res.members || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không thể tải danh sách thành viên nhóm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [faceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTeam();
  };

  const handleOpenModal = async (member) => {
    setSelectedMember(member);
    setActiveModalTab('profile');
    try {
      setLoadingDetail(true);
      const detail = await EmployeeService.getTeamMemberDetail(member.EmployeeId);
      setMemberDetail(detail || member);
    } catch (err) {
      console.error(err);
      setMemberDetail(member);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    setMemberDetail(null);
  };

  const formatVND = (num) => {
    if (!num && num !== 0) return 'Chưa cập nhật';
    return `${Math.round(+num).toLocaleString('vi-VN')} đ`;
  };

  return (
    <div className="team-members-container">
      <PageHeader
        breadcrumb="Quản lý Nhóm / Thành viên"
        title="Danh sách Nhân sự Trực thuộc Quản lý"
        subtitle="Theo dõi chi tiết thông tin hồ sơ, hợp đồng, trạng thái điểm danh hôm nay và định danh sinh trắc học Face ID của các thành viên trực thuộc"
      />

      <div className="team-kpi-row">
        <div className="team-kpi-card">
          <div className="team-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="team-kpi-num">{stats.total}</div>
            <div className="team-kpi-label">Tổng thành viên nhóm</div>
          </div>
        </div>

        <div className="team-kpi-card">
          <div className="team-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div className="team-kpi-num">{stats.working}</div>
            <div className="team-kpi-label">Đang làm việc hôm nay</div>
          </div>
        </div>

        <div className="team-kpi-card">
          <div className="team-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="team-kpi-num">{stats.late}</div>
            <div className="team-kpi-label">Đi làm muộn hôm nay</div>
          </div>
        </div>

        <div className="team-kpi-card">
          <div className="team-kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="team-kpi-num">{stats.absent}</div>
            <div className="team-kpi-label">Chưa check-in / Vắng</div>
          </div>
        </div>

        <div className="team-kpi-card">
          <div className="team-kpi-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="team-kpi-num">
              {stats.faceActive} <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>({stats.total > 0 ? Math.round((stats.faceActive / stats.total) * 100) : 0}%)</span>
            </div>
            <div className="team-kpi-label">Đã kích hoạt Face ID</div>
          </div>
        </div>
      </div>

      <div className="team-filter-bar">
        <form onSubmit={handleSearchSubmit} className="team-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã nhân viên, số điện thoại, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <select
          className="team-filter-select"
          value={faceFilter}
          onChange={(e) => setFaceFilter(e.target.value)}
        >
          <option value="all">Tất cả Face ID</option>
          <option value="active">Đã đăng ký Face ID</option>
          <option value="pending">Chưa có Face ID</option>
        </select>

        <button className="btn" onClick={fetchTeam} title="Tải lại danh sách" disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px auto', display: 'block' }} />
          <span>Đang đồng bộ dữ liệu nhân sự nhóm từ hệ thống...</span>
        </div>
      ) : teamMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy nhân sự phù hợp"
          description="Không có nhân viên nào trực thuộc quyền quản lý phù hợp với điều kiện tìm kiếm hoặc bộ phận của bạn."
        />
      ) : (
        <div className="team-grid">
          {teamMembers.map((emp) => {
            const isLate = emp.TodayAttendanceCode === 'M' || (emp.TodayLateMinutes && emp.TodayLateMinutes > 0);
            const isCheckedIn = !!emp.TodayTimeIn;

            return (
              <div key={emp.EmployeeId} className="card team-card">
                <div className="team-card-head">
                  {emp.AvatarUrl ? (
                    <img
                      src={emp.AvatarUrl}
                      alt={emp.FullName}
                      className="team-avatar-lg"
                    />
                  ) : (
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0f766e, #0d9488)',
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '700',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      {emp.FullName ? emp.FullName.trim().slice(-1) : 'U'}
                    </div>
                  )}
                  <div className="team-head-info">
                    <div className="team-head-top">
                      <h3 className="team-member-name">{emp.FullName}</h3>
                      <StatusBadge status={emp.WorkStatus || 'Đang làm việc'} />
                    </div>
                    <div className="team-member-pos">{emp.PositionName || 'Nhân viên'}</div>
                    <div className="team-member-id">{emp.EmployeeCode} · {emp.DepartmentName}</div>
                  </div>
                </div>

                <div className="team-status-strip">
                  <span className="muted small">Điểm danh hôm nay:</span>
                  {isCheckedIn ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      background: isLate ? '#fffbeb' : '#ecfdf5',
                      color: isLate ? '#b45309' : '#047857',
                      border: `1px solid ${isLate ? '#fde68a' : '#a7f3d0'}`
                    }}>
                      <Clock size={12} />
                      {emp.TodayTimeIn} {isLate ? `(Muộn ${emp.TodayLateMinutes}p)` : '(Đúng giờ)'}
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 500,
                      background: '#f1f5f9',
                      color: '#64748b'
                    }}>
                      Chưa check-in
                    </span>
                  )}
                </div>

                <div className="team-contact-list">
                  <div className="team-contact-item">
                    <Mail size={14} color="#64748b" />
                    <span>{emp.Email || 'Chưa cập nhật email'}</span>
                  </div>
                  <div className="team-contact-item">
                    <Phone size={14} color="#64748b" />
                    <span>{emp.Phone || 'Chưa cập nhật SĐT'}</span>
                  </div>
                  <div className="team-contact-item">
                    <Calendar size={14} color="#64748b" />
                    <span>Ngày vào: {emp.JoinDate || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div className="team-card-foot">
                  <span className={emp.FaceRegistered ? 'team-face-badge-valid' : 'team-face-badge-pending'}>
                    {emp.FaceRegistered ? '✓ Face ID: Đã kích hoạt' : '⚠ Chưa có Face ID'}
                  </span>
                  <button
                    className="btn sm pri"
                    onClick={() => handleOpenModal(emp)}
                  >
                    <User size={13} />
                    <span>Hồ sơ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedMember && (
        <div className="modal-wrap" onClick={handleCloseModal}>
          <div className="modal team-modal-popup" onClick={(e) => e.stopPropagation()}>
            <div className="team-modal-head">
              <div className="team-modal-profile">
                {selectedMember.AvatarUrl ? (
                  <img
                    src={selectedMember.AvatarUrl}
                    alt={selectedMember.FullName}
                    className="team-modal-avatar"
                  />
                ) : (
                  <div className="team-modal-avatar-placeholder">
                    {selectedMember.FullName ? selectedMember.FullName.trim().slice(-1) : 'U'}
                  </div>
                )}
                <div className="team-modal-title-area">
                  <h3 className="team-modal-name">
                    <span>{selectedMember.FullName}</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#e0f2fe',
                      color: '#0369a1'
                    }}>
                      {selectedMember.EmployeeCode}
                    </span>
                  </h3>
                  <div className="team-modal-meta">
                    <span style={{ color: '#0f766e', fontWeight: 600 }}>{selectedMember.PositionName || 'Nhân viên'}</span>
                    <span>•</span>
                    <span>{selectedMember.DepartmentName || 'Khối Kỹ Thuật (IT)'}</span>
                    <span>•</span>
                    <StatusBadge status={selectedMember.WorkStatus || 'Đang làm việc'} />
                  </div>
                </div>
              </div>
              <button
                className="team-modal-close-btn"
                onClick={handleCloseModal}
                title="Đóng cửa sổ"
              >
                <X size={18} />
              </button>
            </div>

            <div className="team-modal-tabs">
              <button
                className={`team-modal-tab-btn ${activeModalTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('profile')}
              >
                Lý lịch & Liên hệ
              </button>
              <button
                className={`team-modal-tab-btn ${activeModalTab === 'contract' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('contract')}
              >
                Hợp đồng lao động ({memberDetail?.contracts?.length || (selectedMember.ContractType ? 1 : 0)})
              </button>
              <button
                className={`team-modal-tab-btn ${activeModalTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('attendance')}
              >
                Chấm công & Sinh trắc
              </button>
            </div>

            <div className="team-modal-body">
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  <RefreshCw size={22} className="spin" style={{ margin: '0 auto 10px auto', display: 'block', color: '#0f766e' }} />
                  <span>Đang tải thông tin chi tiết hồ sơ nhân sự...</span>
                </div>
              ) : (
                <>
                  {activeModalTab === 'profile' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="team-detail-grid">
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Số CCCD / CMND</span>
                          <span className="team-detail-val mono">{memberDetail?.IdCardNumber || selectedMember.IdCardNumber || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Số điện thoại</span>
                          <span className="team-detail-val">{memberDetail?.Phone || selectedMember.Phone || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Email công vụ / cá nhân</span>
                          <span className="team-detail-val">{memberDetail?.Email || selectedMember.Email || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Giới tính & Ngày sinh</span>
                          <span className="team-detail-val">
                            {(memberDetail?.Gender || selectedMember.Gender || 'Nam')} · {(memberDetail?.BirthDate || selectedMember.BirthDate || 'Chưa cập nhật')}
                          </span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Mã số thuế cá nhân</span>
                          <span className="team-detail-val mono">{memberDetail?.TaxCode || selectedMember.TaxCode || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Số sổ BHXH</span>
                          <span className="team-detail-val mono">{memberDetail?.InsuranceBookNumber || selectedMember.InsuranceBookNumber || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Tài khoản ngân hàng</span>
                          <span className="team-detail-val mono">{memberDetail?.BankAccountNumber || selectedMember.BankAccountNumber || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Ngân hàng thụ hưởng</span>
                          <span className="team-detail-val">{memberDetail?.BankName || selectedMember.BankName || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="team-detail-tile" style={{ gridColumn: 'span 2' }}>
                          <span className="team-detail-label">Địa chỉ thường trú</span>
                          <span className="team-detail-val">{memberDetail?.Address || selectedMember.Address || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Quản lý trực tiếp</span>
                          <span className="team-detail-val">{memberDetail?.ManagerName || selectedMember.ManagerName || 'Trần Thị Bích'}</span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Ngày gia nhập công ty</span>
                          <span className="team-detail-val">{memberDetail?.JoinDate || selectedMember.JoinDate || 'Chưa cập nhật'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModalTab === 'contract' && (
                    <div>
                      {memberDetail?.contracts && memberDetail.contracts.length > 0 ? (
                        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                          <table className="team-contract-table" style={{ margin: 0 }}>
                            <thead>
                              <tr>
                                <th>Số hợp đồng</th>
                                <th>Loại hợp đồng</th>
                                <th>Ngày bắt đầu</th>
                                <th>Ngày kết thúc</th>
                                <th>Lương thỏa thuận</th>
                                <th>Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {memberDetail.contracts.map((c) => (
                                <tr key={c.ContractId}>
                                  <td style={{ fontWeight: 700, color: '#0f766e', fontFamily: 'monospace' }}>{c.ContractNumber}</td>
                                  <td>{c.ContractType}</td>
                                  <td>{c.StartDate || '-'}</td>
                                  <td>{c.EndDate || 'Vô thời hạn'}</td>
                                  <td style={{ fontWeight: 600 }}>{formatVND(c.AgreedSalary)}</td>
                                  <td>
                                    <StatusBadge status={c.Status || 'Hiệu lực'} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : selectedMember.ContractType ? (
                        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                          <table className="team-contract-table" style={{ margin: 0 }}>
                            <thead>
                              <tr>
                                <th>Loại hợp đồng</th>
                                <th>Lương thỏa thuận</th>
                                <th>Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{selectedMember.ContractType}</td>
                                <td style={{ fontWeight: 600 }}>{formatVND(selectedMember.AgreedSalary)}</td>
                                <td><StatusBadge status="Hiệu lực" /></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', background: '#f8fafc', borderRadius: '10px' }}>
                          <FileText size={24} style={{ margin: '0 auto 8px auto', display: 'block', color: '#94a3b8' }} />
                          <span>Chưa có dữ liệu hợp đồng lao động lưu trên hệ thống.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeModalTab === 'attendance' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="team-detail-grid">
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Giờ vào ca hôm nay</span>
                          <span className="team-detail-val" style={{ color: selectedMember.TodayTimeIn ? '#059669' : '#dc2626' }}>
                            {selectedMember.TodayTimeIn || 'Chưa check-in'}
                          </span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Giờ ra về hôm nay</span>
                          <span className="team-detail-val">{selectedMember.TodayTimeOut || 'Chưa checkout'}</span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Số phút đi muộn</span>
                          <span className="team-detail-val" style={{ color: selectedMember.TodayLateMinutes > 0 ? '#d97706' : '#059669' }}>
                            {selectedMember.TodayLateMinutes > 0 ? `${selectedMember.TodayLateMinutes} phút` : '0 phút (Đúng giờ)'}
                          </span>
                        </div>
                        <div className="team-detail-tile">
                          <span className="team-detail-label">Phương thức điểm danh</span>
                          <span className="team-detail-val">{selectedMember.TodayCheckinMethod || 'Kiosk OpenCV Camera'}</span>
                        </div>
                      </div>

                      <div style={{
                        padding: '16px',
                        background: selectedMember.FaceRegistered ? '#f0fdfa' : '#fffbeb',
                        border: `1px solid ${selectedMember.FaceRegistered ? '#ccfbf1' : '#fde68a'}`,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        {selectedMember.FaceRegistered ? (
                          <>
                            <ShieldCheck size={24} color="#059669" />
                            <div>
                              <div style={{ fontWeight: 700, color: '#047857', fontSize: '13.5px' }}>Face ID AI đã sẵn sàng</div>
                              <div style={{ fontSize: '12px', color: '#065f46' }}>Dữ liệu vector khuôn mặt 128 chiều đã được nạp vào mô hình ResNet50 OpenCV. Nhân sự có thể check-in tự động tại Kiosk.</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <ShieldAlert size={24} color="#d97706" />
                            <div>
                              <div style={{ fontWeight: 700, color: '#b45309', fontSize: '13.5px' }}>Chưa đăng ký ảnh khuôn mặt sinh trắc học</div>
                              <div style={{ fontSize: '12px', color: '#92400e' }}>Nhân sự cần đăng ký Face ID qua cổng Onboarding hoặc phân hệ HR để kích hoạt điểm danh camera.</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="team-modal-foot">
              <button className="btn" onClick={handleCloseModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
