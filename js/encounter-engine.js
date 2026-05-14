// EncounterEngine - 随机遭遇系统
// 管理游戏中的随机事件和遭遇

const ENCOUNTERS = [
  {
    id: 'wolf_attack',
    title: '狼群袭击',
    weight: 1.0,
    isAvailable: () => {
      const loc = $SM.get('game.location');
      return loc && loc !== 'town' && loc !== 'village';
    },
    scenes: {
      start: {
        text: ['夜色中传来低沉的嚎叫...', '几双发光的眼睛从灌木丛中浮现。'],
        buttons: {
          fight: {
            text: '⚔️ 战斗',
            nextScene: { 0.6: 'win', 1: 'lose' }
          },
          intimidate: {
            text: '😱 威吓',
            nextScene: { 0.4: 'fled', 1: 'fail' },
            requireSkill: '威吓'
          },
          flee: {
            text: '🏃 逃跑',
            nextScene: { 0.7: 'escape', 1: 'caught' }
          }
        }
      },
      win: {
        text: ['你击退了狼群！', '在狼的尸体旁，你发现了一些战利品。'],
        reward: { gold: 5, exp: 20 },
        loot: ['狼皮']
      },
      lose: {
        text: ['狼群的力量超出了你的预料...', '你受了伤，勉强逃脱。'],
        damage: 5
      },
      fled: {
        text: ['你的怒吼震慑了狼群，它们夹着尾巴逃走了。'],
        reward: { exp: 10 }
      },
      fail: {
        text: ['狼群不为所动，反而被你的举动激怒了！'],
        nextScene: 'start',
        damage: 2
      },
      escape: {
        text: ['你成功逃离了狼群的追击。']
      },
      caught: {
        text: ['逃跑失败！狼群咬伤了你的腿。'],
        damage: 8
      }
    }
  },
  {
    id: 'traveler',
    title: '旅途中',
    weight: 1.2,
    isAvailable: () => true,
    scenes: {
      start: {
        text: ['路边坐着一个疲惫的旅人，他向你招手。', '"好心人，能给我点吃的吗？"'],
        buttons: {
          help: {
            text: '🥖 分享食物',
            nextScene: 'grateful',
            cost: { food: 1 }
          },
          ignore: {
            text: '🚶 继续赶路',
            nextScene: 'passby'
          },
          rob: {
            text: '🗡️ 打劫',
            nextScene: { 0.5: 'robSuccess', 1: 'robFail' }
          }
        }
      },
      grateful: {
        text: ['"太感谢了！"', '旅人从包里掏出一卷古老的地图递给你。', '"这或许对你有用。"'],
        reward: { exp: 15 },
        loot: ['神秘地图']
      },
      passby: {
        text: ['你继续赶路，旅人的目光追随着你。']
      },
      robSuccess: {
        text: ['旅人吓得交出了身上所有财物。'],
        reward: { gold: 15 },
        alignment: 'evil'
      },
      robFail: {
        text: ['旅人出人意料地反击！', '他似乎是个隐藏的武僧。'],
        damage: 10
      }
    }
  },
  {
    id: 'treasure_chest',
    title: '宝箱',
    weight: 0.8,
    isAvailable: () => {
      const loc = $SM.get('game.location');
      return loc && loc !== 'town' && loc !== 'village';
    },
    scenes: {
      start: {
        text: ['你发现了一个落满灰尘的宝箱。', '锁似乎已经锈蚀了。'],
        buttons: {
          open: {
            text: '🔓 打开',
            nextScene: { 0.3: 'trap', 0.7: 'treasure' }
          },
          inspect: {
            text: '🔍 仔细检查',
            nextScene: { 0.8: 'safeOpen', 1: 'trap' },
            requireSkill: '察觉'
          },
          leave: {
            text: '🚪 离开',
            nextScene: 'leave'
          }
        }
      },
      trap: {
        text: ['宝箱里射出一支毒箭！'],
        damage: 6,
        loot: ['金币袋']
      },
      treasure: {
        text: ['宝箱里满是闪闪发光的宝物！'],
        reward: { gold: 30, exp: 25 },
        loot: ['治疗药水', '古老卷轴']
      },
      safeOpen: {
        text: ['你发现了陷阱并安全拆除！', '宝箱里的宝物完好无损。'],
        reward: { gold: 40, exp: 30 },
        loot: ['治疗药水', '古老卷轴', '精制匕首']
      },
      leave: {
        text: ['你谨慎地离开了宝箱。']
      }
    }
  },
  {
    id: 'merchant',
    title: '行商',
    weight: 1.0,
    isAvailable: () => true,
    scenes: {
      start: {
        text: ['一个驼背的老人推着手推车缓缓走来。', '"好东西！好东西！要看看吗？"'],
        buttons: {
          buy: {
            text: '🛒 浏览商品',
            nextScene: 'shop'
          },
          chat: {
            text: '💬 闲聊',
            nextScene: 'gossip'
          },
          decline: {
            text: '👋 不用了',
            nextScene: 'pass'
          }
        }
      },
      shop: {
        text: ['"看看这些好货："'],
        shopItems: [
          { name: '治疗药水', price: 25, effect: 'heal', value: 10 },
          { name: '精制长剑', price: 50, effect: 'weapon', value: 5 },
          { name: '皮甲', price: 40, effect: 'armor', value: 2 }
        ]
      },
      gossip: {
        text: ['"前方的山路上最近出了个山贼头子..."', '"听说他藏了不少宝贝在山洞里。"'],
        reward: { exp: 5 },
        unlock: 'bandit_cave'
      },
      pass: {
        text: ['"下次再来啊！"老人挥了挥手。']
      }
    }
  },
  {
    id: 'herb_gatherer',
    title: '采药人',
    weight: 0.9,
    isAvailable: () => true,
    scenes: {
      start: {
        text: ['一位老妇人正在路边采集草药。', '"年轻人，这些草药你有兴趣吗？"'],
        buttons: {
          buy: {
            text: '🌿 购买草药',
            nextScene: 'buyHerbs',
            cost: { gold: 10 }
          },
          help: {
            text: '🤝 帮忙采集',
            nextScene: 'helpGather'
          },
          decline: {
            text: '🚶 婉拒',
            nextScene: 'leave'
          }
        }
      },
      buyHerbs: {
        text: ['老妇人递给你一束新鲜的草药。', '"希望这些对你有帮助。"'],
        loot: ['治疗草药'],
        reward: { exp: 5 }
      },
      helpGather: {
        text: ['你帮老妇人采集了一篮子草药。', '"太感谢了！这个送给你作为谢礼。"'],
        loot: ['高级治疗草药', '魔法蘑菇'],
        reward: { exp: 20 }
      },
      leave: {
        text: ['你继续你的旅程。']
      }
    }
  },
  {
    id: 'bandit_ambush',
    title: '山贼伏击',
    weight: 0.6,
    isAvailable: () => {
      const loc = $SM.get('game.location');
      return loc === 'mountain' || loc === 'frontier';
    },
    scenes: {
      start: {
        text: ['"站住！留下买路财！"', '几个蒙面人从树后跳出，挡住了去路。'],
        buttons: {
          fight: {
            text: '⚔️ 战斗',
            nextScene: { 0.5: 'win', 1: 'lose' }
          },
          negotiate: {
            text: '💰 交钱',
            nextScene: { 0.8: 'paid', 1: 'fightAfter' },
            cost: { gold: 20 }
          },
          intimidate: {
            text: '😤 吓唬',
            nextScene: { 0.3: 'fled', 1: 'fail' },
            requireSkill: '威吓'
          }
        }
      },
      win: {
        text: ['你击退了山贼！', '从他们身上搜出了一些赃物。'],
        reward: { gold: 25, exp: 30 },
        loot: ['生锈的匕首', '破旧地图']
      },
      lose: {
        text: ['寡不敌众，你被迫交出了身上的财物。'],
        damage: 8,
        cost: { gold: 15 }
      },
      paid: {
        text: ['你交了买路钱，山贼们让开了道路。'],
        cost: { gold: 20 }
      },
      fightAfter: {
        text: ['山贼不接受谈判！'],
        nextScene: { 0.4: 'win', 1: 'lose' }
      },
      fled: {
        text: ['你的气势震慑了山贼，他们仓皇逃走。'],
        reward: { exp: 15 }
      },
      fail: {
        text: ['山贼们嘲笑你的虚张声势，发起了攻击！'],
        damage: 5,
        nextScene: { 0.4: 'win', 1: 'lose' }
      }
    }
  },
  {
    id: 'old_sage',
    title: '智慧老人',
    weight: 0.5,
    isAvailable: () => true,
    scenes: {
      start: {
        text: ['一位白发苍苍的老人坐在路边的石头上。', '"年轻人，我观察你很久了..."'],
        buttons: {
          listen: {
            text: '👂 聆听教诲',
            nextScene: 'wisdom'
          },
          question: {
            text: '❓ 请教问题',
            nextScene: 'answer'
          },
          ignore: {
            text: '🚶 继续赶路',
            nextScene: 'leave'
          }
        }
      },
      wisdom: {
        text: ['老人讲述了许多人生的智慧...', '你感觉自己对世界有了更深的理解。'],
        reward: { exp: 25 }
      },
      answer: {
        text: ['老人微笑着回答了你的问题，并赠予你一本古籍。'],
        reward: { exp: 15 },
        loot: ['智慧之书']
      },
      leave: {
        text: ['你带着疑惑继续前行。']
      }
    }
  },
  {
    id: 'mysterious_voice',
    title: '神秘声音',
    weight: 0.4,
    isAvailable: () => {
      const loc = $SM.get('game.location');
      return loc === 'ruins' || loc === 'dungeon';
    },
    scenes: {
      start: {
        text: ['一个低沉的声音在你脑海中回响...', '"寻找...深渊之钥...你能听到我吗？"'],
        buttons: {
          respond: {
            text: '🗣️ 尝试回应',
            nextScene: 'respond'
          },
          search: {
            text: '🔍 搜寻来源',
            nextScene: { 0.5: 'find', 1: 'nothing' }
          },
          ignore: {
            text: '🚶 离开',
            nextScene: 'leave'
          }
        }
      },
      respond: {
        text: ['"我...记得这条路..."', '一阵眩晕后，你发现自己获得了某种知识。'],
        reward: { exp: 40 },
        unlock: 'ancient_knowledge'
      },
      find: {
        text: ['你发现了一块刻有神秘符文的石碑。'],
        loot: ['符文石板'],
        reward: { exp: 20 }
      },
      nothing: {
        text: ['你什么都没发现，只有风在呼啸。']
      },
      leave: {
        text: ['那个声音渐渐消失了...']
      }
    }
  }
];

