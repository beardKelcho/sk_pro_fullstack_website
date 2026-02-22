import logger from '@/utils/logger';
interface SyncTask {
  id: string;
  type: 'form' | 'data' | 'media';
  data: any;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
}

class BackgroundSync {
  private static instance: BackgroundSync;
  private syncQueue: SyncTask[] = [];
  private isProcessing: boolean = false;
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 dakika

  private constructor() {
    this.initSync();
  }

  static getInstance(): BackgroundSync {
    if (!BackgroundSync.instance) {
      BackgroundSync.instance = new BackgroundSync();
    }
    return BackgroundSync.instance;
  }

  private initSync(): void {
    // Periyodik senkronizasyon
    setInterval(() => {
      this.processSyncQueue();
    }, this.SYNC_INTERVAL);

    // Online/offline durumu değişikliklerini dinle
    window.addEventListener('online', () => {
      this.processSyncQueue();
    });
  }

  async addToSyncQueue(task: Omit<SyncTask, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const syncTask: SyncTask = {
      ...task,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(syncTask);
    this.syncQueue.sort((a, b) => {
      // Önceliğe göre sırala
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Yüksek öncelikli görevler için hemen senkronizasyon başlat
    if (task.priority === 'high') {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.syncQueue.length > 0) {
        const task = this.syncQueue[0];
        
        try {
          await this.processTask(task);
          this.syncQueue.shift(); // Başarılı görevi kuyruktan çıkar
        } catch (error) {
          if (task.retryCount < this.MAX_RETRIES) {
            task.retryCount++;
            // Görevi kuyruğun sonuna taşı
            this.syncQueue.push(this.syncQueue.shift()!);
          } else {
            // Maksimum deneme sayısına ulaşıldı, görevi kuyruktan çıkar
            this.syncQueue.shift();
            logger.error(`Task failed after ${this.MAX_RETRIES} retries:`, task);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processTask(task: SyncTask): Promise<void> {
    switch (task.type) {
      case 'form':
        await this.processFormTask(task);
        break;
      case 'data':
        await this.processDataTask(task);
        break;
      case 'media':
        await this.processMediaTask(task);
        break;
    }
  }

  private async processFormTask(task: SyncTask): Promise<void> {
    const response = await fetch('/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task.data),
    });

    if (!response.ok) {
      throw new Error(`Form sync failed: ${response.statusText}`);
    }
  }

  private async processDataTask(task: SyncTask): Promise<void> {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task.data),
    });

    if (!response.ok) {
      throw new Error(`Data sync failed: ${response.statusText}`);
    }
  }

  private async processMediaTask(task: SyncTask): Promise<void> {
    const formData = new FormData();
    formData.append('file', task.data.file);
    formData.append('metadata', JSON.stringify(task.data.metadata));

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Media sync failed: ${response.statusText}`);
    }
  }

  getQueueStatus(): { total: number; pending: number; failed: number } {
    return {
      total: this.syncQueue.length,
      pending: this.syncQueue.filter(task => task.retryCount === 0).length,
      failed: this.syncQueue.filter(task => task.retryCount > 0).length,
    };
  }

  clearQueue(): void {
    this.syncQueue = [];
  }
}

export const backgroundSync = BackgroundSync.getInstance();

// Background sync için yardımcı fonksiyonlar
export const sync = {
  form: async (data: any, priority: SyncTask['priority'] = 'medium') => {
    await backgroundSync.addToSyncQueue({
      type: 'form',
      data,
      priority,
    });
  },

  data: async (data: any, priority: SyncTask['priority'] = 'medium') => {
    await backgroundSync.addToSyncQueue({
      type: 'data',
      data,
      priority,
    });
  },

  media: async (file: File, metadata: any, priority: SyncTask['priority'] = 'high') => {
    await backgroundSync.addToSyncQueue({
      type: 'media',
      data: { file, metadata },
      priority,
    });
  },

  getStatus: () => backgroundSync.getQueueStatus(),
  clear: () => backgroundSync.clearQueue(),
}; 