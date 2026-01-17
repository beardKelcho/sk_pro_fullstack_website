/**
 * Test Setup Dosyası
 * 
 * Bu dosya tüm testlerden önce çalıştırılır
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

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
});

// Tüm testler sonrası bağlantıyı kapat
afterAll(async () => {
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
