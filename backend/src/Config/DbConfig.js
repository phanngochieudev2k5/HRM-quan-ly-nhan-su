import sql from 'mssql/msnodesqlv8.js';
import dotenv from 'dotenv';
dotenv.config();

const connectionString =
    process.env.DB_CONNECTION_STRING ||
    'Driver={ODBC Driver 17 for SQL Server};Server=CODER\\SQLEXPRESS01;Database=HRM_Enterprise_DB;Trusted_Connection=yes;TrustServerCertificate=yes;';

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
