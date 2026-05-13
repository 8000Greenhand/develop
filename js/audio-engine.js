// AudioEngine - 基础音频系统
// 提供 BGM 和音效播放接口，预留扩展能力

class AudioEngine {
  constructor() {
    this.bgm = null;
    this.sfx = {};
    this.bgmVolume = 0.5;
    this.sfxVolume = 0.7;
    this.enabled = true;
    this.currentBGM = null;
    this.currentSFX = null;
    this.bgmElement = null;
    this.sfxElements = {};
    this.isInitialized = false;

    // 从 localStorage 恢复设置
    this.loadSettings();
  }

  // 初始化音频系统
  init() {
    if (this.isInitialized) return;

    try {
      // 创建 BGM 音频元素
      this.bgmElement = document.createElement('audio');
      this.bgmElement.loop = true;
      this.bgmElement.volume = this.bgmVolume;

      // 预加载一些常用的音效
      this.preloadSFX(['click', 'success', 'error', 'levelup', 'combat']);

      this.isInitialized = true;
      console.log('音频引擎初始化完成');
    } catch (e) {
      console.error('音频引擎初始化失败:', e);
    }
  }

  // 预加载音效
  preloadSFX(sfxNames) {
    // 预留接口，实际音效资源待添加
    console.log('预加载音效:', sfxNames);
  }

