import { connectDb, sql } from '../Config/DbConfig.js';

export class AssetModel {
  static async ensureSchema(pool) {
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblAsset') AND name = 'CreatedAt')
        BEGIN
          IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblAsset') AND name = 'SerialNumber')
            ALTER TABLE tblAsset ADD SerialNumber VARCHAR(100) NULL;
          IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblAsset') AND name = 'Status')
            ALTER TABLE tblAsset ADD Status NVARCHAR(50) DEFAULT N'Đang sử dụng';
          IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblAsset') AND name = 'Condition')
            ALTER TABLE tblAsset ADD Condition NVARCHAR(50) DEFAULT N'Mới 100%';
          IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblAsset') AND name = 'EmployeeId')
            ALTER TABLE tblAsset ADD EmployeeId INT NULL;
          IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblAsset') AND name = 'AssignDate')
            ALTER TABLE tblAsset ADD AssignDate DATE NULL;
          IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblAsset') AND name = 'Notes')
            ALTER TABLE tblAsset ADD Notes NVARCHAR(255) NULL;
          IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblAsset') AND name = 'CreatedAt')
            ALTER TABLE tblAsset ADD CreatedAt DATETIME2 DEFAULT SYSDATETIME();
        END
      `);
    } catch (e) {}
  }

  static async getAll({ search, category, status, employeeId } = {}) {
    const pool = await connectDb();
    await this.ensureSchema(pool);
    const request = pool.request();
    let where = ['1=1'];

    if (employeeId) {
      request.input('employeeId', sql.Int, parseInt(employeeId));
      where.push('a.EmployeeId = @employeeId');
    }

    if (status && status !== 'all') {
      request.input('status', sql.NVarChar(50), status);
      where.push('a.Status = @status');
    }

    if (category && category !== 'all') {
      request.input('category', sql.NVarChar(50), category);
      where.push('a.Category = @category');
    }

    if (search && search.trim()) {
      request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
      where.push('(a.AssetName LIKE @search OR a.AssetCode LIKE @search OR a.SerialNumber LIKE @search OR e.FullName LIKE @search)');
    }

    const query = `
      SELECT 
        a.AssetId,
        a.AssetCode,
        a.AssetName,
        a.Category,
        a.SerialNumber,
        a.Status,
        a.Condition,
        a.EmployeeId,
        e.EmployeeCode,
        e.FullName as AssignedToName,
        CONVERT(varchar, a.AssignDate, 23) as AssignDate,
        a.Notes,
        a.CreatedAt
      FROM tblAsset a
      LEFT JOIN tblEmployee e ON a.EmployeeId = e.EmployeeId
      WHERE ${where.join(' AND ')}
      ORDER BY a.AssetId DESC
    `;

    const result = await request.query(query);
    return result.recordset;
  }

  static async getByEmployeeId(employeeId) {
    return this.getAll({ employeeId });
  }

  static async create({
    AssetCode,
    AssetName,
    Category,
    SerialNumber,
    Status = 'Đang sử dụng',
    Condition = 'Mới 100%',
    EmployeeId,
    AssignDate,
    Notes
  }) {
    const pool = await connectDb();
    await this.ensureSchema(pool);
    const request = pool.request();

    let code = (AssetCode || '').trim();
    if (!code) {
      const maxRes = await pool.request().query(`
        SELECT MAX(CAST(SUBSTRING(AssetCode, 4, 10) AS INT)) as maxNum 
        FROM tblAsset 
        WHERE AssetCode LIKE 'AST%' AND ISNUMERIC(SUBSTRING(AssetCode, 4, 10)) = 1
      `);
      let nextNum = (maxRes.recordset[0]?.maxNum || 0) + 1;
      code = `AST${String(nextNum).padStart(3, '0')}`;
      let exists = true;
      while (exists) {
        const check = await pool.request()
          .input('chkCode', sql.VarChar(50), code)
          .query('SELECT AssetId FROM tblAsset WHERE AssetCode = @chkCode');
        if (check.recordset.length === 0) {
          exists = false;
        } else {
          nextNum += 1;
          code = `AST${String(nextNum).padStart(3, '0')}`;
        }
      }
    }

    const safeAssignDate = AssignDate ? AssignDate : new Date().toISOString().slice(0, 10);

    request.input('AssetCode', sql.VarChar(50), code);
    request.input('AssetName', sql.NVarChar(100), AssetName);
    request.input('Category', sql.NVarChar(50), Category || 'Laptop');
    request.input('SerialNumber', sql.VarChar(100), SerialNumber || null);
    request.input('Status', sql.NVarChar(50), Status || 'Đang sử dụng');
    request.input('Condition', sql.NVarChar(50), Condition || 'Mới 100%');
    request.input('EmployeeId', sql.Int, EmployeeId ? parseInt(EmployeeId) : null);
    request.input('AssignDate', sql.Date, safeAssignDate);
    request.input('Notes', sql.NVarChar(255), Notes || null);

    const result = await request.query(`
      INSERT INTO tblAsset (
        AssetCode, AssetName, Category, SerialNumber, Status, Condition, EmployeeId, AssignDate, Notes, CreatedAt
      )
      OUTPUT INSERTED.*
      VALUES (
        @AssetCode, @AssetName, @Category, @SerialNumber, @Status, @Condition, @EmployeeId, @AssignDate, @Notes, SYSDATETIME()
      )
    `);

    if (EmployeeId) {
      await pool.request()
        .input('empId', sql.Int, parseInt(EmployeeId))
        .query('UPDATE tblOnboarding SET AssetAssigned = 1 WHERE EmployeeId = @empId');
    }

    return result.recordset[0];
  }

  static async delete(assetId) {
    const pool = await connectDb();
    await pool.request()
      .input('id', sql.Int, parseInt(assetId))
      .query('DELETE FROM tblAsset WHERE AssetId = @id');
    return { AssetId: parseInt(assetId) };
  }
}

