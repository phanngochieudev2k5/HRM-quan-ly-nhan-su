// Dữ liệu mẫu Demo Hệ Thống HRM Enterprise
export const currentUser = {
  id: "EMP001",
  name: "Nguyễn Văn A",
  role: "HR", // Admin, HR, Manager, Finance, Employee
  roleTitle: "HR Manager & Trưởng phòng Nhân sự",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  email: "nguyenvana@company.com",
  department: "Phòng Nhân sự",
  unreadNotifications: 3
};

export const employeesData = [
  {
    id: "EMP001",
    name: "Nguyễn Văn A",
    gender: "Nam",
    birthDate: "15/04/1992",
    email: "nguyenvana@company.com",
    phone: "0901 234 567",
    department: "Phòng Nhân sự",
    position: "HR Manager",
    joinDate: "02/01/2021",
    status: "Đang làm việc",
    contractType: "Không xác định thời hạn",
    baseSalary: 28000000,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    faceRegistered: true,
    address: "Cầu Giấy, Hà Nội",
    manager: "Ban Giám Đốc"
  },
  {
    id: "EMP002",
    name: "Trần Thị Bích",
    gender: "Nữ",
    birthDate: "20/08/1995",
    email: "tranbich@company.com",
    phone: "0912 345 678",
    department: "Khối Kỹ Thuật (IT)",
    position: "Senior Fullstack Developer",
    joinDate: "15/03/2022",
    status: "Đang làm việc",
    contractType: "Hợp đồng 3 năm",
    baseSalary: 32000000,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    faceRegistered: true,
    address: "Thanh Xuân, Hà Nội",
    manager: "Nguyễn Văn A"
  },
  {
    id: "EMP003",
    name: "Lê Hoàng Long",
    gender: "Nam",
    birthDate: "10/11/1996",
    email: "longlh@company.com",
    phone: "0988 777 666",
    department: "Khối Kỹ Thuật (IT)",
    position: "Backend Developer (NodeJS)",
    joinDate: "01/06/2023",
    status: "Đang làm việc",
    contractType: "Hợp đồng 1 năm",
    baseSalary: 22000000,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    faceRegistered: true,
    address: "Đống Đa, Hà Nội",
    manager: "Trần Thị Bích"
  },
  {
    id: "EMP004",
    name: "Phạm Minh Đức",
    gender: "Nam",
    birthDate: "05/02/1994",
    email: "ducpm@company.com",
    phone: "0971 123 456",
    department: "Marketing & Truyền thông",
    position: "Marketing Lead",
    joinDate: "10/10/2021",
    status: "Đang làm việc",
    contractType: "Hợp đồng 3 năm",
    baseSalary: 25000000,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    faceRegistered: true,
    address: "Ba Đình, Hà Nội",
    manager: "Nguyễn Văn A"
  },
  {
    id: "EMP005",
    name: "Hoàng Thảo My",
    gender: "Nữ",
    birthDate: "12/09/1998",
    email: "myht@company.com",
    phone: "0934 888 999",
    department: "Tài chính - Kế toán",
    position: "Chuyên viên Kế toán lương",
    joinDate: "01/08/2022",
    status: "Đang làm việc",
    contractType: "Hợp đồng 2 năm",
    baseSalary: 18000000,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    faceRegistered: true,
    address: "Hai Bà Trưng, Hà Nội",
    manager: "Nguyễn Văn A"
  },
  {
    id: "EMP006",
    name: "Đỗ Gia Huy",
    gender: "Nam",
    birthDate: "18/07/2001",
    email: "huydg@company.com",
    phone: "0945 678 123",
    department: "Khối Kỹ Thuật (IT)",
    position: "Frontend React Developer (Thử việc)",
    joinDate: "15/02/2025",
    status: "Thử việc",
    contractType: "Hợp đồng thử việc 2 tháng",
    baseSalary: 12000000,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    faceRegistered: false,
    address: "Hà Đông, Hà Nội",
    manager: "Trần Thị Bích"
  },
  {
    id: "EMP007",
    name: "Vũ Phương Linh",
    gender: "Nữ",
    birthDate: "28/12/1997",
    email: "linhvp@company.com",
    phone: "0967 890 234",
    department: "Phòng Nhân sự",
    position: "Chuyên viên Tuyển dụng & Đào tạo",
    joinDate: "10/05/2023",
    status: "Đang làm việc",
    contractType: "Hợp đồng 1 năm",
    baseSalary: 16500000,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    faceRegistered: true,
    address: "Hoàng Mai, Hà Nội",
    manager: "Nguyễn Văn A"
  },
  {
    id: "EMP008",
    name: "Bùi Quốc Tuấn",
    gender: "Nam",
    birthDate: "03/04/1993",
    email: "tuanbq@company.com",
    phone: "0915 222 333",
    department: "Kinh doanh & Bán hàng",
    position: "Sales Supervisor",
    joinDate: "01/11/2020",
    status: "Đã nghỉ việc",
    contractType: "Đã thanh lý",
    baseSalary: 20000000,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    faceRegistered: false,
    address: "Nam Từ Liêm, Hà Nội",
    manager: "Nguyễn Văn A"
  }
];

