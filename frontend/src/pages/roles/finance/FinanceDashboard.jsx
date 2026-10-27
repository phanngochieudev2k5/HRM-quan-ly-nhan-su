import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, Shield, Percent,
  Calendar, ArrowUpRight, Award, Cake, Users
} from 'lucide-react';
import '../../../styles/roles/finance/FinanceDashboard.css';

export default function FinanceDashboard({ onNavigate }) {
  const [period, setPeriod] = useState('2026-04');

  const formatVND = (n) => Math.round(+n || 0).toLocaleString('vi-VN') + ' đ';
  const formatShort = (n) => {
    const a = Math.abs(n);
    if (a >= 1e9) return (n / 1e9).toFixed(1) + ' tỷ';
    if (a >= 1e6) return (n / 1e6).toFixed(1) + ' tr';
    return Math.round(n).toLocaleString('vi-VN');
  };

  const trendMonths = ['T11/25', 'T12/25', 'T01/26', 'T02/26', 'T03/26', 'T04/26'];
  const trendCosts = [182000000, 195000000, 240000000, 205000000, 218000000, 224500000];

  const topEarners = [
    { name: 'Nguyễn Văn A', role: 'Giám đốc', gross: 51000000, net: 42150000, color: '#f59e0b' },
    { name: 'Trần Thị Bích', role: 'Senior Lead Tech', gross: 37500000, net: 31200000, color: '#94a3b8' },
    { name: 'Phạm Minh Đức', role: 'Kế toán trưởng', gross: 29500000, net: 24800000, color: '#cd7f32' },
    { name: 'Lê Hoàng Long', role: 'Backend Developer', gross: 27599231, net: 23209769, color: '#cbd5e1' },
    { name: 'Hoàng Quốc Bảo', role: 'Trưởng nhóm KD', gross: 27200000, net: 22800000, color: '#cbd5e1' }
  ];

  return (
    <div className="finance-dashboard-container">
      <div className="ph">
        <div>
          <h1>Tổng quan tài chính & Báo cáo quỹ lương</h1>
          <p>Phân tích biến động chi phí nhân sự, trích nộp bảo hiểm và thuế thu nhập doanh nghiệp</p>
        </div>
        <div className="ph-tools">
          <label className="mp">
            <span>Kỳ lương:</span>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </label>
          <button className="btn pri" onClick={() => onNavigate('finance-calc')}>
            <span>Tính & chốt bảng lương</span>
          </button>
        </div>
      </div>

      <div className="grid c4">
        <div className="kc" style={{ '--c': '#0f766e', '--cb': '#ccfbf1' }}>
          <div className="kc-h">
            <span className="kc-ic"><DollarSign size={18} /></span>
            <span className="kc-l">Thực lĩnh chi trả</span>
            <span className="pill pu">▲ 3.2%</span>
          </div>
          <div className="kc-v">168.450.000 <small>đ</small></div>
          <div className="kc-s">7 nhân sự · Kỳ {period}</div>
          <svg className="spk" viewBox="0 0 240 42" preserveAspectRatio="none">
            <defs>
              <linearGradient id="spk1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0f766e" stopOpacity="0.25" />
                <stop offset="1" stopColor="#0f766e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,38 L48,32 L96,35 L144,22 L192,26 L240,12 L240,42 L0,42 Z" fill="url(#spk1)" />
            <path d="M0,38 L48,32 L96,35 L144,22 L192,26 L240,12" fill="none" stroke="#0f766e" strokeWidth="2" />
          </svg>
        </div>

        <div className="kc" style={{ '--c': '#2563eb', '--cb': '#dbeafe' }}>
          <div className="kc-h">
            <span className="kc-ic"><TrendingUp size={18} /></span>
            <span className="kc-l">Tổng thu nhập Gross</span>
            <span className="pill pu">▲ 2.8%</span>
          </div>
          <div className="kc-v">201.200.000 <small>đ</small></div>
          <div className="kc-s">Bình quân 28.7 tr/người</div>
          <svg className="spk" viewBox="0 0 240 42" preserveAspectRatio="none">
            <defs>
              <linearGradient id="spk2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2563eb" stopOpacity="0.25" />
                <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,35 L48,30 L96,32 L144,20 L192,18 L240,8 L240,42 L0,42 Z" fill="url(#spk2)" />
            <path d="M0,35 L48,30 L96,32 L144,20 L192,18 L240,8" fill="none" stroke="#2563eb" strokeWidth="2" />
          </svg>
        </div>

        <div className="kc" style={{ '--c': '#d97706', '--cb': '#fef3c7' }}>
          <div className="kc-h">
            <span className="kc-ic"><Percent size={18} /></span>
            <span className="kc-l">Thuế TNCN nộp hộ</span>
            <span className="pill pd">▼ 1.4%</span>
          </div>
          <div className="kc-v">14.620.000 <small>đ</small></div>
          <div className="kc-s">Biểu thuế 5 bậc Luật 2026</div>
          <svg className="spk" viewBox="0 0 240 42" preserveAspectRatio="none">
            <defs>
              <linearGradient id="spk3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d97706" stopOpacity="0.25" />
                <stop offset="1" stopColor="#d97706" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,28 L48,24 L96,32 L144,18 L192,20 L240,16 L240,42 L0,42 Z" fill="url(#spk3)" />
            <path d="M0,28 L48,24 L96,32 L144,18 L192,20 L240,16" fill="none" stroke="#d97706" strokeWidth="2" />
          </svg>
        </div>

        <div className="kc" style={{ '--c': '#7c3aed', '--cb': '#ede9fe' }}>
          <div className="kc-h">
            <span className="kc-ic"><Shield size={18} /></span>
            <span className="kc-l">Bảo hiểm & KPCĐ</span>
            <span className="pill na">Ổn định</span>
          </div>
          <div className="kc-v">41.480.000 <small>đ</small></div>
          <div className="kc-s">NLĐ 10.5% · Doanh nghiệp 21.5%</div>
          <svg className="spk" viewBox="0 0 240 42" preserveAspectRatio="none">
            <defs>
              <linearGradient id="spk4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#7c3aed" stopOpacity="0.25" />
                <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,25 L48,25 L96,22 L144,22 L192,18 L240,18 L240,42 L0,42 Z" fill="url(#spk4)" />
            <path d="M0,25 L48,25 L96,22 L144,22 L192,18 L240,18" fill="none" stroke="#7c3aed" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="grid c21">
        <div className="card">
          <div className="card-h">
            <h3>Chi phí nhân sự doanh nghiệp 6 tháng gần nhất</h3>
            <span className="sub">Đơn vị: Triệu VNĐ</span>
          </div>
          <div className="card-b">
            <div style={{ height: '230px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '10px 10px 30px' }}>
              {trendMonths.map((m, i) => {
                const val = trendCosts[i];
                const heightPct = (val / 260000000) * 100;
                return (
                  <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f766e' }}>
                      {Math.round(val / 1e6)} tr
                    </span>
                    <div style={{ width: '100%', maxWidth: '42px', height: `${heightPct}%`, background: 'linear-gradient(180deg, #0f766e, #115e59)', borderRadius: '6px 6px 0 0', transition: 'height 0.3s' }}></div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>{m}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Cơ cấu chi phí quỹ lương {period}</h3>
          </div>
          <div className="card-b">
            <div className="donut">
              <svg viewBox="0 0 170 170">
                <circle cx="85" cy="85" r="62" fill="none" stroke="#eef2f1" strokeWidth="24" />
                <circle cx="85" cy="85" r="62" fill="none" stroke="#0f766e" strokeWidth="24" strokeDasharray="280 110" transform="rotate(-90 85 85)" />
                <circle cx="85" cy="85" r="62" fill="none" stroke="#f59e0b" strokeWidth="24" strokeDasharray="30 360" strokeDashoffset="-280" transform="rotate(-90 85 85)" />
                <circle cx="85" cy="85" r="62" fill="none" stroke="#7c3aed" strokeWidth="24" strokeDasharray="80 310" strokeDashoffset="-310" transform="rotate(-90 85 85)" />
                <text x="85" y="82" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b">224 tr</text>
                <text x="85" y="100" textAnchor="middle" fontSize="11" fill="#94a3b8">Tổng chi phí</text>
              </svg>
              <div className="dl">
                <div>
                  <i style={{ background: '#0f766e' }}></i>
                  <span>Thực lĩnh chi nhân viên</span>
                  <b>168.4 tr</b>
                  <em>75.0%</em>
                </div>
                <div>
                  <i style={{ background: '#f59e0b' }}></i>
                  <span>Thuế TNCN khấu trừ</span>
                  <b>14.6 tr</b>
                  <em>6.5%</em>
                </div>
                <div>
                  <i style={{ background: '#8b5cf6' }}></i>
                  <span>BHXH phần NLĐ đóng</span>
                  <b>14.7 tr</b>
                  <em>6.5%</em>
                </div>
                <div>
                  <i style={{ background: '#fb923c' }}></i>
                  <span>BHXH phần DN đóng</span>
                  <b>26.8 tr</b>
                  <em>12.0%</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid c2">
        <div className="card">
          <div className="card-h">
            <h3>Top nhân sự có thu nhập cao nhất</h3>
            <span className="sub">Kỳ lương {period}</span>
          </div>
          <div className="card-b">
            {topEarners.map((emp, i) => (
              <div key={emp.name} className="tli">
                <span className="medal" style={{ background: emp.color }}>{i + 1}</span>
                <div className="avatar" style={{ background: '#ccfbf1', color: '#0f766e' }}>
                  {(emp.name || 'N').split(' ').slice(-1)[0]?.[0] || 'N'}
                </div>
                <div className="grow">
                  <b>{emp.name}</b>
                  <small>{emp.role}</small>
                  <div className="pb">
                    <i style={{ width: `${(emp.gross / 51000000) * 100}%`, background: 'linear-gradient(90deg, #5eead4, #0f766e)' }}></i>
                  </div>
                </div>
                <div className="v">
                  <div>{formatShort(emp.gross)}</div>
                  <small style={{ color: '#64748b' }}>Net {formatShort(emp.net)}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Phân bổ chi phí theo phòng ban</h3>
          </div>
          <div className="card-b">
            <div className="hb">
              <div className="hb-top">
                <span>Khối Kỹ Thuật (IT)</span>
                <b>68.4 tr (30.5%)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '68%', background: '#0f766e' }}></i>
              </div>
            </div>
            <div className="hb">
              <div className="hb-top">
                <span>Ban Giám Đốc</span>
                <b>56.2 tr (25.0%)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '56%', background: '#2563eb' }}></i>
              </div>
            </div>
            <div className="hb">
              <div className="hb-top">
                <span>Khối Kinh Doanh</span>
                <b>39.5 tr (17.6%)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '39%', background: '#f59e0b' }}></i>
              </div>
            </div>
            <div className="hb">
              <div className="hb-top">
                <span>Phòng Kế Toán</span>
                <b>32.8 tr (14.6%)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '33%', background: '#8b5cf6' }}></i>
              </div>
            </div>
            <div className="hb">
              <div className="hb-top">
                <span>Khối Sản Xuất</span>
                <b>27.6 tr (12.3%)</b>
              </div>
              <div className="hb-bar">
                <i style={{ width: '28%', background: '#ec4899' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
