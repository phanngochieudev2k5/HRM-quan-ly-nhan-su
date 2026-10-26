import React, { useState } from 'react';
import { Laptop, Plus, Search } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import EmptyState from '../../common/EmptyState';
import { assetsData } from '../../../data/mockData';
import '../../../styles/roles/hr/HrAssetsView.css';

export default function HrAssetsView() {
  const [assets] = useState(assetsData || []);
  const [search, setSearch] = useState('');

  const filtered = assets.filter(a =>
    !search ||
    (a.name && a.name.toLowerCase().includes(search.toLowerCase())) ||
    (a.code && a.code.toLowerCase().includes(search.toLowerCase())) ||
    (a.assignedTo && a.assignedTo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="hr-assets-container">
      <div className="ph">
        <div>
          <h1>Quản lý cấp phát & Thu hồi tài sản thiết bị</h1>
          <p>Theo dõi danh mục máy tính xách tay, màn hình, ghế công thái học cấp phát cho nhân sự</p>
        </div>
      </div>

      <div className="tbl-card">
        <div className="tbl-tools">
          <div className="search">
            <Search size={15} />
            <input
              type="text"
              className="inp"
              placeholder="Tìm theo thiết bị, mã tài sản, người sử dụng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '320px' }}
            />
          </div>
          <span className="grow"></span>
          <span className="small muted">
            Tổng cộng: <strong>{filtered.length}</strong> thiết bị
          </span>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>MÃ TÀI SẢN</th>
                <th>TÊN THIẾT BỊ</th>
                <th>PHÂN LOẠI</th>
                <th>NGƯỜI ĐANG SỬ DỤNG</th>
                <th>NGÀY CẤP PHÁT</th>
                <th>HIỆN TRẠNG</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={7}
                  icon={Laptop}
                  title="Chưa có dữ liệu tài sản thiết bị"
                  description="Danh mục cấp phát laptop, màn hình và trang thiết bị cho nhân sự sẵn sàng kết nối API."
                />
              ) : (
                filtered.map(a => (
                <tr key={a.id}>
                  <td><code>{a.code}</code></td>
                  <td><b>{a.name}</b></td>
                  <td>{a.category}</td>
                  <td>{a.assignedTo}</td>
                  <td>{a.assignDate}</td>
                  <td>{a.condition}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
