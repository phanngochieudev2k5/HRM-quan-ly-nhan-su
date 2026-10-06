# ĐẶC TẢ GIAO DIỆN HỆ THỐNG HRM

> Phiên bản: 1.0  
> Frontend: ReactJS  
> UI Framework đề xuất: Ant Design  
> Backend: NodeJS + ExpressJS  
> Database: SQL Server  
> Phạm vi: HRM quản lý vòng đời nhân viên, tích hợp OpenCV cho chấm công.

---

## 1. Mục tiêu thiết kế

Giao diện theo phong cách **Modern Enterprise Dashboard** (giao diện quản trị doanh nghiệp hiện đại), ưu tiên:

- Đơn giản, sạch, dễ sử dụng.
- Tập trung vào nghiệp vụ HRM.
- Thông tin quan trọng được nhìn thấy nhanh.
- CRUD (Create, Read, Update, Delete – tạo, xem, cập nhật, xóa) rõ ràng.
- Dùng Card (thẻ thông tin), Chart (biểu đồ), Badge (nhãn trạng thái), Table (bảng dữ liệu).
- OpenCV chỉ là thành phần kỹ thuật trong nghiệp vụ chấm công.
- Responsive (thích ứng màn hình) ở mức phù hợp với hệ thống quản trị web.

## 2. Ngôn ngữ thiết kế

Phong cách: **Clean + Professional + Modern + Enterprise**.

- Nền sáng.
- Sidebar xanh navy đậm.
- Primary (màu chủ đạo): xanh dương.
- Card nền trắng, border nhẹ, bo góc vừa phải, shadow nhẹ.
- Typography (kiểu chữ) rõ ràng.
- Xanh dương: hành động/thông tin chính.
- Xanh lá: thành công/đã duyệt.
- Cam: cảnh báo/đi muộn.
- Đỏ: lỗi/từ chối/quá hạn.
- Xám: thông tin phụ.

## 3. Layout tổng thể

```text
┌──────────────────────────────────────────────────────────────┐
│ TOP HEADER: Search | Notification | User Profile            │
├───────────────┬──────────────────────────────────────────────┤
│ SIDEBAR       │ MAIN CONTENT                                 │
│ Tổng quan     │                                              │
│ Nhân sự       │                                              │
│ Chấm công     │                                              │
│ Nghỉ phép     │                                              │
│ Tăng ca       │                                              │
│ Lương         │                                              │
│ Tuyển dụng    │                                              │
│ Đánh giá      │                                              │
│ Tài sản       │                                              │
│ Báo cáo       │                                              │
│ Cài đặt       │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

### Sidebar

Menu đề xuất:

```text
Tổng quan
Nhân sự
  ├─ Danh sách nhân viên
  ├─ Hồ sơ nhân viên
  ├─ Hợp đồng
  ├─ Lịch sử công tác
  └─ Cơ cấu tổ chức
Chấm công
  ├─ Chấm công bằng khuôn mặt
  ├─ Lịch sử chấm công
  ├─ Ca làm việc
  └─ Báo cáo chấm công
Nghỉ phép
Tăng ca
Lương
  ├─ Bảng lương
  └─ Kỳ tính lương
Tuyển dụng
  ├─ Vị trí tuyển dụng
  ├─ Ứng viên
  ├─ Phỏng vấn
  └─ Đề nghị tuyển dụng
Đánh giá
  ├─ KPI
  └─ Đánh giá hiệu suất
Tài sản
Báo cáo
Cài đặt
```

Quy tắc: menu đang chọn có nền Primary; icon bên trái; hỗ trợ Collapse (thu gọn); hiển thị menu theo Permission (quyền).

### Top Header

```text
[🔍 Tìm kiếm nhân viên, chức năng...]       [🔔] [💬] [Avatar] Nguyễn Văn A
```

Global Search (tìm kiếm toàn hệ thống): nhân viên, mã nhân viên, chức năng, đơn nghỉ phép, hợp đồng, ứng viên.

---

## 4. Dashboard – Tổng quan

Dashboard là trang đầu tiên sau đăng nhập và chỉ nên hiển thị các chỉ số quan trọng.

```text
Xin chào, Nguyễn Văn A
Chúc bạn một ngày làm việc hiệu quả!

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Tổng nhân  │ │ Đang làm   │ │ Nghỉ việc  │ │ Ứng tuyển  │
│ viên 128   │ │ việc 112   │ │ 5          │ │ 12         │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

