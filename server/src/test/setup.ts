/**
 * Test Setup Dosyası
 * 
 * Bu dosya tüm testlerden önce çalıştırılır
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// MongoMemoryServer ilk çalıştırmada binary indirdiği için hook timeout'larını yükselt
jest.setTimeout(60000);

// Test veritabanı bağlantısı
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 60000);

// Her test sonrası veritabanını temizle
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Tüm testler sonrası bağlantıyı kapat
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
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
