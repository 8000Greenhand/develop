/**
 * inventory.js - D&D RPG 战利品/装备管理系统
 * 管理物品、装备、背包、商店、战利品生成等功能
 * ES6 模块格式
 */

// ============================================================
// Item 类 - 物品基类
// ============================================================

/**
 * @class Item
 * @description 表示游戏中的单个物品实例
 */
export class Item {
    /**
     * 创建一个物品实例
     * @param {Object} data - 物品数据
     */
    constructor(data = {}) {
        // 基础信息
        this.id = data.id || Item.generateId();
        this.name = data.name || '未知物品';
        this.nameEn = data.nameEn || 'Unknown Item';
        this.type = data.type || 'misc'; // weapon/armor/potion/scroll/misc/gold/food/material/key
        this.subtype = data.subtype || '';
        this.rarity = data.rarity || 'common'; // common/uncommon/rare/epic/legendary
        this.description = data.description || '';
        this.icon = data.icon || '📦';

        // 数值属性
        this.weight = data.weight || 0;
        this.value = data.value || 0; // 金币价格
        this.stackable = data.stackable || false;
        this.quantity = data.quantity || 1;
        this.maxStack = data.maxStack || (this.stackable ? 99 : 1);

        // 装备相关
        this.equippable = data.equippable || false;
        this.slot = data.slot || ''; // head/chest/legs/feet/hands/weapon/shield/ring/amulet
        this.stats = data.stats || {}; // 属性加成 {str, dex, con, int, wis, cha, ac, hp, damage}
        this.effects = data.effects || []; // 特殊效果列表
        this.requirements = data.requirements || {}; // 装备需求 {level, class, str, dex}

        // 使用相关
        this.usable = data.usable || false;
        this.useEffect = data.useEffect || null; // 使用效果 {type:'heal'/'buff'/'damage', value, duration, stat}

        // 鉴定
        this.identified = data.identified !== undefined ? data.identified : true;
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    static generateId() {
        return 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    }

    /**
     * 获取稀有度对应的颜色类名
     * @returns {string} CSS颜色类名
     */
    get rarityColor() {
        const colors = {
            common: 'rarity-common',
            uncommon: 'rarity-uncommon',
            rare: 'rarity-rare',
            epic: 'rarity-epic',
            legendary: 'rarity-legendary'
        };
        return colors[this.rarity] || 'rarity-common';
    }

    /**
     * 获取稀有度中文名
     * @returns {string} 稀有度名称
     */
    get rarityName() {
        const names = {
            common: '普通',
            uncommon: '优秀',
            rare: '稀有',
            epic: '史诗',
            legendary: '传说'
        };
        return names[this.rarity] || '普通';
    }

    /**
     * 获取类型中文名
     * @returns {string} 类型名称
     */
    get typeName() {
        const names = {
            weapon: '武器',
            armor: '护甲',
            potion: '药水',
            scroll: '卷轴',
            misc: '杂项',
            gold: '金币',
            food: '食物',
            material: '材料',
            key: '钥匙'
        };
        return names[this.type] || '杂项';
    }

    /**
     * 获取装备槽位中文名
     * @returns {string} 槽位名称
     */
    get slotName() {
        const names = {
            head: '头部',
            chest: '胸部',
            legs: '腿部',
            feet: '脚部',
            hands: '手部',
            weapon: '武器',
            shield: '盾牌',
            ring: '戒指',
            amulet: '项链'
        };
        return names[this.slot] || '';
    }

    /**
     * 将物品序列化为JSON对象
     * @returns {Object} 序列化后的对象
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            nameEn: this.nameEn,
            type: this.type,
            subtype: this.subtype,
            rarity: this.rarity,
            description: this.description,
            icon: this.icon,
            weight: this.weight,
            value: this.value,
            stackable: this.stackable,
            quantity: this.quantity,
            maxStack: this.maxStack,
            equippable: this.equippable,
            slot: this.slot,
            stats: { ...this.stats },
            effects: [...this.effects],
            requirements: { ...this.requirements },
            usable: this.usable,
            useEffect: this.useEffect ? { ...this.useEffect } : null,
            identified: this.identified
        };
    }

    /**
     * 从JSON对象创建物品实例
     * @param {Object} json - 序列化的物品数据
     * @returns {Item} 物品实例
     */
    static fromJSON(json) {
        return new Item(json);
    }

    /**
     * 创建物品的副本
     * @returns {Item} 物品副本
     */
    clone() {
        const data = this.toJSON();
        data.id = Item.generateId(); // 新副本使用新ID
        return new Item(data);
    }
}

// ============================================================
// 装备数据常量 - 预定义装备
// ============================================================

/**
 * @constant {Object[]} EQUIPMENT_DATA
 * @description 预定义的武器和护甲数据
 */
export const EQUIPMENT_DATA = [
    // ---- 武器 (10件) ----

    // 普通 (common)
    {
        id: 'wep_dagger_basic',
        name: '新手匕首',
        nameEn: 'Novice Dagger',
        type: 'weapon',
        subtype: 'light_blade',
        rarity: 'common',
        description: '一把普通的铁制匕首，适合新手冒险者使用。',
        icon: '🗡️',
        weight: 1,
        value: 2,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 1 },
        effects: [],
        requirements: {}
    },
    {
        id: 'wep_club',
        name: '木棍',
        nameEn: 'Wooden Club',
        type: 'weapon',
        subtype: 'bludgeoning',
        rarity: 'common',
        description: '一根结实的木棍，虽然简陋但也能造成伤害。',
        icon: '🏏',
        weight: 2,
        value: 1,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 1 },
        effects: [],
        requirements: {}
    },
    {
        id: 'wep_rusty_sword',
        name: '生锈短剑',
        nameEn: 'Rusty Shortsword',
        type: 'weapon',
        subtype: 'sword',
        rarity: 'common',
        description: '一把布满锈迹的短剑，似乎已经很久没有保养了。',
        icon: '⚔️',
        weight: 2,
        value: 3,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 1 },
        effects: [],
        requirements: {}
    },

    // 优秀 (uncommon)
    {
        id: 'wep_longsword_fine',
        name: '精制长剑',
        nameEn: 'Fine Longsword',
        type: 'weapon',
        subtype: 'sword',
        rarity: 'uncommon',
        description: '一把精心锻造的长剑，剑身锋利且平衡性极佳。',
        icon: '⚔️',
        weight: 3,
        value: 15,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 2 },
        effects: [],
        requirements: {}
    },
    {
        id: 'wep_hunter_bow',
        name: '猎人弓',
        nameEn: "Hunter's Bow",
        type: 'weapon',
        subtype: 'bow',
        rarity: 'uncommon',
        description: '经验丰富的猎人使用的长弓，射程远且精准。',
        icon: '🏹',
        weight: 2,
        value: 25,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 2 },
        effects: [],
        requirements: { dex: 2 }
    },
    {
        id: 'wep_mithril_dagger',
        name: '秘银匕首',
        nameEn: 'Mithril Dagger',
        type: 'weapon',
        subtype: 'light_blade',
        rarity: 'uncommon',
        description: '由秘银打造的匕首，轻巧而锋利，是盗贼的最爱。',
        icon: '🗡️',
        weight: 0.5,
        value: 50,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 2, dex: 1 },
        effects: [],
        requirements: { dex: 2 }
    },

    // 稀有 (rare)
    {
        id: 'wep_flame_sword',
        name: '烈焰之剑',
        nameEn: 'Flame Sword',
        type: 'weapon',
        subtype: 'sword',
        rarity: 'rare',
        description: '剑身燃烧着永不熄灭的火焰，攻击时附带火焰伤害。+2攻击，火焰伤害。',
        icon: '🔥',
        weight: 3,
        value: 200,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 4 },
        effects: ['火焰伤害', '+2攻击加值'],
        requirements: { level: 5 }
    },
    {
        id: 'wep_ice_staff',
        name: '寒冰法杖',
        nameEn: 'Staff of Frost',
        type: 'weapon',
        subtype: 'staff',
        rarity: 'rare',
        description: '由寒冰凝结而成的法杖，散发着刺骨的寒气。+2智力，冰霜伤害。',
        icon: '🧊',
        weight: 4,
        value: 250,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 3, int: 2 },
        effects: ['冰霜伤害', '+2智力加值'],
        requirements: { level: 5, int: 3 }
    },

    // 史诗 (epic)
    {
        id: 'wep_thunder_hammer',
        name: '雷神之锤',
        nameEn: "Thunder God's Hammer",
        type: 'weapon',
        subtype: 'hammer',
        rarity: 'epic',
        description: '传说中雷神使用的战锤，挥动时雷声轰鸣。攻击时附带雷击效果。',
        icon: '🔨',
        weight: 8,
        value: 800,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 6, str: 2 },
        effects: ['雷击效果', '+2力量加值', '击退'],
        requirements: { level: 10, str: 5 }
    },
    {
        id: 'wep_shadow_blade',
        name: '暗影之刃',
        nameEn: 'Shadow Blade',
        type: 'weapon',
        subtype: 'light_blade',
        rarity: 'epic',
        description: '由暗影凝聚而成的刀刃，几乎不可见。+3敏捷，潜行加成。',
        icon: '🌑',
        weight: 1,
        value: 900,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 5, dex: 3 },
        effects: ['潜行加成', '+3敏捷加值', '暗影穿透'],
        requirements: { level: 10, dex: 5 }
    },

    // 传说 (legendary)
    {
        id: 'wep_dragon_slayer',
        name: '屠龙剑',
        nameEn: 'Dragonslayer',
        type: 'weapon',
        subtype: 'greatsword',
        rarity: 'legendary',
        description: '专为屠龙而锻造的巨剑，对龙类生物造成双倍伤害。+4攻击。',
        icon: '⚔️',
        weight: 6,
        value: 5000,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 8, str: 2 },
        effects: ['对龙双倍伤害', '+4攻击加值', '龙威抗性'],
        requirements: { level: 15, str: 6 }
    },
    {
        id: 'wep_spear_of_destiny',
        name: '命运之矛',
        nameEn: 'Spear of Destiny',
        type: 'weapon',
        subtype: 'spear',
        rarity: 'legendary',
        description: '据说能决定命运走向的神器之矛，暴击范围扩大。命中即可能改变战局。',
        icon: '🔱',
        weight: 5,
        value: 6000,
        stackable: false,
        equippable: true,
        slot: 'weapon',
        stats: { damage: 7, dex: 2, str: 2 },
        effects: ['暴击范围扩大', '+2力量加值', '+2敏捷加值', '命运审判'],
        requirements: { level: 15 }
    },

    // ---- 护甲 (8件) ----

    // 普通 (common)
    {
        id: 'arm_leather',
        name: '皮甲',
        nameEn: 'Leather Armor',
        type: 'armor',
        subtype: 'light',
        rarity: 'common',
        description: '用鞣制皮革制成的轻甲，提供基本的防护。AC+2。',
        icon: '🦺',
        weight: 10,
        value: 10,
        stackable: false,
        equippable: true,
        slot: 'chest',
        stats: { ac: 2 },
        effects: [],
        requirements: {}
    },
    {
        id: 'arm_cloth',
        name: '布衣',
        nameEn: 'Cloth Robe',
        type: 'armor',
        subtype: 'cloth',
        rarity: 'common',
        description: '普通的布制衣物，聊胜于无。AC+1。',
        icon: '👔',
        weight: 3,
        value: 1,
        stackable: false,
        equippable: true,
        slot: 'chest',
        stats: { ac: 1 },
        effects: [],
        requirements: {}
    },

    // 优秀 (uncommon)
    {
        id: 'arm_chainmail',
        name: '锁子甲',
        nameEn: 'Chain Mail',
        type: 'armor',
        subtype: 'medium',
        rarity: 'uncommon',
        description: '由金属环编织而成的锁子甲，防护性能良好。AC+4。',
        icon: '🛡️',
        weight: 20,
        value: 75,
        stackable: false,
        equippable: true,
        slot: 'chest',
        stats: { ac: 4 },
        effects: [],
        requirements: { str: 3 }
    },
    {
        id: 'arm_fine_leather',
        name: '精制皮甲',
        nameEn: 'Fine Leather Armor',
        type: 'armor',
        subtype: 'light',
        rarity: 'uncommon',
        description: '由熟练工匠精心制作的皮甲，轻便且灵活。AC+3，+1敏捷。',
        icon: '🦺',
        weight: 8,
        value: 45,
        stackable: false,
        equippable: true,
        slot: 'chest',
        stats: { ac: 3, dex: 1 },
        effects: [],
        requirements: {}
    },

    // 稀有 (rare)
    {
        id: 'arm_mithril_chest',
        name: '秘银胸甲',
        nameEn: 'Mithril Breastplate',
        type: 'armor',
        subtype: 'medium',
        rarity: 'rare',
        description: '由珍贵的秘银锻造的胸甲，轻如鸿毛却坚如磐石。AC+6。',
        icon: '🛡️',
        weight: 12,
        value: 400,
        stackable: false,
        equippable: true,
        slot: 'chest',
        stats: { ac: 6 },
        effects: ['秘银材质'],
        requirements: { level: 5 }
    },
    {
        id: 'arm_dragon_scale',
        name: '龙鳞甲',
        nameEn: 'Dragon Scale Armor',
        type: 'armor',
        subtype: 'heavy',
        rarity: 'rare',
        description: '用真正的龙鳞制成的护甲，具有天然的火焰抗性。AC+7，火焰抗性。',
        icon: '🐉',
        weight: 25,
        value: 500,
        stackable: false,
        equippable: true,
        slot: 'chest',
        stats: { ac: 7 },
        effects: ['火焰抗性'],
        requirements: { level: 7, str: 4 }
    },

    // 史诗 (epic)
    {
        id: 'arm_elven_king',
        name: '精灵王之铠',
        nameEn: 'Elven King Armor',
        type: 'armor',
        subtype: 'medium',
        rarity: 'epic',
        description: '远古精灵王族的传世铠甲，蕴含着精灵魔法的力量。AC+8，+2全属性。',
        icon: '👑',
        weight: 15,
        value: 1500,
        stackable: false,
        equippable: true,
        slot: 'chest',
        stats: { ac: 8, str: 2, dex: 2, con: 2, int: 2, wis: 2, cha: 2 },
        effects: ['+2全属性加值', '精灵魔法护盾'],
        requirements: { level: 12 }
    },

    // 传说 (legendary)
    {
        id: 'arm_undying_shield',
        name: '不灭之盾',
        nameEn: 'Undying Aegis',
        type: 'armor',
        subtype: 'heavy',
        rarity: 'legendary',
        description: '据说是由神明亲手锻造的传奇盾甲，穿戴者免疫一切暴击。AC+10。',
        icon: '🛡️',
        weight: 30,
        value: 8000,
        stackable: false,
        equippable: true,
        slot: 'chest',
        stats: { ac: 10, con: 3, hp: 20 },
        effects: ['免疫暴击', '+3体质加值', '+20生命值', '不灭意志'],
        requirements: { level: 18, str: 6 }
    }
];

