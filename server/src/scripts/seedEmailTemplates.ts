import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import connectDB from '../config/database';
import EmailTemplate from '../models/EmailTemplate';

dotenv.config();

type SeedTemplate = {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  variants: Array<{
    name: string;
    weight: number;
    locales: Record<string, { subject: string; html: string }>;
  }>;
};

const baseLayout = (contentHtml: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  ${contentHtml}
</div>
`.trim();

const templates: SeedTemplate[] = [
  {
    key: 'task_assigned',
    name: 'Görev Atandı',
    enabled: true,
    variants: [
      {
        name: 'default',
        weight: 100,
        locales: {
          tr: {
            subject: 'Yeni Görev Atandı - SK Production',
            html: baseLayout(`
              <h2 style="color: #0066CC;">Yeni Görev Atandı</h2>
              <p>Merhaba {{userName}},</p>
              <p>Size yeni bir görev atandı:</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>{{taskTitle}}</h3>
                <p>{{taskDescription}}</p>
                {{{dueDateLineHtml}}}
              </div>
              <p>Görevi görüntülemek için admin paneline giriş yapın.</p>
              <p>İyi çalışmalar,<br>SK Production</p>
            `),
          },
          en: {
            subject: 'New Task Assigned - SK Production',
            html: baseLayout(`
              <h2 style="color: #0066CC;">New Task Assigned</h2>
              <p>Hello {{userName}},</p>
              <p>A new task has been assigned to you:</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>{{taskTitle}}</h3>
                <p>{{taskDescription}}</p>
                {{{dueDateLineHtml}}}
              </div>
              <p>Please sign in to the admin panel to view the task.</p>
              <p>Best regards,<br>SK Production</p>
            `),
          },
        },
      },
    ],
  },
  {
    key: 'task_updated',
    name: 'Görev Güncellendi',
    enabled: true,
    variants: [
      {
        name: 'default',
        weight: 100,
        locales: {
          tr: {
            subject: 'Görev Güncellendi - SK Production',
            html: baseLayout(`
              <h2 style="color: #0066CC;">Görev Güncellendi</h2>
              <p>Merhaba {{userName}},</p>
              <p><strong>{{taskTitle}}</strong> görevi güncellendi:</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  {{{changesRowsHtml}}}
                </table>
              </div>
              <p>Görevi görüntülemek için admin paneline giriş yapın.</p>
              <p>İyi çalışmalar,<br>SK Production</p>
            `),
          },
          en: {
            subject: 'Task Updated - SK Production',
            html: baseLayout(`
              <h2 style="color: #0066CC;">Task Updated</h2>
              <p>Hello {{userName}},</p>
              <p>The task <strong>{{taskTitle}}</strong> has been updated:</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  {{{changesRowsHtml}}}
                </table>
              </div>
              <p>Please sign in to the admin panel to view the task.</p>
              <p>Best regards,<br>SK Production</p>
            `),
          },
        },
      },
    ],
  },
  {
    key: 'maintenance_reminder',
    name: 'Bakım Hatırlatması',
    enabled: true,
    variants: [
      {
        name: 'default',
        weight: 100,
        locales: {
          tr: {
            subject: 'Bakım Hatırlatması - SK Production',
            html: baseLayout(`
              <h2 style="color: #0066CC;">Bakım Hatırlatması</h2>
              <p>Merhaba {{userName}},</p>
              <p>Aşağıdaki ekipman için yaklaşan bir bakım var:</p>
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3>{{equipmentName}}</h3>
                <p><strong>Bakım Tarihi:</strong> {{maintenanceDate}}</p>
              </div>
              <p>Lütfen bakım planlamasını yapın.</p>
              <p>İyi çalışmalar,<br>SK Production</p>
            `),
          },
          en: {
            subject: 'Maintenance Reminder - SK Production',
            html: baseLayout(`
              <h2 style="color: #0066CC;">Maintenance Reminder</h2>
              <p>Hello {{userName}},</p>
              <p>There is an upcoming maintenance for the following equipment:</p>
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3>{{equipmentName}}</h3>
                <p><strong>Date:</strong> {{maintenanceDate}}</p>
              </div>
              <p>Please plan accordingly.</p>
              <p>Best regards,<br>SK Production</p>
            `),
          },
        },
      },
    ],
  },
  {
    key: 'project_started',
    name: 'Proje Başlangıç Bildirimi',
    enabled: true,
    variants: [
      {
        name: 'default',
        weight: 100,
        locales: {
          tr: {
            subject: 'Proje Başlangıç Bildirimi - SK Production',
            html: baseLayout(`
              <h2 style="color: #0066CC;">Proje Başlangıç Bildirimi</h2>
              <p>Merhaba {{clientName}},</p>
              <p>Projeniz başlamıştır:</p>
              <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3>{{projectName}}</h3>
                <p><strong>Başlangıç Tarihi:</strong> {{startDate}}</p>
              </div>
              <p>Proje detaylarını admin panelinden takip edebilirsiniz.</p>
              <p>İyi çalışmalar,<br>SK Production</p>
            `),
          },
          en: {
            subject: 'Project Started - SK Production',
            html: baseLayout(`
              <h2 style="color: #0066CC;">Project Started</h2>
              <p>Hello {{clientName}},</p>
              <p>Your project has started:</p>
              <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3>{{projectName}}</h3>
                <p><strong>Start Date:</strong> {{startDate}}</p>
              </div>
              <p>You can follow the details in the admin panel.</p>
              <p>Best regards,<br>SK Production</p>
            `),
          },
        },
      },
    ],
  },
  {
    key: 'project_status_changed',
    name: 'Proje Durumu Güncellendi',
    enabled: true,
    variants: [
      {
        name: 'default',
        weight: 100,
        locales: {
          tr: {
            subject: 'Proje Durumu Güncellendi: {{projectName}} - SK Production',
            html: baseLayout(`
              <h2 style="color: #0066CC;">Proje Durumu Güncellendi</h2>
              <p>Merhaba,</p>
              <p><strong>{{projectName}}</strong> projesinin durumu güncellendi:</p>
              <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0066CC;">
                <p><strong>Eski Durum:</strong> {{oldStatusLabel}}</p>
                <p><strong>Yeni Durum:</strong> {{newStatusLabel}}</p>
              </div>
              <p>Proje detaylarını admin panelinden görüntüleyebilirsiniz.</p>
              <p>İyi çalışmalar,<br>SK Production</p>
            `),
          },
          en: {
            subject: 'Project Status Updated: {{projectName}} - SK Production',
            html: baseLayout(`
              <h2 style="color: #0066CC;">Project Status Updated</h2>
              <p>Hello,</p>
              <p>The status of <strong>{{projectName}}</strong> has been updated:</p>
              <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0066CC;">
                <p><strong>Old Status:</strong> {{oldStatusLabel}}</p>
                <p><strong>New Status:</strong> {{newStatusLabel}}</p>
              </div>
              <p>You can view the details in the admin panel.</p>
              <p>Best regards,<br>SK Production</p>
            `),
          },
        },
      },
    ],
  },
  {
    key: 'user_invite',
    name: 'Kullanıcı Daveti',
    enabled: true,
    variants: [
      {
        name: 'default',
        weight: 100,
        locales: {
          tr: {
            subject: 'SK Production - Hesap Oluşturuldu',
            html: baseLayout(`
              <h2 style="color: #0066CC;">SK Production'a Hoş Geldiniz!</h2>
              <p>Merhaba {{userName}},</p>
              <p><strong>{{inviterName}}</strong> sizi SK Production sistemine <strong>{{roleLabel}}</strong> rolü ile ekledi.</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Email:</strong> {{userEmail}}</p>
                {{{temporaryPasswordHtml}}}
              </div>
              <p>Admin paneline giriş yapmak için:</p>
              <p style="text-align: center; margin: 20px 0;">
                <a href="{{adminLoginUrl}}"
                   style="background-color: #0066CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Giriş Yap
                </a>
              </p>
              <p>İyi çalışmalar,<br>SK Production</p>
            `),
          },
          en: {
            subject: 'SK Production - Account Created',
            html: baseLayout(`
              <h2 style="color: #0066CC;">Welcome to SK Production!</h2>
              <p>Hello {{userName}},</p>
              <p><strong>{{inviterName}}</strong> added you to SK Production with the role <strong>{{roleLabel}}</strong>.</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Email:</strong> {{userEmail}}</p>
                {{{temporaryPasswordHtml}}}
              </div>
              <p>To sign in to the admin panel:</p>
              <p style="text-align: center; margin: 20px 0;">
                <a href="{{adminLoginUrl}}"
                   style="background-color: #0066CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Sign In
                </a>
              </p>
              <p>Best regards,<br>SK Production</p>
            `),
          },
        },
      },
    ],
  },
];

const main = async () => {
  try {
    logger.info('✉️ Email template seed başlıyor...');
    await connectDB();

    for (const t of templates) {
      await EmailTemplate.updateOne(
        { key: t.key },
        {
          $set: {
            key: t.key,
            name: t.name,
            description: t.description,
            enabled: t.enabled,
            variants: t.variants,
          },
        },
        { upsert: true }
      );
      logger.info(`✅ Seed OK: ${t.key}`);
    }
  } finally {
    try {
      await mongoose.connection.close();
    } catch {
      // ignore
    }
    logger.info('🔚 Email template seed bitti.');
  }
};

main().catch((e) => {
  logger.error('Email template seed fatal hata:', e);
  process.exit(1);
});

