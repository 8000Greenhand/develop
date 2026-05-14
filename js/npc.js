/**
 * NPC 情绪/好感度/关系系统模块
 * 用于 D&D RPG 网页游戏中管理 NPC 的情绪状态、好感度、信任度及交互逻辑
 *
 * 模块包含：
 * - NPCRelationship: NPC 关系数据管理
 * - NPCMoodSystem: NPC 情绪系统
 * - NPCInteractionSystem: NPC 交互系统
 * - NPCRegistry: NPC 注册中心（主入口）
 */

// ============================================================
// NPCRelationship 类 —— 管理 NPC 关系数据
// ============================================================
class NPCRelationship {
    /**
     * @param {Object} data - NPC 初始化数据
     * @param {string} data.npcId - NPC 唯一标识
     * @param {string} data.name - NPC 名称
     * @param {string} data.race - 种族
     * @param {string} data.role - 职业/角色
     * @param {string} [data.disposition='neutral'] - 阵营倾向 (friendly/neutral/hostile)
     * @param {string} [data.mood='neutral'] - 当前情绪
     * @param {number} [data.moodIntensity=50] - 情绪强度 (0-100)
     * @param {number} [data.affinity=0] - 好感度 (-100 到 100)
     * @param {number} [data.trust=50] - 信任度 (0-100)
     * @param {string} [data.location] - 所在地点
     * @param {string} [data.relationshipType='stranger'] - 关系类型
     * @param {Object} [data.dialogueTree] - 对话树
     */
    constructor(data = {}) {
        this.npcId = data.npcId || this._generateId();
        this.name = data.name || '未知';
        this.race = data.race || '人类';
        this.role = data.role || '平民';
        this.location = data.location || '未知地点';

        // 阵营倾向：friendly / neutral / hostile
        this.disposition = data.disposition || 'neutral';

        // 当前情绪
        this.mood = data.mood || 'neutral';
        this.moodIntensity = this._clamp(data.moodIntensity ?? 50, 0, 100);

        // 好感度：-100（极度厌恶）到 100（极度喜爱）
        this.affinity = this._clamp(data.affinity ?? 0, -100, 100);

        // 信任度：0（完全不信任）到 100（完全信任）
        this.trust = this._clamp(data.trust ?? 50, 0, 100);

        // 交互统计
        this.interactions = 0;
        this.firstMet = data.firstMet || new Date().toISOString();
        this.lastMet = new Date().toISOString();

        // 关系类型：stranger / acquaintance / friend / ally / rival / enemy
        this.relationshipType = data.relationshipType || 'stranger';

        // 备注
        this.notes = data.notes || '';

        // 收到的礼物列表
        this.gifts = [];

        // 完成的任务数
        this.questsCompleted = data.questsCompleted || 0;

        // 对话树
        this.dialogueTree = data.dialogueTree || null;
    }

    /**
     * 生成唯一 ID
     * @private
     */
    _generateId() {
        return 'npc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5);
    }

    /**
     * 数值范围限制
     * @private
     */
    _clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * 更新好感度
     * @param {number} amount - 变化量（正数增加，负数减少）
     * @param {string} [reason] - 变化原因
     * @returns {number} 变化后的好感度
     */
    changeAffinity(amount, reason) {
        const oldAffinity = this.affinity;
        this.affinity = this._clamp(this.affinity + amount, -100, 100);

        // 根据好感度自动更新关系类型
        this._updateRelationshipType();

        // 记录交互
        this._recordInteraction();

        if (reason) {
            console.log(`[NPC] ${this.name} 好感度变化: ${oldAffinity} -> ${this.affinity} (${reason})`);
        }

        return this.affinity;
    }

    /**
     * 更新信任度
     * @param {number} amount - 变化量
     * @param {string} [reason] - 变化原因
     * @returns {number} 变化后的信任度
     */
    changeTrust(amount, reason) {
        const oldTrust = this.trust;
        this.trust = this._clamp(this.trust + amount, 0, 100);

        if (reason) {
            console.log(`[NPC] ${this.name} 信任度变化: ${oldTrust} -> ${this.trust} (${reason})`);
        }

        return this.trust;
    }

    /**
     * 根据好感度自动更新关系类型
     * @private
     */
    _updateRelationshipType() {
        const a = this.affinity;
        if (a >= 80) {
            this.relationshipType = 'ally';
        } else if (a >= 50) {
            this.relationshipType = 'friend';
        } else if (a >= 20) {
            this.relationshipType = 'acquaintance';
        } else if (a >= -20) {
            this.relationshipType = 'stranger';
        } else if (a >= -60) {
            this.relationshipType = 'rival';
        } else {
            this.relationshipType = 'enemy';
        }
    }

    /**
     * 记录一次交互
     * @private
     */
    _recordInteraction() {
        this.interactions++;
        this.lastMet = new Date().toISOString();
    }

    /**
     * 添加礼物记录
     * @param {Object} gift - 礼物信息 { name, value, type }
     */
    addGift(gift) {
        this.gifts.push({
            ...gift,
            receivedAt: new Date().toISOString()
        });
    }

    /**
     * 增加完成任务数
     */
    incrementQuestsCompleted() {
        this.questsCompleted++;
    }

    /**
     * 获取关系摘要
     * @returns {Object} 关系摘要信息
     */
    getSummary() {
        return {
            name: this.name,
            race: this.race,
            role: this.role,
            disposition: this.disposition,
            mood: this.mood,
            affinity: this.affinity,
            trust: this.trust,
            relationshipType: this.relationshipType,
            interactions: this.interactions,
            questsCompleted: this.questsCompleted
        };
    }

    /**
     * 序列化为可存储的对象
     * @returns {Object}
     */
    serialize() {
        return {
            npcId: this.npcId,
            name: this.name,
            race: this.race,
            role: this.role,
            location: this.location,
            disposition: this.disposition,
            mood: this.mood,
            moodIntensity: this.moodIntensity,
            affinity: this.affinity,
            trust: this.trust,
            interactions: this.interactions,
            firstMet: this.firstMet,
            lastMet: this.lastMet,
            relationshipType: this.relationshipType,
            notes: this.notes,
            gifts: this.gifts,
            questsCompleted: this.questsCompleted,
            dialogueTree: this.dialogueTree
        };
    }

    /**
     * 从存储数据反序列化
     * @param {Object} data - 序列化数据
     * @returns {NPCRelationship}
     */
    static deserialize(data) {
        return new NPCRelationship(data);
    }
}


// ============================================================
// NPCMoodSystem 类 —— NPC 情绪系统
// ============================================================
class NPCMoodSystem {
    constructor() {
        /**
         * 情绪定义表
         * 每种情绪包含：标签、emoji、描述、对交互的修正值
         */
        this.moods = {
            happy: {
                label: '开心',
                emoji: '😊',
                description: 'NPC 心情愉悦，更愿意交流和提供帮助。',
                modifier: { trade: 5, persuade: 10, intimidate: -5, askForHelp: 10, talk: 10 }
            },
            sad: {
                label: '悲伤',
                emoji: '😢',
                description: 'NPC 正在悲伤中，可能需要安慰或独处。',
                modifier: { trade: -5, persuade: -5, intimidate: -10, askForHelp: -10, talk: -5 }
            },
            angry: {
                label: '愤怒',
                emoji: '😠',
                description: 'NPC 非常愤怒，交互可能会引发冲突。',
                modifier: { trade: -15, persuade: -20, intimidate: 10, askForHelp: -20, talk: -15 }
            },
            fearful: {
                label: '恐惧',
                emoji: '😨',
                description: 'NPC 感到害怕，更容易被威吓但也会隐瞒信息。',
                modifier: { trade: -10, persuade: -5, intimidate: 15, askForHelp: -15, talk: -10 }
            },
            suspicious: {
                label: '怀疑',
                emoji: '🤨',
                description: 'NPC 对你持怀疑态度，需要更多证据才能信任你。',
                modifier: { trade: -10, persuade: -15, intimidate: 0, askForHelp: -10, talk: -10 }
            },
            curious: {
                label: '好奇',
                emoji: '🧐',
                description: 'NPC 对你很感兴趣，愿意了解更多信息。',
                modifier: { trade: 5, persuade: 5, intimidate: -10, askForHelp: 5, talk: 15 }
            },
            neutral: {
                label: '平静',
                emoji: '😐',
                description: 'NPC 处于平静状态，交互正常。',
                modifier: { trade: 0, persuade: 0, intimidate: 0, askForHelp: 0, talk: 0 }
            },
            excited: {
                label: '兴奋',
                emoji: '🤩',
                description: 'NPC 非常兴奋，可能会提供额外信息或优惠。',
                modifier: { trade: 10, persuade: 15, intimidate: -15, askForHelp: 15, talk: 15 }
            },
            bored: {
                label: '无聊',
                emoji: '😴',
                description: 'NPC 觉得无聊，可能需要一些刺激才会认真对待你。',
                modifier: { trade: -5, persuade: -5, intimidate: -5, askForHelp: -5, talk: -5 }
            },
            grateful: {
                label: '感激',
                emoji: '🙏',
                description: 'NPC 对你心怀感激，愿意尽力帮助你。',
                modifier: { trade: 15, persuade: 20, intimidate: -20, askForHelp: 20, talk: 15 }
            }
        };

        // NPC 情绪记录映射表（npcId -> moodState）
        this._moodStates = {};
    }