/**
 * @constant {Object[]} POTIONS_DATA
 * @description 预定义的药水数据
 */
export const POTIONS_DATA = [
    {
        id: 'pot_heal_minor',
        name: '治疗药水',
        nameEn: 'Potion of Healing',
        type: 'potion',
        subtype: 'healing',
        rarity: 'common',
        description: '一瓶散发微光的红色液体，饮用后恢复2d4+2点生命值。',
        icon: '🧪',
        weight: 0.5,
        value: 50,
        stackable: true,
        maxStack: 10,
        equippable: false,
        usable: true,
        useEffect: { type: 'heal', value: '2d4+2', duration: 0, stat: 'hp' }
    },
    {
        id: 'pot_heal_greater',
        name: '高级治疗药水',
        nameEn: 'Potion of Greater Healing',
        type: 'potion',
        subtype: 'healing',
        rarity: 'uncommon',
        description: '一瓶浓郁的金色液体，饮用后恢复4d4+4点生命值。',
        icon: '🧪',
        weight: 0.5,
        value: 150,
        stackable: true,
        maxStack: 10,
        equippable: false,
        usable: true,
        useEffect: { type: 'heal', value: '4d4+4', duration: 0, stat: 'hp' }
    },
    {
        id: 'pot_heal_supreme',
        name: '强效治疗药水',
        nameEn: 'Potion of Supreme Healing',
        type: 'potion',
        subtype: 'healing',
        rarity: 'rare',
        description: '一瓶闪烁着神圣光芒的液体，饮用后恢复8d4+8点生命值。',
        icon: '🧪',
        weight: 0.5,
        value: 500,
        stackable: true,
        maxStack: 10,
        equippable: false,
        usable: true,
        useEffect: { type: 'heal', value: '8d4+8', duration: 0, stat: 'hp' }
    },
    {
        id: 'pot_str',
        name: '力量药水',
        nameEn: 'Potion of Strength',
        type: 'potion',
        subtype: 'buff',
        rarity: 'uncommon',
        description: '一瓶猩红色的药水，饮用后力量+2，持续1小时。',
        icon: '💪',
        weight: 0.5,
        value: 200,
        stackable: true,
        maxStack: 5,
        equippable: false,
        usable: true,
        useEffect: { type: 'buff', value: 2, duration: 60, stat: 'str' }
    },
    {
        id: 'pot_dex',
        name: '敏捷药水',
        nameEn: 'Potion of Dexterity',
        type: 'potion',
        subtype: 'buff',
        rarity: 'uncommon',
        description: '一瓶翠绿色的药水，饮用后敏捷+2，持续1小时。',
        icon: '🏃',
        weight: 0.5,
        value: 200,
        stackable: true,
        maxStack: 5,
        equippable: false,
        usable: true,
        useEffect: { type: 'buff', value: 2, duration: 60, stat: 'dex' }
    },
    {
        id: 'pot_ac',
        name: '防护药水',
        nameEn: 'Potion of Protection',
        type: 'potion',
        subtype: 'buff',
        rarity: 'uncommon',
        description: '一瓶淡蓝色的药水，饮用后护甲等级+2，持续1小时。',
        icon: '🔵',
        weight: 0.5,
        value: 250,
        stackable: true,
        maxStack: 5,
        equippable: false,
        usable: true,
        useEffect: { type: 'buff', value: 2, duration: 60, stat: 'ac' }
    }
];

