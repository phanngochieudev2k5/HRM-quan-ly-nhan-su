import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, CheckCircle2, Calendar, DollarSign, Award, Clock, RefreshCw, PenTool,
  Eye, LogOut, AlertTriangle, X, Printer, Building, User, Briefcase, FileCheck,
  XCircle, AlertCircle
} from 'lucide-react';
import HrService from '../../../services/HrService';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import '../../../styles/roles/hr/LaborContract.css';

export default function MyContractsView() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signingId, setSigningId] = useState(null);
  const [signSuccessMsg, setSignSuccessMsg] = useState('');
  const [selectedContractDetail, setSelectedContractDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isResignModalOpen, setIsResignModalOpen] = useState(false);
  const [resignTarget, setResignTarget] = useState(null);
  const [resignForm, setResignForm] = useState({
    terminateDate: '',
    reason: 'Nguyện vọng cá nhân',
    note: ''
  });
  const [submittingResign, setSubmittingResign] = useState(false);
  const [respondingId, setRespondingId] = useState(null);

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

  const getNoticePeriodDays = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('vô thời hạn') || t.includes('không xác định')) return 45;
    if (t.includes('thử việc') || t.includes('dưới 12 tháng')) return 3;
    return 30;
  };

  const getMinAllowedDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const handleOpenResignModal = (contract) => {
    const noticeDays = getNoticePeriodDays(contract.ContractType);
    const minDate = getMinAllowedDate(noticeDays);
    setResignTarget(contract);
    setResignForm({
      terminateDate: minDate,
      reason: 'Nguyện vọng phát triển sự nghiệp cá nhân',
      note: ''
    });
    setIsResignModalOpen(true);
  };

  const calculateNoticeStatus = (targetDateStr, contractType) => {
    const requiredDays = getNoticePeriodDays(contractType);
    if (!targetDateStr) {
      return { valid: false, diffDays: 0, requiredDays, minDateStr: getMinAllowedDate(requiredDays) };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(targetDateStr);
    picked.setHours(0, 0, 0, 0);
    const diffTime = picked.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      valid: diffDays >= requiredDays,
      diffDays,
      requiredDays,
      minDateStr: getMinAllowedDate(requiredDays)
    };
  };

  const handleSubmitResignation = async (e) => {
    e.preventDefault();
    if (!resignTarget) return;

    const validation = calculateNoticeStatus(resignForm.terminateDate, resignTarget.ContractType);
    if (!validation.valid) {
      alert(`Theo Điều 35 Bộ luật Lao động 2019, loại hợp đồng "${resignTarget.ContractType}" yêu cầu thời hạn báo trước tối thiểu ${validation.requiredDays} ngày. Ngày nghỉ sớm nhất bạn có thể chọn là ${validation.minDateStr}.`);
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn nộp đơn xin thôi việc kể từ ngày ${resignForm.terminateDate}? Đơn sẽ được chuyển đến Phòng Quản trị Nhân sự xem xét.`)) {
      return;
    }

    try {
      setSubmittingResign(true);
      await HrService.requestResignation(resignTarget.ContractId, resignForm);
      alert('Đã gửi đơn xin thôi việc thành công! Phòng Quản trị Nhân sự sẽ liên hệ và xử lý theo quy định.');
      setIsResignModalOpen(false);
      setResignTarget(null);
      await loadContracts();
    } catch (err) {
      alert(err.message || 'Lỗi khi gửi đơn thôi việc!');
    } finally {
      setSubmittingResign(false);
    }
  };

  const handleRespondMutualTermination = async (contractId, approved) => {
    const actionText = approved ? 'chấp thuận thỏa thuận chấm dứt hợp đồng' : 'từ chối thỏa thuận';
    const warningText = approved
      ? 'Sau khi đồng ý, hợp đồng lao động sẽ chính thức chấm dứt hiệu lực, trạng thái nhân sự chuyển sang "Đã thôi việc" và tài khoản làm việc sẽ được thu hồi sau khi hoàn tất bàn giao.'
      : 'Đề xuất chấm dứt hợp đồng từ phòng Nhân sự sẽ bị từ chối.';

    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} không?\n\nLưu ý: ${warningText}`)) {
      return;
    }

    try {
      setRespondingId(contractId);
      await HrService.respondTermination(contractId, { approved });
      alert(approved ? 'Bạn đã xác nhận đồng ý thỏa thuận chấm dứt hợp đồng thành công!' : 'Bạn đã từ chối đề xuất chấm dứt hợp đồng.');
      await loadContracts();
    } catch (err) {
      alert(err.message || 'Lỗi khi xử lý phản hồi!');
    } finally {
      setRespondingId(null);
    }
  };

  const handleOpenDetail = (contract) => {
    setSelectedContractDetail(contract);
    setIsDetailOpen(true);
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
          <p>Xem chi tiết các điều khoản đãi ngộ, thời hạn công tác, thực hiện ký điện tử và quản lý thủ tục lao động</p>
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
          const isTerminated = c.Status === 'Đã chấm dứt';
          const isMutualProposalPending = c.TerminationStatus === 'Chờ nhân viên duyệt';
          const isResignationPendingHr = c.TerminationStatus === 'Chờ HR duyệt';

          return (
            <div
              key={c.ContractId}
              className="card"
              style={{
                border: isMutualProposalPending ? '2px solid #f59e0b' : isPendingSign ? '2px solid #38bdf8' : isTerminated ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                boxShadow: isMutualProposalPending ? '0 4px 14px rgba(245, 158, 11, 0.15)' : isPendingSign ? '0 4px 14px rgba(14, 165, 233, 0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                opacity: isTerminated ? 0.85 : 1
              }}
            >
              {isMutualProposalPending && (
                <div style={{
                  background: '#fffbeb',
                  borderBottom: '2px solid #fde68a',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 700, fontSize: '14.5px' }}>
                    <AlertTriangle size={20} />
                    <span>ĐỀ XUẤT THỎA THUẬN CHẤM DỨT HỢP ĐỒNG LAO ĐỘNG TỪ DOANH NGHIỆP</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.6 }}>
                    <div><strong>Ngày chấm dứt dự kiến:</strong> {c.TerminationDate || 'Thỏa thuận'}</div>
                    <div><strong>Lý do từ Phòng Nhân sự:</strong> {c.TerminationReason || 'Hai bên thỏa thuận chấm dứt hợp đồng lao động'}</div>
                    {c.TerminationNote && <div><strong>Ghi chú bổ sung:</strong> {c.TerminationNote}</div>}
                    <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#92400e' }}>
                      Vui lòng xem xét các điều khoản và xác nhận đồng ý hoặc từ chối đề xuất này.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="btn pri"
                      style={{ background: '#059669', borderColor: '#047857' }}
                      disabled={respondingId === c.ContractId}
                      onClick={() => handleRespondMutualTermination(c.ContractId, true)}
                    >
                      <CheckCircle2 size={16} />
                      <span>{respondingId === c.ContractId ? 'Đang xác nhận...' : 'Đồng ý ký thỏa thuận thôi việc'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn"
                      style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fff' }}
                      disabled={respondingId === c.ContractId}
                      onClick={() => handleRespondMutualTermination(c.ContractId, false)}
                    >
                      <XCircle size={16} />
                      <span>Từ chối đề xuất</span>
                    </button>
                  </div>
                </div>
              )}

              {isResignationPendingHr && (
                <div style={{
                  background: '#f0fdf4',
                  borderBottom: '1px solid #bbf7d0',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#166534',
                  fontSize: '13px'
                }}>
                  <Clock size={18} color="#15803d" />
                  <div>
                    <strong>Đơn xin thôi việc của bạn đã được gửi:</strong> Ngày nghỉ việc dự kiến là <strong>{c.TerminationDate}</strong>. Yêu cầu đang được Phòng Quản trị Nhân sự xem xét và phê duyệt.
                  </div>
                </div>
              )}

              {isTerminated && (
                <div style={{
                  background: '#fef2f2',
                  borderBottom: '1px solid #fecaca',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#991b1b',
                  fontSize: '13px'
                }}>
                  <XCircle size={18} color="#dc2626" />
                  <div>
                    <strong>Hợp đồng lao động này đã chấm dứt hiệu lực:</strong> Ngày chấm dứt: <strong>{c.TerminationDate || c.EndDate}</strong>. {c.TerminationType ? `Hình thức: ${c.TerminationType}.` : ''} {c.TerminationReason ? `Lý do: ${c.TerminationReason}` : ''}
                  </div>
                </div>
              )}

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
                  <FileText size={22} style={{ color: isPendingSign ? '#0284c7' : isTerminated ? '#64748b' : '#0f766e' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: isTerminated ? '#64748b' : '#0f172a' }}>
                      {c.ContractType || 'Hợp đồng lao động'}
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Số HĐ: <strong>{c.ContractNumber}</strong> · Nhân sự: <strong>{c.EmployeeName} ({c.EmployeeCode})</strong>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StatusBadge status={c.Status} />
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '12.5px' }}
                    onClick={() => handleOpenDetail(c)}
                  >
                    <Eye size={14} />
                    <span>Xem chi tiết</span>
                  </button>
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
                      <span>Mức lương chính thức</span>
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
                  <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#0f172a' }}>Tóm tắt cam kết & Quyền lợi lao động:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Người lao động hoàn thành đầy đủ nghĩa vụ chuyên môn và tuân thủ Nội quy lao động của công ty.</li>
                    <li>Doanh nghiệp chi trả lương đầy đủ đúng kỳ hạn cùng các chế độ bảo hiểm theo Bộ luật Lao động Việt Nam.</li>
                    <li>Người lao động có quyền đơn phương chấm dứt hợp đồng nếu tuân thủ thời hạn báo trước theo Điều 35 Bộ luật Lao động 2019.</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  {isPendingSign && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      flex: '1 1 100%',
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
                          padding: '8px 18px',
                          fontSize: '13px',
                          fontWeight: 700
                        }}
                        disabled={signingId === c.ContractId}
                        onClick={() => handleSign(c.ContractId, c.ContractNumber)}
                      >
                        <CheckCircle2 size={16} />
                        <span>{signingId === c.ContractId ? 'Đang xác nhận...' : 'Ký hợp đồng điện tử'}</span>
                      </button>
                    </div>
                  )}

                  {!isTerminated && !isPendingSign && !isResignationPendingHr && !isMutualProposalPending && (
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn"
                        style={{ color: '#b45309', borderColor: '#fcd34d', background: '#fffbeb', fontSize: '12.5px' }}
                        onClick={() => handleOpenResignModal(c)}
                      >
                        <LogOut size={14} />
                        <span>Nộp đơn xin thôi việc</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {isDetailOpen && selectedContractDetail && (
        <div className="lc-modal-overlay" onClick={() => setIsDetailOpen(false)}>
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
                <button type="button" className="lc-modal-close-btn" onClick={() => setIsDetailOpen(false)}>
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
                  <StatusBadge status={selectedContractDetail.Status} />
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
                      <span>Chờ bạn xác nhận ký điện tử</span>
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
                    <span>Hồ sơ & Biên bản pháp lý chấm dứt hợp đồng đính kèm:</span>
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
              <button type="button" className="btn" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {isResignModalOpen && resignTarget && (
        <div className="lc-modal-overlay" onClick={() => !submittingResign && setIsResignModalOpen(false)}>
          <div className="lc-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="lc-modal-header">
              <h2>
                <LogOut size={18} color="#b45309" />
                <span>Nộp đơn xin thôi việc</span>
              </h2>
              <button type="button" className="lc-modal-close-btn" onClick={() => !submittingResign && setIsResignModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitResignation} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="lc-modal-body" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 24px' }}>
                {(() => {
                  const check = calculateNoticeStatus(resignForm.terminateDate, resignTarget.ContractType);
                  if (!check.valid) {
                    return (
                      <div style={{
                        padding: '10px 14px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        color: '#991b1b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <div>
                          Vui lòng báo trước tối thiểu {check.requiredDays} ngày. Ngày nghỉ sớm nhất hợp lệ: <strong>{check.minDateStr}</strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="lc-form-group">
                  <label>Ngày bắt đầu nghỉ việc dự kiến: <span className="req">*</span></label>
                  <input
                    type="date"
                    required
                    className="lc-form-input"
                    value={resignForm.terminateDate}
                    onChange={(e) => setResignForm({ ...resignForm, terminateDate: e.target.value })}
                  />
                </div>

                <div className="lc-form-group">
                  <label>Lý do xin thôi việc: <span className="req">*</span></label>
                  <select
                    className="lc-form-select"
                    value={resignForm.reason}
                    onChange={(e) => setResignForm({ ...resignForm, reason: e.target.value })}
                  >
                    <option value="Nguyện vọng phát triển sự nghiệp cá nhân">Nguyện vọng phát triển sự nghiệp cá nhân</option>
                    <option value="Chuyển đổi nơi cư trú">Chuyển đổi nơi cư trú</option>
                    <option value="Lý do sức khỏe và gia đình">Lý do sức khỏe và gia đình</option>
                    <option value="Theo học nâng cao chuyên môn">Theo học nâng cao chuyên môn</option>
                    <option value="Lý do cá nhân khác">Lý do cá nhân khác</option>
                  </select>
                </div>

                <div className="lc-form-group">
                  <label>Kế hoạch bàn giao công việc & Ghi chú thêm:</label>
                  <textarea
                    rows={4}
                    className="lc-form-textarea"
                    placeholder="Mô tả tóm tắt nội dung công việc và các tài sản dự kiến cần bàn giao..."
                    value={resignForm.note}
                    onChange={(e) => setResignForm({ ...resignForm, note: e.target.value })}
                  />
                </div>
              </div>

              <div className="lc-modal-footer">
                <button
                  type="button"
                  className="btn"
                  disabled={submittingResign}
                  onClick={() => setIsResignModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn pri"
                  style={{ background: '#d97706', borderColor: '#b45309' }}
                  disabled={submittingResign || !calculateNoticeStatus(resignForm.terminateDate, resignTarget.ContractType).valid}
                >
                  <LogOut size={15} />
                  <span>{submittingResign ? 'Đang gửi...' : 'Nộp đơn xin thôi việc'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
