/**
 * D&D 5e 战斗系统 - 完整实现
 * 包含先攻、攻击、法术、状态效果、敌人AI等完整战斗逻辑
 */

// ============================================================
// 状态效果常量 - 每种状态效果的详细规则
// ============================================================
const ConditionEffects = {
  // 看不见：攻击检定和依赖视觉的感知（察觉）检定具有劣势
  // 攻击看不见的生物具有优势
  blinded: {
    acDisadvantage: true,
    attackDisadvantage: true,
    autoFailVision: true,
    advantageAgainst: true,
    description: '看不见 - 攻击和感知检定劣势，被攻击时对手优势',
  },

  // 被魅惑：不能攻击魅惑来源，魅惑来源对其具有优势
  charmed: {
    cantAttackCharmer: true,
    charmerAdvantage: true,
    description: '被魅惑 - 不能攻击魅惑来源',
  },

  // 耳聋：依赖听觉的感知（察觉）检定自动失败
  deafened: {
    autoFailHearing: true,
    description: '耳聋 - 依赖听觉的感知检定自动失败',
  },

  // 恐惧：恐惧来源的攻击和技能检定具有劣势，不能主动靠近恐惧来源
  frightened: {
    disadvantageFromSource: true,
    cantApproach: true,
    description: '恐惧 - 对恐惧来源检定劣势，不能主动靠近',
  },

  // 擒抱：速度变为0，结束擒抱需要通过运动或体操检定
  grappled: {
    speedZero: true,
    escapeCheck: 'athletics_or_acrobatics',
    description: '擒抱 - 速度变为0',
  },

  // 失能：不能执行动作或反应
  incapacitated: {
    cantAct: true,
    cantReact: true,
    description: '失能 - 不能执行动作或反应',
  },

  // 隐形：无法被看到，攻击检定具有优势，被攻击具有劣势
  invisible: {
    attackAdvantage: true,
    advantageAgainst: false,
    cantBeSeen: true,
    description: '隐形 - 攻击优势，被攻击时对手劣势',
  },

  // 麻痹：完全无法行动，近战攻击自动暴击，力量和敏捷豁免自动失败
  paralyzed: {
    autoCrit: true,
    autoFailStrDex: true,
    cantMove: true,
    cantAct: true,
    cantReact: true,
    cantSpeak: true,
    description: '麻痹 - 近战自动暴击，力敏豁免自动失败，完全无法行动',
  },

  // 石化：变为石头，所有检定自动失败
  petrified: {
    autoFailAllChecks: true,
    resistanceAll: true,
    cantMove: true,
    cantAct: true,
    cantReact: true,
    cantSpeak: true,
    weightX10: true,
    description: '石化 - 所有检定自动失败，伤害抗性，完全无法行动',
  },

  // 中毒：攻击检定和属性检定具有劣势
  poisoned: {
    attackDisadvantage: true,
    checkDisadvantage: true,
    description: '中毒 - 攻击和属性检定劣势',
  },

  // 倒地：唯一受限动作，近战攻击具有优势，远程攻击具有劣势
  prone: {
    meleeAdvantage: true,
    rangedDisadvantage: true,
    acDisadvantage: true,
    description: '倒地 - 近战攻击优势，远程攻击劣势，AC劣势',
  },

  // 束缚：速度变为0，攻击检定具有劣势，力量和敏捷豁免具有劣势
  restrained: {
    speedZero: true,
    attackDisadvantage: true,
    strDexDisadvantage: true,
    description: '束缚 - 速度为0，攻击和力敏豁免劣势',
  },

  // 眩晕：无法行动，近战攻击自动暴击，力量和敏捷豁免自动失败
  stunned: {
    autoCrit: true,
    autoFailStrDex: true,
    cantMove: true,
    cantAct: true,
    description: '眩晕 - 近战自动暴击，力敏豁免自动失败，无法行动',
  },

  // 昏迷：无法行动，自动失败力量和敏捷豁免，近战攻击自动暴击，倒地
  unconscious: {
    autoCrit: true,
    autoFailStrDex: true,
    cantMove: true,
    cantAct: true,
    cantReact: true,
    cantSpeak: true,
    dropItems: true,
    fallProne: true,
    description: '昏迷 - 近战自动暴击，力敏豁免自动失败，倒地，掉落物品',
  },

  // 集中注意力（非标准状态，用于追踪法术集中）
  concentrating: {
    isConcentration: true,
    description: '集中注意力 - 维持某个法术效果',
  },

  // 狂暴（野蛮人特性）
  raging: {
    resistanceBludgeoning: true,
    resistancePiercing: true,
    resistanceSlashing: true,
    strAdvantage: true,
    cantCastSpells: true,
    description: '狂暴 - 钝击/穿刺/挥砍抗性，力量检定优势，不能施法',
  },

  // 潜行中
  sneaking: {
    hidden: true,
    attackAdvantage: true,
    description: '潜行中 - 隐藏状态，攻击具有优势',
  },

  // 防御姿态
  defending: {
    acBonus: 2,
    description: '防御姿态 - AC+2',
  },

  // 闪避动作
  dodging: {
    dexSavesAdvantage: true,
    advantageAgainst: true,
    description: '闪避 - 敏捷豁免优势，被攻击时对手劣势',
  },
};

// ============================================================
// 法术数据参考（内置常用法术）
// ============================================================
const SpellData = {
  // 攻击法术
  '火球术': {
    level: 3,
    school: 'evocation',
    castingTime: '1动作',
    range: 150,
    components: 'V S M',
    damage: '8d6',
    damageType: 'fire',
    saveType: 'dex',
    saveDC: null, // 使用施法者的法术DC
    halfDamageOnSave: true,
    aoe: true,
    aoeRadius: 20,
    concentration: false,
    description: '爆发出火焰，范围内每个生物进行敏捷豁免',
  },
  '治疗伤口': {
    level: 1,
    school: 'evocation',
    castingTime: '1动作',
    range: 1.5,
    components: 'V S',
    healing: '1d8 + spellcastingMod',
    concentration: false,
    isHealing: true,
    description: '触碰一个生物，恢复生命值',
  },
  '魔法飞弹': {
    level: 1,
    school: 'evocation',
    castingTime: '1动作',
    range: 36,
    components: 'V S',
    damage: '1d4+1',
    damageType: 'force',
    autoHit: true,
    missiles: 3,
    concentration: false,
    description: '发射3枚自动命中的飞弹',
  },
  '雷霆之怒': {
    level: 3,
    school: 'evocation',
    castingTime: '1动作',
    range: 18,
    components: 'V S',
    damage: '8d6',
    damageType: 'thunder',
    saveType: 'con',
    saveDC: null,
    halfDamageOnSave: true,
    aoe: true,
    aoeRadius: 4.5,
    concentration: false,
    stunOnFail: true,
    description: '雷声轰鸣，体质豁免失败则眩晕',
  },
  '睡眠术': {
    level: 1,
    school: 'enchantment',
    castingTime: '1动作',
    range: 27,
    components: 'V S M',
    hpThreshold: '5d8',
    aoe: true,
    aoeRadius: 6,
    concentration: false,
    isSleep: true,
    description: '使范围内HP不超过阈值的生物陷入昏迷',
  },
  '隐形术': {
    level: 2,
    school: 'illusion',
    castingTime: '1动作',
    range: 1,
    components: 'V S M',
    concentration: true,
    duration: '1小时',
    applyCondition: 'invisible',
    description: '使目标隐形，持续到集中结束',
  },
  '祝福术': {
    level: 1,
    school: 'enchantment',
    castingTime: '1动作',
    range: 9,
    components: 'V S M',
    concentration: true,
    duration: '1分钟',
    buffTargets: 3,
    attackBonus: 1,
    saveBonus: 1,
    description: '最多3个生物获得攻击和豁免+1',
  },
  '护盾术': {
    level: 1,
    school: 'abjuration',
    castingTime: '1反应',
    range: 1,
    components: 'V S',
    reaction: true,
    acBonus: 5,
    duration: '1轮',
    description: '反应施放，AC+5直到下回合开始',
  },
  '火矢术': {
    level: 0,
    school: 'evocation',
    castingTime: '1动作',
    range: 36,
    components: 'V S',
    damage: '1d10',
    damageType: 'fire',
    attackRoll: true,
    concentration: false,
    description: '火焰攻击，远程法术攻击检定',
  },
  '寒冰射线': {
    level: 0,
    school: 'evocation',
    castingTime: '1动作',
    range: 18,
    components: 'V S',
    damage: '1d8',
    damageType: 'cold',
    attackRoll: true,
    slowOnHit: true,
    concentration: false,
    description: '冰霜射线，命中减速目标',
  },
};

// ============================================================
// 特殊能力数据参考
// ============================================================
const AbilityData = {
  '狂暴': {
    class: 'barbarian',
    type: 'bonusAction',
    applyCondition: 'raging',
    duration: 10, // 轮数
    description: '进入狂暴状态，获得抗性和力量检定优势',
  },
  '神圣愤怒': {
    class: 'paladin',
    type: 'bonusAction',
    damage: '2d8 + paladinLevel',
    damageType: 'radiant',
    targetCondition: 'undead', // 对亡灵额外伤害
    description: '以圣光打击敌人，对亡灵额外伤害',
  },
  '猎人印记': {
    class: 'ranger',
    type: 'bonusAction',
    concentration: true,
    bonusDamage: '1d6',
    damageType: 'weapon',
    duration: '1小时',
    description: '标记目标，对其造成的武器攻击额外伤害',
  },
  '偷袭': {
    class: 'rogue',
    type: 'passive',
    bonusDamage: '1d6',
    requireAdvantage: true,
    description: '攻击优势或盟友在5尺内时额外伤害',
  },
  '二次打击': {
    class: 'fighter',
    type: 'action',
    extraAttack: 2,
    description: '进行两次攻击',
  },
  '动作如潮': {
    class: 'fighter',
    type: 'actionSurge',
    extraAction: true,
    description: '本回合获得一个额外动作',
  },
  '回旋斩': {
    class: 'fighter',
    type: 'action',
    aoe: true,
    aoeRadius: 1.5,
    damage: 'weapon + strMod',
    description: '挥舞武器攻击周围所有敌人',
  },
  '野性形态': {
    class: 'druid',
    type: 'action',
    transform: true,
    description: '变为野兽形态',
  },
  '圣疗术': {
    class: 'paladin',
    type: 'action',
    healing: '5 + paladinLevel * 5',
    usesPerDay: true,
    description: '消耗圣疗术次数恢复生命值',
  },
};

// ============================================================
// 伤害类型与抗性/免疫/易伤映射
// ============================================================
const DamageTypes = {
  acid: { name: '强酸', resistBy: ['black_dragon'], immuneBy: ['gelatinous_cube'] },
  bludgeoning: { name: '钝击' },
  cold: { name: '寒冷', resistBy: ['white_dragon'], immuneBy: ['ice_elemental'] },
  fire: { name: '火焰', resistBy: ['red_dragon'], immuneBy: ['fire_elemental'] },
  force: { name: '力场', resistBy: [], immuneBy: [] },
  lightning: { name: '闪电', resistBy: ['blue_dragon'], immuneBy: ['air_elemental'] },
  necrotic: { name: '死灵', resistBy: [], immuneBy: ['undead'] },
  piercing: { name: '穿刺' },
  poison: { name: '毒素', resistBy: ['druid_20'], immuneBy: ['undead', 'construct'] },
  psychic: { name: '灵能', resistBy: [], immuneBy: [] },
  radiant: { name: '光耀', resistBy: [], immuneBy: ['undead_weak'] },
  slashing: { name: '挥砍' },
  thunder: { name: '雷鸣', resistBy: [], immuneBy: [] },
};

// ============================================================
// 战斗系统主类
// ============================================================
class CombatSystem {
  constructor() {
    /** 是否在战斗中 */
    this.inCombat = false;
    /** 当前回合索引 */
    this.currentTurn = 0;
    /** 当前轮数 */
    this.round = 1;
    /** 所有参战单位 */
    this.combatants = [];
    /** 战斗日志 */
    this.log = [];
    /** 惊喜轮标记 */
    this.surpriseRound = false;
    /** 惊喜单位ID列表 */
    this.surprisedCombatants = [];
    /** 集中注意力追踪 { combatantId: { spellName, concentrationDC } } */
    this.concentrationTracker = {};
    /** 事件监听器 */
    this._listeners = {};
    /** 战斗统计 */
    this.statistics = {
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalHealing: 0,
      criticalHits: 0,
      fumbles: 0,
      spellsCast: 0,
      roundsElapsed: 0,
    };
  }