/**
 * @constant {Object[]} SCROLL_DATA
 * @description 预定义的卷轴和杂项物品数据
 */
export const SCROLL_DATA = [
    {
        id: 'scr_fireball',
        name: '火球术卷轴',
        nameEn: 'Scroll of Fireball',
        type: 'scroll',
        subtype: 'spell',
        rarity: 'rare',
        description: '一张写有火球术符文的古老卷轴，使用后释放一颗巨大的火球。',
        icon: '📜',
        weight: 0.1,
        value: 300,
        stackable: true,
        maxStack: 3,
        equippable: false,
        usable: true,
        useEffect: { type: 'damage', value: '8d6', duration: 0, stat: 'fire' }
    },
    {
        id: 'scr_teleport',
        name: '传送术卷轴',
        nameEn: 'Scroll of Teleport',
        type: 'scroll',
        subtype: 'spell',
        rarity: 'rare',
        description: '一张写有传送术符文的卷轴，使用后可以传送到已知地点。',
        icon: '📜',
        weight: 0.1,
        value: 400,
        stackable: true,
        maxStack: 3,
        equippable: false,
        usable: true,
        useEffect: { type: 'buff', value: 0, duration: 0, stat: 'teleport' }
    },
    {
        id: 'scr_identify',
        name: '鉴定卷轴',
        nameEn: 'Scroll of Identify',
        type: 'scroll',
        subtype: 'utility',
        rarity: 'uncommon',
        description: '一张写有鉴定术符文的卷轴，使用后可以鉴定一件未鉴定的物品。',
        icon: '📜',
        weight: 0.1,
        value: 100,
        stackable: true,
        maxStack: 5,
        equippable: false,
        usable: true,
        useEffect: { type: 'buff', value: 0, duration: 0, stat: 'identify' }
    },
    {
        id: 'scr_revive',
        name: '复活卷轴',
        nameEn: 'Scroll of Revival',
        type: 'scroll',
        subtype: 'spell',
        rarity: 'epic',
        description: '一张蕴含强大生命力量的卷轴，可以复活一名已死亡的同伴。',
        icon: '📜',
        weight: 0.1,
        value: 1000,
        stackable: true,
        maxStack: 1,
        equippable: false,
        usable: true,
        useEffect: { type: 'heal', value: 'revive', duration: 0, stat: 'hp' }
    },
    {
        id: 'misc_mystery_map',
        name: '神秘地图',
        nameEn: 'Mystery Map',
        type: 'misc',
        subtype: 'quest',
        rarity: 'uncommon',
        description: '一张标注着未知区域的古老地图，似乎指向某个隐藏的宝藏。',
        icon: '🗺️',
        weight: 0.1,
        value: 100,
        stackable: false,
        equippable: false,
        usable: false
    },
    {
        id: 'key_ancient',
        name: '古老钥匙',
        nameEn: 'Ancient Key',
        type: 'key',
        subtype: 'quest',
        rarity: 'rare',
        description: '一把造型奇特的古老钥匙，上面刻满了神秘的符文。也许能打开某扇重要的门。',
        icon: '🔑',
        weight: 0.2,
        value: 0,
        stackable: false,
        equippable: false,
        usable: false
    }
];