export const attendanceHistoryData = [
  {
    id: "ATT01",
    empId: "EMP001",
    empName: "Nguyễn Văn A",
    dept: "Phòng Nhân sự",
    date: "21/04/2025",
    timeIn: "08:05",
    timeOut: "17:35",
    workHours: 8.5,
    device: "Camera Cổng Chính (OpenCV)",
    status: "PRESENT",
    confidence: "98.2%"
  },
  {
    id: "ATT02",
    empId: "EMP002",
    empName: "Trần Thị Bích",
    dept: "Khối Kỹ Thuật (IT)",
    date: "21/04/2025",
    timeIn: "08:27",
    timeOut: "17:40",
    workHours: 8.2,
    device: "Camera Cổng Chính (OpenCV)",
    status: "LATE",
    confidence: "96.5%"
  },
  {
    id: "ATT03",
    empId: "EMP003",
    empName: "Lê Hoàng Long",
    dept: "Khối Kỹ Thuật (IT)",
    date: "21/04/2025",
    timeIn: "07:55",
    timeOut: "18:30",
    workHours: 9.5,
    device: "Camera Cổng Phụ (OpenCV)",
    status: "PRESENT",
    confidence: "97.1%"
  },
  {
    id: "ATT04",
    empId: "EMP004",
    empName: "Phạm Minh Đức",
    dept: "Marketing & Truyền thông",
    date: "21/04/2025",
    timeIn: "08:12",
    timeOut: "17:30",
    workHours: 8.3,
    device: "Camera Cổng Chính (OpenCV)",
    status: "PRESENT",
    confidence: "95.8%"
  },
  {
    id: "ATT05",
    empId: "EMP005",
    empName: "Hoàng Thảo My",
    dept: "Tài chính - Kế toán",
    date: "21/04/2025",
    timeIn: "08:00",
    timeOut: "17:30",
    workHours: 8.5,
    device: "Camera Cổng Chính (OpenCV)",
    status: "PRESENT",
    confidence: "99.0%"
  },
  {
    id: "ATT06",
    empId: "EMP006",
    empName: "Đỗ Gia Huy",
    dept: "Khối Kỹ Thuật (IT)",
    date: "21/04/2025",
    timeIn: "--:--",
    timeOut: "--:--",
    workHours: 0,
    device: "Chưa chấm công",
    status: "ABSENT",
    confidence: "-"
  },
  {
    id: "ATT07",
    empId: "EMP007",
    empName: "Vũ Phương Linh",
    dept: "Phòng Nhân sự",
    date: "21/04/2025",
    timeIn: "--:--",
    timeOut: "--:--",
    workHours: 0,
    device: "Đơn nghỉ phép #LP032",
    status: "LEAVE",
    confidence: "-"
  }
];

