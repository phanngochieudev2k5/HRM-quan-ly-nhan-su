# CẤU TRÚC THƯ MỤC HỆ THỐNG HRM ENTERPRISE & OPENCV

> **Dự án:** Hệ thống Quản trị Nhân sự Doanh nghiệp (Enterprise HRM & OpenCV Face Attendance)  
> **Kiến trúc:** Phân tách 2 tầng độc lập `frontend/` và `backend/`  
> **Quy chuẩn đặt tên file Backend:** `PascalCase` (`XinChao.js`)  
> **Công nghệ sử dụng:**
> - **Frontend:** ReactJS 18, Vite, Lucide Icons, Vanilla CSS
> - **Backend:** NodeJS, ExpressJS, SQL Server (`mssql`), JWT, Multer
> - **AI Vision:** OpenCV (Python / OpenCV Engine) trích xuất vector khuôn mặt 512-d

---

## I. SƠ ĐỒ CÂY THƯ MỤC TOÀN BỘ DỰ ÁN

```text
hrm-project/
│
├── frontend/                                   # Mã nguồn giao diện người dùng (ReactJS + Vite)
│   ├── public/                                 # Tài nguyên tĩnh công khai (favicon, logo, icons)
│   ├── src/
│   │   ├── components/                         # Các thành phần giao diện UI
│   │   │   ├── common/                         # Thành phần UI dùng chung
│   │   │   │   ├── ConfirmModal.jsx            # Hộp thoại xác nhận thao tác (Xóa, duyệt, chốt)
│   │   │   │   ├── PageHeader.jsx              # Tiêu đề trang chuẩn hóa
│   │   │   │   ├── StatCard.jsx                # Thẻ thống kê số liệu trên Dashboard
│   │   │   │   └── StatusBadge.jsx             # Huy hiệu trạng thái (Hiệu lực, Chờ duyệt, Đi muộn...)
│   │   │   │
│   │   │   ├── layout/                         # Khung giao diện chính hệ thống
│   │   │   │   ├── Header.jsx                  # Thanh trên cùng: Đổi vai trò (Role Switcher), Thông báo, Avatar
│   │   │   │   └── Sidebar.jsx                 # Thanh menu bên trái: Điều hướng phân cấp theo 5 vai trò
│   │   │   │
│   │   │   └── roles/                          # Giao diện phân chia theo 5 nhóm quyền người dùng
│   │   │       ├── admin/                      # [PHÂN HỆ ADMIN]
│   │   │       │   ├── AdminDashboard.jsx      # Tổng quan hệ thống, tài khoản, audit logs
│   │   │       │   ├── SystemAuditLogs.jsx     # Nhật ký bảo mật & truy vết hành vi người dùng
│   │   │       │   ├── SystemSettingsView.jsx  # Cấu hình tham số hệ thống & email server
│   │   │       │   └── UserAccountsView.jsx    # Quản lý tài khoản, cấp quyền & khóa tài khoản
│   │   │       │
│   │   │       ├── hr/                         # [PHÂN HỆ QUẢN TRỊ NHÂN SỰ - HR]
│   │   │       │   ├── HrAssetsView.jsx        # Cấp phát & thu hồi máy tính, thiết bị
│   │   │       │   ├── HrAttendanceView.jsx    # Bảng công tháng, Kiosk OpenCV, Face ID, Ca làm việc
│   │   │       │   ├── HrDashboard.jsx         # Tầm nhìn chiến lược nhân sự, chỉ số chuyên cần
│   │   │       │   ├── HrEmployeesView.jsx     # Hồ sơ nhân sự, Onboarding, Hợp đồng, Sơ đồ tổ chức
│   │   │       │   ├── HrLeaveView.jsx         # Quản lý đơn nghỉ phép toàn doanh nghiệp
│   │   │       │   ├── HrOvertimeView.jsx      # Quản lý kế hoạch tăng ca (OT) toàn doanh nghiệp
│   │   │       │   ├── HrRecruitmentView.jsx   # Vị trí tuyển dụng & Kanban ứng viên
│   │   │       │   └── HrReportsView.jsx       # Báo cáo biến động nhân sự, tỷ lệ nghỉ việc
│   │   │       │
│   │   │       ├── manager/                    # [PHÂN HỆ TRƯỞNG BỘ PHẬN - MANAGER]
│   │   │       │   ├── ManagerDashboard.jsx    # Tổng quan nhóm, việc cần xử lý gấp
│   │   │       │   ├── TeamLeaveApprovals.jsx  # Phê duyệt đơn xin nghỉ phép của nhân viên trong nhóm
│   │   │       │   ├── TeamMembersView.jsx     # Danh sách và thông tin nhân viên trực thuộc
│   │   │       │   ├── TeamOvertimeApprovals.jsx # Phê duyệt phiếu đăng ký làm thêm giờ (OT)
│   │   │       │   └── TeamPerformanceKpi.jsx  # Đánh giá hiệu suất và chấm điểm KPI định kỳ
│   │   │       │
│   │   │       ├── employee/                   # [PHÂN HỆ NHÂN VIÊN - EMPLOYEE PORTAL]
│   │   │       │   ├── EmployeeDashboard.jsx   # Không gian cá nhân, tổng số phép còn lại, công tháng
│   │   │       │   ├── MyAttendanceView.jsx    # Lịch sử chấm công chi tiết theo từng ngày
│   │   │       │   ├── MyFaceCheckinView.jsx   # Màn hình chấm công khuôn mặt cá nhân qua webcam
│   │   │       │   ├── MyLeaveView.jsx         # Làm đơn xin nghỉ phép (phép năm, nghỉ ốm, việc riêng)
│   │   │       │   ├── MyOvertimeView.jsx      # Đăng ký làm thêm giờ (OT ngày thường / cuối tuần)
│   │   │       │   ├── MyPayslipView.jsx       # Tra cứu phiếu lương chi tiết từng tháng
│   │   │       │   ├── MyProfileView.jsx       # Xem thông tin lý lịch cá nhân, thuế, tài khoản ngân hàng
│   │   │       │   └── MyTrainingView.jsx      # Đăng ký và tham gia các khóa đào tạo nội bộ
│   │   │       │
│   │   │       └── finance/                    # [PHÂN HỆ TÀI CHÍNH / KẾ TOÁN TIỀN LƯƠNG - FINANCE]
│   │   │           ├── FinanceDashboard.jsx    # Tổng quan quỹ lương doanh nghiệp, chi phí thực tế
│   │   │           ├── PayrollCalculationView.jsx # Bảng tính lương tự động, chốt sổ bảng lương tháng
│   │   │           ├── PayrollReportsView.jsx  # Xuất báo cáo thuế TNCN, đóng BHXH, ủy nhiệm chi ngân hàng
│   │   │           └── SalaryComponentsView.jsx # Cấu hình công thức Gross - Net, mức phụ cấp, khấu trừ
│   │   │
│   │   ├── services/                           # Tầng gọi API kết nối sang Backend
│   │   │   ├── ApiClient.js                    # Khởi tạo Axios instance (gắn JWT token vào Header)
│   │   │   ├── AuthService.js                  # Gọi API đăng nhập, lấy thông tin cá nhân
│   │   │   ├── AdminService.js                 # Gọi API phân hệ Admin
│   │   │   ├── HrService.js                    # Gọi API phân hệ HR
│   │   │   ├── ManagerService.js               # Gọi API phân hệ Manager
│   │   │   ├── EmployeeService.js              # Gọi API phân hệ Employee
│   │   │   ├── FinanceService.js               # Gọi API phân hệ Finance
│   │   │   └── OpenCvService.js                # Gọi API nhận diện khuôn mặt và nạp Face ID
│   │   │
│   │   ├── styles/                             # Toàn bộ CSS giao diện hệ thống
│   │   │   ├── theme.css                       # Biến màu sắc, khoảng cách, font chữ chung
│   │   │   ├── layout/                         # CSS cho Sidebar, Header
│   │   │   └── roles/                          # CSS chi tiết cho từng màn hình
│   │   │
│   │   ├── App.jsx                             # Component gốc, quản lý vai trò và điều hướng router
│   │   ├── main.jsx                            # Điểm khởi chạy React DOM
│   │   └── index.css                           # Reset CSS cơ sở
│   │
│   ├── index.html                              # Trang HTML chính của ứng dụng Single Page App
│   ├── package.json                            # Khai báo thư viện Frontend (React, Lucide, Axios...)
│   └── vite.config.js                          # Cấu hình Vite build & dev server
│
├── backend/                                    # Mã nguồn máy chủ xử lý dữ liệu (NodeJS + ExpressJS)
│   ├── uploads/                                # Thư mục lưu trữ tệp tin do người dùng tải lên
│   │   ├── avatars/                            # Ảnh đại diện nhân viên
│   │   ├── faces/                              # Ảnh chụp 3 góc độ phục vụ huấn luyện Face ID
│   │   ├── resumes/                            # Tệp CV hồ sơ ứng tuyển tuyển dụng
│   │   └── contracts/                          # Tệp scan hợp đồng lao động đính kèm
│   │
│   ├── src/
│   │   ├── Config/                             # Cấu hình kết nối hệ thống
│   │   │   ├── DbConfig.js                     # Cấu hình chuỗi kết nối Microsoft SQL Server
│   │   │   ├── JwtConfig.js                    # Cấu hình mã bí mật Token và thời hạn phiên đăng nhập
│   │   │   └── MulterConfig.js                 # Định nghĩa đường dẫn và bộ lọc định dạng file tải lên
│   │   │
│   │   ├── Middlewares/                        # Bộ lọc bảo mật & phân quyền trước khi vào Controller
│   │   │   ├── AuthMiddleware.js               # Kiểm tra và giải mã JWT token (xác thực người dùng)
│   │   │   ├── RoleMiddleware.js               # Kiểm tra quyền truy cập theo từng Role (Admin, HR, Manager...)
│   │   │   ├── UploadMiddleware.js             # Bắt dữ liệu file ảnh, file tài liệu từ request multipart
│   │   │   └── ErrorMiddleware.js              # Xử lý ngoại lệ tập trung (tránh sập server)
│   │   │
│   │   ├── Routes/                             # Định tuyến các cổng API phân chia theo Role
│   │   │   ├── AuthRoutes.js                   # /api/auth (Login, Logout, Đổi mật khẩu)
│   │   │   ├── AdminRoutes.js                  # /api/admin/...
│   │   │   ├── HrRoutes.js                     # /api/hr/...
│   │   │   ├── ManagerRoutes.js                # /api/manager/...
│   │   │   ├── EmployeeRoutes.js               # /api/employee/...
│   │   │   ├── FinanceRoutes.js                # /api/finance/...
│   │   │   └── OpenCvRoutes.js                 # /api/opencv/...
│   │   │
│   │   ├── Controllers/                        # Nhận request, kiểm tra tham số, trả về JSON chuẩn
│   │   │   ├── AuthController.js               # Xử lý đăng nhập, cấp Access/Refresh Token
│   │   │   │
│   │   │   ├── Admin/                          # [Code API cho phân quyền Admin]
│   │   │   │   ├── UserAccountsController.js   # Quản lý tài khoản, phân vai trò, đổi trạng thái khóa
│   │   │   │   ├── SystemLogsController.js     # Truy vấn và lọc danh sách nhật ký bảo mật
│   │   │   │   └── SettingsController.js       # Lưu trữ tham số cấu hình hệ thống
│   │   │   │
│   │   │   ├── Hr/                             # [Code API cho phân quyền HR]
│   │   │   │   ├── EmployeesController.js      # Thêm, sửa, xóa, tìm kiếm nhân sự, lịch sử công tác
│   │   │   │   ├── OnboardingController.js     # Cập nhật tiến độ 4 bước tiếp nhận nhân viên mới
│   │   │   │   ├── ContractsController.js      # Quản lý hợp đồng lao động và thời hạn gia hạn
│   │   │   │   ├── OrgChartController.js       # Lấy cấu trúc cây tổ chức phòng ban và phân cấp
│   │   │   │   ├── RecruitmentController.js    # Quản lý vị trí tuyển dụng và trạng thái ứng viên Kanban
│   │   │   │   └── HrAttendanceController.js   # Xem bảng công tổng hợp tháng, hiệu chỉnh công
│   │   │   │
│   │   │   ├── Manager/                        # [Code API cho phân quyền Manager]
│   │   │   │   ├── TeamMembersController.js    # Lấy danh sách nhân viên trong phòng ban quản lý
│   │   │   │   ├── LeaveApprovalController.js  # Duyệt hoặc từ chối đơn xin nghỉ phép của nhóm
│   │   │   │   ├── OvertimeApprovalController.js # Duyệt hoặc từ chối đơn đăng ký làm thêm giờ
│   │   │   │   └── KpiEvaluationController.js  # Chấm điểm và lưu kết quả đánh giá KPI cấp dưới
│   │   │   │
│   │   │   ├── Employee/                       # [Code API cho phân quyền Employee]
│   │   │   │   ├── MyProfileController.js      # Xem hồ sơ cá nhân và gửi yêu cầu cập nhật
│   │   │   │   ├── MyAttendanceController.js   # Lấy bảng lịch sử công cá nhân theo tháng
│   │   │   │   ├── MyLeaveController.js        # Gửi đơn xin nghỉ phép cá nhân
│   │   │   │   ├── MyOvertimeController.js     # Gửi đơn đăng ký tăng ca cá nhân
│   │   │   │   └── MyPayslipController.js      # Tra cứu chi tiết phiếu lương hàng tháng
│   │   │   │
│   │   │   ├── Finance/                        # [Code API cho phân quyền Finance]
│   │   │   │   ├── SalaryComponentsController.js # Cấu hình mức phụ cấp, khấu trừ, thuế, bảo hiểm
│   │   │   │   ├── PayrollCalcController.js    # Tính lương tháng tự động và chốt bảng lương
│   │   │   │   └── PayrollReportsController.js # Báo cáo chi phí quỹ lương và khấu trừ thuế TNCN
│   │   │   │
│   │   │   └── OpenCv/                         # [Code API cho Module Chấm công Face ID]
│   │   │       ├── FaceRegisterController.js   # Nhận 3 ảnh khuôn mặt, trích xuất và lưu vector 512-d
│   │   │       └── FaceCheckinController.js    # Nhận ảnh từ Kiosk, so khớp khuôn mặt và ghi nhận công
│   │   │
│   │   ├── Services/                           # Xử lý thuật toán và nghiệp vụ chi tiết (Business Logic)
│   │   │   ├── AdminService.js                 # Xử lý logic phân quyền, mã hóa mật khẩu, ghi nhật ký
│   │   │   ├── HrService.js                    # Xử lý nghiệp vụ nhân sự, phân cấp cây tổ chức
│   │   │   ├── ManagerService.js               # Xử lý quy tắc phê duyệt theo cấp quản lý
│   │   │   ├── EmployeeService.js              # Xử lý nghiệp vụ tự phục vụ của nhân viên
│   │   │   ├── FinanceService.js               # Thuật toán tính lương Gross - Net, thuế lũy tiến
│   │   │   └── OpenCvService.js                # Thuật toán so khớp vector Face ID (Cosine / Euclidean)
│   │   │
│   │   ├── Models/                             # Truy vấn cơ sở dữ liệu SQL Server (Data Access Layer)
│   │   │   ├── UserModel.js                    # Truy vấn bảng TaiKhoan, PhanQuyen
│   │   │   ├── EmployeeModel.js                # Truy vấn bảng NhanVien, QuaTrinhCongTac
│   │   │   ├── ContractModel.js                # Truy vấn bảng HopDongLaoDong
│   │   │   ├── AttendanceModel.js              # Truy vấn bảng ChamCong, CaLamViec
│   │   │   ├── FaceVectorModel.js              # Truy vấn bảng DuLieuKhuonMat (Lưu vector nhị phân)
│   │   │   ├── LeaveRequestModel.js            # Truy vấn bảng DonNghiPhep
│   │   │   ├── OvertimeRequestModel.js         # Truy vấn bảng DangKyTangCa
│   │   │   └── PayrollModel.js                 # Truy vấn bảng BangLuong, ChiTietLuong
│   │   │
│   │   └── Utils/                              # Hàm tiện ích dùng chung toàn backend
│   │       ├── ResponseHelper.js               # Chuẩn hóa format phản hồi: { success, data, message }
│   │       ├── DateHelper.js                   # Xử lý múi giờ, định dạng ngày tháng Việt Nam
│   │       └── PayrollFormula.js               # Hàm tính thuế thu nhập cá nhân và bảo hiểm xã hội
│   │
│   ├── .env                                    # Biến môi trường: PORT, DB_HOST, DB_NAME, JWT_SECRET
│   ├── package.json                            # Khai báo dependencies: express, mssql, jsonwebtoken...
│   └── Server.js                               # Điểm bắt đầu của ứng dụng Backend
│
└── README.md                                   # Tài liệu hướng dẫn cài đặt và khởi chạy dự án
```

