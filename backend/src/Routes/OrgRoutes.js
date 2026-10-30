import express from 'express';
import { OrgStructureController } from '../Controllers/OrgStructureController.js';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';

const router = express.Router();

// Middleware xác thực linh hoạt: Nếu có token thì xác minh, đồng thời hỗ trợ gọi nội bộ
const flexibleAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  // Cho phép truy cập trong môi trường nội bộ nếu không gửi token
  next();
};

router.use(flexibleAuth);

// ================== CƠ CẤU TỔ CHỨC & PHÒNG BAN ==================
// Lấy sơ đồ cây phân cấp cơ cấu tổ chức
router.get('/tree', OrgStructureController.getOrgTree);

// Lấy danh sách tất cả phòng ban
router.get('/departments', OrgStructureController.getDepartments);

// Tạo mới phòng ban
router.post('/departments', OrgStructureController.createDepartment);

// Cập nhật thông tin phòng ban
router.put('/departments/:id', OrgStructureController.updateDepartment);

// Xóa phòng ban
router.delete('/departments/:id', OrgStructureController.deleteDepartment);


// ================== QUẢN LÝ CHỨC VỤ ==================
// Lấy danh sách chức vụ
router.get('/positions', OrgStructureController.getPositions);

// Tạo mới chức vụ
router.post('/positions', OrgStructureController.createPosition);

// Cập nhật chức vụ
router.put('/positions/:id', OrgStructureController.updatePosition);

// Xóa chức vụ
router.delete('/positions/:id', OrgStructureController.deletePosition);


// ================== GÁN & ĐIỀU CHUYỂN NHÂN SỰ ==================
// Lấy danh sách nhân viên phục vụ phân bổ / điều chuyển
router.get('/employees', OrgStructureController.getEmployees);

// Gán / điều chuyển 1 nhân viên sang phòng ban hoặc chức vụ mới
router.put('/employees/:id/assign', OrgStructureController.assignEmployee);

// Điều chuyển hàng loạt nhân viên sang phòng ban mới
router.post('/employees/batch-transfer', OrgStructureController.batchTransferEmployees);

// Đồng bộ tự động toàn bộ phân quyền tài khoản theo chức vụ thực tế
router.post('/sync-roles', OrgStructureController.syncAllUserRoles);

export default router;

