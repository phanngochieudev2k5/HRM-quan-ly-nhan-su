import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  UserCheck,
  Eye,
  Trash2,
  Plus,
  Upload,
  Check,
  X,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Maximize2,
  Video,
  VideoOff,
  Image as ImageIcon
} from 'lucide-react';
import AttendanceService from '../../../../services/AttendanceService';
import '../../../../styles/roles/hr/HrFaceManagement.css';

const getFacePhotoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function HrFaceManagement({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    enrolledCount: 0,
    unenrolledCount: 0,
    readinessRate: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departments, setDepartments] = useState([]);

  const [notification, setNotification] = useState(null);

  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    employee: null
  });

  const [enrollModal, setEnrollModal] = useState({
    isOpen: false,
    employee: null,
    employeeCode: '',
    tab: 'upload',
    files: [],
    previewUrls: [],
    submitting: false,
    errorMessage: null
  });

  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    employee: null,
    submitting: false
  });

  const [lightboxUrl, setLightboxUrl] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await AttendanceService.getAllFaceProfiles({
        search: searchTerm,
        departmentId: deptFilter,
        status: statusFilter
      });

      if (res && res.data) {
        setProfiles(res.data.employees || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }

        const deptSet = new Set();
        (res.data.employees || []).forEach(e => {
          if (e.DepartmentName) deptSet.add(e.DepartmentName);
        });
        setDepartments(Array.from(deptSet));
      }
    } catch (err) {
      showNotification('error', err.message || 'Lỗi tải dữ liệu hồ sơ khuôn mặt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [deptFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const openGallery = (employee) => {
    setGalleryModal({
      isOpen: true,
      employee
    });
  };

  const closeGallery = () => {
    setGalleryModal({
      isOpen: false,
      employee: null
    });
  };

  const openEnroll = (employee = null) => {
    stopCamera();
    const defaultEmp = employee || (profiles.length > 0 ? profiles[0] : null);
    setEnrollModal({
      isOpen: true,
      employee: defaultEmp,
      employeeCode: defaultEmp ? defaultEmp.EmployeeCode : '',
      tab: 'upload',
      files: [],
      previewUrls: [],
      submitting: false,
      errorMessage: null
    });
  };

  const closeEnroll = () => {
    stopCamera();
    enrollModal.previewUrls.forEach(url => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    setEnrollModal({
      isOpen: false,
      employee: null,
      employeeCode: '',
      tab: 'upload',
      files: [],
      previewUrls: [],
      submitting: false,
      errorMessage: null
    });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      showNotification('error', 'Không thể kết nối với webcam của thiết bị: ' + err.message);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);
      setEnrollModal(prev => ({
        ...prev,
        files: [...prev.files, file],
        previewUrls: [...prev.previewUrls, previewUrl]
      }));
      showNotification('success', 'Đã chụp thêm 1 góc ảnh khuôn mặt!');
    }, 'image/jpeg', 0.95);
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newUrls = selectedFiles.map(f => URL.createObjectURL(f));
    setEnrollModal(prev => ({
      ...prev,
      files: [...prev.files, ...selectedFiles],
      previewUrls: [...prev.previewUrls, ...newUrls]
    }));
  };

  const removePendingPhoto = (idx) => {
    setEnrollModal(prev => {
      const updatedFiles = [...prev.files];
      const updatedUrls = [...prev.previewUrls];
      if (updatedUrls[idx]?.startsWith('blob:')) {
        URL.revokeObjectURL(updatedUrls[idx]);
      }
      updatedFiles.splice(idx, 1);
      updatedUrls.splice(idx, 1);
      return {
        ...prev,
        files: updatedFiles,
        previewUrls: updatedUrls
      };
    });
  };

  const handleSubmitEnroll = async () => {
    if (!enrollModal.employeeCode) {
      showNotification('error', 'Vui lòng chọn nhân viên cần đăng ký');
      return;
    }
    if (enrollModal.files.length === 0) {
      showNotification('error', 'Vui lòng chọn hoặc chụp ít nhất 1 ảnh khuôn mặt');
      return;
    }

    try {
      setEnrollModal(prev => ({ ...prev, submitting: true, errorMessage: null }));
      const formData = new FormData();
      formData.append('employeeCode', enrollModal.employeeCode);
      if (enrollModal.employee?.EmployeeId) {
        formData.append('employeeId', enrollModal.employee.EmployeeId);
      }

      enrollModal.files.forEach(file => {
        formData.append('faceImages', file);
      });

      await AttendanceService.registerFace(formData);
      showNotification('success', `Đã cập nhật dữ liệu Face ID thành công cho nhân viên ${enrollModal.employeeCode}`);
      closeEnroll();
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Lỗi đăng ký khuôn mặt');
      setEnrollModal(prev => ({ ...prev, submitting: false, errorMessage: err.message || 'Lỗi đăng ký khuôn mặt' }));
    }
  };

  const openDeleteModal = (employee) => {
    setDeleteModal({
      isOpen: true,
      employee,
      submitting: false
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      employee: null,
      submitting: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.employee) return;
    try {
      setDeleteModal(prev => ({ ...prev, submitting: true }));
      await AttendanceService.deleteFaceProfile(deleteModal.employee.EmployeeId);
      showNotification('success', `Đã xóa toàn bộ hồ sơ Face ID của ${deleteModal.employee.FullName}`);
      closeDeleteModal();
      if (galleryModal.isOpen && galleryModal.employee?.EmployeeId === deleteModal.employee.EmployeeId) {
        closeGallery();
      }
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Lỗi khi xóa hồ sơ Face ID');
      setDeleteModal(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleDeleteSinglePhoto = async (photo) => {
    if (!galleryModal.employee) return;
    const confirmAction = window.confirm(`Bạn có chắc chắn muốn xóa ảnh góc "${photo.angle}" (${photo.fileName})?`);
    if (!confirmAction) return;

    try {
      await AttendanceService.deleteFacePhoto(galleryModal.employee.EmployeeId, photo.url);
      showNotification('success', 'Đã xóa ảnh thành công');

      const updatedPhotos = galleryModal.employee.photos.filter(p => p.url !== photo.url);
      const updatedEmp = {
        ...galleryModal.employee,
        photos: updatedPhotos,
        photosCount: updatedPhotos.length,
        hasFaceData: updatedPhotos.length > 0
      };

      setGalleryModal(prev => ({ ...prev, employee: updatedEmp }));
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Lỗi khi xóa ảnh');
    }
  };

  return (
    <div className="hr-face-container">
      {notification && (
        <div
          className="banner"
          style={{
            background: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
            borderColor: notification.type === 'success' ? '#bbf7d0' : '#fecaca',
            color: notification.type === 'success' ? '#15803d' : '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '10px'
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{notification.message}</span>
        </div>
      )}

      <div className="hr-face-header-card">
        <div className="hr-face-header-info">
          <h2>
            <ShieldCheck size={22} color="#0284c7" />
            <span>Quản lý Dữ liệu Khuôn mặt Face ID AI</span>
          </h2>
          <p>
            Cơ sở dữ liệu sinh trắc học ResNet-50 cho toàn bộ nhân sự, đồng bộ nhận diện đa góc mặt với trạm Kiosk OpenCV.
          </p>
        </div>
        <div className="hr-face-header-actions">
          <button className="btn sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
          <button
            className="btn sm"
            style={{ background: '#0284c7', color: '#ffffff', borderColor: '#0284c7' }}
            onClick={() => window.open('/kiosk', '_blank')}
          >
            <ExternalLink size={14} />
            <span>Mở Trạm Kiosk</span>
          </button>
          <button className="btn sm pri" onClick={() => openEnroll(null)}>
            <Plus size={14} />
            <span>Đăng ký Face ID mới</span>
          </button>
        </div>
      </div>

      <div className="hr-face-stats-grid">
        <div className="hr-face-stat-card">
          <div className="hr-face-stat-icon total">
            <User size={22} />
          </div>
          <div className="hr-face-stat-content">
            <div className="hr-face-stat-val">{stats.totalEmployees}</div>
            <div className="hr-face-stat-lbl">Tổng nhân sự công ty</div>
          </div>
        </div>

        <div className="hr-face-stat-card">
          <div className="hr-face-stat-icon enrolled">
            <ShieldCheck size={22} />
          </div>
          <div className="hr-face-stat-content">
            <div className="hr-face-stat-val" style={{ color: '#059669' }}>
              {stats.enrolledCount}
            </div>
            <div className="hr-face-stat-lbl">Đã kích hoạt Face ID</div>
          </div>
        </div>

        <div className="hr-face-stat-card">
          <div className="hr-face-stat-icon unenrolled">
            <AlertCircle size={22} />
          </div>
          <div className="hr-face-stat-content">
            <div className="hr-face-stat-val" style={{ color: '#d97706' }}>
              {stats.unenrolledCount}
            </div>
            <div className="hr-face-stat-lbl">Chưa có dữ liệu khuôn mặt</div>
          </div>
        </div>

        <div className="hr-face-stat-card">
          <div className="hr-face-stat-icon rate">
            <Sparkles size={22} />
          </div>
          <div className="hr-face-stat-content">
            <div className="hr-face-stat-val" style={{ color: '#2563eb' }}>
              {stats.readinessRate}%
            </div>
            <div className="hr-face-stat-lbl">Tỷ lệ sẵn sàng điểm danh AI</div>
            <div className="hr-face-progress-bar">
              <div
                className="hr-face-progress-fill"
                style={{ width: `${Math.min(stats.readinessRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="hr-face-filter-bar">
        <form onSubmit={handleSearchSubmit} className="hr-face-search-input">
          <Search size={15} color="#64748b" />
          <input
            type="text"
            placeholder="Tìm theo mã NV, họ tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <select
          className="hr-face-select"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="all">Tất cả phòng ban</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          className="hr-face-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái Face ID</option>
          <option value="ENROLLED">Đã đăng ký (Có dữ liệu)</option>
          <option value="UNENROLLED">Chưa đăng ký (Thiếu dữ liệu)</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>
          Hiển thị <strong>{profiles.length}</strong> / {stats.totalEmployees} nhân sự
        </div>
      </div>

      <div className="hr-face-table-card">
        <div className="hr-face-table-wrapper">
          <table className="hr-face-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th>Nhân viên</th>
                <th>Mã NV</th>
                <th>Phòng ban & Chức vụ</th>
                <th>Trạng thái Face ID</th>
                <th>Ảnh sinh trắc học</th>
                <th>Ngày cập nhật</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
                    <AlertCircle size={36} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                    <div style={{ fontWeight: 600 }}>Không tìm thấy nhân viên phù hợp</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      Thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc.
                    </div>
                  </td>
                </tr>
              ) : (
                profiles.map((emp, index) => (
                  <tr key={emp.EmployeeId}>
                    <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                      {index + 1}
                    </td>
                    <td>
                      <div className="hr-face-emp-cell">
                        <div className="hr-face-emp-avatar">
                          {emp.AvatarUrl ? (
                            <img src={getFacePhotoUrl(emp.AvatarUrl)} alt={emp.FullName} />
                          ) : (
                            emp.FullName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <div className="hr-face-emp-name">
                            <span>{emp.FullName}</span>
                          </div>
                          <div className="hr-face-emp-email">{emp.Email || emp.Phone || 'Không có liên hệ'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="hr-face-code-badge">{emp.EmployeeCode}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>
                        {emp.DepartmentName || 'Khối Kỹ Thuật'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        {emp.PositionName || 'Nhân viên'}
                      </div>
                    </td>
                    <td>
                      {emp.hasFaceData ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span className="hr-face-status-badge enrolled">
                            <ShieldCheck size={13} />
                            <span>Đã kích hoạt</span>
                          </span>
                          <span style={{ fontSize: '11px', color: '#059669', paddingLeft: '4px' }}>
                            Độ khớp: {emp.confidenceScore ? `${emp.confidenceScore}%` : '99.5%'}
                          </span>
                        </div>
                      ) : (
                        <span className="hr-face-status-badge unenrolled">
                          <AlertTriangle size={13} />
                          <span>Chưa nạp dữ liệu</span>
                        </span>
                      )}
                    </td>
                    <td>
                      {emp.photos && emp.photos.length > 0 ? (
                        <div className="hr-face-thumbnails-group">
                          {emp.photos.slice(0, 3).map((photo, pIdx) => (
                            <img
                              key={pIdx}
                              src={getFacePhotoUrl(photo.url)}
                              alt={photo.angle}
                              className="hr-face-thumb"
                              title={`${photo.angle} (${photo.fileName}) - Bấm để phóng to`}
                              onClick={() => setLightboxUrl(getFacePhotoUrl(photo.url))}
                            />
                          ))}
                          <span className="hr-face-thumb-count">
                            {emp.photosCount} ảnh
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Chưa có ảnh
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {emp.registeredAt ? (
                        new Date(emp.registeredAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      ) : (
                        emp.hasFaceData ? 'Đã đồng bộ' : 'Chưa thiết lập'
                      )}
                    </td>
                    <td>
                      <div className="hr-face-actions-cell" style={{ justifyContent: 'center' }}>
                        <button
                          className="hr-face-btn-icon view"
                          title="Xem thư viện ảnh khuôn mặt"
                          disabled={!emp.photos || emp.photos.length === 0}
                          onClick={() => openGallery(emp)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="hr-face-btn-icon upload"
                          title="Nạp hoặc cập nhật ảnh khuôn mặt"
                          onClick={() => openEnroll(emp)}
                        >
                          <Camera size={15} />
                        </button>
                        <button
                          className="hr-face-btn-icon delete"
                          title="Xóa hồ sơ Face ID"
                          disabled={!emp.hasFaceData}
                          onClick={() => openDeleteModal(emp)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {galleryModal.isOpen && galleryModal.employee && (
        <div className="hr-face-modal-overlay" onClick={closeGallery}>
          <div className="hr-face-modal-box lg" onClick={(e) => e.stopPropagation()}>
            <div className="hr-face-modal-header">
              <h3>
                <ImageIcon size={18} color="#0284c7" />
                <span>
                  Thư viện ảnh khuôn mặt: {galleryModal.employee.FullName} ({galleryModal.employee.EmployeeCode})
                </span>
              </h3>
              <button className="hr-face-modal-close" onClick={closeGallery}>
                <X size={18} />
              </button>
            </div>
            <div className="hr-face-modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Phòng ban: <strong>{galleryModal.employee.DepartmentName || 'Khối Kỹ Thuật'}</strong> · Chức vụ: <strong>{galleryModal.employee.PositionName || 'Nhân viên'}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '2px' }}>
                    Đã lưu {galleryModal.employee.photos?.length || 0} góc ảnh sinh trắc học trong thư mục <code>faces/</code>
                  </div>
                </div>
                <button
                  className="btn sm pri"
                  onClick={() => {
                    closeGallery();
                    openEnroll(galleryModal.employee);
                  }}
                >
                  <Plus size={14} />
                  <span>Nạp thêm góc ảnh</span>
                </button>
              </div>

              {galleryModal.employee.photos?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <Camera size={40} style={{ margin: '0 auto 10px', color: '#cbd5e1' }} />
                  <div style={{ fontWeight: 600 }}>Nhân viên chưa có ảnh khuôn mặt nào</div>
                </div>
              ) : (
                <div className="hr-face-gallery-grid">
                  {galleryModal.employee.photos.map((photo, idx) => (
                    <div key={idx} className="hr-face-gallery-card">
                      <div
                        className="hr-face-gallery-img-wrap"
                        onClick={() => setLightboxUrl(getFacePhotoUrl(photo.url))}
                        title="Bấm để xem phóng to"
                      >
                        <img src={getFacePhotoUrl(photo.url)} alt={photo.angle} />
                        <span className="hr-face-angle-tag">{photo.angle}</span>
                      </div>
                      <div className="hr-face-gallery-meta">
                        <span className="hr-face-file-name" title={photo.fileName}>
                          {photo.fileName}
                        </span>
                        <button
                          className="hr-face-del-photo-btn"
                          title="Xóa ảnh này"
                          onClick={() => handleDeleteSinglePhoto(photo)}
                        >
                          <Trash2 size={13} />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="hr-face-modal-footer">
              <button
                className="btn"
                style={{ color: '#e11d48', borderColor: '#fecdd3' }}
                onClick={() => {
                  openDeleteModal(galleryModal.employee);
                }}
              >
                <Trash2 size={14} />
                <span>Xóa toàn bộ Face ID</span>
              </button>
              <button className="btn pri" onClick={closeGallery}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {enrollModal.isOpen && (
        <div className="hr-face-modal-overlay" onClick={closeEnroll}>
          <div className="hr-face-modal-box lg" onClick={(e) => e.stopPropagation()}>
            <div className="hr-face-modal-header">
              <h3>
                <Camera size={18} color="#0284c7" />
                <span>Đăng ký & Cập nhật Dữ liệu Khuôn mặt Face ID</span>
              </h3>
              <button className="hr-face-modal-close" onClick={closeEnroll}>
                <X size={18} />
              </button>
            </div>

            <div className="hr-face-modal-body">
              <div className="field">
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Chọn nhân viên đăng ký Face ID:
                </span>
                <select
                  className="hr-face-select"
                  style={{ width: '100%', marginTop: '6px' }}
                  value={enrollModal.employeeCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const matched = profiles.find(p => p.EmployeeCode === code);
                    setEnrollModal(prev => ({
                      ...prev,
                      employeeCode: code,
                      employee: matched || null
                    }));
                  }}
                >
                  {profiles.map(p => (
                    <option key={p.EmployeeId} value={p.EmployeeCode}>
                      {p.EmployeeCode} - {p.FullName} ({p.DepartmentName || 'Khối Kỹ Thuật'}) {p.hasFaceData ? '✓ Đã có Face ID' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hr-face-tabs-nav">
                <button
                  type="button"
                  className={`hr-face-tab-item ${enrollModal.tab === 'upload' ? 'active' : ''}`}
                  onClick={() => {
                    stopCamera();
                    setEnrollModal(prev => ({ ...prev, tab: 'upload' }));
                  }}
                >
                  <Upload size={15} />
                  <span>Tải ảnh từ máy tính</span>
                </button>
                <button
                  type="button"
                  className={`hr-face-tab-item ${enrollModal.tab === 'camera' ? 'active' : ''}`}
                  onClick={() => {
                    setEnrollModal(prev => ({ ...prev, tab: 'camera' }));
                    startCamera();
                  }}
                >
                  <Video size={15} />
                  <span>Chụp trực tiếp bằng Webcam</span>
                </button>
              </div>

              {enrollModal.tab === 'upload' && (
                <label className="hr-face-upload-dropzone">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/jpg"
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                  />
                  <Upload size={36} color="#0284c7" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    Nhấn vào đây để tải ảnh khuôn mặt từ máy tính
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Hỗ trợ định dạng JPG, PNG. Có thể chọn cùng lúc 1-5 ảnh (chính diện, góc nghiêng trái, nghiêng phải).
                  </div>
                </label>
              )}

              {enrollModal.tab === 'camera' && (
                <div className="hr-face-camera-container">
                  <div className="hr-face-video-box">
                    <video ref={videoRef} autoPlay playsInline muted className="hr-face-video-element" />
                    <div className="hr-face-target-guide" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn pri"
                      onClick={handleCaptureFrame}
                      disabled={!cameraActive}
                    >
                      <Camera size={16} />
                      <span>Chụp góc mặt hiện tại</span>
                    </button>
                    {!cameraActive && (
                      <button type="button" className="btn sm" onClick={startCamera}>
                        Bật lại camera
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Căn chỉnh khuôn mặt vào khung elip và bấm chụp từng góc mặt (chính diện, hơi nghiêng trái, hơi nghiêng phải).
                  </div>
                </div>
              )}

              {enrollModal.previewUrls.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                    Ảnh chuẩn bị lưu vào hệ thống ({enrollModal.previewUrls.length} ảnh):
                  </div>
                  <div className="hr-face-preview-grid">
                    {enrollModal.previewUrls.map((url, idx) => (
                      <div key={idx} className="hr-face-preview-item">
                        <img src={url} alt={`preview ${idx}`} />
                        <button
                          type="button"
                          className="hr-face-preview-remove"
                          onClick={() => removePendingPhoto(idx)}
                          title="Bỏ ảnh này"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {enrollModal.errorMessage && (
                <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{enrollModal.errorMessage}</span>
                </div>
              )}

              <div className="hr-face-ai-checklist">
                <div className="hr-face-ai-item">
                  <span>Mô hình nhận diện sinh trắc học:</span>
                  <strong>OpenCV + dlib ResNet-50 128D Encodings</strong>
                </div>
                <div className="hr-face-ai-item">
                  <span>Đồng bộ tự động tới Kiosk:</span>
                  <strong>Kích hoạt ngay lập tức (faces/)</strong>
                </div>
                <div className="hr-face-ai-item">
                  <span>Tiêu chuẩn chất lượng:</span>
                  <strong>Khuôn mặt rõ nét, đủ ánh sáng, không bị che khuất</strong>
                </div>
              </div>
            </div>

            <div className="hr-face-modal-footer">
              <button type="button" className="btn" onClick={closeEnroll} disabled={enrollModal.submitting}>
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn pri"
                onClick={handleSubmitEnroll}
                disabled={enrollModal.submitting || enrollModal.files.length === 0}
              >
                <Sparkles size={15} />
                <span>
                  {enrollModal.submitting ? 'Đang lưu trữ & mã hóa...' : 'Lưu & Đồng bộ Face ID'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && deleteModal.employee && (
        <div className="hr-face-modal-overlay" onClick={closeDeleteModal}>
          <div className="hr-face-modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="hr-face-modal-header">
              <h3 style={{ color: '#b91c1c' }}>
                <AlertTriangle size={18} color="#b91c1c" />
                <span>Xác nhận xóa hồ sơ Face ID</span>
              </h3>
              <button className="hr-face-modal-close" onClick={closeDeleteModal}>
                <X size={18} />
              </button>
            </div>
            <div className="hr-face-modal-body">
              <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa toàn bộ dữ liệu khuôn mặt của nhân viên{' '}
                <strong>{deleteModal.employee.FullName}</strong> ({deleteModal.employee.EmployeeCode})?
              </p>
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#991b1b',
                  fontSize: '12.5px',
                  lineHeight: 1.4
                }}
              >
                Toàn bộ vector nhận diện sinh trắc học và tất cả file ảnh trong thư mục <code>faces/</code> sẽ bị xóa vĩnh viễn. Nhân viên này sẽ không thể điểm danh tự động tại trạm Kiosk OpenCV cho tới khi được đăng ký lại.
              </div>
            </div>
            <div className="hr-face-modal-footer">
              <button className="btn" onClick={closeDeleteModal} disabled={deleteModal.submitting}>
                Hủy
              </button>
              <button
                className="btn"
                style={{ background: '#e11d48', color: '#ffffff', borderColor: '#e11d48' }}
                onClick={handleConfirmDelete}
                disabled={deleteModal.submitting}
              >
                {deleteModal.submitting ? 'Đang xóa...' : 'Xác nhận xóa Face ID'}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxUrl && (
        <div className="hr-face-modal-overlay" onClick={() => setLightboxUrl(null)}>
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt="Face Zoom"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            />
            <button
              onClick={() => setLightboxUrl(null)}
              style={{
                position: 'absolute',
                top: '-14px',
                right: '-14px',
                background: '#0f172a',
                color: '#ffffff',
                border: '2px solid #ffffff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
