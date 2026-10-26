import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import AdminDashboard from './components/roles/admin/AdminDashboard';
import UserAccountsView from './components/roles/admin/UserAccountsView';
import SystemAuditLogs from './components/roles/admin/SystemAuditLogs';
import SystemSettingsView from './components/roles/admin/SystemSettingsView';

import ManagerDashboard from './components/roles/manager/ManagerDashboard';
import TeamMembersView from './components/roles/manager/TeamMembersView';
import TeamLeaveApprovals from './components/roles/manager/TeamLeaveApprovals';
import TeamOvertimeApprovals from './components/roles/manager/TeamOvertimeApprovals';
import TeamPerformanceKpi from './components/roles/manager/TeamPerformanceKpi';

import EmployeeDashboard from './components/roles/employee/EmployeeDashboard';
import MyProfileView from './components/roles/employee/MyProfileView';
import MyFaceCheckinView from './components/roles/employee/MyFaceCheckinView';
import MyAttendanceView from './components/roles/employee/MyAttendanceView';
import MyLeaveView from './components/roles/employee/MyLeaveView';
import MyOvertimeView from './components/roles/employee/MyOvertimeView';
import MyPayslipView from './components/roles/employee/MyPayslipView';
import MyTrainingView from './components/roles/employee/MyTrainingView';

import FinanceDashboard from './components/roles/finance/FinanceDashboard';
import SalaryComponentsView from './components/roles/finance/SalaryComponentsView';
import PayrollCalculationView from './components/roles/finance/PayrollCalculationView';
import PayrollReportsView from './components/roles/finance/PayrollReportsView';

import HrDashboard from './components/roles/hr/HrDashboard';
import HrEmployeesView from './components/roles/hr/HrEmployeesView';
import HrAttendanceView from './components/roles/hr/HrAttendanceView';
import HrRecruitmentView from './components/roles/hr/HrRecruitmentView';
import HrLeaveView from './components/roles/hr/HrLeaveView';
import HrOvertimeView from './components/roles/hr/HrOvertimeView';
import HrAssetsView from './components/roles/hr/HrAssetsView';
import HrReportsView from './components/roles/hr/HrReportsView';

import { employeesData, currentUsersByRole } from './data/mockData';

