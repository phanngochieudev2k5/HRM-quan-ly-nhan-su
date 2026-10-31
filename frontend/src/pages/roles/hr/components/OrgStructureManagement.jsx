import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, Users, Briefcase, Plus, Edit2, Trash2, ChevronDown, ChevronRight,
  UserCheck, ArrowRightLeft, Search, RefreshCw, AlertCircle, CheckCircle2,
  X, ShieldCheck, Mail, Phone, Layers, Info
} from 'lucide-react';
import OrgService from '../../../../services/OrgService';
import '../../../../styles/roles/hr/OrgStructure.css';

export default function OrgStructureManagement() {
  const [treeData, setTreeData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ totalDepartments: 0, totalPositions: 0, totalEmployees: 0 });
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [expandedNodes, setExpandedNodes] = useState({});

  const [alertInfo, setAlertInfo] = useState(null);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptFormMode, setDeptFormMode] = useState('create');
  const [currentDept, setCurrentDept] = useState({
    DepartmentId: null,
    DepartmentCode: '',
    DepartmentName: '',
    ParentDepartmentId: '',
    ManagerEmployeeId: '',
    HeadCount: 10,
    Description: ''
  });

  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [posFormMode, setPosFormMode] = useState('create');
  const [currentPos, setCurrentPos] = useState({
    PositionId: null,
    PositionCode: '',
    PositionName: '',
    BaseSalaryMin: '',
    BaseSalaryMax: ''
  });

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    employeeId: '',
    targetDepartmentId: '',
    targetPositionId: '',
    decisionNumber: '',
    note: ''
  });

  const [selectedDeptDetail, setSelectedDeptDetail] = useState(null);

  // Load all initial data from database
  const loadData = async (deptIdToRefresh = null) => {
    try {
      setLoading(true);
      const [treeRes, posRes, empRes] = await Promise.all([
        OrgService.getOrgTree(),
        OrgService.getPositions(),
        OrgService.getEmployees()
      ]);

      const tree = treeRes.tree || [];
      const depts = treeRes.departments || [];
      setTreeData(tree);
      setDepartments(depts);
      setPositions(posRes || []);
      setEmployees(empRes || []);
      setStats(treeRes.stats || {
        totalDepartments: depts.length,
        totalPositions: (posRes || []).length,
        totalEmployees: (empRes || []).length
      });

      const exp = {};
      depts.forEach(d => {
        exp[d.DepartmentId] = true;
      });
      setExpandedNodes(exp);

      // Refresh selected dept detail if requested or currently open
      const targetDeptId = deptIdToRefresh || selectedDeptDetail?.DepartmentId;
      if (targetDeptId) {
        const findNode = (nodes) => {
          for (const n of nodes) {
            if (n.DepartmentId === targetDeptId) return n;
            if (n.children && n.children.length > 0) {
              const f = findNode(n.children);
              if (f) return f;
            }
          }
          return null;
        };
        const freshNode = findNode(tree);
        if (freshNode) {
          setSelectedDeptDetail(freshNode);
        }
      }
    } catch (error) {
      showAlert('error', 'Không thể tải dữ liệu cơ cấu tổ chức: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showAlert = (type, message) => {
    setAlertInfo({ type, message });
    setTimeout(() => {
      setAlertInfo(null);
    }, 4500);
  };

  const toggleExpand = (deptId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  const handleExpandAll = (expand) => {
    const exp = {};
    departments.forEach(d => {
      exp[d.DepartmentId] = expand;
    });
    setExpandedNodes(exp);
  };

  const handleOpenAddDept = (parentDeptId = null) => {
    setDeptFormMode('create');
    setCurrentDept({
      DepartmentId: null,
      DepartmentCode: '',
      DepartmentName: '',
      ParentDepartmentId: parentDeptId ? String(parentDeptId) : '',
      ManagerEmployeeId: '',
      HeadCount: 10,
      Description: ''
    });
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept) => {
    setDeptFormMode('edit');
    setCurrentDept({
      DepartmentId: dept.DepartmentId,
      DepartmentCode: dept.DepartmentCode || '',
      DepartmentName: dept.DepartmentName || '',
      ParentDepartmentId: dept.ParentDepartmentId ? String(dept.ParentDepartmentId) : '',
      ManagerEmployeeId: dept.ManagerEmployeeId ? String(dept.ManagerEmployeeId) : '',
      HeadCount: dept.HeadCount || 0,
      Description: dept.Description || ''
    });
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      if (deptFormMode === 'create') {
        await OrgService.createDepartment(currentDept);
        showAlert('success', 'Thêm phòng ban mới thành công!');
      } else {
        await OrgService.updateDepartment(currentDept.DepartmentId, currentDept);
        showAlert('success', 'Cập nhật phòng ban thành công!');
      }
      setIsDeptModalOpen(false);
      await loadData();
    } catch (error) {
      showAlert('error', error.message);
    }
  };

  const handleDeleteDept = async (dept) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng ban "${dept.DepartmentName}" (${dept.DepartmentCode})?`)) {
      return;
    }
    try {
      await OrgService.deleteDepartment(dept.DepartmentId);
      showAlert('success', 'Xóa phòng ban thành công!');
      if (selectedDeptDetail?.DepartmentId === dept.DepartmentId) {
        setSelectedDeptDetail(null);
      }
      await loadData();
    } catch (error) {
      showAlert('error', error.message);
    }
  };

  const handleOpenPosModal = () => {
    setPosFormMode('create');
    setCurrentPos({
      PositionId: null,
      PositionCode: '',
      PositionName: '',
      BaseSalaryMin: '',
      BaseSalaryMax: ''
    });
    setIsPosModalOpen(true);
  };

  const handleEditPos = (pos) => {
    setPosFormMode('edit');
    setCurrentPos({
      PositionId: pos.PositionId,
      PositionCode: pos.PositionCode,
      PositionName: pos.PositionName,
      BaseSalaryMin: pos.BaseSalaryMin || '',
      BaseSalaryMax: pos.BaseSalaryMax || ''
    });
  };

  const handleSavePos = async (e) => {
    e.preventDefault();
    try {
      if (posFormMode === 'create') {
        await OrgService.createPosition(currentPos);
        showAlert('success', 'Thêm chức vụ mới thành công!');
      } else {
        await OrgService.updatePosition(currentPos.PositionId, currentPos);
        showAlert('success', 'Cập nhật chức vụ thành công!');
      }
      setPosFormMode('create');
      setCurrentPos({
        PositionId: null,
        PositionCode: '',
        PositionName: '',
        BaseSalaryMin: '',
        BaseSalaryMax: ''
      });
      const newPositions = await OrgService.getPositions();
      setPositions(newPositions);
    } catch (error) {
      showAlert('error', error.message);
    }
  };

  const handleDeletePos = async (pos) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chức vụ "${pos.PositionName}"?`)) {
      return;
    }
    try {
      await OrgService.deletePosition(pos.PositionId);
      showAlert('success', 'Xóa chức vụ thành công!');
      const newPositions = await OrgService.getPositions();
      setPositions(newPositions);
    } catch (error) {
      showAlert('error', error.message);
    }
  };

  const handleOpenTransferModal = (employee = null, defaultDeptId = null) => {
    setTransferData({
      employeeId: employee ? String(employee.EmployeeId) : '',
      targetDepartmentId: defaultDeptId ? String(defaultDeptId) : (employee?.DepartmentId ? String(employee.DepartmentId) : ''),
      targetPositionId: employee?.PositionId ? String(employee.PositionId) : '',
      decisionNumber: `QĐ-ĐC${Date.now().toString().slice(-4)}`,
      note: 'Điều chuyển nhân sự theo phê duyệt cơ cấu tổ chức'
    });
    setIsTransferModalOpen(true);
  };

  const handleSaveTransfer = async (e) => {
    e.preventDefault();
    if (!transferData.employeeId) {
      showAlert('error', 'Vui lòng chọn nhân viên cần điều chuyển!');
      return;
    }
    if (!transferData.targetDepartmentId) {
      showAlert('error', 'Vui lòng chọn phòng ban mới!');
      return;
    }

    try {
      await OrgService.assignEmployee(transferData.employeeId, transferData);
      showAlert('success', 'Điều chuyển nhân sự thành công!');
      setIsTransferModalOpen(false);
      await loadData(selectedDeptDetail?.DepartmentId);
    } catch (error) {
      showAlert('error', error.message);
    }
  };

  const totalHeadCountQuota = useMemo(() => {
    return departments.reduce((acc, d) => acc + (d.HeadCount || 0), 0);
  }, [departments]);

  const quotaFillRate = useMemo(() => {
    if (!totalHeadCountQuota) return 0;
    return Math.round((stats.totalEmployees / totalHeadCountQuota) * 100);
  }, [stats.totalEmployees, totalHeadCountQuota]);

  const formatMoney = (n) => Math.round(+n || 0).toLocaleString('vi-VN');

  const filterNode = (node, keyword) => {
    const kw = keyword.toLowerCase();
    const matchSelf = (
      node.DepartmentName.toLowerCase().includes(kw) ||
      node.DepartmentCode.toLowerCase().includes(kw) ||
      (node.ManagerName && node.ManagerName.toLowerCase().includes(kw))
    );
    const filteredChildren = (node.children || [])
      .map(child => filterNode(child, keyword))
      .filter(Boolean);

    if (matchSelf || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren
      };
    }
    return null;
  };

  const filteredTree = useMemo(() => {
    if (!searchKeyword.trim()) return treeData;
    return treeData
      .map(node => filterNode(node, searchKeyword.trim()))
      .filter(Boolean);
  }, [treeData, searchKeyword]);

  const renderTreeNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedNodes[node.DepartmentId];
    const isOverQuota = (node.ActualEmployeeCount || 0) > (node.HeadCount || 0);

    return (
      <div key={node.DepartmentId} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={`org-card-node level-${Math.min(level, 3)}`}>
          <div className="org-card-main">
            <div className="org-card-left">
              {hasChildren ? (
                <button
                  type="button"
                  className="org-expand-btn"
                  onClick={() => toggleExpand(node.DepartmentId)}
                  title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <div style={{ width: '28px' }} />
              )}

              {node.ManagerAvatar ? (
                <img
                  src={node.ManagerAvatar}
                  alt={node.ManagerName || 'Quản lý'}
                  className="org-manager-avatar"
                />
              ) : (
                <div className="org-manager-avatar-placeholder">
                  {node.ManagerName ? node.ManagerName.charAt(0).toUpperCase() : <Building2 size={18} />}
                </div>
              )}

              <div className="org-card-titles">
                <div className="org-card-dept-name">
                  <span>{node.DepartmentName}</span>
                  <span className="org-code-badge">{node.DepartmentCode}</span>
                  {level === 0 && (
                    <span className="badge b-p" style={{ fontSize: '10.5px', padding: '1px 6px' }}>Cấp cao nhất</span>
                  )}
                </div>
                <div className="org-card-manager-info">
                  {node.ManagerName ? (
                    <>
                      Trưởng bộ phận: <strong>{node.ManagerName}</strong>
                      {node.ManagerPosition && <span style={{ color: '#64748b' }}> · {node.ManagerPosition}</span>}
                    </>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa bổ nhiệm trưởng bộ phận</span>
                  )}
                </div>
              </div>
            </div>

            <div className="org-card-right">
              <div
                className={`org-metric-pill ${isOverQuota ? 'warning' : 'success'}`}
                title={`Định biên nhân sự: ${node.HeadCount || 0} người`}
              >
                <Users size={14} />
                <span>
                  <strong>{node.ActualEmployeeCount || 0}</strong> / {node.HeadCount || 0} nhân sự
                </span>
              </div>

              <div className="org-card-actions">
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '6px 10px', fontSize: '12.5px', height: '32px' }}
                  onClick={() => setSelectedDeptDetail(node)}
                  title="Xem danh sách nhân sự trực thuộc"
                >
                  <Users size={14} />
                  <span>Xem nhân sự ({node.ActualEmployeeCount || 0})</span>
                </button>

                <button
                  type="button"
                  className="org-action-icon-btn"
                  onClick={() => handleOpenAddDept(node.DepartmentId)}
                  title="Thêm phòng ban con trực thuộc"
                >
                  <Plus size={15} />
                </button>

                <button
                  type="button"
                  className="org-action-icon-btn"
                  onClick={() => handleOpenTransferModal(null, node.DepartmentId)}
                  title="Gán/chuyển nhân sự vào phòng ban này"
                >
                  <ArrowRightLeft size={14} />
                </button>

                <button
                  type="button"
                  className="org-action-icon-btn"
                  onClick={() => handleOpenEditDept(node)}
                  title="Chỉnh sửa phòng ban"
                >
                  <Edit2 size={14} />
                </button>

                {level > 0 && (
                  <button
                    type="button"
                    className="org-action-icon-btn danger"
                    onClick={() => handleDeleteDept(node)}
                    title="Xóa phòng ban"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="org-children-wrapper">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="org-container">
      {alertInfo && (
        <div
          className={`badge ${alertInfo.type === 'success' ? 'b-green' : 'b-red'}`}
          style={{
            padding: '12px 18px',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '8px'
          }}
        >
          {alertInfo.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alertInfo.message}</span>
        </div>
      )}

      <div className="ph">
        <div>
          <h1>Sơ đồ cơ cấu tổ chức doanh nghiệp</h1>
          <p>Mô hình phân cấp quản trị, phòng ban, khối chuyên môn và quy mô định biên nhân sự</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={() => loadData()} title="Làm mới dữ liệu từ CSDL">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          <button className="btn" onClick={() => handleOpenPosModal()}>
            <Briefcase size={15} />
            <span>Quản lý danh mục chức vụ</span>
          </button>
          <button className="btn" onClick={() => handleOpenTransferModal()}>
            <ArrowRightLeft size={15} />
            <span>Điều chuyển nhân sự</span>
          </button>
          <button className="btn pri" onClick={() => handleOpenAddDept()}>
            <Plus size={15} />
            <span>Thêm phòng ban mới</span>
          </button>
        </div>
      </div>

      <div className="org-stats-grid">
        <div className="org-stat-card">
          <div className="org-stat-icon primary">
            <Building2 size={22} />
          </div>
          <div className="org-stat-info">
            <span>Tổng số phòng ban</span>
            <strong>{stats.totalDepartments}</strong>
          </div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon blue">
            <Users size={22} />
          </div>
          <div className="org-stat-info">
            <span>Nhân sự thực tế</span>
            <strong>{stats.totalEmployees}</strong>
          </div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon amber">
            <Layers size={22} />
          </div>
          <div className="org-stat-info">
            <span>Tổng định biên vị trí</span>
            <strong>{totalHeadCountQuota}</strong>
          </div>
        </div>

        <div className="org-stat-card">
          <div className="org-stat-icon purple">
            <Briefcase size={22} />
          </div>
          <div className="org-stat-info">
            <span>Danh mục chức vụ</span>
            <strong>{stats.totalPositions}</strong>
          </div>
        </div>
      </div>

      <div className="org-toolbar">
        <div className="org-search-box">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Tìm theo tên phòng ban, mã, trưởng phòng..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          {searchKeyword && (
            <button
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              onClick={() => setSearchKeyword('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="org-toolbar-actions">
          <button
            type="button"
            className="btn"
            style={{ fontSize: '12.5px', padding: '5px 12px' }}
            onClick={() => handleExpandAll(true)}
          >
            Mở rộng tất cả
          </button>
          <button
            type="button"
            className="btn"
            style={{ fontSize: '12.5px', padding: '5px 12px' }}
            onClick={() => handleExpandAll(false)}
          >
            Thu gọn tất cả
          </button>
          <span className="badge b-p" style={{ fontSize: '12px' }}>
            Tỷ lệ lấp đầy định biên: {quotaFillRate}%
          </span>
        </div>
      </div>

      <div className="org-tree-wrapper">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px' }} />
            <p>Đang tải cấu trúc cây cơ cấu tổ chức từ cơ sở dữ liệu...</p>
          </div>
        ) : filteredTree.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <Building2 size={36} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
            <p>Không tìm thấy phòng ban nào phù hợp với tìm kiếm.</p>
          </div>
        ) : (
          <div className="org-tree-root-container">
            {filteredTree.map(rootNode => renderTreeNode(rootNode, 0))}
          </div>
        )}
      </div>

      {isPosModalOpen && (
        <div className="org-modal-overlay">
          <div className="org-modal-content wide">
            <div className="org-modal-header">
              <h2>
                <Briefcase size={20} color="#0f766e" />
                <span>Quản lý danh mục chức vụ (Positions)</span>
              </h2>
              <button
                type="button"
                className="org-modal-close-btn"
                onClick={() => setIsPosModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="org-modal-body">
              <form onSubmit={handleSavePos} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#0f766e', fontWeight: 700 }}>
                  {posFormMode === 'create' ? '+ Thêm chức vụ mới vào hệ thống' : '✏️ Chỉnh sửa thông tin chức vụ'}
                </h3>
                <div className="org-form-row">
                  <div className="org-form-group">
                    <label>Mã chức vụ <span className="req">*</span></label>
                    <input
                      type="text"
                      className="org-form-input"
                      placeholder="VD: DEV_LEAD, HR_MGR..."
                      value={currentPos.PositionCode}
                      onChange={(e) => setCurrentPos({ ...currentPos, PositionCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="org-form-group">
                    <label>Tên chức vụ <span className="req">*</span></label>
                    <input
                      type="text"
                      className="org-form-input"
                      placeholder="VD: Trưởng nhóm Kỹ thuật"
                      value={currentPos.PositionName}
                      onChange={(e) => setCurrentPos({ ...currentPos, PositionName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="org-form-row" style={{ marginTop: '12px' }}>
                  <div className="org-form-group">
                    <label>Mức lương tối thiểu (VNĐ)</label>
                    <input
                      type="number"
                      className="org-form-input"
                      placeholder="VD: 15000000"
                      value={currentPos.BaseSalaryMin}
                      onChange={(e) => setCurrentPos({ ...currentPos, BaseSalaryMin: e.target.value })}
                    />
                  </div>
                  <div className="org-form-group">
                    <label>Mức lương tối đa (VNĐ)</label>
                    <input
                      type="number"
                      className="org-form-input"
                      placeholder="VD: 30000000"
                      value={currentPos.BaseSalaryMax}
                      onChange={(e) => setCurrentPos({ ...currentPos, BaseSalaryMax: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                  {posFormMode === 'edit' && (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setPosFormMode('create');
                        setCurrentPos({
                          PositionId: null,
                          PositionCode: '',
                          PositionName: '',
                          BaseSalaryMin: '',
                          BaseSalaryMax: ''
                        });
                      }}
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}
                  <button type="submit" className="btn pri">
                    {posFormMode === 'create' ? 'Lưu chức vụ mới' : 'Cập nhật chức vụ'}
                  </button>
                </div>
              </form>

              <div style={{ marginTop: '8px' }}>
                <h4 style={{ fontSize: '13.5px', marginBottom: '10px', color: '#1e293b' }}>
                  Danh sách chức vụ hiện tại ({positions.length})
                </h4>
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table className="org-positions-table">
                    <thead>
                      <tr>
                        <th>Mã chức vụ</th>
                        <th>Tên chức vụ</th>
                        <th>Khoảng lương (VNĐ)</th>
                        <th>Số nhân sự</th>
                        <th style={{ textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map(pos => (
                        <tr key={pos.PositionId}>
                          <td>
                            <span className="org-code-badge">{pos.PositionCode}</span>
                          </td>
                          <td>
                            <strong>{pos.PositionName}</strong>
                          </td>
                          <td>
                            {pos.BaseSalaryMin || pos.BaseSalaryMax ? (
                              <span>
                                {formatMoney(pos.BaseSalaryMin)} đ - {formatMoney(pos.BaseSalaryMax)} đ
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>Chưa thiết lập</span>
                            )}
                          </td>
                          <td>
                            <span className="badge b-blue" style={{ fontSize: '11.5px' }}>
                              {pos.EmployeeCount || 0} nhân sự
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="org-action-icon-btn"
                                onClick={() => handleEditPos(pos)}
                                title="Chỉnh sửa"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                className="org-action-icon-btn danger"
                                onClick={() => handleDeletePos(pos)}
                                title="Xóa chức vụ"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="org-modal-footer">
              <button
                type="button"
                className="btn"
                onClick={() => setIsPosModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeptModalOpen && (
        <div className="org-modal-overlay">
          <div className="org-modal-content">
            <div className="org-modal-header">
              <h2>
                <Building2 size={20} color="#0f766e" />
                <span>{deptFormMode === 'create' ? 'Thêm phòng ban mới' : 'Chỉnh sửa thông tin phòng ban'}</span>
              </h2>
              <button
                type="button"
                className="org-modal-close-btn"
                onClick={() => setIsDeptModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDept}>
              <div className="org-modal-body">
                <div className="org-form-row">
                  <div className="org-form-group">
                    <label>Mã phòng ban <span className="req">*</span></label>
                    <input
                      type="text"
                      className="org-form-input"
                      placeholder="VD: TECH, HR, MKT..."
                      value={currentDept.DepartmentCode}
                      onChange={(e) => setCurrentDept({ ...currentDept, DepartmentCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="org-form-group">
                    <label>Tên phòng ban <span className="req">*</span></label>
                    <input
                      type="text"
                      className="org-form-input"
                      placeholder="VD: Phòng Kỹ Thuật"
                      value={currentDept.DepartmentName}
                      onChange={(e) => setCurrentDept({ ...currentDept, DepartmentName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="org-form-row">
                  <div className="org-form-group">
                    <label>Phòng ban cấp trên (Trực thuộc)</label>
                    <select
                      className="org-form-select"
                      value={currentDept.ParentDepartmentId}
                      onChange={(e) => setCurrentDept({ ...currentDept, ParentDepartmentId: e.target.value })}
                    >
                      <option value="">-- Là phòng ban cấp cao nhất (Root) --</option>
                      {departments
                        .filter(d => d.DepartmentId !== currentDept.DepartmentId)
                        .map(d => (
                          <option key={d.DepartmentId} value={d.DepartmentId}>
                            {d.DepartmentName} ({d.DepartmentCode})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="org-form-group">
                    <label>Trưởng bộ phận (Manager)</label>
                    <select
                      className="org-form-select"
                      value={currentDept.ManagerEmployeeId}
                      onChange={(e) => setCurrentDept({ ...currentDept, ManagerEmployeeId: e.target.value })}
                    >
                      <option value="">-- Chưa bổ nhiệm --</option>
                      {employees.map(emp => (
                        <option key={emp.EmployeeId} value={emp.EmployeeId}>
                          {emp.FullName} - {emp.PositionName || 'Nhân viên'} ({emp.EmployeeCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="org-form-group">
                  <label>Định biên nhân sự (Số lượng nhân sự tối đa)</label>
                  <input
                    type="number"
                    min="1"
                    className="org-form-input"
                    placeholder="VD: 20"
                    value={currentDept.HeadCount}
                    onChange={(e) => setCurrentDept({ ...currentDept, HeadCount: e.target.value })}
                  />
                </div>

                <div className="org-form-group">
                  <label>Mô tả chức năng & nhiệm vụ</label>
                  <textarea
                    className="org-form-textarea"
                    placeholder="Mô tả chức năng, nhiệm vụ chuyên môn của phòng ban..."
                    value={currentDept.Description}
                    onChange={(e) => setCurrentDept({ ...currentDept, Description: e.target.value })}
                  />
                </div>
              </div>

              <div className="org-modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsDeptModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn pri">
                  {deptFormMode === 'create' ? 'Tạo phòng ban' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: CHI TIẾT PHÒNG BAN & DANH SÁCH NHÂN SỰ ================= */}
      {selectedDeptDetail && (
        <div className="org-modal-overlay">
          <div className="org-modal-content wide">
            <div className="org-modal-header">
              <h2>
                <Building2 size={20} color="#0f766e" />
                <span>
                  {selectedDeptDetail.DepartmentName} ({selectedDeptDetail.DepartmentCode})
                </span>
              </h2>
              <button
                type="button"
                className="org-modal-close-btn"
                onClick={() => setSelectedDeptDetail(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="org-modal-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: '1', minWidth: '220px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Trưởng bộ phận:</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#042f2e', marginTop: '2px' }}>
                    {selectedDeptDetail.ManagerName || 'Chưa bổ nhiệm'}
                  </div>
                  {selectedDeptDetail.ManagerPosition && (
                    <div style={{ fontSize: '12.5px', color: '#0f766e' }}>{selectedDeptDetail.ManagerPosition}</div>
                  )}
                </div>

                <div style={{ flex: '1', minWidth: '160px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Phòng ban trực thuộc:</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                    {selectedDeptDetail.ParentDepartmentName || 'Là cấp cao nhất'}
                  </div>
                </div>

                <div style={{ flex: '1', minWidth: '160px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Quy mô định biên:</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                    {selectedDeptDetail.ActualEmployeeCount || 0} / {selectedDeptDetail.HeadCount || 0} nhân sự
                  </div>
                </div>

                {selectedDeptDetail.Description && (
                  <div style={{ width: '100%', fontSize: '12.5px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <strong>Mô tả:</strong> {selectedDeptDetail.Description}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b' }}>
                  Danh sách nhân sự thuộc phòng ban ({selectedDeptDetail.employees?.length || 0})
                </h3>
                <button
                  type="button"
                  className="btn pri"
                  style={{ fontSize: '12.5px', padding: '6px 12px' }}
                  onClick={() => handleOpenTransferModal(null, selectedDeptDetail.DepartmentId)}
                >
                  <Plus size={14} />
                  <span>Gán nhân sự vào phòng này</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table className="org-positions-table">
                  <thead>
                    <tr>
                      <th>Nhân viên</th>
                      <th>Mã NV</th>
                      <th>Chức vụ</th>
                      <th>Liên hệ</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: 'right' }}>Điều chuyển</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!selectedDeptDetail.employees || selectedDeptDetail.employees.length === 0) ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                          Phòng ban hiện chưa có nhân sự trực thuộc. Hãy bấm "Gán nhân sự vào phòng này" để phân bổ nhân viên.
                        </td>
                      </tr>
                    ) : (
                      selectedDeptDetail.employees.map(emp => (
                        <tr key={emp.EmployeeId}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {emp.AvatarUrl ? (
                                <img
                                  src={emp.AvatarUrl}
                                  alt={emp.FullName}
                                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ccfbf1', color: '#0f766e', fontWeight: 700, fontSize: '12px', display: 'grid', placeItems: 'center' }}>
                                  {emp.FullName?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <strong>{emp.FullName}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="org-code-badge">{emp.EmployeeCode}</span>
                          </td>
                          <td>
                            <span className="badge b-p" style={{ fontSize: '11px' }}>
                              {emp.PositionName || 'Nhân viên'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {emp.Email && <div>{emp.Email}</div>}
                              {emp.Phone && <div>{emp.Phone}</div>}
                            </div>
                          </td>
                          <td>
                            <span className="badge b-green" style={{ fontSize: '11px' }}>
                              {emp.WorkStatus || 'Đang làm việc'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => handleOpenTransferModal(emp, selectedDeptDetail.DepartmentId)}
                              title="Điều chuyển sang phòng ban hoặc chức vụ khác"
                            >
                              <ArrowRightLeft size={13} />
                              <span>Chuyển phòng</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="org-modal-footer">
              <button
                type="button"
                className="btn"
                onClick={() => setSelectedDeptDetail(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: ĐIỀU CHUYỂN / GÁN NHÂN SỰ (HIỂN THỊ PHÍA TRƯỚC VỚI Z-INDEX CAO HƠN) ================= */}
      {isTransferModalOpen && (
        <div className="org-modal-overlay modal-top-layer">
          <div className="org-modal-content">
            <div className="org-modal-header">
              <h2>
                <ArrowRightLeft size={20} color="#0f766e" />
                <span>Gán & Điều chuyển nhân sự vào phòng ban</span>
              </h2>
              <button
                type="button"
                className="org-modal-close-btn"
                onClick={() => setIsTransferModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTransfer}>
              <div className="org-modal-body">
                <div className="org-form-group">
                  <label>Chọn nhân viên cần điều chuyển <span className="req">*</span></label>
                  <select
                    className="org-form-select"
                    value={transferData.employeeId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      const emp = employees.find(em => String(em.EmployeeId) === empId);
                      setTransferData({
                        ...transferData,
                        employeeId: empId,
                        targetDepartmentId: emp?.DepartmentId ? String(emp.DepartmentId) : transferData.targetDepartmentId,
                        targetPositionId: emp?.PositionId ? String(emp.PositionId) : transferData.targetPositionId
                      });
                    }}
                    required
                  >
                    <option value="">-- Chọn nhân viên trong doanh nghiệp --</option>
                    {employees.map(emp => (
                      <option key={emp.EmployeeId} value={emp.EmployeeId}>
                        {emp.FullName} ({emp.EmployeeCode}) - Hiện tại: {emp.DepartmentName || 'Chưa gán phòng'} / {emp.PositionName || 'Chưa gán chức vụ'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="org-form-row">
                  <div className="org-form-group">
                    <label>Phòng ban chuyển tới <span className="req">*</span></label>
                    <select
                      className="org-form-select"
                      value={transferData.targetDepartmentId}
                      onChange={(e) => setTransferData({ ...transferData, targetDepartmentId: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn phòng ban mới --</option>
                      {departments.map(d => (
                        <option key={d.DepartmentId} value={d.DepartmentId}>
                          {d.DepartmentName} ({d.DepartmentCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="org-form-group">
                    <label>Chức vụ mới</label>
                    <select
                      className="org-form-select"
                      value={transferData.targetPositionId}
                      onChange={(e) => setTransferData({ ...transferData, targetPositionId: e.target.value })}
                    >
                      <option value="">-- Giữ nguyên hoặc chọn chức vụ --</option>
                      {positions.map(p => (
                        <option key={p.PositionId} value={p.PositionId}>
                          {p.PositionName} ({p.PositionCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="org-form-group">
                  <label>Số quyết định bổ nhiệm / điều chuyển</label>
                  <input
                    type="text"
                    className="org-form-input"
                    placeholder="VD: QĐ-2026/01-BOD"
                    value={transferData.decisionNumber}
                    onChange={(e) => setTransferData({ ...transferData, decisionNumber: e.target.value })}
                  />
                </div>

                <div className="org-form-group">
                  <label>Lý do & Ghi chú điều chuyển</label>
                  <textarea
                    className="org-form-textarea"
                    placeholder="Ghi chú lý do chuyển phòng ban, căn cứ quyết định..."
                    value={transferData.note}
                    onChange={(e) => setTransferData({ ...transferData, note: e.target.value })}
                  />
                </div>
              </div>

              <div className="org-modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsTransferModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn pri">
                  Xác nhận điều chuyển
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

