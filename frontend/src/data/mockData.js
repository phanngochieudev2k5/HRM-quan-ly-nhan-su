

export const currentUser = null;

export const currentUsersByRole = {
  Admin: {
    id: "ADM001",
    name: "Quản trị viên Hệ thống",
    role: "Admin",
    roleTitle: "System Administrator",
    email: "admin@company.com"
  },
  HR: {
    id: "HR001",
    name: "Chuyên viên Nhân sự",
    role: "HR",
    roleTitle: "HR Manager",
    email: "hr@company.com"
  },
  Manager: {
    id: "MGR001",
    name: "Trưởng phòng Quản lý",
    role: "Manager",
    roleTitle: "Team Manager",
    email: "manager@company.com"
  },
  Employee: {
    id: "EMP001",
    name: "Nhân viên Doanh nghiệp",
    role: "Employee",
    roleTitle: "Nhân viên (Cá nhân)",
    email: "employee@company.com"
  },
  Finance: {
    id: "FIN001",
    name: "Kế toán Tiền lương",
    role: "Finance",
    roleTitle: "Payroll Accountant",
    email: "finance@company.com"
  }
};

export const employeesData = [];

export const leaveRequestsData = [];

export const overtimeRequestsData = [];

export const recruitmentJobs = [];
export const candidatesPipeline = [];

export const onboardingList = [];

export const contractsData = [];

export const orgHierarchyData = {
  id: "ORG_ROOT",
  title: "Ban Giám Đốc Doanh Nghiệp (BOD)",
  head: "Chưa phân công",
  role: "Tổng Giám Đốc Điều Hành (CEO)",
  avatar: "",
  empCount: 0,
  children: []
};

export const assetsData = [];

export const trainingCoursesData = [];

export const userAccountsData = [];

export const systemAuditLogsData = [];

export const attendanceHistoryData = [];

export const salaryComponentsData = {
  allowances: [],
  deductions: [],
  taxBrackets: []
};
export const payrollCalculationData = [];
export const payrollReportsData = [];
