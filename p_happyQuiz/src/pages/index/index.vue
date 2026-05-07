<template>
  <view class="index-page">
    <view class="hero">
      <text class="title">小测</text>
      <text class="subtitle">个人题库管理 + 智能组卷</text>
    </view>
    
    <view class="actions">
      <view class="action-card" @click="goToBank">
        <text class="action-icon">📚</text>
        <text class="action-title">题库管理</text>
        <text class="action-desc">导入、编辑、删除题库</text>
      </view>
      
      <view class="action-card primary" @click="goToQuiz">
        <text class="action-icon">✍️</text>
        <text class="action-title">开始测验</text>
        <text class="action-desc">考试模式 / 游戏模式</text>
      </view>
      
      <view class="action-card" @click="goToHistory">
        <text class="action-icon">📊</text>
        <text class="action-title">历史记录</text>
        <text class="action-desc">查看成绩和错题</text>
      </view>
      
      <view class="action-card" @click="goToUser">
        <text class="action-icon">👤</text>
        <text class="action-title">我的</text>
        <text class="action-desc">设置和云端同步</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  onLoad() {
    console.log('首页加载')
  },
  methods: {
    goToBank() {
      uni.navigateTo({ url: '/pages/bank/list' })
    },
    goToQuiz() {
      uni.navigateTo({ url: '/pages/quiz/setup' })
    },
    goToHistory() {
      uni.navigateTo({ url: '/pages/review/history' })
    },
    goToUser() {
      uni.navigateTo({ url: '/pages/user/index' })
    }
  }
}
</script>

<style lang="scss">
.index-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.hero {
  padding: 80rem 40rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  text-align: center;
  
  .title {
    display: block;
    font-size: 64rem;
    font-weight: bold;
    color: #fff;
  }
  
  .subtitle {
    display: block;
    font-size: 28rem;
    color: rgba(255,255,255,0.8);
    margin-top: 16rem;
  }
}

.actions {
  padding: 40rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.action-card {
  width: calc(50% - 20rem);
  background: #fff;
  padding: 40rem 30rem;
  margin-bottom: 30rem;
  border-radius: 24rem;
  box-shadow: 0 4rem 16rem rgba(0,0,0,0.08);
  
  .action-icon {
    display: block;
    font-size: 48rem;
    margin-bottom: 16rem;
  }
  
  .action-title {
    display: block;
    font-size: 32rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rem;
  }
  
  .action-desc {
    display: block;
    font-size: 24rem;
    color: #999;
  }
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    .action-title, .action-desc {
      color: #fff;
    }
    
    .action-desc {
      color: rgba(255,255,255,0.7);
    }
  }
}
</style>