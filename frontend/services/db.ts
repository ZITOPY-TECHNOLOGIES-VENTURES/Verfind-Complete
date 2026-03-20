import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { User, Property, Task } from '../types.ts';

interface VerifindDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  properties: {
    key: string;
    value: Property;
    indexes: { 'by-agent': string; 'by-district': string };
  };
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-user': string };
  };
}

const DB_NAME = 'verifind_db';
const DB_VERSION = 1;

// Define specific store names to avoid DBSchema string index signature issues
type StoreNames = 'users' | 'properties' | 'tasks';

class Database {
  private dbPromise: Promise<IDBPDatabase<VerifindDB>>;

  constructor() {
    this.dbPromise = openDB<VerifindDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Users Store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: '_id' });
          userStore.createIndex('by-email', 'email', { unique: true });
        }
        
        // Properties Store
        if (!db.objectStoreNames.contains('properties')) {
          const propertyStore = db.createObjectStore('properties', { keyPath: '_id' });
          propertyStore.createIndex('by-agent', 'agentId');
          propertyStore.createIndex('by-district', 'district');
        }

        // Tasks Store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: '_id' });
          taskStore.createIndex('by-user', 'userId');
        }
      },
    });
  }

  // --- Generic Helpers ---

  async get<StoreName extends StoreNames>(
    storeName: StoreName,
    key: string
  ): Promise<VerifindDB[StoreName]['value'] | undefined> {
    return (await this.dbPromise).get(storeName, key);
  }

  async getAll<StoreName extends StoreNames>(storeName: StoreName): Promise<VerifindDB[StoreName]['value'][]> {
    return (await this.dbPromise).getAll(storeName);
  }

  async add<StoreName extends StoreNames>(
    storeName: StoreName,
    value: VerifindDB[StoreName]['value']
  ): Promise<string> {
    return (await this.dbPromise).put(storeName, value);
  }

  async put<StoreName extends StoreNames>(
    storeName: StoreName,
    value: VerifindDB[StoreName]['value']
  ): Promise<string> {
    return (await this.dbPromise).put(storeName, value);
  }

  async delete<StoreName extends StoreNames>(
    storeName: StoreName,
    key: string
  ): Promise<void> {
    return (await this.dbPromise).delete(storeName, key);
  }

  async getFromIndex<StoreName extends StoreNames>(
    storeName: StoreName,
    indexName: keyof VerifindDB[StoreName]['indexes'],
    key: any
  ): Promise<VerifindDB[StoreName]['value'] | undefined> {
    return (await this.dbPromise).getFromIndex(storeName, indexName as any, key);
  }
}

export const db = new Database();