import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './src/Config/DbConfig.js';

import AuthRoutes from './src/Routes/AuthRoutes.js';
import AdminRoutes from './src/Routes/AdminRoutes.js';
import HrRoutes from './src/Routes/HrRoutes.js';
import EmployeeRoutes from './src/Routes/EmployeeRoutes.js';
import ContractRoutes from './src/Routes/ContractRoutes.js';
import OrgRoutes from './src/Routes/OrgRoutes.js';
import LaborContractRoutes from './src/Routes/LaborContractRoutes.js';
import RecruitmentRoutes from './src/Routes/RecruitmentRoutes.js';
import CandidateRoutes from './src/Routes/CandidateRoutes.js';
import CareersRoutes from './src/Routes/CareersRoutes.js';
import OnboardingRoutes from './src/Routes/OnboardingRoutes.js';
import AssetRoutes from './src/Routes/AssetRoutes.js';
import AttendanceRoutes from './src/Routes/AttendanceRoutes.js';
import ShiftRoutes from './src/Routes/ShiftRoutes.js';
import { DepartmentController } from './src/Controllers/Hr/DepartmentController.js';
import { verifyToken } from './src/Middlewares/AuthMiddleware.js';
import { requireRole } from './src/Middlewares/RoleMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
    cors({
        origin: '*',
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/labor-contracts', LaborContractRoutes);

app.use('/api/employees', EmployeeRoutes);
app.use('/api/contracts', ContractRoutes);
app.use('/api/recruitment-jobs', RecruitmentRoutes);
app.use('/api/candidates', CandidateRoutes);
app.use('/api/careers', CareersRoutes);
app.use('/api/onboarding', OnboardingRoutes);
app.use('/api/assets', AssetRoutes);
app.use('/api/attendance', AttendanceRoutes);
app.use('/api/shifts', ShiftRoutes);

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
                `📡 API Đăng nhập:        POST http://localhost:${PORT}/api/auth/login`,
            );
            console.log(
                `📡 API Employees:       GET/POST http://localhost:${PORT}/api/employees`,
            );
            console.log(
                `📡 API Recruitment:     GET/POST http://localhost:${PORT}/api/recruitment-jobs`,
            );
            console.log(
                `📡 API Candidates:      GET/POST http://localhost:${PORT}/api/candidates`,
            );
        });
    } catch (error) {
        console.error('❌ Không thể khởi động máy chủ:', error.message);
    }
};

startServer();
