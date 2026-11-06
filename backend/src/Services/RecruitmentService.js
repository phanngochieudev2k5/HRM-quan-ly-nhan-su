import { RecruitmentJobModel } from '../Models/RecruitmentJobModel.js';
import { CandidateModel } from '../Models/CandidateModel.js';

export class RecruitmentService {
    /**
     * Tự động khởi tạo dữ liệu mẫu nếu CSDL chưa có record nào
     */
    static async seedInitialDataIfEmpty() {
        try {
            const jobCount = await RecruitmentJobModel.count();
            if (jobCount === 0) {
                console.log(
                    '🌱 Đang khởi tạo dữ liệu mẫu cho module Tuyển dụng (tblRecruitmentJob & tblCandidate)...',
                );

                // Tạo 4 vị trí tuyển dụng mẫu
                const job1 = await RecruitmentJobModel.create({
                    JobTitle: 'Senior Full-stack Developer (Node.js & React)',
                    DepartmentId: 3, // Khối Kỹ Thuật (IT)
                    TargetQuantity: 3,
                    SalaryRange: '25.000.000 - 40.000.000 VNĐ',
                    Deadline: '2026-11-30',
                    JobDescription:
                        'Phát triển các module hệ thống Enterprise HRM, tối ưu hóa CSDL SQL Server và tích hợp Face ID OpenCV.',
                    Status: 'Approved',
                });

                const job2 = await RecruitmentJobModel.create({
                    JobTitle:
                        'Chuyên viên Nhân sự & Tuyển dụng (HR Talent Acquisition)',
                    DepartmentId: 2, // Phòng Nhân Sự (HR)
                    TargetQuantity: 2,
                    SalaryRange: '15.000.000 - 22.000.000 VNĐ',
                    Deadline: '2026-11-20',
                    JobDescription:
                        'Phụ trách quy trình tìm kiếm ứng viên, lọc hồ sơ, điều phối lịch phỏng vấn và quy trình tiếp nhận Onboarding.',
                    Status: 'Approved',
                });

                const job3 = await RecruitmentJobModel.create({
                    JobTitle: 'Chuyên viên Kế toán Tiền lương & C&B',
                    DepartmentId: 4, // Phòng Tài Chính - Kế Toán
                    TargetQuantity: 1,
                    SalaryRange: '18.000.000 - 26.000.000 VNĐ',
                    Deadline: '2026-12-15',
                    JobDescription:
                        'Tính toán bảng lương tháng, phụ cấp, giảm trừ gia cảnh, đóng bảo hiểm xã hội và báo cáo thuế TNCN.',
                    Status: 'Pending',
                });

                const job4 = await RecruitmentJobModel.create({
                    JobTitle:
                        'Trưởng nhóm Marketing Kỹ thuật số (Digital Lead)',
                    DepartmentId: 5, // Khối Marketing & Truyền Thông
                    TargetQuantity: 1,
                    SalaryRange: '28.000.000 - 35.000.000 VNĐ',
                    Deadline: '2026-10-30',
                    JobDescription:
                        'Xây dựng chiến lược thương hiệu tuyển dụng, tổ chức các chiến dịch tiếp thị truyền thông cho công ty.',
                    Status: 'Rejected',
                });

                // Tạo 6 ứng viên mẫu phân bổ qua các cột Kanban
                await CandidateModel.create({
                    CandidateCode: 'UV001',
                    JobId: job1.JobId,
                    FullName: 'Nguyễn Đình Khang',
                    Phone: '0981234567',
                    Email: 'khang.nguyen@gmail.com',
                    CvUrl: 'https://storage.enterprise.vn/cv/khang_fullstack.pdf',
                    Stage: 'Applied',
                    AppliedDate: '2026-10-25',
                    RatingScore: 4,
                    Note: 'Kinh nghiệm 4 năm React & Express, đã từng làm việc với SQL Server.',
                });

                await CandidateModel.create({
                    CandidateCode: 'UV002',
                    JobId: job1.JobId,
                    FullName: 'Lê Thùy Dương',
                    Phone: '0977889900',
                    Email: 'duong.le@techcorp.vn',
                    CvUrl: 'https://storage.enterprise.vn/cv/duong_fe.pdf',
                    Stage: 'Screening',
                    AppliedDate: '2026-10-26',
                    InterviewerEmployeeId: 1,
                    RatingScore: 5,
                    Note: 'CV rất ấn tượng, kỹ năng Redux/Tailwind tốt, đã hẹn phỏng vấn vòng 1.',
                });

                await CandidateModel.create({
                    CandidateCode: 'UV003',
                    JobId: job1.JobId,
                    FullName: 'Vũ Quốc Huy',
                    Phone: '0903344556',
                    Email: 'huy.vu@outlook.com',
                    CvUrl: 'https://storage.enterprise.vn/cv/huy_backend.pdf',
                    Stage: 'Interviewing',
                    AppliedDate: '2026-10-22',
                    InterviewerEmployeeId: 1,
                    RatingScore: 4,
                    Note: 'Phỏng vấn kỹ thuật trực tiếp về tối ưu Index SQL Server và kiến trúc microservices.',
                });

                await CandidateModel.create({
                    CandidateCode: 'UV004',
                    JobId: job2.JobId,
                    FullName: 'Trần Mai Phương',
                    Phone: '0912998877',
                    Email: 'phuong.tran@hrviet.com',
                    CvUrl: 'https://storage.enterprise.vn/cv/phuong_hr.pdf',
                    Stage: 'Offered',
                    AppliedDate: '2026-10-18',
                    InterviewerEmployeeId: 2,
                    RatingScore: 5,
                    Note: 'Đã gửi thư mời nhận việc (Offer letter), mức lương 19M, dự kiến nhận việc 15/11.',
                });

                await CandidateModel.create({
                    CandidateCode: 'UV005',
                    JobId: job3.JobId,
                    FullName: 'Hoàng Văn Tuấn',
                    Phone: '0934112233',
                    Email: 'tuan.hoang@acc.vn',
                    CvUrl: 'https://storage.enterprise.vn/cv/tuan_cb.pdf',
                    Stage: 'Applied',
                    AppliedDate: '2026-10-28',
                    RatingScore: 3,
                    Note: 'Có chứng chỉ kế toán trưởng, đang chờ xét duyệt đề xuất tuyển dụng.',
                });

                await CandidateModel.create({
                    CandidateCode: 'UV006',
                    JobId: job1.JobId,
                    FullName: 'Phạm Minh Trí',
                    Phone: '0922446688',
                    Email: 'tri.pham@dev.com',
                    CvUrl: 'https://storage.enterprise.vn/cv/tri_dev.pdf',
                    Stage: 'Rejected',
                    AppliedDate: '2026-10-20',
                    RatingScore: 2,
                    Note: 'Kinh nghiệm chưa đáp ứng yêu cầu Senior, đã gửi email cảm ơn.',
                });

                console.log('✅ Khởi tạo dữ liệu mẫu tuyển dụng thành công!');
            }
        } catch (err) {
            console.warn(
                '⚠️ Không thể seed dữ liệu mẫu tuyển dụng:',
                err.message,
            );
        }
    }

