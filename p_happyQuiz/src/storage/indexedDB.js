const DB_NAME = 'QuizDB';
const DB_VERSION = 1;

class IndexedDB {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('IndexedDB 打开失败'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('banks')) {
          const bankStore = db.createObjectStore('banks', { keyPath: 'id' });
          bankStore.createIndex('isLocal', 'isLocal', { unique: false });
          bankStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('questions')) {
          const questionStore = db.createObjectStore('questions', { keyPath: 'id' });
          questionStore.createIndex('bankId', 'bankId', { unique: false });
        }

        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('bankId', 'bankId', { unique: false });
          sessionStore.createIndex('userId', 'userId', { unique: false });
          sessionStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('wrongQuestions')) {
          const wrongStore = db.createObjectStore('wrongQuestions', { keyPath: 'id' });
          wrongStore.createIndex('questionId', 'questionId', { unique: false });
          wrongStore.createIndex('bankId', 'bankId', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  async getAll(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

const db = new IndexedDB();

export default db;