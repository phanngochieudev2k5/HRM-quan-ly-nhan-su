import ApiClient from './ApiClient';

export const HrService = {
  /**
   * Lấy danh sách nhân sự (hỗ trợ phân trang, tìm kiếm, lọc)
   * @param {Object} params { page, limit, search, departmentId, workStatus }
   */
  async getEmployees(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      if (params.search) query.append('search', params.search);
      if (params.departmentId) query.append('departmentId', params.departmentId);
      if (params.workStatus) query.append('workStatus', params.workStatus);

      const qs = query.toString();
      const endpoint = qs ? `/employees?${qs}` : '/employees';
      const res = await ApiClient.get(endpoint);
      return res.data;
    } catch (error) {
      console.warn('[HrService.getEmployees] Error, trying fallback endpoint:', error.message);
      try {
        const fallbackRes = await ApiClient.get('/hr/employees');
        return fallbackRes.data;
      } catch {
        return { employees: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
      }
    }
  },

  /**
   * Lấy chi tiết hồ sơ 360° nhân viên bao gồm hợp đồng và user
   * @param {string|number} id EmployeeId hoặc EmployeeCode
   */
  async getEmployeeById(id) {
    try {
      const res = await ApiClient.get(`/employees/${id}`);
      return res.data;
    } catch (err) {
      const fallbackRes = await ApiClient.get(`/hr/employees/${id}`);
      return fallbackRes.data;
    }
  },

  /**
   * Thêm mới hồ sơ nhân sự
   */
  async createEmployee(employeeData) {
    try {
      const res = await ApiClient.post('/employees', employeeData);
      return res.data;
    } catch {
      const res2 = await ApiClient.post('/hr/employees', employeeData);
      return res2.data;
    }
  },

  /**
   * Cập nhật thông tin nhân sự
   */
  async updateEmployee(id, employeeData) {
    try {
      const res = await ApiClient.put(`/employees/${id}`, employeeData);
      return res.data;
    } catch {
      const res2 = await ApiClient.put(`/hr/employees/${id}`, employeeData);
      return res2.data;
    }
  },

  /**
   * Xóa nhân sự
   */
  async deleteEmployee(id) {
    try {
      const res = await ApiClient.delete(`/employees/${id}`);
      return res.data;
    } catch {
      const res2 = await ApiClient.delete(`/hr/employees/${id}`);
      return res2.data;
    }
  },

  /**
   * Lấy danh sách hợp đồng
   */
  async getContracts(params = {}) {
    const query = new URLSearchParams();
    if (params.employeeId) query.append('employeeId', params.employeeId);
    if (params.status && params.status !== 'all' && params.status !== 'Tất cả trạng thái') {
      query.append('status', params.status);
    }
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    const endpoint = qs ? `/contracts?${qs}` : '/contracts';
    
    try {
      const res = await ApiClient.get(endpoint);
      return res.data || [];
    } catch (err) {
      console.warn('[HrService.getContracts] Fallback to /hr/contracts:', err.message);
      try {
        const fallbackEndpoint = qs ? `/hr/contracts?${qs}` : '/hr/contracts';
        const res2 = await ApiClient.get(fallbackEndpoint);
        return res2.data || [];
      } catch {
        return [];
      }
    }
  },

  async createContract(contractData) {
    try {
      const res = await ApiClient.post('/contracts', contractData);
      return res.data;
    } catch {
      const res2 = await ApiClient.post('/hr/contracts', contractData);
      return res2.data;
    }
  },

  async updateContract(id, contractData) {
    try {
      const res = await ApiClient.put(`/contracts/${id}`, contractData);
      return res.data;
    } catch {
      const res2 = await ApiClient.put(`/hr/contracts/${id}`, contractData);
      return res2.data;
    }
  },

  async deleteContract(id) {
    try {
      const res = await ApiClient.delete(`/contracts/${id}`);
      return res.data;
    } catch {
      const res2 = await ApiClient.delete(`/hr/contracts/${id}`);
      return res2.data;
    }
  },

  async getDepartments() {
    try {
      const res = await ApiClient.get('/departments');
      return res.data || [];
    } catch {
      try {
        const res2 = await ApiClient.get('/hr/departments');
        return res2.data || [];
      } catch {
        return [];
      }
    }
  },

  async getPositions() {
    try {
      const res = await ApiClient.get('/positions');
      return res.data || [];
    } catch {
      try {
        const res2 = await ApiClient.get('/hr/positions');
        return res2.data || [];
      } catch {
        return [];
      }
    }
  },

  // ==================== US-04: RECRUITMENT JOBS ====================

  /**
   * Lấy danh sách vị trí / đề xuất tuyển dụng (tblRecruitmentJob)
   */
  async getRecruitmentJobs(params = {}) {
    const query = new URLSearchParams();
    if (params.departmentId && params.departmentId !== 'all') query.append('departmentId', params.departmentId);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    const endpoint = qs ? `/recruitment-jobs?${qs}` : '/recruitment-jobs';

    try {
      const res = await ApiClient.get(endpoint);
      return res.data || [];
    } catch (err) {
      try {
        const fallback = qs ? `/hr/recruitment-jobs?${qs}` : '/hr/recruitment-jobs';
        const res2 = await ApiClient.get(fallback);
        return res2.data || [];
      } catch {
        return [];
      }
    }
  },

  /**
   * Tạo đề xuất tuyển dụng mới
   */
  async createRecruitmentJob(jobData) {
    try {
      const res = await ApiClient.post('/recruitment-jobs', jobData);
      return res.data;
    } catch {
      const res2 = await ApiClient.post('/hr/recruitment-jobs', jobData);
      return res2.data;
    }
  },

  /**
   * Duyệt (Approved) hoặc Từ chối (Rejected) đề xuất tuyển dụng
   */
  async updateRecruitmentJobStatus(id, status) {
    try {
      const res = await ApiClient.put(`/recruitment-jobs/${id}/status`, { status });
      return res.data;
    } catch {
      const res2 = await ApiClient.put(`/hr/recruitment-jobs/${id}/status`, { status });
      return res2.data;
    }
  },

  /**
   * Cập nhật thông tin vị trí tuyển dụng
   */
  async updateRecruitmentJob(id, jobData) {
    try {
      const res = await ApiClient.put(`/recruitment-jobs/${id}`, jobData);
      return res.data;
    } catch {
      const res2 = await ApiClient.put(`/hr/recruitment-jobs/${id}`, jobData);
      return res2.data;
    }
  },

  /**
   * Xóa vị trí tuyển dụng
   */
  async deleteRecruitmentJob(id) {
    try {
      const res = await ApiClient.delete(`/recruitment-jobs/${id}`);
      return res.data;
    } catch {
      const res2 = await ApiClient.delete(`/hr/recruitment-jobs/${id}`);
      return res2.data;
    }
  },

  // ==================== US-05: CANDIDATES PIPELINE ====================

  /**
   * Lấy danh sách ứng viên (tblCandidate) theo Job hoặc Stage
   */
  async getCandidates(params = {}) {
    const query = new URLSearchParams();
    if (params.jobId && params.jobId !== 'all') query.append('jobId', params.jobId);
    if (params.stage && params.stage !== 'all') query.append('stage', params.stage);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    const endpoint = qs ? `/candidates?${qs}` : '/candidates';

    try {
      const res = await ApiClient.get(endpoint);
      return res.data || [];
    } catch (err) {
      try {
        const fallback = qs ? `/hr/candidates?${qs}` : '/hr/candidates';
        const res2 = await ApiClient.get(fallback);
        return res2.data || [];
      } catch {
        return [];
      }
    }
  },

  /**
   * Thêm mới ứng viên ứng tuyển
   */
  async createCandidate(candidateData) {
    try {
      const res = await ApiClient.post('/candidates', candidateData);
      return res.data;
    } catch {
      const res2 = await ApiClient.post('/hr/candidates', candidateData);
      return res2.data;
    }
  },

  /**
   * Cập nhật giai đoạn tuyển dụng (Kanban Stage) cho ứng viên
   */
  async updateCandidateStage(id, stage) {
    try {
      const res = await ApiClient.put(`/candidates/${id}/stage`, { stage });
      return res.data;
    } catch {
      const res2 = await ApiClient.put(`/hr/candidates/${id}/stage`, { stage });
      return res2.data;
    }
  },

  /**
   * Cập nhật toàn bộ thông tin ứng viên
   */
  async updateCandidate(id, candidateData) {
    try {
      const res = await ApiClient.put(`/candidates/${id}`, candidateData);
      return res.data;
    } catch {
      const res2 = await ApiClient.put(`/hr/candidates/${id}`, candidateData);
      return res2.data;
    }
  },

  /**
   * Xóa ứng viên
   */
  async deleteCandidate(id) {
    try {
      const res = await ApiClient.delete(`/candidates/${id}`);
      return res.data;
    } catch {
      const res2 = await ApiClient.delete(`/hr/candidates/${id}`);
      return res2.data;
    }
  }
};

export default HrService;
