import React, { useState, useEffect, useCallback } from 'react';
import { Laptop, RefreshCw, CheckCircle2, ShieldCheck, Tag, Calendar, AlertCircle } from 'lucide-react';
import HrService from '../../../services/HrService';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';

export default function MyAssetsView() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await HrService.getMyAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="ph">
        <div>
          <h1>Trang thiết bị & Tài sản được cấp phát</h1>
          <p>Danh mục máy tính, màn hình, thẻ từ và thiết bị làm việc công ty đã bàn giao cho bạn</p>
        </div>
        <div className="ph-tools">
          <button className="btn" onClick={loadAssets} title="Làm mới">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
          Đang tải thông tin thiết bị được cấp...
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={Laptop}
          title="Chưa có thiết bị nào được cấp phát"
          description="Khi phòng Nhân sự (HR) hoàn tất thủ tục bàn giao máy tính hoặc trang thiết bị cho bạn trong Onboarding, thông tin sẽ hiển thị tại đây."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {assets.map(a => (
            <div
              key={a.AssetId}
              className="card"
              style={{
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: '#ccfbf1',
                    color: '#0f766e',
                    display: 'grid',
                    placeItems: 'center'
                  }}>
                    <Laptop size={20} />
                  </div>
                  <div>
                    <code style={{ fontSize: '11.5px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                      {a.AssetCode}
                    </code>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {a.Category}
                    </div>
                  </div>
                </div>

                <StatusBadge status={a.Status} />
              </div>

              <div>
                <h4 style={{ margin: '4px 0 0', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
                  {a.AssetName}
                </h4>
                {a.SerialNumber && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                    Serial No: <strong>{a.SerialNumber}</strong>
                  </div>
                )}
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: '#475569',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ngày bàn giao:</span>
                  <strong>{a.AssignDate || 'Hôm nay'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hiện trạng thiết bị:</span>
                  <strong style={{ color: '#0f766e' }}>{a.Condition || 'Mới 100%'}</strong>
                </div>
                {a.Notes && (
                  <div style={{ marginTop: '4px', borderTop: '1px dashed #cbd5e1', paddingTop: '4px', color: '#64748b' }}>
                    Ghi chú: {a.Notes}
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11.5px',
                color: '#059669',
                marginTop: 'auto'
              }}>
                <CheckCircle2 size={14} />
                <span>Thiết bị đang kích hoạt & bàn giao chính thức</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

