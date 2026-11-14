import ApiClient from './ApiClient';

class AttendanceService {
  static async checkIn(payload) {
    return ApiClient.post('/attendance/checkin', payload);
  }

  static async recognizeFrame(imageBase64, mode = 'AUTO') {
    return ApiClient.post('/attendance/recognize-frame', { imageBase64, mode });
  }

  static async getTodayEvents() {
    return ApiClient.get('/attendance/today-events');
  }

  static async getMonthMatrix({ year, month, departmentId } = {}) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    if (departmentId) params.append('departmentId', departmentId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get(`/attendance/matrix${query}`);
  }

  static async getMyAttendance({ employeeId, userId, employeeCode, username, year, month } = {}) {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (userId) params.append('userId', userId);
    if (employeeCode) params.append('employeeCode', employeeCode);
    if (username) params.append('username', username);
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    const query = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get(`/attendance/my-attendance${query}`);
  }

  static async registerFace(data) {
    return ApiClient.post('/attendance/register-face', data);
  }

  static async requestFacePhoto({ onboardingId }) {
    return ApiClient.post('/attendance/request-face-photo', { onboardingId });
  }

  static async getPendingFaceRequest(params = {}) {
    const q = new URLSearchParams();
    if (params.employeeId) q.append('employeeId', params.employeeId);
    if (params.username) q.append('username', params.username);
    if (params.email) q.append('email', params.email);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return ApiClient.get(`/attendance/pending-face-request${qs}`);
  }

  static async launchOpenCv() {
    return ApiClient.post('/attendance/launch-opencv', {});
  }

  static async stopOpenCv() {
    return ApiClient.post('/attendance/stop-opencv', {});
  }
}

export default AttendanceService;
