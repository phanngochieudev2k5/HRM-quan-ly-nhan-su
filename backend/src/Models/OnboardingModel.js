import { connectDb, sql } from '../Config/DbConfig.js';
import bcrypt from 'bcryptjs';
import { EmailService } from '../Services/EmailService.js';

export class OnboardingModel {
  static async getAll({ search, status } = {}) {
    const pool = await connectDb();
    const request = pool.request();
    let where = ['1=1'];

    if (status && status !== 'all' && status !== 'Tất cả') {
      request.input('status', sql.NVarChar(50), status);
      where.push('o.Status = @status');
    }

    if (search && search.trim()) {
      request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
      where.push('(o.CandidateName LIKE @search OR o.PositionName LIKE @search OR o.OnboardingCode LIKE @search OR d.DepartmentName LIKE @search)');
    }

    const query = `
      SELECT 
        o.OnboardingId,
        o.OnboardingCode,
        o.EmployeeId,
        o.CandidateName,
        o.PositionName,
        o.DepartmentId,
        d.DepartmentName,
        d.DepartmentCode,
        CONVERT(varchar, o.StartDate, 23) as StartDate,
        o.MentorEmployeeId,
        m.FullName as MentorName,
        m.EmployeeCode as MentorCode,
        o.AccountCreated,
        o.ContractSigned,
        o.AssetAssigned,
        o.FaceEnrolled,
        COALESCE(o.FaceRequestSent, 0) as FaceRequestSent,
        COALESCE(o.FacePhotosCount, 0) as FacePhotosCount,
        o.Status,
        COALESCE(o.OfferedSalary, cand.OfferedSalary, 15000000) as OfferedSalary,
        COALESCE(o.Username, u.Username) as Username,
        COALESCE(o.Email, cand.Email, e.Email) as Email,
        COALESCE(o.Phone, cand.Phone, e.Phone) as Phone,
        e.EmployeeCode,
        e.Gender,
        CONVERT(varchar, e.BirthDate, 23) as BirthDate,
        e.Address,
        e.IdCardNumber,
        e.BankName,
        e.BankAccountNumber
      FROM tblOnboarding o
      LEFT JOIN tblDepartment d ON o.DepartmentId = d.DepartmentId
      LEFT JOIN tblEmployee m ON o.MentorEmployeeId = m.EmployeeId
      LEFT JOIN tblEmployee e ON o.EmployeeId = e.EmployeeId
      LEFT JOIN tblUser u ON e.UserId = u.UserId
      LEFT JOIN (
        SELECT FullName, MAX(Email) as Email, MAX(Phone) as Phone, MAX(OfferedSalary) as OfferedSalary
        FROM tblCandidate
        GROUP BY FullName
      ) cand ON cand.FullName = o.CandidateName
      WHERE ${where.join(' AND ')}
      ORDER BY o.OnboardingId DESC
    `;

    const result = await request.query(query);
    return result.recordset;
  }

