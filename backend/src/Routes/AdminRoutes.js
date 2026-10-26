import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { UserModel } from '../Models/UserModel.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';

const router = express.Router();

router.use(verifyToken, requireRole('Admin'));

router.get('/accounts', async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    return sendSuccess(res, users, 'Lấy danh sách tài khoản thành công!');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
});

router.put('/accounts/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { roleCode } = req.body;
    if (!roleCode) {
      return sendError(res, 'Vui lòng cung cấp mã vai trò mới (roleCode)!', 400);
    }
    const result = await UserModel.updateUserRole(parseInt(id), roleCode);
    return sendSuccess(res, result, `Cập nhật phân quyền tài khoản thành công sang ${roleCode}!`);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
});

router.put('/accounts/:id/lock', async (req, res) => {
  try {
    const { id } = req.params;
    const isLocked = await UserModel.toggleUserLock(parseInt(id));
    return sendSuccess(res, { isLocked }, isLocked ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản thành công!');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
});

router.get('/logs', async (req, res) => {
  try {
    const { connectDb } = await import('../Config/DbConfig.js');
    const pool = await connectDb();
    const result = await pool.request().query(`
      SELECT TOP 50 l.LogId as id, l.Action as action, l.TableName as target,
             l.IpAddress as ip, l.Description as details,
             CONVERT(varchar, l.CreatedAt, 120) as timestamp,
             COALESCE(u.Username, 'SYSTEM') as user
      FROM tblAuditLog l
      LEFT JOIN tblUser u ON l.UserId = u.UserId
      ORDER BY l.LogId DESC
    `);
    return sendSuccess(res, result.recordset, 'Lấy danh sách nhật ký hệ thống thành công!');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
});

export default router;
