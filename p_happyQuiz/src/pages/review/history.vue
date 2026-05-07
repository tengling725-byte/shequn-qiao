<template>
  <view class="history-page">
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        <text>历史记录</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'wrong' }"
        @click="activeTab = 'wrong'"
      >
        <text>错题本</text>
      </view>
    </view>
    
    <view class="list" v-if="activeTab === 'history'">
      <view class="empty" v-if="sessions.length === 0">
        <text class="empty-text">暂无记录</text>
      </view>
      <view 
        class="session-item"
        v-for="session in sessions"
        :key="session.id"
      >
        <view class="session-info">
          <text class="session-date">{{ formatDate(session.createdAt) }}</text>
          <text class="session-mode">{{ session.quizMode === 'exam' ? '考试' : '游戏' }}</text>
        </view>
        <view class="session-score">
          <text class="score-value">{{ session.score }}</text>
          <text class="score-label">分</text>
        </view>
      </view>
    </view>
    
    <view class="list" v-if="activeTab === 'wrong'">
      <view class="empty" v-if="wrongQuestions.length === 0">
        <text class="empty-text">暂无错题</text>
      </view>
      <view class="wrong-item" v-for="q in wrongQuestions" :key="q.id" v-else>
        <text class="q-content">{{ q.content }}</text>
        <text class="q-answer">正确答案：{{ q.options[q.correctIndex]?.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import db from '@/storage/indexedDB.js';

export default {
  data() {
    return {
      activeTab: 'history',
      sessions: [],
      wrongQuestions: []
    };
  },
  onShow() {
    this.loadSessions();
    this.loadWrongQuestions();
  },
  methods: {
    async loadSessions() {
      try {
        const sessions = await db.getAll('sessions');
        this.sessions = sessions.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }).slice(0, 20);
      } catch (e) {
        console.error('加载失败', e);
      }
    },
    async loadWrongQuestions() {
      try {
        const sessions = await db.getAll('sessions');
        const wrongIds = [...new Set(sessions.flatMap(s => s.wrongQuestionIds || []))];
        if (wrongIds.length === 0) {
          this.wrongQuestions = [];
          return;
        }
        const allQuestions = await db.getAll('questions');
        this.wrongQuestions = allQuestions.filter(q => wrongIds.includes(q.id));
      } catch (e) {
        console.error('加载错题失败', e);
      }
    },
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
  }
}
</script>

<style lang="scss">
.history-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.tabs {
  display: flex;
  background: #fff;
  padding: 0 40rem;
  
  .tab-item {
    flex: 1;
    padding: 30rem 0;
    text-align: center;
    font-size: 30rem;
    color: #999;
    border-bottom: 4rem solid transparent;
    
    &.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }
  }
}

.list {
  padding: 20rem 30rem;
}

.empty {
  padding: 100rem 0;
  text-align: center;
  
  .empty-text {
    font-size: 28rem;
    color: #999;
  }
}

.wrong-item {
  background: #fff;
  padding: 30rem;
  margin-bottom: 20rem;
  border-radius: 16rem;

  .q-content {
    display: block;
    font-size: 28rem;
    color: #333;
    margin-bottom: 16rem;
  }

  .q-answer {
    display: block;
    font-size: 26rem;
    color: #52c41a;
  }
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 30rem;
  margin-bottom: 20rem;
  border-radius: 16rem;
  
  .session-info {
    .session-date {
      display: block;
      font-size: 28rem;
      color: #333;
      margin-bottom: 8rem;
    }
    
    .session-mode {
      font-size: 24rem;
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      padding: 4rem 16rem;
      border-radius: 20rem;
    }
  }
  
  .session-score {
    text-align: right;
    
    .score-value {
      font-size: 48rem;
      font-weight: bold;
      color: #667eea;
    }
    
    .score-label {
      font-size: 24rem;
      color: #999;
    }
  }
}
</style>