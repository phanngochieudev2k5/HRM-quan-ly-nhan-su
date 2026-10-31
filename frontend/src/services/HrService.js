import ApiClient from './ApiClient';

export const HrService = {
  async getUnassignedUsers() {
    try {
      const res = await ApiClient.get('/employees/unassigned-users');
      return res.data || [];
    } catch {
      return [];
    }
  },

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
   * @param {Object} employeeData
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
   * @param {string|number} id
   * @param {Object} employeeData
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
   * @param {string|number} id
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
   * Lấy danh sách hợp đồng (hỗ trợ lọc theo employeeId, status, search)
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

  /**
   * Thêm mới hợp đồng lao động
   */
  async createContract(contractData) {
    try {
      const res = await ApiClient.post('/contracts', contractData);
      return res.data;
    } catch {
      const res2 = await ApiClient.post('/hr/contracts', contractData);
      return res2.data;
    }
  },

  /**
   * Cập nhật hợp đồng lao động
   */
  async updateContract(id, contractData) {
    try {
      const res = await ApiClient.put(`/contracts/${id}`, contractData);
      return res.data;
    } catch {
      const res2 = await ApiClient.put(`/hr/contracts/${id}`, contractData);
      return res2.data;
    }
  },

  /**
   * Xóa hợp đồng lao động
   */
  async deleteContract(id) {
    try {
      const res = await ApiClient.delete(`/contracts/${id}`);
      return res.data;
    } catch {
      const res2 = await ApiClient.delete(`/hr/contracts/${id}`);
      return res2.data;
    }
  },

  /**
   * Lấy danh sách phòng ban
   */
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

  /**
   * Lấy danh sách chức vụ
   */
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
  }
};

export default HrService;
