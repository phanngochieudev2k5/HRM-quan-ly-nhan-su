-- =========================================================================================
-- HỆ THỐNG QUẢN TRỊ NHÂN SỰ DOANH NGHIỆP (ENTERPRISE HRM & OPENCV ATTENDANCE)
-- SCRIPT TẠO CƠ SỞ DỮ LIỆU CHUẨN MICROSOFT SQL SERVER
-- QUY ƯỚC ĐẶT TÊN BẢNG: tbl + EnglishName (tblRole, tblUser, tblEmployee, tblContract...)
-- =========================================================================================

-- 1. TẠO CƠ SỞ DỮ LIỆU
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'HRM_Enterprise_DB')
BEGIN
    CREATE DATABASE HRM_Enterprise_DB;
END
GO

USE HRM_Enterprise_DB;
GO

-- XÓA BẢNG NẾU ĐÃ TỒN TẠI (THEO THỨ TỰ RÀNG BUỘC KHÓA NGOẠI)
IF OBJECT_ID('tblAuditLog', 'U') IS NOT NULL DROP TABLE tblAuditLog;
IF OBJECT_ID('tblSystemSetting', 'U') IS NOT NULL DROP TABLE tblSystemSetting;
IF OBJECT_ID('tblTrainingEnrollment', 'U') IS NOT NULL DROP TABLE tblTrainingEnrollment;
IF OBJECT_ID('tblTrainingCourse', 'U') IS NOT NULL DROP TABLE tblTrainingCourse;
IF OBJECT_ID('tblKpiEvaluation', 'U') IS NOT NULL DROP TABLE tblKpiEvaluation;
IF OBJECT_ID('tblPayrollDetail', 'U') IS NOT NULL DROP TABLE tblPayrollDetail;
IF OBJECT_ID('tblPayrollPeriod', 'U') IS NOT NULL DROP TABLE tblPayrollPeriod;
IF OBJECT_ID('tblSalaryComponent', 'U') IS NOT NULL DROP TABLE tblSalaryComponent;
IF OBJECT_ID('tblAssetAssignment', 'U') IS NOT NULL DROP TABLE tblAssetAssignment;
IF OBJECT_ID('tblAsset', 'U') IS NOT NULL DROP TABLE tblAsset;
IF OBJECT_ID('tblCandidate', 'U') IS NOT NULL DROP TABLE tblCandidate;
IF OBJECT_ID('tblRecruitmentJob', 'U') IS NOT NULL DROP TABLE tblRecruitmentJob;
IF OBJECT_ID('tblOvertimeRequest', 'U') IS NOT NULL DROP TABLE tblOvertimeRequest;
IF OBJECT_ID('tblLeaveRequest', 'U') IS NOT NULL DROP TABLE tblLeaveRequest;
IF OBJECT_ID('tblLeaveType', 'U') IS NOT NULL DROP TABLE tblLeaveType;
IF OBJECT_ID('tblAttendanceExplanation', 'U') IS NOT NULL DROP TABLE tblAttendanceExplanation;
IF OBJECT_ID('tblAttendance', 'U') IS NOT NULL DROP TABLE tblAttendance;
IF OBJECT_ID('tblFaceData', 'U') IS NOT NULL DROP TABLE tblFaceData;
IF OBJECT_ID('tblShift', 'U') IS NOT NULL DROP TABLE tblShift;
IF OBJECT_ID('tblOnboarding', 'U') IS NOT NULL DROP TABLE tblOnboarding;
IF OBJECT_ID('tblContract', 'U') IS NOT NULL DROP TABLE tblContract;
IF OBJECT_ID('tblCareerHistory', 'U') IS NOT NULL DROP TABLE tblCareerHistory;
IF OBJECT_ID('tblEmployee', 'U') IS NOT NULL DROP TABLE tblEmployee;
IF OBJECT_ID('tblPosition', 'U') IS NOT NULL DROP TABLE tblPosition;
IF OBJECT_ID('tblDepartment', 'U') IS NOT NULL DROP TABLE tblDepartment;
IF OBJECT_ID('tblUser', 'U') IS NOT NULL DROP TABLE tblUser;
IF OBJECT_ID('tblRole', 'U') IS NOT NULL DROP TABLE tblRole;
GO

-- =========================================================================================
-- PHẦN 1: BẢO MẬT, TÀI KHOẢN & PHÂN QUYỀN (SECURITY & ACCOUNTS)
-- =========================================================================================

-- 1.1. Bảng Vai trò phân quyền (Role)
CREATE TABLE tblRole (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleCode VARCHAR(20) NOT NULL UNIQUE,          -- 'Admin', 'HR', 'Manager', 'Employee', 'Finance'
    RoleName NVARCHAR(100) NOT NULL,               -- 'Quản trị viên', 'Quản lý nhân sự',...
    Description NVARCHAR(255) NULL
);
GO

-- 1.2. Bảng Tài khoản người dùng (User)
CREATE TABLE tblUser (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,          -- Tên đăng nhập (VD: admin.hieu, hr.vana)
    PasswordHash VARCHAR(255) NOT NULL,            -- Mật khẩu đã băm (Bcrypt)
    Email VARCHAR(100) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    RoleId INT NOT NULL,                           -- Khóa ngoại đến tblRole
    IsLocked BIT DEFAULT 0,                        -- 0: Đang hoạt động, 1: Bị khóa
    TwoFactorEnabled BIT DEFAULT 0,                -- Xác thực 2 bước
    LastLoginAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_User_Role FOREIGN KEY (RoleId) REFERENCES tblRole(RoleId)
);
GO

