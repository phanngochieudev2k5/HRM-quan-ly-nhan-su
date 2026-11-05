import { connectDb, sql } from '../Config/DbConfig.js';

export class RecruitmentJobModel {
  /**
   * Lấy danh sách các vị trí tuyển dụng kèm tên phòng ban và số lượng ứng viên
   */
  static async getAll({ departmentId, status, search } = {}) {
    const pool = await connectDb();
    const request = pool.request();
    let whereConditions = ['1=1'];

    if (departmentId) {
      request.input('deptId', sql.Int, parseInt(departmentId));
      whereConditions.push('j.DepartmentId = @deptId');
    }

    if (status && status !== 'all' && status !== 'Tất cả trạng thái') {
      request.input('status', sql.NVarChar(50), status);
      whereConditions.push('j.Status = @status');
    }

    if (search && search.trim()) {
      request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
      whereConditions.push('(j.JobTitle LIKE @search OR j.JobDescription LIKE @search OR d.DepartmentName LIKE @search)');
    }

    const query = `
      SELECT 
        j.JobId,
        j.JobTitle,
        j.DepartmentId,
        d.DepartmentName,
        d.DepartmentCode,
        j.TargetQuantity,
        j.SalaryRange,
        CONVERT(varchar, j.Deadline, 23) as Deadline,
        j.JobDescription,
        j.Status,
        CONVERT(varchar, j.CreatedAt, 120) as CreatedAt,
        (SELECT COUNT(*) FROM tblCandidate c WHERE c.JobId = j.JobId) as AppliedCount
      FROM tblRecruitmentJob j
      LEFT JOIN tblDepartment d ON j.DepartmentId = d.DepartmentId
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY j.JobId DESC
    `;

    const result = await request.query(query);
    return result.recordset;
  }

  /**
   * Lấy thông tin chi tiết một vị trí tuyển dụng
   */
  static async getById(jobId) {
    const pool = await connectDb();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(jobId));

    const result = await request.query(`
      SELECT 
        j.JobId,
        j.JobTitle,
        j.DepartmentId,
        d.DepartmentName,
        d.DepartmentCode,
        j.TargetQuantity,
        j.SalaryRange,
        CONVERT(varchar, j.Deadline, 23) as Deadline,
        j.JobDescription,
        j.Status,
        CONVERT(varchar, j.CreatedAt, 120) as CreatedAt,
        (SELECT COUNT(*) FROM tblCandidate c WHERE c.JobId = j.JobId) as AppliedCount
      FROM tblRecruitmentJob j
      LEFT JOIN tblDepartment d ON j.DepartmentId = d.DepartmentId
      WHERE j.JobId = @id
    `);

    return result.recordset[0] || null;
  }

  /**
   * Thêm mới đề xuất tuyển dụng vào tblRecruitmentJob
   */
  static async create({ JobTitle, DepartmentId, TargetQuantity, SalaryRange, Deadline, JobDescription, Status = 'Pending' }) {
    const pool = await connectDb();
    const request = pool.request();

    const safeDeadline = Deadline && String(Deadline).trim() ? String(Deadline).trim() : null;

    request.input('JobTitle', sql.NVarChar(100), JobTitle);
    request.input('DepartmentId', sql.Int, parseInt(DepartmentId));
    request.input('TargetQuantity', sql.Int, parseInt(TargetQuantity) || 1);
    request.input('SalaryRange', sql.NVarChar(50), SalaryRange || 'Thỏa thuận');
    request.input('Deadline', sql.Date, safeDeadline);
    request.input('JobDescription', sql.NVarChar(sql.MAX), JobDescription || '');
    request.input('Status', sql.NVarChar(50), Status || 'Pending');

    const result = await request.query(`
      INSERT INTO tblRecruitmentJob (
        JobTitle, DepartmentId, TargetQuantity, SalaryRange, Deadline, JobDescription, Status, CreatedAt
      )
      OUTPUT INSERTED.JobId, INSERTED.JobTitle, INSERTED.Status
      VALUES (
        @JobTitle, @DepartmentId, @TargetQuantity, @SalaryRange, @Deadline, @JobDescription, @Status, SYSDATETIME()
      )
    `);

    return result.recordset[0];
  }

  /**
   * Cập nhật trạng thái duyệt/từ chối đề xuất (Approved, Rejected, Pending)
   */
  static async updateStatus(jobId, status) {
    const pool = await connectDb();
    const request = pool.request();

    request.input('id', sql.Int, parseInt(jobId));
    request.input('status', sql.NVarChar(50), status);

    await request.query(`
      UPDATE tblRecruitmentJob
      SET Status = @status
      WHERE JobId = @id
    `);

    return { JobId: parseInt(jobId), Status: status };
  }

  /**
   * Cập nhật đầy đủ thông tin vị trí tuyển dụng
   */
  static async update(jobId, { JobTitle, DepartmentId, TargetQuantity, SalaryRange, Deadline, JobDescription, Status }) {
    const pool = await connectDb();
    const request = pool.request();

    const safeDeadline = Deadline && String(Deadline).trim() ? String(Deadline).trim() : null;

    request.input('id', sql.Int, parseInt(jobId));
    request.input('JobTitle', sql.NVarChar(100), JobTitle || null);
    request.input('DepartmentId', sql.Int, DepartmentId ? parseInt(DepartmentId) : null);
    request.input('TargetQuantity', sql.Int, TargetQuantity !== undefined ? parseInt(TargetQuantity) : null);
    request.input('SalaryRange', sql.NVarChar(50), SalaryRange || null);
    request.input('Deadline', sql.Date, safeDeadline);
    request.input('JobDescription', sql.NVarChar(sql.MAX), JobDescription || null);
    request.input('Status', sql.NVarChar(50), Status || null);

    await request.query(`
      UPDATE tblRecruitmentJob SET
        JobTitle = COALESCE(@JobTitle, JobTitle),
        DepartmentId = COALESCE(@DepartmentId, DepartmentId),
        TargetQuantity = COALESCE(@TargetQuantity, TargetQuantity),
        SalaryRange = COALESCE(@SalaryRange, SalaryRange),
        Deadline = COALESCE(@Deadline, Deadline),
        JobDescription = COALESCE(@JobDescription, JobDescription),
        Status = COALESCE(@Status, Status)
      WHERE JobId = @id
    `);

    return { JobId: parseInt(jobId) };
  }

  /**
   * Xóa vị trí tuyển dụng
   */
  static async delete(jobId) {
    const pool = await connectDb();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(jobId));

    await request.query(`DELETE FROM tblCandidate WHERE JobId = @id`);
    await request.query(`DELETE FROM tblRecruitmentJob WHERE JobId = @id`);

    return { JobId: parseInt(jobId) };
  }

  /**
   * Đếm số lượng record hiện có
   */
  static async count() {
    const pool = await connectDb();
    const res = await pool.request().query('SELECT COUNT(*) as total FROM tblRecruitmentJob');
    return res.recordset[0]?.total || 0;
  }
}