class EncounterEngine {
  constructor() {
    this.encounters = ENCOUNTERS;
    this.currentEncounter = null;
    this.currentScene = null;
    this.encounterTimer = null;
    this.minInterval = 30000;  // 30秒
    this.maxInterval = 60000;  // 60秒
    this.enabled = true;
  }

  // 开始遭遇引擎
  start() {
    if (!this.enabled) return;
    this.enabled = false; // 禁用遭遇引擎
    console.log('遭遇引擎已启动');
  }

  // 停止遭遇引擎
  stop() {
    if (this.encounterTimer) {
      clearTimeout(this.encounterTimer);
      this.encounterTimer = null;
    }
    console.log('遭遇引擎已停止');
  }

  // 调度下一次遭遇
  scheduleNextEncounter() {
    if (!this.enabled) return;
    const delay = this.minInterval + Math.random() * (this.maxInterval - this.minInterval);
    this.encounterTimer = setTimeout(() => {
      this.tryTriggerEncounter();
    }, delay);
  }

  // 尝试触发遭遇
  tryTriggerEncounter() {
    if (!this.enabled) return;
    if ($SM.get('game.inCombat', true)) {
      // 战斗中不触发遭遇
      this.enabled = false; // 禁用遭遇引擎
      return;
    }

    const encounter = this.rollEncounter();
    if (encounter) {
      this.triggerEncounter(encounter);
    } else {
      this.enabled = false; // 禁用遭遇引擎
    }
  }

