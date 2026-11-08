import express from 'express';
import { LaborContractController } from '../Controllers/LaborContractController.js';

const router = express.Router();

// Lấy danh sách hợp đồng (lọc, tìm kiếm, sắp hết hạn)
router.get('/', LaborContractController.getContracts);

// Thống kê KPI hợp đồng
router.get('/stats', LaborContractController.getContractStats);

// Cảnh báo các hợp đồng sắp hết hạn
router.get('/expiring-alerts', LaborContractController.getExpiringAlerts);

// Danh sách nhân viên và tình trạng hợp đồng phục vụ lọc / dropdown
router.get('/employees-overview', LaborContractController.getEmployeeContractOverview);

// Tra cứu lịch sử hợp đồng của 1 nhân viên theo các giai đoạn làm việc
router.get('/history/:employeeId', LaborContractController.getEmployeeContractHistory);

// Chi tiết 1 hợp đồng
router.get('/:id', LaborContractController.getContractById);

// Thêm mới hợp đồng
router.post('/', LaborContractController.createContract);

// Cập nhật hợp đồng
router.put('/:id', LaborContractController.updateContract);

// Xóa hợp đồng
router.delete('/:id', LaborContractController.deleteContract);

// Gia hạn / Ký tiếp hợp đồng mới
router.post('/:id/renew', LaborContractController.renewContract);

export default router;