-- 1.3. Bảng Nhật ký bảo mật & truy vết hành vi (Audit Log)
CREATE TABLE tblAuditLog (
    LogId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    Action NVARCHAR(255) NOT NULL,                 -- Hành động thực hiện
    IpAddress VARCHAR(50) NULL,
    Status NVARCHAR(50) DEFAULT N'Thành công',     -- 'Thành công', 'Thất bại'
    Details NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AuditLog_User FOREIGN KEY (UserId) REFERENCES tblUser(UserId)
);
GO

-- 1.4. Bảng Cấu hình tham số hệ thống (System Setting)
CREATE TABLE tblSystemSetting (
    SettingId INT IDENTITY(1,1) PRIMARY KEY,
    SettingKey VARCHAR(50) NOT NULL UNIQUE,
    SettingValue NVARCHAR(MAX) NOT NULL,
    Description NVARCHAR(255) NULL,
    UpdatedAt DATETIME2 DEFAULT SYSDATETIME()
);
GO

-- =========================================================================================
-- PHẦN 2: CƠ CẤU TỔ CHỨC & HỒ SƠ NHÂN SỰ 360° (ORGANIZATION & EMPLOYEES)
-- =========================================================================================

-- 2.1. Bảng Phòng ban / Khối cơ cấu tổ chức (Department)
-- Hỗ trợ sơ đồ cây phân cấp nhiều tầng qua ParentDepartmentId
CREATE TABLE tblDepartment (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentCode VARCHAR(20) NOT NULL UNIQUE,    -- 'BOD', 'HR', 'IT', 'FIN', 'MKT'
    DepartmentName NVARCHAR(100) NOT NULL,
    ParentDepartmentId INT NULL,                   -- Tự tham chiếu cấp cha để vẽ cây tổ chức
    ManagerEmployeeId INT NULL,                    -- Trưởng phòng / Trưởng bộ phận
    HeadCount INT DEFAULT 0,
    Description NVARCHAR(255) NULL,
    CONSTRAINT FK_Department_Parent FOREIGN KEY (ParentDepartmentId) REFERENCES tblDepartment(DepartmentId)
);
GO

-- 2.2. Bảng Chức danh / Vị trí công việc (Position)
CREATE TABLE tblPosition (
    PositionId INT IDENTITY(1,1) PRIMARY KEY,
    PositionCode VARCHAR(20) NOT NULL UNIQUE,      -- 'CEO', 'HR_MGR', 'DEV_LEAD', 'DEV_SR', 'PAYROLL_SPE'
    PositionName NVARCHAR(100) NOT NULL,
    BaseSalaryMin DECIMAL(18,2) DEFAULT 0,
    BaseSalaryMax DECIMAL(18,2) DEFAULT 0
);
GO

-- 2.3. Bảng Hồ sơ nhân viên trung tâm (Employee)
CREATE TABLE tblEmployee (
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeCode VARCHAR(20) NOT NULL UNIQUE,      -- 'EMP001', 'EMP002', 'NV001'
    FullName NVARCHAR(100) NOT NULL,
    Gender NVARCHAR(10) DEFAULT N'Nam',            -- 'Nam', 'Nữ'
    BirthDate DATE NULL,
    Phone VARCHAR(20) NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Address NVARCHAR(255) NULL,
    IdCardNumber VARCHAR(20) NULL,                 -- Số CCCD / CMND
    IdCardDate DATE NULL,                          -- Ngày cấp
    IdCardPlace NVARCHAR(100) NULL,                -- Nơi cấp
    TaxCode VARCHAR(20) NULL,                      -- Mã số thuế cá nhân
    InsuranceBookNumber VARCHAR(20) NULL,          -- Mã sổ BHXH
    BankName NVARCHAR(100) NULL,                   -- Tên ngân hàng thụ hưởng
    BankAccountNumber VARCHAR(50) NULL,            -- Số tài khoản ngân hàng
    DependentsCount INT DEFAULT 0,                 -- Số người phụ thuộc (giảm trừ gia cảnh)
    DepartmentId INT NOT NULL,                     -- Phòng ban trực thuộc
    PositionId INT NOT NULL,                       -- Chức vụ
    ManagerId INT NULL,                            -- Quản lý trực tiếp (Người duyệt phép/OT)
    UserId INT NULL UNIQUE,                        -- Liên kết 1-1 với tài khoản đăng nhập
    JoinDate DATE NOT NULL,                        -- Ngày vào làm
    WorkStatus NVARCHAR(50) DEFAULT N'Đang làm việc', -- 'Đang làm việc', 'Thử việc', 'Đã thôi việc'
    BaseSalary DECIMAL(18,2) NOT NULL DEFAULT 0,   -- Lương cơ bản tháng
    InsuranceSalary DECIMAL(18,2) NOT NULL DEFAULT 0, -- Lương đóng bảo hiểm
    FaceRegistered BIT DEFAULT 0,                  -- Đã đăng ký khuôn mặt OpenCV chưa
    AvatarUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Employee_Department FOREIGN KEY (DepartmentId) REFERENCES tblDepartment(DepartmentId),
    CONSTRAINT FK_Employee_Position FOREIGN KEY (PositionId) REFERENCES tblPosition(PositionId),
    CONSTRAINT FK_Employee_Manager FOREIGN KEY (ManagerId) REFERENCES tblEmployee(EmployeeId),
    CONSTRAINT FK_Employee_User FOREIGN KEY (UserId) REFERENCES tblUser(UserId)
);
GO

-- Bổ sung Khóa ngoại Trưởng phòng cho tblDepartment (sau khi tblEmployee đã được tạo)
ALTER TABLE tblDepartment ADD CONSTRAINT FK_Department_Manager FOREIGN KEY (ManagerEmployeeId) REFERENCES tblEmployee(EmployeeId);
GO

