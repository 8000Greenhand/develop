// IndexedDB 存档管理系统
class SaveManager {
  constructor() {
    this.dbName = 'DNDShadowAdventure';
    this.dbVersion = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 角色存档
        if (!db.objectStoreNames.contains('characters')) {
          const characterStore = db.createObjectStore('characters', { keyPath: 'id' });
          characterStore.createIndex('name', 'name', { unique: false });
          characterStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // 游戏进度存档
        if (!db.objectStoreNames.contains('saves')) {
          const saveStore = db.createObjectStore('saves', { keyPath: 'id' });
          saveStore.createIndex('characterId', 'characterId', { unique: false });
          saveStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // 设置
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // 生成唯一 ID
  generateId() {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 保存角色
  async saveCharacter(character) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库未初始化'));
        return;
      }
      
      const transaction = this.db.transaction(['characters'], 'readwrite');
      const store = transaction.objectStore('characters');
      
      // 获取角色数据
      const charData = character.toJSON ? character.toJSON() : { ...character };
      
      // 确保有 ID
      if (!charData.id) {
        charData.id = this.generateId();
      }
      
      charData.updatedAt = new Date().toISOString();
      
      const request = store.put(charData);
      request.onsuccess = () => resolve(charData);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取所有角色
  async getAllCharacters() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([]);
        return;
      }
      
      const transaction = this.db.transaction(['characters'], 'readonly');
      const store = transaction.objectStore('characters');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取单个角色
  async getCharacter(id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null);
        return;
      }
      
      const transaction = this.db.transaction(['characters'], 'readonly');
      const store = transaction.objectStore('characters');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 删除角色
  async deleteCharacter(id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库未初始化'));
        return;
      }
      
      const transaction = this.db.transaction(['characters', 'saves'], 'readwrite');
      
      // 删除角色
      const charStore = transaction.objectStore('characters');
      charStore.delete(id);
      
      // 删除相关存档
      const saveStore = transaction.objectStore('saves');
      const index = saveStore.index('characterId');
      const request = index.openCursor(IDBKeyRange.only(id));
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // 保存游戏进度
  async saveGame(characterId, gameState, location) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库未初始化'));
        return;
      }
      
      const transaction = this.db.transaction(['saves'], 'readwrite');
      const store = transaction.objectStore('saves');
      
      const data = {
        id: `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        characterId: characterId || 'unknown',
        gameState: gameState,
        location: location || '未知',
        timestamp: new Date().toISOString()
      };
      
      const request = store.add(data);
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取角色所有存档
  async getSavesForCharacter(characterId) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([]);
        return;
      }
      
      const transaction = this.db.transaction(['saves'], 'readonly');
      const store = transaction.objectStore('saves');
      const index = store.index('characterId');
      const request = index.getAll(characterId);
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取最新存档
  async getLatestSave(characterId) {
    const saves = await this.getSavesForCharacter(characterId);
    if (saves.length === 0) return null;
    
    saves.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return saves[0];
  }

  // 获取所有存档（带角色信息）
  async getAllSaves() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([]);
        return;
      }
      
      const transaction = this.db.transaction(['saves', 'characters'], 'readonly');
      const saveStore = transaction.objectStore('saves');
      const request = saveStore.getAll();
      
      request.onsuccess = async () => {
        const saves = request.result || [];
        const characters = await this.getAllCharacters();
        const charMap = new Map(characters.map(c => [c.id, c]));
        
        const result = saves.map(save => ({
          ...save,
          character: charMap.get(save.characterId)
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 保存设置
  async saveSetting(key, value) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库未初始化'));
        return;
      }
      
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 获取设置
  async getSetting(key, defaultValue = null) {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve(defaultValue);
        return;
      }
      
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result?.value ?? defaultValue);
      };
      request.onerror = () => resolve(defaultValue);
    });
  }
}

// 全局实例
window.saveManager = new SaveManager();
