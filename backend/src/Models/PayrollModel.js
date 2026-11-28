import { connectDb, sql } from '../Config/DbConfig.js';

const DEFAULT_CONFIG = {
  congChuan: 26,
  gioCong: 8,
  luongCoSo: 2530000,
  ltVung: 5310000,
  bhxhNLD: 8,
  bhytNLD: 1.5,
  bhtnNLD: 1,
  bhxhDN: 17.5,
  bhytDN: 3,
  bhtnDN: 1,
  kpcdDN: 2,
  gtBanThan: 15500000,
  gtNPT: 6200000
};

const TAX_BRACKETS = [
  { den: 10000000, ts: 5 },
  { den: 30000000, ts: 10 },
  { den: 60000000, ts: 20 },
  { den: 100000000, ts: 30 },
  { den: Infinity, ts: 35 }
];

function calculateProgressiveTax(taxableIncome) {
  let tax = 0;
  let prevLimit = 0;
  for (const b of TAX_BRACKETS) {
    if (taxableIncome <= prevLimit) break;
    tax += (Math.min(taxableIncome, b.den) - prevLimit) * (b.ts / 100);
    prevLimit = b.den;
  }
  return Math.round(tax);
}

function parseOtMultiplier(rateType) {
  const s = String(rateType || '').toLowerCase();
  if (s.includes('300')) return 3.0;
  if (s.includes('200')) return 2.0;
  return 1.5;
}