  // 加载设置
  loadSettings() {
    try {
      const savedEnabled = localStorage.getItem('dnd_audio_enabled');
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === 'true';
      }

      const savedBGMVolume = localStorage.getItem('dnd_bgm_volume');
      if (savedBGMVolume !== null) {
        this.bgmVolume = parseFloat(savedBGMVolume);
      }

      const savedSFXVolume = localStorage.getItem('dnd_sfx_volume');
      if (savedSFXVolume !== null) {
        this.sfxVolume = parseFloat(savedSFXVolume);
      }
    } catch (e) {
      console.error('加载音频设置失败:', e);
    }
  }

  // 保存设置
  saveSettings() {
    try {
      localStorage.setItem('dnd_audio_enabled', this.enabled.toString());
      localStorage.setItem('dnd_bgm_volume', this.bgmVolume.toString());
      localStorage.setItem('dnd_sfx_volume', this.sfxVolume.toString());
    } catch (e) {
      console.error('保存音频设置失败:', e);
    }
  }

  // ========== BGM 控制 ==========

  /**
   * 播放 BGM
   * @param {string} name - BGM 名称
   * @param {string} url - BGM 资源 URL（可选）
   */
  playBGM(name, url = null) {
    if (!this.enabled) return;

    // 如果没有提供 URL，使用默认的 BGM 资源
    const bgmUrl = url || this.getBGMUrl(name);
    if (!bgmUrl) {
      console.log('BGM 资源未找到:', name);
      return;
    }

    try {
      if (this.bgmElement) {
        this.bgmElement.src = bgmUrl;
        this.bgmElement.volume = this.bgmVolume;
        this.bgmElement.play().catch(e => {
          console.log('BGM 自动播放被阻止:', e.message);
        });
      }
      this.currentBGM = name;
      console.log('播放 BGM:', name);
    } catch (e) {
      console.error('BGM 播放失败:', e);
    }
  }

  /**
   * 获取 BGM URL
   * @param {string} name - BGM 名称
   * @returns {string|null} BGM URL
   */
  getBGMUrl(name) {
    // BGM 资源映射表，预留接口
    const bgmMap = {
      'menu': '/assets/audio/bgm/menu.mp3',
      'adventure': '/assets/audio/bgm/adventure.mp3',
      'combat': '/assets/audio/bgm/combat.mp3',
      'peaceful': '/assets/audio/bgm/peaceful.mp3',
      'mystery': '/assets/audio/bgm/mystery.mp3',
      'boss': '/assets/audio/bgm/boss.mp3'
    };
    return bgmMap[name] || null;
  }

  /**
   * 停止 BGM
   */
  stopBGM() {
    if (this.bgmElement) {
      this.bgmElement.pause();
      this.bgmElement.currentTime = 0;
    }
    this.currentBGM = null;
  }

  /**
   * 暂停 BGM
   */
  pauseBGM() {
    if (this.bgmElement) {
      this.bgmElement.pause();
    }
  }

  /**
   * 恢复 BGM
   */
  resumeBGM() {
    if (this.bgmElement && this.enabled) {
      this.bgmElement.play().catch(e => {
        console.log('BGM 恢复播放失败:', e.message);
      });
    }
  }

  // ========== SFX 控制 ==========

  /**
   * 播放音效
   * @param {string} name - 音效名称
   * @param {string} url - 音效资源 URL（可选）
   */
  playSFX(name, url = null) {
    if (!this.enabled) return;

    const sfxUrl = url || this.getSFXUrl(name);
    if (!sfxUrl) {
      console.log('SFX 资源未找到:', name);
      return;
    }

    try {
      const sfxElement = document.createElement('audio');
      sfxElement.src = sfxUrl;
      sfxElement.volume = this.sfxVolume;
      sfxElement.play().catch(e => {
        console.log('SFX 自动播放被阻止:', e.message);
      });

      // 播放完成后清理
      sfxElement.onended = () => {
        sfxElement.remove();
      };

      this.sfxElements[name] = sfxElement;
      this.currentSFX = name;
    } catch (e) {
      console.error('SFX 播放失败:', e);
    }
  }

  /**
   * 获取 SFX URL
   * @param {string} name - 音效名称
   * @returns {string|null} SFX URL
   */
  getSFXUrl(name) {
    // SFX 资源映射表，预留接口
    const sfxMap = {
      'click': '/assets/audio/sfx/click.mp3',
      'success': '/assets/audio/sfx/success.mp3',
      'error': '/assets/audio/sfx/error.mp3',
      'levelup': '/assets/audio/sfx/levelup.mp3',
      'combat': '/assets/audio/sfx/combat.mp3',
      'damage': '/assets/audio/sfx/damage.mp3',
      'heal': '/assets/audio/sfx/heal.mp3',
      'coin': '/assets/audio/sfx/coin.mp3',
      'door': '/assets/audio/sfx/door.mp3',
      'magic': '/assets/audio/sfx/magic.mp3'
    };
    return sfxMap[name] || null;
  }

  /**
   * 停止指定音效
   * @param {string} name - 音效名称
   */
  stopSFX(name) {
    if (this.sfxElements[name]) {
      this.sfxElements[name].pause();
      this.sfxElements[name].currentTime = 0;
    }
  }

  /**
   * 停止所有音效
   */
  stopAllSFX() {
    Object.values(this.sfxElements).forEach(el => {
      el.pause();
      el.currentTime = 0;
    });
    this.sfxElements = {};
  }

  // ========== 音量控制 ==========

  /**
   * 设置 BGM 音量
   * @param {number} volume - 音量 (0-1)
   */
  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmElement) {
      this.bgmElement.volume = this.bgmVolume;
    }
    this.saveSettings();
  }

  /**
   * 设置 SFX 音量
   * @param {number} volume - 音量 (0-1)
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * 获取当前音量设置
   */
  getVolumeSettings() {
    return {
      bgm: this.bgmVolume,
      sfx: this.sfxVolume,
      enabled: this.enabled
    };
  }

  // ========== 总开关 ==========

  /**
   * 切换音频开关
   */
  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.resumeBGM();
    } else {
      this.pauseBGM();
      this.stopAllSFX();
    }
    this.saveSettings();
    return this.enabled;
  }

  /**
   * 启用音频
   */
  enable() {
    this.enabled = true;
    this.resumeBGM();
    this.saveSettings();
  }

  /**
   * 禁用音频
   */
  disable() {
    this.enabled = false;
    this.pauseBGM();
    this.stopAllSFX();
    this.saveSettings();
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      enabled: this.enabled,
      currentBGM: this.currentBGM,
      currentSFX: this.currentSFX,
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume
    };
  }

  // ========== 便捷方法 ==========

  /**
   * 播放 UI 点击音效
   */
  playClick() {
    this.playSFX('click');
  }

  /**
   * 播放成功音效
   */
  playSuccess() {
    this.playSFX('success');
  }

  /**
   * 播放错误音效
   */
  playError() {
    this.playSFX('error');
  }

  /**
   * 播放升级音效
   */
  playLevelUp() {
    this.playSFX('levelup');
  }

  /**
   * 播放战斗音效
   */
  playCombat() {
    this.playSFX('combat');
  }

  /**
   * 播放伤害音效
   */
  playDamage() {
    this.playSFX('damage');
  }

  /**
   * 播放治疗音效
   */
  playHeal() {
    this.playSFX('heal');
  }

  /**
   * 播放金币音效
   */
  playCoin() {
    this.playSFX('coin');
  }
}

// 创建全局实例
window.Audio = new AudioEngine();

// 导出类供外部使用
window.AudioEngine = AudioEngine;
