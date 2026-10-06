import React from 'react';
import { Building2, Users, ChevronRight, Layers, User } from 'lucide-react';
import PageHeader from '../common/PageHeader';

export default function OrganizationView() {
  const orgTree = [
    {
      name: "Ban Giám Đốc (Board of Directors)",
      leader: "Tổng Giám Đốc - CEO",
      count: 3,
      children: [
        {
          name: "Khối Kỹ Thuật & Công Nghệ (Tech Division)",
          leader: "CTO",
          count: 52,
          children: [
            { name: "Phòng Phát triển Phần mềm (Software Dev)", leader: "Trần Thị Bích", count: 32 },
            { name: "Phòng Trí tuệ Nhân tạo & OpenCV (AI/Vision)", leader: "Hoàng Minh Trí", count: 12 },
            { name: "Phòng Kiểm thử & DevOps (QA/DevOps)", leader: "Phạm Hải Đăng", count: 8 }
          ]
        },
        {
          name: "Khối Quản Trị & Vận Hành (Operations)",
          leader: "COO",
          count: 28,
          children: [
            { name: "Phòng Nhân sự & Đào tạo (HR & Training)", leader: "Nguyễn Văn A", count: 8 },
            { name: "Phòng Tài chính - Kế toán (Finance)", leader: "Hoàng Thảo My", count: 10 },
            { name: "Phòng Hành chính & Pháp chế (Admin)", leader: "Vũ Phương Linh", count: 10 }
          ]
        },
        {
          name: "Khối Kinh Doanh & Tiếp Thị (Commercial)",
          leader: "CMO",
          count: 45,
          children: [
            { name: "Phòng Marketing & Truyền thông", leader: "Phạm Minh Đức", count: 15 },
            { name: "Phòng Kinh doanh Doanh nghiệp (B2B)", leader: "Bùi Quốc Tuấn", count: 20 },
            { name: "Phòng Chăm sóc Khách hàng (CSKH)", leader: "Đặng Thu Thảo", count: 10 }
          ]
        }
      ]
    }
  ];

  return (
    <div>
      <PageHeader
        title="Cơ Cấu Tổ Chức & Sơ Đồ Phòng Ban"
        subtitle="Mô hình phân cấp quản trị phòng ban và nhân sự trong doanh nghiệp"
        breadcrumb="Nhân sự / Cơ cấu tổ chức"
      />

      <div className="hrm-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Building2 size={24} color="#2563eb" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Sơ đồ Cây Phân Cấp Nhân Sự (Organization Chart)
          </h3>
        </div>

        {orgTree.map((root, idx) => (
          <div key={idx}>
            {/* Root Node */}
            <div style={{
              background: '#1e3a8a',
              color: '#ffffff',
              padding: '16px 20px',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <Building2 size={22} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{root.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>Lãnh đạo: {root.leader} • Tổng cộng: {root.count} thành viên</div>
              </div>
            </div>

            {/* Level 1 branches */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
              marginTop: '28px',
              paddingLeft: '24px',
              borderLeft: '2px dashed #93c5fd'
            }}>
              {root.children.map((sub, sIdx) => (
                <div key={sIdx} style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '15px' }}>
                      {sub.name}
                    </div>
                    <span className="status-badge badge-info">{sub.count} người</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px' }}>
                    Phụ trách khối: <strong>{sub.leader}</strong>
                  </div>

                  {/* Level 2 children */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sub.children.map((dep, dIdx) => (
                      <div key={dIdx} style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{dep.name}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>Trưởng phòng: {dep.leader}</div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                          {dep.count} NV
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