┌──────────────────────────┐ ┌─────────────────────────────┐
│ Tình hình chấm công      │ │ Loại nghỉ phép              │
│        Chart             │ │       Donut Chart            │
└──────────────────────────┘ └─────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Công việc cần xử lý                                        │
│ • 3 yêu cầu nghỉ phép cần duyệt                             │
│ • 2 yêu cầu tăng ca cần duyệt                               │
│ • 8 hợp đồng sắp hết hạn                                    │
└────────────────────────────────────────────────────────────┘
```

KPI Cards: Tổng nhân viên, Đang làm việc, Nghỉ việc, Ứng tuyển.

---

## 5. Chấm công bằng nhận diện khuôn mặt

Đây là giao diện quan trọng nhất đối với Member 1.

```text
Chấm công bằng nhận diện khuôn mặt

┌──────────────────────────────────┐
│              CAMERA              │
│        ┌──────────────┐          │
│        │  Face Box    │          │
│        └──────────────┘          │
│       ✓ Nhận diện thành công     │
│       Nguyễn Văn A - EMP001      │
│       Độ chính xác: 96.7%        │
└──────────────────────────────────┘

┌──────────────────────┐
│ 08:15:32             │
│ Thứ 2, 21/04/2025   │
│ ✓ Đã chấm công       │
│ Nhân viên: Nguyễn A  │
│ Mã NV: EMP001        │
│ Loại: Check-in       │
│ Thiết bị: Camera 01  │
│ [Chấm công thủ công] │
└──────────────────────┘
```

### Trạng thái OpenCV

- **Đang chờ:** Camera đang hoạt động – Vui lòng nhìn vào camera.
- **Đang nhận diện:** Đang nhận diện...
- **Thành công:** Nhận diện thành công, tên, mã nhân viên, Confidence (độ tin cậy).
- **Thất bại:** Không nhận diện được – Vui lòng nhìn rõ vào camera.
- **Đã chấm công:** Bạn đã chấm công lúc HH:mm.

UX (trải nghiệm người dùng) không nên phô bày quá nhiều thông tin kỹ thuật OpenCV; người dùng chỉ cần biết đã nhận diện chưa, là ai, đã chấm công chưa, thời gian và kết quả.

---

## 6. Lịch sử chấm công

```text
Lịch sử chấm công

[01/04/2025 - 30/04/2025] [Phòng ban ▼] [Trạng thái ▼] [Tìm kiếm]

┌────┬─────────────┬────────┬─────────┬─────────┬──────────┐
│ STT│ Nhân viên   │ Mã NV  │ Giờ vào │ Giờ ra  │ Trạng thái│
├────┼─────────────┼────────┼─────────┼─────────┼──────────┤
│ 1  │ Nguyễn A    │ EMP001 │ 08:05   │ 17:02   │ Có mặt   │
│ 2  │ Trần B      │ EMP002 │ 08:27   │ 17:05   │ Đi muộn  │
└────┴─────────────┴────────┴─────────┴─────────┴──────────┘
```

Filter (bộ lọc): khoảng thời gian, phòng ban, nhân viên, trạng thái, nguồn chấm công.

Status Badge: PRESENT (có mặt) xanh lá; LATE/EARLY (đi muộn/về sớm) cam; ABSENT (vắng) đỏ; LEAVE (nghỉ phép) xanh dương.

---

## 7. Quản lý nhân viên

```text
Quản lý nhân viên

[🔍 Tìm kiếm tên, mã NV, email...] [Phòng ban ▼] [Vị trí ▼] [Trạng thái ▼]
                                              [+ Thêm nhân viên]

┌────┬──────┬────────────┬────────┬──────────┬──────────┬────────┐
│STT │ Ảnh  │ Nhân viên  │ Mã NV  │ Phòng ban│ Vị trí   │ Thao tác│
├────┼──────┼────────────┼────────┼──────────┼──────────┼────────┤
│ 1  │ 👤   │ Nguyễn A   │ EMP001 │ IT       │ Developer│ ✏ 🗑  │
│ 2  │ 👤   │ Trần B     │ EMP002 │ MKT      │ Manager  │ ✏ 🗑  │
└────┴──────┴────────────┴────────┴──────────┴──────────┴────────┘
```

Actions: xem, sửa, xóa, khóa tài khoản, xem lịch sử, hợp đồng, chấm công.

## 8. Hồ sơ nhân viên

```text
┌─────────────────────────────────────────────────────────────┐
│ 👤 Nguyễn Văn A                         [Chỉnh sửa]         │
│    EMP001 • Developer • IT                                  │
│    ● Đang làm việc                                           │
└─────────────────────────────────────────────────────────────┘
[Thông tin cơ bản] [Liên hệ] [Gia đình] [Kinh nghiệm]
[Hợp đồng] [Chấm công] [Nghỉ phép] [Tài sản]
```

Thông tin: họ tên, mã nhân viên, ngày sinh, giới tính, email, số điện thoại, địa chỉ, phòng ban, team, chức vụ, quản lý, ngày vào làm.

---

## 9. Đăng ký khuôn mặt

```text
Đăng ký khuôn mặt

