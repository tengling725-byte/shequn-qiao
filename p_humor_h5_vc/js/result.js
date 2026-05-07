// 结果页逻辑
var result = {
  currentTipIndex: 0,
  tips: [],
  
  init: function() {
    var data = window.gameResult;
    if (!data) {
      router.navigate('index');
      return;
    }
    
    var score = data.score;
    var correctCount = data.correctCount;
    var maxStreak = data.maxStreak;
    var explosCount = data.explosCount;
    var avgTimeSpent = data.avgTimeSpent;
    var newHighScore = data.newHighScore;
    var totalScore = data.totalScore;
    var questions = data.questions;
    
    // 显示结果
    document.getElementById('final-score').textContent = score;
    document.getElementById('correct-count').textContent = correctCount + '/10';
    document.getElementById('max-streak').textContent = maxStreak + '连击';
    document.getElementById('total-score-result').textContent = totalScore;
    
    // 评级
    var rating = getRating(correctCount, 10, 0);
    var ratingEl = document.getElementById('rating');
    ratingEl.textContent = rating;
    ratingEl.className = 'rating ' + rating;
    
    // 爆炸标签
    var badge = document.getElementById('explos-badge');
    if (explosCount > 0) {
      badge.textContent = '🔥 爆炸 ' + explosCount + '次';
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
    
    // 新纪录
    var newRecord = document.getElementById('new-record');
    if (newHighScore === score) {
      newRecord.style.display = 'inline-block';
    } else {
      newRecord.style.display = 'none';
    }
    
    // 提取tips
    this.tips = [];
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].tip) {
        this.tips.push(questions[i].tip);
      }
    }
    this.currentTipIndex = 0;
    
    // 更新首页统计数据
    document.getElementById('total-score').textContent = totalScore;
    document.getElementById('high-score').textContent = newHighScore;
  },
  
  showTips: function() {
    if (this.tips.length === 0) return;
    
    document.getElementById('tip-content').textContent = this.tips[this.currentTipIndex];
    document.getElementById('tip-modal').style.display = 'flex';
    
    // 显示箭头（如果有多条）
    var arrows = document.getElementById('tip-arrows');
    arrows.style.display = this.tips.length > 1 ? 'flex' : 'none';
  },
  
  closeTips: function() {
    document.getElementById('tip-modal').style.display = 'none';
  },
  
  prevTip: function() {
    if (this.tips.length === 0) return;
    this.currentTipIndex--;
    if (this.currentTipIndex < 0) this.currentTipIndex = this.tips.length - 1;
    this.showTips();
  },
  
  nextTip: function() {
    if (this.tips.length === 0) return;
    this.currentTipIndex++;
    if (this.currentTipIndex >= this.tips.length) this.currentTipIndex = 0;
    this.showTips();
  },
  
  showAiAnalysis: function() {
    var data = window.gameResult;
    if (!data) return;
    
    var score = data.score;
    var correctCount = data.correctCount;
    var maxStreak = data.maxStreak;
    var avgTimeSpent = data.avgTimeSpent;
    
    var firstPlayDate = Storage.get('firstPlayDate');
    var gameAge = 0;
    if (firstPlayDate) {
      var firstDate = new Date(firstPlayDate);
      var now = new Date();
      gameAge = Math.floor((now - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    } else {
      Storage.set('firstPlayDate', new Date().toISOString().split('T')[0]);
      gameAge = 1;
    }
    
    var bodyTemp = '', pulse = '', bloodType = '', weakness = '', suggestion = '';
    
    if (correctCount >= 8) {
      bodyTemp = '37.5℃ - 热梗狂魔，全场爆笑！';
      bloodType = 'AB型 - 神反转王！你的脑洞比黑洞还大，结局永远猜不到～';
      weakness = '反转和讽刺类对你来说小case，但偶尔也会被自己的智商笑到～';
      suggestion = '你已经是最强梗王了！建议去脱口秀大会踢馆，笑翻全场！';
    } else if (correctCount >= 6) {
      bodyTemp = '37.2℃ - 微热梗王！热梗制造机预备役～';
      bloodType = 'B型 - 段子输出机！你脑子里装的不是知识，是源源不断的段子～';
      weakness = '对反转类题目还挺6，但遇到荒谬延伸就容易懵圈～';
      suggestion = '再练习练习反转类题目王者就是你了！建议多刷短视频积累段子素材～';
    } else if (correctCount >= 4) {
      bodyTemp = '36.6℃ - 幽默正常！不冷不热刚刚好～';
      bloodType = 'A型 - 温柔搞笑！你很安全，不伤人，就是有时候笑点有点高～';
      weakness = '对讽刺类完全不感冒，get不到阴阳怪气的点～';
      suggestion = '建议多看弹幕吐槽大会，感受一下话里有话的魅力～';
    } else if (correctCount >= 2) {
      bodyTemp = '36.0℃ - 微冷体质！你说的笑话能让人凉快一下～';
      bloodType = 'O型 - 百搭气氛组！你负责笑就行不用懂梗～';
      weakness = '简直是幽默小白，答题全靠缘分和蒙～';
      suggestion = '别慌！幽默可以练！建议先从为什么开始，学会质疑一切～';
    } else {
      bodyTemp = '35.5℃ - 冷梗之王！你一张口，温度直接降10度～';
      bloodType = 'O型 - 气氛组担当！你负责微笑就好了，梗的事情交给别人～';
      weakness = '笑点是什么？你与幽默之间隔了一整个银河系～';
      suggestion = '建议换个星球生活吧，或者多看看喜剧片，绝对笑不出来那种！';
    }
    
    // 根据时间计算脉搏
    if (avgTimeSpent < 3000) {
      pulse = '100次/分 - 秒接神梗！你是接梗仙人，反应快到飞起！';
    } else if (avgTimeSpent < 5000) {
      pulse = '72次/分 - 平稳接梗！反应大众水平，没毛病～';
    } else if (avgTimeSpent < 7000) {
      pulse = '60次/分 - 反射弧较长！等你反应回来，黄花菜都凉了～';
    } else {
      pulse = '50次/分 - 反射弧超长！别人讲完段子，你才开始酝酿笑声～';
    }
    
    var analysis = '🌱 梗龄：' + gameAge + '天\n\n';
    analysis += '🌡️ 玩梗体温\n' + bodyTemp + '\n\n';
    analysis += '💓 接梗脉搏\n' + pulse + '\n\n';
    analysis += '🩸 幽默血型\n' + bloodType + '\n\n';
    analysis += '📊 幽默长短板分析\n' + weakness + '\n\n';
    analysis += '💡 建议\n' + suggestion;
    
    document.getElementById('ai-content').textContent = analysis;
    document.getElementById('ai-modal').style.display = 'flex';
  },
  
  closeAiAnalysis: function() {
    document.getElementById('ai-modal').style.display = 'none';
  }
};

// 初始化结果页
document.addEventListener('DOMContentLoaded', function() {
  // 等待路由切换
  setTimeout(function() {
    var resultPage = document.getElementById('page-result');
    if (resultPage && resultPage.classList.contains('active')) {
      result.init();
    }
  }, 100);
});
