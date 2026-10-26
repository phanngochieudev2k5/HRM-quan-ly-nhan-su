# TÀI LIỆU PHÂN TÍCH PRODUCT BACKLOG & KIẾN TRÚC PHÂN QUYỀN HỆ THỐNG HRM

> **Dự án:** Hệ thống Quản trị Nhân sự Doanh nghiệp (HRM Enterprise & OpenCV Face Attendance)  
> **Nguồn phân tích:** File `Nhóm 2 product backlog.docx` (Reactjs, Nodejs, Opencv)  
> **Nhóm thực hiện:** Phan Ngọc Hiếu, Nguyễn Trọng Hoàng, Phạm Huy Hoàng  
> **Phiên bản:** 2.1 (Tối ưu hóa tầm nhìn nhân sự, Vòng đời 360°, Sơ đồ cây tổ chức & Chấm công OpenCV toàn diện)

---

## I. TỔNG QUAN HỆ THỐNG & ĐẶC TẢ SẢN PHẨM

Hệ thống HRM Enterprise là giải pháp chuyển đổi số toàn diện công tác nhân sự, tích hợp công nghệ thị giác máy tính OpenCV để nhận diện khuôn mặt chấm công thời gian thực.

### 1. 5 Tác nhân chính (Actors) trong hệ thống
1. **Admin (Quản trị viên hệ thống):** Quản lý tài khoản, gán vai trò, khóa/mở khóa tài khoản, phân quyền bảo mật và giám sát audit log hệ thống.
2. **HR (Quản lý nhân sự):** Tầm nhìn tổng quan chiến lược nhân sự, quản lý toàn bộ vòng đời nhân viên (Onboarding -> Quá trình công tác -> Offboarding), sơ đồ cây cơ cấu tổ chức phân cấp, Kiosk chấm công camera OpenCV, đăng ký Face ID 3 góc độ, quản lý ca làm & bảng tổng hợp công tháng, hợp đồng lao động, tài sản và báo cáo nhân sự.
3. **Manager (Trưởng bộ phận / Quản lý trực tiếp):** Quản lý danh sách nhân viên trong phòng ban/nhóm phụ trách, phê duyệt đơn nghỉ phép, phê duyệt đăng ký tăng ca (OT) và thực hiện đánh giá hiệu suất (KPI) định kỳ.
4. **Nhân sự / Nhân viên (Employee - Portal Cá nhân):** Xem hồ sơ cá nhân, thực hiện chấm công nhận diện khuôn mặt qua Camera/OpenCV, xem lịch sử công, gửi đơn xin nghỉ phép, đăng ký tăng ca, xem phiếu lương cá nhân và đăng ký khóa đào tạo nội bộ.
5. **Finance (Kế toán tiền lương & Tài chính):** Cấu hình các thành phần lương (lương cơ bản, phụ cấp, khấu trừ, thuế, bảo hiểm), thực hiện tính lương và chốt bảng lương hàng tháng từ dữ liệu chấm công và tăng ca đã duyệt, xuất báo cáo chi phí lương và phiếu lương.

---

## II. MA TRẬN PHÂN QUYỀN CHI TIẾT (ROLE-BASED ACCESS CONTROL)

