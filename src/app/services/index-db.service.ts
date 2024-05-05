import { Injectable } from '@angular/core';

@Injectable()
export class IndexDbService {
  private dbName: string = 'ng-iq-database';
  private objectStoreName: string = 'angularQuestions';
  private dbVersion: number = 1;
  private db!: IDBDatabase;
  private isDatabaseReady: boolean = false;
  private retrieveQueue: (() => void)[] = [];

  constructor() {}

  createLayerDB(): void {
    if (!indexedDB) {
      return;
    }
    const openRequest: IDBOpenDBRequest = indexedDB?.open(this.dbName, this.dbVersion);

    openRequest.onerror = (event: Event) => {
      console.error('Failed to open IndexedDB database:', (event.target as IDBOpenDBRequest).error);
    };

    openRequest.onsuccess = (event: Event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.isDatabaseReady = true;
      // console.log('IndexedDB database opened successfully.');

      // Process the retrieve queue
      this.processRetrieveQueue();
    };

    openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      this.db = (event.target as IDBOpenDBRequest).result;

      if (!this.db.objectStoreNames.contains(this.objectStoreName)) {
        this.db.createObjectStore(this.objectStoreName, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };
  }

  private processRetrieveQueue(): void {
    while (this.retrieveQueue.length > 0) {
      const callback: (() => void) | undefined = this.retrieveQueue.shift();
      callback && callback();
    }
  }

  /**
   *
   * @param files
   * @description stores the files array in indexDB.
   */
  public async saveQuestionsRecords(record: any): Promise<boolean> {
    if (!this.isDatabaseReady) {
      console.error('IndexedDB is not ready yet.');
      return false;
    }

    return new Promise<boolean>((resolve, reject) => {
      const transaction: IDBTransaction = this.db.transaction(this.objectStoreName, 'readwrite');
      const objectStore: IDBObjectStore = transaction.objectStore(this.objectStoreName);
      objectStore.clear();
      const request: IDBRequest<IDBValidKey> = objectStore.add(record);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (event: Event) => {
        console.error('Failed to save file:', (event.target as IDBRequest).error);
        reject(false);
      };
    });
  }

  /**
   *
   * @returns stored files array,if any.
   */
  public retrieveQuestions(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const retrieveCallback: () => void = () => {
        const transaction: IDBTransaction = this.db.transaction(this.objectStoreName, 'readonly');
        const objectStore: IDBObjectStore = transaction.objectStore(this.objectStoreName);

        const retrieveRequest: IDBRequest = objectStore.getAll();

        retrieveRequest.onsuccess = (event: Event) => {
          const records = (event.target as IDBRequest).result;
          resolve(records);
        };

        retrieveRequest.onerror = (event: Event) => {
          console.error('Failed to retrieve files:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      };

      if (this.isDatabaseReady) {
        retrieveCallback();
      } else {
        // Queue the retrieve request
        this.retrieveQueue.push(retrieveCallback);
      }
    });
  }

  /**
   *  @description clears the stored files.
   */

  public async clearFiles(): Promise<void> {
    const transaction: IDBTransaction = this.db.transaction(this.objectStoreName, 'readwrite');
    const objectStore: IDBObjectStore = transaction.objectStore(this.objectStoreName);

    return new Promise<void>((resolve, reject) => {
      const clearRequest: IDBRequest = objectStore.clear();

      clearRequest.onsuccess = () => {
        resolve();
      };

      clearRequest.onerror = (event: Event) => {
        console.error('Failed to clear files:', (event.target as IDBRequest).error);
        reject();
      };
    });
  }
}
