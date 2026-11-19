import { connectDb, sql } from '../Config/DbConfig.js';

// Danh mục loại nghỉ phép chuẩn theo cơ sở dữ liệu thực tế (tblLeaveType)
const DEFAULT_LEAVE_TYPES = [
  { LeaveTypeId: 1, TypeCode: 'ANNUAL', TypeName: 'Nghỉ phép năm', IsPaid: true },
  { LeaveTypeId: 2, TypeCode: 'SICK', TypeName: 'Nghỉ ốm đau', IsPaid: false },
  { LeaveTypeId: 3, TypeCode: 'MATERNITY', TypeName: 'Nghỉ chế độ thai sản', IsPaid: false },
  { LeaveTypeId: 4, TypeCode: 'UNPAID', TypeName: 'Nghỉ việc riêng không hưởng lương', IsPaid: false }
];

export class LeaveModel {
  /**
   * Lấy danh sách danh mục loại nghỉ phép (Đúng chuẩn schema tblLeaveType)
   */
  static async getLeaveTypes() {
    try {
      const pool = await connectDb();

      // Kiểm tra xem bảng có tồn tại không
      const tableCheck = await pool.request().query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'tblLeaveType'
      `);

      if (tableCheck.recordset.length === 0) {
        // Tự động tạo bảng nếu chưa có
        await pool.request().query(`
          CREATE TABLE tblLeaveType (
            LeaveTypeId INT IDENTITY(1,1) PRIMARY KEY,
            TypeCode VARCHAR(50) NOT NULL UNIQUE,
            TypeName NVARCHAR(100) NOT NULL,
            IsPaid BIT DEFAULT 1
          );

          INSERT INTO tblLeaveType (TypeCode, TypeName, IsPaid) VALUES
          ('ANNUAL', N'Nghỉ phép năm', 1),
          ('SICK', N'Nghỉ ốm đau', 0),
          ('MATERNITY', N'Nghỉ chế độ thai sản', 0),
          ('UNPAID', N'Nghỉ việc riêng không hưởng lương', 0);
        `);
      } else {
        // Nếu bảng đã có nhưng đang rỗng thì nạp dữ liệu chuẩn
        await pool.request().query(`
          IF NOT EXISTS (SELECT 1 FROM tblLeaveType)
          BEGIN
            INSERT INTO tblLeaveType (TypeCode, TypeName, IsPaid) VALUES
            ('ANNUAL', N'Nghỉ phép năm', 1),
            ('SICK', N'Nghỉ ốm đau', 0),
            ('MATERNITY', N'Nghỉ chế độ thai sản', 0),
            ('UNPAID', N'Nghỉ việc riêng không hưởng lương', 0);
          END
        `);
      }

      // Truy vấn danh mục chuẩn theo các cột: LeaveTypeId, TypeCode, TypeName, IsPaid
      const result = await pool.request().query(`
        SELECT 
          LeaveTypeId,
          TypeCode,
          TypeName,
          CAST(ISNULL(IsPaid, 0) AS BIT) AS IsPaid
        FROM tblLeaveType
        ORDER BY LeaveTypeId ASC
      `);

      if (result.recordset && result.recordset.length > 0) {
        return result.recordset;
      }
    } catch (err) {
      console.error('[LeaveModel.getLeaveTypes] DB Error:', err.message);
    }

    // Fallback đảm bảo không bao giờ trả về mảng rỗng
    return DEFAULT_LEAVE_TYPES;
  }

  /**
   * Lấy thông tin chi tiết loại nghỉ phép theo ID
   */
  static async getLeaveTypeById(id) {
    try {
      const pool = await connectDb();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT 
            LeaveTypeId,
            TypeCode,
            TypeName,
            CAST(ISNULL(IsPaid, 0) AS BIT) AS IsPaid
          FROM tblLeaveType
          WHERE LeaveTypeId = @id
        `);
      if (result.recordset[0]) return result.recordset[0];
    } catch (err) {
      console.error('[LeaveModel.getLeaveTypeById] DB Error:', err.message);
    }

