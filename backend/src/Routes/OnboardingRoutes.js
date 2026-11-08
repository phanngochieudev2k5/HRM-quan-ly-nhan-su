import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { OnboardingController } from '../Controllers/Hr/OnboardingController.js';

const router = express.Router();

router.use(verifyToken, requireRole('HR', 'Admin'));

router.get('/', OnboardingController.getOnboardings);
router.get('/:id', OnboardingController.getOnboardingById);
router.post('/', OnboardingController.createOnboarding);
router.put('/:id/checklist', OnboardingController.updateChecklist);
router.post('/:id/create-account', OnboardingController.createAccount);
router.post('/:id/send-account-email', OnboardingController.sendAccountEmail);
router.post('/:id/convert-employee', OnboardingController.convertToEmployee);
router.delete('/:id', OnboardingController.deleteOnboarding);

export default router;