---

## II. BẢNG ÁNH XẠ 1-1: FRONTEND ⇄ BACKEND THEO TỪNG PHÂN QUYỀN

Bảng này giúp lập trình viên xác định ngay lập tức: **"Tôi muốn làm tính năng X thì mở file nào ở Frontend và file nào ở Backend?"**

| Vai trò (Role) | Chức năng nghiệp vụ | Màn hình Frontend | Controller Backend | Endpoint Route API |
|:---|:---|:---|:---|:---|
| **Chung** | Đăng nhập & Xác thực | `Header.jsx` | `AuthController.js` | `POST /api/auth/login`<br>`GET /api/auth/me` |
| **1. Admin** | Quản trị tài khoản & Khóa | `UserAccountsView.jsx` | `UserAccountsController.js` | `GET/POST /api/admin/accounts`<br>`PUT /api/admin/accounts/:id/status` |
| **1. Admin** | Nhật ký bảo mật hệ thống | `SystemAuditLogs.jsx` | `SystemLogsController.js` | `GET /api/admin/audit-logs` |
| **2. HR** | Quản lý danh sách nhân sự | `HrEmployeesView.jsx` | `EmployeesController.js` | `GET/POST/PUT/DELETE /api/hr/employees` |
| **2. HR** | Tiếp nhận Onboarding | `HrEmployeesView.jsx` | `OnboardingController.js` | `GET/PUT /api/hr/onboarding/:id` |
| **2. HR** | Quản lý hợp đồng lao động | `HrEmployeesView.jsx` | `ContractsController.js` | `GET/POST/PUT /api/hr/contracts` |
| **2. HR** | Sơ đồ cây cơ cấu tổ chức | `HrEmployeesView.jsx` | `OrgChartController.js` | `GET /api/hr/org-chart` |
| **2. HR** | Kiosk Chấm công OpenCV | `HrAttendanceView.jsx` | `FaceCheckinController.js` | `POST /api/opencv/checkin-stream` |
| **2. HR** | Đăng ký Face ID OpenCV | `HrAttendanceView.jsx` | `FaceRegisterController.js` | `POST /api/opencv/register-face` |
| **2. HR** | Bảng chấm công tháng & Ca | `HrAttendanceView.jsx` | `HrAttendanceController.js` | `GET/PUT /api/hr/attendance/monthly` |
| **2. HR** | Tuyển dụng & Kanban ứng viên | `HrRecruitmentView.jsx` | `RecruitmentController.js` | `GET/POST /api/hr/recruitment/jobs`<br>`PUT /api/hr/recruitment/candidates` |
| **3. Manager** | Quản lý nhân viên nhóm | `TeamMembersView.jsx` | `TeamMembersController.js` | `GET /api/manager/team` |
| **3. Manager** | Phê duyệt đơn xin nghỉ | `TeamLeaveApprovals.jsx` | `LeaveApprovalController.js` | `GET/PUT /api/manager/leaves/:id/approve` |
| **3. Manager** | Phê duyệt phiếu tăng ca | `TeamOvertimeApprovals.jsx`| `OvertimeApprovalController.js`| `GET/PUT /api/manager/overtime/:id/approve` |
| **3. Manager** | Đánh giá KPI cấp dưới | `TeamPerformanceKpi.jsx` | `KpiEvaluationController.js` | `GET/POST /api/manager/kpi` |
| **4. Employee**| Xem hồ sơ cá nhân | `MyProfileView.jsx` | `MyProfileController.js` | `GET/PUT /api/employee/profile` |
| **4. Employee**| Xem bảng công của mình | `MyAttendanceView.jsx` | `MyAttendanceController.js` | `GET /api/employee/attendance` |
| **4. Employee**| Làm đơn xin nghỉ phép | `MyLeaveView.jsx` | `MyLeaveController.js` | `GET/POST /api/employee/leaves` |
| **4. Employee**| Đăng ký làm thêm giờ (OT) | `MyOvertimeView.jsx` | `MyOvertimeController.js` | `GET/POST /api/employee/overtime` |
| **4. Employee**| Tra cứu phiếu lương | `MyPayslipView.jsx` | `MyPayslipController.js` | `GET /api/employee/payslips/:month` |
| **5. Finance** | Cấu hình thành phần lương | `SalaryComponentsView.jsx` | `SalaryComponentsController.js` | `GET/POST /api/finance/salary-components` |
| **5. Finance** | Tính lương & Chốt sổ lương | `PayrollCalculationView.jsx` | `PayrollCalcController.js` | `POST /api/finance/payroll/calculate`<br>`POST /api/finance/payroll/lock` |
| **5. Finance** | Báo cáo quỹ lương & Thuế | `PayrollReportsView.jsx` | `PayrollReportsController.js` | `GET /api/finance/reports` |

