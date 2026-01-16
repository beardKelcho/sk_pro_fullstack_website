import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import connectDB from '../config/database';
import {
  User,
  Equipment,
  Project,
  Client,
  Maintenance,
  Task,
  SiteImage,
  SiteContent,
  QRCode,
  QRScanHistory,
  Notification,
  AuditLog,
  PushSubscription,
  NotificationSettings,
  Widget,
  ReportSchedule,
  VersionHistory,
  SavedSearch,
  SearchHistory,
  Session,
  EmailTemplate,
} from '../models';

dotenv.config();

const models = [
  User,
  Equipment,
  Project,
  Client,
  Maintenance,
  Task,
  SiteImage,
  SiteContent,
  QRCode,
  QRScanHistory,
  Notification,
  AuditLog,
  PushSubscription,
  NotificationSettings,
  Widget,
  ReportSchedule,
  VersionHistory,
  SavedSearch,
  SearchHistory,
  Session,
  EmailTemplate,
];

const main = async () => {
  try {
    logger.info('🔧 Index sync başlıyor...');
    await connectDB();

    for (const m of models) {
      const name = m.modelName;
      try {
        const res = await m.syncIndexes();
        logger.info(`✅ ${name}.syncIndexes OK`, { result: res });
      } catch (err) {
        logger.error(`❌ ${name}.syncIndexes hata`, err);
      }
    }
  } finally {
    try {
      await mongoose.connection.close();
    } catch {
      // ignore
    }
    logger.info('🔚 Index sync bitti.');
  }
};

main().catch((e) => {
  logger.error('Index sync fatal hata:', e);
  process.exit(1);
});

