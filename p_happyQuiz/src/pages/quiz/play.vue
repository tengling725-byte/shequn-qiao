<template>
  <view class="play-page">
    <view class="header">
      <view class="progress">
        <text class="current">{{ currentIndex + 1 }}</text>
        <text class="separator">/</text>
        <text class="total">{{ questions.length }}</text>
      </view>
      <view class="timer" v-if="showTimer">
        <text>{{ formatTime(timeSpent) }}</text>
      </view>
      <view class="score" v-if="quizMode === 'game'">
        <text>{{ totalScore }} �?/text>
      </view>
    </view>
    
    <view class="progress-bar">
      <view class="progress-inner" :style="{ width: progressPercent + '%' }"></view>
    </view>
    
    <view class="question-area" v-if="currentQuestion">
      <view class="question-card">
        <text class="question-content">{{ currentQuestion.content }}</text>
      </view>
      
      <view class="options">
        <view 
          class="option-item"
          v-for="(opt, index) in currentQuestion.displayOptions"
          :key="opt.id"
          :class="{ 
            selected: selectedOption === index,
            correct: showAnswer && index === currentQuestion.displayCorrectIndex,
            wrong: showAnswer && selectedOption === index && selectedOption !== currentQuestion.displayCorrectIndex
          }"
          @click="selectOption(index)"
        >
          <text class="option-index">{{ String.fromCharCode(65 + index) }}</text>
          <text class="option-text">{{ opt.text }}</text>
        </view>
      </view>
    </view>
    
    <view class="feedback" v-if="showAnswer && quizMode === 'game'">
      <view class="feedback-header" :class="{ correct: lastAnswerCorrect, wrong: !lastAnswerCorrect }">
        <text>{{ lastAnswerCorrect ? '回答正确' : '回答错误' }}</text>
      </view>
      <view class="feedback-body" v-if="currentQuestion.explanation">
        <text class="feedback-label">解析�?/text>
        <text class="feedback-text">{{ currentQuestion.explanation }}</text>
      </view>
    </view>
    
    <view class="footer" v-if="quizMode === 'exam'">
      <view class="nav-btns">
        <button class="nav-btn" @click="prev" :disabled="currentIndex === 0">上一�?/button>
        <button class="mark-btn" @click="toggleMark" :class="{ marked: currentMarked }">标疑</button>
        <button class="nav-btn" @click="next" v-if="!isLast">下一�?/button>
        <button class="submit-btn" @click="submit" v-else>提交</button>
      </view>
    </view>
    
    <view class="footer game" v-if="quizMode === 'game' && !showAnswer">
      <button class="next-btn" @click="nextQuestion" :disabled="selectedOption === null">
        {{ isLast ? '查看结果' : '下一�? }}
      </button>
    </view>
  </view>
</template>

<script>
import db from '@/storage/indexedDB.js';

export default {
  data() {
    return {
      bankId: '',
      questionCount: 10,
      quizMode: 'exam',
      questions: [],
      currentIndex: 0,
      selectedOption: null,
      answers: [],
      marked: [],
      showAnswer: false,
      startTime: null,
      timeSpent: 0,
      timer: null,
      totalScore: 0,
      streak: 0,
      lastAnswerCorrect: false
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || null;
    },
    isLast() {
      return this.currentIndex === this.questions.length - 1;
    },
    progressPercent() {
      return ((this.currentIndex + 1) / this.questions.length) * 100;
    },
    showTimer() {
      return this.quizMode === 'exam';
    },
    currentMarked() {
      return this.marked.includes(this.currentIndex);
    }
  },
  onLoad(options) {
    this.bankId = options.bankId || '';
    this.questionCount = parseInt(options.count || 10);
    this.quizMode = options.mode || 'exam';
  },
  async onReady() {
    await this.loadQuestions();
    this.initAnswers();
    if (this.quizMode === 'exam') {
      this.startTimer();
    }
  },
  onUnload() {
    this.stopTimer();
  },
  methods: {
    async loadQuestions() {
      try {
        let questions = await db.getAll('questions');
        questions = questions.filter(q => q.bankId === this.bankId);
        
        questions = this.shuffle(questions);
        this.questions = questions.slice(0, this.questionCount).map(q => {
          const shuffled = this.shuffleOptions(q.options, q.correctIndex);
          return {
            ...q,
            displayOptions: shuffled.options,
            displayCorrectIndex: shuffled.correctIndex,
            userAnswer: null
          };
        });
      } catch (e) {
        console.error('加载题目失败', e);
      }
    },
    initAnswers() {
      this.answers = this.questions.map((_, i) => ({
        questionId: this.questions[i].id,
        userAnswer: null,
        isCorrect: null,
        timeSpent: 0
      }));
      this.startTime = Date.now();
    },
    selectOption(index) {
      if (this.showAnswer) return;
      
      this.selectedOption = index;
      this.answers[this.currentIndex].userAnswer = index;
      this.answers[this.currentIndex].timeSpent = (Date.now() - this.startTime) / 1000;
      
      if (this.quizMode === 'game') {
        this.judgeAnswer();
      }
    },
    judgeAnswer() {
      const correct = this.selectedOption === this.currentQuestion.displayCorrectIndex;
      this.answers[this.currentIndex].isCorrect = correct;
      this.lastAnswerCorrect = correct;
      this.showAnswer = true;
      
      if (correct) {
        this.streak++;
        const baseScore = 10;
        const streakBonus = 5;
        let questionScore = baseScore;
        if (this.streak >= 3) {
          questionScore += streakBonus * Math.floor(this.streak / 3);
        }
        this.totalScore += questionScore;
      } else {
        this.streak = 0;
      }
    },
    nextQuestion() {
      if (this.isLast) {
        this.submit();
        return;
      }
      
      this.currentIndex++;
      this.selectedOption = null;
      this.showAnswer = false;
      this.startTime = Date.now();
    },
    prev() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.selectedOption = this.answers[this.currentIndex].userAnswer;
        this.showAnswer = this.quizMode === 'game';
      }
    },
    toggleMark() {
      const idx = this.marked.indexOf(this.currentIndex);
      if (idx > -1) {
        this.marked.splice(idx, 1);
      } else {
        this.marked.push(this.currentIndex);
      }
    },
    submit() {
      this.stopTimer();
      this.calculateFinalScore();
      this.saveSession();
      
      uni.navigateTo({
        url: `/pages/quiz/result?score=${this.totalScore}&correct=${this.correctCount}&total=${this.questions.length}&mode=${this.quizMode}&duration=${this.timeSpent}`
      });
    },
    calculateFinalScore() {
      if (this.quizMode === 'exam') {
        this.correctCount = 0;
        for (let i = 0; i < this.answers.length; i++) {
          const isCorrect = this.answers[i].userAnswer === this.questions[i].displayCorrectIndex;
          this.answers[i].isCorrect = isCorrect;
          if (isCorrect) this.correctCount++;
        }
        this.totalScore = Math.round((this.correctCount / this.questions.length) * 100);
      }
    },
    async saveSession() {
      const wrongQuestionIds = this.answers
        .filter((a, i) => !a.isCorrect)
        .map((a, i) => this.questions[i].id);
      
      const session = {
        id: db.generateId(),
        bankId: this.bankId,
        questionCount: this.questions.length,
        correctCount: this.correctCount || this.answers.filter(a => a.isCorrect).length,
        score: this.totalScore,
        duration: this.timeSpent,
        quizMode: this.quizMode,
        feedbackMode: this.quizMode === 'game' ? 'instant' : 'after',
        answers: this.answers,
        wrongQuestionIds,
        createdAt: new Date().toISOString()
      };
      
      try {
        await db.put('sessions', session);
      } catch (e) {
        console.error('保存记录失败', e);
      }
    },
    startTimer() {
      this.timer = setInterval(() => {
        this.timeSpent++;
      }, 1000);
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    formatTime(seconds) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    },
    shuffle(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    shuffleOptions(options, correctIndex) {
      const indexed = options.map((opt, i) => ({ ...opt, originalIndex: i }));
      const shuffled = this.shuffle(indexed);
      const newCorrectIndex = shuffled.findIndex(s => s.originalIndex === correctIndex);
      
      return {
        options: shuffled.map(({ originalIndex, ...opt }) => opt),
        correctIndex: newCorrectIndex
      };
    }
  }
}
</script>

<style lang="scss">
.play-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rem 40rem;
  background: #fff;
  
  .progress {
    font-size: 36rem;
    font-weight: bold;
    color: #333;
    
    .current { color: #667eea; }
    .separator { color: #999; margin: 0 8rem; }
    .total { color: #666; }
  }
  
  .timer, .score {
    font-size: 32rem;
    color: #667eea;
    font-weight: 600;
  }
}

.progress-bar {
  height: 8rem;
  background: #eee;
  
  .progress-inner {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s;
  }
}

.question-area {
  flex: 1;
  padding: 30rem;
}

.question-card {
  background: #fff;
  padding: 40rem 30rem;
  border-radius: 16rem;
  margin-bottom: 30rem;
  
  .question-content {
    font-size: 32rem;
    color: #333;
    line-height: 1.6;
  }
}

.options {
  .option-item {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 30rem;
    margin-bottom: 20rem;
    border-radius: 16rem;
    border: 2rem solid transparent;
    
    &.selected {
      border-color: #667eea;
      background: #f0f7ff;
    }
    
    &.correct {
      border-color: #52c41a;
      background: #f6ffed;
    }
    
    &.wrong {
      border-color: #ff4d4f;
      background: #fff2f0;
    }
    
    .option-index {
      width: 56rem;
      height: 56rem;
      line-height: 56rem;
      text-align: center;
      background: #f5f5f5;
      border-radius: 50%;
      font-size: 28rem;
      font-weight: 600;
      color: #666;
      margin-right: 20rem;
    }
    
    .option-text {
      flex: 1;
      font-size: 30rem;
      color: #333;
    }
  }
}

.feedback {
  margin-top: 30rem;
  background: #fff;
  border-radius: 16rem;
  overflow: hidden;
  
  .feedback-header {
    padding: 20rem 30rem;
    text-align: center;
    font-size: 32rem;
    font-weight: 600;
    
    &.correct {
      background: #52c41a;
      color: #fff;
    }
    
    &.wrong {
      background: #ff4d4f;
      color: #fff;
    }
  }
  
  .feedback-body {
    padding: 30rem;
    
    .feedback-label {
      font-size: 28rem;
      font-weight: 600;
      color: #667eea;
    }
    
    .feedback-text {
      font-size: 28rem;
      color: #666;
      line-height: 1.6;
    }
  }
}

.footer {
  padding: 30rem;
  background: #fff;
  
  &.game {
    padding: 30rem 40rem;
  }
}

.nav-btns {
  display: flex;
  justify-content: space-between;
  
  .nav-btn, .mark-btn, .submit-btn {
    flex: 1;
    margin: 0 10rem;
    padding: 24rem;
    font-size: 28rem;
    text-align: center;
    border-radius: 12rem;
    background: #f5f5f5;
    color: #666;
    
    &[disabled] {
      opacity: 0.5;
    }
  }
  
  .mark-btn {
    &.marked {
      background: #faad14;
      color: #fff;
    }
  }
  
  .submit-btn {
    background: #667eea;
    color: #fff;
  }
}

.next-btn {
  width: 100%;
  padding: 24rem;
  font-size: 32rem;
  text-align: center;
  border-radius: 50rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  
  &[disabled] {
    opacity: 0.5;
  }
}
</style>