---

## III. NGUYÊN LÝ BẢO MẬT PHÂN QUYỀN (RBAC) Ở BACKEND

Mỗi khi người dùng gửi một yêu cầu từ Frontend, yêu cầu đó sẽ đi qua chuỗi xử lý 5 bước:

```text
[Frontend Request kèm Bearer Token]
                ↓
[1. AuthMiddleware.js]      ➔ Kiểm tra tính hợp lệ của Token JWT (Ai đang gọi?)
                ↓
[2. RoleMiddleware.js]      ➔ Kiểm tra quyền người gọi (Có phải HR/Admin/Manager... không?)
                ↓
[3. XxxController.js]       ➔ Tiếp nhận tham số, validate dữ liệu đầu vào
                ↓
[4. XxxService.js]          ➔ Xử lý nghiệp vụ & thuật toán
                ↓
[5. XxxModel.js]            ➔ Thực hiện câu lệnh truy vấn tới SQL Server
                ↓
[ResponseHelper.js]         ➔ Định dạng kết quả JSON chuẩn trả về cho Frontend
```

### Ví dụ Middleware kiểm tra quyền (`RoleMiddleware.js`):
```javascript
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này!'
      });
    }
    next();
  };
};
```

### Cách áp dụng vào file Route (`HrRoutes.js`):
```javascript
import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import * as EmployeesController from '../Controllers/Hr/EmployeesController.js';

const router = express.Router();

// Chỉ người dùng có Token hợp lệ VÀ mang vai trò 'HR' hoặc 'Admin' mới được gọi các API bên dưới
router.use(verifyToken, requireRole('HR', 'Admin'));

router.get('/employees', EmployeesController.getAll);
router.post('/employees', EmployeesController.create);
router.put('/employees/:id', EmployeesController.update);
router.delete('/employees/:id', EmployeesController.deleteById);

export default router;
```

