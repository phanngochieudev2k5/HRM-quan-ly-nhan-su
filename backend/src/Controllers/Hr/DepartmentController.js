import { connectDb } from '../../Config/DbConfig.js';
import { sendSuccess, sendError } from '../../Utils/ResponseHelper.js';

export class DepartmentController {
    static async getDepartments(req, res) {
        try {
            const pool = await connectDb();
            const result = await pool.request().query(`
        SELECT DepartmentId, DepartmentCode, DepartmentName, Description, HeadCount
        FROM tblDepartment
        ORDER BY DepartmentId ASC
      `);
            return sendSuccess(
                res,
                result.recordset,
                'Lấy danh sách phòng ban thành công!',
            );
        } catch (error) {
            console.error(
                '[DepartmentController.getDepartments] Error:',
                error,
            );
            return sendError(res, error.message, 500, error);
        }
    }

    static async getPositions(req, res) {
        try {
            const pool = await connectDb();
            const result = await pool.request().query(`
        SELECT PositionId, PositionCode, PositionName, BaseSalaryMin, BaseSalaryMax
        FROM tblPosition
        ORDER BY PositionId ASC
      `);
            return sendSuccess(
                res,
                result.recordset,
                'Lấy danh sách chức vụ thành công!',
            );
        } catch (error) {
            console.error('[DepartmentController.getPositions] Error:', error);
            return sendError(res, error.message, 500, error);
        }
    }
}
