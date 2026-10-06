import React from 'react';

export default function StatusBadge({ status, text }) {
  let badgeClass = 'badge-gray';
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
      badgeClass = 'badge-success';
      if (status === 'PRESENT') displayText = 'Có mặt';
      if (status === 'APPROVED') displayText = 'Đã duyệt';
      break;

    case 'LATE':
    case 'Đi muộn':
    case 'Thử việc':
    case 'PENDING':
    case 'Chờ duyệt':
    case 'Sắp hết hạn':
    case 'Đang tuyển':
    case 'Offer':
    case 'Evaluation':
      badgeClass = 'badge-warning';
      if (status === 'LATE') displayText = 'Đi muộn';
      if (status === 'PENDING') displayText = 'Chờ duyệt';
      break;

    case 'ABSENT':
    case 'Vắng mặt':
    case 'Đã nghỉ việc':
    case 'REJECTED':
    case 'Đã từ chối':
    case 'Hết hạn':
    case 'Tạm dừng':
      badgeClass = 'badge-danger';
      if (status === 'ABSENT') displayText = 'Vắng mặt';
      if (status === 'REJECTED') displayText = 'Đã từ chối';
      break;

    case 'LEAVE':
    case 'Nghỉ phép':
    case 'EARLY':
    case 'Về sớm':
    case 'Screening':
    case 'Interview':
      badgeClass = 'badge-info';
      if (status === 'LEAVE') displayText = 'Nghỉ phép';
      if (status === 'EARLY') displayText = 'Về sớm';
      break;

    case 'Sẵn sàng':
    case 'Applied':
      badgeClass = 'badge-purple';
      break;

    default:
      badgeClass = 'badge-gray';
  }

  return (
    <span className={`status-badge ${badgeClass}`}>
      <span className="badge-dot"></span>
      {displayText}
    </span>
  );
}
