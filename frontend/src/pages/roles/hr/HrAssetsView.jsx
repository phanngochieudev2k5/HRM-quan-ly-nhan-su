import React, { useState, useEffect, useCallback } from 'react';
import { Laptop, Plus, Search, Trash2, RefreshCw, X, Save } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import HrService from '../../../services/HrService';
import '../../../styles/roles/hr/HrAssetsView.css';

export default function HrAssetsView() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    AssetCode: '',
    AssetName: '',
    Category: 'Laptop',
    SerialNumber: '',
    Status: 'Đang sử dụng',
    Condition: 'Mới 100%',
    EmployeeId: '',
    AssignDate: new Date().toISOString().slice(0, 10),
    Notes: ''
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await HrService.getAssets({
        search,
        category: categoryFilter
      });
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await HrService.getEmployees({ limit: 100 });
        const list = res?.employees || (Array.isArray(res) ? res : []);
        setEmployees(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.AssetName.trim()) return;

    try {
      setSubmitting(true);
      await HrService.createAsset({
        ...formData,
        EmployeeId: formData.EmployeeId ? parseInt(formData.EmployeeId) : null
      });
      setIsModalOpen(false);
      setFormData({
        AssetCode: '',
        AssetName: '',
        Category: 'Laptop',
        SerialNumber: '',
        Status: 'Đang sử dụng',
        Condition: 'Mới 100%',
        EmployeeId: '',
        AssignDate: new Date().toISOString().slice(0, 10),
        Notes: ''
      });
      loadData();
    } catch (err) {
      alert(err.message || 'Lỗi khi tạo tài sản thiết bị!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xác nhận xóa tài sản "${name}"?`)) return;
    try {
      await HrService.deleteAsset(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa tài sản!');
    }
  };

  return (
    <div className="hr-assets-container">
      <div className="ph">
        <div>
          <h1>Quản lý cấp phát & Thu hồi tài sản thiết bị</h1>
          <p>Theo dõi danh mục máy tính xách tay, màn hình, thẻ từ, trang thiết bị cấp phát thực tế cho nhân sự</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={loadData} title="Làm mới">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          <button className="btn pri" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Cấp phát thiết bị mới</span>
          </button>
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
          <select
            className="inp"
            style={{ width: '180px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả phân loại</option>
            <option value="Laptop">Laptop / Máy tính</option>
            <option value="Màn hình">Màn hình rời</option>
            <option value="Thẻ từ & Định danh">Thẻ từ & Thẻ NV</option>
            <option value="Phụ kiện">Phụ kiện & Thiết bị khác</option>
          </select>
          <span className="grow"></span>
          <span className="small muted">
            Tổng cộng: <strong>{assets.length}</strong> thiết bị
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
                <th className="r">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <EmptyState
                  isTable
                  colSpan={8}
                  icon={Laptop}
                  title="Chưa có dữ liệu tài sản thiết bị"
                  description="Bấm 'Cấp phát thiết bị mới' hoặc cấp phát trong quy trình tiếp nhận Onboarding để ghi nhận dữ liệu."
                />
              ) : (
                assets.map(a => (
                  <tr key={a.AssetId}>
                    <td><code>{a.AssetCode}</code></td>
                    <td>
                      <b>{a.AssetName}</b>
                      {a.SerialNumber && (
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                          S/N: {a.SerialNumber}
                        </div>
                      )}
                    </td>
                    <td>{a.Category}</td>
                    <td>
                      {a.AssignedToName ? (
                        <div>
                          <strong>{a.AssignedToName}</strong>
                          {a.EmployeeCode && (
                            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>
                              ({a.EmployeeCode})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="muted">-- Chưa cấp phát --</span>
                      )}
                    </td>
                    <td>{a.AssignDate || '-'}</td>
                    <td>{a.Condition || 'Mới 100%'}</td>
                    <td>
                      <StatusBadge status={a.Status} />
                    </td>
                    <td className="r">
                      <button
                        className="ibtn del"
                        title="Xóa tài sản"
                        onClick={() => handleDelete(a.AssetId, a.AssetName)}
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

      {isModalOpen && (
        <div className="modal-wrap" onClick={() => !submitting && setIsModalOpen(false)} style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Laptop size={18} style={{ color: '#0f766e' }} />
                <h3>Cấp phát trang thiết bị mới cho nhân sự</h3>
              </div>
              {!submitting && (
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-b" style={{ padding: '16px 20px' }}>
                <div className="form">
                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Tên thiết bị / Model: <i className="req">*</i></span>
                    <input
                      className="inp"
                      required
                      placeholder="VD: Laptop Dell Latitude 7420 (i7/16GB/512GB)"
                      value={formData.AssetName}
                      onChange={e => setFormData({ ...formData, AssetName: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Mã tài sản:</span>
                    <input
                      className="inp"
                      placeholder="Để trống để tự tạo (VD: AST001)"
                      value={formData.AssetCode}
                      onChange={e => setFormData({ ...formData, AssetCode: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Phân loại:</span>
                    <select
                      className="inp"
                      value={formData.Category}
                      onChange={e => setFormData({ ...formData, Category: e.target.value })}
                    >
                      <option value="Laptop">Laptop / Máy tính</option>
                      <option value="Màn hình">Màn hình rời</option>
                      <option value="Thẻ từ & Định danh">Thẻ từ & Thẻ NV</option>
                      <option value="Phụ kiện">Bàn phím, Chuột, Phụ kiện</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Serial Number:</span>
                    <input
                      className="inp"
                      placeholder="VD: 8JK9NM2"
                      value={formData.SerialNumber}
                      onChange={e => setFormData({ ...formData, SerialNumber: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Cấp phát cho nhân sự:</span>
                    <select
                      className="inp"
                      value={formData.EmployeeId}
                      onChange={e => setFormData({ ...formData, EmployeeId: e.target.value })}
                    >
                      <option value="">-- Chưa chỉ định nhân sự --</option>
                      {employees.map(emp => (
                        <option key={emp.EmployeeId || emp.id} value={emp.EmployeeId || emp.id}>
                          {emp.FullName || emp.name} ({emp.EmployeeCode || emp.code})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Ngày cấp phát:</span>
                    <input
                      type="date"
                      className="inp"
                      value={formData.AssignDate}
                      onChange={e => setFormData({ ...formData, AssignDate: e.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span>Tình trạng thiết bị:</span>
                    <select
                      className="inp"
                      value={formData.Condition}
                      onChange={e => setFormData({ ...formData, Condition: e.target.value })}
                    >
                      <option value="Mới 100%">Mới 100%</option>
                      <option value="Đã qua sử dụng (Tốt)">Đã qua sử dụng (Tốt)</option>
                      <option value="Bình thường">Bình thường</option>
                    </select>
                  </label>

                  <label className="field" style={{ gridColumn: 'span 2' }}>
                    <span>Ghi chú bàn giao:</span>
                    <input
                      className="inp"
                      placeholder="VD: Bàn giao kèm sạc type-C và túi chống sốc"
                      value={formData.Notes}
                      onChange={e => setFormData({ ...formData, Notes: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="modal-f" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn pri"
                  disabled={submitting}
                >
                  <Save size={16} />
                  <span>{submitting ? 'Đang lưu...' : 'Xác nhận cấp phát'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
