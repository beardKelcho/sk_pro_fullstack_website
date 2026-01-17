import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_QUEUE_KEY = '@skpro:offline_queue';
const OFFLINE_DATA_KEY = '@skpro:offline_data';

export interface OfflineRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  timestamp: number;
  retries: number;
}

export interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
}

/**
 * Network durumunu kontrol et
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.error('Network durumu kontrol hatası:', error);
    return false;
  }
};

/**
 * Network durumu listener'ı ekle
 */
export const addNetworkListener = (callback: (isConnected: boolean) => void) => {
  return NetInfo.addEventListener((state) => {
    callback(state.isConnected ?? false);
  });
};

/**
 * Offline request'i queue'ya ekle
 */
export const addToQueue = async (request: Omit<OfflineRequest, 'id' | 'timestamp' | 'retries'>): Promise<void> => {
  try {
    const queue = await getQueue();
    const newRequest: OfflineRequest = {
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };
    queue.push(newRequest);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Offline queue ekleme hatası:', error);
  }
};

/**
 * Offline queue'yu getir
 */
export const getQueue = async (): Promise<OfflineRequest[]> => {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Offline queue getirme hatası:', error);
    return [];
  }
};

/**
 * Queue'dan request sil
 */
export const removeFromQueue = async (requestId: string): Promise<void> => {
  try {
    const queue = await getQueue();
    const filtered = queue.filter((req) => req.id !== requestId);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Offline queue silme hatası:', error);
  }
};

/**
 * Queue'yu temizle
 */
export const clearQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('Offline queue temizleme hatası:', error);
  }
};

/**
 * Offline data kaydet
 */
export const saveOfflineData = async (key: string, data: any): Promise<void> => {
  try {
    const offlineData = await getOfflineData();
    offlineData[key] = {
      key,
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
  } catch (error) {
    console.error('Offline data kaydetme hatası:', error);
  }
};

/**
 * Offline data getir
 */
export const getOfflineData = async (): Promise<Record<string, OfflineData>> => {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Offline data getirme hatası:', error);
    return {};
  }
};

/**
 * Belirli bir offline data getir
 */
export const getOfflineDataByKey = async (key: string): Promise<any | null> => {
  try {
    const offlineData = await getOfflineData();
    return offlineData[key]?.data || null;
  } catch (error) {
    console.error('Offline data getirme hatası:', error);
    return null;
  }
};

/**
 * Offline data sil
 */
export const removeOfflineData = async (key: string): Promise<void> => {
  try {
    const offlineData = await getOfflineData();
    delete offlineData[key];
    await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
  } catch (error) {
    console.error('Offline data silme hatası:', error);
  }
};

/**
 * Queue'daki request'leri sync et (online olduğunda çağrılır)
 */
export const syncQueue = async (): Promise<void> => {
  const online = await isOnline();
  if (!online) {
    console.log('Offline mode: Queue sync atlandı');
    return;
  }

  const queue = await getQueue();
  if (queue.length === 0) {
    return;
  }

  console.log(`Queue sync başlatılıyor: ${queue.length} request`);

  // Queue'daki request'leri sırayla işle
  // Not: Bu basit bir implementasyon, gerçek uygulamada daha gelişmiş bir sync mekanizması gerekebilir
  for (const request of queue) {
    try {
      // HTTP client ile request'i tekrar gönder
      // Bu kısım http.ts'deki axios instance'ı kullanarak yapılabilir
      // Şimdilik sadece log
      console.log(`Request sync ediliyor: ${request.method} ${request.url}`);
      
      // Başarılı olursa queue'dan sil
      await removeFromQueue(request.id);
    } catch (error) {
      console.error(`Request sync hatası: ${request.id}`, error);
      // Retry sayısını artır
      request.retries += 1;
      // Max retry sayısına ulaştıysa queue'dan sil
      if (request.retries >= 3) {
        await removeFromQueue(request.id);
      }
    }
  }
};