// ============================================================
// InventoryManager 类 - 背包/装备管理器
// ============================================================

/**
 * @class InventoryManager
 * @description 管理玩家的背包、装备、金币和交易
 */
export class InventoryManager {
    /**
     * 创建背包管理器
     * @param {Object} options - 配置选项
     * @param {number} options.maxWeight - 最大负重，默认150
     * @param {number} options.maxSlots - 最大格子数，默认30
     */
    constructor(options = {}) {
        /** @type {Map<string, Item>} 所有物品 */
        this.items = new Map();

        /** @type {Object} 已装备的物品 { head, chest, legs, feet, hands, weapon, shield, ring, amulet } */
        this.equipment = {
            head: null,
            chest: null,
            legs: null,
            feet: null,
            hands: null,
            weapon: null,
            shield: null,
            ring: null,
            amulet: null
        };

        /** @type {number} 金币数量 */
        this.gold = 0;

        /** @type {number} 最大负重 */
        this.maxWeight = options.maxWeight || 150;

        /** @type {number} 最大格子数 */
        this.maxSlots = options.maxSlots || 30;
    }

    // ---- 物品增删查 ----

    /**
     * 添加物品到背包（支持自动堆叠）
     * @param {Object|Item} itemData - 物品数据或Item实例
     * @returns {{ success: boolean, message: string, item?: Item }} 操作结果
     */
    addItem(itemData) {
        const item = itemData instanceof Item ? itemData : new Item(itemData);

        // 检查格子是否已满
        if (!item.stackable && this.items.size >= this.maxSlots) {
            return { success: false, message: '背包已满，无法添加新物品。' };
        }

        // 检查负重
        if (this.getTotalWeight() + item.weight * item.quantity > this.maxWeight) {
            return { success: false, message: '负重已满，无法携带更多物品。' };
        }

        // 如果是金币类型，直接加金币
        if (item.type === 'gold') {
            this.gold += item.value * item.quantity;
            return { success: true, message: `获得 ${item.value * item.quantity} 金币。` };
        }

        // 尝试堆叠
        if (item.stackable) {
            for (const [existingId, existingItem] of this.items) {
                if (existingItem.name === item.name &&
                    existingItem.rarity === item.rarity &&
                    existingItem.type === item.type) {
                    // 同名同稀有度物品，尝试堆叠
                    const canAdd = Math.min(item.quantity, existingItem.maxStack - existingItem.quantity);
                    if (canAdd > 0) {
                        existingItem.quantity += canAdd;
                        const remaining = item.quantity - canAdd;
                        if (remaining > 0) {
                            // 剩余部分作为新物品添加
                            const newItem = item.clone();
                            newItem.quantity = remaining;
                            this.items.set(newItem.id, newItem);
                        }
                        return { success: true, message: `添加了 ${item.quantity} 个 ${item.name}。`, item: existingItem };
                    }
                }
            }
        }

        // 非堆叠或无法堆叠，直接添加
        this.items.set(item.id, item);
        return { success: true, message: `获得 ${item.name}。`, item };
    }

    /**
     * 从背包移除物品
     * @param {string} itemId - 物品ID
     * @param {number} quantity - 移除数量，默认1
     * @returns {{ success: boolean, message: string }} 操作结果
     */
    removeItem(itemId, quantity = 1) {
        const item = this.items.get(itemId);
        if (!item) {
            return { success: false, message: '物品不存在。' };
        }

        if (item.quantity <= quantity) {
            this.items.delete(itemId);
            return { success: true, message: `移除了 ${item.name}。` };
        } else {
            item.quantity -= quantity;
            return { success: true, message: `移除了 ${quantity} 个 ${item.name}。` };
        }
    }

    /**
     * 根据ID获取物品
     * @param {string} itemId - 物品ID
     * @returns {Item|null} 物品实例或null
     */
    getItem(itemId) {
        return this.items.get(itemId) || null;
    }

    /**
     * 获取背包中所有物品
     * @returns {Item[]} 物品数组
     */
    getAllItems() {
        return Array.from(this.items.values());
    }

    /**
     * 按类型获取物品
     * @param {string} type - 物品类型
     * @returns {Item[]} 符合类型的物品数组
     */
    getItemsByType(type) {
        return this.getAllItems().filter(item => item.type === type);
    }

    /**
     * 按稀有度获取物品
     * @param {string} rarity - 稀有度
     * @returns {Item[]} 符合稀有度的物品数组
     */
    getItemsByRarity(rarity) {
        return this.getAllItems().filter(item => item.rarity === rarity);
    }

    // ---- 装备管理 ----

