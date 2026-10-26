import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, CheckCircle2, Scan, RefreshCw, AlertCircle,
  MapPin, ShieldCheck, Video, VideoOff, Clock, UserCheck
} from 'lucide-react';
import '../../../styles/roles/employee/MyFaceCheckinView.css';

export default function MyFaceCheckinView() {
  const [useWebcam, setUseWebcam] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkType, setCheckType] = useState('CHECK_IN');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [recentLogs, setRecentLogs] = useState([
    { id: 1, time: '08:02:15', type: 'CHECK_IN', date: '25/04/2026', confidence: '99.4%', status: 'Hợp lệ' },
    { id: 2, time: '17:35:10', type: 'CHECK_OUT', date: '23/04/2026', confidence: '98.8%', status: 'Hợp lệ' },
    { id: 3, time: '08:01:04', type: 'CHECK_IN', date: '23/04/2026', confidence: '99.1%', status: 'Hợp lệ' }
  ]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleCamera = async () => {
    if (useWebcam) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setUseWebcam(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setUseWebcam(true);
      } catch (err) {
        alert('Không thể mở Camera thực tế hoặc quyền bị chặn. Đang sử dụng luồng camera mô phỏng OpenCV.');
        setUseWebcam(false);
      }
    }
  };

  const handleStartScan = (type) => {
    setCheckType(type);
    setScanning(true);
    setSuccess(false);

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN');
      const dateStr = now.toLocaleDateString('vi-VN');
      setScanning(false);
      setSuccess(true);
      setRecentLogs(prev => [
        {
          id: Date.now(),
          time: timeStr,
          type: type,
          date: dateStr,
          confidence: '99.6%',
          status: 'Hợp lệ'
        },
        ...prev
      ]);
    }, 1200);
  };

  return (
    <div className="face-checkin-container">
      <div className="ph">
        <div>
          <h1>Chấm công nhận diện khuôn mặt OpenCV AI</h1>
          <p>Thuật toán sinh trắc học chống giả mạo Liveness Detection · Định vị GPS Văn phòng Hà Nội</p>
        </div>
        <div className="ph-tools">
          <button
            className={`btn ${useWebcam ? 'danger' : 'teal'}`}
            onClick={toggleCamera}
          >
            {useWebcam ? <VideoOff size={15} /> : <Video size={15} />}
            <span>{useWebcam ? 'Tắt camera thực' : 'Bật camera máy tính'}</span>
          </button>
        </div>
      </div>

      <div className="grid c21">
        <div className="card">
          <div className="card-h">
            <h3>Camera nhận diện khuôn mặt</h3>
            <span className="badge b-green">{currentTime}</span>
          </div>
          <div className="card-b">
            <div className="camera-preview-box">
              {useWebcam ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-preview-video"
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <Scan size={52} style={{ color: '#4ade80', margin: '0 auto 12px' }} />
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>
                    OpenCV Camera Sẵn sàng
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Nhấn nút bên dưới để tiến hành Check-in hoặc Check-out
                  </div>
                </div>
              )}

              <div className="face-scanning-overlay">
                <div className="face-bounding-box">
                  <div className="face-bounding-box-badge">
                    Lê Hoàng Long (NV003) · 99.6%
                  </div>
                </div>
              </div>
            </div>

            {success && (
              <div className="banner mt" style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#15803d' }}>
                <CheckCircle2 size={18} />
                <span>
                  {checkType === 'CHECK_IN' ? 'Check-in (Vào ca)' : 'Check-out (Tan ca)'} thành công lúc {currentTime}! Dữ liệu đã lưu vào Bảng công tháng.
                </span>
              </div>
            )}

            <div className="row mt" style={{ gap: '12px' }}>
              <button
                className="btn pri grow"
                style={{ height: '42px', fontSize: '14px' }}
                disabled={scanning}
                onClick={() => handleStartScan('CHECK_IN')}
              >
                <Scan size={16} />
                <span>{scanning && checkType === 'CHECK_IN' ? 'Đang nhận diện...' : 'Check-in Đầu ca'}</span>
              </button>
              <button
                className="btn teal grow"
                style={{ height: '42px', fontSize: '14px' }}
                disabled={scanning}
                onClick={() => handleStartScan('CHECK_OUT')}
              >
                <Clock size={16} />
                <span>{scanning && checkType === 'CHECK_OUT' ? 'Đang nhận diện...' : 'Check-out Tan ca'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Nhật ký quét Face ID gần nhất</h3>
          </div>
          <div className="card-b">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentLogs.map((log) => (
                <div key={log.id} className="tli">
                  <span className={`badge ${log.type === 'CHECK_IN' ? 'b-green' : 'b-blue'}`}>
                    {log.type === 'CHECK_IN' ? 'VÀO' : 'RA'}
                  </span>
                  <div className="grow">
                    <b>{log.date} lúc {log.time}</b>
                    <small>Độ tin cậy: {log.confidence}</small>
                  </div>
                  <span className="badge b-p">{log.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
