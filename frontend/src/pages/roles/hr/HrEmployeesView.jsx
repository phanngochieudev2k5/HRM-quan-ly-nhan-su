import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
  User, CheckCircle2, FileText, Building2, ChevronDown, ChevronRight,
  Plus, Printer, Eye, Search, Layers
} from 'lucide-react';
import HrService from '../../../services/HrService';
import EmployeeList from './components/EmployeeList';
import EmployeeProfile360 from './components/EmployeeProfile360';
import AllContractsView from './components/AllContractsView';
import Toast from './components/Toast';
import EmptyState from '../../../components/common/EmptyState';
import { onboardingList, orgHierarchyData } from '../../../data/mockData';
import '../../../styles/roles/hr/HrEmployeesView.css';

export default function HrEmployeesView({
  employees: initialEmployees = [],
  selectedEmployee: initialSelectedEmployee = null,
  onSelectEmployee,
  onAddEmployee,
  onDeleteEmployee,
  subModule: propSubModule = 'list',
  onBackToList,
  onNavigateFaceRegistration,
  onNavigate
}) {
  const navigate = useNavigate();
  const routeParams = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc tham số subModule từ props hoặc URL params / query params
  const currentSubModule = routeParams.subModule || searchParams.get('subModule') || propSubModule || 'list';

  // Danh sách nhân viên
  const [employees, setEmployees] = useState(initialEmployees || []);
  const [pagination, setPagination] = useState({ total: initialEmployees.length || 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Danh mục phòng ban & chức vụ
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  // Dữ liệu Hồ sơ 360° nhân viên
  const [profileEmployee, setProfileEmployee] = useState(initialSelectedEmployee);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Thông báo Toast
  const [toast, setToast] = useState(null);

  // Số lượng hợp đồng (phục vụ badge)
  const [totalContractsCount, setTotalContractsCount] = useState(0);

  // Tab khác
  const [onboardings, setOnboardings] = useState(onboardingList);
  const [expandedDept, setExpandedDept] = useState({
    ORG_HR: true,
    ORG_TECH: true,
    ORG_FIN: true,
    ORG_MKT: true
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Tải danh mục phòng ban và chức vụ
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [depts, pos, contractsList] = await Promise.all([
          HrService.getDepartments(),
          HrService.getPositions(),
          HrService.getContracts().catch(() => [])
        ]);
        if (depts && depts.length > 0) setDepartments(depts);
        if (pos && pos.length > 0) setPositions(pos);
        if (Array.isArray(contractsList)) setTotalContractsCount(contractsList.length);
      } catch (err) {
        console.warn('Lỗi tải danh mục phòng ban/chức vụ:', err.message);
      }
    };
    fetchMetadata();
  }, []);

  // Tải danh sách nhân viên từ CSDL
  const loadEmployees = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await HrService.getEmployees({
        page,
        limit: 10,
        search: searchTerm,
        departmentId: departmentFilter,
        workStatus: statusFilter
      });

      if (res && res.employees) {
        setEmployees(res.employees);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else if (Array.isArray(res)) {
        setEmployees(res);
        setPagination({ total: res.length, page: 1, limit: 10, totalPages: Math.ceil(res.length / 10) || 1 });
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách nhân sự:', err);
      showToast('Lỗi khi tải danh sách nhân sự từ server!', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, departmentFilter, statusFilter]);

  useEffect(() => {
    loadEmployees(1);
  }, [loadEmployees]);

  // Tải thông tin chi tiết hồ sơ 360°
  const loadProfile360 = useCallback(async (emp) => {
    if (!emp) return;
    const empId = emp.EmployeeId || emp.id || emp.EmployeeCode;
    try {
      setLoadingProfile(true);
      const data360 = await HrService.getEmployeeById(empId);
      setProfileEmployee(data360);
    } catch (err) {
      console.warn('Không thể tải hồ sơ 360 qua API, sử dụng dữ liệu cục bộ:', err.message);
      setProfileEmployee(emp);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (initialSelectedEmployee) {
      loadProfile360(initialSelectedEmployee);
    }
  }, [initialSelectedEmployee, loadProfile360]);

  // Điều hướng xem hồ sơ 360°
  const handleViewProfile = (emp) => {
    setProfileEmployee(emp);
    loadProfile360(emp);
    if (onSelectEmployee) {
      onSelectEmployee(emp);
    } else {
      navigate('/hr/employees/profile');
    }
  };

  // Quay lại danh sách nhân viên
  const handleBackToList = () => {
    if (onBackToList) {
      onBackToList();
    } else if (onNavigate) {
      onNavigate('hr-employees', 'list');
    } else {
      navigate('/hr/employees/list');
    }
  };

  // Thao tác CRUD nhân sự
  const handleCreateEmployee = async (formData) => {
    try {
      const created = await HrService.createEmployee(formData);
      showToast(`Thêm mới nhân viên "${formData.FullName}" thành công!`, 'success');
      loadEmployees(1);
      if (onAddEmployee) onAddEmployee(created);
    } catch (err) {
      showToast(err.message || 'Lỗi khi thêm nhân viên!', 'error');
      throw err;
    }
  };

  const handleUpdateEmployee = async (empId, formData) => {
    try {
      await HrService.updateEmployee(empId, formData);
      showToast('Cập nhật thông tin nhân viên thành công!', 'success');
      loadProfile360({ EmployeeId: empId });
      loadEmployees(pagination.page);
    } catch (err) {
      showToast(err.message || 'Lỗi khi cập nhật nhân viên!', 'error');
      throw err;
    }
  };

  const handleDeleteEmployee = async (empId) => {
    try {
      await HrService.deleteEmployee(empId);
      showToast('Đã xóa hồ sơ nhân sự thành công!', 'success');
      loadEmployees(pagination.page);
      if (onDeleteEmployee) onDeleteEmployee(empId);
      if (profileEmployee && (profileEmployee.EmployeeId === empId || profileEmployee.id === empId)) {
        handleBackToList();
      }
    } catch (err) {
      showToast(err.message || 'Lỗi khi xóa nhân viên!', 'error');
    }
  };

  // Thao tác CRUD Hợp đồng trong Hồ sơ 360
  const handleCreateContract = async (contractData) => {
    try {
      await HrService.createContract(contractData);
      showToast('Thêm mới hợp đồng thành công!', 'success');
      if (profileEmployee) {
        loadProfile360(profileEmployee);
      }
    } catch (err) {
      showToast(err.message || 'Lỗi khi tạo hợp đồng!', 'error');
      throw err;
    }
  };

  const handleUpdateContract = async (contractId, contractData) => {
    try {
      await HrService.updateContract(contractId, contractData);
      showToast('Cập nhật hợp đồng thành công!', 'success');
      if (profileEmployee) {
        loadProfile360(profileEmployee);
      }
    } catch (err) {
      showToast(err.message || 'Lỗi khi cập nhật hợp đồng!', 'error');
      throw err;
    }
  };

  const handleDeleteContract = async (contractId) => {
    try {
      await HrService.deleteContract(contractId);
      showToast('Đã xóa hợp đồng thành công!', 'success');
      if (profileEmployee) {
        loadProfile360(profileEmployee);
      }
    } catch (err) {
      showToast(err.message || 'Lỗi khi xóa hợp đồng!', 'error');
    }
  };

  // Header chuyển đổi giữa các Tab quản lý nhân sự
  const renderTabsHeader = () => (
    <div className="attendance-tabs-header">
      <button
        className={`attendance-tab-btn ${currentSubModule === 'list' || currentSubModule === 'profile' ? 'active' : ''}`}
        onClick={() => {
          if (onNavigate) onNavigate('hr-employees', 'list');
          else navigate('/hr/employees/list');
        }}
      >
        <User size={16} />
        <span>Danh sách nhân sự</span>
        <span className="badge b-p" style={{ marginLeft: '4px' }}>
          {pagination.total || employees.length}
        </span>
      </button>

      <button
        className={`attendance-tab-btn ${currentSubModule === 'contracts' ? 'active' : ''}`}
        onClick={() => {
          if (onNavigate) onNavigate('hr-employees', 'contracts');
          else navigate('/hr/employees/contracts');
        }}
      >
        <FileText size={16} />
        <span>Hợp đồng lao động</span>
        <span className="badge b-amber" style={{ marginLeft: '4px' }}>
          {totalContractsCount || 3}
        </span>
      </button>

      <button
        className={`attendance-tab-btn ${currentSubModule === 'onboarding' ? 'active' : ''}`}
        onClick={() => {
          if (onNavigate) onNavigate('hr-employees', 'onboarding');
          else navigate('/hr/employees/onboarding');
        }}
      >
        <CheckCircle2 size={16} />
        <span>Tiếp nhận Onboarding</span>
        <span className="badge b-blue" style={{ marginLeft: '4px' }}>
          {onboardings.length}
        </span>
      </button>

      <button
        className={`attendance-tab-btn ${currentSubModule === 'org' ? 'active' : ''}`}
        onClick={() => {
          if (onNavigate) onNavigate('hr-employees', 'org');
          else navigate('/hr/employees/org');
        }}
      >
        <Building2 size={16} />
        <span>Sơ đồ tổ chức</span>
      </button>
    </div>
  );

  // 1. ROUTE: /hr/employees/contracts -> HIỂN THỊ TOÀN BỘ HỢP ĐỒNG TỪ CSDL
  if (currentSubModule === 'contracts') {
    return (
      <div className="hr-employees-container">
        {renderTabsHeader()}

        <AllContractsView
          employees={employees}
          onViewEmployee={handleViewProfile}
          showToast={showToast}
        />

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // 2. ROUTE: /hr/employees/profile -> HỒ SƠ 360°
  if (currentSubModule === 'profile') {
    return (
      <div className="hr-employees-container">
        {renderTabsHeader()}

        {loadingProfile ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div className="status-dot-pulse" style={{ background: '#0f766e', margin: '0 auto 12px' }}></div>
            <div>Đang tải thông tin hồ sơ 360° từ SQL Server...</div>
          </div>
        ) : (
          <EmployeeProfile360
            employee={profileEmployee || employees[0]}
            departments={departments}
            positions={positions}
            onBackToList={handleBackToList}
            onUpdateEmployee={handleUpdateEmployee}
            onCreateContract={handleCreateContract}
            onUpdateContract={handleUpdateContract}
            onDeleteContract={handleDeleteContract}
            onNavigateFaceRegistration={onNavigateFaceRegistration}
          />
        )}

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // 3. ROUTE: /hr/employees/onboarding
  if (currentSubModule === 'onboarding') {
    return (
      <div className="hr-employees-container">
        {renderTabsHeader()}

        <div className="ph">
          <div>
            <h1>Quy trình tiếp nhận nhân sự mới (Onboarding)</h1>
            <p>Theo dõi tiến trình hội nhập, chuẩn bị tài khoản, hợp đồng và cấp phát trang thiết bị</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {onboardings.map(item => {
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
                          {item.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                        {item.role} · Ngày nhận việc: <strong>{item.joinDate}</strong> · Người hướng dẫn: {item.mentor}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // 4. ROUTE: /hr/employees/org
  if (currentSubModule === 'org') {
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
        </div>

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // 5. ROUTE: /hr/employees/list (HOẶC MẶC ĐỊNH) -> BẢNG DANH SÁCH NHÂN VIÊN
  return (
    <div className="hr-employees-container">
      {renderTabsHeader()}

      <EmployeeList
        employees={employees}
        pagination={pagination}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        departments={departments}
        positions={positions}
        onPageChange={(newPage) => loadEmployees(newPage)}
        onViewProfile={handleViewProfile}
        onCreateEmployee={handleCreateEmployee}
        onUpdateEmployee={handleUpdateEmployee}
        onDeleteEmployee={handleDeleteEmployee}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