    /**
     * 改变 NPC 的情绪
     * @param {string} npcId - NPC 标识
     * @param {string} newMood - 新情绪名称
     * @param {number} [intensity] - 情绪强度 (0-100)，不传则保持当前强度
     * @param {string} [reason] - 情绪变化原因
     * @returns {Object} 更新后的情绪状态
     */
    changeMood(npcId, newMood, intensity, reason) {
        if (!this.moods[newMood]) {
            console.warn(`[NPCMoodSystem] 未知情绪: ${newMood}`);
            newMood = 'neutral';
        }

        const clampedIntensity = Math.max(0, Math.min(100, intensity ?? 50));

        this._moodStates[npcId] = {
            mood: newMood,
            intensity: clampedIntensity,
            reason: reason || '',
            changedAt: new Date().toISOString()
        };

        if (reason) {
            console.log(`[NPCMoodSystem] ${npcId} 情绪变为 ${newMood} (${clampedIntensity}) - ${reason}`);
        }

        return this._moodStates[npcId];
    }

    /**
     * 获取 NPC 当前情绪状态
     * @param {string} npcId - NPC 标识
     * @returns {Object|null} 情绪状态
     */
    getMoodState(npcId) {
        return this._moodStates[npcId] || { mood: 'neutral', intensity: 50, reason: '', changedAt: null };
    }

    /**
     * 获取情绪对特定交互类型的修正值
     * @param {string} npcId - NPC 标识
     * @returns {Object} 各交互类型的修正值
     */
    getMoodModifier(npcId) {
        const state = this.getMoodState(npcId);
        const moodDef = this.moods[state.mood];

        if (!moodDef) return { trade: 0, persuade: 0, intimidate: 0, askForHelp: 0, talk: 0 };

        // 根据情绪强度缩放修正值（强度越高，修正越大）
        const scale = state.intensity / 50;
        const modifiers = {};
        for (const [key, value] of Object.entries(moodDef.modifier)) {
            modifiers[key] = Math.round(value * scale);
        }

        return modifiers;
    }

    /**
     * 获取情绪对应的 emoji
     * @param {string} mood - 情绪名称
     * @returns {string} emoji 字符
     */
    getMoodEmoji(mood) {
        return this.moods[mood]?.emoji || '😐';
    }

    /**
     * 获取情绪描述文本
     * @param {string} mood - 情绪名称
     * @returns {string} 描述文本
     */
    getMoodDescription(mood) {
        return this.moods[mood]?.description || 'NPC 处于未知状态。';
    }

    /**
     * 获取情绪标签（中文名）
     * @param {string} mood - 情绪名称
     * @returns {string} 中文标签
     */
    getMoodLabel(mood) {
        return this.moods[mood]?.label || '未知';
    }

    /**
     * 获取所有可用情绪列表
     * @returns {Object} 情绪定义表
     */
    getAllMoods() {
        return this.moods;
    }

    /**
     * 序列化情绪状态
     * @returns {Object}
     */
    serialize() {
        return { moodStates: this._moodStates };
    }

    /**
     * 反序列化情绪状态
     * @param {Object} data
     */
    deserialize(data) {
        if (data?.moodStates) {
            this._moodStates = data.moodStates;
        }
    }
}


// ============================================================
// NPCInteractionSystem 类 —— NPC 交互系统
// ============================================================
class NPCInteractionSystem {
    /**
     * @param {NPCMoodSystem} moodSystem - 情绪系统实例
     * @param {NPCRegistry} [registry] - NPC 注册中心实例（延迟绑定）
     */
    constructor(moodSystem, registry = null) {
        this.moodSystem = moodSystem;
        this.registry = registry;

        // 交互历史记录
        this._interactionLog = [];
    }

    /**
     * 绑定注册中心（避免循环依赖）
     * @param {NPCRegistry} registry
     */
    setRegistry(registry) {
        this.registry = registry;
    }

    /**
     * 获取 NPC 实例
     * @private
     * @param {string} npcId
     * @returns {NPCRelationship|null}
     */
    _getNPC(npcId) {
        if (!this.registry) {
            console.error('[NPCInteractionSystem] 注册中心未绑定');
            return null;
        }
        return this.registry.get(npcId);
    }

    /**
     * 记录交互日志
     * @private
     */
    _log(npcId, type, result) {
        this._interactionLog.push({
            npcId,
            type,
            result,
            timestamp: new Date().toISOString()
        });
        // Limit log max entries
        if (this._interactionLog.length > 500) {
            this._interactionLog = this._interactionLog.slice(-250);
        }
    }

    /**
     * 与 NPC 交谈
     * @param {string} npcId - NPC 标识
     * @param {string} topic - 话题
     * @returns {Object} 对话结果 { text, mood, options }
     */
    talk(npcId, topic) {
        const npc = this._getNPC(npcId);
        if (!npc) return { text: '找不到这个人。', mood: 'neutral', options: [] };

        const moodModifier = this.moodSystem.getMoodModifier(npcId);
        const talkBonus = moodModifier.talk || 0;

        // 根据好感度和情绪生成对话
        let text = '';
        let options = [];

        if (npc.affinity >= 50) {
            // 好感度高 —— 友好对话
            text = `${npc.name} 热情地向你打招呼："啊，老朋友！有什么我能帮你的吗？"`;
            options = [
                { text: '聊聊最近的传闻', nextTopic: 'rumors' },
                { text: '询问任务', nextTopic: 'quests' },
                { text: '告别', nextTopic: 'farewell' }
            ];
        } else if (npc.affinity >= 20) {
            // 好感度一般 —— 礼貌对话
            text = `${npc.name} 礼貌地点了点头："你好，有什么事吗？"`;
            options = [
                { text: '打听消息', nextTopic: 'information' },
                { text: '进行交易', nextTopic: 'trade' },
                { text: '告别', nextTopic: 'farewell' }
            ];
        } else if (npc.affinity >= -20) {
            // 陌生人 —— 谨慎对话
            text = `${npc.name} 警惕地看着你："你是谁？有什么事？"`;
            options = [
                { text: '自我介绍', nextTopic: 'introduce' },
                { text: '打听消息', nextTopic: 'information' },
                { text: '告别', nextTopic: 'farewell' }
            ];
        } else {
            // 好感度低 —— 敌意对话
            text = `${npc.name} 冷冷地瞪着你："我不想跟你说话。离开这里。"`;
            options = [
                { text: '尝试说服', nextTopic: 'persuade' },
                { text: '威吓', nextTopic: 'intimidate' },
                { text: '离开', nextTopic: 'leave' }
            ];
        }

        // 根据话题调整对话内容
        if (topic && topic !== 'default') {
            text = this._getTopicResponse(npc, topic, talkBonus);
        }

        // 情绪修正提示
        if (talkBonus !== 0) {
            text += ` (交谈修正: ${talkBonus >= 0 ? '+' : ''}${talkBonus})`;
        }

        // 每次交谈略微增加好感度
        npc.changeAffinity(1, '日常交谈');

        this._log(npcId, 'talk', { topic, text });
        return { text, mood: npc.mood, options, talkBonus };
    }

    /**
     * 根据话题获取 NPC 回应
     * @private
     */
    _getTopicResponse(npc, topic, bonus) {
        const responses = {
            rumors: `${npc.name} 压低声音说道："最近听说北边的废墟里出现了奇怪的动静，好几个旅人都失踪了……"`,
            quests: `${npc.name} 沉思片刻："确实有一件事需要帮忙，不过得等你准备好了再说。"`,
            information: `${npc.name} 想了想说："这个嘛……我可以告诉你一些，但不是全部。"`,
            trade: `${npc.name} 点头道："当然，看看我有什么你需要的东西。"`,
            introduce: `${npc.name} 上下打量着你："嗯……好吧，我记住你了。"`,
            persuade: `${npc.name} 皱了皱眉："你的话有些道理，但我需要更多证据。"`,
            farewell: `${npc.name} 挥了挥手："后会有期。"`,
            leave: `${npc.name} 转过身去不再理你。`
        };
        return responses[topic] || `${npc.name} 看着你，似乎在思考如何回答。`;
    }

