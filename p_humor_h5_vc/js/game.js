// 游戏逻辑
var game = {
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  streakCorrect: 0,
  explos: 1,
  maxStreak: 0,
  explosCount: 0,
  timeLeft: 10,
  timer: null,
  isAnswered: false,
  answerHistory: [],
  
  init: function() {
    var self = this;
    this.questions = getRandomQuestions(10);
    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.streakCorrect = 0;
    this.explos = 1;
    this.maxStreak = 0;
    this.explosCount = 0;
    this.timeLeft = 10;
    this.isAnswered = false;
    this.answerHistory = [];
    
    this.showQuestion();
    this.startTimer();
    
    router.navigate('game');
    
    // 数据追踪
    var gamesPlayed = Storage.getNumber('gamesPlayed') + 1;
    Storage.set('gamesPlayed', gamesPlayed);
  },
  
  showQuestion: function() {
    var self = this;
    if (this.currentIndex >= 10) {
      this.finish();
      return;
    }
    
    var q = this.questions[this.currentIndex];
    document.getElementById('current-question').textContent = q.question;
    document.getElementById('question-num').textContent = this.currentIndex + 1;
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('explos').textContent = this.explos;
    document.getElementById('timer').textContent = this.timeLeft + 's';
    document.getElementById('score-gain').textContent = '';
    
    // 渲染选项
    var optionsEl = document.getElementById('options');
    optionsEl.innerHTML = '';
    
    q.options.forEach(function(opt) {
      var btn = document.createElement('div');
      btn.className = 'option';
      btn.textContent = opt.text;
      btn.onclick = function() {
        self.selectAnswer(opt);
      };
      optionsEl.appendChild(btn);
    });
  },
  
  startTimer: function() {
    var self = this;
    this.timeLeft = 10;
    this.updateTimerDisplay();
    
    this.timer = setInterval(function() {
      self.timeLeft--;
      self.updateTimerDisplay();
      
      if (self.timeLeft <= 0) {
        self.selectAnswer(null);
      }
    }, 1000);
  },
  
  updateTimerDisplay: function() {
    var timerEl = document.getElementById('timer');
    if (timerEl) {
      timerEl.textContent = this.timeLeft + 's';
      timerEl.className = this.timeLeft <= 3 ? 'timer timer-danger' : 'timer';
    }
  },
  
  selectAnswer: function(selectedOption) {
    var self = this;
    if (this.isAnswered) return;
    this.isAnswered = true;
    clearInterval(this.timer);
    
    var q = this.questions[this.currentIndex];
    var isCorrect = selectedOption && selectedOption.correct;
    var humorScore = selectedOption ? selectedOption.humorScore : 0;
    var timeSpent = (10 - this.timeLeft) * 1000;
    
    // 更新分数和统计
    if (humorScore === 5) {
      this.streakCorrect++;
      this.maxStreak = Math.max(this.maxStreak, this.streakCorrect);
      this.correctCount++;
      
      if (this.streakCorrect >= 3) {
        this.score += 5 * 10;
        this.explos = 10;
        this.explosCount++;
        vibrate();
        setTimeout(function() { vibrate(); }, 100);
      } else {
        this.score += 5;
        vibrate();
      }
    } else {
      this.streakCorrect = 0;
      this.explos = 1;
      
      if (humorScore > 0) {
        this.score += humorScore;
      }
    }
    
    // 记录答题历史
    this.answerHistory.push({
      question: q.question,
      selectedId: selectedOption ? selectedOption.id : null,
      humorScore: humorScore,
      isCorrect: isCorrect || false,
      timeSpent: timeSpent
    });
    
    // 高亮选项
    var options = document.querySelectorAll('.option');
    options.forEach(function(opt) {
      var optText = opt.textContent;
      var optData = null;
      for (var i = 0; i < q.options.length; i++) {
        if (q.options[i].text === optText) {
          optData = q.options[i];
          break;
        }
      }
      if (optData) {
        if (optData.correct) {
          opt.classList.add('show-answer');
        } else if (selectedOption && selectedOption.text === optText) {
          opt.classList.add(humorScore === 5 ? 'correct' : (humorScore === 0 ? 'wrong' : 'partial'));
        }
      }
    });
    
    // 显示得分
    var scoreGain = document.getElementById('score-gain');
    if (scoreGain) {
      var gain = humorScore === 5 ? (this.streakCorrect >= 3 ? 50 : 5) : humorScore;
      scoreGain.textContent = gain > 0 ? '+' + gain : '';
    }
    
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('explos').textContent = this.explos;
    
    // 下一题
    setTimeout(function() {
      self.nextQuestion();
    }, 1500);
  },
  
  nextQuestion: function() {
    this.currentIndex++;
    this.isAnswered = false;
    this.showQuestion();
    this.startTimer();
  },
  
  finish: function() {
    var self = this;
    clearInterval(this.timer);
    
    var totalTimeSpent = 0;
    for (var i = 0; i < this.answerHistory.length; i++) {
      totalTimeSpent += this.answerHistory[i].timeSpent || 0;
    }
    var avgTimeSpent = Math.round(totalTimeSpent / this.answerHistory.length);
    
    // 保存分数
    var highScore = Storage.getNumber('highScore') || 0;
    var totalScore = Storage.getNumber('totalScore') || 0;
    var gamesPlayed = Storage.getNumber('gamesPlayed') || 0;
    
    var newHighScore = highScore;
    if (this.score > highScore) {
      newHighScore = this.score;
      Storage.set('highScore', this.score);
    }
    
    Storage.set('totalScore', totalScore + this.score);
    
    // 传递数据到结果页
    window.gameResult = {
      score: this.score,
      correctCount: this.correctCount,
      maxStreak: this.maxStreak,
      explosCount: this.explosCount,
      avgTimeSpent: avgTimeSpent,
      newHighScore: newHighScore,
      totalScore: totalScore + this.score,
      questions: this.questions,
      answerHistory: this.answerHistory
    };
    
    router.navigate('result');
  },
  
  restart: function() {
    this.init();
  }
};

// 开始游戏
function startGame() {
  game.init();
}