  // 随机触发遭遇
  rollEncounter() {
    const available = this.encounters.filter(e => e.isAvailable());
    if (available.length === 0) return null;

    const weights = available.map(e => e.weight || 1);
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;

    for (let i = 0; i < available.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return available[i];
    }
    return available[available.length - 1];
  }

  // 触发遭遇
  triggerEncounter(encounter) {
    this.currentEncounter = encounter;
    this.playScene('start');
  }

  // 处理选择
  resolveButton(buttonId) {
    if (!this.currentEncounter || !this.currentScene) return;

    const button = this.currentScene.buttons?.[buttonId];
    if (!button) return;

    // 检查技能要求
    if (button.requireSkill) {
      const charSkills = $SM.get('character.skills', true) || [];
      if (!charSkills.includes(button.requireSkill)) {
        Events.emit(GameEvents.NOTIFICATION, {
          type: 'warning',
          message: `你没有${button.requireSkill}技能！`
        });
        return;
      }
    }

    // 检查消耗
    if (button.cost) {
      for (const [item, amount] of Object.entries(button.cost)) {
        const current = $SM.get(`inventory.${item}`, true) || 0;
        if (current < amount) {
          Events.emit(GameEvents.NOTIFICATION, {
            type: 'warning',
            message: `你没有足够的${item}！`
          });
          return;
        }
        $SM.add(`inventory.${item}`, -amount);
      }
    }

    // 处理概率分支
    if (typeof button.nextScene === 'string') {
      this.playScene(button.nextScene);
    } else if (typeof button.nextScene === 'object') {
      this.resolveProbabilisticScene(button.nextScene);
    }
  }

