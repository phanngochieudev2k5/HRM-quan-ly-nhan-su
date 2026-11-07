import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { AssetController } from '../Controllers/Hr/AssetController.js';

const router = express.Router();

router.get('/my-assets', verifyToken, AssetController.getMyAssets);

router.use(verifyToken, requireRole('HR', 'Admin'));

router.get('/', AssetController.getAssets);
router.post('/', AssetController.createAsset);
router.delete('/:id', AssetController.deleteAsset);

export default router;

