import React, { useState } from 'react';
import { GraduationCap, Clock, Calendar, CheckCircle2, User, BookOpen } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import EmptyState from '../../common/EmptyState';
import { trainingCoursesData } from '../../../data/mockData';
import '../../../styles/roles/employee/MyTrainingView.css';

export default function MyTrainingView() {
  const [courses, setCourses] = useState(trainingCoursesData || []);

  const handleToggleEnroll = (id) => {
    setCourses(courses.map(course => {
      if (course.id === id) {
        const isEnrolled = !course.isEnrolled;
        return {
          ...course,
          isEnrolled,
          registered: isEnrolled ? course.registered + 1 : course.registered - 1
        };
      }
      return course;
    }));
  };

  return (
    <div className="my-training-container">
      <div className="ph">
        <div>
          <h1>Khóa đào tạo & Nâng cao kỹ năng nội bộ</h1>
          <p>Các chương trình đào tạo chuyên môn kỹ thuật, quy trình doanh nghiệp và kỹ năng mềm</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Chưa có khóa đào tạo nào đang mở"
          description="Danh sách các chương trình đào tạo nội bộ sẽ hiển thị tại đây khi bộ phận L&D đăng tải."
        />
      ) : (
        <div className="grid c3">
          {courses.map(course => (
          <div key={course.id} className="card">
            <div className="card-h">
              <StatusBadge status={course.status} />
              {course.isEnrolled && (
                <span className="badge b-green">
                  <CheckCircle2 size={13} />
                  <span>Đã đăng ký</span>
                </span>
              )}
            </div>

            <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#042f2e', margin: 0, minHeight: '38px' }}>
                {course.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={14} color="#94a3b8" />
                  <span>Giảng viên: <strong>{course.instructor}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} color="#94a3b8" />
                  <span>Thời lượng: {course.duration}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} color="#94a3b8" />
                  <span>Lịch học: {course.schedule}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={14} color="#94a3b8" />
                  <span>Sĩ số: {course.registered} / {course.max} học viên</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  className={`btn ${course.isEnrolled ? 'danger' : 'pri'}`}
                  style={{ width: '100%' }}
                  onClick={() => handleToggleEnroll(course.id)}
                >
                  {course.isEnrolled ? 'Hủy đăng ký khóa học' : 'Đăng ký tham gia ngay'}
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
