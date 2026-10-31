import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AuthPage from './pages/auth/AuthPage';
import PendingApprovalView from './pages/auth/PendingApprovalView';

import AdminDashboard from './pages/roles/admin/AdminDashboard';
import UserAccountsView from './pages/roles/admin/UserAccountsView';
import SystemAuditLogs from './pages/roles/admin/SystemAuditLogs';
import SystemSettingsView from './pages/roles/admin/SystemSettingsView';

import ManagerDashboard from './pages/roles/manager/ManagerDashboard';
import TeamMembersView from './pages/roles/manager/TeamMembersView';
import TeamLeaveApprovals from './pages/roles/manager/TeamLeaveApprovals';
import TeamOvertimeApprovals from './pages/roles/manager/TeamOvertimeApprovals';
import TeamPerformanceKpi from './pages/roles/manager/TeamPerformanceKpi';

import EmployeeDashboard from './pages/roles/employee/EmployeeDashboard';
import MyProfileView from './pages/roles/employee/MyProfileView';
import MyFaceCheckinView from './pages/roles/employee/MyFaceCheckinView';
import MyAttendanceView from './pages/roles/employee/MyAttendanceView';
import MyLeaveView from './pages/roles/employee/MyLeaveView';
import MyOvertimeView from './pages/roles/employee/MyOvertimeView';
import MyPayslipView from './pages/roles/employee/MyPayslipView';
import MyTrainingView from './pages/roles/employee/MyTrainingView';

import FinanceDashboard from './pages/roles/finance/FinanceDashboard';
import SalaryComponentsView from './pages/roles/finance/SalaryComponentsView';
import PayrollCalculationView from './pages/roles/finance/PayrollCalculationView';
import PayrollReportsView from './pages/roles/finance/PayrollReportsView';

import HrDashboard from './pages/roles/hr/HrDashboard';
import HrEmployeesView from './pages/roles/hr/HrEmployeesView';
import HrAttendanceView from './pages/roles/hr/HrAttendanceView';
import HrRecruitmentView from './pages/roles/hr/HrRecruitmentView';
import HrLeaveView from './pages/roles/hr/HrLeaveView';
import HrOvertimeView from './pages/roles/hr/HrOvertimeView';
import HrAssetsView from './pages/roles/hr/HrAssetsView';
import HrReportsView from './pages/roles/hr/HrReportsView';

import AuthService from './services/AuthService';
import HrService from './services/HrService';
import { getDefaultPathForRole, moduleToPath, pathToModule } from './routes/navigation';

function HrEmployeesRouteWrapper({
  employees,
  selectedEmployee,
  onSelectEmployee,
  onAddEmployee,
  onDeleteEmployee,
  onBackToList,
  onNavigateFaceRegistration,
  onNavigate
}) {
  const { subModule } = useParams();
  return (
    <HrEmployeesView
      employees={employees}
      selectedEmployee={selectedEmployee}
      onSelectEmployee={onSelectEmployee}
      onAddEmployee={onAddEmployee}
      onDeleteEmployee={onDeleteEmployee}
      subModule={subModule || 'list'}
      onBackToList={onBackToList}
      onNavigateFaceRegistration={onNavigateFaceRegistration}
      onNavigate={onNavigate}
    />
  );
}

function HrAttendanceRouteWrapper({
  selectedEmployee,
  onBack,
  onCompleteRegistration,
  onNavigate
}) {
  const { subModule } = useParams();
  return (
    <HrAttendanceView
      subModule={subModule || 'history'}
      employee={selectedEmployee}
      onBack={onBack}
      onCompleteRegistration={onCompleteRegistration}
      onNavigate={onNavigate}
    />
  );
}