    /**
     * 送礼物给 NPC
     * @param {string} npcId - NPC 标识
     * @param {Object} item - 物品 { name, value, type }
     * @returns {Object} 结果 { success, affinityChange, response }
     */
    giveGift(npcId, item) {
        const npc = this._getNPC(npcId);
        if (!npc) return { success: false, affinityChange: 0, response: '找不到这个人。' };

        const itemValue = item.value || 10;
        const itemType = item.type || 'misc';

        // 根据物品价值和 NPC 好感度计算好感度变化
        let affinityChange = Math.floor(itemValue / 10);

        // 特殊物品类型加成
        const typeBonus = {
            weapon: 1.5,    // 武器类
            armor: 1.3,     // 防具类
            potion: 1.2,    // 药水类
            food: 1.0,      // 食物类
            book: 1.4,      // 书籍类
            gem: 1.6,       // 宝石类
            misc: 1.0       // 杂物
        };

        affinityChange = Math.floor(affinityChange * (typeBonus[itemType] || 1.0));

        // 好感度高时，礼物效果略微降低（已经很喜欢你了）
        if (npc.affinity >= 70) {
            affinityChange = Math.floor(affinityChange * 0.7);
        }

        // 好感度低时，礼物效果也降低（不信任你）
        if (npc.affinity <= -30) {
            affinityChange = Math.floor(affinityChange * 0.5);
        }

        // 信任度也略微增加
        npc.changeTrust(Math.floor(affinityChange * 0.3), `收到礼物: ${item.name}`);

        // 应用好感度变化
        npc.changeAffinity(affinityChange, `收到礼物: ${item.name}`);

        // 记录礼物
        npc.addGift(item);

        // 生成回应
        let response = '';
        if (affinityChange >= 10) {
            response = `${npc.name} 眼睛一亮："哦！这真是太棒了！非常感谢你！"`;
            this.moodSystem.changeMood(npcId, 'grateful', 70, `收到珍贵礼物: ${item.name}`);
        } else if (affinityChange >= 5) {
            response = `${npc.name} 微微一笑："谢谢你，这很有用。"`;
            this.moodSystem.changeMood(npcId, 'happy', 50, `收到礼物: ${item.name}`);
        } else if (affinityChange >= 1) {
            response = `${npc.name} 点了点头："嗯，谢谢。"`;
        } else {
            response = `${npc.name} 不以为然地看了一眼："随便吧。"`;
        }

        this._log(npcId, 'giveGift', { item, affinityChange });
        return { success: true, affinityChange, response };
    }

    /**
     * 与 NPC 交易
     * @param {string} npcId - NPC 标识
     * @param {Object} items - 交易物品 { buy: [], sell: [] }
     * @returns {Object} 交易结果
     */
    trade(npcId, items) {
        const npc = this._getNPC(npcId);
        if (!npc) return { success: false, message: '找不到这个人。' };

        const moodModifier = this.moodSystem.getMoodModifier(npcId);
        const tradeBonus = moodModifier.trade || 0;

        // 好感度高时给予折扣
        let discount = 0;
        if (npc.affinity >= 50) discount = 15;
        else if (npc.affinity >= 30) discount = 10;
        else if (npc.affinity >= 10) discount = 5;

        // 情绪修正
        discount += tradeBonus;

        let message = `${npc.name} `;
        if (discount > 0) {
            message += `"看在咱们关系的份上，给你打个折，便宜 ${discount}%。"`;
        } else if (discount < 0) {
            message += `"哼，你这种人我可不打算给什么优惠。" 价格上涨 ${Math.abs(discount)}%。`;
        } else {
            message += `"这是我的价目表，概不讲价。"`;
        }

        // 交易略微增加好感度
        npc.changeAffinity(2, '交易');

        this._log(npcId, 'trade', { items, discount });
        return {
            success: true,
            message,
            discount,
            items
        };
    }

    /**
     * 请求 NPC 帮助
     * @param {string} npcId - NPC 标识
     * @param {string} questType - 任务类型 (combat/exploration/information/crafting/healing)
     * @returns {Object} 请求结果
     */
    askForHelp(npcId, questType) {
        const npc = this._getNPC(npcId);
        if (!npc) return { success: false, message: '找不到这个人。' };

        const moodModifier = this.moodSystem.getMoodModifier(npcId);
        const helpBonus = moodModifier.askForHelp || 0;

        // 基础成功率 = 信任度 + 好感度修正 + 情绪修正
        const baseChance = npc.trust * 0.4 + (npc.affinity + 100) * 0.2 + helpBonus;
        const successChance = Math.max(0, Math.min(100, Math.floor(baseChance)));

        // 随机判定
        const roll = Math.floor(Math.random() * 100) + 1;
        const success = roll <= successChance;

        let message = '';
        if (success) {
            const questResponses = {
                combat: `${npc.name} 拔出武器："好吧，我跟你一起战斗！"`,
                exploration: `${npc.name} 点了点头："我熟悉这片区域，跟我来。"`,
                information: `${npc.name} 沉思道："让我想想……我知道一些有用的信息。"`,
                crafting: `${npc.name} 露出自信的笑容："交给我吧，这活儿我在行。"`,
                healing: `${npc.name} 拿出工具："别担心，让我看看你的伤势。"`
            };
            message = questResponses[questType] || `${npc.name}："好的，我来帮你。"`;
            npc.changeAffinity(3, '帮助完成任务');
            npc.changeTrust(5, '互助合作');
        } else {
            message = `${npc.name} 摇了摇头："抱歉，我现在帮不了你。" (成功率: ${successChance}%, 掷骰: ${roll})`;
        }

        this._log(npcId, 'askForHelp', { questType, success, successChance, roll });
        return { success, message, successChance, roll };
    }

    /**
     * 威吓 NPC
     * @param {string} npcId - NPC 标识
     * @returns {Object} 威吓结果
     */
    intimidate(npcId) {
        const npc = this._getNPC(npcId);
        if (!npc) return { success: false, message: '找不到这个人。' };

        const moodModifier = this.moodSystem.getMoodModifier(npcId);
        const intimidateBonus = moodModifier.intimidate || 0;

        // 威吓成功率 = 基础40 - 信任度*0.3 + 情绪修正
        const baseChance = 40 - npc.trust * 0.3 + intimidateBonus;
        const successChance = Math.max(5, Math.min(95, Math.floor(baseChance)));

        const roll = Math.floor(Math.random() * 100) + 1;
        const success = roll <= successChance;

        let message = '';
        if (success) {
            message = `${npc.name} 吓得后退了一步："好……好吧，你想知道什么？"`;
            this.moodSystem.changeMood(npcId, 'fearful', 60, '被威吓');
        } else {
            message = `${npc.name} 毫不畏惧："你以为这样就能吓到我？省省吧。"`;
            this.moodSystem.changeMood(npcId, 'angry', 50, '威吓失败');
        }

        // 威吓无论成功失败都会降低好感度和信任度
        npc.changeAffinity(-8, '被威吓');
        npc.changeTrust(-10, '被威吓');

        this._log(npcId, 'intimidate', { success, successChance, roll });
        return { success, message, successChance, roll };
    }

    /**
     * 说服 NPC
     * @param {string} npcId - NPC 标识
     * @returns {Object} 说服结果
     */
    persuade(npcId) {
        const npc = this._getNPC(npcId);
        if (!npc) return { success: false, message: '找不到这个人。' };

        const moodModifier = this.moodSystem.getMoodModifier(npcId);
        const persuadeBonus = moodModifier.persuade || 0;

        // 说服成功率 = 基础30 + 好感度*0.3 + 信任度*0.2 + 情绪修正
        const baseChance = 30 + npc.affinity * 0.3 + npc.trust * 0.2 + persuadeBonus;
        const successChance = Math.max(5, Math.min(95, Math.floor(baseChance)));

        const roll = Math.floor(Math.random() * 100) + 1;
        const success = roll <= successChance;

        let message = '';
        if (success) {
            message = `${npc.name} 若有所思地点了点头："你说得有道理，我同意了。"`;
            npc.changeAffinity(5, '被成功说服');
            npc.changeTrust(3, '说服成功');
        } else {
            message = `${npc.name} 摇了摇头："不，我不这么认为。你的论点说服不了我。"`;
        }

        this._log(npcId, 'persuade', { success, successChance, roll });
        return { success, message, successChance, roll };
    }

