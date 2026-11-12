import { RecruitmentJobModel } from '../Models/RecruitmentJobModel.js';
import { CandidateModel } from '../Models/CandidateModel.js';
import { OnboardingModel } from '../Models/OnboardingModel.js';
import { EmailService } from './EmailService.js';
import { connectDb, sql } from '../Config/DbConfig.js';

export class RecruitmentService {
    static async seedInitialDataIfEmpty() {
        try {
            const jobCount = await RecruitmentJobModel.count();
            if (jobCount === 0) {
                const job1 = await RecruitmentJobModel.create({
                    JobTitle: 'Senior Full-stack Developer (Node.js & React)',
                    DepartmentId: 3,
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
                    DepartmentId: 2,
                    TargetQuantity: 2,
                    SalaryRange: '15.000.000 - 22.000.000 VNĐ',
                    Deadline: '2026-11-20',
                    JobDescription:
                        'Phụ trách quy trình tìm kiếm ứng viên, lọc hồ sơ, điều phối lịch phỏng vấn và quy trình tiếp nhận Onboarding.',
                    Status: 'Approved',
                });

                const job3 = await RecruitmentJobModel.create({
                    JobTitle: 'Chuyên viên Kế toán Tiền lương & C&B',
                    DepartmentId: 4,
                    TargetQuantity: 1,
                    SalaryRange: '18.000.000 - 26.000.000 VNĐ',
                    Deadline: '2026-12-15',
                    JobDescription:
                        'Tính toán bảng lương tháng, phụ cấp, giảm trừ gia cảnh, đóng bảo hiểm xã hội và báo cáo thuế TNCN.',
                    Status: 'Approved',
                });

                const job4 = await RecruitmentJobModel.create({
                    JobTitle:
                        'Trưởng nhóm Marketing Kỹ thuật số (Digital Lead)',
                    DepartmentId: 5,
                    TargetQuantity: 1,
                    SalaryRange: '28.000.000 - 35.000.000 VNĐ',
                    Deadline: '2026-10-30',
                    JobDescription:
                        'Xây dựng chiến lược thương hiệu tuyển dụng, tổ chức các chiến dịch tiếp thị truyền thông cho công ty.',
                    Status: 'Closed',
                });

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
                    AppliedDate: '2026-10-24',
                    InterviewerEmployeeId: 2,
                    RatingScore: 3,
                    Note: 'Phỏng vấn kỹ thuật đạt 7.5/10, đang thảo luận mức lương.',
                });

                await CandidateModel.create({
                    CandidateCode: 'UV004',
                    JobId: job2.JobId,
                    FullName: 'Phạm Mai Phương',
                    Phone: '0944556677',
                    Email: 'maiphuong.hr@gmail.com',
                    CvUrl: 'https://storage.enterprise.vn/cv/phuong_hr.pdf',
                    Stage: 'Offered',
                    AppliedDate: '2026-10-20',
                    InterviewerEmployeeId: 1,
                    RatingScore: 5,
                    Note: 'Đã gửi thư mời nhận việc (Offer Letter) ngày 28/10, chờ ứng viên phản hồi.',
                });

                await CandidateModel.create({
                    CandidateCode: 'UV005',
                    JobId: job2.JobId,
                    FullName: 'Trần Bảo Ngọc',
                    Phone: '0933221199',
                    Email: 'ngoc.tran@company.com',
                    CvUrl: 'https://storage.enterprise.vn/cv/ngoc_hr.pdf',
                    Stage: 'Hired',
                    AppliedDate: '2026-10-18',
                    InterviewerEmployeeId: 1,
                    RatingScore: 5,
                    Note: 'Đã đồng ý Offer, sẵn sàng onboarding tuần tới.',
                });

                await CandidateModel.create({
                    CandidateCode: 'UV006',
                    JobId: job1.JobId,
                    FullName: 'Đỗ Tiến Đạt',
                    Phone: '0912998877',
                    Email: 'dat.do@gmail.com',
                    CvUrl: 'https://storage.enterprise.vn/cv/dat_node.pdf',
                    Stage: 'Rejected',
                    AppliedDate: '2026-10-22',
                    RatingScore: 2,
                    Note: 'Chưa đủ năm kinh nghiệm theo yêu cầu của dự án.',
                });
            }
        } catch (err) {
            console.warn(err.message);
        }
    }

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

        return await RecruitmentJobModel.create({
            ...jobData,
            Status: jobData.Status === 'Closed' ? 'Closed' : 'Approved',
        });
    }

    static async updateJob(id, jobData) {
        return await RecruitmentJobModel.update(id, jobData);
    }

    static async deleteJob(id) {
        return await RecruitmentJobModel.delete(id);
    }

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

    static async updateCandidateStage(id, stage, additionalData = {}, sendEmail = false) {
        const validStages = [
            'Applied',
            'Screening',
            'Interviewing',
            'Offered',
            'Hired',
            'Rejected',
        ];
        if (!validStages.includes(stage)) {
            const error = new Error(
                `Giai đoạn pipeline không hợp lệ! Chỉ chấp nhận: ${validStages.join(', ')}`,
            );
            error.statusCode = 400;
            throw error;
        }

        const updateResult = await CandidateModel.updateStage(id, stage, additionalData);
        const candidate = await CandidateModel.getById(id);

        if (stage === 'Hired') {
            try {
                if (candidate) {
                    const pool = await connectDb();
                    const existingOnb = await pool.request()
                        .input('name', sql.NVarChar(100), candidate.FullName)
                        .input('deptId', sql.Int, candidate.DepartmentId || 2)
                        .query('SELECT OnboardingId FROM tblOnboarding WHERE CandidateName = @name AND DepartmentId = @deptId');

                    const targetStartDate = candidate.StartDate || (() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 7);
                        return d.toISOString().slice(0, 10);
                    })();

                    if (existingOnb.recordset.length === 0) {
                        await OnboardingModel.create({
                            CandidateName: candidate.FullName,
                            PositionName: candidate.JobTitle || 'Chuyên viên mới',
                            DepartmentId: candidate.DepartmentId || 2,
                            StartDate: targetStartDate,
                            MentorEmployeeId: candidate.InterviewerEmployeeId || null,
                            AccountCreated: false,
                            ContractSigned: false,
                            AssetAssigned: false,
                            FaceEnrolled: false,
                            Status: 'Đang tiếp nhận',
                            OfferedSalary: candidate.OfferedSalary || null,
                            Email: candidate.Email || null,
                            Phone: candidate.Phone || null
                        });
                    } else {
                        const onbId = existingOnb.recordset[0].OnboardingId;
                        await pool.request()
                            .input('id', sql.Int, onbId)
                            .input('startDate', sql.Date, targetStartDate)
                            .input('offeredSalary', sql.Decimal(18, 2), candidate.OfferedSalary || null)
                            .input('email', sql.VarChar(100), candidate.Email || null)
                            .input('phone', sql.VarChar(20), candidate.Phone || null)
                            .query('UPDATE tblOnboarding SET StartDate = COALESCE(@startDate, StartDate), OfferedSalary = COALESCE(@offeredSalary, OfferedSalary), Email = COALESCE(@email, Email), Phone = COALESCE(@phone, Phone) WHERE OnboardingId = @id');
                    }

                    if (candidate.JobId) {
                        const job = await RecruitmentJobModel.getById(candidate.JobId);
                        const hiredCountRes = await pool.request()
                            .input('jobId', sql.Int, candidate.JobId)
                            .query("SELECT COUNT(*) as count FROM tblCandidate WHERE JobId = @jobId AND Stage = 'Hired'");
                        const hiredCount = hiredCountRes.recordset[0]?.count || 0;

                        if (job && hiredCount >= job.TargetQuantity && job.Status !== 'Closed') {
                            await pool.request()
                                .input('jobId', sql.Int, candidate.JobId)
                                .query("UPDATE tblRecruitmentJob SET Status = 'Closed' WHERE JobId = @jobId");
                        }
                    }
                }
            } catch (err) {
                console.warn('Auto-create onboarding warning:', err.message);
            }
        }

        let emailResult = null;
        if (sendEmail && candidate && candidate.Email) {
            try {
                if (stage === 'Interviewing') {
                    emailResult = await EmailService.sendInterviewEmail({
                        candidateEmail: candidate.Email,
                        candidateName: candidate.FullName,
                        jobTitle: candidate.JobTitle || 'Vị trí tuyển dụng',
                        interviewDateTime: candidate.InterviewDateTime,
                        interviewLocation: candidate.InterviewLocation,
                        interviewerName: candidate.InterviewerName
                    });
                } else if (stage === 'Offered') {
                    emailResult = await EmailService.sendOfferEmail({
                        candidateEmail: candidate.Email,
                        candidateName: candidate.FullName,
                        jobTitle: candidate.JobTitle || 'Vị trí tuyển dụng',
                        offeredSalary: candidate.OfferedSalary,
                        startDate: candidate.StartDate
                    });
                } else if (stage === 'Hired') {
                    emailResult = await EmailService.sendHiredEmail({
                        candidateEmail: candidate.Email,
                        candidateName: candidate.FullName,
                        jobTitle: candidate.JobTitle || 'Vị trí tuyển dụng',
                        startDate: candidate.StartDate,
                        offeredSalary: candidate.OfferedSalary
                    });
                } else if (stage === 'Rejected') {
                    emailResult = await EmailService.sendRejectionEmail({
                        candidateEmail: candidate.Email,
                        candidateName: candidate.FullName,
                        jobTitle: candidate.JobTitle || 'Vị trí tuyển dụng'
                    });
                }
            } catch (mailErr) {
                console.warn('Email dispatch warning:', mailErr.message);
                emailResult = { success: false, error: mailErr.message };
            }
        }

        return { ...updateResult, candidate, emailResult };
    }

    static async sendCandidateEmail(candidateId, emailData = {}) {
        const candidate = await CandidateModel.getById(candidateId);
        if (!candidate) {
            const error = new Error('Không tìm thấy thông tin ứng viên!');
            error.statusCode = 404;
            throw error;
        }

        if (!candidate.Email || !candidate.Email.includes('@')) {
            const error = new Error('Ứng viên chưa có thông tin địa chỉ email hợp lệ!');
            error.statusCode = 400;
            throw error;
        }

        const type = (emailData.type || candidate.Stage || '').toLowerCase();
        let result = null;

        if (type === 'interview' || type === 'interviewing') {
            const interviewDateTime = emailData.interviewDateTime || candidate.InterviewDateTime;
            const interviewLocation = emailData.interviewLocation || candidate.InterviewLocation;
            const interviewerName = emailData.interviewerName || candidate.InterviewerName;

            if (emailData.interviewDateTime || emailData.interviewLocation || emailData.interviewerEmployeeId) {
                await CandidateModel.updateStage(candidateId, candidate.Stage, {
                    InterviewDateTime: emailData.interviewDateTime || candidate.InterviewDateTime,
                    InterviewLocation: emailData.interviewLocation || candidate.InterviewLocation,
                    InterviewerEmployeeId: emailData.interviewerEmployeeId || candidate.InterviewerEmployeeId
                });
            }

            result = await EmailService.sendInterviewEmail({
                candidateEmail: candidate.Email,
                candidateName: candidate.FullName,
                jobTitle: candidate.JobTitle || 'Vị trí tuyển dụng',
                interviewDateTime,
                interviewLocation,
                interviewerName
            });
        } else if (type === 'offer' || type === 'offered') {
            const offeredSalary = emailData.offeredSalary !== undefined ? emailData.offeredSalary : candidate.OfferedSalary;
            const startDate = emailData.startDate || candidate.StartDate;

            if (emailData.offeredSalary !== undefined || emailData.startDate !== undefined) {
                await CandidateModel.updateStage(candidateId, candidate.Stage, {
                    OfferedSalary: offeredSalary,
                    StartDate: startDate
                });
            }

            result = await EmailService.sendOfferEmail({
                candidateEmail: candidate.Email,
                candidateName: candidate.FullName,
                jobTitle: candidate.JobTitle || 'Vị trí tuyển dụng',
                offeredSalary,
                startDate
            });
        } else if (type === 'hired') {
            const startDate = emailData.startDate || candidate.StartDate;
            const offeredSalary = emailData.offeredSalary !== undefined ? emailData.offeredSalary : candidate.OfferedSalary;

            if (emailData.startDate !== undefined || emailData.offeredSalary !== undefined) {
                await CandidateModel.updateStage(candidateId, 'Hired', {
                    StartDate: startDate,
                    OfferedSalary: offeredSalary
                });
            }

            try {
                const pool = await connectDb();
                const existingOnb = await pool.request()
                    .input('name', sql.NVarChar(100), candidate.FullName)
                    .input('deptId', sql.Int, candidate.DepartmentId || 2)
                    .query('SELECT OnboardingId FROM tblOnboarding WHERE CandidateName = @name AND DepartmentId = @deptId');

                if (existingOnb.recordset.length === 0) {
                    await OnboardingModel.create({
                        CandidateName: candidate.FullName,
                        PositionName: candidate.JobTitle || 'Chuyên viên mới',
                        DepartmentId: candidate.DepartmentId || 2,
                        StartDate: startDate || new Date().toISOString().slice(0, 10),
                        MentorEmployeeId: candidate.InterviewerEmployeeId || null,
                        AccountCreated: false,
                        ContractSigned: false,
                        AssetAssigned: false,
                        FaceEnrolled: false,
                        Status: 'Đang tiếp nhận',
                        OfferedSalary: offeredSalary || null
                    });
                } else {
                    const onbId = existingOnb.recordset[0].OnboardingId;
                    await pool.request()
                        .input('id', sql.Int, onbId)
                        .input('startDate', sql.Date, startDate || null)
                        .input('offeredSalary', sql.Decimal(18, 2), offeredSalary || null)
                        .query('UPDATE tblOnboarding SET StartDate = COALESCE(@startDate, StartDate), OfferedSalary = COALESCE(@offeredSalary, OfferedSalary) WHERE OnboardingId = @id');
                }
            } catch (onbErr) {
                console.warn('Sync onboarding on send hired email warning:', onbErr.message);
            }

            result = await EmailService.sendHiredEmail({
                candidateEmail: candidate.Email,
                candidateName: candidate.FullName,
                jobTitle: candidate.JobTitle || 'Vị trí tuyển dụng',
                startDate,
                offeredSalary
            });
        } else if (type === 'rejected') {
            result = await EmailService.sendRejectionEmail({
                candidateEmail: candidate.Email,
                candidateName: candidate.FullName,
                jobTitle: candidate.JobTitle || 'Vị trí tuyển dụng'
            });
        } else {
            const error = new Error(`Loại email không hợp lệ: "${type}"!`);
            error.statusCode = 400;
            throw error;
        }

        return result;
    }

    static async updateCandidate(id, candidateData) {
        const updateResult = await CandidateModel.update(id, candidateData);
        if (candidateData.Stage === 'Hired') {
            const candidate = await CandidateModel.getById(id);
            if (candidate) {
                try {
                    const pool = await connectDb();
                    const existingOnb = await pool.request()
                        .input('name', sql.NVarChar(100), candidate.FullName)
                        .input('deptId', sql.Int, candidate.DepartmentId || 2)
                        .query('SELECT OnboardingId FROM tblOnboarding WHERE CandidateName = @name AND DepartmentId = @deptId');

                    const targetStartDate = candidate.StartDate || (() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 7);
                        return d.toISOString().slice(0, 10);
                    })();

                    if (existingOnb.recordset.length === 0) {
                        await OnboardingModel.create({
                            CandidateName: candidate.FullName,
                            PositionName: candidate.JobTitle || 'Chuyên viên mới',
                            DepartmentId: candidate.DepartmentId || 2,
                            StartDate: targetStartDate,
                            MentorEmployeeId: candidate.InterviewerEmployeeId || null,
                            AccountCreated: false,
                            ContractSigned: false,
                            AssetAssigned: false,
                            FaceEnrolled: false,
                            Status: 'Đang tiếp nhận',
                            OfferedSalary: candidate.OfferedSalary || null,
                            Email: candidate.Email || null,
                            Phone: candidate.Phone || null
                        });
                    } else {
                        const onbId = existingOnb.recordset[0].OnboardingId;
                        await pool.request()
                            .input('id', sql.Int, onbId)
                            .input('startDate', sql.Date, targetStartDate)
                            .input('offeredSalary', sql.Decimal(18, 2), candidate.OfferedSalary || null)
                            .input('email', sql.VarChar(100), candidate.Email || null)
                            .input('phone', sql.VarChar(20), candidate.Phone || null)
                            .query('UPDATE tblOnboarding SET StartDate = COALESCE(@startDate, StartDate), OfferedSalary = COALESCE(@offeredSalary, OfferedSalary), Email = COALESCE(@email, Email), Phone = COALESCE(@phone, Phone) WHERE OnboardingId = @id');
                    }
                } catch (onbErr) {
                    console.warn('Sync onboarding on update candidate warning:', onbErr.message);
                }
            }
        }
        return updateResult;
    }

    static async deleteCandidate(id) {
        return await CandidateModel.delete(id);
    }
}
