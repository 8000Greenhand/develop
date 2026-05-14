// DND RPG PWA 应用主逻辑

// 触屏事件支持辅助函数

/**
 * addTapEvent - 操作型按钮，单击执行
 * 桌面端 click 直接执行，手机端 touchend + 防重复点击
 */
function addTapEvent(element, handler) {
  if (!element) return;
  
  let lastTapTime = 0;
  let isTouchDevice = false;
  
  const handleTap = (e) => {
    const now = Date.now();
    if (now - lastTapTime < 400) return; // 防抖
    lastTapTime = now;
    handler(e);
  };
  
  element.addEventListener('touchend', (e) => {
    e.preventDefault();
    isTouchDevice = true;
    handleTap(e);
  }, { passive: false });
  
  element.addEventListener('click', (e) => {
    if (isTouchDevice) return; // 触屏设备已由 touchend 处理
    handleTap(e);
  });
}

/**
 * addSelectEvent - 选择型按钮，第一次选中高亮，第二次确认执行
 * 仅用于手机端；桌面端直接执行（单击=选中+确认）
 */
function addSelectEvent(element, handler) {
  if (!element) return;
  
  let selectedElement = null;
  let lastTapTime = 0;
  let isTouchDevice = false;
  
  const handleTap = (e) => {
    const now = Date.now();
    
    // 如果点击的是已选中的元素 → 第二次点击，执行
    if (selectedElement === element && now - lastTapTime < 1000) {
      element.classList.remove('tap-selected');
      selectedElement = null;
      lastTapTime = 0;
      handler(e);
      return;
    }
    
    // 取消之前选中的元素
    if (selectedElement && selectedElement !== element) {
      selectedElement.classList.remove('tap-selected');
    }
    
    // 第一次点击 → 选中
    element.classList.add('tap-selected');
    selectedElement = element;
    lastTapTime = now;
  };
  
  element.addEventListener('touchend', (e) => {
    e.preventDefault();
    isTouchDevice = true;
    handleTap(e);
  }, { passive: false });
  
  element.addEventListener('click', (e) => {
    if (isTouchDevice) return; // 触屏设备已由 touchend 处理
    // 桌面端直接执行（单击=选中+确认）
    handler(e);
  });
}

class DNDRPGApp {
  constructor() {
    this.currentPage = 'splash';
    this.characterCreation = null;
    this.currentCharacter = null;
  }

