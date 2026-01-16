import nodemailer from 'nodemailer';
import logger from './logger';
import { renderEmailTemplate } from './emailTemplateRenderer';

const formatDateTr = (d?: Date) => (d ? new Date(d).toLocaleDateString('tr-TR') : '');

// Email transporter oluştur
const createTransporter = () => {
  // SMTP konfigürasyonu
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
};

// Email gönderme fonksiyonu
export const sendEmail = async (
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<boolean> => {
  try {
    // SMTP ayarları yoksa email gönderme
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      logger.warn('SMTP ayarları yapılandırılmamış, email gönderilmedi');
      return false;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"SK Production" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // HTML'den text çıkar
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email gönderildi: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Email gönderme hatası:', error);
    return false;
  }
};

// Görev atandığında email gönder
export const sendTaskAssignedEmail = async (
  userEmail: string,
  userName: string,
  taskTitle: string,
  taskDescription: string,
  dueDate?: Date
): Promise<boolean> => {
  const dueDateLineHtml = dueDate
    ? `<p><strong>Son Tarih:</strong> ${formatDateTr(dueDate)}</p>`
    : '';
  const data = {
    userName,
    taskTitle,
    taskDescription: taskDescription || 'Açıklama yok',
    dueDateLineHtml,
  };

  const rendered = await renderEmailTemplate({
    key: 'task_assigned',
    locale: 'tr',
    data,
  });

  const html =
    rendered?.html ||
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066CC;">Yeni Görev Atandı</h2>
        <p>Merhaba ${userName},</p>
        <p>Size yeni bir görev atandı:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${taskTitle}</h3>
          <p>${taskDescription || 'Açıklama yok'}</p>
          ${dueDateLineHtml}
        </div>
        <p>Görevi görüntülemek için admin paneline giriş yapın.</p>
        <p>İyi çalışmalar,<br>SK Production</p>
      </div>
    `;

  return sendEmail(
    userEmail,
    rendered?.subject || 'Yeni Görev Atandı - SK Production',
    html
  );
};

// Bakım hatırlatma email'i
export const sendMaintenanceReminderEmail = async (
  userEmail: string,
  userName: string,
  equipmentName: string,
  maintenanceDate: Date
): Promise<boolean> => {
  const data = {
    userName,
    equipmentName,
    maintenanceDate: formatDateTr(maintenanceDate),
  };
  const rendered = await renderEmailTemplate({
    key: 'maintenance_reminder',
    locale: 'tr',
    data,
  });

  const html =
    rendered?.html ||
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066CC;">Bakım Hatırlatması</h2>
        <p>Merhaba ${userName},</p>
        <p>Aşağıdaki ekipman için yaklaşan bir bakım var:</p>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3>${equipmentName}</h3>
          <p><strong>Bakım Tarihi:</strong> ${formatDateTr(maintenanceDate)}</p>
        </div>
        <p>Lütfen bakım planlamasını yapın.</p>
        <p>İyi çalışmalar,<br>SK Production</p>
      </div>
    `;

  return sendEmail(
    userEmail,
    rendered?.subject || 'Bakım Hatırlatması - SK Production',
    html
  );
};

// Proje başlangıç email'i
export const sendProjectStartEmail = async (
  clientEmail: string,
  clientName: string,
  projectName: string,
  startDate: Date
): Promise<boolean> => {
  const data = {
    clientName,
    projectName,
    startDate: formatDateTr(startDate),
  };
  const rendered = await renderEmailTemplate({
    key: 'project_started',
    locale: 'tr',
    data,
  });

  const html =
    rendered?.html ||
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066CC;">Proje Başlangıç Bildirimi</h2>
        <p>Merhaba ${clientName},</p>
        <p>Projeniz başlamıştır:</p>
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3>${projectName}</h3>
          <p><strong>Başlangıç Tarihi:</strong> ${formatDateTr(startDate)}</p>
        </div>
        <p>Proje detaylarını admin panelinden takip edebilirsiniz.</p>
        <p>İyi çalışmalar,<br>SK Production</p>
      </div>
    `;

  return sendEmail(
    clientEmail,
    rendered?.subject || 'Proje Başlangıç Bildirimi - SK Production',
    html
  );
};

// Proje durumu değişikliği email'i
export const sendProjectStatusChangeEmail = async (
  userEmails: string[],
  projectName: string,
  oldStatus: string,
  newStatus: string,
  _projectId: string
): Promise<boolean> => {
  const statusLabels: { [key: string]: string } = {
    'PLANNING': 'Onay Bekleyen', // legacy
    'PENDING_APPROVAL': 'Onay Bekleyen',
    'APPROVED': 'Onaylanan',
    'ACTIVE': 'Aktif',
    'ON_HOLD': 'Ertelendi',
    'COMPLETED': 'Tamamlandı',
    'CANCELLED': 'İptal Edildi'
  };

  const data = {
    projectName,
    oldStatusLabel: statusLabels[oldStatus] || oldStatus,
    newStatusLabel: statusLabels[newStatus] || newStatus,
  };
  const rendered = await renderEmailTemplate({
    key: 'project_status_changed',
    locale: 'tr',
    data,
  });

  const html =
    rendered?.html ||
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066CC;">Proje Durumu Güncellendi</h2>
        <p>Merhaba,</p>
        <p><strong>${projectName}</strong> projesinin durumu güncellendi:</p>
        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0066CC;">
          <p><strong>Eski Durum:</strong> ${statusLabels[oldStatus] || oldStatus}</p>
          <p><strong>Yeni Durum:</strong> ${statusLabels[newStatus] || newStatus}</p>
        </div>
        <p>Proje detaylarını admin panelinden görüntüleyebilirsiniz.</p>
        <p>İyi çalışmalar,<br>SK Production</p>
      </div>
    `;

  return sendEmail(
    userEmails,
    rendered?.subject || `Proje Durumu Güncellendi: ${projectName} - SK Production`,
    html
  );
};

// Kullanıcı davet email'i
export const sendUserInviteEmail = async (
  userEmail: string,
  userName: string,
  inviterName: string,
  role: string,
  temporaryPassword?: string
): Promise<boolean> => {
  const roleLabels: { [key: string]: string } = {
    'ADMIN': 'Yönetici',
    'FIRMA_SAHIBI': 'Firma Sahibi',
    'PROJE_YONETICISI': 'Proje Yöneticisi',
    'DEPO_SORUMLUSU': 'Depo Sorumlusu',
    'TEKNISYEN': 'Teknisyen'
  };

  const temporaryPasswordHtml = temporaryPassword
    ? `<p><strong>Geçici Şifre:</strong> ${temporaryPassword}</p>
       <p style="color: #d32f2f; font-size: 12px;">⚠️ İlk girişte şifrenizi değiştirmeniz önerilir.</p>`
    : '';

  const adminLoginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/login`;

  const data = {
    userEmail,
    userName,
    inviterName,
    roleLabel: roleLabels[role] || role,
    temporaryPasswordHtml,
    adminLoginUrl,
  };

  const rendered = await renderEmailTemplate({
    key: 'user_invite',
    locale: 'tr',
    data,
  });

  const html =
    rendered?.html ||
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066CC;">SK Production'a Hoş Geldiniz!</h2>
        <p>Merhaba ${userName},</p>
        <p><strong>${inviterName}</strong> sizi SK Production sistemine <strong>${roleLabels[role] || role}</strong> rolü ile ekledi.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${userEmail}</p>
          ${temporaryPasswordHtml}
        </div>
        <p>Admin paneline giriş yapmak için:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${adminLoginUrl}" 
             style="background-color: #0066CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Giriş Yap
          </a>
        </p>
        <p>İyi çalışmalar,<br>SK Production</p>
      </div>
    `;

  return sendEmail(
    userEmail,
    rendered?.subject || 'SK Production - Hesap Oluşturuldu',
    html
  );
};

// Görev güncellendi email'i
export const sendTaskUpdatedEmail = async (
  userEmail: string,
  userName: string,
  taskTitle: string,
  changes: { field: string; oldValue: string; newValue: string }[]
): Promise<boolean> => {
  const changesRowsHtml = changes
    .map(
      (change) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${change.field}:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">
            <span style="color: #d32f2f;">${change.oldValue}</span> → 
            <span style="color: #28a745;">${change.newValue}</span>
          </td>
        </tr>
      `
    )
    .join('');

  const data = {
    userName,
    taskTitle,
    changesRowsHtml,
  };

  const rendered = await renderEmailTemplate({
    key: 'task_updated',
    locale: 'tr',
    data,
  });

  const html =
    rendered?.html ||
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066CC;">Görev Güncellendi</h2>
        <p>Merhaba ${userName},</p>
        <p><strong>${taskTitle}</strong> görevi güncellendi:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            ${changesRowsHtml}
          </table>
        </div>
        <p>Görevi görüntülemek için admin paneline giriş yapın.</p>
        <p>İyi çalışmalar,<br>SK Production</p>
      </div>
    `;

  return sendEmail(
    userEmail,
    rendered?.subject || 'Görev Güncellendi - SK Production',
    html
  );
};

