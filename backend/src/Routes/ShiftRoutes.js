import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { ShiftController } from '../Controllers/Hr/ShiftController.js';

const router = express.Router();

router.use(verifyToken, requireRole('HR', 'Admin'));

// Lịch phân ca (đặt trước route động /:id)
router.get('/schedule', ShiftController.getSchedule);
router.post('/assign', ShiftController.assignShifts);
router.delete('/assign/:attendanceId', ShiftController.removeAssignment);

// Cấu hình loại ca làm việc (tblShift)
router.get('/', ShiftController.getShifts);
router.post('/', ShiftController.createShift);
router.put('/:id', ShiftController.updateShift);
router.patch('/:id/status', ShiftController.toggleShiftStatus);

export default router;
