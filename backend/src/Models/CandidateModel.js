import { connectDb, sql } from '../Config/DbConfig.js';

function formatDateTimeSql(val) {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val;
  }
  const s = String(val).trim();
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  return s.replace('T', ' ');
}

function formatDateSql(val) {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${val.getFullYear()}-${pad(val.getMonth() + 1)}-${pad(val.getDate())}`;
  }
  const s = String(val).trim();
  if (!s) return null;
  if (s.includes('T')) return s.split('T')[0];
  if (s.includes(' ')) return s.split(' ')[0];
  return s;
}

export class CandidateModel {
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
        c.Note,
        CONVERT(varchar, c.InterviewDateTime, 120) as InterviewDateTime,
        c.InterviewLocation,
        c.OfferedSalary,
        CONVERT(varchar, c.StartDate, 23) as StartDate
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
        c.Note,
        CONVERT(varchar, c.InterviewDateTime, 120) as InterviewDateTime,
        c.InterviewLocation,
        c.OfferedSalary,
        CONVERT(varchar, c.StartDate, 23) as StartDate
      FROM tblCandidate c
      LEFT JOIN tblRecruitmentJob j ON c.JobId = j.JobId
      LEFT JOIN tblDepartment d ON j.DepartmentId = d.DepartmentId
      LEFT JOIN tblEmployee e ON c.InterviewerEmployeeId = e.EmployeeId
      WHERE c.CandidateId = @id
    `);

    return result.recordset[0] || null;
  }

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
    InterviewDateTime,
    InterviewLocation,
    OfferedSalary,
    StartDate
  }) {
    const pool = await connectDb();

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
      formatDateSql(AppliedDate) || formatDateSql(new Date()),
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
    request.input('InterviewDateTime', sql.DateTime2, formatDateTimeSql(InterviewDateTime));
    request.input('InterviewLocation', sql.NVarChar(255), InterviewLocation || null);
    request.input('OfferedSalary', sql.Decimal(18, 2), OfferedSalary ? parseFloat(OfferedSalary) : null);
    request.input('StartDate', sql.Date, formatDateSql(StartDate));

    const result = await request.query(`
      INSERT INTO tblCandidate (
        CandidateCode, JobId, FullName, Phone, Email, CvUrl, Stage, AppliedDate,
        InterviewerEmployeeId, RatingScore, Note, InterviewDateTime, InterviewLocation,
        OfferedSalary, StartDate
      )
      OUTPUT INSERTED.CandidateId, INSERTED.CandidateCode, INSERTED.FullName, INSERTED.Stage
      VALUES (
        @CandidateCode, @JobId, @FullName, @Phone, @Email, @CvUrl, @Stage, @AppliedDate,
        @InterviewerEmployeeId, @RatingScore, @Note, @InterviewDateTime, @InterviewLocation,
        @OfferedSalary, @StartDate
      )
    `);

    return result.recordset[0];
  }

  static async updateStage(candidateId, stage, additionalData = {}) {
    const pool = await connectDb();
    const request = pool.request();

    request.input('id', sql.Int, parseInt(candidateId));
    request.input('stage', sql.NVarChar(50), stage);

    const updates = ['Stage = @stage'];

    if (additionalData.InterviewerEmployeeId !== undefined) {
      request.input('InterviewerEmployeeId', sql.Int, additionalData.InterviewerEmployeeId ? parseInt(additionalData.InterviewerEmployeeId) : null);
      updates.push('InterviewerEmployeeId = @InterviewerEmployeeId');
    }

    if (additionalData.InterviewDateTime !== undefined) {
      request.input('InterviewDateTime', sql.DateTime2, formatDateTimeSql(additionalData.InterviewDateTime));
      updates.push('InterviewDateTime = @InterviewDateTime');
    }

    if (additionalData.InterviewLocation !== undefined) {
      request.input('InterviewLocation', sql.NVarChar(255), additionalData.InterviewLocation || null);
      updates.push('InterviewLocation = @InterviewLocation');
    }

    if (additionalData.OfferedSalary !== undefined) {
      request.input('OfferedSalary', sql.Decimal(18, 2), additionalData.OfferedSalary ? parseFloat(additionalData.OfferedSalary) : null);
      updates.push('OfferedSalary = @OfferedSalary');
    }

    if (additionalData.StartDate !== undefined) {
      request.input('StartDate', sql.Date, formatDateSql(additionalData.StartDate));
      updates.push('StartDate = @StartDate');
    }

    await request.query(`
      UPDATE tblCandidate
      SET ${updates.join(', ')}
      WHERE CandidateId = @id
    `);

    return { CandidateId: parseInt(candidateId), Stage: stage, ...additionalData };
  }

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
      InterviewDateTime,
      InterviewLocation,
      OfferedSalary,
      StartDate
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
    request.input('InterviewDateTime', sql.DateTime2, InterviewDateTime !== undefined ? formatDateTimeSql(InterviewDateTime) : null);
    request.input('InterviewLocation', sql.NVarChar(255), InterviewLocation !== undefined ? (InterviewLocation || null) : null);
    request.input('OfferedSalary', sql.Decimal(18, 2), OfferedSalary !== undefined ? (OfferedSalary ? parseFloat(OfferedSalary) : null) : null);
    request.input('StartDate', sql.Date, StartDate !== undefined ? formatDateSql(StartDate) : null);

    const updateClauses = [
      'Stage = COALESCE(@Stage, Stage)',
      'InterviewerEmployeeId = COALESCE(@InterviewerEmployeeId, InterviewerEmployeeId)',
      'RatingScore = COALESCE(@RatingScore, RatingScore)',
      'Note = COALESCE(@Note, Note)'
    ];

    if (FullName) updateClauses.push('FullName = @FullName');
    if (Phone) updateClauses.push('Phone = @Phone');
    if (Email) updateClauses.push('Email = @Email');
    if (CvUrl) updateClauses.push('CvUrl = @CvUrl');
    if (JobId) updateClauses.push('JobId = @JobId');

    if (InterviewDateTime !== undefined) updateClauses.push('InterviewDateTime = @InterviewDateTime');
    if (InterviewLocation !== undefined) updateClauses.push('InterviewLocation = @InterviewLocation');
    if (OfferedSalary !== undefined) updateClauses.push('OfferedSalary = @OfferedSalary');
    if (StartDate !== undefined) updateClauses.push('StartDate = @StartDate');

    await request.query(`
      UPDATE tblCandidate SET
        ${updateClauses.join(', ')}
      WHERE CandidateId = @id
    `);

    return { CandidateId: parseInt(candidateId) };
  }

  static async delete(candidateId) {
    const pool = await connectDb();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(candidateId));

    await request.query(`DELETE FROM tblCandidate WHERE CandidateId = @id`);
    return { CandidateId: parseInt(candidateId) };
  }

  static async count() {
    const pool = await connectDb();
    const res = await pool
      .request()
      .query('SELECT COUNT(*) as total FROM tblCandidate');
    return res.recordset[0]?.total || 0;
  }
}