export const leaveRequestsData = [
  {
    id: "LP031",
    empId: "EMP002",
    empName: "Trần Thị Bích",
    type: "Nghỉ phép năm",
    startDate: "25/04/2025",
    endDate: "27/04/2025",
    days: 3,
    reason: "Du lịch cùng gia đình",
    createdAt: "18/04/2025",
    approver: "Nguyễn Văn A",
    status: "PENDING" // PENDING, APPROVED, REJECTED
  },
  {
    id: "LP032",
    empId: "EMP007",
    empName: "Vũ Phương Linh",
    type: "Nghỉ ốm / bệnh",
    startDate: "21/04/2025",
    endDate: "21/04/2025",
    days: 1,
    reason: "Sốt virut đi khám bác sĩ",
    createdAt: "20/04/2025",
    approver: "Nguyễn Văn A",
    status: "APPROVED"
  },
  {
    id: "LP030",
    empId: "EMP003",
    empName: "Lê Hoàng Long",
    type: "Nghỉ không lương",
    startDate: "10/04/2025",
    endDate: "11/04/2025",
    days: 2,
    reason: "Việc cá nhân đột xuất",
    createdAt: "08/04/2025",
    approver: "Trần Thị Bích",
    status: "APPROVED"
  },
  {
    id: "LP029",
    empId: "EMP004",
    empName: "Phạm Minh Đức",
    type: "Nghỉ phép năm",
    startDate: "02/04/2025",
    endDate: "05/04/2025",
    days: 4,
    reason: "Về quê ăn cưới em trai",
    createdAt: "28/03/2025",
    approver: "Nguyễn Văn A",
    status: "APPROVED"
  }
];

export const overtimeRequestsData = [
  {
    id: "OT015",
    empId: "EMP003",
    empName: "Lê Hoàng Long",
    date: "22/04/2025",
    timeRange: "18:00 - 21:00",
    hours: 3,
    multiplier: "1.5x",
    project: "Triển khai bản vá HRM Sprint 4",
    status: "PENDING"
  },
  {
    id: "OT014",
    empId: "EMP002",
    empName: "Trần Thị Bích",
    date: "20/04/2025",
    timeRange: "08:30 - 16:30 (Chủ nhật)",
    hours: 7,
    multiplier: "2.0x",
    project: "Tối ưu hóa Database SQL Server & OpenCV API",
    status: "APPROVED"
  },
  {
    id: "OT013",
    empId: "EMP004",
    empName: "Phạm Minh Đức",
    date: "15/04/2025",
    timeRange: "18:00 - 20:00",
    hours: 2,
    multiplier: "1.5x",
    project: "Chạy chiến dịch truyền thông ra mắt sản phẩm",
    status: "APPROVED"
  }
];

export const payrollData = [
  {
    id: "PAY001",
    empId: "EMP001",
    empName: "Nguyễn Văn A",
    dept: "Phòng Nhân sự",
    baseSalary: 28000000,
    allowance: 3500000,
    overtimePay: 0,
    deduction: 2940000, // Bảo hiểm + thuế
    netSalary: 28560000,
    month: "04/2025",
    status: "Đã duyệt"
  },
  {
    id: "PAY002",
    empId: "EMP002",
    empName: "Trần Thị Bích",
    dept: "Khối Kỹ Thuật (IT)",
    baseSalary: 32000000,
    allowance: 2500000,
    overtimePay: 2800000,
    deduction: 3450000,
    netSalary: 33850000,
    month: "04/2025",
    status: "Đã duyệt"
  },
  {
    id: "PAY003",
    empId: "EMP003",
    empName: "Lê Hoàng Long",
    dept: "Khối Kỹ Thuật (IT)",
    baseSalary: 22000000,
    allowance: 1500000,
    overtimePay: 1250000,
    deduction: 2310000,
    netSalary: 22440000,
    month: "04/2025",
    status: "Chờ duyệt"
  },
  {
    id: "PAY004",
    empId: "EMP004",
    empName: "Phạm Minh Đức",
    dept: "Marketing & Truyền thông",
    baseSalary: 25000000,
    allowance: 2000000,
    overtimePay: 850000,
    deduction: 2625000,
    netSalary: 25225000,
    month: "04/2025",
    status: "Chờ duyệt"
  },
  {
    id: "PAY005",
    empId: "EMP005",
    empName: "Hoàng Thảo My",
    dept: "Tài chính - Kế toán",
    baseSalary: 18000000,
    allowance: 1200000,
    overtimePay: 0,
    deduction: 1890000,
    netSalary: 17310000,
    month: "04/2025",
    status: "Đã thanh toán"
  }
];

