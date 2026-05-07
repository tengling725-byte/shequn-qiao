<template>
  <view class="setup-page">
    <view class="header">
      <text class="title">测验设置</text>
    </view>
    
    <view class="section">
      <text class="section-title">选择题库</text>
      <view class="bank-list">
        <view 
          class="bank-item"
          v-for="bank in banks"
          :key="bank.id"
          :class="{ selected: selectedBankId === bank.id }"
          @click="selectBank(bank.id)"
        >
          <text class="bank-name">{{ bank.title || '未命名' }}</text>
          <text class="bank-count">{{ bank.questionCount || 0 }} 题</text>
        </view>
      </view>
    </view>
    
    <view class="section" v-if="selectedBankId">
      <text class="section-title">答题模式</text>
      <view class="mode-list">
        <view 
          class="mode-item"
          :class="{ selected: quizMode === 'exam' }"
          @click="quizMode = 'exam'"
        >
          <text class="mode-name">考试模式</text>
          <text class="mode-desc">做完所有题目后统一显示答案和解析</text>
          <text class="mode-tag">适合备考</text>
        </view>
        <view 
          class="mode-item"
          :class="{ selected: quizMode === 'game' }"
          @click="quizMode = 'game'"
        >
          <text class="mode-name">游戏模式</text>
          <text class="mode-desc">每题答完立即显示对错和解析</text>
          <text class="mode-tag">适合练习</text>
        </view>
      </view>
    </view>
    
    <view class="section" v-if="selectedBankId">
      <text class="section-title">题量设置</text>
      <view class="quantity">
        <text class="quantity-label">测试题数</text>
        <slider 
          :value="questionCount" 
          :min="5" 
          :max="maxCount" 
          :step="5"
          show-value
          @change="questionCount = $event.detail.value"
          activeColor="#667eea"
        />
      </view>
    </view>
    
    <view class="start-btn" v-if="selectedBankId" @click="startQuiz">
      <text>开始测验</text>
    </view>
  </view>
</template>

<script>
import db from '@/storage/indexedDB.js';

export default {
  data() {
    return {
      banks: [],
      selectedBankId: '',
      quizMode: 'exam',
      questionCount: 10,
      maxCount: 50
    };
  },
  onLoad(options) {
    if (options.bankId) {
      this.selectedBankId = options.bankId;
    }
  },
  onShow() {
    this.loadBanks();
  },
  methods: {
    async loadBanks() {
      try {
        const banks = await db.getAll('banks');
        this.banks = banks;
      } catch (e) {
        console.error('加载失败', e);
      }
    },
    selectBank(id) {
      this.selectedBankId = id;
      const bank = this.banks.find(b => b.id === id);
      if (bank) {
        this.maxCount = Math.min(bank.questionCount || 50, 50);
        this.questionCount = Math.min(10, this.maxCount);
      }
    },
    startQuiz() {
      if (!this.selectedBankId) {
        uni.showToast({ title: '请选择题库', icon: 'none' });
        return;
      }
      
      uni.navigateTo({
        url: `/pages/quiz/play?bankId=${this.selectedBankId}&count=${this.questionCount}&mode=${this.quizMode}`
      });
    }
  }
}
</script>

<style lang="scss">
.setup-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100rem;
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

.section {
  margin-top: 20rem;
  padding: 30rem 40rem;
  background: #fff;
  
  .section-title {
    display: block;
    font-size: 32rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rem;
  }
}

.bank-list {
  .bank-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rem 30rem;
    margin-bottom: 16rem;
    background: #f8f8f8;
    border-radius: 12rem;
    border: 2rem solid transparent;
    
    &.selected {
      border-color: #667eea;
      background: #f0f7ff;
    }
    
    .bank-name {
      font-size: 30rem;
      color: #333;
    }
    
    .bank-count {
      font-size: 26rem;
      color: #999;
    }
  }
}

.mode-list {
  .mode-item {
    padding: 24rem 30rem;
    margin-bottom: 16rem;
    background: #f8f8f8;
    border-radius: 12rem;
    border: 2rem solid transparent;
    
    &.selected {
      border-color: #667eea;
      background: #f0f7ff;
    }
    
    .mode-name {
      display: block;
      font-size: 30rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 8rem;
    }
    
    .mode-desc {
      display: block;
      font-size: 26rem;
      color: #666;
      margin-bottom: 8rem;
    }
    
    .mode-tag {
      display: inline-block;
      font-size: 22rem;
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      padding: 4rem 16rem;
      border-radius: 20rem;
    }
  }
}

.quantity {
  .quantity-label {
    display: block;
    font-size: 28rem;
    color: #666;
    margin-bottom: 20rem;
  }
}

.start-btn {
  position: fixed;
  bottom: 50rem;
  left: 40rem;
  right: 40rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  text-align: center;
  padding: 30rem;
  border-radius: 50rem;
  font-size: 34rem;
}
</style>