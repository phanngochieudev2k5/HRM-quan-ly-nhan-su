import { connectDb, sql } from '../Config/DbConfig.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';
import { EmailService } from '../Services/EmailService.js';

export class LaborContractController {
  
  
  static async getContracts(req, res) {
    try {
      const pool = await connectDb();
      const {
        search = '',
        status = '',
        contractType = '',
        departmentId = '',
        employeeId = '',
        expiringDays = '',
        page = 1,
        limit = 50
      } = req.query;

      const request = pool.request();
      const whereConditions = ['1=1'];

      if (search && search.trim()) {
        request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
        whereConditions.push('(c.ContractNumber LIKE @search OR e.FullName LIKE @search OR e.EmployeeCode LIKE @search)');
      }

      if (status && status.trim() && status !== 'all') {
        request.input('status', sql.NVarChar(50), status.trim());
        whereConditions.push('c.Status = @status');
      }

      if (contractType && contractType.trim() && contractType !== 'all') {
        request.input('contractType', sql.NVarChar(100), contractType.trim());
        whereConditions.push('c.ContractType = @contractType');
      }

      if (departmentId && parseInt(departmentId)) {
        request.input('departmentId', sql.Int, parseInt(departmentId));
        whereConditions.push('e.DepartmentId = @departmentId');
      }

      if (employeeId && parseInt(employeeId)) {
        request.input('employeeId', sql.Int, parseInt(employeeId));
        whereConditions.push('c.EmployeeId = @employeeId');
      }

      
      if (expiringDays && parseInt(expiringDays)) {
        request.input('expiringDays', sql.Int, parseInt(expiringDays));
        whereConditions.push(`(
          c.EndDate IS NOT NULL 
          AND c.EndDate >= CAST(GETDATE() AS DATE) 
          AND DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= @expiringDays
          AND c.Status NOT IN (N'Đã chấm dứt', N'Hết hạn', N'Chờ nhân viên ký')
        )`);
      }

      const query = `
        SELECT 
          c.ContractId,
          c.ContractNumber,
          c.EmployeeId,
          e.EmployeeCode,
          e.FullName AS EmployeeName,
          e.Email AS EmployeeEmail,
          e.Phone AS EmployeePhone,
          e.AvatarUrl AS EmployeeAvatar,
          e.WorkStatus AS EmployeeWorkStatus,
          e.Gender AS EmployeeGender,
          CONVERT(varchar, e.BirthDate, 23) AS EmployeeBirthDate,
          e.Address AS EmployeeAddress,
          e.IdCardNumber AS EmployeeIdCard,
          e.TaxCode AS EmployeeTaxCode,
          e.BankAccountNumber AS EmployeeBankAccount,
          e.BankName AS EmployeeBankName,
          CONVERT(varchar, e.JoinDate, 23) AS EmployeeJoinDate,
          d.DepartmentId,
          d.DepartmentName,
          p.PositionId,
          p.PositionName,
          c.ContractType,
          CONVERT(varchar, c.SignDate, 23) AS SignDate,
          CONVERT(varchar, c.StartDate, 23) AS StartDate,
          CONVERT(varchar, c.EndDate, 23) AS EndDate,
          c.AgreedSalary,
          c.Status,
          c.ContractFileUrl,
          c.TerminationType,
          c.TerminationStatus,
          c.TerminationRequestedBy,
          CONVERT(varchar, c.TerminationDate, 23) AS TerminationDate,
          c.TerminationReason,
          c.TerminationNote,
          c.TerminationDecisionNumber,
          c.TerminationEvaluationMeeting,
          c.TerminationDecisionFileUrl,
          c.TerminationMeetingFileUrl,
          c.CreatedAt,
          CASE 
            WHEN c.EndDate IS NOT NULL THEN DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate)
            ELSE NULL 
          END AS DaysRemaining,
          CASE 
            WHEN c.Status = N'Đã chấm dứt' OR c.Status = N'Hết hạn' THEN 'EXPIRED'
            WHEN c.Status = N'Chờ nhân viên ký' THEN 'PENDING_SIGN'
            WHEN c.EndDate IS NULL THEN 'PERMANENT'
            WHEN c.EndDate < CAST(GETDATE() AS DATE) THEN 'EXPIRED'
            WHEN DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 15 THEN 'EXPIRING_URGENT'
            WHEN DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 30 THEN 'EXPIRING_SOON'
            WHEN DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 60 THEN 'EXPIRING_WARNING'
            ELSE 'ACTIVE'
          END AS ExpirationCategory
        FROM tblContract c
        JOIN tblEmployee e ON c.EmployeeId = e.EmployeeId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY 
          CASE 
            WHEN c.EndDate IS NOT NULL AND c.EndDate >= CAST(GETDATE() AS DATE) AND DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 30 THEN 0
            WHEN c.EndDate IS NOT NULL AND c.EndDate < CAST(GETDATE() AS DATE) AND c.Status != N'Đã chấm dứt' THEN 1
            WHEN c.EndDate IS NOT NULL AND c.EndDate >= CAST(GETDATE() AS DATE) THEN 2
            WHEN c.EndDate IS NULL THEN 3
            ELSE 4
          END ASC,
          c.EndDate ASC,
          c.StartDate DESC
      `;

      const result = await request.query(query);
      return sendSuccess(res, result.recordset, 'Lấy danh sách hợp đồng lao động thành công!');
    } catch (error) {
      console.error('[LaborContractController.getContracts] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async getContractStats(req, res) {
    try {
      const pool = await connectDb();
      const statsQuery = `
        SELECT 
          COUNT(*) AS totalContracts,
          COUNT(DISTINCT c.EmployeeId) AS totalEmployeesWithContract,
          COALESCE(SUM(CASE WHEN c.Status = N'Hiệu lực' AND (c.EndDate IS NULL OR c.EndDate >= CAST(GETDATE() AS DATE)) THEN 1 ELSE 0 END), 0) AS activeContracts,
          COALESCE(SUM(CASE 
            WHEN c.EndDate IS NOT NULL 
              AND c.EndDate >= CAST(GETDATE() AS DATE) 
              AND DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 30 
              AND c.Status NOT IN (N'Đã chấm dứt', N'Hết hạn', N'Chờ nhân viên ký') 
            THEN 1 ELSE 0 
          END), 0) AS expiringSoon30,
          COALESCE(SUM(CASE 
            WHEN c.EndDate IS NOT NULL 
              AND c.EndDate >= CAST(GETDATE() AS DATE) 
              AND DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 15 
              AND c.Status NOT IN (N'Đã chấm dứt', N'Hết hạn', N'Chờ nhân viên ký') 
            THEN 1 ELSE 0 
          END), 0) AS expiringSoon15,
          COALESCE(SUM(CASE 
            WHEN c.EndDate IS NOT NULL 
              AND c.EndDate >= CAST(GETDATE() AS DATE) 
              AND DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 60 
              AND c.Status NOT IN (N'Đã chấm dứt', N'Hết hạn', N'Chờ nhân viên ký') 
            THEN 1 ELSE 0 
          END), 0) AS expiringSoon60,
          COALESCE(SUM(CASE 
            WHEN (c.EndDate IS NOT NULL AND c.EndDate < CAST(GETDATE() AS DATE)) 
              OR c.Status IN (N'Hết hạn', N'Đã chấm dứt') 
            THEN 1 ELSE 0 
          END), 0) AS expiredContracts,
          COALESCE(SUM(CASE 
            WHEN c.EndDate IS NULL 
              OR c.ContractType LIKE N'%vô thời hạn%' 
              OR c.ContractType LIKE N'%không xác định%' 
            THEN 1 ELSE 0 
          END), 0) AS permanentContracts,
          COALESCE(SUM(CASE WHEN c.Status = N'Chờ nhân viên ký' THEN 1 ELSE 0 END), 0) AS pendingSignContracts,
          (SELECT COUNT(*) FROM tblEmployee) AS totalEmployees
        FROM tblContract c
      `;

      const result = await pool.request().query(statsQuery);
      return sendSuccess(res, result.recordset[0] || {}, 'Lấy thống kê hợp đồng thành công!');
    } catch (error) {
      console.error('[LaborContractController.getContractStats] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async getExpiringAlerts(req, res) {
    try {
      const pool = await connectDb();
      const days = parseInt(req.query.days) || 30;

      const request = pool.request();
      request.input('days', sql.Int, days);

      const query = `
        SELECT 
          c.ContractId,
          c.ContractNumber,
          c.EmployeeId,
          e.EmployeeCode,
          e.FullName AS EmployeeName,
          e.Email AS EmployeeEmail,
          e.Phone AS EmployeePhone,
          e.AvatarUrl AS EmployeeAvatar,
          d.DepartmentName,
          p.PositionName,
          c.ContractType,
          CONVERT(varchar, c.SignDate, 23) AS SignDate,
          CONVERT(varchar, c.StartDate, 23) AS StartDate,
          CONVERT(varchar, c.EndDate, 23) AS EndDate,
          c.AgreedSalary,
          c.Status,
          c.ContractFileUrl,
          DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) AS DaysRemaining,
          CASE 
            WHEN c.EndDate < CAST(GETDATE() AS DATE) THEN 'EXPIRED'
            WHEN DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 15 THEN 'EXPIRING_URGENT'
            WHEN DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 30 THEN 'EXPIRING_SOON'
            ELSE 'EXPIRING_WARNING'
          END AS ExpirationCategory
        FROM tblContract c
        JOIN tblEmployee e ON c.EmployeeId = e.EmployeeId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        WHERE c.EndDate IS NOT NULL 
          AND c.EndDate >= CAST(GETDATE() AS DATE)
          AND DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= @days
          AND c.Status NOT IN (N'Đã chấm dứt', N'Hết hạn', N'Chờ nhân viên ký')
        ORDER BY c.EndDate ASC
      `;

      const result = await request.query(query);
      return sendSuccess(res, result.recordset, 'Lấy danh sách hợp đồng sắp hết hạn thành công!');
    } catch (error) {
      console.error('[LaborContractController.getExpiringAlerts] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async getEmployeeContractHistory(req, res) {
    try {
      const { employeeId } = req.params;
      const pool = await connectDb();

      
      const empReq = pool.request();
      empReq.input('empId', sql.Int, parseInt(employeeId));
      const empRes = await empReq.query(`
        SELECT 
          e.EmployeeId, e.EmployeeCode, e.FullName, e.Email, e.Phone,
          e.AvatarUrl, e.WorkStatus, CONVERT(varchar, e.JoinDate, 23) AS JoinDate,
          d.DepartmentId, d.DepartmentName,
          p.PositionId, p.PositionName
        FROM tblEmployee e
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        WHERE e.EmployeeId = @empId
      `);

      if (!empRes.recordset || empRes.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy thông tin nhân viên!', 404);
      }

      const employee = empRes.recordset[0];

      
      const contractReq = pool.request();
      contractReq.input('empId', sql.Int, parseInt(employeeId));
      const contractRes = await contractReq.query(`
        SELECT 
          c.ContractId,
          c.ContractNumber,
          c.ContractType,
          CONVERT(varchar, c.SignDate, 23) AS SignDate,
          CONVERT(varchar, c.StartDate, 23) AS StartDate,
          CONVERT(varchar, c.EndDate, 23) AS EndDate,
          c.AgreedSalary,
          c.Status,
          c.ContractFileUrl,
          c.TerminationType,
          c.TerminationStatus,
          c.TerminationRequestedBy,
          CONVERT(varchar, c.TerminationDate, 23) AS TerminationDate,
          c.TerminationReason,
          c.TerminationNote,
          c.TerminationDecisionNumber,
          c.TerminationEvaluationMeeting,
          c.TerminationDecisionFileUrl,
          c.TerminationMeetingFileUrl,
          c.CreatedAt,
          CASE 
            WHEN c.EndDate IS NOT NULL THEN DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate)
            ELSE NULL 
          END AS DaysRemaining,
          CASE 
            WHEN c.Status = N'Đã chấm dứt' OR c.Status = N'Hết hạn' THEN 'EXPIRED'
            WHEN c.Status = N'Chờ nhân viên ký' THEN 'PENDING_SIGN'
            WHEN c.EndDate IS NULL THEN 'PERMANENT'
            WHEN c.EndDate < CAST(GETDATE() AS DATE) THEN 'EXPIRED'
            WHEN DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 15 THEN 'EXPIRING_URGENT'
            WHEN DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 30 THEN 'EXPIRING_SOON'
            ELSE 'ACTIVE'
          END AS ExpirationCategory
        FROM tblContract c
        WHERE c.EmployeeId = @empId
        ORDER BY c.StartDate ASC, c.ContractId ASC
      `);

      
      const history = (contractRes.recordset || []).map((contract, index) => ({
        ...contract,
        stageNumber: index + 1,
        stageLabel: `Giai đoạn ${index + 1}`
      }));

      return sendSuccess(res, {
        employee,
        totalContracts: history.length,
        history
      }, 'Tra cứu lịch sử hợp đồng nhân viên thành công!');
    } catch (error) {
      console.error('[LaborContractController.getEmployeeContractHistory] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async getContractById(req, res) {
    try {
      const { id } = req.params;
      const pool = await connectDb();

      const request = pool.request();
      request.input('id', sql.Int, parseInt(id));

      const result = await request.query(`
        SELECT 
          c.ContractId,
          c.ContractNumber,
          c.EmployeeId,
          e.EmployeeCode,
          e.FullName AS EmployeeName,
          e.Email AS EmployeeEmail,
          e.Phone AS EmployeePhone,
          e.AvatarUrl AS EmployeeAvatar,
          e.WorkStatus AS EmployeeWorkStatus,
          e.Gender AS EmployeeGender,
          CONVERT(varchar, e.BirthDate, 23) AS EmployeeBirthDate,
          e.Address AS EmployeeAddress,
          e.IdCardNumber AS EmployeeIdCard,
          e.TaxCode AS EmployeeTaxCode,
          e.BankAccountNumber AS EmployeeBankAccount,
          e.BankName AS EmployeeBankName,
          CONVERT(varchar, e.JoinDate, 23) AS EmployeeJoinDate,
          d.DepartmentId,
          d.DepartmentName,
          p.PositionId,
          p.PositionName,
          c.ContractType,
          CONVERT(varchar, c.SignDate, 23) AS SignDate,
          CONVERT(varchar, c.StartDate, 23) AS StartDate,
          CONVERT(varchar, c.EndDate, 23) AS EndDate,
          c.AgreedSalary,
          c.Status,
          c.ContractFileUrl,
          c.TerminationType,
          c.TerminationStatus,
          c.TerminationRequestedBy,
          CONVERT(varchar, c.TerminationDate, 23) AS TerminationDate,
          c.TerminationReason,
          c.TerminationNote,
          c.TerminationDecisionNumber,
          c.TerminationEvaluationMeeting,
          c.TerminationDecisionFileUrl,
          c.TerminationMeetingFileUrl,
          c.CreatedAt
        FROM tblContract c
        JOIN tblEmployee e ON c.EmployeeId = e.EmployeeId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        WHERE c.ContractId = @id
      `);

      if (!result.recordset || result.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy hợp đồng!', 404);
      }

      return sendSuccess(res, result.recordset[0], 'Lấy thông tin hợp đồng thành công!');
    } catch (error) {
      console.error('[LaborContractController.getContractById] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async createContract(req, res) {
    try {
      const pool = await connectDb();
      const body = req.body;

      const employeeId = body.employeeId || body.EmployeeId;
      if (!employeeId) {
        return sendError(res, 'Vui lòng chọn nhân viên áp dụng hợp đồng (EmployeeId)!', 400);
      }

      const contractType = (body.contractType || body.ContractType || 'Hợp đồng xác định thời hạn 1 năm').trim();
      const signDate = body.signDate || body.SignDate || new Date().toISOString().slice(0, 10);
      const startDate = body.startDate || body.StartDate || new Date().toISOString().slice(0, 10);
      const endDate = body.endDate || body.EndDate || null;
      const agreedSalary = parseFloat(body.agreedSalary || body.AgreedSalary) || 0;
      const status = (body.status || body.Status || 'Hiệu lực').trim();
      const contractFileUrl = (body.contractFileUrl || body.ContractFileUrl || '').trim() || null;

      
      let contractNumber = (body.contractNumber || body.ContractNumber || '').trim();
      if (!contractNumber) {
        const year = new Date().getFullYear();
        const countRes = await pool.request().query('SELECT COUNT(*) AS total FROM tblContract');
        const nextNum = (countRes.recordset[0]?.total || 0) + 1;
        contractNumber = `HD-${year}-${String(nextNum).padStart(3, '0')}`;
      } else {
        
        const checkReq = pool.request();
        checkReq.input('cNum', sql.VarChar(50), contractNumber);
        const checkRes = await checkReq.query('SELECT ContractId FROM tblContract WHERE ContractNumber = @cNum');
        if (checkRes.recordset && checkRes.recordset.length > 0) {
          return sendError(res, `Số hợp đồng "${contractNumber}" đã tồn tại trong hệ thống! Vui lòng chọn số khác.`, 400);
        }
      }

      
      if (status === 'Hiệu lực') {
        const updateOldReq = pool.request();
        updateOldReq.input('empId', sql.Int, parseInt(employeeId));
        await updateOldReq.query(`
          UPDATE tblContract 
          SET Status = N'Hết hạn' 
          WHERE EmployeeId = @empId AND Status = N'Hiệu lực'
        `);
      }

      const request = pool.request();
      request.input('ContractNumber', sql.VarChar(50), contractNumber);
      request.input('EmployeeId', sql.Int, parseInt(employeeId));
      request.input('ContractType', sql.NVarChar(100), contractType);
      request.input('SignDate', sql.Date, signDate);
      request.input('StartDate', sql.Date, startDate);
      request.input('EndDate', sql.Date, endDate);
      request.input('AgreedSalary', sql.Decimal(18, 2), agreedSalary);
      request.input('Status', sql.NVarChar(50), status);
      request.input('ContractFileUrl', sql.NVarChar(500), contractFileUrl);

      const result = await request.query(`
        INSERT INTO tblContract (
          ContractNumber, EmployeeId, ContractType, SignDate, StartDate, EndDate,
          AgreedSalary, Status, ContractFileUrl, CreatedAt
        )
        OUTPUT INSERTED.ContractId, INSERTED.ContractNumber
        VALUES (
          @ContractNumber, @EmployeeId, @ContractType, @SignDate, @StartDate, @EndDate,
          @AgreedSalary, @Status, @ContractFileUrl, SYSDATETIME()
        )
      `);

      
      if (status === 'Hiệu lực' || status === 'Sắp hết hạn') {
        const syncEmpSalary = pool.request();
        syncEmpSalary.input('empId', sql.Int, parseInt(employeeId));
        syncEmpSalary.input('sal', sql.Decimal(18, 2), agreedSalary);
        await syncEmpSalary.query(`
          UPDATE tblEmployee 
          SET BaseSalary = @sal,
              InsuranceSalary = CASE WHEN InsuranceSalary IS NULL OR InsuranceSalary = 0 OR InsuranceSalary = BaseSalary THEN @sal ELSE InsuranceSalary END,
              UpdatedAt = SYSDATETIME()
          WHERE EmployeeId = @empId
        `);
      }

      return sendSuccess(res, result.recordset[0], 'Tạo mới hợp đồng lao động thành công!', 201);
    } catch (error) {
      console.error('[LaborContractController.createContract] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async updateContract(req, res) {
    try {
      const { id } = req.params;
      const pool = await connectDb();
      const body = req.body;

      const contractNumber = body.contractNumber || body.ContractNumber || null;
      const contractType = body.contractType || body.ContractType || null;
      const signDate = body.signDate || body.SignDate || null;
      const startDate = body.startDate || body.StartDate || null;
      const endDate = body.endDate !== undefined ? body.endDate : (body.EndDate !== undefined ? body.EndDate : undefined);
      const agreedSalary = (body.agreedSalary !== undefined ? body.agreedSalary : body.AgreedSalary);
      const status = body.status || body.Status || null;
      const contractFileUrl = body.contractFileUrl !== undefined ? body.contractFileUrl : body.ContractFileUrl;

      
      if (contractNumber) {
        const checkReq = pool.request();
        checkReq.input('cNum', sql.VarChar(50), contractNumber);
        checkReq.input('cId', sql.Int, parseInt(id));
        const checkRes = await checkReq.query(`
          SELECT ContractId FROM tblContract WHERE ContractNumber = @cNum AND ContractId != @cId
        `);
        if (checkRes.recordset && checkRes.recordset.length > 0) {
          return sendError(res, `Số hợp đồng "${contractNumber}" đã thuộc về hợp đồng khác!`, 400);
        }
      }

      const request = pool.request();
      request.input('id', sql.Int, parseInt(id));
      request.input('ContractNumber', sql.VarChar(50), contractNumber);
      request.input('ContractType', sql.NVarChar(100), contractType);
      request.input('SignDate', sql.Date, signDate);
      request.input('StartDate', sql.Date, startDate);
      request.input('EndDate', sql.Date, endDate !== undefined ? endDate : null);
      request.input('AgreedSalary', sql.Decimal(18, 2), agreedSalary !== undefined ? parseFloat(agreedSalary) : null);
      request.input('Status', sql.NVarChar(50), status);
      request.input('ContractFileUrl', sql.NVarChar(500), contractFileUrl !== undefined ? contractFileUrl : null);

      let updateQuery = `
        UPDATE tblContract SET
          ContractNumber = COALESCE(@ContractNumber, ContractNumber),
          ContractType = COALESCE(@ContractType, ContractType),
          SignDate = COALESCE(@SignDate, SignDate),
          StartDate = COALESCE(@StartDate, StartDate),
          AgreedSalary = COALESCE(@AgreedSalary, AgreedSalary),
          Status = COALESCE(@Status, Status)
      `;

      if (endDate !== undefined) {
        updateQuery += `, EndDate = @EndDate`;
      }
      if (contractFileUrl !== undefined) {
        updateQuery += `, ContractFileUrl = @ContractFileUrl`;
      }

      updateQuery += ` WHERE ContractId = @id`;

      await request.query(updateQuery);

      
      if (agreedSalary !== undefined && agreedSalary !== null) {
        const syncReq = pool.request();
        syncReq.input('cId', sql.Int, parseInt(id));
        await syncReq.query(`
          UPDATE e
          SET e.BaseSalary = c.AgreedSalary,
              e.InsuranceSalary = CASE WHEN e.InsuranceSalary IS NULL OR e.InsuranceSalary = 0 OR e.InsuranceSalary = e.BaseSalary THEN c.AgreedSalary ELSE e.InsuranceSalary END,
              e.UpdatedAt = SYSDATETIME()
          FROM tblEmployee e
          INNER JOIN tblContract c ON e.EmployeeId = c.EmployeeId
          WHERE c.ContractId = @cId AND c.Status IN (N'Hiệu lực', N'Sắp hết hạn')
        `);
      }

      return sendSuccess(res, { ContractId: parseInt(id) }, 'Cập nhật hợp đồng lao động thành công!');
    } catch (error) {
      console.error('[LaborContractController.updateContract] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async deleteContract(req, res) {
    try {
      const { id } = req.params;
      const pool = await connectDb();

      const request = pool.request();
      request.input('id', sql.Int, parseInt(id));

      await request.query('DELETE FROM tblContract WHERE ContractId = @id');
      return sendSuccess(res, { ContractId: parseInt(id) }, 'Xóa hợp đồng lao động thành công!');
    } catch (error) {
      console.error('[LaborContractController.deleteContract] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async renewContract(req, res) {
    try {
      const { id } = req.params;
      const pool = await connectDb();
      const body = req.body;

      
      const oldReq = pool.request();
      oldReq.input('id', sql.Int, parseInt(id));
      const oldRes = await oldReq.query('SELECT * FROM tblContract WHERE ContractId = @id');

      if (!oldRes.recordset || oldRes.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy hợp đồng cần gia hạn!', 404);
      }

      const oldContract = oldRes.recordset[0];
      const employeeId = oldContract.EmployeeId;

      if (oldContract.Status === 'Đã chấm dứt') {
        return sendError(res, 'Hợp đồng này đã chấm dứt hiệu lực do nhân sự thôi việc, không thể thực hiện gia hạn!', 400);
      }

      if (!oldContract.EndDate || oldContract.ContractType?.toLowerCase().includes('vô thời hạn') || oldContract.ContractType?.toLowerCase().includes('không xác định')) {
        return sendError(res, 'Hợp đồng vô thời hạn không có thời điểm kết thúc, không cần và không thể gia hạn thời gian!', 400);
      }

      
      const year = new Date().getFullYear();
      const countRes = await pool.request().query('SELECT COUNT(*) AS total FROM tblContract');
      const nextNum = (countRes.recordset[0]?.total || 0) + 1;
      const newContractNumber = (body.contractNumber || body.ContractNumber || `HD-${year}-${String(nextNum).padStart(3, '0')}`).trim();

      const newContractType = (body.contractType || body.ContractType || 'Hợp đồng xác định thời hạn 3 năm').trim();
      const newSignDate = body.signDate || body.SignDate || new Date().toISOString().slice(0, 10);
      
      
      let defaultStart = new Date();
      if (oldContract.EndDate) {
        defaultStart = new Date(oldContract.EndDate);
        defaultStart.setDate(defaultStart.getDate() + 1);
      }
      const newStartDate = body.startDate || body.StartDate || defaultStart.toISOString().slice(0, 10);
      const newEndDate = body.endDate !== undefined ? body.endDate : (body.EndDate !== undefined ? body.EndDate : null);
      const newSalary = parseFloat(body.agreedSalary || body.AgreedSalary) || parseFloat(oldContract.AgreedSalary) || 0;
      const newFileUrl = body.contractFileUrl || body.ContractFileUrl || null;

      
      const updateOldReq = pool.request();
      updateOldReq.input('oldId', sql.Int, parseInt(id));
      await updateOldReq.query(`
        UPDATE tblContract 
        SET Status = N'Hết hạn'
        WHERE ContractId = @oldId
      `);

      
      const insertReq = pool.request();
      insertReq.input('ContractNumber', sql.VarChar(50), newContractNumber);
      insertReq.input('EmployeeId', sql.Int, employeeId);
      insertReq.input('ContractType', sql.NVarChar(100), newContractType);
      insertReq.input('SignDate', sql.Date, newSignDate);
      insertReq.input('StartDate', sql.Date, newStartDate);
      insertReq.input('EndDate', sql.Date, newEndDate);
      insertReq.input('AgreedSalary', sql.Decimal(18, 2), newSalary);
      insertReq.input('Status', sql.NVarChar(50), 'Hiệu lực');
      insertReq.input('ContractFileUrl', sql.NVarChar(500), newFileUrl);

      const insertRes = await insertReq.query(`
        INSERT INTO tblContract (
          ContractNumber, EmployeeId, ContractType, SignDate, StartDate, EndDate,
          AgreedSalary, Status, ContractFileUrl, CreatedAt
        )
        OUTPUT INSERTED.ContractId, INSERTED.ContractNumber
        VALUES (
          @ContractNumber, @EmployeeId, @ContractType, @SignDate, @StartDate, @EndDate,
          @AgreedSalary, @Status, @ContractFileUrl, SYSDATETIME()
        )
      `);

      
      const syncRenewEmp = pool.request();
      syncRenewEmp.input('empId', sql.Int, employeeId);
      syncRenewEmp.input('newSal', sql.Decimal(18, 2), newSalary);
      await syncRenewEmp.query(`
        UPDATE tblEmployee 
        SET BaseSalary = @newSal,
            InsuranceSalary = CASE WHEN InsuranceSalary IS NULL OR InsuranceSalary = 0 OR InsuranceSalary = BaseSalary THEN @newSal ELSE InsuranceSalary END,
            UpdatedAt = SYSDATETIME()
        WHERE EmployeeId = @empId
      `);

      return sendSuccess(res, {
        oldContractId: parseInt(id),
        newContract: insertRes.recordset[0]
      }, 'Gia hạn và ký kết hợp đồng mới thành công!', 201);
    } catch (error) {
      console.error('[LaborContractController.renewContract] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  
  static async terminateContract(req, res) {
    try {
      const { id } = req.params;
      const pool = await connectDb();
      const {
        terminationType = 'Thỏa thuận hai bên',
        terminateDate,
        reason,
        note,
        decisionNumber,
        evaluationMeetingNumber
      } = req.body;

      const checkReq = pool.request();
      checkReq.input('id', sql.Int, parseInt(id));
      const checkRes = await checkReq.query(`
        SELECT c.*, e.FullName, e.Email, e.UserId, e.PositionId, e.DepartmentId, p.PositionName, d.DepartmentName
        FROM tblContract c
        JOIN tblEmployee e ON c.EmployeeId = e.EmployeeId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        WHERE c.ContractId = @id
      `);

      if (!checkRes.recordset || checkRes.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy hợp đồng cần chấm dứt!', 404);
      }

      const contract = checkRes.recordset[0];
      if (contract.Status === 'Đã chấm dứt') {
        return sendError(res, 'Hợp đồng này đã ở trạng thái chấm dứt từ trước!', 400);
      }

      const termDate = terminateDate || new Date().toISOString().slice(0, 10);
      const termReason = reason || (terminationType === 'Doanh nghiệp cho thôi việc' ? 'Doanh nghiệp đơn phương chấm dứt hợp đồng lao động' : 'Hai bên thỏa thuận chấm dứt hợp đồng lao động');
      const termNote = note ? `${termReason}: ${note}` : termReason;

      let decisionFileUrl = null;
      let meetingFileUrl = null;
      const attachments = [];

      if (req.files) {
        if (req.files.decisionFile && req.files.decisionFile[0]) {
          const file = req.files.decisionFile[0];
          decisionFileUrl = `/uploads/contracts/${file.filename}`;
          attachments.push({
            filename: file.originalname || 'Quyet_dinh_thoi_viec.pdf',
            path: file.path
          });
        }
        if (req.files.meetingFile && req.files.meetingFile[0]) {
          const file = req.files.meetingFile[0];
          meetingFileUrl = `/uploads/contracts/${file.filename}`;
          attachments.push({
            filename: file.originalname || 'Bien_ban_hop_ky_luat.pdf',
            path: file.path
          });
        }
      }

      if (terminationType === 'Doanh nghiệp cho thôi việc') {
        if (!decisionNumber || !evaluationMeetingNumber) {
          return sendError(res, 'Trường hợp Doanh nghiệp cho thôi việc / Sa thải bắt buộc phải nhập Số quyết định và Biên bản họp kỷ luật / đánh giá theo luật!', 400);
        }

        const termReq = pool.request();
        termReq.input('id', sql.Int, parseInt(id));
        termReq.input('termDate', sql.Date, termDate);
        termReq.input('termType', sql.NVarChar(100), terminationType);
        termReq.input('reason', sql.NVarChar(255), termReason);
        termReq.input('note', sql.NVarChar(sql.MAX), termNote);
        termReq.input('decNum', sql.NVarChar(100), decisionNumber);
        termReq.input('evalMeet', sql.NVarChar(100), evaluationMeetingNumber);
        termReq.input('decFile', sql.NVarChar(500), decisionFileUrl);
        termReq.input('meetFile', sql.NVarChar(500), meetingFileUrl);
        await termReq.query(`
          UPDATE tblContract SET
            Status = N'Đã chấm dứt',
            EndDate = @termDate,
            TerminationType = @termType,
            TerminationStatus = N'Đã chấp thuận',
            TerminationRequestedBy = 'HR',
            TerminationDate = @termDate,
            TerminationReason = @reason,
            TerminationNote = @note,
            TerminationDecisionNumber = @decNum,
            TerminationEvaluationMeeting = @evalMeet,
            TerminationDecisionFileUrl = COALESCE(@decFile, TerminationDecisionFileUrl),
            TerminationMeetingFileUrl = COALESCE(@meetFile, TerminationMeetingFileUrl)
          WHERE ContractId = @id
        `);

        const empReq = pool.request();
        empReq.input('empId', sql.Int, contract.EmployeeId);
        await empReq.query(`
          UPDATE tblEmployee SET WorkStatus = N'Đã thôi việc', UpdatedAt = SYSDATETIME() WHERE EmployeeId = @empId;
          UPDATE tblUser SET IsLocked = 1, UpdatedAt = SYSDATETIME() WHERE UserId = (SELECT UserId FROM tblEmployee WHERE EmployeeId = @empId);
        `);

        try {
          const histReq = pool.request();
          histReq.input('empId', sql.Int, contract.EmployeeId);
          histReq.input('eventDate', sql.Date, termDate);
          histReq.input('eventName', sql.NVarChar(100), 'Chấm dứt hợp đồng lao động (Kỷ luật / Doanh nghiệp cho thôi việc)');
          histReq.input('oldPos', sql.NVarChar(100), contract.PositionName || '');
          histReq.input('newPos', sql.NVarChar(100), 'Đã thôi việc');
          histReq.input('oldDept', sql.NVarChar(100), contract.DepartmentName || '');
          histReq.input('newDept', sql.NVarChar(100), contract.DepartmentName || '');
          histReq.input('note', sql.NVarChar(255), `QĐ: ${decisionNumber} | BB: ${evaluationMeetingNumber} | ${termNote}`.slice(0, 255));
          await histReq.query(`
            INSERT INTO tblCareerHistory (EmployeeId, EventDate, EventName, OldPosition, NewPosition, OldDepartment, NewDepartment, Note)
            VALUES (@empId, @eventDate, @eventName, @oldPos, @newPos, @oldDept, @newDept, @note)
          `);
        } catch (hErr) {}

        try {
          if (contract.Email) {
            await EmailService.sendDismissalEmail({
              employeeEmail: contract.Email,
              employeeName: contract.FullName,
              jobTitle: contract.PositionName || 'Nhân sự',
              terminationDate: termDate,
              decisionNumber,
              evaluationMeetingNumber,
              reason: termReason,
              contractNumber: contract.ContractNumber,
              attachments
            });
          }
        } catch (mErr) {
          console.error('Lỗi gửi email:', mErr);
        }

        return sendSuccess(res, { ContractId: parseInt(id), Status: 'Đã chấm dứt', EmployeeWorkStatus: 'Đã thôi việc' }, 'Đã ban hành quyết định chấm dứt hợp đồng lao động, thu hồi tài khoản và gửi email thông báo đến nhân sự!');
      } else {
        const propReq = pool.request();
        propReq.input('id', sql.Int, parseInt(id));
        propReq.input('termDate', sql.Date, termDate);
        propReq.input('termType', sql.NVarChar(100), 'Thỏa thuận hai bên');
        propReq.input('reason', sql.NVarChar(255), termReason);
        propReq.input('note', sql.NVarChar(sql.MAX), termNote);
        await propReq.query(`
          UPDATE tblContract SET
            TerminationType = @termType,
            TerminationStatus = N'Chờ nhân viên duyệt',
            TerminationRequestedBy = 'HR',
            TerminationDate = @termDate,
            TerminationReason = @reason,
            TerminationNote = @note
          WHERE ContractId = @id
        `);

        return sendSuccess(res, { ContractId: parseInt(id), TerminationStatus: 'Chờ nhân viên duyệt' }, 'Đã tạo đề xuất thỏa thuận chấm dứt hợp đồng! Yêu cầu đã chuyển đến tài khoản của nhân viên để duyệt xác nhận.');
      }
    } catch (error) {
      console.error('[LaborContractController.terminateContract] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async respondResignation(req, res) {
    try {
      const { id } = req.params;
      const pool = await connectDb();
      const { approved, hrNote } = req.body;

      const checkReq = pool.request();
      checkReq.input('id', sql.Int, parseInt(id));
      const checkRes = await checkReq.query(`
        SELECT c.*, e.FullName, e.Email, e.UserId, p.PositionName, d.DepartmentName
        FROM tblContract c
        JOIN tblEmployee e ON c.EmployeeId = e.EmployeeId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        WHERE c.ContractId = @id
      `);

      const contract = checkRes.recordset[0];
      if (!contract) {
        return sendError(res, 'Không tìm thấy hợp đồng lao động!', 404);
      }

      if (contract.TerminationStatus !== 'Chờ HR duyệt') {
        return sendError(res, 'Hợp đồng này không có đơn xin thôi việc nào đang chờ duyệt!', 400);
      }

      if (approved) {
        const termDate = contract.TerminationDate || new Date().toISOString().slice(0, 10);
        const confirmReq = pool.request();
        confirmReq.input('id', sql.Int, parseInt(id));
        confirmReq.input('tDate', sql.Date, termDate);
        confirmReq.input('hrNote', sql.NVarChar(sql.MAX), hrNote ? ` | Phản hồi HR: ${hrNote}` : '');
        await confirmReq.query(`
          UPDATE tblContract SET
            Status = N'Đã chấm dứt',
            EndDate = @tDate,
            TerminationStatus = N'Đã chấp thuận',
            TerminationNote = COALESCE(TerminationNote, '') + @hrNote
          WHERE ContractId = @id
        `);

        const empReq = pool.request();
        empReq.input('empId', sql.Int, contract.EmployeeId);
        await empReq.query(`
          UPDATE tblEmployee SET WorkStatus = N'Đã thôi việc', UpdatedAt = SYSDATETIME() WHERE EmployeeId = @empId;
          UPDATE tblUser SET IsLocked = 1, UpdatedAt = SYSDATETIME() WHERE UserId = (SELECT UserId FROM tblEmployee WHERE EmployeeId = @empId);
        `);

        try {
          const histReq = pool.request();
          histReq.input('empId', sql.Int, contract.EmployeeId);
          histReq.input('eDate', sql.Date, termDate);
          histReq.input('note', sql.NVarChar(255), `Nhân viên xin thôi việc hợp lệ: ${contract.TerminationReason || 'Nguyện vọng cá nhân'}`.slice(0, 255));
          await histReq.query(`
            INSERT INTO tblCareerHistory (EmployeeId, EventDate, EventName, OldPosition, NewPosition, OldDepartment, NewDepartment, Note)
            VALUES (@empId, @eDate, N'Chấm dứt hợp đồng lao động (Nhân viên xin thôi việc)', N'Nhân viên', N'Đã thôi việc', N'Công ty', N'Công ty', @note)
          `);
        } catch (hErr) {}

        try {
          if (contract.Email) {
            await EmailService.sendTerminationApproveEmail({
              employeeEmail: contract.Email,
              employeeName: contract.FullName,
              jobTitle: contract.PositionName || 'Nhân sự',
              terminationDate: termDate,
              contractNumber: contract.ContractNumber
            });
          }
        } catch (mErr) {
          console.error('Lỗi gửi email:', mErr);
        }

        return sendSuccess(res, { ContractId: parseInt(id), Status: 'Đã chấm dứt' }, 'Đã chấp thuận đơn xin thôi việc của nhân sự, thu hồi tài khoản và gửi email xác nhận!');
      } else {
        const rejectReq = pool.request();
        rejectReq.input('id', sql.Int, parseInt(id));
        rejectReq.input('hrNote', sql.NVarChar(sql.MAX), hrNote ? ` | HR từ chối: ${hrNote}` : '');
        await rejectReq.query(`
          UPDATE tblContract SET
            TerminationStatus = N'Từ chối',
            TerminationNote = COALESCE(TerminationNote, '') + @hrNote
          WHERE ContractId = @id
        `);
        return sendSuccess(res, { ContractId: parseInt(id), TerminationStatus: 'Từ chối' }, 'Đã từ chối đơn xin thôi việc của nhân sự.');
      }
    } catch (error) {
      console.error('[LaborContractController.respondResignation] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async getEmployeeContractOverview(req, res) {
    try {
      const pool = await connectDb();
      const query = `
        SELECT 
          e.EmployeeId,
          e.EmployeeCode,
          e.FullName,
          e.Email,
          e.AvatarUrl,
          d.DepartmentName,
          p.PositionName,
          (SELECT COUNT(*) FROM tblContract c WHERE c.EmployeeId = e.EmployeeId) AS ContractCount,
          (
            SELECT TOP 1 c.ContractNumber 
            FROM tblContract c 
            WHERE c.EmployeeId = e.EmployeeId 
            ORDER BY c.StartDate DESC
          ) AS LatestContractNumber,
          (
            SELECT TOP 1 c.ContractType 
            FROM tblContract c 
            WHERE c.EmployeeId = e.EmployeeId 
            ORDER BY c.StartDate DESC
          ) AS LatestContractType,
          (
            SELECT TOP 1 c.Status 
            FROM tblContract c 
            WHERE c.EmployeeId = e.EmployeeId 
            ORDER BY c.StartDate DESC
          ) AS LatestContractStatus,
          (
            SELECT TOP 1 CONVERT(varchar, c.EndDate, 23) 
            FROM tblContract c 
            WHERE c.EmployeeId = e.EmployeeId 
            ORDER BY c.StartDate DESC
          ) AS LatestContractEndDate
        FROM tblEmployee e
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        ORDER BY e.FullName ASC
      `;

      const result = await pool.request().query(query);
      return sendSuccess(res, result.recordset, 'Lấy danh sách nhân viên thành công!');
    } catch (error) {
      console.error('[LaborContractController.getEmployeeContractOverview] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }
}

