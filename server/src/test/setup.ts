/**
 * Test Setup Dosyası
 * 
 * Bu dosya tüm testlerden önce çalıştırılır
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnectRedis } from '../config/redis';
import { stopMonitoringRealtimePush } from '../utils/scheduledTasks';

// Mongoose'ın Jest fake timer uyarılarını bastır (özellikle bazı unit testlerde fake timers kullanıyoruz)
process.env.SUPPRESS_JEST_WARNINGS = process.env.SUPPRESS_JEST_WARNINGS || 'true';

let mongoServer: MongoMemoryServer;

// MongoMemoryServer ilk çalıştırmada binary indirdiği için hook timeout'larını yükselt
jest.setTimeout(60000);

// Test veritabanı bağlantısı
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  // Bazı test dosyaları mongoose bağlantısını kapatabilir; güvenli başlatma
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  }
  await mongoose.connect(mongoUri);
}, 60000);

// Her test sonrası veritabanını temizle
afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  
  // Aktif timer'ları temizle (fake timers kullanılmıyorsa)
  if (!jest.isMockFunction(setTimeout)) {
    // Real timers kullanılıyorsa, pending timer'ları kontrol et
    // Jest'in kendi timer cleanup'ı var ama ekstra güvenlik için
  }
});

// Tüm testler sonrası bağlantıyı kapat
afterAll(async () => {
  // Scheduled tasks'ı durdur (interval'ları temizle)
  try {
    stopMonitoringRealtimePush();
  } catch {
    // ignore
  }
  
  // Redis bağlantısını kapat
  try {
    await disconnectRedis();
  } catch {
    // ignore - Redis test'te kullanılmıyor olabilir
  }
  
  // Connection down/closed ise buffering timeout'a düşmemek için guard ekle
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
    }
  } catch {
    // ignore - cleanup best effort
  }

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch {
    // ignore
  }

  try {
    await mongoServer?.stop();
  } catch {
    // ignore
  }
  
  // Tüm pending timer'ları temizle
  // Jest'in kendi cleanup'ı var ama ekstra güvenlik için
  if (typeof jest !== 'undefined' && jest.clearAllTimers) {
    jest.clearAllTimers();
  }
  
  // Node.js event loop'u temizle (pending callbacks)
  // Force garbage collection (eğer --expose-gc flag'i ile çalıştırılıyorsa)
  if (global.gc) {
    global.gc();
  }
}, 60000);

// Console log'ları test sırasında gizle
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
