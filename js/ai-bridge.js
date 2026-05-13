// AI DM 后端通信接口 - DeepSeek 代理版
class AIDMBridge {
  constructor() {
    // 代理服务地址（云电脑公网地址 + 端口，稍后配置）
    this.proxyUrl = localStorage.getItem('dnd_proxy_url') || '';
    this.conversationHistory = [];
    this.gameContext = {};
    this.isConnected = false;
  }

  // 设置代理地址
  setProxyUrl(url) {
    this.proxyUrl = url.replace(/\/$/, '');
    localStorage.setItem('dnd_proxy_url', this.proxyUrl);
  }

  // 测试连接
  async testConnection() {
    try {
      const resp = await fetch(`${this.proxyUrl}/api/health`);
      const data = await resp.json();
      this.isConnected = data.status === 'ok';
      return this.isConnected;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  // 构建 System Prompt
  buildSystemPrompt() {
    const char = window.gameState?.character;
    
    const charInfo = char ? `
当前角色信息：
- 姓名：${char.name || '未知'}
- 种族：${char.race?.name || '未知'} ${char.subrace?.name || ''}
- 性别：${char.gender || '未知'}
- 职业：${char.class?.name || '未知'}
- 等级：${char.level || 1}
- HP：${char.hp || 0}/${char.maxHp || 0}
- AC：${char.ac || 10}
- 属性：力量${char.attributes?.str||10} 敏捷${char.attributes?.dex||10} 体质${char.attributes?.con||10} 智力${char.attributes?.int||10} 感知${char.attributes?.wis||10} 魅力${char.attributes?.cha||10}
- 背景：${char.background?.name || '未知'}
- 当前位置：${char.location?.name || '未知'}
` : '角色信息未加载';

    return `你是"暗影编年"——一位严格遵循D&D 5e规则的专业地下城主（DM）。

## 核心原则

### DM行为准则（铁律）
1. **真实至上**：真实的失败比虚假的胜利更有价值。好的DM提供挑战，而不是胜利。
2. **零放水**：绝不故意让敌人打偏、降低伤害、或给玩家不合理的优势。敌人的每一次攻击都是全力。
3. **零幻觉**：所有数据必须有来源。不得凭空创造骰点结果、状态效果或NPC行为。所有数值必须真实计算。
4. **规则优先**：严格遵循D&D 5e官方规则（PHB、MM、DMG），不编造规则。
5. **不替玩家决定**：绝不替玩家做任何决定，哪怕玩家犹豫也要等待。
6. **挑战公平**：根据角色等级匹配合适的挑战，但绝不削弱敌人。

### 流程控制
- 每次只推进一个行动，等待玩家响应后再继续
- 需要检定时，明确说明检定类型和DC值
- 战斗按先攻顺序轮流行动，不自动推进多轮
- 战斗后必须按顺序：计算经验→检查升级→处理俘虏→搜刮战利品→保存状态→继续剧情

## 骰点规则
- 需要检定时，显示格式：[检定类型] d20+修正值 = 结果 vs DC
- 暴击：d20自然投出20，伤害骰翻倍
- 大失败：d20自然投出1，产生额外负面效果
- 优势：掷两次取高值
- 劣势：掷两次取低值

## 战斗规则
- 先攻：d20+敏捷修正值
- 攻击：d20+攻击修正值 vs AC
- 伤害：武器骰+属性修正值
- 法术：按法术描述执行，消耗法术位
- 休息：短休息恢复部分能力，长休息完全恢复

## 剧情生成规则
1. 根据角色等级选择剧情难度：
   - 1-4级：村庄任务、个人冒险、小型地城
   - 5-10级：地区冲突、组织任务、中型地城
   - 11-16级：国家战争、重大阴谋、大型地城
   - 17-20级：世界危机、神明冲突、史诗冒险
2. 避免重复：不要总用"邪恶仪式毁灭世界"的老套路
3. 多样化：失物找回、组织冲突、守护任务、调查谜案、探索遗迹等

## 输出格式
你的每次回复包含：
- **场景描述**：用氛围感强的文字描述当前环境和事件（3-5句话）
- **DM判定**：需要检定时，说明检定类型、DC、结果
- **游戏数据**：战斗时提供精确的HP/伤害/XP数据
- **行动选项**：末尾提供2-4个可选行动建议，用数字标注

## 禁止事项
- ❌ 禁止代替玩家做决定
- ❌ 禁止自动推进多轮战斗
- ❌ 禁止编造不存在的D&D规则
- ❌ 禁止忽略玩家行动直接跳到结果
- ❌ 禁止让敌人故意攻击不中或降低伤害
- ❌ 禁止凭空创造骰点结果

${charInfo}`;
  }

  // 核心 Chat 方法
  async chat(userMessage, context = {}) {
    if (!this.proxyUrl) {
      return { error: '请先在设置中配置AI代理地址' };
    }

    // 添加用户消息到历史
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // 管理上下文窗口（保留最近20轮对话）
    if (this.conversationHistory.length > 40) {
      this.conversationHistory = this.conversationHistory.slice(-30);
    }

    try {
      const resp = await fetch(`${this.proxyUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: this.buildSystemPrompt() },
            ...this.conversationHistory
          ],
          temperature: 0.8,
          max_tokens: 2000
        })
      });

      if (!resp.ok) {
        throw new Error(`API error: ${resp.status}`);
      }

      const data = await resp.json();
      const aiMessage = data.choices?.[0]?.message?.content || '...';

      // 添加到历史
      this.conversationHistory.push({
        role: 'assistant',
        content: aiMessage
      });

      return {
        message: aiMessage,
        usage: data.usage
      };
    } catch (err) {
      console.error('AI DM error:', err);
      return { error: `AI连接失败: ${err.message}` };
    }
  }

  // 流式 Chat（逐字输出）
  async chatStream(userMessage, onChunk, onDone) {
    if (!this.proxyUrl) {
      onDone({ error: '请先在设置中配置AI代理地址' });
      return;
    }

    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    if (this.conversationHistory.length > 40) {
      this.conversationHistory = this.conversationHistory.slice(-30);
    }

    try {
      const resp = await fetch(`${this.proxyUrl}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: this.buildSystemPrompt() },
            ...this.conversationHistory
          ],
          temperature: 0.8,
          max_tokens: 2000,
          stream: true
        })
      });

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullMessage = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullMessage += content;
                onChunk(content, fullMessage);
              }
            } catch {}
          }
        }
      }

      this.conversationHistory.push({
        role: 'assistant',
        content: fullMessage
      });

      onDone({ message: fullMessage });
    } catch (err) {
      onDone({ error: `AI连接失败: ${err.message}` });
    }
  }

  // 清除对话历史（新游戏时调用）
  clearHistory() {
    this.conversationHistory = [];
  }

  // ========== 兼容旧接口的模拟方法 ==========
  
  // 检查连接状态（兼容旧接口）
  async checkConnection() {
    return this.testConnection();
  }

  // 发送消息（兼容旧接口）
  async sendMessage(message, context = {}) {
    if (!this.proxyUrl) {
      return this.getMockResponse(message, context);
    }
    return this.chat(message, context);
  }

  // 获取 AI 响应（模拟 - 离线时使用）
  getMockResponse(message, context) {
    const responses = {
      welcome: `欢迎来到龙与地下城的世界，勇敢的冒险者！
      
在这个充满危险与奇迹的境界中，你将书写属于自己的传奇故事。

你的旅程将从选择你的起始之地开始——是宁静的村庄、繁华的都市，还是危险与机遇并存的边境？

无论你选择什么，命运已经为你准备好了无数挑战与荣耀。`,

      introduction: (char) => `${char.name}，一位${char.race?.name || '人类'}${char.class?.name || '冒险者'}，
踏上了这段充满未知的冒险之旅。

你的背景是${char.background?.name || '平民'}，这塑造了你独特的视角和技能。
在你面前展开的，是一段将考验你勇气与智慧的史诗。`,

      scene: {
        village: `你站在宁静的艾尔德村庄入口，晨雾在茅草屋顶间缭绕。
一位老人坐在井边，正在编织着什么。
远处传来铁匠铺的锤击声，偶尔夹杂着几声犬吠。
村子的告示板上贴着几张羊皮纸，看起来有什么任务等待着勇者。`,
        
        city: `你来到了繁忙的贸易都市——诺瓦城。
石头铺就的街道上人来人往，商人吆喝着各自的货物。
空气中弥漫着香料和烤肉的混合气息。
一座宏伟的城堡耸立在远方，它的尖塔直插云霄。`,
        
        frontier: `你站在边境要塞的高墙上，眺望着远方的荒野。
狂风呼啸，带着沙漠的尘土和未知危险的气息。
远处的篝火点点，那是游牧民族的营地。
更远的地方，古老废墟的轮廓若隐若现。`,
        
        port: `你踏上了繁忙的盐风港。
咸腥的海风扑面而来，海鸥在桅杆间穿梭鸣叫。
各种语言的叫卖声不绝于耳，水手们忙着装卸货物。
码头边停泊着来自远方的船只，诉说着一神秘国度的故事。`,
        
        ruins: `你站在被遗忘的古老遗迹入口。
藤蔓爬满了斑驳的石柱，地面上散落着破碎的雕像。
空气中弥漫着霉味和某种金属的气息。
这里埋藏着远古文明的秘密，也潜伏着未知的危险。`
      },

      combat: `战斗爆发了！
你的心跳加速，肾上腺素涌动。
敌人露出狰狞的面目，危机四伏！`,

      victory: `胜利的欢呼响彻战场！
你的勇气和智慧赢得了这场战斗。
经验值与战利品是你英勇的见证。`,

      death: `黑暗笼罩了你的视野……
但冒险并未结束。你的灵魂在虚空中徘徊。
古老的仪式或许能让你重返人间。`,

      levelUp: (level) => `恭喜！你升到了 ${level} 级！
你的能力得到了提升，命运的天平向你倾斜。
新的力量在等待着你……`
    };

    return {
      type: 'narrative',
      content: responses[message] || responses.welcome,
      timestamp: Date.now()
    };
  }

  // 获取场景描述
  async getSceneDescription(location, context = {}) {
    if (this.proxyUrl) {
      try {
        const resp = await this.chat(`请描述一个位于${location}的详细场景，包括：环境氛围、可见的NPC、可能的互动点。用2-3句话描述。`, context);
        if (resp.message) return resp.message;
      } catch {}
    }
    
    // 降级到模拟数据
    const locationData = DND_DATA?.startingLocations?.find(l => l.id === location);
    const baseDescription = locationData?.description || '一片未知的土地。';
    
    const sceneElements = [
      { type: 'npc', possible: ['神秘的旅人', '巡逻的卫兵', '摆摊的商人', '流浪的诗人'] },
      { type: 'event', possible: ['远处传来喧嚣声', '天空掠过一只巨鸟', '行人向你投来好奇的目光'] },
      { type: 'location', possible: ['一间灯火通明的酒馆', '一座古老的喷泉', '一条幽暗的小巷'] }
    ];

    const randomElement = sceneElements[Math.floor(Math.random() * sceneElements.length)];
    
    return `${baseDescription}

${randomElement.possible[Math.floor(Math.random() * randomElement.possible.length)]}。`;
  }

  // 生成随机遭遇
  async generateRandomEncounter(characterLevel, location) {
    const encounters = {
      village: [
        { name: '哥布林', cr: '1/4', hp: 7, ac: 15, attack: '+4', damage: '1d6+2', xp: 50 },
        { name: '野狼', cr: '1/4', hp: 11, ac: 13, attack: '+4', damage: '2d4+2', xp: 50 },
        { name: '盗贼', cr: '1/8', hp: 9, ac: 12, attack: '+3', damage: '1d6+2', xp: 25 }
      ],
      city: [
        { name: '城市卫兵', cr: '1/8', hp: 9, ac: 14, attack: '+3', damage: '1d6+2', xp: 25 },
        { name: '街头混混', cr: '0', hp: 4, ac: 11, attack: '+2', damage: '1d4+1', xp: 10 },
        { name: '刺客', cr: '1', hp: 22, ac: 15, attack: '+5', damage: '1d6+3', xp: 200 }
      ],
      frontier: [
        { name: '骷髅战士', cr: '1/4', hp: 13, ac: 13, attack: '+3', damage: '1d6+1', xp: 50 },
        { name: '食尸鬼', cr: '1', hp: 13, ac: 13, attack: '+4', damage: '1d4+2', xp: 200 },
        { name: '座狼', cr: '1/2', hp: 19, ac: 13, attack: '+4', damage: '2d6+2', xp: 100 }
      ],
      port: [
        { name: '海盗', cr: '1/8', hp: 11, ac: 12, attack: '+3', damage: '1d6+2', xp: 25 },
        { name: '骷髅水手', cr: '1/4', hp: 10, ac: 13, attack: '+3', damage: '1d6+1', xp: 50 },
        { name: '海妖', cr: '2', hp: 45, ac: 15, attack: '+5', damage: '2d8+3', xp: 450 }
      ],
      ruins: [
        { name: '骷髅', cr: '1/4', hp: 13, ac: 13, attack: '+3', damage: '1d6+1', xp: 50 },
        { name: '石像鬼', cr: '1', hp: 26, ac: 15, attack: '+4', damage: '1d8+2', xp: 200 },
        { name: '吸血鬼仆从', cr: '1/2', hp: 22, ac: 14, attack: '+4', damage: '1d6+2', xp: 100 }
      ]
    };

    const locationEncounters = encounters[location] || encounters.village;
    return locationEncounters[Math.floor(Math.random() * locationEncounters.length)];
  }

  // 处理用户行动
  async processAction(action, context = {}) {
    const actionHandlers = {
      attack: async (target) => {
        const roll = window.diceSystem?.roll(20) || Math.floor(Math.random() * 20) + 1;
        const abilityMod = window.gameState?.character?.getModifier?.('str') || 0;
        const proficiency = window.gameState?.character?.proficiencyBonus || 2;
        const total = roll + abilityMod + proficiency;
        
        return {
          type: 'attack',
          roll,
          abilityMod,
          proficiency,
          total,
          hit: total >= 15,
          damage: roll === 20 ? 20 : 8,
          critical: roll === 20,
          message: roll === 20 
            ? `暴击！你造成了 ${roll === 20 ? 20 : 8} 点伤害！` 
            : total >= 15 
              ? `命中！你造成了 ${8} 点伤害。`
              : '未命中！'
        };
      },
      
      move: async (destination) => {
        return {
          type: 'movement',
          destination,
          message: `你前往了 ${destination}。`
        };
      },
      
      talk: async (npc) => {
        return {
          type: 'dialogue',
          npc,
          message: `你与 ${npc} 交谈。`
        };
      },
      
      search: async (location) => {
        const roll = window.diceSystem?.roll(20) || Math.floor(Math.random() * 20) + 1;
        return {
          type: 'search',
          roll,
          result: roll >= 15 ? '发现了一些有用的东西！' : '没有发现什么。',
          message: `搜索检定：${roll} - ${roll >= 15 ? '成功！' : '失败。'}`
        };
      },
      
      cast: async (spell) => {
        return {
          type: 'spell',
          spell,
          message: `你施放了 ${spell}！`
        };
      }
    };

    if (actionHandlers[action.type]) {
      return actionHandlers[action.type](action.target);
    }
    
    return {
      type: 'unknown',
      message: '无法理解这个行动。'
    };
  }

  // 获取建议行动
  async getSuggestedActions(context = {}) {
    return [
      { id: 'explore', name: '探索周围', icon: '🔍' },
      { id: 'talk', name: '与人交谈', icon: '💬' },
      { id: 'rest', name: '休息恢复', icon: '⛺' },
      { id: 'inventory', name: '查看背包', icon: '🎒' }
    ];
  }

  // 格式化 AI 响应
  formatResponse(response) {
    let formatted = response.content || response.message || '';
    
    // 替换表情符号
    formatted = formatted
      .replace(/💀/g, '<span class="icon-skull">💀</span>')
      .replace(/⚔️/g, '<span class="icon-sword">⚔️</span>')
      .replace(/🛡️/g, '<span class="icon-shield">🛡️</span>')
      .replace(/🎲/g, '<span class="icon-dice">🎲</span>')
      .replace(/✨/g, '<span class="icon-sparkle">✨</span>')
      .replace(/🌟/g, '<span class="icon-star">🌟</span>')
      .replace(/💫/g, '<span class="icon-star2">💫</span>');
    
    return formatted;
  }
}

// 全局实例 - 同时保留旧名称兼容性
window.aiDM = new AIDMBridge();
window.aiBridge = window.aiDM; // 兼容旧代码