    // Fallback
    return DEFAULT_LEAVE_TYPES.find((t) => t.LeaveTypeId === parseInt(id, 10)) || DEFAULT_LEAVE_TYPES[0];
  }

  /**
   * Lấy thông tin hạn mức và thống kê ngày phép của nhân viên
   */
  static async getQuota(employeeId, year = new Date().getFullYear()) {
    const pool = await connectDb();

    // 1. Lấy thông tin nhân viên (ngày vào làm, chức vụ, phòng ban)
    const empRes = await pool.request()
      .input('empId', sql.Int, employeeId)
      .query(`
        SELECT 
          e.EmployeeId,
          e.EmployeeCode,
          e.FullName,
          e.JoinDate,
          d.DepartmentName,
          p.PositionName
        FROM tblEmployee e
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        WHERE e.EmployeeId = @empId
      `);
    const employee = empRes.recordset[0] || null;

    // 2. Thống kê ngày phép năm theo các trạng thái trong năm hiện tại
    const quotaRes = await pool.request()
      .input('empId', sql.Int, employeeId)
      .input('year', sql.Int, parseInt(year, 10))
      .query(`
        SELECT
          COALESCE(SUM(CASE WHEN UPPER(TRIM(lr.Status)) = 'APPROVED' AND UPPER(TRIM(lt.TypeCode)) = 'ANNUAL' THEN CAST(lr.TotalDays AS DECIMAL(5,1)) ELSE 0 END), 0) AS ApprovedAnnualDays,
          COALESCE(SUM(CASE WHEN UPPER(TRIM(lr.Status)) = 'PENDING' AND UPPER(TRIM(lt.TypeCode)) = 'ANNUAL' THEN CAST(lr.TotalDays AS DECIMAL(5,1)) ELSE 0 END), 0) AS PendingAnnualDays,
          COALESCE(SUM(CASE WHEN UPPER(TRIM(lr.Status)) = 'APPROVED' AND UPPER(TRIM(lt.TypeCode)) = 'SICK' THEN CAST(lr.TotalDays AS DECIMAL(5,1)) ELSE 0 END), 0) AS UsedSickDays,
          COALESCE(SUM(CASE WHEN UPPER(TRIM(lr.Status)) = 'APPROVED' AND UPPER(TRIM(lt.TypeCode)) = 'UNPAID' THEN CAST(lr.TotalDays AS DECIMAL(5,1)) ELSE 0 END), 0) AS UsedUnpaidDays,
          COALESCE(SUM(CASE WHEN UPPER(TRIM(lr.Status)) = 'APPROVED' AND UPPER(TRIM(lt.TypeCode)) NOT IN ('ANNUAL', 'SICK', 'UNPAID') THEN CAST(lr.TotalDays AS DECIMAL(5,1)) ELSE 0 END), 0) AS UsedOtherDays
        FROM tblLeaveRequest lr
        INNER JOIN tblLeaveType lt ON lr.LeaveTypeId = lt.LeaveTypeId
        WHERE lr.EmployeeId = @empId 
          AND YEAR(TRY_CONVERT(date, lr.StartDate)) = @year
      `);

    const stats = quotaRes.recordset[0] || {
      ApprovedAnnualDays: 0,
      PendingAnnualDays: 0,
      UsedSickDays: 0,
      UsedUnpaidDays: 0,
      UsedOtherDays: 0
    };

    // Chuẩn tiêu chuẩn: 12 ngày phép năm + thâm niên (cứ 5 năm làm việc thêm 1 ngày phép theo BLLĐ)
    let standardAnnualQuota = 12.0;
    if (employee && employee.JoinDate) {
      const joinY = new Date(employee.JoinDate).getFullYear();
      const currentY = parseInt(year, 10) || new Date().getFullYear();
      const yearsOfService = Math.max(0, currentY - joinY);
      const seniorityDays = Math.floor(yearsOfService / 5);
      standardAnnualQuota += seniorityDays;
    }

    const approvedAnnual = parseFloat(stats.ApprovedAnnualDays) || 0;
    const pendingAnnual = parseFloat(stats.PendingAnnualDays) || 0;
    const remainingAnnual = Math.max(0, standardAnnualQuota - approvedAnnual);
    const availableAnnual = Math.max(0, standardAnnualQuota - approvedAnnual - pendingAnnual);

    return {
      employee,
      year: parseInt(year, 10),
      standardAnnualQuota,
      approvedAnnualDays: approvedAnnual,
      pendingAnnualDays: pendingAnnual,
      remainingAnnualDays: remainingAnnual,
      availableAnnualDays: availableAnnual,
      usedSickDays: parseFloat(stats.UsedSickDays) || 0,
      usedUnpaidDays: parseFloat(stats.UsedUnpaidDays) || 0,
      usedOtherDays: parseFloat(stats.UsedOtherDays) || 0
    };
  }

  /**
   * Kiểm tra trùng lặp khoảng thời gian nghỉ của nhân viên
   */
  static async checkOverlap(employeeId, startDate, endDate, excludeId = null) {
    const pool = await connectDb();
    const req = pool.request()
      .input('empId', sql.Int, employeeId)
      .input('start', sql.Date, startDate)
      .input('end', sql.Date, endDate);

    let query = `
      SELECT TOP 1
        lr.LeaveRequestId,
        lr.RequestCode,
        lr.StartDate,
        lr.EndDate,
        lr.Status,
        lt.TypeName
      FROM tblLeaveRequest lr
      INNER JOIN tblLeaveType lt ON lr.LeaveTypeId = lt.LeaveTypeId
      WHERE lr.EmployeeId = @empId
        AND lr.Status IN ('Pending', 'Approved')
        AND (
          (lr.StartDate <= @end AND lr.EndDate >= @start)
        )
    `;

    if (excludeId) {
      req.input('excludeId', sql.Int, excludeId);
      query += ` AND lr.LeaveRequestId <> @excludeId`;
    }

    const res = await req.query(query);
    return res.recordset[0] || null;
  }

  /**
   * Tự động sinh mã đơn theo định dạng: LR-YYYYMM-XXX (VD: LR-202611-001)
   */
  static async generateRequestCode() {
    const pool = await connectDb();
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `LR-${y}${m}-`;

    const res = await pool.request()
      .input('prefix', sql.VarChar(20), `${prefix}%`)
      .query(`
        SELECT COUNT(*) AS TotalCount
        FROM tblLeaveRequest
        WHERE RequestCode LIKE @prefix
      `);

    const seq = (res.recordset[0]?.TotalCount || 0) + 1;
    return `${prefix}${String(seq).padStart(3, '0')}`;
  }

  /**
   * Tạo đơn xin nghỉ phép mới
   */
  static async createLeaveRequest({
    requestCode,
    employeeId,
    leaveTypeId,
    startDate,
    endDate,
    totalDays,
    reason,
    handoverToEmployeeId = null
  }) {
    const pool = await connectDb();
    const res = await pool.request()
      .input('code', sql.VarChar(50), requestCode)
      .input('empId', sql.Int, employeeId)
      .input('typeId', sql.Int, leaveTypeId)
      .input('start', sql.Date, startDate)
      .input('end', sql.Date, endDate)
      .input('days', sql.Decimal(5, 1), totalDays)
      .input('reason', sql.NVarChar(500), reason)
      .input('handoverId', sql.Int, handoverToEmployeeId || null)
      .query(`
        INSERT INTO tblLeaveRequest (
          RequestCode,
          EmployeeId,
          LeaveTypeId,
          StartDate,
          EndDate,
          TotalDays,
          Reason,
          HandoverToEmployeeId,
          Status,
          CreatedAt,
          UpdatedAt
        )
        OUTPUT INSERTED.LeaveRequestId
        VALUES (
          @code,
          @empId,
          @typeId,
          @start,
          @end,
          @days,
          @reason,
          @handoverId,
          'Pending',
          SYSDATETIME(),
          SYSDATETIME()
        )
      `);

    const createdId = res.recordset[0]?.LeaveRequestId;
    return await this.getLeaveRequestById(createdId);
  }

  /**
   * Lấy chi tiết đơn nghỉ phép kèm thông tin liên kết đầy đủ
   */
  static async getLeaveRequestById(id) {
    const pool = await connectDb();
    const res = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          lr.LeaveRequestId,
          lr.RequestCode,
          lr.EmployeeId,
          e.EmployeeCode,
          e.FullName AS EmployeeName,
          e.AvatarUrl AS EmployeeAvatar,
          d.DepartmentId,
          d.DepartmentName,
          p.PositionName,
          e.ManagerId,
          m.FullName AS ManagerName,
          lr.LeaveTypeId,
          lt.TypeCode AS LeaveTypeCode,
          lt.TypeName AS LeaveTypeName,
          lt.IsPaid,
          CONVERT(varchar(10), lr.StartDate, 23) AS StartDate,
          CONVERT(varchar(10), lr.EndDate, 23) AS EndDate,
          lr.TotalDays,
          lr.Reason,
          lr.HandoverToEmployeeId,
          h.FullName AS HandoverToEmployeeName,
          h.EmployeeCode AS HandoverToEmployeeCode,
          lr.ApproverEmployeeId,
          a.FullName AS ApproverEmployeeName,
          a.EmployeeCode AS ApproverEmployeeCode,
          lr.Status,
          lr.ResponseNote,
          lr.ApprovedAt,
          lr.CreatedAt,
          lr.UpdatedAt
        FROM tblLeaveRequest lr
        INNER JOIN tblLeaveType lt ON lr.LeaveTypeId = lt.LeaveTypeId
        INNER JOIN tblEmployee e ON lr.EmployeeId = e.EmployeeId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        LEFT JOIN tblEmployee m ON e.ManagerId = m.EmployeeId
        LEFT JOIN tblEmployee h ON lr.HandoverToEmployeeId = h.EmployeeId
        LEFT JOIN tblEmployee a ON lr.ApproverEmployeeId = a.EmployeeId
        WHERE lr.LeaveRequestId = @id
      `);
    return res.recordset[0] || null;
  }

  /**
   * Lấy lịch sử đơn xin nghỉ phép của nhân viên cá nhân (Employee - US-23)
   */
  static async getMyRequests(employeeId, year = null) {
    const pool = await connectDb();
    const req = pool.request().input('empId', sql.Int, employeeId);

    let whereClause = `WHERE lr.EmployeeId = @empId`;
    if (year) {
      req.input('year', sql.Int, year);
      whereClause += ` AND YEAR(lr.StartDate) = @year`;
    }

    const res = await req.query(`
      SELECT
        lr.LeaveRequestId,
        lr.RequestCode,
        lr.EmployeeId,
        e.EmployeeCode,
        e.FullName AS EmployeeName,
        lr.LeaveTypeId,
        lt.TypeCode AS LeaveTypeCode,
        lt.TypeName AS LeaveTypeName,
        lt.IsPaid,
        CONVERT(varchar(10), lr.StartDate, 23) AS StartDate,
        CONVERT(varchar(10), lr.EndDate, 23) AS EndDate,
        lr.TotalDays,
        lr.Reason,
        lr.HandoverToEmployeeId,
        h.FullName AS HandoverToEmployeeName,
        h.EmployeeCode AS HandoverToEmployeeCode,
        lr.ApproverEmployeeId,
        a.FullName AS ApproverEmployeeName,
        lr.Status,
        lr.ResponseNote,
        lr.ApprovedAt,
        lr.CreatedAt,
        lr.UpdatedAt
      FROM tblLeaveRequest lr
      INNER JOIN tblLeaveType lt ON lr.LeaveTypeId = lt.LeaveTypeId
      INNER JOIN tblEmployee e ON lr.EmployeeId = e.EmployeeId
      LEFT JOIN tblEmployee h ON lr.HandoverToEmployeeId = h.EmployeeId
      LEFT JOIN tblEmployee a ON lr.ApproverEmployeeId = a.EmployeeId
      ${whereClause}
      ORDER BY lr.CreatedAt DESC
    `);
    return res.recordset || [];
  }

  /**
   * Lấy danh sách đơn xin nghỉ phép của nhân viên cấp dưới trực thuộc quản lý (Manager - US-17)
   */
  static async getTeamRequests(managerEmployeeId, status = 'ALL', search = '') {
    const pool = await connectDb();
    const req = pool.request().input('mgrId', sql.Int, managerEmployeeId);

    const conditions = ['(e.ManagerId = @mgrId OR lr.ApproverEmployeeId = @mgrId)'];

    if (status && status !== 'ALL') {
      req.input('status', sql.NVarChar(50), status);
      conditions.push('lr.Status = @status');
    }

    if (search && search.trim()) {
      req.input('search', sql.NVarChar(100), `%${search.trim()}%`);
      conditions.push('(e.FullName LIKE @search OR e.EmployeeCode LIKE @search OR lr.RequestCode LIKE @search)');
    }

    const res = await req.query(`
      SELECT
        lr.LeaveRequestId,
        lr.RequestCode,
        lr.EmployeeId,
        e.EmployeeCode,
        e.FullName AS EmployeeName,
        e.AvatarUrl AS EmployeeAvatar,
        d.DepartmentName,
        p.PositionName,
        lr.LeaveTypeId,
        lt.TypeCode AS LeaveTypeCode,
        lt.TypeName AS LeaveTypeName,
        lt.IsPaid,
        CONVERT(varchar(10), lr.StartDate, 23) AS StartDate,
        CONVERT(varchar(10), lr.EndDate, 23) AS EndDate,
        lr.TotalDays,
        lr.Reason,
        lr.HandoverToEmployeeId,
        h.FullName AS HandoverToEmployeeName,
        h.EmployeeCode AS HandoverToEmployeeCode,
        lr.ApproverEmployeeId,
        a.FullName AS ApproverEmployeeName,
        lr.Status,
        lr.ResponseNote,
        lr.ApprovedAt,
        lr.CreatedAt,
        lr.UpdatedAt
      FROM tblLeaveRequest lr
      INNER JOIN tblEmployee e ON lr.EmployeeId = e.EmployeeId
      INNER JOIN tblLeaveType lt ON lr.LeaveTypeId = lt.LeaveTypeId
      LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
      LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
      LEFT JOIN tblEmployee h ON lr.HandoverToEmployeeId = h.EmployeeId
      LEFT JOIN tblEmployee a ON lr.ApproverEmployeeId = a.EmployeeId
      WHERE ${conditions.join(' AND ')}
      ORDER BY 
        CASE WHEN lr.Status = 'Pending' THEN 0 ELSE 1 END ASC,
        lr.CreatedAt DESC
    `);

    return res.recordset || [];
  }

  /**
   * Lấy toàn bộ đơn nghỉ phép toàn công ty (HR - US-12)
   */
  static async getAllRequests({ departmentId = 'ALL', leaveTypeId = 'ALL', status = 'ALL', search = '' } = {}) {
    const pool = await connectDb();
    const req = pool.request();
    const conditions = ['1=1'];

    if (departmentId && departmentId !== 'ALL') {
      req.input('deptId', sql.Int, parseInt(departmentId, 10));
      conditions.push('e.DepartmentId = @deptId');
    }

    if (leaveTypeId && leaveTypeId !== 'ALL') {
      req.input('typeId', sql.Int, parseInt(leaveTypeId, 10));
      conditions.push('lr.LeaveTypeId = @typeId');
    }

    if (status && status !== 'ALL') {
      req.input('status', sql.NVarChar(50), status);
      conditions.push('lr.Status = @status');
    }

    if (search && search.trim()) {
      req.input('search', sql.NVarChar(100), `%${search.trim()}%`);
      conditions.push('(e.FullName LIKE @search OR e.EmployeeCode LIKE @search OR lr.RequestCode LIKE @search)');
    }

    const res = await req.query(`
      SELECT
        lr.LeaveRequestId,
        lr.RequestCode,
        lr.EmployeeId,
        e.EmployeeCode,
        e.FullName AS EmployeeName,
        e.AvatarUrl AS EmployeeAvatar,
        d.DepartmentId,
        d.DepartmentName,
        p.PositionName,
        lr.LeaveTypeId,
        lt.TypeCode AS LeaveTypeCode,
        lt.TypeName AS LeaveTypeName,
        lt.IsPaid,
        CONVERT(varchar(10), lr.StartDate, 23) AS StartDate,
        CONVERT(varchar(10), lr.EndDate, 23) AS EndDate,
        lr.TotalDays,
        lr.Reason,
        lr.HandoverToEmployeeId,
        h.FullName AS HandoverToEmployeeName,
        h.EmployeeCode AS HandoverToEmployeeCode,
        lr.ApproverEmployeeId,
        a.FullName AS ApproverEmployeeName,
        lr.Status,
        lr.ResponseNote,
        lr.ApprovedAt,
        lr.CreatedAt,
        lr.UpdatedAt
      FROM tblLeaveRequest lr
      INNER JOIN tblEmployee e ON lr.EmployeeId = e.EmployeeId
      INNER JOIN tblLeaveType lt ON lr.LeaveTypeId = lt.LeaveTypeId
      LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
      LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
      LEFT JOIN tblEmployee h ON lr.HandoverToEmployeeId = h.EmployeeId
      LEFT JOIN tblEmployee a ON lr.ApproverEmployeeId = a.EmployeeId
      WHERE ${conditions.join(' AND ')}
      ORDER BY 
        CASE WHEN lr.Status = 'Pending' THEN 0 ELSE 1 END ASC,
        lr.CreatedAt DESC
    `);

    // Thống kê tổng hợp số liệu
    const statsRes = await pool.request().query(`
      SELECT
        COUNT(*) AS TotalRequests,
        SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) AS PendingCount,
        SUM(CASE WHEN Status = 'Approved' THEN 1 ELSE 0 END) AS ApprovedCount,
        SUM(CASE WHEN Status = 'Rejected' THEN 1 ELSE 0 END) AS RejectedCount,
        SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) AS CancelledCount,
        COALESCE(SUM(CASE WHEN Status = 'Approved' THEN TotalDays ELSE 0 END), 0) AS TotalDaysApproved
      FROM tblLeaveRequest
    `);

    const stats = statsRes.recordset[0] || {
      TotalRequests: 0,
      PendingCount: 0,
      ApprovedCount: 0,
      RejectedCount: 0,
      CancelledCount: 0,
      TotalDaysApproved: 0
    };

    return {
      requests: res.recordset || [],
      statistics: {
        totalRequests: stats.TotalRequests,
        pendingCount: stats.PendingCount,
        approvedCount: stats.ApprovedCount,
        rejectedCount: stats.RejectedCount,
        cancelledCount: stats.CancelledCount,
        totalDaysApproved: parseFloat(stats.TotalDaysApproved) || 0
      }
    };
  }

  /**
   * Hủy đơn xin nghỉ phép (chỉ khi đang ở trạng thái 'Pending')
   */
  static async cancelRequest(requestId, employeeId) {
    const pool = await connectDb();
    const req = pool.request()
      .input('id', sql.Int, requestId)
      .input('empId', sql.Int, employeeId);

    const check = await req.query(`
      SELECT Status, EmployeeId FROM tblLeaveRequest WHERE LeaveRequestId = @id
    `);
    const current = check.recordset[0];
    if (!current) {
      throw new Error('Không tìm thấy đơn xin nghỉ phép cần hủy!');
    }
    if (current.EmployeeId !== employeeId) {
      throw new Error('Bạn không có quyền hủy đơn nghỉ phép của nhân viên khác!');
    }
    if (current.Status !== 'Pending') {
      throw new Error(`Đơn nghỉ phép đang ở trạng thái "${current.Status}", không thể hủy!`);
    }

    await pool.request()
      .input('id', sql.Int, requestId)
      .query(`
        UPDATE tblLeaveRequest
        SET Status = 'Cancelled', UpdatedAt = SYSDATETIME()
        WHERE LeaveRequestId = @id
      `);

    return await this.getLeaveRequestById(requestId);
  }

  /**
   * Phê duyệt đơn xin nghỉ phép & Tự động đồng bộ sang bảng tblAttendance (Transaction an toàn)
   */
  static async approveRequest(requestId, approverEmployeeId, responseNote = '') {
    const pool = await connectDb();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Kiểm tra đơn
      const checkReq = new sql.Request(transaction);
      checkReq.input('id', sql.Int, requestId);
      const leaveRes = await checkReq.query(`
        SELECT 
          lr.LeaveRequestId,
          lr.RequestCode,
          lr.EmployeeId,
          lr.LeaveTypeId,
          CONVERT(varchar(10), lr.StartDate, 23) AS StartDate,
          CONVERT(varchar(10), lr.EndDate, 23) AS EndDate,
          lr.TotalDays,
          lr.Reason,
          lr.Status,
          lt.TypeCode,
          lt.TypeName,
          lt.IsPaid
        FROM tblLeaveRequest lr
        INNER JOIN tblLeaveType lt ON lr.LeaveTypeId = lt.LeaveTypeId
        WHERE lr.LeaveRequestId = @id
      `);

      const leave = leaveRes.recordset[0];
      if (!leave) {
        throw new Error('Không tìm thấy đơn xin nghỉ phép cần duyệt!');
      }
      if (leave.Status !== 'Pending') {
        throw new Error(`Đơn nghỉ phép này đã được xử lý trước đó (trạng thái: "${leave.Status}")!`);
      }

      // 2. Cập nhật trạng thái đơn thành 'Approved'
      const updateReq = new sql.Request(transaction);
      updateReq.input('id', sql.Int, requestId);
      updateReq.input('approverId', sql.Int, approverEmployeeId);
      updateReq.input('note', sql.NVarChar(500), responseNote || null);
      await updateReq.query(`
        UPDATE tblLeaveRequest
        SET 
          Status = 'Approved',
          ApproverEmployeeId = @approverId,
          ResponseNote = @note,
          ApprovedAt = SYSDATETIME(),
          UpdatedAt = SYSDATETIME()
        WHERE LeaveRequestId = @id
      `);

      // 3. Đồng bộ sang bảng tblAttendance cho từng ngày trong khoảng [StartDate, EndDate]
      // Lưu ý: Cột AttendanceCode trong tblAttendance có kiểu VARCHAR(10) nên mã tối đa 10 ký tự
      // 'LEAVE_PAID': 10 ký tự (phép có lương), 'LEAVE_UNP': 9 ký tự (phép không lương)
      const attendanceCode = (leave.IsPaid ? 'LEAVE_PAID' : 'LEAVE_UNP').slice(0, 10);
      const isHalfDay = parseFloat(leave.TotalDays) === 0.5;
      const workCredit = leave.IsPaid ? (isHalfDay ? 0.5 : 1.0) : 0.0;
      const attNote = `Nghỉ phép: ${leave.TypeName} (${leave.RequestCode})`.slice(0, 255);

      // Tìm ca làm việc hợp lệ vì cột ShiftId trong tblAttendance bắt buộc NOT NULL
      let assignedShiftId = null;
      try {
        const shiftLookupReq = new sql.Request(transaction);
        shiftLookupReq.input('empId', sql.Int, leave.EmployeeId);
        const shiftLookupRes = await shiftLookupReq.query(`
          -- 1. Ưu tiên lấy ca gần nhất mà nhân viên đã từng được phân trong tblAttendance
          SELECT TOP 1 ShiftId FROM tblAttendance 
          WHERE EmployeeId = @empId AND ShiftId IS NOT NULL 
          ORDER BY AttendanceDate DESC;

          -- 2. Nếu chưa có, lấy ca làm việc hành chính chuẩn trong tblShift
          SELECT TOP 1 ShiftId FROM tblShift 
          WHERE ShiftType = 'Administrative' OR ShiftCode LIKE '%HC%' OR ShiftName LIKE N'%Hành chính%' 
          ORDER BY ShiftId ASC;

          -- 3. Nếu không có ca hành chính, lấy ca đầu tiên bất kỳ trong tblShift
          SELECT TOP 1 ShiftId FROM tblShift ORDER BY ShiftId ASC;
        `);

        if (shiftLookupRes.recordsets) {
          for (const rs of shiftLookupRes.recordsets) {
            if (rs.length > 0 && rs[0].ShiftId) {
              assignedShiftId = rs[0].ShiftId;
              break;
            }
          }
        }
      } catch (errShift) {
        console.warn('[approveRequest] Không thể tự động tìm ca làm việc:', errShift.message);
      }

      // Giá trị mặc định dự phòng tối thiểu nếu chưa có ca nào
      if (!assignedShiftId) {
        assignedShiftId = 1;
      }

      const start = new Date(`${leave.StartDate}T00:00:00`);
      const end = new Date(`${leave.EndDate}T00:00:00`);
      const curr = new Date(start);

      while (curr <= end) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        const attCheckReq = new sql.Request(transaction);
        attCheckReq.input('empId', sql.Int, leave.EmployeeId);
        attCheckReq.input('attDate', sql.Date, dateStr);

        const existAtt = await attCheckReq.query(`
          SELECT AttendanceId, ShiftId FROM tblAttendance WHERE EmployeeId = @empId AND AttendanceDate = @attDate
        `);

        if (existAtt.recordset.length > 0) {
          const attId = existAtt.recordset[0].AttendanceId;
          const attUpdReq = new sql.Request(transaction);
          attUpdReq.input('attId', sql.Int, attId);
          attUpdReq.input('code', sql.VarChar(10), attendanceCode);
          attUpdReq.input('credit', sql.Decimal(3, 1), workCredit);
          attUpdReq.input('note', sql.NVarChar(255), attNote);
          await attUpdReq.query(`
            UPDATE tblAttendance
            SET 
              AttendanceCode = @code,
              WorkCredit = @credit,
              Note = @note
            WHERE AttendanceId = @attId
          `);
        } else {
          const attInsReq = new sql.Request(transaction);
          attInsReq.input('empId', sql.Int, leave.EmployeeId);
          attInsReq.input('attDate', sql.Date, dateStr);
          attInsReq.input('shiftId', sql.Int, assignedShiftId);
          attInsReq.input('code', sql.VarChar(10), attendanceCode);
          attInsReq.input('credit', sql.Decimal(3, 1), workCredit);
          attInsReq.input('note', sql.NVarChar(255), attNote);
          await attInsReq.query(`
            INSERT INTO tblAttendance (
              EmployeeId,
              AttendanceDate,
              ShiftId,
              AttendanceCode,
              WorkCredit,
              OvertimeHours,
              LateMinutes,
              EarlyMinutes,
              Note
            )
            VALUES (
              @empId,
              @attDate,
              @shiftId,
              @code,
              @credit,
              0,
              0,
              0,
              @note
            )
          `);
        }

        curr.setDate(curr.getDate() + 1);
      }

      await transaction.commit();
      return await this.getLeaveRequestById(requestId);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  /**
   * Từ chối đơn xin nghỉ phép
   */
  static async rejectRequest(requestId, approverEmployeeId, responseNote = '') {
    const pool = await connectDb();
    const req = pool.request()
      .input('id', sql.Int, requestId)
      .input('approverId', sql.Int, approverEmployeeId)
      .input('note', sql.NVarChar(500), responseNote || 'Từ chối đơn xin nghỉ');

    const check = await pool.request()
      .input('id', sql.Int, requestId)
      .query(`SELECT Status FROM tblLeaveRequest WHERE LeaveRequestId = @id`);

    const current = check.recordset[0];
    if (!current) {
      throw new Error('Không tìm thấy đơn xin nghỉ phép cần xử lý!');
    }
    if (current.Status !== 'Pending') {
      throw new Error(`Đơn nghỉ phép này đã được xử lý trước đó (trạng thái: "${current.Status}")!`);
    }

    await req.query(`
      UPDATE tblLeaveRequest
      SET 
        Status = 'Rejected',
        ApproverEmployeeId = @approverId,
        ResponseNote = @note,
        UpdatedAt = SYSDATETIME()
      WHERE LeaveRequestId = @id
    `);

    return await this.getLeaveRequestById(requestId);
  }

  /**
   * Lấy danh sách đồng nghiệp để chọn người nhận bàn giao công việc
   */
  static async getColleagues(excludeEmployeeId = null, departmentId = null) {
    try {
      const pool = await connectDb();
      const req = pool.request();
      const conditions = ["(e.WorkStatus IS NULL OR e.WorkStatus <> N'Đã nghỉ việc')"];

      const excId = excludeEmployeeId ? parseInt(excludeEmployeeId, 10) : null;
      if (excId && !Number.isNaN(excId)) {
        req.input('excludeId', sql.Int, excId);
        conditions.push('e.EmployeeId <> @excludeId');
      }

      if (departmentId && departmentId !== 'ALL') {
        req.input('deptId', sql.Int, parseInt(departmentId, 10));
        conditions.push('e.DepartmentId = @deptId');
      }

      const res = await req.query(`
        SELECT 
          e.EmployeeId,
          e.EmployeeCode,
          e.FullName,
          e.AvatarUrl,
          d.DepartmentName,
          p.PositionName
        FROM tblEmployee e
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        WHERE ${conditions.join(' AND ')}
        ORDER BY e.FullName ASC
      `);

      return res.recordset || [];
    } catch (err) {
      console.error('[LeaveModel.getColleagues] Error:', err.message);
      return [];
    }
  }
}