| STT | Mã US | Module chức năng | Admin | HR | Manager | Nhân sự (Employee) | Finance |
|:---:|:---:|---|:---:|:---:|:---:|:---:|:---:|
| 1 | US-01 | Quản lý tài khoản, đăng nhập & phân quyền | **Toàn quyền** | Chỉ xem | Không | Không | Không |
| 2 | US-02 | Quản lý hồ sơ nhân viên (CRUD, phòng ban, CV, lịch sử) | Không | **Toàn quyền** | Chỉ xem nhóm | Xem hồ sơ mình | Xem để làm lương |
| 3 | US-03 | Quản lý cơ cấu tổ chức (Sơ đồ cây phân cấp) | Xem | **Toàn quyền** | Xem cây nhóm | Xem sơ đồ cty | Xem |
| 4 | US-04 | Quản lý nhu cầu tuyển dụng (JD, chỉ tiêu) | Không | **Toàn quyền** | Đề xuất | Không | Xem dự toán |
| 5 | US-05 | Tuyển dụng & Pipeline ứng viên (Kanban) | Không | **Toàn quyền** | Phỏng vấn | Không | Không |
| 6 | US-06 | Tiếp nhận nhân viên mới (Onboarding checklist) | Không | **Toàn quyền** | Hỗ trợ nhận NV | Không | Tạo hồ sơ lương |
| 7 | US-07 | Quản lý hợp đồng lao động & cảnh báo hết hạn | Không | **Toàn quyền** | Không | Xem HĐ của mình | Xem mức lương HĐ |
| 8 | US-08 | Quản lý ca làm việc & phân ca tuần | Không | **Toàn quyền** | Xem ca nhóm | Xem ca của mình | Xem tính công |
| 9 | US-09 | Đăng ký & trích xuất vector khuôn mặt OpenCV | Không | **Toàn quyền** | Không | Tự cập nhật ảnh | Không |
| 10 | US-10/21/30 | Chấm công khuôn mặt OpenCV & Live Event Stream | Giám sát | Quản trị log | Giám sát nhóm | **Chấm công live** | Lấy dữ liệu công |
| 11 | US-11 | Tổng hợp công, đối soát muộn/về sớm, sửa công | Không | **Toàn quyền** | Xem công nhóm | Xem công mình | Tổng hợp làm lương |
| 12 | US-12/17/23 | Quản lý & duyệt đơn nghỉ phép | Không | Quản lý chung | **Duyệt đơn nhóm** | **Gửi đơn nghỉ** | Khấu trừ nghỉ ko lương |
| 13 | US-13/18/24 | Quản lý & duyệt yêu cầu tăng ca (OT) | Không | Quản lý chung | **Duyệt OT nhóm** | **Đăng ký OT** | Tính tiền OT |
| 14 | US-16/20 | Xem danh sách nhân viên cấp dưới / cá nhân | Không | Xem tất cả | **Xem nhóm** | **Chỉ xem mình** | Xem toàn cty |
| 15 | US-19 | Đánh giá hiệu suất nhân viên (KPI) | Không | Cấu hình kỳ | **Chấm điểm nhóm** | Tự đánh giá | Không |
| 16 | US-25/27/28/29 | Quản lý thành phần lương, tính lương & chốt lương | Không | Phối hợp | Không | **Xem phiếu lương mình** | **Toàn quyền** |
| 17 | US-31 | Quản lý cấp phát & thu hồi tài sản | Không | **Toàn quyền** | Xác nhận nhóm | Xem tài sản nhận | Hạch toán tài sản |
| 18 | US-32 | Quản lý quy trình thôi việc (Offboarding Hub) | Khóa TK | **Toàn quyền** | Bàn giao việc | Gửi đơn thôi việc | Thanh toán lần cuối |
| 19 | US-33/34 | Dashboard & Xuất báo cáo nhân sự tổng hợp | Xem log | **Toàn quyền** | Báo cáo nhóm | Không | Báo cáo chi phí |
| 20 | US-26 | Đào tạo & Khóa học nội bộ | Không | Quản lý khóa | Đề cử nhóm | **Đăng ký học** | Dự toán học phí |

---

## III. CHI TIẾT TỐI ƯU HÓA QUẢN TRỊ NHÂN SỰ (HR MODULE)

### 1. Tầm nhìn Tổng quan Nhân sự (HR Dashboard Executive Vision)
- **4 Chỉ số trọng yếu:** Tổng quân số (128 NV), Tỷ lệ chuyên cần hôm nay (104/112 có mặt ~ 92.8%), Hợp đồng cần gia hạn trong 30 ngày (8 HĐ), Ứng viên tiềm năng đang xét (12).
- **Vòng đời nhân sự Pipeline:** 1. Tuyển dụng (12) -> 2. Tiếp nhận/Onboarding (2) -> 3. Đang công tác (112) -> 4. Thôi việc/Offboarding (1).
- **Hành động khẩn cấp:** Hợp đồng sắp hết hạn (nút xem & gia hạn), nhân sự mới chưa nạp Face ID (nút nạp ngay), đơn phép & OT chờ duyệt.
- **Nhịp điểm danh OpenCV Realtime:** Biểu đồ tỷ lệ đúng giờ / muộn / vắng và liên kết mở nhanh Kiosk camera.

