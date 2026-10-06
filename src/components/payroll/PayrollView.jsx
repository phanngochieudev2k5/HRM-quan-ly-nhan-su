import React, { useState } from 'react';
import {
  DollarSign, Download, FileSpreadsheet, Eye,
  CheckCircle2, AlertCircle, ChevronDown, Printer
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import SearchFilter from '../common/SearchFilter';
import StatusBadge from '../common/StatusBadge';
import ConfirmModal from '../common/ConfirmModal';
import { payrollData } from '../../data/mockData';

export default function PayrollView({ subModule }) {
  const [activeTab, setActiveTab] = useState(subModule === 'period' ? 'period' : 'list');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('04/2025');

  React.useEffect(() => {
    if (subModule === 'period') setActiveTab('period');
    else if (subModule === 'list') setActiveTab('list');
  }, [subModule]);

  const payrollPeriods = [
    { id: 'PR202504', name: 'Kỳ lương Tháng 04/2025', range: '01/04/2025 - 30/04/2025', payDate: '05/05/2025', count: 128, total: '1.850.000.000 đ', status: 'Đang mở' },
    { id: 'PR202503', name: 'Kỳ lương Tháng 03/2025', range: '01/03/2025 - 31/03/2025', payDate: '05/04/2025', count: 126, total: '1.820.000.000 đ', status: 'Đã chi trả' },
    { id: 'PR202502', name: 'Kỳ lương Tháng 02/2025', range: '01/02/2025 - 28/02/2025', payDate: '05/03/2025', count: 124, total: '1.790.000.000 đ', status: 'Đã chi trả' },
    { id: 'PR202501', name: 'Kỳ lương Tháng 01/2025', range: '01/01/2025 - 31/01/2025', payDate: '05/02/2025', count: 120, total: '1.750.000.000 đ', status: 'Đã quyết toán' }
  ];

  const filteredPayroll = payrollData.filter(p =>
    p.empName.toLowerCase().includes(search.toLowerCase()) ||
    p.empId.toLowerCase().includes(search.toLowerCase())
  );

  const totalFund = payrollData.reduce((sum, item) => sum + item.netSalary, 0);

  return (
    <div>
      <PageHeader
        title="Bảng Tính Lương Doanh Nghiệp (Payroll)"
        subtitle="Tổng hợp dữ liệu chấm công, tăng ca, ngày nghỉ và công thức tính lương ròng"
        breadcrumb={`Lương / ${activeTab === 'period' ? 'Kỳ tính lương' : 'Bảng lương chi tiết'}`}
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => alert('Xuất file bảng lương tổng hợp!')}>
              <Download size={15} /> Xuất Excel
            </button>
            <button className="btn btn-primary" onClick={() => alert('Đã gửi thông báo bảng lương đến toàn bộ nhân viên!')}>
              <CheckCircle2 size={16} /> Chốt bảng lương tháng {selectedMonth}
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="hrm-tabs">
        <button
          className={`hrm-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <DollarSign size={16} /> Bảng lương chi tiết ({payrollData.length} nhân sự)
        </button>
        <button
          className={`hrm-tab-btn ${activeTab === 'period' ? 'active' : ''}`}
          onClick={() => setActiveTab('period')}
        >
          <FileSpreadsheet size={16} /> Các kỳ tính lương ({payrollPeriods.length})
        </button>
      </div>

      {activeTab === 'period' ? (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {payrollPeriods.map(p => (
              <div key={p.id} className="hrm-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{p.name}</h3>
                  <StatusBadge status={p.status === 'Đang mở' ? 'PENDING' : 'APPROVED'} />
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>Mã kỳ: {p.id}</div>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Thời gian chu kỳ:</span>
                    <span style={{ fontWeight: 500 }}>{p.range}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Ngày chi trả:</span>
                    <span style={{ fontWeight: 600, color: '#2563eb' }}>{p.payDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Tổng nhân sự:</span>
                    <span style={{ fontWeight: 600 }}>{p.count} người</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                    <span style={{ color: '#64748b' }}>Tổng chi trả:</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>{p.total}</span>
                  </div>
                </div>
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setActiveTab('list')}>
                    Xem bảng lương
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => alert(`Xuất file ngân hàng cho ${p.name}`)}>
                    <Download size={13} /> File Ngân hàng
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Top summary cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div className="hrm-card">
              <div style={{ fontSize: '13px', color: '#64748b' }}>Tổng quỹ lương tháng {selectedMonth}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb' }}>
                {totalFund.toLocaleString('vi-VN')} đ
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>Đã tính BHXH, Thuế TNCN</div>
            </div>
            <div className="hrm-card">
              <div style={{ fontSize: '13px', color: '#64748b' }}>Số nhân viên được chi trả</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{payrollData.length} người</div>
            </div>
            <div className="hrm-card">
              <div style={{ fontSize: '13px', color: '#64748b' }}>Trạng thái kỳ tính lương</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>Đang mở</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Hạn thanh toán: 05/05/2025</div>
            </div>
          </div>

          <SearchFilter
            searchPlaceholder="Tìm theo tên nhân viên, mã NV..."
            searchValue={search}
            onSearchChange={setSearch}
          />

      {/* Main Table */}
      <div className="hrm-table-container">
        <table className="hrm-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
              <th>Nhân viên</th>
              <th>Mã NV</th>
              <th>Phòng ban</th>
              <th>Lương cơ bản</th>
              <th>Phụ cấp</th>
              <th>Tiền tăng ca (OT)</th>
              <th>Khấu trừ (BH+Thuế)</th>
              <th style={{ color: '#059669', fontWeight: 700 }}>Thực nhận (Net)</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Phiếu lương</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayroll.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                <td>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.empName}</div>
                </td>
                <td><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{item.empId}</span></td>
                <td>{item.dept}</td>
                <td>{item.baseSalary.toLocaleString('vi-VN')} đ</td>
                <td style={{ color: '#2563eb' }}>+{item.allowance.toLocaleString('vi-VN')} đ</td>
                <td style={{ color: '#f59e0b' }}>+{item.overtimePay.toLocaleString('vi-VN')} đ</td>
                <td style={{ color: '#ef4444' }}>-{item.deduction.toLocaleString('vi-VN')} đ</td>
                <td style={{ fontSize: '14.5px', fontWeight: 700, color: '#059669' }}>
                  {item.netSalary.toLocaleString('vi-VN')} đ
                </td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedPayslip(item)}
                  >
                    <Eye size={14} /> Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
    )}

      {/* Modal Payslip Detail */}
      {selectedPayslip && (
        <ConfirmModal
          isOpen={!!selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          title={`Phiếu Lương Chi Tiết: ${selectedPayslip.empName} (${selectedPayslip.empId})`}
          maxWidth="600px"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <Printer size={15} /> In phiếu lương
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedPayslip(null)}>
                Đóng
              </button>
            </>
          }
        >
          <div style={{ border: '1px dashed #cbd5e1', padding: '20px', borderRadius: '8px', background: '#fafafa' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>CÔNG TY CỔ PHẦN CÔNG NGHỆ ENTERPRISE</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>PHIẾU BÁO LƯƠNG THÁNG {selectedPayslip.month}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', marginBottom: '16px' }}>
              <div><strong>Họ và tên:</strong> {selectedPayslip.empName}</div>
              <div><strong>Mã nhân viên:</strong> {selectedPayslip.empId}</div>
              <div><strong>Phòng ban:</strong> {selectedPayslip.dept}</div>
              <div><strong>Kỳ thanh toán:</strong> 01/04 - 30/04</div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1. Lương cơ bản theo hợp đồng:</span>
                <span style={{ fontWeight: 600 }}>{selectedPayslip.baseSalary.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                <span>2. Phụ cấp ăn trưa & trách nhiệm:</span>
                <span style={{ fontWeight: 600 }}>+{selectedPayslip.allowance.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                <span>3. Tiền làm thêm giờ (OT):</span>
                <span style={{ fontWeight: 600 }}>+{selectedPayslip.overtimePay.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                <span>4. Khấu trừ BHXH (10.5%) + Thuế:</span>
                <span style={{ fontWeight: 600 }}>-{selectedPayslip.deduction.toLocaleString('vi-VN')} VNĐ</span>
              </div>

              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '2px solid #0f172a',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 700,
                color: '#059669'
              }}>
                <span>THỰC LĨNH CHUYỂN KHOẢN (NET):</span>
                <span>{selectedPayslip.netSalary.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}
