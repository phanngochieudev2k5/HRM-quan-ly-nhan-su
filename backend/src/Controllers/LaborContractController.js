import { connectDb, sql } from '../Config/DbConfig.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';

export class LaborContractController {
  
  /**
   * Lấy danh sách hợp đồng lao động toàn doanh nghiệp
   * Hỗ trợ tìm kiếm, lọc theo trạng thái, loại hợp đồng, phòng ban, cảnh báo hết hạn
   */
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

      // Lọc theo số ngày sắp hết hạn (ví dụ: 15, 30, 60 ngày)
      if (expiringDays && parseInt(expiringDays)) {
        request.input('expiringDays', sql.Int, parseInt(expiringDays));
        whereConditions.push(`(
          c.EndDate IS NOT NULL 
          AND c.EndDate >= CAST(GETDATE() AS DATE) 
          AND DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= @expiringDays
          AND c.Status NOT IN (N'Đã chấm dứt', N'Hết hạn')
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
          c.CreatedAt,
          CASE 
            WHEN c.EndDate IS NOT NULL THEN DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate)
            ELSE NULL 
          END AS DaysRemaining,
          CASE 
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

  /**
   * Thống kê KPI hợp đồng và cảnh báo thời hạn
   */
  static async getContractStats(req, res) {
    try {
      const pool = await connectDb();
      const statsQuery = `
        SELECT 
          COUNT(*) AS totalContracts,
          COUNT(DISTINCT c.EmployeeId) AS totalEmployeesWithContract,
          SUM(CASE WHEN c.Status = N'Hiệu lực' AND (c.EndDate IS NULL OR c.EndDate >= CAST(GETDATE() AS DATE)) THEN 1 ELSE 0 END) AS activeContracts,
          SUM(CASE 
            WHEN c.EndDate IS NOT NULL 
              AND c.EndDate >= CAST(GETDATE() AS DATE) 
              AND DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 30 
              AND c.Status NOT IN (N'Đã chấm dứt', N'Hết hạn') 
            THEN 1 ELSE 0 
          END) AS expiringSoon30,
          SUM(CASE 
            WHEN c.EndDate IS NOT NULL 
              AND c.EndDate >= CAST(GETDATE() AS DATE) 
              AND DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 15 
              AND c.Status NOT IN (N'Đã chấm dứt', N'Hết hạn') 
            THEN 1 ELSE 0 
          END) AS expiringSoon15,
          SUM(CASE 
            WHEN c.EndDate IS NOT NULL 
              AND c.EndDate >= CAST(GETDATE() AS DATE) 
              AND DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate) <= 60 
              AND c.Status NOT IN (N'Đã chấm dứt', N'Hết hạn') 
            THEN 1 ELSE 0 
          END) AS expiringSoon60,
          SUM(CASE 
            WHEN (c.EndDate IS NOT NULL AND c.EndDate < CAST(GETDATE() AS DATE)) 
              OR c.Status IN (N'Hết hạn', N'Đã chấm dứt') 
            THEN 1 ELSE 0 
          END) AS expiredContracts,
          SUM(CASE 
            WHEN c.EndDate IS NULL 
              OR c.ContractType LIKE N'%vô thời hạn%' 
              OR c.ContractType LIKE N'%không xác định%' 
            THEN 1 ELSE 0 
          END) AS permanentContracts,
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

  /**
   * Lấy danh sách hợp đồng cảnh báo sắp hết hạn (trong vòng N ngày, mặc định 30 ngày)
   */
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
          AND c.Status NOT IN (N'Đã chấm dứt', N'Hết hạn')
        ORDER BY c.EndDate ASC
      `;

      const result = await request.query(query);
      return sendSuccess(res, result.recordset, 'Lấy danh sách hợp đồng sắp hết hạn thành công!');
    } catch (error) {
      console.error('[LaborContractController.getExpiringAlerts] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  /**
   * Tra cứu toàn bộ lịch sử hợp đồng của 1 nhân viên cụ thể qua các giai đoạn làm việc
   */
  static async getEmployeeContractHistory(req, res) {
    try {
      const { employeeId } = req.params;
      const pool = await connectDb();

      // 1. Lấy thông tin nhân viên
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

      // 2. Lấy danh sách hợp đồng theo tiến trình thời gian
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
          c.CreatedAt,
          CASE 
            WHEN c.EndDate IS NOT NULL THEN DATEDIFF(day, CAST(GETDATE() AS DATE), c.EndDate)
            ELSE NULL 
          END AS DaysRemaining,
          CASE 
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

      // Tính toán giai đoạn (Stage 1, Stage 2,...)
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

  /**
   * Lấy chi tiết một hợp đồng
   */
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

  /**
   * Tạo mới hợp đồng lao động
   */
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

      // Sinh mã hợp đồng tự động nếu không nhập: HD-YYYY-XXX
      let contractNumber = (body.contractNumber || body.ContractNumber || '').trim();
      if (!contractNumber) {
        const year = new Date().getFullYear();
        const countRes = await pool.request().query('SELECT COUNT(*) AS total FROM tblContract');
        const nextNum = (countRes.recordset[0]?.total || 0) + 1;
        contractNumber = `HD-${year}-${String(nextNum).padStart(3, '0')}`;
      } else {
        // Kiểm tra trùng số hợp đồng
        const checkReq = pool.request();
        checkReq.input('cNum', sql.VarChar(50), contractNumber);
        const checkRes = await checkReq.query('SELECT ContractId FROM tblContract WHERE ContractNumber = @cNum');
        if (checkRes.recordset && checkRes.recordset.length > 0) {
          return sendError(res, `Số hợp đồng "${contractNumber}" đã tồn tại trong hệ thống! Vui lòng chọn số khác.`, 400);
        }
      }

      // Nếu tạo hợp đồng mới có hiệu lực, tự động cập nhật các hợp đồng cũ đang "Hiệu lực" của nhân viên này sang "Hết hạn"
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

      // Đồng bộ mức lương thỏa thuận sang BaseSalary của tblEmployee
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

  /**
   * Cập nhật thông tin hợp đồng lao động
   */
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

      // Kiểm tra trùng số hợp đồng nếu thay đổi
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

      // Đồng bộ mức lương sang tblEmployee nếu cập nhật lương cho hợp đồng đang áp dụng
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

  /**
   * Xóa hợp đồng lao động
   */
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

  /**
   * Gia hạn / Ký tiếp hợp đồng mới (Renew Contract)
   * Chuyển trạng thái hợp đồng cũ sang 'Đã gia hạn' và tạo hợp đồng mới tiếp nối
   */
  static async renewContract(req, res) {
    try {
      const { id } = req.params;
      const pool = await connectDb();
      const body = req.body;

      // 1. Lấy thông tin hợp đồng cũ
      const oldReq = pool.request();
      oldReq.input('id', sql.Int, parseInt(id));
      const oldRes = await oldReq.query('SELECT * FROM tblContract WHERE ContractId = @id');

      if (!oldRes.recordset || oldRes.recordset.length === 0) {
        return sendError(res, 'Không tìm thấy hợp đồng cần gia hạn!', 404);
      }

      const oldContract = oldRes.recordset[0];
      const employeeId = oldContract.EmployeeId;

      // 2. Chuẩn bị thông tin hợp đồng mới
      const year = new Date().getFullYear();
      const countRes = await pool.request().query('SELECT COUNT(*) AS total FROM tblContract');
      const nextNum = (countRes.recordset[0]?.total || 0) + 1;
      const newContractNumber = (body.contractNumber || body.ContractNumber || `HD-${year}-${String(nextNum).padStart(3, '0')}`).trim();

      const newContractType = (body.contractType || body.ContractType || 'Hợp đồng xác định thời hạn 3 năm').trim();
      const newSignDate = body.signDate || body.SignDate || new Date().toISOString().slice(0, 10);
      
      // Ngày bắt đầu hợp đồng mới: nếu không truyền thì bắt đầu ngay sau ngày kết thúc hợp đồng cũ (hoặc hôm nay)
      let defaultStart = new Date();
      if (oldContract.EndDate) {
        defaultStart = new Date(oldContract.EndDate);
        defaultStart.setDate(defaultStart.getDate() + 1);
      }
      const newStartDate = body.startDate || body.StartDate || defaultStart.toISOString().slice(0, 10);
      const newEndDate = body.endDate !== undefined ? body.endDate : (body.EndDate !== undefined ? body.EndDate : null);
      const newSalary = parseFloat(body.agreedSalary || body.AgreedSalary) || parseFloat(oldContract.AgreedSalary) || 0;
      const newFileUrl = body.contractFileUrl || body.ContractFileUrl || null;

      // 3. Cập nhật hợp đồng cũ sang trạng thái "Đã gia hạn"
      const updateOldReq = pool.request();
      updateOldReq.input('oldId', sql.Int, parseInt(id));
      await updateOldReq.query(`
        UPDATE tblContract 
        SET Status = N'Hết hạn'
        WHERE ContractId = @oldId
      `);

      // 4. Tạo hợp đồng mới
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

      // Đồng bộ mức lương mới sang tblEmployee
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

  /**
   * Lấy danh sách nhân viên kèm trạng thái hợp đồng hiện tại để phục vụ dropdown / chọn lựa
   */
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

