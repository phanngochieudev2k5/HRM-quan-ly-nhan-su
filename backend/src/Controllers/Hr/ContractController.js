import { connectDb, sql } from '../../Config/DbConfig.js';
import { sendSuccess, sendError } from '../../Utils/ResponseHelper.js';

export class ContractController {
    static async getContracts(req, res) {
        try {
            const pool = await connectDb();
            const employeeId = req.query.employeeId
                ? parseInt(req.query.employeeId)
                : null;
            const status = (req.query.status || '').trim();
            const search = (req.query.search || req.query.q || '').trim();

            const request = pool.request();
            let whereConditions = ['1=1'];

            if (employeeId) {
                request.input('empId', sql.Int, employeeId);
                whereConditions.push('c.EmployeeId = @empId');
            }

            if (status && status !== 'all') {
                request.input('status', sql.NVarChar(50), status);
                whereConditions.push('c.Status = @status');
            }

            if (search) {
                request.input('search', sql.NVarChar(100), `%${search}%`);
                whereConditions.push(
                    '(c.ContractNumber LIKE @search OR e.FullName LIKE @search OR e.EmployeeCode LIKE @search)',
                );
            }

            const query = `
        SELECT 
          c.ContractId,
          c.ContractNumber,
          c.EmployeeId,
          e.EmployeeCode,
          e.FullName as EmployeeName,
          c.ContractType,
          CONVERT(varchar, c.SignDate, 23) as SignDate,
          CONVERT(varchar, c.StartDate, 23) as StartDate,
          CONVERT(varchar, c.EndDate, 23) as EndDate,
          c.AgreedSalary,
          c.Status,
          c.ContractFileUrl,
          c.CreatedAt
        FROM tblContract c
        JOIN tblEmployee e ON c.EmployeeId = e.EmployeeId
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY c.StartDate DESC
      `;

            const result = await request.query(query);
            return sendSuccess(
                res,
                result.recordset,
                'Lấy danh sách hợp đồng thành công!',
            );
        } catch (error) {
            console.error('[ContractController.getContracts] Error:', error);
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
          e.FullName as EmployeeName,
          c.ContractType,
          CONVERT(varchar, c.SignDate, 23) as SignDate,
          CONVERT(varchar, c.StartDate, 23) as StartDate,
          CONVERT(varchar, c.EndDate, 23) as EndDate,
          c.AgreedSalary,
          c.Status,
          c.ContractFileUrl,
          c.CreatedAt
        FROM tblContract c
        JOIN tblEmployee e ON c.EmployeeId = e.EmployeeId
        WHERE c.ContractId = @id
      `);

            if (!result.recordset || result.recordset.length === 0) {
                return sendError(res, 'Không tìm thấy hợp đồng!', 404);
            }

            return sendSuccess(
                res,
                result.recordset[0],
                'Lấy thông tin hợp đồng thành công!',
            );
        } catch (error) {
            console.error('[ContractController.getContractById] Error:', error);
            return sendError(res, error.message, 500, error);
        }
    }

    static async createContract(req, res) {
        try {
            const pool = await connectDb();
            const body = req.body;

            if (!body.EmployeeId) {
                return sendError(
                    res,
                    'Vui lòng chọn nhân viên cho hợp đồng (EmployeeId)!',
                    400,
                );
            }

            let contractNumber = (body.ContractNumber || '').trim();
            if (!contractNumber) {
                const countRes = await pool
                    .request()
                    .query('SELECT COUNT(*) as total FROM tblContract');
                const nextIdx = (countRes.recordset[0].total || 0) + 1;
                contractNumber = `HD${String(nextIdx).padStart(3, '0')}`;
            }

            const request = pool.request();
            request.input('ContractNumber', sql.VarChar(50), contractNumber);
            request.input('EmployeeId', sql.Int, parseInt(body.EmployeeId));
            request.input(
                'ContractType',
                sql.NVarChar(100),
                body.ContractType || 'Hợp đồng 1 năm',
            );
            request.input(
                'SignDate',
                sql.Date,
                body.SignDate || new Date().toISOString().slice(0, 10),
            );
            request.input(
                'StartDate',
                sql.Date,
                body.StartDate || new Date().toISOString().slice(0, 10),
            );
            request.input('EndDate', sql.Date, body.EndDate || null);
            request.input(
                'AgreedSalary',
                sql.Decimal(18, 2),
                parseFloat(body.AgreedSalary) || 0,
            );
            request.input(
                'Status',
                sql.NVarChar(50),
                body.Status || 'Hiệu lực',
            );
            request.input(
                'ContractFileUrl',
                sql.NVarChar(500),
                body.ContractFileUrl || null,
            );

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

            return sendSuccess(
                res,
                result.recordset[0],
                'Tạo mới hợp đồng lao động thành công!',
                201,
            );
        } catch (error) {
            console.error('[ContractController.createContract] Error:', error);
            return sendError(res, error.message, 500, error);
        }
    }

    static async updateContract(req, res) {
        try {
            const { id } = req.params;
            const pool = await connectDb();
            const body = req.body;

            const request = pool.request();
            request.input('id', sql.Int, parseInt(id));
            request.input(
                'ContractNumber',
                sql.VarChar(50),
                body.ContractNumber || null,
            );
            request.input(
                'ContractType',
                sql.NVarChar(100),
                body.ContractType || null,
            );
            request.input('SignDate', sql.Date, body.SignDate || null);
            request.input('StartDate', sql.Date, body.StartDate || null);
            request.input('EndDate', sql.Date, body.EndDate || null);
            request.input(
                'AgreedSalary',
                sql.Decimal(18, 2),
                body.AgreedSalary !== undefined
                    ? parseFloat(body.AgreedSalary)
                    : null,
            );
            request.input('Status', sql.NVarChar(50), body.Status || null);
            request.input(
                'ContractFileUrl',
                sql.NVarChar(500),
                body.ContractFileUrl || null,
            );

            await request.query(`
        UPDATE tblContract SET
          ContractNumber = COALESCE(@ContractNumber, ContractNumber),
          ContractType = COALESCE(@ContractType, ContractType),
          SignDate = COALESCE(@SignDate, SignDate),
          StartDate = COALESCE(@StartDate, StartDate),
          EndDate = COALESCE(@EndDate, EndDate),
          AgreedSalary = COALESCE(@AgreedSalary, AgreedSalary),
          Status = COALESCE(@Status, Status),
          ContractFileUrl = COALESCE(@ContractFileUrl, ContractFileUrl)
        WHERE ContractId = @id
      `);

            return sendSuccess(
                res,
                { ContractId: parseInt(id) },
                'Cập nhật hợp đồng thành công!',
            );
        } catch (error) {
            console.error('[ContractController.updateContract] Error:', error);
            return sendError(res, error.message, 500, error);
        }
    }

    static async deleteContract(req, res) {
        try {
            const { id } = req.params;
            const pool = await connectDb();

            const request = pool.request();
            request.input('id', sql.Int, parseInt(id));

            await request.query(
                `DELETE FROM tblContract WHERE ContractId = @id`,
            );
            return sendSuccess(
                res,
                { ContractId: parseInt(id) },
                'Xóa hợp đồng lao động thành công!',
            );
        } catch (error) {
            console.error('[ContractController.deleteContract] Error:', error);
            return sendError(res, error.message, 500, error);
        }
    }
}