async function ensurePayrollAuxTables(pool) {
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tblPayrollAdjustment')
    BEGIN
      CREATE TABLE tblPayrollAdjustment (
        AdjustmentId INT IDENTITY(1,1) PRIMARY KEY,
        PeriodCode VARCHAR(10) NOT NULL,
        EmployeeId INT NOT NULL,
        ManualWorkDays DECIMAL(5,2) NULL,
        BonusAmount DECIMAL(18,2) DEFAULT 0,
        AdvanceAmount DECIMAL(18,2) DEFAULT 0,
        OtherDeduction DECIMAL(18,2) DEFAULT 0,
        Note NVARCHAR(500) NULL,
        UpdatedAt DATETIME2 DEFAULT SYSDATETIME(),
        CONSTRAINT UQ_PayrollAdj_Period_Emp UNIQUE (PeriodCode, EmployeeId)
      );
    END

    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tblPayrollFeedback')
    BEGIN
      CREATE TABLE tblPayrollFeedback (
        FeedbackId INT IDENTITY(1,1) PRIMARY KEY,
        PeriodCode VARCHAR(10) NOT NULL,
        EmployeeId INT NOT NULL,
        UserId INT NULL,
        Content NVARCHAR(1000) NOT NULL,
        Status NVARCHAR(30) DEFAULT N'Chờ xử lý',
        AccountantReply NVARCHAR(1000) NULL,
        HandledByUserId INT NULL,
        HandledAt DATETIME2 NULL,
        CreatedAt DATETIME2 DEFAULT SYSDATETIME()
      );
    END
  `);
}

export class PayrollModel {
  static async getFormulaConfig() {
    const pool = await connectDb();
    await ensurePayrollAuxTables(pool);

    const cfgRes = await pool.request()
      .input('Key', sql.VarChar(50), 'PAYROLL_FORMULA_CONFIG')
      .query('SELECT SettingValue FROM tblSystemSetting WHERE SettingKey = @Key');

    let config = { ...DEFAULT_CONFIG };
    if (cfgRes.recordset.length > 0 && cfgRes.recordset[0].SettingValue) {
      try {
        config = { ...DEFAULT_CONFIG, ...JSON.parse(cfgRes.recordset[0].SettingValue) };
      } catch {
        config = { ...DEFAULT_CONFIG };
      }
    }

    const compRes = await pool.request().query(`
      SELECT ComponentId, ComponentCode, ComponentName, ComponentType, DefaultAmount, PercentageRate, IsTaxable, Description
      FROM tblSalaryComponent
      ORDER BY ComponentId ASC
    `);

    const components = compRes.recordset || [];
    const bhxhComp = components.find(c => c.ComponentCode === 'BHXH_DEDUCTION');
    const bhytComp = components.find(c => c.ComponentCode === 'BHYT_DEDUCTION');
    const bhtnComp = components.find(c => c.ComponentCode === 'BHTN_DEDUCTION');

    if (cfgRes.recordset.length === 0) {
      if (bhxhComp && Number(bhxhComp.PercentageRate) > 0) config.bhxhNLD = Number(bhxhComp.PercentageRate);
      if (bhytComp && Number(bhytComp.PercentageRate) > 0) config.bhytNLD = Number(bhytComp.PercentageRate);
      if (bhtnComp && Number(bhtnComp.PercentageRate) > 0) config.bhtnNLD = Number(bhtnComp.PercentageRate);
    }

    return { config, components };
  }

  static async saveFormulaConfig(newConfig) {
    const pool = await connectDb();
    await ensurePayrollAuxTables(pool);

    const merged = { ...DEFAULT_CONFIG, ...newConfig };
    const jsonStr = JSON.stringify(merged);

    await pool.request()
      .input('Key', sql.VarChar(50), 'PAYROLL_FORMULA_CONFIG')
      .input('Json', sql.NVarChar(sql.MAX), jsonStr)
      .input('Desc', sql.NVarChar(255), 'Cấu hình công thức tính lương tự động')
      .query(`
        IF EXISTS (SELECT 1 FROM tblSystemSetting WHERE SettingKey = @Key)
          UPDATE tblSystemSetting SET SettingValue = @Json, UpdatedAt = SYSDATETIME() WHERE SettingKey = @Key
        ELSE
          INSERT INTO tblSystemSetting (SettingKey, SettingValue, Description) VALUES (@Key, @Json, @Desc)
      `);

    return merged;
  }

  static async getPeriodsList(onlyLocked = false) {
    const pool = await connectDb();
    const whereClause = onlyLocked ? 'WHERE IsLocked = 1' : '';
    const res = await pool.request().query(`
      SELECT PeriodId, PeriodCode, PeriodName, StandardWorkDays, TotalGrossPay, TotalNetPay, IsLocked, LockedByUserId, LockedAt, CreatedAt
      FROM tblPayrollPeriod
      ${whereClause}
      ORDER BY PeriodCode DESC
    `);
    return res.recordset || [];
  }

  static async aggregatePayrollData({ year, month, standardWorkDays }) {
    const pool = await connectDb();
    await ensurePayrollAuxTables(pool);

    const periodCode = `${year}-${String(month).padStart(2, '0')}`;
    const { config: savedConfig, components } = await this.getFormulaConfig();
    const config = {
      ...savedConfig,
      congChuan: Number(standardWorkDays) > 0 ? Number(standardWorkDays) : savedConfig.congChuan
    };

    const periodRes = await pool.request()
      .input('PeriodCode', sql.VarChar(10), periodCode)
      .query('SELECT * FROM tblPayrollPeriod WHERE PeriodCode = @PeriodCode');
    const existingPeriod = periodRes.recordset[0] || null;

    const empRes = await pool.request().query(`
      SELECT 
        e.EmployeeId, e.EmployeeCode, e.FullName, e.DepartmentId, e.PositionId,
        e.BaseSalary, e.InsuranceSalary, e.DependentsCount, e.TaxCode,
        e.BankName, e.BankAccountNumber, e.WorkStatus,
        CONVERT(varchar, e.JoinDate, 23) AS JoinDate,
        d.DepartmentName, p.PositionName,
        c.AgreedSalary AS ContractSalary,
        c.ContractNumber AS ActiveContractNumber,
        c.Status AS ContractStatus
      FROM tblEmployee e
      LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
      LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
      OUTER APPLY (
        SELECT TOP 1 AgreedSalary, ContractNumber, Status
        FROM tblContract c2
        WHERE c2.EmployeeId = e.EmployeeId AND c2.Status = N'Hiệu lực'
        ORDER BY c2.StartDate DESC, c2.ContractId DESC
      ) c
      WHERE ISNULL(e.WorkStatus, N'Đang làm việc') NOT IN (N'Đã nghỉ việc', N'Thôi việc')
      ORDER BY e.EmployeeCode ASC
    `);
    const employees = empRes.recordset || [];

    const attRes = await pool.request()
      .input('Year', sql.Int, year)
      .input('Month', sql.Int, month)
      .query(`
        SELECT 
          EmployeeId,
          COUNT(*) AS AttendanceRecords,
          SUM(ISNULL(WorkCredit, 0)) AS TotalWorkCredit,
          SUM(ISNULL(OvertimeHours, 0)) AS AttendanceOtHours
        FROM tblAttendance
        WHERE YEAR(AttendanceDate) = @Year AND MONTH(AttendanceDate) = @Month
        GROUP BY EmployeeId
      `);
    const attMap = {};
    (attRes.recordset || []).forEach(r => {
      attMap[r.EmployeeId] = {
        records: Number(r.AttendanceRecords) || 0,
        workCredit: Number(r.TotalWorkCredit) || 0,
        attOtHours: Number(r.AttendanceOtHours) || 0
      };
    });

    const otRes = await pool.request()
      .input('Year', sql.Int, year)
      .input('Month', sql.Int, month)
      .query(`
        SELECT EmployeeId, TotalHours, OvertimeRateType
        FROM tblOvertimeRequest
        WHERE Status = 'APPROVED'
          AND YEAR(OvertimeDate) = @Year AND MONTH(OvertimeDate) = @Month
      `);
    const otMap = {};
    (otRes.recordset || []).forEach(r => {
      if (!otMap[r.EmployeeId]) {
        otMap[r.EmployeeId] = { totalHours: 0, weightedHours: 0, breakdown: [] };
      }
      const hrs = Number(r.TotalHours) || 0;
      const mult = parseOtMultiplier(r.OvertimeRateType);
      otMap[r.EmployeeId].totalHours += hrs;
      otMap[r.EmployeeId].weightedHours += hrs * mult;
      otMap[r.EmployeeId].breakdown.push({ hours: hrs, rateType: r.OvertimeRateType, multiplier: mult });
    });

    const leaveRes = await pool.request()
      .input('Year', sql.Int, year)
      .input('Month', sql.Int, month)
      .query(`
        SELECT lr.EmployeeId, lr.TotalDays, lt.IsPaid
        FROM tblLeaveRequest lr
        LEFT JOIN tblLeaveType lt ON lr.LeaveTypeId = lt.LeaveTypeId
        WHERE lr.Status = 'APPROVED'
          AND YEAR(lr.StartDate) = @Year AND MONTH(lr.StartDate) = @Month
      `);
    const leaveMap = {};
    (leaveRes.recordset || []).forEach(r => {
      if (!leaveMap[r.EmployeeId]) leaveMap[r.EmployeeId] = { paidDays: 0, unpaidDays: 0 };
      const days = Number(r.TotalDays) || 0;
      if (r.IsPaid === false || r.IsPaid === 0) {
        leaveMap[r.EmployeeId].unpaidDays += days;
      } else {
        leaveMap[r.EmployeeId].paidDays += days;
      }
    });

    const adjRes = await pool.request()
      .input('PeriodCode', sql.VarChar(10), periodCode)
      .query('SELECT * FROM tblPayrollAdjustment WHERE PeriodCode = @PeriodCode');
    const adjMap = {};
    (adjRes.recordset || []).forEach(r => {
      adjMap[r.EmployeeId] = r;
    });

    let lockedDetailMap = {};
    if (existingPeriod && existingPeriod.IsLocked) {
      const detRes = await pool.request()
        .input('PeriodId', sql.Int, existingPeriod.PeriodId)
        .query('SELECT * FROM tblPayrollDetail WHERE PeriodId = @PeriodId');
      (detRes.recordset || []).forEach(d => {
        lockedDetailMap[d.EmployeeId] = d;
      });
    }

    const allowanceComponents = components.filter(
      c => c.ComponentType && c.ComponentType.toLowerCase().includes('phụ cấp')
    );
    const defaultTaxableAllowance = allowanceComponents
      .filter(c => c.IsTaxable)
      .reduce((s, c) => s + (Number(c.DefaultAmount) || 0), 0);
    const defaultNonTaxableAllowance = allowanceComponents
      .filter(c => !c.IsTaxable)
      .reduce((s, c) => s + (Number(c.DefaultAmount) || 0), 0);

    const eligibleEmployees = (existingPeriod && existingPeriod.IsLocked)
      ? employees.filter(e => Boolean(lockedDetailMap[e.EmployeeId]))
      : employees.filter(e => Boolean(e.ActiveContractNumber));

    const rows = eligibleEmployees.map(emp => {
      const att = attMap[emp.EmployeeId] || { records: 0, workCredit: 0, attOtHours: 0 };
      const ot = otMap[emp.EmployeeId] || { totalHours: 0, weightedHours: 0, breakdown: [] };
      const lv = leaveMap[emp.EmployeeId] || { paidDays: 0, unpaidDays: 0 };
      const adj = adjMap[emp.EmployeeId] || null;
      const lockedDet = lockedDetailMap[emp.EmployeeId] || null;

      if (existingPeriod && existingPeriod.IsLocked && lockedDet) {
        const gross = Number(lockedDet.TotalGrossSalary) || 0;
        const bhNLD = (Number(lockedDet.BhxhDeduction) || 0) + (Number(lockedDet.BhytDeduction) || 0) + (Number(lockedDet.BhtnDeduction) || 0);
        const insBase = Number(emp.InsuranceSalary || emp.ContractSalary || emp.BaseSalary || 0);
        const capBX = 20 * config.luongCoSo;
        const capBT = 20 * config.ltVung;
        const bx = Math.min(insBase, capBX);
        const bt = Math.min(insBase, capBT);
        const bhDN = Math.round(bx * ((config.bhxhDN + config.bhytDN + config.kpcdDN) / 100) + bt * (config.bhtnDN / 100));

        return {
          EmployeeId: emp.EmployeeId,
          EmployeeCode: emp.EmployeeCode,
          FullName: emp.FullName,
          JoinDate: emp.JoinDate || '',
          DepartmentId: emp.DepartmentId,
          DepartmentName: emp.DepartmentName || 'Chưa phân bổ',
          PositionName: emp.PositionName || 'Nhân viên',
          TaxCode: emp.TaxCode || '',
          BankName: emp.BankName || '',
          BankAccountNumber: emp.BankAccountNumber || '',
          DependentsCount: Number(emp.DependentsCount) || 0,
          BaseSalary: Number(lockedDet.BaseSalary) || 0,
          InsuranceSalary: insBase,
          AttendanceWorkDays: att.workCredit,
          PaidLeaveDays: Number(lockedDet.PaidLeaveDays) || 0,
          UnpaidLeaveDays: Number(lockedDet.UnpaidLeaveDays) || 0,
          ManualWorkDays: adj?.ManualWorkDays !== null && adj?.ManualWorkDays !== undefined ? Number(adj.ManualWorkDays) : null,
          ActualWorkDays: Number(lockedDet.ActualWorkDays) || 0,
          ActualBaseSalary: Number(lockedDet.ActualBaseSalary) || 0,
          TaxableAllowance: defaultTaxableAllowance,
          NonTaxableAllowance: Math.max(0, (Number(lockedDet.TotalAllowance) || 0) - defaultTaxableAllowance),
          TotalAllowance: Number(lockedDet.TotalAllowance) || 0,
          OvertimeHours: Number(lockedDet.OvertimeHours) || 0,
          OvertimePay: Number(lockedDet.OvertimePay) || 0,
          OvertimeBreakdown: ot.breakdown,
          BonusAmount: Number(adj?.BonusAmount) || 0,
          AdvanceAmount: Number(adj?.AdvanceAmount) || 0,
          OtherDeduction: Number(adj?.OtherDeduction) || 0,
          Note: adj?.Note || '',
          TotalGrossSalary: gross,
          BhxhDeduction: Number(lockedDet.BhxhDeduction) || 0,
          BhytDeduction: Number(lockedDet.BhytDeduction) || 0,
          BhtnDeduction: Number(lockedDet.BhtnDeduction) || 0,
          TotalInsuranceNLD: bhNLD,
          PersonalTaxDeduction: Number(lockedDet.PersonalTaxDeduction) || config.gtBanThan,
          DependentTaxDeduction: Number(lockedDet.DependentTaxDeduction) || 0,
          TaxableIncome: Number(lockedDet.TaxableIncome) || 0,
          PersonalIncomeTax: Number(lockedDet.PersonalIncomeTax) || 0,
          NetSalary: Number(lockedDet.NetSalary) || 0,
          EmployerInsurance: bhDN,
          TotalCompanyCost: gross + bhDN,
          PaymentStatus: lockedDet.PaymentStatus || 'Đã chốt',
          IsFromLockedSnapshot: true
        };
      }

      const baseSalary = Number(emp.ContractSalary || emp.BaseSalary || 0);
      const insuranceSalary = Number(emp.InsuranceSalary || baseSalary);
      const computedDays = Math.round((att.workCredit + lv.paidDays) * 100) / 100;
      const actualWorkDays = adj && adj.ManualWorkDays !== null && adj.ManualWorkDays !== undefined
        ? Number(adj.ManualWorkDays)
        : computedDays;

      const luongNgay = baseSalary / config.congChuan;
      const luongGio = luongNgay / config.gioCong;
      const actualBaseSalary = Math.round(luongNgay * actualWorkDays);

      const overtimeHours = Math.round(ot.totalHours * 100) / 100;
      const overtimePay = Math.round(luongGio * ot.weightedHours);

      const bonusAmount = Number(adj?.BonusAmount) || 0;
      const advanceAmount = Number(adj?.AdvanceAmount) || 0;
      const otherDeduction = Number(adj?.OtherDeduction) || 0;

      const totalAllowance = defaultTaxableAllowance + defaultNonTaxableAllowance;
      const totalGrossSalary = actualBaseSalary + totalAllowance + overtimePay + bonusAmount;

      const capBX = 20 * config.luongCoSo;
      const capBT = 20 * config.ltVung;
      const bx = Math.min(insuranceSalary, capBX);
      const bt = Math.min(insuranceSalary, capBT);

      const bhxhDeduction = actualWorkDays > 0 ? Math.round(bx * (config.bhxhNLD / 100)) : 0;
      const bhytDeduction = actualWorkDays > 0 ? Math.round(bx * (config.bhytNLD / 100)) : 0;
      const bhtnDeduction = actualWorkDays > 0 ? Math.round(bt * (config.bhtnNLD / 100)) : 0;
      const totalInsuranceNLD = bhxhDeduction + bhytDeduction + bhtnDeduction;

      const personalTaxDeduction = config.gtBanThan;
      const dependentTaxDeduction = (Number(emp.DependentsCount) || 0) * config.gtNPT;
      const taxableIncome = Math.max(
        0,
        totalGrossSalary - defaultNonTaxableAllowance - overtimePay - totalInsuranceNLD - personalTaxDeduction - dependentTaxDeduction
      );
      const personalIncomeTax = calculateProgressiveTax(taxableIncome);

      const netSalary = Math.max(0, totalGrossSalary - totalInsuranceNLD - personalIncomeTax - advanceAmount - otherDeduction);

      const employerInsurance = actualWorkDays > 0
        ? Math.round(bx * ((config.bhxhDN + config.bhytDN + config.kpcdDN) / 100) + bt * (config.bhtnDN / 100))
        : 0;

      return {
        EmployeeId: emp.EmployeeId,
        EmployeeCode: emp.EmployeeCode,
        FullName: emp.FullName,
        JoinDate: emp.JoinDate || '',
        DepartmentId: emp.DepartmentId,
        DepartmentName: emp.DepartmentName || 'Chưa phân bổ',
        PositionName: emp.PositionName || 'Nhân viên',
        TaxCode: emp.TaxCode || '',
        BankName: emp.BankName || '',
        BankAccountNumber: emp.BankAccountNumber || '',
        DependentsCount: Number(emp.DependentsCount) || 0,
        BaseSalary: baseSalary,
        InsuranceSalary: insuranceSalary,
        AttendanceWorkDays: att.workCredit,
        PaidLeaveDays: lv.paidDays,
        UnpaidLeaveDays: lv.unpaidDays,
        ManualWorkDays: adj && adj.ManualWorkDays !== null && adj.ManualWorkDays !== undefined ? Number(adj.ManualWorkDays) : null,
        ActualWorkDays: actualWorkDays,
        ActualBaseSalary: actualBaseSalary,
        TaxableAllowance: defaultTaxableAllowance,
        NonTaxableAllowance: defaultNonTaxableAllowance,
        TotalAllowance: totalAllowance,
        OvertimeHours: overtimeHours,
        OvertimePay: overtimePay,
        OvertimeBreakdown: ot.breakdown,
        BonusAmount: bonusAmount,
        AdvanceAmount: advanceAmount,
        OtherDeduction: otherDeduction,
        Note: adj?.Note || '',
        TotalGrossSalary: totalGrossSalary,
        BhxhDeduction: bhxhDeduction,
        BhytDeduction: bhytDeduction,
        BhtnDeduction: bhtnDeduction,
        TotalInsuranceNLD: totalInsuranceNLD,
        PersonalTaxDeduction: personalTaxDeduction,
        DependentTaxDeduction: dependentTaxDeduction,
        TaxableIncome: taxableIncome,
        PersonalIncomeTax: personalIncomeTax,
        NetSalary: netSalary,
        EmployerInsurance: employerInsurance,
        TotalCompanyCost: totalGrossSalary + employerInsurance,
        PaymentStatus: existingPeriod ? 'Đã lưu nháp' : 'Dự thảo',
        IsFromLockedSnapshot: false
      };
    });

    const summary = rows.reduce((acc, r) => {
      acc.totalEmployees += 1;
      acc.totalWorkDays += r.ActualWorkDays;
      acc.totalOvertimeHours += r.OvertimeHours;
      acc.totalOvertimePay += r.OvertimePay;
      acc.totalGross += r.TotalGrossSalary;
      acc.totalInsurance += r.TotalInsuranceNLD;
      acc.totalTax += r.PersonalIncomeTax;
      acc.totalNet += r.NetSalary;
      acc.totalCompanyCost += r.TotalCompanyCost;
      return acc;
    }, {
      totalEmployees: 0,
      totalWorkDays: 0,
      totalOvertimeHours: 0,
      totalOvertimePay: 0,
      totalGross: 0,
      totalInsurance: 0,
      totalTax: 0,
      totalNet: 0,
      totalCompanyCost: 0
    });

    return {
      periodCode,
      periodName: `Kỳ lương tháng ${String(month).padStart(2, '0')}/${year}`,
      periodInfo: existingPeriod,
      isLocked: Boolean(existingPeriod?.IsLocked),
      config,
      salaryComponents: components,
      rows,
      summary
    };
  }

  static async saveAdjustment({ periodCode, employeeId, manualWorkDays, bonusAmount, advanceAmount, otherDeduction, note }) {
    const pool = await connectDb();
    await ensurePayrollAuxTables(pool);

    const periodRes = await pool.request()
      .input('PeriodCode', sql.VarChar(10), periodCode)
      .query('SELECT IsLocked FROM tblPayrollPeriod WHERE PeriodCode = @PeriodCode');
    if (periodRes.recordset[0]?.IsLocked) {
      throw new Error(`Kỳ lương ${periodCode} đã được chốt sổ, không thể chỉnh sửa số liệu!`);
    }

    const req = pool.request()
      .input('PeriodCode', sql.VarChar(10), periodCode)
      .input('EmployeeId', sql.Int, employeeId)
      .input('ManualWorkDays', sql.Decimal(5, 2), manualWorkDays !== null && manualWorkDays !== undefined && manualWorkDays !== '' ? Number(manualWorkDays) : null)
      .input('BonusAmount', sql.Decimal(18, 2), Number(bonusAmount) || 0)
      .input('AdvanceAmount', sql.Decimal(18, 2), Number(advanceAmount) || 0)
      .input('OtherDeduction', sql.Decimal(18, 2), Number(otherDeduction) || 0)
      .input('Note', sql.NVarChar(500), note || null);

    await req.query(`
      IF EXISTS (SELECT 1 FROM tblPayrollAdjustment WHERE PeriodCode = @PeriodCode AND EmployeeId = @EmployeeId)
        UPDATE tblPayrollAdjustment
        SET ManualWorkDays = @ManualWorkDays,
            BonusAmount = @BonusAmount,
            AdvanceAmount = @AdvanceAmount,
            OtherDeduction = @OtherDeduction,
            Note = @Note,
            UpdatedAt = SYSDATETIME()
        WHERE PeriodCode = @PeriodCode AND EmployeeId = @EmployeeId
      ELSE
        INSERT INTO tblPayrollAdjustment (PeriodCode, EmployeeId, ManualWorkDays, BonusAmount, AdvanceAmount, OtherDeduction, Note)
        VALUES (@PeriodCode, @EmployeeId, @ManualWorkDays, @BonusAmount, @AdvanceAmount, @OtherDeduction, @Note)
    `);

    return true;
  }

  static async savePayrollToDatabase({ year, month, standardWorkDays, lock = false, userId = null }) {
    const pool = await connectDb();
    const data = await this.aggregatePayrollData({ year, month, standardWorkDays });

    if (data.periodInfo?.IsLocked && !lock) {
      throw new Error(`Kỳ lương ${data.periodCode} đã khóa sổ, vui lòng mở khóa nếu muốn tính lại.`);
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      let periodId = data.periodInfo?.PeriodId;

      if (!periodId) {
        const insPeriod = await new sql.Request(transaction)
          .input('PeriodCode', sql.VarChar(10), data.periodCode)
          .input('PeriodName', sql.NVarChar(100), data.periodName)
          .input('StandardWorkDays', sql.Int, data.config.congChuan)
          .input('TotalGrossPay', sql.Decimal(18, 2), data.summary.totalGross)
          .input('TotalNetPay', sql.Decimal(18, 2), data.summary.totalNet)
          .input('IsLocked', sql.Bit, lock ? 1 : 0)
          .input('LockedByUserId', sql.Int, lock ? userId : null)
          .query(`
            INSERT INTO tblPayrollPeriod (PeriodCode, PeriodName, StandardWorkDays, TotalGrossPay, TotalNetPay, IsLocked, LockedByUserId, LockedAt)
            OUTPUT INSERTED.PeriodId
            VALUES (@PeriodCode, @PeriodName, @StandardWorkDays, @TotalGrossPay, @TotalNetPay, @IsLocked, @LockedByUserId, ${lock ? 'SYSDATETIME()' : 'NULL'})
          `);
        periodId = insPeriod.recordset[0].PeriodId;
      } else {
        await new sql.Request(transaction)
          .input('PeriodId', sql.Int, periodId)
          .input('StandardWorkDays', sql.Int, data.config.congChuan)
          .input('TotalGrossPay', sql.Decimal(18, 2), data.summary.totalGross)
          .input('TotalNetPay', sql.Decimal(18, 2), data.summary.totalNet)
          .input('IsLocked', sql.Bit, lock ? 1 : 0)
          .input('LockedByUserId', sql.Int, lock ? userId : null)
          .query(`
            UPDATE tblPayrollPeriod
            SET StandardWorkDays = @StandardWorkDays,
                TotalGrossPay = @TotalGrossPay,
                TotalNetPay = @TotalNetPay,
                IsLocked = @IsLocked,
                LockedByUserId = CASE WHEN @IsLocked = 1 THEN @LockedByUserId ELSE NULL END,
                LockedAt = CASE WHEN @IsLocked = 1 THEN SYSDATETIME() ELSE NULL END
            WHERE PeriodId = @PeriodId
          `);
      }

      await new sql.Request(transaction)
        .input('PeriodId', sql.Int, periodId)
        .query('DELETE FROM tblPayrollDetail WHERE PeriodId = @PeriodId');

      const paymentStatus = lock ? 'Đã chốt' : 'Dự thảo';
      for (const r of data.rows) {
        await new sql.Request(transaction)
          .input('PeriodId', sql.Int, periodId)
          .input('EmployeeId', sql.Int, r.EmployeeId)
          .input('ActualWorkDays', sql.Decimal(5, 2), r.ActualWorkDays)
          .input('PaidLeaveDays', sql.Decimal(5, 2), r.PaidLeaveDays)
          .input('UnpaidLeaveDays', sql.Decimal(5, 2), r.UnpaidLeaveDays)
          .input('OvertimeHours', sql.Decimal(6, 2), r.OvertimeHours)
          .input('BaseSalary', sql.Decimal(18, 2), r.BaseSalary)
          .input('ActualBaseSalary', sql.Decimal(18, 2), r.ActualBaseSalary)
          .input('TotalAllowance', sql.Decimal(18, 2), r.TotalAllowance)
          .input('OvertimePay', sql.Decimal(18, 2), r.OvertimePay)
          .input('TotalGrossSalary', sql.Decimal(18, 2), r.TotalGrossSalary)
          .input('BhxhDeduction', sql.Decimal(18, 2), r.BhxhDeduction)
          .input('BhytDeduction', sql.Decimal(18, 2), r.BhytDeduction)
          .input('BhtnDeduction', sql.Decimal(18, 2), r.BhtnDeduction)
          .input('PersonalTaxDeduction', sql.Decimal(18, 2), r.PersonalTaxDeduction)
          .input('DependentTaxDeduction', sql.Decimal(18, 2), r.DependentTaxDeduction)
          .input('TaxableIncome', sql.Decimal(18, 2), r.TaxableIncome)
          .input('PersonalIncomeTax', sql.Decimal(18, 2), r.PersonalIncomeTax)
          .input('NetSalary', sql.Decimal(18, 2), r.NetSalary)
          .input('PaymentStatus', sql.NVarChar(50), paymentStatus)
          .query(`
            INSERT INTO tblPayrollDetail (
              PeriodId, EmployeeId, ActualWorkDays, PaidLeaveDays, UnpaidLeaveDays, OvertimeHours,
              BaseSalary, ActualBaseSalary, TotalAllowance, OvertimePay, TotalGrossSalary,
              BhxhDeduction, BhytDeduction, BhtnDeduction, PersonalTaxDeduction, DependentTaxDeduction,
              TaxableIncome, PersonalIncomeTax, NetSalary, PaymentStatus
            ) VALUES (
              @PeriodId, @EmployeeId, @ActualWorkDays, @PaidLeaveDays, @UnpaidLeaveDays, @OvertimeHours,
              @BaseSalary, @ActualBaseSalary, @TotalAllowance, @OvertimePay, @TotalGrossSalary,
              @BhxhDeduction, @BhytDeduction, @BhtnDeduction, @PersonalTaxDeduction, @DependentTaxDeduction,
              @TaxableIncome, @PersonalIncomeTax, @NetSalary, @PaymentStatus
            )
          `);
      }

      await transaction.commit();
      return await this.aggregatePayrollData({ year, month, standardWorkDays });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async unlockPeriod({ year, month }) {
    const pool = await connectDb();
    const periodCode = `${year}-${String(month).padStart(2, '0')}`;
    await pool.request()
      .input('PeriodCode', sql.VarChar(10), periodCode)
      .query(`
        UPDATE tblPayrollPeriod
        SET IsLocked = 0, LockedByUserId = NULL, LockedAt = NULL
        WHERE PeriodCode = @PeriodCode;

        UPDATE d
        SET d.PaymentStatus = N'Dự thảo'
        FROM tblPayrollDetail d
        JOIN tblPayrollPeriod p ON d.PeriodId = p.PeriodId
        WHERE p.PeriodCode = @PeriodCode;
      `);
    return true;
  }

  static async getEmployeePayslip({ year, month, userId, employeeId, employeeCode, includeDraft = false }) {
    const pool = await connectDb();
    let targetEmpId = employeeId ? Number(employeeId) : null;

    if (!targetEmpId && employeeCode) {
      const codeRes = await pool.request()
        .input('Code', sql.VarChar(50), employeeCode.trim())
        .query('SELECT TOP 1 EmployeeId FROM tblEmployee WHERE LOWER(EmployeeCode) = LOWER(@Code)');
      targetEmpId = codeRes.recordset[0]?.EmployeeId || null;
    }

    if (!targetEmpId && userId) {
      const userRes = await pool.request()
        .input('UserId', sql.Int, Number(userId))
        .query(`
          SELECT TOP 1 e.EmployeeId
          FROM tblUser u
          LEFT JOIN tblEmployee e
            ON e.UserId = u.UserId
            OR (u.Email IS NOT NULL AND LOWER(e.Email) = LOWER(u.Email))
            OR LOWER(e.EmployeeCode) = LOWER(u.Username)
          WHERE u.UserId = @UserId AND e.EmployeeId IS NOT NULL
        `);
      targetEmpId = userRes.recordset[0]?.EmployeeId || null;
    }

    const data = await this.aggregatePayrollData({ year, month });
    const row = targetEmpId ? data.rows.find(r => r.EmployeeId === targetEmpId) : null;

    if (!data.isLocked && !includeDraft) {
      return {
        hasData: false,
        isLocked: false,
        periodCode: data.periodCode,
        periodName: data.periodName,
        config: data.config,
        slip: null
      };
    }

    return {
      hasData: Boolean(row),
      isLocked: data.isLocked,
      periodCode: data.periodCode,
      periodName: data.periodName,
      config: data.config,
      slip: row || null
    };
  }

  static async resolveEmpIdFromUser(pool, { userId, employeeId, employeeCode }) {
    if (employeeId) return Number(employeeId);
    if (employeeCode) {
      const r = await pool.request()
        .input('Code', sql.VarChar(50), employeeCode.trim())
        .query('SELECT TOP 1 EmployeeId FROM tblEmployee WHERE LOWER(EmployeeCode) = LOWER(@Code)');
      if (r.recordset[0]?.EmployeeId) return r.recordset[0].EmployeeId;
    }
    if (userId) {
      const r = await pool.request()
        .input('UserId', sql.Int, Number(userId))
        .query(`
          SELECT TOP 1 e.EmployeeId
          FROM tblUser u
          LEFT JOIN tblEmployee e
            ON e.UserId = u.UserId
            OR (u.Email IS NOT NULL AND LOWER(e.Email) = LOWER(u.Email))
            OR LOWER(e.EmployeeCode) = LOWER(u.Username)
          WHERE u.UserId = @UserId AND e.EmployeeId IS NOT NULL
        `);
      if (r.recordset[0]?.EmployeeId) return r.recordset[0].EmployeeId;
    }
    return null;
  }

  static async createFeedback({ periodCode, userId, employeeId, employeeCode, content }) {
    const pool = await connectDb();
    await ensurePayrollAuxTables(pool);
    const empId = await this.resolveEmpIdFromUser(pool, { userId, employeeId, employeeCode });
    if (!empId) {
      throw new Error('Không tìm thấy hồ sơ nhân viên liên kết với tài khoản này!');
    }

    const res = await pool.request()
      .input('PeriodCode', sql.VarChar(10), periodCode)
      .input('EmployeeId', sql.Int, empId)
      .input('UserId', sql.Int, userId ? Number(userId) : null)
      .input('Content', sql.NVarChar(1000), content.trim())
      .query(`
        INSERT INTO tblPayrollFeedback (PeriodCode, EmployeeId, UserId, Content, Status)
        OUTPUT INSERTED.*
        VALUES (@PeriodCode, @EmployeeId, @UserId, @Content, N'Chờ xử lý')
      `);
    return res.recordset[0];
  }

  static async getMyFeedbacks({ periodCode, userId, employeeId, employeeCode }) {
    const pool = await connectDb();
    await ensurePayrollAuxTables(pool);
    const empId = await this.resolveEmpIdFromUser(pool, { userId, employeeId, employeeCode });
    if (!empId) return [];

    const req = pool.request().input('EmployeeId', sql.Int, empId);
    let where = 'WHERE f.EmployeeId = @EmployeeId';
    if (periodCode) {
      req.input('PeriodCode', sql.VarChar(10), periodCode);
      where += ' AND f.PeriodCode = @PeriodCode';
    }

    const res = await req.query(`
      SELECT f.FeedbackId, f.PeriodCode, f.EmployeeId, f.Content, f.Status, f.AccountantReply,
             CONVERT(varchar, f.CreatedAt, 120) AS CreatedAt,
             CONVERT(varchar, f.HandledAt, 120) AS HandledAt
      FROM tblPayrollFeedback f
      ${where}
      ORDER BY f.FeedbackId DESC
    `);
    return res.recordset || [];
  }

  static async getAllFeedbacks({ periodCode, status } = {}) {
    const pool = await connectDb();
    await ensurePayrollAuxTables(pool);

    const req = pool.request();
    const conds = ['1=1'];
    if (periodCode) {
      req.input('PeriodCode', sql.VarChar(10), periodCode);
      conds.push('f.PeriodCode = @PeriodCode');
    }
    if (status && status !== 'ALL') {
      req.input('Status', sql.NVarChar(30), status);
      conds.push('f.Status = @Status');
    }

    const res = await req.query(`
      SELECT f.FeedbackId, f.PeriodCode, f.EmployeeId, f.Content, f.Status, f.AccountantReply,
             CONVERT(varchar, f.CreatedAt, 120) AS CreatedAt,
             CONVERT(varchar, f.HandledAt, 120) AS HandledAt,
             e.EmployeeCode, e.FullName, d.DepartmentName, p.PositionName
      FROM tblPayrollFeedback f
      JOIN tblEmployee e ON f.EmployeeId = e.EmployeeId
      LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
      LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
      WHERE ${conds.join(' AND ')}
      ORDER BY CASE WHEN f.Status = N'Chờ xử lý' THEN 0 ELSE 1 END, f.FeedbackId DESC
    `);
    return res.recordset || [];
  }

  static async resolveFeedback({ feedbackId, status, accountantReply, handledByUserId }) {
    const pool = await connectDb();
    await ensurePayrollAuxTables(pool);
    const finalStatus = status || 'Đã xử lý';

    const res = await pool.request()
      .input('FeedbackId', sql.Int, Number(feedbackId))
      .input('Status', sql.NVarChar(30), finalStatus)
      .input('AccountantReply', sql.NVarChar(1000), accountantReply ? accountantReply.trim() : null)
      .input('HandledByUserId', sql.Int, handledByUserId ? Number(handledByUserId) : null)
      .query(`
        UPDATE tblPayrollFeedback
        SET Status = @Status,
            AccountantReply = @AccountantReply,
            HandledByUserId = @HandledByUserId,
            HandledAt = SYSDATETIME()
        OUTPUT INSERTED.*
        WHERE FeedbackId = @FeedbackId
      `);
    return res.recordset[0] || null;
  }
}