export const recruitmentJobs = [
  {
    id: "JOB01",
    title: "Senior Backend Developer (NodeJS / Express)",
    dept: "Khối Kỹ Thuật (IT)",
    openCount: 3,
    appliedCount: 14,
    status: "Đang tuyển",
    deadline: "15/05/2025",
    salaryRange: "25 - 35 Triệu VNĐ"
  },
  {
    id: "JOB02",
    title: "Frontend Developer (ReactJS + Tailwind)",
    dept: "Khối Kỹ Thuật (IT)",
    openCount: 2,
    appliedCount: 19,
    status: "Đang tuyển",
    deadline: "20/05/2025",
    salaryRange: "18 - 28 Triệu VNĐ"
  },
  {
    id: "JOB03",
    title: "AI / Computer Vision Engineer (OpenCV)",
    dept: "Khối R&D",
    openCount: 1,
    appliedCount: 6,
    status: "Đang tuyển",
    deadline: "30/05/2025",
    salaryRange: "30 - 45 Triệu VNĐ"
  },
  {
    id: "JOB04",
    title: "Chuyên viên Tuyển dụng & Đào tạo (HR)",
    dept: "Phòng Nhân sự",
    openCount: 1,
    appliedCount: 8,
    status: "Tạm dừng",
    deadline: "10/05/2025",
    salaryRange: "14 - 18 Triệu VNĐ"
  }
];

export const candidatesPipeline = [
  { id: "CAN01", name: "Nguyễn Hải Đăng", job: "Senior Backend Developer", stage: "Applied", rating: 4, email: "haidang@gmail.com", phone: "0981 123 444", date: "19/04/2025" },
  { id: "CAN02", name: "Trịnh Thùy Trang", job: "Frontend Developer", stage: "Screening", rating: 4.5, email: "thuytrang@gmail.com", phone: "0972 334 555", date: "18/04/2025" },
  { id: "CAN03", name: "Hoàng Minh Trí", job: "AI / Computer Vision Engineer", stage: "Interview", rating: 5, email: "minhtri@gmail.com", phone: "0911 223 344", date: "15/04/2025" },
  { id: "CAN04", name: "Bùi Thị Mai", job: "Senior Backend Developer", stage: "Evaluation", rating: 4, email: "buitmai@gmail.com", phone: "0933 445 566", date: "12/04/2025" },
  { id: "CAN05", name: "Phan Văn Nam", job: "Frontend Developer", stage: "Offer", rating: 4.8, email: "namphan@gmail.com", phone: "0909 888 777", date: "10/04/2025" },
  { id: "CAN06", name: "Đỗ Gia Huy", job: "Frontend Developer", stage: "Hired", rating: 5, email: "huydg@company.com", phone: "0945 678 123", date: "01/02/2025" }
];

