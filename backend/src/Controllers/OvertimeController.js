import { connectDb, sql } from '../Config/DbConfig.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';

export class OvertimeController {
  static async getMyRequests(req, res) {
    try {
      const userId = req.user.userId;
      const pool = await connectDb();

      const empRes = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT EmployeeId, FullName, ManagerId FROM tblEmployee WHERE UserId = @userId');

      if (!empRes.recordset || empRes.recordset.length === 0) {
        return sendSuccess(res, {
          requests: [],
          stats: { total: 0, pending: 0, approved: 0, rejected: 0, totalApprovedHours: 0 }
        }, 'Chưa có thông tin nhân viên liên kết.');
      }

      const emp = empRes.recordset[0];
      const request = pool.request();
      request.input('empId', sql.Int, emp.EmployeeId);

      const result = await request.query(`
        SELECT 
          r.OvertimeRequestId,
          r.RequestCode,
          r.EmployeeId,
          e.FullName as EmployeeName,
          e.EmployeeCode,
          CONVERT(varchar, r.OvertimeDate, 23) as OvertimeDate,
          CONVERT(varchar, r.StartTime, 108) as StartTime,
          CONVERT(varchar, r.EndTime, 108) as EndTime,
          r.TotalHours,
          r.OvertimeRateType,
          r.Reason,
          r.ApproverEmployeeId,
          m.FullName as ApproverName,
          r.Status,
          r.ManagerComment,
          CONVERT(varchar, r.CreatedAt, 120) as CreatedAt
        FROM tblOvertimeRequest r
        JOIN tblEmployee e ON r.EmployeeId = e.EmployeeId
        LEFT JOIN tblEmployee m ON r.ApproverEmployeeId = m.EmployeeId
        WHERE r.EmployeeId = @empId
        ORDER BY r.OvertimeDate DESC, r.OvertimeRequestId DESC
      `);

      const requests = result.recordset;
      let total = requests.length;
      let pending = 0;
      let approved = 0;
      let rejected = 0;
      let totalApprovedHours = 0;

      requests.forEach(r => {
        if (r.Status === 'PENDING') pending++;
        else if (r.Status === 'APPROVED') {
          approved++;
          totalApprovedHours += parseFloat(r.TotalHours) || 0;
        } else if (r.Status === 'REJECTED') rejected++;
      });

      return sendSuccess(res, {
        requests,
        stats: {
          total,
          pending,
          approved,
          rejected,
          totalApprovedHours: Math.round(totalApprovedHours * 10) / 10
        }
      }, 'Lấy danh sách yêu cầu tăng ca thành công!');
    } catch (error) {
      console.error('[OvertimeController.getMyRequests] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async createRequest(req, res) {
    try {
      const userId = req.user.userId;
      const { overtimeDate, startTime, endTime, totalHours, overtimeRateType, reason } = req.body;

      if (!overtimeDate || !startTime || !endTime || !reason) {
        return sendError(res, 'Vui lòng điền đầy đủ: Ngày làm thêm, Giờ bắt đầu, Giờ kết thúc và Lý do!', 400);
      }

      const pool = await connectDb();
      const empRes = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT EmployeeId, ManagerId, DepartmentId FROM tblEmployee WHERE UserId = @userId');

      if (!empRes.recordset || empRes.recordset.length === 0) {
        return sendError(res, 'Tài khoản chưa được liên kết với hồ sơ nhân sự!', 400);
      }

      const emp = empRes.recordset[0];
      let approverId = emp.ManagerId;

      if (!approverId && emp.DepartmentId) {
        const deptRes = await pool.request()
          .input('deptId', sql.Int, emp.DepartmentId)
          .query('SELECT ManagerEmployeeId FROM tblDepartment WHERE DepartmentId = @deptId');
        if (deptRes.recordset.length > 0) {
          approverId = deptRes.recordset[0].ManagerEmployeeId;
        }
      }

      const codeRes = await pool.request().query(`
        SELECT MAX(CAST(SUBSTRING(RequestCode, 3, 10) AS INT)) as maxNum 
        FROM tblOvertimeRequest 
        WHERE RequestCode LIKE 'OT%' AND ISNUMERIC(SUBSTRING(RequestCode, 3, 10)) = 1
      `);
      const nextNum = (codeRes.recordset[0]?.maxNum || 0) + 1;
      const requestCode = `OT${String(nextNum).padStart(3, '0')}`;

      let hours = parseFloat(totalHours);
      if (!hours || isNaN(hours)) {
        const startParts = startTime.split(':');
        const endParts = endTime.split(':');
        const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1] || 0);
        const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1] || 0);
        const diffMin = endMin >= startMin ? (endMin - startMin) : (24 * 60 - startMin + endMin);
        hours = Math.round((diffMin / 60) * 10) / 10;
      }

