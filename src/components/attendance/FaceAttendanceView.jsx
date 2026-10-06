import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Clock, ShieldCheck, UserCheck, Video, VideoOff, Settings2,
  Calendar, MapPin, Sparkles, AlertCircle
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import ConfirmModal from '../common/ConfirmModal';

export default function FaceAttendanceView({ onCheckinSuccess }) {
  // OpenCV Recognition states: 'WAITING' | 'DETECTING' | 'SUCCESS' | 'FAILED' | 'ALREADY_CHECKED_IN'
  const [detectionState, setDetectionState] = useState('SUCCESS');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [useRealWebcam, setUseRealWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const videoRef = useRef(null);

  // Confidence & detected target
  const [targetEmployee, setTargetEmployee] = useState({
    id: "EMP001",
    name: "Nguyễn Văn A",
    department: "Phòng Nhân sự",
    position: "HR Manager",
    confidence: 96.7,
    device: "Camera 01 - Cổng Chính",
    type: "Check-in (Giờ vào)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  });

  // Recent logs
  const [recentLogs, setRecentLogs] = useState([
    { time: "08:15:32", name: "Nguyễn Văn A", id: "EMP001", status: "Thành công", conf: "96.7%" },
    { time: "08:12:10", name: "Phạm Minh Đức", id: "EMP004", status: "Thành công", conf: "95.8%" },
    { time: "08:05:44", name: "Trần Thị Bích", id: "EMP002", status: "Đi muộn (+5p)", conf: "96.5%" }
  ]);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle actual webcam toggle
  useEffect(() => {
    let stream = null;
    if (useRealWebcam) {
      navigator.mediaDevices?.getUserMedia({ video: { width: 640, height: 480 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setWebcamError(null);
        })
        .catch((err) => {
          console.warn("Webcam access error:", err);
          setWebcamError("Không thể truy cập Webcam của thiết bị hoặc chưa được cấp quyền.");
          setUseRealWebcam(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useRealWebcam]);

  const triggerState = (state) => {
    setDetectionState(state);
    if (state === 'SUCCESS') {
      const nowStr = new Date().toLocaleTimeString('vi-VN');
      setRecentLogs(prev => [
        { time: nowStr, name: targetEmployee.name, id: targetEmployee.id, status: "Thành công", conf: `${targetEmployee.confidence}%` },
        ...prev.slice(0, 4)
      ]);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString('vi-VN', { hour12: false });
  const formattedDate = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div>
      <PageHeader
        title="Chấm Công Bằng Nhận Diện Khuôn Mặt (OpenCV)"
        subtitle="Hệ thống camera AI tự động nhận diện và ghi nhận thời gian chấm công theo thời gian thực"
        breadcrumb="Chấm công / Chấm công khuôn mặt"
        actions={
          <>
            <button
              className={`btn ${useRealWebcam ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setUseRealWebcam(!useRealWebcam)}
            >
              {useRealWebcam ? <VideoOff size={16} /> : <Video size={16} />}
              {useRealWebcam ? 'Tắt Webcam thiết bị' : 'Bật Webcam thật'}
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => setIsManualModalOpen(true)}
            >
              Chấm công thủ công
            </button>
          </>
        }
      />

      {/* State Quick Switcher for Testing/Demo (as per specs) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #bfdbfe',
        borderRadius: '10px',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#1e40af' }}>
          <Sparkles size={16} />
          <span>Thử nghiệm 5 trạng thái OpenCV:</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${detectionState === 'WAITING' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => triggerState('WAITING')}
          >
            1. Đang chờ (Nhìn vào camera)
          </button>
          <button
            className={`btn btn-sm ${detectionState === 'DETECTING' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => triggerState('DETECTING')}
          >
            2. Đang nhận diện...
          </button>
          <button
            className={`btn btn-sm ${detectionState === 'SUCCESS' ? 'btn-success' : 'btn-secondary'}`}
            onClick={() => triggerState('SUCCESS')}
          >
            3. Nhận diện Thành công (96.7%)
          </button>
          <button
            className={`btn btn-sm ${detectionState === 'FAILED' ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => triggerState('FAILED')}
          >
            4. Thất bại (Không nhận diện)
          </button>
          <button
            className={`btn btn-sm ${detectionState === 'ALREADY_CHECKED_IN' ? 'btn-warning' : 'btn-secondary'}`}
            onClick={() => triggerState('ALREADY_CHECKED_IN')}
          >
            5. Đã chấm công lúc HH:mm
          </button>
        </div>
      </div>

      {webcamError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '10px 14px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          {webcamError} (Hệ thống tự động sử dụng màn hình camera mô phỏng chất lượng cao)
        </div>
      )}

      {/* Main Grid: Camera Viewport on Left, Status Card & Logs on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left: Camera Frame Container */}
        <div className="hrm-card" style={{ padding: 0, overflow: 'hidden', background: '#090d16', border: '1px solid #1e293b' }}>
          {/* Camera Header Bar */}
          <div style={{
            padding: '12px 18px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }}></span>
              <span>CAMERA 01 - CỔNG CHÍNH (RTSP: 192.168.1.100)</span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
              FPS: 30.0 • RES: 1080p • OPENCV 4.10
            </div>
          </div>

          {/* Video / AI Canvas Viewport */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '420px',
            background: '#090e17',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {/* Real Webcam or Simulated Face Image */}
            {useRealWebcam ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                alt="Camera feed"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: detectionState === 'FAILED' ? 'grayscale(60%)' : 'none'
                }}
              />
            )}

            {/* Dark gradient overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle, transparent 45%, rgba(10, 15, 30, 0.7) 100%)',
              pointerEvents: 'none'
            }} />

            {/* Face Box Overlay (AI Bounding Box) */}
            {(detectionState === 'SUCCESS' || detectionState === 'DETECTING' || detectionState === 'ALREADY_CHECKED_IN') && (
              <div style={{
                position: 'absolute',
                top: '20%',
                left: '32%',
                width: '36%',
                height: '52%',
                border: `2px solid ${detectionState === 'SUCCESS' || detectionState === 'ALREADY_CHECKED_IN' ? '#22c55e' : '#3b82f6'}`,
                borderRadius: '8px',
                boxShadow: `0 0 20px ${detectionState === 'SUCCESS' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
                transition: 'all 0.3s ease'
              }}>
                {/* Corner Targeting Brackets */}
                <span style={{ position: 'absolute', top: -3, left: -3, width: 14, height: 14, borderTop: '3px solid #22c55e', borderLeft: '3px solid #22c55e' }}></span>
                <span style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderTop: '3px solid #22c55e', borderRight: '3px solid #22c55e' }}></span>
                <span style={{ position: 'absolute', bottom: -3, left: -3, width: 14, height: 14, borderBottom: '3px solid #22c55e', borderLeft: '3px solid #22c55e' }}></span>
                <span style={{ position: 'absolute', bottom: -3, right: -3, width: 14, height: 14, borderBottom: '3px solid #22c55e', borderRight: '3px solid #22c55e' }}></span>

                {/* Laser scan line */}
                {detectionState === 'DETECTING' && <div className="scanner-laser"></div>}

                {/* Tag label above face */}
                <div style={{
                  position: 'absolute',
                  top: '-26px',
                  left: 0,
                  background: detectionState === 'SUCCESS' ? '#22c55e' : '#3b82f6',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {detectionState === 'SUCCESS' && `✓ ${targetEmployee.name} (${targetEmployee.confidence}%)`}
                  {detectionState === 'DETECTING' && 'Đang quét đặc trưng khuôn mặt...'}
                  {detectionState === 'ALREADY_CHECKED_IN' && `✓ ${targetEmployee.name} (Đã chấm công)`}
                </div>
              </div>
            )}

            {/* Failure Box */}
            {detectionState === 'FAILED' && (
              <div style={{
                position: 'absolute',
                top: '22%',
                left: '32%',
                width: '36%',
                height: '52%',
                border: '2px dashed #ef4444',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(239, 68, 68, 0.15)'
              }}>
                <div style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  Không nhận diện được khuôn mặt
                </div>
              </div>
            )}

            {/* Bottom Status Banner inside Camera */}
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 20,
              right: 20,
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(6px)',
              padding: '12px 18px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff'
            }}>
              <div>
                {detectionState === 'WAITING' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                    <RefreshCw size={16} className="spin" />
                    <span>Camera đang hoạt động – Vui lòng nhìn thẳng vào camera</span>
                  </div>
                )}
                {detectionState === 'DETECTING' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
                    <RefreshCw size={16} className="spin" />
                    <span>Hệ thống AI đang trích xuất vector khuôn mặt...</span>
                  </div>
                )}
                {detectionState === 'SUCCESS' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80' }}>
                    <CheckCircle2 size={18} />
                    <span>
                      Nhận diện thành công: <strong>{targetEmployee.name} ({targetEmployee.id})</strong> - Độ tin cậy: {targetEmployee.confidence}%
                    </span>
                  </div>
                )}
                {detectionState === 'FAILED' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
                    <XCircle size={18} />
                    <span>Không tìm thấy khuôn mặt trong CSDL – Vui lòng nhìn rõ vào camera hoặc đăng ký mới</span>
                  </div>
                )}
                {detectionState === 'ALREADY_CHECKED_IN' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
                    <AlertTriangle size={18} />
                    <span>Bạn đã chấm công lúc 08:05 hôm nay!</span>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                OpenCV HOG + Dlib ResNet
              </div>
            </div>
          </div>
        </div>

        {/* Right: Clock & Real-time Check-in Result Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Live Clock Card */}
          <div className="hrm-card" style={{
            background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            padding: '24px'
          }}>
            <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 600 }}>
              Thời Gian Hệ Thống
            </div>
            <div style={{
              fontSize: '38px',
              fontWeight: 800,
              color: '#0f172a',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              margin: '6px 0'
            }}>
              {formattedTime}
            </div>
            <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: 600 }}>
              {formattedDate}
            </div>
          </div>

          {/* Recognition Result Card (Section 5 spec) */}
          <div className="hrm-card">
            <div className="card-header">
              <span className="card-title">
                <UserCheck size={18} color="#2563eb" />
                Kết quả ghi nhận chấm công
              </span>
              {detectionState === 'SUCCESS' ? (
                <span className="status-badge badge-success">✓ Đã chấm công</span>
              ) : detectionState === 'FAILED' ? (
                <span className="status-badge badge-danger">Thất bại</span>
              ) : (
                <span className="status-badge badge-gray">Chờ quét</span>
              )}
            </div>

            {detectionState === 'SUCCESS' || detectionState === 'ALREADY_CHECKED_IN' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <img
                    src={targetEmployee.avatar}
                    alt={targetEmployee.name}
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }}
                  />
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                      {targetEmployee.name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                      {targetEmployee.id} • {targetEmployee.position}
                    </div>
                    <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 500 }}>
                      {targetEmployee.department}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  rowGap: '8px',
                  fontSize: '13px',
                  background: '#f8fafc',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <span style={{ color: '#64748b' }}>Loại chấm công:</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>Check-in (Giờ vào)</span>

                  <span style={{ color: '#64748b' }}>Thời gian ghi:</span>
                  <span style={{ fontWeight: 600 }}>{formattedTime}</span>

                  <span style={{ color: '#64748b' }}>Thiết bị ghi nhận:</span>
                  <span>{targetEmployee.device}</span>

                  <span style={{ color: '#64748b' }}>Độ tin cậy AI:</span>
                  <span style={{ fontWeight: 600, color: '#2563eb' }}>{targetEmployee.confidence}% (Rất cao)</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 10px', textAlign: 'center', color: '#64748b' }}>
                <Clock size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <div>Vui lòng nhìn vào camera để hệ thống nhận diện và chấm công tự động</div>
              </div>
            )}
          </div>

          {/* Live Recent Attendance Logs */}
          <div className="hrm-card">
            <div className="card-header">
              <span className="card-title" style={{ fontSize: '14.5px' }}>
                Lượt chấm công gần nhất
              </span>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Hôm nay</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentLogs.map((log, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{log.name}</span>
                    <span style={{ color: '#64748b', marginLeft: '6px' }}>({log.id})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>{log.time}</span>
                    <span style={{ color: '#10b981', fontWeight: 500, fontSize: '11px' }}>{log.conf}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Check-in Modal */}
      <ConfirmModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Chấm công thủ công (Manual Check-in Override)"
        maxWidth="500px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsManualModalOpen(false)}>Hủy</button>
            <button
              className="btn btn-primary"
              onClick={() => {
                alert('Đã ghi nhận chấm công thủ công có lý do kiểm duyệt!');
                setIsManualModalOpen(false);
              }}
            >
              Xác nhận chấm công
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Chọn nhân viên <span className="required">*</span></label>
          <select className="form-control">
            <option>EMP001 - Nguyễn Văn A (Phòng Nhân sự)</option>
            <option>EMP002 - Trần Thị Bích (Khối Kỹ Thuật IT)</option>
            <option>EMP003 - Lê Hoàng Long (Khối Kỹ Thuật IT)</option>
            <option>EMP006 - Đỗ Gia Huy (Khối Kỹ Thuật IT)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Loại chấm công</label>
          <select className="form-control">
            <option>Check-in (Giờ vào làm)</option>
            <option>Check-out (Giờ ra về)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Lý do chấm công thủ công <span className="required">*</span></label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="VD: Quên không nhìn camera / Camera đang bảo trì bảo dưỡng / Đi công tác ngoài về..."
            defaultValue="Camera đang hiệu chuẩn độ nhạy góc nghiêng"
          />
        </div>
      </ConfirmModal>
    </div>
  );
}