export default function App() {
  const [currentRole, setCurrentRole] = useState('HR');
  const [activeModule, setActiveModule] = useState('hr-dashboard');
  const [activeSubModule, setActiveSubModule] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [employees, setEmployees] = useState(employeesData);
  const [selectedEmployee, setSelectedEmployee] = useState(employeesData[0]);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    setActiveSubModule(null);
    switch (newRole) {
      case 'Admin':
        setActiveModule('admin-dashboard');
        break;
      case 'Manager':
        setActiveModule('manager-dashboard');
        break;
      case 'Employee':
        setActiveModule('employee-dashboard');
        break;
      case 'Finance':
        setActiveModule('finance-dashboard');
        break;
      case 'HR':
      default:
        setActiveModule('hr-dashboard');
        break;
    }
  };

  const handleNavigate = (module, subModule = null) => {
    let resolvedSubModule = subModule;
    if (!resolvedSubModule) {
      if (module === 'hr-employees') resolvedSubModule = 'list';
      else if (module === 'hr-attendance') resolvedSubModule = 'history';
      else if (module === 'hr-recruitment') resolvedSubModule = 'jobs';
    }
    setActiveModule(module);
    setActiveSubModule(resolvedSubModule);
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setActiveModule('hr-employees');
    setActiveSubModule('profile');
  };

  const handleAddEmployee = (newEmp) => {
    setEmployees([newEmp, ...employees]);
  };

  const handleDeleteEmployee = (empId) => {
    setEmployees(employees.filter(e => e.id !== empId));
  };

  const handleStartFaceRegistration = (emp) => {
    setSelectedEmployee(emp);
    setActiveModule('hr-attendance');
    setActiveSubModule('register-face');
  };

  const handleCompleteFaceRegistration = (empId) => {
    setEmployees(employees.map(e => e.id === empId ? { ...e, faceRegistered: true } : e));
    if (selectedEmployee && selectedEmployee.id === empId) {
      setSelectedEmployee({ ...selectedEmployee, faceRegistered: true });
    }
  };

  const currentUser = currentUsersByRole[currentRole] || currentUsersByRole.HR;

  return (
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
        <Header
          currentRole={currentRole}
          setCurrentRole={handleRoleChange}
          currentUser={currentUser}
          onNavigate={handleNavigate}
        />

        <main className="content-area">
          {activeModule === 'admin-dashboard' && (
            <AdminDashboard onNavigate={handleNavigate} />
          )}
          {activeModule === 'admin-accounts' && (
            <UserAccountsView />
          )}
          {activeModule === 'admin-logs' && (
            <SystemAuditLogs />
          )}
          {activeModule === 'admin-settings' && (
            <SystemSettingsView />
          )}

          {activeModule === 'manager-dashboard' && (
            <ManagerDashboard onNavigate={handleNavigate} />
          )}
          {activeModule === 'manager-team' && (
            <TeamMembersView />
          )}
          {activeModule === 'manager-leaves' && (
            <TeamLeaveApprovals />
          )}
          {activeModule === 'manager-overtime' && (
            <TeamOvertimeApprovals />
          )}
          {activeModule === 'manager-performance' && (
            <TeamPerformanceKpi />
          )}

          {activeModule === 'employee-dashboard' && (
            <EmployeeDashboard onNavigate={handleNavigate} />
          )}
          {activeModule === 'employee-profile' && (
            <MyProfileView />
          )}
          {activeModule === 'employee-checkin' && (
            <MyFaceCheckinView />
          )}
          {activeModule === 'employee-attendance' && (
            <MyAttendanceView />
          )}
          {activeModule === 'employee-leave' && (
            <MyLeaveView />
          )}
          {activeModule === 'employee-overtime' && (
            <MyOvertimeView />
          )}
          {activeModule === 'employee-payslip' && (
            <MyPayslipView />
          )}
          {activeModule === 'employee-training' && (
            <MyTrainingView />
          )}

          {activeModule === 'finance-dashboard' && (
            <FinanceDashboard onNavigate={handleNavigate} />
          )}
          {activeModule === 'finance-components' && (
            <SalaryComponentsView />
          )}
          {activeModule === 'finance-calc' && (
            <PayrollCalculationView />
          )}
          {activeModule === 'finance-reports' && (
            <PayrollReportsView />
          )}

          {activeModule === 'hr-dashboard' && (
            <HrDashboard
              onNavigate={handleNavigate}
              currentUser={currentUser}
            />
          )}

          {activeModule === 'hr-employees' && (
            <HrEmployeesView
              employees={employees}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={handleSelectEmployee}
              onAddEmployee={handleAddEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              subModule={activeSubModule}
              onBackToList={() => handleNavigate('hr-employees', 'list')}
              onNavigateFaceRegistration={handleStartFaceRegistration}
              onNavigate={handleNavigate}
            />
          )}

          {activeModule === 'hr-attendance' && (
            <HrAttendanceView
              subModule={activeSubModule}
              employee={selectedEmployee}
              onBack={() => handleNavigate('hr-attendance', 'face-checkin')}
              onCompleteRegistration={handleCompleteFaceRegistration}
              onNavigate={handleNavigate}
            />
          )}

          {activeModule === 'hr-recruitment' && (
            <HrRecruitmentView
              subModule={activeSubModule}
              onNavigate={handleNavigate}
            />
          )}

          {activeModule === 'hr-leave' && (
            <HrLeaveView />
          )}

          {activeModule === 'hr-overtime' && (
            <HrOvertimeView />
          )}

          {activeModule === 'hr-assets' && (
            <HrAssetsView />
          )}

          {activeModule === 'hr-reports' && (
            <HrReportsView />
          )}
        </main>
      </div>
    </div>
  );
}
