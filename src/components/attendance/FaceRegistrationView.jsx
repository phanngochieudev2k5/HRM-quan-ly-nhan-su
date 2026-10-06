import React, { useState } from 'react';
import {
  Camera, CheckCircle2, ShieldCheck, RefreshCw,
  ScanFace, AlertCircle, ArrowLeft, Sparkles, Check
} from 'lucide-react';
import PageHeader from '../common/PageHeader';

export default function FaceRegistrationView({ employee, onBack, onCompleteRegistration }) {
  const [selectedEmp, setSelectedEmp] = useState(employee || {
    id: "EMP006",
    name: "Đỗ Gia Huy",
    department: "Khối Kỹ Thuật (IT)",
    position: "Frontend React Developer",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  });

  const [currentStep, setCurrentStep] = useState(3); // 3 of 5
  const [isValidFace, setIsValidFace] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const sampleSteps = [
    { id: 1, title: "1. Mẫu chính diện", desc: "Nhìn thẳng trực tiếp vào mắt camera", status: "done" },
    { id: 2, title: "2. Nghiêng trái 15°", desc: "Hơi quay đầu sang phía bên trái", status: "done" },
    { id: 3, title: "3. Nghiêng phải 15°", desc: "Hơi quay đầu sang phía bên phải", status: "active" },
    { id: 4, title: "4. Ánh sáng đa góc", desc: "Điều kiện ánh sáng tự nhiên", status: "pending" },
    { id: 5, title: "5. Mẫu dự phòng", desc: "Mỉm cười nhẹ / biểu cảm tự nhiên", status: "pending" }
  ];

  const handleCapture = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsSuccess(true);
      }
    }, 800);
  };

  const handleFinish = () => {
    alert(`Đã hoàn tất trích xuất và lưu trữ 5/5 vector embedding khuôn mặt cho ${selectedEmp.name} (${selectedEmp.id}) vào cơ sở dữ liệu!`);
    if (onCompleteRegistration) onCompleteRegistration(selectedEmp.id);
  };

  return (
    <div>
      <PageHeader
        title="Đăng Ký Dữ Liệu Khuôn Mặt (Face Registration)"
        subtitle="Thu thập 5 mẫu ảnh góc độ chuẩn OpenCV để huấn luyện bộ nhận diện khuôn mặt nhân viên"
        breadcrumb="Chấm công / Đăng ký khuôn mặt"
        actions={
          onBack && (
            <button className="btn btn-secondary" onClick={onBack}>
              <ArrowLeft size={16} /> Quay lại
            </button>
          )
        }
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left: Camera Scanner Feed */}
        <div className="hrm-card" style={{ padding: 0, overflow: 'hidden', background: '#0a0f1d', border: '1px solid #1e293b' }}>
          <div style={{
            padding: '12px 18px',
            background: '#0f172a',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
              <ScanFace size={18} color="#3b82f6" />
              <span>GIAO DIỆN QUÉT KHUÔN MẶT ĐỊNH DANH</span>
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              OpenCV Dlib Active
            </div>
          </div>

          <div style={{
            position: 'relative',
            height: '420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#070b14',
            overflow: 'hidden'
          }}>
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
              alt="Face Scan Subject"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Oval Face Guide Frame */}
            <div style={{
              position: 'absolute',
              width: '260px',
              height: '320px',
              borderRadius: '50%',
              border: '2px dashed #22c55e',
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              {isProcessing && <div className="scanner-laser" style={{ top: '50%' }}></div>}
            </div>

            {/* Status overlay */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              padding: '8px 18px',
              borderRadius: '20px',
              color: '#ffffff',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <CheckCircle2 size={16} color="#22c55e" />
              <span>Trạng thái: <strong>Khuôn mặt hợp lệ, độ sáng tối ưu</strong></span>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ padding: '18px 24px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>
                Tiến trình: {currentStep}/5 mẫu
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map(step => (
                  <span
                    key={step}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: step <= currentStep ? '#10b981' : '#cbd5e1',
                      transition: 'background 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={handleCapture}
                disabled={isProcessing || currentStep >= 5}
              >
                {isProcessing ? <RefreshCw size={16} className="spin" /> : <Camera size={16} />}
                {isProcessing ? 'Đang trích xuất...' : `Chụp mẫu ${currentStep + 1 > 5 ? 5 : currentStep + 1}`}
              </button>

              <button
                className="btn btn-success"
                onClick={handleFinish}
                disabled={currentStep < 5}
              >
                <ShieldCheck size={16} />
                Hoàn tất & Đăng ký khuôn mặt
              </button>
            </div>
          </div>
        </div>

        {/* Right: Steps checklist & Target Employee */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Target employee card */}
          <div className="hrm-card">
            <div className="card-header">
              <span className="card-title">Nhân viên đăng ký</span>
              <span className="status-badge badge-warning">Đang đăng ký</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <img
                src={selectedEmp.avatar}
                alt={selectedEmp.name}
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{selectedEmp.name}</div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>{selectedEmp.id} • {selectedEmp.department}</div>
                <div style={{ fontSize: '12px', color: '#2563eb' }}>{selectedEmp.position}</div>
              </div>
            </div>

            <div style={{ fontSize: '12.5px', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
              ℹ️ Sau khi hoàn tất 5 mẫu góc độ, mô hình OpenCV sẽ tính toán vector 128 chiều để nhận diện tự động tại các camera cửa ra vào.
            </div>
          </div>

          {/* 5-Sample Steps */}
          <div className="hrm-card">
            <div className="card-header">
              <span className="card-title">5 Mẫu góc độ cần thu thập</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sampleSteps.map((s, idx) => {
                const isDone = s.id <= currentStep;
                const isCurrent = s.id === currentStep + 1;
                return (
                  <div
                    key={s.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: `1px solid ${isDone ? '#a7f3d0' : isCurrent ? '#bfdbfe' : '#e2e8f0'}`,
                      background: isDone ? '#ecfdf5' : isCurrent ? '#eff6ff' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: isDone ? '#065f46' : '#0f172a' }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{s.desc}</div>
                    </div>

                    {isDone ? (
                      <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                        <Check size={16} /> Đã lưu
                      </span>
                    ) : isCurrent ? (
                      <span style={{ color: '#2563eb', fontSize: '12px', fontWeight: 600 }}>
                        Tiếp theo
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Chờ</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