    /**
     * 装备物品（检查需求）
     * @param {string} itemId - 物品ID
     * @param {Object} characterStats - 角色属性（用于检查装备需求）
     * @returns {{ success: boolean, message: string }} 操作结果
     */
    equipItem(itemId, characterStats = {}) {
        const item = this.items.get(itemId);
        if (!item) {
            return { success: false, message: '物品不存在。' };
        }

        if (!item.equippable || !item.slot) {
            return { success: false, message: '该物品无法装备。' };
        }

        // 检查装备需求
        if (item.requirements) {
            // 等级需求
            if (item.requirements.level && (characterStats.level || 1) < item.requirements.level) {
                return { success: false, message: `需要等级 ${item.requirements.level} 才能装备。` };
            }
            // 力量需求
            if (item.requirements.str && (characterStats.str || 0) < item.requirements.str) {
                return { success: false, message: `需要力量 ${item.requirements.str} 才能装备。` };
            }
            // 敏捷需求
            if (item.requirements.dex && (characterStats.dex || 0) < item.requirements.dex) {
                return { success: false, message: `需要敏捷 ${item.requirements.dex} 才能装备。` };
            }
            // 智力需求
            if (item.requirements.int && (characterStats.int || 0) < item.requirements.int) {
                return { success: false, message: `需要智力 ${item.requirements.int} 才能装备。` };
            }
            // 职业需求
            if (item.requirements.class && characterStats.class !== item.requirements.class) {
                return { success: false, message: `需要 ${item.requirements.class} 职业才能装备。` };
            }
        }

        // 如果该槽位已有装备，先卸下
        const currentEquipped = this.equipment[item.slot];
        if (currentEquipped) {
            this.unequipItem(item.slot);
        }

        // 从背包移除并装备
        this.items.delete(itemId);
        this.equipment[item.slot] = item;

        return { success: true, message: `装备了 ${item.name}。` };
    }

    /**
     * 卸下装备
     * @param {string} slot - 装备槽位
     * @returns {{ success: boolean, message: string }} 操作结果
     */
    unequipItem(slot) {
        const item = this.equipment[slot];
        if (!item) {
            return { success: false, message: '该槽位没有装备。' };
        }

        // 检查背包是否有空位
        if (this.items.size >= this.maxSlots) {
            return { success: false, message: '背包已满，无法卸下装备。' };
        }

        // 从装备栏移除，放回背包
        this.equipment[slot] = null;
        this.items.set(item.id, item);

        return { success: true, message: `卸下了 ${item.name}。` };
    }

    /**
     * 计算已装备物品的总属性加成
     * @returns {Object} 总属性加成 { str, dex, con, int, wis, cha, ac, hp, damage }
     */
    getEquippedStats() {
        const total = {
            str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0,
            ac: 0, hp: 0, damage: 0
        };

        for (const slot of Object.keys(this.equipment)) {
            const item = this.equipment[slot];
            if (item && item.stats) {
                for (const stat of Object.keys(total)) {
                    if (item.stats[stat]) {
                        total[stat] += item.stats[stat];
                    }
                }
            }
        }

        return total;
    }

    /**
     * 获取所有已装备物品
     * @returns {Object} 已装备物品对象
     */
    getEquippedItems() {
        return { ...this.equipment };
    }

    // ---- 物品使用 ----

    /**
     * 使用物品（药水/卷轴等）
     * @param {string} itemId - 物品ID
     * @returns {{ success: boolean, message: string, effect?: Object }} 操作结果
     */
    useItem(itemId) {
        const item = this.items.get(itemId);
        if (!item) {
            return { success: false, message: '物品不存在。' };
        }

        if (!item.usable || !item.useEffect) {
            return { success: false, message: '该物品无法使用。' };
        }

        // 减少数量
        if (item.quantity <= 1) {
            this.items.delete(itemId);
        } else {
            item.quantity -= 1;
        }

        return {
            success: true,
            message: `使用了 ${item.name}。`,
            effect: item.useEffect,
            item: item
        };
    }

    // ---- 排序 ----

    /**
     * 对背包物品进行排序
     * @param {string} sortBy - 排序方式: name/type/rarity/value/weight
     * @param {boolean} ascending - 是否升序，默认true
     * @returns {Item[]} 排序后的物品数组
     */
    sortItems(sortBy = 'name', ascending = true) {
        const items = this.getAllItems();

        const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
        const typeOrder = { weapon: 1, armor: 2, potion: 3, scroll: 4, food: 5, material: 6, key: 7, misc: 8 };

        items.sort((a, b) => {
            let compareA, compareB;

            switch (sortBy) {
                case 'name':
                    compareA = a.name;
                    compareB = b.name;
                    return ascending ? compareA.localeCompare(compareB, 'zh') : compareB.localeCompare(compareA, 'zh');
                case 'type':
                    compareA = typeOrder[a.type] || 9;
                    compareB = typeOrder[b.type] || 9;
                    break;
                case 'rarity':
                    compareA = rarityOrder[a.rarity] || 0;
                    compareB = rarityOrder[b.rarity] || 0;
                    break;
                case 'value':
                    compareA = a.value;
                    compareB = b.value;
                    break;
                case 'weight':
                    compareA = a.weight;
                    compareB = b.weight;
                    break;
                default:
                    compareA = a.name;
                    compareB = b.name;
                    return ascending ? compareA.localeCompare(compareB, 'zh') : compareB.localeCompare(compareA, 'zh');
            }

            return ascending ? compareA - compareB : compareB - compareA;
        });

        // 重建Map以反映排序
        this.items.clear();
        items.forEach(item => this.items.set(item.id, item));

        return items;
    }

    // ---- 背包状态 ----

    /**
     * 计算背包中所有物品的总重量
     * @returns {number} 总重量
     */
    getTotalWeight() {
        let total = 0;
        for (const [, item] of this.items) {
            total += item.weight * item.quantity;
        }
        // 加上已装备物品的重量
        for (const slot of Object.keys(this.equipment)) {
            const item = this.equipment[slot];
            if (item) {
                total += item.weight;
            }
        }
        return total;
    }

    /**
     * 获取剩余可用格子数
     * @returns {number} 剩余格子数
     */
    getRemainingSlots() {
        return this.maxSlots - this.items.size;
    }

    /**
     * 检查背包是否已满
     * @returns {boolean} 是否已满
     */
    isFull() {
        return this.items.size >= this.maxSlots;
    }

    // ---- 金币与交易 ----

    /**
     * 增减金币
     * @param {number} amount - 金额（正数为增加，负数为减少）
     * @returns {{ success: boolean, message: string }} 操作结果
     */
    addGold(amount) {
        if (amount < 0 && this.gold + amount < 0) {
            return { success: false, message: '金币不足。' };
        }
        this.gold += amount;
        if (amount >= 0) {
            return { success: true, message: `获得 ${amount} 金币。当前金币: ${this.gold}` };
        } else {
            return { success: true, message: `花费 ${Math.abs(amount)} 金币。当前金币: ${this.gold}` };
        }
    }

    /**
     * 检查是否买得起
     * @param {number} cost - 价格
     * @returns {boolean} 是否买得起
     */
    canAfford(cost) {
        return this.gold >= cost;
    }