  static async getById(id) {
    const pool = await connectDb();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id));

    const query = `
      SELECT 
        o.OnboardingId,
        o.OnboardingCode,
        o.EmployeeId,
        o.CandidateName,
        o.PositionName,
        o.DepartmentId,
        d.DepartmentName,
        d.DepartmentCode,
        CONVERT(varchar, o.StartDate, 23) as StartDate,
        o.MentorEmployeeId,
        m.FullName as MentorName,
        m.EmployeeCode as MentorCode,
        o.AccountCreated,
        o.ContractSigned,
        o.AssetAssigned,
        o.FaceEnrolled,
        COALESCE(o.FaceRequestSent, 0) as FaceRequestSent,
        COALESCE(o.FacePhotosCount, 0) as FacePhotosCount,
        o.Status,
        COALESCE(o.OfferedSalary, cand.OfferedSalary, 15000000) as OfferedSalary,
        COALESCE(o.Username, u.Username) as Username,
        COALESCE(o.Email, cand.Email, e.Email) as Email,
        COALESCE(o.Phone, cand.Phone, e.Phone) as Phone,
        e.EmployeeCode,
        e.Gender,
        CONVERT(varchar, e.BirthDate, 23) as BirthDate,
        e.Address,
        e.IdCardNumber,
        e.BankName,
        e.BankAccountNumber
      FROM tblOnboarding o
      LEFT JOIN tblDepartment d ON o.DepartmentId = d.DepartmentId
      LEFT JOIN tblEmployee m ON o.MentorEmployeeId = m.EmployeeId
      LEFT JOIN tblEmployee e ON o.EmployeeId = e.EmployeeId
      LEFT JOIN tblUser u ON e.UserId = u.UserId
      LEFT JOIN (
        SELECT FullName, MAX(Email) as Email, MAX(Phone) as Phone, MAX(OfferedSalary) as OfferedSalary
        FROM tblCandidate
        GROUP BY FullName
      ) cand ON cand.FullName = o.CandidateName
      WHERE o.OnboardingId = @id
    `;

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  static async create({
    OnboardingCode,
    CandidateName,
    PositionName,
    DepartmentId,
    StartDate,
    MentorEmployeeId,
    AccountCreated = false,
    ContractSigned = false,
    AssetAssigned = false,
    FaceEnrolled = false,
    Status = 'Đang tiếp nhận',
    OfferedSalary = null,
    Email = null,
    Phone = null,
    Username = null
  }) {
    const pool = await connectDb();
    const request = pool.request();

    let code = (OnboardingCode || '').trim();
    if (!code) {
      const countRes = await pool.request().query('SELECT COUNT(*) as total FROM tblOnboarding');
      const nextIdx = (countRes.recordset[0]?.total || 0) + 1;
      code = `ONB${String(nextIdx).padStart(2, '0')}`;
    }

    const safeStartDate = StartDate ? StartDate : new Date().toISOString().slice(0, 10);

    request.input('OnboardingCode', sql.VarChar(20), code);
    request.input('CandidateName', sql.NVarChar(100), CandidateName);
    request.input('PositionName', sql.NVarChar(100), PositionName || 'Chuyên viên');
    request.input('DepartmentId', sql.Int, parseInt(DepartmentId) || 2);
    request.input('StartDate', sql.Date, safeStartDate);
    request.input('MentorEmployeeId', sql.Int, MentorEmployeeId ? parseInt(MentorEmployeeId) : null);
    request.input('AccountCreated', sql.Bit, AccountCreated ? 1 : 0);
    request.input('ContractSigned', sql.Bit, ContractSigned ? 1 : 0);
    request.input('AssetAssigned', sql.Bit, AssetAssigned ? 1 : 0);
    request.input('FaceEnrolled', sql.Bit, FaceEnrolled ? 1 : 0);
    request.input('Status', sql.NVarChar(50), Status || 'Đang tiếp nhận');
    request.input('OfferedSalary', sql.Decimal(18, 2), OfferedSalary ? parseFloat(OfferedSalary) : null);
    request.input('Email', sql.VarChar(100), Email ? String(Email).trim() : null);
    request.input('Phone', sql.VarChar(20), Phone ? String(Phone).trim() : null);
    request.input('Username', sql.NVarChar(50), Username ? String(Username).trim() : null);

    const result = await request.query(`
      INSERT INTO tblOnboarding (
        OnboardingCode, CandidateName, PositionName, DepartmentId, StartDate, MentorEmployeeId,
        AccountCreated, ContractSigned, AssetAssigned, FaceEnrolled, Status, OfferedSalary, Email, Phone, Username
      )
      OUTPUT INSERTED.*
      VALUES (
        @OnboardingCode, @CandidateName, @PositionName, @DepartmentId, @StartDate, @MentorEmployeeId,
        @AccountCreated, @ContractSigned, @AssetAssigned, @FaceEnrolled, @Status, @OfferedSalary, @Email, @Phone, @Username
      )
    `);

    return result.recordset[0];
  }

  static async updateChecklist(id, fields = {}) {
    const pool = await connectDb();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id));

    const updates = [];

    if (fields.AccountCreated !== undefined) {
      request.input('AccountCreated', sql.Bit, fields.AccountCreated ? 1 : 0);
      updates.push('AccountCreated = @AccountCreated');
    }
    if (fields.ContractSigned !== undefined) {
      request.input('ContractSigned', sql.Bit, fields.ContractSigned ? 1 : 0);
      updates.push('ContractSigned = @ContractSigned');
    }
    if (fields.AssetAssigned !== undefined) {
      request.input('AssetAssigned', sql.Bit, fields.AssetAssigned ? 1 : 0);
      updates.push('AssetAssigned = @AssetAssigned');
    }
    if (fields.FaceEnrolled !== undefined) {
      request.input('FaceEnrolled', sql.Bit, fields.FaceEnrolled ? 1 : 0);
      updates.push('FaceEnrolled = @FaceEnrolled');
    }
    if (fields.FaceRequestSent !== undefined) {
      request.input('FaceRequestSent', sql.Bit, fields.FaceRequestSent ? 1 : 0);
      updates.push('FaceRequestSent = @FaceRequestSent');
    }
    if (fields.FacePhotosCount !== undefined) {
      request.input('FacePhotosCount', sql.Int, parseInt(fields.FacePhotosCount, 10));
      updates.push('FacePhotosCount = @FacePhotosCount');
    }
    if (fields.Status) {
      request.input('Status', sql.NVarChar(50), fields.Status);
      updates.push('Status = @Status');
    }
    if (fields.MentorEmployeeId !== undefined) {
      request.input('MentorEmployeeId', sql.Int, fields.MentorEmployeeId ? parseInt(fields.MentorEmployeeId) : null);
      updates.push('MentorEmployeeId = @MentorEmployeeId');
    }
    if (fields.StartDate) {
      request.input('StartDate', sql.Date, fields.StartDate);
      updates.push('StartDate = @StartDate');
    }
    if (fields.OfferedSalary !== undefined) {
      request.input('OfferedSalary', sql.Decimal(18, 2), fields.OfferedSalary ? parseFloat(fields.OfferedSalary) : null);
      updates.push('OfferedSalary = @OfferedSalary');
    }

    if (updates.length === 0) return await this.getById(id);

    const query = `
      UPDATE tblOnboarding
      SET ${updates.join(', ')}
      WHERE OnboardingId = @id
    `;

    await request.query(query);
    return await this.getById(id);
  }

  static async delete(id) {
    const pool = await connectDb();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(id));
    await request.query('DELETE FROM tblOnboarding WHERE OnboardingId = @id');
    return { OnboardingId: parseInt(id) };
  }

  static async createAccount(onboardingId, { username, email, phone, sendEmail = false }) {
    const pool = await connectDb();
    const onb = await this.getById(onboardingId);
    if (!onb) {
      throw new Error('Không tìm thấy hồ sơ Onboarding!');
    }

    if (!username || !username.trim()) {
      throw new Error('Vui lòng nhập tên tài khoản (Username) cho nhân viên!');
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = (email || onb.Email || '').trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Vui lòng nhập địa chỉ email hợp lệ để nhận thông tin đăng nhập!');
    }

    const checkUser = await pool.request()
      .input('u', sql.VarChar(50), cleanUsername)
      .input('em', sql.VarChar(100), cleanEmail)
      .query('SELECT UserId, Username, Email FROM tblUser WHERE Username = @u OR Email = @em');
    
    if (checkUser.recordset.length > 0) {
      const matchUser = checkUser.recordset.find(r => (r.Username || '').toLowerCase() === cleanUsername);
      if (matchUser) {
        throw new Error(`Tên đăng nhập "${cleanUsername}" đã tồn tại trong hệ thống! Vui lòng chọn tên đăng nhập khác.`);
      }
      const matchEmail = checkUser.recordset.find(r => (r.Email || '').toLowerCase() === cleanEmail.toLowerCase());
      if (matchEmail) {
        throw new Error(`Địa chỉ email "${cleanEmail}" đã được sử dụng cho tài khoản khác!`);
      }
    }

    let employeeId = onb.EmployeeId;
    let employeeCode = onb.EmployeeCode;

    if (!employeeId) {
      const checkEmp = await pool.request()
        .input('em', sql.VarChar(100), cleanEmail)
        .query('SELECT TOP 1 EmployeeId, EmployeeCode FROM tblEmployee WHERE Email = @em');
      if (checkEmp.recordset.length > 0) {
        employeeId = checkEmp.recordset[0].EmployeeId;
        employeeCode = checkEmp.recordset[0].EmployeeCode;
      }
    }

    const defaultPassword = '123456';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);

    const roleRes = await pool.request()
      .input('rc', sql.VarChar(20), 'Employee')
      .query('SELECT RoleId FROM tblRole WHERE RoleCode = @rc');
    const employeeRoleId = roleRes.recordset[0]?.RoleId || 4;

    const userReq = pool.request();
    userReq.input('u', sql.VarChar(50), cleanUsername);
    userReq.input('p', sql.VarChar(255), passwordHash);
    userReq.input('email', sql.VarChar(100), cleanEmail);
    userReq.input('fullName', sql.NVarChar(100), onb.CandidateName);
    userReq.input('phone', sql.VarChar(20), phone || onb.Phone || null);
    userReq.input('roleId', sql.Int, employeeRoleId);

    const userRes = await userReq.query(`
      INSERT INTO tblUser (
        Username, PasswordHash, Email, FullName, RoleId, IsLocked, Phone, CreatedAt
      )
      OUTPUT INSERTED.UserId, INSERTED.Username, INSERTED.Email
      VALUES (
        @u, @p, @email, @fullName, @roleId, 0, @phone, SYSDATETIME()
      )
    `);

    const newUserId = userRes.recordset[0].UserId;

    if (!employeeId) {
      const maxRes = await pool.request().query(`
        SELECT MAX(CAST(SUBSTRING(EmployeeCode, 3, 10) AS INT)) as maxNum 
        FROM tblEmployee 
        WHERE EmployeeCode LIKE 'NV%' AND ISNUMERIC(SUBSTRING(EmployeeCode, 3, 10)) = 1
      `);
      let nextNum = (maxRes.recordset[0]?.maxNum || 0) + 1;
      employeeCode = `NV${String(nextNum).padStart(3, '0')}`;
      let codeExists = true;
      while (codeExists) {
        const checkCode = await pool.request()
          .input('chkCode', sql.VarChar(20), employeeCode)
          .query('SELECT EmployeeId FROM tblEmployee WHERE EmployeeCode = @chkCode');
        if (checkCode.recordset.length === 0) {
          codeExists = false;
        } else {
          nextNum += 1;
          employeeCode = `NV${String(nextNum).padStart(3, '0')}`;
        }
      }

      let posId = null;
      if (onb.PositionName) {
        const posCheck = await pool.request()
          .input('name', sql.NVarChar(100), `%${onb.PositionName}%`)
          .query('SELECT TOP 1 PositionId FROM tblPosition WHERE PositionName LIKE @name');
        posId = posCheck.recordset[0]?.PositionId || 6;
      } else {
        posId = 6;
      }

      const defaultSal = parseFloat(onb.OfferedSalary) || 15000000;
      const empReq = pool.request();
      empReq.input('code', sql.VarChar(20), employeeCode);
      empReq.input('fullName', sql.NVarChar(100), onb.CandidateName);
      empReq.input('gender', sql.NVarChar(10), 'Nam');
      empReq.input('phone', sql.VarChar(20), phone || onb.Phone || null);
      empReq.input('email', sql.VarChar(100), cleanEmail);
      empReq.input('deptId', sql.Int, onb.DepartmentId || 2);
      empReq.input('posId', sql.Int, posId);
      empReq.input('userId', sql.Int, newUserId);
      empReq.input('joinDate', sql.Date, onb.StartDate || new Date().toISOString().slice(0, 10));
      empReq.input('baseSal', sql.Decimal(18, 2), defaultSal);
      empReq.input('insSal', sql.Decimal(18, 2), defaultSal);

      const empRes = await empReq.query(`
        INSERT INTO tblEmployee (
          EmployeeCode, FullName, Gender, Phone, Email,
          DepartmentId, PositionId, JoinDate, WorkStatus,
          BaseSalary, InsuranceSalary, FaceRegistered, UserId
        )
        OUTPUT INSERTED.EmployeeId, INSERTED.EmployeeCode
        VALUES (
          @code, @fullName, @gender, @phone, @email,
          @deptId, @posId, @joinDate, N'Đang làm việc',
          @baseSal, @insSal, 0, @userId
        )
      `);
      employeeId = empRes.recordset[0].EmployeeId;
      employeeCode = empRes.recordset[0].EmployeeCode;
    } else {
      await pool.request()
        .input('empId', sql.Int, employeeId)
        .input('userId', sql.Int, newUserId)
        .query('UPDATE tblEmployee SET UserId = @userId WHERE EmployeeId = @empId');
    }

    try {
      await pool.request()
        .input('empId', sql.Int, employeeId)
        .input('userId', sql.Int, newUserId)
        .query(`
          IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblUser') AND name = 'EmployeeId')
          BEGIN
            UPDATE tblUser SET EmployeeId = @empId WHERE UserId = @userId;
          END
        `);
    } catch (e) {}

    await pool.request()
      .input('id', sql.Int, parseInt(onboardingId))
      .input('empId', sql.Int, employeeId)
      .input('username', sql.NVarChar(50), cleanUsername)
      .input('email', sql.VarChar(100), cleanEmail)
      .input('phone', sql.VarChar(20), phone || onb.Phone || null)
      .query(`
        UPDATE tblOnboarding SET
          EmployeeId = @empId,
          Username = @username,
          Email = @email,
          Phone = COALESCE(@phone, Phone),
          AccountCreated = 1
        WHERE OnboardingId = @id
      `);

    let emailResult = null;
    if (sendEmail) {
      try {
        emailResult = await this.sendAccountEmail(onboardingId, {
          username: cleanUsername,
          email: cleanEmail,
          password: defaultPassword
        });
      } catch (err) {
        emailResult = { success: false, error: err.message };
      }
    }

    return {
      success: true,
      username: cleanUsername,
      password: defaultPassword,
      email: cleanEmail,
      employeeId,
      employeeCode,
      emailResult,
      onboarding: await this.getById(onboardingId)
    };
  }

  static async sendAccountEmail(onboardingId, { username, email, password = '123456' }) {
    const onb = await this.getById(onboardingId);
    const targetEmail = (email || onb?.Email || '').trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      throw new Error('Không có địa chỉ email hợp lệ để gửi thông tin tài khoản!');
    }

    const targetUsername = username || onb?.Username || 'Tài khoản của bạn';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const loginUrl = `${clientUrl}/login`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0f766e 0%, #042f2e 100%); padding: 28px 24px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">Chào mừng bạn đến với Enterprise HRM</h1>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Thông tin kích hoạt tài khoản nhân viên chính thức</p>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Xin chào <strong>${onb?.CandidateName || 'Bạn'}</strong>,</p>
          <p>Bộ phận Nhân sự (HR) đã khởi tạo tài khoản nhân viên thành công cho bạn tại hệ thống nội bộ công ty:</p>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px 20px; margin: 18px 0;">
            <p style="margin: 4px 0;"><strong>Vị trí công tác:</strong> ${onb?.PositionName || '-'}</p>
            <p style="margin: 4px 0;"><strong>Phòng ban:</strong> ${onb?.DepartmentName || '-'}</p>
            <p style="margin: 4px 0;"><strong>Tên đăng nhập (Username):</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #0f766e; font-weight: 700;">${targetUsername}</code></p>
            <p style="margin: 4px 0;"><strong>Mật khẩu mặc định:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #dc2626; font-weight: 700;">${password}</code></p>
            <p style="margin: 4px 0;"><strong>Đường dẫn đăng nhập:</strong> <a href="${loginUrl}" target="_blank" style="color: #0f766e; font-weight: 600;">${loginUrl}</a></p>
          </div>
          <p><strong>Hướng dẫn các bước tiếp theo:</strong></p>
          <ol style="padding-left: 20px; margin: 8px 0;">
            <li>Đăng nhập vào hệ thống bằng tên đăng nhập và mật khẩu ở trên.</li>
            <li>Vào tab <strong>"Hợp đồng lao động"</strong> để kiểm tra và thực hiện ký hợp đồng điện tử.</li>
            <li>Vào tab <strong>"Trang thiết bị được cấp"</strong> để kiểm tra các thiết bị công ty bàn giao.</li>
            <li>Vào tab <strong>"Hồ sơ của tôi"</strong> để cập nhật số CCCD, tài khoản ngân hàng và thông tin cá nhân.</li>
          </ol>
          <div style="text-align: center; margin: 24px 0 12px 0;">
            <a href="${loginUrl}" target="_blank" style="display: inline-block; background: #0f766e; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">ĐĂNG NHẬP NGAY</a>
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 14px 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Enterprise HRM System &copy; 2026.
        </div>
      </div>
    `;

    return await EmailService.sendMail({
      to: targetEmail,
      subject: `[Enterprise HRM] Thông tin tài khoản đăng nhập nội bộ - ${onb?.CandidateName}`,
      html,
      text: `Xin chào ${onb?.CandidateName}, Thông tin đăng nhập: Username: ${targetUsername}, Password: ${password}, Link: ${loginUrl}`
    });
  }

  static async convertToEmployee(onboardingId, {
    employeeCode,
    joinDate,
    baseSalary,
    insuranceSalary,
    positionId,
    phone,
    email,
    gender = 'Nam',
    birthDate,
    address,
    idCardNumber,
    bankName,
    bankAccountNumber
  }) {
    const pool = await connectDb();
    const onb = await this.getById(onboardingId);
    if (!onb) {
      const error = new Error('Không tìm thấy hồ sơ Onboarding!');
      error.statusCode = 404;
      throw error;
    }

    let existingEmployeeId = onb.EmployeeId;
    let code = (employeeCode || '').trim();

    if (!existingEmployeeId) {
      const checkEmp = await pool.request()
        .input('em', sql.VarChar(100), safeEmail)
        .query('SELECT TOP 1 EmployeeId, EmployeeCode FROM tblEmployee WHERE Email = @em');
      if (checkEmp.recordset.length > 0) {
        existingEmployeeId = checkEmp.recordset[0].EmployeeId;
        code = checkEmp.recordset[0].EmployeeCode;
      }
    }

    if (!code) {
      const maxRes = await pool.request().query(`
        SELECT MAX(CAST(SUBSTRING(EmployeeCode, 3, 10) AS INT)) as maxNum 
        FROM tblEmployee 
        WHERE EmployeeCode LIKE 'NV%' AND ISNUMERIC(SUBSTRING(EmployeeCode, 3, 10)) = 1
      `);
      let nextNum = (maxRes.recordset[0]?.maxNum || 0) + 1;
      code = `NV${String(nextNum).padStart(3, '0')}`;
      let codeExists = true;
      while (codeExists) {
        const checkCode = await pool.request()
          .input('chkCode', sql.VarChar(20), code)
          .query('SELECT EmployeeId FROM tblEmployee WHERE EmployeeCode = @chkCode');
        if (checkCode.recordset.length === 0) {
          codeExists = false;
        } else {
          nextNum += 1;
          code = `NV${String(nextNum).padStart(3, '0')}`;
        }
      }
    }

    let posId = positionId ? parseInt(positionId) : null;
    if (!posId) {
      const posCheck = await pool.request()
        .input('name', sql.NVarChar(100), `%${onb.PositionName}%`)
        .query('SELECT TOP 1 PositionId FROM tblPosition WHERE PositionName LIKE @name');
      posId = posCheck.recordset[0]?.PositionId || 6;
    }

    const safeEmail = email || onb.Email || `emp.${code.toLowerCase()}@company.vn`;
    const safeJoinDate = joinDate || onb.StartDate || new Date().toISOString().slice(0, 10);

    const finalBaseSalary = baseSalary !== undefined && baseSalary !== null && baseSalary !== ''
      ? parseFloat(baseSalary)
      : (parseFloat(onb.OfferedSalary) || 15000000);

    const finalInsuranceSalary = insuranceSalary !== undefined && insuranceSalary !== null && insuranceSalary !== ''
      ? parseFloat(insuranceSalary)
      : finalBaseSalary;

    const userCheck = await pool.request()
      .input('email', sql.VarChar(100), safeEmail)
      .query('SELECT UserId FROM tblUser WHERE Email = @email');
    const existingUserId = userCheck.recordset[0]?.UserId || null;

    let newEmployee = null;

    if (existingEmployeeId) {
      const updReq = pool.request();
      updReq.input('empId', sql.Int, existingEmployeeId);
      updReq.input('fullName', sql.NVarChar(100), onb.CandidateName);
      updReq.input('gender', sql.NVarChar(10), gender || 'Nam');
      updReq.input('birthDate', sql.Date, birthDate || null);
      updReq.input('phone', sql.VarChar(20), phone || onb.Phone || null);
      updReq.input('address', sql.NVarChar(255), address || null);
      updReq.input('idCard', sql.VarChar(20), idCardNumber || null);
      updReq.input('bankName', sql.NVarChar(100), bankName || 'Vietcombank');
      updReq.input('bankAcc', sql.VarChar(50), bankAccountNumber || null);
      updReq.input('deptId', sql.Int, onb.DepartmentId);
      updReq.input('posId', sql.Int, posId);
      updReq.input('userId', sql.Int, existingUserId);
      updReq.input('joinDate', sql.Date, safeJoinDate);
      updReq.input('baseSal', sql.Decimal(18, 2), finalBaseSalary);
      updReq.input('insSal', sql.Decimal(18, 2), finalInsuranceSalary);

      const updResult = await updReq.query(`
        UPDATE tblEmployee SET
          FullName = @fullName,
          Gender = @gender,
          BirthDate = COALESCE(@birthDate, BirthDate),
          Phone = COALESCE(@phone, Phone),
          Address = COALESCE(@address, Address),
          IdCardNumber = COALESCE(@idCard, IdCardNumber),
          BankName = COALESCE(@bankName, BankName),
          BankAccountNumber = COALESCE(@bankAcc, BankAccountNumber),
          DepartmentId = @deptId,
          PositionId = @posId,
          UserId = COALESCE(@userId, UserId),
          JoinDate = @joinDate,
          BaseSalary = @baseSal,
          InsuranceSalary = @insSal,
          UpdatedAt = SYSDATETIME()
        OUTPUT INSERTED.*
        WHERE EmployeeId = @empId
      `);
      newEmployee = updResult.recordset[0];
    } else {
      const empReq = pool.request();
      empReq.input('code', sql.VarChar(20), code);
      empReq.input('fullName', sql.NVarChar(100), onb.CandidateName);
      empReq.input('gender', sql.NVarChar(10), gender || 'Nam');
      empReq.input('birthDate', sql.Date, birthDate || null);
      empReq.input('phone', sql.VarChar(20), phone || onb.Phone || null);
      empReq.input('email', sql.VarChar(100), safeEmail);
      empReq.input('address', sql.NVarChar(255), address || null);
      empReq.input('idCard', sql.VarChar(20), idCardNumber || null);
      empReq.input('bankName', sql.NVarChar(100), bankName || 'Vietcombank');
      empReq.input('bankAcc', sql.VarChar(50), bankAccountNumber || null);
      empReq.input('deptId', sql.Int, onb.DepartmentId);
      empReq.input('posId', sql.Int, posId);
      empReq.input('userId', sql.Int, existingUserId);
      empReq.input('joinDate', sql.Date, safeJoinDate);
      empReq.input('baseSal', sql.Decimal(18, 2), finalBaseSalary);
      empReq.input('insSal', sql.Decimal(18, 2), finalInsuranceSalary);

      const empResult = await empReq.query(`
        INSERT INTO tblEmployee (
          EmployeeCode, FullName, Gender, BirthDate, Phone, Email, Address,
          IdCardNumber, BankName, BankAccountNumber, DepartmentId, PositionId,
          UserId, JoinDate, WorkStatus, BaseSalary, InsuranceSalary, FaceRegistered
        )
        OUTPUT INSERTED.*
        VALUES (
          @code, @fullName, @gender, @birthDate, @phone, @email, @address,
          @idCard, @bankName, @bankAcc, @deptId, @posId,
          @userId, @joinDate, N'Đang làm việc', @baseSal, @insSal, 0
        )
      `);
      newEmployee = empResult.recordset[0];
    }

    await pool.request()
      .input('onbId', sql.Int, parseInt(onboardingId))
      .input('empId', sql.Int, newEmployee.EmployeeId)
      .query(`
        UPDATE tblOnboarding
        SET Status = N'Đã hoàn tất',
            EmployeeId = @empId,
            AccountCreated = 1,
            ContractSigned = 1,
            AssetAssigned = 1
        WHERE OnboardingId = @onbId
      `);

    return {
      onboarding: await this.getById(onboardingId),
      employee: newEmployee
    };
  }

  static async seedInitialDataIfEmpty() {
    try {
      const pool = await connectDb();
      const countRes = await pool.request().query('SELECT COUNT(*) as total FROM tblOnboarding');
      if (countRes.recordset[0]?.total === 0) {
        await this.create({
          OnboardingCode: 'ONB01',
          CandidateName: 'Nguyễn Văn Minh',
          PositionName: 'Senior Backend Developer',
          DepartmentId: 2,
          StartDate: '2026-11-10',
          AccountCreated: false,
          ContractSigned: false,
          AssetAssigned: false,
          FaceEnrolled: false,
          Status: 'Đang tiếp nhận',
          OfferedSalary: 25000000,
          Email: 'minh.nguyen@test.vn',
          Phone: '0988123456'
        });
      }
    } catch (err) {
      console.warn('Seed Onboarding error:', err.message);
    }
  }
}
