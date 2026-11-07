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

    const candidate = await CandidateModel.create({
      JobId: parseInt(jobId),
      FullName: fullName.trim(),
      Email: email ? email.trim() : null,
      Phone: phone.trim(),
      CvUrl: cvUrl ? cvUrl.trim() : null,
      Stage: 'Applied',
      AppliedDate: new Date().toISOString().slice(0, 10),
      Note: note ? note.trim() : 'Ứng viên nộp hồ sơ trực tuyến qua cổng tuyển dụng Careers'
    });

    return sendSuccess(res, candidate, 'Nộp hồ sơ ứng tuyển thành công! Ban Nhân sự sẽ sớm liên hệ với bạn.', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
});

export default router;
