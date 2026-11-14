import { RecruitmentService } from '../../Services/RecruitmentService.js';
import { sendSuccess, sendError } from '../../Utils/ResponseHelper.js';

export class RecruitmentController {
    static async getJobs(req, res) {
        try {
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
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

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
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

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
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

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
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

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
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    static async getCandidates(req, res) {
        try {
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
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

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
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

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
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    static async updateCandidateStage(req, res) {
        try {
            const { id } = req.params;
            const { stage, additionalData, sendEmail, ...rest } = req.body;
            if (!stage) {
                return sendError(
                    res,
                    'Vui lòng cung cấp giai đoạn stage!',
                    400,
                );
            }

            const dataToPass = additionalData || rest;
            const result = await RecruitmentService.updateCandidateStage(
                id,
                stage,
                dataToPass,
                sendEmail
            );
            return sendSuccess(
                res,
                result,
                `Chuyển giai đoạn ứng viên sang "${stage}" thành công!`,
            );
        } catch (error) {
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    static async sendCandidateEmail(req, res) {
        try {
            const { id } = req.params;
            const result = await RecruitmentService.sendCandidateEmail(id, req.body);
            return sendSuccess(res, result, result.message || 'Gửi email cho ứng viên thành công!');
        } catch (error) {
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error
            );
        }
    }

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
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }

    static async deleteCandidate(req, res) {
        try {
            const { id } = req.params;
            const result = await RecruitmentService.deleteCandidate(id);
            return sendSuccess(res, result, 'Xóa ứng viên thành công!');
        } catch (error) {
            console.error(error);
            return sendError(
                res,
                error.message,
                error.statusCode || 500,
                error,
            );
        }
    }
}