### 2. Quản lý Vòng đời Nhân viên Toàn diện (Employee Lifecycle)
- **Hồ sơ 360° Đầy đủ (Unified Employee Hub):**
  + Tab 1: Lý lịch cá nhân, thông tin liên hệ, phòng ban, chức vụ.
  + Tab 2: Quá trình công tác & Lịch sử bổ nhiệm (lưu vết thay đổi chức vụ, phòng ban, không ghi đè lịch sử cũ theo US-02).
  + Tab 3: Hợp đồng lao động & Lịch sử ký kết, lương thỏa thuận, hạn hợp đồng.
  + Tab 4: Dữ liệu Face ID OpenCV (Trạng thái vector 512-d, ảnh mẫu, độ tin cậy nhận diện).
  + Tab 5: Danh mục tài sản & Thiết bị công ty đang cấp phát (Laptop, màn hình, ghế...).
  + Tab 6: Lịch sử nghỉ phép & Chấm công tháng.
- **Quy trình tiếp nhận nhân viên mới (Onboarding Checklist):**
  + Checklist tương tác 4 bước: Tạo tài khoản & email -> Ký HĐLĐ thử việc -> Cấp phát Laptop/Thẻ -> Chụp ảnh nạp Face ID OpenCV.
- **Quy trình thôi việc (Offboarding Hub):**
  + 5 bước bàn giao: Phê duyệt đơn thôi việc -> Bàn giao công việc -> Thu hồi tài sản -> Thanh toán lương cuối -> Vô hiệu hóa tài khoản hệ thống.

### 3. Sơ đồ Cây Cơ cấu Tổ chức Trực quan (Interactive Org Chart)
- Thể hiện trực quan theo dạng sơ đồ cây phân cấp:
  + **Ban Giám Đốc (BOD - CEO)**
    ├── **Phòng Nhân Sự (HR Manager)**
    │   ├── Nhóm Tuyển dụng & Onboarding
    │   └── Nhóm C&B & Quản lý Ca công
    ├── **Khối Kỹ Thuật (IT - Tech Lead)**
    │   ├── Đội ngũ Backend & Cloud
    │   ├── Đội ngũ Frontend & Mobile
    │   └── Đội ngũ OpenCV & AI Vision
    ├── **Phòng Tài Chính - Kế Toán (Kế toán trưởng)**
    │   └── Tổ Kế toán tiền lương
    └── **Khối Marketing & Truyền Thông (Marketing Lead)**
        └── Nhóm Digital Marketing
- Từng node hiển thị trưởng bộ phận, avatar, quy mô quân số, nút mở rộng/thu gọn nhánh con.

### 4. Hệ thống Chấm công OpenCV Toàn diện (Face Attendance Suite)
- **Camera Kiosk OpenCV Live:**
  + Hỗ trợ chuyển đổi giữa chế độ Webcam thực tế của laptop và chế độ mô phỏng AI camera.
  + Khung xanh nhận diện AI bám theo khuôn mặt, đo độ tin cậy %, cảnh báo Anti-Spoofing chống giả mạo.
  + Luồng sự kiện điểm danh trực tiếp (Live Event Stream) ghi nhận tức thời kèm ảnh chụp snapshot.
- **Đăng ký Face ID OpenCV 3 góc độ:**
  + Chụp 3 góc: Trực diện, nghiêng trái 20°, nghiêng phải 20°.
  + Đo chất lượng ánh sáng, độ sắc nét, kiểm tra liveness và trích xuất vector 512-d embedding.
- **Bảng Tổng hợp Công Tháng (Monthly Timesheet):**
  + Lọc theo tháng và phòng ban.
  + Tự động đối soát từ log camera OpenCV; phát hiện đi muộn, về sớm, nghỉ phép.
  + Hỗ trợ nút "Bổ sung công thủ công" kèm lý do phục vụ các trường hợp ngoại lệ.
