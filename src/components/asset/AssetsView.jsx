import React, { useState } from 'react';
import { Laptop, Plus, Download, Search, CheckCircle } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import SearchFilter from '../common/SearchFilter';
import StatusBadge from '../common/StatusBadge';
import { assetsData } from '../../data/mockData';

export default function AssetsView() {
  const [search, setSearch] = useState('');
  const [list, setList] = useState(assetsData);

  const filtered = list.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase()) ||
    a.assignedTo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Quản Lý Tài Sản & Thiết Bị Làm Việc"
        subtitle="Theo dõi phân bổ máy tính, trang thiết bị văn phòng cho từng nhân viên"
        breadcrumb="Tài sản / Danh mục thiết bị"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => alert('Xuất danh mục tài sản')}>
              <Download size={15} /> Xuất file
            </button>
            <button className="btn btn-primary" onClick={() => alert('Cấp phát tài sản mới')}>
              <Plus size={16} /> Cấp phát tài sản
            </button>
          </>
        }
      />

      <SearchFilter
        searchPlaceholder="Tìm theo mã tài sản, tên thiết bị, người sử dụng..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="hrm-table-container">
        <table className="hrm-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
              <th>Mã tài sản</th>
              <th>Tên thiết bị</th>
              <th>Danh mục</th>
              <th>Người đang sử dụng</th>
              <th>Ngày cấp phát</th>
              <th>Tình trạng</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.code}</td>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</td>
                <td>{item.category}</td>
                <td style={{ color: item.assignedTo === 'Chưa cấp phát' ? '#ea580c' : '#2563eb', fontWeight: 500 }}>
                  {item.assignedTo}
                </td>
                <td>{item.assignDate}</td>
                <td>{item.condition}</td>
                <td><StatusBadge status={item.status} /></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => alert(`Xem thiết bị ${item.code}`)}>
                    Thu hồi / Đổi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