    /**
     * 执行技能检定
     * @param {string} npcId - NPC 标识
     * @param {string} skill - 技能名称 (persuasion/intimidation/deception/insight/performance)
     * @param {number} dc - 难度等级 (DC)
     * @param {number} [playerBonus] - 玩家加值
     * @returns {Object} 检定结果
     */
    performSkillCheck(npcId, skill, dc, playerBonus = 0) {
        const npc = this._getNPC(npcId);
        if (!npc) return { success: false, message: '找不到这个人。', roll: 0, total: 0 };

        // 模拟掷 d20
        const roll = Math.floor(Math.random() * 20) + 1;

        // 根据技能类型获取修正
        let npcModifier = 0;
        const moodModifier = this.moodSystem.getMoodModifier(npcId);

        switch (skill) {
            case 'persuasion':
                npcModifier = -(moodModifier.persuade || 0);
                break;
            case 'intimidation':
                npcModifier = -(moodModifier.intimidate || 0);
                break;
            case 'deception':
                npcModifier = npc.trust > 50 ? -5 : 5;
                break;
            case 'insight':
                npcModifier = Math.floor(npc.trust / 10);
                break;
            case 'performance':
                npcModifier = -(moodModifier.talk || 0);
                break;
            default:
                npcModifier = 0;
        }

        // 好感度修正
        const affinityModifier = Math.floor(npc.affinity / 20);

        // 总值 = 掷骰 + 玩家加值 + NPC修正 + 好感度修正
        const total = roll + playerBonus + npcModifier + affinityModifier;
        const success = total >= dc;

        // 自然 20 自动成功，自然 1 自动失败
        const isCritSuccess = roll === 20;
        const isCritFail = roll === 1;
        const finalSuccess = isCritSuccess || (success && !isCritFail);

        let message = '';
        if (isCritSuccess) {
            message = `大成功！(${roll}+${playerBonus}+${npcModifier}+${affinityModifier}=${total} vs DC${dc}) ${npc.name} 被你的表现深深折服！`;
            npc.changeAffinity(10, '技能检定大成功');
        } else if (isCritFail) {
            message = `大失败！(${roll}+${playerBonus}+${npcModifier}+${affinityModifier}=${total} vs DC${dc}) 情况变得非常糟糕……`;
            npc.changeAffinity(-10, '技能检定大失败');
        } else if (finalSuccess) {
            message = `检定成功！(${roll}+${playerBonus}+${npcModifier}+${affinityModifier}=${total} vs DC${dc}) ${npc.name} 接受了你的尝试。`;
            npc.changeAffinity(3, '技能检定成功');
        } else {
            message = `检定失败。(${roll}+${playerBonus}+${npcModifier}+${affinityModifier}=${total} vs DC${dc}) ${npc.name} 不为所动。`;
        }

        this._log(npcId, 'skillCheck', { skill, dc, roll, playerBonus, npcModifier, affinityModifier, total, success: finalSuccess });
        return {
            success: finalSuccess,
            isCritSuccess,
            isCritFail,
            message,
            roll,
            total,
            dc,
            breakdown: { roll, playerBonus, npcModifier, affinityModifier }
        };
    }

    /**
     * 获取交互历史
     * @param {string} [npcId] - 可选，筛选特定 NPC 的记录
     * @returns {Array} 交互日志
     */
    getInteractionLog(npcId) {
        if (npcId) {
            return this._interactionLog.filter(log => log.npcId === npcId);
        }
        return [...this._interactionLog];
    }

    /**
     * 序列化
     * @returns {Object}
     */
    serialize() {
        return { interactionLog: this._interactionLog };
    }

    /**
     * 反序列化
     * @param {Object} data
     */
    deserialize(data) {
        if (data?.interactionLog) {
            this._interactionLog = data.interactionLog;
        }
    }
}


// ============================================================
// NPCRegistry 类 —— NPC 注册中心（主入口）
// ============================================================
class NPCRegistry {
    constructor() {
        /** @type {Map<string, NPCRelationship>} NPC 映射表 */
        this._npcs = new Map();

        /** @type {Map<string, string>} NPC 位置索引 (npcId -> locationId) */
        this._locationIndex = new Map();
    }

    /**
     * 注册一个新 NPC
     * @param {Object} npcData - NPC 数据
     * @returns {NPCRelationship} 注册后的 NPC 关系对象
     */
    register(npcData) {
        const npc = new NPCRelationship(npcData);
        this._npcs.set(npc.npcId, npc);

        // 建立位置索引
        if (npc.location) {
            this._locationIndex.set(npc.npcId, npc.location);
        }

        console.log(`[NPCRegistry] 已注册 NPC: ${npc.name} (${npc.npcId}) @ ${npc.location}`);
        return npc;
    }

    /**
     * 获取指定 NPC
     * @param {string} npcId - NPC 标识
     * @returns {NPCRelationship|null}
     */
    get(npcId) {
        return this._npcs.get(npcId) || null;
    }

    /**
     * 通过名称查找 NPC
     * @param {string} name - NPC 名称
     * @returns {NPCRelationship|null}
     */
    getByName(name) {
        for (const [, npc] of this._npcs) {
            if (npc.name === name) return npc;
        }
        return null;
    }

    /**
     * 获取所有 NPC
     * @returns {Array<NPCRelationship>}
     */
    getAll() {
        return Array.from(this._npcs.values());
    }

    /**
     * 按地点获取 NPC 列表
     * @param {string} locationId - 地点标识
     * @returns {Array<NPCRelationship>}
     */
    getByLocation(locationId) {
        const result = [];
        for (const [npcId, loc] of this._locationIndex) {
            if (loc === locationId) {
                const npc = this._npcs.get(npcId);
                if (npc) result.push(npc);
            }
        }
        return result;
    }

    /**
     * 按关系类型获取 NPC 列表
     * @param {string} type - 关系类型 (stranger/acquaintance/friend/ally/rival/enemy)
     * @returns {Array<NPCRelationship>}
     */
    getByRelationship(type) {
        return this.getAll().filter(npc => npc.relationshipType === type);
    }

    /**
     * 按阵营倾向获取 NPC 列表
     * @param {string} disposition - 阵营 (friendly/neutral/hostile)
     * @returns {Array<NPCRelationship>}
     */
    getByDisposition(disposition) {
        return this.getAll().filter(npc => npc.disposition === disposition);
    }

    /**
     * 更新 NPC 阵营倾向
     * @param {string} npcId - NPC 标识
     * @param {string} change - 变化方向 ('improve' 或 'worsen') 或直接指定 ('friendly'/'neutral'/'hostile')
     * @param {string} reason - 变化原因
     * @returns {string} 更新后的阵营
     */
    updateDisposition(npcId, change, reason) {
        const npc = this.get(npcId);
        if (!npc) {
            console.warn(`[NPCRegistry] 找不到 NPC: ${npcId}`);
            return null;
        }

        const dispositions = ['hostile', 'neutral', 'friendly'];

        if (dispositions.includes(change)) {
            // 直接设置
            npc.disposition = change;
        } else if (change === 'improve') {
            // 提升一级
            const idx = dispositions.indexOf(npc.disposition);
            if (idx < dispositions.length - 1) {
                npc.disposition = dispositions[idx + 1];
            }
        } else if (change === 'worsen') {
            // 降低一级
            const idx = dispositions.indexOf(npc.disposition);
            if (idx > 0) {
                npc.disposition = dispositions[idx - 1];
            }
        }

        console.log(`[NPCRegistry] ${npc.name} 阵营变为 ${npc.disposition} (${reason || '无原因'})`);
        return npc.disposition;
    }

    /**
     * 获取 NPC 的对话选项
     * @param {string} npcId - NPC 标识
     * @returns {Object} 对话选项 { greeting, options }
     */
    getDialogueOptions(npcId) {
        const npc = this.get(npcId);
        if (!npc) return { greeting: '这里没有人。', options: [] };

        // 如果有自定义对话树，优先使用
        if (npc.dialogueTree) {
            return {
                greeting: npc.dialogueTree.greeting || `${npc.name} 看着你。`,
                options: npc.dialogueTree.options || []
            };
        }

        // 默认对话选项，根据关系类型生成
        const dialogueByRelationship = {
            ally: {
                greeting: `${npc.name} 热情地拥抱了你："老朋友！见到你真高兴！"`,
                options: [
                    { id: 'chat', text: '闲聊', response: `${npc.name} 和你分享了最近的趣事。` },
                    { id: 'quest', text: '询问任务', response: '有什么需要帮忙的尽管说！' },
                    { id: 'trade', text: '交易', response: '给你最好的价格！' },
                    { id: 'secrets', text: '分享秘密', response: `${npc.name} 压低声音告诉你一些重要信息。` }
                ]
            },
            friend: {
                greeting: `${npc.name} 微笑着向你招手："嗨！好久不见！"`,
                options: [
                    { id: 'chat', text: '闲聊', response: `${npc.name} 愉快地和你聊天。` },
                    { id: 'quest', text: '询问任务', response: '我确实有些事情需要帮忙。' },
                    { id: 'trade', text: '交易', response: '老朋友价格优惠。' }
                ]
            },
            acquaintance: {
                greeting: `${npc.name} 点了点头："你好啊。"`,
                options: [
                    { id: 'chat', text: '闲聊', response: `${npc.name} 礼貌地回应了几句。` },
                    { id: 'trade', text: '交易', response: '看看有什么需要的。' }
                ]
            },
            stranger: {
                greeting: `${npc.name} 警惕地看着你："你是……？"`,
                options: [
                    { id: 'introduce', text: '自我介绍', response: `${npc.name} 打量着你，似乎在判断你的意图。` },
                    { id: 'ask', text: '打听消息', response: '我为什么要告诉你？' }
                ]
            },
            rival: {
                greeting: `${npc.name} 冷哼一声："又是你。"`,
                options: [
                    { id: 'taunt', text: '挑衅', response: `${npc.name} 怒视着你。` },
                    { id: 'negotiate', text: '谈判', response: '你想谈什么条件？' }
                ]
            },
            enemy: {
                greeting: `${npc.name} 看到你就拔出了武器！`,
                options: [
                    { id: 'fight', text: '战斗！', response: '来吧！' },
                    { id: 'flee', text: '逃跑', response: '你转身就跑。' }
                ]
            }
        };

        return dialogueByRelationship[npc.relationshipType] || dialogueByRelationship.stranger;
    }

    /**
     * 移除 NPC
     * @param {string} npcId
     * @returns {boolean}
     */
    remove(npcId) {
        this._locationIndex.delete(npcId);
        return this._npcs.delete(npcId);
    }

