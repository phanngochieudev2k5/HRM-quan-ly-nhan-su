import { getPool } from '../Config/DbConfig.js';
import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const facesUploadDir = path.resolve(__dirname, '../../uploads/faces');
const rootFacesDir = path.resolve(__dirname, '../../../faces');

if (!fs.existsSync(facesUploadDir)) {
  fs.mkdirSync(facesUploadDir, { recursive: true });
}
if (!fs.existsSync(rootFacesDir)) {
  fs.mkdirSync(rootFacesDir, { recursive: true });
}

export const AttendanceModel = {
  async recordCheckIn({ employeeCode, employeeId, checkinMethod = 'OPENCV_CAMERA', deviceName = 'Kiosk Cổng Chính', snapshotUrl = null, mode = 'AUTO' }) {
    const pool = getPool();

    let targetEmp = null;
    if (employeeId) {
      const empRes = await pool.request()
        .input('EmployeeId', sql.Int, employeeId)
        .query('SELECT EmployeeId, EmployeeCode, FullName, DepartmentId FROM tblEmployee WHERE EmployeeId = @EmployeeId');
      targetEmp = empRes.recordset[0];
    }

    if (!targetEmp && employeeCode) {
      const codeClean = employeeCode.trim();
      const empRes = await pool.request()
        .input('Code', sql.VarChar(50), codeClean)
        .query(`
          SELECT TOP 1 EmployeeId, EmployeeCode, FullName, DepartmentId
          FROM tblEmployee
          WHERE EmployeeCode = @Code
             OR LOWER(EmployeeCode) = LOWER(@Code)
             OR LOWER(FullName) LIKE LOWER('%' + @Code + '%')
             OR LOWER(Email) LIKE LOWER(@Code + '%')
        `);
      targetEmp = empRes.recordset[0];
    }

    if (!targetEmp) {
      const allEmps = await pool.request().query('SELECT TOP 1 EmployeeId, EmployeeCode, FullName, DepartmentId FROM tblEmployee');
      targetEmp = allEmps.recordset[0];
      if (!targetEmp) {
        throw new Error(`Không tìm thấy nhân viên phù hợp với định danh: ${employeeCode}`);
      }
    }

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeNowStr = `${hours}:${minutes}:${seconds}`;

    const shiftRes = await pool.request()
      .query('SELECT TOP 1 ShiftId, StartTime, EndTime FROM tblShift WHERE IsActive = 1 ORDER BY ShiftId ASC');
    const shift = shiftRes.recordset[0] || { ShiftId: 1, StartTime: '08:00:00', EndTime: '17:30:00' };

    const existRes = await pool.request()
      .input('EmployeeId', sql.Int, targetEmp.EmployeeId)
      .input('AttendanceDate', sql.Date, todayStr)
      .query(`
        SELECT TOP 1 *,
          ISNULL(CONVERT(VARCHAR(8), TimeIn, 108), CONVERT(VARCHAR(8), TimeIn)) as TimeInStr,
          ISNULL(CONVERT(VARCHAR(8), TimeOut, 108), CONVERT(VARCHAR(8), TimeOut)) as TimeOutStr
        FROM tblAttendance
        WHERE EmployeeId = @EmployeeId AND AttendanceDate = @AttendanceDate
      `);

    let attendanceRecord = existRes.recordset[0];

    const formatRawTime = (val, fallback = '') => {
      if (!val) return fallback;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.length <= 8 && trimmed.includes(':')) return trimmed;
        if (trimmed.includes('T')) {
          const p = trimmed.split('T')[1];
          if (p) return p.slice(0, 8);
        }
        if (trimmed.startsWith('Fri ') || trimmed.startsWith('Mon ') || trimmed.startsWith('Tue ') || trimmed.startsWith('Wed ') || trimmed.startsWith('Thu ') || trimmed.startsWith('Sat ') || trimmed.startsWith('Sun ')) {
          const parts = trimmed.split(' ');
          const timeMatch = parts.find(p => p.includes(':'));
          if (timeMatch) return timeMatch.slice(0, 8);
        }
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) {
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          const ss = String(d.getSeconds()).padStart(2, '0');
          return `${hh}:${mm}:${ss}`;
        }
        return trimmed.slice(0, 8);
      }
      if (val instanceof Date) {
        const hh = String(val.getHours()).padStart(2, '0');
        const mm = String(val.getMinutes()).padStart(2, '0');
        const ss = String(val.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      }
      return String(val);
    };

    if (mode === 'CHECK_IN' && attendanceRecord) {
      const checkInTime = formatRawTime(attendanceRecord.TimeInStr || attendanceRecord.TimeIn, timeNowStr);
      return {
        action: 'ALREADY_CHECKED_IN',
        record: attendanceRecord,
        employee: targetEmp,
        isLate: attendanceRecord.LateMinutes > 0,
        lateMinutes: attendanceRecord.LateMinutes || 0,
        checkTime: checkInTime,
        message: `Nhân viên ${targetEmp.FullName} (${targetEmp.EmployeeCode}) đã chấm công Vào ca lúc ${checkInTime} rồi! Không cần chấm công lại. Khi kết thúc ca, vui lòng chọn "Chấm công Ra về".`
      };
    }

    if (mode === 'CHECK_OUT' && !attendanceRecord) {
      throw new Error(`Nhân viên ${targetEmp.FullName} (${targetEmp.EmployeeCode}) chưa chấm công Vào ca hôm nay! Vui lòng chọn "Chấm công Vào ca" trước.`);
    }

    if (!attendanceRecord) {
      let lateMinutes = 0;
      const [startH, startM] = (shift.StartTime || '08:00:00').toString().split(':').map(Number);
      const scheduledMinutes = (startH || 8) * 60 + (startM || 0);
      const actualMinutes = now.getHours() * 60 + now.getMinutes();

      if (actualMinutes > scheduledMinutes) {
        lateMinutes = actualMinutes - scheduledMinutes;
      }

      let attendanceCode = 'X';
      let workCredit = 1.0;
      let note = 'Đúng giờ';

      if (lateMinutes > 10) {
        attendanceCode = 'M';
        workCredit = 0.0;
        note = `Đi muộn ${lateMinutes} phút (Không tính công do muộn > 10p)`;
      } else if (lateMinutes > 0) {
        attendanceCode = 'M';
        workCredit = 1.0;
        note = `Đi muộn ${lateMinutes} phút (Vẫn tính 1 công vì <= 10p)`;
      }

      const insertRes = await pool.request()
        .input('EmployeeId', sql.Int, targetEmp.EmployeeId)
        .input('AttendanceDate', sql.Date, todayStr)
        .input('ShiftId', sql.Int, shift.ShiftId)
        .input('TimeIn', sql.VarChar(20), timeNowStr)
        .input('AttendanceCode', sql.VarChar(10), attendanceCode)
        .input('WorkCredit', sql.Decimal(3, 1), workCredit)
        .input('OvertimeHours', sql.Decimal(4, 1), 0)
        .input('LateMinutes', sql.Int, lateMinutes)
        .input('EarlyMinutes', sql.Int, 0)
        .input('CheckinMethod', sql.NVarChar(50), checkinMethod)
        .input('DeviceName', sql.NVarChar(100), deviceName)
        .input('SnapshotUrl', sql.NVarChar(500), snapshotUrl)
        .input('Note', sql.NVarChar(255), note)
        .query(`
          INSERT INTO tblAttendance (
            EmployeeId, AttendanceDate, ShiftId, TimeIn, AttendanceCode,
            WorkCredit, OvertimeHours, LateMinutes, EarlyMinutes,
            CheckinMethod, DeviceName, SnapshotUrl, Note
          )
          OUTPUT INSERTED.*
          VALUES (
            @EmployeeId, @AttendanceDate, @ShiftId, @TimeIn, @AttendanceCode,
            @WorkCredit, @OvertimeHours, @LateMinutes, @EarlyMinutes,
            @CheckinMethod, @DeviceName, @SnapshotUrl, @Note
          )
        `);

      attendanceRecord = insertRes.recordset[0];

      return {
        action: 'CHECK_IN',
        record: attendanceRecord,
        employee: targetEmp,
        isLate: lateMinutes > 0,
        lateMinutes,
        checkTime: timeNowStr,
        workCredit,
        attendanceCode,
        message: `Chấm công vào thành công cho ${targetEmp.FullName} (${targetEmp.EmployeeCode}) lúc ${timeNowStr}.${workCredit === 0 ? ' (Không tính công do muộn > 10p)' : ''}`
      };
    } else {
      let earlyMinutes = 0;
      const [endH, endM] = (shift.EndTime || '17:30:00').toString().split(':').map(Number);
      const scheduledEndMinutes = (endH || 17) * 60 + (endM || 30);
      const actualEndMinutes = now.getHours() * 60 + now.getMinutes();

      if (actualEndMinutes < scheduledEndMinutes) {
        earlyMinutes = scheduledEndMinutes - actualEndMinutes;
      }

      const prevLate = attendanceRecord.LateMinutes || 0;
      let finalCode = (prevLate > 0 || earlyMinutes > 0) ? 'M' : 'X';
      let finalCredit = 1.0;
      let finalNote = attendanceRecord.Note || '';

      if (prevLate > 10 || earlyMinutes > 10) {
        finalCredit = 0.0;
        finalCode = 'M';
        if (prevLate > 10 && earlyMinutes > 10) {
          finalNote = `Đi muộn ${prevLate}p & về sớm ${earlyMinutes}p (Không tính công do vi phạm > 10p)`;
        } else if (earlyMinutes > 10) {
          finalNote = `Về sớm ${earlyMinutes} phút (Không tính công do về sớm > 10p)`;
        } else {
          finalNote = `Đi muộn ${prevLate} phút (Không tính công do muộn > 10p)`;
        }
      } else if (prevLate > 0 || earlyMinutes > 0) {
        finalCredit = 1.0;
        finalCode = 'M';
        finalNote = `${prevLate > 0 ? `Đi muộn ${prevLate}p. ` : ''}${earlyMinutes > 0 ? `Về sớm ${earlyMinutes}p. ` : ''}(Vẫn tính 1 công vì <= 10p)`;
      } else {
        finalCredit = 1.0;
        finalCode = 'X';
        finalNote = 'Đúng giờ cả ngày';
      }

      const updateRes = await pool.request()
        .input('AttendanceId', sql.Int, attendanceRecord.AttendanceId)
        .input('TimeOut', sql.VarChar(20), timeNowStr)
        .input('EarlyMinutes', sql.Int, earlyMinutes)
        .input('AttendanceCode', sql.VarChar(10), finalCode)
        .input('WorkCredit', sql.Decimal(3, 1), finalCredit)
        .input('Note', sql.NVarChar(255), finalNote)
        .input('DeviceName', sql.NVarChar(100), deviceName)
        .query(`
          UPDATE tblAttendance
          SET TimeOut = @TimeOut,
              EarlyMinutes = @EarlyMinutes,
              AttendanceCode = @AttendanceCode,
              WorkCredit = @WorkCredit,
              Note = @Note,
              DeviceName = @DeviceName
          OUTPUT INSERTED.*
          WHERE AttendanceId = @AttendanceId
        `);

      attendanceRecord = updateRes.recordset[0];

      return {
        action: 'CHECK_OUT',
        record: attendanceRecord,
        employee: targetEmp,
        isEarly: earlyMinutes > 0,
        earlyMinutes,
        checkTime: timeNowStr,
        workCredit: finalCredit,
        attendanceCode: finalCode,
        message: `Chấm công ra thành công cho ${targetEmp.FullName} (${targetEmp.EmployeeCode}) lúc ${timeNowStr}.${finalCredit === 0 ? ' (Không tính công do vi phạm > 10p)' : ''}`
      };
    }
  },

  async getTodayEvents() {
    const pool = getPool();
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    const res = await pool.request()
      .input('Today', sql.Date, todayStr)
      .query(`
        SELECT
          a.AttendanceId,
          a.EmployeeId,
          e.EmployeeCode,
          e.FullName,
          d.DepartmentName,
          p.PositionName,
          a.AttendanceDate,
          ISNULL(CONVERT(VARCHAR(8), a.TimeIn, 108), CONVERT(VARCHAR(8), a.TimeIn)) as TimeInStr,
          ISNULL(CONVERT(VARCHAR(8), a.TimeOut, 108), CONVERT(VARCHAR(8), a.TimeOut)) as TimeOutStr,
          CASE WHEN a.AttendanceCode = 'MUON' THEN 'M' ELSE a.AttendanceCode END as AttendanceCode,
          a.WorkCredit,
          a.LateMinutes,
          a.EarlyMinutes,
          a.CheckinMethod,
          a.DeviceName,
          a.SnapshotUrl,
          a.Note
        FROM tblAttendance a
        JOIN tblEmployee e ON a.EmployeeId = e.EmployeeId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        WHERE a.AttendanceDate = @Today OR a.AttendanceDate = CAST(GETDATE() AS DATE)
        ORDER BY a.AttendanceId DESC
      `);
    return res.recordset;
  },

  async getMonthMatrix({ year = 2026, month = 4, departmentId = null }) {
    const pool = getPool();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    let empQuery = `
      SELECT e.EmployeeId, e.EmployeeCode, e.FullName, d.DepartmentName, p.PositionName
      FROM tblEmployee e
      LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
      LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
    `;
    if (departmentId) {
      empQuery += ` WHERE e.DepartmentId = ${parseInt(departmentId, 10)}`;
    }
    empQuery += ` ORDER BY e.EmployeeId ASC`;

    const empsRes = await pool.request().query(empQuery);
    const employees = empsRes.recordset;

    const attRes = await pool.request()
      .input('StartDate', sql.Date, startDate)
      .input('EndDate', sql.Date, endDate)
      .query(`
        SELECT
          AttendanceId,
          EmployeeId,
          DAY(AttendanceDate) as DayNum,
          AttendanceCode,
          WorkCredit,
          OvertimeHours,
          LateMinutes,
          EarlyMinutes,
          CONVERT(VARCHAR(8), TimeIn, 108) as TimeInStr,
          CONVERT(VARCHAR(8), TimeOut, 108) as TimeOutStr
        FROM tblAttendance
        WHERE AttendanceDate >= @StartDate AND AttendanceDate <= @EndDate
      `);

    const attRecords = attRes.recordset;

    const matrix = {};
    employees.forEach(emp => {
      matrix[emp.EmployeeId] = {
        employee: emp,
        days: {},
        totalWorkDays: 0,
        totalPaidLeave: 0,
        totalUnpaidLeave: 0,
        totalCredit: 0,
        totalOvertimeHours: 0,
        totalLateMinutes: 0
      };
    });

    attRecords.forEach(rec => {
      if (matrix[rec.EmployeeId]) {
        const credit = rec.WorkCredit !== null && rec.WorkCredit !== undefined ? Number(rec.WorkCredit) : 0;
        const c = rec.AttendanceCode === 'MUON' ? 'M' : (rec.AttendanceCode || 'X');

        matrix[rec.EmployeeId].days[rec.DayNum] = {
          code: c,
          credit: credit,
          timeIn: rec.TimeInStr,
          timeOut: rec.TimeOutStr,
          lateMinutes: rec.LateMinutes || 0,
          earlyMinutes: rec.EarlyMinutes || 0
        };

        if (c === 'X' || c === 'CT') {
          matrix[rec.EmployeeId].totalWorkDays += 1;
        } else if (c === 'M') {
          matrix[rec.EmployeeId].totalWorkDays += (credit > 0 ? 1 : 0);
        } else if (c === 'N') {
          matrix[rec.EmployeeId].totalWorkDays += 0.5;
        } else if (c === 'P' || c === 'L') {
          matrix[rec.EmployeeId].totalPaidLeave += 1;
        } else if (c === 'KP' || c === 'O') {
          matrix[rec.EmployeeId].totalUnpaidLeave += 1;
        }

        matrix[rec.EmployeeId].totalCredit += credit;
        matrix[rec.EmployeeId].totalOvertimeHours += (rec.OvertimeHours || 0);
        matrix[rec.EmployeeId].totalLateMinutes += (rec.LateMinutes || 0);
      }
    });

    return {
      year,
      month,
      daysInMonth: lastDay,
      employees,
      matrix
    };
  },

  async getEmployeeAttendance({ employeeId, userId, employeeCode, username, year, month }) {
    const pool = getPool();
    const now = new Date();
    const targetYear = parseInt(year || now.getFullYear(), 10);
    const targetMonth = parseInt(month || (now.getMonth() + 1), 10);

    let resolvedEmpId = null;

    if (employeeCode || username) {
      const code = (employeeCode || username).trim();
      const empRes = await pool.request()
        .input('Code', sql.VarChar(50), code)
        .query(`
          SELECT TOP 1 e.EmployeeId FROM tblEmployee e
          LEFT JOIN tblUser u ON e.UserId = u.UserId
          WHERE e.EmployeeCode = @Code
             OR LOWER(e.EmployeeCode) = LOWER(@Code)
             OR u.Username = @Code
             OR LOWER(u.Username) = LOWER(@Code)
             OR LOWER(e.FullName) LIKE LOWER('%' + @Code + '%')
             OR LOWER(e.Email) LIKE LOWER(@Code + '%')
        `);
      if (empRes.recordset[0]) {
        resolvedEmpId = empRes.recordset[0].EmployeeId;
      }
    }

    if (!resolvedEmpId && userId) {
      const userRes = await pool.request()
        .input('UserId', sql.Int, parseInt(userId, 10))
        .query('SELECT TOP 1 EmployeeId FROM tblEmployee WHERE UserId = @UserId');
      if (userRes.recordset[0]) {
        resolvedEmpId = userRes.recordset[0].EmployeeId;
      }
    }

    if (!resolvedEmpId && employeeId) {
      const empRes = await pool.request()
        .input('EmpId', sql.Int, parseInt(employeeId, 10))
        .query(`
          SELECT TOP 1 EmployeeId FROM tblEmployee
          WHERE EmployeeId = @EmpId OR UserId = @EmpId
        `);
      if (empRes.recordset[0]) {
        resolvedEmpId = empRes.recordset[0].EmployeeId;
      }
    }

    if (!resolvedEmpId) {
      return [];
    }

    const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const res = await pool.request()
      .input('EmployeeId', sql.Int, resolvedEmpId)
      .input('StartDate', sql.Date, startDate)
      .input('EndDate', sql.Date, endDate)
      .query(`
        SELECT
          a.AttendanceId,
          a.AttendanceDate,
          DAY(a.AttendanceDate) as DayNum,
          ISNULL(CONVERT(VARCHAR(8), a.TimeIn, 108), CONVERT(VARCHAR(8), a.TimeIn)) as TimeInStr,
          ISNULL(CONVERT(VARCHAR(8), a.TimeOut, 108), CONVERT(VARCHAR(8), a.TimeOut)) as TimeOutStr,
          CASE WHEN a.AttendanceCode = 'MUON' THEN 'M' ELSE a.AttendanceCode END as AttendanceCode,
          a.WorkCredit,
          a.LateMinutes,
          a.EarlyMinutes,
          a.CheckinMethod,
          a.DeviceName,
          a.Note
        FROM tblAttendance a
        WHERE a.EmployeeId = @EmployeeId
          AND a.AttendanceDate >= @StartDate
          AND a.AttendanceDate <= @EndDate
        ORDER BY a.AttendanceDate ASC
      `);

    return res.recordset;
  },

  async registerFaceProfile({ employeeId, employeeCode, files = [], imageBase64, imageBuffer, fileName }) {
    const pool = getPool();

    let targetEmp = null;
    if (employeeId) {
      const empRes = await pool.request()
        .input('EmployeeId', sql.Int, employeeId)
        .query('SELECT EmployeeId, EmployeeCode, FullName FROM tblEmployee WHERE EmployeeId = @EmployeeId');
      targetEmp = empRes.recordset[0];
    }

    if (!targetEmp && employeeCode) {
      const codeClean = employeeCode.trim();
      const empRes = await pool.request()
        .input('Code', sql.VarChar(50), codeClean)
        .query(`
          SELECT TOP 1 EmployeeId, EmployeeCode, FullName
          FROM tblEmployee
          WHERE EmployeeCode = @Code
             OR LOWER(EmployeeCode) = LOWER(@Code)
             OR LOWER(FullName) LIKE LOWER('%' + @Code + '%')
             OR LOWER(Email) LIKE LOWER(@Code + '%')
        `);
      targetEmp = empRes.recordset[0];
    }

    const cleanBaseCode = (targetEmp ? targetEmp.EmployeeCode : (employeeCode || 'emp'))
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toLowerCase();

    const savedFiles = [];

    if (Array.isArray(files) && files.length > 0) {
      files.forEach((f, idx) => {
        const suffix = idx === 0 ? '' : `_${idx + 1}`;
        const saveName = `${cleanBaseCode}${suffix}.jpg`;
        const uploadFilePath = path.join(facesUploadDir, saveName);
        const rootFilePath = path.join(rootFacesDir, saveName);

        if (f.buffer) {
          fs.writeFileSync(uploadFilePath, f.buffer);
          fs.writeFileSync(rootFilePath, f.buffer);
          savedFiles.push(saveName);
        }
      });
    } else if (imageBuffer) {
      const saveName = `${cleanBaseCode}.jpg`;
      const uploadFilePath = path.join(facesUploadDir, saveName);
      const rootFilePath = path.join(rootFacesDir, saveName);
      fs.writeFileSync(uploadFilePath, imageBuffer);
      fs.writeFileSync(rootFilePath, imageBuffer);
      savedFiles.push(saveName);
    } else if (imageBase64) {
      const saveName = `${cleanBaseCode}.jpg`;
      const uploadFilePath = path.join(facesUploadDir, saveName);
      const rootFilePath = path.join(rootFacesDir, saveName);
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(cleanBase64, 'base64');
      fs.writeFileSync(uploadFilePath, buf);
      fs.writeFileSync(rootFilePath, buf);
      savedFiles.push(saveName);
    }

    const frontUrl = savedFiles[0] ? `/uploads/faces/${savedFiles[0]}` : `/uploads/faces/${cleanBaseCode}.jpg`;
    const leftUrl = savedFiles[1] ? `/uploads/faces/${savedFiles[1]}` : null;
    const rightUrl = savedFiles[2] ? `/uploads/faces/${savedFiles[2]}` : null;

    if (targetEmp) {
      const existFace = await pool.request()
        .input('EmployeeId', sql.Int, targetEmp.EmployeeId)
        .query('SELECT FaceId FROM tblFaceData WHERE EmployeeId = @EmployeeId');

      if (existFace.recordset.length > 0) {
        await pool.request()
          .input('EmployeeId', sql.Int, targetEmp.EmployeeId)
          .input('FrontSnapshotUrl', sql.NVarChar(500), frontUrl)
          .input('LeftSnapshotUrl', sql.NVarChar(500), leftUrl)
          .input('RightSnapshotUrl', sql.NVarChar(500), rightUrl)
          .input('FaceVector512D', sql.NVarChar(sql.MAX), '[]')
          .query(`
            UPDATE tblFaceData
            SET FrontSnapshotUrl = @FrontSnapshotUrl,
                LeftSnapshotUrl = COALESCE(@LeftSnapshotUrl, LeftSnapshotUrl),
                RightSnapshotUrl = COALESCE(@RightSnapshotUrl, RightSnapshotUrl),
                FaceVector512D = COALESCE(FaceVector512D, @FaceVector512D),
                ConfidenceScore = 99.5,
                IsActive = 1,
                RegisteredAt = SYSDATETIME()
            WHERE EmployeeId = @EmployeeId
          `);
      } else {
        await pool.request()
          .input('EmployeeId', sql.Int, targetEmp.EmployeeId)
          .input('FrontSnapshotUrl', sql.NVarChar(500), frontUrl)
          .input('LeftSnapshotUrl', sql.NVarChar(500), leftUrl)
          .input('RightSnapshotUrl', sql.NVarChar(500), rightUrl)
          .input('FaceVector512D', sql.NVarChar(sql.MAX), '[]')
          .query(`
            INSERT INTO tblFaceData (
              EmployeeId, FrontSnapshotUrl, LeftSnapshotUrl, RightSnapshotUrl,
              FaceVector512D, ConfidenceScore, IsActive, RegisteredAt
            )
            VALUES (
              @EmployeeId, @FrontSnapshotUrl, @LeftSnapshotUrl, @RightSnapshotUrl,
              @FaceVector512D, 99.5, 1, SYSDATETIME()
            )
          `);
      }
    }

    const searchPattern = targetEmp ? targetEmp.FullName : (employeeCode || '');
    await pool.request()
      .input('SearchText', sql.NVarChar(100), searchPattern)
      .input('CleanCode', sql.NVarChar(100), cleanBaseCode)
      .input('Count', sql.Int, savedFiles.length || 1)
      .query(`
        UPDATE tblOnboarding
        SET FaceEnrolled = 1,
            FacePhotosCount = @Count
        WHERE CandidateName = @SearchText
           OR LOWER(CandidateName) LIKE LOWER('%' + @SearchText + '%')
           OR Username = @CleanCode
           OR Username = @SearchText
      `);

    return {
      success: true,
      savedCount: savedFiles.length,
      savedFiles,
      employee: targetEmp,
      frontUrl
    };
  },

  async requestFacePhoto({ onboardingId }) {
    const pool = getPool();
    await pool.request()
      .input('OnboardingId', sql.Int, onboardingId)
      .query(`
        UPDATE tblOnboarding
        SET FaceRequestSent = 1
        WHERE OnboardingId = @OnboardingId
      `);
    return { success: true, message: 'Đã gửi yêu cầu nạp ảnh Face ID thành công' };
  },

  async getPendingFaceRequest({ employeeId, username, email }) {
    const pool = getPool();
    let empId = employeeId ? parseInt(employeeId, 10) : 0;

    let targetEmp = null;
    if (empId > 0) {
      const empRes = await pool.request()
        .input('EmpId', sql.Int, empId)
        .query('SELECT TOP 1 EmployeeId, EmployeeCode, FullName FROM tblEmployee WHERE EmployeeId = @EmpId');
      targetEmp = empRes.recordset[0];
    }

    if (!targetEmp && (username || email)) {
      const codeClean = (username || email).trim();
      const empRes = await pool.request()
        .input('Code', sql.VarChar(50), codeClean)
        .query(`
          SELECT TOP 1 EmployeeId, EmployeeCode, FullName
          FROM tblEmployee
          WHERE EmployeeCode = @Code
             OR LOWER(EmployeeCode) = LOWER(@Code)
             OR LOWER(FullName) LIKE LOWER('%' + @Code + '%')
             OR LOWER(Email) LIKE LOWER(@Code + '%')
        `);
      targetEmp = empRes.recordset[0];
      if (targetEmp) {
        empId = targetEmp.EmployeeId;
      }
    }

    if (empId > 0) {
      const faceRes = await pool.request()
        .input('EmpId', sql.Int, empId)
        .query('SELECT TOP 1 FaceId, FrontSnapshotUrl FROM tblFaceData WHERE EmployeeId = @EmpId AND IsActive = 1');
      if (faceRes.recordset.length > 0) {
        return {
          hasRequest: false,
          faceEnrolled: true,
          facePhotosCount: 1,
          candidateName: targetEmp?.FullName,
          employeeId: empId
        };
      }
    }

    const checkCode = targetEmp?.EmployeeCode || username;
    if (checkCode) {
      const cleanCode = checkCode
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .toLowerCase();
      const faceFileJpg = path.join(rootFacesDir, `${cleanCode}.jpg`);
      const faceFilePng = path.join(rootFacesDir, `${cleanCode}.png`);
      if (fs.existsSync(faceFileJpg) || fs.existsSync(faceFilePng)) {
        return {
          hasRequest: false,
          faceEnrolled: true,
          facePhotosCount: 1,
          candidateName: targetEmp?.FullName,
          employeeId: empId
        };
      }
    }

    const res = await pool.request()
      .input('EmpId', sql.Int, empId)
      .input('User', sql.NVarChar(100), username || '')
      .input('Mail', sql.VarChar(100), email || '')
      .query(`
        SELECT TOP 1 OnboardingId, CandidateName, Username, FaceEnrolled, FaceRequestSent, FacePhotosCount
        FROM tblOnboarding
        WHERE (EmployeeId = @EmpId AND @EmpId > 0)
           OR (Username = @User AND @User <> '')
           OR (Email = @Mail AND @Mail <> '')
      `);
    const record = res.recordset[0];
    if (record) {
      const isEnrolled = !!record.FaceEnrolled;
      const isRequested = !!record.FaceRequestSent;
      return {
        hasRequest: !isEnrolled && isRequested,
        faceEnrolled: isEnrolled,
        faceRequestSent: isRequested,
        facePhotosCount: record.FacePhotosCount || 0,
        candidateName: record.CandidateName,
        onboardingId: record.OnboardingId
      };
    }

    return { hasRequest: false, faceEnrolled: true, facePhotosCount: 1 };
  }
};