      const insReq = pool.request();
      insReq.input('code', sql.VarChar(20), requestCode);
      insReq.input('empId', sql.Int, emp.EmployeeId);
      insReq.input('date', sql.Date, overtimeDate);
      insReq.input('start', sql.VarChar(10), startTime.length === 5 ? `${startTime}:00` : startTime);
      insReq.input('end', sql.VarChar(10), endTime.length === 5 ? `${endTime}:00` : endTime);
      insReq.input('hours', sql.Decimal(4, 2), hours);
      insReq.input('rateType', sql.NVarChar(50), overtimeRateType || 'Ngày thường (150%)');
      insReq.input('reason', sql.NVarChar(500), reason.trim());
      insReq.input('approverId', sql.Int, approverId || null);

      const insResult = await insReq.query(`
        INSERT INTO tblOvertimeRequest (
          RequestCode, EmployeeId, OvertimeDate, StartTime, EndTime,
          TotalHours, OvertimeRateType, Reason, ApproverEmployeeId, Status, CreatedAt
        )
        OUTPUT INSERTED.OvertimeRequestId, INSERTED.RequestCode
        VALUES (
          @code, @empId, @date, CAST(@start AS TIME(0)), CAST(@end AS TIME(0)),
          @hours, @rateType, @reason, @approverId, 'PENDING', SYSDATETIME()
        )
      `);

