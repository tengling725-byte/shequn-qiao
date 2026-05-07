<template>
  <view class="wrong-page">
    <view class="header">
      <text class="title">错题本</text>
    </view>
    
    <view class="empty" v-if="wrongQuestions.length === 0">
      <text class="empty-icon">🎉</text>
      <text class="empty-text">太棒了！暂无错题</text>
    </view>
    
    <view class="list" v-else>
      <view class="wrong-item" v-for="q in wrongQuestions" :key="q.id">
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
      wrongQuestions: []
    };
  },
  onShow() {
    this.loadWrongQuestions();
  },
  methods: {
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
    }
  }
}
</script>

<style lang="scss">
.wrong-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  padding: 30rem 40rem;
  background: #fff;
  
  .title {
    font-size: 40rem;
    font-weight: bold;
    color: #333;
  }
}

.empty {
  padding: 200rem 0;
  text-align: center;
  
  .empty-icon {
    display: block;
    font-size: 120rem;
    margin-bottom: 30rem;
  }
  
  .empty-text {
    font-size: 32rem;
    color: #52c41a;
  }
}

.list {
  padding: 30rem;
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
</style>