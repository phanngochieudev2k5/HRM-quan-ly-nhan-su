import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { RecruitmentController } from '../Controllers/Hr/RecruitmentController.js';
import { cvUpload } from '../Utils/UploadHelper.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';

const router = express.Router();

router.use(verifyToken, requireRole('HR', 'Admin'));

router.post('/upload-cv', (req, res) => {
  cvUpload.single('cvFile')(req, res, (err) => {
    if (err) {
      return sendError(res, err.message, 400);
    }
    if (!req.file) {
      return sendError(res, 'Vui lòng chọn file PDF để tải lên!', 400);
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/cv/${req.file.filename}`;
    return sendSuccess(res, {
      fileUrl,
      fileName: req.file.originalname,
      storedName: req.file.filename,
      size: req.file.size
    }, 'Tải lên file CV thành công!');
  });
});

router.get('/', RecruitmentController.getCandidates);
router.get('/:id', RecruitmentController.getCandidateById);
router.post('/', RecruitmentController.createCandidate);
router.put('/:id/stage', RecruitmentController.updateCandidateStage);
router.put('/:id', RecruitmentController.updateCandidate);
router.post('/:id/send-email', RecruitmentController.sendCandidateEmail);
router.delete('/:id', RecruitmentController.deleteCandidate);

export default router;
