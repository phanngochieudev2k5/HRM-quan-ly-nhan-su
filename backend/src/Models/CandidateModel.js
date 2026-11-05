import { connectDb, sql } from '../Config/DbConfig.js';

export class CandidateModel {
    /**
     * Lấy danh sách toàn bộ ứng viên theo Job hoặc theo Stage (Kanban)
     */
    static async getAll({ jobId, stage, search } = {}) {
        const pool = await connectDb();
        const request = pool.request();
        let whereConditions = ['1=1'];

        if (jobId && jobId !== 'all') {
            request.input('jobId', sql.Int, parseInt(jobId));
            whereConditions.push('c.JobId = @jobId');
        }

        if (stage && stage !== 'all') {
            request.input('stage', sql.NVarChar(50), stage);
            whereConditions.push('c.Stage = @stage');
        }

        if (search && search.trim()) {
            request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
            whereConditions.push(
                '(c.FullName LIKE @search OR c.CandidateCode LIKE @search OR c.Phone LIKE @search OR c.Email LIKE @search)',
            );
        }

        const query = `
      SELECT 
        c.CandidateId,
        c.CandidateCode,
        c.JobId,
        j.JobTitle,
        d.DepartmentId,
        d.DepartmentName,
        c.FullName,
        c.Phone,
        c.Email,
        c.CvUrl,
        c.Stage,
        CONVERT(varchar, c.AppliedDate, 23) as AppliedDate,
        c.InterviewerEmployeeId,
        e.FullName as InterviewerName,
        e.EmployeeCode as InterviewerCode,
        c.RatingScore,
        c.Note
      FROM tblCandidate c
      LEFT JOIN tblRecruitmentJob j ON c.JobId = j.JobId
      LEFT JOIN tblDepartment d ON j.DepartmentId = d.DepartmentId
      LEFT JOIN tblEmployee e ON c.InterviewerEmployeeId = e.EmployeeId
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY c.CandidateId DESC
    `;

        const result = await request.query(query);
        return result.recordset;
    }

    /**
     * Lấy chi tiết thông tin một ứng viên
     */
    static async getById(candidateId) {
        const pool = await connectDb();
        const request = pool.request();
        request.input('id', sql.Int, parseInt(candidateId));

        const result = await request.query(`
      SELECT 
        c.CandidateId,
        c.CandidateCode,
        c.JobId,
        j.JobTitle,
        d.DepartmentId,
        d.DepartmentName,
        c.FullName,
        c.Phone,
        c.Email,
        c.CvUrl,
        c.Stage,
        CONVERT(varchar, c.AppliedDate, 23) as AppliedDate,
        c.InterviewerEmployeeId,
        e.FullName as InterviewerName,
        e.EmployeeCode as InterviewerCode,
        c.RatingScore,
        c.Note
      FROM tblCandidate c
      LEFT JOIN tblRecruitmentJob j ON c.JobId = j.JobId
      LEFT JOIN tblDepartment d ON j.DepartmentId = d.DepartmentId
      LEFT JOIN tblEmployee e ON c.InterviewerEmployeeId = e.EmployeeId
      WHERE c.CandidateId = @id
    `);

        return result.recordset[0] || null;
    }

    /**
     * Thêm mới ứng viên ứng tuyển vào tblCandidate
     */
    static async create({
        CandidateCode,
        JobId,
        FullName,
        Phone,
        Email,
        CvUrl,
        Stage = 'Applied',
        AppliedDate,
        InterviewerEmployeeId,
        RatingScore,
        Note,
    }) {
        const pool = await connectDb();

        // Tự sinh mã ứng viên nếu chưa truyền (VD: UV001, UV002)
        let candidateCode = (CandidateCode || '').trim();
        if (!candidateCode) {
            const countRes = await pool
                .request()
                .query('SELECT COUNT(*) as total FROM tblCandidate');
            const nextIdx = (countRes.recordset[0]?.total || 0) + 1;
            candidateCode = `UV${String(nextIdx).padStart(3, '0')}`;
        }

        const request = pool.request();
        request.input('CandidateCode', sql.VarChar(20), candidateCode);
        request.input('JobId', sql.Int, parseInt(JobId));
        request.input('FullName', sql.NVarChar(100), FullName);
        request.input('Phone', sql.VarChar(20), Phone || null);
        request.input('Email', sql.VarChar(100), Email || null);
        request.input('CvUrl', sql.NVarChar(500), CvUrl || null);
        request.input('Stage', sql.NVarChar(50), Stage || 'Applied');
        request.input(
            'AppliedDate',
            sql.Date,
            AppliedDate || new Date().toISOString().slice(0, 10),
        );
        request.input(
            'InterviewerEmployeeId',
            sql.Int,
            InterviewerEmployeeId ? parseInt(InterviewerEmployeeId) : null,
        );
        request.input(
            'RatingScore',
            sql.Int,
            RatingScore !== undefined && RatingScore !== null
                ? parseInt(RatingScore)
                : null,
        );
        request.input('Note', sql.NVarChar(sql.MAX), Note || null);

        const result = await request.query(`
      INSERT INTO tblCandidate (
        CandidateCode, JobId, FullName, Phone, Email, CvUrl, Stage, AppliedDate, InterviewerEmployeeId, RatingScore, Note
      )
      OUTPUT INSERTED.CandidateId, INSERTED.CandidateCode, INSERTED.FullName, INSERTED.Stage
      VALUES (
        @CandidateCode, @JobId, @FullName, @Phone, @Email, @CvUrl, @Stage, @AppliedDate, @InterviewerEmployeeId, @RatingScore, @Note
      )
    `);

        return result.recordset[0];
    }

