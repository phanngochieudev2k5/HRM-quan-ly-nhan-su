import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Eye, ShieldCheck,
  Search, Building2, FileText, ArrowLeft, Calendar, Phone, Mail, MapPin, User,
  CheckCircle2, Laptop, Clock, ShieldAlert, Award, ChevronDown, ChevronRight,
  Upload, Printer, Sparkles, UserPlus, Layers, ExternalLink
} from 'lucide-react';
import { onboardingList, contractsData, orgHierarchyData } from '../../../data/mockData';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import '../../../styles/roles/hr/HrEmployeesView.css';

export default function HrEmployeesView({
  employees = [],
  selectedEmployee,
  onSelectEmployee,
  onAddEmployee,
  onDeleteEmployee,
  subModule = 'list',
  onBackToList,
  onNavigateFaceRegistration,
  onNavigate
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [localEmployees, setLocalEmployees] = useState(employees || []);

  useEffect(() => {
    setLocalEmployees(employees || []);
  }, [employees]);

  const [onboardings, setOnboardings] = useState(onboardingList);
  const [contracts, setContracts] = useState(contractsData);
  const [contractSearch, setContractSearch] = useState('');
  const [contractStatusFilter, setContractStatusFilter] = useState('');
  const [expandedDept, setExpandedDept] = useState({
    ORG_HR: true,
    ORG_TECH: true,
    ORG_FIN: true,
    ORG_MKT: true
  });

  const toggleDept = (deptId) => {
    setExpandedDept(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  const handleToggleOnboardingStep = (onbId, stepKey) => {
    setOnboardings(prev => prev.map(item => {
      if (item.id === onbId) {
        const updatedSteps = {
          ...item.steps,
          [stepKey]: !item.steps[stepKey]
        };
        const allDone = Object.values(updatedSteps).every(Boolean);
        return {
          ...item,
          steps: updatedSteps,
          status: allDone ? 'Đã hoàn tất' : 'Đang tiếp nhận'
        };
      }
      return item;
    }));
  };

  const [newEmp, setNewEmp] = useState({
    ma: `NV00${employees.length + 1}`,
    name: '',
    gender: 'Nam',
    birthDate: '1995-01-01',
    phone: '',
    email: '',
    idCard: '',
    taxCode: '',
    department: 'Khối Kỹ Thuật (IT)',
    position: 'Chuyên viên kỹ thuật',
    joinDate: '2026-01-01',
    status: 'Đang làm việc',
    baseSalary: 18000000,
    insuranceSalary: 18000000,
    taxableAllowance: 1000000,
    lunchAllowance: 730000,
    attendanceBonus: 500000,
    seniorityBonus: 100000,
    transportAllowance: 500000,
    dependents: 0,
    bankName: 'Vietcombank',
    bankAccount: ''
  });

  const formatMoney = (n) => Math.round(+n || 0).toLocaleString('vi-VN');
  const formatVND = (n) => formatMoney(n) + ' đ';

  const departments = [...new Set(localEmployees.map(e => e.department))];

  const filteredEmployees = localEmployees.filter(e => {
    const matchDept = !deptFilter || e.department === deptFilter;
    const matchSearch = !searchTerm ||
      (e.name && e.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.id && e.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.phone && e.phone.includes(searchTerm));
    return matchDept && matchSearch;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const created = {
      ...newEmp,
      id: newEmp.ma
    };
    setLocalEmployees(prev => [created, ...prev]);
    if (onAddEmployee) onAddEmployee(created);
    setIsAddModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Xác nhận xóa nhân viên này khỏi hệ thống?')) {
      setLocalEmployees(prev => prev.filter(e => e.id !== id));
      if (onDeleteEmployee) onDeleteEmployee(id);
    }
  };

  if (subModule === 'profile' && selectedEmployee) {
    return (
      <div className="hr-employees-container">
        <div className="ph">
          <div>
            <h1>Hồ sơ chi tiết nhân sự: {selectedEmployee.name}</h1>
            <p>Mã NV: <strong>{selectedEmployee.id}</strong> · {selectedEmployee.department} · {selectedEmployee.position}</p>
          </div>
          <div className="ph-tools">
            <button className="btn" onClick={onBackToList}>
              <ArrowLeft size={15} />
              <span>Quay lại danh sách</span>
            </button>
            <button
              className="btn pri"
              onClick={() => onNavigateFaceRegistration && onNavigateFaceRegistration(selectedEmployee)}
            >
              <ShieldCheck size={15} />
              <span>Đăng ký Face ID OpenCV</span>
            </button>
          </div>
        </div>

        <div className="card">
          <div className="profile-card-header">
            <div className="profile-avatar-large">
              {(selectedEmployee?.name || 'N').split(' ').slice(-1)[0]?.[0] || 'N'}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#042f2e' }}>{selectedEmployee.name}</h2>
              <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
                {selectedEmployee.position} · {selectedEmployee.department}
              </div>
              <div className="row mt" style={{ gap: '6px' }}>
                <span className="badge b-green">{selectedEmployee.status || 'Đang làm việc'}</span>
                <span className={`badge ${selectedEmployee.faceRegistered ? 'b-p' : 'b-amber'}`}>
                  {selectedEmployee.faceRegistered ? 'Đã kích hoạt Face ID AI' : 'Chưa đăng ký Face ID'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="profile-detail-field">
              <span>Họ và tên:</span>
              <strong>{selectedEmployee.name}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Mã nhân viên:</span>
              <strong>{selectedEmployee.id}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Giới tính:</span>
              <strong>{selectedEmployee.gender || 'Nam'}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Số điện thoại:</span>
              <strong>{selectedEmployee.phone || '-'}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Email doanh nghiệp:</span>
              <strong>{selectedEmployee.email || '-'}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Số CCCD / CMND:</span>
              <strong>{selectedEmployee.idCard || '-'}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Mã số thuế cá nhân:</span>
              <strong>{selectedEmployee.taxCode || '-'}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Ngày vào làm:</span>
              <strong>{selectedEmployee.joinDate || '-'}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Lương cơ bản tháng:</span>
              <strong style={{ color: '#0f766e' }}>{formatVND(selectedEmployee.baseSalary || 20000000)}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Số người phụ thuộc (NPT):</span>
              <strong>{selectedEmployee.dependents ?? 1} người</strong>
            </div>
            <div className="profile-detail-field">
              <span>Ngân hàng thụ hưởng:</span>
              <strong>{selectedEmployee.bankName || 'Vietcombank'}</strong>
            </div>
            <div className="profile-detail-field">
              <span>Số tài khoản:</span>
              <strong>{selectedEmployee.bankAccount || '-'}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderTabsHeader = () => (
    <div className="attendance-tabs-header">
      <button
        className={`attendance-tab-btn ${subModule === 'list' || !subModule ? 'active' : ''}`}
        onClick={() => onNavigate && onNavigate('hr-employees', 'list')}
      >
        <User size={16} />
        <span>Danh sách nhân viên</span>
        <span className="badge b-p" style={{ marginLeft: '4px' }}>{localEmployees.length}</span>
      </button>
      <button
        className={`attendance-tab-btn ${subModule === 'onboarding' ? 'active' : ''}`}
        onClick={() => onNavigate && onNavigate('hr-employees', 'onboarding')}
      >
        <CheckCircle2 size={16} />
        <span>Tiếp nhận Onboarding</span>
        <span className="badge b-blue" style={{ marginLeft: '4px' }}>{onboardings.length}</span>
      </button>
      <button
        className={`attendance-tab-btn ${subModule === 'contracts' ? 'active' : ''}`}
        onClick={() => onNavigate && onNavigate('hr-employees', 'contracts')}
      >
        <FileText size={16} />
        <span>Hợp đồng lao động</span>
        <span className="badge b-amber" style={{ marginLeft: '4px' }}>{contracts.length}</span>
      </button>
      <button
        className={`attendance-tab-btn ${subModule === 'org' ? 'active' : ''}`}
        onClick={() => onNavigate && onNavigate('hr-employees', 'org')}
      >
        <Building2 size={16} />
        <span>Sơ đồ tổ chức</span>
      </button>
    </div>
  );

  if (subModule === 'onboarding') {
    return (
      <div className="hr-employees-container">
        {renderTabsHeader()}

        <div className="ph">
          <div>
            <h1>Quy trình tiếp nhận nhân sự mới (Onboarding)</h1>
            <p>Theo dõi tiến trình hội nhập, chuẩn bị tài khoản, hợp đồng và cấp phát trang thiết bị</p>
          </div>
          <div className="ph-tools">
            <button className="btn pri" onClick={() => alert('Thêm hồ sơ tiếp nhận nhân sự mới')}>
              <Plus size={15} />
              <span>Tiếp nhận nhân sự mới</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {onboardings.length === 0 ? (
            <EmptyState
              title="Chưa có hồ sơ tiếp nhận nhân sự mới (Onboarding)"
              description="Quy trình hội nhập sẽ hiển thị danh sách các bước chuẩn bị tài khoản, hợp đồng và đăng ký Face ID khi có nhân sự mới."
              actionLabel="Tiếp nhận nhân sự mới"
              onAction={() => alert('Thêm hồ sơ tiếp nhận nhân sự mới')}
            />
          ) : (
            onboardings.map(item => {
            const stepsCount = Object.values(item.steps).filter(Boolean).length;
            const isCompleted = stepsCount === 4;

            return (
              <div key={item.id} className="onboarding-card">
                <div className="onboarding-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar" style={{ width: '42px', height: '42px', fontSize: '16px' }}>
                      {item.name ? item.name.split(' ').slice(-1)[0][0] : 'N'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <b style={{ fontSize: '15px', color: '#042f2e' }}>{item.name}</b>
                        <span className={`badge ${isCompleted ? 'b-green' : 'b-blue'}`}>
                          {item.status} ({stepsCount}/4 bước)
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                        {item.position} · {item.department} · Ngày bắt đầu: <strong>{item.startDate}</strong> · Mentor: <strong>{item.mentor}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!item.steps.faceEnrolled && (
                      <button
                        className="btn sm pri"
                        onClick={() => onNavigateFaceRegistration && onNavigateFaceRegistration({ id: item.candidateId, name: item.name, department: item.department, position: item.position })}
                        title="Chuyển sang màn hình Camera Kiosk Face ID"
                      >
                        <ShieldCheck size={14} />
                        <span>Đăng ký Face ID OpenCV</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="onboarding-steps-grid">
                  <div
                    className={`onboarding-step-item click ${item.steps.accountCreated ? 'done' : ''}`}
                    onClick={() => handleToggleOnboardingStep(item.id, 'accountCreated')}
                    title="Bấm để đánh dấu đã hoàn thành"
                  >
                    <CheckCircle2 size={16} color={item.steps.accountCreated ? '#16a34a' : '#cbd5e1'} />
                    <span>1. Tạo tài khoản HRM</span>
                  </div>

                  <div
                    className={`onboarding-step-item click ${item.steps.contractSigned ? 'done' : ''}`}
                    onClick={() => handleToggleOnboardingStep(item.id, 'contractSigned')}
                    title="Bấm để đánh dấu đã hoàn thành"
                  >
                    <CheckCircle2 size={16} color={item.steps.contractSigned ? '#16a34a' : '#cbd5e1'} />
                    <span>2. Ký HĐLĐ thử việc</span>
                  </div>

                  <div
                    className={`onboarding-step-item click ${item.steps.assetAssigned ? 'done' : ''}`}
                    onClick={() => handleToggleOnboardingStep(item.id, 'assetAssigned')}
                    title="Bấm để đánh dấu đã hoàn thành"
                  >
                    <CheckCircle2 size={16} color={item.steps.assetAssigned ? '#16a34a' : '#cbd5e1'} />
                    <span>3. Bàn giao thiết bị làm việc</span>
                  </div>

                  <div
                    className={`onboarding-step-item click ${item.steps.faceEnrolled ? 'done' : ''}`}
                    onClick={() => handleToggleOnboardingStep(item.id, 'faceEnrolled')}
                    title="Bấm để đánh dấu đã hoàn thành"
                  >
                    <CheckCircle2 size={16} color={item.steps.faceEnrolled ? '#16a34a' : '#cbd5e1'} />
                    <span>4. Sinh trắc Face ID OpenCV</span>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    );
  }

  if (subModule === 'contracts') {
    const filteredContracts = contracts.filter(c => {
      const matchSearch = !contractSearch ||
        c.empName.toLowerCase().includes(contractSearch.toLowerCase()) ||
        c.id.toLowerCase().includes(contractSearch.toLowerCase()) ||
        c.empId.toLowerCase().includes(contractSearch.toLowerCase());
      const matchStatus = !contractStatusFilter || c.status === contractStatusFilter;
      return matchSearch && matchStatus;
    });

    return (
      <div className="hr-employees-container">
        {renderTabsHeader()}

        <div className="ph">
          <div>
            <h1>Quản lý Hợp đồng lao động</h1>
            <p>Hồ sơ pháp lý hợp đồng, thời hạn hiệu lực, mức lương và điều khoản nhân sự</p>
          </div>
          <div className="ph-tools">
            <button className="btn" onClick={() => window.print()}>
              <Printer size={15} />
              <span>In danh sách</span>
            </button>
            <button className="btn pri" onClick={() => alert('Thêm mới hợp đồng')}>
              <Plus size={15} />
              <span>Tạo hợp đồng mới</span>
            </button>
          </div>
        </div>

        <div className="tbl-card">
          <div className="tbl-tools">
            <div className="search">
              <Search size={15} />
              <input
                className="inp"
                placeholder="Tìm theo số HĐ, tên nhân viên..."
                value={contractSearch}
                onChange={(e) => setContractSearch(e.target.value)}
                style={{ width: '250px' }}
              />
            </div>
            <select
              className="inp"
              value={contractStatusFilter}
              onChange={(e) => setContractStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Hiệu lực">Hiệu lực</option>
              <option value="Sắp hết hạn">Sắp hết hạn</option>
            </select>
            <span className="grow"></span>
            <span className="small muted">
              Hiển thị <strong>{filteredContracts.length}</strong> / {contracts.length} hợp đồng
            </span>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>SỐ HỢP ĐỒNG</th>
                  <th>NHÂN VIÊN</th>
                  <th>LOẠI HỢP ĐỒNG</th>
                  <th>NGÀY KÝ</th>
                  <th>NGÀY HẾT HẠN</th>
                  <th className="r">LƯƠNG HỢP ĐỒNG</th>
                  <th>TRẠNG THÁI</th>
                  <th className="act">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.length === 0 ? (
                  <EmptyState
                    isTable
                    colSpan={8}
                    title="Chưa có hợp đồng lao động từ máy chủ"
                    description="Hồ sơ hợp đồng sẽ hiển thị tại đây khi kết nối cơ sở dữ liệu."
                    actionLabel="Tạo hợp đồng mới"
                    onAction={() => alert('Thêm mới hợp đồng')}
                  />
                ) : (
                  filteredContracts.map(c => (
                  <tr key={c.id}>
                    <td><code>{c.id}</code></td>
                    <td>
                      <b>{c.empName}</b>
                      <small style={{ display: 'block', color: '#64748b' }}>Mã: {c.empId}</small>
                    </td>
                    <td>{c.type}</td>
                    <td>{c.signDate}</td>
                    <td>{c.endDate}</td>
                    <td className="r"><strong>{formatVND(c.salary)}</strong></td>
                    <td>
                      <span className={`badge ${c.status === 'Hiệu lực' ? 'b-green' : 'b-amber'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="act">
                      <button className="ibtn" title="Xem hợp đồng" onClick={() => alert(`Chi tiết hợp đồng ${c.id} của ${c.empName}`)}>
                        <Eye size={15} />
                      </button>
                      <button className="ibtn" title="In hợp đồng" onClick={() => window.print()}>
                        <Printer size={15} />
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (subModule === 'org') {
    return (
      <div className="hr-employees-container">
        {renderTabsHeader()}

        <div className="ph">
          <div>
            <h1>Sơ đồ cơ cấu tổ chức doanh nghiệp</h1>
            <p>Mô hình phân cấp quản trị, phòng ban, khối chuyên môn và quy mô định biên nhân sự</p>
          </div>
          <div className="ph-tools">
            <button className="btn" onClick={() => window.print()}>
              <Printer size={15} />
              <span>In sơ đồ</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div className="org-tree-node root-node">
            <div className="org-tree-user">
              <img src={orgHierarchyData.avatar} alt={orgHierarchyData.head} className="org-avatar" />
              <div>
                <b style={{ fontSize: '15px', color: '#042f2e' }}>{orgHierarchyData.title}</b>
                <div style={{ fontSize: '13px', color: '#0f766e', fontWeight: 600, marginTop: '2px' }}>
                  {orgHierarchyData.head} · <span style={{ fontWeight: 400, color: '#475569' }}>{orgHierarchyData.role}</span>
                </div>
              </div>
            </div>
            <div>
              <span className="badge b-p" style={{ fontSize: '12px', padding: '4px 10px' }}>
                Tổng quy mô: {orgHierarchyData.empCount} nhân sự
              </span>
            </div>
          </div>

          <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orgHierarchyData.children.map(dept => {
              const isExpanded = !!expandedDept[dept.id];
              return (
                <div key={dept.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="org-tree-node dept-node click" onClick={() => toggleDept(dept.id)}>
                    <div className="org-tree-user">
                      <img src={dept.avatar} alt={dept.head} className="org-avatar" />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <b style={{ fontSize: '14.5px', color: '#042f2e' }}>{dept.title}</b>
                          {dept.children && (
                            <span style={{ color: '#0f766e', display: 'grid', placeItems: 'center' }}>
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#0f766e', fontWeight: 600, marginTop: '2px' }}>
                          Trưởng bộ phận: {dept.head} · <span style={{ fontWeight: 400, color: '#475569' }}>{dept.role}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="badge b-blue" style={{ fontSize: '12px' }}>
                        {dept.empCount} nhân sự
                      </span>
                    </div>
                  </div>

                  {isExpanded && dept.children && (
                    <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dept.children.map(team => (
                        <div key={team.id} className="org-tree-node team-node">
                          <div className="org-tree-user">
                            <img src={team.avatar} alt={team.head} className="org-avatar" style={{ width: '34px', height: '34px' }} />
                            <div>
                              <b style={{ fontSize: '13.5px', color: '#1e293b' }}>{team.title}</b>
                              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                Phụ trách: <strong>{team.head}</strong> ({team.role})
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11.5px' }}>
                              {team.empCount} nhân sự
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-employees-container">
      {renderTabsHeader()}

      <div className="ph">
        <div>
          <h1>Hồ sơ nhân sự doanh nghiệp</h1>
          <p>Quản trị lý lịch trích ngang, thông tin thuế, bảo hiểm, hợp đồng và sinh trắc học Face ID</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={() => window.print()}>
            <Printer size={15} />
            <span>In danh sách</span>
          </button>
          <button className="btn pri" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={15} />
            <span>Thêm nhân viên mới</span>
          </button>
        </div>
      </div>

      <div className="tbl-card">
        <div className="tbl-tools">
          <div className="search">
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo tên, mã NV, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '240px' }}
            />
          </div>
          <select
            className="inp"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <span className="grow"></span>
          <span className="small muted">
            Hiển thị <strong>{filteredEmployees.length}</strong> / {localEmployees.length} nhân sự
          </span>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>MÃ NV</th>
                <th>HỌ VÀ TÊN</th>
                <th>PHÒNG BAN</th>
                <th>CHỨC VỤ</th>
                <th>NGÀY VÀO</th>
                <th className="r">LƯƠNG CƠ BẢN</th>
                <th className="c">NPT</th>
                <th className="c">SINH TRẮC FACE ID</th>
                <th>TRẠNG THÁI</th>
                <th className="act">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={10}
                  title="Chưa có dữ liệu nhân sự từ máy chủ"
                  description="Bấm 'Thêm nhân viên mới' hoặc đồng bộ từ CSDL SQL Server (tblEmployee)."
                  actionLabel="Thêm nhân viên mới"
                  onAction={() => setIsAddModalOpen(true)}
                />
              ) : (
                filteredEmployees.map((emp) => (
                <tr key={emp.id} className="click" onClick={() => onSelectEmployee && onSelectEmployee(emp)}>
                  <td><code>{emp.id}</code></td>
                  <td>
                    <div className="who">
                      <div className="avatar">
                        {emp.name ? emp.name.split(' ').slice(-1)[0][0] : 'N'}
                      </div>
                      <div>
                        <b>{emp.name}</b>
                        <small>{emp.email || emp.phone}</small>
                      </div>
                    </div>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.position}</td>
                  <td>{emp.joinDate || '01/01/2026'}</td>
                  <td className="r"><strong>{formatVND(emp.baseSalary || 20000000)}</strong></td>
                  <td className="c">{emp.dependents ?? 1}</td>
                  <td className="c">
                    <span className={`badge ${emp.faceRegistered ? 'b-p' : 'b-amber'}`}>
                      {emp.faceRegistered ? 'Đã quét' : 'Chưa có'}
                    </span>
                  </td>
                  <td>
                    <span className="badge b-green">
                      {emp.status || 'Đang làm việc'}
                    </span>
                  </td>
                  <td className="act" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="ibtn"
                      title="Xem chi tiết"
                      onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="ibtn del"
                      title="Xóa nhân viên"
                      onClick={() => handleDelete(emp.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="modal-wrap" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <h3>Thêm mới nhân viên vào hệ thống</h3>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-b">
                <div className="form">
                  <div className="fsec">1. Thông tin lý lịch cá nhân</div>
                  <label className="field">
                    <span>Mã nhân viên: <i className="req">*</i></span>
                    <input
                      className="inp"
                      required
                      value={newEmp.ma}
                      onChange={(e) => setNewEmp({ ...newEmp, ma: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Họ và tên: <i className="req">*</i></span>
                    <input
                      className="inp"
                      required
                      placeholder="Nguyễn Văn A"
                      value={newEmp.name}
                      onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Giới tính:</span>
                    <select
                      className="inp"
                      value={newEmp.gender}
                      onChange={(e) => setNewEmp({ ...newEmp, gender: e.target.value })}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Ngày sinh:</span>
                    <input
                      type="date"
                      className="inp"
                      value={newEmp.birthDate}
                      onChange={(e) => setNewEmp({ ...newEmp, birthDate: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Số điện thoại:</span>
                    <input
                      className="inp"
                      placeholder="0901234567"
                      value={newEmp.phone}
                      onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Email công ty:</span>
                    <input
                      type="email"
                      className="inp"
                      placeholder="email@company.vn"
                      value={newEmp.email}
                      onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Số CCCD:</span>
                    <input
                      className="inp"
                      placeholder="001095001234"
                      value={newEmp.idCard}
                      onChange={(e) => setNewEmp({ ...newEmp, idCard: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Mã số thuế cá nhân:</span>
                    <input
                      className="inp"
                      placeholder="8019283741"
                      value={newEmp.taxCode}
                      onChange={(e) => setNewEmp({ ...newEmp, taxCode: e.target.value })}
                    />
                  </label>

                  <div className="fsec">2. Vị trí công tác & Phòng ban</div>
                  <label className="field">
                    <span>Phòng ban:</span>
                    <select
                      className="inp"
                      value={newEmp.department}
                      onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    >
                      <option value="Ban Giám Đốc">Ban Giám Đốc</option>
                      <option value="Khối Kỹ Thuật (IT)">Khối Kỹ Thuật (IT)</option>
                      <option value="Phòng Kế Toán">Phòng Kế Toán</option>
                      <option value="Phòng Nhân Sự">Phòng Nhân Sự</option>
                      <option value="Khối Sản Xuất">Khối Sản Xuất</option>
                      <option value="Khối Kinh Doanh">Khối Kinh Doanh</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Chức vụ:</span>
                    <input
                      className="inp"
                      placeholder="Chuyên viên"
                      value={newEmp.position}
                      onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Ngày vào làm:</span>
                    <input
                      type="date"
                      className="inp"
                      value={newEmp.joinDate}
                      onChange={(e) => setNewEmp({ ...newEmp, joinDate: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Trạng thái làm việc:</span>
                    <select
                      className="inp"
                      value={newEmp.status}
                      onChange={(e) => setNewEmp({ ...newEmp, status: e.target.value })}
                    >
                      <option value="Đang làm việc">Đang làm việc</option>
                      <option value="Thử việc">Thử việc</option>
                      <option value="Đã thôi việc">Đã thôi việc</option>
                    </select>
                  </label>

                  <div className="fsec">3. Chế độ lương & Tài khoản ngân hàng</div>
                  <label className="field">
                    <span>Lương cơ bản (VNĐ): <i className="req">*</i></span>
                    <input
                      type="number"
                      step="500000"
                      className="inp num"
                      required
                      value={newEmp.baseSalary}
                      onChange={(e) => setNewEmp({ ...newEmp, baseSalary: parseFloat(e.target.value) || 0 })}
                    />
                  </label>
                  <label className="field">
                    <span>Lương đóng bảo hiểm:</span>
                    <input
                      type="number"
                      className="inp num"
                      value={newEmp.insuranceSalary}
                      onChange={(e) => setNewEmp({ ...newEmp, insuranceSalary: parseFloat(e.target.value) || 0 })}
                    />
                  </label>
                  <label className="field">
                    <span>Số người phụ thuộc (NPT):</span>
                    <input
                      type="number"
                      min="0"
                      className="inp num"
                      value={newEmp.dependents}
                      onChange={(e) => setNewEmp({ ...newEmp, dependents: parseInt(e.target.value) || 0 })}
                    />
                  </label>
                  <label className="field">
                    <span>Ngân hàng thụ hưởng:</span>
                    <input
                      className="inp"
                      value={newEmp.bankName}
                      onChange={(e) => setNewEmp({ ...newEmp, bankName: e.target.value })}
                    />
                  </label>
                  <label className="field s2">
                    <span>Số tài khoản ngân hàng:</span>
                    <input
                      className="inp"
                      placeholder="19036789123456"
                      value={newEmp.bankAccount}
                      onChange={(e) => setNewEmp({ ...newEmp, bankAccount: e.target.value })}
                    />
                  </label>
                </div>
              </div>
              <div className="modal-f">
                <button type="button" className="btn" onClick={() => setIsAddModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn pri">
                  Lưu hồ sơ nhân sự
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
