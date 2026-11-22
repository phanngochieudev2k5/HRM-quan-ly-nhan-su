import express from 'express';
import { RecruitmentService } from '../Services/RecruitmentService.js';
import { CandidateModel } from '../Models/CandidateModel.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';
import { cvUpload } from '../Utils/UploadHelper.js';

const router = express.Router();

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

router.get('/jobs', async (req, res) => {
  try {
    await RecruitmentService.seedInitialDataIfEmpty();
    const { departmentId, search } = req.query;
    const allJobs = await RecruitmentService.getJobs({ departmentId, search });
    const publicJobs = allJobs.filter(j => 
      j.Status === 'Approved' || j.Status === 'Đang tuyển'
    );
    return sendSuccess(res, publicJobs, 'Lấy danh sách vị trí tuyển dụng công khai thành công!');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
});

router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await RecruitmentService.getJobById(id);
    return sendSuccess(res, job, 'Lấy chi tiết vị trí tuyển dụng thành công!');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
});

router.post('/apply', async (req, res) => {
  try {
    const jobId = req.body.JobId || req.body.jobId;
    const fullName = req.body.FullName || req.body.fullName;
    const email = req.body.Email || req.body.email;
    const phone = req.body.Phone || req.body.phone;
    const cvUrl = req.body.CvUrl || req.body.cvUrl;
    const note = req.body.Note || req.body.note;

    if (!jobId || !fullName || !phone) {
      return sendError(res, 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Vị trí ứng tuyển!', 400);
    }

    const emailNormalized = email ? email.trim().toLowerCase() : null;
    const phoneNormalized = phone.trim();
    const existingCandidates = await CandidateModel.getAll({ jobId: parseInt(jobId) });
    const alreadyApplied = existingCandidates.some(candidate =>
      (emailNormalized && candidate.Email?.trim().toLowerCase() === emailNormalized) ||
      candidate.Phone?.trim() === phoneNormalized
    );
    if (alreadyApplied) {
      return sendError(res, 'Bạn đã nộp hồ sơ cho vị trí này trước đó.', 409);
    }

    const candidate = await CandidateModel.create({
      JobId: parseInt(jobId),
      FullName: fullName.trim(),
      Email: emailNormalized,
      Phone: phoneNormalized,
      CvUrl: cvUrl ? cvUrl.trim() : null,
      Stage: 'Applied',
      AppliedDate: new Date().toISOString().slice(0, 10),
      Note: note ? note.trim() : 'Ứng viên nộp hồ sơ trực tuyến qua cổng tuyển dụng Careers'
    });

    return sendSuccess(res, candidate, 'Nộp hồ sơ ứng tuyển thành công! Ban Nhân sự sẽ sớm liên hệ với bạn.', 201);
  } catch (error) {
    const duplicateKey =
      error?.number === 2627 ||
      error?.number === 2601 ||
      (error?.message || '').includes('UNIQUE KEY constraint') ||
      (error?.message || '').includes('duplicate key');
    if (duplicateKey) {
      return sendError(res, 'Hồ sơ ứng tuyển đã tồn tại hoặc mã ứng viên bị trùng. Vui lòng thử lại.', 409, error);
    }
    return sendError(res, 'Không thể gửi hồ sơ ứng tuyển. Vui lòng thử lại sau.', 500, error);
  }
});

export default router;
