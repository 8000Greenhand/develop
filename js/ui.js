// UI 组件库
class UIComponents {
  // 创建页面容器
  static createPage(id, title = '') {
    const page = document.createElement('div');
    page.className = 'page';
    page.id = id;
    page.innerHTML = `
      <header class="page-header">
        ${title ? `<h1 class="page-title">${title}</h1>` : ''}
      </header>
      <main class="page-content"></main>
    `;
    return page;
  }

  // 创建卡片
  static createCard(options = {}) {
    const card = document.createElement('div');
    card.className = `card ${options.class || ''} ${options.selectable ? 'selectable' : ''} ${options.selected ? 'selected' : ''}`;
    card.dataset.value = options.value || '';
    
    card.innerHTML = `
      ${options.icon ? `<div class="card-icon">${options.icon}</div>` : ''}
      ${options.image ? `<div class="card-image" style="background-image: url(${options.image})"></div>` : ''}
      <div class="card-content">
        <h3 class="card-title">${options.title || ''}</h3>
        ${options.subtitle ? `<p class="card-subtitle">${options.subtitle}</p>` : ''}
        ${options.description ? `<p class="card-description">${options.description}</p>` : ''}
      </div>
      ${options.footer ? `<div class="card-footer">${options.footer}</div>` : ''}
    `;
    
    // 如果设置了可选和点击回调
    if (options.selectable && options.onClick) {
      addSelectEvent(card, options.onClick);
    }
    
    return card;
  }

  // 创建按钮
  static createButton(options = {}) {
    const button = document.createElement('button');
    button.className = `btn btn-${options.type || 'primary'} ${options.size || ''} ${options.disabled ? 'disabled' : ''}`;
    button.disabled = options.disabled || false;
    button.innerHTML = `
      ${options.icon ? `<span class="btn-icon">${options.icon}</span>` : ''}
      <span class="btn-text">${options.text || ''}</span>
    `;
    
    if (options.onClick) {
      addTapEvent(button, options.onClick);
    }
    
    return button;
  }

  // 创建输入框
  static createInput(options = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = `input-wrapper ${options.class || ''}`;
    
    wrapper.innerHTML = `
      ${options.label ? `<label class="input-label">${options.label}</label>` : ''}
      <input 
        type="${options.type || 'text'}" 
        class="input-field"
        placeholder="${options.placeholder || ''}"
        value="${options.value || ''}"
        ${options.maxLength ? `maxlength="${options.maxLength}"` : ''}
      />
      ${options.hint ? `<span class="input-hint">${options.hint}</span>` : ''}
    `;
    
    return wrapper;
  }

  // 创建进度条
  static createProgressBar(options = {}) {
    const bar = document.createElement('div');
    bar.className = `progress-bar ${options.class || ''}`;
    const max = options.max || 1;
    const percentage = Math.min(100, Math.max(0, (options.value / max) * 100));
    
    bar.innerHTML = `
      <div class="progress-bar-fill" style="width: ${percentage}%"></div>
      <div class="progress-bar-label">
        <span class="progress-bar-text">${options.label || ''}</span>
        <span class="progress-bar-value">${options.value}/${options.max}</span>
      </div>
    `;
    
    return bar;
  }