-- 2.4. Bảng Quá trình công tác / Lịch sử bổ nhiệm (Career History)
CREATE TABLE tblCareerHistory (
    HistoryId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL,
    EventDate DATE NOT NULL,
    EventName NVARCHAR(100) NOT NULL,              -- 'Tiếp nhận chính thức', 'Thăng chức', 'Tăng bậc lương'
    OldPosition NVARCHAR(100) NULL,
    NewPosition NVARCHAR(100) NOT NULL,
    OldDepartment NVARCHAR(100) NULL,
    NewDepartment NVARCHAR(100) NOT NULL,
    DecisionNumber NVARCHAR(50) NULL,              -- Số quyết định bổ nhiệm
    Note NVARCHAR(255) NULL,
    CONSTRAINT FK_CareerHistory_Employee FOREIGN KEY (EmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- 2.5. Bảng Hợp đồng lao động (Contract)
CREATE TABLE tblContract (
    ContractId INT IDENTITY(1,1) PRIMARY KEY,
    ContractNumber VARCHAR(50) NOT NULL UNIQUE,    -- Số hợp đồng 'HD001', 'HD002'
    EmployeeId INT NOT NULL,
    ContractType NVARCHAR(100) NOT NULL,           -- 'Hợp đồng thử việc', 'Hợp đồng 1 năm', 'Hợp đồng vô thời hạn'
    SignDate DATE NOT NULL,                        -- Ngày ký
    StartDate DATE NOT NULL,                       -- Ngày bắt đầu hiệu lực
    EndDate DATE NULL,                             -- Ngày hết hạn (NULL nếu vô thời hạn)
    AgreedSalary DECIMAL(18,2) NOT NULL,           -- Lương thỏa thuận ghi trên hợp đồng
    Status NVARCHAR(50) DEFAULT N'Hiệu lực',       -- 'Hiệu lực', 'Sắp hết hạn', 'Hết hiệu lực'
    ContractFileUrl NVARCHAR(500) NULL,            -- Đường dẫn tệp PDF scan hợp đồng
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Contract_Employee FOREIGN KEY (EmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- 2.6. Bảng Tiếp nhận nhân sự mới (Onboarding Checklist)
CREATE TABLE tblOnboarding (
    OnboardingId INT IDENTITY(1,1) PRIMARY KEY,
    OnboardingCode VARCHAR(20) NOT NULL UNIQUE,    -- 'ONB01'
    EmployeeId INT NULL,
    CandidateName NVARCHAR(100) NOT NULL,
    PositionName NVARCHAR(100) NOT NULL,
    DepartmentId INT NOT NULL,
    StartDate DATE NOT NULL,
    MentorEmployeeId INT NULL,                     -- Người hướng dẫn (Mentor)
    AccountCreated BIT DEFAULT 0,                  -- Bước 1: Tạo tài khoản HRM
    ContractSigned BIT DEFAULT 0,                  -- Bước 2: Ký hợp đồng lao động
    AssetAssigned BIT DEFAULT 0,                   -- Bước 3: Cấp phát thiết bị
    FaceEnrolled BIT DEFAULT 0,                    -- Bước 4: Chụp khuôn mặt Face ID OpenCV
    Status NVARCHAR(50) DEFAULT N'Đang tiếp nhận', -- 'Đang tiếp nhận', 'Đã hoàn tất'
    CONSTRAINT FK_Onboarding_Department FOREIGN KEY (DepartmentId) REFERENCES tblDepartment(DepartmentId),
    CONSTRAINT FK_Onboarding_Mentor FOREIGN KEY (MentorEmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- =========================================================================================
-- PHẦN 3: CA LÀM VIỆC, NHẬN DIỆN OPENCV & CHẤM CÔNG (ATTENDANCE & OPENCV)
-- =========================================================================================

-- 3.1. Bảng Ca làm việc & Lịch trực (Shift)
CREATE TABLE tblShift (
    ShiftId INT IDENTITY(1,1) PRIMARY KEY,
    ShiftCode VARCHAR(20) NOT NULL UNIQUE,         -- 'SH01', 'SH02', 'SH03'
    ShiftName NVARCHAR(100) NOT NULL,              -- 'Ca Hành Chính', 'Ca Đêm', 'Part-time'
    StartTime TIME(0) NOT NULL,                    -- 08:00:00
    EndTime TIME(0) NOT NULL,                      -- 17:30:00
    BreakStartTime TIME(0) NULL,                   -- 12:00:00
    BreakEndTime TIME(0) NULL,                     -- 13:30:00
    ShiftType NVARCHAR(50) DEFAULT N'Toàn thời gian',
    IsActive BIT DEFAULT 1
);
GO

-- 3.2. Bảng Dữ liệu vector khuôn mặt OpenCV (Face Data)
CREATE TABLE tblFaceData (
    FaceId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL UNIQUE,                -- 1 nhân viên lưu 1 bộ vector đại diện
    FaceVector512D NVARCHAR(MAX) NOT NULL,         -- Mảng vector embedding 512 chiều trích xuất từ OpenCV
    FrontSnapshotUrl NVARCHAR(500) NULL,           -- Ảnh chụp trực diện
    LeftSnapshotUrl NVARCHAR(500) NULL,            -- Ảnh góc nghiêng trái 20 độ
    RightSnapshotUrl NVARCHAR(500) NULL,           -- Ảnh góc nghiêng phải 20 độ
    ConfidenceScore DECIMAL(5,2) DEFAULT 98.50,    -- Độ tin cậy lúc huấn luyện vector (%)
    IsActive BIT DEFAULT 1,
    RegisteredAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_FaceData_Employee FOREIGN KEY (EmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- 3.3. Bảng Dữ liệu chấm công hàng ngày (Attendance)
CREATE TABLE tblAttendance (
    AttendanceId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL,
    AttendanceDate DATE NOT NULL,                  -- Ngày chấm công (VD: 2026-04-25)
    ShiftId INT NOT NULL,                          -- Ca làm việc áp dụng
    TimeIn TIME(0) NULL,                           -- Giờ vào thực tế (từ Camera OpenCV hoặc thủ công)
    TimeOut TIME(0) NULL,                          -- Giờ ra thực tế
    AttendanceCode VARCHAR(10) NOT NULL DEFAULT 'X', -- 'X' (Đủ công), 'N' (Nửa công), 'CT' (Công tác), 'P' (Phép), 'L' (Lễ), 'KP' (Không lương)
    WorkCredit DECIMAL(3,2) DEFAULT 1.00,          -- Công hưởng (1.0, 0.5, 0.0)
    OvertimeHours DECIMAL(4,2) DEFAULT 0.00,       -- Giờ tăng ca phát sinh
    LateMinutes INT DEFAULT 0,                     -- Số phút đi muộn
    EarlyMinutes INT DEFAULT 0,                    -- Số phút về sớm
    CheckinMethod NVARCHAR(50) DEFAULT N'OpenCV Kiosk', -- 'OpenCV Kiosk', 'Webcam cá nhân', 'Thủ công HR'
    DeviceName NVARCHAR(100) NULL,                 -- 'Camera Cổng Chính (Cam 01)'
    SnapshotUrl NVARCHAR(500) NULL,                -- Ảnh chụp lúc nhận diện thành công
    Note NVARCHAR(255) NULL,
    CONSTRAINT UQ_Employee_Date UNIQUE (EmployeeId, AttendanceDate),
    CONSTRAINT FK_Attendance_Employee FOREIGN KEY (EmployeeId) REFERENCES tblEmployee(EmployeeId),
    CONSTRAINT FK_Attendance_Shift FOREIGN KEY (ShiftId) REFERENCES tblShift(ShiftId)
);
GO

-- 3.4. Bảng Giải trình chấm công / Bổ sung công quên (Attendance Explanation)
CREATE TABLE tblAttendanceExplanation (
    ExplanationId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL,
    AttendanceDate DATE NOT NULL,
    ExplanationType NVARCHAR(100) NOT NULL,        -- 'Quên chấm công vào', 'Đi muộn do việc công', 'Bổ sung giờ OT'
    RequestedTime TIME(0) NOT NULL,
    Reason NVARCHAR(500) NOT NULL,
    ApproverEmployeeId INT NULL,                   -- Manager phụ trách duyệt
    Status NVARCHAR(50) DEFAULT N'PENDING',        -- 'PENDING', 'APPROVED', 'REJECTED'
    ResponseNote NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AttendanceExplanation_Employee FOREIGN KEY (EmployeeId) REFERENCES tblEmployee(EmployeeId),
    CONSTRAINT FK_AttendanceExplanation_Approver FOREIGN KEY (ApproverEmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- =========================================================================================
-- PHẦN 4: ĐƠN NGHỈ PHÉP & ĐĂNG KÝ TĂNG CA (LEAVE & OVERTIME WORKFLOW)
-- =========================================================================================

-- 4.1. Bảng Danh mục loại nghỉ phép (Leave Type)
CREATE TABLE tblLeaveType (
    LeaveTypeId INT IDENTITY(1,1) PRIMARY KEY,
    TypeCode VARCHAR(20) NOT NULL UNIQUE,          -- 'ANNUAL', 'SICK', 'MATERNITY', 'UNPAID'
    TypeName NVARCHAR(100) NOT NULL,               -- 'Nghỉ phép năm', 'Nghỉ ốm đau', 'Nghỉ không lương'
    IsPaid BIT DEFAULT 1                           -- Có hưởng lương hay không
);
GO

-- 4.2. Bảng Đơn xin nghỉ phép (Leave Request)
CREATE TABLE tblLeaveRequest (
    LeaveRequestId INT IDENTITY(1,1) PRIMARY KEY,
    RequestCode VARCHAR(20) NOT NULL UNIQUE,       -- 'LP001'
    EmployeeId INT NOT NULL,
    LeaveTypeId INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    TotalDays DECIMAL(4,1) NOT NULL,               -- Số ngày nghỉ (1.0, 0.5, 2.5...)
    Reason NVARCHAR(500) NOT NULL,
    HandoverToEmployeeId INT NULL,                 -- Người nhận bàn giao công việc
    ApproverEmployeeId INT NULL,                   -- Trưởng bộ phận duyệt
    Status NVARCHAR(50) DEFAULT N'PENDING',        -- 'PENDING', 'APPROVED', 'REJECTED'
    ManagerComment NVARCHAR(255) NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_LeaveRequest_Employee FOREIGN KEY (EmployeeId) REFERENCES tblEmployee(EmployeeId),
    CONSTRAINT FK_LeaveRequest_Type FOREIGN KEY (LeaveTypeId) REFERENCES tblLeaveType(LeaveTypeId),
    CONSTRAINT FK_LeaveRequest_Approver FOREIGN KEY (ApproverEmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- 4.3. Bảng Đăng ký làm thêm giờ (Overtime Request)
CREATE TABLE tblOvertimeRequest (
    OvertimeRequestId INT IDENTITY(1,1) PRIMARY KEY,
    RequestCode VARCHAR(20) NOT NULL UNIQUE,       -- 'OT001'
    EmployeeId INT NOT NULL,
    OvertimeDate DATE NOT NULL,
    StartTime TIME(0) NOT NULL,
    EndTime TIME(0) NOT NULL,
    TotalHours DECIMAL(4,2) NOT NULL,              -- Số giờ OT (2.0, 3.5...)
    OvertimeRateType NVARCHAR(50) DEFAULT N'Ngày thường (150%)', -- 'Ngày thường (150%)', 'Cuối tuần (200%)', 'Ngày lễ (300%)'
    Reason NVARCHAR(500) NOT NULL,
    ApproverEmployeeId INT NULL,                   -- Manager phụ trách duyệt
    Status NVARCHAR(50) DEFAULT N'PENDING',        -- 'PENDING', 'APPROVED', 'REJECTED'
    ManagerComment NVARCHAR(255) NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_OvertimeRequest_Employee FOREIGN KEY (EmployeeId) REFERENCES tblEmployee(EmployeeId),
    CONSTRAINT FK_OvertimeRequest_Approver FOREIGN KEY (ApproverEmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- =========================================================================================
-- PHẦN 5: TUYỂN DỤNG & ỨNG VIÊN (RECRUITMENT & KANBAN)
-- =========================================================================================

-- 5.1. Bảng Vị trí tuyển dụng đang mở (Recruitment Job)
CREATE TABLE tblRecruitmentJob (
    JobId INT IDENTITY(1,1) PRIMARY KEY,
    JobTitle NVARCHAR(150) NOT NULL,               -- 'Senior Backend Developer', 'Frontend React Developer'
    DepartmentId INT NOT NULL,
    TargetQuantity INT NOT NULL DEFAULT 1,         -- Chỉ tiêu tuyển dụng
    SalaryRange NVARCHAR(100) NULL,                -- '25 - 35 Triệu VNĐ'
    Deadline DATE NOT NULL,                        -- Hạn nộp hồ sơ
    JobDescription NVARCHAR(MAX) NULL,             -- Bản mô tả công việc (JD)
    Status NVARCHAR(50) DEFAULT N'Đang tuyển',     -- 'Đang tuyển', 'Tạm dừng', 'Đã đóng'
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_RecruitmentJob_Department FOREIGN KEY (DepartmentId) REFERENCES tblDepartment(DepartmentId)
);
GO

-- 5.2. Bảng Hồ sơ ứng viên (Candidate Pipeline - Kanban)
CREATE TABLE tblCandidate (
    CandidateId INT IDENTITY(1,1) PRIMARY KEY,
    CandidateCode VARCHAR(20) NOT NULL UNIQUE,     -- 'CAN01'
    JobId INT NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    CvUrl NVARCHAR(500) NULL,                      -- Đường dẫn lưu CV PDF
    Stage NVARCHAR(50) DEFAULT N'Applied',         -- 'Applied', 'Screening', 'Interview', 'Offer', 'Hired'
    AppliedDate DATE DEFAULT CAST(GETDATE() AS DATE),
    InterviewerEmployeeId INT NULL,                -- Người phỏng vấn chính
    RatingScore INT DEFAULT 0,                     -- Điểm đánh giá (1 - 5 sao)
    Note NVARCHAR(500) NULL,
    CONSTRAINT FK_Candidate_Job FOREIGN KEY (JobId) REFERENCES tblRecruitmentJob(JobId),
    CONSTRAINT FK_Candidate_Interviewer FOREIGN KEY (InterviewerEmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- =========================================================================================
-- PHẦN 6: TÀI SẢN & THIẾT BỊ DOANH NGHIỆP (ASSETS)
-- =========================================================================================

-- 6.1. Bảng Danh mục thiết bị tài sản (Asset)
CREATE TABLE tblAsset (
    AssetId INT IDENTITY(1,1) PRIMARY KEY,
    AssetCode VARCHAR(50) NOT NULL UNIQUE,         -- 'AST-NB-001'
    AssetName NVARCHAR(150) NOT NULL,              -- 'Laptop Dell XPS 15 9520'
    Category NVARCHAR(100) NOT NULL,               -- 'Thiết bị CNTT', 'Văn phòng phẩm'
    ConditionStatus NVARCHAR(100) DEFAULT N'Mới trong kho', -- 'Mới trong kho', 'Đang sử dụng tốt', 'Cần bảo trì'
    IsAvailable BIT DEFAULT 1                      -- 1: Sẵn sàng cấp phát, 0: Đã cấp phát
);
GO

-- 6.2. Bảng Cấp phát & thu hồi tài sản nhân viên (Asset Assignment)
CREATE TABLE tblAssetAssignment (
    AssignmentId INT IDENTITY(1,1) PRIMARY KEY,
    AssetId INT NOT NULL,
    EmployeeId INT NOT NULL,
    AssignDate DATE NOT NULL,                      -- Ngày bàn giao
    ReturnDate DATE NULL,                          -- Ngày thu hồi (khi thôi việc)
    Status NVARCHAR(50) DEFAULT N'Đang sử dụng',   -- 'Đang sử dụng', 'Đã thu hồi'
    Note NVARCHAR(255) NULL,
    CONSTRAINT FK_AssetAssignment_Asset FOREIGN KEY (AssetId) REFERENCES tblAsset(AssetId),
    CONSTRAINT FK_AssetAssignment_Employee FOREIGN KEY (EmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- =========================================================================================
-- PHẦN 7: QUẢN TRỊ QUỸ LƯƠNG, PHỤ CẤP & TÍNH LƯƠNG (PAYROLL & COMPENSATION)
-- =========================================================================================

-- 7.1. Bảng Cấu hình các thành phần lương (Salary Component)
CREATE TABLE tblSalaryComponent (
    ComponentId INT IDENTITY(1,1) PRIMARY KEY,
    ComponentCode VARCHAR(50) NOT NULL UNIQUE,     -- 'BASE_SALARY', 'LUNCH_ALLOWANCE', 'OT_RATE_NORMAL'
    ComponentName NVARCHAR(150) NOT NULL,
    ComponentType NVARCHAR(50) NOT NULL,           -- 'Thu nhập cố định', 'Phụ cấp cố định', 'Khấu trừ', 'Biến đổi'
    DefaultAmount DECIMAL(18,2) DEFAULT 0,         -- Số tiền mặc định (VD: Ăn trưa 730,000)
    PercentageRate DECIMAL(5,2) DEFAULT 0,         -- Tỷ lệ % (VD: BHXH 8%, BHYT 1.5%)
    IsTaxable BIT DEFAULT 1,                       -- Có chịu thuế TNCN hay không
    Description NVARCHAR(255) NULL
);
GO

-- 7.2. Bảng Kỳ tính lương hàng tháng (Payroll Period)
CREATE TABLE tblPayrollPeriod (
    PeriodId INT IDENTITY(1,1) PRIMARY KEY,
    PeriodCode VARCHAR(10) NOT NULL UNIQUE,        -- '2026-04'
    PeriodName NVARCHAR(100) NOT NULL,             -- 'Kỳ lương tháng 04/2026'
    StandardWorkDays INT DEFAULT 22,               -- Số ngày công chuẩn trong tháng
    TotalGrossPay DECIMAL(18,2) DEFAULT 0,         -- Tổng quỹ lương Gross
    TotalNetPay DECIMAL(18,2) DEFAULT 0,           -- Tổng số tiền thực chi trả (Net)
    IsLocked BIT DEFAULT 0,                        -- 0: Đang tính toán, 1: Đã chốt sổ lương
    LockedByUserId INT NULL,                       -- Người kế toán bấm chốt sổ
    LockedAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PayrollPeriod_User FOREIGN KEY (LockedByUserId) REFERENCES tblUser(UserId)
);
GO

-- 7.3. Bảng Chi tiết bảng lương nhân viên (Payroll Detail)
CREATE TABLE tblPayrollDetail (
    DetailId INT IDENTITY(1,1) PRIMARY KEY,
    PeriodId INT NOT NULL,
    EmployeeId INT NOT NULL,
    ActualWorkDays DECIMAL(4,2) NOT NULL,          -- Số ngày công đi làm thực tế
    PaidLeaveDays DECIMAL(4,2) DEFAULT 0,          -- Số ngày nghỉ hưởng nguyên lương (Lễ, Phép)
    UnpaidLeaveDays DECIMAL(4,2) DEFAULT 0,        -- Số ngày nghỉ không lương
    OvertimeHours DECIMAL(5,2) DEFAULT 0,          -- Tổng số giờ tăng ca trong tháng
    BaseSalary DECIMAL(18,2) NOT NULL,             -- Lương cơ bản theo hợp đồng
    ActualBaseSalary DECIMAL(18,2) NOT NULL,       -- Lương cơ bản tính theo công thực tế
    TotalAllowance DECIMAL(18,2) DEFAULT 0,        -- Tổng phụ cấp (Ăn trưa, Xăng xe, Điện thoại)
    OvertimePay DECIMAL(18,2) DEFAULT 0,           -- Tiền làm thêm giờ (OT)
    TotalGrossSalary DECIMAL(18,2) NOT NULL,       -- Tổng thu nhập Gross
    BhxhDeduction DECIMAL(18,2) DEFAULT 0,         -- Trừ BHXH (8%)
    BhytDeduction DECIMAL(18,2) DEFAULT 0,         -- Trừ BHYT (1.5%)
    BhtnDeduction DECIMAL(18,2) DEFAULT 0,         -- Trừ BHTN (1%)
    PersonalTaxDeduction DECIMAL(18,2) DEFAULT 11000000, -- Giảm trừ gia cảnh bản thân (11 triệu)
    DependentTaxDeduction DECIMAL(18,2) DEFAULT 0, -- Giảm trừ người phụ thuộc (4.4 triệu/người)
    TaxableIncome DECIMAL(18,2) DEFAULT 0,         -- Thu nhập tính thuế TNCN
    PersonalIncomeTax DECIMAL(18,2) DEFAULT 0,     -- Thuế TNCN phải nộp
    NetSalary DECIMAL(18,2) NOT NULL,              -- LƯƠNG THỰC LĨNH (NET)
    PaymentStatus NVARCHAR(50) DEFAULT N'Chưa thanh toán', -- 'Chưa thanh toán', 'Đã chuyển khoản'
    CONSTRAINT UQ_Period_Employee UNIQUE (PeriodId, EmployeeId),
    CONSTRAINT FK_PayrollDetail_Period FOREIGN KEY (PeriodId) REFERENCES tblPayrollPeriod(PeriodId),
    CONSTRAINT FK_PayrollDetail_Employee FOREIGN KEY (EmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- =========================================================================================
-- PHẦN 8: ĐÀO TẠO & ĐÁNH GIÁ HIỆU SUẤT (TRAINING & KPI)
-- =========================================================================================

-- 8.1. Bảng Khóa đào tạo nội bộ (Training Course)
CREATE TABLE tblTrainingCourse (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseCode VARCHAR(20) NOT NULL UNIQUE,        -- 'TR01'
    Title NVARCHAR(200) NOT NULL,                  -- 'Phát triển Web hiện đại với React 18'
    InstructorName NVARCHAR(100) NOT NULL,         -- Giảng viên / Chuyên gia đào tạo
    DurationHours INT DEFAULT 16,                  -- Số giờ đào tạo
    ScheduleDescription NVARCHAR(255) NULL,        -- 'Thứ 4 hàng tuần, 18:00 - 20:00'
    MaxStudents INT DEFAULT 20,
    Status NVARCHAR(50) DEFAULT N'Đang tuyển sinh' -- 'Đang tuyển sinh', 'Đang diễn ra', 'Đã hoàn thành'
);
GO

-- 8.2. Bảng Nhân viên đăng ký khóa đào tạo (Training Enrollment)
CREATE TABLE tblTrainingEnrollment (
    EnrollmentId INT IDENTITY(1,1) PRIMARY KEY,
    CourseId INT NOT NULL,
    EmployeeId INT NOT NULL,
    EnrolledDate DATE DEFAULT CAST(GETDATE() AS DATE),
    CompletionStatus NVARCHAR(50) DEFAULT N'Đang học', -- 'Đang học', 'Hoàn thành xuất sắc', 'Chưa đạt'
    CertificateIssued BIT DEFAULT 0,
    CONSTRAINT UQ_Course_Employee UNIQUE (CourseId, EmployeeId),
    CONSTRAINT FK_TrainingEnrollment_Course FOREIGN KEY (CourseId) REFERENCES tblTrainingCourse(CourseId),
    CONSTRAINT FK_TrainingEnrollment_Employee FOREIGN KEY (EmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- 8.3. Bảng Đánh giá hiệu suất nhân viên định kỳ (KPI Evaluation)
CREATE TABLE tblKpiEvaluation (
    KpiId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL,
    PeriodCode VARCHAR(10) NOT NULL,               -- '2026-Q1'
    EvaluatorEmployeeId INT NOT NULL,              -- Manager phụ trách đánh giá
    ScoreTotal DECIMAL(5,2) NOT NULL,              -- Điểm tổng (0 - 100)
    GradeRank VARCHAR(5) NOT NULL,                 -- 'A+', 'A', 'B', 'C'
    AchievementNote NVARCHAR(MAX) NULL,            -- Kết quả công việc nổi bật
    ImprovementNote NVARCHAR(MAX) NULL,            -- Điểm cần khắc phục
    EvaluatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_KpiEvaluation_Employee FOREIGN KEY (EmployeeId) REFERENCES tblEmployee(EmployeeId),
    CONSTRAINT FK_KpiEvaluation_Evaluator FOREIGN KEY (EvaluatorEmployeeId) REFERENCES tblEmployee(EmployeeId)
);
GO

-- =========================================================================================
-- PHẦN 9: NẠP DỮ LIỆU MẪU CƠ BẢN (SEED DATA)
-- Khớp 100% với tài khoản và nhân sự đang hiển thị trên giao diện
-- =========================================================================================

-- 1. Nạp Vai trò (Role)
INSERT INTO tblRole (RoleCode, RoleName, Description) VALUES
('Admin', N'Quản trị viên Hệ thống', N'Toàn quyền quản lý tài khoản, logs và cấu hình hệ thống'),
('HR', N'Quản trị Nhân sự', N'Quản lý hồ sơ nhân viên, hợp đồng, chấm công, tuyển dụng'),
('Manager', N'Trưởng bộ phận', N'Quản lý nhân viên nhóm, duyệt đơn nghỉ phép, duyệt tăng ca, đánh giá KPI'),
('Employee', N'Nhân viên', N'Chấm công khuôn mặt, xem công, xin nghỉ phép, xem phiếu lương'),
('Finance', N'Kế toán tiền lương', N'Cấu hình chính sách lương, tính lương tháng và xuất báo cáo');
GO

-- 2. Nạp Tài khoản (User) - Mật khẩu mặc định là: 123456
INSERT INTO tblUser (Username, PasswordHash, Email, FullName, RoleId, IsLocked, TwoFactorEnabled) VALUES
('admin.hieu', '$2a$10$wT0o3qA2V9B3Lh5M7ZJc4uN1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y', 'admin@company.com', N'Phan Ngọc Hiếu', 1, 0, 1),
('hr.vana', '$2a$10$wT0o3qA2V9B3Lh5M7ZJc4uN1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y', 'nguyenvana@company.com', N'Nguyễn Văn A', 2, 0, 1),
('lead.bich', '$2a$10$wT0o3qA2V9B3Lh5M7ZJc4uN1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y', 'tranbich@company.com', N'Trần Thị Bích', 3, 0, 0),
('dev.long', '$2a$10$wT0o3qA2V9B3Lh5M7ZJc4uN1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y', 'longlh@company.com', N'Lê Hoàng Long', 4, 0, 0),
('finance.my', '$2a$10$wT0o3qA2V9B3Lh5M7ZJc4uN1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y', 'myht@company.com', N'Hoàng Thảo My', 5, 0, 1);
GO

-- 3. Nạp Cơ cấu tổ chức (Department)
INSERT INTO tblDepartment (DepartmentCode, DepartmentName, ParentDepartmentId, HeadCount, Description) VALUES
('BOD', N'Ban Giám Đốc (BOD)', NULL, 128, N'Cấp lãnh đạo cao nhất doanh nghiệp'),
('HR', N'Phòng Nhân Sự (HR)', 1, 14, N'Quản lý nhân sự, đào tạo và chấm công'),
('IT', N'Khối Kỹ Thuật (IT)', 1, 68, N'Phát triển phần mềm và công nghệ OpenCV'),
('FIN', N'Phòng Tài Chính - Kế Toán', 1, 16, N'Quản lý tài chính, quỹ lương và thuế'),
('MKT', N'Khối Marketing & Truyền Thông', 1, 30, N'Tiếp thị, xây dựng thương hiệu');
GO

-- 4. Nạp Chức danh (Position)
INSERT INTO tblPosition (PositionCode, PositionName, BaseSalaryMin, BaseSalaryMax) VALUES
('CEO', N'Tổng Giám Đốc Điều Hành (CEO)', 50000000, 100000000),
('HR_MGR', N'HR Manager & Trưởng phòng Nhân sự', 25000000, 40000000),
('DEV_LEAD', N'Trưởng nhóm Kỹ thuật (Technical Lead)', 30000000, 50000000),
('DEV_SR', N'Senior Backend Developer', 20000000, 35000000),
('PAYROLL_SPE', N'Chuyên viên Kế toán tiền lương', 15000000, 25000000),
('DEV_FE', N'Frontend React Developer', 12000000, 25000000);
GO

-- 5. Nạp Hồ sơ nhân viên (Employee)
INSERT INTO tblEmployee (EmployeeCode, FullName, Gender, BirthDate, Phone, Email, Address, IdCardNumber, TaxCode, BankName, BankAccountNumber, DependentsCount, DepartmentId, PositionId, UserId, JoinDate, WorkStatus, BaseSalary, InsuranceSalary, FaceRegistered, AvatarUrl) VALUES
('EMP001', N'Nguyễn Văn A', N'Nam', '1992-04-15', '0901234567', 'nguyenvana@company.com', N'Cầu Giấy, Hà Nội', '001092003841', '8029381729', N'Techcombank', '19036789123456', 1, 2, 2, 2, '2021-01-02', N'Đang làm việc', 28000000, 28000000, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
('EMP002', N'Trần Thị Bích', N'Nữ', '1995-08-20', '0912345678', 'tranbich@company.com', N'Thanh Xuân, Hà Nội', '001195004928', '8492019284', N'Vietcombank', '101928374652', 0, 3, 3, 3, '2022-03-15', N'Đang làm việc', 32000000, 32000000, 1, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
('EMP003', N'Lê Hoàng Long', N'Nam', '1998-11-10', '0987654321', 'longlh@company.com', N'Đống Đa, Hà Nội', '001098005829', '8592019285', N'MB Bank', '098712345678', 0, 3, 4, 4, '2023-06-01', N'Đang làm việc', 22000000, 22000000, 1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
('EMP005', N'Hoàng Thảo My', N'Nữ', '1996-03-25', '0933221100', 'myht@company.com', N'Ba Đình, Hà Nội', '001196007482', '8692019286', N'Vietinbank', '711A12345678', 1, 4, 5, 5, '2022-08-01', N'Đang làm việc', 20000000, 20000000, 1, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80');
GO

-- Cập nhật Trưởng phòng cho tblDepartment
UPDATE tblDepartment SET ManagerEmployeeId = 1 WHERE DepartmentCode = 'HR';
UPDATE tblDepartment SET ManagerEmployeeId = 2 WHERE DepartmentCode = 'IT';
UPDATE tblDepartment SET ManagerEmployeeId = 4 WHERE DepartmentCode = 'FIN';
GO

-- 6. Nạp Hợp đồng lao động (Contract)
INSERT INTO tblContract (ContractNumber, EmployeeId, ContractType, SignDate, StartDate, EndDate, AgreedSalary, Status) VALUES
('HD001', 1, N'Hợp đồng vô thời hạn', '2021-01-02', '2021-01-02', NULL, 28000000, N'Hiệu lực'),
('HD002', 2, N'Hợp đồng 3 năm', '2022-03-15', '2022-03-15', '2025-03-15', 32000000, N'Sắp hết hạn'),
('HD003', 3, N'Hợp đồng 1 năm', '2024-06-01', '2024-06-01', '2025-06-01', 22000000, N'Hiệu lực');
GO

-- 7. Nạp Ca làm việc chuẩn (Shift)
INSERT INTO tblShift (ShiftCode, ShiftName, StartTime, EndTime, BreakStartTime, BreakEndTime, ShiftType) VALUES
('SH01', N'Ca Hành Chính Chuẩn', '08:00:00', '17:30:00', '12:00:00', '13:30:00', N'Toàn thời gian'),
('SH02', N'Ca Kỹ Thuật Trực Đêm', '22:00:00', '06:00:00', '02:00:00', '03:00:00', N'Xoay ca'),
('SH03', N'Ca Sáng Bán Thời Gian', '08:00:00', '12:00:00', NULL, NULL, N'Part-time');
GO

-- 8. Nạp Loại nghỉ phép (Leave Type)
INSERT INTO tblLeaveType (TypeCode, TypeName, IsPaid) VALUES
('ANNUAL', N'Nghỉ phép năm', 1),
('SICK', N'Nghỉ ốm đau (Hưởng BHXH)', 0),
('MATERNITY', N'Nghỉ chế độ thai sản', 0),
('UNPAID', N'Nghỉ việc riêng không hưởng lương', 0);
GO

-- 9. Nạp Thành phần lương chuẩn (Salary Component)
INSERT INTO tblSalaryComponent (ComponentCode, ComponentName, ComponentType, DefaultAmount, PercentageRate, IsTaxable, Description) VALUES
('BASE_SALARY', N'Lương căn bản theo hợp đồng', N'Thu nhập cố định', 0, 0, 1, N'Mức lương ghi trên HĐLĐ'),
('LUNCH_ALLOWANCE', N'Phụ cấp ăn trưa', N'Phụ cấp cố định', 730000, 0, 0, N'Không chịu thuế TNCN theo quy định'),
('FUEL_ALLOWANCE', N'Phụ cấp xăng xe & điện thoại', N'Phụ cấp cố định', 500000, 0, 0, N'Hỗ trợ di chuyển làm việc'),
('BHXH_DEDUCTION', N'BHXH người lao động trích nộp', N'Khấu trừ', 0, 8.00, 0, N'8% lương đóng bảo hiểm'),
('BHYT_DEDUCTION', N'BHYT người lao động trích nộp', N'Khấu trừ', 0, 1.50, 0, N'1.5% lương đóng bảo hiểm'),
('BHTN_DEDUCTION', N'BHTN người lao động trích nộp', N'Khấu trừ', 0, 1.00, 0, N'1% lương đóng bảo hiểm');
GO

PRINT N'=== TẠO CƠ SỞ DỮ LIỆU HRM_Enterprise_DB VÀ SEED DỮ LIỆU THÀNH CÔNG! ===';
GO
