import { connectDb, sql } from '../Config/DbConfig.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';

export class OrgStructureController {
  
  static async getOrgTree(req, res) {
    try {
      const pool = await connectDb();

      const deptResult = await pool.request().query(`
        SELECT d.DepartmentId, d.DepartmentCode, d.DepartmentName,
               d.ParentDepartmentId, parent.DepartmentName AS ParentDepartmentName,
               d.ManagerEmployeeId, mgr.FullName AS ManagerName, mgr.AvatarUrl AS ManagerAvatar,
               mgrPos.PositionName AS ManagerPosition,
               d.HeadCount, d.Description,
               (SELECT COUNT(*) FROM tblEmployee e WHERE e.DepartmentId = d.DepartmentId) AS ActualEmployeeCount
        FROM tblDepartment d
        LEFT JOIN tblDepartment parent ON d.ParentDepartmentId = parent.DepartmentId
        LEFT JOIN tblEmployee mgr ON d.ManagerEmployeeId = mgr.EmployeeId
        LEFT JOIN tblPosition mgrPos ON mgr.PositionId = mgrPos.PositionId
        ORDER BY d.DepartmentId ASC
      `);

      const empResult = await pool.request().query(`
        SELECT e.EmployeeId, e.EmployeeCode, e.FullName, e.DepartmentId, e.PositionId,
               p.PositionName, e.Email, e.Phone, e.WorkStatus, e.AvatarUrl
        FROM tblEmployee e
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        ORDER BY e.FullName ASC
      `);

      const posCountResult = await pool.request().query(`SELECT COUNT(*) AS totalPositions FROM tblPosition`);
      const totalEmployees = empResult.recordset.length;
      const totalDepartments = deptResult.recordset.length;
      const totalPositions = posCountResult.recordset[0]?.totalPositions || 0;

      const empByDept = {};
      for (const emp of empResult.recordset) {
        if (!empByDept[emp.DepartmentId]) {
          empByDept[emp.DepartmentId] = [];
        }
        empByDept[emp.DepartmentId].push(emp);
      }

      const deptMap = {};
      deptResult.recordset.forEach(d => {
        deptMap[d.DepartmentId] = {
          ...d,
          employees: empByDept[d.DepartmentId] || [],
          children: []
        };
      });

      const tree = [];
      deptResult.recordset.forEach(d => {
        const current = deptMap[d.DepartmentId];
        if (d.ParentDepartmentId && deptMap[d.ParentDepartmentId]) {
          deptMap[d.ParentDepartmentId].children.push(current);
        } else {
          tree.push(current);
        }
      });

      return sendSuccess(res, {
        tree,
        departments: deptResult.recordset,
        stats: {
          totalDepartments,
          totalPositions,
          totalEmployees
        }
      }, 'Lấy sơ đồ cơ cấu tổ chức thành công!');
    } catch (error) {
      console.error('Lỗi getOrgTree:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async getDepartments(req, res) {
    try {
      const pool = await connectDb();
      const result = await pool.request().query(`
        SELECT d.DepartmentId, d.DepartmentCode, d.DepartmentName,
               d.ParentDepartmentId, parent.DepartmentName AS ParentDepartmentName,
               d.ManagerEmployeeId, mgr.FullName AS ManagerName,
               d.HeadCount, d.Description,
               (SELECT COUNT(*) FROM tblEmployee e WHERE e.DepartmentId = d.DepartmentId) AS ActualEmployeeCount
        FROM tblDepartment d
        LEFT JOIN tblDepartment parent ON d.ParentDepartmentId = parent.DepartmentId
        LEFT JOIN tblEmployee mgr ON d.ManagerEmployeeId = mgr.EmployeeId
        ORDER BY d.DepartmentId ASC
      `);
      return sendSuccess(res, result.recordset, 'Lấy danh sách phòng ban thành công!');
    } catch (error) {
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async createDepartment(req, res) {
    try {
      const { departmentCode, departmentName, parentDepartmentId, managerEmployeeId, headCount, description } = req.body;

      if (!departmentCode || !departmentName) {
        return sendError(res, 'Mã phòng ban và Tên phòng ban là bắt buộc!', 400);
      }

      const pool = await connectDb();

      const checkCode = await pool.request()
        .input('code', sql.VarChar(20), departmentCode.trim())
        .query(`SELECT DepartmentId FROM tblDepartment WHERE DepartmentCode = @code`);
      if (checkCode.recordset.length > 0) {
        return sendError(res, `Mã phòng ban '${departmentCode}' đã tồn tại! Vui lòng chọn mã khác.`, 400);
      }

      const parentId = parentDepartmentId ? parseInt(parentDepartmentId, 10) : null;
      const mgrId = managerEmployeeId ? parseInt(managerEmployeeId, 10) : null;
      const hCount = headCount ? parseInt(headCount, 10) : 0;

      const result = await pool.request()
        .input('code', sql.VarChar(20), departmentCode.trim().toUpperCase())
        .input('name', sql.NVarChar(100), departmentName.trim())
        .input('parentId', sql.Int, parentId)
        .input('mgrId', sql.Int, mgrId)
        .input('headCount', sql.Int, hCount)
        .input('description', sql.NVarChar(255), description || '')
        .query(`
          INSERT INTO tblDepartment (DepartmentCode, DepartmentName, ParentDepartmentId, ManagerEmployeeId, HeadCount, Description)
          OUTPUT INSERTED.*
          VALUES (@code, @name, @parentId, @mgrId, @headCount, @description)
        `);

      return sendSuccess(res, result.recordset[0], 'Tạo phòng ban mới thành công!', 201);
    } catch (error) {
      console.error('Lỗi createDepartment:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async updateDepartment(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { departmentCode, departmentName, parentDepartmentId, managerEmployeeId, headCount, description } = req.body;

      if (!id || isNaN(id)) {
        return sendError(res, 'ID phòng ban không hợp lệ!', 400);
      }
      if (!departmentCode || !departmentName) {
        return sendError(res, 'Mã phòng ban và Tên phòng ban là bắt buộc!', 400);
      }

      const parentId = parentDepartmentId ? parseInt(parentDepartmentId, 10) : null;
      if (parentId === id) {
        return sendError(res, 'Phòng ban không thể chọn chính mình làm phòng ban cấp trên!', 400);
      }

      const pool = await connectDb();

      const checkCode = await pool.request()
        .input('id', sql.Int, id)
        .input('code', sql.VarChar(20), departmentCode.trim())
        .query(`SELECT DepartmentId FROM tblDepartment WHERE DepartmentCode = @code AND DepartmentId <> @id`);
      if (checkCode.recordset.length > 0) {
        return sendError(res, `Mã phòng ban '${departmentCode}' đã được sử dụng bởi phòng ban khác!`, 400);
      }

      const mgrId = managerEmployeeId ? parseInt(managerEmployeeId, 10) : null;
      const hCount = headCount ? parseInt(headCount, 10) : 0;

      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('code', sql.VarChar(20), departmentCode.trim().toUpperCase())
        .input('name', sql.NVarChar(100), departmentName.trim())
        .input('parentId', sql.Int, parentId)
        .input('mgrId', sql.Int, mgrId)
        .input('headCount', sql.Int, hCount)
        .input('description', sql.NVarChar(255), description || '')
        .query(`
          UPDATE tblDepartment
          SET DepartmentCode = @code,
              DepartmentName = @name,
              ParentDepartmentId = @parentId,
              ManagerEmployeeId = @mgrId,
              HeadCount = @headCount,
              Description = @description
          OUTPUT INSERTED.*
          WHERE DepartmentId = @id
        `);

      if (result.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy phòng ban cần cập nhật!', 404);
      }

      return sendSuccess(res, result.recordset[0], 'Cập nhật phòng ban thành công!');
    } catch (error) {
      console.error('Lỗi updateDepartment:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async deleteDepartment(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id || isNaN(id)) {
        return sendError(res, 'ID phòng ban không hợp lệ!', 400);
      }

      const pool = await connectDb();

      const checkChildren = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT COUNT(*) AS cnt FROM tblDepartment WHERE ParentDepartmentId = @id`);
      if (checkChildren.recordset[0]?.cnt > 0) {
        return sendError(res, `Không thể xóa vì phòng ban này đang có ${checkChildren.recordset[0].cnt} phòng ban con trực thuộc! Hãy chuyển các phòng ban con trước.`, 400);
      }

      const checkEmployees = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT COUNT(*) AS cnt FROM tblEmployee WHERE DepartmentId = @id`);
      if (checkEmployees.recordset[0]?.cnt > 0) {
        return sendError(res, `Không thể xóa vì phòng ban này đang có ${checkEmployees.recordset[0].cnt} nhân viên trực thuộc! Hãy điều chuyển nhân viên sang phòng ban khác trước.`, 400);
      }

      const checkOnboarding = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT COUNT(*) AS cnt FROM tblOnboarding WHERE DepartmentId = @id`);
      if (checkOnboarding.recordset[0]?.cnt > 0) {
        return sendError(res, `Không thể xóa vì phòng ban này có liên kết với ${checkOnboarding.recordset[0].cnt} hồ sơ tiếp nhận Onboarding!`, 400);
      }

      const checkJobs = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT COUNT(*) AS cnt FROM tblRecruitmentJob WHERE DepartmentId = @id`);
      if (checkJobs.recordset[0]?.cnt > 0) {
        return sendError(res, `Không thể xóa vì phòng ban này đang có ${checkJobs.recordset[0].cnt} tin tuyển dụng liên kết!`, 400);
      }

      await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM tblDepartment WHERE DepartmentId = @id`);

      return sendSuccess(res, { departmentId: id }, 'Xóa phòng ban thành công!');
    } catch (error) {
      console.error('Lỗi deleteDepartment:', error);
      return sendError(res, error.message, 500, error);
    }
  }


  
  static async getPositions(req, res) {
    try {
      const pool = await connectDb();
      const result = await pool.request().query(`
        SELECT p.PositionId, p.PositionCode, p.PositionName,
               p.BaseSalaryMin, p.BaseSalaryMax,
               (SELECT COUNT(*) FROM tblEmployee e WHERE e.PositionId = p.PositionId) AS EmployeeCount
        FROM tblPosition p
        ORDER BY p.PositionId ASC
      `);
      return sendSuccess(res, result.recordset, 'Lấy danh mục chức vụ thành công!');
    } catch (error) {
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async createPosition(req, res) {
    try {
      const { positionCode, positionName, baseSalaryMin, baseSalaryMax } = req.body;

      if (!positionCode || !positionName) {
        return sendError(res, 'Mã chức vụ và Tên chức vụ là bắt buộc!', 400);
      }

      const pool = await connectDb();

      const checkCode = await pool.request()
        .input('code', sql.VarChar(20), positionCode.trim())
        .query(`SELECT PositionId FROM tblPosition WHERE PositionCode = @code`);
      if (checkCode.recordset.length > 0) {
        return sendError(res, `Mã chức vụ '${positionCode}' đã tồn tại! Vui lòng chọn mã khác.`, 400);
      }

      const minSal = baseSalaryMin ? parseFloat(baseSalaryMin) : 0;
      const maxSal = baseSalaryMax ? parseFloat(baseSalaryMax) : 0;

      const result = await pool.request()
        .input('code', sql.VarChar(20), positionCode.trim().toUpperCase())
        .input('name', sql.NVarChar(100), positionName.trim())
        .input('minSal', sql.Decimal(18, 2), minSal)
        .input('maxSal', sql.Decimal(18, 2), maxSal)
        .query(`
          INSERT INTO tblPosition (PositionCode, PositionName, BaseSalaryMin, BaseSalaryMax)
          OUTPUT INSERTED.*
          VALUES (@code, @name, @minSal, @maxSal)
        `);

      return sendSuccess(res, result.recordset[0], 'Thêm chức vụ mới thành công!', 201);
    } catch (error) {
      console.error('Lỗi createPosition:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async updatePosition(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { positionCode, positionName, baseSalaryMin, baseSalaryMax } = req.body;

      if (!id || isNaN(id)) {
        return sendError(res, 'ID chức vụ không hợp lệ!', 400);
      }
      if (!positionCode || !positionName) {
        return sendError(res, 'Mã chức vụ và Tên chức vụ là bắt buộc!', 400);
      }

      const pool = await connectDb();

      const checkCode = await pool.request()
        .input('id', sql.Int, id)
        .input('code', sql.VarChar(20), positionCode.trim())
        .query(`SELECT PositionId FROM tblPosition WHERE PositionCode = @code AND PositionId <> @id`);
      if (checkCode.recordset.length > 0) {
        return sendError(res, `Mã chức vụ '${positionCode}' đã được sử dụng bởi chức vụ khác!`, 400);
      }

      const minSal = baseSalaryMin ? parseFloat(baseSalaryMin) : 0;
      const maxSal = baseSalaryMax ? parseFloat(baseSalaryMax) : 0;

      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('code', sql.VarChar(20), positionCode.trim().toUpperCase())
        .input('name', sql.NVarChar(100), positionName.trim())
        .input('minSal', sql.Decimal(18, 2), minSal)
        .input('maxSal', sql.Decimal(18, 2), maxSal)
        .query(`
          UPDATE tblPosition
          SET PositionCode = @code,
              PositionName = @name,
              BaseSalaryMin = @minSal,
              BaseSalaryMax = @maxSal
          OUTPUT INSERTED.*
          WHERE PositionId = @id
        `);

      if (result.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy chức vụ cần cập nhật!', 404);
      }

      return sendSuccess(res, result.recordset[0], 'Cập nhật chức vụ thành công!');
    } catch (error) {
      console.error('Lỗi updatePosition:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async deletePosition(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id || isNaN(id)) {
        return sendError(res, 'ID chức vụ không hợp lệ!', 400);
      }

      const pool = await connectDb();

      const checkEmp = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT COUNT(*) AS cnt FROM tblEmployee WHERE PositionId = @id`);
      if (checkEmp.recordset[0]?.cnt > 0) {
        return sendError(res, `Không thể xóa vì đang có ${checkEmp.recordset[0].cnt} nhân viên giữ chức vụ này! Vui lòng điều chuyển chức vụ của nhân viên trước.`, 400);
      }

      await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM tblPosition WHERE PositionId = @id`);

      return sendSuccess(res, { positionId: id }, 'Xóa chức vụ thành công!');
    } catch (error) {
      console.error('Lỗi deletePosition:', error);
      return sendError(res, error.message, 500, error);
    }
  }


  
  static async getEmployees(req, res) {
    try {
      const pool = await connectDb();
      const result = await pool.request().query(`
        SELECT e.EmployeeId, e.EmployeeCode, e.FullName,
               e.DepartmentId, d.DepartmentName, d.DepartmentCode,
               e.PositionId, p.PositionName, p.PositionCode,
               e.Email, e.Phone, e.WorkStatus, e.AvatarUrl,
               CONVERT(varchar, e.JoinDate, 103) AS JoinDate
        FROM tblEmployee e
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        ORDER BY e.FullName ASC
      `);
      return sendSuccess(res, result.recordset, 'Lấy danh sách nhân sự thành công!');
    } catch (error) {
      return sendError(res, error.message, 500, error);
    }
  }

  
  static mapPositionToRole(posCode, posName, deptCode, deptName) {
    const code = (posCode || '').toUpperCase();
    const name = (posName || '').toLowerCase();
    const dCode = (deptCode || '').toUpperCase();
    const dName = (deptName || '').toLowerCase();

    if (code.includes('HR') || dCode === 'HR' || name.includes('nhân sự') || dName.includes('nhân sự')) {
      return 'HR';
    }

    if (code.includes('FIN') || code.includes('PAYROLL') || dCode === 'FIN' || name.includes('kế toán') || name.includes('tài chính') || dName.includes('tài chính')) {
      return 'Finance';
    }

    if (
      code === 'CEO' || code.includes('LEAD') || code.includes('MGR') || code.includes('DIR') ||
      name.includes('trưởng') || name.includes('quản lý') || name.includes('giám đốc') ||
      name.includes('lead') || name.includes('leader') || name.includes('chủ tịch')
    ) {
      return 'Manager';
    }

    return 'Employee';
  }

  
  static async syncAllUserRoles(req, res) {
    try {
      const pool = await connectDb();

      const empList = await pool.request().query(`
        SELECT e.EmployeeId, e.UserId, e.FullName,
               p.PositionCode, p.PositionName,
               d.DepartmentCode, d.DepartmentName,
               u.RoleId, r.RoleCode AS CurrentRoleCode
        FROM tblEmployee e
        JOIN tblUser u ON e.UserId = u.UserId
        JOIN tblRole r ON u.RoleId = r.RoleId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        WHERE e.UserId IS NOT NULL
      `);

      let updatedCount = 0;
      const syncDetails = [];

      for (const emp of empList.recordset) {
        if (emp.CurrentRoleCode === 'Admin') continue;

        const targetRole = OrgStructureController.mapPositionToRole(
          emp.PositionCode,
          emp.PositionName,
          emp.DepartmentCode,
          emp.DepartmentName
        );

        if (targetRole !== emp.CurrentRoleCode) {
          const roleRes = await pool.request()
            .input('code', sql.VarChar(20), targetRole)
            .query(`SELECT RoleId FROM tblRole WHERE RoleCode = @code`);
          const targetRoleId = roleRes.recordset[0]?.RoleId;

          if (targetRoleId) {
            await pool.request()
              .input('userId', sql.Int, emp.UserId)
              .input('roleId', sql.Int, targetRoleId)
              .query(`UPDATE tblUser SET RoleId = @roleId WHERE UserId = @userId`);

            updatedCount++;
            syncDetails.push({
              employee: emp.FullName,
              position: emp.PositionName,
              oldRole: emp.CurrentRoleCode,
              newRole: targetRole
            });
          }
        }
      }

      return sendSuccess(res, { updatedCount, syncDetails }, `Đã đồng bộ thành công ${updatedCount} tài khoản theo đúng chức vụ thực tế!`);
    } catch (error) {
      console.error('Lỗi syncAllUserRoles:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async assignEmployee(req, res) {
    try {
      const employeeId = parseInt(req.params.id, 10);
      const { targetDepartmentId, targetPositionId, note, decisionNumber } = req.body;

      if (!employeeId || isNaN(employeeId)) {
        return sendError(res, 'ID nhân viên không hợp lệ!', 400);
      }
      if (!targetDepartmentId) {
        return sendError(res, 'Vui lòng chọn phòng ban muốn gán/chuyển tới!', 400);
      }

      const pool = await connectDb();

      const currentEmp = await pool.request()
        .input('empId', sql.Int, employeeId)
        .query(`
          SELECT e.EmployeeId, e.FullName, e.DepartmentId, d.DepartmentName AS OldDepartment,
                 e.PositionId, p.PositionName AS OldPosition, e.UserId
          FROM tblEmployee e
          LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
          LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
          WHERE e.EmployeeId = @empId
        `);

      if (currentEmp.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy nhân viên trong hệ thống!', 404);
      }

      const empData = currentEmp.recordset[0];
      const deptId = parseInt(targetDepartmentId, 10);
      const posId = targetPositionId ? parseInt(targetPositionId, 10) : empData.PositionId;

      const newDeptRes = await pool.request()
        .input('deptId', sql.Int, deptId)
        .query(`SELECT DepartmentName, DepartmentCode FROM tblDepartment WHERE DepartmentId = @deptId`);
      const newDeptName = newDeptRes.recordset[0]?.DepartmentName || 'Phòng ban mới';
      const newDeptCode = newDeptRes.recordset[0]?.DepartmentCode || '';

      const newPosRes = await pool.request()
        .input('posId', sql.Int, posId)
        .query(`SELECT PositionName, PositionCode FROM tblPosition WHERE PositionId = @posId`);
      const newPosName = newPosRes.recordset[0]?.PositionName || empData.OldPosition || 'Chức vụ mới';
      const newPosCode = newPosRes.recordset[0]?.PositionCode || '';

      await pool.request()
        .input('empId', sql.Int, employeeId)
        .input('deptId', sql.Int, deptId)
        .input('posId', sql.Int, posId)
        .query(`
          UPDATE tblEmployee
          SET DepartmentId = @deptId,
              PositionId = @posId,
              UpdatedAt = SYSDATETIME()
          WHERE EmployeeId = @empId
        `);

      if (empData.DepartmentId !== deptId || empData.PositionId !== posId) {
        await pool.request()
          .input('empId', sql.Int, employeeId)
          .input('eventName', sql.NVarChar(100), 'Điều chuyển cơ cấu tổ chức')
          .input('oldPos', sql.NVarChar(100), empData.OldPosition || '')
          .input('newPos', sql.NVarChar(100), newPosName)
          .input('oldDept', sql.NVarChar(100), empData.OldDepartment || '')
          .input('newDept', sql.NVarChar(100), newDeptName)
          .input('decNum', sql.NVarChar(50), decisionNumber || `QĐ-${Date.now().toString().slice(-6)}`)
          .input('note', sql.NVarChar(255), note || 'Điều chuyển phòng ban theo cơ cấu tổ chức')
          .query(`
            INSERT INTO tblCareerHistory (EmployeeId, EventDate, EventName, OldPosition, NewPosition, OldDepartment, NewDepartment, DecisionNumber, Note)
            VALUES (@empId, CAST(GETDATE() AS DATE), @eventName, @oldPos, @newPos, @oldDept, @newDept, @decNum, @note)
          `);
      }

      let syncedRoleCode = null;
      if (empData.UserId) {
        const userRes = await pool.request()
          .input('userId', sql.Int, empData.UserId)
          .query(`
            SELECT u.UserId, u.RoleId, r.RoleCode
            FROM tblUser u
            JOIN tblRole r ON u.RoleId = r.RoleId
            WHERE u.UserId = @userId
          `);

        const currentUser = userRes.recordset[0];
        if (currentUser && currentUser.RoleCode !== 'Admin') {
          const targetRole = OrgStructureController.mapPositionToRole(newPosCode, newPosName, newDeptCode, newDeptName);
          const targetRoleRes = await pool.request()
            .input('roleCode', sql.VarChar(20), targetRole)
            .query(`SELECT RoleId FROM tblRole WHERE RoleCode = @roleCode`);

          const newRoleId = targetRoleRes.recordset[0]?.RoleId;
          if (newRoleId && newRoleId !== currentUser.RoleId) {
            await pool.request()
              .input('userId', sql.Int, empData.UserId)
              .input('roleId', sql.Int, newRoleId)
              .query(`UPDATE tblUser SET RoleId = @roleId WHERE UserId = @userId`);
            syncedRoleCode = targetRole;
            console.log(`[Auto-Sync Role] Đã tự động cập nhật phân quyền tài khoản (UserId: ${empData.UserId}) sang vai trò: ${targetRole}`);
          }
        }
      }

      return sendSuccess(res, {
        employeeId,
        newDepartmentId: deptId,
        newDepartmentName: newDeptName,
        newPositionId: posId,
        newPositionName: newPosName,
        syncedRoleCode
      }, `Đã chuyển nhân viên ${empData.FullName} sang ${newDeptName}${syncedRoleCode ? ` và tự động cập nhật phân quyền sang vai trò ${syncedRoleCode}` : ''} thành công!`);
    } catch (error) {
      console.error('Lỗi assignEmployee:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async batchTransferEmployees(req, res) {
    try {
      const { employeeIds, targetDepartmentId, targetPositionId, note, decisionNumber } = req.body;

      if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
        return sendError(res, 'Vui lòng chọn ít nhất một nhân viên để điều chuyển!', 400);
      }
      if (!targetDepartmentId) {
        return sendError(res, 'Vui lòng chọn phòng ban đích!', 400);
      }

      const pool = await connectDb();
      const deptId = parseInt(targetDepartmentId, 10);

      const newDeptRes = await pool.request()
        .input('deptId', sql.Int, deptId)
        .query(`SELECT DepartmentName, DepartmentCode FROM tblDepartment WHERE DepartmentId = @deptId`);
      const newDeptName = newDeptRes.recordset[0]?.DepartmentName || 'Phòng ban mới';
      const newDeptCode = newDeptRes.recordset[0]?.DepartmentCode || '';

      let newPosCode = '';
      let newPosName = '';
      if (targetPositionId) {
        const pRes = await pool.request()
          .input('posId', sql.Int, parseInt(targetPositionId, 10))
          .query(`SELECT PositionCode, PositionName FROM tblPosition WHERE PositionId = @posId`);
        newPosCode = pRes.recordset[0]?.PositionCode || '';
        newPosName = pRes.recordset[0]?.PositionName || '';
      }

      let transferredCount = 0;
      for (const empId of employeeIds) {
        const id = parseInt(empId, 10);
        if (!id) continue;

        if (targetPositionId) {
          const posId = parseInt(targetPositionId, 10);
          await pool.request()
            .input('empId', sql.Int, id)
            .input('deptId', sql.Int, deptId)
            .input('posId', sql.Int, posId)
            .query(`UPDATE tblEmployee SET DepartmentId = @deptId, PositionId = @posId, UpdatedAt = SYSDATETIME() WHERE EmployeeId = @empId`);
        } else {
          await pool.request()
            .input('empId', sql.Int, id)
            .input('deptId', sql.Int, deptId)
            .query(`UPDATE tblEmployee SET DepartmentId = @deptId, UpdatedAt = SYSDATETIME() WHERE EmployeeId = @empId`);
        }

        const empInfo = await pool.request()
          .input('empId', sql.Int, id)
          .query(`SELECT UserId, PositionId FROM tblEmployee WHERE EmployeeId = @empId`);
        const uId = empInfo.recordset[0]?.UserId;
        const curPosId = targetPositionId ? parseInt(targetPositionId, 10) : empInfo.recordset[0]?.PositionId;

        if (uId && curPosId) {
          const posData = await pool.request()
            .input('posId', sql.Int, curPosId)
            .query(`SELECT PositionCode, PositionName FROM tblPosition WHERE PositionId = @posId`);
          const targetRole = OrgStructureController.mapPositionToRole(
            posData.recordset[0]?.PositionCode || newPosCode,
            posData.recordset[0]?.PositionName || newPosName,
            newDeptCode,
            newDeptName
          );

          const rRes = await pool.request()
            .input('rc', sql.VarChar(20), targetRole)
            .query(`SELECT RoleId FROM tblRole WHERE RoleCode = @rc`);
          const targetRoleId = rRes.recordset[0]?.RoleId;

          if (targetRoleId) {
            await pool.request()
              .input('userId', sql.Int, uId)
              .input('roleId', sql.Int, targetRoleId)
              .query(`
                UPDATE tblUser
                SET RoleId = @roleId
                WHERE UserId = @userId AND RoleId <> 1
              `);
          }
        }

        transferredCount++;
      }

      return sendSuccess(res, { transferredCount, newDepartmentName: newDeptName }, `Đã chuyển thành công ${transferredCount} nhân sự sang phòng ban ${newDeptName} và tự động đồng bộ phân quyền!`);
    } catch (error) {
      console.error('Lỗi batchTransferEmployees:', error);
      return sendError(res, error.message, 500, error);
    }
  }
}
