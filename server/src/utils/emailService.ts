import nodemailer from 'nodemailer';
import logger from './logger';

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
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0066CC;">Yeni Görev Atandı</h2>
      <p>Merhaba ${userName},</p>
      <p>Size yeni bir görev atandı:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>${taskTitle}</h3>
        <p>${taskDescription || 'Açıklama yok'}</p>
        ${dueDate ? `<p><strong>Son Tarih:</strong> ${new Date(dueDate).toLocaleDateString('tr-TR')}</p>` : ''}
      </div>
      <p>Görevi görüntülemek için admin paneline giriş yapın.</p>
      <p>İyi çalışmalar,<br>SK Production</p>
    </div>
  `;

  return sendEmail(
    userEmail,
    'Yeni Görev Atandı - SK Production',
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
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0066CC;">Bakım Hatırlatması</h2>
      <p>Merhaba ${userName},</p>
      <p>Aşağıdaki ekipman için yaklaşan bir bakım var:</p>
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3>${equipmentName}</h3>
        <p><strong>Bakım Tarihi:</strong> ${new Date(maintenanceDate).toLocaleDateString('tr-TR')}</p>
      </div>
      <p>Lütfen bakım planlamasını yapın.</p>
      <p>İyi çalışmalar,<br>SK Production</p>
    </div>
  `;

  return sendEmail(
    userEmail,
    'Bakım Hatırlatması - SK Production',
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
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0066CC;">Proje Başlangıç Bildirimi</h2>
      <p>Merhaba ${clientName},</p>
      <p>Projeniz başlamıştır:</p>
      <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h3>${projectName}</h3>
        <p><strong>Başlangıç Tarihi:</strong> ${new Date(startDate).toLocaleDateString('tr-TR')}</p>
      </div>
      <p>Proje detaylarını admin panelinden takip edebilirsiniz.</p>
      <p>İyi çalışmalar,<br>SK Production</p>
    </div>
  `;

  return sendEmail(
    clientEmail,
    'Proje Başlangıç Bildirimi - SK Production',
    html
  );
};