---

## IV. QUY ƯỚC CHUẨN KHI LÀM VIỆC NHÓM

1. **Quy ước đặt tên file (Naming Convention):**
   - Mọi file code Javascript logic và Component đều dùng **`PascalCase`** (`EmployeesController.js`, `HrService.js`, `AuthRoutes.js`).
   - Tên thư mục cha viết hoa chữ cái đầu (`Controllers/`, `Services/`, `Models/`, `Middlewares/`).

2. **Quy ước phản hồi JSON (Response Format):**
   Mọi API phải luôn trả về đúng cấu trúc chuẩn:
   ```json
   {
     "success": true,
     "message": "Thông báo thân thiện với người dùng",
     "data": { ... }
   }
   ```
   Nếu có lỗi:
   ```json
   {
     "success": false,
     "message": "Nội dung lỗi chi tiết",
     "error": null
   }
   ```

3. **Quy tắc làm việc trên Git:**
   - Mỗi thành viên phụ trách một thư mục phân quyền riêng biệt:
     - Lập trình viên phụ trách Admin: `Controllers/Admin/`, `Services/AdminService.js`
     - Lập trình viên phụ trách HR: `Controllers/Hr/`, `Services/HrService.js`
     - Lập trình viên phụ trách Finance: `Controllers/Finance/`, `Services/FinanceService.js`
   - Cấu trúc độc lập này loại bỏ hoàn toàn tình trạng xung đột mã nguồn (Git merge conflict) khi ghép code.
