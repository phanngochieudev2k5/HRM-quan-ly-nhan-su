import { RecruitmentService } from '../../Services/RecruitmentService.js';
import { sendSuccess, sendError } from '../../Utils/ResponseHelper.js';

export class RecruitmentController {
    // ==================== US-04: QUẢN LÝ NHU CẦU & ĐỀ XUẤT TUYỂN DỤNG ====================

    /**
     * GET /api/recruitment-jobs
     * Lấy danh sách vị trí / đề xuất tuyển dụng
     */
    static async getJobs(req, res) {
        try {
            // Tự động kiểm tra và khởi tạo dữ liệu mẫu nếu bảng trống
            await RecruitmentService.seedInitialDataIfEmpty();

            const { departmentId, status, search, q } = req.query;
            const jobs = await RecruitmentService.getJobs({
                departmentId,
                status,
                search: search || q,
            });
            return sendSuccess(
                res,
                jobs,
                'Lấy danh sách vị trí tuyển dụng thành công!',
            );
        } catch (error) {
            console.error('[RecruitmentController.getJobs] Error:', error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    /**
     * GET /api/recruitment-jobs/:id
     * Chi tiết vị trí tuyển dụng
     */
    static async getJobById(req, res) {
        try {
            const { id } = req.params;
            const job = await RecruitmentService.getJobById(id);
            return sendSuccess(
                res,
                job,
                'Lấy thông tin vị trí tuyển dụng thành công!',
            );
        } catch (error) {
            console.error('[RecruitmentController.getJobById] Error:', error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    /**
     * POST /api/recruitment-jobs
     * Tạo đề xuất tuyển dụng mới
     */
    static async createJob(req, res) {
        try {
            const job = await RecruitmentService.createJob(req.body);
            return sendSuccess(
                res,
                job,
                'Tạo đề xuất tuyển dụng thành công!',
                201,
            );
        } catch (error) {
            console.error('[RecruitmentController.createJob] Error:', error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    /**
     * PUT /api/recruitment-jobs/:id/status
     * Duyệt (Approved) hoặc Từ chối (Rejected) đề xuất tuyển dụng
     */
    static async updateJobStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!status) {
                return sendError(
                    res,
                    'Vui lòng cung cấp trạng thái status (Approved, Rejected, Pending)!',
                    400,
                );
            }

            const result = await RecruitmentService.updateJobStatus(id, status);
            const actionText =
                status === 'Approved'
                    ? 'Duyệt'
                    : status === 'Rejected'
                      ? 'Từ chối'
                      : 'Cập nhật';
            return sendSuccess(
                res,
                result,
                `${actionText} đề xuất tuyển dụng thành công!`,
            );
        } catch (error) {
            console.error(
                '[RecruitmentController.updateJobStatus] Error:',
                error,
            );
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    /**
     * PUT /api/recruitment-jobs/:id
     * Cập nhật thông tin vị trí tuyển dụng
     */
    static async updateJob(req, res) {
        try {
            const { id } = req.params;
            const result = await RecruitmentService.updateJob(id, req.body);
            return sendSuccess(
                res,
                result,
                'Cập nhật vị trí tuyển dụng thành công!',
            );
        } catch (error) {
            console.error('[RecruitmentController.updateJob] Error:', error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    /**
     * DELETE /api/recruitment-jobs/:id
     * Xóa vị trí tuyển dụng
     */
    static async deleteJob(req, res) {
        try {
            const { id } = req.params;
            const result = await RecruitmentService.deleteJob(id);
            return sendSuccess(
                res,
                result,
                'Xóa vị trí tuyển dụng thành công!',
            );
        } catch (error) {
            console.error('[RecruitmentController.deleteJob] Error:', error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    // ==================== US-05: QUẢN LÝ ỨNG VIÊN & PIPELINE KANBAN ====================

    /**
     * GET /api/candidates
     * Lấy danh sách ứng viên theo Job hoặc theo trạng thái Stage
     */
    static async getCandidates(req, res) {
        try {
            // Đảm bảo dữ liệu mẫu sẵn sàng nếu CSDL trống
            await RecruitmentService.seedInitialDataIfEmpty();

            const { jobId, stage, search, q } = req.query;
            const candidates = await RecruitmentService.getCandidates({
                jobId,
                stage,
                search: search || q,
            });
            return sendSuccess(
                res,
                candidates,
                'Lấy danh sách ứng viên thành công!',
            );
        } catch (error) {
            console.error(
                '[RecruitmentController.getCandidates] Error:',
                error,
            );
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    /**
     * GET /api/candidates/:id
     * Chi tiết hồ sơ ứng viên
     */
    static async getCandidateById(req, res) {
        try {
            const { id } = req.params;
            const candidate = await RecruitmentService.getCandidateById(id);
            return sendSuccess(
                res,
                candidate,
                'Lấy thông tin ứng viên thành công!',
            );
        } catch (error) {
            console.error(
                '[RecruitmentController.getCandidateById] Error:',
                error,
            );
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    /**
     * POST /api/candidates
     * Thêm mới ứng viên ứng tuyển
     */
    static async createCandidate(req, res) {
        try {
            const candidate = await RecruitmentService.createCandidate(
                req.body,
            );
            return sendSuccess(
                res,
                candidate,
                'Thêm mới ứng viên thành công!',
                201,
            );
        } catch (error) {
            console.error(
                '[RecruitmentController.createCandidate] Error:',
                error,
            );
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    /**
     * PUT /api/candidates/:id/stage
     * Cập nhật trạng thái ứng viên qua các cột Kanban (Applied, Screening, Interviewing, Offered, Rejected)
     */
    static async updateCandidateStage(req, res) {
        try {
            const { id } = req.params;
            const { stage } = req.body;
            if (!stage) {
                return sendError(
                    res,
                    'Vui lòng cung cấp giai đoạn stage!',
                    400,
                );
            }

            const result = await RecruitmentService.updateCandidateStage(
                id,
                stage,
            );
            return sendSuccess(
                res,
                result,
                `Chuyển giai đoạn ứng viên sang "${stage}" thành công!`,
            );
        } catch (error) {
            console.error(
                '[RecruitmentController.updateCandidateStage] Error:',
                error,
            );
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    /**
     * PUT /api/candidates/:id
     * Cập nhật thông tin chi tiết ứng viên (điểm đánh giá, ghi chú, phỏng vấn)
     */
    static async updateCandidate(req, res) {
        try {
            const { id } = req.params;
            const result = await RecruitmentService.updateCandidate(
                id,
                req.body,
            );
            return sendSuccess(
                res,
                result,
                'Cập nhật thông tin ứng viên thành công!',
            );
        } catch (error) {
            console.error(
                '[RecruitmentController.updateCandidate] Error:',
                error,
            );
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    /**
     * DELETE /api/candidates/:id
     * Xóa ứng viên
     */
    static async deleteCandidate(req, res) {
        try {
            const { id } = req.params;
            const result = await RecruitmentService.deleteCandidate(id);
            return sendSuccess(res, result, 'Xóa ứng viên thành công!');
        } catch (error) {
            console.error(
                '[RecruitmentController.deleteCandidate] Error:',
                error,
            );
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }
}
