interface OfflineFormData {
  id: string;
  formName: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
}

class OfflineStorage {
  private static instance: OfflineStorage;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'skproduction-offline';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'offline-forms';

  private constructor() {
    this.initDB();
  }

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  private initDB(): void {
    if (!window.indexedDB) {
      console.error('IndexedDB is not supported');
      return;
    }

    const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', event);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.STORE_NAME)) {
        const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };
  }

  async saveForm(formData: Omit<OfflineFormData, 'id' | 'timestamp' | 'status' | 'retryCount'>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);

    const data: OfflineFormData = {
      ...formData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingForms(): Promise<OfflineFormData[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
    const store = transaction.objectStore(this.STORE_NAME);
    const index = store.index('status');

    return new Promise((resolve, reject) => {
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateFormStatus(id: string, status: OfflineFormData['status']): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);

    const form = await new Promise<OfflineFormData>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    form.status = status;
    form.retryCount += 1;

    await new Promise<void>((resolve, reject) => {
      const request = store.put(form);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteForm(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = OfflineStorage.getInstance();

// Offline form submission için yardımcı fonksiyonlar
export const offlineForm = {
  save: async (formName: string, data: any) => {
    await offlineStorage.saveForm({
      formName,
      data,
    });
  },

  processPending: async () => {
    const pendingForms = await offlineStorage.getPendingForms();
    
    for (const form of pendingForms) {
      try {
        // Form verilerini API'ye gönder
        const response = await fetch('/api/forms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formName: form.formName,
            data: form.data,
          }),
        });

        if (response.ok) {
          await offlineStorage.updateFormStatus(form.id, 'completed');
          await offlineStorage.deleteForm(form.id);
        } else {
          await offlineStorage.updateFormStatus(form.id, 'failed');
        }
      } catch (error) {
        await offlineStorage.updateFormStatus(form.id, 'failed');
      }
    }
  },
}; 