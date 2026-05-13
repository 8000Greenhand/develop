// 骰子系统
class DiceSystem {
  constructor() {
    this.rolling = false;
    this.history = [];
  }

  // 掷单个骰子
  roll(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }

  // 掷骰子表达式 (如 "2d6+3")
  rollExpression(expression) {
    const match = expression.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match) return { total: 0, rolls: [], modifier: 0 };
    
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;
    
    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(this.roll(sides));
    }
    
    const total = rolls.reduce((a, b) => a + b, 0) + modifier;
    return { total, rolls, modifier, expression };
  }

  // 属性掷骰 (4d6取高3)
  rollAbilityScores() {
    const scores = {};
    const attrs = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    attrs.forEach(attr => {
      const rolls = [];
      for (let i = 0; i < 4; i++) {
        rolls.push(this.roll(6));
      }
      rolls.sort((a, b) => b - a);
      scores[attr] = rolls.slice(0, 3).reduce((a, b) => a + b, 0);
    });
    
    return scores;
  }

  // 优势/劣势掷骰
  rollWithAdvantage(disadvantage = false) {
    const roll1 = this.roll(20);
    const roll2 = this.roll(20);
    
    if (disadvantage) {
      return { 
        rolls: [roll1, roll2], 
        selected: Math.min(roll1, roll2),
        type: 'disadvantage'
      };
    }
    return { 
      rolls: [roll1, roll2], 
      selected: Math.max(roll1, roll2),
      type: 'advantage'
    };
  }

  // 攻击检定
  attackRoll(abilityMod, proficiency = 0, advantage = false, disadvantage = false) {
    let d20roll;
    
    if (advantage && !disadvantage) {
      d20roll = this.rollWithAdvantage(false);
    } else if (disadvantage && !advantage) {
      d20roll = this.rollWithAdvantage(true);
    } else {
      const roll = this.roll(20);
      d20roll = { rolls: [roll], selected: roll, type: 'normal' };
    }
    
    const total = d20roll.selected + abilityMod + proficiency;
    
    return {
      ...d20roll,
      abilityMod,
      proficiency,
      total,
      critical: d20roll.selected === 20,
      fumble: d20roll.selected === 1,
      hit: total
    };
  }

  // 技能检定
  skillCheck(abilityMod, proficiency = 0, advantage = false, disadvantage = false) {
    return this.attackRoll(abilityMod, proficiency, advantage, disadvantage);
  }

  // 豁免检定
  savingThrow(abilityMod, proficient = false) {
    const prof = proficient && window.gameState?.character?.proficiencyBonus ? window.gameState.character.proficiencyBonus : 0;
    return this.attackRoll(abilityMod, prof);
  }

  // 伤害掷骰
  damageRoll(diceExpression, abilityMod = 0) {
    const result = this.rollExpression(diceExpression);
    return {
      ...result,
      total: result.total + abilityMod
    };
  }

  // 添加到历史
  addToHistory(roll, context) {
    this.history.unshift({
      roll,
      context,
      timestamp: Date.now()
    });
    if (this.history.length > 50) {
      this.history.pop();
    }
  }

  // 获取历史
  getHistory() {
    return this.history;
  }
}

// 骰子动画类
class DiceAnimator {
  constructor(container) {
    this.container = container;
    this.diceElement = null;
  }

  createDiceElement(sides) {
    const dice = document.createElement('div');
    dice.className = `dice dice-${sides}`;
    dice.innerHTML = this.getDiceFace(sides);
    return dice;
  }

  getDiceFace(sides) {
    const faces = {
      4: '▲',
      6: '⬢',
      8: '◈',
      10: '⏣',
      12: '⬡',
      20: '⬢'
    };
    return `<span class="dice-face">${faces[sides] || sides}</span>`;
  }

  async animateRoll(sides, callback) {
    const result = Math.floor(Math.random() * sides) + 1;
    
    // 创建骰子元素
    const dice = document.createElement('div');
    dice.className = `dice dice-${sides} rolling`;
    dice.innerHTML = this.getDiceFace(sides);
    
    if (this.container) {
      this.container.appendChild(dice);
    }
    
    // 动画
    const duration = 1500;
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const displayValue = Math.floor(Math.random() * sides) + 1;
        const faceEl = dice.querySelector('.dice-face');
        if (faceEl) {
          faceEl.textContent = displayValue;
        }
        
        if (elapsed >= duration) {
          clearInterval(interval);
          dice.classList.remove('rolling');
          dice.classList.add('result');
          const finalFace = dice.querySelector('.dice-face');
          if (finalFace) {
            finalFace.textContent = result;
          }
          
          // 回调
          setTimeout(() => {
            if (callback) callback(result);
            setTimeout(() => {
              dice.remove();
            }, 1500);
          }, 300);
          
          resolve(result);
        }
      }, 80);
    });
  }

  async animateMultipleRolls(rolls, sides, callback) {
    const results = [];
    
    // 创建多个骰子容器
    const diceContainer = document.createElement('div');
    diceContainer.className = 'dice-multiple-container';
    
    if (this.container) {
      this.container.appendChild(diceContainer);
    }
    
    for (let i = 0; i < rolls; i++) {
      const dice = this.createDiceElement(sides);
      diceContainer.appendChild(dice);
    }
    
    // 动画所有骰子
    const duration = 2000;
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed >= duration) {
          clearInterval(interval);
          
          // 设置最终结果
          diceContainer.querySelectorAll('.dice').forEach((dice, i) => {
            const result = Math.floor(Math.random() * sides) + 1;
            results.push(result);
            dice.classList.add('result');
            const faceEl = dice.querySelector('.dice-face');
            if (faceEl) {
              faceEl.textContent = result;
            }
          });
          
          setTimeout(() => {
            if (callback) callback(results);
            diceContainer.remove();
          }, 1500);
          
          resolve(results);
        }
      }, 100);
    });
  }

  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// 全局实例
window.diceSystem = new DiceSystem();