    // --- RECRUITMENT JOBS LOGIC ---

    static async getJobs(filter) {
        return await RecruitmentJobModel.getAll(filter);
    }

    static async getJobById(id) {
        const job = await RecruitmentJobModel.getById(id);
        if (!job) {
            const error = new Error('Không tìm thấy vị trí tuyển dụng!');
            error.statusCode = 404;
            throw error;
        }
        return job;
    }

    static async createJob(jobData) {
        if (!jobData.JobTitle || !jobData.JobTitle.trim()) {
            const error = new Error(
                'Tiêu đề vị trí tuyển dụng (JobTitle) là bắt buộc!',
            );
            error.statusCode = 400;
            throw error;
        }
        if (!jobData.DepartmentId) {
            const error = new Error(
                'Phòng ban tuyển dụng (DepartmentId) là bắt buộc!',
            );
            error.statusCode = 400;
            throw error;
        }

        return await RecruitmentJobModel.create(jobData);
    }

    static async updateJobStatus(id, status) {
        const validStatuses = ['Pending', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
            const error = new Error(
                `Trạng thái không hợp lệ! Chỉ chấp nhận: ${validStatuses.join(', ')}`,
            );
            error.statusCode = 400;
            throw error;
        }

        return await RecruitmentJobModel.updateStatus(id, status);
    }

    static async updateJob(id, jobData) {
        return await RecruitmentJobModel.update(id, jobData);
    }

    static async deleteJob(id) {
        return await RecruitmentJobModel.delete(id);
    }

    // --- CANDIDATES LOGIC ---

    static async getCandidates(filter) {
        return await CandidateModel.getAll(filter);
    }

    static async getCandidateById(id) {
        const candidate = await CandidateModel.getById(id);
        if (!candidate) {
            const error = new Error('Không tìm thấy hồ sơ ứng viên!');
            error.statusCode = 404;
            throw error;
        }
        return candidate;
    }

    static async createCandidate(candidateData) {
        if (!candidateData.FullName || !candidateData.FullName.trim()) {
            const error = new Error('Họ và tên ứng viên là bắt buộc!');
            error.statusCode = 400;
            throw error;
        }
        if (!candidateData.JobId) {
            const error = new Error('Vị trí ứng tuyển (JobId) là bắt buộc!');
            error.statusCode = 400;
            throw error;
        }

        return await CandidateModel.create(candidateData);
    }

    static async updateCandidateStage(id, stage) {
        const validStages = [
            'Applied',
            'Screening',
            'Interviewing',
            'Offered',
            'Rejected',
        ];
        if (!validStages.includes(stage)) {
            const error = new Error(
                `Giai đoạn pipeline không hợp lệ! Chỉ chấp nhận: ${validStages.join(', ')}`,
            );
            error.statusCode = 400;
            throw error;
        }

        return await CandidateModel.updateStage(id, stage);
    }

    static async updateCandidate(id, candidateData) {
        return await CandidateModel.update(id, candidateData);
    }

    static async deleteCandidate(id) {
        return await CandidateModel.delete(id);
    }
}
