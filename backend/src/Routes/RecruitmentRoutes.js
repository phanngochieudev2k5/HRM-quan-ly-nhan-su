import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { RecruitmentController } from '../Controllers/Hr/RecruitmentController.js';

const router = express.Router();

router.use(verifyToken, requireRole('HR', 'Admin'));

router.get('/', RecruitmentController.getJobs);
router.get('/:id', RecruitmentController.getJobById);
router.post('/', RecruitmentController.createJob);
router.put('/:id/status', RecruitmentController.updateJobStatus);
router.put('/:id', RecruitmentController.updateJob);
router.delete('/:id', RecruitmentController.deleteJob);

export default router;
