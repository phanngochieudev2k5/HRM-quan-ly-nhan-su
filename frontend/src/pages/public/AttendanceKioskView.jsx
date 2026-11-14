import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, Video, VideoOff, CheckCircle2, AlertCircle, Clock,
  UserCheck, ShieldCheck, Sparkles, Terminal, RefreshCw,
  ArrowRight, Users, ChevronRight, LogIn, LogOut, AlertTriangle, Upload
} from 'lucide-react';
import AttendanceService from '../../services/AttendanceService';
import '../../styles/public/AttendanceKioskView.css';

export default function AttendanceKioskView() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  const [useWebcam, setUseWebcam] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [todayEvents, setTodayEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [opencvLaunching, setOpencvLaunching] = useState(false);
  const [releasingCamera, setReleasingCamera] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [attendanceMode, setAttendanceMode] = useState('CHECK_IN');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const testFileInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('vi-VN'));
      setCurrentDate(now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDevices = async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(inputs);
        if (inputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(inputs[0].deviceId);
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const loadTodayEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await AttendanceService.getTodayEvents();
      const list = (res?.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
      setTodayEvents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadTodayEvents();
    const pollInterval = setInterval(() => {
      loadTodayEvents();
    }, 6000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startWebcam = async (overrideDeviceId) => {
    setCameraError(null);
    setScanError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Trình duyệt không hỗ trợ WebRTC Camera. Vui lòng mở trang trên Google Chrome hoặc Microsoft Edge.');
      return;
    }

    const devId = overrideDeviceId || selectedDeviceId;

    try {
      let stream = null;
      try {
        const constraints = devId
          ? { video: { deviceId: { exact: devId } } }
          : { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {}
      }
      setUseWebcam(true);
      setCameraError(null);
      await loadDevices();
    } catch (err) {
      setUseWebcam(false);
      console.error(err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Trình duyệt chưa được cấp quyền sử dụng Camera. Vui lòng bấm vào biểu tượng Ổ khóa / Camera ở thanh địa chỉ URL (bên trái localhost:3000) -> Cho phép (Allow) máy ảnh -> Tải lại trang (F5).');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera đang bị chiếm dụng bởi ứng dụng khác (ví dụ: tiến trình OpenCV Python hoặc Spyder, Zoom, Teams đang chạy ngầm). Bạn hãy tắt ứng dụng đó hoặc bấm nút "Giải phóng Camera" bên dưới.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Không tìm thấy thiết bị Webcam trên máy tính này. Bạn có thể dùng nút "Tải ảnh quét test" bên dưới hoặc mở ứng dụng Python OpenCV độc lập.');
      } else {
        setCameraError('Không thể mở Camera thiết bị: ' + (err.message || 'Lỗi thiết bị'));
      }
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setUseWebcam(false);
    setCameraError(null);
  };

  const toggleWebcam = () => {
    if (useWebcam) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  const handleReleaseCamera = async () => {
    try {
      setReleasingCamera(true);
      await AttendanceService.stopOpenCv();
      setTimeout(async () => {
        await startWebcam();
        setReleasingCamera(false);
      }, 700);
    } catch (err) {
      setReleasingCamera(false);
      setCameraError('Không thể tự động đóng tiến trình: ' + (err.message || 'Lỗi') + '. Bạn vui lòng nhấn phím ESC trên cửa sổ OpenCV hoặc tắt phần mềm camera đang chạy.');
    }
  };

  const handleScanFace = async (overrideMode) => {
    const mode = overrideMode || attendanceMode;
    setScanError(null);

    if (!useWebcam || !videoRef.current || !streamRef.current) {
      setScanError('Camera chưa được bật! Vui lòng nhấn "Bật Webcam Web" để mở camera trước khi quét mặt.');
      return;
    }

    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      setScanError('Camera đang khởi động luồng hình ảnh, vui lòng đợi 1 giây rồi bấm quét lại.');
      return;
    }

    try {
      setScanning(true);

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.88);

      const res = await AttendanceService.recognizeFrame(imageBase64, mode);

      if (res?.data) {
        setSuccessData(res.data);
        setScanError(null);
        loadTodayEvents();
        setTimeout(() => {
          setSuccessData(null);
        }, 5000);
      } else {
        setScanError('Không thể nhận diện khuôn mặt.');
      }
    } catch (err) {
      setScanError(err.message || 'Không thể nhận diện khuôn mặt trong camera.');
    } finally {
      setScanning(false);
    }
  };

  const handleTestFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    setScanning(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const imageBase64 = reader.result;
        const res = await AttendanceService.recognizeFrame(imageBase64, attendanceMode);
        if (res?.data) {
          setSuccessData(res.data);
          setScanError(null);
          loadTodayEvents();
          setTimeout(() => {
            setSuccessData(null);
          }, 5000);
        } else {
          setScanError('Không nhận diện được khuôn mặt từ file ảnh.');
        }
      } catch (err) {
        setScanError(err.message || 'Không thể nhận diện khuôn mặt từ ảnh tải lên.');
      } finally {
        setScanning(false);
        if (testFileInputRef.current) {
          testFileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setScanError('Lỗi đọc file ảnh từ máy.');
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const handleManualCheckin = async (e) => {
    e.preventDefault();
    setScanError(null);

    const code = manualCode.trim();
    if (!code) {
      setScanError('Vui lòng nhập mã nhân viên hoặc tên để điểm danh thủ công.');
      return;
    }

    setScanning(true);
    try {
      const res = await AttendanceService.checkIn({
        employeeCode: code,
        checkinMethod: 'MANUAL_CODE',
        deviceName: 'Kiosk Cổng Chính',
        mode: attendanceMode
      });

      if (res?.data) {
        setSuccessData(res.data);
        setManualCode('');
        setScanError(null);
        loadTodayEvents();
        setTimeout(() => {
          setSuccessData(null);
        }, 5000);
      }
    } catch (err) {
      setScanError(err.message || 'Điểm danh thất bại!');
    } finally {
      setScanning(false);
    }
  };

  const formatTimeDisplay = (val) => {
    if (!val) return '---';
    const str = String(val).trim();
    if (str.length <= 8 && str.includes(':')) return str;
    if (str.startsWith('Fri ') || str.startsWith('Mon ') || str.startsWith('Tue ') || str.startsWith('Wed ') || str.startsWith('Thu ') || str.startsWith('Sat ') || str.startsWith('Sun ')) {
      const parts = str.split(' ');
      const timeMatch = parts.find(p => p.includes(':'));
      if (timeMatch) return timeMatch.slice(0, 8);
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    }
    return str.slice(0, 8);
  };

  const handleLaunchOpenCv = async () => {
    try {
      setOpencvLaunching(true);
      const res = await AttendanceService.launchOpenCv();
      alert(res?.message || 'Đã gửi lệnh khởi động ứng dụng nhận diện OpenCV!');
    } catch (err) {
      alert('Không thể khởi chạy script Python OpenCV từ trình duyệt: ' + err.message);
    } finally {
      setOpencvLaunching(false);
    }
  };

  return (
    <div className="kiosk-root">
      <header className="kiosk-header">
        <div className="kiosk-brand">
          <div className="kiosk-logo-badge">
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <h1>SMART HRM · KIOSK ĐIỂM DANH SINH TRẮC HỌC</h1>
            <p>Hệ thống nhận diện khuôn mặt OpenCV AI · Chuẩn xác 99.5%</p>
          </div>
        </div>

        <div className="kiosk-clock-block">
          <div className="kiosk-clock-time">{currentTime}</div>
          <div className="kiosk-clock-date">{currentDate}</div>
        </div>
      </header>

      <main className="kiosk-content">
        <div className="kiosk-camera-card">
          <div className="kiosk-card-header">
            <h2>
              <Camera size={19} color="#38bdf8" />
              <span>Camera nhận diện Kiosk</span>
            </h2>
            <div className="kiosk-live-badge">
              <span className="kiosk-pulse-dot" />
              <span>Ca chuẩn: 08:00 - 17:30</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <button
              type="button"
              className={`kiosk-btn ${attendanceMode === 'CHECK_IN' ? 'kiosk-btn-teal' : 'kiosk-btn-secondary'}`}
              style={{
                padding: '10px 14px',
                fontSize: '13.5px',
                border: attendanceMode === 'CHECK_IN' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'
              }}
              onClick={() => {
                setAttendanceMode('CHECK_IN');
                if (useWebcam) handleScanFace('CHECK_IN');
              }}
            >
              <LogIn size={17} />
              <span>1. Chấm công Vào ca</span>
            </button>

            <button
              type="button"
              className={`kiosk-btn ${attendanceMode === 'CHECK_OUT' ? 'kiosk-btn-danger' : 'kiosk-btn-secondary'}`}
              style={{
                padding: '10px 14px',
                fontSize: '13.5px',
                background: attendanceMode === 'CHECK_OUT' ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' : undefined,
                border: attendanceMode === 'CHECK_OUT' ? '2px solid #fb923c' : '1px solid rgba(255,255,255,0.1)'
              }}
              onClick={() => {
                setAttendanceMode('CHECK_OUT');
                if (useWebcam) handleScanFace('CHECK_OUT');
              }}
            >
              <LogOut size={17} />
              <span>2. Chấm công Ra về</span>
            </button>
          </div>

          <div className="kiosk-camera-wrapper">
            <div className="kiosk-scanning-grid" />
            <div className={`kiosk-face-reticle ${useWebcam ? 'active' : ''}`}>
              <div className="kiosk-scan-laser" />
            </div>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="kiosk-video"
              style={{ display: useWebcam ? 'block' : 'none' }}
            />

            {!useWebcam && (
              <div className="kiosk-placeholder">
                <Camera size={56} color="#38bdf8" />
                <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '16px' }}>
                  Camera Kiosk đang ở chế độ chờ
                </div>
                {cameraError ? (
                  <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '16px 20px', maxWidth: '480px', color: '#fca5a5', fontSize: '13px', textAlign: 'left', margin: '12px 0', lineHeight: 1.55 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '8px', color: '#f87171', fontSize: '14px' }}>
                      <AlertTriangle size={18} />
                      <span>Thông báo truy cập Camera</span>
                    </div>
                    <div>{cameraError}</div>

                    {videoDevices.length > 1 && (
                      <div style={{ marginTop: '12px' }}>
                        <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                          Chọn thiết bị Camera khác:
                        </label>
                        <select
                          value={selectedDeviceId}
                          onChange={(e) => {
                            setSelectedDeviceId(e.target.value);
                            startWebcam(e.target.value);
                          }}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)', fontSize: '12.5px' }}
                        >
                          {videoDevices.map((d, i) => (
                            <option key={d.deviceId || i} value={d.deviceId}>
                              {d.label || `Camera ${i + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button className="kiosk-btn kiosk-btn-teal" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => startWebcam()}>
                        <RefreshCw size={14} />
                        <span>Thử lại kết nối Camera</span>
                      </button>

                      <button className="kiosk-btn kiosk-btn-danger" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={handleReleaseCamera} disabled={releasingCamera}>
                        <ShieldCheck size={14} />
                        <span>{releasingCamera ? 'Đang giải phóng...' : 'Giải phóng Camera (Đóng OpenCV)'}</span>
                      </button>

                      <button className="kiosk-btn kiosk-btn-secondary" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => testFileInputRef.current?.click()}>
                        <Upload size={14} />
                        <span>Tải ảnh quét test</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', maxWidth: '400px', lineHeight: 1.5 }}>
                    Bấm <strong>"Bật Webcam Web"</strong> bên dưới để mở camera nhận diện trực tiếp, hoặc chọn ảnh từ máy để quét kiểm tra AI.
                  </div>
                )}
              </div>
            )}

            {scanError && (
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', background: 'rgba(185, 28, 28, 0.94)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', zIndex: 30, animation: 'kioskFadeIn 0.2s ease', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>{scanError}</div>
                <button style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }} onClick={() => setScanError(null)}>✕</button>
              </div>
            )}

            {successData && (
              <div className="kiosk-success-modal">
                <div className="kiosk-success-card">
                  <div className="kiosk-success-icon" style={{
                    background: successData.action === 'ALREADY_CHECKED_IN'
                      ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                      : (successData.action === 'CHECK_OUT'
                          ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
                          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)')
                  }}>
                    {successData.action === 'ALREADY_CHECKED_IN' ? <AlertCircle size={44} /> : <CheckCircle2 size={44} />}
                  </div>
                  <h3>
                    {successData.action === 'ALREADY_CHECKED_IN'
                      ? 'ĐÃ GHI NHẬN VÀO CA TRƯỚC ĐÓ!'
                      : (successData.action === 'CHECK_IN' ? 'CHẤM CÔNG VÀO CA THÀNH CÔNG!' : 'CHẤM CÔNG RA VỀ THÀNH CÔNG!')}
                  </h3>
                  <p>
                    {(successData.message && successData.message.includes('Fri Jan'))
                      ? successData.message.replace('Fri Jan', formatTimeDisplay(successData.checkTime))
                      : (successData.message || `Xin chào ${successData.employee?.FullName}, chúc bạn một ngày làm việc hiệu quả!`)}
                  </p>

                  <div className="kiosk-success-info">
                    <div>
                      <small>Mã NV</small>
                      <strong>{successData.employee?.EmployeeCode}</strong>
                    </div>
                    <div>
                      <small>Giờ ghi nhận</small>
                      <strong>{formatTimeDisplay(successData.checkTime)}</strong>
                    </div>
                    <div>
                      <small>Trạng thái</small>
                      <strong style={{ color: successData.isLate ? '#f59e0b' : '#34d399' }}>
                        {successData.action === 'ALREADY_CHECKED_IN'
                          ? 'Đã vào ca'
                          : (successData.action === 'CHECK_IN'
                              ? (successData.isLate ? `Đi muộn ${successData.lateMinutes}p` : 'Đúng giờ')
                              : (successData.isEarly ? `Về sớm ${successData.earlyMinutes}p` : 'Về đúng giờ'))}
                      </strong>
                    </div>
                  </div>

                  <button className="kiosk-btn kiosk-btn-primary" onClick={() => setSuccessData(null)}>
                    Hoàn tất
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="kiosk-controls-bar">
            <button
              className={`kiosk-btn ${useWebcam ? 'kiosk-btn-danger' : 'kiosk-btn-teal'}`}
              onClick={toggleWebcam}
            >
              {useWebcam ? <VideoOff size={16} /> : <Video size={16} />}
              <span>{useWebcam ? 'Tắt Webcam Web' : 'Bật Webcam Web'}</span>
            </button>

            <button
              className="kiosk-btn kiosk-btn-primary"
              disabled={scanning || !useWebcam}
              onClick={() => handleScanFace()}
              title={!useWebcam ? 'Vui lòng nhấn "Bật Webcam Web" trước khi quét mặt' : 'Quét mặt điểm danh'}
              style={{
                opacity: !useWebcam ? 0.6 : 1,
                cursor: !useWebcam ? 'not-allowed' : 'pointer',
                background: attendanceMode === 'CHECK_OUT' ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' : undefined
              }}
            >
              {attendanceMode === 'CHECK_IN' ? <LogIn size={16} /> : <LogOut size={16} />}
              <span>
                {scanning
                  ? 'Đang nhận diện AI...'
                  : (useWebcam
                      ? (attendanceMode === 'CHECK_IN' ? 'Quét mặt: Vào ca' : 'Quét mặt: Ra về')
                      : 'Bật camera để quét')}
              </span>
            </button>

            <button
              className="kiosk-btn kiosk-btn-secondary"
              onClick={() => testFileInputRef.current?.click()}
              disabled={scanning}
              title="Tải ảnh khuôn mặt từ máy tính để kiểm tra nhận diện OpenCV trực tiếp"
            >
              <Upload size={16} />
              <span>Tải ảnh quét test</span>
            </button>
            <input
              type="file"
              ref={testFileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleTestFileUpload}
            />

            <button
              className="kiosk-btn kiosk-btn-secondary"
              disabled={opencvLaunching}
              onClick={handleLaunchOpenCv}
              title="Khởi chạy tiến trình Python OpenCV độc lập trên máy trạm"
            >
              <Terminal size={16} />
              <span>{opencvLaunching ? 'Đang chạy...' : 'Mở Python OpenCV App'}</span>
            </button>
          </div>

          <form
            className="kiosk-manual-form"
            onSubmit={handleManualCheckin}
          >
            <input
              type="text"
              className="kiosk-input"
              placeholder={`Hoặc nhập mã nhân viên (NV012, EMP001...) để điểm danh ${attendanceMode === 'CHECK_IN' ? 'Vào ca' : 'Ra về'}`}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
            <button type="submit" className="kiosk-btn kiosk-btn-secondary" disabled={scanning}>
              <span>Xác nhận ({attendanceMode === 'CHECK_IN' ? 'Vào' : 'Ra'})</span>
            </button>
          </form>
        </div>

        <div className="kiosk-logs-card">
          <div className="kiosk-logs-header">
            <h3>
              <Users size={18} color="#38bdf8" />
              <span>Nhật ký điểm danh hôm nay ({todayEvents.length})</span>
            </h3>
            <button
              className="kiosk-btn kiosk-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={loadTodayEvents}
              disabled={loadingEvents}
            >
              <RefreshCw size={13} className={loadingEvents ? 'spin' : ''} />
              <span>Làm mới</span>
            </button>
          </div>

          <div className="kiosk-logs-list">
            {todayEvents.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 10px' }}>
                <Clock size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <div>Chưa có dữ liệu điểm danh trong ngày hôm nay.</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  Dữ liệu sẽ tự động xuất hiện khi nhân viên quét mặt tại Kiosk.
                </div>
              </div>
            ) : (
              todayEvents.map(evt => (
                <div key={evt.AttendanceId} className="kiosk-log-item">
                  <div className="kiosk-avatar">
                    {(evt.FullName || 'N').split(' ').slice(-1)[0]?.[0] || 'N'}
                  </div>
                  <div className="kiosk-log-info">
                    <div className="kiosk-log-name">{evt.FullName}</div>
                    <div className="kiosk-log-meta">
                      <span>{evt.EmployeeCode}</span>
                      <span>·</span>
                      <span>{evt.DepartmentName || 'Khối Kỹ Thuật'}</span>
                    </div>
                  </div>
                  <div className="kiosk-log-time">
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#38bdf8' }}>
                      Vào: {evt.TimeInStr || '---'}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '12px', color: evt.TimeOutStr ? '#f59e0b' : '#64748b', marginTop: '2px' }}>
                      Ra: {evt.TimeOutStr || 'Đang làm việc'}
                    </div>
                    <span className={evt.LateMinutes > 0 ? 'kiosk-badge-warning' : 'kiosk-badge-success'} style={{ marginTop: '4px' }}>
                      {evt.LateMinutes > 0 ? `Muộn ${evt.LateMinutes}p` : 'Đúng giờ'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="kiosk-footer">
        <div>
          Trạm điểm danh Kiosk Biometric Face ID · Phiên bản 3.0 · Dữ liệu được đồng bộ trực tiếp với Bảng chấm công HR
        </div>
        <div>
          <a href="/login">Đăng nhập Cổng Quản Trị HRM &rarr;</a>
        </div>
      </footer>
    </div>
  );
}
