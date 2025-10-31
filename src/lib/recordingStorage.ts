// IndexedDB storage for call recordings
// Provides persistent storage for audio recordings with playback support

const DB_NAME = 'ScholarixRecordings';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

export interface StoredRecording {
  id: string;
  callId: string;
  blob: Blob;
  filename: string;
  duration: number;
  timestamp: number;
  prospectName: string;
  mimeType: string;
  size: number;
}

class RecordingStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('callId', 'callId', { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('prospectName', 'prospectName', { unique: false });
          console.log('✅ IndexedDB object store created');
        }
      };
    });
  }

  async saveRecording(recording: StoredRecording): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(recording);

      request.onsuccess = () => {
        console.log(`✅ Recording saved to IndexedDB: ${recording.filename}`);
        console.log(`   Size: ${(recording.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Duration: ${recording.duration}s`);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save recording:', request.error);
        reject(request.error);
      };
    });
  }

  async getRecording(id: string): Promise<StoredRecording | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Failed to get recording:', request.error);
        reject(request.error);
      };
    });
  }

  async getRecordingByCallId(callId: string): Promise<StoredRecording | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('callId');
      const request = index.get(callId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Failed to get recording by callId:', request.error);
        reject(request.error);
      };
    });
  }

  async getAllRecordings(): Promise<StoredRecording[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get all recordings:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteRecording(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`✅ Recording deleted: ${id}`);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete recording:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteOldRecordings(daysToKeep: number = 30): Promise<number> {
    if (!this.db) await this.init();

    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const allRecordings = await this.getAllRecordings();
    const oldRecordings = allRecordings.filter(r => r.timestamp < cutoffDate);

    for (const recording of oldRecordings) {
      await this.deleteRecording(recording.id);
    }

    console.log(`🗑️ Deleted ${oldRecordings.length} old recordings`);
    return oldRecordings.length;
  }

  async getTotalStorageSize(): Promise<number> {
    const allRecordings = await this.getAllRecordings();
    return allRecordings.reduce((total, recording) => total + recording.size, 0);
  }

  createBlobUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  revokeBlobUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  downloadRecording(recording: StoredRecording): void {
    try {
      const url = this.createBlobUrl(recording.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = recording.filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => this.revokeBlobUrl(url), 100);

      console.log(`📥 Recording downloaded: ${recording.filename}`);
    } catch (error) {
      console.error('Failed to download recording:', error);
      throw new Error('Failed to download recording');
    }
  }

  async shareRecording(recording: StoredRecording): Promise<void> {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    try {
      const file = new File([recording.blob], recording.filename, { type: recording.mimeType });

      await navigator.share({
        title: `Call Recording - ${recording.prospectName}`,
        text: `Call recording from ${new Date(recording.timestamp).toLocaleString()}`,
        files: [file]
      });

      console.log('✅ Recording shared successfully');
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Share cancelled by user');
      } else {
        console.error('Failed to share recording:', error);
        throw error;
      }
    }
  }
}

export const recordingStorage = new RecordingStorage();