- **Cấu hình Ca & Bảng Phân ca Tuần:**
  + Cấu hình loại ca (Hành chính, Ca đêm, Bán thời gian).
  + Bảng ma trận phân ca Thứ 2 đến Chủ nhật cho toàn bộ nhân sự.

---

## IV. TIÊU CHUẨN TỐI ƯU GIAO DIỆN MÀN HÌNH 13 INCH

1. **Sidebar thu gọn linh hoạt:**
   - Chiều rộng khi mở: 230px, khi thu gọn: 64px.
2. **Padding không gian nội dung:**
   - Đặt ở mức `16px 20px` tối ưu không gian hiển thị cho màn hình 1366x768 / 1440x900.
3. **Bảng và Sơ đồ chống tràn ngang:**
   - Mọi bảng biểu và sơ đồ cây đều có `overflow-x: auto`.

---

## V. CẤU TRÚC THƯ MỤC CHUẨN HÓA

```
src/
├── components/
│   ├── common/                  # Component tái sử dụng dùng chung
│   │   ├── ConfirmModal.jsx     # Hộp thoại Modal
│   │   ├── PageHeader.jsx       # Tiêu đề & thanh điều hướng
│   │   ├── StatCard.jsx         # Thẻ số liệu thống kê
│   │   └── StatusBadge.jsx      # Huy hiệu trạng thái
│   ├── layout/
│   │   ├── Header.jsx           # Thanh Header + Menu chọn đổi nhanh 5 vai trò
│   │   └── Sidebar.jsx          # Menu Sidebar động thay đổi theo phân quyền
│   └── roles/                   # Màn hình chức năng theo từng phân quyền
│       ├── admin/
│       │   ├── AdminDashboard.jsx
│       │   ├── UserAccountsView.jsx
│       │   ├── SystemAuditLogs.jsx
│       │   └── SystemSettingsView.jsx
│       ├── hr/
│       │   ├── HrDashboard.jsx          # Tầm nhìn tổng quan nhân sự & Lifecycle
│       │   ├── HrEmployeesView.jsx      # Hồ sơ 360°, Sơ đồ cây tổ chức, Onboarding/Offboarding
│       │   ├── HrAttendanceView.jsx     # Kiosk OpenCV, Face ID 3 góc độ, Bảng công tháng
│       │   ├── HrRecruitmentView.jsx    # JD tuyển dụng & Kanban ứng viên
│       │   ├── HrLeaveView.jsx          # Quản lý đơn nghỉ phép toàn cty
│       │   ├── HrOvertimeView.jsx       # Quản lý tăng ca toàn cty
│       │   ├── HrAssetsView.jsx         # Quản lý tài sản & thiết bị
│       │   └── HrReportsView.jsx        # Báo cáo thống kê nhân sự
│       ├── manager/
│       │   ├── ManagerDashboard.jsx
│       │   ├── TeamMembersView.jsx
│       │   ├── TeamLeaveApprovals.jsx
│       │   ├── TeamOvertimeApprovals.jsx
│       │   └── TeamPerformanceKpi.jsx
│       ├── employee/
│       │   ├── EmployeeDashboard.jsx
│       │   ├── MyProfileView.jsx
│       │   ├── MyFaceCheckinView.jsx
│       │   ├── MyAttendanceView.jsx
│       │   ├── MyLeaveView.jsx
│       │   ├── MyOvertimeView.jsx
│       │   ├── MyPayslipView.jsx
│       │   └── MyTrainingView.jsx
│       └── finance/
│           ├── FinanceDashboard.jsx
│           ├── SalaryComponentsView.jsx
│           ├── PayrollCalculationView.jsx
│           └── PayrollReportsView.jsx
├── data/
│   └── mockData.js              # Dữ liệu mẫu hoàn chỉnh cho 5 phân quyền
├── App.jsx                      # Điều hướng phân quyền trung tâm
└── index.css                    # Tối ưu giao diện cho màn hình 13 inch
```
