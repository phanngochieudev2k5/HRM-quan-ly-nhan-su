import { connectDb, sql } from '../Config/DbConfig.js';

export class ShiftScheduleModel {
  /**
   * Lấy dữ liệu ma trận phân ca trong khoảng ngày [startDate, endDate]
   * Kết hợp danh sách nhân viên (tblEmployee + tblDepartment) và lịch phân ca (tblAttendance + tblShift)
   */
  static async getSchedule({ startDate, endDate, departmentId, search } = {}) {
    const pool = await connectDb();
    const empReq = pool.request();
    const empConditions = ["(e.WorkStatus IS NULL OR e.WorkStatus <> N'Đã nghỉ việc')"];

    if (departmentId && departmentId !== 'all') {
      empReq.input('departmentId', sql.Int, parseInt(departmentId, 10));
      empConditions.push('e.DepartmentId = @departmentId');
    }

    if (search && search.trim()) {
      empReq.input('search', sql.NVarChar(100), `%${search.trim()}%`);
      empConditions.push('(e.FullName LIKE @search OR e.EmployeeCode LIKE @search)');
    }

    const empResult = await empReq.query(`
      SELECT
        e.EmployeeId,
        e.EmployeeCode,
        e.FullName,
        e.DepartmentId,
        e.PositionId,
        e.AvatarUrl,
        e.WorkStatus,
        d.DepartmentName,
        d.DepartmentCode
      FROM tblEmployee e
      LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
      WHERE ${empConditions.join(' AND ')}
      ORDER BY d.DepartmentName ASC, e.EmployeeCode ASC
    `);

    const employees = empResult.recordset || [];
    if (employees.length === 0) {
      return {
        startDate,
        endDate,
        employees: [],
        totalAssignments: 0
      };
    }

    const attReq = pool.request();
    attReq.input('startDate', sql.Date, startDate);
    attReq.input('endDate', sql.Date, endDate);

    const attConditions = ['a.AttendanceDate BETWEEN @startDate AND @endDate'];
    if (departmentId && departmentId !== 'all') {
      attReq.input('departmentId', sql.Int, parseInt(departmentId, 10));
      attConditions.push('e.DepartmentId = @departmentId');
    }
    if (search && search.trim()) {
      attReq.input('search', sql.NVarChar(100), `%${search.trim()}%`);
      attConditions.push('(e.FullName LIKE @search OR e.EmployeeCode LIKE @search)');
    }

    const attResult = await attReq.query(`
      SELECT
        a.AttendanceId,
        a.EmployeeId,
        CONVERT(varchar(10), a.AttendanceDate, 23) AS AttendanceDate,
        a.ShiftId,
        s.ShiftCode,
        s.ShiftName,
        s.ShiftType,
        CONVERT(varchar(5), s.StartTime, 108) AS StartTime,
        CONVERT(varchar(5), s.EndTime, 108) AS EndTime,
        CASE WHEN s.BreakStartTime IS NOT NULL THEN CONVERT(varchar(5), s.BreakStartTime, 108) ELSE NULL END AS BreakStartTime,
        CASE WHEN s.BreakEndTime IS NOT NULL THEN CONVERT(varchar(5), s.BreakEndTime, 108) ELSE NULL END AS BreakEndTime,
        CASE WHEN a.TimeIn IS NOT NULL THEN CONVERT(varchar(5), a.TimeIn, 108) ELSE NULL END AS TimeIn,
        CASE WHEN a.TimeOut IS NOT NULL THEN CONVERT(varchar(5), a.TimeOut, 108) ELSE NULL END AS TimeOut,
        a.AttendanceCode,
        a.WorkCredit,
        a.LateMinutes,
        a.EarlyMinutes,
        a.Note
      FROM tblAttendance a
      INNER JOIN tblEmployee e ON a.EmployeeId = e.EmployeeId
      INNER JOIN tblShift s ON a.ShiftId = s.ShiftId
      WHERE ${attConditions.join(' AND ')}
      ORDER BY a.AttendanceDate ASC
    `);

    const assignmentMapByEmp = new Map();
    for (const row of attResult.recordset) {
      if (!assignmentMapByEmp.has(row.EmployeeId)) {
        assignmentMapByEmp.set(row.EmployeeId, {});
      }
      assignmentMapByEmp.get(row.EmployeeId)[row.AttendanceDate] = row;
    }

    const enrichedEmployees = employees.map((emp) => ({
      ...emp,
      assignments: assignmentMapByEmp.get(emp.EmployeeId) || {}
    }));

    return {
      startDate,
      endDate,
      employees: enrichedEmployees,
      totalAssignments: attResult.recordset.length
    };
  }