    /**
     * 购买物品
     * @param {Object|Item} item - 物品数据或Item实例
     * @param {number} cost - 价格
     * @returns {{ success: boolean, message: string }} 操作结果
     */
    buyItem(item, cost) {
        if (!this.canAfford(cost)) {
            return { success: false, message: '金币不足，无法购买。' };
        }

        const result = this.addItem(item);
        if (!result.success) {
            return result;
        }

        this.gold -= cost;
        result.message = `购买了 ${item.name || result.item?.name}，花费 ${cost} 金币。`;
        return result;
    }

    /**
     * 出售物品（半价回收）
     * @param {string} itemId - 物品ID
     * @returns {{ success: boolean, message: string, gold?: number }} 操作结果
     */
    sellItem(itemId) {
        const item = this.items.get(itemId);
        if (!item) {
            return { success: false, message: '物品不存在。' };
        }

        // 出售价格为半价
        const sellPrice = Math.floor(item.value / 2);

        // 从背包移除
        this.items.delete(itemId);

        // 增加金币
        this.gold += sellPrice;

        return {
            success: true,
            message: `出售了 ${item.name}，获得 ${sellPrice} 金币。`,
            gold: sellPrice
        };
    }

    // ---- 鉴定 ----

    /**
     * 鉴定物品（揭示未鉴定物品的属性）
     * @param {string} itemId - 物品ID
     * @returns {{ success: boolean, message: string, item?: Item }} 操作结果
     */
    identifyItem(itemId) {
        const item = this.items.get(itemId);
        if (!item) {
            return { success: false, message: '物品不存在。' };
        }

        if (item.identified) {
            return { success: false, message: '该物品已经鉴定过了。' };
        }

        item.identified = true;
        return { success: true, message: `成功鉴定了 ${item.name}！`, item };
    }

    // ---- 序列化与存档 ----

    /**
     * 将背包管理器序列化为JSON对象
     * @returns {Object} 序列化后的对象
     */
    toJSON() {
        const itemsArray = [];
        for (const [, item] of this.items) {
            itemsArray.push(item.toJSON());
        }

        const equipmentObj = {};
        for (const [slot, item] of Object.entries(this.equipment)) {
            equipmentObj[slot] = item ? item.toJSON() : null;
        }

        return {
            items: itemsArray,
            equipment: equipmentObj,
            gold: this.gold,
            maxWeight: this.maxWeight,
            maxSlots: this.maxSlots
        };
    }

    /**
     * 从JSON对象恢复背包管理器
     * @param {Object} json - 序列化的数据
     * @returns {InventoryManager} 恢复后的实例
     */
    static fromJSON(json) {
        const manager = new InventoryManager({
            maxWeight: json.maxWeight || 150,
            maxSlots: json.maxSlots || 30
        });

        // 恢复物品
        if (json.items && Array.isArray(json.items)) {
            json.items.forEach(itemData => {
                const item = Item.fromJSON(itemData);
                manager.items.set(item.id, item);
            });
        }

        // 恢复装备
        if (json.equipment) {
            for (const [slot, itemData] of Object.entries(json.equipment)) {
                if (itemData && manager.equipment.hasOwnProperty(slot)) {
                    manager.equipment[slot] = Item.fromJSON(itemData);
                }
            }
        }

        // 恢复金币
        manager.gold = json.gold || 0;

        return manager;
    }

    /**
     * 保存背包数据到 localStorage
     * @param {string} saveKey - 存档键名，默认 'dnd_inventory'
     * @returns {boolean} 是否保存成功
     */
    save(saveKey = 'dnd_inventory') {
        try {
            const data = this.toJSON();
            localStorage.setItem(saveKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存背包数据失败:', e);
            return false;
        }
    }

    /**
     * 从 localStorage 加载背包数据
     * @param {string} saveKey - 存档键名，默认 'dnd_inventory'
     * @returns {boolean} 是否加载成功
     */
    load(saveKey = 'dnd_inventory') {
        try {
            const raw = localStorage.getItem(saveKey);
            if (!raw) return false;

            const data = JSON.parse(raw);
            const loaded = InventoryManager.fromJSON(data);

            // 恢复数据到当前实例
            this.items = loaded.items;
            this.equipment = loaded.equipment;
            this.gold = loaded.gold;
            this.maxWeight = loaded.maxWeight;
            this.maxSlots = loaded.maxSlots;

            return true;
        } catch (e) {
            console.error('加载背包数据失败:', e);
            return false;
        }
    }
}

// ============================================================
// LootGenerator 类 - 战利品生成器
// ============================================================

/**
 * @class LootGenerator
 * @description 根据挑战等级和地点生成战利品
 */
export class LootGenerator {
    constructor() {
        // 稀有度权重表（根据CR调整）
        this.rarityWeights = {
            0: { common: 90, uncommon: 10, rare: 0, epic: 0, legendary: 0 },
            1: { common: 70, uncommon: 25, rare: 5, epic: 0, legendary: 0 },
            2: { common: 55, uncommon: 30, rare: 12, epic: 3, legendary: 0 },
            3: { common: 40, uncommon: 30, rare: 20, epic: 8, legendary: 2 },
            4: { common: 25, uncommon: 30, rare: 25, epic: 15, legendary: 5 },
            5: { common: 15, uncommon: 25, rare: 30, epic: 20, legendary: 10 }
        };

        // 地点类型对应的物品倾向
        this.locationTypes = {
            dungeon: { weapon: 30, armor: 30, potion: 15, scroll: 10, misc: 10, gold: 5 },
            forest: { weapon: 15, armor: 10, potion: 25, scroll: 5, misc: 25, gold: 20, material: 15 },
            cave: { weapon: 20, armor: 20, potion: 10, scroll: 5, misc: 15, gold: 20, material: 10 },
            city: { weapon: 20, armor: 20, potion: 25, scroll: 15, misc: 10, gold: 10 },
            ruins: { weapon: 25, armor: 25, potion: 10, scroll: 15, misc: 10, gold: 5, key: 10 },
            tower: { weapon: 15, armor: 15, potion: 15, scroll: 30, misc: 10, gold: 5, key: 10 }
        };

        // 所有预定义物品数据合集
        this.allEquipment = [...EQUIPMENT_DATA, ...POTIONS_DATA, ...SCROLL_DATA];
    }

    /**
     * 根据权重随机选择
     * @param {Object} weights - 权重对象 { key: weight }
     * @returns {string} 被选中的key
     */
    _weightedRandom(weights) {
        const entries = Object.entries(weights);
        const total = entries.reduce((sum, [, w]) => sum + w, 0);
        let random = Math.random() * total;

        for (const [key, weight] of entries) {
            random -= weight;
            if (random <= 0) return key;
        }

        return entries[entries.length - 1][0];
    }