    /**
     * 获取已注册 NPC 数量
     * @returns {number}
     */
    get count() {
        return this._npcs.size;
    }

    /**
     * 保存所有 NPC 数据到 localStorage
     * @param {string} [saveKey='dnd_npc_data'] - 存档键名
     * @returns {boolean} 是否保存成功
     */
    save(saveKey = 'dnd_npc_data') {
        try {
            const data = {
                npcs: Array.from(this._npcs.entries()).map(([id, npc]) => ({
                    id,
                    data: npc.serialize()
                })),
                savedAt: new Date().toISOString()
            };

            localStorage.setItem(saveKey, JSON.stringify(data));
            console.log(`[NPCRegistry] 存档成功，共 ${this._npcs.size} 个 NPC`);
            return true;
        } catch (e) {
            console.error('[NPCRegistry] 存档失败:', e);
            return false;
        }
    }

    /**
     * 从 localStorage 加载 NPC 数据
     * @param {string} [saveKey='dnd_npc_data'] - 存档键名
     * @returns {boolean} 是否加载成功
     */
    load(saveKey = 'dnd_npc_data') {
        try {
            const raw = localStorage.getItem(saveKey);
            if (!raw) {
                console.log('[NPCRegistry] 未找到存档');
                return false;
            }

            const data = JSON.parse(raw);
            this._npcs.clear();
            this._locationIndex.clear();

            for (const entry of data.npcs) {
                const npc = NPCRelationship.deserialize(entry.data);
                this._npcs.set(npc.npcId, npc);
                if (npc.location) {
                    this._locationIndex.set(npc.npcId, npc.location);
                }
            }

            console.log(`[NPCRegistry] 读档成功，共加载 ${this._npcs.size} 个 NPC (存档时间: ${data.savedAt})`);
            return true;
        } catch (e) {
            console.error('[NPCRegistry] 读档失败:', e);
            return false;
        }
    }
}


// ============================================================
// 预设 NPC 数据
// ============================================================

/**
 * 预设 NPC 列表
 * 分布在不同地点，每个 NPC 拥有完整的属性和对话树
 */