  async init() {
    // 注册侧边栏面板（尽早注册，避免按钮点击时找不到）
    this.registerSidebarPanels();
    
    // 初始化存储
    await window.saveManager.init();
    
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('./sw.js');
        console.log('Service Worker 注册成功');
      } catch (err) {
        console.log('Service Worker 注册失败:', err);
      }
    }
    
    // 初始化完成
    
    // 绑定全局事件
    this.bindEvents();
    
    // 检查是否有已保存的角色
    let characters = [];
    try {
      characters = await window.saveManager.getAllCharacters() || [];
    } catch (err) {
      console.warn('读取存档失败:', err);
    }
    
    // 显示启动画面
    this.showSplash(characters.length > 0);
  }

  // 注册所有侧边栏面板
  registerSidebarPanels() {
    const panelIds = ['character-panel', 'backpack-panel', 'spellbook-panel', 'npc-panel', 'settings-panel'];
    panelIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        window.sidebarManager.register(id, el);
      }
    });
    
    // 绑定侧边栏按钮
    this.bindSidebarButtons();
  }

  // 绑定侧边栏按钮
  bindSidebarButtons() {
    const btnCharacter = document.getElementById('btn-character');
    const btnBackpack = document.getElementById('btn-backpack');
    const btnSpellbook = document.getElementById('btn-spellbook');
    const btnSave = document.getElementById('btn-save');
    const btnSettings = document.getElementById('btn-settings');
    
    addTapEvent(btnCharacter, () => {
      window.sidebarManager.toggle('character-panel');
    });
    
    addTapEvent(btnBackpack, () => {
      window.sidebarManager.toggle('backpack-panel');
    });
    
    addTapEvent(btnSpellbook, () => {
      window.sidebarManager.toggle('spellbook-panel');
    });
    
    addTapEvent(btnSave, () => {
      this.saveCurrentGame();
    });
    
    addTapEvent(document.getElementById('btn-npc'), () => {
      window.sidebarManager.toggle('npc-panel');
    });
    
    addTapEvent(document.getElementById('btn-short-rest'), () => {
      this.showRestModal('short');
    });
    
    addTapEvent(document.getElementById('btn-long-rest'), () => {
      this.showRestModal('long');
    });
    
    addTapEvent(btnSettings, () => {
      window.sidebarManager.toggle('settings-panel');
    });
  }

  bindEvents() {
    // PWA 安装提示
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallPrompt();
    });
    
    window.addEventListener('appinstalled', () => {
      this.hideInstallPrompt();
      deferredPrompt = null;
    });
    
    // 绑定返回按钮
    addTapEvent(document.getElementById('btn-back-to-splash'), () => {
      this.navigateTo('splash');
    });
    
    addTapEvent(document.getElementById('btn-back-creation'), () => {
      this.navigateTo('splash');
    });
    
    // AI DM 设置事件
    this.initAISettings();
    
    // 存档导入导出事件
    this.initSaveImportExport();
    
    // 遭遇引擎事件
    this.initEncounterEngine();
  }
  
  // ========== 存档导入导出功能 ==========
  initSaveImportExport() {
    const exportBtn = document.getElementById('btn-export-save');
    const importBtn = document.getElementById('btn-import-save');
    const importInput = document.getElementById('import-save-input');
    
    // 导出存档
    if (exportBtn) {
      addTapEvent(exportBtn, () => {
        const saveData = $SM.exportSave();
        if (!saveData) {
          this.showToast('没有可导出的存档', 'warning');
          return;
        }
        
        const blob = new Blob([saveData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const charName = $SM.get('character.name', true) || 'unknown';
        a.href = url;
        a.download = `dnd_save_${charName}_${Date.now()}.dnd`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('存档已导出', 'success');
      });
    }
    
    // 导入存档
    if (importBtn && importInput) {
      addTapEvent(importBtn, () => {
        importInput.click();
      });
      
      importInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
          const text = await file.text();
          const success = $SM.importSave(text);
          
          if (success) {
            // 刷新游戏界面
            const char = {
              id: $SM.get('character.id'),
              name: $SM.get('character.name'),
              race: $SM.get('character.race'),
              subrace: $SM.get('character.subrace'),
              gender: $SM.get('character.gender'),
              class: $SM.get('character.class'),
              background: $SM.get('character.background'),
              startingLocation: $SM.get('character.startingLocation'),
              attributes: $SM.get('character.attributes'),
              level: $SM.get('character.level'),
              xp: $SM.get('character.xp'),
              hp: $SM.get('character.hp'),
              maxHp: $SM.get('character.maxHp'),
              ac: $SM.get('character.ac'),
              speed: $SM.get('character.speed'),
              proficiencyBonus: $SM.get('character.proficiencyBonus'),
              skills: $SM.get('character.skills'),
              traits: $SM.get('character.traits'),
              equipment: $SM.get('character.equipment'),
              spellSlots: $SM.get('character.spellSlots'),
              createdAt: $SM.get('character.createdAt')
            };
            
            // 使用 DNDCharacter.fromJSON 恢复原型方法
            const restoredChar = window.DNDCharacter?.fromJSON ? window.DNDCharacter.fromJSON(char) : char;
            window.gameState.init(restoredChar);
            this.currentCharacter = restoredChar;
            this.initGameUI();
            this.navigateTo('game');
            
            if (window.$encounter) {
              window.$encounter.start();
            }
            
            this.showToast('存档已导入', 'success');
          } else {
            this.showToast('存档格式无效', 'error');
          }
        } catch (err) {
          console.error('导入存档失败:', err);
          this.showToast('导入失败: ' + err.message, 'error');
        }
        
        // 清空 input 以便重复选择同一文件
        importInput.value = '';
      });
    }
  }
  
  // ========== 遭遇引擎 UI ==========
  initEncounterEngine() {
    // 订阅遭遇事件
    Events.on(GameEvents.ENCOUNTER, (data) => {
      this.showEncounterModal(data);
    });
    
    // 订阅通知事件
    Events.on(GameEvents.NOTIFICATION, (data) => {
      this.showToast(data.message, data.type || 'info');
    });
    
    // 订阅 HP 变化事件
    Events.on(GameEvents.HP_CHANGE, (data) => {
      this.updateHPDisplay(data.current, data.max);
    });
    
    // 订阅升级事件
    Events.on(GameEvents.LEVEL_UP, (data) => {
      this.showToast(`获得 ${data.exp} 经验值！`, 'success');
    });
    
    Events.on(GameEvents.COMBAT_START, (data) => {
      this.showToast('战斗开始！', 'warning');
    });
    
    Events.on(GameEvents.COMBAT_END, (data) => {
      if (data.victory) {
        this.showToast('战斗胜利！', 'success');
      } else {
        this.showToast('战斗失败...', 'error');
      }
    });
  }
  
  // 显示遭遇弹窗
  showEncounterModal(data) {
    const { encounter, scene, isEnd } = data;
    
    // 移除已有的遭遇弹窗
    const existingModal = document.querySelector('.encounter-modal');
    if (existingModal) existingModal.remove();
    
    // 隐藏底部输入框并移除焦点，防止穿透触发输入法
    const inputArea = document.querySelector('.player-input-area');
    const playerInput = document.getElementById('player-message-input');
    if (playerInput) playerInput.blur();
    if (inputArea) inputArea.style.display = 'none';
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'encounter-modal';
    modal.style.zIndex = '1000'; // 确保在最上层
    modal.innerHTML = `
      <div class="encounter-backdrop"></div>
      <div class="encounter-content">
        <div class="encounter-header">
          <h2 class="encounter-title">${encounter.title}</h2>
        </div>
        <div class="encounter-body">
          <div class="encounter-text">
            ${scene.text.map(t => `<p>${t}</p>`).join('')}
          </div>
        </div>
        <div class="encounter-buttons">
          ${this.renderEncounterButtons(scene.buttons, isEnd)}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 关闭弹窗并恢复输入框
    const closeModal = () => {
      modal.remove();
      if (inputArea) inputArea.style.display = '';
    };
    
    // 绑定按钮事件 - 使用 pointerdown 统一处理鼠标和触摸
    if (scene.buttons) {
      Object.keys(scene.buttons).forEach(btnId => {
        const btn = modal.querySelector(`[data-encounter-btn="${btnId}"]`);
        if (btn) {
          btn.dataset.processed = 'false';
          const handleButtonClick = (e) => {
            if (btn.dataset.processed === 'true') return;
            btn.dataset.processed = 'true';
            e.preventDefault(); e.stopPropagation();
            console.log('[遭遇] 按钮点击:', btnId);
            btn.style.transform = 'scale(0.95)'; btn.style.background = 'rgba(74, 142, 194, 0.3)';
            setTimeout(() => { window.$encounter.resolveButton(btnId); setTimeout(() => btn.dataset.processed = 'false', 100); }, 100);
            return false;
          };
          btn.addEventListener('pointerdown', handleButtonClick, { passive: false });
          btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (btn.dataset.processed !== 'true') handleButtonClick(e); });
        }
      });
    }
    // 关闭按钮（终点场景）
    const closeBtn = modal.querySelector('[data-encounter-close]');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      };
    }
    
    // 背景点击关闭（仅在结束时）
    if (isEnd) {
      const backdrop = modal.querySelector('.encounter-backdrop');
      backdrop.classList.add('clickable');
      backdrop.onclick = (e) => {
        if (e.target === backdrop) {
          closeModal();
        }
      };
    }
    
    // 阻止弹窗内容区域的事件冒泡到输入框
    const content = modal.querySelector('.encounter-content');
    if (content) {
      content.addEventListener('click', (e) => e.stopPropagation());
      content.addEventListener('touchend', (e) => e.stopPropagation());
    }
  }
  
  // 渲染遭遇按钮
  renderEncounterButtons(buttons, isEnd) {
    if (!buttons) {
      return `<button class="encounter-btn primary" data-encounter-close>关闭</button>`;
    }
    
    return Object.entries(buttons).map(([id, btn]) => `
      <button class="encounter-btn" data-encounter-btn="${id}">${btn.text}</button>
    `).join('');
  }
  
  // 更新 HP 显示
  updateHPDisplay(current, max) {
    // 更新游戏页面的 HP 显示（如果有的话）
    const hpBar = document.querySelector('.hp-bar-fill');
    if (hpBar) {
      const percentage = Math.min(100, Math.max(0, (current / max) * 100));
      hpBar.style.width = `${percentage}%`;
    }
  }
  
  initAISettings() {
    const proxyInput = document.getElementById('setting-proxy-url');
    const testBtn = document.getElementById('btn-test-ai');
    const aiStatus = document.getElementById('ai-status');
    const aiMode = document.getElementById('setting-ai-mode');
    
    if (!proxyInput) {
      console.warn('AI 设置输入框未找到，跳过初始化');
      return;
    }
    
    // 初始化输入框（如果有保存的代理地址）
    const savedUrl = localStorage.getItem('dnd_proxy_url');
    if (savedUrl) {
      proxyInput.value = savedUrl;
      if (window.aiDM) window.aiDM.setProxyUrl(savedUrl);
    }
    
    // 代理地址输入 - 用 input 事件实时更新，change 事件做兜底
    const saveProxyUrl = () => {
      const url = proxyInput.value.trim();
      if (window.aiDM && url) {
        window.aiDM.setProxyUrl(url);
      }
      // 只有非空时才保存到 localStorage，避免清空输入框时覆盖有效值
      if (url) {
        localStorage.setItem('dnd_proxy_url', url);
      } else {
        localStorage.removeItem('dnd_proxy_url');
      }
      if (aiStatus) {
        aiStatus.textContent = '';
        aiStatus.className = 'ai-status';
      }
    };
    proxyInput.addEventListener('input', saveProxyUrl);
    proxyInput.addEventListener('change', saveProxyUrl);
    
    // 测试连接按钮 - 用 addTapEvent 确保手机可用
    if (testBtn) {
      addTapEvent(testBtn, async () => {
        const url = proxyInput.value.trim();
        if (!url) {
          if (aiStatus) {
            aiStatus.textContent = '请输入代理地址';
            aiStatus.className = 'ai-status error';
          }
          return;
        }
        
        // 保存并设置代理地址
        localStorage.setItem('dnd_proxy_url', url);
        if (window.aiDM) {
          window.aiDM.setProxyUrl(url);
        } else {
          if (aiStatus) {
            aiStatus.textContent = '✗ AI模块未加载';
            aiStatus.className = 'ai-status error';
          }
          return;
        }
        
        testBtn.disabled = true;
        if (aiStatus) {
          aiStatus.textContent = '连接中...';
          aiStatus.className = 'ai-status connecting';
        }
        
        try {
          const connected = await window.aiDM.testConnection();
          
          testBtn.disabled = false;
          if (connected) {
            if (aiStatus) {
              aiStatus.textContent = '✓ 已连接';
              aiStatus.className = 'ai-status success';
            }
            // 连接成功后自动切换到 AI 模式
            if (aiMode) {
              aiMode.value = 'stream';
              localStorage.setItem('dnd_ai_mode', 'stream');
            }
            this.showToast('AI DM 连接成功！', 'success');
          } else {
            if (aiStatus) {
              aiStatus.textContent = '✗ 连接失败';
              aiStatus.className = 'ai-status error';
            }
            this.showToast('AI DM 连接失败', 'error');
          }
        } catch(err) {
          testBtn.disabled = false;
          if (aiStatus) {
            aiStatus.textContent = '✗ ' + (err.message || '连接出错');
            aiStatus.className = 'ai-status error';
          }
        }
      });
    }
    
    // AI 模式选择
    if (aiMode) {
      aiMode.addEventListener('change', () => {
        localStorage.setItem('dnd_ai_mode', aiMode.value);
      });
      
      const savedMode = localStorage.getItem('dnd_ai_mode');
      if (savedMode) {
        aiMode.value = savedMode;
      }
    }
  }

  showInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    if (prompt) {
      prompt.classList.add('show');
      const installBtn = prompt.querySelector('.install-btn');
      const dismissBtn = prompt.querySelector('.install-dismiss');
      
      addTapEvent(installBtn, async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log('安装提示结果:', outcome);
        }
      });
      
      addTapEvent(dismissBtn, () => {
        this.hideInstallPrompt();
      });
    }
  }

  hideInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    if (prompt) {
      prompt.classList.remove('show');
    }
  }

  showSplash(hasSaves) {
    this.navigateTo('splash');
    
    // 粒子效果
    this.initParticles();
    
    // 按钮事件 - 使用 addTapEvent 确保移动端兼容
    setTimeout(() => {
      const newGameBtn = document.getElementById('btn-new-game');
      const continueBtn = document.getElementById('btn-continue');
      
      addTapEvent(newGameBtn, () => {
        console.log('新游戏按钮点击');
        this.startNewGame();
      });
      
      if (hasSaves) {
        addTapEvent(continueBtn, () => {
          console.log('继续游戏按钮点击');
          this.showLoadScreen();
        });
        continueBtn?.classList.remove('hidden');
      } else {
        continueBtn?.classList.add('hidden');
      }
    }, 100);
  }

  initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // 边界检查
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // 绘制
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 142, 194, ${p.opacity})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  async startNewGame() {
    try {
      // 重置角色创建状态
      this.characterCreation = {
        step: 0,
        character: new DNDCharacter()
      };
      
      this.navigateTo('character-creation');
      this.initCharacterCreation();
    } catch (err) {
      console.error('startNewGame 出错:', err);
      // 降级：直接显示角色创建页面
      this.navigateTo('character-creation');
      const content = document.getElementById('creation-content');
      if (content) {
        content.innerHTML = `<div style="color:#c9a227;padding:20px;text-align:center;">
          <h2>初始化遇到问题</h2>
          <p>错误: ${err.message}</p>
          <button onclick="app.startNewGame()" style="padding:10px 20px;background:#c9a227;color:#0a0a0f;border:none;border-radius:8px;margin-top:10px;cursor:pointer;">刷新重试</button>
        </div>`;
      }
    }
  }

  async showLoadScreen() {
    this.navigateTo('load-screen');
    
    try {
      const saves = await window.saveManager.getAllSaves();
      this.renderSavesList(saves);
    } catch (err) {
      console.error('获取存档列表失败:', err);
      this.renderSavesList([]);
    }
  }

  renderSavesList(saves) {
    const container = document.getElementById('saves-list');
    if (!container) {
      console.error('saves-list 容器未找到');
      return;
    }
    
    container.innerHTML = '';
    
    if (!saves || saves.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>暂无存档</p>
          <button class="btn btn-primary" id="btn-start-new-from-load">开始新游戏</button>
        </div>
      `;
      addTapEvent(document.getElementById('btn-start-new-from-load'), () => {
        this.startNewGame();
      });
      return;
    }
    
    saves.forEach(save => {
      const card = UIComponents.createCard({
        title: save.character?.name || '无名冒险者',
        subtitle: `等级 ${save.character?.level || 1} ${save.character?.class?.name || '冒险者'}`,
        description: `上次游玩: ${new Date(save.timestamp).toLocaleString()}`,
        selectable: true,
        onClick: () => this.loadGame(save)
      });
      container.appendChild(card);
    });
  }

  async loadGame(save) {
    try {
      // 验证存档数据
      if (!save || !save.gameState) {
        this.showToast('存档数据损坏', 'error');
        return;
      }
      
      const char = save.gameState.character;
      
      // ========== 从存档恢复 $SM 状态 ==========
      // 角色基础属性
      $SM.set('character.id', char.id);
      $SM.set('character.name', char.name);
      $SM.set('character.race', char.race);
      $SM.set('character.subrace', char.subrace);
      $SM.set('character.gender', char.gender);
      $SM.set('character.class', char.class);
      $SM.set('character.background', char.background);
      $SM.set('character.startingLocation', char.startingLocation);
      $SM.set('character.attributes', char.attributes);
      $SM.set('character.level', char.level || 1);
      $SM.set('character.xp', char.xp || 0);
      $SM.set('character.hp', char.hp);
      $SM.set('character.maxHp', char.maxHp);
      $SM.set('character.ac', char.ac);
      $SM.set('character.speed', char.speed);
      $SM.set('character.proficiencyBonus', char.proficiencyBonus);
      $SM.set('character.skills', char.skills || []);
      $SM.set('character.traits', char.traits || []);
      $SM.set('character.equipment', char.equipment || []);
      $SM.set('character.spellSlots', char.spellSlots || []);
      $SM.set('character.createdAt', char.createdAt);
      
      // 从游戏状态恢复
      if (save.location) {
        $SM.set('game.location', save.location);
      }
      $SM.set('game.inCombat', false);
      
      // 初始化统计（如果没有的话）
      if ($SM.get('stats.encounters', true) === 0) {
        $SM.set('stats.encounters', 0);
        $SM.set('stats.combats', 0);
        $SM.set('stats.deaths', 0);
        $SM.set('stats.playTime', 0);
      }
      
      // 初始化解锁状态
      $SM.set('unlocks.town', true);
      $SM.set('unlocks.village', true);

      // 恢复背包数据
      if (window.inventoryManager?.load) {
        try { window.inventoryManager.load(); } catch(e) { console.warn('恢复背包数据失败:', e); }
      }
      // 恢复NPC数据
      if (window.npcRegistry?.load) {
        try { window.npcRegistry.load(); } catch(e) { console.warn('恢复NPC数据失败:', e); }
      }

      // 加载游戏状态
      // 使用 DNDCharacter.fromJSON 恢复原型方法
      const restoredChar = window.DNDCharacter?.fromJSON ? window.DNDCharacter.fromJSON(char) : char;
      window.gameState.init(restoredChar);
      this.currentCharacter = restoredChar;
      
      // 初始化游戏界面
      this.initGameUI();
      this.navigateTo('game');
      
      // 恢复场景
      if (save.gameState.history && save.gameState.history.length > 0) {
        const lastEntry = save.gameState.history[save.gameState.history.length - 1];
        if (lastEntry.type === 'scene') {
          await this.showScene(lastEntry.scene);
        }
      }
      
      // 启动遭遇引擎
      if (window.$encounter) {
        window.$encounter.start();
      }
      
      this.showToast('游戏已加载', 'success');
    } catch (err) {
      console.error('加载游戏失败:', err);
      this.showToast('加载失败: ' + err.message, 'error');
    }
  }

  initCharacterCreation() {
    const steps = [
      { id: 'race', title: '选择种族', subtitle: '决定你的血统与天赋' },
      { id: 'subrace', title: '选择子种族', subtitle: '细化你的血统特征' },
      { id: 'gender', title: '选择性别', subtitle: '定义你的外在形象' },
      { id: 'name', title: '输入姓名', subtitle: '为你的角色命名' },
      { id: 'attributes', title: '分配属性', subtitle: '决定你的能力倾向' },
      { id: 'background', title: '选择背景', subtitle: '塑造你的过往经历' },
      { id: 'class', title: '选择职业', subtitle: '决定你的战斗风格' },
      { id: 'skills', title: '选择技能', subtitle: '选择你擅长的技能' },
      { id: 'spells', title: '选择法术', subtitle: '选择你的初始法术' },
      { id: 'location', title: '选择起点', subtitle: '开启冒险的地点' },
      { id: 'confirm', title: '确认角色', subtitle: '最终确认你的角色' }
    ];
    
    const container = document.getElementById('creation-steps');
    if (!container) {
      console.error('creation-steps container not found!');
      return;
    }
    
    container.innerHTML = '';
    
    steps.forEach((step, index) => {
      const stepEl = document.createElement('div');
      stepEl.className = 'creation-step';
      stepEl.id = `step-${step.id}`;
      stepEl.innerHTML = `
        <div class="step-number">${index + 1}</div>
        <div class="step-info">
          <div class="step-title">${step.title}</div>
          <div class="step-subtitle">${step.subtitle}</div>
        </div>
      `;
      container.appendChild(stepEl);
    });
    
    this.renderCreationStep('race');
  }

  renderCreationStep(stepId) {
    const content = document.getElementById('creation-content');
    if (!content) return;
    
    content.innerHTML = '';
    
    // 更新步骤指示
    document.querySelectorAll('.creation-step').forEach(el => {
      el.classList.remove('active', 'completed');
    });
    const currentStep = document.getElementById(`step-${stepId}`);
    if (currentStep) {
      currentStep.classList.add('active');
    }
    
    try {
      switch (stepId) {
        case 'race':
          this.renderRaceSelection(content);
          break;
        case 'subrace':
          this.renderSubraceSelection(content);
          break;
        case 'gender':
          this.renderGenderSelection(content);
          break;
        case 'name':
          this.renderNameInput(content);
          break;
        case 'attributes':
          this.renderAttributeAssignment(content);
          break;
        case 'background':
          this.renderBackgroundSelection(content);
          break;
        case 'class':
          this.renderClassSelection(content);
          break;
        case 'skills':
          this.renderSkillSelection(content);
          break;
        case 'spells':
          this.renderSpellSelection(content);
          break;
        case 'location':
          this.renderLocationSelection(content);
          break;
        case 'confirm':
          this.renderConfirmation(content);
          break;
      }
    } catch(err) {
      console.error('renderCreationStep error:', err);
      content.innerHTML = `<div style="color:#c9a227;padding:20px;text-align:center;">
        <h3>渲染出错</h3>
        <p>${err.message}</p>
        <button onclick="app.startNewGame()" style="padding:10px 20px;background:#c9a227;color:#0a0a0f;border:none;border-radius:8px;margin-top:10px;cursor:pointer;">重新开始</button>
      </div>`;
    }
  }

  renderRaceSelection(container) {
    container.innerHTML = `
      <div class="choice-grid">
        ${DND_DATA.races.map(race => `
          <div class="choice-card rarity-common" data-race="${race.id}">
            <div class="choice-icon">${this.getRaceIcon(race.id)}</div>
            <div class="choice-name">${race.name}</div>
            <div class="choice-bonuses">
              ${Object.entries(race.bonuses).map(([attr, val]) => 
                `<span>${DND_DATA.attributeNames[attr]} +${val}</span>`
              ).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.querySelectorAll('.choice-card').forEach(card => {
      addSelectEvent(card, () => {
        console.log('Race card clicked:', card.dataset.race);
        try {
          const raceId = card.dataset.race;
          const race = DND_DATA.races.find(r => r.id === raceId);
          
          if (!race) {
            console.error('Race not found:', raceId);
            return;
          }
          
          this.characterCreation.character.race = race;
          
          // 应用种族加成
          for (const [attr, bonus] of Object.entries(race.bonuses)) {
            this.characterCreation.character.attributes[attr] += bonus;
          }
          
          if (race.traits) {
            this.characterCreation.character.traits.push(...race.traits);
          }
          
          // 检查是否有子种族
          if (DND_DATA.subraces[raceId]) {
            this.renderCreationStep('subrace');
          } else {
            this.characterCreation.step = 2;
            this.renderCreationStep('gender');
          }
        } catch(err) {
          console.error('Race selection error:', err);
        }
      });
    });
  }

  renderSubraceSelection(container) {
    const raceId = this.characterCreation.character.race.id;
    const subraces = DND_DATA.subraces[raceId];
    
    if (!subraces || subraces.length === 0) {
      this.characterCreation.step = 2;
      this.renderCreationStep('gender');
      return;
    }
    
    container.innerHTML = `
      <div class="subrace-grid">
        ${subraces.map(sub => `
          <div class="subrace-card" data-subrace="${sub.id}">
            <div class="subrace-name">${sub.name}</div>
            ${sub.bonuses ? `
              <div class="subrace-bonuses">
                ${Object.entries(sub.bonuses).map(([attr, val]) => 
                  `<span>${DND_DATA.attributeNames[attr]} +${val}</span>`
                ).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
    
    container.querySelectorAll('.subrace-card').forEach(card => {
      addSelectEvent(card, () => {
        const subraceId = card.dataset.subrace;
        const subrace = subraces.find(s => s.id === subraceId);
        
        this.characterCreation.character.subrace = subrace;
        
        if (subrace.bonuses) {
          for (const [attr, bonus] of Object.entries(subrace.bonuses)) {
            this.characterCreation.character.attributes[attr] += bonus;
          }
        }
        
        if (subrace.speed) {
          this.characterCreation.character.speed = subrace.speed;
        }
        
        this.characterCreation.step = 2;
        this.renderCreationStep('gender');
      });
    });
  }

  renderGenderSelection(container) {
    container.innerHTML = `
      <div class="gender-row">
        ${DND_DATA.genders.map(g => `
          <div class="gender-option" data-gender="${g.id}">
            <span class="gender-option-icon">${g.id === 'male' ? '♂' : g.id === 'female' ? '♀' : '⚥'}</span>
            <span class="gender-option-name">${g.name}</span>
          </div>
        `).join('')}
      </div>
    `;
    
    container.querySelectorAll('.gender-option').forEach(card => {
      addSelectEvent(card, () => {
        const genderId = card.dataset.gender;
        const gender = DND_DATA.genders.find(g => g.id === genderId);
        this.characterCreation.character.gender = gender;
        
        this.characterCreation.step = 3;
        this.renderCreationStep('name');
      });
    });
  }

  renderNameInput(container) {
    container.innerHTML = `
      <div class="name-input-container">
        <input type="text" id="character-name" class="name-input" 
               placeholder="输入角色姓名..." maxlength="20" />
        <p class="name-hint">这个名字将代表你在冒险中的身份</p>
      </div>
      <div class="name-suggestions">
        <p>随机名字:</p>
        <div class="suggestion-list">
          ${this.getRandomNames().map(name => 
            `<button class="suggestion-btn">${name}</button>`
          ).join('')}
        </div>
      </div>
    `;
    
    const nameInput = document.getElementById('character-name');
    nameInput?.addEventListener('input', (e) => {
      this.characterCreation.character.name = e.target.value;
    });
    
    container.querySelectorAll('.suggestion-btn').forEach(btn => {
      addSelectEvent(btn, () => {
        const name = btn.textContent;
        if (nameInput) {
          nameInput.value = name;
        }
        this.characterCreation.character.name = name;
      });
    });
    
    // 添加确认按钮
    const confirmBtn = UIComponents.createButton({
      text: '确认姓名',
      type: 'primary',
      onClick: () => {
        if (this.characterCreation.character.name?.trim()) {
          this.characterCreation.step = 4;
          this.renderCreationStep('attributes');
        } else {
          this.showToast('请输入角色姓名', 'warning');
        }
      }
    });
    container.appendChild(confirmBtn);
  }

  renderAttributeAssignment(container) {
    const char = this.characterCreation.character;
    const attrs = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const modifiers = {
      str: char.getModifier('str'),
      dex: char.getModifier('dex'),
      con: char.getModifier('con'),
      int: char.getModifier('int'),
      wis: char.getModifier('wis'),
      cha: char.getModifier('cha')
    };
    
    container.innerHTML = `
      <div class="attribute-mode-selector">
        <button class="mode-btn active" data-mode="roll">掷骰决定</button>
        <button class="mode-btn" data-mode="point">点数购买</button>
      </div>
      <div class="attributes-grid" id="attributes-grid">
        ${attrs.map(attr => `
          <div class="attribute-card" data-attr="${attr}">
            <div class="attr-name">${DND_DATA.attributeNames[attr]}</div>
            <div class="attr-value">${char.attributes[attr]}</div>
            <div class="attr-modifier ${modifiers[attr] >= 0 ? 'positive' : 'negative'}">${modifiers[attr] >= 0 ? '+' : ''}${modifiers[attr]}</div>
            <button class="attr-roll-btn" data-attr="${attr}">🎲</button>
            <div class="attr-adjust-group" style="display:none;">
              <button class="attr-adjust" data-attr="${attr}" data-action="decrease">−</button>
              <button class="attr-adjust" data-attr="${attr}" data-action="increase">+</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="attributes-total">
        <span>剩余属性点: <strong id="points-remaining">27</strong></span>
        <button class="btn btn-secondary" id="btn-reroll-all">重新掷骰</button>
      </div>
    `;
    
    // 掷骰模式
    const rollModeBtn = container.querySelector('.mode-btn[data-mode="roll"]');
    const pointModeBtn = container.querySelector('.mode-btn[data-mode="point"]');
    
    addSelectEvent(rollModeBtn, () => {
      container.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      rollModeBtn?.classList.add('active');
      this.setupRollMode(container);
    });
    
    addSelectEvent(pointModeBtn, () => {
      container.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      pointModeBtn?.classList.add('active');
      this.setupPointBuyMode(container);
    });
    
    this.setupRollMode(container);
  }

  setupRollMode(container) {
    const char = this.characterCreation.character;
    
    // 隐藏点数购买按钮，显示掷骰按钮
    container.querySelectorAll('.attr-adjust-group').forEach(g => g.style.display = 'none');
    container.querySelectorAll('.attr-roll-btn').forEach(b => b.style.display = '');
    container.querySelector('#btn-reroll-all').style.display = '';
    
    // 初始掷骰
    // 随机属性值（4d6取高3）
    const rolls = {};
    for (const attr of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
      const d6rolls = [];
      for (let i = 0; i < 4; i++) d6rolls.push(Math.floor(Math.random() * 6) + 1);
      d6rolls.sort((a, b) => b - a);
      rolls[attr] = d6rolls.slice(0, 3).reduce((a, b) => a + b, 0);
    }
    Object.assign(char.attributes, rolls);
    this.updateAttributeDisplay(container);
    
    // 单个属性重掷
    container.querySelectorAll('.attr-roll-btn').forEach(btn => {
      addTapEvent(btn, async () => {
        const attr = btn.dataset.attr;
        
        // 动画效果
        btn.disabled = true;
        btn.classList.add('rolling');
        
        // 掷4d6取高3
        const d6rolls = [];
        for (let i = 0; i < 4; i++) {
          await new Promise(r => setTimeout(r, 100));
          d6rolls.push(Math.floor(Math.random() * 6) + 1);
        }
        d6rolls.sort((a, b) => b - a);
        char.attributes[attr] = d6rolls.slice(0, 3).reduce((a, b) => a + b, 0);
        
        btn.classList.remove('rolling');
        btn.disabled = false;
        
        this.updateAttributeDisplay(container);
      });
    });
    
    // 全部重掷
    const rerollBtn = document.getElementById('btn-reroll-all');
    addTapEvent(rerollBtn, async () => {
      const attrs = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
      const newRolls = {};
      for (const attr of attrs) {
        const d6rolls = [];
        for (let i = 0; i < 4; i++) d6rolls.push(Math.floor(Math.random() * 6) + 1);
        d6rolls.sort((a, b) => b - a);
        newRolls[attr] = d6rolls.slice(0, 3).reduce((a, b) => a + b, 0);
      }
      
      for (const attr of attrs) {
        if (newRolls[attr]) {
          char.attributes[attr] = newRolls[attr];
        }
      }
      
      this.updateAttributeDisplay(container);
    });
    
    // 继续按钮
    const continueBtn = UIComponents.createButton({
      text: '继续',
      type: 'primary',
      onClick: () => {
        this.characterCreation.step = 5;
        this.renderCreationStep('background');
      }
    });
    container.appendChild(continueBtn);
  }

  setupPointBuyMode(container) {
    let points = 27;
    const char = this.characterCreation.character;
    const attrs = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    // 显示点数购买按钮，隐藏掷骰按钮
    container.querySelectorAll('.attr-roll-btn').forEach(b => b.style.display = 'none');
    container.querySelectorAll('.attr-adjust-group').forEach(g => g.style.display = '');
    container.querySelector('#btn-reroll-all').style.display = 'none';
    
    // 重置属性
    attrs.forEach(attr => {
      char.attributes[attr] = 8;
    });
    
    this.updatePointBuyDisplay(container, points);
    
    container.querySelectorAll('.attr-adjust').forEach(btn => {
      addTapEvent(btn, () => {
        const attr = btn.dataset.attr;
        const action = btn.dataset.action;
        
        if (action === 'increase' && points > 0 && char.attributes[attr] < 15) {
          const cost = char.attributes[attr] >= 13 ? 2 : 1;
          if (points >= cost) {
            char.attributes[attr]++;
            points -= cost;
          }
        } else if (action === 'decrease' && char.attributes[attr] > 8) {
          const refund = char.attributes[attr] > 13 ? 2 : 1;
          char.attributes[attr]--;
          points += refund;
        }
        
        this.updatePointBuyDisplay(container, points);
      });
    });
    
    // 继续按钮
    const continueBtn = UIComponents.createButton({
      text: '继续',
      type: 'primary',
      onClick: () => {
        this.characterCreation.step = 5;
        this.renderCreationStep('background');
      }
    });
    container.appendChild(continueBtn);
  }

  updateAttributeDisplay(container) {
    const char = this.characterCreation.character;
    const attrs = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    attrs.forEach(attr => {
      const card = container.querySelector(`.attribute-card[data-attr="${attr}"]`);
      if (card) {
        card.querySelector('.attr-value').textContent = char.attributes[attr];
        const mod = char.getModifier(attr);
        const modEl = card.querySelector('.attr-modifier');
        modEl.textContent = mod >= 0 ? `+${mod}` : mod;
        modEl.className = `attr-modifier ${mod >= 0 ? 'positive' : 'negative'}`;
      }
    });
  }

  updatePointBuyDisplay(container, points) {
    const pointsEl = document.getElementById('points-remaining');
    if (pointsEl) {
      pointsEl.textContent = points;
    }
    
    const char = this.characterCreation.character;
    const attrs = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    attrs.forEach(attr => {
      const card = container.querySelector(`.attribute-card[data-attr="${attr}"]`);
      if (card) {
        card.querySelector('.attr-value').textContent = char.attributes[attr];
        const mod = char.getModifier(attr);
        const modEl = card.querySelector('.attr-modifier');
        modEl.textContent = mod >= 0 ? `+${mod}` : mod;
        modEl.className = `attr-modifier ${mod >= 0 ? 'positive' : 'negative'}`;
        
        // 更新按钮状态
        const decreaseBtn = card.querySelector('.attr-adjust[data-action="decrease"]');
        const increaseBtn = card.querySelector('.attr-adjust[data-action="increase"]');
        
        if (decreaseBtn) {
          decreaseBtn.disabled = char.attributes[attr] <= 8;
        }
        if (increaseBtn) {
          const cost = char.attributes[attr] >= 13 ? 2 : 1;
          increaseBtn.disabled = points < cost || char.attributes[attr] >= 15;
        }
      }
    });
  }

  renderBackgroundSelection(container) {
    container.innerHTML = `
      <div class="background-grid">
        ${DND_DATA.backgrounds.map(bg => `
          <div class="background-card" data-bg="${bg.id}">
            <div class="bg-name">${bg.name}</div>
            <div class="bg-skills">技能: ${bg.skills?.join(', ') || ''}</div>
            <div class="bg-feature">特性: ${bg.feature}</div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.querySelectorAll('.background-card').forEach(card => {
      addSelectEvent(card, () => {
        const bgId = card.dataset.bg;
        const bg = DND_DATA.backgrounds.find(b => b.id === bgId);
        this.characterCreation.character.background = bg;
        // 技能在技能选择步骤统一处理
        
        this.characterCreation.step = 6;
        this.renderCreationStep('class');
      });
    });
  }

  renderClassSelection(container) {
    container.innerHTML = `
      <div class="choice-grid">
        ${DND_DATA.classes.map(cls => `
          <div class="choice-card rarity-uncommon" data-class="${cls.id}">
            <div class="choice-icon">${this.getClassIcon(cls.id)}</div>
            <div class="choice-name">${cls.name}</div>
            <div class="choice-info">
              <div>生命骰: d${cls.hitDie}</div>
              <div>主属性: ${cls.primaryAbility?.join('/') || ''}</div>
              ${cls.spellcaster ? '<div class="spellcaster-tag">施法者</div>' : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.querySelectorAll('.choice-card').forEach(card => {
      addSelectEvent(card, () => {
        const classId = card.dataset.class;
        const cls = DND_DATA.classes.find(c => c.id === classId);
        
        this.characterCreation.character.class = cls;
        
        // 设置初始 HP
        const conMod = this.characterCreation.character.getModifier('con');
        this.characterCreation.character.maxHp = cls.hitDie + conMod;
        this.characterCreation.character.hp = this.characterCreation.character.maxHp;
        
        // 设置 AC
        this.characterCreation.character.ac = 10 + this.characterCreation.character.getModifier('dex');
        
        // 设置初始法术位
        if (cls.spellcaster && cls.spellSlots) {
          this.characterCreation.character.spellSlots = [...cls.spellSlots];
        }
        
        this.characterCreation.step = 7;
        this.renderCreationStep('skills');
      });
    });
  }

  renderSkillSelection(container) {
    const char = this.characterCreation.character;
    const cls = char.class;
    if (!cls) {
      this.renderCreationStep('class');
      return;
    }
    
    const skillCount = cls.skillCount || 2;
    const classSkills = cls.skills || [];
    const bgSkills = char.background?.skills || [];
    // 合并已有技能（背景给的）
    const existingSkills = [...bgSkills];
    // 可选技能 = 职业技能池 - 已有技能
    let availableSkills = classSkills.filter(s => !existingSkills.includes(s));
    
    // 如果可选技能为空（可能背景技能已包含所有职业技能）
    if (availableSkills.length === 0 && skillCount > 0) {
      // 使用所有职业技能作为选择池
      availableSkills = classSkills;
    }
    
    // 如果仍为空或不需要选择，显示提示并直接跳到下一步
    if (availableSkills.length === 0 || skillCount === 0) {
      // 角色已有背景技能，无需额外选择
      this.characterCreation.character.skills = [...existingSkills];
      
      // 直接跳到下一步（spells 或 location）
      this.characterCreation.step = 8;
      this.renderCreationStep('spells');
      return;
    }
    
    container.innerHTML = `
      <div class="skill-selection-info">
        <p>你的职业 <strong>${cls.name}</strong> 可以从以下技能中选择 <strong>${skillCount}</strong> 个</p>
        ${bgSkills.length > 0 ? `<p class="skill-bg-info">背景已提供：${bgSkills.join('、')}</p>` : ''}
      </div>
      <div class="skill-grid">
        ${availableSkills.map(skill => `
          <div class="skill-card" data-skill="${skill}">
            <span class="skill-name">${skill}</span>
            <span class="skill-attr">${DND_DATA.skillProficiencies[skill] || ''}</span>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-primary btn-confirm-skills" id="btn-confirm-skills" disabled>确认技能选择</button>
    `;
    
    let selectedSkills = [];
    
    container.querySelectorAll('.skill-card').forEach(card => {
      addSelectEvent(card, () => {
        const skill = card.dataset.skill;
        if (selectedSkills.includes(skill)) {
          // 取消选中
          selectedSkills = selectedSkills.filter(s => s !== skill);
          card.classList.remove('selected');
        } else {
          if (selectedSkills.length >= skillCount) {
            this.showToast(`最多选择 ${skillCount} 个技能`, 'warning');
            return;
          }
          selectedSkills.push(skill);
          card.classList.add('selected');
        }
        
        const confirmBtn = document.getElementById('btn-confirm-skills');
        if (confirmBtn) {
          confirmBtn.disabled = selectedSkills.length !== skillCount;
          confirmBtn.textContent = selectedSkills.length === skillCount 
            ? `确认技能（${selectedSkills.join('、')}）` 
            : `还需选择 ${skillCount - selectedSkills.length} 个技能`;
        }
      });
    });
    
    addTapEvent(document.getElementById('btn-confirm-skills'), () => {
      if (selectedSkills.length !== skillCount) return;
      
      // 合并背景技能和选择的职业技能
      this.characterCreation.character.skills = [...existingSkills, ...selectedSkills];
      
      // 跳转到法术选择步骤（step=8）
      this.characterCreation.step = 8;
      this.renderCreationStep('spells');
    });
  }

  renderLocationSelection(container) {
    container.innerHTML = `
      <div class="location-grid">
        ${DND_DATA.startingLocations.map(loc => `
          <div class="location-card" data-loc="${loc.id}">
            <div class="location-name">${loc.name}</div>
            <div class="location-desc">${loc.description}</div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.querySelectorAll('.location-card').forEach(card => {
      addSelectEvent(card, () => {
        const locId = card.dataset.loc;
        const loc = DND_DATA.startingLocations.find(l => l.id === locId);
        this.characterCreation.character.startingLocation = loc;
        
        this.characterCreation.step = 10;
        this.renderCreationStep('confirm');
      });
    });
  }

  renderSpellSelection(container) {
    const char = this.characterCreation.character;
    const cls = char.class;
    
    // 检查是否为施法职业且1级有法术
    if (!cls || !cls.spellcaster || !DND_DATA.spells.cantrips[cls.id]) {
      // 非施法职业或1级无法术的职业，直接跳到地点选择
      this.characterCreation.step = 9;
      this.renderCreationStep('location');
      return;
    }
    
    const cantripCount = cls.cantripCount || 0;
    const level1SpellCount = cls.level1SpellCount || 0;
    const cantrips = DND_DATA.spells.cantrips[cls.id] || [];
    const level1Spells = DND_DATA.spells.level1[cls.id] || [];
    
    // 检查是否需要选择法术
    const needsCantrips = cantripCount > 0;
    const needsLevel1 = level1SpellCount > 0;
    
    if (!needsCantrips && !needsLevel1) {
      // 1级无法术的职业（如游侠、圣武士），直接跳到地点选择
      this.characterCreation.step = 9;
      this.renderCreationStep('location');
      return;
    }
    
    let selectedCantrips = [];
    let selectedSpells = [];
    
    container.innerHTML = `
      <div class="spell-selection">
        ${needsCantrips ? `
          <div class="spell-section">
            <h4 class="spell-section-title">戏法（可永久使用）<span class="spell-count-hint">请选择 ${cantripCount} 个</span></h4>
            <div class="spell-grid">
              ${cantrips.map(spell => `
                <div class="spell-card spell-cantrip" data-spell="${spell}" data-type="cantrip">
                  <span class="spell-name">${spell}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${needsLevel1 ? `
          <div class="spell-section">
            <h4 class="spell-section-title">1环法术<span class="spell-count-hint">请选择 ${level1SpellCount} 个</span></h4>
            <div class="spell-grid">
              ${level1Spells.map(spell => `
                <div class="spell-card spell-level1" data-spell="${spell}" data-type="level1">
                  <span class="spell-name">${spell}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      <button class="btn btn-primary btn-confirm-spells" id="btn-confirm-spells" disabled>确认法术选择</button>
    `;
    
    // 戏法选择逻辑
    container.querySelectorAll('.spell-cantrip').forEach(card => {
      addSelectEvent(card, () => {
        const spell = card.dataset.spell;
        if (selectedCantrips.includes(spell)) {
          selectedCantrips = selectedCantrips.filter(s => s !== spell);
          card.classList.remove('selected');
        } else {
          if (selectedCantrips.length >= cantripCount) {
            this.showToast(`戏法最多选择 ${cantripCount} 个`, 'warning');
            return;
          }
          selectedCantrips.push(spell);
          card.classList.add('selected');
        }
        this.updateSpellConfirmButton();
      });
    });
    
    // 1环法术选择逻辑
    container.querySelectorAll('.spell-level1').forEach(card => {
      addSelectEvent(card, () => {
        const spell = card.dataset.spell;
        if (selectedSpells.includes(spell)) {
          selectedSpells = selectedSpells.filter(s => s !== spell);
          card.classList.remove('selected');
        } else {
          if (selectedSpells.length >= level1SpellCount) {
            this.showToast(`1环法术最多选择 ${level1SpellCount} 个`, 'warning');
            return;
          }
          selectedSpells.push(spell);
          card.classList.add('selected');
        }
        this.updateSpellConfirmButton();
      });
    });
    
    this.updateSpellConfirmButton = () => {
      const confirmBtn = document.getElementById('btn-confirm-spells');
      if (!confirmBtn) return;
      
      const cantripOk = !needsCantrips || selectedCantrips.length === cantripCount;
      const spellOk = !needsLevel1 || selectedSpells.length === level1SpellCount;
      const canConfirm = cantripOk && spellOk;
      
      confirmBtn.disabled = !canConfirm;
      
      const cantripText = needsCantrips ? `戏法 ${selectedCantrips.length}/${cantripCount}` : '';
      const spellText = needsLevel1 ? `1环 ${selectedSpells.length}/${level1SpellCount}` : '';
      const parts = [cantripText, spellText].filter(Boolean);
      
      confirmBtn.textContent = canConfirm 
        ? `确认法术（${parts.join('、')}）` 
        : `还需选择：${parts.filter((_, i) => {
          return i === 0 ? selectedCantrips.length !== cantripCount : selectedSpells.length !== level1SpellCount;
        }).join('、')}`;
    };
    
    addTapEvent(document.getElementById('btn-confirm-spells'), () => {
      // 保存法术
      this.characterCreation.character.cantrips = [...selectedCantrips];
      this.characterCreation.character.spells = [...selectedSpells];
      
      // 跳转到地点选择（step=9）
      this.characterCreation.step = 9;
      this.renderCreationStep('location');
    });
  }

  renderConfirmation(container) {
    const char = this.characterCreation.character;
    
    container.innerHTML = `
      <div class="character-preview">
        <div class="preview-avatar">
          <div class="avatar-placeholder">${this.getRaceIcon(char.race?.id)}</div>
        </div>
        <div class="preview-info">
          <h2 class="preview-name">${char.name || '未命名'}</h2>
          <p class="preview-subtitle">${char.race?.name || ''} ${char.subrace?.name || ''} ${char.class?.name || ''}</p>
        </div>
      </div>
      
      <div class="character-stats">
        <div class="stat-row">
          <span>等级</span><span>1</span>
        </div>
        <div class="stat-row">
          <span>生命值</span><span>${char.hp}/${char.maxHp}</span>
        </div>
        <div class="stat-row">
          <span>护甲等级</span><span>${char.ac}</span>
        </div>
        <div class="stat-row">
          <span>速度</span><span>${char.speed}尺</span>
        </div>
        <div class="stat-row">
          <span>熟练加值</span><span>+${char.proficiencyBonus}</span>
        </div>
      </div>
      
      <div class="character-attributes">
        ${['str', 'dex', 'con', 'int', 'wis', 'cha'].map(attr => `
          <div class="attr-mini">
            <span class="attr-name">${DND_DATA.attributeNames[attr]}</span>
            <span class="attr-value">${char.attributes[attr]}</span>
          </div>
        `).join('')}
      </div>
      
      ${char.skills && char.skills.length > 0 ? `
        <div class="character-skills">
          <h4>技能</h4>
          <div class="skill-tags">
            ${char.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      ${char.cantrips && char.cantrips.length > 0 ? `
        <div class="character-spells">
          <h4>戏法</h4>
          <div class="spell-tags">
            ${char.cantrips.map(s => `<span class="spell-tag spell-cantrip-tag">${s}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      ${char.spells && char.spells.length > 0 ? `
        <div class="character-spells">
          <h4>1环法术</h4>
          <div class="spell-tags">
            ${char.spells.map(s => `<span class="spell-tag spell-level1-tag">${s}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="character-traits">
        <h4>特性</h4>
        <div class="traits-list">
          ${char.traits?.map(t => `<span class="trait-tag">${t}</span>`).join('') || ''}
        </div>
      </div>
      
      <div class="character-background">
        <h4>背景</h4>
        <p>${char.background?.name || ''}</p>
      </div>
      
      <div class="confirmation-buttons">
        <button class="btn btn-secondary" id="btn-back">上一步</button>
        <button class="btn btn-primary" id="btn-confirm">创建角色</button>
      </div>
    `;
    
    addTapEvent(document.getElementById('btn-back'), () => {
      this.characterCreation.step = 9;
      this.renderCreationStep('location');
    });
    
    addTapEvent(document.getElementById('btn-confirm'), () => this.confirmCharacter());
  }

  async confirmCharacter() {
    const char = this.characterCreation.character;
    
    if (!char.name || !char.race || !char.class) {
      this.showToast('请完成所有必填项', 'warning');
      return;
    }
    
    char.createdAt = new Date().toISOString();
    
    try {
      // 保存角色，获取包含 ID 的返回数据
      const savedChar = await window.saveManager.saveCharacter(char);
      
      // 确保角色有 ID
      if (!savedChar.id) {
        savedChar.id = `char_${Date.now()}`;
      }
      
      // ========== 保存到 StateManager ($SM) ==========
      // 角色基础属性
      $SM.set('character.id', savedChar.id);
      $SM.set('character.name', savedChar.name);
      $SM.set('character.race', savedChar.race);
      $SM.set('character.subrace', savedChar.subrace);
      $SM.set('character.gender', savedChar.gender);
      $SM.set('character.class', savedChar.class);
      $SM.set('character.background', savedChar.background);
      $SM.set('character.startingLocation', savedChar.startingLocation);
      $SM.set('character.attributes', savedChar.attributes);
      $SM.set('character.level', savedChar.level || 1);
      $SM.set('character.xp', savedChar.xp || 0);
      $SM.set('character.hp', savedChar.hp);
      $SM.set('character.maxHp', savedChar.maxHp);
      $SM.set('character.ac', savedChar.ac);
      $SM.set('character.speed', savedChar.speed);
      $SM.set('character.proficiencyBonus', savedChar.proficiencyBonus);
      $SM.set('character.skills', savedChar.skills || []);
      $SM.set('character.traits', savedChar.traits || []);
      $SM.set('character.equipment', savedChar.equipment || []);
      $SM.set('character.spellSlots', savedChar.spellSlots || []);
      $SM.set('character.cantrips', savedChar.cantrips || []);
      $SM.set('character.spells', savedChar.spells || []);
      $SM.set('character.createdAt', savedChar.createdAt);
      
      // 初始化背包（默认给予一些起始物品和金币）
      $SM.set('inventory.gold', 50);
      $SM.set('inventory.food', 3);
      $SM.set('inventory.items', ['新手匕首']);
      
      // 初始化游戏状态
      $SM.set('game.location', savedChar.startingLocation?.id || 'village');
      $SM.set('game.inCombat', false);
      $SM.set('game.currentScene', null);
      
      // 初始化统计
      $SM.set('stats.encounters', 0);
      $SM.set('stats.combats', 0);
      $SM.set('stats.deaths', 0);
      $SM.set('stats.playTime', 0);
      
      // 初始化解锁状态
      $SM.set('unlocks.town', true);
      $SM.set('unlocks.village', true);
      
      // ========== 同步到 legacy ==========
      $SM.set('legacy.currentCharacterId', savedChar.id);
      
      // 初始化游戏状态
      window.gameState.init(savedChar);
      this.currentCharacter = savedChar;
      
      // 显示成功并进入游戏
      this.showToast('角色创建成功！', 'success');
      
      setTimeout(() => {
        this.initGameUI();
        this.navigateTo('game');
        this.startAdventure();
        // 启动遭遇引擎
        if (window.$encounter) {
          window.$encounter.start();
        }
      }, 1000);
    } catch (err) {
      console.error('保存角色失败:', err);
      this.showToast('保存失败: ' + err.message, 'error');
    }
  }

  initGameUI() {
    const char = this.currentCharacter;
    
    // 更新顶部状态栏
    const playerNameEl = document.getElementById('player-name');
    const playerLevelEl = document.getElementById('player-level');
    if (playerNameEl) playerNameEl.textContent = char?.name || '冒险者';
    if (playerLevelEl) playerLevelEl.textContent = `Lv.${char?.level || 1}`;
    
    // 渲染角色面板
    this.renderCharacterPanel();
    
    // 初始化叙事容器
    const narrative = UIComponents.createNarrative();
    const narrativeContainer = document.getElementById('narrative-container');
    if (narrativeContainer) {
      narrativeContainer.innerHTML = '';
      narrativeContainer.appendChild(narrative);
    }
    
    // 初始化玩家输入区域
    this.initPlayerInput();
  }
  
  initPlayerInput() {
    const input = document.getElementById('player-message-input');
    const sendBtn = document.getElementById('btn-send-message');
    
    if (!input || !sendBtn) return;
    
    // 发送消息
    const sendMessage = async () => {
      const message = input.value.trim();
      if (!message) return;
      
      input.value = '';
      input.disabled = true;
      sendBtn.disabled = true;
      
      const narrative = document.getElementById('narrative');
      const content = narrative?.querySelector('.narrative-content');
      
      if (content) {
        // 添加玩家消息
        const playerMsg = document.createElement('div');
        playerMsg.className = 'player-message';
        playerMsg.innerHTML = `<strong>${this.currentCharacter?.name || '你'}:</strong> ${message}`;
        content.appendChild(playerMsg);
        content.scrollTop = content.scrollHeight;
        
        // 检查是否使用 AI DM
        const aiMode = localStorage.getItem('dnd_ai_mode') || 'stream';
        const hasProxy = !!(window.aiDM?.proxyUrl);
        const useAI = hasProxy && aiMode !== 'offline';
        
        if (useAI) {
          // AI DM 模式
          await this.sendToAI(content, message);
        } else {
          // 离线模式提示
          const offlineMsg = document.createElement('div');
          offlineMsg.className = 'narrative-text';
          offlineMsg.textContent = '💡 AI DM 未连接，请在设置中配置代理服务器';
          content.appendChild(offlineMsg);
          content.scrollTop = content.scrollHeight;
        }
      }
      
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    };
    
    addTapEvent(sendBtn, sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  async sendToAI(content, message) {
    // 显示加载动画
    this.showAIThinking(content);
    
    try {
      const aiMode = localStorage.getItem('dnd_ai_mode') || 'stream';
      
      if (aiMode === 'stream' && window.aiDM?.chatStream) {
        // 流式模式：逐字显示，不闪屏
        const responseDiv = document.createElement('div');
        responseDiv.className = 'ai-response narrative-text';
        content.appendChild(responseDiv);
        
        await new Promise((resolve) => {
          window.aiDM.chatStream(
            message,
            (chunk, full) => {
              this.hideAIThinking(content);
              responseDiv.innerHTML = full.replace(/\n/g, '<br>');
              content.scrollTop = content.scrollHeight;
            },
            (result) => {
              this.hideAIThinking(content);
              if (result.error) {
                responseDiv.innerHTML = `<span style="color:#ff6b6b">❌ ${result.error}</span>`;
              }
              resolve();
            }
          );
        });
      } else if (window.aiDM?.chat) {
        // 普通模式：等全部生成完再显示
        const result = await window.aiDM.chat(message);
        this.hideAIThinking(content);
        
        const responseDiv = document.createElement('div');
        responseDiv.className = 'ai-response narrative-text';
        if (result.error) {
          responseDiv.innerHTML = `<span style="color:#ff6b6b">❌ ${result.error}</span>`;
        } else {
          responseDiv.innerHTML = result.message.replace(/\n/g, '<br>');
        }
        content.appendChild(responseDiv);
        content.scrollTop = content.scrollHeight;
      } else {
        this.hideAIThinking(content);
        const offlineMsg = document.createElement('div');
        offlineMsg.className = 'narrative-text';
        offlineMsg.textContent = '❌ AI DM 未初始化';
        content.appendChild(offlineMsg);
      }
    } catch (err) {
      this.hideAIThinking(content);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'narrative-text';
      errorDiv.innerHTML = `<span style="color:#ff6b6b">❌ 连接出错：${err.message}</span>`;
      content.appendChild(errorDiv);
    }
  }

  renderCharacterPanel() {
    const char = this.currentCharacter;
    const charPanel = document.getElementById('character-panel-body');
    if (!charPanel) return;
    
    if (!char) {
      charPanel.innerHTML = '<p>角色未加载</p>';
      return;
    }
    
    const modifiers = char.calculateModifiers ? char.calculateModifiers() : {};
    
    charPanel.innerHTML = `
      <div class="char-header">
        <div class="char-avatar">${this.getRaceIcon(char.race?.id)}</div>
        <div class="char-info">
          <h3>${char.name || '无名'}</h3>
          <p>${char.race?.name || ''} ${char.class?.name || ''}</p>
        </div>
      </div>
      
      <div class="char-xp">
        <div class="xp-bar">
          <div class="xp-fill" style="width: ${(char.xp / (char.getNextLevelXP?.() || 100)) * 100}%"></div>
        </div>
        <span class="xp-text">${char.xp || 0} / ${char.getNextLevelXP?.() || 100} XP</span>
      </div>
      
      <div class="char-primary-stats">
        <div class="primary-stat">
          <span class="stat-label">生命值</span>
          <span class="stat-value">${char.hp || 0}/${char.maxHp || 0}</span>
        </div>
        <div class="primary-stat">
          <span class="stat-label">护甲等级</span>
          <span class="stat-value">${char.ac || 10}</span>
        </div>
        <div class="primary-stat">
          <span class="stat-label">速度</span>
          <span class="stat-value">${char.speed || 30}尺</span>
        </div>
        <div class="primary-stat">
          <span class="stat-label">熟练加值</span>
          <span class="stat-value">+${char.proficiencyBonus || 2}</span>
        </div>
      </div>
      
      <div class="char-attributes">
        ${['str', 'dex', 'con', 'int', 'wis', 'cha'].map(attr => `
          <div class="attr-mini-card">
            <span class="attr-abbr">${attr.toUpperCase()}</span>
            <span class="attr-val">${char.attributes?.[attr] || 10}</span>
            <span class="attr-mod">${(modifiers[attr] || 0) >= 0 ? '+' : ''}${modifiers[attr] || 0}</span>
          </div>
        `).join('')}
      </div>
      
      ${char.spellSlots && char.spellSlots.length > 0 ? `
        <div class="char-spellslots">
          <h4>法术位</h4>
          <div class="spellslots-grid">
            ${char.spellSlots.slice(0, 5).map((slots, i) => `
              <div class="spellslot" title="${i+1}环法术位">
                <span class="slot-level">${i+1}</span>
                <span class="slot-count">${slots}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${char.feats && char.feats.length > 0 ? `
        <div class="char-feats">
          <h4>专长</h4>
          <div class="traits-scroll">
            ${char.feats.map(f => {
              const featData = window.DND_DATA?.feats?.find(df => df.id === f);
              return `<span class="trait-chip feat-chip" title="${featData?.description || ''}">${featData?.name || f}</span>`;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="char-traits">
        <h4>特性与技能</h4>
        <div class="traits-scroll">
          ${char.traits?.map(t => `<span class="trait-chip">${t}</span>`).join('') || ''}
          ${char.skills?.map(s => `<span class="skill-chip">${s}</span>`).join('') || ''}
        </div>
      </div>
    `;
  }

  async startAdventure() {
    const narrative = document.getElementById('narrative');
    if (!narrative) return;
    
    const content = narrative.querySelector('.narrative-content');
    if (!content) return;
    
    const aiMode = localStorage.getItem('dnd_ai_mode') || 'stream';
    const useAI = window.aiDM?.proxyUrl && aiMode !== 'offline';
    
    if (useAI) {
      // AI DM 模式
      await this.startAdventureWithAI(content);
    } else {
      // 离线模式
      await this.startAdventureOffline(content);
    }
    
    // 显示动作按钮
    // 冒险已开始，显示输入区
  }
  
  async startAdventureWithAI(content) {
    const char = this.currentCharacter;
    const userMessage = `${char?.name || '冒险者'}（${char?.race?.name || '人类'} ${char?.class?.name || '冒险者'} Lv.${char?.level || 1}）来到了${char?.startingLocation?.name || '一个未知的地方'}。请以DM的身份开始描述场景并引导冒险。`;
    
    // 显示加载动画
    this.showAIThinking(content);
    
    try {
      const aiMode = localStorage.getItem('dnd_ai_mode') || 'stream';
      
      if (aiMode === 'stream' && window.aiDM?.chatStream) {
        const responseDiv = document.createElement('div');
        responseDiv.className = 'ai-response narrative-text';
        content.appendChild(responseDiv);
        
        await new Promise((resolve) => {
          window.aiDM.chatStream(
            userMessage,
            (chunk, full) => {
              this.hideAIThinking(content);
              responseDiv.innerHTML = full.replace(/\n/g, '<br>');
              content.scrollTop = content.scrollHeight;
            },
            (result) => {
              this.hideAIThinking(content);
              if (result.error) {
                this.showToast(result.error, 'error');
                this.startAdventureOffline(content);
              }
              resolve();
            }
          );
        });
      } else if (window.aiDM?.chat) {
        const result = await window.aiDM.chat(userMessage);
        this.hideAIThinking(content);
        if (result.error) {
          this.startAdventureOffline(content);
        } else {
          const responseDiv = document.createElement('div');
          responseDiv.className = 'ai-response narrative-text';
          responseDiv.innerHTML = result.message.replace(/\n/g, '<br>');
          content.appendChild(responseDiv);
          content.scrollTop = content.scrollHeight;
        }
      } else {
        this.hideAIThinking(content);
        this.startAdventureOffline(content);
      }
    } catch (err) {
      this.hideAIThinking(content);
      this.startAdventureOffline(content);
    }
  }
  
  async startAdventureOffline(content) {
    // 欢迎词
    const mockResponse = window.aiDM?.getMockResponse?.('welcome');
    if (mockResponse?.content) {
      await this.typewriterEffect(content, mockResponse.content);
    }
    
    // 角色介绍
    await this.delay(500);
    if (window.aiDM?.getMockResponse) {
      const intro = window.aiDM.getMockResponse('introduction', this.currentCharacter);
      if (intro?.content) {
        await this.typewriterEffect(content, intro.content);
      }
    }
  }
  
  showAIThinking(content) {
    // 移除已有的 thinking 指示器
    this.hideAIThinking(content);
    
    const thinking = document.createElement('div');
    thinking.className = 'ai-thinking';
    thinking.id = 'ai-thinking';
    thinking.textContent = '🧙 DM正在思考...';
    content.appendChild(thinking);
    content.scrollTop = content.scrollHeight;
  }
  
  hideAIThinking(content) {
    const thinking = document.getElementById('ai-thinking');
    if (thinking) {
      thinking.remove();
    }
  }

  async typewriterEffect(container, text, speed = 30) {
    return new Promise((resolve) => {
      const p = document.createElement('p');
      p.className = 'narrative-text';
      container.appendChild(p);
      
      let i = 0;
      const type = () => {
        if (i < text.length) {
          p.innerHTML += text.charAt(i);
          i++;
          container.scrollTop = container.scrollHeight;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      };
      type();
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async showScene(sceneData) {
    const narrative = document.getElementById('narrative');
    if (!narrative) return;
    
    const content = narrative.querySelector('.narrative-content');
    if (!content) return;
    
    if (window.aiBridge?.getSceneDescription) {
      const scene = await window.aiBridge.getSceneDescription(sceneData.id);
      await this.typewriterEffect(content, scene);
    }
    
    if (window.gameState?.setScene) {
      window.gameState.setScene(sceneData);
    }
  }

  async handleAction(action) {
    const narrative = document.getElementById('narrative');
    const content = narrative?.querySelector('.narrative-content');
    
    switch (action) {
      case 'explore':
        // 随机遭遇
        let encounter = null;
        if (window.aiBridge?.generateRandomEncounter) {
          encounter = await window.aiBridge.generateRandomEncounter(
            this.currentCharacter?.level || 1,
            this.currentCharacter?.startingLocation?.id || 'village'
          );
        }
        
        if (content) {
          await this.typewriterEffect(content, `你谨慎地探索周围的环境...`);
        }
        
        await this.delay(1000);
        
        if (encounter && content) {
          await this.typewriterEffect(content, `你遭遇了 ${encounter.name}！`);
        }
        
        // 进入战斗
        if (encounter) {
          this.startCombat([encounter]);
        }
        break;
        
      case 'talk':
        if (content) {
          await this.typewriterEffect(content, `你环顾四周，寻找可以交谈的对象...`);
        }
        break;
        
      case 'rest':
        if (content) {
          await this.typewriterEffect(content, `你决定休息一下，恢复体力。`);
        }
        if (this.currentCharacter) {
          this.currentCharacter.hp = this.currentCharacter.maxHp;
        }
        this.renderCharacterPanel();
        this.showToast('生命值已恢复', 'success');
        break;
        
      case 'inventory':
        window.sidebarManager.open('backpack-panel');
        break;
    }
  }

  startCombat(enemies) {
    if (!enemies || enemies.length === 0) {
      console.error('没有敌人数据');
      return;
    }
    
    const combatants = [
      {
        id: 'player',
        name: this.currentCharacter?.name || '玩家',
        hp: this.currentCharacter?.hp || 10,
        maxHp: this.currentCharacter?.maxHp || 10,
        ac: this.currentCharacter?.ac || 10,
        initiative: (Math.floor(Math.random() * 20) + 1) + (this.currentCharacter?.getModifier?.('dex') || 0),
        isPlayer: true,
        abilities: {
          str: this.currentCharacter.attributes?.str || this.currentCharacter.str || 10,
          dex: this.currentCharacter.attributes?.dex || this.currentCharacter.dex || 10,
          con: this.currentCharacter.attributes?.con || this.currentCharacter.con || 10,
          int: this.currentCharacter.attributes?.int || this.currentCharacter.int || 10,
          wis: this.currentCharacter.attributes?.wis || this.currentCharacter.wis || 10,
          cha: this.currentCharacter.attributes?.cha || this.currentCharacter.cha || 10
        }
      },
      ...enemies.map((e, i) => ({
        id: `enemy_${i}`,
        name: e.name || '敌人',
        hp: e.hp || 10,
        maxHp: e.hp || 10,
        ac: e.ac || 10,
        dexMod: 0,
        xp: parseInt(e.xp) || 0
      }))
    ];
    
    // 计算先攻
    combatants.forEach(c => {
      if (!c.isPlayer) {
        c.initiative = (Math.floor(Math.random() * 20) + 1) + (c.dexMod || 0);
      }
    });
    
    combatants.sort((a, b) => b.initiative - a.initiative);
    
    // 切换到战斗面板
    this.navigateTo('combat');
    
    if (window.combatSystem) {
      const combatState = window.combatSystem.init(combatants);
      this.renderCombatUI(combatState);
    }
  }

  renderCombatUI(state) {
    const container = document.getElementById('combat-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="combat-header">
        <h2>第 ${state.round || 1} 轮</h2>
        <span class="turn-indicator">${state.currentCombatant?.name || ''} 的回合</span>
      </div>
      
      <div class="combatants-list">
        ${(state.combatants || []).map(c => `
          <div class="combatant-card ${c.isPlayer ? 'player' : 'enemy'}" data-id="${c.id}">
            ${UIComponents.createHPBar(c.hp, c.maxHp, c.name)?.outerHTML || ''}
          </div>
        `).join('')}
      </div>
      
      <div class="combat-actions">
        <button class="combat-action-btn" data-action="attack">
          <span>⚔️</span>攻击
        </button>
        <button class="combat-action-btn" data-action="spell">
          <span>✨</span>施法
        </button>
        <button class="combat-action-btn" data-action="dodge">
          <span>🏃</span>闪避
        </button>
        <button class="combat-action-btn" data-action="defend">
          <span>🛡️</span>防御
        </button>
        <button class="combat-action-btn" data-action="flee">
          <span>🏃</span>逃跑
        </button>
      </div>
      
      <div class="combat-log" id="combat-log">
        ${(state.log || []).slice(-5).map(entry => `
          <p class="log-entry">${entry.message || ''}</p>
        `).join('')}
      </div>
    `;
    
    // 绑定战斗动作
    container.querySelectorAll('.combat-action-btn').forEach(btn => {
      addTapEvent(btn, () => {
        this.handleCombatAction(btn.dataset.action);
      });
    });
  }

  async handleCombatAction(action) {
    const state = window.combatSystem?.getCurrentState();
    if (!state) return;
    
    const enemies = window.combatSystem?.getEnemies?.() || [];
    const player = state.combatants?.find(c => c.isPlayer);
    
    switch (action) {
      case 'attack':
        if (enemies.length > 0) {
          const target = enemies[0];
          const char = this.currentCharacter;
          const attackBonus = char.getAttackBonus ? char.getAttackBonus('melee') : (char.getModifier('str') || 0) + (char.proficiencyBonus || 2);
          const damageDice = '1d8+' + (char.getDamageBonus ? char.getDamageBonus('melee') : (char.getModifier('str') || 0));
          
          const result = window.combatSystem?.attack(
            'player', target.id, attackBonus, damageDice
          );
          
          if (result) {
            this.updateCombatLog(result.message);
            this.renderCombatUI(window.combatSystem.getCurrentState());
            
            if (result.critical) {
              this.showToast('💥 暴击！', 'success');
            }
            if (result.fumble) {
              this.showToast('❌ 大失败！', 'error');
            }
            
            // 同步HP到角色
            if (result.hit && this.currentCharacter) {
              this.currentCharacter.hp = result.defenderHP;
            }
          }
        }
        break;
        
      case 'spell':
        this.showSpellCastModal();
        break;
        
      case 'dodge':
        this.updateCombatLog(`${player?.name || '你'} 全神贯注地闪避！`);
        break;
        
      case 'defend':
        this.updateCombatLog(`${player?.name || '你'} 进入防御姿态！`);
        break;
        
      case 'flee':
        const fleeResult = window.combatSystem?.flee?.('player');
        if (fleeResult) {
          this.updateCombatLog(fleeResult.message);
          
          if (fleeResult.success) {
            setTimeout(() => {
              this.navigateTo('game');
              this.showToast('成功逃离战斗', 'info');
            }, 1500);
          }
        }
        break;
    }
    
    // 检查战斗是否结束
    if (window.combatSystem?.isCombatOver?.()) {
      const result = window.combatSystem.endCombat();
      
      if (result?.survivors?.some(s => s.isPlayer)) {
        this.updateCombatLog('🏆 战斗胜利！');
        
        if (result?.xpGained > 0 && this.currentCharacter) {
          const levelResult = this.currentCharacter.addXP(result.xpGained);
          this.showToast(`获得 ${result.xpGained} XP！`, 'success');
          
          if (levelResult.leveledUp) {
            setTimeout(() => {
              this.showLevelUpModal(levelResult);
            }, 500);
          }
        }
      } else {
        this.updateCombatLog('💀 你倒下了...');
      }
      
      setTimeout(() => {
        this.navigateTo('game');
        this.renderCharacterPanel();
      }, 2000);
      
      return;
    }
    
    // 结束回合
    const nextState = window.combatSystem?.endTurn?.();
    
    if (nextState && !nextState.currentCombatant?.isPlayer) {
      setTimeout(() => {
        // 使用敌人AI
        const enemyResult = window.combatSystem?.enemyAI(nextState.currentCombatant.id);
        if (enemyResult) {
          enemyResult.forEach(action => {
            this.updateCombatLog(action.message);
          });
        }
        
        // 同步HP
        const playerCombatant = nextState.combatants?.find(c => c.isPlayer);
        if (playerCombatant && this.currentCharacter) {
          this.currentCharacter.hp = playerCombatant.hp;
        }
        
        window.combatSystem?.endTurn?.();
        this.renderCombatUI(window.combatSystem?.getCurrentState?.() || {});
      }, 1000);
    }
  }

  updateCombatLog(message) {
    const log = document.getElementById('combat-log');
    if (log) {
      const entry = document.createElement('p');
      entry.className = 'log-entry';
      entry.textContent = message;
      log.appendChild(entry);
      log.scrollTop = log.scrollHeight;
    }
  }

  async saveCurrentGame() {
    if (!this.currentCharacter) {
      this.showToast('没有可保存的角色', 'error');
      return;
    }
    
    try {
      const saveData = {
        character: this.currentCharacter,
        history: window.gameState?.history || [],
      };
      
      await window.saveManager.saveGame(
        this.currentCharacter.id,
        saveData,
        this.currentCharacter.startingLocation?.name || '未知'
      );
      
      this.showToast('游戏已保存', 'success');
    } catch (err) {
      console.error('保存失败:', err);
      this.showToast('保存失败', 'error');
    }
  }

  navigateTo(pageId, direction = 'left') {
    const currentPage = document.querySelector('.page.active');
    const nextPage = document.getElementById(`page-${pageId}`);
    
    if (!nextPage) {
      console.error(`页面未找到: page-${pageId}`);
      return;
    }
    
    // 如果当前页面就是要切换的页面，不做处理
    if (currentPage && currentPage === nextPage) return;
    
    // 移除之前可能存在的动画类
    document.body.classList.remove('page-slide-left', 'page-slide-right', 'page-slide-up');
    
    // 添加滑动动画类
    document.body.classList.add(`page-slide-${direction}`);
    
    if (currentPage) {
      currentPage.classList.add('page-exit');
      currentPage.classList.remove('active');
      setTimeout(() => {
        currentPage.classList.remove('page-exit');
      }, 300);
    }
    
    nextPage.classList.add('page-enter', 'active');
    setTimeout(() => {
      nextPage.classList.remove('page-enter');
    }, 400);
    
    this.currentPage = pageId;
    
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageId);
    });
  }

  // ========== 休息系统 ==========
  showRestModal(type) {
    const modal = document.getElementById('rest-modal');
    const title = document.getElementById('rest-modal-title');
    const body = document.getElementById('rest-modal-body');
    
    if (!modal || !body) return;
    
    const char = this.currentCharacter;
    if (!char) {
      this.showToast('没有活跃角色', 'warning');
      return;
    }
    
    if (type === 'short') {
      title.textContent = '\u2615 短休（1小时）';
      body.innerHTML = `
        <div class="rest-info">
          <p>短休可以让角色：</p>
          <ul>
            <li>消耗生命骰恢复生命值</li>
            <li>可用的生命骰数量：${Math.max(1, Math.floor(char.level / 2))}</li>
            <li>当前HP：${char.hp}/${char.maxHp}</li>
          </ul>
        </div>
        <div class="rest-actions">
          <button class="btn btn-primary" id="btn-confirm-short-rest">进行短休</button>
          <button class="btn btn-secondary" id="btn-cancel-rest">取消</button>
        </div>
      `;
      
      addTapEvent(document.getElementById('btn-confirm-short-rest'), () => {
        if (char.shortRest) {
          const result = char.shortRest();
          this.updateCombatLog(`\u2615 短休完成！恢复了 ${result.hpHealed} HP`);
          this.showToast(`短休完成！恢复 ${result.hpHealed} HP`, 'success');
        } else {
          char.hp = Math.min(char.maxHp, char.hp + Math.floor(char.maxHp / 2));
          this.updateCombatLog('\u2615 短休完成！');
          this.showToast('短休完成！', 'success');
        }
        this.renderCharacterPanel();
        UIComponents.closeModal(modal);
      });
    } else {
      title.textContent = '\ud83c\udfd5\ufe0f 长休（8小时）';
      body.innerHTML = `
        <div class="rest-info">
          <p>长休可以让角色：</p>
          <ul>
            <li>恢复所有生命值</li>
            <li>恢复所有法术位</li>
            <li>移除疾病和中毒状态</li>
            <li>当前HP：${char.hp}/${char.maxHp}</li>
          </ul>
        </div>
        <div class="rest-actions">
          <button class="btn btn-primary" id="btn-confirm-long-rest">进行长休</button>
          <button class="btn btn-secondary" id="btn-cancel-rest">取消</button>
        </div>
      `;
      
      addTapEvent(document.getElementById('btn-confirm-long-rest'), () => {
        if (char.longRest) {
          char.longRest();
        } else {
          char.hp = char.maxHp;
          if (char.recoverSpellSlots) char.recoverSpellSlots();
        }
        this.updateCombatLog('\ud83c\udfd5\ufe0f 长休完成！HP和法术位已完全恢复。');
        this.showToast('长休完成！完全恢复', 'success');
        this.renderCharacterPanel();
        UIComponents.closeModal(modal);
      });
    }
    
    addTapEvent(document.getElementById('btn-cancel-rest'), () => {
      UIComponents.closeModal(modal);
    });
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) addTapEvent(closeBtn, () => UIComponents.closeModal(modal));
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) addTapEvent(backdrop, () => UIComponents.closeModal(modal));
    
    UIComponents.openModal(modal);
  }

  // ========== 法术施放UI ==========
  showSpellCastModal() {
    const char = this.currentCharacter;
    if (!char) return;
    
    const spells = char.spells || [];
    const cantrips = char.cantrips || [];
    
    if (spells.length === 0 && cantrips.length === 0) {
      this.showToast('没有可用的法术', 'warning');
      return;
    }
    
    const modal = document.getElementById('skill-check-modal');
    const title = document.getElementById('skill-check-title');
    const body = document.getElementById('skill-check-body');
    
    if (!modal || !body) return;
    
    title.textContent = '\u2728 选择法术';
    
    let html = '';
    
    if (cantrips.length > 0) {
      html += '<h4>戏法（无需法术位）</h4><div class="spell-cast-grid">';
      cantrips.forEach(spell => {
        const detail = window.DND_DATA?.spellDetails?.[spell];
        html += `<div class="spell-cast-card" data-spell="${spell}" data-level="0">
          <div class="spell-cast-name">${spell}</div>
          ${detail ? `<div class="spell-cast-info">${detail.damage ? '伤害: ' + detail.damage : ''} ${detail.range ? '范围: ' + detail.range : ''}</div>` : ''}
        </div>`;
      });
      html += '</div>';
    }
    
    if (spells.length > 0) {
      html += '<h4>1环法术</h4><div class="spell-cast-grid">';
      spells.forEach(spell => {
        const detail = window.DND_DATA?.spellDetails?.[spell];
        const slots = char.spellSlots || [];
        const hasSlot = (slots[0] || 0) > 0;
        html += `<div class="spell-cast-card ${!hasSlot ? 'disabled' : ''}" data-spell="${spell}" data-level="1">
          <div class="spell-cast-name">${spell}</div>
          ${detail ? `<div class="spell-cast-info">${detail.damage ? '伤害: ' + detail.damage : ''} ${detail.range ? '范围: ' + detail.range : ''}</div>` : ''}
          <div class="spell-cast-slot">法术位: ${slots[0] || 0}</div>
        </div>`;
      });
      html += '</div>';
    }
    
    html += '<button class="btn btn-secondary" id="btn-cancel-spell">取消</button>';
    body.innerHTML = html;
    
    body.querySelectorAll('.spell-cast-card:not(.disabled)').forEach(card => {
      addTapEvent(card, () => {
        const spellName = card.dataset.spell;
        const spellLevel = parseInt(card.dataset.level);
        
        if (spellLevel > 0) {
          if (char.useSpellSlot) char.useSpellSlot(spellLevel);
        }
        
        const enemies = window.combatSystem?.getEnemies?.() || [];
        if (enemies.length > 0) {
          const targetIds = enemies.map(e => e.id);
          const detail = window.DND_DATA?.spellDetails?.[spellName];
          const spellData = {
            damage: detail?.damage ? window.diceSystem.rollExpression(detail.damage).total : 10,
            saveDC: char.getSaveDC ? char.getSaveDC() : 13,
            saveType: detail?.damageType === 'fire' ? 'dex' : 'dex'
          };
          
          const result = window.combatSystem?.castSpell('player', spellName, targetIds, spellData);
          if (result) {
            this.updateCombatLog(result.message);
            this.renderCombatUI(window.combatSystem.getCurrentState());
          }
        } else {
          this.updateCombatLog(`\u2728 你施放了 ${spellName}！`);
        }
        
        UIComponents.closeModal(modal);
      });
    });
    
    addTapEvent(document.getElementById('btn-cancel-spell'), () => {
      UIComponents.closeModal(modal);
    });
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) addTapEvent(closeBtn, () => UIComponents.closeModal(modal));
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) addTapEvent(backdrop, () => UIComponents.closeModal(modal));
    
    UIComponents.openModal(modal);
  }

  // ========== NPC面板渲染 ==========
  renderNPCPanel() {
    const body = document.getElementById('npc-panel-body');
    if (!body) return;
    
    if (!window.npcRegistry) {
      body.innerHTML = '<p>NPC系统未加载</p>';
      return;
    }
    
    const npcs = window.npcRegistry.getAll();
    if (npcs.length === 0) {
      body.innerHTML = '<div class="npc-empty"><p>尚未遇到任何NPC</p><p class="hint">探索世界时会遇到各种角色</p></div>';
      return;
    }
    
    body.innerHTML = npcs.map(npc => {
      const moodEmoji = window.npcMoodSystem?.getMoodEmoji?.(npc.mood) || '\ud83d\ude10';
      const affinityColor = npc.affinity > 50 ? 'positive' : npc.affinity < -50 ? 'negative' : 'neutral';
      
      return `<div class="npc-card" data-npc="${npc.npcId}">
        <div class="npc-header">
          <div class="npc-avatar">${moodEmoji}</div>
          <div class="npc-info">
            <h4>${npc.name}</h4>
            <p class="npc-role">${npc.race} ${npc.role}</p>
          </div>
        </div>
        <div class="npc-stats">
          <div class="npc-stat">
            <span>好感度</span>
            <span class="affinity-${affinityColor}">${npc.affinity > 0 ? '+' : ''}${npc.affinity}</span>
          </div>
          <div class="npc-stat">
            <span>信任度</span>
            <span>${npc.trust}%</span>
          </div>
          <div class="npc-stat">
            <span>关系</span>
            <span>${npc.relationshipType}</span>
          </div>
        </div>
        <div class="npc-actions">
          <button class="btn btn-sm btn-primary" data-npc-action="talk" data-npc-id="${npc.npcId}">\ud83d\udcac 交谈</button>
          <button class="btn btn-sm btn-secondary" data-npc-action="gift" data-npc-id="${npc.npcId}">\ud83c\udf81 送礼</button>
        </div>
      </div>`;
    }).join('');
    
    body.querySelectorAll('[data-npc-action="talk"]').forEach(btn => {
      addTapEvent(btn, () => {
        const npcId = btn.dataset.npcId;
        const dialogue = window.npcInteractionSystem?.talk?.(npcId);
        if (dialogue) {
          this.showToast(dialogue.text || '...', 'info', 5000);
        }
      });
    });
    
    body.querySelectorAll('[data-npc-action="gift"]').forEach(btn => {
      addTapEvent(btn, () => {
        const npcId = btn.dataset.npcId;
        const result = window.npcInteractionSystem?.giveGift?.(npcId, '小礼物');
        if (result) {
          this.showToast(result.message, result.success ? 'success' : 'warning');
          this.renderNPCPanel();
        }
      });
    });
  }

  // ========== 升级UI ==========
  showLevelUpModal(levelUpData) {
    const modal = document.getElementById('level-up-modal');
    const body = document.getElementById('level-up-body');
    
    if (!modal || !body) return;
    
    const char = this.currentCharacter;
    
    body.innerHTML = `
      <div class="level-up-content">
        <div class="level-up-header">
          <h3>\ud83c\udf89 恭喜升级！</h3>
          <p class="new-level">等级 ${levelUpData.newLevel}</p>
        </div>
        <div class="level-up-details">
          <div class="level-up-stat">
            <span>HP 增加</span>
            <span class="stat-positive">+${levelUpData.hpGained}</span>
          </div>
          <div class="level-up-stat">
            <span>最大HP</span>
            <span>${levelUpData.newMaxHp}</span>
          </div>
          <div class="level-up-stat">
            <span>熟练加值</span>
            <span>+${levelUpData.newProficiency}</span>
          </div>
          ${levelUpData.newSpellSlots ? `<div class="level-up-stat"><span>法术位更新</span><span>${levelUpData.newSpellSlots.join('/')}</span></div>` : ''}
        </div>
        ${levelUpData.canLearnFeat ? `
          <div class="feat-selection">
            <h4>选择一个专长</h4>
            <div class="feat-list" id="feat-list">
              ${levelUpData.featChoices.map(feat => `
                <div class="feat-card" data-feat="${feat.id}">
                  <div class="feat-name">${feat.name}</div>
                  <div class="feat-description">${feat.description}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <button class="btn btn-primary" id="btn-confirm-levelup">确认</button>
      </div>
    `;
    
    if (levelUpData.canLearnFeat) {
      let selectedFeat = null;
      body.querySelectorAll('.feat-card').forEach(card => {
        addSelectEvent(card, () => {
          body.querySelectorAll('.feat-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectedFeat = card.dataset.feat;
        });
      });
      
      addTapEvent(document.getElementById('btn-confirm-levelup'), () => {
        if (levelUpData.canLearnFeat && selectedFeat) {
          char.learnFeat(selectedFeat);
          this.showToast(`学习了专长：${selectedFeat}`, 'success');
        }
        UIComponents.closeModal(modal);
        this.renderCharacterPanel();
      });
    } else {
      addTapEvent(document.getElementById('btn-confirm-levelup'), () => {
        UIComponents.closeModal(modal);
        this.renderCharacterPanel();
      });
    }
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) addTapEvent(closeBtn, () => UIComponents.closeModal(modal));
    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) addTapEvent(backdrop, () => UIComponents.closeModal(modal));
    
    UIComponents.openModal(modal);
  }

  // ========== 技能检定可视化 ==========
  performSkillCheck(skillName, dc) {
    const char = this.currentCharacter;
    if (!char) return;
    
    const skillAttr = window.DND_DATA?.skillProficiencies?.[skillName];
    if (!skillAttr) return;
    
    const attrMod = char.getModifier(skillAttr);
    const isProficient = char.skills?.includes(skillName);
    const profBonus = isProficient ? (char.proficiencyBonus || 2) : 0;
    const total = attrMod + profBonus;
    
    const result = window.diceSystem.skillCheck(attrMod, profBonus);
    
    const success = result.total >= dc;
    const isCrit = result.critical;
    const isFumble = result.fumble;
    
    const message = `[${skillName}] d20(${result.rolls.join(', ')})${isProficient ? '+' + profBonus : ''} = ${result.total} vs DC ${dc} ${success ? '\u2705 成功！' : '\u274c 失败'}${isCrit ? ' \ud83d\udca5暴击！' : ''}${isFumble ? ' \ud83d\ude31大失败！' : ''}`;
    
    this.updateCombatLog(message);
    
    if (window.diceSystem.addToHistory) {
      window.diceSystem.addToHistory(result, `${skillName} vs DC${dc}`);
    }
    
    return { success, result, isCrit, isFumble };
  }

  showToast(message, type = 'info') {
    UIComponents.showToast(message, type);
  }

  getRaceIcon(raceId) {
    const icons = {
      human: '👤',
      elf: '🧝',
      dwarf: '⛏️',
      halfling: '👣',
      dragonborn: '🐉',
      gnome: '🧙',
      'half-orc': '💪',
      tiefling: '😈'
    };
    return icons[raceId] || '❓';
  }

  getClassIcon(classId) {
    const icons = {
      fighter: '⚔️',
      wizard: '🧙',
      rogue: '🗡️',
      cleric: '✝️',
      ranger: '🏹',
      barbarian: '🪓',
      paladin: '🛡️',
      bard: '🎵',
      druid: '🌲'
    };
    return icons[classId] || '❓';
  }

  getRandomNames() {
    const firstNames = ['艾德里安', '贝拉', '凯尔', '黛西', '埃文', '菲奥娜', '加里', '海伦', '伊凡', '朱莉娅', '雷欧', '米娅', '诺亚', '奥利维亚', '保罗', '奎因', '罗恩', '索菲', '托马斯', '乌娜'];
    const surnames = ['暗影追踪者', '星尘', '铁壁', '风暴之眼', '晨曦', '暮色', '雷霆', '寒冰', '烈焰', '幽魂'];
    return firstNames.map(f => `${f} ${surnames[Math.floor(Math.random() * surnames.length)]}`);
  }
}

// 游戏状态管理
class GameState {
  constructor() {
    this.character = null;
    this.currentScene = null;
    this.history = [];
  }

  init(character) {
    this.character = character;
    this.history = [];
  }

  setScene(scene) {
    this.currentScene = scene;
    this.history.push({
      type: 'scene',
      scene: scene,
      timestamp: Date.now()
    });
  }

  addHistory(entry) {
    this.history.push({
      ...entry,
      timestamp: Date.now()
    });
  }

  toJSON() {
    return {
      character: this.character,
      currentScene: this.currentScene,
      history: this.history
    };
  }
}

// 全局实例
window.gameState = new GameState();
window.app = new DNDRPGApp();

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  window.app.init().catch(err => {
    console.error('应用初始化失败:', err);
  });
});