    /**
     * 根据CR和地点生成战利品
     * @param {number} cr - 挑战等级 (0-5+)
     * @param {string} location - 地点类型 (dungeon/forest/cave/city/ruins/tower)
     * @returns {Item[]} 生成的战利品数组
     */
    generateLoot(cr = 0, location = 'dungeon') {
        const loot = [];

        // 确定CR等级（映射到权重表）
        const crLevel = Math.min(Math.max(Math.floor(cr), 0), 5);
        const rarityWeights = this.rarityWeights[crLevel];
        const locationWeights = this.locationTypes[location] || this.locationTypes.dungeon;

        // 生成物品数量（1~3个基础 + CR加成）
        const itemCount = Math.floor(Math.random() * 3) + 1 + Math.floor(cr / 3);

        for (let i = 0; i < itemCount; i++) {
            // 根据地点权重决定物品类型
            const itemType = this._weightedRandom(locationWeights);

            // 根据CR权重决定稀有度
            const rarity = this._weightedRandom(rarityWeights);

            // 根据类型生成物品
            let item = null;

            switch (itemType) {
                case 'weapon':
                case 'armor':
                    item = this.rollMagicItem(rarity, itemType);
                    break;
                case 'potion':
                    item = this.rollPotion(rarity);
                    break;
                case 'scroll':
                    item = this.rollScroll(rarity);
                    break;
                case 'gold':
                    // 生成金币（直接返回金币数量）
                    const goldAmount = Math.floor((Math.random() * 10 + 5) * (cr + 1));
                    const goldItem = new Item({
                        name: '金币',
                        nameEn: 'Gold Coins',
                        type: 'gold',
                        icon: '💰',
                        value: goldAmount,
                        quantity: 1
                    });
                    loot.push(goldItem);
                    continue;
                case 'material':
                    item = this._rollMaterial(cr);
                    break;
                case 'key':
                    item = this._rollKey(cr);
                    break;
                default:
                    item = this._rollMisc(cr);
                    break;
            }

            if (item) {
                loot.push(item);
            }
        }

        return loot;
    }

    /**
     * 生成宝箱内容
     * @param {number} tier - 宝箱等级 (1-5)
     * @returns {Item[]} 宝箱中的物品
     */
    generateTreasure(tier = 1) {
        const tierLevel = Math.min(Math.max(tier, 1), 5);
        const loot = [];

        // 宝箱等级对应的稀有度权重
        const tierRarity = {
            1: { common: 80, uncommon: 20, rare: 0, epic: 0, legendary: 0 },
            2: { common: 50, uncommon: 35, rare: 15, epic: 0, legendary: 0 },
            3: { common: 30, uncommon: 35, rare: 25, epic: 10, legendary: 0 },
            4: { common: 15, uncommon: 25, rare: 30, epic: 20, legendary: 10 },
            5: { common: 5, uncommon: 15, rare: 30, epic: 30, legendary: 20 }
        };

        const rarityWeights = tierRarity[tierLevel];

        // 宝箱物品数量
        const itemCount = tierLevel + Math.floor(Math.random() * 2) + 1;

        // 必定有金币
        const goldAmount = Math.floor((Math.random() * 20 + 10) * tierLevel * tierLevel);
        loot.push(new Item({
            name: '金币',
            nameEn: 'Gold Coins',
            type: 'gold',
            icon: '💰',
            value: goldAmount,
            quantity: 1
        }));

        // 生成其他物品
        for (let i = 0; i < itemCount; i++) {
            const rarity = this._weightedRandom(rarityWeights);
            const roll = Math.random();

            if (roll < 0.35) {
                // 武器
                const item = this.rollMagicItem(rarity, 'weapon');
                if (item) loot.push(item);
            } else if (roll < 0.65) {
                // 护甲
                const item = this.rollMagicItem(rarity, 'armor');
                if (item) loot.push(item);
            } else if (roll < 0.85) {
                // 药水
                const item = this.rollPotion(rarity);
                if (item) loot.push(item);
            } else {
                // 卷轴
                const item = this.rollScroll(rarity);
                if (item) loot.push(item);
            }
        }

        return loot;
    }

    /**
     * 随机生成魔法物品（武器或护甲）
     * @param {string} rarity - 稀有度
     * @param {string} preferType - 偏好类型 (weapon/armor)
     * @returns {Item|null} 生成的物品
     */
    rollMagicItem(rarity = 'common', preferType = 'weapon') {
        // 从预定义装备中筛选
        const filtered = this.allEquipment.filter(item => {
            if (item.rarity !== rarity) return false;
            if (preferType === 'weapon' && item.type === 'weapon') return true;
            if (preferType === 'armor' && item.type === 'armor') return true;
            return item.type === 'weapon' || item.type === 'armor';
        });

        if (filtered.length === 0) {
            // 如果没有匹配的预定义物品，生成随机物品
            return this._generateRandomMagicItem(rarity, preferType);
        }

        // 随机选择一件
        const template = filtered[Math.floor(Math.random() * filtered.length)];
        return new Item(template);
    }

    /**
     * 随机生成药水
     * @param {string} rarity - 稀有度
     * @returns {Item} 生成的药水
     */
    rollPotion(rarity = 'common') {
        // 从预定义药水中筛选
        const potions = POTIONS_DATA.filter(p => {
            if (rarity === 'common') return p.rarity === 'common';
            if (rarity === 'uncommon') return p.rarity === 'uncommon';
            // 稀有及以上可以生成低级药水
            return true;
        });

        if (potions.length === 0) {
            // 兜底：生成普通治疗药水
            return new Item(POTIONS_DATA[0]);
        }

        const template = potions[Math.floor(Math.random() * potions.length)];
        const item = new Item(template);

        // 随机数量 (1-3)
        item.quantity = Math.floor(Math.random() * 3) + 1;

        return item;
    }

    /**
     * 随机生成卷轴
     * @param {string} rarity - 稀有度
     * @returns {Item} 生成的卷轴
     */
    rollScroll(rarity = 'common') {
        const scrolls = SCROLL_DATA.filter(s => {
            if (s.type !== 'scroll') return false;
            if (rarity === 'common') return s.rarity === 'common' || s.rarity === 'uncommon';
            if (rarity === 'uncommon') return s.rarity === 'uncommon' || s.rarity === 'rare';
            return true;
        });

        if (scrolls.length === 0) {
            return new Item(SCROLL_DATA[0]); // 兜底
        }

        const template = scrolls[Math.floor(Math.random() * scrolls.length)];
        return new Item(template);
    }

