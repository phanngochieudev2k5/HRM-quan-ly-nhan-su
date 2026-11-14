import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Sliders } from 'lucide-react';
import HrService from '../../../../services/HrService';
import ShiftScheduleBoard from './ShiftScheduleBoard';
import ShiftConfigManager from './ShiftConfigManager';
import Toast from './Toast';

export default function HrShiftManagement() {
  const [subTab, setSubTab] = useState('schedule'); // 'schedule' (mặc định) | 'config'
  const [shifts, setShifts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const loadShiftsAndMeta = useCallback(async () => {
    try {
      setLoadingShifts(true);
      const [shiftsData, deptsData, empsRes] = await Promise.all([
        HrService.getShifts(),
        HrService.getDepartments().catch(() => []),
        HrService.getEmployees({ limit: 500 }).catch(() => ({ employees: [] }))
      ]);

      setShifts(Array.isArray(shiftsData) ? shiftsData : []);
      setDepartments(Array.isArray(deptsData) ? deptsData : []);
      if (Array.isArray(empsRes?.employees)) {
        setAllEmployees(empsRes.employees);
      } else if (Array.isArray(empsRes)) {
        setAllEmployees(empsRes);
      }
    } catch (err) {
      showToast(err.message || 'Lỗi khi tải dữ liệu ca làm việc!', 'error');
    } finally {
      setLoadingShifts(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadShiftsAndMeta();
  }, [loadShiftsAndMeta]);

  const activeShiftCount = shifts.filter((s) => s.IsActive !== false).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Sub-navigation 2 khu vực chức năng chính */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff',
          border: '1px solid var(--line, #e2e8f0)',
          borderRadius: '12px',
          padding: '10px 16px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn sm ${subTab === 'schedule' ? 'pri' : ''}`}
            onClick={() => setSubTab('schedule')}
          >
            <CalendarDays size={15} />
            <span>Bảng Phân Ca Làm Việc (Tuần / Tháng)</span>
          </button>

          <button
            type="button"
            className={`btn sm ${subTab === 'config' ? 'pri' : ''}`}
            onClick={() => setSubTab('config')}
          >
            <Sliders size={15} />
            <span>Cấu Hình Loại Ca Làm Việc</span>
            <span
              className="badge"
              style={{
                marginLeft: '4px',
                background: subTab === 'config' ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                color: subTab === 'config' ? '#ffffff' : '#334155'
              }}
            >
              {activeShiftCount}/{shifts.length}
            </span>
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Dữ liệu đồng bộ trực tiếp với <code>tblShift</code> &amp; <code>tblAttendance</code>
        </div>
      </div>

      {subTab === 'schedule' ? (
        <ShiftScheduleBoard
          shifts={shifts}
          departments={departments}
          allEmployees={allEmployees}
          showToast={showToast}
        />
      ) : (
        <ShiftConfigManager
          shifts={shifts}
          loading={loadingShifts}
          onReload={loadShiftsAndMeta}
          showToast={showToast}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
