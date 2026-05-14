// StateManager - A Dark Room 风格集中式状态管理
// 替换分散在各处的状态管理，统一到 $SM 对象

/**
 * 状态分类体系（映射 ADR → DND）：
 * features → unlocks（职业特性解锁、法术解锁、地点解锁）
 * stores → inventory（背包物品、金币）
 * character → character（属性值、天赋、种族、职业、等级）
 * income → recovery（法术位恢复、生命恢复）
 * game → campaign（战役数据、NPC状态、当前场景、战斗状态）
 * config → config（用户设置、代理地址）
 * cooldown → cooldown（技能冷却、长休冷却）
 * previous → legacy（历史角色、成就）
 * playStats → stats（游玩统计：遭遇次数、战斗次数等）
 * timers → timers（定时器状态）
 */

class StateManager {
  constructor() {
    this.state = {};
    this.listeners = {};
    this.saveVersion = 1;
    this.autoSaveEnabled = true;
    this.autoSaveTimeout = null;
  }

  // ========== 基础读写方法 ==========

  set(path, value) {
    const keys = path.split('.');
    let obj = this.state;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    const oldValue = obj[keys[keys.length - 1]];
    obj[keys[keys.length - 1]] = value;
    if (oldValue !== value) this.fireUpdate(path);
  }

  get(path, requestZero = false) {
    const keys = path.split('.');
    let obj = this.state;
    for (const key of keys) {
      if (!obj || !obj.hasOwnProperty(key)) return requestZero ? 0 : undefined;
      obj = obj[key];
    }
    return obj;
  }

  add(path, amount) {
    const current = this.get(path, true);
    this.set(path, current + amount);
  }

  addM(basePath, amounts) {
    for (const [key, val] of Object.entries(amounts)) {
      this.add(`${basePath}.${key}`, val);
    }
  }

  setM(basePath, values) {
    for (const [key, val] of Object.entries(values)) {
      this.set(`${basePath}.${key}`, val);
    }
  }

  // ========== 发布/订阅系统 ==========

  subscribe(path, callback) {
    if (!this.listeners[path]) this.listeners[path] = [];
    this.listeners[path].push(callback);
    return () => {
      this.listeners[path] = this.listeners[path].filter(cb => cb !== callback);
    };
  }

  fireUpdate(path) {
    // 精确匹配
    if (this.listeners[path]) {
      this.listeners[path].forEach(cb => cb(this.get(path), path));
    }
    // 通配符匹配（父路径）
    for (const listenerPath of Object.keys(this.listeners)) {
      if (listenerPath.endsWith('.*') && path.startsWith(listenerPath.slice(0, -2))) {
        this.listeners[listenerPath].forEach(cb => cb(this.get(path), path));
      }
    }
    // 全局通配符
    if (this.listeners['*']) {
      this.listeners['*'].forEach(cb => cb(this.get(path), path));
    }
    // 自动保存（防抖）
    this.scheduleAutoSave();
  }

  // ========== 存档系统 ==========

  exportSave() {
    const saveData = {
      version: this.saveVersion,
      timestamp: Date.now(),
      state: this.state
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(saveData))));
  }

  importSave(saveString) {
    try {
      const saveData = JSON.parse(decodeURIComponent(escape(atob(saveString))));
      this.state = saveData.state;
      // 版本迁移
      if (saveData.version < this.saveVersion) {
        this.migrateSave(saveData.version, this.saveVersion);
      }
      this.fireUpdate('*');
      return true;
    } catch (e) {
      console.error('存档导入失败:', e);
      return false;
    }
  }

  migrateSave(fromVersion, toVersion) {
    console.log(`正在迁移存档: v${fromVersion} → v${toVersion}`);
    // 未来版本迁移逻辑在这里
  }

  saveToLocalStorage() {
    try {
      const saveData = {
        version: this.saveVersion,
        timestamp: Date.now(),
        state: this.state
      };
      localStorage.setItem('dnd_rpg_save', JSON.stringify(saveData));
      console.log('自动存档已保存');
      return true;
    } catch (e) {
      console.error('存档保存失败:', e);
      return false;
    }
  }

  loadFromLocalStorage() {
    try {
      const saveDataStr = localStorage.getItem('dnd_rpg_save');
      if (!saveDataStr) return false;
      const saveData = JSON.parse(saveDataStr);
      this.state = saveData.state;
      if (saveData.version < this.saveVersion) {
        this.migrateSave(saveData.version, this.saveVersion);
      }
      this.fireUpdate('*');
      return true;
    } catch (e) {
      console.error('存档加载失败:', e);
      return false;
    }
  }

  scheduleAutoSave() {
    if (!this.autoSaveEnabled) return;
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveToLocalStorage();
    }, 2000);
  }

  clear() {
    this.state = {};
    this.fireUpdate('*');
  }

  reset() {
    this.clear();
    localStorage.removeItem('dnd_rpg_save');
  }

  // ========== 便捷方法 ==========

  // 检查是否有存档
  hasSave() {
    return localStorage.getItem('dnd_rpg_save') !== null;
  }

  // 获取存档信息
  getSaveInfo() {
    try {
      const saveDataStr = localStorage.getItem('dnd_rpg_save');
      if (!saveDataStr) return null;
      const saveData = JSON.parse(saveDataStr);
      return {
        version: saveData.version,
        timestamp: saveData.timestamp,
        characterName: this.get('character.name', true) || '未知',
        level: this.get('character.level', true) || 1
      };
    } catch (e) {
      return null;
    }
  }
}

// 全局事件总线（非状态变更的事件）
class EventBus {
  constructor() {
    this.channels = {};
  }

  on(event, callback) {
    if (!this.channels[event]) this.channels[event] = [];
    this.channels[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.channels[event]) return;
    this.channels[event] = this.channels[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.channels[event]) return;
    this.channels[event].forEach(cb => cb(data));
  }

  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  clear(event) {
    if (event) {
      delete this.channels[event];
    } else {
      this.channels = {};
    }
  }
}

// 关键事件定义
const GameEvents = {
  CHARACTER_UPDATE: 'characterUpdate',      // 角色属性变更
  INVENTORY_UPDATE: 'inventoryUpdate',      // 物品变更
  COMBAT_START: 'combatStart',              // 战斗开始
  COMBAT_END: 'combatEnd',                  // 战斗结束
  HP_CHANGE: 'hpChange',                    // HP变化
  LEVEL_UP: 'levelUp',                      // 升级
  LOCATION_CHANGE: 'locationChange',        // 场景切换
  ENCOUNTER: 'encounter',                  // 遭遇事件
  SKILL_CHECK: 'skillCheck',                // 技能检定
  NOTIFICATION: 'notification',             // 通知消息
  ENCOUNTER_RESOLVE: 'encounterResolve'     // 遭遇解决
};

// 创建全局实例
window.$SM = new StateManager();
window.Events = new EventBus();
window.GameEvents = GameEvents;

// 导出类供外部使用
window.StateManager = StateManager;
window.EventBus = EventBus;
