import { connectDb, sql } from '../../Config/DbConfig.js';
import { sendSuccess, sendError } from '../../Utils/ResponseHelper.js';
import { EmailService } from '../../Services/EmailService.js';

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

    static async getMyContracts(req, res) {
        try {
            const employeeId = req.user?.employeeId;
            if (!employeeId) {
                return sendSuccess(res, [], 'Chưa có thông tin nhân viên!');
            }
            const pool = await connectDb();
            const request = pool.request();
            request.input('empId', sql.Int, employeeId);
            const query = `
                SELECT 
                  c.ContractId,
                  c.ContractNumber,
                  c.EmployeeId,
                  e.EmployeeCode,
                  e.FullName as EmployeeName,
                  e.Gender,
                  CONVERT(varchar, e.BirthDate, 23) as BirthDate,
                  e.Address,
                  e.IdCardNumber,
                  e.Phone,
                  e.Email,
                  e.BankAccountNumber,
                  e.BankName,
                  d.DepartmentName,
                  p.PositionName,
                  c.ContractType,
                  CONVERT(varchar, c.SignDate, 23) as SignDate,
                  CONVERT(varchar, c.StartDate, 23) as StartDate,
                  CONVERT(varchar, c.EndDate, 23) as EndDate,
                  c.AgreedSalary,
                  c.Status,
                  c.ContractFileUrl,
                  c.TerminationType,
                  c.TerminationStatus,
                  c.TerminationRequestedBy,
                  CONVERT(varchar, c.TerminationDate, 23) as TerminationDate,
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
                WHERE c.EmployeeId = @empId
                ORDER BY c.ContractId DESC
            `;
            const result = await request.query(query);
            return sendSuccess(res, result.recordset, 'Lấy danh sách hợp đồng của bạn thành công!');
        } catch (error) {
            console.error('[ContractController.getMyContracts] Error:', error);
            return sendError(res, error.message, 500, error);
        }
    }

    static async signContract(req, res) {
        try {
            const { id } = req.params;
            const employeeId = req.user?.employeeId;
            const pool = await connectDb();

            const checkReq = pool.request();
            checkReq.input('id', sql.Int, parseInt(id));
            const checkRes = await checkReq.query('SELECT ContractId, EmployeeId, Status, AgreedSalary FROM tblContract WHERE ContractId = @id');
            const contract = checkRes.recordset[0];
            if (!contract) {
                return sendError(res, 'Không tìm thấy hợp đồng lao động!', 404);
            }

            if (employeeId && contract.EmployeeId !== employeeId && req.user?.role === 'Employee') {
                return sendError(res, 'Bạn không có quyền ký hợp đồng của nhân sự khác!', 403);
            }

            const signReq = pool.request();
            signReq.input('id', sql.Int, parseInt(id));
            signReq.input('signDate', sql.Date, new Date().toISOString().slice(0, 10));
            await signReq.query(`
                UPDATE tblContract SET
                  Status = N'Hiệu lực',
                  SignDate = @signDate
                WHERE ContractId = @id
            `);

            if (contract.EmployeeId) {
                const syncEmpReq = pool.request();
                syncEmpReq.input('empId', sql.Int, contract.EmployeeId);
                syncEmpReq.input('sal', sql.Decimal(18, 2), contract.AgreedSalary || 0);
                await syncEmpReq.query(`
                    UPDATE tblOnboarding SET ContractSigned = 1 WHERE EmployeeId = @empId;
                    UPDATE tblEmployee 
                    SET BaseSalary = CASE WHEN @sal > 0 THEN @sal ELSE BaseSalary END,
                        InsuranceSalary = CASE WHEN @sal > 0 AND (InsuranceSalary IS NULL OR InsuranceSalary = 0 OR InsuranceSalary = BaseSalary) THEN @sal ELSE InsuranceSalary END,
                        UpdatedAt = SYSDATETIME()
                    WHERE EmployeeId = @empId;
                `);
            }

            return sendSuccess(res, { ContractId: parseInt(id), Status: 'Hiệu lực' }, 'Ký hợp đồng lao động điện tử thành công!');
        } catch (error) {
            console.error('[ContractController.signContract] Error:', error);
            return sendError(res, error.message, 500, error);
        }
    }

    static async requestResignation(req, res) {
        try {
            const { id } = req.params;
            const employeeId = req.user?.employeeId;
            const pool = await connectDb();
            const { terminateDate, reason, note } = req.body;

            if (!employeeId) {
                return sendError(res, 'Chưa xác thực thông tin nhân sự!', 401);
            }

            if (!terminateDate) {
                return sendError(res, 'Vui lòng chọn ngày nghỉ việc dự kiến!', 400);
            }

            const checkReq = pool.request();
            checkReq.input('id', sql.Int, parseInt(id));
            checkReq.input('empId', sql.Int, employeeId);
            const checkRes = await checkReq.query(`
                SELECT c.*, e.FullName, e.Email, e.UserId
                FROM tblContract c
                JOIN tblEmployee e ON c.EmployeeId = e.EmployeeId
                WHERE c.ContractId = @id AND c.EmployeeId = @empId
            `);

            const contract = checkRes.recordset[0];
            if (!contract) {
                return sendError(res, 'Không tìm thấy hợp đồng lao động của bạn!', 404);
            }

            if (contract.Status === 'Đã chấm dứt') {
                return sendError(res, 'Hợp đồng này đã chấm dứt hiệu lực từ trước!', 400);
            }

            const cType = (contract.ContractType || '').toLowerCase();
            let minNoticeDays = 30;
            if (cType.includes('vô thời hạn') || cType.includes('không xác định')) {
                minNoticeDays = 45;
            } else if (cType.includes('thử việc') || cType.includes('dưới 12 tháng')) {
                minNoticeDays = 3;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(terminateDate);
            selectedDate.setHours(0, 0, 0, 0);

            const diffTime = selectedDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const earliestDate = new Date(today);
            earliestDate.setDate(earliestDate.getDate() + minNoticeDays);
            const earliestDateStr = earliestDate.toISOString().slice(0, 10);

            if (diffDays < minNoticeDays) {
                return sendError(
                    res,
                    `Theo Điều 35 Bộ luật Lao động 2019, đối với "${contract.ContractType}", bạn phải thông báo trước ít nhất ${minNoticeDays} ngày. Ngày nghỉ việc hợp lệ sớm nhất là ngày: ${earliestDateStr}. Vui lòng chọn lại ngày nghỉ đúng quy định!`,
                    400
                );
            }

            const updateReq = pool.request();
            updateReq.input('id', sql.Int, parseInt(id));
            updateReq.input('tDate', sql.Date, terminateDate);
            updateReq.input('reason', sql.NVarChar(255), reason || 'Nguyện vọng cá nhân');
            updateReq.input('note', sql.NVarChar(sql.MAX), note || null);
            await updateReq.query(`
                UPDATE tblContract SET
                  TerminationType = N'Nhân viên xin nghỉ',
                  TerminationStatus = N'Chờ HR duyệt',
                  TerminationRequestedBy = 'Employee',
                  TerminationDate = @tDate,
                  TerminationReason = @reason,
                  TerminationNote = @note
                WHERE ContractId = @id
            `);

            return sendSuccess(res, { ContractId: parseInt(id), TerminationStatus: 'Chờ HR duyệt' }, 'Đã gửi đơn xin nghỉ việc lên phòng Nhân sự thành công! Yêu cầu đang được xem xét.');
        } catch (error) {
            console.error('[ContractController.requestResignation] Error:', error);
            return sendError(res, error.message, 500, error);
        }
    }

    static async respondTermination(req, res) {
        try {
            const { id } = req.params;
            const employeeId = req.user?.employeeId;
            const { approved } = req.body;
            const pool = await connectDb();

            const checkReq = pool.request();
            checkReq.input('id', sql.Int, parseInt(id));
            checkReq.input('empId', sql.Int, employeeId);
            const checkRes = await checkReq.query(`
                SELECT c.*, e.FullName, e.Email, e.UserId, p.PositionName, d.DepartmentName
                FROM tblContract c
                JOIN tblEmployee e ON c.EmployeeId = e.EmployeeId
                LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
                LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
                WHERE c.ContractId = @id AND c.EmployeeId = @empId
            `);

            const contract = checkRes.recordset[0];
            if (!contract) {
                return sendError(res, 'Không tìm thấy hợp đồng lao động!', 404);
            }

            if (contract.TerminationStatus !== 'Chờ nhân viên duyệt') {
                return sendError(res, 'Hợp đồng này không có đề xuất chấm dứt nào đang chờ bạn duyệt!', 400);
            }

            if (approved) {
                const termDate = contract.TerminationDate || new Date().toISOString().slice(0, 10);
                const confirmReq = pool.request();
                confirmReq.input('id', sql.Int, parseInt(id));
                confirmReq.input('tDate', sql.Date, termDate);
                await confirmReq.query(`
                    UPDATE tblContract SET
                      Status = N'Đã chấm dứt',
                      EndDate = @tDate,
                      TerminationStatus = N'Đã chấp thuận'
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
                    histReq.input('note', sql.NVarChar(255), `Thỏa thuận chấm dứt HĐ: ${contract.TerminationReason || 'Thôi việc tự nguyện'}`);
                    await histReq.query(`
                        INSERT INTO tblCareerHistory (EmployeeId, EventDate, EventName, OldPosition, NewPosition, OldDepartment, NewDepartment, Note)
                        VALUES (@empId, @eDate, N'Chấm dứt hợp đồng lao động', N'Nhân viên', N'Đã thôi việc', N'Công ty', N'Công ty', @note)
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

                return sendSuccess(res, { ContractId: parseInt(id), Status: 'Đã chấm dứt' }, 'Bạn đã ký duyệt biên bản thỏa thuận chấm dứt hợp đồng lao động thành công! Tài khoản sẽ được thu hồi sau khi hoàn tất thủ tục.');
            } else {
                const rejectReq = pool.request();
                rejectReq.input('id', sql.Int, parseInt(id));
                await rejectReq.query(`
                    UPDATE tblContract SET
                      TerminationStatus = N'Từ chối'
                    WHERE ContractId = @id
                `);
                return sendSuccess(res, { ContractId: parseInt(id), TerminationStatus: 'Từ chối' }, 'Bạn đã từ chối đề xuất chấm dứt hợp đồng.');
            }
        } catch (error) {
            console.error('[ContractController.respondTermination] Error:', error);
            return sendError(res, error.message, 500, error);
        }
    }
}
