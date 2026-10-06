import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/dashboard/DashboardView';
import EmployeeList from './components/employee/EmployeeList';
import EmployeeDetail from './components/employee/EmployeeDetail';
import ContractsList from './components/employee/ContractsList';
import OrganizationView from './components/employee/OrganizationView';
import FaceAttendanceView from './components/attendance/FaceAttendanceView';
import AttendanceHistoryView from './components/attendance/AttendanceHistoryView';
import FaceRegistrationView from './components/attendance/FaceRegistrationView';
import ShiftsView from './components/attendance/ShiftsView';
import LeaveView from './components/leave/LeaveView';
import OvertimeView from './components/overtime/OvertimeView';
import PayrollView from './components/payroll/PayrollView';
import RecruitmentView from './components/recruitment/RecruitmentView';
import PerformanceView from './components/performance/PerformanceView';
import AssetsView from './components/asset/AssetsView';
import ReportsView from './components/dashboard/ReportsView';
import SettingsView from './components/dashboard/SettingsView';

import { currentUser, employeesData } from './data/mockData';

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [activeSubModule, setActiveSubModule] = useState(null);
  const [currentRole, setCurrentRole] = useState('HR');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [employees, setEmployees] = useState(employeesData);
  const [selectedEmployee, setSelectedEmployee] = useState(employeesData[0]);

  const handleNavigate = (module, subModule = null) => {
    setActiveModule(module);
    setActiveSubModule(subModule);
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setActiveModule('employees');
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
    setActiveModule('attendance');
    setActiveSubModule('register-face');
  };

  const handleCompleteFaceRegistration = (empId) => {
    setEmployees(employees.map(e => e.id === empId ? { ...e, faceRegistered: true } : e));
    if (selectedEmployee && selectedEmployee.id === empId) {
      setSelectedEmployee({ ...selectedEmployee, faceRegistered: true });
    }
  };

  return (
    <div className="app-container">
      {/* Deep Navy Sidebar */}
      <Sidebar
        activeModule={activeModule}
        activeSubModule={activeSubModule}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          currentUser={currentUser}
          onNavigate={handleNavigate}
        />

        <main className="content-area">
          {/* Dashboard Module */}
          {activeModule === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              currentUser={currentUser}
            />
          )}

          {/* Employees Module */}
          {activeModule === 'employees' && (
            <>
              {(!activeSubModule || activeSubModule === 'list') && (
                <EmployeeList
                  employees={employees}
                  onSelectEmployee={handleSelectEmployee}
                  onAddEmployee={handleAddEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                />
              )}
              {activeSubModule === 'profile' && (
                <EmployeeDetail
                  employee={selectedEmployee}
                  onBack={() => handleNavigate('employees', 'list')}
                  onNavigateFaceRegistration={handleStartFaceRegistration}
                />
              )}
              {activeSubModule === 'contracts' && (
                <ContractsList />
              )}
              {activeSubModule === 'org' && (
                <OrganizationView />
              )}
              {activeSubModule === 'history' && (
                <EmployeeDetail
                  employee={selectedEmployee}
                  onBack={() => handleNavigate('employees', 'list')}
                  onNavigateFaceRegistration={handleStartFaceRegistration}
                />
              )}
            </>
          )}

          {/* Attendance Module (OpenCV) */}
          {activeModule === 'attendance' && (
            <>
              {(!activeSubModule || activeSubModule === 'face-checkin') && (
                <FaceAttendanceView />
              )}
              {activeSubModule === 'history' && (
                <AttendanceHistoryView />
              )}
              {activeSubModule === 'register-face' && (
                <FaceRegistrationView
                  employee={selectedEmployee}
                  onBack={() => handleNavigate('attendance', 'face-checkin')}
                  onCompleteRegistration={handleCompleteFaceRegistration}
                />
              )}
              {activeSubModule === 'shifts' && (
                <ShiftsView />
              )}
              {activeSubModule === 'report' && (
                <AttendanceHistoryView />
              )}
            </>
          )}

          {/* Leave Module */}
          {activeModule === 'leave' && (
            <LeaveView currentRole={currentRole} />
          )}

          {/* Overtime Module */}
          {activeModule === 'overtime' && (
            <OvertimeView />
          )}

          {/* Payroll Module */}
          {activeModule === 'payroll' && (
            <PayrollView subModule={activeSubModule} />
          )}

          {/* Recruitment Module */}
          {activeModule === 'recruitment' && (
            <RecruitmentView subModule={activeSubModule} />
          )}

          {/* Performance Module */}
          {activeModule === 'performance' && (
            <PerformanceView />
          )}

          {/* Assets Module */}
          {activeModule === 'assets' && (
            <AssetsView />
          )}

          {/* Reports Module */}
          {activeModule === 'reports' && (
            <ReportsView />
          )}

          {/* Settings Module */}
          {activeModule === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>
    </div>
  );
}