┌─────────────────────────────┐
│           CAMERA            │
│       ┌─────────────┐       │
│       │    FACE     │       │
│       └─────────────┘       │
└─────────────────────────────┘

Trạng thái: ✓ Khuôn mặt hợp lệ
[Chụp ảnh] [Đăng ký khuôn mặt]
Tiến trình: ● ● ● ○ ○  3 / 5 mẫu
```

Có thể thu 5 mẫu: chính diện, hơi nghiêng trái, hơi nghiêng phải, ánh sáng bình thường và một mẫu dự phòng.

---

## 10. Nghỉ phép

```text
Đăng ký nghỉ phép

Loại nghỉ phép *  [Nghỉ năm ▼]
Ngày bắt đầu *   [25/04/2025]
Ngày kết thúc *  [27/04/2025]
Số ngày          [3 ngày]
Lý do *          [Du lịch gia đình]
                 [Hủy] [Gửi yêu cầu]

Số ngày nghỉ còn lại
Nghỉ năm          12 ngày
Nghỉ bệnh          5 ngày
Nghỉ không lương   2 ngày
```

Bên dưới có lịch sử yêu cầu: ngày gửi, loại nghỉ, thời gian, trạng thái.

---

## 11. Bảng lương

```text
Bảng lương
[Tháng: 04/2025 ▼] [Phòng ban ▼] [Trạng thái ▼] [Xuất Excel]

┌────┬────────────┬──────────┬──────────┬─────────┬───────────┐
│STT │ Nhân viên  │ Lương CB │ Phụ cấp  │ Tăng ca │ Thực nhận │
├────┼────────────┼──────────┼──────────┼─────────┼───────────┤
│ 1  │ Nguyễn A   │15,000,000│2,000,000│800,000 │17,100,000 │
└────┴────────────┴──────────┴──────────┴─────────┴───────────┘
```

Chi tiết: Lương cơ bản + Phụ cấp + Tăng ca - Đi muộn - Nghỉ không lương - Khấu trừ khác = Thực nhận.

---

## 12. Tuyển dụng

```text
Tuyển dụng
[Tìm kiếm] [Phòng ban ▼] [Trạng thái ▼]       [+ Tạo vị trí tuyển dụng]

┌────┬───────────────────┬─────────┬────────┬─────────────┐
│STT │ Vị trí            │Phòng ban│Số lượng│ Trạng thái  │
├────┼───────────────────┼─────────┼────────┼─────────────┤
│ 1  │ Backend Developer │ IT      │ 3      │ Đang tuyển  │
│ 2  │ Marketing         │ MKT     │ 2      │ Đang tuyển  │
└────┴───────────────────┴─────────┴────────┴─────────────┘
```

Recruitment Pipeline (quy trình tuyển dụng): Applied → Screening → Interview → Evaluation → Offer → Hired.

---

## 13. Đánh giá hiệu suất

```text
Đánh giá hiệu suất

┌───────────────────────────────────────────────┐
│ 👤 Nguyễn Văn A                               │
│ EMP001 • Developer       Chu kỳ: 2025 - 2026 │
└───────────────────────────────────────────────┘

┌────────────────────────┬────────┬────────┬──────┐
│ Tiêu chí               │ Trọng số│ Kết quả│ Điểm│
├────────────────────────┼────────┼────────┼──────┤
│ Tiến độ công việc      │ 40%    │ 95%    │ 38  │
│ Chất lượng code        │ 30%    │ 90%    │ 27  │
│ Làm việc nhóm          │ 20%    │ 90%    │ 18  │
│ Chủ động               │ 10%    │ 85%    │ 8.5 │
└────────────────────────┴────────┴────────┴──────┘