const PRESET_NPCS = [
    // ---------- 宁静村庄 ----------
    {
        npcId: 'npc_grom',
        name: '铁匠格罗姆',
        race: '矮人',
        role: '铁匠',
        location: '宁静村庄',
        disposition: 'friendly',
        mood: 'neutral',
        moodIntensity: 40,
        affinity: 10,
        trust: 55,
        relationshipType: 'acquaintance',
        notes: '脾气暴躁但心肠好的矮人铁匠，擅长打造武器和铠甲。',
        dialogueTree: {
            greeting: '格罗姆用满是烧伤的手擦了擦额头上的汗水："又来了？这次要打什么？"',
            options: [
                {
                    id: 'buy_weapon',
                    text: '我想买一把武器',
                    response: '格罗姆从架子上取下几把剑："看看这些，都是我亲手打造的。矮人的工艺，你找不到更好的了。"',
                    children: [
                        {
                            id: 'buy_sword',
                            text: '这把长剑多少钱？',
                            response: '格罗姆掂量了一下："五十金币。这可是用精炼钢打的，砍什么都没问题。"',
                            children: [
                                { id: 'accept', text: '成交', response: '格罗姆满意地点头："好眼光。好好使用它。"' },
                                { id: 'haggle', text: '能便宜点吗？', response: '格罗姆瞪了你一眼："矮人的价格不讲价。你要么买，要么走。"' }
                            ]
                        },
                        {
                            id: 'buy_dagger',
                            text: '有没有轻便的匕首？',
                            response: '格罗姆翻找了一阵："这把怎么样？短小精悍，适合暗杀……我是说，自卫。"'
                        }
                    ]
                },
                {
                    id: 'repair',
                    text: '能帮我修理装备吗？',
                    response: '格罗姆接过你的装备仔细检查："嗯……需要重新淬火。给我一些时间，明天来取。"',
                    children: [
                        { id: 'rush', text: '能快点吗？', response: '格罗姆不耐烦地说："欲速则不达。你要是着急，去找别人。"' },
                        { id: 'wait', text: '好的，我明天来', response: '格罗姆点头："明智的选择。"' }
                    ]
                },
                {
                    id: 'chat',
                    text: '聊聊你的手艺',
                    response: '格罗姆的眼中闪过一丝光芒："我爷爷是王都最好的铁匠，我爹也不差。到我这里已经是第三代了。每一件作品都倾注了我的心血。"',
                    children: [
                        { id: 'secret', text: '有没有什么特别的作品？', response: '格罗姆压低声音："我曾经打造过一把附魔剑……但那是很久以前的事了。"' },
                        { id: 'praise', text: '你的手艺确实了不起', response: '格罗姆难得露出了笑容："哼，你至少有眼光。"' }
                    ]
                }
            ]
        }
    },
    {
        npcId: 'npc_ella',
        name: '草药师艾拉',
        race: '半精灵',
        role: '草药师',
        location: '宁静村庄',
        disposition: 'friendly',
        mood: 'happy',
        moodIntensity: 60,
        affinity: 15,
        trust: 60,
        relationshipType: 'acquaintance',
        notes: '温柔的半精灵女性，精通草药学和治愈术。经常帮助村民看病。',
        dialogueTree: {
            greeting: '艾拉正在研磨草药，看到你来了，她放下手中的工作微笑着说："欢迎，有什么不舒服的吗？"',
            options: [
                {
                    id: 'buy_potion',
                    text: '我需要一些药水',
                    response: '艾拉指了指架子上的瓶瓶罐罐："治疗药水、解毒剂、恢复药剂……你需要哪种？"',
                    children: [
                        { id: 'healing', text: '一瓶治疗药水', response: '艾拉递给你一个红色的小瓶："小心使用，效果很强。十五金币。"' },
                        { id: 'antidote', text: '有解毒剂吗？', response: '"当然，森林里的蛇虫很多，我随时备着。十金币一瓶。"' },
                        { id: 'custom', text: '能定制特殊药水吗？', response: '艾拉想了想："如果你能带来稀有的草药，我可以尝试调配。"' }
                    ]
                },
                {
                    id: 'heal',
                    text: '我受伤了，能帮我治疗吗？',
                    response: '艾拉关切地看着你的伤口："让我看看……还好不算太严重。坐下，我帮你处理。"',
                    children: [
                        { id: 'accept_heal', text: '谢谢', response: '艾拉的手温暖而轻柔，伤口很快愈合了。"小心点，别再受伤了。"' }
                    ]
                },
                {
                    id: 'herbs',
                    text: '教我一些草药知识',
                    response: '艾拉兴致勃勃地说："你看到窗外那些紫色的小花了吗？那是月光草，有安神的效果。而森林深处的红色蘑菇……千万别碰。"',
                    children: [
                        { id: 'learn_more', text: '还有什么有用的植物？', response: '"溪边的银叶草可以止血，山洞里的荧光苔藓可以照明。大自然是最好的药房。"' },
                        { id: 'dangerous', text: '有哪些危险的植物？', response: '艾拉表情严肃起来："血藤会缠绕活物，迷雾花会让吸入者陷入永恒的沉睡。一定要小心。"' }
                    ]
                }
            ]
        }
    },
    {
        npcId: 'npc_howard',
        name: '村长霍华德',
        race: '人类',
        role: '村长',
        location: '宁静村庄',
        disposition: 'friendly',
        mood: 'neutral',
        moodIntensity: 55,
        affinity: 5,
        trust: 50,
        relationshipType: 'stranger',
        notes: '年迈但精神矍铄的村长，一直为村庄的安全担忧。最近北边废墟的异动让他寝食难安。',
        dialogueTree: {
            greeting: '霍华德坐在村公所的旧椅子上，看到你进来，他放下手中的文件："啊，有客人。请坐，请坐。"',
            options: [
                {
                    id: 'village_info',
                    text: '告诉我关于这个村庄的事',
                    response: '霍华德叹了口气："宁静村……曾经确实很宁静。但最近北边的废墟传来了奇怪的声音，有几个猎人失踪了。我老了，保护不了所有人了。"',
                    children: [
                        { id: 'ruins', text: '废墟里有什么？', response: '"那是一座古老的精灵遗迹，据说封印着什么危险的东西。但具体是什么，我也不清楚。"' },
                        { id: 'help_village', text: '我能帮忙调查', response: '霍华德眼中闪过希望的光芒："你愿意帮忙？那太好了！去废墟看看，但一定要小心。"' }
                    ]
                },
                {
                    id: 'quest',
                    text: '有什么需要帮忙的吗？',
                    response: '霍华德犹豫了一下："确实有一件事……最近有野狼骚扰牲畜，如果你能处理掉它们，村庄会非常感激你的。"',
                    children: [
                        { id: 'accept_quest', text: '我去处理野狼', response: '"太好了！野狼的巢穴在东边的树林里。小心行事，它们成群出没。"' },
                        { id: 'ask_reward', text: '有什么报酬？', response: '"村庄虽然不富裕，但我可以给你二十金币，另外你在村里的商店购物可以打八折。"' }
                    ]
                },
                {
                    id: 'govern',
                    text: '你是怎么当上村长的？',
                    response: '霍华德笑了笑："三十年前，上一任村长在一场瘟疫中去世了。村民们选了我，大概是觉得我读书多吧。说实话，这份工作比我想象的难多了。"',
                    children: [
                        { id: 'retire', text: '想过退休吗？', response: '"想过，但现在不是时候。村庄需要我，等一切安定下来再说吧。"' }
                    ]
                }
            ]
        }
    },
    {
        npcId: 'npc_martha',
        name: '酒馆老板玛莎',
        race: '人类',
        role: '酒馆老板',
        location: '宁静村庄',
        disposition: 'friendly',
        mood: 'happy',
        moodIntensity: 50,
        affinity: 10,
        trust: 55,
        relationshipType: 'acquaintance',
        notes: '豪爽的中年女性，经营着村庄唯一的酒馆。消息灵通，是了解当地传闻的最佳人选。',
        dialogueTree: {
            greeting: '玛莎正在擦杯子，看到你走进来大声喊道："欢迎光临！来杯什么？今天的麦酒特别新鲜！"',
            options: [
                {
                    id: 'drink',
                    text: '来一杯麦酒',
                    response: '玛莎倒了一大杯金黄色的麦酒推到你面前："五铜币。这是用我们村自己的麦子酿的，外面喝不到。"',
                    children: [
                        { id: 'another', text: '再来一杯', response: '玛莎笑着又倒了一杯："慢慢喝，不着急。"' },
                        { id: 'food', text: '有吃的吗？', response: '"烤鹿肉配面包，十铜币。今天的肉是新鲜的。"' }
                    ]
                },
                {
                    id: 'rumors',
                    text: '最近有什么传闻？',
                    response: '玛莎凑近你压低声音："传闻可多了。你听说了吗？商队的卡尔说他在路上看到了一个巨大的影子……"',
                    children: [
                        { id: 'shadow', text: '什么影子？', response: '"他说是在月光下，一个至少有三层楼高的黑影穿过了森林。可能是巨魔，也可能是更糟的东西。"' },
                        { id: 'more_rumors', text: '还有别的吗？', response: '"嗯……还有人说南边的河里出现了水怪，渔民都不敢出船了。这个世界越来越不太平了。"' }
                    ]
                },
                {
                    id: 'lodging',
                    text: '我需要住一晚',
                    response: '玛莎指了指楼上："二楼还有空房，一晚十铜币，包早餐。热水自己烧，柴火在后面。"',
                    children: [
                        { id: 'stay', text: '好的，我住下', response: '"这是钥匙。晚上别太晚，隔壁的格罗姆脾气不好，别吵到他。"' }
                    ]
                }
            ]
        }
    },

    // ---------- 繁华都市 ----------
    {
        npcId: 'npc_rex',
        name: '守卫队长雷克斯',
        race: '人类',
        role: '守卫队长',
        location: '繁华都市',
        disposition: 'neutral',
        mood: 'neutral',
        moodIntensity: 60,
        affinity: 0,
        trust: 40,
        relationshipType: 'stranger',
        notes: '严肃的守卫队长，对职责一丝不苟。不轻易相信陌生人，但一旦认可你就是可靠的盟友。',
        dialogueTree: {
            greeting: '雷克斯穿着闪亮的铠甲，双手抱胸看着你："站住。你是谁？来城市有什么目的？"',
            options: [
                {
                    id: 'identify',
                    text: '出示身份证明',
                    response: '雷克斯接过你的证件仔细查看："嗯……看起来没问题。但我在这里还是要提醒你，在城市里遵守法律，否则别怪我不客气。"',
                    children: [
                        { id: 'laws', text: '有什么需要特别注意的法律？', response: '"禁止在城内携带裸露的武器、禁止在公共场所施法、禁止夜间在街道上逗留。违反者罚款或入狱。"' },
                        { id: 'thanks', text: '明白了，谢谢', response: '雷克斯微微点头："去吧。有事可以来守卫塔找我。"' }
                    ]
                },
                {
                    id: 'bounty',
                    text: '有悬赏任务吗？',
                    response: '雷克斯从墙上取下一张告示："确实有几个通缉犯。赏金从五十到五百金币不等。你觉得自己能行？"',
                    children: [
                        { id: 'accept_bounty', text: '我接一个', response: '"好。这个偷窃犯最近在市场出没，把他绳之以法。活捉赏金翻倍。"' },
                        { id: 'ask_danger', text: '危险吗？', response: '"大部分是小偷小摸。但有一个杀人犯还在逃，那个建议你多带几个人。"' }
                    ]
                },
                {
                    id: 'military',
                    text: '聊聊城市的防御',
                    response: '雷克斯的表情变得凝重："城墙坚固，守卫充足。但我担心的是城外的威胁……最近有报告说兽人在山脉那边集结。"',
                    children: [
                        { id: 'orcs', text: '兽人要进攻？', response: '"还不确定，但规模不小。我已经向国王报告了，希望能尽快增援。"' }
                    ]
                }
            ]
        }
    },
    {
        npcId: 'npc_zela',
        name: '魔法商人泽拉',
        race: '提夫林',
        role: '魔法商人',
        location: '繁华都市',
        disposition: 'neutral',
        mood: 'curious',
        moodIntensity: 50,
        affinity: 5,
        trust: 45,
        relationshipType: 'stranger',
        notes: '神秘的提夫林女性，经营着一家魔法物品商店。对稀有魔法物品有强烈的兴趣。',
        dialogueTree: {
            greeting: '泽拉从一堆魔法书后面探出头来，紫色的眼睛闪烁着光芒："哦？又一个冒险者？让我猜猜……你需要魔法？"',
            options: [
                {
                    id: 'buy_magic',
                    text: '看看有什么魔法物品',
                    response: '泽拉挥了挥手，几个物品漂浮到你面前："附魔匕首、防护护符、火球术卷轴……每件都是真品。"',
                    children: [
                        { id: 'scroll', text: '火球术卷轴多少钱？', response: '"一百金币。一次性使用，但威力巨大。相信我，物超所值。"' },
                        { id: 'amulet', text: '防护护符怎么卖？', response: '"八十金币。可以抵挡三次低级法术。在地下城里能救你命的。"' },
                        { id: 'rare', text: '有没有更稀有的？', response: '泽拉神秘地笑了笑："稀有的东西……我确实有一件，但价格不菲。你确定要看？"' }
                    ]
                },
                {
                    id: 'sell_magic',
                    text: '我有魔法物品要卖',
                    response: '泽拉的眼睛亮了起来："哦？让我看看。我总是对未知的魔法物品充满好奇。"',
                    children: [
                        { id: 'show_item', text: '展示物品', response: '泽拉仔细检查了一番："有意思……这件物品蕴含着古老的魔力。我出两百金币。"' },
                        { id: 'appraise', text: '能帮我鉴定一下吗？', response: '"鉴定费十个金币。不过如果你卖给我，鉴定费可以抵扣。"' }
                    ]
                },
                {
                    id: 'identify',
                    text: '你能鉴定未知物品吗？',
                    response: '泽拉自信地点头："鉴定是我的专长。不管是精灵的古物还是深渊的遗物，我都能告诉你它的来历和用途。"',
                    children: [
                        { id: 'ask_price', text: '鉴定费用？', response: '"普通物品十个金币，稀有物品五十个。如果物品非常罕见……我们再商量。"' }
                    ]
                }
            ]
        }
    },
    {
        npcId: 'npc_shadow',
        name: '盗贼公会联系人"阴影"',
        race: '半精灵',
        role: '盗贼公会联系人',
        location: '繁华都市',
        disposition: 'neutral',
        mood: 'suspicious',
        moodIntensity: 60,
        affinity: -5,
        trust: 30,
        relationshipType: 'stranger',
        notes: '来去无踪的盗贼公会联络人，没有人知道他的真名。只在暗巷中与信任的人接头。',
        dialogueTree: {
            greeting: '一个黑影从墙角闪出，低沉的声音传来："你在找我？那说明有人告诉了你该去哪里找。说吧，什么事？"',
            options: [
                {
                    id: 'join',
                    text: '我想加入盗贼公会',
                    response: '阴影沉默了片刻："想加入？不是谁都有资格的。先完成一个小任务证明你的能力。"',
                    children: [
                        { id: 'accept_test', text: '什么任务？', response: '"城东的珠宝店，老板最近得罪了我们。去\'借\'一颗红宝石回来。不要被发现。"' },
                        { id: 'decline', text: '我再想想', response: '"想好了再来找我。我一直在。" 话音未落，阴影已经消失在黑暗中。' }
                    ]
                },
                {
                    id: 'info',
                    text: '我需要一些情报',
                    response: '阴影冷笑一声："情报是有价格的。你想知道什么？"',
                    children: [
                        { id: 'target', text: '某个人在哪里？', response: '"说个名字。如果是重要人物，价格更高。普通人的行踪——二十金币。"' },
                        { id: 'guild', text: '告诉我关于公会的事', response: '"公会的规矩：不问真名，不背叛同伴，不盗穷人。违反者……后果自负。"' }
                    ]
                },
                {
                    id: 'fence',
                    text: '我有一些……"赃物"要处理',
                    response: '阴影微微点头："我懂。公会的销赃渠道是最好的。你有多少货？"',
                    children: [
                        { id: 'deal', text: '谈价格', response: '"一般是市价的三成。如果是稀有物品可以到五成。公会的规矩，不接受讨价还价。"' }
                    ]
                }
            ]
        }
    },
    {
        npcId: 'npc_silas',
        name: '神殿牧师塞拉斯',
        race: '人类',
        role: '牧师',
        location: '繁华都市',
        disposition: 'friendly',
        mood: 'neutral',
        moodIntensity: 45,
        affinity: 10,
        trust: 60,
        relationshipType: 'acquaintance',
        notes: '虔诚的神殿牧师，信仰光明之神。为人温和，愿意帮助任何人，无论贫富。',
        dialogueTree: {
            greeting: '塞拉斯穿着白色法袍，在神殿的烛光中显得格外安详："愿光明照耀你，旅人。有什么我能为你做的吗？"',
            options: [
                {
                    id: 'heal',
                    text: '我需要治疗',
                    response: '塞拉斯将手放在你的肩上，温暖的光芒笼罩了你："光明之神，请治愈这位旅人的伤痛。"',
                    children: [
                        { id: 'donate', text: '我想捐款表示感谢', response: '塞拉斯微笑："你的慷慨光明之神会铭记。这些捐款将用于帮助穷人。"' },
                        { id: 'free', text: '谢谢，我付不起钱', response: '"不必担心。光明之神的恩赐不分贫富。好好照顾自己。"' }
                    ]
                },
                {
                    id: 'blessing',
                    text: '能给我祝福吗？',
                    response: '塞拉斯闭上眼睛祈祷了一会儿："光明之神保佑你，愿你在旅途中平安。你感到一股温暖的力量注入了身体。"',
                    children: [
                        { id: 'weapon_bless', text: '能祝福我的武器吗？', response: '"当然。请将武器放在祭坛上。" 武器微微发出银色的光芒。"' }
                    ]
                },
                {
                    id: 'counsel',
                    text: '我需要一些建议',
                    response: '塞拉斯认真地看着你："说吧，我在听。有时候倾诉本身就是一种治愈。"',
                    children: [
                        { id: 'moral', text: '我做了一个艰难的决定', response: '"在光明面前，没有绝对的对错。跟随你的内心，但也要考虑你的行为对别人的影响。"' },
                        { id: 'quest_advice', text: '关于北边的废墟', response: '塞拉斯的表情变得严肃："那座废墟……据古老的经文记载，那里曾发生过一场大战。黑暗的力量被封印在那里。如果封印被打破……后果不堪设想。"' }
                    ]
                }
            ]
        }
    },

    // ---------- 边境要塞 ----------
    {
        npcId: 'npc_valkyria',
        name: '指挥官瓦尔基里亚',
        race: '人类',
        role: '要塞指挥官',
        location: '边境要塞',
        disposition: 'neutral',
        mood: 'neutral',
        moodIntensity: 70,
        affinity: 0,
        trust: 35,
        relationshipType: 'stranger',
        notes: '铁血女指挥官，镇守边境要塞多年。经验丰富，对敌人毫不留情，对部下关怀备至。',
        dialogueTree: {
            greeting: '瓦尔基里亚站在城墙上眺望远方，听到脚步声转过头来："你是新来的？在这个要塞里，只有一条规矩——服从命令。"',
            options: [
                {
                    id: 'patrol',
                    text: '有什么巡逻任务吗？',
                    response: '瓦尔基里亚指向远方的山脉："北边山脉最近有巨魔出没。我需要有人去侦察它们的营地。"',
                    children: [
                        { id: 'accept_patrol', text: '我去侦察', response: '"很好。带上斥候芬恩，他熟悉地形。三天之内回报。"' },
                        { id: 'ask_danger', text: '巨魔危险吗？', response: '"非常危险。成年巨魔有极强的再生能力，除非用火或酸。不要正面硬刚。"' }
                    ]
                },
                {
                    id: 'defense',
                    text: '要塞的防御情况如何？',
                    response: '瓦尔基里亚皱眉："城墙还算坚固，但兵力不足。国王承诺的援军迟迟不到。如果兽人真的进攻……"',
                    children: [
                        { id: 'reinforce', text: '我能帮忙防御', response: '瓦尔基里亚审视着你："你的好意我记下了。但战斗不是儿戏。先证明你的实力。"' },
                        { id: 'politics', text: '为什么不向国王施压？', response: '"军人的职责是守卫，不是政治。我只希望援军能在敌人到来之前赶到。"' }
                    ]
                },
                {
                    id: 'personal',
                    text: '你在这里多久了？',
                    response: '瓦尔基里亚的目光变得柔和了一些："十五年。从一个小兵做到指挥官。这片边境就是我的家。"',
                    children: [
                        { id: 'why', text: '为什么选择留在这里？', response: '"因为如果我不守在这里，身后的人就没有安全可言。这就是军人的使命。"' }
                    ]
                }
            ]
        }
    },
    {
        npcId: 'npc_finn',
        name: '斥候芬恩',
        race: '木精灵',
        role: '斥候',
        location: '边境要塞',
        disposition: 'friendly',
        mood: 'curious',
        moodIntensity: 55,
        affinity: 15,
        trust: 55,
        relationshipType: 'acquaintance',
        notes: '敏捷的木精灵斥候，擅长潜行和追踪。性格开朗，喜欢冒险。',
        dialogueTree: {
            greeting: '芬恩正蹲在城墙上用望远镜观察远方，看到你来了跳了下来："嘿！新面孔！你是来冒险的还是来送死的？"',
            options: [
                {
                    id: 'adventure',
                    text: '当然是来冒险的',
                    response: '芬恩眼睛一亮："太好了！我正好缺个搭档。最近发现了一个有趣的洞穴，但一个人不敢进去。"',
                    children: [
                        { id: 'cave', text: '什么洞穴？', response: '"在要塞西北方向半天路程的地方。入口被藤蔓遮住了，但我听到了里面传来的声音……不是动物。"' },
                        { id: 'decline', text: '我还有别的事', response: '"好吧，那下次再说。不过洞穴可不会等人哦！"' }
                    ]
                },
                {
                    id: 'tracking',
                    text: '教我追踪技巧',
                    response: '芬恩蹲下来指着地面："看，这个脚印——深浅不一，说明这个人走得很急。方向朝东，大概两小时前经过的。"',
                    children: [
                        { id: 'learn_more', text: '还有呢？', response: '"注意折断的树枝、踩过的草地、甚至是气味。森林会告诉你一切，只要你愿意倾听。"' },
                        { id: 'practice', text: '能让我试试吗？', response: '"当然！去那边的小路上看看能发现什么。我在这儿等你。"' }
                    ]
                },
                {
                    id: 'forest',
                    text: '这片森林有什么危险？',
                    response: '芬恩的表情变得认真："狼群、巨蜘蛛、偶尔有熊。但最危险的是东边的沼泽——那里有巫婆。"',
                    children: [
                        { id: 'witch', text: '巫婆？', response: '"一个老巫婆住在沼泽深处。据说她会用魔法把人变成动物。最好别靠近。"' }
                    ]
                }
            ]
        }
    },

    // ---------- 海港城镇 ----------
    {
        npcId: 'npc_black',
        name: '船长布莱克',
        race: '人类',
        role: '船长',
        location: '海港城镇',
        disposition: 'neutral',
        mood: 'neutral',
        moodIntensity: 50,
        affinity: 5,
        trust: 45,
        relationshipType: 'stranger',
        notes: '经验丰富的老船长，他的船"海风号"是港口最可靠的船只。最近因为缺少水手而烦恼。',
        dialogueTree: {
            greeting: '布莱克船长靠在码头的栏杆上，嘴里叼着烟斗："嗯？你要搭船？还是要招水手？"',
            options: [
                {
                    id: 'voyage',
                    text: '我想搭船去远方',
                    response: '布莱克吐出一口烟："去哪里？我的海风号可以到大陆任何港口。价格看距离。"',
                    children: [
                        { id: 'destination', text: '去王都多少钱？', response: '"王都啊……三天航程，五十金币一个人。包吃住。"' },
                        { id: 'danger', text: '海上安全吗？', response: '"最近海盗活动频繁，但我的海风号速度够快，而且我带了加农炮。放心。"' }
                    ]
                },
                {
                    id: 'work',
                    text: '我愿意当水手',
                    response: '布莱克眼睛一亮："哦？你看起来不像水手，但我缺人缺得厉害。工资一个月二十金币，包吃住。"',
                    children: [
                        { id: 'accept_work', text: '我干', response: '"好！明天日出出发，别迟到。先去仓库帮忙搬货。"' },
                        { id: 'ask_duty', text: '水手要做什么？', response: '"升帆、操舵、擦甲板、应对风暴和海盗。海上生活不容易，但自由。"' }
                    ]
                },
                {
                    id: 'sea_story',
                    text: '讲讲你在海上的经历',
                    response: '布莱克的眼神变得深邃："三十年了……我见过海龙在暴风雨中飞翔，见过沉没的黄金之城，也见过太多水手葬身海底。"',
                    children: [
                        { id: 'kraken', text: '真的有海怪吗？', response: '布莱克沉默了一会儿："有一次……我的船被什么东西从下面拖住了。整个船倾斜了三十度。后来它松开了，但我看到了一只巨大的眼睛……比船帆还大。"' },
                        { id: 'treasure', text: '你找到过宝藏吗？', response: '"找到过一次。在一个无人岛上，但那宝藏被诅咒了。我把它放回去了。有些东西不值得拿。"' }
                    ]
                }
            ]
        }
    },
    {
        npcId: 'npc_tom',
        name: '渔夫老汤姆',
        race: '人类',
        role: '渔夫',
        location: '海港城镇',
        disposition: 'friendly',
        mood: 'happy',
        moodIntensity: 45,
        affinity: 20,
        trust: 65,
        relationshipType: 'acquaintance',
        notes: '和蔼的老渔夫，在港口打鱼四十年。对海洋了如指掌，是获取海上情报的好来源。',
        dialogueTree: {
            greeting: '老汤姆正在修补渔网，看到你来了露出缺了几颗牙的笑容："年轻人啊！来，坐下，喝碗鱼汤！"',
            options: [
                {
                    id: 'fish',
                    text: '今天收获怎么样？',
                    response: '老汤姆叹了口气："不如以前了。鱼越来越少了。以前一网下去能捞上百条，现在只有二三十条。"',
                    children: [
                        { id: 'why', text: '为什么鱼变少了？', response: '"可能是那水怪闹的。自从南边河里出现那个东西，鱼群都跑了。"' },
                        { id: 'help', text: '我能帮忙吗？', response: '"你？哈哈，你看起来不像打鱼的料。不过如果你能解决那个水怪，那可帮了大忙了。"' }
                    ]
                },
                {
                    id: 'sea_knowledge',
                    text: '教我一些海洋知识',
                    response: '老汤姆来了精神："海洋啊，那可是个奇妙的地方。潮汐、洋流、风向……都是学问。"',
                    children: [
                        { id: 'tide', text: '怎么看潮汐？', response: '"月亮是关键。满月时潮水最大，新月时最小。记住这个，你就不会在海滩上搁浅了。"' },
                        { id: 'weather', text: '怎么预测天气？', response: '"看云。如果云层压得很低而且发黑，暴风雨要来了。海鸥飞回岸边也是坏兆头。"' }
                    ]
                },
                {
                    id: 'buy_fish',
                    text: '能买些鱼吗？',
                    response: '老汤姆大方地摆摆手："买什么买！自己挑，随便拿。今天运气不错，够吃的。"',
                    children: [
                        { id: 'accept', text: '那就不客气了', response: '"拿着拿着！回去烤着吃最香。改天来，我教你做鱼汤。"' }
                    ]
                }
            ]
        }
    },

    // ---------- 古老废墟 ----------
    {
        npcId: 'npc_ethel',
        name: '幽灵学者艾瑟尔',
        race: '幽灵（生前为高等精灵）',
        role: '学者',
        location: '古老废墟',
        disposition: 'neutral',
        mood: 'sad',
        moodIntensity: 60,
        affinity: 0,
        trust: 40,
        relationshipType: 'stranger',
        notes: '古老废墟中的幽灵，生前是一位博学的高等精灵学者。被困在这里数百年，渴望有人帮助她完成未竟的研究。',
        dialogueTree: {
            greeting: '一个半透明的身影从石柱后浮现，她的声音如同远方的风铃："活人……好久没有见到活人了。你是来探索废墟的吗？"',
            options: [
                {
                    id: 'who',
                    text: '你是谁？',
                    response: '艾瑟尔轻叹一声："我是艾瑟尔，曾经是王都学院的首席学者。那已经是……五百年前的事了。一场灾难将我困在了这里。"',
                    children: [
                        { id: 'disaster', text: '什么灾难？', response: '"一场试图控制时间的魔法实验出了差错。整个学院被时间冻结，而我……变成了这样。"' },
                        { id: 'sympathy', text: '那一定很孤独', response: '艾瑟尔的眼中闪过一丝泪光："五百年的孤独……你无法想象。但至少我还有我的研究。"' }
                    ]
                },
                {
                    id: 'research',
                    text: '你在研究什么？',
                    response: '艾瑟尔兴奋起来："时间魔法！我相信如果能找到我当年的研究笔记，就能解开这个诅咒。笔记应该还在学院的某个地方。"',
                    children: [
                        { id: 'help_find', text: '我帮你找笔记', response: '"你愿意帮忙？太好了！笔记应该在上层的研究室里，但要小心那里的魔法陷阱。"' },
                        { id: 'time_magic', text: '时间魔法是什么？', response: '"最强大也最危险的魔法之一。可以加速、减缓甚至逆转时间。但代价……你也看到了。"' }
                    ]
                },
                {
                    id: 'ruins',
                    text: '告诉我关于这座废墟的事',
                    response: '艾瑟尔环顾四周："这里曾经是精灵最伟大的学院——银月学院。精灵、人类、矮人都在这里学习魔法。现在只剩下残垣断壁了。"',
                    children: [
                        { id: 'treasure', text: '废墟里有宝物吗？', response: '"宝物？也许吧。但最珍贵的是知识。如果你找到了什么古老的文献，请带给我看看。"' },
                        { id: 'danger', text: '废墟里有什么危险？', response: '"魔法陷阱、变异的生物、还有……其他被困在这里的幽灵。有些已经疯了，非常危险。"' }
                    ]
                }
            ]
        }
    },
    {
        npcId: 'npc_skeleton_guard',
        name: '守卫骷髅',
        race: '亡灵（骷髅）',
        role: '守卫',
        location: '古老废墟',
        disposition: 'hostile',
        mood: 'neutral',
        moodIntensity: 80,
        affinity: -50,
        trust: 0,
        relationshipType: 'enemy',
        notes: '被黑暗魔法复活的骷髅守卫，无意识地巡逻着废墟。几乎无法沟通，但似乎还保留着一些守护的本能。',
        dialogueTree: {
            greeting: '骷髅的眼眶中闪烁着幽蓝的光芒，它举起生锈的剑挡在你面前："嘎……止……步……"',
            options: [
                {
                    id: 'fight',
                    text: '准备战斗',
                    response: '骷髅发出刺耳的骨骼摩擦声，向你冲来！',
                    children: [
                        { id: 'attack', text: '发起攻击', response: '你的攻击击碎了骷髅的肋骨，但它还在移动！' },
                        { id: 'magic', text: '使用神圣魔法', response: '神圣的光芒照耀下，骷髅发出一声哀嚎，化为了齑粉。' }
                    ]
                },
                {
                    id: 'turn_undead',
                    text: '尝试驱散亡灵',
                    response: '你举起圣徽，大声念出驱散咒语。骷髅犹豫了一瞬间……',
                    children: [
                        { id: 'success', text: '加大力量', response: '骷髅的蓝色光芒闪烁了几下，它缓缓后退，让开了道路。' },
                        { id: 'fail', text: '力量不够', response: '骷髅重新站稳，幽蓝的光芒更加明亮了。驱散失败！' }
                    ]
                },
                {
                    id: 'sneak',
                    text: '尝试绕过去',
                    response: '你小心翼翼地试图从骷髅身边溜过去……',
                    children: [
                        { id: 'success', text: '潜行通过', response: '骷髅似乎没有注意到你，你成功绕过了它。' },
                        { id: 'fail', text: '踩到了碎石', response: '"咔嚓"一声，骷髅猛地转过头来！你被发现了！' }
                    ]
                }
            ]
        }
    }
];