  /**
   * Phân ca hàng loạt (UPSERT trong SQL Transaction)
   * Nếu nhân viên đã có bản ghi tại AttendanceDate -> UPDATE ShiftId
   * Nếu chưa có -> INSERT bản ghi mới với TimeIn/TimeOut/WorkCredit = NULL và AttendanceCode = 'SCHEDULED'
   */
  static async bulkAssign(items = []) {
    const pool = await connectDb();
    const transaction = new sql.Transaction(pool);

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCheckedInCount = 0;

    await transaction.begin();
    try {
      for (const item of items) {
        const empId = parseInt(item.EmployeeId, 10);
        const shiftId = parseInt(item.ShiftId, 10);
        const attDate = item.AttendanceDate;

        const checkReq = new sql.Request(transaction);
        checkReq.input('empId', sql.Int, empId);
        checkReq.input('attDate', sql.Date, attDate);

        const existing = await checkReq.query(`
          SELECT AttendanceId, TimeIn
          FROM tblAttendance
          WHERE EmployeeId = @empId AND AttendanceDate = @attDate
        `);

        if (existing.recordset.length > 0) {
          const row = existing.recordset[0];
          if (row.TimeIn !== null && row.TimeIn !== undefined && !item.forceOverwriteCheckedIn) {
            skippedCheckedInCount += 1;
            continue;
          }

          const updReq = new sql.Request(transaction);
          updReq.input('attId', sql.Int, row.AttendanceId);
          updReq.input('shiftId', sql.Int, shiftId);
          await updReq.query(`
            UPDATE tblAttendance
            SET ShiftId = @shiftId
            WHERE AttendanceId = @attId
          `);
          updatedCount += 1;
        } else {
          const insReq = new sql.Request(transaction);
          insReq.input('empId', sql.Int, empId);
          insReq.input('attDate', sql.Date, attDate);
          insReq.input('shiftId', sql.Int, shiftId);
          await insReq.query(`
            INSERT INTO tblAttendance (
              EmployeeId, AttendanceDate, ShiftId,
              TimeIn, TimeOut, AttendanceCode, WorkCredit, OvertimeHours, LateMinutes, EarlyMinutes
            )
            VALUES (
              @empId, @attDate, @shiftId,
              NULL, NULL, 'SCHEDULED', NULL, NULL, NULL, NULL
            )
          `);
          insertedCount += 1;
        }
      }

      await transaction.commit();
      return {
        totalProcessed: items.length,
        insertedCount,
        updatedCount,
        skippedCheckedInCount
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Lấy bản ghi phân ca theo AttendanceId
   */
  static async getAssignmentById(attendanceId) {
    const pool = await connectDb();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(attendanceId, 10));

    const result = await request.query(`
      SELECT
        AttendanceId,
        EmployeeId,
        CONVERT(varchar(10), AttendanceDate, 23) AS AttendanceDate,
        ShiftId,
        TimeIn,
        TimeOut,
        AttendanceCode
      FROM tblAttendance
      WHERE AttendanceId = @id
    `);

    return result.recordset[0] || null;
  }

  /**
   * Xóa lịch phân ca theo AttendanceId (chỉ cho phép khi TimeIn IS NULL)
   */
  static async removeAssignment(attendanceId) {
    const pool = await connectDb();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(attendanceId, 10));

    await request.query(`
      DELETE FROM tblAttendance
      WHERE AttendanceId = @id AND TimeIn IS NULL
    `);

    return { AttendanceId: parseInt(attendanceId, 10) };
  }
}
