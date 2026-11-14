/**
 * Tiện ích xử lý thời gian ca làm việc, ca đêm qua ngày hôm sau và màu sắc hiển thị
 */

export const SHIFT_TYPE_META = {
  Administrative: {
    value: 'Administrative',
    label: 'Ca hành chính',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    color: '#047857',
    badgeClass: 'b-green'
  },
  Night: {
    value: 'Night',
    label: 'Ca đêm',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    color: '#6d28d9',
    badgeClass: 'b-purple'
  },
  Rotating: {
    value: 'Rotating',
    label: 'Xoay ca',
    bg: '#fffbeb',
    border: '#fde68a',
    color: '#b45309',
    badgeClass: 'b-amber'
  }
};

/**
 * Chuẩn hóa nhãn và màu sắc theo ShiftType (hỗ trợ cả dữ liệu tiếng Việt legacy trong CSDL)
 */
export const getShiftVisual = (shiftType, startTime = '') => {
  if (shiftType === 'Night' || shiftType === 'Ca đêm' || (startTime && startTime >= '20:00')) {
    return SHIFT_TYPE_META.Night;
  }
  if (shiftType === 'Rotating' || shiftType === 'Xoay ca') {
    return SHIFT_TYPE_META.Rotating;
  }
  if (shiftType === 'Part-time') {
    return {
      value: 'Part-time',
      label: 'Bán thời gian',
      bg: '#eff6ff',
      border: '#bfdbfe',
      color: '#1d4ed8',
      badgeClass: 'b-blue'
    };
  }
  return SHIFT_TYPE_META.Administrative;
};

export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

/**
 * Tính toán tổng thời lượng, thời gian nghỉ giữa ca và giờ công thực tế (hỗ trợ ca đêm qua ngày)
 */
export const computeShiftMetrics = (startTime, endTime, breakStartTime, breakEndTime) => {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  if (startMin === null || endMin === null) {
    return { isOvernight: false, grossMinutes: 0, breakMinutes: 0, netMinutes: 0, totalWorkHours: 0 };
  }

  const isOvernight = endMin <= startMin;
  const grossMinutes = isOvernight ? 1440 - startMin + endMin : endMin - startMin;

  let breakMinutes = 0;
  if (breakStartTime && breakEndTime) {
    const bStart = parseTimeToMinutes(breakStartTime);
    const bEnd = parseTimeToMinutes(breakEndTime);
    if (bStart !== null && bEnd !== null) {
      breakMinutes = bEnd <= bStart ? 1440 - bStart + bEnd : bEnd - bStart;
    }
  }

  const netMinutes = Math.max(0, grossMinutes - breakMinutes);
  return {
    isOvernight,
    grossMinutes,
    breakMinutes,
    netMinutes,
    totalWorkHours: Number((netMinutes / 60).toFixed(2))
  };
};

export const formatDateYMD = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const addDays = (dateObj, days) => {
  const copy = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
};

/**
 * Lấy Thứ 2 đầu tuần của một ngày bất kỳ
 */
export const getStartOfWeek = (dateObj) => {
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

/**
 * Sinh danh sách ngày trong tuần (7 ngày) hoặc trong tháng (28-31 ngày)
 */
export const getPeriodDays = (anchorDate, viewMode) => {
  const days = [];
  if (viewMode === 'month') {
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum += 1) {
      const d = new Date(year, month, dayNum);
      days.push(buildDayMeta(d));
    }
  } else {
    const monday = getStartOfWeek(anchorDate);
    for (let i = 0; i < 7; i += 1) {
      const d = addDays(monday, i);
      days.push(buildDayMeta(d));
    }
  }
  return days;
};

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const buildDayMeta = (d) => {
  const ymd = formatDateYMD(d);
  const todayYmd = formatDateYMD(new Date());
  const dow = d.getDay();
  return {
    dateStr: ymd,
    dayNum: d.getDate(),
    monthNum: d.getMonth() + 1,
    dowLabel: WEEKDAY_LABELS[dow],
    isWeekend: dow === 0 || dow === 6,
    isToday: ymd === todayYmd
  };
};