// ============================================================
// 初始化：创建实例并注册预设 NPC
// ============================================================

/** NPC 注册中心实例 */
const npcRegistry = new NPCRegistry();

/** NPC 情绪系统实例 */
const npcMoodSystem = new NPCMoodSystem();

/** NPC 交互系统实例 */
const npcInteractionSystem = new NPCInteractionSystem(npcMoodSystem, npcRegistry);

// 注册所有预设 NPC
for (const npcData of PRESET_NPCS) {
    const npc = npcRegistry.register(npcData);

    // 同步情绪到情绪系统
    npcMoodSystem.changeMood(npc.npcId, npc.mood, npc.moodIntensity, '初始状态');
}


// ============================================================
// ES6 模块导出
// ============================================================

// ============================================================
// 向后兼容：window 全局赋值
// ============================================================
if (typeof window !== 'undefined') {
    window.npcRegistry = npcRegistry;
    window.npcMoodSystem = npcMoodSystem;
    window.npcInteractionSystem = npcInteractionSystem;
    window.NPCRelationship = NPCRelationship;
    window.NPCMoodSystem = NPCMoodSystem;
    window.NPCInteractionSystem = NPCInteractionSystem;
    window.NPCRegistry = NPCRegistry;
    window.PRESET_NPCS = PRESET_NPCS;
}
