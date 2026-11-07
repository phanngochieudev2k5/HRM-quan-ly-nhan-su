import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export class EmailService {
  static getTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    if (user && pass) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    }

    return null;
  }

  static async sendMail({ to, subject, html, text }) {
    if (!to || !to.includes('@')) {
      throw new Error('Địa chỉ email người nhận không hợp lệ!');
    }

    const transporter = this.getTransporter();
    const fromAddress = process.env.SMTP_FROM || (process.env.SMTP_USER ? `Enterprise HRM <${process.env.SMTP_USER}>` : 'Enterprise HRM Recruiting <recruitment@company.vn>');

    if (!transporter) {
      console.log('--- [SIMULATED EMAIL DISPATCH] ---');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content preview:', text || subject);
      console.log('Notice: Configure SMTP_USER and SMTP_PASS in backend/.env to send via live Gmail.');
      console.log('---------------------------------');
      return {
        success: true,
        simulated: true,
        message: 'Đã tạo nội dung thư thành công. (Để gửi email thực tế đến Gmail, vui lòng cấu hình SMTP_USER và SMTP_PASS trong file backend/.env)'
      };
    }

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text: text || '',
        html
      });
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email đã được gửi thành công đến hòm thư ứng viên!'
      };
    } catch (err) {
      console.error('[EmailService.sendMail] Error:', err.message);
      if (err.message.includes('535') || err.message.includes('BadCredentials') || err.message.includes('Username and Password not accepted')) {
        throw new Error('Gmail từ chối đăng nhập (Lỗi 535 Bad Credentials). Google yêu cầu sử dụng "Mật khẩu ứng dụng" (App Password 16 chữ cái) thay vì mật khẩu thông thường. Vui lòng vào myaccount.google.com -> Bảo mật -> Mật khẩu ứng dụng để tạo mã 16 ký tự và dán vào SMTP_PASS trong file backend/.env');
      }
      throw new Error(`Không thể gửi email qua SMTP: ${err.message}`);
    }
  }

  static async sendInterviewEmail({
    candidateEmail,
    candidateName,
    jobTitle,
    interviewDateTime,
    interviewLocation,
    interviewerName
  }) {
    const formattedDate = interviewDateTime
      ? new Date(interviewDateTime).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' })
      : 'Sẽ thông báo cụ thể sau';

    const locationText = interviewLocation && interviewLocation.trim()
      ? interviewLocation.trim()
      : 'Tầng 8, Tòa nhà Văn phòng Enterprise HRM, Hà Nội (hoặc link họp trực tuyến)';

    const interviewerText = interviewerName || 'Ban Phỏng vấn Chuyên môn & Nhân sự';

    const subject = `[Enterprise HRM] THƯ MỜI PHỎNG VẤN VỊ TRÍ: ${jobTitle.toUpperCase()}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #042f2e, #0f766e); padding: 28px 24px; color: #ffffff; text-align: center;">
          <h2 style="margin: 0 0 6px; font-size: 22px;">ENTERPRISE HRM</h2>
          <p style="margin: 0; font-size: 14px; color: #ccfbf1;">THƯ MỜI THAM GIA PHỎNG VẤN TUYỂN DỤNG</p>
        </div>

        <div style="padding: 24px; background: #ffffff;">
          <p style="font-size: 15px; margin-top: 0;">Kính gửi Anh/Chị <b>${candidateName}</b>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Ban Tuyển dụng xin trân trọng chúc mừng Anh/Chị đã vượt qua vòng sơ loại hồ sơ cho vị trí <b>${jobTitle}</b> tại công ty chúng tôi.
            Chúng tôi rất ấn tượng với năng lực và kinh nghiệm của Anh/Chị và trân trọng kính mời Anh/Chị tham dự buổi phỏng vấn chuyên môn với lịch trình như sau:
          </p>

          <div style="background: #f8fafc; border-left: 4px solid #0f766e; padding: 16px 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 6px 0; font-size: 14px;"><strong>Vị trí ứng tuyển:</strong> ${jobTitle}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Thời gian:</strong> <span style="color: #0f766e; font-weight: bold;">${formattedDate}</span></p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Địa điểm / Hình thức:</strong> ${locationText}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Người phỏng vấn phụ trách:</strong> ${interviewerText}</p>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Anh/Chị vui lòng phản hồi (Reply) email này hoặc liên hệ hotline để xác nhận sự có mặt, hoặc đề xuất dời lịch nếu có sự trùng lặp thời gian.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Chúc Anh/Chị có một buổi phỏng vấn đạt kết quả cao nhất!
          </p>

          <p style="font-size: 14px; margin-bottom: 0;">Trân trọng,<br><b>Bộ phận Tuyển dụng & Đãi ngộ nhân sự (HR)</b><br>Enterprise HRM System</p>
        </div>

        <div style="background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Email này được gửi tự động từ Hệ thống Quản trị Nhân sự Doanh nghiệp Enterprise HRM.
        </div>
      </div>
    `;

    return await this.sendMail({
      to: candidateEmail,
      subject,
      html,
      text: `Kính gửi ${candidateName}, bạn được mời phỏng vấn vị trí ${jobTitle} vào lúc ${formattedDate}. Địa điểm: ${locationText}.`
    });
  }

  static async sendOfferEmail({
    candidateEmail,
    candidateName,
    jobTitle,
    offeredSalary,
    startDate
  }) {
    const salaryText = offeredSalary
      ? `${Number(offeredSalary).toLocaleString('vi-VN')} VNĐ/tháng`
      : 'Thỏa thuận theo năng lực';

    const startText = startDate
      ? new Date(startDate).toLocaleDateString('vi-VN')
      : 'Theo thỏa thuận của 2 bên';

    const subject = `[Enterprise HRM] THƯ MỜI NHẬN VIỆC (JOB OFFER) - VỊ TRÍ ${jobTitle.toUpperCase()}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #065f46, #059669); padding: 28px 24px; color: #ffffff; text-align: center;">
          <h2 style="margin: 0 0 6px; font-size: 22px;">ENTERPRISE HRM</h2>
          <p style="margin: 0; font-size: 14px; color: #d1fae5;">THƯ MỜI NHẬN VIỆC CHÍNH THỨC (JOB OFFER)</p>
        </div>

        <div style="padding: 24px; background: #ffffff;">
          <p style="font-size: 15px; margin-top: 0;">Thân gửi Anh/Chị <b>${candidateName}</b>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Thay mặt Ban Giám Đốc và Hội đồng Tuyển dụng, chúng tôi xin chúc mừng Anh/Chị đã xuất sắc vượt qua các vòng phỏng vấn chuyên môn. Chúng tôi trân trọng gửi đến Anh/Chị lời mời gia nhập công ty với vị trí <b>${jobTitle}</b>.
          </p>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; padding: 16px 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 6px 0; font-size: 14px;"><strong>Vị trí tuyển dụng:</strong> ${jobTitle}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Mức thu nhập đề xuất (Gross):</strong> <span style="color: #16a34a; font-weight: bold; font-size: 15px;">${salaryText}</span></p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Ngày dự kiến bắt đầu làm việc:</strong> <b>${startText}</b></p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Chế độ đãi ngộ:</strong> Lương tháng 13, BHXH đầy đủ, thưởng hiệu quả công việc, cấp phát laptop và trang thiết bị làm việc.</p>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Anh/Chị vui lòng phản hồi email này để xác nhận đồng ý với đề nghị nhận việc trong vòng 03 ngày làm việc.
          </p>

          <p style="font-size: 14px; margin-bottom: 0;">Trân trọng chào đón Anh/Chị,<br><b>Phòng Nhân sự & Đãi ngộ</b><br>Enterprise HRM System</p>
        </div>

        <div style="background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Email này được gửi tự động từ Hệ thống Quản trị Nhân sự Doanh nghiệp Enterprise HRM.
        </div>
      </div>
    `;

    return await this.sendMail({
      to: candidateEmail,
      subject,
      html,
      text: `Chúc mừng ${candidateName}, bạn đã nhận được thư mời nhận việc vị trí ${jobTitle} với mức lương đề xuất ${salaryText}. Ngày bắt đầu: ${startText}.`
    });
  }

  static async sendHiredEmail({
    candidateEmail,
    candidateName,
    jobTitle,
    startDate,
    offeredSalary
  }) {
    const startText = startDate
      ? new Date(startDate).toLocaleDateString('vi-VN')
      : 'Sắp tới';

    const salaryText = offeredSalary
      ? `${Number(offeredSalary).toLocaleString('vi-VN')} VNĐ`
      : 'Theo thỏa thuận Offer';

    const subject = `[Enterprise HRM] CHÀO MỪNG THÀNH VIÊN MỚI - VỊ TRÍ ${jobTitle.toUpperCase()}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #15803d, #16a34a); padding: 28px 24px; color: #ffffff; text-align: center;">
          <h2 style="margin: 0 0 6px; font-size: 22px;">CHÚC MỪNG TRÚNG TUYỂN!</h2>
          <p style="margin: 0; font-size: 14px; color: #dcfce7;">CHÍNH THỨC GIA NHẬP ĐỘI NGŨ ENTERPRISE HRM</p>
        </div>

        <div style="padding: 24px; background: #ffffff;">
          <p style="font-size: 15px; margin-top: 0;">Thân gửi Anh/Chị <b>${candidateName}</b>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Chúng tôi rất vui mừng thông báo Anh/Chị đã chính thức hoàn tất quy trình tuyển dụng và trúng tuyển vị trí <b>${jobTitle}</b>.
            Bộ phận Nhân sự đang chuẩn bị hồ sơ Onboarding để đón tiếp Anh/Chị vào ngày nhận việc chính thức:
          </p>

          <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 16px 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 6px 0; font-size: 14px;"><strong>Ngày đi làm chính thức:</strong> <span style="color: #15803d; font-weight: bold; font-size: 15px;">${startText}</span></p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Mức lương chính thức áp dụng:</strong> ${salaryText}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Quy trình tiếp nhận ngày đầu tiên:</strong></p>
            <ul style="margin: 6px 0 0; padding-left: 20px; font-size: 13.5px; color: #334155;">
              <li>Ký hợp đồng lao động & nhận bàn giao trang thiết bị làm việc (laptop, thẻ từ).</li>
              <li>Nhận tài khoản nội bộ và chụp ảnh khuôn mặt đăng ký Face ID chấm công OpenCV.</li>
              <li>Tham gia buổi giới thiệu văn hóa công ty cùng Mentor phụ trách.</li>
            </ul>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Nếu cần hỗ trợ thêm thông tin trước ngày nhận việc, Anh/Chị vui lòng liên hệ trực tiếp với chuyên viên Nhân sự phụ trách.
          </p>

          <p style="font-size: 14px; margin-bottom: 0;">Trân trọng,<br><b>Bộ phận Nhân sự (HR Department)</b><br>Enterprise HRM</p>
        </div>

        <div style="background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Enterprise HRM Onboarding System &copy; 2026.
        </div>
      </div>
    `;

    return await this.sendMail({
      to: candidateEmail,
      subject,
      html,
      text: `Chúc mừng ${candidateName} đã trúng tuyển vị trí ${jobTitle}. Ngày đi làm chính thức: ${startText}.`
    });
  }

  static async sendRejectionEmail({
    candidateEmail,
    candidateName,
    jobTitle
  }) {
    const subject = `[Enterprise HRM] THƯ CẢM ƠN VÀ THÔNG BÁO VỀ VỊ TRÍ: ${jobTitle.toUpperCase()}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
        <div style="background: #475569; padding: 24px; color: #ffffff; text-align: center;">
          <h2 style="margin: 0 0 6px; font-size: 20px;">ENTERPRISE HRM</h2>
          <p style="margin: 0; font-size: 13px; color: #cbd5e1;">THƯ CẢM ƠN ỨNG VIÊN</p>
        </div>

        <div style="padding: 24px; background: #ffffff;">
          <p style="font-size: 15px; margin-top: 0;">Kính gửi Anh/Chị <b>${candidateName}</b>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Lời đầu tiên, Ban Tuyển dụng xin chân thành cảm ơn Anh/Chị đã dành thời gian quan tâm và nộp hồ sơ ứng tuyển vị trí <b>${jobTitle}</b> tại công ty chúng tôi.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Sau khi cân nhắc kỹ lưỡng dựa trên yêu cầu hiện tại của dự án và các tiêu chí tuyển dụng, chúng tôi rất tiếc phải thông báo hiện tại chưa thể đồng hành cùng Anh/Chị ở vị trí này.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Hồ sơ năng lực của Anh/Chị đã được lưu trữ trong kho dữ liệu tiềm năng (Talent Pool) của chúng tôi. Ngay khi có cơ hội nghề nghiệp mới phù hợp hơn, bộ phận Tuyển dụng sẽ chủ động liên hệ lại với Anh/Chị.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Kính chúc Anh/Chị luôn dồi dào sức khỏe và gặt hái được nhiều thành công trên con đường sự nghiệp!
          </p>

          <p style="font-size: 14px; margin-bottom: 0;">Trân trọng,<br><b>Bộ phận Tuyển dụng Nhân tài</b><br>Enterprise HRM</p>
        </div>

        <div style="background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Email tự động từ Hệ thống Quản trị Nhân sự Enterprise HRM.
        </div>
      </div>
    `;

    return await this.sendMail({
      to: candidateEmail,
      subject,
      html,
      text: `Kính gửi ${candidateName}, cảm ơn bạn đã ứng tuyển vị trí ${jobTitle}. Rất tiếc hiện tại công ty chưa thể đồng hành cùng bạn và hy vọng có cơ hội hợp tác trong tương lai.`
    });
  }
}

