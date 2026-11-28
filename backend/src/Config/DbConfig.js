import sql from 'mssql/msnodesqlv8.js';
import dotenv from 'dotenv';
dotenv.config();

const connectionString =
    process.env.DB_CONNECTION_STRING ||
    'Driver={ODBC Driver 17 for SQL Server};Server=.\\SQLEXPRESS;Database=HRM_Enterprise_DB;Trusted_Connection=yes;TrustServerCertificate=yes;';

let pool = null;

export const connectDb = async () => {
    try {
        if (!pool) {
            pool = await new sql.ConnectionPool({
                connectionString,
            }).connect();
            console.log(
                '✅ Kết nối thành công đến SQL Server (HRM_Enterprise_DB)!',
            );
            try {
                await pool.request().query(`
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblUser') AND name = 'Phone')
                    BEGIN
                        ALTER TABLE tblUser ADD Phone VARCHAR(20) NULL;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOnboarding') AND name = 'Username')
                    BEGIN
                        ALTER TABLE tblOnboarding ADD Username NVARCHAR(50) NULL;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOnboarding') AND name = 'Email')
                    BEGIN
                        ALTER TABLE tblOnboarding ADD Email VARCHAR(100) NULL;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOnboarding') AND name = 'Phone')
                    BEGIN
                        ALTER TABLE tblOnboarding ADD Phone VARCHAR(20) NULL;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tblAsset')
                    BEGIN
                        CREATE TABLE tblAsset (
                            AssetId INT IDENTITY(1,1) PRIMARY KEY,
                            AssetCode VARCHAR(50) NOT NULL UNIQUE,
                            AssetName NVARCHAR(100) NOT NULL,
                            Category NVARCHAR(50) NOT NULL,
                            SerialNumber VARCHAR(100) NULL,
                            Status NVARCHAR(50) DEFAULT N'Đang sử dụng',
                            Condition NVARCHAR(50) DEFAULT N'Mới 100%',
                            EmployeeId INT NULL,
                            AssignDate DATE NULL,
                            Notes NVARCHAR(255) NULL,
                            CreatedAt DATETIME2 DEFAULT SYSDATETIME()
                        );
                    END
                    ELSE
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

                    UPDATE o
                    SET 
                      o.Email = COALESCE(o.Email, c.Email),
                      o.Phone = COALESCE(o.Phone, c.Phone),
                      o.OfferedSalary = COALESCE(o.OfferedSalary, c.OfferedSalary)
                    FROM tblOnboarding o
                    JOIN (
                      SELECT FullName, MAX(Email) as Email, MAX(Phone) as Phone, MAX(OfferedSalary) as OfferedSalary
                      FROM tblCandidate
                      GROUP BY FullName
                    ) c ON c.FullName = o.CandidateName
                    WHERE o.Email IS NULL OR o.Phone IS NULL OR o.OfferedSalary IS NULL;

                    DECLARE @dropSql NVARCHAR(MAX) = N'';
                    SELECT @dropSql += N'ALTER TABLE tblEmployee DROP CONSTRAINT [' + kc.name + N']; '
                    FROM sys.key_constraints kc
                    JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id
                    JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
                    WHERE kc.parent_object_id = OBJECT_ID(N'tblEmployee') AND c.name = 'UserId';

                    IF @dropSql <> N''
                    BEGIN
                        EXEC sp_executesql @dropSql;
                    END;

                    DECLARE @dropIxSql NVARCHAR(MAX) = N'';
                    SELECT @dropIxSql += N'DROP INDEX [' + i.name + N'] ON tblEmployee; '
                    FROM sys.indexes i
                    JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
                    JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
                    WHERE i.object_id = OBJECT_ID(N'tblEmployee')
                      AND i.is_unique = 1
                      AND i.has_filter = 0
                      AND c.name = 'UserId'
                      AND i.is_primary_key = 0;

                    IF @dropIxSql <> N''
                    BEGIN
                        EXEC sp_executesql @dropIxSql;
                    END;

                    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'tblEmployee') AND name = N'UQ_tblEmployee_UserId_Filtered')
                    BEGIN
                        CREATE UNIQUE NONCLUSTERED INDEX UQ_tblEmployee_UserId_Filtered ON tblEmployee(UserId) WHERE UserId IS NOT NULL;
                    END;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblContract') AND name = 'TerminationType')
                        ALTER TABLE tblContract ADD TerminationType NVARCHAR(100) NULL;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblContract') AND name = 'TerminationStatus')
                        ALTER TABLE tblContract ADD TerminationStatus NVARCHAR(50) NULL;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblContract') AND name = 'TerminationRequestedBy')
                        ALTER TABLE tblContract ADD TerminationRequestedBy NVARCHAR(50) NULL;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblContract') AND name = 'TerminationDate')
                        ALTER TABLE tblContract ADD TerminationDate DATE NULL;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblContract') AND name = 'TerminationReason')
                        ALTER TABLE tblContract ADD TerminationReason NVARCHAR(255) NULL;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblContract') AND name = 'TerminationNote')
                        ALTER TABLE tblContract ADD TerminationNote NVARCHAR(MAX) NULL;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblContract') AND name = 'TerminationDecisionNumber')
                        ALTER TABLE tblContract ADD TerminationDecisionNumber NVARCHAR(100) NULL;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblContract') AND name = 'TerminationEvaluationMeeting')
                        ALTER TABLE tblContract ADD TerminationEvaluationMeeting NVARCHAR(100) NULL;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblContract') AND name = 'TerminationDecisionFileUrl')
                        ALTER TABLE tblContract ADD TerminationDecisionFileUrl NVARCHAR(500) NULL;
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblContract') AND name = 'TerminationMeetingFileUrl')
                        ALTER TABLE tblContract ADD TerminationMeetingFileUrl NVARCHAR(500) NULL;

                    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblFaceData') AND name = 'FaceVector512D')
                    BEGIN
                        ALTER TABLE tblFaceData ALTER COLUMN FaceVector512D NVARCHAR(MAX) NULL;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOnboarding') AND name = 'FaceRequestSent')
                    BEGIN
                        ALTER TABLE tblOnboarding ADD FaceRequestSent BIT DEFAULT 0;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOnboarding') AND name = 'FacePhotosCount')
                    BEGIN
                        ALTER TABLE tblOnboarding ADD FacePhotosCount INT DEFAULT 0;
                    END

                    -- Migration cho Phân hệ Nghỉ phép (Leave Management)
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblEmployee') AND name = 'ManagerId')
                    BEGIN
                        ALTER TABLE tblEmployee ADD ManagerId INT NULL;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tblLeaveType')
                    BEGIN
                        CREATE TABLE tblLeaveType (
                            LeaveTypeId INT IDENTITY(1,1) PRIMARY KEY,
                            TypeCode VARCHAR(50) NOT NULL UNIQUE,
                            TypeName NVARCHAR(100) NOT NULL,
                            IsPaid BIT DEFAULT 1
                        );

                        INSERT INTO tblLeaveType (TypeCode, TypeName, IsPaid) VALUES
                        ('ANNUAL', N'Nghỉ phép năm', 1),
                        ('SICK', N'Nghỉ ốm đau', 0),
                        ('MATERNITY', N'Nghỉ chế độ thai sản', 0),
                        ('UNPAID', N'Nghỉ việc riêng không hưởng lương', 0);
                    END

                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tblLeaveRequest')
                    BEGIN
                        CREATE TABLE tblLeaveRequest (
                            LeaveRequestId INT IDENTITY(1,1) PRIMARY KEY,
                            RequestCode VARCHAR(50) NOT NULL UNIQUE,
                            EmployeeId INT NOT NULL,
                            LeaveTypeId INT NOT NULL,
                            StartDate DATE NOT NULL,
                            EndDate DATE NOT NULL,
                            TotalDays DECIMAL(5, 1) NOT NULL,
                            Reason NVARCHAR(500) NOT NULL,
                            HandoverToEmployeeId INT NULL,
                            ApproverEmployeeId INT NULL,
                            Status NVARCHAR(50) DEFAULT 'Pending',
                            ResponseNote NVARCHAR(500) NULL,
                            ApprovedAt DATETIME2 NULL,
                            CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
                            UpdatedAt DATETIME2 DEFAULT SYSDATETIME()
                        );
                    END
                    ELSE
                    BEGIN
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblLeaveRequest') AND name = 'RequestCode')
                            ALTER TABLE tblLeaveRequest ADD RequestCode VARCHAR(50) NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblLeaveRequest') AND name = 'TotalDays')
                            ALTER TABLE tblLeaveRequest ADD TotalDays DECIMAL(5, 1) DEFAULT 1.0;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblLeaveRequest') AND name = 'Status')
                            ALTER TABLE tblLeaveRequest ADD Status NVARCHAR(50) DEFAULT 'Pending';
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblLeaveRequest') AND name = 'HandoverToEmployeeId')
                            ALTER TABLE tblLeaveRequest ADD HandoverToEmployeeId INT NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblLeaveRequest') AND name = 'ApproverEmployeeId')
                            ALTER TABLE tblLeaveRequest ADD ApproverEmployeeId INT NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblLeaveRequest') AND name = 'ResponseNote')
                            ALTER TABLE tblLeaveRequest ADD ResponseNote NVARCHAR(500) NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblLeaveRequest') AND name = 'ApprovedAt')
                            ALTER TABLE tblLeaveRequest ADD ApprovedAt DATETIME2 NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblLeaveRequest') AND name = 'CreatedAt')
                            ALTER TABLE tblLeaveRequest ADD CreatedAt DATETIME2 DEFAULT SYSDATETIME();
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblLeaveRequest') AND name = 'UpdatedAt')
                            ALTER TABLE tblLeaveRequest ADD UpdatedAt DATETIME2 DEFAULT SYSDATETIME();
                    END

                    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tblAttendance' AND COLUMN_NAME = 'AttendanceCode' AND CHARACTER_MAXIMUM_LENGTH < 20)
                    BEGIN
                        ALTER TABLE tblAttendance ALTER COLUMN AttendanceCode VARCHAR(20) NULL;
                    END

                    -- Migration cho Phân hệ Tăng ca / Làm thêm giờ (Overtime Management)
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tblOvertimeRequest')
                    BEGIN
                        CREATE TABLE tblOvertimeRequest (
                            OvertimeRequestId INT IDENTITY(1,1) PRIMARY KEY,
                            RequestCode VARCHAR(20) NOT NULL UNIQUE,
                            EmployeeId INT NOT NULL,
                            OvertimeDate DATE NOT NULL,
                            StartTime TIME(0) NOT NULL,
                            EndTime TIME(0) NOT NULL,
                            TotalHours DECIMAL(4, 2) NOT NULL,
                            OvertimeRateType NVARCHAR(50) DEFAULT N'Ngày thường (150%)',
                            Reason NVARCHAR(500) NOT NULL,
                            ApproverEmployeeId INT NULL,
                            Status NVARCHAR(50) DEFAULT 'PENDING',
                            ManagerComment NVARCHAR(255) NULL,
                            CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
                            UpdatedAt DATETIME2 DEFAULT SYSDATETIME()
                        );
                    END
                    ELSE
                    BEGIN
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOvertimeRequest') AND name = 'RequestCode')
                            ALTER TABLE tblOvertimeRequest ADD RequestCode VARCHAR(20) NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOvertimeRequest') AND name = 'TotalHours')
                            ALTER TABLE tblOvertimeRequest ADD TotalHours DECIMAL(4, 2) DEFAULT 0.0;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOvertimeRequest') AND name = 'OvertimeRateType')
                            ALTER TABLE tblOvertimeRequest ADD OvertimeRateType NVARCHAR(50) DEFAULT N'Ngày thường (150%)';
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOvertimeRequest') AND name = 'Status')
                            ALTER TABLE tblOvertimeRequest ADD Status NVARCHAR(50) DEFAULT 'PENDING';
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOvertimeRequest') AND name = 'ApproverEmployeeId')
                            ALTER TABLE tblOvertimeRequest ADD ApproverEmployeeId INT NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOvertimeRequest') AND name = 'ManagerComment')
                            ALTER TABLE tblOvertimeRequest ADD ManagerComment NVARCHAR(255) NULL;
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOvertimeRequest') AND name = 'CreatedAt')
                            ALTER TABLE tblOvertimeRequest ADD CreatedAt DATETIME2 DEFAULT SYSDATETIME();
                        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'tblOvertimeRequest') AND name = 'UpdatedAt')
                            ALTER TABLE tblOvertimeRequest ADD UpdatedAt DATETIME2 DEFAULT SYSDATETIME();
                    END
                `);
            } catch (migrationErr) {
                console.warn(
                    'Cảnh báo migration:',
                    migrationErr.message,
                );
            }
        }
        return pool;
    } catch (error) {
        console.error(
            '❌ Lỗi kết nối cơ sở dữ liệu SQL Server:',
            error.message,
        );
        throw error;
    }
};

export const getPool = () => pool;
export { sql };
