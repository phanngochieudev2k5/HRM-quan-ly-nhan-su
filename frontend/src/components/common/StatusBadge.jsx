import React from 'react';
import '../../styles/common/StatusBadge.css';

export default function StatusBadge({ status, text }) {
  let badgeVariant = 'badge-variant-neutral';
  let displayText = text || status;

  switch (status) {
    case 'PRESENT':
    case 'Có mặt':
    case 'Đang làm việc':
    case 'APPROVED':
    case 'Đã duyệt':
    case 'Đã thanh toán':
    case 'Hiệu lực':
    case 'Tốt':
    case 'Đang sử dụng':
    case 'Hired':
    case 'Active':
    case 'Hoạt động':
    case 'Thành công':
    case 'Đã hoàn thành':
      badgeVariant = 'badge-variant-success';
      if (status === 'PRESENT') displayText = 'Có mặt';
      if (status === 'APPROVED') displayText = 'Đã duyệt';
      if (status === 'Active') displayText = 'Hoạt động';
      break;

    case 'LATE':
    case 'Đi muộn':
    case 'Thử việc':
    case 'PENDING':
    case 'Chờ duyệt':
    case 'Sắp hết hạn':
    case 'Đang tuyển':
    case 'Đang tuyển sinh':
    case 'Offer':
    case 'Evaluation':
      badgeVariant = 'badge-variant-warning';
      if (status === 'LATE') displayText = 'Đi muộn';
      if (status === 'PENDING') displayText = 'Chờ duyệt';
      break;

    case 'ABSENT':
    case 'Vắng mặt':
    case 'Đã thôi việc':
    case 'Đã nghỉ việc':
    case 'REJECTED':
    case 'Đã từ chối':
    case 'Hết hạn':
    case 'Tạm dừng':
    case 'Locked':
    case 'Đã khóa':
    case 'Thất bại':
      badgeVariant = 'badge-variant-danger';
      if (status === 'ABSENT') displayText = 'Vắng mặt';
      if (status === 'REJECTED') displayText = 'Đã từ chối';
      if (status === 'Locked') displayText = 'Đã khóa';
      break;

    case 'LEAVE':
    case 'Nghỉ phép':
    case 'EARLY':
    case 'Về sớm':
    case 'Screening':
    case 'Interview':
    case 'Sắp mở':
      badgeVariant = 'badge-variant-info';
      if (status === 'LEAVE') displayText = 'Nghỉ phép';
      if (status === 'EARLY') displayText = 'Về sớm';
      break;

    case 'Sẵn sàng':
    case 'Applied':
      badgeVariant = 'badge-variant-purple';
      break;

    default:
      badgeVariant = 'badge-variant-neutral';
  }

  return (
    <span className={`status-badge-root ${badgeVariant}`}>
      <span className="status-badge-dot"></span>
      {displayText}
    </span>
  );
}