Tổng điểm KPI: 91.5 / 100
```

---

## 14. Responsive Design

Desktop ưu tiên 1366×768 và 1920×1080. Tablet dùng Collapsed Sidebar. Mobile chỉ cần ưu tiên Dashboard, Chấm công, Nghỉ phép và Hồ sơ cá nhân trong phiên bản đầu.

---

## 15. Component Architecture trong ReactJS

```text
src/
├── components/
│   ├── common/
│   │   ├── PageHeader.jsx
│   │   ├── DataTable.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── SearchFilter.jsx
│   │   ├── ConfirmModal.jsx
│   │   └── Loading.jsx
│   ├── layout/
│   │   ├── MainLayout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── UserMenu.jsx
│   ├── dashboard/
│   ├── employee/
│   ├── attendance/
│   ├── leave/
│   ├── overtime/
│   ├── payroll/
│   ├── recruitment/
│   ├── performance/
│   └── asset/
├── pages/
├── services/
├── hooks/
├── utils/
├── routes/
└── App.jsx
```

---

## 16. Quy tắc UI Component

### Button

- Primary: hành động chính như Thêm, Tạo, Gửi, Lưu.
- Secondary: Hủy, Quay lại.
- Danger: Xóa, Từ chối, Khóa tài khoản.

### Table

Các bảng nghiệp vụ hỗ trợ Pagination (phân trang), Search (tìm kiếm), Filter (lọc), Sort (sắp xếp), Row Action (thao tác trên dòng), Loading và Empty State (trạng thái không có dữ liệu).

Nếu quá nhiều thông tin, dùng Table → Click Row → Detail Page/Drawer.

---

## 17. Phân quyền giao diện

### Employee

Tổng quan, Chấm công, Nghỉ phép, Tăng ca, Thông tin cá nhân, Lương cá nhân.

### Manager

Thêm nhân viên trong team, duyệt nghỉ phép, duyệt tăng ca, đánh giá nhân viên, báo cáo team.

### HR

Nhân sự, Tuyển dụng, Onboarding, Hợp đồng, Chấm công, Nghỉ phép, Offboarding.

### Finance

Payroll và Salary Reports.

### Admin

Users, Roles, Permissions, System Settings và toàn bộ chức năng quản trị.

---

## 18. Các luồng giao diện quan trọng

### Tuyển dụng

```text
Tuyển dụng → Vị trí tuyển dụng → Ứng viên → Phỏng vấn
→ Đánh giá → Offer → Hired → Employee → Onboarding
```

### Chấm công OpenCV

```text
Employee → Đăng ký khuôn mặt → Face Profile → Camera
→ OpenCV → Face Recognition → EmployeeId
→ AttendanceEvent → AttendanceDay → Present/Late/Early
```

### Tính lương

```text
Attendance + Leave + Overtime + Contract/Base Salary
→ Payroll → Gross Salary → Deduction → Net Salary
```

---

## 19. Design System đề xuất

```text
Primary:        Blue
Background:     Light Gray
Surface:        White
Text Primary:   Dark Navy
Text Secondary: Gray
Success:        Green
Warning:        Orange
Error:          Red
Info:           Blue
```

Typography:

```text
Font: Inter / system-ui
Page Title: 24px
Section Title: 18px
Body: 14px
Table: 14px
Small text: 12px
```

Nếu dùng Ant Design, ưu tiên các component: Layout, Menu, Card, Table, Form, Input, Select, DatePicker, Modal, Drawer, Tabs, Tag, Badge, Avatar, Statistic, Progress, Tooltip, Dropdown, Pagination.

---

## 20. Màn hình ưu tiên theo 7 Sprint

### Sprint 1

Login, Dashboard, Employee List, Employee Detail, Attendance Basic.

### Sprint 2

Organization, Shift, Employee Shift, RBAC.

### Sprint 3

Recruitment, Candidate, Interview, Onboarding, Face Registration.

### Sprint 4

Face Recognition Attendance, Attendance History, Leave, Contract.

### Sprint 5

Overtime, Payroll.

### Sprint 6

Performance, Asset, Offboarding, Attendance Reports.

### Sprint 7

Dashboard hoàn chỉnh, Reports, Permission UI, Responsive, Loading/Empty/Error states và final UI polish.

---

## 21. Nguyên tắc thiết kế xuyên suốt

1. Không biến hệ thống thành “ứng dụng OpenCV”. OpenCV chỉ xuất hiện nổi bật ở Đăng ký khuôn mặt và Chấm công.
2. Các module HRM còn lại phải giữ cùng một Design System (hệ thống thiết kế).
3. Dashboard không quá phức tạp; ưu tiên thông tin cần hành động.
4. Ưu tiên nghiệp vụ hơn hiệu ứng animation.
5. Không dùng quá nhiều gradient, 3D hoặc hiệu ứng chuyển trang.
6. Tập trung vào **Readable → Consistent → Fast → Professional** (dễ đọc → nhất quán → nhanh → chuyên nghiệp).
7. Không sao chép từng pixel của ảnh tham khảo; dùng ảnh làm UI Direction (định hướng giao diện) và xây dựng hệ thống component nhất quán cho toàn bộ dự án.
