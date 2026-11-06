import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText, Search, Plus, FileSpreadsheet, RefreshCw, Eye, Edit2, Trash2,
  Calendar, DollarSign, CheckCircle2, Clock, AlertTriangle,
  User, ArrowRight, History, AlertCircle, ShieldAlert, Award, ChevronRight, X
} from 'lucide-react';
import LaborContractService from '../../../../services/LaborContractService';
import '../../../../styles/roles/hr/LaborContract.css';

export default function LaborContractManagement({
  employees: propEmployees = [],
  onViewProfile,
  onNavigate
}) {
  // Dữ liệu hợp đồng, thống kê & nhân viên từ CSDL
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

  // Tab chế độ xem: 'list' (Danh sách), 'expiring' (Cảnh báo hết hạn), 'history' (Tra cứu lịch sử nhân viên)
  const [activeTab, setActiveTab] = useState('list');

  // Lọc theo thẻ KPI (Yêu cầu 1 & 5)
  // 'ACTIVE_DEFAULT': Mặc định (hiện hợp đồng đang áp dụng, ẨN hợp đồng đã hết hạn / đã chấm dứt / đã tái ký)
  // 'ACTIVE': Chỉ hợp đồng đang hiệu lực
  // 'EXPIRING': Chỉ hợp đồng sắp hết hạn trong 30 ngày
  // 'EXPIRED': CHỈ KHI BẤM VÀO CARD "HẾT HẠN / ĐÃ CHẤM DỨT" MỚI HIỆN RA
  // 'PERMANENT': Hợp đồng vô thời hạn
  // 'ALL': Xem tất cả hợp đồng đang quản lý
  const [selectedKpiFilter, setSelectedKpiFilter] = useState('ACTIVE_DEFAULT');

  // Bộ lọc danh sách
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');

  // Tra cứu lịch sử hợp đồng nhân viên (Acceptance Criteria 2 & 3)
  const [historyEmpId, setHistoryEmpId] = useState('');
  const [employeeHistoryData, setEmployeeHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modal Tạo / Sửa hợp đồng (Acceptance Criteria 1)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
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

  // Modal Gia hạn / Ký tiếp hợp đồng mới (Acceptance Criteria 2 & 4)
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

  // Thông báo Toast alert
  const [toastInfo, setToastInfo] = useState(null);
  const showToast = (type, message) => {
    setToastInfo({ type, message });
    setTimeout(() => setToastInfo(null), 4000);
  };

  const formatVND = (num) => `${Math.round(+num || 0).toLocaleString('vi-VN')} đ`;

  // Hàm chuẩn hóa tiếng Việt để tìm kiếm không dấu
  const removeAccents = (str) => {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  };

  // Tải toàn bộ dữ liệu từ CSDL qua API
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

  // Xử lý khi nhấn vào các thẻ KPI (Yêu cầu 1 & 5)
  const handleKpiCardClick = (filterType) => {
    if (selectedKpiFilter === filterType && filterType !== 'ACTIVE_DEFAULT') {
      setSelectedKpiFilter('ACTIVE_DEFAULT');
    } else {
      setSelectedKpiFilter(filterType);
    }
    setActiveTab('list');
  };

  // Tính toán danh sách hợp đồng hiển thị linh hoạt (Lọc tức thì + Tìm kiếm nhạy bén)
  const displayedContracts = useMemo(() => {
    let list = [...contracts];

    // 1. Áp dụng bộ lọc từ Thẻ KPI (Yêu cầu 1 & 5)
    // "những hợp đồng hết hạn hoặc đã tái ký hãy ẩn đi , chỉ đến khi ấn vào mục hợp đồng đã chấm dứt mới hiện ra"
    if (selectedKpiFilter === 'EXPIRED') {
      // CHỈ KHI BẤM VÀO CARD "HẾT HẠN / ĐÃ CHẤM DỨT" MỚI HIỆN RA
      list = list.filter(c => 
        c.Status === 'Hết hạn' || 
        c.Status === 'Đã chấm dứt' || 
        c.Status === 'Đã gia hạn' || 
        c.Status === 'Đã tái ký' ||
        c.ExpirationCategory === 'EXPIRED'
      );
    } else {
      // Ở TẤT CẢ CÁC MỤC KHÁC: MẶC ĐỊNH ẨN TOÀN BỘ HỢP ĐỒNG HẾT HẠN / ĐÃ TÁI KÝ / CHẤM DỨT
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

    // 2. Lọc dropdown Trạng thái
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(c => c.Status === statusFilter);
    }

    // 3. Lọc dropdown Loại hợp đồng
    if (typeFilter && typeFilter !== 'all') {
      list = list.filter(c => c.ContractType === typeFilter);
    }

    // 4. Lọc dropdown Phòng ban
    if (selectedDeptFilter) {
      list = list.filter(c => String(c.DepartmentId) === String(selectedDeptFilter));
    }

    // 5. Thanh tìm kiếm (Yêu cầu 4: Tìm kiếm nhạy bén, không dấu & có dấu tiếng Việt)
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

  // Xuất danh sách hợp đồng ra file Excel (.xls) có chia cột hàng rõ ràng (Yêu cầu 3)
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
      const statusClass = c.Status === 'Hiệu lực' ? 'active' : (c.Status === 'Sắp hết hạn' ? 'urgent' : 'expired');

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

  // Tải lịch sử hợp đồng của 1 nhân viên
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

  // Xử lý mở tra cứu lịch sử từ 1 dòng hợp đồng bất kỳ
  const handleOpenHistoryForEmp = (empId) => {
    setHistoryEmpId(String(empId));
    setActiveTab('history');
  };

  // Mở modal Thêm mới
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

  // Mở modal Chỉnh sửa
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

  // Mở modal Gia hạn / Ký tiếp hợp đồng
  const handleOpenRenewModal = (c) => {
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

  // Lưu hợp đồng (Create / Update)
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

  // Thực hiện Gia hạn
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

  // Xóa hợp đồng
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

  // Render Badge trạng thái hợp đồng kèm cảnh báo đếm ngày
  const renderStatusBadge = (c) => {
    const days = c.DaysRemaining;
    const cat = c.ExpirationCategory;

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

  // Lọc danh sách cảnh báo
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
      {/* Toast thông báo */}
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

      {/* Header Phân hệ */}
      <div className="lc-header">
        <div className="lc-title">
          <h1>
            <FileText size={22} color="#0f766e" />
            <span>Quản lý Hợp đồng lao động & Cảnh báo hết hạn (US-07)</span>
          </h1>
          <p>Theo dõi thời hạn, phân loại hợp đồng, tra cứu lịch sử ký kết và cảnh báo tự động từ CSDL</p>
        </div>

        <div className="lc-actions">
          <button className="btn" onClick={() => loadData()} title="Làm mới dữ liệu từ CSDL">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          
          {/* Nút Xuất Excel theo Yêu cầu 3 */}
          <button className="btn" onClick={handleExportExcel} title="Xuất danh sách hợp đồng ra file Excel (.xls) có chia cột rõ ràng">
            <FileSpreadsheet size={16} color="#16a34a" />
            <span>Xuất Excel</span>
          </button>

          <button className="btn pri" onClick={() => handleOpenCreateModal()}>
            <Plus size={16} />
            <span>+ Tạo hợp đồng mới</span>
          </button>
        </div>
      </div>

      {/* Banner Cảnh báo Hết hạn Nổi bật */}
      {(stats.expiringSoon30 > 0 || stats.expiringSoon15 > 0) && (
        <div className="lc-alert-banner">
          <div className="lc-alert-content">
            <div className="lc-alert-icon">
              <AlertTriangle size={22} />
            </div>
            <div className="lc-alert-text">
              <h4>
                Cảnh báo: Có {stats.expiringSoon30 || 0} hợp đồng lao động sắp hết hạn trong 30 ngày tới!
              </h4>
              <p>
                {stats.expiringSoon15 > 0 && (
                  <strong>Trong đó có {stats.expiringSoon15} hợp đồng ở mức khẩn cấp (dưới 15 ngày). </strong>
                )}
                Vui lòng xem xét gia hạn hoặc thanh lý hợp đồng để đảm bảo tuân thủ Bộ luật Lao động.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="lc-alert-action-btn"
            onClick={() => handleKpiCardClick('EXPIRING')}
          >
            <Clock size={15} />
            <span>Xem {stats.expiringSoon30} hợp đồng sắp hết hạn</span>
          </button>
        </div>
      )}

      {/* KPI Thống kê Tổng quan (Yêu cầu 1 & 5: Bấm vào mở danh sách theo mục đó) */}
      <div className="lc-stats-grid">
        {/* Card 1: Tổng số hợp đồng */}
        <div
          className={`lc-stat-card ${selectedKpiFilter === 'ACTIVE_DEFAULT' ? 'active-total' : ''}`}
          onClick={() => handleKpiCardClick('ACTIVE_DEFAULT')}
          title="Bấm để xem tất cả hợp đồng đang áp dụng"
        >
          {selectedKpiFilter === 'ACTIVE_DEFAULT' && (
            <span className="lc-card-active-indicator total">Đang lọc</span>
          )}
          <div className="lc-stat-icon primary">
            <FileText size={22} />
          </div>
          <div className="lc-stat-info">
            <span>TỔNG SỐ HỢP ĐỒNG</span>
            <strong>{stats.totalContracts || contracts.length}</strong>
            <small>hợp đồng</small>
          </div>
        </div>

        {/* Card 2: Đang hiệu lực */}
        <div
          className={`lc-stat-card ${selectedKpiFilter === 'ACTIVE' ? 'active-active' : ''}`}
          onClick={() => handleKpiCardClick('ACTIVE')}
          title="Bấm để lọc các hợp đồng đang hiệu lực"
        >
          {selectedKpiFilter === 'ACTIVE' && (
            <span className="lc-card-active-indicator active">Đang lọc</span>
          )}
          <div className="lc-stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="lc-stat-info">
            <span>ĐANG HIỆU LỰC</span>
            <strong>{stats.activeContracts || 0}</strong>
            <small>hợp đồng</small>
          </div>
        </div>

        {/* Card 3: Sắp hết hạn */}
        <div
          className={`lc-stat-card ${selectedKpiFilter === 'EXPIRING' ? 'active-expiring' : ''}`}
          onClick={() => handleKpiCardClick('EXPIRING')}
          title="Bấm để lọc các hợp đồng sắp hết hạn (≤ 30 ngày)"
        >
          {selectedKpiFilter === 'EXPIRING' && (
            <span className="lc-card-active-indicator expiring">Đang lọc</span>
          )}
          <div className="lc-stat-icon amber">
            <Clock size={22} />
          </div>
          <div className="lc-stat-info">
            <span>SẮP HẾT HẠN (≤ 30 NGÀY)</span>
            <strong style={{ color: '#d97706' }}>{stats.expiringSoon30 || 0}</strong>
            <small>cần xử lý</small>
          </div>
        </div>

        {/* Card 4: Hết hạn / Đã chấm dứt (Yêu cầu 5: Chỉ khi bấm vào đây mới hiện các hợp đồng hết hạn / tái ký) */}
        <div
          className={`lc-stat-card ${selectedKpiFilter === 'EXPIRED' ? 'active-expired' : ''}`}
          onClick={() => handleKpiCardClick('EXPIRED')}
          title="Bấm để mở danh sách hợp đồng đã hết hạn, đã chấm dứt hoặc đã tái ký"
        >
          {selectedKpiFilter === 'EXPIRED' && (
            <span className="lc-card-active-indicator expired">Đang mở xem</span>
          )}
          <div className="lc-stat-icon red">
            <AlertCircle size={22} />
          </div>
          <div className="lc-stat-info">
            <span>HẾT HẠN / ĐÃ CHẤM DỨT</span>
            <strong style={{ color: '#dc2626' }}>{stats.expiredContracts || 0}</strong>
            <small>hợp đồng</small>
          </div>
        </div>

        {/* Card 5: Vô thời hạn */}
        <div
          className={`lc-stat-card ${selectedKpiFilter === 'PERMANENT' ? 'active-permanent' : ''}`}
          onClick={() => handleKpiCardClick('PERMANENT')}
          title="Bấm để lọc các hợp đồng vô thời hạn"
        >
          {selectedKpiFilter === 'PERMANENT' && (
            <span className="lc-card-active-indicator permanent">Đang lọc</span>
          )}
          <div className="lc-stat-icon blue">
            <ShieldAlert size={22} />
          </div>
          <div className="lc-stat-info">
            <span>VÔ THỜI HẠN</span>
            <strong>{stats.permanentContracts || 0}</strong>
            <small>dài hạn</small>
          </div>
        </div>
      </div>

      {/* Chuyển đổi chế độ xem (View Tabs) */}
      <div className="lc-view-tabs">
        <button
          className={`lc-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <FileText size={16} />
          <span>Danh sách hợp đồng ({displayedContracts.length})</span>
        </button>

        <button
          className={`lc-tab-btn ${activeTab === 'expiring' ? 'active' : ''}`}
          onClick={() => setActiveTab('expiring')}
        >
          <AlertTriangle size={16} color="#d97706" />
          <span>Trung tâm cảnh báo hết hạn</span>
          {stats.expiringSoon30 > 0 && (
            <span className="lc-tab-badge amber">{stats.expiringSoon30}</span>
          )}
        </button>

        <button
          className={`lc-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('history');
            if (!historyEmpId && employeesList.length > 0) {
              setHistoryEmpId(String(employeesList[0].EmployeeId));
            }
          }}
        >
          <History size={16} color="#0f766e" />
          <span>Tra cứu lịch sử hợp đồng theo nhân viên</span>
        </button>
      </div>

      {/* ================= TAB 1: DANH SÁCH HỢP ĐỒNG ================= */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Banner thông báo bộ lọc KPI đang áp dụng */}
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

          {/* Thanh công cụ tìm kiếm và lọc */}
          <div className="lc-filter-bar">
            {/* Thanh tìm kiếm nhạy bén (Yêu cầu 4) */}
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

          {/* Bảng dữ liệu hợp đồng (ĐÃ XÓA CỘT FILE ĐÍNH KÈM THEO YÊU CẦU 2) */}
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
                      <tr key={c.ContractId}>
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
                        <td className="act">
                          {/* Tra cứu lịch sử hợp đồng nhân viên */}
                          <button
                            type="button"
                            className="ibtn"
                            title="Tra cứu lịch sử hợp đồng nhân viên"
                            onClick={() => handleOpenHistoryForEmp(c.EmployeeId)}
                          >
                            <History size={15} color="#0f766e" />
                          </button>

                          {/* Gia hạn hợp đồng */}
                          <button
                            type="button"
                            className="ibtn"
                            title="Gia hạn / Ký tiếp hợp đồng mới"
                            onClick={() => handleOpenRenewModal(c)}
                          >
                            <Award size={15} color="#d97706" />
                          </button>

                          {/* Sửa hợp đồng */}
                          <button
                            type="button"
                            className="ibtn"
                            title="Chỉnh sửa thông tin hợp đồng"
                            onClick={() => handleOpenEditModal(c)}
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Xóa hợp đồng */}
                          <button
                            type="button"
                            className="ibtn del"
                            title="Xóa hợp đồng"
                            onClick={() => handleDeleteContract(c)}
                          >
                            <Trash2 size={15} />
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
      )}

      {/* ================= TAB 2: TRUNG TÂM CẢNH BÁO HẾT HẠN ================= */}
      {activeTab === 'expiring' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0f172a' }}>
              Danh mục các hợp đồng lao động cần theo dõi & gia hạn
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Bao gồm các hợp đồng có thời hạn kết thúc trong vòng 30 - 60 ngày cần được quyết định tái ký.
            </p>
          </div>

          <div className="lc-table-card">
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>SỐ HỢP ĐỒNG</th>
                    <th>NHÂN VIÊN CẦN XỬ LÝ</th>
                    <th>LOẠI HỢP ĐỒNG HIỆN TẠI</th>
                    <th>NGÀY HẾT HẠN</th>
                    <th>THỜI GIAN CÒN LẠI</th>
                    <th>MỨC LƯƠNG</th>
                    <th className="act">HÀNH ĐỘNG KHUYẾN NGHỊ</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringContractsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#16a34a' }}>
                        <CheckCircle2 size={36} style={{ margin: '0 auto 8px' }} />
                        <p>Tuyệt vời! Không có hợp đồng nào đang ở tình trạng sắp hết hạn trong 30 ngày tới.</p>
                      </td>
                    </tr>
                  ) : (
                    expiringContractsList.map((c) => (
                      <tr key={c.ContractId} style={{ background: c.ExpirationCategory === 'EXPIRING_URGENT' ? '#fffaf0' : 'transparent' }}>
                        <td>
                          <code style={{ fontWeight: 700, color: '#0f766e' }}>{c.ContractNumber}</code>
                        </td>
                        <td>
                          <div className="who">
                            <div className="avatar" style={{ width: '32px', height: '32px' }}>
                              {c.EmployeeName ? c.EmployeeName.split(' ').slice(-1)[0][0] : 'N'}
                            </div>
                            <div>
                              <b>{c.EmployeeName}</b>
                              <small>{c.EmployeeCode} · {c.DepartmentName}</small>
                            </div>
                          </div>
                        </td>
                        <td>{c.ContractType}</td>
                        <td>
                          <strong style={{ color: '#dc2626' }}>{c.EndDate}</strong>
                        </td>
                        <td>{renderStatusBadge(c)}</td>
                        <td>{formatVND(c.AgreedSalary)}</td>
                        <td className="act">
                          <button
                            type="button"
                            className="btn pri"
                            style={{ padding: '5px 12px', fontSize: '12px' }}
                            onClick={() => handleOpenRenewModal(c)}
                          >
                            <Award size={14} />
                            <span>Gia hạn hợp đồng</span>
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
      )}

      {/* ================= TAB 3: TRA CỨU LỊCH SỬ THEO NHÂN VIÊN ================= */}
      {activeTab === 'history' && (
        <div className="lc-history-wrapper">
          {/* Bộ chọn nhân viên */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
              Chọn nhân viên tra cứu:
            </label>
            <select
              className="lc-select"
              style={{ minWidth: '320px' }}
              value={historyEmpId}
              onChange={(e) => setHistoryEmpId(e.target.value)}
            >
              <option value="">-- Chọn nhân viên cần xem tiến trình hợp đồng --</option>
              {employeesList.map((emp) => (
                <option key={emp.EmployeeId} value={emp.EmployeeId}>
                  {emp.FullName} ({emp.EmployeeCode}) - {emp.DepartmentName || 'Chưa gán phòng'} [{emp.ContractCount || 0} hợp đồng]
                </option>
              ))}
            </select>
          </div>

          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px', color: '#0f766e' }} />
              <p>Đang tải tiến trình lịch sử hợp đồng của nhân viên...</p>
            </div>
          ) : employeeHistoryData?.employee ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Nhân viên */}
              <div className="lc-history-employee-header">
                <div className="lc-history-emp-info">
                  {employeeHistoryData.employee.AvatarUrl ? (
                    <img
                      src={employeeHistoryData.employee.AvatarUrl}
                      alt={employeeHistoryData.employee.FullName}
                      className="lc-history-avatar"
                    />
                  ) : (
                    <div className="lc-history-avatar-placeholder">
                      {employeeHistoryData.employee.FullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                      {employeeHistoryData.employee.FullName}
                    </h2>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Mã NV: <strong>{employeeHistoryData.employee.EmployeeCode}</strong> · Phòng: <strong>{employeeHistoryData.employee.DepartmentName || 'Chưa gán'}</strong> · Chức danh: <strong>{employeeHistoryData.employee.PositionName || 'Nhân viên'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn pri"
                    onClick={() => handleOpenCreateModal(employeeHistoryData.employee.EmployeeId)}
                  >
                    <Plus size={15} />
                    <span>Ký thêm hợp đồng mới cho nhân viên này</span>
                  </button>
                </div>
              </div>

              {/* Dòng thời gian các giai đoạn hợp đồng (Timeline) */}
              <div>
                <h3 style={{ fontSize: '15px', color: '#0f766e', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <History size={17} />
                  <span>Tiến trình lịch sử ký kết các giai đoạn làm việc ({employeeHistoryData.totalContracts} hợp đồng)</span>
                </h3>

                {employeeHistoryData.history?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                    Nhân viên này chưa có bản ghi hợp đồng nào trong CSDL.
                  </div>
                ) : (
                  <div className="lc-timeline">
                    {employeeHistoryData.history.map((stage) => {
                      const isActive = stage.Status === 'Hiệu lực';
                      return (
                        <div key={stage.ContractId} className="lc-timeline-item">
                          <div className={`lc-timeline-dot ${isActive ? 'active' : 'expired'}`} />
                          
                          <div className="lc-timeline-card">
                            <div className="lc-timeline-card-header">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="lc-stage-badge">{stage.stageLabel}</span>
                                <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{stage.ContractType}</strong>
                                <code style={{ color: '#0f766e', fontSize: '12px' }}>({stage.ContractNumber})</code>
                              </div>
                              <div>{renderStatusBadge(stage)}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                              <div>
                                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11.5px' }}>THỜI HẠN ÁP DỤNG:</span>
                                <strong>{stage.StartDate}</strong> <ArrowRight size={12} style={{ display: 'inline', margin: '0 4px' }} /> <strong>{stage.EndDate || 'Vô thời hạn'}</strong>
                              </div>

                              <div>
                                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11.5px' }}>MỨC LƯƠNG KÝ KẾT:</span>
                                <strong style={{ color: '#0f766e' }}>{formatVND(stage.AgreedSalary)}</strong>
                              </div>

                              <div>
                                <span style={{ color: '#94a3b8', display: 'block', fontSize: '11.5px' }}>NGÀY KÝ:</span>
                                <span>{stage.SignDate || '-'}</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '6px' }}>
                              <button
                                type="button"
                                className="btn"
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                                onClick={() => handleOpenEditModal(stage)}
                              >
                                <Edit2 size={13} />
                                <span>Sửa</span>
                              </button>
                              <button
                                type="button"
                                className="btn pri"
                                style={{ padding: '4px 10px', fontSize: '12px' }}
                                onClick={() => handleOpenRenewModal(stage)}
                              >
                                <Award size={13} />
                                <span>Gia hạn tiếp</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              Vui lòng chọn nhân viên ở trên để tra cứu lịch sử hợp đồng.
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL 1: THÊM MỚI / CHỈNH SỬA HỢP ĐỒNG (ĐÃ XÓA FILE ĐÍNH KÈM) ================= */}
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
                {/* Chọn nhân viên */}
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

                {/* Số hợp đồng & Loại hợp đồng */}
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

                {/* Ngày ký & Ngày bắt đầu */}
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

                {/* Ngày kết thúc & Mức lương */}
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

                {/* Trạng thái (ĐÃ XÓA TRƯỜNG FILE SCAN) */}
                <div className="lc-form-group">
                  <label>Trạng thái hợp đồng</label>
                  <select
                    className="lc-form-select"
                    value={currentContract.Status}
                    onChange={(e) => setCurrentContract({ ...currentContract, Status: e.target.value })}
                  >
                    <option value="Hiệu lực">Hiệu lực</option>
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

      {/* ================= MODAL 2: GIA HẠN / KÝ TIẾP HỢP ĐỒNG ================= */}
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
    </div>
  );
}
