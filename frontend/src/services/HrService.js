import ApiClient from './ApiClient';

export const HrService = {
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
      console.warn(error.message);
      try {
        const fallbackRes = await ApiClient.get('/hr/employees');
        return fallbackRes.data;
      } catch {
        return { employees: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
      }
    }
  },

  async getEmployeeById(id) {
    try {
      const res = await ApiClient.get(`/employees/${id}`);
      return res.data;
    } catch (err) {
      const fallbackRes = await ApiClient.get(`/hr/employees/${id}`);
      return fallbackRes.data;
    }
  },

  async createEmployee(employeeData) {
    try {
      const res = await ApiClient.post('/employees', employeeData);
      return res.data;
    } catch {
      const res2 = await ApiClient.post('/hr/employees', employeeData);
      return res2.data;
    }
  },

  async updateEmployee(id, employeeData) {
    try {
      const res = await ApiClient.put(`/employees/${id}`, employeeData);
      return res.data;
    } catch {
      const res2 = await ApiClient.put(`/hr/employees/${id}`, employeeData);
      return res2.data;
    }
  },

  async deleteEmployee(id) {
    try {
      const res = await ApiClient.delete(`/employees/${id}`);
      return res.data;
    } catch {
      const res2 = await ApiClient.delete(`/hr/employees/${id}`);
      return res2.data;
    }
  },

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

  async createRecruitmentJob(jobData) {
    try {
      const res = await ApiClient.post('/recruitment-jobs', jobData);
      return res.data;
    } catch {
      const res2 = await ApiClient.post('/hr/recruitment-jobs', jobData);
      return res2.data;
    }
  },

  async updateRecruitmentJob(id, jobData) {
    try {
      const res = await ApiClient.put(`/recruitment-jobs/${id}`, jobData);
      return res.data;
    } catch {
      const res2 = await ApiClient.put(`/hr/recruitment-jobs/${id}`, jobData);
      return res2.data;
    }
  },

  async deleteRecruitmentJob(id) {
    try {
      const res = await ApiClient.delete(`/recruitment-jobs/${id}`);
      return res.data;
    } catch {
      const res2 = await ApiClient.delete(`/hr/recruitment-jobs/${id}`);
      return res2.data;
    }
  },

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

  async createCandidate(candidateData) {
    try {
      const res = await ApiClient.post('/candidates', candidateData);
      return res.data;
    } catch {
      const res2 = await ApiClient.post('/hr/candidates', candidateData);
      return res2.data;
    }
  },

  async updateCandidateStage(id, stage, additionalData = {}, sendEmail = false) {
    const payload = { stage, additionalData, sendEmail };
    try {
      const res = await ApiClient.put(`/candidates/${id}/stage`, payload);
      return res.data;
    } catch {
      const res2 = await ApiClient.put(`/hr/candidates/${id}/stage`, payload);
      return res2.data;
    }
  },

  async sendCandidateEmail(id, emailData = {}) {
    try {
      const res = await ApiClient.post(`/candidates/${id}/send-email`, emailData);
      return res.data;
    } catch {
      const res2 = await ApiClient.post(`/hr/candidates/${id}/send-email`, emailData);
      return res2.data;
    }
  },

  async updateCandidate(id, candidateData) {
    try {
      const res = await ApiClient.put(`/candidates/${id}`, candidateData);
      return res.data;
    } catch {
      const res2 = await ApiClient.put(`/hr/candidates/${id}`, candidateData);
      return res2.data;
    }
  },

  async uploadCv(file) {
    const formData = new FormData();
    formData.append('cvFile', file);
    const res = await ApiClient.post('/candidates/upload-cv', formData);
    return res.data || res;
  },

  async uploadPublicCv(file) {
    const formData = new FormData();
    formData.append('cvFile', file);
    const res = await ApiClient.post('/careers/upload-cv', formData);
    return res.data || res;
  },

  async deleteCandidate(id) {
    try {
      const res = await ApiClient.delete(`/candidates/${id}`);
      return res.data;
    } catch {
      const res2 = await ApiClient.delete(`/hr/candidates/${id}`);
      return res2.data;
    }
  },

  async getPublicCareersJobs(params = {}) {
    const query = new URLSearchParams();
    if (params.departmentId && params.departmentId !== 'all') query.append('departmentId', params.departmentId);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    const endpoint = qs ? `/careers/jobs?${qs}` : '/careers/jobs';
    const res = await ApiClient.get(endpoint);
    return res.data || [];
  },

  async getPublicCareerJobById(id) {
    const res = await ApiClient.get(`/careers/jobs/${id}`);
    return res.data;
  },

  async applyPublicCareer(data) {
    const res = await ApiClient.post('/careers/apply', data);
    return res.data;
  },

  async getOnboardings(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    const endpoint = qs ? `/onboarding?${qs}` : '/onboarding';
    const res = await ApiClient.get(endpoint);
    return res.data || [];
  },

  async getOnboardingById(id) {
    const res = await ApiClient.get(`/onboarding/${id}`);
    return res.data;
  },

  async createOnboarding(data) {
    const res = await ApiClient.post('/onboarding', data);
    return res.data;
  },

  async updateOnboardingChecklist(id, fields) {
    const res = await ApiClient.put(`/onboarding/${id}/checklist`, fields);
    return res.data;
  },

  async convertOnboardingToEmployee(id, data) {
    const res = await ApiClient.post(`/onboarding/${id}/convert-employee`, data);
    return res.data;
  },

  async deleteOnboarding(id) {
    const res = await ApiClient.delete(`/onboarding/${id}`);
    return res.data;
  },

  async createOnboardingAccount(id, data) {
    const res = await ApiClient.post(`/onboarding/${id}/create-account`, data);
    return res.data || res;
  },

  async sendOnboardingAccountEmail(id, data) {
    const res = await ApiClient.post(`/onboarding/${id}/send-account-email`, data);
    return res.data || res;
  },

  async getAssets(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.employeeId) query.append('employeeId', params.employeeId);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    const endpoint = qs ? `/assets?${qs}` : '/assets';
    const res = await ApiClient.get(endpoint);
    return res.data || [];
  },

  async getMyAssets() {
    const res = await ApiClient.get('/assets/my-assets');
    return res.data || [];
  },

  async createAsset(data) {
    const res = await ApiClient.post('/assets', data);
    return res.data || res;
  },

  async deleteAsset(id) {
    const res = await ApiClient.delete(`/assets/${id}`);
    return res.data;
  },

  async getMyContracts() {
    const res = await ApiClient.get('/contracts/my-contracts');
    return res.data || [];
  },

  async signContract(id) {
    const res = await ApiClient.post(`/contracts/${id}/sign`, {});
    return res.data || res;
  },

  async requestResignation(id, data) {
    const res = await ApiClient.post(`/contracts/${id}/resignation-request`, data);
    return res.data || res;
  },

  async respondTermination(id, data) {
    const res = await ApiClient.post(`/contracts/${id}/employee-respond-termination`, data);
    return res.data || res;
  }
};

export default HrService;
