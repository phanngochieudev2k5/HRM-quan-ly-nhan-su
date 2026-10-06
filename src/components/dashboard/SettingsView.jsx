import React, { useState } from 'react';
import { Settings, Shield, Camera, Clock, Save, Check } from 'lucide-react';
import PageHeader from '../common/PageHeader';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'rbac' | 'general'
  const [saved, setSaved] = useState(false);

  const [cameraConfig, setCameraConfig] = useState({
    streamUrl: 'rtsp://admin:hrm123456@192.168.1.100:554/ch0_0.264',
    confidenceThreshold: 90,
    faceModel: 'ResNet-34 128D Embedding (OpenCV + Dlib)',
    fpsLimit: 30,
    saveSnapshots: true,
    antiSpoofing: true
  });

  const [workConfig, setWorkConfig] = useState({
    workStart: '08:00',
    workEnd: '17:30',
    graceMinutes: 15, // Cho phép muộn 15p
    overtimeMinHours: 1
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <PageHeader
        title="Cài Đặt Hệ Thống & Cấu Hình Nhận Diện OpenCV"
        subtitle="Quản lý thông số phần cứng camera, phân quyền người dùng và chính sách doanh nghiệp"
        breadcrumb="Cài đặt / Cấu hình"
        actions={
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={15} /> Lưu toàn bộ cấu hình
          </button>
        }
      />

      {saved && (
        <div className="toast-notice">
          <Check size={18} color="#4ade80" />
          <span>Cấu hình hệ thống đã được cập nhật thành công!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="hrm-tabs">
        <button
          className={`hrm-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => setActiveTab('camera')}
        >
          <Camera size={16} />
          Cấu hình Camera OpenCV
        </button>
        <button
          className={`hrm-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <Clock size={16} />
          Chính sách giờ làm việc
        </button>
        <button
          className={`hrm-tab-btn ${activeTab === 'rbac' ? 'active' : ''}`}
          onClick={() => setActiveTab('rbac')}
        >
          <Shield size={16} />
          Ma trận phân quyền (RBAC)
        </button>
      </div>

      {activeTab === 'camera' && (
        <div className="hrm-card" style={{ maxWidth: '800px' }}>
          <div className="card-header">
            <span className="card-title">
              <Camera size={18} color="#2563eb" />
              Thông số kết nối OpenCV & AI Face Engine
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Địa chỉ luồng RTSP Camera chính (Gate 1)</label>
              <input
                type="text"
                className="form-control"
                value={cameraConfig.streamUrl}
                onChange={e => setCameraConfig({ ...cameraConfig, streamUrl: e.target.value })}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Hỗ trợ luồng H.264 / H.265 từ Camera IP Dahua, Hikvision, v.v.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  Ngưỡng tin cậy chấp nhận nhận diện: <strong>{cameraConfig.confidenceThreshold}%</strong>
                </label>
                <input
                  type="range"
                  min="80"
                  max="99"
                  value={cameraConfig.confidenceThreshold}
                  onChange={e => setCameraConfig({ ...cameraConfig, confidenceThreshold: Number(e.target.value) })}
                  style={{ width: '100%', marginTop: '8px' }}
                />
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Khuyến nghị 90% - 95% để tránh nhận diện nhầm</span>
              </div>

              <div className="form-group">
                <label className="form-label">Giới hạn FPS xử lý</label>
                <select
                  className="form-control"
                  value={cameraConfig.fpsLimit}
                  onChange={e => setCameraConfig({ ...cameraConfig, fpsLimit: Number(e.target.value) })}
                >
                  <option value={15}>15 FPS (Tiết kiệm CPU)</option>
                  <option value={30}>30 FPS (Mượt mà tiêu chuẩn)</option>
                  <option value={60}>60 FPS (Thời gian thực tốc độ cao)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mô hình AI trích xuất Face Embeddings</label>
              <input
                type="text"
                className="form-control"
                value={cameraConfig.faceModel}
                readOnly
                style={{ background: '#f8fafc' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px' }}>
                <input
                  type="checkbox"
                  checked={cameraConfig.saveSnapshots}
                  onChange={e => setCameraConfig({ ...cameraConfig, saveSnapshots: e.target.checked })}
                />
                <span>Tự động chụp lại ảnh bằng chứng khi điểm danh thành công</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px' }}>
                <input
                  type="checkbox"
                  checked={cameraConfig.antiSpoofing}
                  onChange={e => setCameraConfig({ ...cameraConfig, antiSpoofing: e.target.checked })}
                />
                <span>Bật tính năng Chống giả mạo ảnh / video (Anti-Spoofing Liveness Detection)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'general' && (
        <div className="hrm-card" style={{ maxWidth: '800px' }}>
          <div className="card-header">
            <span className="card-title">Chính sách thời gian làm việc & Đi muộn</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Giờ bắt đầu làm việc</label>
              <input
                type="time"
                className="form-control"
                value={workConfig.workStart}
                onChange={e => setWorkConfig({ ...workConfig, workStart: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giờ kết thúc làm việc</label>
              <input
                type="time"
                className="form-control"
                value={workConfig.workEnd}
                onChange={e => setWorkConfig({ ...workConfig, workEnd: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Thời gian ân hạn đi muộn (phút)</label>
              <input
                type="number"
                className="form-control"
                value={workConfig.graceMinutes}
                onChange={e => setWorkConfig({ ...workConfig, graceMinutes: Number(e.target.value) })}
              />
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Đến sau giờ này sẽ tự động đánh dấu [Đi muộn]</span>
            </div>

            <div className="form-group">
              <label className="form-label">Số giờ làm thêm tối thiểu được tính OT (giờ)</label>
              <input
                type="number"
                className="form-control"
                value={workConfig.overtimeMinHours}
                onChange={e => setWorkConfig({ ...workConfig, overtimeMinHours: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rbac' && (
        <div className="hrm-card">
          <div className="card-header">
            <span className="card-title">Phân quyền theo vai trò (RBAC Matrix)</span>
          </div>

          <div className="hrm-table-container">
            <table className="hrm-table">
              <thead>
                <tr>
                  <th>Chức năng hệ thống</th>
                  <th style={{ textAlign: 'center' }}>Admin</th>
                  <th style={{ textAlign: 'center' }}>HR Manager</th>
                  <th style={{ textAlign: 'center' }}>Team Manager</th>
                  <th style={{ textAlign: 'center' }}>Finance</th>
                  <th style={{ textAlign: 'center' }}>Nhân viên</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Quản lý nhân sự & Thêm/Sửa/Xóa hồ sơ', admin: true, hr: true, mgr: false, fin: false, emp: false },
                  { name: 'Chấm công nhận diện khuôn mặt OpenCV', admin: true, hr: true, mgr: true, fin: true, emp: true },
                  { name: 'Đăng ký vector khuôn mặt nhân viên', admin: true, hr: true, mgr: false, fin: false, emp: false },
                  { name: 'Phê duyệt đơn xin nghỉ phép', admin: true, hr: true, mgr: true, fin: false, emp: false },
                  { name: 'Phê duyệt yêu cầu làm thêm giờ (OT)', admin: true, hr: true, mgr: true, fin: false, emp: false },
                  { name: 'Bảng lương & Chốt kỳ thanh toán', admin: true, hr: false, mgr: false, fin: true, emp: false },
                  { name: 'Cấu hình camera & Hệ thống', admin: true, hr: false, mgr: false, fin: false, emp: false }
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{row.name}</td>
                    <td style={{ textAlign: 'center' }}>{row.admin ? '✅' : '—'}</td>
                    <td style={{ textAlign: 'center' }}>{row.hr ? '✅' : '—'}</td>
                    <td style={{ textAlign: 'center' }}>{row.mgr ? '✅' : '—'}</td>
                    <td style={{ textAlign: 'center' }}>{row.fin ? '✅' : '—'}</td>
                    <td style={{ textAlign: 'center' }}>{row.emp ? '✅ (Cá nhân)' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
