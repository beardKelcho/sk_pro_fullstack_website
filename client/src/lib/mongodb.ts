/**
 * MongoDB bağlantısı için yapılandırma
 * Bu dosya, MongoDB ile iletişim kurmak için kullanılacak
 */

import { MongoClient, Db } from 'mongodb';

// MongoDB URI is optional during build time
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skproduction';

if (!process.env.MONGODB_URI && process.env.NODE_ENV !== 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  console.warn('MONGODB_URI ortam değişkeni tanımlı değil, varsayılan URI kullanılıyor');
}
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let cachedDb: Db;

if (process.env.NODE_ENV === 'development') {
  // Geliştirme modunda her sıcak yeniden yükleme global değişkenleri sıfırlayacağından,
  // global bir değişken kullanarak bağlantıyı önbelleğe alıyoruz
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
    _cachedDb?: Db;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Üretim modunda, bağlantıyı modül düzeyinde önbelleğe alıyoruz
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  if (cachedDb) {
    return { client, db: cachedDb };
  }

  const connectedClient = await clientPromise;
  const db = connectedClient.db(process.env.MONGODB_DB || 'skproduction');

  cachedDb = db;
  return { client: connectedClient, db };
}

export { clientPromise }; 