export const performanceKpiData = {
  employee: {
    name: "Nguyễn Văn A",
    code: "EMP001",
    position: "HR Manager",
    period: "Chu kỳ: 2024 - 2025 (Cả năm)",
    overallScore: 91.5,
    rating: "Xuất sắc (A)"
  },
  criteria: [
    { id: 1, name: "Tiến độ công việc & SLA tuyển dụng", weight: 40, target: "90%", actual: "95%", score: 38 },
    { id: 2, name: "Chất lượng quy trình quản trị nhân sự & hồ sơ", weight: 30, target: "85%", actual: "90%", score: 27 },
    { id: 3, name: "Làm việc nhóm & Gắn kết nhân viên nội bộ", weight: 20, target: "90%", actual: "90%", score: 18 },
    { id: 4, name: "Sáng kiến cải tiến (Tích hợp OpenCV chấm công)", weight: 10, target: "80%", actual: "85%", score: 8.5 }
  ]
};

export const assetsData = [
  { id: "AST01", code: "AST-NB-001", name: "Laptop Dell XPS 15 9530", category: "Thiết bị CNTT", assignedTo: "EMP002 - Trần Thị Bích", assignDate: "15/03/2022", status: "Đang sử dụng", condition: "Tốt" },
  { id: "AST02", code: "AST-NB-002", name: "MacBook Pro 14 M3 Pro", category: "Thiết bị CNTT", assignedTo: "EMP003 - Lê Hoàng Long", assignDate: "01/06/2023", status: "Đang sử dụng", condition: "Mới 99%" },
  { id: "AST03", code: "AST-MN-005", name: "Màn hình Dell UltraSharp 27 inch 4K", category: "Thiết bị CNTT", assignedTo: "EMP002 - Trần Thị Bích", assignDate: "20/03/2022", status: "Đang sử dụng", condition: "Tốt" },
  { id: "AST04", code: "AST-CH-012", name: "Ghế công thái học Herman Miller Aeron", category: "Nội thất văn phòng", assignedTo: "EMP001 - Nguyễn Văn A", assignDate: "02/01/2021", status: "Đang sử dụng", condition: "Tốt" },
  { id: "AST05", code: "AST-NB-008", name: "Laptop Lenovo ThinkPad T14", category: "Thiết bị CNTT", assignedTo: "Chưa cấp phát", assignDate: "-", status: "Sẵn sàng", condition: "Mới trong kho" }
];

export const contractsData = [
  { id: "HD001", empId: "EMP001", empName: "Nguyễn Văn A", type: "Hợp đồng vô thời hạn", signDate: "02/01/2021", endDate: "Không thời hạn", salary: 28000000, status: "Hiệu lực" },
  { id: "HD002", empId: "EMP002", empName: "Trần Thị Bích", type: "Hợp đồng 3 năm", signDate: "15/03/2022", endDate: "15/03/2025", salary: 32000000, status: "Sắp hết hạn" },
  { id: "HD003", empId: "EMP003", empName: "Lê Hoàng Long", type: "Hợp đồng 1 năm", signDate: "01/06/2024", endDate: "01/06/2025", salary: 22000000, status: "Hiệu lực" },
  { id: "HD004", empId: "EMP006", empName: "Đỗ Gia Huy", type: "Hợp đồng thử việc 2 tháng", signDate: "15/02/2025", endDate: "15/04/2025", salary: 12000000, status: "Sắp hết hạn" }
];

export const shiftsData = [
  { id: "SH01", name: "Ca Hành Chính Chuẩn", time: "08:00 - 17:30", breakTime: "12:00 - 13:30 (90 phút)", activeEmp: 98, type: "Toàn thời gian" },
  { id: "SH02", name: "Ca Kỹ Thuật Trực Đêm", time: "22:00 - 06:00", breakTime: "02:00 - 03:00 (60 phút)", activeEmp: 6, type: "Xoay ca" },
  { id: "SH03", name: "Ca Sáng Bán Thời Gian", time: "08:00 - 12:00", breakTime: "Không", activeEmp: 8, type: "Part-time" }
];
