// Function to open the IndexedDB database 
export async function openCaloriesDB(dbName, version) {
  const indexedDB =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB;

  return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);

      request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // Create an object store if it doesn't already exist
          if (!db.objectStoreNames.contains('calories')) {
              const store = db.createObjectStore('calories', {
                  keyPath: 'id',
                  autoIncrement: true,
              });
              store.createIndex('date', 'date', { unique: false });
          }
      };

      request.onsuccess = (event) => {
          resolve(event.target.result);
      };

      request.onerror = (event) => {
          reject(event.target.error);
      };
  });
}

// Function to add a new calorie entry
export async function addCalories(db, entry) {
  return new Promise((resolve, reject) => {
      const transaction = db.transaction('calories', 'readwrite');
      const store = transaction.objectStore('calories');
      const request = store.add(entry);

      request.onsuccess = () => {
          resolve(true);
      };

      request.onerror = (event) => {
          reject(event.target.error);
      };
  });
}

// Function to get all entries for a specific month
export async function getCaloriesByMonth(db, year, month) {
  return new Promise((resolve, reject) => {
      const transaction = db.transaction('calories', 'readonly');
      const store = transaction.objectStore('calories');
      const index = store.index('date');
      const results = [];

      index.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
              const entryDate = new Date(cursor.value.date);
              if (
                  entryDate.getFullYear() === year &&
                  entryDate.getMonth() + 1 === month
              ) {
                  results.push(cursor.value);
              }
              cursor.continue();
          } else {
              resolve(results);
          }
      };

      transaction.onerror = (event) => {
          reject(event.target.error);
      };
  });
}