    /**
     * 生成随机魔法物品（无预定义模板时使用）
     * @private
     * @param {string} rarity - 稀有度
     * @param {string} type - 类型
     * @returns {Item} 随机生成的物品
     */
    _generateRandomMagicItem(rarity, type) {
        const prefixes = {
            common: ['普通的', '简陋的', '粗糙的'],
            uncommon: ['精制的', '优良的', '强化过的'],
            rare: ['附魔的', '神秘的', '光辉的'],
            epic: ['史诗的', '远古的', '不灭的'],
            legendary: ['传说的', '神圣的', '命运之']
        };

        const weaponNames = ['长剑', '战斧', '法杖', '匕首', '战锤', '长弓', '长矛'];
        const armorNames = ['胸甲', '护腿', '头盔', '护手', '靴子', '盾牌'];

        const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
        const namePool = type === 'weapon' ? weaponNames : armorNames;
        const name = prefix + namePool[Math.floor(Math.random() * namePool.length)];

        // 根据稀有度生成属性
        const rarityBonus = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
        const bonus = rarityBonus[rarity] || 0;

        const stats = {};
        if (type === 'weapon') {
            stats.damage = 1 + bonus;
            if (bonus >= 2) stats.str = Math.ceil(bonus / 2);
            if (bonus >= 3) stats.dex = 1;
        } else {
            stats.ac = 1 + bonus;
            if (bonus >= 2) stats.con = Math.ceil(bonus / 2);
            if (bonus >= 3) stats.hp = bonus * 5;
        }

        // 稀有度对应的价值
        const rarityValue = { common: 5, uncommon: 50, rare: 200, epic: 800, legendary: 5000 };

        return new Item({
            name,
            nameEn: name,
            type,
            rarity,
            description: `${prefix}${type === 'weapon' ? '武器' : '护甲'}，蕴含着${rarity === 'legendary' ? '传说级' : rarity === 'epic' ? '史诗级' : '魔法'}的力量。`,
            icon: type === 'weapon' ? '⚔️' : '🛡️',
            weight: type === 'weapon' ? 2 + Math.random() * 4 : 5 + Math.random() * 15,
            value: rarityValue[rarity] || 5,
            equippable: true,
            slot: type === 'weapon' ? 'weapon' : 'chest',
            stats,
            effects: bonus >= 2 ? [`${rarity}附魔`] : [],
            requirements: bonus >= 2 ? { level: bonus + 2 } : {}
        });
    }

    /**
     * 生成随机材料
     * @private
     * @param {number} cr - 挑战等级
     * @returns {Item} 生成的材料
     */
    _rollMaterial(cr) {
        const materials = [
            { name: '铁矿石', nameEn: 'Iron Ore', icon: '🪨', value: 5 },
            { name: '秘银碎片', nameEn: 'Mithril Fragment', icon: '✨', value: 50 },
            { name: '龙骨碎片', nameEn: 'Dragon Bone Fragment', icon: '🦴', value: 100 },
            { name: '精灵之尘', nameEn: 'Elven Dust', icon: '🌟', value: 75 },
            { name: '暗影精华', nameEn: 'Shadow Essence', icon: '🌑', value: 120 },
            { name: '火焰晶石', nameEn: 'Fire Crystal', icon: '🔶', value: 80 },
            { name: '冰霜碎片', nameEn: 'Frost Shard', icon: '🔷', value: 80 },
            { name: '草药束', nameEn: 'Herb Bundle', icon: '🌿', value: 10 }
        ];

        // 根据CR筛选可用材料
        const available = materials.filter(m => {
            if (cr <= 1) return m.value <= 10;
            if (cr <= 3) return m.value <= 80;
            return true;
        });

        const template = available[Math.floor(Math.random() * available.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;

        return new Item({
            ...template,
            type: 'material',
            rarity: template.value >= 100 ? 'rare' : template.value >= 50 ? 'uncommon' : 'common',
            description: '一份可用于锻造或炼金的材料。',
            weight: 0.5,
            stackable: true,
            maxStack: 20,
            quantity
        });
    }

    /**
     * 生成随机钥匙
     * @private
     * @param {number} cr - 挑战等级
     * @returns {Item} 生成的钥匙
     */
    _rollKey(cr) {
        const keys = [
            { name: '生锈的钥匙', nameEn: 'Rusty Key', icon: '🔑', rarity: 'common' },
            { name: '铁制钥匙', nameEn: 'Iron Key', icon: '🔑', rarity: 'common' },
            { name: '铜制钥匙', nameEn: 'Bronze Key', icon: '🗝️', rarity: 'uncommon' },
            { name: '金制钥匙', nameEn: 'Golden Key', icon: '🗝️', rarity: 'rare' },
            { name: '水晶钥匙', nameEn: 'Crystal Key', icon: '🗝️', rarity: 'epic' }
        ];

        const available = keys.filter(k => {
            const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
            return (rarityOrder[k.rarity] || 0) <= Math.floor(cr / 2);
        });

        const template = available[Math.floor(Math.random() * available.length)] || keys[0];

        return new Item({
            ...template,
            type: 'key',
            description: '一把神秘的钥匙，也许能打开某扇门。',
            weight: 0.1,
            stackable: false,
            value: 0
        });
    }

    /**
     * 生成随机杂项物品
     * @private
     * @param {number} cr - 挑战等级
     * @returns {Item} 生成的杂项物品
     */
    _rollMisc(cr) {
        const miscItems = [
            { name: '破损的地图', nameEn: 'Torn Map', icon: '🗺️', value: 5 },
            { name: '宝石碎片', nameEn: 'Gem Fragment', icon: '💎', value: 25 },
            { name: '古代硬币', nameEn: 'Ancient Coin', icon: '🪙', value: 15 },
            { name: '奇怪的护符', nameEn: 'Strange Amulet', icon: '📿', value: 30 },
            { name: '魔法水晶球', nameEn: 'Magic Crystal Ball', icon: '🔮', value: 100 },
            { name: '古老的卷轴残片', nameEn: 'Ancient Scroll Fragment', icon: '📜', value: 50 },
            { name: '精致的雕像', nameEn: 'Ornate Figurine', icon: '🗿', value: 75 },
            { name: '魔法蜡烛', nameEn: 'Magic Candle', icon: '🕯️', value: 20 }
        ];

        const available = miscItems.filter(m => m.value <= cr * 30 + 10);
        const template = available[Math.floor(Math.random() * available.length)] || miscItems[0];

        return new Item({
            ...template,
            type: 'misc',
            rarity: template.value >= 75 ? 'uncommon' : 'common',
            description: '一件看起来有些特别的物品。',
            weight: 0.5,
            stackable: false
        });
    }
}

// ============================================================
// 导出与全局赋值
// ============================================================

/** @type {InventoryManager} 全局背包管理器实例 */
export const inventoryManager = new InventoryManager();

/** @type {LootGenerator} 全局战利品生成器实例 */
export const lootGenerator = new LootGenerator();

// window 全局赋值（供非模块脚本使用）
window.inventoryManager = inventoryManager;
window.InventoryManager = InventoryManager;
window.LootGenerator = LootGenerator;
