import { connectDb, sql } from '../../Config/DbConfig.js';
import { sendSuccess, sendError } from '../../Utils/ResponseHelper.js';

export class EmployeeController {

  static async getUnassignedUsers(req, res) {
    try {
      const pool = await connectDb();
      const result = await pool.request().query(`
        SELECT u.UserId, u.Username, u.Email, u.FullName, u.Phone, u.CreatedAt
        FROM tblUser u
        JOIN tblRole r ON u.RoleId = r.RoleId
        LEFT JOIN tblEmployee e ON u.UserId = e.UserId
        WHERE r.RoleCode = 'Employee' AND (e.EmployeeId IS NULL OR e.DepartmentId IS NULL)
        ORDER BY u.UserId DESC
      `);
      return sendSuccess(res, result.recordset, 'Lấy danh sách tài khoản chờ tiếp nhận thành công!');
    } catch (error) {
      console.error('[EmployeeController.getUnassignedUsers] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async getEmployees(req, res) {
    try {
      const pool = await connectDb();
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = (req.query.search || req.query.q || '').trim();
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId) : null;
      const workStatus = (req.query.workStatus || '').trim();
      const offset = (page - 1) * limit;

      let whereConditions = ['1=1'];
      const request = pool.request();

      if (search) {
        request.input('search', sql.NVarChar(100), `%${search}%`);
        whereConditions.push('(e.FullName LIKE @search OR e.EmployeeCode LIKE @search OR e.Phone LIKE @search OR e.Email LIKE @search)');
      }

      if (departmentId) {
        request.input('deptId', sql.Int, departmentId);
        whereConditions.push('e.DepartmentId = @deptId');
      }

      if (workStatus && workStatus !== 'all' && workStatus !== 'Tất cả trạng thái') {
        request.input('workStatus', sql.NVarChar(50), workStatus);
        whereConditions.push('e.WorkStatus = @workStatus');
      }

      const whereClause = whereConditions.join(' AND ');

      
      const countResult = await request.query(`
        SELECT COUNT(*) as total
        FROM tblEmployee e
        WHERE ${whereClause}
      `);
      const total = countResult.recordset[0].total;

      
      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, limit);

      const dataResult = await request.query(`
        SELECT 
          e.EmployeeId,
          e.EmployeeCode,
          e.FullName,
          e.Gender,
          CONVERT(varchar, e.BirthDate, 23) as BirthDate,
          e.Phone,
          e.Email,
          e.Address,
          e.IdCardNumber,
          CONVERT(varchar, e.IdCardDate, 23) as IdCardDate,
          e.IdCardPlace,
          e.TaxCode,
          e.InsuranceBookNumber,
          e.BankName,
          e.BankAccountNumber,
          e.DependentsCount,
          e.DepartmentId,
          d.DepartmentName,
          d.DepartmentCode,
          e.PositionId,
          p.PositionName,
          p.PositionCode,
          e.ManagerId,
          m.FullName as ManagerName,
          e.UserId,
          u.Username,
          CONVERT(varchar, e.JoinDate, 23) as JoinDate,
          e.WorkStatus,
          e.BaseSalary,
          e.InsuranceSalary,
          e.FaceRegistered,
          e.AvatarUrl,
          e.CreatedAt,
          e.UpdatedAt
        FROM tblEmployee e
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        LEFT JOIN tblEmployee m ON e.ManagerId = m.EmployeeId
        LEFT JOIN tblUser u ON e.UserId = u.UserId
        WHERE ${whereClause}
        ORDER BY e.EmployeeId DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

      return sendSuccess(res, {
        employees: dataResult.recordset,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1
        }
      }, 'Lấy danh sách nhân viên thành công!');
    } catch (error) {
      console.error('[EmployeeController.getEmployees] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      const pool = await connectDb();
      const request = pool.request();

      const isNumeric = /^\d+$/.test(id);
      let queryWhere = '';
      if (isNumeric) {
        request.input('id', sql.Int, parseInt(id));
        queryWhere = 'e.EmployeeId = @id';
      } else {
        request.input('code', sql.VarChar(20), id);
        queryWhere = 'e.EmployeeCode = @code';
      }

      const empResult = await request.query(`
        SELECT 
          e.EmployeeId,
          e.EmployeeCode,
          e.FullName,
          e.Gender,
          CONVERT(varchar, e.BirthDate, 23) as BirthDate,
          e.Phone,
          e.Email,
          e.Address,
          e.IdCardNumber,
          CONVERT(varchar, e.IdCardDate, 23) as IdCardDate,
          e.IdCardPlace,
          e.TaxCode,
          e.InsuranceBookNumber,
          e.BankName,
          e.BankAccountNumber,
          e.DependentsCount,
          e.DepartmentId,
          d.DepartmentName,
          d.DepartmentCode,
          e.PositionId,
          p.PositionName,
          p.PositionCode,
          e.ManagerId,
          m.FullName as ManagerName,
          e.UserId,
          u.Username,
          u.Email as UserEmail,
          u.IsLocked as UserIsLocked,
          u.TwoFactorEnabled,
          CONVERT(varchar, u.LastLoginAt, 120) as LastLoginAt,
          CONVERT(varchar, e.JoinDate, 23) as JoinDate,
          e.WorkStatus,
          e.BaseSalary,
          e.InsuranceSalary,
          e.FaceRegistered,
          e.AvatarUrl,
          e.CreatedAt,
          e.UpdatedAt
        FROM tblEmployee e
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        LEFT JOIN tblEmployee m ON e.ManagerId = m.EmployeeId
        LEFT JOIN tblUser u ON e.UserId = u.UserId
        WHERE ${queryWhere}
      `);

      if (!empResult.recordset || empResult.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy thông tin nhân viên!', 404);
      }

      const employee = empResult.recordset[0];

      
      const contractReq = pool.request();
      contractReq.input('employeeId', sql.Int, employee.EmployeeId);
      const contractResult = await contractReq.query(`
        SELECT 
          ContractId,
          ContractNumber,
          EmployeeId,
          ContractType,
          CONVERT(varchar, SignDate, 23) as SignDate,
          CONVERT(varchar, StartDate, 23) as StartDate,
          CONVERT(varchar, EndDate, 23) as EndDate,
          AgreedSalary,
          Status,
          ContractFileUrl,
          CreatedAt
        FROM tblContract
        WHERE EmployeeId = @employeeId
        ORDER BY StartDate DESC
      `);

      return sendSuccess(res, {
        ...employee,
        contracts: contractResult.recordset || []
      }, 'Lấy thông tin chi tiết hồ sơ 360° nhân viên thành công!');
    } catch (error) {
      console.error('[EmployeeController.getEmployeeById] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async createEmployee(req, res) {
    try {
      const pool = await connectDb();
      const body = req.body;

      if (!body.FullName || !body.FullName.trim()) {
        return sendError(res, 'Họ và tên nhân viên là bắt buộc!', 400);
      }

      let employeeCode = (body.EmployeeCode || '').trim();
      if (!employeeCode) {
        const maxRes = await pool.request().query(`
          SELECT MAX(CAST(SUBSTRING(EmployeeCode, 3, 10) AS INT)) as maxNum 
          FROM tblEmployee 
          WHERE EmployeeCode LIKE 'NV%' AND ISNUMERIC(SUBSTRING(EmployeeCode, 3, 10)) = 1
        `);
        const nextNum = (maxRes.recordset[0]?.maxNum || 0) + 1;
        employeeCode = `NV${String(nextNum).padStart(3, '0')}`;
      } else {
        const checkCode = await pool.request()
          .input('code', sql.VarChar(20), employeeCode)
          .query('SELECT EmployeeId FROM tblEmployee WHERE EmployeeCode = @code');
        if (checkCode.recordset.length > 0) {
          return sendError(res, `Mã nhân viên "${employeeCode}" đã tồn tại trong hệ thống!`, 400);
        }
      }

      const userId = body.UserId ? parseInt(body.UserId) : null;
      let existingEmpId = null;
      if (userId) {
        const checkUserEmp = await pool.request()
          .input('checkUserId', sql.Int, userId)
          .query('SELECT EmployeeId FROM tblEmployee WHERE UserId = @checkUserId');
        if (checkUserEmp.recordset.length > 0) {
          existingEmpId = checkUserEmp.recordset[0].EmployeeId;
        }
      }

      const request = pool.request();
      request.input('EmployeeCode', sql.VarChar(20), employeeCode);
      request.input('FullName', sql.NVarChar(100), body.FullName.trim());
      request.input('Gender', sql.NVarChar(10), body.Gender || 'Nam');
      request.input('BirthDate', sql.Date, body.BirthDate || null);
      request.input('Phone', sql.VarChar(20), body.Phone || null);
      request.input('Email', sql.VarChar(100), body.Email || null);
      request.input('Address', sql.NVarChar(255), body.Address || null);
      request.input('IdCardNumber', sql.VarChar(20), body.IdCardNumber || null);
      request.input('IdCardDate', sql.Date, body.IdCardDate || null);
      request.input('IdCardPlace', sql.NVarChar(100), body.IdCardPlace || null);
      request.input('TaxCode', sql.VarChar(20), body.TaxCode || null);
      request.input('InsuranceBookNumber', sql.VarChar(20), body.InsuranceBookNumber || null);
      request.input('BankName', sql.NVarChar(100), body.BankName || null);
      request.input('BankAccountNumber', sql.VarChar(30), body.BankAccountNumber || null);
      request.input('DependentsCount', sql.Int, parseInt(body.DependentsCount) || 0);
      request.input('DepartmentId', sql.Int, body.DepartmentId ? parseInt(body.DepartmentId) : null);
      request.input('PositionId', sql.Int, body.PositionId ? parseInt(body.PositionId) : null);
      request.input('ManagerId', sql.Int, body.ManagerId ? parseInt(body.ManagerId) : null);
      request.input('UserId', sql.Int, userId);
      request.input('JoinDate', sql.Date, body.JoinDate || new Date().toISOString().slice(0, 10));
      request.input('WorkStatus', sql.NVarChar(50), body.WorkStatus || 'Đang làm việc');
      request.input('BaseSalary', sql.Decimal(18, 2), parseFloat(body.BaseSalary) || 0);
      request.input('InsuranceSalary', sql.Decimal(18, 2), parseFloat(body.InsuranceSalary) || 0);
      request.input('FaceRegistered', sql.Bit, body.FaceRegistered ? 1 : 0);
      request.input('AvatarUrl', sql.NVarChar(500), body.AvatarUrl || null);

      let savedEmpId = existingEmpId;
      if (existingEmpId) {
        request.input('ExistingEmpId', sql.Int, existingEmpId);
        await request.query(`
          UPDATE tblEmployee SET
            EmployeeCode = @EmployeeCode,
            FullName = @FullName,
            Gender = @Gender,
            BirthDate = @BirthDate,
            Phone = @Phone,
            Email = @Email,
            Address = @Address,
            IdCardNumber = @IdCardNumber,
            IdCardDate = @IdCardDate,
            IdCardPlace = @IdCardPlace,
            TaxCode = @TaxCode,
            InsuranceBookNumber = @InsuranceBookNumber,
            BankName = @BankName,
            BankAccountNumber = @BankAccountNumber,
            DependentsCount = @DependentsCount,
            DepartmentId = @DepartmentId,
            PositionId = @PositionId,
            ManagerId = @ManagerId,
            JoinDate = @JoinDate,
            WorkStatus = @WorkStatus,
            BaseSalary = @BaseSalary,
            InsuranceSalary = @InsuranceSalary,
            FaceRegistered = @FaceRegistered,
            AvatarUrl = @AvatarUrl,
            UpdatedAt = SYSDATETIME()
          WHERE EmployeeId = @ExistingEmpId
        `);
      } else {
        const insertResult = await request.query(`
          INSERT INTO tblEmployee (
            EmployeeCode, FullName, Gender, BirthDate, Phone, Email, Address,
            IdCardNumber, IdCardDate, IdCardPlace, TaxCode, InsuranceBookNumber,
            BankName, BankAccountNumber, DependentsCount, DepartmentId, PositionId,
            ManagerId, UserId, JoinDate, WorkStatus, BaseSalary, InsuranceSalary,
            FaceRegistered, AvatarUrl, CreatedAt, UpdatedAt
          )
          OUTPUT INSERTED.EmployeeId, INSERTED.EmployeeCode
          VALUES (
            @EmployeeCode, @FullName, @Gender, @BirthDate, @Phone, @Email, @Address,
            @IdCardNumber, @IdCardDate, @IdCardPlace, @TaxCode, @InsuranceBookNumber,
            @BankName, @BankAccountNumber, @DependentsCount, @DepartmentId, @PositionId,
            @ManagerId, @UserId, @JoinDate, @WorkStatus, @BaseSalary, @InsuranceSalary,
            @FaceRegistered, @AvatarUrl, SYSDATETIME(), SYSDATETIME()
          )
        `);
        savedEmpId = insertResult.recordset[0].EmployeeId;
      }

      return sendSuccess(res, {
        EmployeeId: savedEmpId,
        EmployeeCode: employeeCode,
        FullName: body.FullName
      }, 'Tiếp nhận và lưu hồ sơ nhân sự thành công!', 201);
    } catch (error) {
      console.error('[EmployeeController.createEmployee] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const pool = await connectDb();
      const body = req.body;

      const isNumeric = /^\d+$/.test(id);
      let whereClause = '';
      const checkReq = pool.request();
      if (isNumeric) {
        checkReq.input('id', sql.Int, parseInt(id));
        whereClause = 'EmployeeId = @id';
      } else {
        checkReq.input('code', sql.VarChar(20), id);
        whereClause = 'EmployeeCode = @code';
      }

      const existing = await checkReq.query(`SELECT EmployeeId, EmployeeCode FROM tblEmployee WHERE ${whereClause}`);
      if (!existing.recordset || existing.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy nhân viên cần cập nhật!', 404);
      }

      const targetId = existing.recordset[0].EmployeeId;

      const request = pool.request();
      request.input('targetId', sql.Int, targetId);
      request.input('FullName', sql.NVarChar(100), body.FullName ? body.FullName.trim() : null);
      request.input('Gender', sql.NVarChar(10), body.Gender || null);
      request.input('BirthDate', sql.Date, body.BirthDate || null);
      request.input('Phone', sql.VarChar(20), body.Phone || null);
      request.input('Email', sql.VarChar(100), body.Email || null);
      request.input('Address', sql.NVarChar(255), body.Address || null);
      request.input('IdCardNumber', sql.VarChar(20), body.IdCardNumber || null);
      request.input('IdCardDate', sql.Date, body.IdCardDate || null);
      request.input('IdCardPlace', sql.NVarChar(100), body.IdCardPlace || null);
      request.input('TaxCode', sql.VarChar(20), body.TaxCode || null);
      request.input('InsuranceBookNumber', sql.VarChar(20), body.InsuranceBookNumber || null);
      request.input('BankName', sql.NVarChar(100), body.BankName || null);
      request.input('BankAccountNumber', sql.VarChar(30), body.BankAccountNumber || null);
      request.input('DependentsCount', sql.Int, body.DependentsCount !== undefined ? parseInt(body.DependentsCount) : null);
      request.input('DepartmentId', sql.Int, body.DepartmentId ? parseInt(body.DepartmentId) : null);
      request.input('PositionId', sql.Int, body.PositionId ? parseInt(body.PositionId) : null);
      request.input('ManagerId', sql.Int, body.ManagerId ? parseInt(body.ManagerId) : null);
      request.input('JoinDate', sql.Date, body.JoinDate || null);
      request.input('WorkStatus', sql.NVarChar(50), body.WorkStatus || null);
      request.input('BaseSalary', sql.Decimal(18, 2), body.BaseSalary !== undefined ? parseFloat(body.BaseSalary) : null);
      request.input('InsuranceSalary', sql.Decimal(18, 2), body.InsuranceSalary !== undefined ? parseFloat(body.InsuranceSalary) : null);
      request.input('FaceRegistered', sql.Bit, body.FaceRegistered !== undefined ? (body.FaceRegistered ? 1 : 0) : null);
      request.input('AvatarUrl', sql.NVarChar(500), body.AvatarUrl || null);

      await request.query(`
        UPDATE tblEmployee SET
          FullName = COALESCE(@FullName, FullName),
          Gender = COALESCE(@Gender, Gender),
          BirthDate = COALESCE(@BirthDate, BirthDate),
          Phone = COALESCE(@Phone, Phone),
          Email = COALESCE(@Email, Email),
          Address = COALESCE(@Address, Address),
          IdCardNumber = COALESCE(@IdCardNumber, IdCardNumber),
          IdCardDate = COALESCE(@IdCardDate, IdCardDate),
          IdCardPlace = COALESCE(@IdCardPlace, IdCardPlace),
          TaxCode = COALESCE(@TaxCode, TaxCode),
          InsuranceBookNumber = COALESCE(@InsuranceBookNumber, InsuranceBookNumber),
          BankName = COALESCE(@BankName, BankName),
          BankAccountNumber = COALESCE(@BankAccountNumber, BankAccountNumber),
          DependentsCount = COALESCE(@DependentsCount, DependentsCount),
          DepartmentId = COALESCE(@DepartmentId, DepartmentId),
          PositionId = COALESCE(@PositionId, PositionId),
          ManagerId = COALESCE(@ManagerId, ManagerId),
          JoinDate = COALESCE(@JoinDate, JoinDate),
          WorkStatus = COALESCE(@WorkStatus, WorkStatus),
          BaseSalary = COALESCE(@BaseSalary, BaseSalary),
          InsuranceSalary = COALESCE(@InsuranceSalary, InsuranceSalary),
          FaceRegistered = COALESCE(@FaceRegistered, FaceRegistered),
          AvatarUrl = COALESCE(@AvatarUrl, AvatarUrl),
          UpdatedAt = SYSDATETIME()
        WHERE EmployeeId = @targetId
      `);

      return sendSuccess(res, { EmployeeId: targetId }, 'Cập nhật hồ sơ nhân viên thành công!');
    } catch (error) {
      console.error('[EmployeeController.updateEmployee] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      const pool = await connectDb();

      const isNumeric = /^\d+$/.test(id);
      let whereClause = '';
      const checkReq = pool.request();
      if (isNumeric) {
        checkReq.input('id', sql.Int, parseInt(id));
        whereClause = 'EmployeeId = @id';
      } else {
        checkReq.input('code', sql.VarChar(20), id);
        whereClause = 'EmployeeCode = @code';
      }

      const existing = await checkReq.query(`SELECT EmployeeId, EmployeeCode, FullName FROM tblEmployee WHERE ${whereClause}`);
      if (!existing.recordset || existing.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy nhân viên cần xóa!', 404);
      }

      const targetEmp = existing.recordset[0];
      const targetId = targetEmp.EmployeeId;

      
      const delReq = pool.request();
      delReq.input('empId', sql.Int, targetId);
      
      await delReq.query(`DELETE FROM tblContract WHERE EmployeeId = @empId`);
      
      await delReq.query(`DELETE FROM tblEmployee WHERE EmployeeId = @empId`);

      return sendSuccess(res, { EmployeeId: targetId, EmployeeCode: targetEmp.EmployeeCode }, `Xóa nhân sự ${targetEmp.FullName} (${targetEmp.EmployeeCode}) thành công!`);
    } catch (error) {
      console.error('[EmployeeController.deleteEmployee] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async getMyProfile(req, res) {
    try {
      const userId = req.user.userId;
      const pool = await connectDb();
      const request = pool.request();
      request.input('userId', sql.Int, userId);

      const empResult = await request.query(`
        SELECT 
          e.EmployeeId,
          e.EmployeeCode,
          e.FullName,
          e.Gender,
          CONVERT(varchar, e.BirthDate, 23) as BirthDate,
          e.Phone,
          e.Email,
          e.Address,
          e.IdCardNumber,
          CONVERT(varchar, e.IdCardDate, 23) as IdCardDate,
          e.IdCardPlace,
          e.TaxCode,
          e.InsuranceBookNumber,
          e.BankName,
          e.BankAccountNumber,
          e.DependentsCount,
          e.DepartmentId,
          d.DepartmentName,
          d.DepartmentCode,
          e.PositionId,
          p.PositionName,
          p.PositionCode,
          e.ManagerId,
          m.FullName as ManagerName,
          e.UserId,
          u.Username,
          u.Email as UserEmail,
          r.RoleCode,
          r.RoleName,
          CONVERT(varchar, e.JoinDate, 23) as JoinDate,
          e.WorkStatus,
          e.BaseSalary,
          e.InsuranceSalary,
          e.FaceRegistered,
          e.AvatarUrl,
          e.CreatedAt,
          e.UpdatedAt
        FROM tblEmployee e
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        LEFT JOIN tblEmployee m ON e.ManagerId = m.EmployeeId
        LEFT JOIN tblUser u ON e.UserId = u.UserId
        LEFT JOIN tblRole r ON u.RoleId = r.RoleId
        WHERE e.UserId = @userId
      `);

      if (!empResult.recordset || empResult.recordset.length === 0) {
        const userReq = pool.request();
        userReq.input('userId', sql.Int, userId);
        const userRes = await userReq.query(`
          SELECT u.UserId, u.Username, u.Email, u.FullName, u.Phone, r.RoleCode, r.RoleName
          FROM tblUser u
          JOIN tblRole r ON u.RoleId = r.RoleId
          WHERE u.UserId = @userId
        `);
        const usr = userRes.recordset[0] || {};
        return sendSuccess(res, {
          EmployeeId: null,
          EmployeeCode: null,
          FullName: usr.FullName || usr.Username || '',
          Gender: 'Nam',
          BirthDate: null,
          Phone: usr.Phone || '',
          Email: usr.Email || '',
          Address: '',
          IdCardNumber: '',
          IdCardDate: null,
          IdCardPlace: '',
          TaxCode: '',
          InsuranceBookNumber: '',
          BankName: '',
          BankAccountNumber: '',
          DependentsCount: 0,
          DepartmentId: null,
          DepartmentName: 'Chưa phân bổ',
          PositionId: null,
          PositionName: usr.RoleName || usr.RoleCode || 'Nhân viên',
          ManagerId: null,
          ManagerName: 'Chưa chỉ định',
          JoinDate: null,
          WorkStatus: 'Chờ tiếp nhận',
          BaseSalary: 0,
          InsuranceSalary: 0,
          FaceRegistered: false,
          AvatarUrl: null,
          contracts: []
        }, 'Lấy hồ sơ cá nhân thành công!');
      }

      const employee = empResult.recordset[0];
      const contractReq = pool.request();
      contractReq.input('employeeId', sql.Int, employee.EmployeeId);
      const contractResult = await contractReq.query(`
        SELECT 
          ContractId,
          ContractNumber,
          EmployeeId,
          ContractType,
          CONVERT(varchar, SignDate, 23) as SignDate,
          CONVERT(varchar, StartDate, 23) as StartDate,
          CONVERT(varchar, EndDate, 23) as EndDate,
          AgreedSalary,
          Status,
          ContractFileUrl,
          CreatedAt
        FROM tblContract
        WHERE EmployeeId = @employeeId
        ORDER BY StartDate DESC
      `);

      return sendSuccess(res, {
        ...employee,
        contracts: contractResult.recordset || []
      }, 'Lấy hồ sơ cá nhân thành công!');
    } catch (error) {
      console.error('[EmployeeController.getMyProfile] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async updateMyProfile(req, res) {
    try {
      const userId = req.user.userId;
      const body = req.body;
      const pool = await connectDb();

      const fullName = (body.fullName || body.FullName || '').trim();
      const phone = (body.phone || body.Phone || '').trim();
      const email = (body.email || body.Email || '').trim();
      const gender = (body.gender || body.Gender || 'Nam').trim();
      const birthDate = body.birthDate || body.BirthDate || null;
      const address = (body.address || body.Address || '').trim();
      const idCardNumber = (body.idCardNumber || body.IdCardNumber || '').trim();
      const idCardDate = body.idCardDate || body.IdCardDate || null;
      const idCardPlace = (body.idCardPlace || body.IdCardPlace || '').trim();
      const bankName = (body.bankName || body.BankName || '').trim();
      const bankAccountNumber = (body.bankAccountNumber || body.BankAccountNumber || '').trim();

      if (!fullName) {
        return sendError(res, 'Họ và tên không được để trống!', 400);
      }

      if (email) {
        const checkUserEmail = await pool.request()
          .input('email', sql.VarChar(100), email)
          .input('userId', sql.Int, userId)
          .query('SELECT UserId FROM tblUser WHERE Email = @email AND UserId != @userId');
        if (checkUserEmail.recordset.length > 0) {
          return sendError(res, `Địa chỉ email "${email}" đã được sử dụng bởi tài khoản khác!`, 400);
        }

        const checkEmpEmail = await pool.request()
          .input('email', sql.VarChar(100), email)
          .input('userId', sql.Int, userId)
          .query('SELECT EmployeeId FROM tblEmployee WHERE Email = @email AND (UserId IS NULL OR UserId != @userId)');
        if (checkEmpEmail.recordset.length > 0) {
          return sendError(res, `Địa chỉ email "${email}" đã được sử dụng bởi hồ sơ nhân sự khác!`, 400);
        }
      }

      const userUpd = pool.request();
      userUpd.input('userId', sql.Int, userId);
      userUpd.input('fullName', sql.NVarChar(100), fullName);
      userUpd.input('phone', sql.VarChar(20), phone || null);
      userUpd.input('email', sql.VarChar(100), email || null);
      await userUpd.query(`
        UPDATE tblUser SET
          FullName = @fullName,
          Phone = @phone,
          Email = COALESCE(@email, Email)
        WHERE UserId = @userId
      `);

      const empCheck = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT EmployeeId FROM tblEmployee WHERE UserId = @userId');

      if (empCheck.recordset.length > 0) {
        const empUpd = pool.request();
        empUpd.input('userId', sql.Int, userId);
        empUpd.input('fullName', sql.NVarChar(100), fullName);
        empUpd.input('phone', sql.VarChar(20), phone || null);
        empUpd.input('email', sql.VarChar(100), email || null);
        empUpd.input('gender', sql.NVarChar(10), gender);
        empUpd.input('birthDate', sql.Date, birthDate || null);
        empUpd.input('address', sql.NVarChar(255), address || null);
        empUpd.input('idCardNumber', sql.VarChar(20), idCardNumber || null);
        empUpd.input('idCardDate', sql.Date, idCardDate || null);
        empUpd.input('idCardPlace', sql.NVarChar(100), idCardPlace || null);
        empUpd.input('bankName', sql.NVarChar(100), bankName || null);
        empUpd.input('bankAccountNumber', sql.VarChar(30), bankAccountNumber || null);

        await empUpd.query(`
          UPDATE tblEmployee SET
            FullName = @fullName,
            Phone = @phone,
            Email = COALESCE(@email, Email),
            Gender = @gender,
            BirthDate = @birthDate,
            Address = @address,
            IdCardNumber = @idCardNumber,
            IdCardDate = @idCardDate,
            IdCardPlace = @idCardPlace,
            BankName = @bankName,
            BankAccountNumber = @bankAccountNumber,
            UpdatedAt = SYSDATETIME()
          WHERE UserId = @userId
        `);
      }

      return EmployeeController.getMyProfile(req, res);
    } catch (error) {
      console.error('[EmployeeController.updateMyProfile] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async getTeamMembers(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;
      const pool = await connectDb();

      let managerEmployeeId = null;
      let managerDepartmentId = null;

      const mgrQuery = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT e.EmployeeId, e.DepartmentId, d.DepartmentName, e.FullName
          FROM tblEmployee e
          LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
          WHERE e.UserId = @userId
        `);

      if (mgrQuery.recordset.length > 0) {
        managerEmployeeId = mgrQuery.recordset[0].EmployeeId;
        managerDepartmentId = mgrQuery.recordset[0].DepartmentId;
      }

      const search = (req.query.search || req.query.q || '').trim();
      const positionId = req.query.positionId ? parseInt(req.query.positionId) : null;
      const faceStatus = (req.query.faceStatus || '').trim();

      const request = pool.request();
      let whereConditions = [];

      if (userRole === 'Manager') {
        if (!managerEmployeeId) {
          return sendSuccess(res, {
            members: [],
            stats: { total: 0, working: 0, late: 0, absent: 0, faceActive: 0 }
          }, 'Tài khoản chưa được liên kết với hồ sơ Trưởng nhóm.');
        }

        request.input('mgrEmpId', sql.Int, managerEmployeeId);
        request.input('mgrDeptId', sql.Int, managerDepartmentId || 0);

        whereConditions.push(`(
          e.ManagerId = @mgrEmpId
          OR (e.DepartmentId = @mgrDeptId AND e.EmployeeId != @mgrEmpId)
          OR e.DepartmentId IN (SELECT DepartmentId FROM tblDepartment WHERE ManagerEmployeeId = @mgrEmpId)
        ) AND e.EmployeeId != @mgrEmpId`);
      } else {
        const queryDeptId = req.query.departmentId ? parseInt(req.query.departmentId) : (managerDepartmentId || null);
        if (queryDeptId) {
          request.input('qDeptId', sql.Int, queryDeptId);
          whereConditions.push('e.DepartmentId = @qDeptId');
        } else {
          whereConditions.push('1=1');
        }
      }

      if (search) {
        request.input('search', sql.NVarChar(100), `%${search}%`);
        whereConditions.push('(e.FullName LIKE @search OR e.EmployeeCode LIKE @search OR e.Phone LIKE @search OR e.Email LIKE @search)');
      }

      if (positionId) {
        request.input('positionId', sql.Int, positionId);
        whereConditions.push('e.PositionId = @positionId');
      }

      if (faceStatus === 'active') {
        whereConditions.push('e.FaceRegistered = 1');
      } else if (faceStatus === 'pending') {
        whereConditions.push('(e.FaceRegistered = 0 OR e.FaceRegistered IS NULL)');
      }

      const whereClause = whereConditions.join(' AND ');

      const teamResult = await request.query(`
        SELECT 
          e.EmployeeId,
          e.EmployeeCode,
          e.FullName,
          e.Gender,
          CONVERT(varchar, e.BirthDate, 23) as BirthDate,
          e.Phone,
          e.Email,
          e.Address,
          e.IdCardNumber,
          CONVERT(varchar, e.IdCardDate, 23) as IdCardDate,
          e.IdCardPlace,
          e.TaxCode,
          e.InsuranceBookNumber,
          e.BankName,
          e.BankAccountNumber,
          e.DependentsCount,
          e.DepartmentId,
          d.DepartmentName,
          d.DepartmentCode,
          e.PositionId,
          p.PositionName,
          p.PositionCode,
          e.ManagerId,
          m.FullName as ManagerName,
          CONVERT(varchar, e.JoinDate, 23) as JoinDate,
          e.WorkStatus,
          e.BaseSalary,
          e.InsuranceSalary,
          e.FaceRegistered,
          e.AvatarUrl,
          att.AttendanceId,
          CONVERT(varchar, att.TimeIn, 108) as TodayTimeIn,
          CONVERT(varchar, att.TimeOut, 108) as TodayTimeOut,
          att.AttendanceCode as TodayAttendanceCode,
          att.LateMinutes as TodayLateMinutes,
          att.CheckinMethod as TodayCheckinMethod,
          (
            SELECT TOP 1 ContractType 
            FROM tblContract c 
            WHERE c.EmployeeId = e.EmployeeId 
            ORDER BY c.StartDate DESC
          ) as ContractType,
          (
            SELECT TOP 1 AgreedSalary 
            FROM tblContract c 
            WHERE c.EmployeeId = e.EmployeeId 
            ORDER BY c.StartDate DESC
          ) as AgreedSalary
        FROM tblEmployee e
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        LEFT JOIN tblEmployee m ON e.ManagerId = m.EmployeeId
        LEFT JOIN tblAttendance att ON e.EmployeeId = att.EmployeeId AND att.AttendanceDate = CAST(GETDATE() AS DATE)
        WHERE ${whereClause}
        ORDER BY e.FullName ASC
      `);

      const members = teamResult.recordset;

      const total = members.length;
      let working = 0;
      let late = 0;
      let absent = 0;
      let faceActive = 0;

      members.forEach(mem => {
        if (mem.FaceRegistered) faceActive++;
        if (mem.TodayAttendanceCode === 'X' || (mem.TodayTimeIn && !mem.TodayLateMinutes)) {
          working++;
        } else if (mem.TodayAttendanceCode === 'M' || mem.TodayLateMinutes > 0) {
          late++;
        } else {
          absent++;
        }
      });

      return sendSuccess(res, {
        members,
        stats: {
          total,
          working,
          late,
          absent,
          faceActive
        }
      }, 'Lấy danh sách thành viên nhóm thành công!');
    } catch (error) {
      console.error('[EmployeeController.getTeamMembers] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }
}

