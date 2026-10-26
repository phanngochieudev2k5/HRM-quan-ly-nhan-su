import React, { useState } from 'react';
import { Laptop, Plus, Search } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import { assetsData } from '../../../data/mockData';
import '../../../styles/roles/hr/HrAssetsView.css';

export default function HrAssetsView() {
  const [assets] = useState(assetsData);
  const [search, setSearch] = useState('');

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase()) ||
    a.assignedTo.toLowerCase().includes(search.toLowerCase())
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
              {filtered.map(a => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
