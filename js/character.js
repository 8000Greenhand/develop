// D&D 5e 数据常量
const DND_DATA = {
  races: [
    { id: 'human', name: '人类', bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 } },
    { id: 'elf', name: '精灵', bonuses: { dex: 2 }, traits: ['黑暗视觉', '精类血统', '敏锐感官'] },
    { id: 'dwarf', name: '矮人', bonuses: { con: 2 }, traits: ['黑暗视觉', '矮人韧性', '矮人武器训练'] },
    { id: 'halfling', name: '半身人', bonuses: { dex: 2 }, traits: ['半身人运气', '勇气', '灵巧'] },
    { id: 'dragonborn', name: '龙裔', bonuses: { str: 2, cha: 1 }, traits: ['龙族血统', '呼吸武器'] },
    { id: 'gnome', name: '侏儒', bonuses: { int: 2 }, traits: ['黑暗视觉', '侏儒狡黠'] },
    { id: 'half-orc', name: '半兽人', bonuses: { str: 2, con: 1 }, traits: ['黑暗视觉', '凶猛', '战斗训练'] },
    { id: 'tiefling', name: '提夫林', bonuses: { int: 1, cha: 2 }, traits: ['黑暗视觉', '炼狱血脉', '炼狱语言'] }
  ],

  subraces: {
    elf: [
      { id: 'high-elf', name: '高精灵', bonuses: { int: 1 } },
      { id: 'wood-elf', name: '木精灵', bonuses: { wis: 1 }, speed: 35 },
      { id: 'dark-elf', name: '黑暗精灵', bonuses: { cha: 1 } }
    ],
    dwarf: [
      { id: 'mountain-dwarf', name: '山矮人', bonuses: { str: 2 } },
      { id: 'hill-dwarf', name: '丘陵矮人', bonuses: { wis: 1 }, hpBonus: 1 }
    ],
    gnome: [
      { id: 'forest-gnome', name: '森林侏儒', bonuses: { dex: 1 } },
      { id: 'rock-gnome', name: '岩侏儒', bonuses: { con: 1 } }
    ]
  },

  classes: [
    {
      id: 'fighter',
      name: '战士',
      hitDie: 10,
      primaryAbility: ['力量', '敏捷'],
      savingThrows: ['力量', '体质'],
      skills: ['运动', '驯兽', '历史', '洞察', '威吓'],
      skillCount: 2,
      equipment: ['长剑', '长剑', '短弓', '20支箭']
    },
    {
      id: 'wizard',
      name: '法师',
      hitDie: 6,
      primaryAbility: ['智力'],
      savingThrows: ['智力', '感知'],
      skills: ['奥秘', '历史', '洞察', '医药', '宗教'],
      skillCount: 2,
      spellcaster: true,
      cantripCount: 3,
      level1SpellCount: 6,
      spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      id: 'rogue',
      name: '游荡者',
      hitDie: 8,
      primaryAbility: ['敏捷'],
      savingThrows: ['敏捷', '智力'],
      skills: ['杂技', '动物沟通', '欺骗', '洞察', '威吓', '察觉', '表演', '游说'],
      skillCount: 4,
      sneakAttack: 1
    },
    {
      id: 'cleric',
      name: '牧师',
      hitDie: 8,
      primaryAbility: ['感知'],
      savingThrows: ['感知', '魅力'],
      skills: ['历史', '洞察', '医药', '说服', '宗教'],
      skillCount: 2,
      spellcaster: true,
      cantripCount: 3,
      level1SpellCount: 2,
      spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      id: 'ranger',
      name: '游侠',
      hitDie: 10,
      primaryAbility: ['力量', '敏捷'],
      savingThrows: ['力量', '敏捷'],
      skills: ['动物沟通', '运动', '洞察', '自然', '察觉', '求生'],
      skillCount: 3,
      spellcaster: true,
      spellSlots: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      id: 'barbarian',
      name: '野蛮人',
      hitDie: 12,
      primaryAbility: ['力量'],
      savingThrows: ['力量', '体质'],
      skills: ['动物沟通', '运动', '威吓', '自然', '察觉', '求生'],
      skillCount: 2,
      armor: '无甲'
    },
    {
      id: 'paladin',
      name: '圣武士',
      hitDie: 10,
      primaryAbility: ['力量', '魅力'],
      savingThrows: ['感知', '魅力'],
      skills: ['运动', '说服', '宗教', '历史', '洞察', '威吓'],
      skillCount: 2,
      spellcaster: true,
      spellSlots: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      id: 'bard',
      name: '吟游诗人',
      hitDie: 8,
      primaryAbility: ['魅力'],
      savingThrows: ['敏捷', '魅力'],
      skills: ['杂技', '动物沟通', '欺骗', '表演', '游说', '察觉', '游艺', '隐匿'],
      skillCount: 3,
      spellcaster: true,
      cantripCount: 2,
      level1SpellCount: 2,
      spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    {
      id: 'druid',
      name: '德鲁伊',
      hitDie: 8,
      primaryAbility: ['感知'],
      savingThrows: ['智力', '感知'],
      skills: ['奥秘', '动物沟通', '洞察', '自然', '医药', '察觉', '宗教', '求生'],
      skillCount: 2,
      spellcaster: true,
      cantripCount: 2,
      level1SpellCount: 2,
      spellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  ],

  backgrounds: [
    { id: 'soldier', name: '士兵', skills: ['运动', '威吓'], feature: '军事传统' },
    { id: 'scholar', name: '学者', skills: ['历史', '奥秘'], feature: '学者' },
    { id: 'noble', name: '贵族', skills: ['历史', '说服'], feature: '贵族身份' },
    { id: 'commoner', name: '平民', skills: ['运动', '烹饪'], feature: '平民文化' },
    { id: 'vagabond', name: '流浪者', skills: ['察觉', '求生'], feature: '流浪者' },
    { id: 'sage', name: '贤者', skills: ['奥秘', '历史'], feature: '研究材料' },
    { id: 'criminal', name: '罪犯', skills: ['欺骗', '隐匿'], feature: '犯罪网络' },
    { id: 'outlander', name: '异乡人', skills: ['运动', '求生'], feature: '漂泊者' }
  ],

  startingLocations: [
    { id: 'village', name: '宁静村庄', description: '一个祥和的小村庄，晨雾笼罩着茅草屋顶' },
    { id: 'city', name: '繁华都市', description: '石头城墙环绕的商业中心，人声鼎沸' },
    { id: 'frontier', name: '边境要塞', description: '人类文明的最前沿，危险与机遇并存' },
    { id: 'port', name: '海港城镇', description: '盐风与鱼腥味的港口，来自远方的船只停泊于此' },
    { id: 'ruins', name: '古老废墟', description: '被遗忘的文明遗迹，埋藏着无数秘密' }
  ],

  genders: [
    { id: 'male', name: '男性' },
    { id: 'female', name: '女性' },
    { id: 'other', name: '其他' }
  ],

  attributeNames: {
    str: '力量',
    dex: '敏捷',
    con: '体质',
    int: '智力',
    wis: '感知',
    cha: '魅力'
  },

  skillProficiencies: {
    '运动': 'str',
    '杂技': 'dex',
    '巧手': 'dex',
    '隐匿': 'dex',
    '奥秘': 'int',
    '历史': 'int',
    '自然': 'int',
    '宗教': 'int',
    '动物沟通': 'wis',
    '洞察': 'wis',
    '医药': 'wis',
    '察觉': 'wis',
    '求生': 'wis',
    '欺骗': 'cha',
    '威吓': 'cha',
    '表演': 'cha',
    '游说': 'cha'
  },

  xpThresholds: [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000],

  // ========== 法术数据（0-5环） ==========
  spells: {
    cantrips: {
      wizard: ['法师之手', '魔法伎俩', '冷冻射线', '火焰箭', '轻风术', '传讯术', '法师印记', '次级幻影', '毒雾喷溅', '电爪'],
      cleric: ['指导术', '圣火术', '抵抗术', '奇术', '腐朽术', '生火术', '净化食水', '阅读魔法'],
      bard: ['恶言术', '次级幻影', '妖火', '传讯术', '魔法伎俩', '傀儡术'],
      druid: ['指导术', '德鲁伊技艺', '妖火', '净化食水', '抵抗术', '荆棘鞭击']
    },
    level1: {
      wizard: ['魔法飞弹', '护盾术', '法师护甲', '睡眠术', '鉴定术', '侦测魔法', '魅惑人类', '羽落术', '跳跃术', '雷鸣波', '燃烧之手', '伪装术', '无声幻影', '迷踪步', '浮空术', '蛛网术'],
      cleric: ['祝福术', '治疗术', '治愈伤口', '引导祝福', '庇护术', '守卫信仰', '灾祸术', '造水术', '命令术'],
      bard: ['治疗术', '魅惑人类', '侦测魔法', '不谐低语', '英雄气概', '雷鸣波', '抚慰之风', '无声幻影', '塔莎狂笑术'],
      druid: ['治疗术', '荆棘鞭击', '纠缠术', '动物交谈', '造水术', '跳跃术', '大雾术', '月华射线', '魔法石']
    },
    level2: {
      wizard: ['隐形术', '灼热射线', '侦测思想', '羽落术', '缩小术', '变巨术', '马友夫强酸箭', '镜影术', '黑暗术', '魔嘴术', '寒冰锥'],
      cleric: ['次级复原术', '沉默术', '精神震慑', '援助术', '祝福术', '束缚术', '守卫信仰', '灵体武器', '增强属性'],
      bard: ['隐形术', '镜影术', '建议术', '精神震慑', '塔莎狂笑术', '侦测思想', '增强能力', '沉默术', '锐耳/锐目术'],
      druid: ['火焰风暴', '树皮术', '纠缠术', '增强能力', '动物交谈', '月光之刃', '暖体术', '沉默术', '蛛网术']
    },
    level3: {
      wizard: ['火球术', '闪电束', '飞行术', '解除魔法', '反制魔法', '加速术', '活体法术', '气化形体', '力场墙', '召唤次级魔宠', '迟缓术', '魔魂壶'],
      cleric: ['祈祷术', '群体治愈伤口', '解除魔法', '驱散死亡', '精神护卫', '火焰风暴', '制造食物', '防护能量伤害', '召唤天界生物'],
      bard: ['解除魔法', '恐惧术', '催眠图纹', '群体魅惑', '放逐术', '气化形体', '闪电束', '植物生长', '反制魔法'],
      druid: ['召唤动物', '气化形体', '解除魔法', '纠缠术', '火焰风暴', '植物生长', '呼风唤雨', '反制魔法', '日光术']
    },
    level4: {
      wizard: ['传送术', '变形术', '力场墙', '冰风暴', '黑触', '强效隐形术', '魔魂壶', '次级异界之门', '困惑术', '任意门', '法术暂存', '石肤术'],
      cleric: ['群体治愈伤口', '自由术', '死亡守卫', '圣居术', '召唤天界生物', '高等复原术', '神圣武技', '信仰护盾', '次级异界之门'],
      bard: ['高等隐形术', '任意门', '传送术', '困惑术', '变形术', '石肤术', '次级异界之门', '群体修正术', '高等复原术'],
      druid: ['召唤自然之怒', '变形术', '石肤术', '任意门', '冰风暴', '植物生长', '呼风唤雨', '自由术', '高等复原术']
    },
    level5: {
      wizard: ['许愿术', '传送门', '力场墙', '死云术', '传奇术', '强效隐形术', '强效解除魔法', '异界之门', '发条术', '传送术', '死灵复生'],
      cleric: ['群体治愈伤口', '高等复原术', '信仰护盾', '驱散邪恶', '神圣武技', '异界之门', '烈焰风暴', '复活术'],
      bard: ['高等复原术', '变形术', '传送门', '许愿术', '异界之门', '死灵复生', '传奇术', '强效解除魔法'],
      druid: ['召唤自然之怒', '高等复原术', '呼风唤雨', '变形术', '传送门', '异界之门', '石肤术', '死云术', '树形行走']
    }
  },

  // ========== 法术详细信息 ==========
  spellDetails: {
    // --- 戏法 ---
    '法师之手': { school: 'conjuration', castingTime: '1动作', range: '30尺', components: 'V S', duration: '1分钟', damage: '', damageType: '', description: '创造一个幽灵般的手，可以操纵物体、打开未上锁的门或储藏物品' },
    '魔法伎俩': { school: '幻术', castingTime: '1动作', range: '10尺', components: 'V S M', duration: '1小时', damage: '', damageType: '', description: '制造感官上的小把戏，如声音、图像或触觉效果' },
    '冷冻射线': { school: 'evocation', castingTime: '1动作', range: '60尺', components: 'V S', duration: '瞬时', damage: '1d8', damageType: 'cold', description: '射出一道寒冰射线，对目标造成1d8寒冷伤害' },
    '火焰箭': { school: 'evocation', castingTime: '1动作', range: '120尺', components: 'V S', duration: '瞬时', damage: '1d10', damageType: 'fire', description: '向目标发射一团火焰，造成1d10火焰伤害' },
    '轻风术': { school: 'evocation', castingTime: '1动作', range: '自身', components: 'V S', duration: '1分钟', damage: '', damageType: '', description: '在你周围制造一阵微风，可以吹散气体或气味' },
    '传讯术': { school: '幻术', castingTime: '1动作', range: '120尺', components: 'V S M', duration: '1轮', damage: '', damageType: '', description: '你指向一个生物，向其传递一段简短的信息' },
    '法师印记': { school: '幻术', castingTime: '1动作', range: '触及', components: 'V S', duration: '1小时', damage: '', damageType: '', description: '在物体或生物表面留下一个发光的印记' },
    '次级幻影': { school: '幻术', castingTime: '1动作', range: '30尺', components: 'V S M', duration: '1分钟', damage: '', damageType: '', description: '创造一个声音或一个物体的影像' },
    '毒雾喷溅': { school: 'conjuration', castingTime: '1动作', range: '10尺', components: 'V S', duration: '瞬时', damage: '1d12', damageType: 'poison', description: '在你手中凝聚一团毒气并掷向目标，造成1d12毒素伤害' },
    '电爪': { school: 'evocation', castingTime: '1动作', range: '5尺', components: 'V S', duration: '1轮', damage: '1d8', damageType: 'lightning', description: '你的手发出闪电，近战攻击造成1d8闪电伤害' },
    '指导术': { school: '预言系', castingTime: '1动作', range: '触及', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '触及一个自愿生物，其下一次攻击检定、属性检定或豁免检定获得1d4加值' },
    '圣火术': { school: 'evocation', castingTime: '1动作', range: '60尺', components: 'V S M', duration: '瞬时', damage: '1d8', damageType: 'radiant', description: '向目标发射火焰，造成1d8光耀伤害，亡灵和邪魔额外1d8' },
    '抵抗术': { school: 'abjuration', castingTime: '1动作', range: '触及', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '触及一个自愿生物，其下一次豁免检定获得1d4加值' },
    '奇术': { school: 'transmutation', castingTime: '1动作', range: '触及', components: 'V S M', duration: '1小时', damage: '', damageType: '', description: '对触及的物体或生物施加微小的魔法效果' },
    '腐朽术': { school: 'necromancy', castingTime: '1动作', range: '触及', components: 'V S M', duration: '瞬时', damage: '1d8', damageType: 'necrotic', description: '用死灵能量接触目标，造成1d8死灵伤害' },
    '生火术': { school: 'conjuration', castingTime: '1动作', range: '触及', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '用手指点燃一根蜡烛、火炬或一小堆易燃物' },
    '净化食水': { school: 'transmutation', castingTime: '1动作', range: '触及', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '净化非魔法食物和饮水，使其可以安全食用' },
    '阅读魔法': { school: 'divination', castingTime: '1动作', range: '触及', components: 'V S', duration: '1分钟', damage: '', damageType: '', description: '阅读魔法文字，理解加密或未知语言的文字' },
    '恶言术': { school: 'enchantment', castingTime: '1动作', range: '60尺', components: 'V M', duration: '瞬时', damage: '', damageType: '', description: '对目标说出恶毒的话语，其下一次攻击检定或属性检定有劣势' },
    '妖火': { school: 'evocation', castingTime: '1附赠动作', range: '120尺', components: 'V', duration: '专注，1分钟', damage: '', damageType: '', description: '用微弱的光笼罩一个生物，使其攻击对你有优势，你的攻击对其有优势' },
    '傀儡术': { school: 'enchantment', castingTime: '1动作', range: '60尺', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '创造一个可以操控的小型魔法傀儡' },
    '德鲁伊技艺': { school: 'transmutation', castingTime: '1动作', range: '30尺', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '创造一个微小的自然效果，如开花、吹风或制造声响' },
    '荆棘鞭击': { school: 'transmutation', castingTime: '1动作', range: '30尺', components: 'V S M', duration: '瞬时', damage: '1d6', damageType: 'piercing', description: '用带刺的藤蔓抽打目标，造成1d6穿刺伤害' },

    // --- 1环法术 ---
    '魔法飞弹': { school: 'evocation', castingTime: '1动作', range: '120尺', components: 'V S', duration: '瞬时', damage: '1d4+1', damageType: 'force', description: '发射3枚力场飞弹，每枚造成1d4+1力场伤害，可指定同一或不同目标' },
    '护盾术': { school: 'abjuration', castingTime: '1反应', range: '自身', components: 'V S', duration: '1轮', damage: '', damageType: '', description: '在被攻击命中时作为反应施放，AC+5直到你的下回合开始' },
    '法师护甲': { school: 'abjuration', castingTime: '1动作', range: '触及', components: 'V S M', duration: '8小时', damage: '', damageType: '', description: '触及一个未穿戴护甲的生物，其AC变为13+敏捷调整值' },
    '睡眠术': { school: 'enchantment', castingTime: '1动作', range: '90尺', components: 'V S M', duration: '1分钟', damage: '', damageType: '', description: '使范围内5d8生命值的生物陷入无意识的魔法睡眠' },
    '鉴定术': { school: 'divination', castingTime: '1动作', range: '触及', components: 'V S M', duration: '瞬时', damage: '', damageType: '', description: '选择一个物体，了解其魔法属性，包括是否受诅咒' },
    '侦测魔法': { school: 'divination', castingTime: '1动作', range: '自身', components: 'V S', duration: '专注，10分钟', damage: '', damageType: '', description: '感知30尺内是否存在魔法，以及魔法物品和法术的流派' },
    '魅惑人类': { school: 'enchantment', castingTime: '1动作', range: '30尺', components: 'V S', duration: '1小时', damage: '', damageType: '', description: '魅惑一个人形生物，使其对你视为友好' },
    '羽落术': { school: 'transmutation', castingTime: '1反应', range: '60尺', components: 'V M', duration: '1分钟', damage: '', damageType: '', description: '当一个生物坠落时，使其下落速度减缓，落地不受伤害' },
    '跳跃术': { school: 'transmutation', castingTime: '1动作', range: '触及', components: 'V S M', duration: '1分钟', damage: '', damageType: '', description: '触及生物的跳跃距离变为三倍' },
    '雷鸣波': { school: 'evocation', castingTime: '1动作', range: '自身(15尺锥形)', components: 'V S', duration: '瞬时', damage: '2d8', damageType: 'thunder', description: '释放一道雷鸣声波，对15尺锥形区域内生物造成2d8雷鸣伤害，强韧豁免减半' },
    '燃烧之手': { school: 'evocation', castingTime: '1动作', range: '自身(15尺锥形)', components: 'V S', duration: '瞬时', damage: '3d6', damageType: 'fire', description: '从手中喷射火焰，对15尺锥形区域内生物造成3d6火焰伤害' },
    '伪装术': { school: '幻术', castingTime: '1动作', range: '自身', components: 'V S', duration: '1小时', damage: '', damageType: '', description: '改变你的外貌，包括衣着和装备的外观' },
    '无声幻影': { school: '幻术', castingTime: '1动作', range: '60尺', components: 'V S M', duration: '专注，10分钟', damage: '', damageType: '', description: '创造一个物体、生物或其他可见现象的影像' },
    '迷踪步': { school: 'conjuration', castingTime: '1附赠动作', range: '自身', components: 'V', duration: '1轮', damage: '', damageType: '', description: '充满雾气的蒸气环绕你，直到你下回合结束或受到攻击前，攻击检定对你有劣势' },
    '浮空术': { school: 'transmutation', castingTime: '1动作', range: '60尺', components: 'V S M', duration: '专注，10分钟', damage: '', damageType: '', description: '使一个生物或物体悬浮在空中' },
    '蛛网术': { school: 'conjuration', castingTime: '1动作', range: '60尺', components: 'V S M', duration: '专注，1小时', damage: '', damageType: '', description: '在指定区域布满粘性蛛网，困住其中的生物' },
    '祝福术': { school: 'enchantment', castingTime: '1动作', range: '30尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '至多三个自愿生物的攻击检定和豁免检定获得1d4加值' },
    '治疗术': { school: 'evocation', castingTime: '1动作', range: '触及', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '触及一个生物，恢复1d8+施法属性调整值的生命值' },
    '治愈伤口': { school: 'evocation', castingTime: '1动作', range: '触及', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '触及一个生物，恢复1d8+施法属性调整值的生命值' },
    '引导祝福': { school: 'enchantment', castingTime: '1附赠动作', range: '30尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '一个生物的武器攻击造成额外1d4光耀伤害' },
    '庇护术': { school: 'abjuration', castingTime: '1动作', range: '30尺', components: 'V S M', duration: '8小时', damage: '', damageType: '', description: '保护一个生物，其AC和豁免+1，且无法被魅惑、惊恐或被附身' },
    '守卫信仰': { school: 'abjuration', castingTime: '1动作', range: '自身(10尺半径)', components: 'V S M', duration: '专注，10分钟', damage: '2d8', damageType: 'radiant', description: '创造一个神圣领域，敌对生物进入或在其中开始回合时受到2d8光耀伤害' },
    '灾祸术': { school: 'enchantment', castingTime: '1动作', range: '30尺', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '一个生物的每次攻击检定和属性检定受到1d4减值' },
    '造水术': { school: 'conjuration', castingTime: '1动作', range: '30尺', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '创造最多10加仑的净水或雨水' },
    '命令术': { school: 'enchantment', castingTime: '1动作', range: '60尺', components: 'V', duration: '1轮', damage: '', damageType: '', description: '向一个你能看见的生物发出单字命令，它必须遵从' },
    '不谐低语': { school: 'enchantment', castingTime: '1动作', range: '60尺', components: 'V M', duration: '1分钟', damage: '3d6', damageType: 'psychic', description: '用令人不安的低语低语目标，造成3d6心灵伤害，意志豁免减半' },
    '英雄气概': { school: 'enchantment', castingTime: '1附赠动作', range: '触及', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '一个自愿生物在攻击检定和豁免检定中获得2d6加值' },
    '抚慰之风': { school: 'enchantment', castingTime: '1动作', range: '60尺', components: 'V M', duration: '1分钟', damage: '', damageType: '', description: '使一个生物免疫惊恐，且其魅力豁免检定有优势' },
    '塔莎狂笑术': { school: 'enchantment', castingTime: '1动作', range: '30尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '目标陷入无法行动状态，且其周围5尺内其他生物的攻击对其有优势' },
    '纠缠术': { school: 'conjuration', castingTime: '1动作', range: '90尺', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '使20尺立方区域内的植物扭曲纠缠，困住其中的生物' },
    '动物交谈': { school: 'divination', castingTime: '1动作', range: '自身', components: 'V S', duration: '10分钟', damage: '', damageType: '', description: '你能理解野兽的交流并传达简单信息' },
    '大雾术': { school: 'conjuration', castingTime: '1动作', range: '120尺', components: 'V S', duration: '专注，1小时', damage: '', damageType: '', description: '创造一个20尺半径的雾气区域，能见度受到严重限制' },
    '月华射线': { school: 'evocation', castingTime: '1动作', range: '120尺', components: 'V S M', duration: '瞬时', damage: '2d8', damageType: 'radiant', description: '射出一道月华光束，对目标造成2d8光耀伤害' },
    '魔法石': { school: 'transmutation', castingTime: '1动作', range: '触及', components: 'V S', duration: '专注，1分钟', damage: '1d6+1', damageType: 'force', description: '创造最多三颗发光的魔法石，投掷时造成1d6+1力场伤害' },

    // --- 2环法术 ---
    '隐形术': { school: 'illusion', castingTime: '1动作', range: '触及', components: 'V S M', duration: '专注，1小时', damage: '', damageType: '', description: '触及一个生物，使其隐形直到法术结束或其攻击或施法' },
    '灼热射线': { school: 'evocation', castingTime: '1动作', range: '120尺', components: 'V S', duration: '瞬时', damage: '2d6', damageType: 'fire', description: '发射三道火射线，每道造成2d6火焰伤害，可指定不同目标' },
    '侦测思想': { school: 'divination', castingTime: '1动作', range: '自身', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '感知30尺内生物的表面思想，或深入读取一个生物的思想' },
    '缩小术': { school: 'transmutation', castingTime: '1动作', range: '30尺', components: 'V S M', duration: '专注，10分钟', damage: '', damageType: '', description: '使一个生物或物体缩小至一半大小' },
    '变巨术': { school: 'transmutation', castingTime: '1动作', range: '30尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '使一个生物或物体增大至两倍大小' },
    '马友夫强酸箭': { school: 'evocation', castingTime: '1动作', range: '90尺', components: 'V S M', duration: '瞬时', damage: '4d4', damageType: 'acid', description: '射出一支强酸箭，造成4d4酸液伤害，目标下回合开始时再受2d4酸液伤害' },
    '镜影术': { school: 'illusion', castingTime: '1动作', range: '自身', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '创造三个你的幻象副本，使攻击者难以瞄准你' },
    '黑暗术': { school: 'evocation', castingTime: '1动作', range: '60尺', components: 'V M', duration: '专注，10分钟', damage: '', damageType: '', description: '创造一个15尺半径的魔法黑暗区域，非魔法光线无法穿透' },
    '魔嘴术': { school: 'illusion', castingTime: '1动作', range: '30尺', components: 'V S M', duration: '直到解除', damage: '', damageType: '', description: '在一个物体上放置一个幻象嘴巴，可以按预设说话' },
    '寒冰锥': { school: 'evocation', castingTime: '1动作', range: '自身(60尺锥形)', components: 'V S M', duration: '瞬时', damage: '8d8', damageType: 'cold', description: '喷出一道寒冰锥，对60尺锥形区域内生物造成8d8寒冷伤害' },
    '次级复原术': { school: 'abjuration', castingTime: '1动作', range: '触及', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '解除一个生物身上的一种疾病或状态（目盲、耳聋、中毒、麻痹）' },
    '沉默术': { school: 'illusion', castingTime: '1动作', range: '120尺', components: 'V S', duration: '专注，10分钟', damage: '', damageType: '', description: '创造一个20尺半径的静默区域，区域内无法发出声音' },
    '精神震慑': { school: 'enchantment', castingTime: '1动作', range: '60尺', components: 'V S M', duration: '专注，1分钟', damage: '3d8', damageType: 'psychic', description: '使一个生物陷入惊恐状态，每次回合开始受到3d8心灵伤害' },
    '援助术': { school: 'enchantment', castingTime: '1动作', range: '30尺', components: 'V S M', duration: '8小时', damage: '', damageType: '', description: '至多三个生物的生命值上限和当前生命值增加5点' },
    '束缚术': { school: 'abjuration', castingTime: '1动作', range: '60尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '用魔法绳索束缚一个生物，使其无法移动' },
    '灵体武器': { school: 'evocation', castingTime: '1附赠动作', range: '60尺', components: 'V S', duration: '1分钟', damage: '1d8+施法属性', damageType: 'force', description: '创造一把半透明的武器，用附赠动作攻击，造成1d8+施法属性调整值力场伤害' },
    '增强属性': { school: 'transmutation', castingTime: '1动作', range: '触及', components: 'V S M', duration: '专注，1小时', damage: '', damageType: '', description: '触及一个生物，选择一项属性，其获得+4加值（上限20）' },
    '建议术': { school: 'enchantment', castingTime: '1动作', range: '60尺', components: 'V M', duration: '8小时', damage: '', damageType: '', description: '向一个生物提出一个合理的行动建议，其会尽力遵从' },
    '增强能力': { school: 'transmutation', castingTime: '1动作', range: '触及', components: 'V S M', duration: '专注，1小时', damage: '', damageType: '', description: '触及一个生物，选择力量或敏捷，获得+2加值' },
    '锐耳/锐目术': { school: 'transmutation', castingTime: '1动作', range: '触及', components: 'V S', duration: '1小时', damage: '', damageType: '', description: '触及一个生物，使其听觉或视觉翻倍' },
    '火焰风暴': { school: 'evocation', castingTime: '1动作', range: '150尺', components: 'V S', duration: '瞬时', damage: '7d6', damageType: 'fire', description: '在指定区域引发火焰风暴，造成7d6火焰伤害' },
    '树皮术': { school: 'abjuration', castingTime: '1附赠动作', range: '自身', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '你的皮肤变得如树皮般坚硬，AC+2，体质豁免有优势' },
    '月光之刃': { school: 'evocation', castingTime: '1动作', range: '自身', components: 'V S', duration: '专注，1分钟', damage: '2d8', damageType: 'radiant', description: '创造一把或三把发光的月华刀刃，近战攻击造成2d8光耀伤害' },
    '暖体术': { school: 'abjuration', castingTime: '1动作', range: '触及', components: 'V S M', duration: '8小时', damage: '', damageType: '', description: '触及一个生物，使其在寒冷环境中不受伤害' },

    // --- 3环法术 ---
    '火球术': { school: 'evocation', castingTime: '1动作', range: '150尺', components: 'V S M', duration: '瞬时', damage: '8d6', damageType: 'fire', description: '投掷一颗爆裂火球，对20尺半径区域内所有生物造成8d6火焰伤害' },
    '闪电束': { school: 'evocation', castingTime: '1动作', range: '自身(100尺线形)', components: 'V S M', duration: '瞬时', damage: '8d6', damageType: 'lightning', description: '释放一道闪电束，对100尺线形区域内所有生物造成8d6闪电伤害' },
    '飞行术': { school: 'transmutation', castingTime: '1动作', range: '触及', components: 'V S M', duration: '专注，10分钟', damage: '', damageType: '', description: '触及一个生物，使其获得60尺飞行速度' },
    '解除魔法': { school: 'abjuration', castingTime: '1动作', range: '120尺', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '选择一个生物、物体或法术效果区域，终结3环或以下的法术' },
    '反制魔法': { school: 'abjuration', castingTime: '1反应', range: '60尺', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '当一个生物施放法术时作为反应施放，中断3环或以下的法术' },
    '加速术': { school: 'transmutation', castingTime: '1动作', range: '触及', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '触及一个自愿生物，其速度翻倍，获得额外一个动作' },
    '活体法术': { school: 'necromancy', castingTime: '1动作', range: '触及', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '使触及的尸体或骨骼复活为你的仆从' },
    '气化形体': { school: 'transmutation', castingTime: '1动作', range: '自身', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '你的身体化为雾气，可以在空中飞行，免疫非魔法物理伤害' },
    '力场墙': { school: 'evocation', castingTime: '1动作', range: '120尺', components: 'V S', duration: '专注，10分钟', damage: '', damageType: '', description: '创造一面不可见的力场墙，阻挡穿过它的生物和物体' },
    '召唤次级魔宠': { school: 'conjuration', castingTime: '1动作', range: '90尺', components: 'V S', duration: '专注，1小时', damage: '', damageType: '', description: '召唤一只天界、妖精或次级魔宠为你战斗' },
    '迟缓术': { school: 'transmutation', castingTime: '1动作', range: '120尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '使一个生物的速度减半，AC-2，敏捷豁免有劣势' },
    '魔魂壶': { school: 'necromancy', castingTime: '1动作', range: '150尺', components: 'V S M', duration: '瞬时', damage: '12d6', damageType: 'necrotic', description: '向目标发射一道死灵能量，造成12d6死灵伤害' },
    '祈祷术': { school: 'enchantment', castingTime: '1动作', range: '60尺', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '盟友攻击和豁免+1d4，敌人攻击和豁免-1d4' },
    '群体治愈伤口': { school: 'evocation', castingTime: '1动作', range: '60尺', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '恢复最多六个生物各3d8+施法属性调整值的生命值' },
    '驱散死亡': { school: 'necromancy', castingTime: '1动作', range: '60尺', components: 'V S', duration: '瞬时', damage: '8d6', damageType: 'radiant', description: '向目标发射一道光耀能量，造成8d6光耀伤害，亡灵额外8d6' },
    '精神护卫': { school: 'conjuration', castingTime: '1动作', range: '触及', components: 'V S M', duration: '8小时', damage: '', damageType: '', description: '创造一个灵体守护者，保护目标免受心灵攻击' },
    '制造食物': { school: 'conjuration', castingTime: '1动作', range: '30尺', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '创造足以供养15个人类或5匹马的食物和水' },
    '防护能量伤害': { school: 'abjuration', castingTime: '1动作', range: '触及', components: 'V S M', duration: '专注，1小时', damage: '', damageType: '', description: '触及一个生物，选择一种伤害类型（酸、冷、火、雷、毒），获得对该类型的抗性' },
    '召唤天界生物': { school: 'conjuration', castingTime: '1动作', range: '90尺', components: 'V S', duration: '专注，1小时', damage: '', damageType: '', description: '召唤一个天界生物为你战斗' },
    '恐惧术': { school: 'illusion', castingTime: '1动作', range: '自身(30尺锥形)', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '使锥形区域内每个能看见你的生物陷入惊恐' },
    '催眠图纹': { school: 'illusion', castingTime: '1动作', range: '120尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '创造一个魔法图纹，凝视它的生物陷入魅惑' },
    '群体魅惑': { school: 'enchantment', castingTime: '1动作', range: '120尺', components: 'V S', duration: '专注，1小时', damage: '', damageType: '', description: '魅惑多个生物，使其对你视为友好' },
    '放逐术': { school: 'abjuration', castingTime: '1动作', range: '60尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '尝试将一个生物放逐到其家乡位面' },
    '植物生长': { school: 'transmutation', castingTime: '1动作', range: '150尺', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '使区域内的植物异常生长，阻碍通行' },
    '召唤动物': { school: 'conjuration', castingTime: '1动作', range: '60尺', components: 'V S', duration: '专注，1小时', damage: '', damageType: '', description: '召唤野兽为你战斗' },
    '日光术': { school: 'evocation', castingTime: '1动作', range: '60尺', components: 'V S', duration: '1小时', damage: '6d8', damageType: 'radiant', description: '创造一个60尺半径的光亮区域，对亡灵造成6d8光耀伤害' },
    '呼风唤雨': { school: 'conjuration', castingTime: '1动作', range: '300尺', components: 'V S', duration: '专注，1小时', damage: '5d6', damageType: 'bludgeoning', description: '创造一场风暴，区域内每回合造成5d6钝击伤害' },

    // --- 4环法术 ---
    '传送术': { school: 'conjuration', castingTime: '1动作', range: '10尺', components: 'V', duration: '瞬时', damage: '', damageType: '', description: '将你和至多8个自愿生物传送到一个已知目的地' },
    '变形术': { school: 'transmutation', castingTime: '1动作', range: '30尺', components: 'V S M', duration: '专注，1小时', damage: '', damageType: '', description: '将一个生物变为另一种形态，保留其性格' },
    '冰风暴': { school: 'evocation', castingTime: '1动作', range: '300尺', components: 'V S M', duration: '瞬时', damage: '2d8+4d6', damageType: 'bludgeoning+cold', description: '在40尺半径区域内降下冰雹，造成2d8钝击+4d6寒冷伤害' },
    '黑触': { school: 'necromancy', castingTime: '1动作', range: '60尺', components: 'V S', duration: '专注，1分钟', damage: '8d8', damageType: 'necrotic', description: '使一个生物的力量和敏捷检定有劣势，每次回合开始受到8d8死灵伤害' },
    '强效隐形术': { school: 'illusion', castingTime: '1动作', range: '触及', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '触及一个生物，使其隐形且攻击或施法不会解除隐形' },
    '次级异界之门': { school: 'conjuration', castingTime: '1动作', range: '60尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '打开一道通往其他位面的传送门' },
    '困惑术': { school: 'enchantment', castingTime: '1动作', range: '90尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '使一个生物陷入困惑状态，行为不可预测' },
    '任意门': { school: 'conjuration', castingTime: '1动作', range: '500尺', components: 'V', duration: '1轮', damage: '', damageType: '', description: '创造一个连接两个位置的门，使你可以瞬间穿越' },
    '法术暂存': { school: 'transmutation', castingTime: '1动作', range: '触及', components: 'V S', duration: '8小时', damage: '', damageType: '', description: '将一个3环或以下的法术储存在一个物体中，之后可以释放' },
    '石肤术': { school: 'abjuration', castingTime: '1动作', range: '触及', components: 'V S M', duration: '专注，1小时', damage: '', damageType: '', description: '触及一个生物，使其获得对非魔法钝击、穿刺和挥砍伤害的抗性' },
    '自由术': { school: 'abjuration', castingTime: '1动作', range: '触及', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '解除一个生物身上的束缚、麻痹、石化等状态' },
    '死亡守卫': { school: 'abjuration', castingTime: '1反应', range: '60尺', components: 'V S', duration: '8小时', damage: '', damageType: '', description: '当一个生物即将死亡时，使其生命值降为1点而非0' },
    '圣居术': { school: 'conjuration', castingTime: '10分钟', range: '触及', components: 'V S M', duration: '24小时', damage: '', damageType: '', description: '在一个区域内创造一个神圣空间，阻止邪恶生物进入' },
    '高等复原术': { school: 'abjuration', castingTime: '1动作', range: '触及', components: 'V S M', duration: '瞬时', damage: '', damageType: '', description: '解除所有低阶法术效果，恢复被降低的属性值' },
    '神圣武技': { school: 'evocation', castingTime: '1附赠动作', range: '自身', components: 'V S', duration: '1分钟', damage: '2d8', damageType: 'radiant', description: '你的武器攻击额外造成2d8光耀伤害' },
    '信仰护盾': { school: 'abjuration', castingTime: '1反应', range: '60尺', components: 'V S', duration: '1轮', damage: '', damageType: '', description: '当一个生物被攻击时，使其AC+5' },
    '群体修正术': { school: 'transmutation', castingTime: '1动作', range: '60尺', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '使至多六个生物的AC和豁免+2' },
    '召唤自然之怒': { school: 'conjuration', castingTime: '1动作', range: '60尺', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '召唤自然精灵为你战斗' },
    '树形行走': { school: 'necromancy', castingTime: '1动作', range: '触及', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '使一个生物获得树行能力，可以在树木之间传送' },

    // --- 5环法术 ---
    '许愿术': { school: 'conjuration', castingTime: '1动作', range: '自身', components: 'V', duration: '瞬时', damage: '', damageType: '', description: '许下一个愿望，DM决定其效果。这是最强大的法术之一' },
    '传送门': { school: 'conjuration', castingTime: '1动作', range: '500尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '创造一个连接两个位面的传送门' },
    '死云术': { school: 'necromancy', castingTime: '1动作', range: '120尺', components: 'V S', duration: '专注，1分钟', damage: '8d8', damageType: 'necrotic', description: '创造一团旋转的死灵云雾，对其中生物每回合造成8d8死灵伤害' },
    '传奇术': { school: 'transmutation', castingTime: '1动作', range: '自身', components: 'V S', duration: '专注，1分钟', damage: '', damageType: '', description: '选择一个传奇效果，如改变你的外观或创造一个幻象' },
    '强效解除魔法': { school: 'abjuration', castingTime: '1动作', range: '60尺', components: 'V S', duration: '瞬时', damage: '', damageType: '', description: '终结6环或以下的法术效果，或削弱7环以上的法术' },
    '异界之门': { school: 'conjuration', castingTime: '1动作', range: '60尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '召唤一个异界生物为你服务' },
    '发条术': { school: 'transmutation', castingTime: '1动作', range: '60尺', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '将一个物体变为一个发条装置' },
    '死灵复生': { school: 'necromancy', castingTime: '1小时', range: '触及', components: 'V S M', duration: '瞬时', damage: '', damageType: '', description: '使一个已死亡不超过10天的生物复活' },
    '烈焰风暴': { school: 'evocation', castingTime: '1动作', range: '150尺', components: 'V S', duration: '瞬时', damage: '7d6', damageType: 'fire', description: '在指定区域引发烈焰风暴，造成7d6火焰伤害' },
    '复活术': { school: 'necromancy', castingTime: '1小时', range: '触及', components: 'V S M', duration: '瞬时', damage: '', damageType: '', description: '使一个已死亡不超过200年的生物复活' },
    '驱散邪恶': { school: 'abjuration', castingTime: '1动作', range: '触及', components: 'V S M', duration: '专注，1分钟', damage: '', damageType: '', description: '解除一个生物身上的附身、魅惑或诅咒效果' }
  },

  // ========== 专长数据 ==========
  feats: [
    { id: 'sharpshooter', name: '神射手', description: '远程攻击命中+10；近距离射击（5尺内）无劣势；远程攻击可以无视半掩体和四分之三掩体', requirements: { dex: 13 } },
    { id: 'great_weapon_master', name: '伟大武器大师', description: '使用重武器时，命中+2；暴击或击杀时可用附赠动作进行一次额外近战攻击', requirements: { str: 13 } },
    { id: 'heavy_armor_master', name: '重甲大师', description: '穿着重甲时，非魔法来源的钝击/穿刺/挥砍伤害减少3点', requirements: { str: 15 } },
    { id: 'mage_slayer', name: '法师杀手', description: '当施法者在你5尺内施法时，你可以用反应进行一次近战攻击；对抗被你攻击过的施法者的豁免检定有优势', requirements: {} },
    { id: 'resilient', name: '坚韧', description: '选择一项属性，其豁免检定获得熟练，且该属性+1', requirements: {} },
    { id: 'alert', name: '警觉', description: '先攻+5；你不能被突袭；其他生物在20尺内无法隐藏', requirements: {} },
    { id: 'mobile', name: '机动', description: '难缠——攻击后移动不会引发借机攻击；冲刺时速度不会减半', requirements: { dex: 13 } },
    { id: 'tough', name: '坚韧体质', description: '你的生命值上限每等级+1', requirements: {} },
    { id: 'lucky', name: '幸运', description: '每日3次，当你的d20掷出不满意时可以重掷（必须使用新结果）', requirements: {} },
    { id: 'skilled', name: '博学', description: '获得任意三项技能的熟练和一种工具的熟练', requirements: {} },
    { id: 'dual_wielder', name: '双持战斗', description: '双持时每把武器的伤害+1；可以使用双把非轻武器进行双持', requirements: {} },
    { id: 'polearm_master', name: '长柄武器大师', description: '使用长柄武器或长矛时，可用附赠动作进行一次柄击（1d4钝击）；敌人进入你触及范围时可用反应进行借机攻击', requirements: {} },
    { id: 'crossbow_expert', name: '弩专家', description: '忽略弩的装填属性；单手弩+近战武器时可用附赠动作射击；远程攻击范围内5尺内无劣势', requirements: {} },
    { id: 'savage_attacker', name: '野蛮攻击者', description: '使用近战武器攻击时，伤害骰可以重掷一次并取较高结果（每回合一次）', requirements: {} },
    { id: 'sentinel', name: '哨兵', description: '借机攻击命中时目标速度降为0；被借机攻击的生物对你有优势时你对其攻击也有优势；敌人攻击你周围盟友时你可以用反应进行攻击', requirements: {} },
    { id: 'war_caster', name: '战争施法者', description: '施法时双手持武器和盾牌无碍；法术攻击和对抗法术的豁免使用施法属性', requirements: {} }
  ],

  // ========== 每级法术位表（1-20级） ==========
  // 每个元素: [1环, 2环, 3环, 4环, 5环, 6环, 7环, 8环, 9环]
  spellSlotTable: {
    wizard: [
      [2,0,0,0,0,0,0,0,0], // 1级
      [3,0,0,0,0,0,0,0,0], // 2级
      [4,2,0,0,0,0,0,0,0], // 3级
      [4,3,0,0,0,0,0,0,0], // 4级
      [4,3,2,0,0,0,0,0,0], // 5级
      [4,3,3,0,0,0,0,0,0], // 6级
      [4,3,3,1,0,0,0,0,0], // 7级
      [4,3,3,2,0,0,0,0,0], // 8级
      [4,3,3,3,1,0,0,0,0], // 9级
      [4,3,3,3,2,0,0,0,0], // 10级
      [4,3,3,3,2,1,0,0,0], // 11级
      [4,3,3,3,2,1,0,0,0], // 12级
      [4,3,3,3,2,1,1,0,0], // 13级
      [4,3,3,3,2,1,1,0,0], // 14级
      [4,3,3,3,2,1,1,1,0], // 15级
      [4,3,3,3,2,1,1,1,0], // 16级
      [4,3,3,3,2,1,1,1,1], // 17级
      [4,3,3,3,3,1,1,1,1], // 18级
      [4,3,3,3,3,2,1,1,1], // 19级
      [4,3,3,3,3,2,2,1,1]  // 20级
    ],
    cleric: [
      [2,0,0,0,0,0,0,0,0], // 1级
      [3,0,0,0,0,0,0,0,0], // 2级
      [4,2,0,0,0,0,0,0,0], // 3级
      [4,3,0,0,0,0,0,0,0], // 4级
      [4,3,2,0,0,0,0,0,0], // 5级
      [4,3,3,0,0,0,0,0,0], // 6级
      [4,3,3,1,0,0,0,0,0], // 7级
      [4,3,3,2,0,0,0,0,0], // 8级
      [4,3,3,3,1,0,0,0,0], // 9级
      [4,3,3,3,2,0,0,0,0], // 10级
      [4,3,3,3,2,1,0,0,0], // 11级
      [4,3,3,3,2,1,0,0,0], // 12级
      [4,3,3,3,2,1,1,0,0], // 13级
      [4,3,3,3,2,1,1,0,0], // 14级
      [4,3,3,3,2,1,1,1,0], // 15级
      [4,3,3,3,2,1,1,1,0], // 16级
      [4,3,3,3,2,1,1,1,1], // 17级
      [4,3,3,3,3,1,1,1,1], // 18级
      [4,3,3,3,3,2,1,1,1], // 19级
      [4,3,3,3,3,2,2,1,1]  // 20级
    ],
    bard: [
      [2,0,0,0,0,0,0,0,0], // 1级
      [3,0,0,0,0,0,0,0,0], // 2级
      [4,2,0,0,0,0,0,0,0], // 3级
      [4,3,0,0,0,0,0,0,0], // 4级
      [4,3,2,0,0,0,0,0,0], // 5级
      [4,3,3,0,0,0,0,0,0], // 6级
      [4,3,3,1,0,0,0,0,0], // 7级
      [4,3,3,2,0,0,0,0,0], // 8级
      [4,3,3,3,1,0,0,0,0], // 9级
      [4,3,3,3,2,0,0,0,0], // 10级
      [4,3,3,3,2,1,0,0,0], // 11级
      [4,3,3,3,2,1,0,0,0], // 12级
      [4,3,3,3,2,1,1,0,0], // 13级
      [4,3,3,3,2,1,1,0,0], // 14级
      [4,3,3,3,2,1,1,1,0], // 15级
      [4,3,3,3,2,1,1,1,0], // 16级
      [4,3,3,3,2,1,1,1,1], // 17级
      [4,3,3,3,3,1,1,1,1], // 18级
      [4,3,3,3,3,2,1,1,1], // 19级
      [4,3,3,3,3,2,2,1,1]  // 20级
    ],
    druid: [
      [2,0,0,0,0,0,0,0,0], // 1级
      [3,0,0,0,0,0,0,0,0], // 2级
      [4,2,0,0,0,0,0,0,0], // 3级
      [4,3,0,0,0,0,0,0,0], // 4级
      [4,3,2,0,0,0,0,0,0], // 5级
      [4,3,3,0,0,0,0,0,0], // 6级
      [4,3,3,1,0,0,0,0,0], // 7级
      [4,3,3,2,0,0,0,0,0], // 8级
      [4,3,3,3,1,0,0,0,0], // 9级
      [4,3,3,3,2,0,0,0,0], // 10级
      [4,3,3,3,2,1,0,0,0], // 11级
      [4,3,3,3,2,1,0,0,0], // 12级
      [4,3,3,3,2,1,1,0,0], // 13级
      [4,3,3,3,2,1,1,0,0], // 14级
      [4,3,3,3,2,1,1,1,0], // 15级
      [4,3,3,3,2,1,1,1,0], // 16级
      [4,3,3,3,2,1,1,1,1], // 17级
      [4,3,3,3,3,1,1,1,1], // 18级
      [4,3,3,3,3,2,1,1,1], // 19级
      [4,3,3,3,3,2,2,1,1]  // 20级
    ],
    ranger: [
      [0,0,0,0,0,0,0,0,0], // 1级
      [0,0,0,0,0,0,0,0,0], // 2级
      [2,0,0,0,0,0,0,0,0], // 3级
      [3,0,0,0,0,0,0,0,0], // 4级
      [3,2,0,0,0,0,0,0,0], // 5级
      [3,3,0,0,0,0,0,0,0], // 6级
      [3,3,1,0,0,0,0,0,0], // 7级
      [3,3,2,0,0,0,0,0,0], // 8级
      [3,3,3,1,0,0,0,0,0], // 9级
      [3,3,3,2,0,0,0,0,0], // 10级
      [3,3,3,2,1,0,0,0,0], // 11级
      [3,3,3,2,1,0,0,0,0], // 12级
      [3,3,3,2,1,1,0,0,0], // 13级
      [3,3,3,2,1,1,0,0,0], // 14级
      [3,3,3,2,1,1,1,0,0], // 15级
      [3,3,3,2,1,1,1,0,0], // 16级
      [3,3,3,2,1,1,1,1,0], // 17级
      [3,3,3,3,1,1,1,1,0], // 18级
      [3,3,3,3,2,1,1,1,0], // 19级
      [3,3,3,3,2,2,1,1,0]  // 20级
    ],
    paladin: [
      [0,0,0,0,0,0,0,0,0], // 1级
      [0,0,0,0,0,0,0,0,0], // 2级
      [2,0,0,0,0,0,0,0,0], // 3级
      [3,0,0,0,0,0,0,0,0], // 4级
      [3,2,0,0,0,0,0,0,0], // 5级
      [3,3,0,0,0,0,0,0,0], // 6级
      [3,3,1,0,0,0,0,0,0], // 7级
      [3,3,2,0,0,0,0,0,0], // 8级
      [3,3,3,1,0,0,0,0,0], // 9级
      [3,3,3,2,0,0,0,0,0], // 10级
      [3,3,3,2,1,0,0,0,0], // 11级
      [3,3,3,2,1,0,0,0,0], // 12级
      [3,3,3,2,1,1,0,0,0], // 13级
      [3,3,3,2,1,1,0,0,0], // 14级
      [3,3,3,2,1,1,1,0,0], // 15级
      [3,3,3,2,1,1,1,0,0], // 16级
      [3,3,3,2,1,1,1,1,0], // 17级
      [3,3,3,3,1,1,1,1,0], // 18级
      [3,3,3,3,2,1,1,1,0], // 19级
      [3,3,3,3,2,2,1,1,0]  // 20级
    ]
  },

  // ========== 怪物数据（按CR分组） ==========
  monsters: {
    cr0: [
      { name: '老鼠', hp: 1, ac: 10, attack: '+0', damage: '1', xp: 10, str: 2, dex: 11, con: 9, int: 2, wis: 10, cha: 4, type: '野兽', size: '微型' },
      { name: '蝙蝠', hp: 1, ac: 12, attack: '+0', damage: '1', xp: 10, str: 2, dex: 15, con: 8, int: 2, wis: 12, cha: 4, type: '野兽', size: '微型' },
      { name: '青蛙', hp: 1, ac: 11, attack: '+0', damage: '1', xp: 10, str: 1, dex: 12, con: 8, int: 1, wis: 8, cha: 3, type: '野兽', size: '微型' }
    ],
    cr1_8: [
      { name: '哥布林', hp: 7, ac: 15, attack: '+4', damage: '1d6+2', xp: 50, str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8, type: '类人生物', size: '小型' },
      { name: '骷髅', hp: 13, ac: 13, attack: '+4', damage: '1d6+2', xp: 50, str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5, type: '不死生物', size: '中型' },
      { name: '巨鼠', hp: 3, ac: 12, attack: '+2', damage: '1d4+1', xp: 50, str: 7, dex: 15, con: 11, int: 2, wis: 10, cha: 4, type: '野兽', size: '小型' },
      { name: '豺狼人', hp: 6, ac: 12, attack: '+4', damage: '1d6+2', xp: 50, str: 8, dex: 12, con: 11, int: 6, wis: 10, cha: 7, type: '类人生物', size: '中型' }
    ],
    cr1_4: [
      { name: '强盗', hp: 9, ac: 12, attack: '+3', damage: '1d6+1', xp: 100, str: 11, dex: 12, con: 12, int: 10, wis: 10, cha: 11, type: '类人生物', size: '中型' },
      { name: '狼', hp: 11, ac: 13, attack: '+4', damage: '2d4+2', xp: 100, str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6, type: '野兽', size: '中型' },
      { name: '僵尸', hp: 22, ac: 8, attack: '+3', damage: '1d6+1', xp: 100, str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5, type: '不死生物', size: '中型' },
      { name: '巨蛛', hp: 16, ac: 14, attack: '+4', damage: '1d8+2', xp: 100, str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4, type: '野兽', size: '大型' }
    ],
    cr1_2: [
      { name: '豺狼人猎手', hp: 22, ac: 13, attack: '+4', damage: '1d8+2', xp: 200, str: 12, dex: 15, con: 12, int: 8, wis: 13, cha: 10, type: '类人生物', size: '中型' },
      { name: '食尸鬼', hp: 22, ac: 12, attack: '+4', damage: '1d6+2', xp: 200, str: 13, dex: 15, con: 10, int: 7, wis: 10, cha: 6, type: '不死生物', size: '中型' },
      { name: '影', hp: 16, ac: 12, attack: '+4', damage: '3d6', xp: 200, str: 6, dex: 14, con: 13, int: 6, wis: 10, cha: 8, type: '不死生物', size: '中型' },
      { name: '巨蜥蜴', hp: 19, ac: 15, attack: '+5', damage: '2d10+3', xp: 200, str: 15, dex: 12, con: 13, int: 2, wis: 10, cha: 5, type: '野兽', size: '大型' }
    ],
    cr1: [
      { name: '哥布林王', hp: 27, ac: 16, attack: '+5', damage: '1d6+3', xp: 400, str: 10, dex: 16, con: 14, int: 12, wis: 10, cha: 12, type: '类人生物', size: '小型' },
      { name: '守卫骷髅', hp: 33, ac: 14, attack: '+5', damage: '1d8+3', xp: 400, str: 12, dex: 14, con: 15, int: 6, wis: 8, cha: 5, type: '不死生物', size: '中型' },
      { name: '虎', hp: 37, ac: 12, attack: '+5', damage: '1d10+4', xp: 400, str: 17, dex: 15, con: 14, int: 3, wis: 12, cha: 8, type: '野兽', size: '大型' },
      { name: '鹰身女妖', hp: 38, ac: 12, attack: '+5', damage: '2d6+3', xp: 400, str: 12, dex: 17, con: 12, int: 7, wis: 12, cha: 13, type: '怪物', size: '中型' }
    ],
    cr2: [
      { name: '食人魔', hp: 59, ac: 11, attack: '+6', damage: '2d8+4', xp: 900, str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7, type: '巨人', size: '大型' },
      { name: '无赖法师学徒', hp: 33, ac: 12, attack: '+5', damage: '2d6', xp: 900, str: 9, dex: 14, con: 11, int: 14, wis: 11, cha: 12, type: '类人生物', size: '中型' },
      { name: '巨型蜘蛛', hp: 32, ac: 14, attack: '+5', damage: '2d8+3', xp: 900, str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4, type: '野兽', size: '巨型' },
      { name: '泥怪', hp: 46, ac: 8, attack: '+5', damage: '1d8+3', xp: 900, str: 14, dex: 10, con: 16, int: 5, wis: 6, cha: 1, type: '泥怪', size: '中型' }
    ],
    cr3: [
      { name: '巨魔', hp: 84, ac: 15, attack: '+7', damage: '2d6+4', xp: 1800, str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7, type: '巨人', size: '大型' },
      { name: '幽灵', hp: 45, ac: 11, attack: '+5', damage: '4d6', xp: 1800, str: 7, dex: 13, con: 10, int: 10, wis: 12, cha: 17, type: '不死生物', size: '中型' },
      { name: '米诺陶洛斯', hp: 76, ac: 14, attack: '+6', damage: '2d8+4', xp: 1800, str: 18, dex: 11, con: 16, int: 6, wis: 16, cha: 9, type: '怪物', size: '大型' },
      { name: '蜥蜴人萨满', hp: 52, ac: 15, attack: '+5', damage: '1d8+3', xp: 1800, str: 15, dex: 12, con: 13, int: 14, wis: 14, cha: 10, type: '类人生物', size: '中型' }
    ],
    cr4: [
      { name: '石像鬼', hp: 52, ac: 15, attack: '+4', damage: '2d6+2', xp: 2900, str: 15, dex: 11, con: 16, int: 6, wis: 11, cha: 7, type: '构装体', size: '中型' },
      { name: '恶魔蜘蛛', hp: 68, ac: 15, attack: '+6', damage: '2d8+4', xp: 2900, str: 16, dex: 16, con: 14, int: 6, wis: 14, cha: 6, type: '怪物', size: '大型' },
      { name: '狂战士', hp: 65, ac: 14, attack: '+7', damage: '2d12+4', xp: 2900, str: 20, dex: 12, con: 16, int: 8, wis: 10, cha: 12, type: '类人生物', size: '中型' },
      { name: '火焰蛇', hp: 78, ac: 17, attack: '+7', damage: '2d10+4', xp: 2900, str: 12, dex: 18, con: 17, int: 8, wis: 12, cha: 10, type: '元素', size: '大型' }
    ],
    cr5: [
      { name: '成年红龙', hp: 178, ac: 18, attack: '+10', damage: '2d10+6', xp: 6500, str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19, type: '龙', size: '大型', breathWeapon: '15尺锥形 12d6火焰' },
      { name: '巫妖', hp: 135, ac: 17, attack: '+8', damage: '3d8+5', xp: 6500, str: 11, dex: 16, con: 16, int: 20, wis: 14, cha: 16, type: '不死生物', size: '中型' },
      { name: '恶魔领主', hp: 112, ac: 16, attack: '+8', damage: '3d8+5', xp: 6500, str: 18, dex: 15, con: 18, int: 14, wis: 14, cha: 16, type: '恶魔', size: '大型' },
      { name: '石头巨人', hp: 126, ac: 17, attack: '+9', damage: '3d8+6', xp: 6500, str: 23, dex: 15, con: 20, int: 10, wis: 12, cha: 9, type: '巨人', size: '巨型' }
    ]
  }
};

// ========== 角色类 ==========
class DNDCharacter {
  constructor() {
    this.reset();
  }

  reset() {
    this.name = '';
    this.race = null;
    this.subrace = null;
    this.gender = null;
    this.background = null;
    this.class = null;
    this.startingLocation = null;
    this.attributes = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    this.level = 1;
    this.xp = 0;
    this.hp = 0;
    this.maxHp = 0;
    this.ac = 10;
    this.speed = 30;
    this.proficiencyBonus = 2;
    this.skills = [];
    this.traits = [];
    this.equipment = [];
    this.spellSlots = [];
    this.maxSpellSlots = [];
    this.cantrips = [];
    this.spells = [];
    this.proficiency = [];
    this.feats = [];
    this.conditions = [];
    this.hitDice = 0;
    this.maxHitDice = 0;
    this.createdAt = null;
  }

  // ========== 属性与修正值 ==========

  calculateModifiers() {
    const modifiers = {};
    for (const attr in this.attributes) {
      modifiers[attr] = Math.floor((this.attributes[attr] - 10) / 2);
    }
    return modifiers;
  }

  getModifier(attr) {
    return Math.floor((this.attributes[attr] - 10) / 2);
  }

  getSaveDC() {
    if (this.class && DND_DATA.classes.find(c => c.id === this.class.id)?.spellcaster) {
      const spellcastingAbility = this._getSpellcastingAbility();
      return 8 + this.proficiencyBonus + this.getModifier(spellcastingAbility);
    }
    return null;
  }

  // 获取施法关键属性
  _getSpellcastingAbility() {
    if (!this.class) return 'int';
    const classData = DND_DATA.classes.find(c => c.id === this.class.id);
    if (!classData) return 'int';
    switch (classData.id) {
      case 'cleric':
      case 'druid':
      case 'ranger':
        return 'wis';
      case 'paladin':
      case 'bard':
        return 'cha';
      case 'wizard':
      default:
        return 'int';
    }
  }

  getNextLevelXP() {
    return DND_DATA.xpThresholds[this.level] || 355000;
  }

  // ========== 经验值与升级 ==========

  /**
   * 增加经验值
   * @param {number} amount - 获得的经验值
   * @returns {{ leveledUp: boolean, newLevel: number, xpGained: number }}
   */
  addXP(amount) {
    this.xp += amount;
    const threshold = this.getNextLevelXP();
    if (this.xp >= threshold && this.level < 20) {
      this.levelUp();
      return { leveledUp: true, newLevel: this.level, xpGained: amount };
    }
    return { leveledUp: false, newLevel: this.level, xpGained: amount };
  }

  /**
   * 升级
   * @returns {{ newLevel: number, hpGained: number, newMaxHp: number, newProficiency: number, newSpellSlots: number[], canLearnFeat: boolean, featChoices: string[] } | null}
   */
  levelUp() {
    if (this.level >= 20) return null;

    this.level++;
    const classData = DND_DATA.classes.find(c => c.id === this.class?.id);
    let hpGained = 0;

    if (classData) {
      // 取平均值：floor(hitDie/2) + 1
      const avgRoll = Math.floor(classData.hitDie / 2) + 1;
      const conMod = this.getModifier('con');
      hpGained = Math.max(1, avgRoll + conMod);
      this.maxHp += hpGained;
      this.hp = this.maxHp;

      // 更新生命骰
      this.maxHitDice = this.level;
      this.hitDice = this.maxHitDice;
    }

    // 更新熟练加值
    this.proficiencyBonus = 2 + Math.floor((this.level - 1) / 4);

    // 更新法术位
    const newSpellSlots = this._updateSpellSlots();

    // 判断是否可以学习专长（每4级可选一个专长）
    const canLearnFeat = this.level % 4 === 0;
    const featChoices = canLearnFeat ? this.getAvailableFeats().map(f => f.id) : [];

    return {
      newLevel: this.level,
      hpGained,
      newMaxHp: this.maxHp,
      newProficiency: this.proficiencyBonus,
      newSpellSlots,
      canLearnFeat,
      featChoices
    };
  }

  // ========== 专长系统 ==========

  /**
   * 获取可选专长列表（根据属性需求过滤）
   * @returns {Array} 可学习的专长列表
   */
  getAvailableFeats() {
    return DND_DATA.feats.filter(feat => {
      // 已学习的专长不再显示
      if (this.feats.includes(feat.id)) return false;
      // 检查属性需求
      for (const [attr, req] of Object.entries(feat.requirements)) {
        if (this.attributes[attr] < req) return false;
      }
      return true;
    });
  }

  /**
   * 学习专长
   * @param {string} featId - 专长ID
   * @returns {{ success: boolean, message: string }}
   */
  learnFeat(featId) {
    const feat = DND_DATA.feats.find(f => f.id === featId);
    if (!feat) {
      return { success: false, message: `未找到专长: ${featId}` };
    }
    if (this.feats.includes(featId)) {
      return { success: false, message: `已学习专长: ${feat.name}` };
    }
    for (const [attr, req] of Object.entries(feat.requirements)) {
      if (this.attributes[attr] < req) {
        const attrName = DND_DATA.attributeNames[attr] || attr;
        return { success: false, message: `${attrName}不足，需要 ${req}，当前 ${this.attributes[attr]}` };
      }
    }
    this.feats.push(featId);
    return { success: true, message: `成功学习专长: ${feat.name}` };
  }

  // ========== 法术位系统 ==========

  /**
   * 获取当前可用法术位
   * @returns {number[]} 各环法术位剩余数量 [1环, 2环, ...]
   */
  getSpellSlots() {
    return [...this.spellSlots];
  }

  /**
   * 消耗法术位
   * @param {number} level - 法术环阶（1-9）
   * @returns {{ success: boolean, message: string, remaining: number }}
   */
  useSpellSlot(level) {
    if (level < 1 || level > 9) {
      return { success: false, message: '无效的法术环阶', remaining: 0 };
    }
    const idx = level - 1;
    if (!this.spellSlots[idx] || this.spellSlots[idx] <= 0) {
      return { success: false, message: `${level}环法术位已用尽`, remaining: 0 };
    }
    this.spellSlots[idx]--;
    return { success: true, message: `消耗1个${level}环法术位`, remaining: this.spellSlots[idx] };
  }

  /**
   * 恢复法术位（长休时调用）
   */
  recoverSpellSlots() {
    this.spellSlots = [...this.maxSpellSlots];
  }

  // ========== 休息系统 ==========

  /**
   * 短休：恢复一半生命骰（最少1个），可用生命骰恢复HP
   * @param {number} hitDiceToUse - 要使用的生命骰数量
   * @returns {{ hitDiceUsed: number, hpRecovered: number, hitDiceRemaining: number }}
   */
  shortRest(hitDiceToUse = 0) {
    // 恢复一半生命骰（最少1个）
    const recoveredDice = Math.max(1, Math.floor(this.maxHitDice / 2));
    this.hitDice = Math.min(this.maxHitDice, this.hitDice + recoveredDice);

    let hpRecovered = 0;
    let actualDiceUsed = 0;
    const classData = DND_DATA.classes.find(c => c.id === this.class?.id);
    if (classData && hitDiceToUse > 0) {
      actualDiceUsed = Math.min(hitDiceToUse, this.hitDice);
      for (let i = 0; i < actualDiceUsed; i++) {
        const roll = Math.floor(Math.random() * classData.hitDie) + 1;
        const conMod = this.getModifier('con');
        const healed = Math.max(1, roll + conMod);
        hpRecovered += healed;
        this.hitDice--;
      }
      this.hp = Math.min(this.maxHp, this.hp + hpRecovered);
    }

    return {
      hitDiceUsed: actualDiceUsed,
      hpRecovered,
      hitDiceRemaining: this.hitDice
    };
  }

  /**
   * 长休：恢复全部HP、法术位、移除疾病/中毒
   * @returns {{ hpRecovered: number, spellSlotsRecovered: boolean, conditionsRemoved: string[] }}
   */
  longRest() {
    const oldHp = this.hp;
    this.hp = this.maxHp;
    const hpRecovered = this.maxHp - oldHp;

    // 恢复法术位
    this.recoverSpellSlots();

    // 恢复所有生命骰
    this.hitDice = this.maxHitDice;

    // 移除疾病和中毒
    const conditionsToRemove = ['疾病', '中毒', '力竭1', '力竭2'];
    const removed = [];
    this.conditions = this.conditions.filter(cond => {
      if (conditionsToRemove.includes(cond)) {
        removed.push(cond);
        return false;
      }
      return true;
    });

    return {
      hpRecovered,
      spellSlotsRecovered: true,
      conditionsRemoved: removed
    };
  }

  // ========== 伤害与治疗 ==========

  /**
   * 受到伤害
   * @param {number} amount - 伤害量
   * @returns {{ downed: boolean, currentHp: number, damageTaken: number }}
   */
  takeDamage(amount) {
    const actualDamage = Math.max(0, amount);
    this.hp -= actualDamage;
    const downed = this.hp <= 0;
    if (this.hp < 0) this.hp = 0;
    return { downed, currentHp: this.hp, damageTaken: actualDamage };
  }

  /**
   * 恢复HP
   * @param {number} amount - 恢复量
   * @returns {{ currentHp: number, hpHealed: number, overheal: number }}
   */
  heal(amount) {
    const oldHp = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    const hpHealed = this.hp - oldHp;
    const overheal = Math.max(0, amount - hpHealed);
    return { currentHp: this.hp, hpHealed, overheal };
  }

  // ========== 法术查询 ==========

  /**
   * 获取可用的法术列表
   * @param {string} level - 法术环阶 ('cantrips', 'level1', 'level2', ...)
   * @returns {string[]} 可用该环阶的法术名称列表
   */
  getAvailableSpells(level) {
    if (!this.class) return [];
    const classData = DND_DATA.classes.find(c => c.id === this.class.id);
    if (!classData || !classData.spellcaster) return [];

    const spellLevelKey = level;
    if (!DND_DATA.spells[spellLevelKey]) return [];

    const classSpells = DND_DATA.spells[spellLevelKey][this.class.id];
    return classSpells || [];
  }

  // ========== 战斗计算 ==========

  /**
   * 计算AC（考虑装备加成）
   * @returns {number} 护甲等级
   */
  calculateAC() {
    let baseAC = 10 + this.getModifier('dex');

    // 检查是否有法师护甲法术
    if (this.spells && this.spells.includes('法师护甲')) {
      baseAC = 13 + this.getModifier('dex');
    }

    // 检查装备中的护甲
    if (this.equipment) {
      for (const item of this.equipment) {
        // 兼容 inventory.js 的 Item 对象格式
        if (item && typeof item === 'object' && item.type) {
          if (item.type === 'armor' && item.slot) {
            if (item.slot === 'shield') { acBonus += item.stats?.ac || 2; continue; }
            if (['chest', 'head', 'legs', 'feet', 'hands'].includes(item.slot)) {
              acBonus += item.stats?.ac || 0;
            }
          }
          if (item.type === 'weapon' && item.slot === 'shield') {
            acBonus += item.stats?.ac || 2;
          }
          continue;
        }
        if (typeof item === 'string') {
          if (item.includes('皮甲') || item.includes('轻甲')) {
            baseAC = 11 + this.getModifier('dex');
          } else if (item.includes('锁子甲') || item.includes('中甲')) {
            baseAC = 14 + Math.min(this.getModifier('dex'), 2);
          } else if (item.includes('板甲') || item.includes('重甲')) {
            baseAC = 18;
          } else if (item.includes('盾')) {
            baseAC += 2;
          }
        }
      }
    }

    this.ac = baseAC;
    return baseAC;
  }

  /**
   * 计算攻击加值
   * @param {'melee'|'ranged'} [type='melee'] - 攻击类型
   * @returns {number} 攻击加值
   */
  getAttackBonus(type = 'melee') {
    let abilityMod;
    if (type === 'ranged') {
      abilityMod = this.getModifier('dex');
    } else {
      // 近战使用力量或敏捷（取较高值）
      abilityMod = Math.max(this.getModifier('str'), this.getModifier('dex'));
    }
    return this.proficiencyBonus + abilityMod;
  }

  /**
   * 计算伤害加值
   * @param {'melee'|'ranged'} [type='melee'] - 攻击类型
   * @returns {number} 伤害加值
   */
  getDamageBonus(type = 'melee') {
    let abilityMod;
    if (type === 'ranged') {
      abilityMod = this.getModifier('dex');
    } else {
      abilityMod = Math.max(this.getModifier('str'), this.getModifier('dex'));
    }

    let bonus = abilityMod;

    // 专长加成
    if (this.feats.includes('great_weapon_master') && type === 'melee') {
      bonus += 2;
    }
    if (this.feats.includes('sharpshooter') && type === 'ranged') {
      bonus += 10;
    }
    if (this.feats.includes('dual_wielder')) {
      bonus += 1;
    }

    return bonus;
  }

  // ========== 特性与状态 ==========

  /**
   * 检查是否有某特性
   * @param {string} featureName - 特性名称
   * @returns {boolean}
   */
  hasFeature(featureName) {
    // 检查种族特性
    if (this.race && this.race.traits && this.race.traits.includes(featureName)) {
      return true;
    }
    // 检查背景特性
    if (this.background && this.background.feature === featureName) {
      return true;
    }
    // 检查专长
    if (this.feats.includes(featureName)) {
      return true;
    }
    // 检查自定义特性
    if (this.traits && this.traits.includes(featureName)) {
      return true;
    }
    return false;
  }

  /**
   * 添加状态效果
   * @param {string} condition - 状态名称
   * @returns {{ success: boolean, message: string }}
   */
  addCondition(condition) {
    if (this.conditions.includes(condition)) {
      return { success: false, message: `已处于${condition}状态` };
    }
    this.conditions.push(condition);
    return { success: true, message: `添加状态: ${condition}` };
  }

  /**
   * 移除状态效果
   * @param {string} condition - 状态名称
   * @returns {{ success: boolean, message: string }}
   */
  removeCondition(condition) {
    const idx = this.conditions.indexOf(condition);
    if (idx === -1) {
      return { success: false, message: `未处于${condition}状态` };
    }
    this.conditions.splice(idx, 1);
    return { success: true, message: `移除状态: ${condition}` };
  }

  /**
   * 获取当前所有状态效果
   * @returns {string[]}
   */
  getConditions() {
    return [...this.conditions];
  }

  // ========== 内部方法 ==========

  /**
   * 更新法术位（内部方法）
   * @returns {number[]} 新的最大法术位
   */
  _updateSpellSlots() {
    if (!this.class) return [];

    const classData = DND_DATA.classes.find(c => c.id === this.class.id);
    if (!classData || !classData.spellcaster) return [];

    const classId = this.class.id;
    const table = DND_DATA.spellSlotTable[classId];
    if (!table) return [];

    const levelIdx = this.level - 1;
    if (levelIdx >= table.length) return [];

    this.maxSpellSlots = [...table[levelIdx]];
    this.spellSlots = [...this.maxSpellSlots];
    return [...this.maxSpellSlots];
  }

  // ========== 序列化 ==========

  /**
   * 序列化为JSON对象
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      race: this.race,
      subrace: this.subrace,
      gender: this.gender,
      background: this.background,
      class: this.class,
      startingLocation: this.startingLocation,
      attributes: this.attributes,
      level: this.level,
      xp: this.xp,
      hp: this.hp,
      maxHp: this.maxHp,
      ac: this.ac,
      speed: this.speed,
      proficiencyBonus: this.proficiencyBonus,
      skills: this.skills,
      traits: this.traits,
      equipment: this.equipment,
      spellSlots: this.spellSlots,
      maxSpellSlots: this.maxSpellSlots,
      cantrips: this.cantrips || [],
      spells: this.spells || [],
      proficiency: this.proficiency,
      feats: this.feats || [],
      conditions: this.conditions || [],
      hitDice: this.hitDice || 0,
      maxHitDice: this.maxHitDice || 0,
      createdAt: this.createdAt || new Date().toISOString()
    };
  }

  /**
   * 从JSON对象反序列化
   * @param {Object} json - JSON数据
   * @returns {DNDCharacter}
   */
  static fromJSON(json) {
    const char = new DNDCharacter();
    Object.assign(char, json);
    // 确保新字段存在
    if (!char.feats) char.feats = [];
    if (!char.conditions) char.conditions = [];
    if (!char.maxSpellSlots) char.maxSpellSlots = [];
    if (!char.spellSlots) char.spellSlots = [];
    if (char.hitDice === undefined) char.hitDice = 0;
    if (char.maxHitDice === undefined) char.maxHitDice = 0;
    return char;
  }
}

// 导出
window.DND_DATA = DND_DATA;
window.DNDCharacter = DNDCharacter;
