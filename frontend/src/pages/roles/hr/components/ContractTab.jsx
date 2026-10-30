import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, ExternalLink, Calendar, DollarSign, ShieldCheck } from 'lucide-react';
import ContractModal from './ContractModal';
import EmptyState from '../../../../components/common/EmptyState';

export default function ContractTab({
  employee,
  contracts = [],
  onCreateContract,
  onUpdateContract,
  onDeleteContract
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  const formatVND = (n) => `${Math.round(+n || 0).toLocaleString('vi-VN')} đ`;

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

  const handleOpenEdit = (contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleSaveContract = async (contractData) => {
    if (editingContract?.ContractId) {
      await onUpdateContract(editingContract.ContractId, contractData);
    } else {
      await onCreateContract(contractData);
    }
  };

  const handleDelete = (contract) => {
    if (window.confirm(`Xác nhận xóa hợp đồng ${contract.ContractNumber}?`)) {
      onDeleteContract(contract.ContractId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#042f2e', margin: 0 }}>
            Hợp đồng lao động ({contracts.length})
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
            Quản trị thời hạn hiệu lực, loại hợp đồng và mức lương ký kết của nhân viên
          </p>
        </div>
        <button className="btn pri" onClick={handleOpenCreate}>
          <Plus size={15} />
          <span>Thêm hợp đồng mới</span>
        </button>
      </div>

      <div className="tbl-card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>SỐ HỢP ĐỒNG</th>
                <th>LOẠI HỢP ĐỒNG</th>
                <th>NGÀY KÝ</th>
                <th>NGÀY BẮT ĐẦU</th>
                <th>NGÀY KẾT THÚC</th>
                <th className="r">LƯƠNG KÝ KẾT</th>
                <th>TRẠNG THÁI</th>
                <th>FILE ĐÍNH KÈM</th>
                <th className="act">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={9}
                  title="Chưa có hợp đồng nào cho nhân viên này"
                  description="Bấm 'Thêm hợp đồng mới' để lưu trữ thông tin hợp đồng lao động (tblContract)."
                  actionLabel="Thêm hợp đồng mới"
                  onAction={handleOpenCreate}
                />
              ) : (
                contracts.map((c) => (
                  <tr key={c.ContractId}>
                    <td>
                      <code style={{ fontWeight: 700, color: '#0f766e', fontSize: '13px' }}>
                        {c.ContractNumber}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={15} style={{ color: '#0f766e' }} />
                        <span style={{ fontWeight: 600 }}>{c.ContractType}</span>
                      </div>
                    </td>
                    <td>{c.SignDate || '-'}</td>
                    <td>{c.StartDate || '-'}</td>
                    <td>{c.EndDate ? c.EndDate : <span style={{ color: '#64748b' }}>Không thời hạn</span>}</td>
                    <td className="r">
                      <strong style={{ color: '#0f766e' }}>{formatVND(c.AgreedSalary)}</strong>
                    </td>
                    <td>{getStatusBadge(c.Status)}</td>
                    <td>
                      {c.ContractFileUrl ? (
                        <a
                          href={c.ContractFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0284c7', fontSize: '12.5px' }}
                        >
                          <ExternalLink size={13} />
                          <span>Xem file</span>
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Chưa có file</span>
                      )}
                    </td>
                    <td className="act">
                      <button
                        className="ibtn"
                        title="Chỉnh sửa hợp đồng"
                        onClick={() => handleOpenEdit(c)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="ibtn del"
                        title="Xóa hợp đồng"
                        onClick={() => handleDelete(c)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContract}
        contract={editingContract}
        employeeId={employee?.EmployeeId}
        employeeName={employee?.FullName || employee?.name}
      />
    </div>
  );
}

