import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck, Search, Plus, RefreshCw, CheckCircle2, Clock, CheckSquare,
  Square, Trash2, Shield, Briefcase, Calendar, Building2, User,
  ChevronRight, AlertCircle, X, Award, Eye, Mail, Key, Laptop, FileText,
  Send, PenTool, Check, ExternalLink, HelpCircle, Camera, Upload, Sparkles
} from 'lucide-react';
import HrService from '../../../../services/HrService';

export default function OnboardingManagement({ showToast, onNavigate }) {
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [detailTarget, setDetailTarget] = useState(null);

  const [accountModalTarget, setAccountModalTarget] = useState(null);
  const [accountForm, setAccountForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '123456'
  });
  const [accountSubmitting, setAccountSubmitting] = useState(false);
  const [accountMailSending, setAccountMailSending] = useState(false);

  const [contractModalTarget, setContractModalTarget] = useState(null);
  const [contractForm, setContractForm] = useState({
    ContractType: 'Hợp đồng xác định thời hạn (1 năm)',
    StartDate: '',
    EndDate: '',
    AgreedSalary: 15000000
  });
  const [contractSubmitting, setContractSubmitting] = useState(false);

  const [assetModalTarget, setAssetModalTarget] = useState(null);
  const [assetForm, setAssetForm] = useState({
    AssetName: 'Laptop Dell Latitude 7420 (Core i7 / 16GB / 512GB SSD)',
    AssetCode: '',
    Category: 'Laptop',
    SerialNumber: '',
    Condition: 'Mới 100%',
    AssignDate: '',
    Notes: 'Bàn giao đầy đủ thân máy, củ sạc Type-C và túi chống sốc'
  });
  const [assetSubmitting, setAssetSubmitting] = useState(false);

  const [faceModalTarget, setFaceModalTarget] = useState(null);
  const [faceFiles, setFaceFiles] = useState([]);
  const [facePreviews, setFacePreviews] = useState([]);
  const [faceSubmitting, setFaceSubmitting] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createData, setCreateData] = useState({
    CandidateName: '',
    PositionName: '',
    DepartmentId: '',
    StartDate: new Date().toISOString().slice(0, 10),
    MentorEmployeeId: '',
    OfferedSalary: 15000000,
    Email: '',
    Phone: ''
  });

  const getCandidateFor = useCallback((candidateName) => {
    if (!candidateName) return null;
    return candidates.find(c => c.FullName?.trim()?.toLowerCase() === candidateName?.trim()?.toLowerCase()) || null;
  }, [candidates]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await HrService.getOnboardings({
        search,
        status: statusFilter
      });
      setOnboardings(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Lỗi khi tải danh sách Onboarding!', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [depts, pos, empsRes, candRes] = await Promise.all([
          HrService.getDepartments().catch(() => []),
          HrService.getPositions().catch(() => []),
          HrService.getEmployees({ limit: 100 }).catch(() => ({ employees: [] })),
          HrService.getCandidates().catch(() => [])
        ]);
        if (depts) setDepartments(depts);
        if (pos) setPositions(pos);
        if (empsRes?.employees) setMentors(empsRes.employees);
        else if (Array.isArray(empsRes)) setMentors(empsRes);
        if (Array.isArray(candRes)) setCandidates(candRes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  const handleOpenAccountModal = (item) => {
    setAccountModalTarget(item);
    const cand = getCandidateFor(item.CandidateName);
    const suggestedUsername = (item.CandidateName || 'emp')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const inheritedEmail = item.Email || cand?.Email || '';
    const inheritedPhone = item.Phone || cand?.Phone || '';

    setAccountForm({
      username: item.Username || suggestedUsername,
      email: inheritedEmail,
      phone: inheritedPhone,
      password: '123456'
    });
  };

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    if (!accountModalTarget) return;

    try {
      setAccountSubmitting(true);
      await HrService.createOnboardingAccount(accountModalTarget.OnboardingId, {
        username: accountForm.username,
        email: accountForm.email,
        phone: accountForm.phone
      });

      if (showToast) {
        showToast(`Đã cấp tài khoản "${accountForm.username}" (mật khẩu: 123456) cho ${accountModalTarget.CandidateName} thành công! Nhân viên có thể đăng nhập vào hệ thống ngay.`, 'success');
      }
      setAccountModalTarget(null);
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi tạo tài khoản nhân viên!', 'error');
    } finally {
      setAccountSubmitting(false);
    }
  };

  const handleSendAccountEmail = async () => {
    if (!accountModalTarget) return;
    if (!accountForm.email || !accountForm.email.includes('@')) {
      if (showToast) showToast('Vui lòng nhập địa chỉ email hợp lệ để gửi thông tin!', 'error');
      return;
    }

    try {
      setAccountMailSending(true);
      await HrService.sendOnboardingAccountEmail(accountModalTarget.OnboardingId, {
        username: accountForm.username,
        email: accountForm.email,
        password: '123456'
      });
      if (showToast) showToast(`Đã gửi email thông tin tài khoản đến ${accountForm.email} thành công!`, 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi gửi email thông tin tài khoản!', 'error');
    } finally {
      setAccountMailSending(false);
    }
  };

  const handleOpenContractModal = (item) => {
    setContractModalTarget(item);
    const cand = getCandidateFor(item.CandidateName);
    const start = item.StartDate || new Date().toISOString().slice(0, 10);
    const startDateObj = new Date(start);
    const endDateObj = new Date(startDateObj);
    endDateObj.setFullYear(endDateObj.getFullYear() + 1);

    const inheritedSalary = item.OfferedSalary || cand?.OfferedSalary || 15000000;

    setContractForm({
      ContractType: 'Hợp đồng xác định thời hạn (1 năm)',
      StartDate: start,
      EndDate: endDateObj.toISOString().slice(0, 10),
      AgreedSalary: inheritedSalary
    });
  };

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    if (!contractModalTarget) return;

    try {
      setContractSubmitting(true);
      let empId = contractModalTarget.EmployeeId;
      const cand = getCandidateFor(contractModalTarget.CandidateName);
      const inheritedEmail = contractModalTarget.Email || cand?.Email || `emp.${contractModalTarget.OnboardingCode.toLowerCase()}@company.vn`;
      const inheritedPhone = contractModalTarget.Phone || cand?.Phone || '';

      if (!empId) {
        const accRes = await HrService.createOnboardingAccount(contractModalTarget.OnboardingId, {
          username: (contractModalTarget.CandidateName || 'emp')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ''),
          email: inheritedEmail,
          phone: inheritedPhone
        });
        empId = accRes?.employeeId || accRes?.onboarding?.EmployeeId;
      }

      await HrService.createContract({
        EmployeeId: empId,
        ContractType: contractForm.ContractType,
        StartDate: contractForm.StartDate,
        EndDate: contractForm.EndDate,
        AgreedSalary: contractForm.AgreedSalary,
        Status: 'Chờ nhân viên ký'
      });

      if (showToast) {
        showToast(`Đã tạo hợp đồng lao động cho ${contractModalTarget.CandidateName}!`, 'success');
      }
      setContractModalTarget(null);
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi tạo hợp đồng lao động!', 'error');
    } finally {
      setContractSubmitting(false);
    }
  };

  const handleOpenAssetModal = (item) => {
    setAssetModalTarget(item);
    setAssetForm({
      AssetName: 'Laptop Dell Latitude 7420 (Core i7 / 16GB / 512GB SSD)',
      AssetCode: '',
      Category: 'Laptop',
      SerialNumber: '',
      Condition: 'Mới 100%',
      AssignDate: item.StartDate || new Date().toISOString().slice(0, 10),
      Notes: 'Bàn giao đầy đủ thân máy, củ sạc Type-C và túi chống sốc'
    });
  };

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    if (!assetModalTarget) return;

    try {
      setAssetSubmitting(true);
      let empId = assetModalTarget.EmployeeId;
      const cand = getCandidateFor(assetModalTarget.CandidateName);
      const inheritedEmail = assetModalTarget.Email || cand?.Email || `emp.${assetModalTarget.OnboardingCode.toLowerCase()}@company.vn`;
      const inheritedPhone = assetModalTarget.Phone || cand?.Phone || '';

      if (!empId) {
        const accRes = await HrService.createOnboardingAccount(assetModalTarget.OnboardingId, {
          username: (assetModalTarget.CandidateName || 'emp')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ''),
          email: inheritedEmail,
          phone: inheritedPhone
        });
        empId = accRes?.employeeId || accRes?.onboarding?.EmployeeId;
      }

      await HrService.createAsset({
        ...assetForm,
        EmployeeId: empId
      });

      if (showToast) {
        showToast(`Đã cấp phát trang thiết bị "${assetForm.AssetName}" cho ${assetModalTarget.CandidateName}!`, 'success');
      }
      setAssetModalTarget(null);
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi cấp phát thiết bị!', 'error');
    } finally {
      setAssetSubmitting(false);
    }
  };

  const handleOpenFaceModal = (item) => {
    setFaceModalTarget(item);
    setFaceFiles([]);
    setFacePreviews([]);
  };

  const handleFaceFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      setFaceFiles(selected);
      const urls = selected.map(f => URL.createObjectURL(f));
      setFacePreviews(urls);
    }
  };

  const handleSendFaceRequest = async () => {
    if (!faceModalTarget) return;

    try {
      setFaceSubmitting(true);
      await HrService.updateOnboardingChecklist(faceModalTarget.OnboardingId, {
        FaceRequestSent: 1
      });
      if (showToast) {
        showToast(`Đã gửi yêu cầu nộp ảnh Face ID tới tài khoản ${faceModalTarget.CandidateName}!`, 'success');
      }
      setFaceModalTarget(null);
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi gửi yêu cầu!', 'error');
    } finally {
      setFaceSubmitting(false);
    }
  };

  const handleFaceSubmit = async (e) => {
    e.preventDefault();
    if (!faceModalTarget) return;

    try {
      setFaceSubmitting(true);
      const cleanCode = faceModalTarget.EmployeeCode || (faceModalTarget.CandidateName || 'emp')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      if (faceFiles.length > 0) {
        const formData = new FormData();
        formData.append('employeeCode', cleanCode);
        if (faceModalTarget.EmployeeId) {
          formData.append('employeeId', faceModalTarget.EmployeeId);
        }
        faceFiles.forEach(f => {
          formData.append('faceImages', f);
        });
        await HrService.registerFace(formData);
      }

      await HrService.updateOnboardingChecklist(faceModalTarget.OnboardingId, {
        FaceEnrolled: 1,
        FacePhotosCount: faceFiles.length || 1
      });

      if (showToast) {
        showToast(`Đã lưu ${faceFiles.length || 1} ảnh khuôn mặt & kích hoạt Face ID cho ${faceModalTarget.CandidateName}!`, 'success');
      }
      setFaceModalTarget(null);
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi lưu dữ liệu Face ID!', 'error');
    } finally {
      setFaceSubmitting(false);
    }
  };

  const handleToggleStep = async (item, stepKey) => {
    if (stepKey === 'AccountCreated') {
      handleOpenAccountModal(item);
      return;
    }
    if (stepKey === 'ContractSigned') {
      handleOpenContractModal(item);
      return;
    }
    if (stepKey === 'AssetAssigned') {
      handleOpenAssetModal(item);
      return;
    }
    if (stepKey === 'FaceEnrolled') {
      handleOpenFaceModal(item);
      return;
    }

    const currentVal = !!item[stepKey];
    const newVal = !currentVal;

    const updatedItem = { ...item, [stepKey]: newVal };
    setOnboardings(prev => prev.map(o => o.OnboardingId === item.OnboardingId ? updatedItem : o));

    try {
      await HrService.updateOnboardingChecklist(item.OnboardingId, {
        [stepKey]: newVal
      });
      if (showToast) showToast(`Cập nhật tiến trình cho ${item.CandidateName} thành công!`, 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi cập nhật checklist!', 'error');
      loadData();
    }
  };

  const handleCompleteOnboarding = async (item) => {
    try {
      await HrService.updateOnboardingChecklist(item.OnboardingId, {
        Status: 'Đã hoàn tất'
      });
      if (showToast) {
        showToast(`🎉 Chúc mừng! Đã hoàn thành toàn bộ quy trình tiếp nhận Onboarding cho nhân sự ${item.CandidateName} (${item.OnboardingCode})!`, 'success');
      }
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi hoàn tất tiếp nhận!', 'error');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xác nhận xóa hồ sơ Onboarding của ${item.CandidateName}?`)) return;
    try {
      await HrService.deleteOnboarding(item.OnboardingId);
      if (showToast) showToast(`Đã xóa hồ sơ ${item.CandidateName}!`, 'success');
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi xóa hồ sơ Onboarding!', 'error');
    }
  };

  const handleOpenCreate = () => {
    setCreateData({
      CandidateName: '',
      PositionName: '',
      DepartmentId: departments[0]?.DepartmentId || '2',
      StartDate: new Date().toISOString().slice(0, 10),
      MentorEmployeeId: '',
      OfferedSalary: 15000000,
      Email: '',
      Phone: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (!createData.CandidateName.trim()) {
      if (showToast) showToast('Vui lòng nhập tên nhân sự tiếp nhận!', 'error');
      return;
    }
    try {
      setCreateSubmitting(true);
      await HrService.createOnboarding({
        ...createData,
        DepartmentId: parseInt(createData.DepartmentId) || 2,
        MentorEmployeeId: createData.MentorEmployeeId ? parseInt(createData.MentorEmployeeId) : null,
        OfferedSalary: parseFloat(createData.OfferedSalary) || 15000000
      });
      if (showToast) showToast('Tạo mới hồ sơ tiếp nhận Onboarding thành công!', 'success');
      setIsCreateModalOpen(false);
      loadData();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi tạo hồ sơ tiếp nhận!', 'error');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const formatVND = (n) => {
    if (!n) return '0 VNĐ';
    return Number(n).toLocaleString('vi-VN') + ' VNĐ';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="ph" style={{ marginBottom: 0 }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, color: '#042f2e' }}>
            Quy trình tiếp nhận nhân sự mới - Onboarding
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
            Theo dõi các bước tiếp nhận: Cấp tài khoản nhân viên, Ký hợp đồng lao động điện tử, Cấp phát trang thiết bị và Đào tạo hội nhập
          </p>
        </div>

        <div className="ph-tools">
          <button className="btn" onClick={() => loadData()} title="Làm mới">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          <button className="btn pri" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Thêm hồ sơ tiếp nhận</span>
          </button>
        </div>
      </div>

      <div className="tbl-card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search" style={{ flex: '1', minWidth: '260px' }}>
            <Search size={15} />
            <input
              type="text"
              className="inp"
              placeholder="Tìm theo tên nhân sự, vị trí, phòng ban, mã Onboarding..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Trạng thái:</span>
            <select
              className="inp"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '170px' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang tiếp nhận">Đang tiếp nhận</option>
              <option value="Đã hoàn tất">Đã hoàn tất</option>
            </select>
          </div>

          <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>
            Tổng cộng: <strong>{onboardings.length}</strong> hồ sơ tiếp nhận
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div className="card" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            <div>Đang tải danh sách Onboarding...</div>
          </div>
        ) : onboardings.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <UserCheck size={36} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
            <h3 style={{ margin: '0 0 6px', color: '#334155' }}>Chưa có hồ sơ tiếp nhận nào</h3>
            <p style={{ margin: 0, fontSize: '13px' }}>
              Khi ứng viên trúng tuyển tại Pipeline tuyển dụng (hoặc bấm nút "Thêm hồ sơ tiếp nhận"), hồ sơ sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          onboardings.map(item => {
            const cand = getCandidateFor(item.CandidateName);
            const effectiveEmail = item.Email || cand?.Email || '';
            const effectivePhone = item.Phone || cand?.Phone || '';
            const effectiveSalary = item.OfferedSalary || cand?.OfferedSalary || null;

            const stepsDone = [item.AccountCreated, item.ContractSigned, item.AssetAssigned, item.FaceEnrolled].filter(Boolean).length;
            const isCompleted = item.Status === 'Đã hoàn tất';
            const canComplete = stepsDone >= 3;

            return (
              <div
                key={item.OnboardingId}
                style={{
                  background: '#ffffff',
                  border: isCompleted ? '1px solid #86efac' : canComplete ? '1px solid #99f6e4' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: isCompleted ? '#dcfce7' : '#ccfbf1',
                        color: isCompleted ? '#166534' : '#0f766e',
                        fontWeight: 800,
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {item.CandidateName ? item.CandidateName.split(' ').slice(-1)[0][0] : 'N'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <b style={{ fontSize: '16px', color: '#0f172a' }}>{item.CandidateName}</b>
                        <code style={{ fontSize: '12px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                          {item.OnboardingCode}
                        </code>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: isCompleted ? '#dcfce7' : '#eff6ff',
                            color: isCompleted ? '#166534' : '#1d4ed8',
                            border: `1px solid ${isCompleted ? '#86efac' : '#bfdbfe'}`
                          }}
                        >
                          {item.Status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0f766e', fontWeight: 600 }}>
                          <Briefcase size={14} />
                          <span>{item.PositionName}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Building2 size={14} />
                          <span>{item.DepartmentName || 'Khối Kỹ Thuật'}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          <span>Bắt đầu: {item.StartDate}</span>
                        </span>
                        {effectiveSalary && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                            <span>Lương đã chốt: {formatVND(effectiveSalary)}</span>
                          </span>
                        )}
                        {item.Username && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb' }}>
                            <User size={14} />
                            <span>Tài khoản: <strong>{item.Username}</strong></span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="btn"
                      style={{
                        padding: '8px 14px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#0f766e',
                        borderColor: '#99f6e4',
                        background: '#f0fdfa'
                      }}
                      onClick={() => setDetailTarget({ ...item, Email: effectiveEmail, Phone: effectivePhone, OfferedSalary: effectiveSalary })}
                    >
                      <Eye size={15} />
                      <span>Xem thông tin chi tiết nhân viên</span>
                    </button>

                    <button
                      className="btn"
                      disabled={!canComplete || isCompleted}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: isCompleted ? '#dcfce7' : canComplete ? '#16a34a' : '#f1f5f9',
                        color: isCompleted ? '#166534' : canComplete ? '#ffffff' : '#94a3b8',
                        borderColor: isCompleted ? '#86efac' : canComplete ? '#15803d' : '#e2e8f0',
                        cursor: canComplete && !isCompleted ? 'pointer' : 'default',
                        boxShadow: canComplete && !isCompleted ? '0 0 10px rgba(22, 163, 74, 0.4)' : 'none'
                      }}
                      onClick={() => handleCompleteOnboarding(item)}
                    >
                      <CheckCircle2 size={16} />
                      <span>
                        {isCompleted ? 'Đã hoàn tất tiếp nhận' : canComplete ? 'Hoàn thành tiếp nhận' : `Hoàn thành tiếp nhận (${stepsDone}/4)`}
                      </span>
                    </button>

                    <button
                      className="ibtn del"
                      title="Xóa hồ sơ Onboarding"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>
                      Tiến độ hoàn thiện thủ tục tiếp nhận ({stepsDone}/4 hoàn thành)
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isCompleted ? '#16a34a' : '#0f766e' }}>
                      {Math.round((stepsDone / 4) * 100)}%
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(stepsDone / 4) * 100}%`,
                        background: isCompleted ? '#16a34a' : '#0f766e',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                      gap: '12px'
                    }}
                  >
                    {[
                      {
                        key: 'AccountCreated',
                        label: '1. Khởi tạo tài khoản HRM',
                        desc: item.AccountCreated && item.Username ? `Tài khoản: ${item.Username} (Mật khẩu: 123456)` : 'Cấp tài khoản & gửi email'
                      },
                      {
                        key: 'ContractSigned',
                        label: '2. Ký hợp đồng lao động',
                        desc: item.ContractSigned ? 'Đã ký hợp đồng điện tử' : 'Tạo HĐ & gửi nhân viên ký'
                      },
                      {
                        key: 'AssetAssigned',
                        label: '3. Cấp phát trang thiết bị',
                        desc: item.AssetAssigned ? 'Đã cấp phát thiết bị thực tế' : 'Cấp laptop, thẻ từ & thiết bị'
                      },
                      {
                        key: 'FaceEnrolled',
                        label: '4. Face ID & Đào tạo hội nhập',
                        desc: item.FaceEnrolled
                          ? (item.FacePhotosCount ? `Đã hoàn thành (${item.FacePhotosCount} ảnh Face ID)` : 'Đã hoàn thành Face ID')
                          : (item.FaceRequestSent ? 'Đã gửi yêu cầu nạp ảnh Face ID' : 'Gửi yêu cầu / Nạp ảnh Face ID')
                      }
                    ].map(step => {
                      const isDone = !!item[step.key];
                      return (
                        <div
                          key={step.key}
                          onClick={() => handleToggleStep(item, step.key)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            background: isDone ? '#f0fdf4' : '#ffffff',
                            border: `1px solid ${isDone ? '#86efac' : '#e2e8f0'}`,
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'all 0.15s ease'
                          }}
                          title="Bấm để cấu hình / thực hiện bước này"
                        >
                          <div style={{ marginTop: '2px', color: isDone ? '#16a34a' : '#94a3b8' }}>
                            {isDone ? <CheckSquare size={18} /> : <Square size={18} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: isDone ? 700 : 600, color: isDone ? '#166534' : '#1e293b' }}>
                              {step.label}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {detailTarget && (
        <div className="modal-wrap" onClick={() => setDetailTarget(null)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} style={{ color: '#0f766e' }} />
                <h3>Thông tin chi tiết hồ sơ nhân sự: {detailTarget.CandidateName}</h3>
              </div>
              <button type="button" onClick={() => setDetailTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-b" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                padding: '14px',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f766e', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Thông tin công tác & đãi ngộ
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Mã tiếp nhận: </span>
                    <strong>{detailTarget.OnboardingCode}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Phòng ban: </span>
                    <strong style={{ color: '#0f766e' }}>{detailTarget.DepartmentName || '-'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Chức danh / Vị trí: </span>
                    <strong style={{ color: '#0f766e' }}>{detailTarget.PositionName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Lương chính thức: </span>
                    <strong style={{ color: '#059669' }}>{formatVND(detailTarget.OfferedSalary || getCandidateFor(detailTarget.CandidateName)?.OfferedSalary)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Ngày bắt đầu: </span>
                    <strong>{detailTarget.StartDate}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Email: </span>
                    <strong>{detailTarget.Email || getCandidateFor(detailTarget.CandidateName)?.Email || 'Chưa cập nhật'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Số điện thoại: </span>
                    <strong>{detailTarget.Phone || getCandidateFor(detailTarget.CandidateName)?.Phone || 'Chưa cập nhật'}</strong>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '14px',
                borderRadius: '8px'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                    Thông tin cá nhân
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Số CCCD / CMND: </span>
                    <strong>{detailTarget.IdCardNumber || 'Chờ nhân viên cập nhật'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Giới tính: </span>
                    <strong>{detailTarget.Gender || 'Chờ nhân viên cập nhật'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Ngày sinh: </span>
                    <strong>{detailTarget.BirthDate || 'Chờ nhân viên cập nhật'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Địa chỉ thường trú: </span>
                    <strong>{detailTarget.Address || 'Chờ nhân viên cập nhật'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Ngân hàng thụ hưởng: </span>
                    <strong>{detailTarget.BankName || 'Chờ nhân viên cập nhật'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Số tài khoản ngân hàng: </span>
                    <strong>{detailTarget.BankAccountNumber || 'Chờ nhân viên cập nhật'}</strong>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '14px',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Tiến độ các bước Onboarding
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {detailTarget.AccountCreated ? <CheckCircle2 size={16} color="#16a34a" /> : <Clock size={16} color="#94a3b8" />}
                    <span>1. Tài khoản HRM: <strong>{detailTarget.AccountCreated ? `Đã cấp (Username: ${detailTarget.Username || detailTarget.Email})` : 'Chưa cấp tài khoản'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {detailTarget.ContractSigned ? <CheckCircle2 size={16} color="#16a34a" /> : <Clock size={16} color="#94a3b8" />}
                    <span>2. Hợp đồng lao động: <strong>{detailTarget.ContractSigned ? 'Đã ký điện tử' : 'Chờ nhân viên đăng nhập ký'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {detailTarget.AssetAssigned ? <CheckCircle2 size={16} color="#16a34a" /> : <Clock size={16} color="#94a3b8" />}
                    <span>3. Trang thiết bị: <strong>{detailTarget.AssetAssigned ? 'Đã cấp phát máy móc & thiết bị' : 'Chưa cấp phát thiết bị'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {detailTarget.FaceEnrolled ? <CheckCircle2 size={16} color="#16a34a" /> : <Clock size={16} color="#94a3b8" />}
                    <span>4. Face ID & Hội nhập: <strong>{detailTarget.FaceEnrolled ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid #e2e8f0' }}>
              <button type="button" className="btn pri" onClick={() => setDetailTarget(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {accountModalTarget && (
        <div className="modal-wrap" onClick={() => !accountSubmitting && setAccountModalTarget(null)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} style={{ color: '#0f766e' }} />
                <h3>Cấp tài khoản Nhân viên: {accountModalTarget.CandidateName}</h3>
              </div>
              {!accountSubmitting && (
                <button type="button" onClick={() => setAccountModalTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleCreateAccountSubmit}>
              <div className="modal-b" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form">
                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Tên đăng nhập: <i className="req">*</i></span>
                    <input
                      className="inp"
                      required
                      placeholder="VD: hieustar hoặc emp_hieu"
                      value={accountForm.username}
                      onChange={e => setAccountForm({ ...accountForm, username: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Mật khẩu mặc định:</span>
                    <input
                      className="inp"
                      disabled
                      value="123456"
                      style={{ background: '#f1f5f9', fontWeight: 700, color: '#dc2626' }}
                    />
                  </label>

                  <label className="field">
                    <span>Phân quyền hệ thống:</span>
                    <input
                      className="inp"
                      disabled
                      value="Nhân viên"
                      style={{ background: '#f1f5f9', fontWeight: 600, color: '#0f766e' }}
                    />
                  </label>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Email nhân viên: <i className="req">*</i></span>
                    <input
                      type="email"
                      className="inp"
                      required
                      placeholder="VD: nhanvien@gmail.com"
                      value={accountForm.email}
                      onChange={e => setAccountForm({ ...accountForm, email: e.target.value })}
                    />
                  </label>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Số điện thoại liên hệ:</span>
                    <input
                      className="inp"
                      placeholder="0912345678"
                      value={accountForm.phone}
                      onChange={e => setAccountForm({ ...accountForm, phone: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="modal-f" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  disabled={accountSubmitting || accountMailSending}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', borderColor: '#fcd34d', background: '#fef3c7' }}
                  onClick={handleSendAccountEmail}
                >
                  <Send size={15} />
                  <span>{accountMailSending ? 'Đang gửi Gmail...' : 'Gửi mail cấp tài khoản cho nhân viên'}</span>
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn"
                    disabled={accountSubmitting}
                    onClick={() => setAccountModalTarget(null)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn pri"
                    disabled={accountSubmitting}
                  >
                    <UserCheck size={16} />
                    <span>{accountSubmitting ? 'Đang cấp...' : 'Xác nhận cấp tài khoản'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {contractModalTarget && (
        <div className="modal-wrap" onClick={() => !contractSubmitting && setContractModalTarget(null)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: '#0f766e' }} />
                <h3>Tạo hợp đồng lao động: {contractModalTarget.CandidateName}</h3>
              </div>
              {!contractSubmitting && (
                <button type="button" onClick={() => setContractModalTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleContractSubmit}>
              <div className="modal-b" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form">
                  <div style={{ gridColumn: 'span 2', background: '#f0fdf4', border: '1px solid #a7f3d0', padding: '12px 14px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600 }}>
                      Mức lương chính thức:
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#065f46', marginTop: '3px' }}>
                      {formatVND(contractForm.AgreedSalary)}
                    </div>
                  </div>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Loại hợp đồng lao động: <i className="req">*</i></span>
                    <select
                      className="inp"
                      value={contractForm.ContractType}
                      onChange={e => setContractForm({ ...contractForm, ContractType: e.target.value })}
                    >
                      <option value="Hợp đồng thử việc (2 tháng)">Hợp đồng thử việc (2 tháng)</option>
                      <option value="Hợp đồng xác định thời hạn (1 năm)">Hợp đồng xác định thời hạn (1 năm)</option>
                      <option value="Hợp đồng không xác định thời hạn">Hợp đồng không xác định thời hạn</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Ngày bắt đầu hiệu lực: <i className="req">*</i></span>
                    <input
                      type="date"
                      className="inp"
                      required
                      value={contractForm.StartDate}
                      onChange={e => setContractForm({ ...contractForm, StartDate: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Ngày kết thúc hợp đồng:</span>
                    <input
                      type="date"
                      className="inp"
                      value={contractForm.EndDate}
                      onChange={e => setContractForm({ ...contractForm, EndDate: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  disabled={contractSubmitting}
                  onClick={() => setContractModalTarget(null)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn pri"
                  disabled={contractSubmitting}
                >
                  <PenTool size={16} />
                  <span>{contractSubmitting ? 'Đang tạo...' : 'Tạo hợp đồng & gửi nhân viên ký'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assetModalTarget && (
        <div className="modal-wrap" onClick={() => !assetSubmitting && setAssetModalTarget(null)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Laptop size={18} style={{ color: '#0f766e' }} />
                <h3>Cấp phát trang thiết bị cho: {assetModalTarget.CandidateName}</h3>
              </div>
              {!assetSubmitting && (
                <button type="button" onClick={() => setAssetModalTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleAssetSubmit}>
              <div className="modal-b" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form">
                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Tên thiết bị / Model: <i className="req">*</i></span>
                    <input
                      className="inp"
                      required
                      placeholder="VD: Laptop Dell Latitude 7420 (Core i7 / 16GB / 512GB)"
                      value={assetForm.AssetName}
                      onChange={e => setAssetForm({ ...assetForm, AssetName: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Phân loại:</span>
                    <select
                      className="inp"
                      value={assetForm.Category}
                      onChange={e => setAssetForm({ ...assetForm, Category: e.target.value })}
                    >
                      <option value="Laptop">Laptop / Máy tính</option>
                      <option value="Màn hình">Màn hình rời</option>
                      <option value="Thẻ từ & Định danh">Thẻ từ & Thẻ NV</option>
                      <option value="Phụ kiện">Phụ kiện & Khác</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Serial Number / Mã quản lý:</span>
                    <input
                      className="inp"
                      placeholder="VD: 8JK9NM2"
                      value={assetForm.SerialNumber}
                      onChange={e => setAssetForm({ ...assetForm, SerialNumber: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Tình trạng:</span>
                    <select
                      className="inp"
                      value={assetForm.Condition}
                      onChange={e => setAssetForm({ ...assetForm, Condition: e.target.value })}
                    >
                      <option value="Mới 100%">Mới 100%</option>
                      <option value="Đã qua sử dụng (Tốt)">Đã qua sử dụng (Tốt)</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Ngày bàn giao:</span>
                    <input
                      type="date"
                      className="inp"
                      value={assetForm.AssignDate}
                      onChange={e => setAssetForm({ ...assetForm, AssignDate: e.target.value })}
                    />
                  </label>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Ghi chú bàn giao:</span>
                    <input
                      className="inp"
                      placeholder="VD: Bàn giao kèm sạc, thẻ từ thang máy và tai nghe"
                      value={assetForm.Notes}
                      onChange={e => setAssetForm({ ...assetForm, Notes: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  disabled={assetSubmitting}
                  onClick={() => setAssetModalTarget(null)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn pri"
                  disabled={assetSubmitting}
                >
                  <Laptop size={16} />
                  <span>{assetSubmitting ? 'Đang cấp...' : 'Xác nhận cấp thiết bị'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {faceModalTarget && (
        <div className="modal-wrap" onClick={() => !faceSubmitting && setFaceModalTarget(null)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} style={{ color: '#0f766e' }} />
                <h3 style={{ margin: 0, fontSize: '16px' }}>
                  Bước 4: Cấp mã & Thu thập ảnh khuôn mặt Face ID
                </h3>
              </div>
              <button
                className="btn icon"
                type="button"
                disabled={faceSubmitting}
                onClick={() => setFaceModalTarget(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-b" style={{ padding: '20px 24px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '13px' }}>
                <div>Nhân sự tiếp nhận: <strong>{faceModalTarget.CandidateName}</strong></div>
                <div style={{ color: '#64748b', marginTop: '2px' }}>
                  Vị trí: {faceModalTarget.PositionName || 'Chuyên viên'} · Phòng ban: {faceModalTarget.DepartmentName || 'Khối Kỹ Thuật'}
                </div>
              </div>

              <div style={{ border: '1px solid #ccfbf1', background: '#f0fdfa', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={15} />
                  <span>Cách 1: Gửi yêu cầu nhân viên tự nộp ảnh</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#134e4a', margin: '6px 0 12px' }}>
                  Hệ thống gửi thông báo tới tài khoản nhân sự. Nhân viên chỉ cần đăng nhập, vào tab <strong>Bảng công & Điểm danh</strong> để nộp từ 1 đến 5 ảnh chân dung với các góc mặt khác nhau nhằm đạt xác suất nhận diện cao nhất.
                </div>
                <button
                  type="button"
                  className="btn sm pri"
                  disabled={faceSubmitting}
                  onClick={handleSendFaceRequest}
                >
                  <Send size={14} />
                  <span>{faceSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu nộp ảnh Face ID'}</span>
                </button>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#ffffff' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Upload size={15} />
                  <span>Cách 2: HR tải trực tiếp nhiều ảnh tại đây</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '12px 0' }}>
                  {facePreviews.length > 0 ? (
                    facePreviews.map((url, i) => (
                      <div key={i} style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #0d9488' }}>
                        <img src={url} alt={`Face ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))
                  ) : (
                    <div style={{ width: '100%', padding: '16px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                      Chưa chọn ảnh nào. Có thể chọn cùng lúc từ 1 đến 5 ảnh (.jpg, .png).
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="btn sm teal" style={{ cursor: 'pointer' }}>
                    <Upload size={14} />
                    <span>{facePreviews.length > 0 ? `Đã chọn ${facePreviews.length} ảnh (Bấm để chọn lại)` : 'Chọn nhiều ảnh (.jpg, .png)'}</span>
                    <input type="file" multiple accept="image/*" onChange={handleFaceFileChange} style={{ display: 'none' }} />
                  </label>

                  {faceFiles.length > 0 && (
                    <button
                      type="button"
                      className="btn sm pri"
                      disabled={faceSubmitting}
                      onClick={handleFaceSubmit}
                    >
                      <CheckCircle2 size={14} />
                      <span>{faceSubmitting ? 'Đang lưu...' : `Kích hoạt Face ID (${faceFiles.length} ảnh)`}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn"
                disabled={faceSubmitting}
                onClick={() => setFaceModalTarget(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="modal-wrap" onClick={() => !createSubmitting && setIsCreateModalOpen(false)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} style={{ color: '#0f766e' }} />
                <h3>Thêm mới hồ sơ tiếp nhận Onboarding</h3>
              </div>
              {!createSubmitting && (
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitCreate}>
              <div className="modal-b" style={{ padding: '16px 20px' }}>
                <div className="form">
                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Họ và tên nhân sự: <i className="req">*</i></span>
                    <input
                      className="inp"
                      required
                      placeholder="VD: Nguyễn Văn Test"
                      value={createData.CandidateName}
                      onChange={e => setCreateData({ ...createData, CandidateName: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Vị trí tuyển dụng: <i className="req">*</i></span>
                    <input
                      className="inp"
                      required
                      placeholder="VD: Senior Frontend Developer"
                      value={createData.PositionName}
                      onChange={e => setCreateData({ ...createData, PositionName: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Phòng ban tiếp nhận: <i className="req">*</i></span>
                    <select
                      className="inp"
                      value={createData.DepartmentId}
                      onChange={e => setCreateData({ ...createData, DepartmentId: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn phòng ban --</option>
                      {departments.map(d => (
                        <option key={d.DepartmentId} value={d.DepartmentId}>
                          {d.DepartmentName} ({d.DepartmentCode})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Mức lương đã chốt (thỏa thuận):</span>
                    <input
                      type="number"
                      className="inp"
                      min="0"
                      step="500000"
                      value={createData.OfferedSalary}
                      onChange={e => setCreateData({ ...createData, OfferedSalary: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Ngày bắt đầu nhận việc: <i className="req">*</i></span>
                    <input
                      type="date"
                      className="inp"
                      required
                      value={createData.StartDate}
                      onChange={e => setCreateData({ ...createData, StartDate: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Email liên hệ:</span>
                    <input
                      type="email"
                      className="inp"
                      placeholder="test@gmail.com"
                      value={createData.Email}
                      onChange={e => setCreateData({ ...createData, Email: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Số điện thoại:</span>
                    <input
                      className="inp"
                      placeholder="0912345678"
                      value={createData.Phone}
                      onChange={e => setCreateData({ ...createData, Phone: e.target.value })}
                    />
                  </label>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Người hướng dẫn (Mentor):</span>
                    <select
                      className="inp"
                      value={createData.MentorEmployeeId}
                      onChange={e => setCreateData({ ...createData, MentorEmployeeId: e.target.value })}
                    >
                      <option value="">-- Không chỉ định mentor --</option>
                      {mentors.map(m => (
                        <option key={m.EmployeeId || m.id} value={m.EmployeeId || m.id}>
                          {m.FullName || m.name} ({m.EmployeeCode || m.code})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  disabled={createSubmitting}
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn pri"
                  disabled={createSubmitting}
                >
                  <Plus size={16} />
                  <span>{createSubmitting ? 'Đang tạo...' : 'Tạo hồ sơ Onboarding'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