  // 创建生命条
  static createHPBar(current, max, name = '') {
    const bar = document.createElement('div');
    bar.className = 'hp-bar';
    
    if (!max || max <= 0) max = 1;
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));
    const colorClass = percentage > 50 ? 'healthy' : percentage > 25 ? 'wounded' : 'critical';
    
    bar.innerHTML = `
      <div class="hp-bar-header">
        <span class="hp-bar-name">${name}</span>
        <span class="hp-bar-value">${current}/${max}</span>
      </div>
      <div class="hp-bar-track">
        <div class="hp-bar-fill ${colorClass}" style="width: ${percentage}%"></div>
      </div>
    `;
    
    return bar;
  }

  // 创建骰子选择器
  static createDiceSelector(options = {}) {
    const container = document.createElement('div');
    container.className = 'dice-selector';
    
    const dices = [
      { sides: 4, icon: '△' },
      { sides: 6, icon: '⬢' },
      { sides: 8, icon: '◈' },
      { sides: 10, icon: '◇' },
      { sides: 12, icon: '⬢' },
      { sides: 20, icon: '⬢' }
    ];
    
    dices.forEach(dice => {
      const btn = document.createElement('button');
      btn.className = `dice-btn dice-${dice.sides}`;
      btn.innerHTML = `<span>${dice.icon}</span><span class="dice-label">d${dice.sides}</span>`;
      btn.dataset.sides = dice.sides;
      addTapEvent(btn, () => {
        if (options.onSelect) {
          options.onSelect(dice.sides);
        }
      });
      container.appendChild(btn);
    });
    
    return container;
  }

  // 创建属性卡片
  static createAttributeCard(name, value, modifier = 0) {
    const card = document.createElement('div');
    card.className = 'attribute-card';
    
    const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    
    card.innerHTML = `
      <div class="attribute-name">${name}</div>
      <div class="attribute-value">${value}</div>
      <div class="attribute-modifier">${modStr}</div>
    `;
    
    return card;
  }

  // 创建标签
  static createTag(text, type = 'default') {
    const tag = document.createElement('span');
    tag.className = `tag tag-${type}`;
    tag.textContent = text;
    return tag;
  }

  // 创建模态框
  static createModal(options = {}) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = options.id || 'modal';
    
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content ${options.size || ''}">
        <div class="modal-header">
          <h2 class="modal-title">${options.title || ''}</h2>
          ${options.closeable !== false ? '<button class="modal-close">&times;</button>' : ''}
        </div>
        <div class="modal-body">${options.content || ''}</div>
        ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
      </div>
    `;
    
    // 事件处理
    if (options.closeable !== false) {
      const closeBtn = modal.querySelector('.modal-close');
      const backdrop = modal.querySelector('.modal-backdrop');
      
      if (closeBtn) {
        addTapEvent(closeBtn, () => this.closeModal(modal));
      }
      if (backdrop) {
        addTapEvent(backdrop, () => this.closeModal(modal));
      }
    }
    
    if (options.onOpen) {
      options.onOpen(modal);
    }
    
    // 存储关闭回调
    if (options.onClose) {
      modal.onCloseCallback = options.onClose;
    }
    
    return modal;
  }

  static openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  static closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    if (modal.onCloseCallback) {
      modal.onCloseCallback();
    }
  }

  // 创建抽屉
  static createDrawer(id, title, content, position = 'left') {
    const drawer = document.createElement('div');
    drawer.className = `drawer drawer-${position}`;
    drawer.id = id;
    
    drawer.innerHTML = `
      <div class="drawer-backdrop"></div>
      <div class="drawer-content">
        <div class="drawer-header">
          <h3 class="drawer-title">${title}</h3>
          <button class="drawer-close">&times;</button>
        </div>
        <div class="drawer-body">${content || ''}</div>
      </div>
    `;
    
    return drawer;
  }

  static openDrawer(drawer) {
    if (!drawer) return;
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  static closeDrawer(drawer) {
    if (!drawer) return;
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 创建Toast提示
  static showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${this.getToastIcon(type)}</span>
      <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  static getToastIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  // 创建加载动画
  static createLoader(text = '加载中...') {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
      <div class="loader-spinner"></div>
      <span class="loader-text">${text}</span>
    `;
    return loader;
  }

  // 创建叙事文本容器
  static createNarrative() {
    const container = document.createElement('div');
    container.className = 'narrative-container';
    container.id = 'narrative';
    
    container.innerHTML = `
      <div class="narrative-content"></div>
    `;
    
    return container;
  }

  // 添加叙事内容
  static addNarrativeText(container, text, type = 'normal') {
    const content = container.querySelector('.narrative-content');
    const p = document.createElement('p');
    p.className = `narrative-text narrative-${type}`;
    p.innerHTML = text;
    content.appendChild(p);
    
    // 滚动到底部
    container.scrollTop = container.scrollHeight;
    
    return p;
  }

  // 创建分割线
  static createDivider(text = '') {
    const divider = document.createElement('div');
    divider.className = 'divider';
    
    if (text) {
      divider.innerHTML = `
        <span class="divider-text">${text}</span>
      `;
    }
    
    return divider;
  }
}

// 侧边栏管理
class SidebarManager {
  constructor() {
    this.drawers = new Map();
    this.initialized = false;
  }

  // 注册抽屉
  register(id, drawer) {
    if (!drawer) {
      console.warn(`SidebarManager: 尝试注册不存在的抽屉 ${id}`);
      return;
    }
    
    this.drawers.set(id, drawer);
    
    // 自动绑定关闭按钮
    const closeBtn = drawer.querySelector('.drawer-close');
    const backdrop = drawer.querySelector('.drawer-backdrop');
    
    if (closeBtn) {
      // 移除可能存在的旧事件监听器（通过克隆节点）
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      addTapEvent(newCloseBtn, () => this.close(id));
    }
    
    if (backdrop) {
      const newBackdrop = backdrop.cloneNode(true);
      backdrop.parentNode.replaceChild(newBackdrop, backdrop);
      addTapEvent(newBackdrop, () => this.close(id));
    }
    
    console.log(`SidebarManager: 已注册抽屉 ${id}`);
  }

  open(id) {
    const drawer = this.drawers.get(id);
    if (drawer) {
      UIComponents.openDrawer(drawer);
    } else {
      console.warn(`SidebarManager: 抽屉 ${id} 未注册，尝试自动注册`);
      const el = document.getElementById(id);
      if (el) {
        this.register(id, el);
        UIComponents.openDrawer(el);
      } else {
        console.error(`SidebarManager: 抽屉 ${id} 不存在`);
      }
    }
  }

  close(id) {
    const drawer = this.drawers.get(id);
    if (drawer) {
      UIComponents.closeDrawer(drawer);
    }
  }

  closeAll() {
    this.drawers.forEach((drawer, id) => {
      UIComponents.closeDrawer(drawer);
    });
  }

  toggle(id) {
    const drawer = this.drawers.get(id);
    if (drawer) {
      if (drawer.classList.contains('active')) {
        this.close(id);
      } else {
        this.open(id);
      }
    } else {
      // 尝试自动注册
      const el = document.getElementById(id);
      if (el) {
        this.register(id, el);
        this.open(id);
      } else {
        console.error(`SidebarManager: 抽屉 ${id} 不存在`);
      }
    }
  }
}

// 全局实例
window.uiComponents = UIComponents;
window.sidebarManager = new SidebarManager();