  // ============================================================
  // 事件系统
  // ============================================================

  /**
   * 注册事件监听
   * @param {string} event - 事件名
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  }

  /**
   * 移除事件监听
   * @param {string} event - 事件名
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  /**
   * 触发事件
   * @param {string} event - 事件名
   * @param {object} data - 事件数据
   */
  emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[CombatSystem] 事件处理器错误 (${event}):`, err);
      }
    });
  }

  // ============================================================
  // 辅助方法
  // ============================================================

  /**
   * 获取骰子系统引用
   * @returns {DiceSystem}
   */
  _getDice() {
    if (!window.diceSystem) {
      console.error('[CombatSystem] 骰子系统未加载！');
      // 提供一个简单的回退骰子
      return {
        roll: (sides) => Math.floor(Math.random() * sides) + 1,
        rollWithAdvantage: (disadvantage) => {
          const r1 = Math.floor(Math.random() * 20) + 1;
          const r2 = Math.floor(Math.random() * 20) + 1;
          if (disadvantage) return { rolls: [r1, r2], total: Math.min(r1, r2), disadvantage: true };
          return { rolls: [r1, r2], total: Math.max(r1, r2), advantage: true };
        },
        rollExpression: (expr) => {
          // 简单的 2d6+3 格式解析
          const match = expr.match(/(\d+)d(\d+)([+-]\d+)?/);
          if (!match) return { total: 0, rolls: [] };
          let total = 0; const rolls = [];
          const count = parseInt(match[1]), sides = parseInt(match[2]);
          for (let i = 0; i < count; i++) { const r = Math.floor(Math.random() * sides) + 1; rolls.push(r); total += r; }
          if (match[3]) total += parseInt(match[3]);
          return { total, rolls };
        }
      };
    }
    return window.diceSystem;
  }

  /**
   * 根据属性名获取属性调整值
   * @param {object} combatant - 参战单位
   * @param {string} ability - 属性名 (str/dex/con/int/wis/cha)
   * @returns {number}
   */
  _getAbilityMod(combatant, ability) {
    if (!combatant.abilities) return combatant[ability + 'Mod'] || 0;
    const score = combatant.abilities[ability] || 10;
    return Math.floor((score - 10) / 2);
  }

  /**
   * 计算有效AC（考虑状态效果）
   * @param {object} combatant - 参战单位
   * @returns {number}
   */
  _getEffectiveAC(combatant) {
    let ac = combatant.ac || 10;

    // 防御姿态 AC+2
    if (this.hasCondition(combatant.id, 'defending')) {
      ac += 2;
    }

    // 护盾术 AC+5
    if (combatant._shieldBonus) {
      ac += combatant._shieldBonus;
    }

    return ac;
  }

  /**
   * 检查攻击是否具有优势
   * @param {object} attacker - 攻击方
   * @param {object} defender - 防御方
   * @param {boolean} explicitAdvantage - 显式指定的优势
   * @param {boolean} explicitDisadvantage - 显式指定的劣势
   * @returns {{ advantage: boolean, disadvantage: boolean, reason: string }}
   */
  _evaluateAdvantage(attacker, defender, explicitAdvantage = false, explicitDisadvantage = false) {
    let advantage = explicitAdvantage;
    let disadvantage = explicitDisadvantage;
    const reasons = [];

    // --- 攻击方状态 ---
    // 看不见 -> 攻击劣势
    if (this.hasCondition(attacker.id, 'blinded')) {
      disadvantage = true;
      reasons.push('攻击方看不见');
    }

    // 中毒 -> 攻击劣势
    if (this.hasCondition(attacker.id, 'poisoned')) {
      disadvantage = true;
      reasons.push('攻击方中毒');
    }

    // 束缚 -> 攻击劣势
    if (this.hasCondition(attacker.id, 'restrained')) {
      disadvantage = true;
      reasons.push('攻击方被束缚');
    }

    // 隐形 -> 攻击优势
    if (this.hasCondition(attacker.id, 'invisible')) {
      advantage = true;
      reasons.push('攻击方隐形');
    }

    // 潜行中 -> 攻击优势
    if (this.hasCondition(attacker.id, 'sneaking')) {
      advantage = true;
      reasons.push('攻击方潜行中');
    }

    // --- 防御方状态 ---
    // 看不见 -> 被攻击优势
    if (this.hasCondition(defender.id, 'blinded')) {
      advantage = true;
      reasons.push('防御方看不见');
    }

    // 倒地 -> 近战优势，远程劣势
    if (this.hasCondition(defender.id, 'prone')) {
      // 假设为近战攻击（远程需要额外参数判断）
      advantage = true;
      reasons.push('防御方倒地（近战）');
    }

    // 闪避 -> 被攻击劣势
    if (this.hasCondition(defender.id, 'dodging')) {
      disadvantage = true;
      reasons.push('防御方闪避中');
    }

    // 隐形 -> 被攻击劣势
    if (this.hasCondition(defender.id, 'invisible')) {
      disadvantage = true;
      reasons.push('防御方隐形');
    }

    // 束缚 -> 被攻击优势
    if (this.hasCondition(defender.id, 'restrained')) {
      advantage = true;
      reasons.push('防御方被束缚');
    }

    // 优势劣势抵消
    if (advantage && disadvantage) {
      advantage = false;
      disadvantage = false;
      reasons.push('优势与劣势抵消');
    }

    return { advantage, disadvantage, reason: reasons.join(', ') || '普通攻击' };
  }

  /**
   * 计算伤害（考虑抗性、免疫、易伤）
   * @param {number} damage - 原始伤害
   * @param {string} damageType - 伤害类型
   * @param {object} target - 目标
   * @returns {{ damage: number, resisted: boolean, immune: boolean, vulnerable: boolean }}
   */
  _calculateDamage(damage, damageType, target) {
    if (!target) return { damage, resisted: false, immune: false, vulnerable: false };

    // 检查免疫
    if (target.damageImmunities && target.damageImmunities.includes(damageType)) {
      return { damage: 0, resisted: false, immune: true, vulnerable: false };
    }

    // 检查抗性
    let resisted = false;
    let finalDamage = damage;

    if (target.damageResistances && target.damageResistances.includes(damageType)) {
      finalDamage = Math.floor(damage / 2);
      resisted = true;
    }

    // 检查易伤
    let vulnerable = false;
    if (target.damageVulnerabilities && target.damageVulnerabilities.includes(damageType)) {
      finalDamage = finalDamage * 2;
      vulnerable = true;
    }

    // 狂暴状态：钝击/穿刺/挥砍抗性
    if (this.hasCondition(target.id, 'raging')) {
      if (['bludgeoning', 'piercing', 'slashing'].includes(damageType)) {
        if (!vulnerable) {
          finalDamage = Math.floor(finalDamage / 2);
          resisted = true;
        }
      }
    }

    // 石化状态：所有伤害抗性
    if (this.hasCondition(target.id, 'petrified')) {
      if (!immune && !vulnerable) {
        finalDamage = Math.floor(finalDamage / 2);
        resisted = true;
      }
    }

    return { damage: finalDamage, resisted, immune, vulnerable };
  }

  /**
   * 造成伤害并处理倒地/死亡
   * @param {object} target - 目标单位
   * @param {number} damage - 伤害量
   * @param {string} damageType - 伤害类型
   * @returns {object} 伤害结果
   */
  _dealDamage(target, damage, damageType) {
    const dmgResult = this._calculateDamage(damage, damageType, target);
    const actualDamage = dmgResult.damage;

    target.hp = Math.max(0, target.hp - actualDamage);
    this.statistics.totalDamageDealt += actualDamage;

    // 检查集中注意力（受到伤害时需要体质豁免）
    if (this.concentrationTracker[target.id] && actualDamage > 0) {
      const conMod = this._getAbilityMod(target, 'con');
      const dc = Math.max(10, Math.floor(actualDamage / 2));
      const roll = this._getDice().roll(20);
      const total = roll + conMod;

      if (total < dc) {
        // 集中被打断
        const spellInfo = this.concentrationTracker[target.id];
        this.removeCondition(target.id, 'concentrating');
        this.removeEffectByConcentration(target.id);
        delete this.concentrationTracker[target.id];

        this.log.push({
          type: 'concentration_break',
          message: `${target.name} 的集中被打断！${spellInfo.spellName} 效果消失。`,
          timestamp: Date.now(),
        });
      }
    }

    // 检查倒地
    let downed = false;
    if (target.hp <= 0) {
      downed = true;
      this.applyCondition(target.id, 'unconscious', -1); // -1 表示永久直到被治疗
      this.log.push({
        type: 'downed',
        combatantId: target.id,
        message: `${target.name} 倒下了！`,
        timestamp: Date.now(),
      });

      this.emit('COMBATANT_DOWN', { combatant: target });
    }

    return {
      ...dmgResult,
      actualDamage,
      targetHP: target.hp,
      targetMaxHP: target.maxHp || target.maxHP,
      downed,
    };
  }

  /**
   * 移除由集中维持的法术效果
   * @param {string} combatantId - 参战单位ID
   */
  removeEffectByConcentration(combatantId) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant || !combatant.activeEffects) return;

    combatant.activeEffects = combatant.activeEffects.filter(effect => !effect.requiresConcentration);
  }

  /**
   * 获取存活的参战单位
   * @param {Array} list - 参战单位列表
   * @returns {Array}
   */
  _getAlive(list) {
    return list.filter(c => c.hp > 0 && !this.hasCondition(c.id, 'dead'));
  }

  /**
   * 添加战斗日志
   * @param {string} type - 日志类型
   * @param {string} message - 日志消息
   * @param {object} extra - 额外数据
   */
  _addLog(type, message, extra = {}) {
    const entry = { type, message, timestamp: Date.now(), round: this.round, ...extra };
    this.log.push(entry);
    return entry;
  }

  // ============================================================
  // 1. 初始化战斗
  // ============================================================

  /**
   * 初始化战斗
   * @param {Array} combatants - 参战单位列表
   * @param {object} options - 初始化选项
   * @param {boolean} options.surpriseAttack - 是否有惊喜攻击
   * @param {boolean} options.isAmbush - 是否是伏击
   * @param {boolean} options.isTrap - 是否是陷阱
   * @param {Function} options.stealthCheck - 隐匿检定回调
   * @returns {object} 战斗初始状态
   */
  init(combatants, options = {}) {
    const dice = this._getDice();

    // 重置状态
    this.inCombat = true;
    this.round = 1;
    this.currentTurn = 0;
    this.log = [];
    this.surpriseRound = false;
    this.surprisedCombatants = [];
    this.concentrationTracker = {};
    this.statistics = {
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalHealing: 0,
      criticalHits: 0,
      fumbles: 0,
      spellsCast: 0,
      roundsElapsed: 0,
    };

    // 初始化每个参战单位
    this.combatants = combatants.map(c => {
      const dexMod = this._getAbilityMod(c, 'dex');
      return {
        ...c,
        initiative: c.initiative || (dice.roll(20) + dexMod),
        conditions: [],
        activeEffects: [],
        actions: {
          attack: true,
          spell: true,
          move: true,
          bonus: true,
          reaction: true,
        },
        position: c.position || 0,
        distanceMoved: 0,
        maxHp: c.maxHp || c.hp,
        // 标准化属性名（兼容 maxHP 和 maxHp）
        if (c.maxHP !== undefined && c.maxHp === undefined) c.maxHp = c.maxHP;
        if (c.curHP !== undefined && c.hp === undefined) c.hp = c.curHP;
        disengaged: false, // 本回合是否脱离
        hasActed: false,
        spellSlots: c.spellSlots ? [...c.spellSlots] : [0, 0, 0, 0, 0, 0, 0, 0, 0],
        concentrationSpell: null,
      };
    });

    // 惊喜轮处理
    if (options.surpriseAttack || options.isAmbush || options.isTrap) {
      this.surpriseRound = true;
      const { surprisedIds, unsurprisedIds } = this._resolveSurprise(combatants, options);
      this.surprisedCombatants = surprisedIds;

      this._addLog('surprise_round', '惊喜轮！部分单位被惊喜，无法在第一轮行动。', {
        surprisedIds,
        unsurprisedIds,
      });
    }

    // 按先攻排序（高先攻先行动）
    this.combatants.sort((a, b) => b.initiative - a.initiative);

    // 记录战斗开始
    this._addLog('combat_start', '战斗开始！', {
      combatantCount: this.combatants.length,
    });

    // 触发事件
    this.emit('COMBAT_START', {
      combatants: this.combatants,
      surpriseRound: this.surpriseRound,
      surprisedCombatants: this.surprisedCombatants,
    });

    return this.getCurrentState();
  }

  /**
   * 解析惊喜判定
   * @param {Array} combatants - 参战单位
   * @param {object} options - 选项
   * @returns {{ surprisedIds: Array, unsurprisedIds: Array }}
   */
  _resolveSurprise(combatants, options) {
    const dice = this._getDice();
    const surprisedIds = [];
    const unsurprisedIds = [];

    combatants.forEach(c => {
      if (options.isAmbush) {
        // 伏击：伏击方自动惊喜被伏击方
        if (c.isAmbusher) {
          unsurprisedIds.push(c.id);
        } else {
          surprisedIds.push(c.id);
        }
      } else if (options.isTrap) {
        // 陷阱：设置陷阱方惊喜
        if (c.isTrapper) {
          unsurprisedIds.push(c.id);
        } else {
          // 被陷阱方进行感知检定
          const wisMod = this._getAbilityMod(c, 'wis');
          const perceptionBonus = c.perceptionBonus || wisMod;
          const roll = dice.roll(20);
          const dc = options.trapDC || 15;

          if (roll + perceptionBonus >= dc) {
            unsurprisedIds.push(c.id);
          } else {
            surprisedIds.push(c.id);
          }
        }
      } else if (options.surpriseAttack) {
        // 一般惊喜攻击：隐匿 vs 感知
        const stealthBonus = options.stealthCheck ? options.stealthCheck() : 0;
        const wisMod = this._getAbilityMod(c, 'wis');
        const perceptionBonus = c.perceptionBonus || wisMod;
        const roll = dice.roll(20);
        const dc = stealthBonus + 10;

        if (roll + perceptionBonus >= dc) {
          unsurprisedIds.push(c.id);
        } else {
          surprisedIds.push(c.id);
        }
      } else {
        unsurprisedIds.push(c.id);
      }
    });

    return { surprisedIds, unsurprisedIds };
  }

  // ============================================================
  // 2. 获取完整战斗状态
  // ============================================================

  /**
   * 获取完整战斗状态
   * @returns {object}
   */
  getCurrentState() {
    const currentCombatant = this.combatants[this.currentTurn] || null;
    return {
      inCombat: this.inCombat,
      round: this.round,
      turn: this.currentTurn,
      currentCombatant,
      combatants: this.combatants.map(c => ({
        ...c,
        effectiveAC: this._getEffectiveAC(c),
      })),
      log: this.log,
      surpriseRound: this.surpriseRound,
      surprisedCombatants: this.surprisedCombatants,
      concentrationTracker: { ...this.concentrationTracker },
      statistics: { ...this.statistics },
    };
  }

  // ============================================================
  // 3. 完整攻击
  // ============================================================

  /**
   * 执行攻击
   * @param {string} attackerId - 攻击方ID
   * @param {string} defenderId - 防御方ID
   * @param {object} options - 攻击选项
   * @param {boolean} options.advantage - 优势
   * @param {boolean} options.disadvantage - 劣势
   * @param {string} options.weaponDamage - 武器伤害骰表达式 (如 "1d8+3")
   * @param {number} options.damageBonus - 额外伤害加值
   * @param {number} options.attackBonus - 攻击加值
   * @param {boolean} options.bonusAction - 是否为附赠动作
   * @param {boolean} options.reaction - 是否为反应动作
   * @param {string} options.damageType - 伤害类型
   * @param {boolean} options.ranged - 是否远程攻击
   * @returns {object} 攻击结果
   */
  attack(attackerId, defenderId, options = {}) {
    const {
      advantage = false,
      disadvantage = false,
      weaponDamage = '1d6',
      damageBonus = 0,
      attackBonus = 0,
      bonusAction = false,
      reaction = false,
      damageType = 'slashing',
      ranged = false,
    } = options;

    const attacker = this.combatants.find(c => c.id === attackerId);
    const defender = this.combatants.find(c => c.id === defenderId);

    if (!attacker || !defender) {
      return { success: false, message: '无效的攻击目标' };
    }

    if (attacker.hp <= 0) {
      return { success: false, message: `${attacker.name} 已倒地，无法攻击` };
    }

    const dice = this._getDice();

    // 检查攻击方是否能行动
    if (this.hasCondition(attacker.id, 'paralyzed') ||
        this.hasCondition(attacker.id, 'stunned') ||
        this.hasCondition(attacker.id, 'unconscious') ||
        this.hasCondition(attacker.id, 'petrified')) {
      return { success: false, message: `${attacker.name} 无法行动` };
    }

    // 评估优势/劣势
    const advResult = this._evaluateAdvantage(attacker, defender, advantage, disadvantage);

    // 倒地远程攻击劣势
    if (ranged && this.hasCondition(defender.id, 'prone')) {
      advResult.disadvantage = true;
      advResult.advantage = false;
      advResult.reason += ', 防御方倒地（远程劣势）';
    }

    // 麻痹/昏迷/眩晕 -> 近战自动暴击
    const autoCrit = !ranged && (
      this.hasCondition(defender.id, 'paralyzed') ||
      this.hasCondition(defender.id, 'stunned') ||
      this.hasCondition(defender.id, 'unconscious')
    );

    // 掷攻击骰
    let d20Result;
    if (advResult.advantage && !advResult.disadvantage) {
      d20Result = dice.rollWithAdvantage(false);
    } else if (advResult.disadvantage && !advResult.advantage) {
      d20Result = dice.rollWithAdvantage(true);
    } else {
      const roll = dice.roll(20);
      d20Result = { rolls: [roll], selected: roll, type: 'normal' };
    }

    const naturalRoll = d20Result.selected;
    const totalAttack = naturalRoll + attackBonus;
    const defenderAC = this._getEffectiveAC(defender);
    const critical = naturalRoll === 20 || autoCrit;
    const fumble = naturalRoll === 1;
    const hit = critical || (!fumble && totalAttack >= defenderAC);

    // 构建结果
    const result = {
      success: true,
      attacker: attacker.name,
      attackerId: attacker.id,
      defender: defender.name,
      defenderId: defender.id,
      attackRoll: d20Result.rolls,
      selectedRoll: naturalRoll,
      attackBonus,
      totalAttack,
      defenderAC,
      hit,
      critical,
      fumble,
      autoCrit,
      advantageType: d20Result.type,
      advantageReason: advResult.reason,
      bonusAction,
      reaction,
      damageType,
    };

    if (fumble) {
      // 大失败处理
      this.statistics.fumbles++;
      const fumbleResult = this._handleFumble(attacker);
      result.fumbleEffect = fumbleResult;
      result.message = `${attacker.name} 大失败！${fumbleResult.message}`;
      this._addLog('fumble', result.message, result);
      this.emit('ATTACK_FUMBLE', result);
      return result;
    }

    if (hit) {
      if (critical) {
        this.statistics.criticalHits++;
      }

      // 掷伤害骰
      const damageRoll = dice.rollExpression(weaponDamage);
      let totalDamage = damageRoll.total + damageBonus;

      // 暴击：伤害骰翻倍（不是总伤害翻倍）
      if (critical) {
        const critDice = dice.rollExpression(weaponDamage);
        totalDamage += critDice.total;
        result.critDamageRoll = critDice;
      }

      // 偷袭伤害
      if (attacker.class === 'rogue' && (advResult.advantage || autoCrit)) {
        const sneakDice = dice.rollExpression('1d6');
        totalDamage += sneakDice.total;
        result.sneakAttack = sneakDice.total;
      }

      // 造成伤害
      const damageResult = this._dealDamage(defender, totalDamage, damageType);

      result.damageRoll = damageRoll;
      result.totalDamage = totalDamage;
      result.damageResult = damageResult;

      if (critical) {
        result.message = `暴击！${attacker.name} 对 ${defender.name} 造成了 ${damageResult.actualDamage} 点${DamageTypes[damageType]?.name || damageType}伤害！`;
      } else {
        result.message = `${attacker.name} 命中 ${defender.name}（${totalAttack} vs AC ${defenderAC}），造成 ${damageResult.actualDamage} 点${DamageTypes[damageType]?.name || damageType}伤害`;
      }

      if (damageResult.immune) {
        result.message += `（免疫！）`;
      } else if (damageResult.resisted) {
        result.message += `（抗性减半）`;
      } else if (damageResult.vulnerable) {
        result.message += `（易伤翻倍）`;
      }

      if (damageResult.downed) {
        result.message += ` ${defender.name} 倒下了！`;
      }

      this.emit('ATTACK_HIT', result);
    } else {
      result.message = `${attacker.name} 的攻击未命中 ${defender.name}（${totalAttack} vs AC ${defenderAC}）`;
      this.emit('ATTACK_MISS', result);
    }

    this._addLog('attack', result.message, result);
    return result;
  }

  /**
   * 处理大失败
   * @param {object} attacker - 攻击方
   * @returns {object}
   */
  _handleFumble(attacker) {
    const roll = this._getDice().roll(100);
    let message = '';

    if (roll <= 25) {
      // 武器掉落
      message = `${attacker.name} 的武器脱手飞出！`;
    } else if (roll <= 50) {
      // 自伤
      const selfDamage = this._getDice().rollExpression('1d4').total;
      attacker.hp = Math.max(0, attacker.hp - selfDamage);
      message = `${attacker.name} 失误伤到了自己，受到 ${selfDamage} 点伤害！`;
    } else if (roll <= 75) {
      // 失去平衡
      this.applyCondition(attacker.id, 'prone', 0);
      message = `${attacker.name} 失去平衡，摔倒在地！`;
    } else {
      // 浪费回合
      message = `${attacker.name} 脚下一滑，攻击完全落空！`;
    }

    return { roll, message };
  }

  // ============================================================
  // 4. 法术施放
  // ============================================================

  /**
   * 施放法术
   * @param {string} casterId - 施法者ID
   * @param {string} spellName - 法术名
   * @param {Array|string} targetIds - 目标ID（数组或单个ID）
   * @param {number} spellLevel - 法术环阶
   * @returns {object} 法术结果
   */
  castSpell(casterId, spellName, targetIds, spellLevel = 1) {
    const caster = this.combatants.find(c => c.id === casterId);
    if (!caster) return { success: false, message: '无效的施法者' };

    if (caster.hp <= 0) {
      return { success: false, message: `${caster.name} 已倒地，无法施法` };
    }

    // 狂暴中不能施法
    if (this.hasCondition(caster.id, 'raging')) {
      return { success: false, message: `${caster.name} 正在狂暴中，无法施法` };
    }

    // 失能/麻痹/昏迷不能施法
    if (this.hasCondition(caster.id, 'incapacitated') ||
        this.hasCondition(caster.id, 'paralyzed') ||
        this.hasCondition(caster.id, 'stunned') ||
        this.hasCondition(caster.id, 'unconscious') ||
        this.hasCondition(caster.id, 'petrified')) {
      return { success: false, message: `${caster.name} 无法施法` };
    }

    // 获取法术数据
    const spell = SpellData[spellName] || {};
    const dice = this._getDice();

    // 检查法术位
    if (spellLevel > 0 && caster.spellSlots) {
      if (!caster.spellSlots[spellLevel - 1] || caster.spellSlots[spellLevel - 1] <= 0) {
        return { success: false, message: `${caster.name} 没有 ${spellLevel} 环法术位了` };
      }
      caster.spellSlots[spellLevel - 1]--;
    }

    // 标准化目标ID为数组
    const targets = Array.isArray(targetIds) ? targetIds : [targetIds];

    this.statistics.spellsCast++;

    const result = {
      success: true,
      caster: caster.name,
      casterId: caster.id,
      spell: spellName,
      spellLevel,
      targets: [],
      totalDamage: 0,
      totalHealing: 0,
    };

    // 治疗法术
    if (spell.isHealing) {
      targets.forEach(targetId => {
        const target = this.combatants.find(c => c.id === targetId);
        if (!target) return;

        const healRoll = dice.rollExpression(spell.healing);
        const healAmount = healRoll.total;
        const maxHP = target.maxHp || target.maxHP;
        const actualHeal = Math.min(healAmount, maxHP - target.hp);

        target.hp = Math.min(maxHP, target.hp + healAmount);
        this.statistics.totalHealing += actualHeal;

        result.targets.push({
          target: target.name,
          targetId: target.id,
          healRoll,
          healAmount: actualHeal,
          newHP: target.hp,
          maxHP,
        });
        result.totalHealing += actualHeal;
      });

      result.message = `${caster.name} 施放了 ${spellName}，恢复了 ${result.totalHealing} 点生命值！`;
      this._addLog('spell_heal', result.message, result);
      this.emit('SPELL_CAST', result);
      return result;
    }

    // 睡眠术
    if (spell.isSleep) {
      const hpThreshold = dice.rollExpression(spell.hpThreshold).total;
      let sleptCount = 0;

      // 按当前HP从低到高排序
      const sortedTargets = targets
        .map(id => this.combatants.find(c => c.id === id))
        .filter(Boolean)
        .sort((a, b) => a.hp - b.hp);

      let remainingThreshold = hpThreshold;
      sortedTargets.forEach(target => {
        if (target.hp <= remainingThreshold && target.hp > 0) {
          remainingThreshold -= target.hp;
          this.applyCondition(target.id, 'unconscious', -1);
          sleptCount++;
          result.targets.push({
            target: target.name,
            targetId: target.id,
            effect: 'unconscious',
            hp: target.hp,
          });
        }
      });

      result.message = `${caster.name} 施放了 ${spellName}（阈值 ${hpThreshold} HP），${sleptCount} 个目标陷入昏迷！`;
      this._addLog('spell_sleep', result.message, result);
      this.emit('SPELL_CAST', result);
      return result;
    }

    // 自动命中法术（如魔法飞弹）
    if (spell.autoHit) {
      const missileCount = spell.missiles || 1;
      // 升环：每升一环+1飞弹
      const extraMissiles = Math.max(0, spellLevel - (spell.level || 1));
      const totalMissiles = missileCount + extraMissiles;

      targets.forEach(targetId => {
        const target = this.combatants.find(c => c.id === targetId);
        if (!target || target.hp <= 0) return;

        const dmgRoll = dice.rollExpression(spell.damage);
        const missileDamage = dmgRoll.total * totalMissiles;
        const damageResult = this._dealDamage(target, missileDamage, spell.damageType);

        result.targets.push({
          target: target.name,
          targetId: target.id,
          missiles: totalMissiles,
          damagePerMissile: dmgRoll.total,
          totalDamage: damageResult.actualDamage,
          ...damageResult,
        });
        result.totalDamage += damageResult.actualDamage;
      });

      result.message = `${caster.name} 施放了 ${spellName}，发射 ${totalMissiles} 枚飞弹，造成 ${result.totalDamage} 点${DamageTypes[spell.damageType]?.name || spell.damageType}伤害！`;
      this._addLog('spell_auto', result.message, result);
      this.emit('SPELL_CAST', result);
      return result;
    }

    // 需要攻击检定的法术
    if (spell.attackRoll) {
      targets.forEach(targetId => {
        const target = this.combatants.find(c => c.id === targetId);
        if (!target || target.hp <= 0) return;

        const spellAttackBonus = caster.spellAttackMod || (this._getAbilityMod(caster, 'int') + (caster.proficiencyBonus || 2));
        const attackResult = this.attack(casterId, targetId, {
          attackBonus: spellAttackBonus,
          weaponDamage: spell.damage,
          damageType: spell.damageType,
        });

        result.targets.push({
          target: target.name,
          targetId: target.id,
          ...attackResult,
        });

        if (attackResult.hit) {
          result.totalDamage += attackResult.damageResult?.actualDamage || 0;

          // 寒冰射线减速效果
          if (spell.slowOnHit && attackResult.hit) {
            this.applyCondition(targetId, 'restrained', 1);
          }
        }
      });

      result.message = `${caster.name} 施放了 ${spellName}！`;
      this._addLog('spell_attack', result.message, result);
      this.emit('SPELL_CAST', result);
      return result;
    }

    // 需要豁免检定的法术（AOE或单体）
    if (spell.saveType) {
      const saveDC = spell.saveDC || caster.spellDC || (8 + this._getAbilityMod(caster, 'int') + (caster.proficiencyBonus || 2));

      targets.forEach(targetId => {
        const target = this.combatants.find(c => c.id === targetId);
        if (!target || target.hp <= 0) return;

        // 获取豁免属性调整值
        const saveAbilityMap = {
          str: 'str', dex: 'dex', con: 'con',
          int: 'int', wis: 'wis', cha: 'cha',
        };
        const saveAbility = saveAbilityMap[spell.saveType] || spell.saveType;
        let saveMod = this._getAbilityMod(target, saveAbility);

        // 豁免熟练加值
        if (target.savingThrowProficiencies && target.savingThrowProficiencies.includes(saveAbility)) {
          saveMod += target.proficiencyBonus || 2;
        }

        // 麻痹/昏迷/石化 -> 力量/敏捷豁免自动失败
        const autoFail = (spell.saveType === 'str' || spell.saveType === 'dex') &&
          (this.hasCondition(target.id, 'paralyzed') ||
           this.hasCondition(target.id, 'stunned') ||
           this.hasCondition(target.id, 'unconscious') ||
           this.hasCondition(target.id, 'petrified'));

        let saveRoll, saveTotal, saveSuccess;
        if (autoFail) {
          saveRoll = 1;
          saveTotal = saveMod + 1;
          saveSuccess = false;
        } else {
          // 束缚状态 -> 力量/敏捷豁免劣势
          const hasDisadvantage = (spell.saveType === 'str' || spell.saveType === 'dex') &&
            this.hasCondition(target.id, 'restrained');

          if (hasDisadvantage) {
            const disadvResult = dice.rollWithAdvantage(true);
            saveRoll = disadvResult.selected;
          } else {
            saveRoll = dice.roll(20);
          }
          saveTotal = saveRoll + saveMod;
          saveSuccess = saveTotal >= saveDC;
        }

        // 计算伤害
        let damage = 0;
        let damageResult = null;

        if (spell.damage) {
          // 升环伤害
          let damageExpr = spell.damage;
          const baseLevel = spell.level || 1;
          if (spellLevel > baseLevel) {
            const extraLevels = spellLevel - baseLevel;
            // 每升一环增加一个基础伤害骰
            const baseDiceMatch = damageExpr.match(/^(\d+)d(\d+)/);
            if (baseDiceMatch) {
              const newCount = parseInt(baseDiceMatch[1]) + extraLevels;
              damageExpr = `${newCount}d${baseDiceMatch[2]}`;
            }
          }

          const dmgRoll = dice.rollExpression(damageExpr);
          const rawDamage = dmgRoll.total;

          // 豁免成功减半
          const finalDamage = (saveSuccess && spell.halfDamageOnSave) ? Math.floor(rawDamage / 2) : rawDamage;

          damageResult = this._dealDamage(target, finalDamage, spell.damageType);
          damage = damageResult.actualDamage;
          result.totalDamage += damage;
        }

        // 豁免失败附加效果
        let effectApplied = null;
        if (!saveSuccess) {
          if (spell.stunOnFail) {
            this.applyCondition(targetId, 'stunned', 1);
            effectApplied = 'stunned';
          }
          if (spell.applyCondition) {
            this.applyCondition(targetId, spell.applyCondition, spell.duration ? parseInt(spell.duration) : 10);
            effectApplied = spell.applyCondition;
          }
        }

        result.targets.push({
          target: target.name,
          targetId: target.id,
          saveType: spell.saveType,
          saveDC,
          saveRoll,
          saveMod,
          saveTotal,
          saveSuccess,
          damage,
          damageResult,
          effectApplied,
        });
      });

      result.message = `${caster.name} 施放了 ${spellName}（DC ${saveDC}）！`;
      if (result.totalDamage > 0) {
        result.message += ` 造成 ${result.totalDamage} 点${DamageTypes[spell.damageType]?.name || ''}伤害。`;
      }
      this._addLog('spell_save', result.message, result);
      this.emit('SPELL_CAST', result);
      return result;
    }

    // Buff 法术
    if (spell.applyCondition && !spell.damage && !spell.saveType) {
      targets.forEach(targetId => {
        const target = this.combatants.find(c => c.id === targetId);
        if (!target) return;

        this.applyCondition(targetId, spell.applyCondition, spell.duration ? parseInt(spell.duration) : 10);

        result.targets.push({
          target: target.name,
          targetId: target.id,
          conditionApplied: spell.applyCondition,
        });
      });

      // 集中注意力
      if (spell.concentration) {
        this.concentrationTracker[casterId] = {
          spellName,
          spellLevel,
        };
        this.applyCondition(casterId, 'concentrating', -1);
      }

      result.message = `${caster.name} 施放了 ${spellName}！`;
      this._addLog('spell_buff', result.message, result);
      this.emit('SPELL_CAST', result);
      return result;
    }

    // 通用法术结果
    result.message = `${caster.name} 施放了 ${spellName}！`;
    this._addLog('spell', result.message, result);
    this.emit('SPELL_CAST', result);
    return result;
  }

  // ============================================================
  // 5. 使用特殊能力
  // ============================================================

  /**
   * 使用特殊能力
   * @param {string} combatantId - 使用者ID
   * @param {string} abilityName - 能力名称
   * @param {string} [targetId] - 目标ID（可选）
   * @returns {object} 使用结果
   */
  useAbility(combatantId, abilityName, targetId = null) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant) return { success: false, message: '无效的单位' };

    if (combatant.hp <= 0) {
      return { success: false, message: `${combatant.name} 已倒地，无法使用能力` };
    }

    const ability = AbilityData[abilityName];
    if (!ability) {
      return { success: false, message: `未知能力: ${abilityName}` };
    }

    const dice = this._getDice();
    const result = {
      success: true,
      combatant: combatant.name,
      combatantId,
      ability: abilityName,
    };

    switch (abilityName) {
      case '狂暴': {
        // 野蛮人狂暴
        if (this.hasCondition(combatantId, 'raging')) {
          return { success: false, message: `${combatant.name} 已经在狂暴中了` };
        }
        this.applyCondition(combatantId, 'raging', ability.duration);
        result.message = `${combatant.name} 进入狂暴状态！获得钝击/穿刺/挥砍抗性和力量检定优势。`;
        break;
      }

      case '神圣愤怒': {
        // 圣武士神圣愤怒
        if (!targetId) return { success: false, message: '神圣愤怒需要指定目标' };
        const target = this.combatants.find(c => c.id === targetId);
        if (!target) return { success: false, message: '无效目标' };

        const paladinLevel = combatant.level || 1;
        const dmgExpr = ability.damage.replace('paladinLevel', paladinLevel);
        const dmgRoll = dice.rollExpression(dmgExpr);
        let totalDmg = dmgRoll.total;

        // 对亡灵额外伤害
        if (target.creatureType === 'undead') {
          totalDmg *= 2;
          result.againstUndead = true;
        }

        const damageResult = this._dealDamage(target, totalDmg, ability.damageType);
        result.target = target.name;
        result.damage = damageResult.actualDamage;
        result.damageResult = damageResult;
        result.message = `${combatant.name} 释放神圣愤怒对 ${target.name} 造成 ${damageResult.actualDamage} 点光耀伤害！`;
        break;
      }

      case '猎人印记': {
        // 游侠猎人印记
        if (!targetId) return { success: false, message: '猎人印记需要指定目标' };
        const target = this.combatants.find(c => c.id === targetId);
        if (!target) return { success: false, message: '无效目标' };

        // 如果已有集中，先移除旧效果
        if (this.concentrationTracker[combatantId]) {
          const oldSpell = this.concentrationTracker[combatantId].spellName;
          this.removeCondition(combatantId, 'concentrating');
          this.removeEffectByConcentration(combatantId);
          delete this.concentrationTracker[combatantId];
          result.previousConcentration = oldSpell;
        }

        this.concentrationTracker[combatantId] = {
          spellName: '猎人印记',
          targetId,
        };
        this.applyCondition(combatantId, 'concentrating', -1);

        // 给目标添加标记效果
        if (!target.activeEffects) target.activeEffects = [];
        target.activeEffects.push({
          name: '猎人印记',
          source: combatantId,
          bonusDamage: ability.bonusDamage,
          damageType: ability.damageType,
          requiresConcentration: true,
        });

        result.target = target.name;
        result.message = `${combatant.name} 对 ${target.name} 施放了猎人印记！`;
        break;
      }

      case '二次打击': {
        // 战士二次打击 - 返回额外攻击标记
        result.extraAttacks = ability.extraAttack;
        result.message = `${combatant.name} 发动二次打击，可以进行 ${ability.extraAttack} 次攻击！`;
        break;
      }

      case '动作如潮': {
        // 战士动作如潮
        if (!combatant.actions) combatant.actions = {};
        combatant.actions.surgeUsed = true;
        result.extraAction = true;
        result.message = `${combatant.name} 爆发动作如潮！本回合获得额外动作！`;
        break;
      }

      case '圣疗术': {
        // 圣武士圣疗术
        const paladinLevel = combatant.level || 1;
        const healAmount = 5 + paladinLevel * 5;
        const healTarget = targetId
          ? this.combatants.find(c => c.id === targetId)
          : combatant;

        if (!healTarget) return { success: false, message: '无效的治疗目标' };

        const maxHP = healTarget.maxHp || healTarget.maxHP;
        const actualHeal = Math.min(healAmount, maxHP - healTarget.hp);
        healTarget.hp = Math.min(maxHP, healTarget.hp + healAmount);
        this.statistics.totalHealing += actualHeal;

        result.target = healTarget.name;
        result.healAmount = actualHeal;
        result.message = `${combatant.name} 使用圣疗术，为 ${healTarget.name} 恢复了 ${actualHeal} 点生命值！`;
        break;
      }

      default: {
        return { success: false, message: `能力 "${abilityName}" 尚未实现` };
      }
    }

    this._addLog('ability', result.message, result);
    this.emit('ABILITY_USED', result);
    return result;
  }

  // ============================================================
  // 6. 移动
  // ============================================================

  /**
   * 移动
   * @param {string} combatantId - 单位ID
   * @param {number} distance - 移动距离（尺）
   * @returns {object} 移动结果
   */
  move(combatantId, distance) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant) return { success: false, message: '无效的单位' };

    if (combatant.hp <= 0) {
      return { success: false, message: `${combatant.name} 已倒地，无法移动` };
    }

    // 检查是否能移动
    if (this.hasCondition(combatantId, 'paralyzed') ||
        this.hasCondition(combatantId, 'stunned') ||
        this.hasCondition(combatantId, 'unconscious') ||
        this.hasCondition(combatantId, 'petrified') ||
        this.hasCondition(combatantId, 'restrained') ||
        this.hasCondition(combatantId, 'grappled')) {
      return { success: false, message: `${combatant.name} 无法移动` };
    }

    // 计算可用移动力
    let speed = combatant.speed || 30;

    // 冲刺加成
    if (combatant._dashBonus) {
      speed += combatant._dashBonus;
    }

    // 本回合已移动距离
    const moved = combatant.distanceMoved || 0;
    const remaining = speed - moved;

    if (distance > remaining) {
      return {
        success: false,
        message: `${combatant.name} 移动力不足（剩余 ${remaining} 尺，尝试移动 ${distance} 尺）`,
        remaining,
        requested: distance,
      };
    }

    // 执行移动
    combatant.distanceMoved = moved + distance;
    combatant.position = (combatant.position || 0) + distance;

    const result = {
      success: true,
      combatant: combatant.name,
      combatantId,
      distance,
      totalMoved: combatant.distanceMoved,
      speed,
      remaining: speed - combatant.distanceMoved,
      position: combatant.position,
    };

    this._addLog('move', `${combatant.name} 移动了 ${distance} 尺`, result);
    return result;
  }

  // ============================================================
  // 7. 冲刺
  // ============================================================

  /**
   * 冲刺 - 使用动作获得额外移动距离
   * @param {string} combatantId - 单位ID
   * @returns {object} 冲刺结果
   */
  dash(combatantId) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant) return { success: false, message: '无效的单位' };

    if (combatant.hp <= 0) {
      return { success: false, message: `${combatant.name} 已倒下` };
    }

    // 消耗动作
    if (!combatant.actions) combatant.actions = {};
    if (!combatant.actions.attack) {
      return { success: false, message: `${combatant.name} 本回合已使用过动作` };
    }
    combatant.actions.attack = false;

    // 额外获得等于速度的移动距离
    const speed = combatant.speed || 30;
    combatant._dashBonus = speed;

    const result = {
      success: true,
      combatant: combatant.name,
      combatantId,
      extraSpeed: speed,
      totalSpeed: speed * 2,
      message: `${combatant.name} 冲刺！本回合移动速度翻倍为 ${speed * 2} 尺。`,
    };

    this._addLog('dash', result.message, result);
    this.emit('ACTION_USED', { combatantId, action: 'dash' });
    return result;
  }

  // ============================================================
  // 8. 脱离
  // ============================================================

  /**
   * 脱离 - 本回合不触发借机攻击
   * @param {string} combatantId - 单位ID
   * @returns {object}
   */
  disengage(combatantId) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant) return { success: false, message: '无效的单位' };

    if (combatant.hp <= 0) {
      return { success: false, message: `${combatant.name} 已倒下` };
    }

    // 消耗动作
    if (!combatant.actions) combatant.actions = {};
    if (!combatant.actions.attack) {
      return { success: false, message: `${combatant.name} 本回合已使用过动作` };
    }
    combatant.actions.attack = false;

    // 标记脱离状态
    combatant.disengaged = true;

    const result = {
      success: true,
      combatant: combatant.name,
      combatantId,
      message: `${combatant.name} 采取脱离战术，本回合移动不会触发借机攻击。`,
    };

    this._addLog('disengage', result.message, result);
    this.emit('ACTION_USED', { combatantId, action: 'disengage' });
    return result;
  }

  // ============================================================
  // 9. 闪避
  // ============================================================

  /**
   * 闪避 - 获得闪避状态
   * @param {string} combatantId - 单位ID
   * @returns {object}
   */
  dodge(combatantId) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant) return { success: false, message: '无效的单位' };

    if (combatant.hp <= 0) {
      return { success: false, message: `${combatant.name} 已倒下` };
    }

    // 消耗动作
    if (!combatant.actions) combatant.actions = {};
    if (!combatant.actions.attack) {
      return { success: false, message: `${combatant.name} 本回合已使用过动作` };
    }
    combatant.actions.attack = false;

    // 施加闪避状态（持续到下回合开始）
    this.applyCondition(combatantId, 'dodging', 0);

    const result = {
      success: true,
      combatant: combatant.name,
      combatantId,
      message: `${combatant.name} 采取闪避姿态！敏捷豁免优势，被攻击时对手劣势。`,
    };

    this._addLog('dodge', result.message, result);
    this.emit('ACTION_USED', { combatantId, action: 'dodge' });
    return result;
  }

  // ============================================================
  // 10. 防御
  // ============================================================

  /**
   * 防御 - AC+2
   * @param {string} combatantId - 单位ID
   * @returns {object}
   */
  defend(combatantId) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant) return { success: false, message: '无效的单位' };

    if (combatant.hp <= 0) {
      return { success: false, message: `${combatant.name} 已倒下` };
    }

    // 消耗动作
    if (!combatant.actions) combatant.actions = {};
    if (!combatant.actions.attack) {
      return { success: false, message: `${combatant.name} 本回合已使用过动作` };
    }
    combatant.actions.attack = false;

    // 施加防御状态
    this.applyCondition(combatantId, 'defending', 0);

    const result = {
      success: true,
      combatant: combatant.name,
      combatantId,
      acBonus: 2,
      newAC: this._getEffectiveAC(combatant),
      message: `${combatant.name} 采取防御姿态！AC+2（当前AC: ${this._getEffectiveAC(combatant)}）。`,
    };

    this._addLog('defend', result.message, result);
    this.emit('ACTION_USED', { combatantId, action: 'defend' });
    return result;
  }

  // ============================================================
  // 11. 隐藏
  // ============================================================

  /**
   * 隐藏 - 进行隐匿检定
   * @param {string} combatantId - 单位ID
   * @returns {object}
   */
  hide(combatantId) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant) return { success: false, message: '无效的单位' };

    if (combatant.hp <= 0) {
      return { success: false, message: `${combatant.name} 已倒下` };
    }

    // 消耗动作
    if (!combatant.actions) combatant.actions = {};
    if (!combatant.actions.attack) {
      return { success: false, message: `${combatant.name} 本回合已使用过动作` };
    }
    combatant.actions.attack = false;

    const dice = this._getDice();
    const dexMod = this._getAbilityMod(combatant, 'dex');
    const stealthBonus = combatant.stealthBonus || 0;
    let roll = dice.roll(20);
    let total = roll + dexMod + stealthBonus;

    // 检查是否有优势（隐形时隐匿优势）
    let advantageUsed = false;
    if (this.hasCondition(combatantId, 'invisible')) {
      const advRoll = dice.rollWithAdvantage(false);
      const newTotal = advRoll.selected + dexMod + stealthBonus;
      if (newTotal > total) {
        roll = advRoll.selected;
        total = newTotal;
        advantageUsed = true;
      }
    }

    // 施加潜行状态
    this.applyCondition(combatantId, 'sneaking', 0);
    combatant._stealthTotal = total;

    const result = {
      success: true,
      combatant: combatant.name,
      combatantId,
      roll,
      dexMod,
      stealthBonus,
      total,
      advantageUsed,
      message: `${combatant.name} 尝试隐藏（隐匿检定: ${roll}${dexMod >= 0 ? '+' : ''}${dexMod}${stealthBonus >= 0 ? '+' : ''}${stealthBonus} = ${total}）`,
    };

    this._addLog('hide', result.message, result);
    this.emit('ACTION_USED', { combatantId, action: 'hide' });
    return result;
  }

  // ============================================================
  // 12. 援助
  // ============================================================

  /**
   * 援助 - 给盟友攻击优势
   * @param {string} combatantId - 援助者ID
   * @param {string} targetId - 被援助的盟友ID
   * @returns {object}
   */
  help(combatantId, targetId) {
    const helper = this.combatants.find(c => c.id === combatantId);
    const target = this.combatants.find(c => c.id === targetId);

    if (!helper || !target) {
      return { success: false, message: '无效的单位' };
    }

    if (helper.hp <= 0) {
      return { success: false, message: `${helper.name} 已倒下` };
    }

    // 消耗动作
    if (!helper.actions) helper.actions = {};
    if (!helper.actions.attack) {
      return { success: false, message: `${helper.name} 本回合已使用过动作` };
    }
    helper.actions.attack = false;

    // 检查是否能互相看到（简化处理）
    if (this.hasCondition(combatantId, 'blinded') || this.hasCondition(combatantId, 'invisible')) {
      return { success: false, message: `${helper.name} 无法提供援助` };
    }

    // 给目标添加援助优势标记
    if (!target.activeEffects) target.activeEffects = [];
    target.activeEffects.push({
      name: '援助',
      source: combatantId,
      attackAdvantage: true,
      duration: 1, // 持续到目标下回合结束
    });

    const result = {
      success: true,
      helper: helper.name,
      helperId: combatantId,
      target: target.name,
      targetId,
      message: `${helper.name} 援助 ${target.name}！${target.name} 下次攻击获得优势。`,
    };

    this._addLog('help', result.message, result);
    this.emit('ACTION_USED', { combatantId, action: 'help' });
    return result;
  }

  // ============================================================
  // 13. 擒抱
  // ============================================================

  /**
   * 擒抱
   * @param {string} attackerId - 攻击方ID
   * @param {string} defenderId - 防御方ID
   * @returns {object}
   */
  grapple(attackerId, defenderId) {
    const attacker = this.combatants.find(c => c.id === attackerId);
    const defender = this.combatants.find(c => c.id === defenderId);

    if (!attacker || !defender) {
      return { success: false, message: '无效的单位' };
    }

    if (attacker.hp <= 0 || defender.hp <= 0) {
      return { success: false, message: '单位已倒下' };
    }

    // 攻击方需要至少有一只空闲的手（简化处理：体型不超过目标体型+1）
    if (attacker.size && defender.size) {
      const sizeOrder = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'];
      const attackerSize = sizeOrder.indexOf(attacker.size);
      const defenderSize = sizeOrder.indexOf(defender.size);
      if (attackerSize < 0 || defenderSize < 0 || attackerSize < defenderSize - 1) {
        return { success: false, message: `${attacker.name} 无法擒抱比自身大太多的目标` };
      }
    }

    // 不能擒抱比自己大两级的生物
    if (attacker.size && defender.size) {
      const sizeOrder = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'];
      if (sizeOrder.indexOf(defender.size) >= sizeOrder.indexOf(attacker.size) + 2) {
        return { success: false, message: `${defender.name} 体型太大，无法擒抱` };
      }
    }

    const dice = this._getDice();

    // 攻击方：运动（力量）检定
    const attackerAthletics = this._getAbilityMod(attacker, 'str') +
      (attacker.skillProficiencies?.includes('athletics') ? (attacker.proficiencyBonus || 2) : 0);
    const attackerRoll = dice.roll(20);
    const attackerTotal = attackerRoll + attackerAthletics;

    // 防御方选择：运动或体操（取高）
    const defenderAthletics = this._getAbilityMod(defender, 'str') +
      (defender.skillProficiencies?.includes('athletics') ? (defender.proficiencyBonus || 2) : 0);
    const defenderAcrobatics = this._getAbilityMod(defender, 'dex') +
      (defender.skillProficiencies?.includes('acrobatics') ? (defender.proficiencyBonus || 2) : 0);

    // 防御方自动失败条件
    const autoFail = this.hasCondition(defenderId, 'paralyzed') ||
      this.hasCondition(defenderId, 'stunned') ||
      this.hasCondition(defenderId, 'unconscious') ||
      this.hasCondition(defenderId, 'grappled');

    let defenderTotal;
    let defenderSkill;
    if (autoFail) {
      defenderTotal = 0;
      defenderSkill = '自动失败';
    } else {
      // AI自动选择更高的技能
      defenderSkill = defenderAthletics >= defenderAcrobatics ? '运动' : '体操';
      const defenderMod = Math.max(defenderAthletics, defenderAcrobatics);
      const defenderRoll = dice.roll(20);
      defenderTotal = defenderRoll + defenderMod;
    }

    const success = attackerTotal >= defenderTotal;

    const result = {
      success,
      attacker: attacker.name,
      attackerId,
      defender: defender.name,
      defenderId,
      attackerRoll,
      attackerTotal,
      attackerSkill: '运动',
      defenderSkill,
      defenderTotal,
    };

    if (success) {
      this.applyCondition(defenderId, 'grappled', -1);
      result.message = `${attacker.name} 成功擒抱了 ${defender.name}！（${attackerTotal} vs ${defenderTotal}）`;
    } else {
      result.message = `${attacker.name} 未能擒抱 ${defender.name}（${attackerTotal} vs ${defenderTotal}）`;
    }

    this._addLog('grapple', result.message, result);
    return result;
  }

  // ============================================================
  // 14. 推撞
  // ============================================================

  /**
   * 推撞 - 推开或击倒目标
   * @param {string} attackerId - 攻击方ID
   * @param {string} defenderId - 防御方ID
   * @param {string} pushType - 推撞类型 ('push' 推开 / 'prone' 击倒)
   * @returns {object}
   */
  shove(attackerId, defenderId, pushType = 'push') {
    const attacker = this.combatants.find(c => c.id === attackerId);
    const defender = this.combatants.find(c => c.id === defenderId);

    if (!attacker || !defender) {
      return { success: false, message: '无效的单位' };
    }

    if (attacker.hp <= 0 || defender.hp <= 0) {
      return { success: false, message: '单位已倒下' };
    }

    const dice = this._getDice();

    // 运动检定 vs 运动 or 体操
    const attackerAthletics = this._getAbilityMod(attacker, 'str') +
      (attacker.skillProficiencies?.includes('athletics') ? (attacker.proficiencyBonus || 2) : 0);
    const attackerRoll = dice.roll(20);
    const attackerTotal = attackerRoll + attackerAthletics;

    const autoFail = this.hasCondition(defenderId, 'paralyzed') ||
      this.hasCondition(defenderId, 'stunned') ||
      this.hasCondition(defenderId, 'unconscious');

    let defenderTotal;
    if (autoFail) {
      defenderTotal = 0;
    } else {
      const defenderAthletics = this._getAbilityMod(defender, 'str') +
        (defender.skillProficiencies?.includes('athletics') ? (defender.proficiencyBonus || 2) : 0);
      const defenderAcrobatics = this._getAbilityMod(defender, 'dex') +
        (defender.skillProficiencies?.includes('acrobatics') ? (defender.proficiencyBonus || 2) : 0);
      const defenderMod = Math.max(defenderAthletics, defenderAcrobatics);
      const defenderRoll = dice.roll(20);
      defenderTotal = defenderRoll + defenderMod;
    }

    const success = attackerTotal >= defenderTotal;

    const result = {
      success,
      attacker: attacker.name,
      attackerId,
      defender: defender.name,
      defenderId,
      pushType,
      attackerRoll,
      attackerTotal,
      defenderTotal,
    };

    if (success) {
      if (pushType === 'prone') {
        this.applyCondition(defenderId, 'prone', 0);
        result.message = `${attacker.name} 将 ${defender.name} 击倒在地！（${attackerTotal} vs ${defenderTotal}）`;
      } else {
        // 推开5尺
        defender.position = (defender.position || 0) + 5;
        result.pushDistance = 5;
        result.message = `${attacker.name} 将 ${defender.name} 推开了 5 尺！（${attackerTotal} vs ${defenderTotal}）`;
      }
    } else {
      result.message = `${attacker.name} 未能推撞 ${defender.name}（${attackerTotal} vs ${defenderTotal}）`;
    }

    this._addLog('shove', result.message, result);
    return result;
  }

  // ============================================================
  // 15. 借机攻击
  // ============================================================

  /**
   * 借机攻击 - 当敌人离开触及范围时触发
   * @param {string} attackerId - 攻击方ID
   * @param {string} defenderId - 离开的单位ID
   * @returns {object}
   */
  opportunityAttack(attackerId, defenderId) {
    const attacker = this.combatants.find(c => c.id === attackerId);
    const defender = this.combatants.find(c => c.id === defenderId);

    if (!attacker || !defender) {
      return { success: false, message: '无效的单位' };
    }

    // 检查攻击方是否可以使用反应
    if (!attacker.actions || !attacker.actions.reaction) {
      return { success: false, message: `${attacker.name} 本回合已使用过反应` };
    }

    // 检查防御方是否脱离
    if (defender.disengaged) {
      return { success: false, message: `${defender.name} 采取了脱离战术，不触发借机攻击` };
    }

    // 检查攻击方是否能行动
    if (this.hasCondition(attackerId, 'incapacitated') ||
        this.hasCondition(attackerId, 'paralyzed') ||
        this.hasCondition(attackerId, 'stunned') ||
        this.hasCondition(attackerId, 'unconscious')) {
      return { success: false, message: `${attacker.name} 无法进行借机攻击` };
    }

    // 消耗反应
    attacker.actions.reaction = false;

    // 执行一次攻击
    const attackBonus = attacker.attackBonus || (this._getAbilityMod(attacker, 'str') + (attacker.proficiencyBonus || 2));
    const weaponDamage = attacker.weaponDamage || '1d6';
    const damageType = attacker.weaponDamageType || 'slashing';

    const attackResult = this.attack(attackerId, defenderId, {
      attackBonus,
      weaponDamage,
      damageType,
      reaction: true,
    });

    attackResult.isOpportunityAttack = true;
    attackResult.message = `[借机攻击] ${attackResult.message}`;

    this._addLog('opportunity_attack', attackResult.message, attackResult);
    this.emit('OPPORTUNITY_ATTACK', attackResult);
    return attackResult;
  }

  // ============================================================
  // 16. 反应攻击
  // ============================================================

  /**
   * 反应攻击 - 如圣武士守护之刃
   * @param {string} attackerId - 反应攻击者ID
   * @param {string} defenderId - 被攻击的目标ID
   * @param {object} options - 选项
   * @param {string} options.abilityName - 触发的能力名称
   * @param {number} options.attackBonus - 攻击加值
   * @param {string} options.weaponDamage - 武器伤害骰
   * @param {string} options.damageType - 伤害类型
   * @returns {object}
   */
  reactionAttack(attackerId, defenderId, options = {}) {
    const {
      abilityName = '反应攻击',
      attackBonus: bonusAttackBonus = 0,
      weaponDamage: bonusWeaponDamage = null,
      damageType: bonusDamageType = 'slashing',
    } = options;

    const attacker = this.combatants.find(c => c.id === attackerId);
    const defender = this.combatants.find(c => c.id === defenderId);

    if (!attacker || !defender) {
      return { success: false, message: '无效的单位' };
    }

    // 检查反应
    if (!attacker.actions || !attacker.actions.reaction) {
      return { success: false, message: `${attacker.name} 本回合已使用过反应` };
    }

    // 消耗反应
    attacker.actions.reaction = false;

    const attackBonus = bonusAttackBonus || attacker.attackBonus ||
      (this._getAbilityMod(attacker, 'str') + (attacker.proficiencyBonus || 2));
    const weaponDamage = bonusWeaponDamage || attacker.weaponDamage || '1d6';
    const damageType = bonusDamageType || attacker.weaponDamageType || 'slashing';

    const attackResult = this.attack(attackerId, defenderId, {
      attackBonus,
      weaponDamage,
      damageType,
      reaction: true,
    });

    attackResult.abilityName = abilityName;
    attackResult.isReactionAttack = true;
    attackResult.message = `[${abilityName}] ${attackResult.message}`;

    this._addLog('reaction_attack', attackResult.message, attackResult);
    this.emit('REACTION_ATTACK', attackResult);
    return attackResult;
  }

  // ============================================================
  // 17. 结束回合
  // ============================================================

  /**
   * 结束当前回合
   * @returns {object} 新的战斗状态
   */
  endTurn() {
    const currentCombatant = this.combatants[this.currentTurn];
    if (!currentCombatant) {
      return this.getCurrentState();
    }

    // 1. 处理持续伤害
    this._processOngoingEffects(currentCombatant);

    // 2. 移除回合结束时消失的状态
    this._expireTurnEndConditions(currentCombatant);

    // 3. 重置回合状态
    currentCombatant.distanceMoved = 0;
    currentCombatant.disengaged = false;
    currentCombatant.hasActed = false;
    currentCombatant._dashBonus = 0;
    currentCombatant._shieldBonus = 0;

    // 4. 重置动作
    if (currentCombatant.actions) {
      currentCombatant.actions = {
        attack: true,
        spell: true,
        move: true,
        bonus: true,
        reaction: true,
      };
    }

    this._addLog('turn_end', `${currentCombatant.name} 结束了回合`, {
      combatantId: currentCombatant.id,
    });

    // 5. 推进到下一个存活单位
    this._advanceToNextCombatant();

    // 6. 检查战斗是否结束
    if (this.isCombatOver()) {
      return this.endCombat();
    }

    // 7. 如果新回合开始，处理轮开始效果
    if (this.currentTurn === 0) {
      this._addLog('round_start', `第 ${this.round} 轮开始`, { round: this.round });
      this._processRoundStart();
    }

    // 8. 处理惊喜轮
    const nextCombatant = this.combatants[this.currentTurn];
    if (this.surpriseRound && nextCombatant) {
      if (this.surprisedCombatants.includes(nextCombatant.id)) {
        // 被惊喜的单位跳过回合
        this._addLog('surprise_skip', `${nextCombatant.name} 被惊喜，跳过回合`, {
          combatantId: nextCombatant.id,
        });
        return this.endTurn(); // 递归跳过
      }
    }

    // 9. 新回合开始时移除该单位回合开始时消失的状态
    if (nextCombatant) {
      this._expireTurnStartConditions(nextCombatant);
    }

    this.emit('TURN_START', {
      combatant: nextCombatant,
      round: this.round,
      turn: this.currentTurn,
    });

    return this.getCurrentState();
  }

  /**
   * 处理持续效果（持续伤害等）
   * @param {object} combatant - 参战单位
   */
  _processOngoingEffects(combatant) {
    if (!combatant.activeEffects) return;

    const effectsToRemove = [];

    combatant.activeEffects.forEach((effect, index) => {
      // 持续伤害处理
      if (effect.ongoingDamage) {
        const dice = this._getDice();
        const dmgRoll = dice.rollExpression(effect.ongoingDamage);
        const damageResult = this._dealDamage(combatant, dmgRoll.total, effect.damageType || 'fire');

        this._addLog('ongoing_damage', `${combatant.name} 受到 ${effect.name} 的持续伤害: ${damageResult.actualDamage}`, {
          combatantId: combatant.id,
          effect: effect.name,
          damage: damageResult.actualDamage,
        });
      }

      // 更新持续时间
      if (effect.duration > 0) {
        effect.duration--;
        if (effect.duration <= 0) {
          effectsToRemove.push(index);
        }
      }
    });

    // 移除过期效果（从后往前删除）
    effectsToRemove.reverse().forEach(index => {
      const removed = combatant.activeEffects.splice(index, 1)[0];
      if (removed.onExpire) {
        removed.onExpire(combatant);
      }
    });
  }

  /**
   * 处理轮开始效果
   */
  _processRoundStart() {
    this.combatants.forEach(combatant => {
      if (combatant.hp <= 0) return;

      // 更新状态持续时间
      if (combatant.conditions && combatant.conditions.length > 0) {
        const toRemove = [];

        combatant.conditions.forEach((cond, index) => {
          if (cond.duration > 0) {
            cond.duration--;
            if (cond.duration <= 0) {
              toRemove.push(index);
            }
          }
        });

        toRemove.reverse().forEach(index => {
          const removed = combatant.conditions.splice(index, 1)[0];
          this._addLog('condition_expire', `${combatant.name} 的 ${removed.name} 效果消失了`, {
            combatantId: combatant.id,
            condition: removed.name,
          });
        });
      }
    });
  }

  /**
   * 回合结束时移除条件
   * @param {object} combatant
   */
  _expireTurnEndConditions(combatant) {
    if (!combatant.conditions) return;

    // 移除持续时间为0的条件（本回合结束消失）
    const toRemove = [];
    combatant.conditions.forEach((cond, index) => {
      if (cond.duration === 0) {
        toRemove.push(index);
      }
    });

    toRemove.reverse().forEach(index => {
      const removed = combatant.conditions.splice(index, 1)[0];
      this._addLog('condition_expire', `${combatant.name} 的 ${removed.name} 效果消失了`, {
        combatantId: combatant.id,
        condition: removed.name,
      });
    });
  }

  /**
   * 回合开始时移除条件
   * @param {object} combatant
   */
  _expireTurnStartConditions(combatant) {
    // 某些效果在回合开始时消失（如护盾术）
    // 这里可以添加特定逻辑
  }

  /**
   * 推进到下一个存活的参战单位
   */
  _advanceToNextCombatant() {
    const totalCombatants = this.combatants.length;
    let nextTurn = this.currentTurn + 1;

    // 循环查找下一个存活单位
    let loopCount = 0;
    while (loopCount < totalCombatants) {
      if (nextTurn >= totalCombatants) {
        nextTurn = 0;
        this.round++;
        this.statistics.roundsElapsed = this.round - 1;

        // 第一轮结束后取消惊喜轮
        if (this.surpriseRound && this.round > 1) {
          this.surpriseRound = false;
          this.surprisedCombatants = [];
          this._addLog('surprise_end', '惊喜轮结束');
        }
      }

      const nextCombatant = this.combatants[nextTurn];
      if (nextCombatant && nextCombatant.hp > 0) {
        this.currentTurn = nextTurn;
        return;
      }

      nextTurn++;
      loopCount++;
    }

    // 所有单位倒下
    this.currentTurn = 0;
  }

  // ============================================================
  // 18. 逃跑
  // ============================================================

  /**
   * 逃跑 - DC 12 + 敌人数量修正
   * @param {string} characterId - 逃跑角色ID
   * @returns {object}
   */
  flee(characterId) {
    const character = this.combatants.find(c => c.id === characterId);
    if (!character) {
      return { success: false, message: '无效的角色' };
    }

    if (character.hp <= 0) {
      return { success: false, message: `${character.name} 已倒下，无法逃跑` };
    }

    // 束缚/麻痹/昏迷无法逃跑
    if (this.hasCondition(characterId, 'restrained') ||
        this.hasCondition(characterId, 'paralyzed') ||
        this.hasCondition(characterId, 'stunned') ||
        this.hasCondition(characterId, 'unconscious') ||
        this.hasCondition(characterId, 'grappled')) {
      return { success: false, message: `${character.name} 被束缚，无法逃跑！` };
    }

    const dice = this._getDice();
    const dexMod = this._getAbilityMod(character, 'dex');
    const roll = dice.roll(20);
    const total = roll + dexMod;

    // DC = 12 + 存活敌人数量修正
    const aliveEnemies = this.getEnemies();
    const enemyCountMod = Math.max(0, Math.floor(aliveEnemies.length / 2));
    const dc = 12 + enemyCountMod;

    const success = total >= dc;

    // 逃跑需要消耗动作和移动
    if (character.actions) {
      character.actions.attack = false;
      character.actions.move = false;
    }

    const result = {
      success,
      character: character.name,
      characterId,
      roll,
      dexMod,
      total,
      dc,
      enemyCountMod,
      message: success
        ? `${character.name} 成功逃离了战斗！（${total} vs DC ${dc}）`
        : `${character.name} 逃跑失败！（${total} vs DC ${dc}）`,
    };

    if (success) {
      // 触发借机攻击
      aliveEnemies.forEach(enemy => {
        if (enemy.reach && enemy.position) {
          // 简化：假设敌人在触及范围内
          const oppResult = this.opportunityAttack(enemy.id, characterId);
          if (oppResult.success && oppResult.hit) {
            result.opportunityAttacks = result.opportunityAttacks || [];
            result.opportunityAttacks.push(oppResult);
          }
        }
      });

      // 从战斗中移除
      const index = this.combatants.findIndex(c => c.id === characterId);
      if (index >= 0) {
        this.combatants.splice(index, 1);
        if (this.currentTurn >= this.combatants.length) {
          this.currentTurn = 0;
        }
      }

      this._addLog('flee', result.message, result);
      this.emit('COMBATANT_FLED', { characterId, character: character.name });

      // 检查战斗是否结束
      if (this.isCombatOver()) {
        this.endCombat();
      }
    } else {
      this._addLog('flee_fail', result.message, result);
    }

    return result;
  }

  // ============================================================
  // 19. 投降
  // ============================================================

  /**
   * 投降
   * @param {string} combatantId - 投降单位ID（可选，默认当前回合单位）
   * @returns {object}
   */
  surrender(combatantId = null) {
    const targetId = combatantId || (this.combatants[this.currentTurn]?.id);
    const combatant = this.combatants.find(c => c.id === targetId);

    if (!combatant) {
      return { success: false, message: '无效的单位' };
    }

    // 标记为投降
    combatant.surrendered = true;
    this.applyCondition(targetId, 'incapacitated', -1);

    const result = {
      success: true,
      combatant: combatant.name,
      combatantId: targetId,
      message: `${combatant.name} 投降了！`,
    };

    this._addLog('surrender', result.message, result);
    this.emit('COMBATANT_SURRENDER', { combatantId: targetId, combatant: combatant.name });

    // 检查是否所有玩家都投降了
    const players = this.combatants.filter(c => c.isPlayer && !c.surrendered && c.hp > 0);
    if (players.length === 0) {
      return this.endCombat();
    }

    return result;
  }

  // ============================================================
  // 20. 结束战斗
  // ============================================================

  /**
   * 结束战斗
   * @returns {object} 战斗结果
   */
  endCombat() {
    const survivors = this._getAlive(this.combatants);
    const defeated = this.combatants.filter(c => c.hp <= 0 || c.surrendered);

    // 计算经验值
    const xpGained = this.calculateXP();

    // 生成战利品
    const loot = this._generateLoot(defeated);

    this.inCombat = false;

    this._addLog('combat_end', '战斗结束！', {
      survivors: survivors.map(s => s.name),
      defeated: defeated.map(d => d.name),
      xpGained,
      loot: loot.map(l => l.name),
      roundsElapsed: this.round,
      statistics: { ...this.statistics },
    });

    const result = {
      success: true,
      survivors,
      defeated,
      xpGained,
      loot,
      roundsElapsed: this.round,
      statistics: { ...this.statistics },
      log: this.log,
    };

    this.emit('COMBAT_END', result);
    return result;
  }

  /**
   * 生成战利品
   * @param {Array} defeated - 被击败的单位
   * @returns {Array} 战利品列表
   */
  _generateLoot(defeated) {
    const loot = [];
    const dice = this._getDice();

    defeated.forEach(enemy => {
      if (enemy.isPlayer) return; // 玩家不掉落战利品

      // 基础金币
      if (enemy.gold) {
        loot.push({
          name: '金币',
          type: 'currency',
          quantity: enemy.gold,
          source: enemy.name,
        });
      } else if (!enemy.isPlayer) {
        // 随机金币
        const goldRoll = dice.rollExpression(`${enemy.cr || 1}d6`);
        if (goldRoll.total > 0) {
          loot.push({
            name: '金币',
            type: 'currency',
            quantity: goldRoll.total,
            source: enemy.name,
          });
        }
      }

      // 特定掉落
      if (enemy.loot) {
        enemy.loot.forEach(item => {
          const dropChance = item.chance || 1;
          if (dice.roll(100) <= dropChance * 100) {
            loot.push({
              name: item.name || item,
              type: item.type || 'item',
              quantity: item.quantity || 1,
              source: enemy.name,
              rarity: item.rarity || 'common',
            });
          }
        });
      }
    });

    return loot;
  }

  // ============================================================
  // 21. 敌人 AI
  // ============================================================

  /**
   * 敌人 AI 决策
   * @param {string} enemyId - 敌人ID
   * @returns {object} AI决策结果
   */
  enemyAI(enemyId) {
    const enemy = this.combatants.find(c => c.id === enemyId);
    if (!enemy || enemy.hp <= 0) {
      return { action: 'none', message: `${enemy?.name || '未知'} 无法行动` };
    }

    // 检查是否能行动
    if (this.hasCondition(enemyId, 'paralyzed') ||
        this.hasCondition(enemyId, 'stunned') ||
        this.hasCondition(enemyId, 'unconscious') ||
        this.hasCondition(enemyId, 'petrified') ||
        this.hasCondition(enemyId, 'incapacitated')) {
      return { action: 'none', message: `${enemy.name} 无法行动` };
    }

    const hpPercent = enemy.hp / (enemy.maxHp || enemy.maxHP || 1);
    const allies = this.getEnemies().filter(c => c.id !== enemyId && c.hp > 0);
    const playerTargets = this.getAllies().filter(c => c.hp > 0);

    // 没有可攻击的目标
    if (playerTargets.length === 0) {
      return { action: 'idle', message: `${enemy.name} 没有可攻击的目标` };
    }

    const dice = this._getDice();
    const actions = [];

    // --- 根据HP百分比决定行为模式 ---
    let behavior = 'aggressive'; // 默认攻击性
    if (hpPercent <= 0.15) {
      behavior = 'desperate'; // 绝望
    } else if (hpPercent <= 0.35) {
      behavior = 'cautious'; // 谨慎
    }

    // --- 绝望模式：有概率逃跑 ---
    if (behavior === 'desperate' && !enemy.isBoss) {
      const fleeChance = 40 + (allies.length === 0 ? 30 : 0);
      if (dice.roll(100) <= fleeChance) {
        const fleeResult = this.flee(enemyId);
        return {
          action: 'flee',
          behavior,
          ...fleeResult,
        };
      }
    }

    // --- 选择目标：优先攻击低HP目标 ---
    playerTargets.sort((a, b) => a.hp - b.hp);
    const primaryTarget = playerTargets[0];

    // --- 攻击性模式 ---
    if (behavior === 'aggressive') {
      // 检查是否有可用技能
      if (enemy.abilities && enemy.abilities.length > 0) {
        // 30%概率使用技能
        if (dice.roll(100) <= 30) {
          const ability = enemy.abilities[dice.roll(enemy.abilities.length) - 1];
          const abilityResult = this.useAbility(enemyId, ability, primaryTarget.id);
          actions.push(abilityResult);

          if (abilityResult.success) {
            // 使用技能后仍然可以攻击
          }
        }
      }

      // 检查是否能施法
      if (enemy.spells && enemy.spells.length > 0 && dice.roll(100) <= 25) {
        const spell = enemy.spells[dice.roll(enemy.spells.length) - 1];
        const spellResult = this.castSpell(enemyId, spell, primaryTarget.id, enemy.spellLevel || 1);
        actions.push(spellResult);
      }

      // 普通攻击
      if (actions.length === 0 || dice.roll(100) <= 60) {
        const attackResult = this.attack(enemyId, primaryTarget.id, {
          attackBonus: enemy.attackBonus || 0,
          weaponDamage: enemy.weaponDamage || '1d6',
          damageType: enemy.damageType || 'slashing',
        });
        actions.push(attackResult);
      }
    }

    // --- 谨慎模式 ---
    else if (behavior === 'cautious') {
      // 50%概率防御或闪避
      if (dice.roll(100) <= 50) {
        const defendOrDodge = dice.roll(100) <= 50 ? 'defend' : 'dodge';
        let actionResult;
        if (defendOrDodge === 'defend') {
          actionResult = this.defend(enemyId);
        } else {
          actionResult = this.dodge(enemyId);
        }
        actions.push(actionResult);
      } else {
        // 仍然攻击，但优先低HP目标
        const attackResult = this.attack(enemyId, primaryTarget.id, {
          attackBonus: enemy.attackBonus || 0,
          weaponDamage: enemy.weaponDamage || '1d6',
          damageType: enemy.damageType || 'slashing',
        });
        actions.push(attackResult);
      }

      // 如果有治疗能力且HP很低
      if (enemy.healSpell && hpPercent <= 0.25) {
        const healResult = this.castSpell(enemyId, enemy.healSpell, enemyId, 1);
        actions.push(healResult);
      }
    }

    // --- 绝望模式 ---
    else if (behavior === 'desperate') {
      // 全力攻击
      const attackResult = this.attack(enemyId, primaryTarget.id, {
        attackBonus: enemy.attackBonus || 0,
        weaponDamage: enemy.weaponDamage || '1d6',
        damageType: enemy.damageType || 'slashing',
        advantage: true, // 绝望时获得优势（简化规则）
      });
      actions.push(attackResult);

      // 使用所有可用技能
      if (enemy.abilities) {
        enemy.abilities.forEach(ability => {
          const abilityResult = this.useAbility(enemyId, ability, primaryTarget.id);
          actions.push(abilityResult);
        });
      }
    }

    const behaviorNames = { aggressive: '攻击性', cautious: '谨慎', desperate: '绝望' };

    const result = {
      action: 'ai_turn',
      behavior,
      enemy: enemy.name,
      enemyId,
      hpPercent: Math.round(hpPercent * 100),
      target: primaryTarget?.name,
      actions,
      message: `${enemy.name}（${behaviorNames[behavior]}模式）对 ${primaryTarget?.name || '未知'} 发起了行动`,
    };

    this._addLog('enemy_ai', result.message, result);
    this.emit('ENEMY_AI_TURN', result);
    return result;
  }

  // ============================================================
  // 22. 施加状态效果
  // ============================================================

  /**
   * 施加状态效果
   * @param {string} combatantId - 参战单位ID
   * @param {string} condition - 状态名称
   * @param {number} duration - 持续时间（轮数，-1为永久，0为到回合结束）
   * @returns {object}
   */
  applyCondition(combatantId, condition, duration = 1) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant) {
      return { success: false, message: '无效的单位' };
    }

    if (!combatant.conditions) {
      combatant.conditions = [];
    }

    // 检查是否已有该状态
    const existing = combatant.conditions.find(c => c.name === condition);
    if (existing) {
      // 刷新持续时间（取较长的）
      if (duration > existing.duration) {
        existing.duration = duration;
      }
      return {
        success: true,
        message: `${combatant.name} 的 ${condition} 效果被刷新`,
        refreshed: true,
      };
    }

    // 添加新状态
    const conditionData = ConditionEffects[condition];
    combatant.conditions.push({
      name: condition,
      duration,
      appliedAt: Date.now(),
      appliedRound: this.round,
      effect: conditionData || {},
    });

    // 特殊状态处理
    if (condition === 'unconscious' && conditionData?.fallProne) {
      if (!combatant.conditions.find(c => c.name === 'prone')) {
        combatant.conditions.push({
          name: 'prone',
          duration: -1,
          appliedAt: Date.now(),
          appliedRound: this.round,
          effect: ConditionEffects.prone,
        });
      }
    }

    const result = {
      success: true,
      combatant: combatant.name,
      combatantId,
      condition,
      duration,
      effect: conditionData,
      message: `${combatant.name} 获得了 ${conditionData?.description || condition} 状态（${duration === -1 ? '永久' : duration === 0 ? '本回合' : duration + ' 轮'}）`,
    };

    this.emit('CONDITION_APPLIED', result);
    return result;
  }

  // ============================================================
  // 23. 移除状态效果
  // ============================================================

  /**
   * 移除状态效果
   * @param {string} combatantId - 参战单位ID
   * @param {string} condition - 状态名称
   * @returns {object}
   */
  removeCondition(combatantId, condition) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant || !combatant.conditions) {
      return { success: false, message: '无效的单位或无状态' };
    }

    const index = combatant.conditions.findIndex(c => c.name === condition);
    if (index === -1) {
      return { success: false, message: `${combatant.name} 没有 ${condition} 状态` };
    }

    const removed = combatant.conditions.splice(index, 1)[0];

    const result = {
      success: true,
      combatant: combatant.name,
      combatantId,
      condition,
      removedCondition: removed,
      message: `${combatant.name} 的 ${condition} 状态被移除了`,
    };

    this.emit('CONDITION_REMOVED', result);
    return result;
  }

  // ============================================================
  // 24. 检查状态
  // ============================================================

  /**
   * 检查单位是否拥有某个状态
   * @param {string} combatantId - 参战单位ID
   * @param {string} condition - 状态名称
   * @returns {boolean}
   */
  hasCondition(combatantId, condition) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant || !combatant.conditions) return false;
    return combatant.conditions.some(c => c.name === condition);
  }

  /**
   * 获取单位的所有状态
   * @param {string} combatantId - 参战单位ID
   * @returns {Array}
   */
  getConditions(combatantId) {
    const combatant = this.combatants.find(c => c.id === combatantId);
    if (!combatant || !combatant.conditions) return [];
    return [...combatant.conditions];
  }

  // ============================================================
  // 25. 计算经验值
  // ============================================================

  /**
   * 计算经验值
   * @returns {object} 经验值详情
   */
  calculateXP() {
    let totalXP = 0;
    const xpBreakdown = [];

    this.combatants.forEach(c => {
      if (!c.isPlayer && (c.hp <= 0 || c.surrendered)) {
        let xp = 0;

        // 根据CR计算XP
        if (c.cr) {
          const crTable = {
            0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
            1: 200, 2: 450, 3: 700, 4: 1100,
            5: 1800, 6: 2300, 7: 2900, 8: 3900,
            9: 5000, 10: 5900, 11: 7200, 12: 8400,
            13: 10000, 14: 11500, 15: 13000, 16: 15000,
            17: 18000, 18: 20000, 19: 22000, 20: 25000,
            21: 33000, 22: 41000, 23: 50000, 24: 62000,
            30: 155000,
          };
          xp = crTable[c.cr] || (c.cr * 200);
        } else if (c.xp) {
          xp = c.xp;
        } else {
          // 默认根据等级估算
          xp = (c.level || 1) * 100;
        }

        totalXP += xp;
        xpBreakdown.push({
          name: c.name,
          cr: c.cr || 'unknown',
          xp,
        });
      }
    });

    // 存活玩家数量分摊
    const alivePlayers = this.combatants.filter(c => c.isPlayer && c.hp > 0 && !c.surrendered);
    const xpPerPlayer = alivePlayers.length > 0 ? Math.floor(totalXP / alivePlayers.length) : totalXP;

    return {
      totalXP,
      xpPerPlayer,
      playerCount: alivePlayers.length,
      breakdown: xpBreakdown,
    };
  }

  // ============================================================
  // 26. 获取敌友列表
  // ============================================================

  /**
   * 获取存活的敌人列表
   * @returns {Array}
   */
  getEnemies() {
    return this._getAlive(this.combatants.filter(c => !c.isPlayer && !c.isAlly));
  }

  /**
   * 获取友方列表（包含玩家和盟友）
   * @returns {Array}
   */
  getAllies() {
    return this.combatants.filter(c => c.isPlayer || c.isAlly);
  }

  /**
   * 获取存活的友方列表
   * @returns {Array}
   */
  getAliveAllies() {
    return this._getAlive(this.combatants.filter(c => c.isPlayer || c.isAlly));
  }

  // ============================================================
  // 27. 检查战斗结束
  // ============================================================

  /**
   * 检查战斗是否结束
   * @returns {boolean}
   */
  isCombatOver() {
    const enemies = this.getEnemies();
    const players = this.combatants.filter(c => c.isPlayer && c.hp > 0 && !c.surrendered);

    // 所有敌人被击败
    if (enemies.length === 0) return true;

    // 所有玩家倒下或投降
    if (players.length === 0) return true;

    return false;
  }

  // ============================================================
  // 28. 获取战斗摘要
  // ============================================================

  /**
   * 获取战斗摘要
   * @returns {object}
   */
  getCombatSummary() {
    const alive = this._getAlive(this.combatants);
    const defeated = this.combatants.filter(c => c.hp <= 0 || c.surrendered);
    const xpResult = this.calculateXP();

    return {
      // 战斗状态
      inCombat: this.inCombat,
      round: this.round,
      currentTurn: this.currentTurn,
      currentCombatant: this.combatants[this.currentTurn]?.name || null,

      // 单位统计
      totalCombatants: this.combatants.length,
      aliveCount: alive.length,
      defeatedCount: defeated.length,
      aliveEnemies: this.getEnemies().length,
      aliveAllies: this.getAliveAllies().length,

      // 参战单位列表
      combatants: this.combatants.map(c => ({
        id: c.id,
        name: c.name,
        hp: c.hp,
        maxHp: c.maxHp || c.maxHP,
        hpPercent: Math.round((c.hp / (c.maxHp || c.maxHP || 1)) * 100),
        isPlayer: c.isPlayer,
        conditions: c.conditions?.map(cond => cond.name) || [],
        initiative: c.initiative,
        surrendered: c.surrendered || false,
      })),

      // 战斗统计
      statistics: { ...this.statistics },

      // 经验值
      xp: xpResult,

      // 集中注意力
      concentration: { ...this.concentrationTracker },

      // 日志数量
      logCount: this.log.length,
    };
  }
}

// ============================================================
// 导出
// ============================================================
export { CombatSystem, ConditionEffects, SpellData, AbilityData, DamageTypes };

// 创建全局实例
const combatSystem = new CombatSystem();

// window 全局赋值（兼容非模块环境）
window.combatSystem = combatSystem;
window.CombatSystem = CombatSystem;
window.ConditionEffects = ConditionEffects;
window.SpellData = SpellData;
window.AbilityData = AbilityData;
window.DamageTypes = DamageTypes;
