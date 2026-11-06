import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { RecruitmentController } from '../Controllers/Hr/RecruitmentController.js';

const router = express.Router();

router.use(verifyToken, requireRole('HR', 'Admin'));

router.get('/', RecruitmentController.getCandidates);
router.get('/:id', RecruitmentController.getCandidateById);
router.post('/', RecruitmentController.createCandidate);
router.put('/:id/stage', RecruitmentController.updateCandidateStage);
router.put('/:id', RecruitmentController.updateCandidate);
router.delete('/:id', RecruitmentController.deleteCandidate);

export default router;
