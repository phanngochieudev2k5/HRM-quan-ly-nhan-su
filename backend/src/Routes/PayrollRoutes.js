import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { PayrollController } from '../Controllers/PayrollController.js';

const router = express.Router();

router.use(verifyToken);

// Mọi nhân viên đều có thể xem phiếu lương cá nhân, kỳ lương & gửi phản hồi tới Kế toán
router.get('/my-payslip', PayrollController.getMyPayslip);
router.get('/my-periods', PayrollController.getMyPeriods);
router.post('/feedback', PayrollController.submitFeedback);
router.get('/my-feedbacks', PayrollController.getMyFeedbacks);

// Các thao tác tính toán, chốt bảng lương & xử lý phản hồi dành cho Finance / Admin / HR
router.get('/feedbacks', requireRole('Finance', 'Admin', 'HR'), PayrollController.getAllFeedbacks);
router.put('/feedback/:id/resolve', requireRole('Finance', 'Admin', 'HR'), PayrollController.resolveFeedback);

// Các thao tác tính toán & chốt bảng lương dành cho Finance / Admin / HR
router.get('/periods', requireRole('Finance', 'Admin', 'HR'), PayrollController.getPeriods);
router.get('/config', requireRole('Finance', 'Admin', 'HR'), PayrollController.getConfig);
router.put('/config', requireRole('Finance', 'Admin', 'HR'), PayrollController.updateConfig);
router.get('/preview', requireRole('Finance', 'Admin', 'HR'), PayrollController.getPayrollPreview);
router.post('/calculate', requireRole('Finance', 'Admin', 'HR'), PayrollController.calculateAndSaveDraft);
router.put('/adjustment', requireRole('Finance', 'Admin', 'HR'), PayrollController.saveAdjustment);
router.post('/lock', requireRole('Finance', 'Admin', 'HR'), PayrollController.lockPeriod);
router.post('/unlock', requireRole('Finance', 'Admin', 'HR'), PayrollController.unlockPeriod);

export default router;