      return sendSuccess(res, insResult.recordset[0], 'Đăng ký làm thêm giờ (OT) thành công!', 201);
    } catch (error) {
      console.error('[OvertimeController.createRequest] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async cancelRequest(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const pool = await connectDb();

      const empRes = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT EmployeeId FROM tblEmployee WHERE UserId = @userId');

      if (!empRes.recordset || empRes.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy hồ sơ nhân sự!', 404);
      }

      const empId = empRes.recordset[0].EmployeeId;
      const checkReq = pool.request();
      checkReq.input('id', sql.Int, parseInt(id));
      checkReq.input('empId', sql.Int, empId);

      const checkRes = await checkReq.query(`
        SELECT OvertimeRequestId, Status 
        FROM tblOvertimeRequest 
        WHERE OvertimeRequestId = @id AND EmployeeId = @empId
      `);

      if (!checkRes.recordset || checkRes.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy yêu cầu tăng ca của bạn!', 404);
      }

      if (checkRes.recordset[0].Status !== 'PENDING') {
        return sendError(res, 'Chỉ có thể hủy yêu cầu đang ở trạng thái Chờ duyệt (PENDING)!', 400);
      }

      const updReq = pool.request();
      updReq.input('id', sql.Int, parseInt(id));
      await updReq.query(`UPDATE tblOvertimeRequest SET Status = 'CANCELLED' WHERE OvertimeRequestId = @id`);

      return sendSuccess(res, { OvertimeRequestId: parseInt(id) }, 'Đã hủy yêu cầu tăng ca thành công!');
    } catch (error) {
      console.error('[OvertimeController.cancelRequest] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async getTeamRequests(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;
      const pool = await connectDb();

      let managerEmployeeId = null;
      let managerDepartmentId = null;

      const mgrQuery = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT e.EmployeeId, e.DepartmentId 
          FROM tblEmployee e 
          WHERE e.UserId = @userId
        `);

      if (mgrQuery.recordset.length > 0) {
        managerEmployeeId = mgrQuery.recordset[0].EmployeeId;
        managerDepartmentId = mgrQuery.recordset[0].DepartmentId;
      }

      const search = (req.query.search || '').trim();
      const status = (req.query.status || '').trim();

      const request = pool.request();
      let whereConditions = [];

      if (userRole === 'Manager') {
        if (!managerEmployeeId) {
          return sendSuccess(res, {
            requests: [],
            stats: { total: 0, pending: 0, approved: 0, rejected: 0, totalHours: 0 }
          }, 'Tài khoản chưa được gắn hồ sơ Trưởng nhóm.');
        }

        request.input('mgrEmpId', sql.Int, managerEmployeeId);
        request.input('mgrDeptId', sql.Int, managerDepartmentId || 0);

        whereConditions.push(`(
          e.ManagerId = @mgrEmpId
          OR (e.DepartmentId = @mgrDeptId AND e.EmployeeId != @mgrEmpId)
          OR r.ApproverEmployeeId = @mgrEmpId
          OR e.DepartmentId IN (SELECT DepartmentId FROM tblDepartment WHERE ManagerEmployeeId = @mgrEmpId)
        )`);
      } else {
        whereConditions.push('1=1');
      }

      if (search) {
        request.input('search', sql.NVarChar(100), `%${search}%`);
        whereConditions.push('(e.FullName LIKE @search OR e.EmployeeCode LIKE @search OR r.RequestCode LIKE @search OR r.Reason LIKE @search)');
      }

      if (status && status !== 'ALL' && status !== 'all') {
        request.input('status', sql.NVarChar(50), status);
        whereConditions.push('r.Status = @status');
      }

      const whereClause = whereConditions.join(' AND ');

      const queryStr = `
        SELECT 
          r.OvertimeRequestId,
          r.RequestCode,
          r.EmployeeId,
          e.FullName as EmployeeName,
          e.EmployeeCode,
          e.AvatarUrl,
          d.DepartmentName,
          p.PositionName,
          CONVERT(varchar, r.OvertimeDate, 23) as OvertimeDate,
          CONVERT(varchar, r.StartTime, 108) as StartTime,
          CONVERT(varchar, r.EndTime, 108) as EndTime,
          r.TotalHours,
          r.OvertimeRateType,
          r.Reason,
          r.ApproverEmployeeId,
          m.FullName as ApproverName,
          r.Status,
          r.ManagerComment,
          CONVERT(varchar, r.CreatedAt, 120) as CreatedAt
        FROM tblOvertimeRequest r
        JOIN tblEmployee e ON r.EmployeeId = e.EmployeeId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        LEFT JOIN tblEmployee m ON r.ApproverEmployeeId = m.EmployeeId
        WHERE ${whereClause}
        ORDER BY CASE WHEN r.Status = 'PENDING' THEN 0 ELSE 1 END, r.OvertimeDate DESC, r.OvertimeRequestId DESC
      `;

      const result = await request.query(queryStr);
      const requests = result.recordset;

      let total = requests.length;
      let pending = 0;
      let approved = 0;
      let rejected = 0;
      let totalHours = 0;

      requests.forEach(r => {
        if (r.Status === 'PENDING') pending++;
        else if (r.Status === 'APPROVED') {
          approved++;
          totalHours += parseFloat(r.TotalHours) || 0;
        } else if (r.Status === 'REJECTED') rejected++;
      });

      return sendSuccess(res, {
        requests,
        stats: {
          total,
          pending,
          approved,
          rejected,
          totalHours: Math.round(totalHours * 10) / 10
        }
      }, 'Lấy danh sách yêu cầu tăng ca nhóm thành công!');
    } catch (error) {
      console.error('[OvertimeController.getTeamRequests] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async approveRequest(req, res) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user.userId;
      const pool = await connectDb();

      const mgrRes = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT EmployeeId FROM tblEmployee WHERE UserId = @userId');
      const approverEmpId = mgrRes.recordset[0]?.EmployeeId || null;

      const updReq = pool.request();
      updReq.input('id', sql.Int, parseInt(id));
      updReq.input('approverId', sql.Int, approverEmpId);
      updReq.input('comment', sql.NVarChar(255), comment ? comment.trim() : 'Đã duyệt yêu cầu làm thêm giờ.');

      const result = await updReq.query(`
        UPDATE tblOvertimeRequest SET
          Status = 'APPROVED',
          ManagerComment = @comment,
          ApproverEmployeeId = COALESCE(@approverId, ApproverEmployeeId)
        WHERE OvertimeRequestId = @id
      `);

      return sendSuccess(res, { OvertimeRequestId: parseInt(id), Status: 'APPROVED' }, 'Phê duyệt yêu cầu tăng ca thành công!');
    } catch (error) {
      console.error('[OvertimeController.approveRequest] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async rejectRequest(req, res) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user.userId;
      const pool = await connectDb();

      const mgrRes = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT EmployeeId FROM tblEmployee WHERE UserId = @userId');
      const approverEmpId = mgrRes.recordset[0]?.EmployeeId || null;

      const updReq = pool.request();
      updReq.input('id', sql.Int, parseInt(id));
      updReq.input('approverId', sql.Int, approverEmpId);
      updReq.input('comment', sql.NVarChar(255), comment ? comment.trim() : 'Không duyệt yêu cầu tăng ca.');

      await updReq.query(`
        UPDATE tblOvertimeRequest SET
          Status = 'REJECTED',
          ManagerComment = @comment,
          ApproverEmployeeId = COALESCE(@approverId, ApproverEmployeeId)
        WHERE OvertimeRequestId = @id
      `);

      return sendSuccess(res, { OvertimeRequestId: parseInt(id), Status: 'REJECTED' }, 'Đã từ chối yêu cầu tăng ca!');
    } catch (error) {
      console.error('[OvertimeController.rejectRequest] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async getAllRequests(req, res) {
    try {
      const pool = await connectDb();
      const search = (req.query.search || '').trim();
      const status = (req.query.status || '').trim();
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId) : null;

      const request = pool.request();
      let whereConditions = ['1=1'];

      if (search) {
        request.input('search', sql.NVarChar(100), `%${search}%`);
        whereConditions.push('(e.FullName LIKE @search OR e.EmployeeCode LIKE @search OR r.RequestCode LIKE @search OR r.Reason LIKE @search)');
      }

      if (status && status !== 'ALL' && status !== 'all') {
        request.input('status', sql.NVarChar(50), status);
        whereConditions.push('r.Status = @status');
      }

      if (departmentId) {
        request.input('deptId', sql.Int, departmentId);
        whereConditions.push('e.DepartmentId = @deptId');
      }

      const whereClause = whereConditions.join(' AND ');

      const queryStr = `
        SELECT 
          r.OvertimeRequestId,
          r.RequestCode,
          r.EmployeeId,
          e.FullName as EmployeeName,
          e.EmployeeCode,
          e.AvatarUrl,
          d.DepartmentName,
          d.DepartmentId,
          p.PositionName,
          CONVERT(varchar, r.OvertimeDate, 23) as OvertimeDate,
          CONVERT(varchar, r.StartTime, 108) as StartTime,
          CONVERT(varchar, r.EndTime, 108) as EndTime,
          r.TotalHours,
          r.OvertimeRateType,
          r.Reason,
          r.ApproverEmployeeId,
          m.FullName as ApproverName,
          r.Status,
          r.ManagerComment,
          CONVERT(varchar, r.CreatedAt, 120) as CreatedAt
        FROM tblOvertimeRequest r
        JOIN tblEmployee e ON r.EmployeeId = e.EmployeeId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        LEFT JOIN tblEmployee m ON r.ApproverEmployeeId = m.EmployeeId
        WHERE ${whereClause}
        ORDER BY r.OvertimeDate DESC, r.OvertimeRequestId DESC
      `;

      const result = await request.query(queryStr);
      const requests = result.recordset;

      let total = requests.length;
      let pending = 0;
      let approved = 0;
      let rejected = 0;
      let totalApprovedHours = 0;

      requests.forEach(r => {
        if (r.Status === 'PENDING') pending++;
        else if (r.Status === 'APPROVED') {
          approved++;
          totalApprovedHours += parseFloat(r.TotalHours) || 0;
        } else if (r.Status === 'REJECTED') rejected++;
      });

      return sendSuccess(res, {
        requests,
        stats: {
          total,
          pending,
          approved,
          rejected,
          totalApprovedHours: Math.round(totalApprovedHours * 10) / 10
        }
      }, 'Lấy danh sách yêu cầu tăng ca toàn công ty thành công!');
    } catch (error) {
      console.error('[OvertimeController.getAllRequests] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }
}