function HrRecruitmentRouteWrapper({ onNavigate }) {
  const { subModule } = useParams();
  return (
    <HrRecruitmentView
      subModule={subModule || 'jobs'}
      onNavigate={onNavigate}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [authToken, setAuthToken] = useState(() => AuthService.getToken());
  const [currentUser, setCurrentUser] = useState(() => AuthService.getCurrentUser());

  const [currentRole, setCurrentRole] = useState(() => {
    const user = AuthService.getCurrentUser();
    return user?.role || 'Employee';
  });

  const { module: activeModule, subModule: activeSubModule } = pathToModule(location.pathname);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (authToken && (currentRole === 'HR' || currentRole === 'Admin')) {
      HrService.getEmployees().then(data => {
        if (data && data.length > 0) {
          setEmployees(data);
          setSelectedEmployee(data[0]);
        }
      });
    }
  }, [authToken, currentRole]);

  const handleAuthSuccess = (user, token) => {
    setAuthToken(token);
    setCurrentUser(user);

    const userRole = user.role || 'Employee';
    setCurrentRole(userRole);
    navigate(getDefaultPathForRole(userRole));
  };

  const handleLogout = () => {
    AuthService.logout();
    setAuthToken(null);
    setCurrentUser(null);
    navigate('/login');
  };

  const handleNavigate = (module, subModule = null) => {
    const targetPath = moduleToPath(module, subModule);
    navigate(targetPath);
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    navigate('/hr/employees/profile');
  };

  const handleAddEmployee = (newEmp) => {
    setEmployees([newEmp, ...employees]);
  };

  const handleDeleteEmployee = (empId) => {
    setEmployees(employees.filter(e => e.id !== empId));
  };

  const handleStartFaceRegistration = (emp) => {
    setSelectedEmployee(emp);
    navigate('/hr/attendance/register-face');
  };

  const handleCompleteFaceRegistration = (empId) => {
    setEmployees(employees.map(e => e.id === empId ? { ...e, faceRegistered: true } : e));
    if (selectedEmployee && selectedEmployee.id === empId) {
      setSelectedEmployee({ ...selectedEmployee, faceRegistered: true });
    }
  };

  const isPendingEmployee = currentRole === 'Employee' && (currentUser?.isPending || (!currentUser?.departmentId && !currentUser?.employeeId));

  if (authToken && currentUser && isPendingEmployee) {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <PendingApprovalView
              currentUser={currentUser}
              onAuthSuccess={handleAuthSuccess}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authToken && currentUser ? (
            <Navigate to={getDefaultPathForRole(currentRole)} replace />
          ) : (
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          )
        }
      />

      <Route
        element={
          !authToken || !currentUser ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="app-container">
              <Sidebar
                currentRole={currentRole}
                activeModule={activeModule}
                activeSubModule={activeSubModule}
                onNavigate={handleNavigate}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
              />

              <div className="main-wrapper">
                <Header currentRole={currentRole} currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} onUserUpdate={(updated) => setCurrentUser(prev => ({ ...prev, ...updated }))} />

                <main className="content-area">
                  <Outlet />
                </main>
              </div>
            </div>
          )
        }
      >
        <Route path="/" element={<Navigate to={getDefaultPathForRole(currentRole)} replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard onNavigate={handleNavigate} />} />
        <Route path="/admin/accounts" element={<UserAccountsView />} />
        <Route path="/admin/logs" element={<SystemAuditLogs />} />
        <Route path="/admin/settings" element={<SystemSettingsView />} />

        {/* Manager Routes */}
        <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard onNavigate={handleNavigate} />} />
        <Route path="/manager/team" element={<TeamMembersView />} />
        <Route path="/manager/leaves" element={<TeamLeaveApprovals />} />
        <Route path="/manager/overtime" element={<TeamOvertimeApprovals />} />
        <Route path="/manager/performance" element={<TeamPerformanceKpi />} />

        {/* Employee Routes */}
        <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard onNavigate={handleNavigate} currentUser={currentUser} />} />
        <Route path="/employee/profile" element={<MyProfileView user={currentUser} />} />
        <Route path="/employee/checkin" element={<MyFaceCheckinView />} />
        <Route path="/employee/attendance" element={<MyAttendanceView />} />
        <Route path="/employee/leave" element={<MyLeaveView />} />
        <Route path="/employee/overtime" element={<MyOvertimeView />} />
        <Route path="/employee/payslip" element={<MyPayslipView />} />
        <Route path="/employee/training" element={<MyTrainingView />} />

        {/* Finance Routes */}
        <Route path="/finance" element={<Navigate to="/finance/dashboard" replace />} />
        <Route path="/finance/dashboard" element={<FinanceDashboard onNavigate={handleNavigate} />} />
        <Route path="/finance/components" element={<SalaryComponentsView />} />
        <Route path="/finance/calc" element={<PayrollCalculationView />} />
        <Route path="/finance/reports" element={<PayrollReportsView />} />

        {/* HR Routes */}
        <Route path="/hr" element={<Navigate to="/hr/dashboard" replace />} />
        <Route path="/hr/dashboard" element={<HrDashboard onNavigate={handleNavigate} currentUser={currentUser} />} />
        <Route
          path="/hr/employees"
          element={
            <HrEmployeesRouteWrapper
              employees={employees}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={handleSelectEmployee}
              onAddEmployee={handleAddEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onBackToList={() => handleNavigate('hr-employees', 'list')}
              onNavigateFaceRegistration={handleStartFaceRegistration}
              onNavigate={handleNavigate}
            />
          }
        />
        <Route
          path="/hr/employees/:subModule"
          element={
            <HrEmployeesRouteWrapper
              employees={employees}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={handleSelectEmployee}
              onAddEmployee={handleAddEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onBackToList={() => handleNavigate('hr-employees', 'list')}
              onNavigateFaceRegistration={handleStartFaceRegistration}
              onNavigate={handleNavigate}
            />
          }
        />
        <Route
          path="/hr/attendance"
          element={
            <HrAttendanceRouteWrapper
              selectedEmployee={selectedEmployee}
              onBack={() => handleNavigate('hr-attendance', 'face-checkin')}
              onCompleteRegistration={handleCompleteFaceRegistration}
              onNavigate={handleNavigate}
            />
          }
        />
        <Route
          path="/hr/attendance/:subModule"
          element={
            <HrAttendanceRouteWrapper
              selectedEmployee={selectedEmployee}
              onBack={() => handleNavigate('hr-attendance', 'face-checkin')}
              onCompleteRegistration={handleCompleteFaceRegistration}
              onNavigate={handleNavigate}
            />
          }
        />
        <Route
          path="/hr/recruitment"
          element={
            <HrRecruitmentRouteWrapper
              onNavigate={handleNavigate}
            />
          }
        />
        <Route
          path="/hr/recruitment/:subModule"
          element={
            <HrRecruitmentRouteWrapper
              onNavigate={handleNavigate}
            />
          }
        />
        <Route path="/hr/leave" element={<HrLeaveView />} />
        <Route path="/hr/overtime" element={<HrOvertimeView />} />
        <Route path="/hr/assets" element={<HrAssetsView />} />
        <Route path="/hr/reports" element={<HrReportsView />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={getDefaultPathForRole(currentRole)} replace />} />
      </Route>
    </Routes>
  );
}

