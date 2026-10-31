import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Search, Plus, Printer, RefreshCw, Eye, Edit2, Trash2,
  ExternalLink, Calendar, DollarSign, CheckCircle2, Clock, AlertTriangle, User
} from 'lucide-react';
import HrService from '../../../../services/HrService';
import ContractModal from './ContractModal';
import EmptyState from '../../../../components/common/EmptyState';

export default function AllContractsView({
  employees = [],
  onViewEmployee,
  showToast
}) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  const formatVND = (n) => `${Math.round(+n || 0).toLocaleString('vi-VN')} đ`;

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await HrService.getContracts({
        search: searchTerm,
        status: statusFilter
      });
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách hợp đồng:', err);
      if (showToast) showToast('Không thể tải danh sách hợp đồng từ CSDL!', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, showToast]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // Thống kê nhanh
  const activeCount = contracts.filter(c => c.Status === 'Hiệu lực').length;
  const expiringCount = contracts.filter(c => c.Status === 'Sắp hết hạn').length;
  const expiredCount = contracts.filter(c => c.Status === 'Hết hạn' || c.Status === 'Đã chấm dứt').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hiệu lực':
        return <span className="badge b-green">Hiệu lực</span>;
      case 'Sắp hết hạn':
        return <span className="badge b-amber">Sắp hết hạn</span>;
      case 'Hết hạn':
      case 'Đã chấm dứt':
        return <span className="badge b-red">{status}</span>;
      default:
        return <span className="badge">{status || 'Đang áp dụng'}</span>;
    }
  };

  const handleOpenCreate = () => {
    setEditingContract(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contract, e) => {
    e.stopPropagation();
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleSaveContract = async (contractData) => {
    try {
      if (editingContract?.ContractId) {
        await HrService.updateContract(editingContract.ContractId, contractData);
        if (showToast) showToast('Cập nhật hợp đồng lao động thành công!', 'success');
      } else {
        await HrService.createContract(contractData);
        if (showToast) showToast('Tạo mới hợp đồng lao động thành công!', 'success');
      }
      loadContracts();
    } catch (err) {
      if (showToast) showToast(err.message || 'Lỗi khi lưu hợp đồng!', 'error');
      throw err;
    }
  };

  const handleDeleteContract = async (contract, e) => {
    e.stopPropagation();
    if (window.confirm(`Xác nhận xóa hợp đồng ${contract.ContractNumber} của nhân viên ${contract.EmployeeName}?`)) {
      try {
        await HrService.deleteContract(contract.ContractId);
        if (showToast) showToast(`Đã xóa hợp đồng ${contract.ContractNumber} thành công!`, 'success');
        loadContracts();
      } catch (err) {
        if (showToast) showToast(err.message || 'Lỗi khi xóa hợp đồng!', 'error');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* HEADER SECTION */}
      <div className="ph" style={{ marginBottom: 0 }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, color: '#042f2e' }}>
            Quản lý Hợp đồng lao động toàn doanh nghiệp (tblContract)
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
            Dữ liệu động kết nối trực tiếp CSDL SQL Server (HRM_Enterprise_DB) qua API Backend Node.js
          </p>
        </div>

        <div className="ph-tools">
          <button className="btn" onClick={() => loadContracts()} title="Làm mới dữ liệu từ CSDL">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          <button className="btn" onClick={() => window.print()} title="In bảng danh sách hợp đồng">
            <Printer size={15} />
            <span>In danh sách</span>
          </button>
          <button className="btn pri" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Tạo hợp đồng mới</span>
          </button>
        </div>
      </div>

      {/* STAT CARDS SUMMARY */}
      <div className="grid c4" style={{ marginBottom: '2px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              TỔNG SỐ HỢP ĐỒNG
            </span>
            <FileText size={18} style={{ color: '#0f766e' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#042f2e', marginTop: '8px' }}>
            {contracts.length} <small style={{ fontSize: '12px', fontWeight: 400, color: '#64748b' }}>hợp đồng</small>
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', textTransform: 'uppercase' }}>
              ĐANG HIỆU LỰC
            </span>
            <CheckCircle2 size={18} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '8px' }}>
            {activeCount} <small style={{ fontSize: '12px', fontWeight: 400, color: '#64748b' }}>hợp đồng</small>
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#d97706', textTransform: 'uppercase' }}>
              SẮP HẾT HẠN
            </span>
            <Clock size={18} style={{ color: '#d97706' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '8px' }}>
            {expiringCount} <small style={{ fontSize: '12px', fontWeight: 400, color: '#64748b' }}>hợp đồng</small>
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', textTransform: 'uppercase' }}>
              HẾT HẠN / CHẤM DỨT
            </span>
            <AlertTriangle size={18} style={{ color: '#dc2626' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '8px' }}>
            {expiredCount} <small style={{ fontSize: '12px', fontWeight: 400, color: '#64748b' }}>hợp đồng</small>
          </div>
        </div>
      </div>

      {/* FILTER & DATA TABLE */}
      <div className="tbl-card">
        <div className="tbl-tools" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="search" style={{ minWidth: '280px' }}>
            <Search size={15} />
            <input
              className="inp"
              placeholder="Tìm theo số HĐ, tên nhân viên, mã NV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <select
            className="inp"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Hiệu lực">Hiệu lực</option>
            <option value="Sắp hết hạn">Sắp hết hạn</option>
            <option value="Hết hạn">Hết hạn</option>
            <option value="Đã chấm dứt">Đã chấm dứt</option>
          </select>

          <span className="grow"></span>

          <span className="small muted">
            Hiển thị <strong>{contracts.length}</strong> hợp đồng từ SQL Server
          </span>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>SỐ HỢP ĐỒNG</th>
                <th>NHÂN VIÊN</th>
                <th>LOẠI HỢP ĐỒNG</th>
                <th>NGÀY KÝ</th>
                <th>NGÀY BẮT ĐẦU</th>
                <th>NGÀY KẾT THÚC</th>
                <th className="r">LƯƠNG HỢP ĐỒNG</th>
                <th>TRẠNG THÁI</th>
                <th>FILE ĐÍNH KÈM</th>
                <th className="act">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div className="status-dot-pulse" style={{ background: '#0f766e' }}></div>
                      <span>Đang tải danh sách hợp đồng từ CSDL SQL Server...</span>
                    </div>
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={10}
                  title="Không tìm thấy hợp đồng lao động nào"
                  description="Bấm 'Tạo hợp đồng mới' để thêm hợp đồng mới vào CSDL SQL Server (tblContract)."
                  actionLabel="Tạo hợp đồng mới"
                  onAction={handleOpenCreate}
                />
              ) : (
                contracts.map((c) => (
                  <tr
                    key={c.ContractId}
                    className="click"
                    onClick={() => {
                      if (onViewEmployee) {
                        onViewEmployee({
                          EmployeeId: c.EmployeeId,
                          id: c.EmployeeCode,
                          name: c.EmployeeName
                        });
                      }
                    }}
                  >
                    <td>
                      <code style={{ fontWeight: 700, color: '#0f766e', fontSize: '13px' }}>
                        {c.ContractNumber}
                      </code>
                    </td>
                    <td>
                      <div className="who">
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                          {c.EmployeeName ? c.EmployeeName.split(' ').slice(-1)[0][0] : 'N'}
                        </div>
                        <div>
                          <b style={{ color: '#0f172a' }}>{c.EmployeeName}</b>
                          <small style={{ color: '#64748b' }}>Mã: {c.EmployeeCode}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: '#1e293b' }}>{c.ContractType}</span>
                    </td>
                    <td>{c.SignDate || '-'}</td>
                    <td>{c.StartDate || '-'}</td>
                    <td>
                      {c.EndDate ? (
                        c.EndDate
                      ) : (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>Không thời hạn</span>
                      )}
                    </td>
                    <td className="r">
                      <strong style={{ color: '#0f766e' }}>{formatVND(c.AgreedSalary)}</strong>
                    </td>
                    <td>{getStatusBadge(c.Status)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {c.ContractFileUrl ? (
                        <a
                          href={c.ContractFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#0284c7',
                            fontSize: '12.5px',
                            fontWeight: 500
                          }}
                        >
                          <ExternalLink size={13} />
                          <span>Xem file</span>
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Chưa có file</span>
                      )}
                    </td>
                    <td className="act" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="ibtn"
                        title="Xem hồ sơ 360° nhân viên"
                        onClick={() => {
                          if (onViewEmployee) {
                            onViewEmployee({
                              EmployeeId: c.EmployeeId,
                              id: c.EmployeeCode,
                              name: c.EmployeeName
                            });
                          }
                        }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="ibtn"
                        title="Chỉnh sửa hợp đồng"
                        onClick={(e) => handleOpenEdit(c, e)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="ibtn del"
                        title="Xóa hợp đồng"
                        onClick={(e) => handleDeleteContract(c, e)}
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

      {/* MODAL THÊM / SỬA HỢP ĐỒNG */}
      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContract}
        contract={editingContract}
        employees={employees}
      />
    </div>
  );
}

