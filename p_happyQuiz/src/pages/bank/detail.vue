<template>
  <view class="detail-page">
    <view class="header">
      <text class="title">{{ bank.title || '题库详情' }}</text>
      <text class="desc">{{ bank.description }}</text>
    </view>
    
    <view class="info">
      <text class="info-item">{{ bank.questionCount || 0 }} 题</text>
      <text class="info-item">{{ formatDate(bank.createdAt) }}</text>
    </view>
    
    <view class="questions">
      <view class="q-item" v-for="(q, index) in questions" :key="q.id">
        <text class="q-index">{{ index + 1 }}.</text>
        <text class="q-content">{{ q.content }}</text>
        <view class="q-answer">
          <text>答案：{{ q.options[q.correctIndex]?.text }}</text>
        </view>
      </view>
    </view>
    
    <view class="start-btn" @click="startQuiz">
      <text>开始测验</text>
    </view>
  </view>
</template>

<script>
import db from '@/storage/indexedDB.js';

export default {
  data() {
    return {
      bank: {},
      questions: []
    };
  },
  onLoad(options) {
    this.loadBank(options.id);
  },
  methods: {
    async loadBank(id) {
      try {
        this.bank = await db.get('banks', id);
        const allQuestions = await db.getAll('questions');
        this.questions = allQuestions.filter(q => q.bankId === id);
      } catch (e) {
        console.error('加载失败', e);
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    },
    startQuiz() {
      uni.navigateTo({
        url: '/pages/quiz/setup'
      });
    }
  }
}
</script>

<style lang="scss">
.detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rem;
}

.header {
  padding: 40rem;
  background: #fff;
  
  .title {
    display: block;
    font-size: 40rem;
    font-weight: bold;
    color: #333;
  }
  
  .desc {
    display: block;
    font-size: 28rem;
    color: #666;
    margin-top: 10rem;
  }
}

.info {
  display: flex;
  gap: 30rem;
  padding: 20rem 40rem;
  background: #fff;
  
  .info-item {
    font-size: 26rem;
    color: #667eea;
  }
}

.questions {
  padding: 30rem;
  
  .q-item {
    background: #fff;
    padding: 24rem;
    margin-bottom: 20rem;
    border-radius: 12rem;
    
    .q-index {
      font-weight: bold;
      color: #667eea;
      margin-right: 10rem;
    }
    
    .q-content {
      font-size: 28rem;
      color: #333;
    }
    
    .q-answer {
      font-size: 26rem;
      color: #52c41a;
      margin-top: 10rem;
    }
  }
}

.start-btn {
  position: fixed;
  bottom: 50rem;
  left: 40rem;
  right: 40rem;
  background: #667eea;
  color: #fff;
  text-align: center;
  padding: 30rem;
  border-radius: 50rem;
  font-size: 32rem;
}
</style>