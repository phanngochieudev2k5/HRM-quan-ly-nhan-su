import React, { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle2, Calendar, DollarSign, Award, Clock, RefreshCw, PenTool } from 'lucide-react';
import HrService from '../../../services/HrService';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';

export default function MyContractsView() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signingId, setSigningId] = useState(null);
  const [signSuccessMsg, setSignSuccessMsg] = useState('');

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await HrService.getMyContracts();
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const handleSign = async (contractId, contractNumber) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ký hợp đồng lao động số "${contractNumber}" không?`)) return;

    try {
      setSigningId(contractId);
      setSignSuccessMsg('');
      await HrService.signContract(contractId);
      setSignSuccessMsg(`Chúc mừng! Bạn đã ký hợp đồng điện tử thành công cho hợp đồng số ${contractNumber}!`);
      loadContracts();
    } catch (err) {
      alert(err.message || 'Lỗi khi thực hiện ký hợp đồng!');
    } finally {
      setSigningId(null);
    }
  };

  const formatVND = (val) => {
    if (!val) return '0 đ';
    return Number(val).toLocaleString('vi-VN') + ' VNĐ';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="ph">
        <div>
          <h1>Hợp đồng lao động của tôi</h1>
          <p>Xem chi tiết các điều khoản đãi ngộ, thời hạn công tác và thực hiện ký hợp đồng lao động điện tử</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={loadContracts} title="Làm mới">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {signSuccessMsg && (
        <div style={{
          padding: '14px 20px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '10px',
          color: '#065f46',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={20} color="#059669" />
          <span>{signSuccessMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
          Đang tải thông tin hợp đồng của bạn...
        </div>
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có hợp đồng lao động nào"
          description="Hợp đồng lao động của bạn đang được phòng Nhân sự soạn thảo hoặc bạn chưa có thông tin hợp đồng."
        />
      ) : (
        contracts.map(c => {
          const isPendingSign = c.Status === 'Chờ nhân viên ký' || c.Status === 'Chờ ký' || c.Status === 'Draft';

          return (
            <div
              key={c.ContractId}
              className="card"
              style={{
                border: isPendingSign ? '2px solid #38bdf8' : '1px solid #e2e8f0',
                boxShadow: isPendingSign ? '0 4px 14px rgba(14, 165, 233, 0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  background: isPendingSign ? '#f0f9ff' : '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={22} style={{ color: isPendingSign ? '#0284c7' : '#0f766e' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                      {c.ContractType || 'Hợp đồng lao động'}
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Số HĐ: <strong>{c.ContractNumber}</strong> · Nhân sự: <strong>{c.EmployeeName} ({c.EmployeeCode})</strong>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StatusBadge status={c.Status} />
                </div>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DollarSign size={14} color="#059669" />
                      <span>Mức lương chính thức (thỏa thuận)</span>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#042f2e', marginTop: '4px' }}>
                      {formatVND(c.AgreedSalary)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#0284c7" />
                      <span>Ngày bắt đầu hiệu lực</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                      {c.StartDate || 'Ngay khi ký'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#d97706" />
                      <span>Thời hạn hợp đồng</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                      {c.EndDate ? `Đến ngày ${c.EndDate}` : 'Không xác định thời hạn'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={14} color="#7c3aed" />
                      <span>Ngày ký hợp đồng</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                      {c.SignDate || (isPendingSign ? 'Chưa ký điện tử' : 'Đã ký')}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', background: '#ffffff', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#0f172a' }}>Tóm tắt cam kết & Điều khoản chung:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Người lao động cam kết thực hiện đầy đủ chức trách công việc theo mô tả vị trí.</li>
                    <li>Công ty bảo đảm chi trả tiền lương đúng hạn vào ngày mùng 5 hàng tháng cùng các chế độ bảo hiểm theo quy định pháp luật.</li>
                    <li>Hợp đồng này được bảo vệ bởi chữ ký điện tử nội bộ và có giá trị pháp lý trong toàn hệ thống Enterprise HRM.</li>
                  </ul>
                </div>

                {isPendingSign && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <PenTool size={18} color="#2563eb" />
                      <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 600 }}>
                        Vui lòng kiểm tra kỹ mức lương và điều khoản trước khi xác nhận ký điện tử.
                      </span>
                    </div>

                    <button
                      className="btn pri"
                      style={{
                        background: '#0284c7',
                        borderColor: '#0369a1',
                        padding: '10px 20px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      disabled={signingId === c.ContractId}
                      onClick={() => handleSign(c.ContractId, c.ContractNumber)}
                    >
                      <CheckCircle2 size={16} />
                      <span>{signingId === c.ContractId ? 'Đang xác nhận chữ ký...' : 'Ký hợp đồng lao động điện tử'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

