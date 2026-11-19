import express from 'express';
import { LeaveController } from '../Controllers/LeaveController.js';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';

const router = express.Router();

// 1. Danh mục loại nghỉ & Hạn mức phép
router.get('/types', LeaveController.getLeaveTypes);
router.get('/quota/:employeeId', verifyToken, LeaveController.getQuota);
router.get('/colleagues', verifyToken, LeaveController.getColleagues);

// 2. Phân quyền Employee (US-23): Quản lý & Tạo đơn cá nhân
router.get('/my-requests', verifyToken, LeaveController.getMyRequests);
router.post('/', verifyToken, LeaveController.createRequest);
router.patch('/:id/cancel', verifyToken, LeaveController.cancelRequest);

// 3. Phân quyền Manager (US-17): Phê duyệt nhóm trực thuộc
router.get('/team', verifyToken, requireRole('Manager', 'Admin', 'HR'), LeaveController.getTeamRequests);

// 4. Phê duyệt & Từ chối đơn (Manager & HR & Admin)
router.patch('/:id/approve', verifyToken, requireRole('Manager', 'HR', 'Admin'), LeaveController.approveRequest);
router.patch('/:id/reject', verifyToken, requireRole('Manager', 'HR', 'Admin'), LeaveController.rejectRequest);

// 5. Phân quyền HR (US-12): Quản lý tập trung toàn công ty
router.get('/all', verifyToken, requireRole('HR', 'Admin'), LeaveController.getAllRequests);

export default router;
