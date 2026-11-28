import ApiClient from './ApiClient';

export const PayrollService = {
  async getPeriods() {
    const res = await ApiClient.get('/payroll/periods');
    return res.data;
  },

  async getConfig() {
    const res = await ApiClient.get('/payroll/config');
    return res.data;
  },

  async updateConfig(config) {
    const res = await ApiClient.put('/payroll/config', config);
    return res.data;
  },

  async getPayrollPreview({ period, standardWorkDays } = {}) {
    const query = new URLSearchParams();
    if (period) query.append('period', period);
    if (standardWorkDays) query.append('standardWorkDays', standardWorkDays);
    const qs = query.toString();
    const res = await ApiClient.get(qs ? `/payroll/preview?${qs}` : '/payroll/preview');
    return res.data;
  },

  async calculateAndSaveDraft({ period, standardWorkDays }) {
    const res = await ApiClient.post('/payroll/calculate', { period, standardWorkDays });
    return res.data;
  },

  async saveAdjustment(payload) {
    const res = await ApiClient.put('/payroll/adjustment', payload);
    return res.data;
  },

  async lockPeriod({ period, standardWorkDays }) {
    const res = await ApiClient.post('/payroll/lock', { period, standardWorkDays });
    return res.data;
  },

  async unlockPeriod({ period }) {
    const res = await ApiClient.post('/payroll/unlock', { period });
    return res.data;
  },

  async getMyPayslip({ period, employeeCode, employeeId, includeDraft } = {}) {
    const query = new URLSearchParams();
    if (period) query.append('period', period);
    if (employeeCode) query.append('employeeCode', employeeCode);
    if (employeeId) query.append('employeeId', employeeId);
    if (includeDraft) query.append('includeDraft', 'true');
    const qs = query.toString();
    const res = await ApiClient.get(qs ? `/payroll/my-payslip?${qs}` : '/payroll/my-payslip');
    return res.data;
  },

  async getMyPeriods() {
    const res = await ApiClient.get('/payroll/my-periods');
    return res.data;
  },

  async submitFeedback({ periodCode, content }) {
    const res = await ApiClient.post('/payroll/feedback', { periodCode, content });
    return res.data;
  },

  async getMyFeedbacks({ period } = {}) {
    const qs = period ? `?period=${encodeURIComponent(period)}` : '';
    const res = await ApiClient.get(`/payroll/my-feedbacks${qs}`);
    return res.data;
  },

  async getAllFeedbacks({ period, status } = {}) {
    const query = new URLSearchParams();
    if (period) query.append('period', period);
    if (status) query.append('status', status);
    const qs = query.toString();
    const res = await ApiClient.get(qs ? `/payroll/feedbacks?${qs}` : '/payroll/feedbacks');
    return res.data;
  },

  async resolveFeedback(id, { status, accountantReply }) {
    const res = await ApiClient.put(`/payroll/feedback/${id}/resolve`, { status, accountantReply });
    return res.data;
  }
};

export default PayrollService;