    /**
     * Cập nhật trạng thái ứng viên qua các cột Kanban (Applied -> Screening -> Interviewing -> Offered -> Rejected)
     */
    static async updateStage(candidateId, stage) {
        const pool = await connectDb();
        const request = pool.request();

        request.input('id', sql.Int, parseInt(candidateId));
        request.input('stage', sql.NVarChar(50), stage);

        await request.query(`
      UPDATE tblCandidate
      SET Stage = @stage
      WHERE CandidateId = @id
    `);

        return { CandidateId: parseInt(candidateId), Stage: stage };
    }

    /**
     * Cập nhật toàn bộ thông tin ứng viên (Đánh giá, ghi chú, người phỏng vấn...)
     */
    static async update(
        candidateId,
        {
            JobId,
            FullName,
            Phone,
            Email,
            CvUrl,
            Stage,
            InterviewerEmployeeId,
            RatingScore,
            Note,
        },
    ) {
        const pool = await connectDb();
        const request = pool.request();

        request.input('id', sql.Int, parseInt(candidateId));
        request.input('JobId', sql.Int, JobId ? parseInt(JobId) : null);
        request.input('FullName', sql.NVarChar(100), FullName || null);
        request.input('Phone', sql.VarChar(20), Phone || null);
        request.input('Email', sql.VarChar(100), Email || null);
        request.input('CvUrl', sql.NVarChar(500), CvUrl || null);
        request.input('Stage', sql.NVarChar(50), Stage || null);
        request.input(
            'InterviewerEmployeeId',
            sql.Int,
            InterviewerEmployeeId !== undefined
                ? InterviewerEmployeeId
                    ? parseInt(InterviewerEmployeeId)
                    : null
                : null,
        );
        request.input(
            'RatingScore',
            sql.Int,
            RatingScore !== undefined
                ? RatingScore !== null
                    ? parseInt(RatingScore)
                    : null
                : null,
        );
        request.input(
            'Note',
            sql.NVarChar(sql.MAX),
            Note !== undefined ? Note : null,
        );

        await request.query(`
      UPDATE tblCandidate SET
        JobId = COALESCE(@JobId, JobId),
        FullName = COALESCE(@FullName, FullName),
        Phone = COALESCE(@Phone, Phone),
        Email = COALESCE(@Email, Email),
        CvUrl = COALESCE(@CvUrl, CvUrl),
        Stage = COALESCE(@Stage, Stage),
        InterviewerEmployeeId = COALESCE(@InterviewerEmployeeId, InterviewerEmployeeId),
        RatingScore = COALESCE(@RatingScore, RatingScore),
        Note = COALESCE(@Note, Note)
      WHERE CandidateId = @id
    `);

        return { CandidateId: parseInt(candidateId) };
    }

    /**
     * Xóa ứng viên
     */
    static async delete(candidateId) {
        const pool = await connectDb();
        const request = pool.request();
        request.input('id', sql.Int, parseInt(candidateId));

        await request.query(`DELETE FROM tblCandidate WHERE CandidateId = @id`);
        return { CandidateId: parseInt(candidateId) };
    }

    /**
     * Đếm số lượng ứng viên
     */
    static async count() {
        const pool = await connectDb();
        const res = await pool
            .request()
            .query('SELECT COUNT(*) as total FROM tblCandidate');
        return res.recordset[0]?.total || 0;
    }
}