  // 处理概率分支
  resolveProbabilisticScene(branches) {
    const roll = Math.random();
    let cumulative = 0;

    for (const [prob, scene] of Object.entries(branches)) {
      cumulative += parseFloat(prob);
      if (roll <= cumulative) {
        this.playScene(scene);
        return;
      }
    }
    // 默认走最后一个
    const scenes = Object.values(branches);
    this.playScene(scenes[scenes.length - 1]);
  }

  // 播放场景
  playScene(sceneId) {
    const scene = this.currentEncounter.scenes[sceneId];
    if (!scene) {
      console.error('场景不存在:', sceneId);
      return;
    }

    this.currentScene = scene;

    // 处理奖励
    if (scene.reward) {
      if (scene.reward.gold) $SM.add('inventory.gold', scene.reward.gold);
      if (scene.reward.exp) {
        $SM.add('character.exp', scene.reward.exp);
        Events.emit(GameEvents.LEVEL_UP, {
          exp: scene.reward.exp,
          level: $SM.get('character.level')
        });
      }
    }

    // 处理伤害
    if (scene.damage) {
      const hp = $SM.get('character.hp', true);
      const newHp = Math.max(0, hp - scene.damage);
      $SM.set('character.hp', newHp);
      Events.emit(GameEvents.HP_CHANGE, {
        current: newHp,
        max: $SM.get('character.maxHp'),
        damage: scene.damage
      });
    }

    // 处理消耗
    if (scene.cost) {
      for (const [item, amount] of Object.entries(scene.cost)) {
        $SM.add(`inventory.${item}`, -amount);
      }
    }

    // 处理战利品
    if (scene.loot && scene.loot.length > 0) {
      const inventory = $SM.get('inventory.items') || [];
      $SM.set('inventory.items', [...inventory, ...scene.loot]);
      Events.emit(GameEvents.INVENTORY_UPDATE, { items: inventory });
    }

    // 处理解锁
    if (scene.unlock) {
      $SM.set(`unlocks.${scene.unlock}`, true);
    }

    // 处理阵营偏移
    if (scene.alignment) {
      $SM.set(`character.alignment`, scene.alignment);
    }

    // 更新统计
    if ($SM.get('stats.encounters', true)) {
      $SM.add('stats.encounters', 1);
    } else {
      $SM.set('stats.encounters', 1);
    }

    // 通知 UI
    Events.emit(GameEvents.ENCOUNTER, {
      encounter: this.currentEncounter,
      scene: scene,
      isEnd: this.isSceneTerminal(sceneId)
    });

    // 如果场景不是终点，准备下一次遭遇
    if (typeof scene.nextScene === 'string' || typeof scene.nextScene === 'object') {
      // 场景会循环，不做特殊处理
    } else {
      // 遭遇结束
      this.currentEncounter = null;
      this.currentScene = null;
      this.enabled = false; // 禁用遭遇引擎
    }
  }

  // 判断场景是否是终点
  isSceneTerminal(sceneId) {
    const scene = this.currentEncounter?.scenes[sceneId];
    if (!scene) return true;
    return !scene.nextScene && !scene.buttons;
  }

  // 跳过当前遭遇
  skipEncounter() {
    this.currentEncounter = null;
    this.currentScene = null;
    this.enabled = false; // 禁用遭遇引擎
  }

  // 手动触发遭遇（用于测试或 AI DM 触发）
  manualTrigger(encounterId) {
    const encounter = this.encounters.find(e => e.id === encounterId);
    if (encounter && encounter.isAvailable()) {
      this.triggerEncounter(encounter);
      return true;
    }
    return false;
  }

  // 获取当前遭遇状态
  getStatus() {
    return {
      enabled: this.enabled,
      hasActiveEncounter: this.currentEncounter !== null,
      currentEncounter: this.currentEncounter?.id,
      currentScene: this.currentScene ? Object.keys(this.currentEncounter.scenes).find(
        key => this.currentEncounter.scenes[key] === this.currentScene
      ) : null
    };
  }
}

// 创建全局实例
window.EncounterEngine = EncounterEngine;
window.$encounter = new EncounterEngine();
