import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDb } from './src/Config/DbConfig.js';

import AuthRoutes from './src/Routes/AuthRoutes.js';
import AdminRoutes from './src/Routes/AdminRoutes.js';
import HrRoutes from './src/Routes/HrRoutes.js';
import EmployeeRoutes from './src/Routes/EmployeeRoutes.js';
import ContractRoutes from './src/Routes/ContractRoutes.js';
import OrgRoutes from './src/Routes/OrgRoutes.js';
import { DepartmentController } from './src/Controllers/Hr/DepartmentController.js';
import { verifyToken } from './src/Middlewares/AuthMiddleware.js';
import { requireRole } from './src/Middlewares/RoleMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: '*',
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        status: 'online',
        system: 'Enterprise HRM Backend API',
        database: 'Connected to Microsoft SQL Server (HRM_Enterprise_DB)',
        version: '1.0.0',
        time: new Date().toISOString(),
    });
});

app.use('/api/auth', AuthRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api/hr', HrRoutes);
app.use('/api/org', OrgRoutes);

app.use('/api/employees', EmployeeRoutes);
app.use('/api/contracts', ContractRoutes);
app.get(
    '/api/departments',
    verifyToken,
    requireRole('HR', 'Admin'),
    DepartmentController.getDepartments,
);
app.get(
    '/api/positions',
    verifyToken,
    requireRole('HR', 'Admin'),
    DepartmentController.getPositions,
);

const startServer = async () => {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.log(
                `🚀 Máy chủ HRM Backend đang hoạt động tại: http://localhost:${PORT}`,
            );
            console.log(
                `📡 API Đăng nhập: POST http://localhost:${PORT}/api/auth/login`,
            );
            console.log(
                `📡 API Đăng ký:   POST http://localhost:${PORT}/api/auth/register`,
            );
            console.log(
                `📡 API Employees: GET/POST http://localhost:${PORT}/api/employees`,
            );
            console.log(
                `📡 API Contracts: GET/POST http://localhost:${PORT}/api/contracts`,
            );
        });
    } catch (error) {
        console.error('❌ Không thể khởi động máy chủ:', error.message);
    }
};

startServer();
