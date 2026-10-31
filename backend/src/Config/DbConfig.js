import sql from 'mssql/msnodesqlv8.js';
import dotenv from 'dotenv';
dotenv.config();

const connectionString =
    process.env.DB_CONNECTION_STRING ||
    'Driver={ODBC Driver 17 for SQL Server};Server=芒果\\SQLEXPRESS;Database=HRM_Enterprise_DB;Trusted_Connection=yes;TrustServerCertificate=yes;';

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
