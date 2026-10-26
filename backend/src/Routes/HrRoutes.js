import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { connectDb } from '../Config/DbConfig.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';

const router = express.Router();

router.use(verifyToken, requireRole('HR', 'Admin'));

router.get('/employees', async (req, res) => {
  try {
    const pool = await connectDb();
    const result = await pool.request().query(`
      SELECT e.EmployeeId, e.EmployeeCode as id, e.FullName as name, e.Gender as gender,
             CONVERT(varchar, e.BirthDate, 103) as birthDate, e.Phone as phone, e.Email as email,
             d.DepartmentName as department, p.PositionName as position,
             CONVERT(varchar, e.JoinDate, 103) as joinDate, e.WorkStatus as status,
             e.BaseSalary as baseSalary, e.InsuranceSalary as insuranceSalary,
             e.FaceRegistered as faceRegistered, e.DependentsCount as dependents,
             e.BankName as bankName, e.BankAccountNumber as bankAccount,
             e.IdCardNumber as idCard, e.TaxCode as taxCode
      FROM tblEmployee e
      LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
      LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
      ORDER BY e.EmployeeId DESC
    `);
    return sendSuccess(res, result.recordset, 'Lấy danh sách nhân sự thành công!');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
});

export default router;
