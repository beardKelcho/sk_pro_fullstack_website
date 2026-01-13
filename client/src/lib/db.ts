/**
 * Veritabanı bağlantısı için Prisma konfigürasyonu
 * Bu dosya, veritabanı üzerinde işlem yapmak için kullanılacak
 * Note: This project uses MongoDB, not Prisma. This file provides a mock Prisma client.
 */

// Mock Prisma client for compatibility with AB testing and push notification features
// These features are optional and can be implemented with MongoDB later
class MockPrismaClient {
  experiment = {
    findUnique: (_args?: any) => Promise.resolve(null),
  };
  experimentResult = {
    create: (args?: any) => Promise.resolve({ 
      id: 'mock-id', 
      experimentId: args?.data?.experimentId || '', 
      variantId: args?.data?.variantId || '', 
      userId: args?.data?.userId || '', 
      conversion: args?.data?.conversion || false, 
      timestamp: args?.data?.timestamp || new Date() 
    }),
  };
  pushSubscription = {
    deleteMany: (_args?: any) => Promise.resolve({ count: 0 }),
    create: (args?: any) => Promise.resolve({ 
      id: 'mock-id', 
      userId: args?.data?.userId || '', 
      endpoint: args?.data?.endpoint || '', 
      p256dh: args?.data?.p256dh || '', 
      auth: args?.data?.auth || '', 
      createdAt: args?.data?.createdAt || new Date(), 
      updatedAt: args?.data?.updatedAt || new Date() 
    }),
  };
}

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: MockPrismaClient;
}

export let db: MockPrismaClient;

if (process.env.NODE_ENV === 'production') {
  db = new MockPrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new MockPrismaClient();
  }
  db = global.cachedPrisma;
} 