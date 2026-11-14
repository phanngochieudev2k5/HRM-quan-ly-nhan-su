import { AttendanceModel } from '../Models/AttendanceModel.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pyProcess = null;

export const AttendanceController = {
  async checkIn(req, res) {
    try {
      const { employeeCode, employeeId, checkinMethod, deviceName, snapshotUrl, mode } = req.body;
      if (!employeeCode && !employeeId) {
        return sendError(res, 'Mã nhân viên hoặc ID nhân viên là bắt buộc!', 400);
      }

      const result = await AttendanceModel.recordCheckIn({
        employeeCode,
        employeeId,
        checkinMethod: checkinMethod || 'OPENCV_CAMERA',
        deviceName: deviceName || 'Kiosk Cổng Chính',
        snapshotUrl,
        mode: mode || 'AUTO'
      });

      return res.status(200).json({
        success: true,
        message: result.message || (result.action === 'CHECK_IN'
          ? `Chấm công vào thành công cho ${result.employee.FullName} (${result.employee.EmployeeCode})`
          : `Chấm công ra thành công cho ${result.employee.FullName} (${result.employee.EmployeeCode})`),
        data: result
      });
    } catch (error) {
      console.error(error);
      return sendError(res, error.message || 'Lỗi xử lý điểm danh chấm công', 400);
    }
  },

  async recognizeAndCheckIn(req, res) {
    try {
      const { imageBase64, mode } = req.body;
      if (!imageBase64) {
        return sendError(res, 'Vui lòng cung cấp hình ảnh chụp từ Camera!', 400);
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(cleanBase64, 'base64');
      const uploadsDir = path.resolve(__dirname, '../../uploads/faces');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const tempPath = path.resolve(uploadsDir, `temp_scan_${Date.now()}.jpg`);
      fs.writeFileSync(tempPath, buf);

      const pyScript = path.resolve(__dirname, 'OpenCv/recognize_frame.py');
      const py = spawn('python', [pyScript, tempPath]);

      let stdout = '';
      let stderr = '';

      py.stdout.on('data', data => {
        stdout += data.toString();
      });
      py.stderr.on('data', data => {
        stderr += data.toString();
      });

      py.on('close', async () => {
        try {
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
        } catch {}

        try {
          const lines = stdout.trim().split('\n').map(l => l.trim()).filter(Boolean);
          const jsonLine = lines.reverse().find(l => l.startsWith('{') && l.endsWith('}'));
          if (!jsonLine) {
            return sendError(res, stderr || stdout || 'Không nhận diện được khuôn mặt', 400);
          }

          const result = JSON.parse(jsonLine);
          if (!result.success) {
            return sendError(res, result.message || 'Không thể nhận diện khuôn mặt', 400);
          }

          const recordResult = await AttendanceModel.recordCheckIn({
            employeeCode: result.name,
            checkinMethod: 'KIOSK_WEBCAM',
            deviceName: 'Kiosk Cổng Chính',
            mode: mode || 'AUTO'
          });

          return res.status(200).json({
            success: true,
            message: recordResult.message || (recordResult.action === 'CHECK_IN'
              ? `Chấm công vào thành công cho ${recordResult.employee.FullName} (${recordResult.employee.EmployeeCode})`
              : `Chấm công ra thành công cho ${recordResult.employee.FullName} (${recordResult.employee.EmployeeCode})`),
            data: recordResult
          });
        } catch (parseError) {
          console.error(parseError, stdout, stderr);
          return sendError(res, parseError.message || 'Lỗi thuật toán nhận diện khuôn mặt OpenCV', 400);
        }
      });
    } catch (error) {
      console.error(error);
      return sendError(res, error.message || 'Lỗi nhận diện khuôn mặt', 500);
    }
  },

  async getTodayEvents(req, res) {
    try {
      const events = await AttendanceModel.getTodayEvents();
      return sendSuccess(res, events, 'Lấy danh sách điểm danh hôm nay thành công');
    } catch (error) {
      console.error(error);
      return sendError(res, error.message || 'Lỗi lấy nhật ký chấm công', 500);
    }
  },

  async getMonthMatrix(req, res) {
    try {
      const year = parseInt(req.query.year || new Date().getFullYear(), 10);
      const month = parseInt(req.query.month || (new Date().getMonth() + 1), 10);
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId, 10) : null;

      const data = await AttendanceModel.getMonthMatrix({ year, month, departmentId });
      return sendSuccess(res, data, 'Lấy bảng chấm công ma trận thành công');
    } catch (error) {
      console.error(error);
      return sendError(res, error.message || 'Lỗi lấy bảng chấm công', 500);
    }
  },

  async getMyAttendance(req, res) {
    try {
      const employeeId = req.user?.employeeId || req.user?.EmployeeId || req.query.employeeId;
      const userId = req.user?.userId || req.user?.id || req.query.userId || req.query.id;
      const employeeCode = req.query.employeeCode || req.user?.employeeCode || req.user?.EmployeeCode;
      const username = req.query.username || req.user?.username || req.user?.Username;
      const year = parseInt(req.query.year || new Date().getFullYear(), 10);
      const month = parseInt(req.query.month || (new Date().getMonth() + 1), 10);

      const records = await AttendanceModel.getEmployeeAttendance({
        employeeId: employeeId ? parseInt(employeeId, 10) : null,
        userId: userId ? parseInt(userId, 10) : null,
        employeeCode,
        username,
        year,
        month
      });
      return sendSuccess(res, records, 'Lấy lịch sử chấm công cá nhân thành công');
    } catch (error) {
      console.error(error);
      return sendError(res, error.message || 'Lỗi lấy lịch sử chấm công', 500);
    }
  },

  async registerFace(req, res) {
    try {
      const { employeeId, employeeCode, imageBase64 } = req.body;
      let files = [];
      if (req.files && Array.isArray(req.files)) {
        files = req.files;
      } else if (req.file) {
        files = [req.file];
      }

      const result = await AttendanceModel.registerFaceProfile({
        employeeId: employeeId ? parseInt(employeeId, 10) : null,
        employeeCode,
        files,
        imageBase64,
        imageBuffer: files[0]?.buffer,
        fileName: files[0]?.originalname
      });

      return sendSuccess(res, result, 'Đăng ký dữ liệu khuôn mặt thành công');
    } catch (error) {
      console.error(error);
      return sendError(res, error.message || 'Lỗi đăng ký dữ liệu khuôn mặt', 500);
    }
  },

  async requestFacePhoto(req, res) {
    try {
      const { onboardingId } = req.body;
      if (!onboardingId) {
        return sendError(res, 'Thiếu OnboardingId', 400);
      }
      const result = await AttendanceModel.requestFacePhoto({ onboardingId: parseInt(onboardingId, 10) });
      return sendSuccess(res, result, 'Đã gửi yêu cầu nộp ảnh Face ID tới nhân viên');
    } catch (error) {
      console.error(error);
      return sendError(res, error.message || 'Lỗi gửi yêu cầu Face ID', 500);
    }
  },

  async getPendingFaceRequest(req, res) {
    try {
      const employeeId = req.user?.EmployeeId || req.query.employeeId;
      const username = req.user?.Username || req.query.username;
      const email = req.user?.Email || req.query.email;

      const result = await AttendanceModel.getPendingFaceRequest({
        employeeId: employeeId ? parseInt(employeeId, 10) : null,
        username,
        email
      });
      return sendSuccess(res, result, 'Kiểm tra trạng thái Face ID');
    } catch (error) {
      console.error(error);
      return sendError(res, error.message || 'Lỗi kiểm tra trạng thái Face ID', 500);
    }
  },

  async launchOpenCv(req, res) {
    try {
      if (pyProcess && !pyProcess.killed) {
        return sendSuccess(res, true, 'OpenCV camera đang hoạt động sẵn sàng');
      }

      const scriptPath = path.resolve(__dirname, 'OpenCv/opencv_attendance.py');
      pyProcess = spawn('python', [scriptPath], {
        detached: true,
        stdio: 'ignore'
      });
      pyProcess.unref();

      return sendSuccess(res, true, 'Khởi động ứng dụng chấm công OpenCV thành công');
    } catch (error) {
      return sendError(res, error.message || 'Không thể khởi động OpenCV camera', 500);
    }
  },

  async stopOpenCv(req, res) {
    try {
      if (pyProcess) {
        try {
          pyProcess.kill();
        } catch {}
        pyProcess = null;
      }
      if (process.platform === 'win32') {
        const { exec } = await import('child_process');
        exec('taskkill /F /IM python.exe /FI "WINDOWTITLE eq Nhan dien*"', () => {});
      }
      return sendSuccess(res, true, 'Đã giải phóng camera và đóng tiến trình OpenCV');
    } catch (error) {
      return sendError(res, error.message || 'Lỗi đóng tiến trình OpenCV', 500);
    }
  }
};
