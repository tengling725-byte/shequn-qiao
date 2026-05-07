<template>
  <view class="result-page">
    <view class="result-card">
      <view class="score-circle">
        <text class="score-value">{{ score }}</text>
        <text class="score-label">{{ quizMode === 'exam' ? '分' : '分' }}</text>
      </view>
      
      <view class="stats">
        <view class="stat-item">
          <text class="stat-value">{{ correctCount }}</text>
          <text class="stat-label">正确/题数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ correctRate }}%</text>
          <text class="stat-label">正确率</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ formatDuration(duration) }}</text>
          <text class="stat-label">用时</text>
        </view>
      </view>
    </view>
    
    <view class="mode-tip">
      <text v-if="quizMode === 'exam'">考试模式：所有题目已提交，可查看解析</text>
      <text v-else>游戏模式：答对 {{ streak }} 题连击</text>
    </view>
    
    <view class="actions">
      <view class="action-btn" @click="goToHistory">
        <text>历史记录</text>
      </view>
      <view class="action-btn primary" @click="goToQuiz">
        <text>再测一次</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      score: 0,
      correctCount: 0,
      total: 0,
      duration: 0,
      quizMode: 'exam',
      streak: 0
    };
  },
  computed: {
    correctRate() {
      return this.total > 0 ? Math.round((this.correctCount / this.total) * 100) : 0;
    }
  },
  onLoad(options) {
    this.score = parseInt(options.score || 0);
    this.correctCount = parseInt(options.correct || 0);
    this.total = parseInt(options.total || 0);
    this.duration = parseInt(options.duration || 0);
    this.quizMode = options.mode || 'exam';
  },
  methods: {
    formatDuration(seconds) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    },
    goToHistory() {
      uni.navigateTo({ url: '/pages/review/history' });
    },
    goToQuiz() {
      uni.navigateBack();
    }
  }
}
</script>

<style lang="scss">
.result-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rem 40rem;
}

.result-card {
  background: #fff;
  border-radius: 24rem;
  padding: 60rem 40rem;
  text-align: center;
}

.score-circle {
  width: 200rem;
  height: 200rem;
  margin: 0 auto 40rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  .score-value {
    font-size: 72rem;
    font-weight: bold;
    color: #fff;
  }
  
  .score-label {
    font-size: 28rem;
    color: rgba(255,255,255,0.8);
  }
}

.stats {
  display: flex;
  justify-content: space-around;
  padding-top: 40rem;
  border-top: 1rem solid #eee;
  
  .stat-item {
    text-align: center;
  }
  
  .stat-value {
    display: block;
    font-size: 40rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rem;
  }
  
  .stat-label {
    display: block;
    font-size: 24rem;
    color: #999;
  }
}

.mode-tip {
  text-align: center;
  margin-top: 30rem;
  font-size: 26rem;
  color: rgba(255,255,255,0.8);
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 60rem;
  
  .action-btn {
    width: calc(50% - 20rem);
    background: #fff;
    padding: 30rem;
    border-radius: 50rem;
    text-align: center;
    font-size: 32rem;
    color: #667eea;
    
    &.primary {
      background: #fff;
      color: #667eea;
    }
  }
}
</style>