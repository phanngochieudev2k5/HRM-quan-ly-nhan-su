import express from 'express';
import { AuthController } from '../Controllers/AuthController.js';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', verifyToken, AuthController.getMe);
router.put('/profile', verifyToken, AuthController.updateProfile);
router.post('/change-password', verifyToken, AuthController.changePassword);
router.post('/logout', verifyToken, AuthController.logout);

export default router;
