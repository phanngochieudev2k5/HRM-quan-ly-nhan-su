import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText, Search, Plus, FileSpreadsheet, RefreshCw, Eye, Edit2, Trash2,
  Calendar, DollarSign, CheckCircle2, Clock, AlertTriangle,
  User, ArrowRight, History, AlertCircle, ShieldAlert, Award, ChevronRight, X,
  Printer, XCircle, FileCheck, Building, Briefcase
} from 'lucide-react';
import LaborContractService from '../../../../services/LaborContractService';
import '../../../../styles/roles/hr/LaborContract.css';

export default function LaborContractManagement({
  employees: propEmployees = [],
  onViewProfile,
  onNavigate
}) {
  
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    expiringSoon30: 0,
    expiringSoon15: 0,
    expiredContracts: 0,
    permanentContracts: 0
  });
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [activeTab, setActiveTab] = useState('list');

  
  
  
  
  
  
  
  const [selectedKpiFilter, setSelectedKpiFilter] = useState('ACTIVE_DEFAULT');

  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedActionContract, setSelectedActionContract] = useState(null);

  const handleOpenActionModal = (contract) => {
    setSelectedActionContract(contract);
    setIsActionModalOpen(true);
  };

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedActionContract(null);
  };

  
  const [historyEmpId, setHistoryEmpId] = useState('');
  const [employeeHistoryData, setEmployeeHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [currentContract, setCurrentContract] = useState({
    ContractId: null,
    ContractNumber: '',
    EmployeeId: '',
    ContractType: 'Hợp đồng xác định thời hạn 1 năm',
    SignDate: new Date().toISOString().slice(0, 10),
    StartDate: new Date().toISOString().slice(0, 10),
    EndDate: '',
    AgreedSalary: 20000000,
    Status: 'Hiệu lực'
  });

  
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState(null);
  const [renewForm, setRenewForm] = useState({
    contractNumber: '',
    contractType: 'Hợp đồng xác định thời hạn 3 năm',
    signDate: new Date().toISOString().slice(0, 10),
    startDate: '',
    endDate: '',
    agreedSalary: 0
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedContractDetail, setSelectedContractDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [terminateTarget, setTerminateTarget] = useState(null);
  const [terminateForm, setTerminateForm] = useState({
    terminationType: 'Thỏa thuận hai bên',
    terminateDate: new Date().toISOString().slice(0, 10),
    reason: 'Hai bên thỏa thuận chấm dứt hợp đồng lao động',
    decisionNumber: '',
    evaluationMeetingNumber: '',
    note: ''
  });
  const [terminateFiles, setTerminateFiles] = useState({
    decisionFile: null,
    meetingFile: null
  });
  const [terminateSubmitting, setTerminateSubmitting] = useState(false);

  const [isResignationModalOpen, setIsResignationModalOpen] = useState(false);
  const [resignationTarget, setResignationTarget] = useState(null);
  const [resignationAction, setResignationAction] = useState('approve');
  const [resignationNote, setResignationNote] = useState('');
  const [resignationSubmitting, setResignationSubmitting] = useState(false);

  
  const [toastInfo, setToastInfo] = useState(null);
  const showToast = (type, message) => {
    setToastInfo({ type, message });
    setTimeout(() => setToastInfo(null), 4000);
  };

  const formatVND = (num) => `${Math.round(+num || 0).toLocaleString('vi-VN')} đ`;

  
  const removeAccents = (str) => {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  };

  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [contractsRes, statsRes, empRes] = await Promise.all([
        LaborContractService.getContracts(),
        LaborContractService.getStats(),
        LaborContractService.getEmployeesOverview()
      ]);

      setContracts(contractsRes || []);
      setStats(statsRes || {});
      setEmployeesList(empRes || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu hợp đồng:', err);
      showToast('error', 'Không thể kết nối CSDL SQL Server: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  
  const handleKpiCardClick = (filterType) => {
    if (selectedKpiFilter === filterType && filterType !== 'ACTIVE_DEFAULT') {
      setSelectedKpiFilter('ACTIVE_DEFAULT');
    } else {
      setSelectedKpiFilter(filterType);
    }
    setActiveTab('list');
  };

  
  const displayedContracts = useMemo(() => {
    let list = [...contracts];

    
    
    if (selectedKpiFilter === 'EXPIRED') {
      
      list = list.filter(c => 
        c.Status === 'Hết hạn' || 
        c.Status === 'Đã chấm dứt' || 
        c.Status === 'Đã gia hạn' || 
        c.Status === 'Đã tái ký' ||
        c.ExpirationCategory === 'EXPIRED'
      );
    } else {
      
      list = list.filter(c => 
        c.Status !== 'Hết hạn' && 
        c.Status !== 'Đã chấm dứt' && 
        c.Status !== 'Đã gia hạn' && 
        c.Status !== 'Đã tái ký' &&
        c.ExpirationCategory !== 'EXPIRED'
      );

      if (selectedKpiFilter === 'ACTIVE') {
        list = list.filter(c => c.Status === 'Hiệu lực');
      } else if (selectedKpiFilter === 'EXPIRING') {
        list = list.filter(c => 
          c.ExpirationCategory === 'EXPIRING_URGENT' || 
          c.ExpirationCategory === 'EXPIRING_SOON' || 
          c.Status === 'Sắp hết hạn'
        );
      } else if (selectedKpiFilter === 'PERMANENT') {
        list = list.filter(c => 
          c.EndDate === null || 
          c.ExpirationCategory === 'PERMANENT' || 
          (c.ContractType && c.ContractType.toLowerCase().includes('vô thời hạn'))
        );
      }
    }

    
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(c => c.Status === statusFilter);
    }

    
    if (typeFilter && typeFilter !== 'all') {
      list = list.filter(c => c.ContractType === typeFilter);
    }

    
    if (selectedDeptFilter) {
      list = list.filter(c => String(c.DepartmentId) === String(selectedDeptFilter));
    }

    
    if (searchTerm && searchTerm.trim()) {
      const clean = removeAccents(searchTerm);
      list = list.filter(c => 
        removeAccents(c.ContractNumber).includes(clean) ||
        removeAccents(c.EmployeeName).includes(clean) ||
        removeAccents(c.EmployeeCode).includes(clean) ||
        removeAccents(c.DepartmentName).includes(clean) ||
        removeAccents(c.PositionName).includes(clean) ||
        removeAccents(c.ContractType).includes(clean) ||
        removeAccents(c.Status).includes(clean)
      );
    }

    return list;
  }, [contracts, selectedKpiFilter, statusFilter, typeFilter, selectedDeptFilter, searchTerm]);

  
  const handleExportExcel = () => {
    if (!displayedContracts || displayedContracts.length === 0) {
      showToast('error', 'Không có dữ liệu hợp đồng nào để xuất Excel!');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const fileName = `Danh_sach_hop_dong_lao_dong_${dateStr}.xls`;

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; margin-top: 15px; }
          th { background-color: #0f766e; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 10px 8px; text-align: center; }
          td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 13px; color: #1e293b; }
          .title { font-size: 18px; font-weight: bold; color: #042f2e; text-align: center; margin-bottom: 5px; }
          .meta { font-size: 12px; color: #64748b; text-align: center; margin-bottom: 15px; }
          .num { text-align: right; mso-number-format: "\\#\\,\\#\\#0"; }
          .text { mso-number-format: "\\@"; }
          .center { text-align: center; }
          .expired { color: #dc2626; font-weight: bold; }
          .active { color: #16a34a; font-weight: bold; }
          .urgent { color: #d97706; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="title">BÁO CÁO DANH SÁCH HỢP ĐỒNG LAO ĐỘNG DOANH NGHIỆP</div>
        <div class="meta">Ngày xuất: ${now.toLocaleString('vi-VN')} | Tổng số: ${displayedContracts.length} hợp đồng</div>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Số hợp đồng</th>
              <th>Mã nhân viên</th>
              <th>Họ và tên nhân viên</th>
              <th>Phòng ban</th>
              <th>Chức danh</th>
              <th>Loại hợp đồng</th>
              <th>Ngày ký</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Mức lương thỏa thuận (VNĐ)</th>
              <th>Trạng thái</th>
              <th>Thời hạn còn lại</th>
            </tr>
          </thead>
          <tbody>
    `;

    displayedContracts.forEach((c, idx) => {
      const daysText = c.EndDate 
        ? (c.DaysRemaining < 0 ? `Đã hết hạn (${Math.abs(c.DaysRemaining)} ngày)` : `Còn ${c.DaysRemaining} ngày`) 
        : 'Vô thời hạn';
      const statusClass = c.Status === 'Hiệu lực' ? 'active' : (c.Status === 'Sắp hết hạn' ? 'urgent' : (c.Status === 'Chờ nhân viên ký' ? 'urgent' : 'expired'));

      html += `
        <tr>
          <td class="center">${idx + 1}</td>
          <td class="text center"><strong>${c.ContractNumber}</strong></td>
          <td class="text center">${c.EmployeeCode}</td>
          <td><strong>${c.EmployeeName}</strong></td>
          <td>${c.DepartmentName || 'Chưa gán'}</td>
          <td>${c.PositionName || 'Nhân viên'}</td>
          <td>${c.ContractType}</td>
          <td class="center">${c.SignDate || '-'}</td>
          <td class="center">${c.StartDate || '-'}</td>
          <td class="center">${c.EndDate || 'Không thời hạn'}</td>
          <td class="num">${Math.round(+c.AgreedSalary || 0).toLocaleString('vi-VN')} đ</td>
          <td class="center ${statusClass}">${c.Status}</td>
          <td class="center">${daysText}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', `Đã xuất ${displayedContracts.length} hợp đồng ra file Excel (.xls) thành công!`);
  };

  
  const loadEmployeeHistory = useCallback(async (empId) => {
    if (!empId) return;
    try {
      setLoadingHistory(true);
      const res = await LaborContractService.getEmployeeContractHistory(empId);
      setEmployeeHistoryData(res);
    } catch (err) {
      showToast('error', 'Lỗi tải lịch sử hợp đồng: ' + err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history' && historyEmpId) {
      loadEmployeeHistory(historyEmpId);
    }
  }, [activeTab, historyEmpId, loadEmployeeHistory]);

  
  const handleOpenHistoryForEmp = (empId) => {
    setHistoryEmpId(String(empId));
    setActiveTab('history');
  };

  
  const handleOpenCreateModal = (preselectedEmpId = '') => {
    setModalMode('create');
    const defaultEmp = preselectedEmpId || (employeesList[0]?.EmployeeId ? String(employeesList[0].EmployeeId) : '');
    const today = new Date().toISOString().slice(0, 10);
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    setCurrentContract({
      ContractId: null,
      ContractNumber: '',
      EmployeeId: defaultEmp,
      ContractType: 'Hợp đồng xác định thời hạn 1 năm',
      SignDate: today,
      StartDate: today,
      EndDate: oneYearLater.toISOString().slice(0, 10),
      AgreedSalary: 20000000,
      Status: 'Hiệu lực'
    });
    setIsModalOpen(true);
  };

  
  const handleOpenEditModal = (c) => {
    setModalMode('edit');
    setCurrentContract({
      ContractId: c.ContractId,
      ContractNumber: c.ContractNumber || '',
      EmployeeId: String(c.EmployeeId),
      ContractType: c.ContractType || 'Hợp đồng xác định thời hạn 1 năm',
      SignDate: c.SignDate || '',
      StartDate: c.StartDate || '',
      EndDate: c.EndDate || '',
      AgreedSalary: c.AgreedSalary || 0,
      Status: c.Status || 'Hiệu lực'
    });
    setIsModalOpen(true);
  };

  
  const handleOpenDetailModal = async (c) => {
    setSelectedContractDetail(c);
    setIsDetailModalOpen(true);
    try {
      setLoadingDetail(true);
      const detail = await LaborContractService.getContractById(c.ContractId);
      if (detail) {
        setSelectedContractDetail(detail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenRenewModal = (c) => {
    if (c.Status === 'Đã chấm dứt') {
      showToast('error', 'Hợp đồng này đã chấm dứt hiệu lực do nhân sự thôi việc, không thể thực hiện gia hạn!');
      return;
    }
    if (!c.EndDate || (c.ContractType && (c.ContractType.toLowerCase().includes('vô thời hạn') || c.ContractType.toLowerCase().includes('không xác định')))) {
      showToast('error', 'Hợp đồng vô thời hạn không có thời điểm kết thúc, không cần và không thể gia hạn thời gian!');
      return;
    }

    setRenewTarget(c);
    let startD = new Date().toISOString().slice(0, 10);
    let endD = '';
    if (c.EndDate) {
      const nextDay = new Date(c.EndDate);
      nextDay.setDate(nextDay.getDate() + 1);
      startD = nextDay.toISOString().slice(0, 10);
      const threeYears = new Date(nextDay);
      threeYears.setFullYear(threeYears.getFullYear() + 3);
      endD = threeYears.toISOString().slice(0, 10);
    }

    setRenewForm({
      contractNumber: '',
      contractType: 'Hợp đồng xác định thời hạn 3 năm',
      signDate: new Date().toISOString().slice(0, 10),
      startDate: startD,
      endDate: endD,
      agreedSalary: c.AgreedSalary || 25000000
    });
    setIsRenewModalOpen(true);
  };

  const handleOpenTerminateModal = (c) => {
    if (c.Status === 'Đã chấm dứt') {
      showToast('error', 'Hợp đồng này đã ở trạng thái chấm dứt từ trước!');
      return;
    }
    setTerminateTarget(c);
    setTerminateForm({
      terminationType: 'Thỏa thuận hai bên',
      terminateDate: new Date().toISOString().slice(0, 10),
      reason: 'Hai bên thỏa thuận chấm dứt hợp đồng lao động',
      decisionNumber: '',
      evaluationMeetingNumber: '',
      note: ''
    });
    setTerminateFiles({
      decisionFile: null,
      meetingFile: null
    });
    setIsTerminateModalOpen(true);
  };

  const handleConfirmTerminate = async (e) => {
    e.preventDefault();
    if (!terminateTarget) return;
    try {
      setTerminateSubmitting(true);
      let payload;
      if (terminateForm.terminationType === 'Doanh nghiệp cho thôi việc') {
        const fd = new FormData();
        fd.append('terminationType', terminateForm.terminationType);
        fd.append('terminateDate', terminateForm.terminateDate);
        fd.append('reason', terminateForm.reason);
        fd.append('decisionNumber', terminateForm.decisionNumber || '');
        fd.append('evaluationMeetingNumber', terminateForm.evaluationMeetingNumber || '');
        fd.append('note', terminateForm.note || '');
        if (terminateFiles.decisionFile) {
          fd.append('decisionFile', terminateFiles.decisionFile);
        }
        if (terminateFiles.meetingFile) {
          fd.append('meetingFile', terminateFiles.meetingFile);
        }
        payload = fd;
      } else {
        payload = terminateForm;
      }
      await LaborContractService.terminateContract(terminateTarget.ContractId, payload);
      showToast('success', `Đã chấm dứt hợp đồng số ${terminateTarget.ContractNumber} của nhân sự ${terminateTarget.EmployeeName}!`);
      setIsTerminateModalOpen(false);
      setTerminateTarget(null);
      if (isDetailModalOpen) {
        setIsDetailModalOpen(false);
      }
      await loadData();
    } catch (err) {
      showToast('error', 'Lỗi khi chấm dứt hợp đồng: ' + (err.message || 'Không thể thực hiện'));
    } finally {
      setTerminateSubmitting(false);
    }
  };

  const handleOpenResignationModal = (contract, action) => {
    setResignationTarget(contract);
    setResignationAction(action);
    setResignationNote('');
    setIsResignationModalOpen(true);
  };

  const handleConfirmResignation = async (e) => {
    e.preventDefault();
    if (!resignationTarget) return;
    try {
      setResignationSubmitting(true);
      const isApprove = resignationAction === 'approve';
      await LaborContractService.respondResignation(resignationTarget.ContractId, {
        approved: isApprove,
        hrNote: resignationNote
      });
      showToast('success', isApprove ? `Đã chấp thuận đơn xin thôi việc của nhân sự ${resignationTarget.EmployeeName}!` : `Đã từ chối đơn xin thôi việc.`);
      setIsResignationModalOpen(false);
      setResignationTarget(null);
      await loadData();
    } catch (err) {
      showToast('error', 'Lỗi khi xử lý đơn: ' + (err.message || 'Không thể thực hiện'));
    } finally {
      setResignationSubmitting(false);
    }
  };

  
  const handleSaveContract = async (e) => {
    e.preventDefault();
    if (!currentContract.EmployeeId) {
      showToast('error', 'Vui lòng chọn nhân viên áp dụng hợp đồng!');
      return;
    }

    try {
      const payload = {
        contractNumber: currentContract.ContractNumber.trim(),
        employeeId: parseInt(currentContract.EmployeeId, 10),
        contractType: currentContract.ContractType,
        signDate: currentContract.SignDate,
        startDate: currentContract.StartDate,
        endDate: currentContract.EndDate || null,
        agreedSalary: parseFloat(currentContract.AgreedSalary) || 0,
        status: currentContract.Status
      };

      if (modalMode === 'create') {
        await LaborContractService.createContract(payload);
        showToast('success', 'Tạo mới hợp đồng lao động thành công!');
      } else {
        await LaborContractService.updateContract(currentContract.ContractId, payload);
        showToast('success', 'Cập nhật hợp đồng lao động thành công!');
      }

      setIsModalOpen(false);
      loadData();
      if (activeTab === 'history' && historyEmpId) {
        loadEmployeeHistory(historyEmpId);
      }
    } catch (err) {
      showToast('error', err.message || 'Lỗi khi lưu hợp đồng!');
    }
  };

  
  const handleExecuteRenew = async (e) => {
    e.preventDefault();
    if (!renewTarget?.ContractId) return;

    try {
      await LaborContractService.renewContract(renewTarget.ContractId, renewForm);
      showToast('success', `Đã gia hạn và ký kết hợp đồng mới thành công cho ${renewTarget.EmployeeName}!`);
      setIsRenewModalOpen(false);
      loadData();
      if (activeTab === 'history' && historyEmpId) {
        loadEmployeeHistory(historyEmpId);
      }
    } catch (err) {
      showToast('error', err.message || 'Lỗi khi gia hạn hợp đồng!');
    }
  };

  
  const handleDeleteContract = async (c) => {
    if (!window.confirm(`Xác nhận xóa hợp đồng ${c.ContractNumber} của nhân sự "${c.EmployeeName}" khỏi CSDL?`)) {
      return;
    }
    try {
      await LaborContractService.deleteContract(c.ContractId);
      showToast('success', `Đã xóa hợp đồng ${c.ContractNumber} thành công!`);
      loadData();
      if (activeTab === 'history' && historyEmpId) {
        loadEmployeeHistory(historyEmpId);
      }
    } catch (err) {
      showToast('error', err.message || 'Lỗi khi xóa hợp đồng!');
    }
  };

  
  const renderStatusBadge = (c) => {
    const days = c.DaysRemaining;
    const cat = c.ExpirationCategory;

    if (c.TerminationStatus === 'Chờ HR duyệt') {
      return (
        <span className="lc-badge-urgent" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }} title="Nhân viên đã nộp đơn xin thôi việc">
          <AlertTriangle size={12} />
          <span>Chờ HR duyệt thôi việc</span>
        </span>
      );
    }

    if (c.TerminationStatus === 'Chờ nhân viên duyệt') {
      return (
        <span className="lc-badge-warning" style={{ background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }} title="Đang chờ nhân sự ký duyệt biên bản thỏa thuận">
          <Clock size={12} />
          <span>Chờ NV duyệt thôi việc</span>
        </span>
      );
    }

    if (c.Status === 'Chờ nhân viên ký' || c.Status === 'Chờ ký' || cat === 'PENDING_SIGN') {
      return (
        <span className="lc-badge-warning" style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
          <Clock size={12} />
          <span>Chờ nhân viên ký</span>
        </span>
      );
    }

    if (c.Status === 'Đã chấm dứt') {
      return (
        <span className="lc-badge-expired" style={{ background: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' }}>
          <Clock size={12} />
          <span>Đã chấm dứt</span>
        </span>
      );
    }

    if (c.Status === 'Hết hạn' || cat === 'EXPIRED') {
      return (
        <span className="lc-badge-expired">
          <Clock size={12} />
          <span>Hết hạn</span>
        </span>
      );
    }

    if (cat === 'EXPIRING_URGENT') {
      return (
        <span className="lc-badge-urgent" title={`Hợp đồng sẽ kết thúc vào ${c.EndDate}`}>
          <AlertCircle size={13} />
          <span>Khẩn cấp ({days} ngày)</span>
        </span>
      );
    }

    if (cat === 'EXPIRING_SOON') {
      return (
        <span className="lc-badge-warning" title={`Hợp đồng sẽ kết thúc vào ${c.EndDate}`}>
          <Clock size={12} />
          <span>Sắp hết hạn ({days} ngày)</span>
        </span>
      );
    }

    if (cat === 'PERMANENT') {
      return (
        <span className="lc-badge-active" style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
          <ShieldAlert size={12} />
          <span>Vô thời hạn</span>
        </span>
      );
    }

    return (
      <span className="lc-badge-active">
        <CheckCircle2 size={12} />
        <span>Hiệu lực</span>
      </span>
    );
  };

  
  const expiringContractsList = useMemo(() => {
    return contracts.filter(c => 
      c.ExpirationCategory === 'EXPIRING_URGENT' || 
      c.ExpirationCategory === 'EXPIRING_SOON' || 
      c.ExpirationCategory === 'EXPIRING_WARNING' ||
      c.Status === 'Sắp hết hạn'
    );
  }, [contracts]);

  return (
    <div className="lc-container">
      {}
      {toastInfo && (
        <div
          className={`badge ${toastInfo.type === 'success' ? 'b-green' : 'b-red'}`}
          style={{
            padding: '12px 18px',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '8px'
          }}
        >
          {toastInfo.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toastInfo.message}</span>
        </div>
      )}

      {}
      <div className="lc-header">
        <div className="lc-title">
          <h1>
            <FileText size={22} color="#0f766e" />
            <span>Quản lý Hợp đồng lao động & Cảnh báo hết hạn</span>
          </h1>
          <p>Theo dõi thời hạn, phân loại hợp đồng, tra cứu lịch sử ký kết và cảnh báo tự động từ CSDL</p>
        </div>

        <div className="lc-actions">
          <button className="btn" onClick={() => loadData()} title="Làm mới dữ liệu từ CSDL">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          
          {}
          <button className="btn" onClick={handleExportExcel} title="Xuất danh sách hợp đồng ra file Excel (.xls) có chia cột rõ ràng">
            <FileSpreadsheet size={16} color="#16a34a" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {}
          {selectedKpiFilter === 'EXPIRED' && (
            <div className="lc-active-filter-banner banner-expired">
              <span>
                <strong>⚠️ Đang xem danh mục:</strong> Hợp đồng Đã hết hạn / Đã chấm dứt / Đã tái ký ({displayedContracts.length} hợp đồng).
              </span>
              <button type="button" onClick={() => setSelectedKpiFilter('ACTIVE_DEFAULT')}>
                Quay lại danh sách hợp đồng đang áp dụng
              </button>
            </div>
          )}

          {selectedKpiFilter === 'ACTIVE' && (
            <div className="lc-active-filter-banner banner-active">
              <span>
                <strong>✅ Đang xem danh mục:</strong> Các hợp đồng đang hiệu lực ({displayedContracts.length} hợp đồng).
              </span>
              <button type="button" onClick={() => setSelectedKpiFilter('ACTIVE_DEFAULT')}>
                Xem tất cả hợp đồng đang áp dụng
              </button>
            </div>
          )}

          {selectedKpiFilter === 'EXPIRING' && (
            <div className="lc-active-filter-banner banner-expiring">
              <span>
                <strong>🕒 Đang xem danh mục:</strong> Các hợp đồng sắp hết hạn trong 30 ngày ({displayedContracts.length} hợp đồng).
              </span>
              <button type="button" onClick={() => setSelectedKpiFilter('ACTIVE_DEFAULT')}>
                Xem tất cả hợp đồng đang áp dụng
              </button>
            </div>
          )}

          {selectedKpiFilter === 'PERMANENT' && (
            <div className="lc-active-filter-banner banner-permanent">
              <span>
                <strong>🛡️ Đang xem danh mục:</strong> Các hợp đồng vô thời hạn ({displayedContracts.length} hợp đồng).
              </span>
              <button type="button" onClick={() => setSelectedKpiFilter('ACTIVE_DEFAULT')}>
                Xem tất cả hợp đồng đang áp dụng
              </button>
            </div>
          )}

          {}
          <div className="lc-filter-bar">
            {}
            <div className="lc-search-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Tìm số hợp đồng, họ tên, mã nhân sự, phòng ban..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="lc-search-clear"
                  onClick={() => setSearchTerm('')}
                  title="Xóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="lc-filter-group">
              <select
                className="lc-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">-- Tất cả trạng thái --</option>
                <option value="Hiệu lực">Hiệu lực</option>
                <option value="Chờ nhân viên ký">Chờ nhân viên ký</option>
                <option value="Sắp hết hạn">Sắp hết hạn</option>
                <option value="Hết hạn">Hết hạn</option>
                <option value="Đã chấm dứt">Đã chấm dứt</option>
              </select>

              <select
                className="lc-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">-- Tất cả loại hợp đồng --</option>
                <option value="Hợp đồng thử việc">Hợp đồng thử việc</option>
                <option value="Hợp đồng xác định thời hạn 1 năm">Hợp đồng 1 năm</option>
                <option value="Hợp đồng xác định thời hạn 2 năm">Hợp đồng 2 năm</option>
                <option value="Hợp đồng xác định thời hạn 3 năm">Hợp đồng 3 năm</option>
                <option value="Hợp đồng vô thời hạn">Hợp đồng vô thời hạn</option>
              </select>

              {(statusFilter || typeFilter || searchTerm) && (
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '6px 10px', fontSize: '12.5px' }}
                  onClick={() => {
                    setStatusFilter('');
                    setTypeFilter('');
                    setSearchTerm('');
                    setSelectedKpiFilter('ACTIVE_DEFAULT');
                  }}
                >
                  Đặt lại lọc
                </button>
              )}
            </div>
          </div>

          {}
          <div className="lc-table-card">
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>SỐ HỢP ĐỒNG</th>
                    <th>NHÂN VIÊN</th>
                    <th>LOẠI HỢP ĐỒNG</th>
                    <th>NGÀY BẮT ĐẦU</th>
                    <th>NGÀY KẾT THÚC</th>
                    <th className="r">LƯƠNG HỢP ĐỒNG</th>
                    <th>TRẠNG THÁI & CẢNH BÁO</th>
                    <th className="act">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <RefreshCw size={18} className="spin" color="#0f766e" />
                          <span>Đang tải danh sách hợp đồng từ CSDL SQL Server...</span>
                        </div>
                      </td>
                    </tr>
                  ) : displayedContracts.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                        <FileText size={36} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
                        <p>Không tìm thấy hợp đồng lao động nào phù hợp với điều kiện lọc.</p>
                      </td>
                    </tr>
                  ) : (
                    displayedContracts.map((c) => (
                      <tr
                        key={c.ContractId}
                        className="lc-table-row"
                        onClick={() => handleOpenActionModal(c)}
                      >
                        <td>
                          <code style={{ fontWeight: 700, color: '#0f766e', fontSize: '13px' }}>
                            {c.ContractNumber}
                          </code>
                        </td>
                        <td>
                          <div className="who">
                            {c.EmployeeAvatar ? (
                              <img src={c.EmployeeAvatar} alt={c.EmployeeName} className="avatar" style={{ width: '32px', height: '32px' }} />
                            ) : (
                              <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                                {c.EmployeeName ? c.EmployeeName.split(' ').slice(-1)[0][0] : 'N'}
                              </div>
                            )}
                            <div>
                              <b style={{ color: '#0f172a' }}>{c.EmployeeName}</b>
                              <small style={{ color: '#64748b' }}>
                                {c.EmployeeCode} · {c.DepartmentName || 'Chưa gán phòng'}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, color: '#1e293b' }}>{c.ContractType}</span>
                        </td>
                        <td>{c.StartDate || '-'}</td>
                        <td>
                          {c.EndDate ? (
                            <span style={{ fontWeight: 500 }}>{c.EndDate}</span>
                          ) : (
                            <span style={{ color: '#64748b', fontStyle: 'italic' }}>Không thời hạn</span>
                          )}
                        </td>
                        <td className="r">
                          <strong style={{ color: '#0f766e' }}>{formatVND(c.AgreedSalary)}</strong>
                        </td>
                        <td>{renderStatusBadge(c)}</td>
                        <td className="act" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="lc-btn-select-row"
                            onClick={() => handleOpenActionModal(c)}
                            title="Chọn chức năng thao tác cho hợp đồng này"
                          >
                            <span>Thao tác</span>
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {isActionModalOpen && selectedActionContract && (
        <div className="lc-modal-overlay" onClick={handleCloseActionModal}>
          <div className="lc-action-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="lc-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#0f766e" />
                <div>
                  <h2 style={{ fontSize: '16px', margin: 0, color: '#0f172a' }}>
                    Tùy chọn chức năng hợp đồng: {selectedActionContract.ContractNumber}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {selectedActionContract.EmployeeName} ({selectedActionContract.EmployeeCode}) · {selectedActionContract.DepartmentName || 'Chưa gán phòng'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="lc-modal-close-btn"
                onClick={handleCloseActionModal}
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="lc-modal-body" style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
              <div className="lc-action-modal-summary">
                <div className="lc-summary-item">
                  <span className="lc-summary-label">Số hợp đồng:</span>
                  <strong className="lc-summary-val" style={{ color: '#0f766e' }}>{selectedActionContract.ContractNumber}</strong>
                </div>
                <div className="lc-summary-item">
                  <span className="lc-summary-label">Nhân viên:</span>
                  <strong className="lc-summary-val">{selectedActionContract.EmployeeName}</strong>
                </div>
                <div className="lc-summary-item">
                  <span className="lc-summary-label">Lương thỏa thuận:</span>
                  <strong className="lc-summary-val" style={{ color: '#0f766e' }}>{formatVND(selectedActionContract.AgreedSalary)}</strong>
                </div>
                <div className="lc-summary-item">
                  <span className="lc-summary-label">Loại hợp đồng:</span>
                  <span className="lc-summary-val">{selectedActionContract.ContractType}</span>
                </div>
              </div>

              <div className="lc-action-grid">
                <div
                  className="lc-action-card"
                  onClick={() => {
                    const contract = selectedActionContract;
                    handleCloseActionModal();
                    handleOpenDetailModal(contract);
                  }}
                >
                  <div className="lc-action-card-icon icon-teal">
                    <Eye size={20} />
                  </div>
                  <div className="lc-action-card-text">
                    <span className="lc-action-card-title">Xem chi tiết hợp đồng</span>
                    <span className="lc-action-card-desc">Xem toàn bộ thông tin chi tiết, điều khoản và mức lương</span>
                  </div>
                </div>

                <div
                  className="lc-action-card"
                  onClick={() => {
                    const empId = selectedActionContract.EmployeeId;
                    handleCloseActionModal();
                    handleOpenHistoryForEmp(empId);
                  }}
                >
                  <div className="lc-action-card-icon icon-indigo">
                    <History size={20} />
                  </div>
                  <div className="lc-action-card-text">
                    <span className="lc-action-card-title">Tra cứu lịch sử hợp đồng</span>
                    <span className="lc-action-card-desc">Xem tiến trình các hợp đồng đã ký của nhân viên này</span>
                  </div>
                </div>

                <div
                  className="lc-action-card warning"
                  onClick={() => {
                    const contract = selectedActionContract;
                    handleCloseActionModal();
                    handleOpenRenewModal(contract);
                  }}
                >
                  <div className="lc-action-card-icon icon-amber">
                    <Award size={20} />
                  </div>
                  <div className="lc-action-card-text">
                    <span className="lc-action-card-title">Gia hạn / Ký tiếp hợp đồng</span>
                    <span className="lc-action-card-desc">Tạo phụ lục hoặc ký hợp đồng mới kế thừa dữ liệu</span>
                  </div>
                </div>

                {selectedActionContract.TerminationStatus === 'Chờ HR duyệt' ? (
                  <>
                    <div
                      className="lc-action-card"
                      onClick={() => {
                        const contract = selectedActionContract;
                        handleCloseActionModal();
                        handleOpenResignationModal(contract, 'approve');
                      }}
                    >
                      <div className="lc-action-card-icon icon-green">
                        <CheckCircle2 size={20} />
                      </div>
                      <div className="lc-action-card-text">
                        <span className="lc-action-card-title" style={{ color: '#15803d' }}>Duyệt đơn thôi việc</span>
                        <span className="lc-action-card-desc">Chấp thuận nguyện vọng xin thôi việc của nhân viên</span>
                      </div>
                    </div>

                    <div
                      className="lc-action-card danger"
                      onClick={() => {
                        const contract = selectedActionContract;
                        handleCloseActionModal();
                        handleOpenResignationModal(contract, 'reject');
                      }}
                    >
                      <div className="lc-action-card-icon icon-red">
                        <XCircle size={20} />
                      </div>
                      <div className="lc-action-card-text">
                        <span className="lc-action-card-title" style={{ color: '#dc2626' }}>Từ chối đơn thôi việc</span>
                        <span className="lc-action-card-desc">Không phê duyệt đơn thôi việc và tiếp tục công tác</span>
                      </div>
                    </div>
                  </>
                ) : selectedActionContract.Status !== 'Đã chấm dứt' && (
                  <div
                    className="lc-action-card danger"
                    onClick={() => {
                      const contract = selectedActionContract;
                      handleCloseActionModal();
                      handleOpenTerminateModal(contract);
                    }}
                  >
                    <div className="lc-action-card-icon icon-red">
                      <XCircle size={20} />
                    </div>
                    <div className="lc-action-card-text">
                      <span className="lc-action-card-title" style={{ color: '#dc2626' }}>Chấm dứt hợp đồng</span>
                      <span className="lc-action-card-desc">Thỏa thuận 2 bên hoặc công ty cho thôi việc / sa thải</span>
                    </div>
                  </div>
                )}

                <div
                  className="lc-action-card"
                  onClick={() => {
                    const contract = selectedActionContract;
                    handleCloseActionModal();
                    handleOpenEditModal(contract);
                  }}
                >
                  <div className="lc-action-card-icon icon-blue">
                    <Edit2 size={20} />
                  </div>
                  <div className="lc-action-card-text">
                    <span className="lc-action-card-title">Chỉnh sửa hợp đồng</span>
                    <span className="lc-action-card-desc">Cập nhật số hợp đồng, loại hợp đồng, lương, ngày ký</span>
                  </div>
                </div>

                <div
                  className="lc-action-card danger"
                  onClick={() => {
                    const contract = selectedActionContract;
                    handleCloseActionModal();
                    handleDeleteContract(contract);
                  }}
                >
                  <div className="lc-action-card-icon icon-red">
                    <Trash2 size={20} />
                  </div>
                  <div className="lc-action-card-text">
                    <span className="lc-action-card-title" style={{ color: '#b91c1c' }}>Xóa hợp đồng</span>
                    <span className="lc-action-card-desc">Xóa vĩnh viễn dữ liệu hợp đồng này khỏi hệ thống</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lc-modal-footer">
              <button
                type="button"
                className="btn"
                onClick={handleCloseActionModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="lc-modal-overlay">
          <div className="lc-modal-content">
            <div className="lc-modal-header">
              <h2>
                <FileText size={20} color="#0f766e" />
                <span>
                  {modalMode === 'create' ? 'Tạo mới hợp đồng lao động' : `Chỉnh sửa hợp đồng: ${currentContract.ContractNumber}`}
                </span>
              </h2>
              <button
                type="button"
                className="lc-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveContract}>
              <div className="lc-modal-body">
                {}
                <div className="lc-form-group">
                  <label>Nhân viên áp dụng <span className="req">*</span></label>
                  <select
                    className="lc-form-select"
                    value={currentContract.EmployeeId}
                    onChange={(e) => setCurrentContract({ ...currentContract, EmployeeId: e.target.value })}
                    required
                    disabled={modalMode === 'edit'}
                  >
                    <option value="">-- Chọn nhân viên từ CSDL --</option>
                    {employeesList.map((emp) => (
                      <option key={emp.EmployeeId} value={emp.EmployeeId}>
                        {emp.FullName} - Mã: {emp.EmployeeCode} ({emp.DepartmentName || 'Chưa gán phòng'})
                      </option>
                    ))}
                  </select>
                </div>

                {}
                <div className="lc-form-row">
                  <div className="lc-form-group">
                    <label>Số hợp đồng</label>
                    <input
                      type="text"
                      className="lc-form-input"
                      placeholder="Để trống để tự tạo (VD: HD-2026-008)"
                      value={currentContract.ContractNumber}
                      onChange={(e) => setCurrentContract({ ...currentContract, ContractNumber: e.target.value })}
                    />
                  </div>

                  <div className="lc-form-group">
                    <label>Loại hợp đồng <span className="req">*</span></label>
                    <select
                      className="lc-form-select"
                      value={currentContract.ContractType}
                      onChange={(e) => setCurrentContract({ ...currentContract, ContractType: e.target.value })}
                      required
                    >
                      <option value="Hợp đồng thử việc">Hợp đồng thử việc (1-2 tháng)</option>
                      <option value="Hợp đồng xác định thời hạn 1 năm">Hợp đồng xác định thời hạn 1 năm</option>
                      <option value="Hợp đồng xác định thời hạn 2 năm">Hợp đồng xác định thời hạn 2 năm</option>
                      <option value="Hợp đồng xác định thời hạn 3 năm">Hợp đồng xác định thời hạn 3 năm</option>
                      <option value="Hợp đồng vô thời hạn">Hợp đồng không xác định thời hạn</option>
                      <option value="Hợp đồng học việc">Hợp đồng học việc / thực tập sinh</option>
                    </select>
                  </div>
                </div>

                {}
                <div className="lc-form-row">
                  <div className="lc-form-group">
                    <label>Ngày ký hợp đồng</label>
                    <input
                      type="date"
                      className="lc-form-input"
                      value={currentContract.SignDate}
                      onChange={(e) => setCurrentContract({ ...currentContract, SignDate: e.target.value })}
                    />
                  </div>

                  <div className="lc-form-group">
                    <label>Ngày bắt đầu hiệu lực <span className="req">*</span></label>
                    <input
                      type="date"
                      className="lc-form-input"
                      value={currentContract.StartDate}
                      onChange={(e) => setCurrentContract({ ...currentContract, StartDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {}
                <div className="lc-form-row">
                  <div className="lc-form-group">
                    <label>Ngày kết thúc (Để trống nếu vô thời hạn)</label>
                    <input
                      type="date"
                      className="lc-form-input"
                      value={currentContract.EndDate}
                      onChange={(e) => setCurrentContract({ ...currentContract, EndDate: e.target.value })}
                    />
                  </div>

                  <div className="lc-form-group">
                    <label>Mức lương thỏa thuận (VNĐ) <span className="req">*</span></label>
                    <input
                      type="number"
                      min="0"
                      step="500000"
                      className="lc-form-input"
                      placeholder="VD: 25000000"
                      value={currentContract.AgreedSalary}
                      onChange={(e) => setCurrentContract({ ...currentContract, AgreedSalary: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {}
                <div className="lc-form-group">
                  <label>Trạng thái hợp đồng</label>
                  <select
                    className="lc-form-select"
                    value={currentContract.Status}
                    onChange={(e) => setCurrentContract({ ...currentContract, Status: e.target.value })}
                  >
                    <option value="Hiệu lực">Hiệu lực</option>
                    <option value="Chờ nhân viên ký">Chờ nhân viên ký</option>
                    <option value="Sắp hết hạn">Sắp hết hạn</option>
                    <option value="Hết hạn">Hết hạn</option>
                    <option value="Đã chấm dứt">Đã chấm dứt</option>
                  </select>
                </div>
              </div>

              <div className="lc-modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn pri">
                  {modalMode === 'create' ? 'Tạo mới hợp đồng' : 'Cập nhật hợp đồng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isRenewModalOpen && renewTarget && (
        <div className="lc-modal-overlay">
          <div className="lc-modal-content">
            <div className="lc-modal-header">
              <h2>
                <Award size={20} color="#d97706" />
                <span>Gia hạn & Ký tiếp hợp đồng: {renewTarget.EmployeeName}</span>
              </h2>
              <button
                type="button"
                className="lc-modal-close-btn"
                onClick={() => setIsRenewModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteRenew}>
              <div className="lc-modal-body">
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                  Hợp đồng cũ: <strong>{renewTarget.ContractNumber}</strong> ({renewTarget.ContractType}) - Hết hạn vào: <strong>{renewTarget.EndDate}</strong>
                </div>

                <div className="lc-form-row">
                  <div className="lc-form-group">
                    <label>Số hợp đồng mới</label>
                    <input
                      type="text"
                      className="lc-form-input"
                      placeholder="Để trống để tự sinh mã mới"
                      value={renewForm.contractNumber}
                      onChange={(e) => setRenewForm({ ...renewForm, contractNumber: e.target.value })}
                    />
                  </div>

                  <div className="lc-form-group">
                    <label>Loại hợp đồng tiếp theo <span className="req">*</span></label>
                    <select
                      className="lc-form-select"
                      value={renewForm.contractType}
                      onChange={(e) => setRenewForm({ ...renewForm, contractType: e.target.value })}
                      required
                    >
                      <option value="Hợp đồng xác định thời hạn 1 năm">Hợp đồng xác định thời hạn 1 năm</option>
                      <option value="Hợp đồng xác định thời hạn 2 năm">Hợp đồng xác định thời hạn 2 năm</option>
                      <option value="Hợp đồng xác định thời hạn 3 năm">Hợp đồng xác định thời hạn 3 năm</option>
                      <option value="Hợp đồng vô thời hạn">Hợp đồng không xác định thời hạn (Dài hạn)</option>
                    </select>
                  </div>
                </div>

                <div className="lc-form-row">
                  <div className="lc-form-group">
                    <label>Ngày bắt đầu hợp đồng mới <span className="req">*</span></label>
                    <input
                      type="date"
                      className="lc-form-input"
                      value={renewForm.startDate}
                      onChange={(e) => setRenewForm({ ...renewForm, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="lc-form-group">
                    <label>Ngày kết thúc mới</label>
                    <input
                      type="date"
                      className="lc-form-input"
                      value={renewForm.endDate}
                      onChange={(e) => setRenewForm({ ...renewForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="lc-form-group">
                  <label>Mức lương mới (VNĐ) <span className="req">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    className="lc-form-input"
                    value={renewForm.agreedSalary}
                    onChange={(e) => setRenewForm({ ...renewForm, agreedSalary: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="lc-modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsRenewModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn pri">
                  Xác nhận ký kết & Kích hoạt giai đoạn mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDetailModalOpen && selectedContractDetail && (
        <div className="lc-modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="lc-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', maxHeight: '92vh' }}>
            <div className="lc-modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <h2>
                <FileText size={18} color="#0f766e" />
                <span>Chi tiết Hợp đồng Lao động: {selectedContractDetail.ContractNumber}</span>
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '5px 10px', fontSize: '12px' }}
                  onClick={() => window.print()}
                  title="In hợp đồng lao động"
                >
                  <Printer size={14} />
                  <span>In hợp đồng</span>
                </button>
                <button type="button" className="lc-modal-close-btn" onClick={() => setIsDetailModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="lc-modal-body" style={{ padding: '24px 28px', background: '#fff', overflowY: 'auto', flex: 1 }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f766e', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#0f172a' }}>
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div style={{ width: '120px', height: '1px', background: '#94a3b8', margin: '6px auto 14px' }}></div>
                <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#042f2e', margin: '4px 0', textTransform: 'uppercase' }}>
                  HỢP ĐỒNG LAO ĐỘNG
                </h1>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                  Số hợp đồng: <strong style={{ color: '#0f766e' }}>{selectedContractDetail.ContractNumber}</strong> · Ngày lập: {selectedContractDetail.SignDate || selectedContractDetail.StartDate || '---'}
                </div>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {renderStatusBadge(selectedContractDetail)}
                  <span className="badge b-p" style={{ fontSize: '12px', padding: '3px 10px' }}>
                    {selectedContractDetail.ContractType}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f766e', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase' }}>
                    <Building size={15} />
                    <span>Bên A: Người sử dụng lao động</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#334155' }}>
                    <div><strong>Đơn vị:</strong> ENTERPRISE HRM VIỆT NAM</div>
                    <div><strong>Đại diện:</strong> Ban Tổng Giám Đốc & Khối Quản trị Nhân sự</div>
                    <div><strong>Địa chỉ:</strong> Trụ sở Công nghệ cao, TP. Hà Nội / TP. Hồ Chí Minh</div>
                    <div><strong>Điện thoại:</strong> (+84) 024 3888 9999</div>
                    <div><strong>Lĩnh vực:</strong> Công nghệ thông tin & Quản trị Doanh nghiệp</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f766e', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase' }}>
                    <User size={15} />
                    <span>Bên B: Người lao động</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#334155' }}>
                    <div><strong>Họ và tên:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#0f172a' }}>{selectedContractDetail.EmployeeName}</span></div>
                    <div><strong>Mã nhân viên:</strong> <code>{selectedContractDetail.EmployeeCode}</code> · Giới tính: {selectedContractDetail.EmployeeGender || 'Nam'}</div>
                    <div><strong>CCCD / CMND:</strong> {selectedContractDetail.EmployeeIdCard || 'Đã đối soát'}</div>
                    <div><strong>Số điện thoại:</strong> {selectedContractDetail.EmployeePhone || 'Theo hồ sơ'}</div>
                    <div><strong>Email liên hệ:</strong> {selectedContractDetail.EmployeeEmail || 'Theo hồ sơ'}</div>
                    <div><strong>Địa chỉ:</strong> {selectedContractDetail.EmployeeAddress || 'Theo hồ sơ nhân sự'}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, color: '#166534', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={15} />
                  <span>Điều khoản công tác & Chế độ đãi ngộ</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '12.5px', color: '#1e293b' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Phòng ban trực thuộc:</span>
                    <strong>{selectedContractDetail.DepartmentName || 'Khối Chuyên môn'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Chức danh / Vị trí:</span>
                    <strong>{selectedContractDetail.PositionName || 'Nhân sự chính thức'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Ngày bắt đầu hiệu lực:</span>
                    <strong>{selectedContractDetail.StartDate || '---'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Ngày kết thúc hiệu lực:</span>
                    <strong style={{ color: selectedContractDetail.EndDate ? '#dc2626' : '#0369a1' }}>
                      {selectedContractDetail.EndDate || 'Hợp đồng không thời hạn'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Mức lương thỏa thuận (Gross):</span>
                    <strong style={{ fontSize: '15px', color: '#0f766e' }}>
                      {formatVND(selectedContractDetail.AgreedSalary)} / tháng
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Tài khoản nhận lương:</span>
                    <span>{selectedContractDetail.EmployeeBankAccount ? `${selectedContractDetail.EmployeeBankAccount} (${selectedContractDetail.EmployeeBankName || ''})` : 'Tài khoản công ty cấp'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>ĐẠI DIỆN BÊN A</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>(Đã ký & đóng dấu điện tử)</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0f766e', background: '#ccfbf1', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                    <CheckCircle2 size={14} />
                    <span>Doanh nghiệp ENTERPRISE VN</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>NGƯỜI LAO ĐỘNG (BÊN B)</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>(Ký và ghi rõ họ tên)</div>
                  {selectedContractDetail.Status === 'Chờ nhân viên ký' ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#b45309', background: '#fef3c7', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                      <Clock size={14} />
                      <span>Chờ nhân viên đăng nhập ký điện tử</span>
                    </div>
                  ) : selectedContractDetail.Status === 'Đã chấm dứt' ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                      <XCircle size={14} />
                      <span>Hợp đồng đã chấm dứt hiệu lực</span>
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#16a34a', background: '#dcfce7', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                      <FileCheck size={14} />
                      <span>Đã ký điện tử: {selectedContractDetail.EmployeeName}</span>
                    </div>
                  )}
                </div>
              </div>

              {(selectedContractDetail.TerminationDecisionFileUrl || selectedContractDetail.TerminationMeetingFileUrl) && (
                <div style={{ marginTop: '20px', padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} color="#dc2626" />
                    <span>Hồ sơ & Biên bản pháp lý chấm dứt hợp đồng đã lưu trữ:</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {selectedContractDetail.TerminationDecisionFileUrl && (
                      <a
                        href={`http://localhost:5000${selectedContractDetail.TerminationDecisionFileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{ fontSize: '12px', padding: '6px 14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#dc2626', borderColor: '#fca5a5', background: '#fff' }}
                      >
                        <FileText size={14} />
                        <span>Xem File Quyết định thôi việc</span>
                      </a>
                    )}
                    {selectedContractDetail.TerminationMeetingFileUrl && (
                      <a
                        href={`http://localhost:5000${selectedContractDetail.TerminationMeetingFileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{ fontSize: '12px', padding: '6px 14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0f766e', borderColor: '#99f6e4', background: '#fff' }}
                      >
                        <FileCheck size={14} />
                        <span>Xem File Biên bản họp kỷ luật</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="lc-modal-footer">
              {selectedContractDetail.Status !== 'Đã chấm dứt' && (
                <button
                  type="button"
                  className="btn"
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                  onClick={() => handleOpenTerminateModal(selectedContractDetail)}
                >
                  <XCircle size={14} />
                  <span>Chấm dứt hợp đồng</span>
                </button>
              )}
              {selectedContractDetail.EndDate && selectedContractDetail.Status !== 'Đã chấm dứt' && (
                <button
                  type="button"
                  className="btn pri"
                  onClick={() => {
                    handleOpenRenewModal(selectedContractDetail);
                  }}
                >
                  <Award size={14} />
                  <span>Gia hạn hợp đồng</span>
                </button>
              )}
              <button type="button" className="btn" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {isTerminateModalOpen && terminateTarget && (
        <div className="lc-modal-overlay" onClick={() => !terminateSubmitting && setIsTerminateModalOpen(false)}>
          <div className="lc-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="lc-modal-header" style={{ borderBottomColor: '#fee2e2' }}>
              <h2 style={{ color: '#dc2626' }}>
                <XCircle size={18} color="#dc2626" />
                <span>Chấm dứt Hợp đồng: {terminateTarget.ContractNumber}</span>
              </h2>
              {!terminateSubmitting && (
                <button type="button" className="lc-modal-close-btn" onClick={() => setIsTerminateModalOpen(false)}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleConfirmTerminate} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="lc-modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="lc-form-group">
                  <label>Hình thức chấm dứt hợp đồng: <span className="req">*</span></label>
                  <select
                    className="lc-form-select"
                    required
                    value={terminateForm.terminationType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTerminateForm({
                        ...terminateForm,
                        terminationType: val,
                        reason: val === 'Doanh nghiệp cho thôi việc' ? 'Doanh nghiệp đơn phương chấm dứt hợp đồng lao động' : 'Hai bên thỏa thuận chấm dứt hợp đồng lao động'
                      });
                    }}
                  >
                    <option value="Thỏa thuận hai bên">Thỏa thuận hai bên</option>
                    <option value="Doanh nghiệp cho thôi việc">Doanh nghiệp cho thôi việc / Sa thải</option>
                  </select>
                </div>

                <div className="lc-form-group">
                  <label>Ngày chấm dứt hiệu lực (Ngày làm việc cuối cùng): <span className="req">*</span></label>
                  <input
                    type="date"
                    className="lc-form-input"
                    required
                    value={terminateForm.terminateDate}
                    onChange={(e) => setTerminateForm({ ...terminateForm, terminateDate: e.target.value })}
                  />
                </div>

                {terminateForm.terminationType === 'Doanh nghiệp cho thôi việc' && (
                  <>
                    <div className="lc-form-row">
                      <div className="lc-form-group">
                        <label>Số quyết định sa thải / thôi việc: <span className="req">*</span></label>
                        <input
                          type="text"
                          className="lc-form-input"
                          required
                          placeholder="VD: QĐ-2026/08-KL"
                          value={terminateForm.decisionNumber}
                          onChange={(e) => setTerminateForm({ ...terminateForm, decisionNumber: e.target.value })}
                        />
                      </div>
                      <div className="lc-form-group">
                        <label>Số biên bản họp kỷ luật / đánh giá: <span className="req">*</span></label>
                        <input
                          type="text"
                          className="lc-form-input"
                          required
                          placeholder="VD: BB-2026/08-HĐKL"
                          value={terminateForm.evaluationMeetingNumber}
                          onChange={(e) => setTerminateForm({ ...terminateForm, evaluationMeetingNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="lc-form-row">
                      <div className="lc-form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} color="#dc2626" />
                          <span>File Quyết định sa thải (PDF):</span>
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          className="lc-form-input"
                          onChange={(e) => setTerminateFiles({ ...terminateFiles, decisionFile: e.target.files[0] })}
                        />
                      </div>
                      <div className="lc-form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileCheck size={14} color="#dc2626" />
                          <span>File Biên bản họp kỷ luật (PDF):</span>
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          className="lc-form-input"
                          onChange={(e) => setTerminateFiles({ ...terminateFiles, meetingFile: e.target.files[0] })}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="lc-form-group">
                  <label>Căn cứ / Lý do cụ thể: <span className="req">*</span></label>
                  <input
                    type="text"
                    className="lc-form-input"
                    required
                    value={terminateForm.reason}
                    onChange={(e) => setTerminateForm({ ...terminateForm, reason: e.target.value })}
                  />
                </div>

                <div className="lc-form-group">
                  <label>Ghi chú bàn giao & Quyết toán:</label>
                  <textarea
                    className="lc-form-textarea"
                    rows={3}
                    placeholder="Ghi chú về bàn giao trang thiết bị, tài liệu, chốt công nợ..."
                    value={terminateForm.note}
                    onChange={(e) => setTerminateForm({ ...terminateForm, note: e.target.value })}
                  />
                </div>
              </div>

              <div className="lc-modal-footer">
                <button type="button" className="btn" disabled={terminateSubmitting} onClick={() => setIsTerminateModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={terminateSubmitting}
                  style={{
                    background: terminateForm.terminationType === 'Doanh nghiệp cho thôi việc' ? '#dc2626' : '#0f766e',
                    color: '#fff',
                    borderColor: terminateForm.terminationType === 'Doanh nghiệp cho thôi việc' ? '#b91c1c' : '#0d5d56'
                  }}
                >
                  {terminateSubmitting
                    ? 'Đang xử lý...'
                    : terminateForm.terminationType === 'Doanh nghiệp cho thôi việc'
                    ? 'Ban hành quyết định sa thải & Thu hồi tài khoản'
                    : 'Gửi đề xuất thỏa thuận sang nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isResignationModalOpen && resignationTarget && (
        <div className="lc-modal-overlay" onClick={() => !resignationSubmitting && setIsResignationModalOpen(false)}>
          <div className="lc-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="lc-modal-header" style={{ borderBottomColor: resignationAction === 'approve' ? '#bbf7d0' : '#fecaca' }}>
              <h2 style={{ color: resignationAction === 'approve' ? '#166534' : '#dc2626' }}>
                <FileCheck size={18} />
                <span>{resignationAction === 'approve' ? 'Duyệt đơn xin thôi việc' : 'Từ chối đơn xin thôi việc'}</span>
              </h2>
              {!resignationSubmitting && (
                <button type="button" className="lc-modal-close-btn" onClick={() => setIsResignationModalOpen(false)}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleConfirmResignation} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="lc-modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <div><strong>Nhân sự nộp đơn:</strong> {resignationTarget.EmployeeName} ({resignationTarget.EmployeeCode})</div>
                  <div><strong>Hợp đồng:</strong> {resignationTarget.ContractNumber} ({resignationTarget.ContractType})</div>
                  <div><strong>Ngày nghỉ mong muốn:</strong> <strong style={{ color: '#0f766e' }}>{resignationTarget.TerminationDate}</strong></div>
                  <div><strong>Lý do của nhân viên:</strong> {resignationTarget.TerminationReason}</div>
                  {resignationTarget.TerminationNote && (
                    <div><strong>Lời nhắn bàn giao:</strong> {resignationTarget.TerminationNote}</div>
                  )}
                </div>

                <div className="lc-form-group">
                  <label>Ghi chú phản hồi của phòng Nhân sự:</label>
                  <textarea
                    className="lc-form-textarea"
                    rows={3}
                    placeholder="Ý kiến phê duyệt, kế hoạch bàn giao tài sản..."
                    value={resignationNote}
                    onChange={(e) => setResignationNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="lc-modal-footer">
                <button type="button" className="btn" disabled={resignationSubmitting} onClick={() => setIsResignationModalOpen(false)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={resignationSubmitting}
                  style={{
                    background: resignationAction === 'approve' ? '#16a34a' : '#dc2626',
                    color: '#fff',
                    borderColor: resignationAction === 'approve' ? '#15803d' : '#b91c1c'
                  }}
                >
                  {resignationSubmitting ? 'Đang lưu...' : resignationAction === 'approve' ? 'Xác nhận chấp thuận đơn' : 'Xác nhận từ chối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
